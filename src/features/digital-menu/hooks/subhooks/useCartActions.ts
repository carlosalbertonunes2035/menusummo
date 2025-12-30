import { Product, CartItem } from '../../../../types';
import { getProductChannel } from '../../../../lib/utils';
import { RobotService } from '../../../../services/robotService';

interface UseCartActionsProps {
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    products: Product[];
    setSelectedProductForDetail: (p: Product | null) => void;
    setPendingAddition: (item: any) => void;
    setIsUpsellOpen: (open: boolean) => void;
    showToast: (msg: string, type: 'success' | 'error') => void;
    pendingAddition: any;
}

export function useCartActions({
    cart, setCart, products, setSelectedProductForDetail,
    setPendingAddition, setIsUpsellOpen, showToast, pendingAddition
}: UseCartActionsProps) {

    const handleAddToCartFromModal = (item: CartItem, hasUpsell: boolean = false) => {
        setSelectedProductForDetail(null);

        if (hasUpsell) {
            const channel = getProductChannel(item.product, 'digital-menu');
            const category = (channel.category || item.product.category || '').toLowerCase();

            let targetCategory = '';
            let targetTerm = '';

            if (category.includes('lanche') || category.includes('combo') || category.includes('burger')) {
                const hasDrink = cart.some(c => {
                    const cCat = (getProductChannel(c.product, 'digital-menu').category || c.product.category || '').toLowerCase();
                    return cCat.includes('bebida') || cCat.includes('refrigerante');
                });
                if (!hasDrink) {
                    targetCategory = 'bebida';
                    targetTerm = 'coca';
                }
            } else if (category.includes('bebida') || category.includes('cerveja')) {
                targetCategory = 'porç';
                targetTerm = 'fritas';
            }

            let suggestedProduct: Product | undefined;
            if (targetCategory) {
                suggestedProduct = products.find(p => {
                    const pChan = getProductChannel(p, 'digital-menu');
                    const pCat = (pChan.category || p.category || '').toLowerCase();
                    return pCat.includes(targetCategory) && (p.name || '').toLowerCase().includes(targetTerm.toLowerCase()) && pChan.isAvailable;
                });
                if (!suggestedProduct) {
                    suggestedProduct = products.find(p => {
                        const pChan = getProductChannel(p, 'digital-menu');
                        const pCat = (pChan.category || p.category || '').toLowerCase();
                        return pCat.includes(targetCategory) && pChan.isAvailable;
                    });
                }
            }

            if (!suggestedProduct) {
                const suggestedTerm = RobotService.getRuleBasedUpsell(item.product.category);
                if (suggestedTerm) {
                    suggestedProduct = products.find(p => (p.name || '').toLowerCase().includes(suggestedTerm.toLowerCase()) && getProductChannel(p, 'digital-menu').isAvailable);
                }
            }

            if (suggestedProduct) {
                setPendingAddition({ ...item, suggestedProduct });
                setIsUpsellOpen(true);
            } else {
                setCart(prev => [...prev, item]);
                showToast(`${item.product.name} adicionado!`, 'success');
            }
        } else {
            setCart(prev => [...prev, item]);
            showToast(`${item.product.name} adicionado!`, 'success');
        }
    };

    const handleUpsellClose = (upsellProduct: Product | null) => {
        if (!pendingAddition) return;
        const newItems: CartItem[] = [{ ...pendingAddition }];
        if (upsellProduct) {
            newItems.push({ product: upsellProduct, quantity: 1, notes: 'Sugestão ✨', selectedOptions: [] });
        }
        setCart((prev: CartItem[]) => [...prev, ...newItems]);
        setPendingAddition(null);
        setIsUpsellOpen(false);
        if (navigator.vibrate) navigator.vibrate(50);
        showToast(`${pendingAddition.product.name} adicionado!`, 'success');
    };

    const updateCartItem = (index: number, delta: number) => {
        setCart((prev: CartItem[]) => {
            const newItem = { ...prev[index], quantity: prev[index].quantity + delta };
            if (newItem.quantity <= 0) return prev.filter((_: any, i: number) => i !== index);
            const newCart = [...prev]; newCart[index] = newItem; return newCart;
        });
    };

    const handleAddUpsellItem = (product: Product) => {
        setCart((prev: CartItem[]) => [...prev, { product, quantity: 1, notes: '', selectedOptions: [] }]);
        if (navigator.vibrate) navigator.vibrate(50);
        showToast(`+1 ${product.name} adicionado`, 'success');
    };

    return {
        handleAddToCartFromModal,
        handleUpsellClose,
        updateCartItem,
        handleAddUpsellItem
    };
}
