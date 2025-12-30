import React, { useState } from 'react';
import { X, Save, Package, DollarSign } from 'lucide-react';
import { useApp } from '../../../../contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '../../../auth/context/AuthContext';
import { useIngredientsQuery } from '@/lib/react-query/queries/useIngredientsQuery';
import { storageService } from '../../../../lib/firebase/storageService';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface QuickCreateIngredientModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialName?: string;
    onCreated?: (id: string) => void;
}

export const QuickCreateIngredientModal: React.FC<QuickCreateIngredientModalProps> = ({ isOpen, onClose, initialName = '', onCreated }) => {
    const { tenantId } = useApp();
    const { showToast } = useToast();
    const { saveIngredient } = useIngredientsQuery(tenantId);
    const { systemUser } = useAuth();
    const [name, setName] = useState(initialName);
    const [unit, setUnit] = useState('kg');
    const [cost, setCost] = useState('');
    const [image, setImage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) return showToast('Máximo 5MB', 'error');

        setIsUploading(true);
        try {
            const tenantId = systemUser?.tenantId || 'global';
            // We use a generic 'ingredients' folder or similar logic
            const url = await storageService.uploadFile(file, `tenants/${tenantId}/ingredients/${Date.now()}_${file.name}`);
            setImage(url);
            showToast('Imagem enviada!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao enviar imagem', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const id = Date.now().toString();

        try {
            const newIngredient = {
                name, unit, costPerUnit: parseFloat(cost) || 0, currentStock: 0, minStock: 0, isActive: true, image
            };
            const result = await saveIngredient(newIngredient);

            showToast('Insumo criado com sucesso!', 'success');
            if (result?.id) onCreated?.(result.id);
            onClose();
        } catch (error) {
            showToast('Erro ao criar insumo.', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-in-up">
                <div className="bg-summo-primary p-5 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                        <Package size={20} /> Novo Insumo
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex justify-center mb-4">
                        <label className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden">
                            {isUploading ? <Loader2 className="animate-spin text-summo-primary" /> :
                                image ? <img src={image} className="w-full h-full object-cover" /> :
                                    <div className="text-center"><ImageIcon size={20} className="mx-auto text-gray-400" /><span className="text-[10px] text-gray-400 font-bold">FOTO</span></div>}
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                        </label>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nome do Insumo</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none font-bold text-gray-800"
                            placeholder="Ex: Queijo Muçarela"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Unidade</label>
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none font-bold text-gray-800"
                            >
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="l">l</option>
                                <option value="ml">ml</option>
                                <option value="un">un</option>
                                <option value="cx">cx</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Custo (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    className="w-full p-3 pl-8 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-summo-primary outline-none font-bold text-gray-800"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-summo-primary text-white rounded-2xl font-bold shadow-lg shadow-summo-primary/30 hover:bg-summo-dark transition flex items-center justify-center gap-2 mt-2"
                    >
                        <Save size={20} /> Criar e Adicionar
                    </button>
                </form>
            </div>
        </div>
    );
};
