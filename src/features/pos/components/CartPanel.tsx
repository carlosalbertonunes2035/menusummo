
import React, { useRef, useState, useEffect } from 'react';
import { OrderItem, OrderType, PaymentMethod, PaymentTransaction, StoreSettings } from '../../../types';
import {
    Plus, Minus, Trash2, FileText, MessageSquarePlus, User, MapPin,
    Navigation, Loader2, CheckCircle2, ShoppingBag, Utensils, Receipt, ArrowLeft, Phone, AlertTriangle
} from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from '@firebase/functions';
import { useDebounce } from '../../../lib/hooks';
import PaymentControl from './PaymentControl';
import AddressAutocomplete from '../../../components/ui/AddressAutocomplete';
import { GeocodeResult, calculateDistance } from '../../../services/googleMapsService';

interface AddressSuggestion {
    formattedAddress: string;
    mainText?: string;
    secondaryText?: string;
    lat: number;
    lng: number;
}

interface CartPanelProps {
    cart: OrderItem[];
    orderType: OrderType;
    setOrderType: (t: OrderType) => void;
    customerName: string;
    setCustomerName: (s: string) => void;
    customerPhone: string;
    setCustomerPhone: (s: string) => void;
    address: string;
    setAddress: (s: string) => void;
    calculatedFee: number;
    setCalculatedFee: (n: number) => void;
    grandTotal: number;
    remainingDue: number;
    changeDue: number;
    totalPaid: number;
    deliveryFee: number;
    onUpdateItem: (index: number, delta: number) => void;
    onRemoveItem: (index: number) => void;
    onToggleTakeout: (index: number) => void;
    onEditNotes: (product: any) => void;
    paymentStep: 'CART' | 'PAYMENT';
    setPaymentStep: (s: 'CART' | 'PAYMENT') => void;
    payments: PaymentTransaction[];
    onAddPayment: (method: PaymentMethod, amount: number) => void;
    onRemovePayment: (index: number) => void;
    onFinalize: () => void;
    isFinalizing: boolean;
    settings: StoreSettings;
    products: any[];
    setSelectedSuggestionCoords: (coords: { lat: number, lng: number } | null) => void;
}

