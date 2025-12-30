import { db } from '../lib/firebase/client';
import { collection, addDoc, serverTimestamp } from '@firebase/firestore';
import { StoreSettings, PrinterDevice } from '../types/settings';
import { Order, OrderItem } from '../types/order';
import { Product } from '../types/product';
import { logger } from '../lib/logger';

export interface PrintJob {
    tenantId: string;
    content: string;
    type: 'ORDER' | 'KITCHEN' | 'TEST';
    printerName?: string;
    status: 'PENDING' | 'PRINTED' | 'FAILED';
    createdAt: any;
    options?: any;
}

const AGENT_LOCAL_URL = 'http://localhost:3030/print';

export const printingService = {
    /**
     * Main print entry point for Orders.
     * Logic: 
     * 1. Iterates over all configured printers.
     * 2. Filters items that belong to each printer (based on categories).
     * 3. Sends separate print jobs.
     */
    async printOrder(order: Order, products: Product[], settings: StoreSettings, tenantId: string, type: 'ORDER' | 'KITCHEN') {
        logger.info(`[PrintingService] Routing print for order ${order.id}...`);

        const devices = settings.printer?.devices || [];
        if (devices.length === 0) {
            logger.warn('[PrintingService] No printers configured in settings.');
            return { success: false, error: 'NO_PRINTERS' };
        }

        const tasks = devices.map(async (device) => {
            // 1. Filter items for this printer
            const itemsForDevice = order.items.filter(item => {
                // If printer has no categories, it's a GENERAL printer (prints everything)
                if (!device.categoryIds || device.categoryIds.length === 0) return true;

                // Resolve product to get its category
                const product = products.find(p => p.id === item.productId);
                if (!product) return false;

                return device.categoryIds.includes(product.category);
            });

            if (itemsForDevice.length === 0) return { deviceId: device.id, status: 'SKIPPED' };

            // 2. Format content for this specific printer
            const content = this.formatOrderText(order, itemsForDevice, device, type);

            // 3. Print
            return this.sendToPrinter(content, type, device, tenantId);
        });

        const results = await Promise.all(tasks);
        return { success: true, results };
    },

    async sendToPrinter(content: string, type: string, device: PrinterDevice, tenantId: string) {
        // 1. Try Local Agent 
        try {
            const response = await fetch(AGENT_LOCAL_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    type,
                    options: {
                        paperWidth: device.paperWidth,
                        fontSize: device.fontSize,
                        printerName: device.systemName,
                        copies: device.printCopies
                    }
                }),
                signal: AbortSignal.timeout(2000)
            });

            if (response.ok) {
                return { deviceId: device.id, method: 'LOCAL', success: true };
            }
        } catch (err) {
            logger.warn(`[PrintingService] Local agent unreachable for ${device.name}.`);
        }

        // 2. Fallback to Cloud Sync
        try {
            const printJobsCol = collection(db, 'print_jobs');
            await addDoc(printJobsCol, {
                tenantId,
                content,
                type,
                printerName: device.systemName,
                status: 'PENDING',
                createdAt: serverTimestamp(),
                options: {
                    paperWidth: device.paperWidth,
                    fontSize: device.fontSize,
                    copies: device.printCopies
                }
            });
            return { deviceId: device.id, method: 'CLOUD', success: true };
        } catch (err) {
            return { deviceId: device.id, success: false, error: err };
        }
    },

    formatOrderText(order: Order, items: OrderItem[], device: PrinterDevice, type: 'ORDER' | 'KITCHEN') {
        const isKitchen = type === 'KITCHEN';
        let text = '';

        const line = device.paperWidth === '58mm' ? '-'.repeat(30) : '-'.repeat(42);
        const center = (str: string) => {
            const width = device.paperWidth === '58mm' ? 30 : 42;
            const pad = Math.max(0, Math.floor((width - str.length) / 2));
            return ' '.repeat(pad) + str;
        };

        text += center(isKitchen ? '--- COZINHA ---' : '--- COMPROVANTE ---') + '\n';
        text += center(`Pedido #${order.id.slice(-4)}`) + '\n';
        text += `Data: ${new Date().toLocaleString()}\n`;
        text += `Cliente: ${order.customerName}\n`;
        if (!isKitchen && order.type === 'DELIVERY') {
            text += `Entrega: ${order.deliveryAddress}\n`;
        }
        text += line + '\n';

        // Items
        items.forEach(item => {
            const qty = item.quantity.toString().padStart(2, '0');
            const name = item.productName.substring(0, 25);
            text += `${qty}x ${name}\n`;
            if (item.notes) text += `   Note: ${item.notes}\n`;
            if (item.selectedOptions) {
                item.selectedOptions.forEach(opt => {
                    text += `   + ${opt.optionName}\n`;
                });
            }
            if (!isKitchen) {
                const price = (item.price * item.quantity).toFixed(2);
                text += `   R$ ${price}\n`;
            }
        });

        text += line + '\n';
        if (!isKitchen) {
            text += `TOTAL: R$ ${order.total.toFixed(2)}\n`;
            if (order.payments && order.payments.length > 0) {
                text += `PAGTO: ${order.payments.map(p => p.method).join(', ')}\n`;
            }
        }

        text += center('Obrigado!') + '\n\n\n\n\n'; // Feed for cutting
        return text;
    },

    async checkAgentStatus(): Promise<'ONLINE' | 'OFFLINE'> {
        try {
            const response = await fetch('http://localhost:3030/status', { signal: AbortSignal.timeout(1000) }).catch(() => null);
            return response && response.ok ? 'ONLINE' : 'OFFLINE';
        } catch {
            return 'OFFLINE';
        }
    },

    getAgentDownloadUrl(): string {
        return 'https://storage.googleapis.com/summo-public/SUMMO-Printer-Agent.exe';
    }
};

