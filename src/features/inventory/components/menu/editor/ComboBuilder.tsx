import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Package, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { Product } from '@/types';
import { useComboBuilder, ComboItem } from '../../../hooks/useComboBuilder';
import { formatCurrency } from '@/lib/utils';

interface ComboBuilderProps {
    product: Product;
    products: Product[]; // All available products
    onUpdate: (comboItems: ComboItem[]) => void;
}

export const ComboBuilder: React.FC<ComboBuilderProps> = ({ product, products, onUpdate }) => {
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const comboLogic = useComboBuilder(product.comboItems || [], products);
    const { items, comboStats, calculateMargin, calculateDiscount, addItem, removeItem, updateQuantity, isValid } = comboLogic;

    // Get selling price from POS channel
    const sellingPrice = product.channels?.find(c => c.channel === 'pos')?.price || 0;
    const margin = calculateMargin(sellingPrice);
    const discount = calculateDiscount(sellingPrice);

    // Filter products (exclude combos from being added to combos)
    const availableProducts = products.filter(p =>
        p.type !== 'COMBO' &&
        p.id !== product.id &&
        (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAddProduct = (productId: string) => {
        addItem(productId);
        setShowProductSelector(false);
        setSearchTerm('');

        // Notify parent of changes
        const updatedItems = [...items];
        const existingIndex = updatedItems.findIndex(item => item.productId === productId);
        if (existingIndex >= 0) {
            updatedItems[existingIndex].quantity += 1;
        } else {
            const prod = products.find(p => p.id === productId);
            if (prod) {
                updatedItems.push({
                    productId,
                    quantity: 1,
                    name: prod.name,
                    unitCost: prod.cost || prod.realCost || 0,
                });
            }
        }
        onUpdate(updatedItems);
    };

    const handleRemove = (index: number) => {
        removeItem(index);
        const updatedItems = items.filter((_, i) => i !== index);
        onUpdate(updatedItems);
    };

    const handleQuantityChange = (index: number, qty: number) => {
        updateQuantity(index, qty);
        const updatedItems = items.map((item, i) =>
            i === index ? { ...item, quantity: qty } : item
        );
        onUpdate(updatedItems);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={14} className="text-blue-600" />
                        <p className="text-[10px] text-blue-600 uppercase font-black">Custo Total</p>
                    </div>
                    <p className="text-2xl font-black text-blue-700">{formatCurrency(comboStats.totalCost)}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={14} className="text-green-600" />
                        <p className="text-[10px] text-green-600 uppercase font-black">Preço Combo</p>
                    </div>
                    <p className="text-2xl font-black text-green-700">{formatCurrency(sellingPrice)}</p>
                </div>

                <div className={`p-4 rounded-2xl border ${margin < 25 ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Percent size={14} className={margin < 25 ? 'text-red-600' : 'text-emerald-600'} />
                        <p className={`text-[10px] uppercase font-black ${margin < 25 ? 'text-red-600' : 'text-emerald-600'}`}>Margem</p>
                    </div>
                    <p className={`text-2xl font-black ${margin < 25 ? 'text-red-700' : 'text-emerald-700'}`}>
                        {margin.toFixed(1)}%
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Package size={14} className="text-purple-600" />
                        <p className="text-[10px] text-purple-600 uppercase font-black">Desconto vs Separado</p>
                    </div>
                    <p className="text-2xl font-black text-purple-700">{formatCurrency(discount)}</p>
                </div>
            </div>

            {/* Warning if no items */}
            {!isValid && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-amber-800 text-sm">Combo Vazio</p>
                        <p className="text-xs text-amber-600 mt-1">Adicione pelo menos 1 produto para criar um combo válido.</p>
                    </div>
                </div>
            )}

            {/* Items List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h4 className="text-xs font-black text-gray-400 uppercase mb-4">Produtos no Combo</h4>

                <div className="space-y-2 mb-4">
                    {items.map((item, index) => {
                        const childProduct = products.find(p => p.id === item.productId);
                        const itemTotalCost = (item.unitCost || 0) * item.quantity;

                        return (
                            <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:shadow-md transition group">
                                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {childProduct?.image ? (
                                        <img src={childProduct.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package size={18} className="text-gray-400" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {formatCurrency(item.unitCost || 0)} × {item.quantity} = {formatCurrency(itemTotalCost)}
                                    </p>
                                </div>

                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                                    className="w-16 p-2 border-2 border-gray-200 rounded-lg text-center font-bold text-sm focus:border-summo-primary outline-none transition"
                                />

                                <button
                                    onClick={() => handleRemove(index)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                    title="Remover"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Add Product Button */}
                <button
                    onClick={() => setShowProductSelector(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-summo-primary hover:text-summo-primary hover:bg-summo-bg/20 transition flex items-center justify-center gap-2 font-bold text-sm"
                >
                    <Plus size={20} /> Adicionar Produto ao Combo
                </button>
            </div>

            {/* Product Selector Modal */}
            {showProductSelector && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-scale-in">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Selecionar Produto</h3>
                            <input
                                type="text"
                                placeholder="Buscar produto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-summo-primary transition"
                                autoFocus
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-2">
                            {availableProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleAddProduct(p.id)}
                                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-summo-bg rounded-xl border border-gray-100 hover:border-summo-primary transition text-left group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {p.image ? (
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 group-hover:text-summo-primary transition">{p.name}</p>
                                        <p className="text-xs text-gray-500">Custo: {formatCurrency(p.cost || p.realCost || 0)}</p>
                                    </div>
                                    <Plus size={20} className="text-gray-400 group-hover:text-summo-primary transition" />
                                </button>
                            ))}

                            {availableProducts.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <Package size={48} className="mx-auto mb-3 opacity-50" />
                                    <p className="font-bold">Nenhum produto encontrado</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setShowProductSelector(false);
                                    setSearchTerm('');
                                }}
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