const CartPanel: React.FC<CartPanelProps> = ({
    cart, orderType, setOrderType, customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    address, setAddress, calculatedFee, setCalculatedFee,
    grandTotal, remainingDue, changeDue, totalPaid, deliveryFee,
    onUpdateItem, onRemoveItem, onToggleTakeout, onEditNotes,
    paymentStep, setPaymentStep, payments, onAddPayment, onRemovePayment,
    onFinalize, isFinalizing, settings, products, setSelectedSuggestionCoords
}) => {
    const { showToast } = useToast();
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);
    const [routeInfo, setRouteInfo] = useState<{ dist: number, dur: string } | null>(null);

    // Handle address selection from autocomplete
    const handleAddressSelect = async (result: GeocodeResult) => {
        setAddress(result.address);
        setSelectedSuggestionCoords({ lat: result.lat, lng: result.lng });

        // Calculate delivery fee
        if (settings) {
            setIsCalculatingFee(true);
            try {
                const calculateShippingFeeFn = httpsCallable(functions, 'calculateShippingFeeFn');
                const { data } = await calculateShippingFeeFn({
                    origin: settings.address,
                    destination: result.address,
                    settings
                });
                const feeResult = data as any;
                setCalculatedFee(feeResult.fee);
                setRouteInfo({ dist: feeResult.distance, dur: feeResult.duration });
            } catch (e) {
                console.error('Error calculating fee:', e);
            } finally {
                setIsCalculatingFee(false);
            }
        }
    };

    const handleGoToPayment = () => {
        if (orderType === OrderType.DELIVERY && !address) {
            showToast?.("Para entrega, o endereço é obrigatório!", 'error');
            return;
        }
        setPaymentStep('PAYMENT');
    };

    const orderTypeOptions = [
        { type: OrderType.DINE_IN, label: 'Mesa', icon: Utensils, enabled: settings.operation?.dineIn ?? true },
        { type: OrderType.TAKEOUT, label: 'Retirada', icon: ShoppingBag, enabled: settings.operation?.takeout ?? true },
        { type: OrderType.DELIVERY, label: 'Entrega', icon: MapPin, enabled: settings.operation?.delivery ?? true }
    ];

    const [storeCoords, setStoreCoords] = useState<{ lat: number, lng: number } | null>(null);
    const apiKey = settings.integrations?.google?.apiKey;

    // Get store coordinates for biasing search results
    useEffect(() => {
        const getStoreCoords = async () => {
            if (settings.address && !storeCoords && apiKey) {
                try {
                    const { geocodeAddress } = await import('../../../services/googleMapsService');
                    const result = await geocodeAddress(settings.address);
                    if (result) {
                        setStoreCoords({ lat: result.lat, lng: result.lng });
                    }
                } catch (err) {
                    console.error('Error geocoding store address:', err);
                }
            }
        };
        getStoreCoords();
    }, [settings.address, apiKey, storeCoords]);

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* 1. TOP SECTION: CUSTOMER INFO OR SUMMARY */}
            <div className={`flex-none px-4 pt-2 pb-4 border-b ${orderType === OrderType.STAFF_MEAL ? 'bg-yellow-50 border-yellow-100' : 'bg-white border-gray-100'}`}>
                {paymentStep === 'CART' ? (
                    <>
                        <div className="bg-gray-100 p-1 rounded-xl flex mb-3 overflow-x-auto no-scrollbar">
                            {orderTypeOptions.filter(opt => opt.enabled).map((opt) => (
                                <button key={opt.type} onClick={() => setOrderType(opt.type)} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition whitespace-nowrap ${orderType === opt.type ? 'bg-white text-summo-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <opt.icon size={14} /> {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:ring-2 focus:ring-summo-primary outline-none font-medium transition" placeholder={orderType === OrderType.DINE_IN ? "Ex: Mesa 04" : "Nome do cliente"} value={customerName} onChange={e => setCustomerName(e.target.value)} />
                            </div>
                            <div className="relative w-36">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-xs focus:ring-2 focus:ring-summo-primary outline-none font-medium transition" placeholder="WhatsApp" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                            </div>
                        </div>

                        {orderType === OrderType.DELIVERY && (
                            <div className="mt-2 space-y-2">
                                {!apiKey && (
                                    <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200 flex items-center gap-2 mb-2">
                                        <AlertTriangle size={14} className="text-yellow-600" />
                                        <p className="text-[10px] text-yellow-700 font-bold">Chave do Google Maps não configurada.</p>
                                    </div>
                                )}
                                <AddressAutocomplete
                                    value={address}
                                    onChange={setAddress}
                                    onSelect={handleAddressSelect}
                                    placeholder="Buscar endereço..."
                                    apiKey={apiKey}
                                    locationBias={storeCoords || undefined}
                                />
                                <div className="text-xs text-blue-600 font-bold flex justify-between bg-blue-50 p-2 rounded items-center">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={12} /> Taxa de Entrega {routeInfo?.dist ? `(${routeInfo.dist.toFixed(1)}km)` : ''}:
                                    </span>
                                    {isCalculatingFee ? <Loader2 size={12} className="animate-spin" /> : <span>R$ {calculatedFee.toFixed(2)}</span>}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    // RESUMO NO MODO PAGAMENTO
                    <div className="animate-fade-in">
                        <button onClick={() => setPaymentStep('CART')} className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-3 hover:text-summo-primary transition"><ArrowLeft size={16} /> Voltar / Editar Itens</button>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex justify-between">
                                <span>Resumo do Pedido</span>
                                <span className="text-gray-800">{cart.reduce((a, b) => a + b.quantity, 0)} itens</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {cart.map((item, idx) => (
                                    <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-700">
                                        <b>{item.quantity}x</b> {item.productName}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-xs font-bold">
                                <span>Cliente: {customerName || 'Balcão'}</span>
                                {orderType === OrderType.DELIVERY && <span className="text-blue-600">Entrega</span>}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. MIDDLE SECTION: CART ITEMS OR PAYMENT */}
            <div className={`flex-1 overflow-y-auto p-2 ${orderType === OrderType.STAFF_MEAL ? 'bg-yellow-50/30' : 'bg-gray-50/50'}`}>
                {paymentStep === 'CART' ? (
                    <div className="space-y-2 pb-4">
                        {cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-center p-8"><ShoppingBag size={48} className="mb-4 opacity-20 text-gray-400" /><p className="font-medium text-sm">Seu carrinho está vazio.</p></div>
                        )}
                        {cart.map((item, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex gap-3 animate-fade-in">
                                <div className="flex flex-col items-center justify-between bg-gray-50 rounded-lg border border-gray-100 w-10 h-full py-1">
                                    <button onClick={() => onUpdateItem(idx, 1)} className="w-full flex-1 flex items-center justify-center hover:bg-gray-200 text-gray-600 active:bg-gray-300 transition-colors p-2"><Plus size={14} /></button>
                                    <span className="text-sm font-bold text-summo-dark py-1">{item.quantity}</span>
                                    <button onClick={() => onUpdateItem(idx, -1)} className="w-full flex-1 flex items-center justify-center hover:bg-gray-200 text-gray-600 active:bg-gray-300 transition-colors p-2"><Minus size={14} /></button>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-start"><p className="font-bold text-gray-800 text-sm leading-tight">{item.productName}</p><span className="font-mono font-bold text-gray-700 text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span></div>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <div className="flex gap-1">
                                            <button onClick={() => { const p = products.find(prod => prod.id === item.productId); if (p) onEditNotes(p); }} className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md transition ${item.notes ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'text-gray-400 hover:text-summo-primary hover:bg-summo-bg'}`}>{item.notes ? <FileText size={12} /> : <MessageSquarePlus size={12} />}<span className="max-w-[100px] truncate font-medium">{item.notes || "Obs"}</span></button>
                                            <button onClick={() => onToggleTakeout(idx)} className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md transition ${item.isTakeout ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-gray-300 hover:text-orange-500'}`} title="Para Viagem"><ShoppingBag size={12} /></button>
                                        </div>
                                        <button onClick={() => onRemoveItem(idx)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <PaymentControl
                        grandTotal={grandTotal} remainingDue={remainingDue} changeDue={changeDue} totalPaid={totalPaid}
                        payments={payments} onAddPayment={onAddPayment} onRemovePayment={onRemovePayment}
                    />
                )}
            </div>

            {/* 3. FOOTER ACTIONS (Fixed at bottom of flex container) */}
            <div className="flex-none p-4 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 pb-safe">
                <div className="flex justify-between items-end mb-4"><span className="text-gray-500 font-bold text-xs uppercase">Total Geral</span><div className="text-right leading-none">{deliveryFee > 0 && <p className="text-xs text-gray-400 mb-1">+ R$ {deliveryFee.toFixed(2)} entrega</p>}<span className="text-3xl font-bold text-summo-primary">R$ {grandTotal.toFixed(2)}</span></div></div>
                {paymentStep === 'CART' ? (
                    <button onClick={handleGoToPayment} disabled={cart.length === 0} className="w-full py-4 bg-summo-dark text-white rounded-xl font-bold text-lg hover:bg-summo-primary transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">Pagamento (F2) <Receipt size={20} /></button>
                ) : (
                    <div className="flex gap-3">
                        <button onClick={onFinalize} disabled={(remainingDue > 0.01 && orderType === OrderType.DINE_IN) || isFinalizing} className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-wait">{isFinalizing ? <Loader2 size={24} className="animate-spin" /> : <><CheckCircle2 /> Finalizar Pedido</>}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(CartPanel);
