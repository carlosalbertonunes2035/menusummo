
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { useApp } from '@/contexts/AppContext';
import { GripVertical, Save, Plus, Info, Image as ImageIcon, Loader2, Upload, ChevronUp, ChevronDown } from 'lucide-react';
import { useMenuEditor } from '@/features/inventory/hooks/useMenuEditor';
import { storageService } from '@/lib/firebase/storageService';
import ProductEditor from '@/features/inventory/components/menu/ProductEditor';

interface CategoryManagerProps {
    localSettings: any;
    updateLocalSettings: (newSettings: any) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ localSettings, updateLocalSettings }) => {
    const { products } = useData();
    const { handleAction, showToast } = useApp();
    const menuEditorLogic = useMenuEditor();

    const [orderedCategories, setOrderedCategories] = useState<string[]>([]);
    const [categoryImages, setCategoryImages] = useState<Record<string, string>>(localSettings.digitalMenu?.categoryImages || {});
    const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
    const [draggingOverCategory, setDraggingOverCategory] = useState<string | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        const allCategories = Array.from(new Set(products.map(p => p.category)));
        const settingsOrder = localSettings.interface?.categoryOrder || [];

        // Sync category images from localSettings
        setCategoryImages(localSettings.digitalMenu?.categoryImages || {});

        const sorted = [...settingsOrder];
        allCategories.forEach(cat => {
            if (!sorted.includes(cat)) {
                sorted.push(cat);
            }
        });

        const activeSorted = sorted.filter(c => allCategories.includes(c));

        setOrderedCategories(activeSorted);
    }, [products, localSettings.interface?.categoryOrder, localSettings.digitalMenu?.categoryImages]);

    const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
        const _categories = [...orderedCategories];
        const newIndex = direction === 'UP' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= _categories.length) return;

        const [movedItem] = _categories.splice(index, 1);
        _categories.splice(newIndex, 0, movedItem);

        setOrderedCategories(_categories);
        updateLocalSettings({
            interface: {
                ...localSettings.interface,
                categoryOrder: _categories
            }
        });
    };

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;

        const _categories = [...orderedCategories];
        const draggedItemContent = _categories.splice(dragItem.current, 1)[0];
        _categories.splice(dragOverItem.current, 0, draggedItemContent);

        dragItem.current = null;
        dragOverItem.current = null;

        setOrderedCategories(_categories);
        updateLocalSettings({
            interface: {
                ...localSettings.interface,
                categoryOrder: _categories
            }
        });
    };

    const handleImageUpload = async (category: string, file: File) => {
        if (!file) return;

        try {
            setUploadingCategory(category);
            const tenantId = localSettings.storefront?.slug || 'default';
            const path = `tenants/${tenantId}/categories/${category}_${Date.now()}`;
            const url = await storageService.uploadFile(file, path);


            const updatedCategories = {
                ...(localSettings.digitalMenu?.categories || {}),
                [category]: {
                    ...(localSettings.digitalMenu?.categories?.[category] || {}),
                    image: url,
                    active: true // Ensure it's active by default if setting image
                }
            };

            const newImages = { ...categoryImages, [category]: url };
            setCategoryImages(newImages); // Keep local state sync for UI

            updateLocalSettings({
                digitalMenu: {
                    ...localSettings.digitalMenu,
                    categories: updatedCategories,
                    categoryImages: newImages // Keep legacy for fallback
                }
            });
            showToast(`Imagem da categoria "${category}" atualizada!`, 'success');
        } catch (error) {
            console.error('Error uploading category image:', error);
            showToast('Erro ao fazer upload da imagem.', 'error');
        } finally {
            setUploadingCategory(null);
        }
    };

    const handleRenameCategory = async (oldName: string, newName: string) => {
        try {
            const productsToUpdate = products.filter(p => {
                const channel = p.channels.find(c => c.channel === 'digital-menu');
                const currentCat = (channel?.category || p.category).trim();
                return currentCat === oldName;
            });

            if (productsToUpdate.length === 0) return;

            showToast(`Renomeando ${productsToUpdate.length} produtos...`, 'info');

            // Update each product one by one
            for (const product of productsToUpdate) {
                const existingChannels = [...product.channels];
                const channelIndex = existingChannels.findIndex(c => c.channel === 'digital-menu');

                if (channelIndex !== -1) {
                    existingChannels[channelIndex] = {
                        ...existingChannels[channelIndex],
                        category: newName
                    };
                } else {
                    existingChannels.push({
                        channel: 'digital-menu',
                        category: newName,
                        price: product.cost * 1.5,
                        isAvailable: true
                    });
                }

                await handleAction('products', 'update', product.id, {
                    channels: existingChannels
                });
            }

            // Also update the order in settings if it exists
            const settingsOrder = localSettings.interface?.categoryOrder || [];
            if (settingsOrder.includes(oldName)) {
                const newOrder = settingsOrder.map((c: string) => c === oldName ? newName : c);
                updateLocalSettings({
                    interface: {
                        ...localSettings.interface,
                        categoryOrder: newOrder
                    }
                });
            }

            // Update images if exists
            if (localSettings.digitalMenu?.categories?.[oldName]) {
                const catConfig = localSettings.digitalMenu.categories[oldName];
                updateLocalSettings({
                    digitalMenu: {
                        ...localSettings.digitalMenu,
                        categories: {
                            ...localSettings.digitalMenu.categories,
                            [newName]: catConfig,
                            // We don't delete the old key here to avoid breaking in-memory renders, 
                            // the sync will naturally move away from it.
                        }
                    }
                });
            }

            showToast(`Categoria renomeada com sucesso!`, 'success');
        } catch (error) {
            console.error('Error renaming category:', error);
            showToast('Erro ao renomear categoria.', 'error');
        }
    };

    // handleSave removed - global save used instead

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Info Box about Categories */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 flex items-start gap-3">
                <Info className="text-yellow-600 dark:text-yellow-500 mt-1 flex-shrink-0" size={20} />
                <div>
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-400 text-sm">Como criar novas categorias?</h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        As categorias são criadas automaticamente quando você cadastra um produto.
                        Para adicionar uma nova seção (ex: "Sobremesas"), clique em "Novo Produto" e digite o nome da categoria desejada.
                    </p>
                </div>
                <button
                    onClick={() => menuEditorLogic.handleOpenCreator('Nova Categoria')}
                    className="ml-auto bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-200 dark:hover:bg-yellow-700 transition whitespace-nowrap"
                >
                    <Plus size={14} className="inline mr-1" /> Criar Produto
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Organização Visual</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Arraste para definir a ordem de exibição no cardápio. (Salvamento Global)</p>
                </div>
                <div className="p-4 space-y-2">
                    {orderedCategories.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                            <p>Nenhuma categoria encontrada.</p>
                            <p className="text-xs">Cadastre produtos para começar.</p>
                        </div>
                    ) : orderedCategories.map((cat, index) => (
                        <div
                            key={cat}
                            draggable
                            onDragStart={() => dragItem.current = index}
                            onDragEnter={() => dragOverItem.current = index}
                            onDragEnd={handleSort}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.types.includes('Files')) {
                                    setDraggingOverCategory(cat);
                                }
                            }}
                            onDragLeave={() => setDraggingOverCategory(null)}
                            onDrop={async (e) => {
                                e.preventDefault();
                                setDraggingOverCategory(null);
                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                    const file = e.dataTransfer.files[0];
                                    if (file.type.startsWith('image/')) {
                                        handleImageUpload(cat, file);
                                    } else {
                                        showToast('Por favor, envie apenas imagens.', 'error');
                                    }
                                }
                            }}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all group shrink-0 ${draggingOverCategory === cat
                                ? 'border-summo-primary bg-summo-bg scale-[1.02] shadow-lg z-10'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                                } cursor-grab active:cursor-grabbing hover:border-summo-primary/50 relative overflow-hidden`}
                        >
                            {draggingOverCategory === cat && (
                                <div className="absolute inset-0 bg-summo-primary/5 flex items-center justify-center backdrop-blur-[1px] pointer-events-none">
                                    <div className="flex flex-col items-center gap-2 text-summo-primary animate-bounce">
                                        <Plus size={32} />
                                        <span className="text-[10px] font-black uppercase">Solte para Upload</span>
                                    </div>
                                </div>
                            )}
                            <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-400 group-hover:text-summo-primary cursor-grab">
                                <GripVertical size={20} />
                            </div>

                            {/* Category Image - Now Circular to match Public Menu (Exact 64px) */}
                            <div className="relative group/img h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                                {uploadingCategory === cat ? (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                                        <Loader2 size={24} className="text-summo-primary animate-spin" />
                                    </div>
                                ) : categoryImages[cat] ? (
                                    <img src={categoryImages[cat]} alt={cat} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs text-center p-1">
                                        {cat.charAt(0)}
                                    </div>
                                )}

                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    {uploadingCategory === cat ? (
                                        <Loader2 size={16} className="text-white animate-spin" />
                                    ) : (
                                        <Upload size={16} className="text-white" />
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleImageUpload(cat, file);
                                        }}
                                        disabled={!!uploadingCategory}
                                    />
                                </label>
                            </div>

                            <div className="flex flex-col">
                                <span className="font-bold text-slate-700 dark:text-slate-200">{cat}</span>
                                <button
                                    onClick={() => {
                                        const newName = window.prompt(`Renomear categoria "${cat}" na Vitrine Digital?`, cat);
                                        if (newName && newName !== cat) {
                                            handleRenameCategory(cat, newName);
                                        }
                                    }}
                                    className="text-[10px] text-summo-primary font-bold hover:underline text-left"
                                >
                                    Renomear na Vitrine
                                </button>
                            </div>

                            <div className="ml-auto flex items-center gap-1">
                                <span className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded mr-2 hidden sm:inline-block">
                                    {products.filter(p => {
                                        const channel = p.channels.find(c => c.channel === 'digital-menu');
                                        return (channel?.category || p.category).trim() === cat;
                                    }).length} itens
                                </span>

                                {/* Touch Sorting Buttons */}
                                <div className="flex flex-col sm:flex-row gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMove(index, 'UP'); }}
                                        disabled={index === 0}
                                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-summo-primary hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-500"
                                        title="Mover para cima"
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMove(index, 'DOWN'); }}
                                        disabled={index === orderedCategories.length - 1}
                                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-summo-primary hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-500"
                                        title="Mover para baixo"
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Product Editor Modal (Hidden but accessible via the button) */}
            <ProductEditor logic={menuEditorLogic} />
        </div>
    );
};

export default CategoryManager;
