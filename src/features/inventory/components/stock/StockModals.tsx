import React, { useEffect } from 'react';
import { Save, Plus, X, Upload, Package, ArrowDownCircle, TrendingDown, Edit3, ShoppingCart, ImageIcon, Search, CheckCircle2 } from 'lucide-react';
import { useStock } from '../../hooks/useStock';

interface StockModalsProps {
    logic: ReturnType<typeof useStock>;
}

const StockModals: React.FC<StockModalsProps> = ({ logic }) => {
    const {
        modalType, closeModal, formData, setFormData, handleFormSubmit,
        selectedIngredient, costPreview,
        shoppingFormData, setShoppingFormData, shoppingSearchTerm, setShoppingSearchTerm, filteredIngredientsForShopping,
        openAddModal
    } = logic;

    // Handle Escape Key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && modalType) {
                closeModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modalType, closeModal]);

    if (!modalType) return null;

    const handleIngredientPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const { base64, mimeType } = await (window as any).compressImage(file, 400);
            setFormData(prev => ({ ...prev, image: `data:${mimeType};base64,${base64}` }));
        } catch (error) { console.error(error); }
    };

    const handleSwitchToCreate = () => {
        const name = shoppingSearchTerm;
        closeModal();
        setTimeout(() => openAddModal(name), 100);
    };

    return (
        <div onClick={closeModal} className="fixed inset-0 bg-summo-dark/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] animate-fade-in p-0 sm:p-4">
            {/* Mobile: Bottom Sheet style | Desktop: Centered Modal */}
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-in-up">
                {/* Header */}
                <div className={`p-5 flex justify-between items-center text-white flex-shrink-0 ${modalType === 'ADD' || modalType === 'EDIT' ? 'bg-summo-primary' : ''} ${modalType === 'RESTOCK' ? 'bg-green-600' : ''} ${modalType === 'LOSS' ? 'bg-red-600' : ''} ${modalType === 'SHOPPING_ADD' ? 'bg-blue-600' : ''}`}>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        {modalType === 'ADD' && <><Plus size={20} /> Novo Insumo</>}
                        {modalType === 'EDIT' && <><Edit3 size={20} /> Editar</>}
                        {modalType === 'RESTOCK' && <><ArrowDownCircle size={20} /> Entrada</>}
                        {modalType === 'LOSS' && <><TrendingDown size={20} /> Perda</>}
                        {modalType === 'SHOPPING_ADD' && <><ShoppingCart size={20} /> Lista de Compras</>}
                    </h3>
                    <button onClick={closeModal} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition text-white"><X size={18} /></button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="overflow-y-auto custom-scrollbar">

                    {/* SHOPPING LIST ADD */}
                    {modalType === 'SHOPPING_ADD' ? (
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buscar Insumo</label>
                                <div className="relative">
                                    <input type="text" value={shoppingSearchTerm} onChange={e => { setShoppingSearchTerm(e.target.value); setShoppingFormData(prev => ({ ...prev, name: e.target.value, ingredientId: '' })); }} className="w-full p-3 pl-9 bg-white border border-gray-200 rounded-xl outline-none font-bold focus:ring-2 focus:ring-blue-500" autoFocus placeholder="Digite para buscar..." />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                </div>
                                {shoppingSearchTerm && !shoppingFormData.ingredientId && (
                                    <div className="mt-2 border border-gray-100 rounded-xl max-h-48 overflow-y-auto bg-gray-50/50 shadow-inner">
                                        {filteredIngredientsForShopping.map(ing => (
                                            <div key={ing.id} onClick={() => { setShoppingFormData(prev => ({ ...prev, name: ing.name, unit: ing.unit, ingredientId: ing.id })); setShoppingSearchTerm(ing.name); }} className="p-3 bg-white border-b border-gray-50 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition">
                                                <span className="font-bold text-sm text-gray-700">{ing.name}</span>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{ing.currentStock} {ing.unit}</span>
                                            </div>
                                        ))}
                                        <div onClick={handleSwitchToCreate} className="p-3 bg-blue-50 text-blue-700 font-bold text-sm cursor-pointer hover:bg-blue-100 flex items-center gap-2 transition">
                                            <Plus size={16} /> Cadastrar novo insumo: "{shoppingSearchTerm}"
                                        </div>
                                    </div>
                                )}
                                {shoppingFormData.ingredientId && <div className="mt-2 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2 text-green-700 text-sm font-bold animate-fade-in"><CheckCircle2 size={16} /> Vinculado: {shoppingFormData.name}</div>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd</label><input type="number" value={shoppingFormData.quantity} onChange={e => setShoppingFormData({ ...shoppingFormData, quantity: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl font-bold text-center" required /></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Un</label>
                                    <select value={shoppingFormData.unit} onChange={e => setShoppingFormData({ ...shoppingFormData, unit: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white" disabled={!!shoppingFormData.ingredientId}><option value="un">un</option><option value="kg">kg</option><option value="l">l</option><option value="cx">cx</option></select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg mt-2">Adicionar à Lista</button>
                        </form>

                        /* INVENTORY FORMS (ADD/EDIT/RESTOCK/LOSS) */
                    ) : (
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                            {modalType === 'RESTOCK' ? (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-lg text-green-700"><Package size={20} /></div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-bold uppercase">Item</p>
                                            <p className="text-lg font-bold text-gray-800">{selectedIngredient?.name}</p>
                                        </div>
                                    </div>

                                    {selectedIngredient?.purchaseUnit && (
                                        <div className="bg-summo-bg/50 p-4 rounded-2xl border border-summo-primary/10">
                                            <label className="flex items-center justify-between cursor-pointer group">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingCart size={18} className="text-summo-primary" />
                                                    <div>
                                                        <p className="text-sm font-bold text-summo-dark">Entrada por {selectedIngredient.purchaseUnit}?</p>
                                                        <p className="text-[10px] text-gray-500">1 {selectedIngredient.purchaseUnit} = {selectedIngredient.conversionFactor} {selectedIngredient.unit}</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isBulkEntry}
                                                    onChange={e => setFormData({ ...formData, isBulkEntry: e.target.checked })}
                                                    className="w-5 h-5 rounded-lg border-gray-300 text-summo-primary focus:ring-summo-primary transition-all"
                                                />
                                            </label>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                                Qtd. ({formData.isBulkEntry ? selectedIngredient?.purchaseUnit : selectedIngredient?.unit})
                                            </label>
                                            <input type="number" step="any" value={formData.restockQty} onChange={e => setFormData({ ...formData, restockQty: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-lg" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custo Total (R$)</label>
                                            <input type="number" step="0.01" value={formData.restockTotalCost} onChange={e => setFormData({ ...formData, restockTotalCost: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-lg" required />
                                        </div>
                                    </div>

                                    {costPreview && (
                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-blue-600">Custo Médio Novo (por {selectedIngredient?.unit}):</p>
                                                    {formData.isBulkEntry && (
                                                        <p className="text-[10px] text-blue-400">Total: {Number(formData.restockQty) * (selectedIngredient?.conversionFactor || 1)} {selectedIngredient?.unit}</p>
                                                    )}
                                                </div>
                                                <p className="text-2xl font-bold text-blue-700">R$ {costPreview.newCost.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) :
                                modalType === 'LOSS' ? (<><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd. Perdida</label><input type="number" step="any" value={formData.restockQty} onChange={e => setFormData({ ...formData, restockQty: e.target.value })} className="w-full p-3 border border-red-200 bg-red-50/30 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-800" required /></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motivo</label><textarea value={formData.lossReason} onChange={e => setFormData({ ...formData, lossReason: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl" required rows={3} /></div></>) :
                                    (<><div className="mb-2 flex gap-4"><div className="w-28 h-28 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center overflow-hidden relative flex-shrink-0">{formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-gray-300" />}{formData.image && (<button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition"><X size={12} /></button>)}</div><div className="flex-1 flex flex-col gap-2 justify-center"><label className="flex items-center justify-center gap-2 w-full p-2.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition text-xs font-bold text-gray-600 uppercase"><Upload size={16} /><span>Foto</span><input type="file" accept="image/*" className="hidden" value="" onClick={(e) => (e.target as HTMLInputElement).value = ''} onChange={handleIngredientPhotoUpload} /></label>{!formData.image.startsWith('data:') && <input type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="URL da imagem..." className="w-full pl-3 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none text-sm" />}</div></div>
                                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none font-bold text-gray-800" required /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade de Venda</label><select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl"><option value="kg">kg</option><option value="l">l</option><option value="un">un</option><option value="cx">cx</option><option value="g">g</option><option value="ml">ml</option></select></div>
                                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custo Unit. (R$)</label><input type="number" step="0.01" value={formData.costPerUnit} onChange={e => setFormData({ ...formData, costPerUnit: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl" required /></div>
                                        </div>
                                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuração de Compra em Lote</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Uni. Compra</label><input type="text" placeholder="Ex: Fardo, Caixa" value={formData.purchaseUnit} onChange={e => setFormData({ ...formData, purchaseUnit: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none text-sm font-bold" /></div>
                                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fator Conversão</label><input type="number" placeholder="Ex: 12" value={formData.conversionFactor} onChange={e => setFormData({ ...formData, conversionFactor: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none text-sm font-bold text-center" /></div>
                                            </div>
                                            {formData.purchaseUnit && <p className="text-[10px] text-summo-primary font-bold text-center italic">1 {formData.purchaseUnit} = {formData.conversionFactor} {formData.unit}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estoque Atual</label><input type="number" step="any" value={formData.currentStock} onChange={e => setFormData({ ...formData, currentStock: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl" required /></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mínimo</label><input type="number" step="any" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl" required /></div></div></>)}

                            <div className="pt-2 flex gap-3"><button type="button" onClick={closeModal} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancelar</button><button type="submit" className={`flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg transition flex justify-center items-center gap-2 ${modalType === 'RESTOCK' ? 'bg-green-600' : modalType === 'LOSS' ? 'bg-red-600' : 'bg-summo-primary'}`}><Save size={20} /> Salvar</button></div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockModals;
