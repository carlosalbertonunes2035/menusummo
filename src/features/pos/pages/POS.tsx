
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Product, Order, OrderStatus, OrderType, PaymentMethod } from '@/types';
import { Search, Wand2, CheckCircle2, Loader2, Banknote, Unlock, Receipt, X, ChevronUp } from 'lucide-react';
import { httpsCallable } from '@firebase/functions';
import { functions } from '@/lib/firebase/client';
import { searchMatch, getProductChannel } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useCheckout } from '@/hooks/useCheckout';
import { usePOS } from '@/features/pos/hooks/usePOS';
import { printingService } from '@/services/printingService';
import { useProducts, useIngredients } from '@/features/inventory/hooks/queries';

// Sub-components
import ProductGrid from '../components/ProductGrid';
import CartPanel from '../components/CartPanel';
import POSModals from '../components/POSModals';
import { SummoInput } from '@/components/ui/SummoInput';
import { SummoButton } from '@/components/ui/SummoButton';

const POS: React.FC = () => {
    // Hooks & Context
    const { tenantId, cashRegister, setCashRegister, settings } = useApp();
    const { showToast } = useToast();
    const { placeOrder } = useCheckout();
    const { data: products = [] } = useProducts(tenantId);
    const { data: ingredients = [] } = useIngredients(tenantId);
    const posLogic = usePOS();
    const { addToCart } = posLogic;

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState(''); // Added missing state
    const [paymentStep, setPaymentStep] = useState<'CART' | 'PAYMENT'>('CART');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    // Modal States
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiInputText, setAiInputText] = useState('');
    const [isProcessingAi, setIsProcessingAi] = useState(false);
    const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
    const [customQty, setCustomQty] = useState(1);
    const [customNotes, setCustomNotes] = useState('');

    // Result States
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [lastOrderId, setLastOrderId] = useState<string>('');
    const [initialAmount, setInitialAmount] = useState('');
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [selectedSuggestionCoords, setSelectedSuggestionCoords] = useState<{ lat: number, lng: number } | null>(null);

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const noteInputRef = useRef<HTMLTextAreaElement>(null);
    const customerInputRef = useRef<HTMLInputElement>(null);

    // --- Logic ---
    const categories = useMemo(() => ['Todos', ...Array.from(new Set(products.map(p => p.category)))], [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const posChannel = getProductChannel(p, 'pos');

            const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
            const matchSearch = searchMatch(p.name, searchTerm) || (posChannel.description && searchMatch(posChannel.description, searchTerm));
            return matchCat && matchSearch && posChannel.isAvailable;
        });
    }, [products, selectedCategory, searchTerm]);

    useEffect(() => setSelectedIndex(0), [searchTerm, selectedCategory]);

    // --- Handlers ---
    const handleQuickAdd = useCallback((product: Product) => {
        if (addToCart(product, 1)) showToast?.(`+1 ${product.name}`, 'success');
    }, [addToCart, showToast]);

    const handleOpenCustomization = useCallback((product: Product, e?: React.MouseEvent) => {
        e?.stopPropagation(); e?.preventDefault();
        setCustomizingProduct(product); setCustomQty(1); setCustomNotes('');
    }, []);

    const handleAddToCartFromModal = () => {
        if (!customizingProduct) return;
        if (posLogic.addToCart(customizingProduct, customQty, customNotes)) {
            setCustomizingProduct(null); showToast?.('Item salvo', 'success');
        }
    };

    const handleAiOrder = async () => {
        if (!aiInputText) return; setIsProcessingAi(true);
        try {
            const parseOrderFn = httpsCallable(functions, 'parseOrder');
            const { data } = await parseOrderFn({ text: aiInputText, products });
            const items = data as { productId: string; quantity: number; notes?: string }[];
            let addedCount = 0;
            for (const aiItem of items) {
                const prod = products.find(p => p.id === aiItem.productId);
                if (prod && posLogic.addToCart(prod, aiItem.quantity, aiItem.notes)) addedCount++;
            }
            showToast?.(addedCount > 0 ? `${addedCount} itens adicionados.` : "IA não identificou itens.", addedCount > 0 ? 'success' : 'error');
            setIsAiModalOpen(false); setAiInputText('');
        } catch (e) { showToast?.("Erro na IA", 'error'); } finally { setIsProcessingAi(false); }
    };

    const handleFinalize = async () => {
        // SECURITY CHECK: Ensure address exists for delivery
        if (posLogic.orderType === OrderType.DELIVERY && !posLogic.address) {
            showToast?.("Endereço de entrega obrigatório!", 'error');
            setPaymentStep('CART'); // Force back to cart step to fix
            setIsMobileCartOpen(true);
            return;
        }

        if (!customerName && posLogic.orderType === OrderType.DELIVERY) { showToast?.("Identifique o cliente!", 'error'); customerInputRef.current?.focus(); return; }
        if (posLogic.remainingDue > 0.01 && posLogic.orderType === OrderType.DINE_IN) { showToast?.("Falta pagamento.", 'error'); return; }

        setIsFinalizing(true);
        try {
            const totalCost = posLogic.cart.reduce((acc: number, item) => { const prod = products.find(p => p.id === item.productId); return acc + ((prod?.cost || 0) * item.quantity); }, 0);

            const orderPayload: Omit<Order, 'id' | 'createdAt'> = {
                customerName: customerName || (posLogic.orderType === OrderType.STAFF_MEAL ? 'Consumo Equipe' : 'Cliente Balcão'),
                items: [...posLogic.cart],
                total: posLogic.grandTotal,
                cost: totalCost,
                status: posLogic.orderType === OrderType.STAFF_MEAL ? OrderStatus.COMPLETED : OrderStatus.PENDING,
                type: posLogic.orderType,
                origin: 'POS',
                payments: posLogic.orderType === OrderType.STAFF_MEAL
                    ? [{ id: Date.now().toString(), method: PaymentMethod.CREDIT_TAB, amount: posLogic.grandTotal, description: 'Staff Meal', timestamp: new Date() }]
                    : [...posLogic.payments],
                ...(customerPhone ? { customerPhone } : {}),
                ...(posLogic.orderType === OrderType.DELIVERY && posLogic.address ? { deliveryAddress: posLogic.address } : {}),
                ...(selectedSuggestionCoords ? { location: selectedSuggestionCoords } : {}),
                ...(posLogic.changeDue > 0.01 ? { change: posLogic.changeDue } : {}),
                tenantId // Ensure tenantId is present
            };

            const newOrderId = await placeOrder(orderPayload);
            setLastOrderId(newOrderId); setShowSuccess(true); setIsMobileCartOpen(false);

            // AUTO-PRINT
            const fullOrder: Order = { ...orderPayload, id: newOrderId, createdAt: new Date(), tenantId };
            printingService.printOrder(fullOrder, products, settings, tenantId, 'ORDER');

            if (posLogic.orderType !== OrderType.STAFF_MEAL) showToast("Pedido enviado!", 'success');
        } catch (error) { console.error(error); showToast("Erro ao registrar.", 'error'); } finally { setIsFinalizing(false); }
    };

    const handleManualPrint = (type: 'ORDER' | 'KITCHEN') => {
        if (!lastOrderId) return;
        // Reconstruct order for printing
        const order = {
            id: lastOrderId,
            customerName: customerName || 'Cliente',
            items: posLogic.cart,
            total: posLogic.grandTotal,
            type: posLogic.orderType,
            tenantId,
            payments: posLogic.payments,
            createdAt: new Date()
        } as Order;

        printingService.printOrder(order, products, settings, tenantId, type);
    };

    const resetPOS = () => {
        posLogic.clearPOS(); setCustomerName(''); setCustomerPhone(''); setPaymentStep('CART'); setShowSuccess(false); setSelectedSuggestionCoords(null);
    };

    const handleOpenCash = () => {
        const amount = parseFloat(initialAmount);
        if (isNaN(amount) || amount < 0) { showToast("Valor inválido.", 'error'); return; }
        setCashRegister({ isOpen: true, openedAt: new Date(), initialAmount: amount, currentBalance: amount, totalSales: 0, transactions: [{ id: Date.now().toString(), type: 'OPEN', amount, description: 'Abertura de Caixa', timestamp: new Date() }] });
        showToast("Caixa aberto!", 'success');
    };

    // --- Keyboard (Shortcuts) ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') { e.preventDefault(); searchInputRef.current?.focus(); }
            if (e.key === 'F2') {
                e.preventDefault();
                if (isMobileCartOpen || window.innerWidth >= 768) {
                    if (paymentStep === 'CART' && posLogic.cart.length > 0) {
                        if (posLogic.orderType === OrderType.DELIVERY && !posLogic.address) {
                            showToast?.("Endereço de entrega obrigatório!", 'error');
                            return;
                        }
                        setPaymentStep('PAYMENT');
                    }
                    else if (paymentStep === 'PAYMENT') handleFinalize();
                } else if (posLogic.cart.length > 0) setIsMobileCartOpen(true);
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                if (customizingProduct) setCustomizingProduct(null); else if (isAiModalOpen) setIsAiModalOpen(false);
                else if (paymentStep === 'PAYMENT') setPaymentStep('CART'); else if (isMobileCartOpen) setIsMobileCartOpen(false);
                else if (searchTerm) setSearchTerm('');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [paymentStep, posLogic.cart, customizingProduct, searchTerm, isMobileCartOpen, isAiModalOpen, posLogic.address, posLogic.orderType]);

    // --- Renders ---
    if (!products || !ingredients) return <div className="h-full flex items-center justify-center text-gray-400"><Loader2 className="animate-spin" /></div>;

    if (!cashRegister.isOpen) return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-100 text-gray-600 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm w-full">
                <Banknote size={48} className="mx-auto mb-4 text-summo-primary opacity-50" />
                <h2 className="text-2xl font-bold text-summo-dark mb-2">Caixa Fechado</h2>
                <div className="relative mb-4"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span><input type="number" value={initialAmount} onChange={(e) => setInitialAmount(e.target.value)} placeholder="150,00" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-summo-primary" /></div>
                <button onClick={handleOpenCash} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 active:scale-95"><Unlock size={20} /> Abrir Caixa</button>
            </div>
        </div>
    );

    if (showSuccess) return (
        <div className="h-full flex flex-col items-center justify-center bg-summo-bg animate-fade-in p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600"><CheckCircle2 size={40} /></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido #{lastOrderId.slice(-4)}</h2>
                <p className="text-gray-500 mb-8">Realizado com sucesso!</p>
                <div className="grid gap-3"><button onClick={resetPOS} className="w-full py-4 bg-summo-primary text-white rounded-xl font-bold shadow-lg hover:bg-summo-dark transition active:scale-95">Novo Pedido (Enter)</button><div className="grid grid-cols-2 gap-3"><button onClick={() => handleManualPrint('ORDER')} className="py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 active:scale-95"><Receipt size={18} /> Cliente</button><button onClick={() => handleManualPrint('KITCHEN')} className="py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 active:scale-95"><Wand2 size={18} /> Cozinha</button></div></div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row h-full bg-gray-100">
            {/* Left Column: Product Grid */}
            <div className="flex-1 flex flex-col bg-gray-50/50 h-full overflow-hidden">
                <div className="p-4 bg-white border-b border-gray-200 flex gap-3 items-center shadow-sm z-10 sticky top-0">
                    <div className="relative flex-1">
                        <SummoInput
                            icon={Search}
                            ref={searchInputRef}
                            placeholder="Buscar produto... (F1)"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoComplete="off"
                            className="w-full"
                        />
                    </div>
                    <SummoButton
                        onClick={() => setIsAiModalOpen(true)}
                        leftIcon={<Wand2 size={18} />}
                        className="shadow-lg active:scale-95"
                    >
                        <span className="hidden sm:inline">IA</span>
                    </SummoButton>
                </div>

                <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white border-b border-gray-100 pb-2">
                    {categories.map(cat => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${selectedCategory === cat ? 'bg-summo-primary text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{cat}</button>))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
                    <ProductGrid products={filteredProducts} ingredients={ingredients} onAdd={handleQuickAdd} onEdit={handleOpenCustomization} selectedIndex={selectedIndex} />
                </div>
            </div>

            {/* Right Column: Cart (Tablet/Desktop) */}
            <div className="hidden md:flex md:w-96 lg:w-[420px] bg-white flex-col shadow-2xl z-20 border-l border-gray-200 h-full relative">
                <CartPanel
                    cart={posLogic.cart} orderType={posLogic.orderType} setOrderType={posLogic.setOrderType}
                    customerName={customerName} setCustomerName={setCustomerName}
                    customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
                    address={posLogic.address} setAddress={posLogic.setAddress}
                    calculatedFee={posLogic.calculatedFee} setCalculatedFee={posLogic.setCalculatedFee}
                    grandTotal={posLogic.grandTotal} remainingDue={posLogic.remainingDue} changeDue={posLogic.changeDue} totalPaid={posLogic.totalPaid} deliveryFee={posLogic.deliveryFee}
                    onUpdateItem={posLogic.updateCartItem} onRemoveItem={posLogic.removeCartItem} onToggleTakeout={posLogic.toggleItemTakeout} onEditNotes={handleOpenCustomization}
                    paymentStep={paymentStep} setPaymentStep={setPaymentStep}
                    payments={posLogic.payments} onAddPayment={posLogic.addPayment} onRemovePayment={posLogic.removePayment}
                    onFinalize={handleFinalize} isFinalizing={isFinalizing}
                    settings={settings} products={products} setSelectedSuggestionCoords={setSelectedSuggestionCoords}
                />
            </div>

            {/* Mobile Sticky Footer */}
            <div className="md:hidden fixed bottom-16 left-4 right-4 z-40">
                {posLogic.cart.length > 0 && !isMobileCartOpen && (
                    <button onClick={() => setIsMobileCartOpen(true)} className="w-full bg-summo-dark text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center animate-slide-in-up active:scale-95 transition">
                        <div className="flex items-center gap-3"><div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{posLogic.cart.reduce((a: number, b) => a + b.quantity, 0)}</div><span className="font-bold text-sm">Ver Carrinho</span></div>
                        <span className="font-bold text-lg">R$ {posLogic.grandTotal.toFixed(2)}</span>
                        <ChevronUp size={20} className="animate-bounce" />
                    </button>
                )}
            </div>

            {/* Mobile Cart Modal */}
            {isMobileCartOpen && (
                <div className="md:hidden fixed inset-0 z-[90] flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div onClick={() => setIsMobileCartOpen(false)} className="flex-1" />
                    <div className="bg-white rounded-t-[2rem] h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-slide-in-up">
                        <div className="flex justify-center p-3" onClick={() => setIsMobileCartOpen(false)}><div className="w-16 h-1.5 bg-gray-300 rounded-full" /></div>
                        <div className="flex justify-between items-center px-4 pb-2 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-800">Carrinho</h2><button onClick={() => setIsMobileCartOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600 active:scale-95 transition"><X size={20} /></button></div>
                        <div className="flex-1 overflow-hidden">
                            <CartPanel
                                cart={posLogic.cart} orderType={posLogic.orderType} setOrderType={posLogic.setOrderType}
                                customerName={customerName} setCustomerName={setCustomerName}
                                customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
                                address={posLogic.address} setAddress={posLogic.setAddress}
                                calculatedFee={posLogic.calculatedFee} setCalculatedFee={posLogic.setCalculatedFee}
                                grandTotal={posLogic.grandTotal} remainingDue={posLogic.remainingDue} changeDue={posLogic.changeDue} totalPaid={posLogic.totalPaid} deliveryFee={posLogic.deliveryFee}
                                onUpdateItem={posLogic.updateCartItem} onRemoveItem={posLogic.removeCartItem} onToggleTakeout={posLogic.toggleItemTakeout} onEditNotes={handleOpenCustomization}
                                paymentStep={paymentStep} setPaymentStep={setPaymentStep}
                                payments={posLogic.payments} onAddPayment={posLogic.addPayment} onRemovePayment={posLogic.removePayment}
                                onFinalize={handleFinalize} isFinalizing={isFinalizing}
                                settings={settings} products={products} setSelectedSuggestionCoords={setSelectedSuggestionCoords}
                            />
                        </div>
                    </div>
                </div>
            )}

            <POSModals
                isAiModalOpen={isAiModalOpen} setIsAiModalOpen={setIsAiModalOpen} aiInputText={aiInputText} setAiInputText={setAiInputText} handleAiOrder={handleAiOrder} isProcessingAi={isProcessingAi}
                customizingProduct={customizingProduct} setCustomizingProduct={setCustomizingProduct} customQty={customQty} setCustomQty={setCustomQty as any} customNotes={customNotes} setCustomNotes={setCustomNotes} handleAddToCartFromModal={handleAddToCartFromModal} noteInputRef={noteInputRef as any}
            />
        </div>
    );
};

export default React.memo(POS);
