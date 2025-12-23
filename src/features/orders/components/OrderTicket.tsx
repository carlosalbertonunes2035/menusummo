import React, { useEffect } from 'react';
import { Order, OrderType, StoreSettings } from '../../../types';
import { Printer, Utensils, UserCheck, Package, X } from 'lucide-react';

interface OrderTicketProps {
    order: Order;
    settings: StoreSettings;
    mode: 'CUSTOMER' | 'KITCHEN';
    onClose?: () => void;
}

const OrderTicket: React.FC<OrderTicketProps> = ({ order, settings, mode, onClose }) => {

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handlePrint = () => {
        window.print();
    };

    const isKitchen = mode === 'KITCHEN';
    const primaryPrinter = settings.printer.devices?.[0];
    const paperWidthClass = primaryPrinter?.paperWidth === '58mm' ? 'max-w-[58mm]' : 'max-w-[80mm]';
    const fontSizeClass = primaryPrinter?.fontSize === 'LARGE' ? 'text-sm' : 'text-xs';

    const getOrderTypeLabel = () => {
        switch (order.type) {
            case OrderType.DELIVERY: return '🛵 ENTREGA';
            case OrderType.TAKEOUT: return '🥡 RETIRADA';
            case OrderType.DINE_IN: return '🍽️ MESA';
            default: return '';
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-summo-dark/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in p-4"
        >
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col w-full max-w-[450px] overflow-hidden">

                {/* UI Header (Not Printed) */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center print:hidden bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        {isKitchen ? <Utensils size={20} className="text-orange-500" /> : <UserCheck size={20} className="text-blue-500" />}
                        {isKitchen ? 'Via da Cozinha' : 'Via do Cliente'}
                    </h3>
                    <div className="flex gap-2 items-center">
                        <button onClick={handlePrint} className="px-4 py-2 text-sm font-bold bg-summo-dark text-white rounded-lg hover:bg-summo-primary transition shadow-lg flex items-center gap-2">
                            <Printer size={16} /> Imprimir
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition" title="Fechar">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Preview Area */}
                <div className="flex-1 overflow-y-auto bg-gray-200 p-8 flex justify-center print:p-0 print:w-auto print:block print:overflow-visible">

                    {/* THE TICKET ITSELF */}
                    <div id="printable-area" className={`bg-white shadow-xl print:shadow-none p-2 mx-auto ${paperWidthClass} min-h-[100px] print:absolute print:top-0 print:left-0 print:m-0`}>

                        <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #printable-area, #printable-area * { visibility: visible; }
                        @page { margin: 0; size: auto; }
                    }
                    .ticket-font { font-family: 'Courier New', Courier, monospace; }
                    .kitchen-font { font-family: sans-serif; }
                `}</style>

                        <div className={`${isKitchen ? 'kitchen-font' : 'ticket-font'} text-black leading-tight`}>

                            {/* 1. HEADER */}
                            {!isKitchen && (
                                <div className="text-center mb-3 pb-2 border-b border-black border-dashed">
                                    <h1 className="font-bold text-lg uppercase mb-1">{settings.name}</h1>
                                    <p className="text-[10px]">{settings.address}</p>
                                    {settings.cnpj && <p className="text-[10px]">CNPJ: {settings.cnpj}</p>}
                                    <p className="text-[10px] mt-1">Tel: {settings.phone}</p>
                                </div>
                            )}

                            {/* 2. ORDER META */}
                            <div className={`mb-2 ${isKitchen ? 'border-b-4 border-black pb-2' : 'border-b border-dashed border-black pb-2'}`}>
                                <div className="flex justify-between items-end">
                                    <span className={`${isKitchen ? 'text-3xl font-black' : 'font-bold text-sm'}`}>
                                        #{order.id.slice(-4)}
                                    </span>
                                    <span className="text-[10px] font-bold">
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <p className={`mt-1 uppercase font-bold ${isKitchen ? 'text-xl' : 'text-xs'}`}>
                                    {getOrderTypeLabel()}
                                </p>

                                <p className={`uppercase mt-1 font-bold truncate ${isKitchen ? 'text-lg' : 'text-xs'}`}>
                                    {order.customerName}
                                </p>

                                {/* Kitchen Address Logic */}
                                {order.deliveryAddress && (
                                    <p className={`mt-1 ${isKitchen ? 'text-sm font-bold' : 'text-[10px]'}`}>
                                        📍 {order.deliveryAddress}
                                    </p>
                                )}
                            </div>

                            {/* 3. ITEMS */}
                            <div className="space-y-2 mb-4">
                                {!isKitchen && (
                                    <div className="flex font-bold text-[10px] border-b border-black pb-1 mb-1">
                                        <span className="w-6">QTD</span>
                                        <span className="flex-1">ITEM</span>
                                        <span className="text-right">R$</span>
                                    </div>
                                )}

                                {order.items.map((item, idx) => (
                                    <div key={idx} className={`${isKitchen ? 'mb-3 pb-2 border-b border-gray-300' : ''}`}>
                                        <div className="flex items-start">
                                            <span className={`font-bold mr-2 ${isKitchen ? 'text-xl' : 'w-6 text-xs'}`}>
                                                {item.quantity}x
                                            </span>
                                            <span className={`flex-1 font-bold leading-tight ${isKitchen ? 'text-xl' : 'text-xs'}`}>
                                                {item.productName}
                                                {item.isTakeout && (
                                                    <span className="ml-2 inline-block bg-black text-white px-1 text-[10px] align-middle rounded">VIAGEM</span>
                                                )}
                                            </span>
                                            {/* Price Logic for Customer/Kitchen */}
                                            {!isKitchen && (
                                                <span className="text-right text-xs">
                                                    {(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        {item.notes && (
                                            <div className={`mt-1 font-bold ${isKitchen ? 'text-lg bg-black text-white inline-block px-1' : 'pl-6 text-[10px] italic'}`}>
                                                OBS: {item.notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* 4. TOTALS (Customer Only) */}
                            {!isKitchen && (
                                <>
                                    <div className="border-b border-dashed border-black my-2"></div>
                                    <div className="space-y-1 text-right text-[10px]">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>R$ {order.total.toFixed(2)}</span>
                                        </div>
                                        {order.type === OrderType.DELIVERY && (
                                            <div className="flex justify-between">
                                                <span>Entrega:</span>
                                                <span>R$ 5,00</span>
                                            </div>
                                        )}
                                        {order.change && order.change > 0 && (
                                            <div className="flex justify-between">
                                                <span>Troco:</span>
                                                <span>R$ {order.change.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-sm mt-2 pt-1 border-t border-dashed border-black">
                                            <span>TOTAL:</span>
                                            <span>R$ {(order.total + (order.type === OrderType.DELIVERY ? 5 : 0)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-center text-[10px] font-bold border border-black p-1">
                                        {order.payments.length > 0 ? 'PAGO' : 'PAGAMENTO PENDENTE'}
                                    </div>
                                </>
                            )}

                            {/* 5. FOOTER */}
                            <div className="text-center mt-6 text-[10px]">
                                {isKitchen ? (
                                    <p className="font-bold text-xs border-t border-black pt-1">FIM DO PEDIDO</p>
                                ) : (
                                    <>
                                        <p>Obrigado pela preferência!</p>
                                        <p className="mt-1 text-[8px] text-gray-400">Sistema SUMMO</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTicket;
