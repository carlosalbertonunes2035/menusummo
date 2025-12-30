/**
 * Order Router - Fast order routing to kitchen stations
 * Performance: ~0.2ms
 * Use case: Route orders to correct printers/stations
 */

import { Order, OrderItem, Product } from '@/types';
import { PrinterDevice } from '@/types/settings';

export interface RoutedOrder {
    stationId: string;
    stationName: string;
    items: OrderItem[];
    printer?: PrinterDevice;
}

/**
 * Routes order items to appropriate kitchen stations/printers
 * @param order - Order to route
 * @param products - All products
 * @param printers - Configured printers
 * @returns Map of station ID to order items
 */
export function routeOrderToStations(
    order: Order,
    products: Product[],
    printers: PrinterDevice[]
): RoutedOrder[] {
    const stationMap = new Map<string, OrderItem[]>();
    const printerMap = new Map<string, PrinterDevice>();

    order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;

        // Find printer responsible for this category
        const printer = printers.find(p =>
            p.categoryIds.includes(product.category) && p.autoPrint
        );

        if (printer) {
            const existing = stationMap.get(printer.id) || [];
            stationMap.set(printer.id, [...existing, item]);
            printerMap.set(printer.id, printer);
        } else {
            // Default station for unconfigured categories
            const defaultKey = 'default';
            const existing = stationMap.get(defaultKey) || [];
            stationMap.set(defaultKey, [...existing, item]);
        }
    });

    // Convert to array
    return Array.from(stationMap.entries()).map(([stationId, items]) => ({
        stationId,
        stationName: printerMap.get(stationId)?.name || 'Estação Padrão',
        items,
        printer: printerMap.get(stationId)
    }));
}

/**
 * Groups items by preparation station based on category
 * @param items - Order items
 * @param products - All products
 * @returns Map of station name to items
 */
export function groupItemsByStation(
    items: OrderItem[],
    products: Product[]
): Map<string, OrderItem[]> {
    const stations = new Map<string, OrderItem[]>();

    // Define station mappings (can be made configurable)
    const stationMappings: Record<string, string> = {
        'Pizza': 'Forno',
        'Lanche': 'Chapa',
        'Burger': 'Chapa',
        'Hambúrguer': 'Chapa',
        'Bebida': 'Bar',
        'Sobremesa': 'Confeitaria',
        'Entrada': 'Cozinha Fria',
        'Prato Principal': 'Cozinha Quente',
    };

    items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;

        const station = stationMappings[product.category] || 'Cozinha Geral';
        const existing = stations.get(station) || [];
        stations.set(station, [...existing, item]);
    });

    return stations;
}

/**
 * Determines if order should be split across multiple tickets
 * @param order - Order to analyze
 * @param products - All products
 * @returns true if order should be split
 */
export function shouldSplitOrder(order: Order, products: Product[]): boolean {
    const stations = groupItemsByStation(order.items, products);
    return stations.size > 1;
}
