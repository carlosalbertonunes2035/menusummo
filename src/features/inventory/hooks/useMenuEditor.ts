
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, ChannelConfig, SalesChannel, Ingredient } from '../../../types';
import { Recipe, RecipeIngredient } from '../../../types/recipe';
import { useData } from '../../../contexts/DataContext';
import { useApp } from '../../../contexts/AppContext';
import { db, functions } from '@/lib/firebase/client';
import { httpsCallable } from '@firebase/functions';
import { collection, doc } from '@firebase/firestore';
import { ProductSchema } from '../../../lib/schemas';
import { z } from 'zod';

export const useMenuEditor = () => {
    const { products, ingredients, recipes } = useData();
    const { handleAction, showToast } = useApp();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editData, setEditData] = useState<Partial<Product>>({});
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'OPTIONS' | 'ENGINEERING' | 'CHANNELS' | 'SEO'>('GENERAL');
    const [activeChannel, setActiveChannel] = useState<SalesChannel>('pos');
    const [newIngredientId, setNewIngredientId] = useState('');
    const [recipeEditData, setRecipeEditData] = useState<Partial<Recipe>>({});
    const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

    // Helpers
    const onUpdateProduct = useCallback(async (p: Partial<Product>): Promise<string | undefined> => {
        const result = await handleAction('products', p.id ? 'update' : 'add', p.id, p);
        return result;
    }, [handleAction]);
    const onDuplicateProduct = (p: Product) => handleAction('products', 'add', undefined, { ...p, name: p.name + ' (Cópia)' });

    useEffect(() => {
        if (selectedProduct) {
            setActiveChannel('pos');
            // Busca receita existente para este produto
            if (selectedProduct.id) {
                const existingRecipe = recipes.find(r => r.productId === selectedProduct.id);
                if (existingRecipe) {
                    setRecipeEditData(existingRecipe);
                } else {
                    setRecipeEditData({
                        ingredients: (selectedProduct.ingredients || []).map((i: { ingredientId: string; amount: number }) => ({
                            ingredientId: i.ingredientId,
                            quantity: i.amount,
                            unit: ingredients.find(inv => inv.id === i.ingredientId)?.unit || 'und'
                        })),
                        yield: 1,
                        yieldUnit: 'porção'
                    });
                }
            } else {
                setRecipeEditData({ ingredients: [], yield: 1, yieldUnit: 'porção' });
            }
        }
    }, [selectedProduct?.id, recipes, ingredients]);

    // Computed
    const currentEditingProduct = useMemo(() => {
        if (!selectedProduct) return null;
        const baseProduct = products.find(p => p.id === selectedProduct.id) || selectedProduct;
        const mergedData = { ...baseProduct, ...editData };

        let previewRealCostPerPorion = 0;

        if (mergedData.type === 'COMBO') {
            previewRealCostPerPorion = (mergedData.comboItems || []).reduce((acc: number, item: any) => {
                const subProduct = products.find(p => p.id === item.productId);
                return acc + (item.quantity * (subProduct?.cost || 0));
            }, 0);
        } else {
            const currentRecipeIngredients = recipeEditData.ingredients || [];
            const currentYield = recipeEditData.yield || 1;

            const previewRealCostAcrossYield = (currentRecipeIngredients).reduce((acc: number, item: RecipeIngredient) => {
                const ing = ingredients.find((i: Ingredient) => i.id === item.ingredientId);
                const subRecipe = recipes?.find((r: Recipe) => r.id === item.ingredientId);

                const costPerUnit = ing ? (ing.costPerUnit || ing.cost || 0) : ((subRecipe?.totalCost || 0) / (subRecipe?.yield || 1));
                return acc + (costPerUnit * item.quantity);
            }, 0);

            previewRealCostPerPorion = previewRealCostAcrossYield / currentYield;
        }

        const channelConfig = mergedData.channels.find(c => c.channel === activeChannel);
        const previewPrice = channelConfig?.price ?? 0;
        const previewMargin = previewPrice - previewRealCostPerPorion;
        const previewMarginPercent = previewPrice > 0 ? (previewMargin / previewPrice) * 100 : 0;

        return {
            ...mergedData,
            recipe: recipeEditData,
            realCost: previewRealCostPerPorion,
            margin: previewMargin,
            marginPercent: previewMarginPercent
        };
    }, [selectedProduct, editData, products, ingredients, recipes, activeChannel, recipeEditData]);

    // Detecção inteligente de mudanças
    const isDirty = useMemo(() => {
        if (!selectedProduct) return false;

        const productChanged = Object.keys(editData).length > 0 && Object.keys(editData).some(key => {
            const _key = key as keyof Product;
            return JSON.stringify(editData[_key]) !== JSON.stringify(selectedProduct[_key]);
        });

        // Safe retrieval of original recipe
        const foundRecipe = recipes.find(r => r.productId === selectedProduct.id);

        // Check draft status
        const isPersisted = products.some(p => p.id === selectedProduct?.id);
        const isDraftModified = !isPersisted && (editData.name !== 'Novo Produto' || (editData.cost || 0) > 0);

        // Recipe Dirty Logic:
        // If there is an existing recipe in DB, compare against it.
        // If NOT, we must compare against the "Inferred Recipe" derived from product.ingredients (Legacy support).
        let baselineRecipe: Partial<Recipe> = foundRecipe || {
            ingredients: (selectedProduct.ingredients || []).map((i: any) => ({
                ingredientId: i.ingredientId,
                quantity: i.amount,
                unit: ingredients.find(inv => inv.id === i.ingredientId)?.unit || 'und'
            })),
            yield: 1,
            yieldUnit: 'porção'
        };

        // Normalize for comparison (sort ingredients by ID to avoid order issues)
        const normalizeRecipe = (r: Partial<Recipe> | undefined) => {
            if (!r) return {};
            return {
                ...r,
                ingredients: (r.ingredients || []).map(i => ({ i: i.ingredientId, q: i.quantity })).sort((a, b) => a.i.localeCompare(b.i)),
                yield: r.yield,
                yieldUnit: r.yieldUnit
            };
        };

        const recipeChanged = JSON.stringify(normalizeRecipe(recipeEditData)) !== JSON.stringify(normalizeRecipe(baselineRecipe));

        return productChanged || recipeChanged || isDraftModified;
    }, [selectedProduct, editData, recipeEditData, recipes, products, ingredients]);

    // Actions
    const linkRecipe = (recipeId: string) => {
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
            setEditData((prev: Partial<Product>) => ({ ...prev, recipeId }));
            setRecipeEditData(recipe);
        }
    };

    const unlinkRecipe = () => {
        setEditData((prev: Partial<Product>) => ({ ...prev, recipeId: '' }));
        setRecipeEditData({ ingredients: [], yield: 1, yieldUnit: 'porção' });
    };

    const updateRecipeYield = (val: number) => {
        setRecipeEditData((prev: Partial<Recipe>) => ({ ...prev, yield: val }));
    };

    const handleSave = useCallback(async (): Promise<boolean> => {
        if (selectedProduct && currentEditingProduct) {
            const dataToSave = { ...editData };

            // Se mudamos a receita no editor, sugerimos salvar a receita primeiro ou sincronizar custo
            const finalProduct = {
                ...selectedProduct,
                ...dataToSave,
                cost: currentEditingProduct.realCost,
                // Garantimos que a lista de ingredientes no produto reflita a receita linkada
                ingredients: (recipeEditData.ingredients || [])
                    .map((ri: RecipeIngredient) => ({
                        ingredientId: ri.ingredientId,
                        amount: ri.quantity
                    }))
                    .filter((i: { ingredientId: string; amount: number }) => i.amount > 0)
            };

            try {
                ProductSchema.parse(finalProduct);
            } catch (err) {
                if (err instanceof z.ZodError) {
                    showToast(`Erro: ${err.errors[0].message}`, 'error');
                    return false;
                }
                showToast('Erro de Validação', 'error');
                return false;
            }

            try {
                const savedId = await onUpdateProduct(finalProduct);

                // Se houver alteração na receita (rendimento ou ingredientes), atualizamos a receita também
                if (recipeEditData.id) {
                    const recipeData: Partial<Recipe> = {
                        ...recipeEditData,
                        ingredients: (recipeEditData.ingredients || []).filter((i: RecipeIngredient) => i.quantity > 0),
                        totalCost: currentEditingProduct.realCost * (recipeEditData.yield || 1)
                    };
                    await handleAction('recipes', 'update', recipeEditData.id, recipeData);
                }

                showToast('Produto salvo com sucesso!', 'success');

                // CRITICAL FIX: Update state with the saved ID to prevent duplication on subsequent saves
                if (savedId && typeof savedId === 'string' && !selectedProduct.id) {
                    const updatedProduct = { ...finalProduct, id: savedId };
                    setSelectedProduct(updatedProduct);
                    setEditData(updatedProduct); // Sync edit data
                } else if (!selectedProduct.id) {
                    // Fallback if ID wasn't returned but operation succeeded (should not happen with fix)
                    setSelectedProduct(null);
                    setEditData({});
                    setRecipeEditData({});
                }
                return true;

            } catch (error) {
                showToast('Erro ao salvar.', 'error');
                return false;
            }
        }
        return false;
    }, [selectedProduct, currentEditingProduct, editData, recipeEditData, onUpdateProduct, handleAction, showToast, recipes]);

    const handleClose = useCallback(async (force?: boolean) => {
        if (!force && isDirty) {
            if (window.confirm("Deseja SALVAR as alterações antes de sair?\n\n[OK] = Salvar e Sair\n[Cancelar] = Sair sem Salvar (Descartar)")) {
                await handleSave();
                return;
            }
        }

        // Reset everything
        setSelectedProduct(null);
        setEditData({});
        setRecipeEditData({});
    }, [isDirty, handleSave, selectedProduct, editData]);

    const openEditor = (product: Product) => {
        if (selectedProduct && isDirty && !window.confirm("Descartar alterações do produto atual?")) return;
        setSelectedProduct(product);
        setEditData({});
        setRecipeEditData({});
        setActiveTab('GENERAL');
    };

    const handleOpenCreator = (initialCategory: string, initialType: 'SIMPLE' | 'COMBO' = 'SIMPLE') => {
        if (selectedProduct && isDirty && !window.confirm("Descartar alterações atuais?")) return;

        // Generate a real ID immediately so the product is "tracked"
        const newId = doc(collection(db, 'products')).id;

        const newProd: Product = {
            id: newId,
            name: 'Novo Produto',
            category: initialCategory !== 'Todos' ? initialCategory : 'Geral',
            cost: 0, tags: [], ingredients: [], optionGroupIds: [], type: initialType,
            channels: [
                { channel: 'pos', displayName: 'Novo Produto', price: 0, isAvailable: true },
                { channel: 'digital-menu', displayName: 'Novo Produto', price: 0, isAvailable: true },
                { channel: 'ifood', displayName: 'Novo Produto (iFood)', price: 0, isAvailable: false }
            ]
        };
        setSelectedProduct(newProd);
        setEditData(newProd);
        setRecipeEditData({ ingredients: [], yield: 1, yieldUnit: 'porção' });
        setActiveTab('GENERAL');
    };

    const toggleAvailability = async (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();

        // New Logic: Toggle Global Status (ACTIVE vs PAUSED)
        // This preserves the individual channel configuration (isAvailable flags).

        const currentStatus = product.status || 'ACTIVE'; // Default to ACTIVE if undefined
        const isCurrentlyPaused = currentStatus === 'PAUSED';

        const newStatus = isCurrentlyPaused ? 'ACTIVE' : 'PAUSED';
        const toastMessage = isCurrentlyPaused ? 'Produto ativado (Estado anterior restaurado).' : 'Produto pausado globalmente.';

        try {
            // We only update the status field. 
            // The UI must respect this status to consider the product "Offline".
            await onUpdateProduct({ id: product.id, status: newStatus });
            showToast(toastMessage, 'success');
        } catch (err) {
            console.error(err);
            showToast('Erro ao alterar status.', 'error');
        }
    };

    const addIngredientToRecipe = (ingredientId?: string) => {
        const idToAdd = ingredientId || newIngredientId;
        if (!idToAdd) return;
        const currentIngredients = recipeEditData.ingredients || [];
        if (currentIngredients.find((i: RecipeIngredient) => i.ingredientId === idToAdd)) return;
        const ing = ingredients.find(i => i.id === idToAdd);
        const recipe = recipes.find(r => r.id === idToAdd);
        const unit = ing ? ing.unit : recipe?.yieldUnit || 'und';
        setRecipeEditData((prev: Partial<Recipe>) => ({
            ...prev,
            ingredients: [...currentIngredients, { ingredientId: idToAdd, quantity: 1, unit }]
        }));
        setNewIngredientId('');
    };

    const removeIngredient = (index: number) => {
        const currentIngredients = recipeEditData.ingredients || [];
        const updated = [...currentIngredients];
        updated.splice(index, 1);
        setRecipeEditData((prev: Partial<Recipe>) => ({ ...prev, ingredients: updated }));
    };

    const updateIngredientAmount = (index: number, val: number) => {
        const currentIngredients = recipeEditData.ingredients || [];
        const updated = [...currentIngredients];
        updated[index] = { ...updated[index], quantity: val };
        setRecipeEditData((prev: Partial<Recipe>) => ({ ...prev, ingredients: updated }));
    };

    const handleGenerateCopy = async () => {
        if (!currentEditingProduct) return;
        setIsGeneratingCopy(true);
        try {
            const ingList = currentEditingProduct.ingredients.map(i => {
                const ing = ingredients.find(inv => inv.id === i.ingredientId);
                return ing?.name;
            }).join(', ');
            const generateMarketingCopyFn = httpsCallable(functions, 'generateMarketingCopy');
            const { data } = await generateMarketingCopyFn({
                productName: currentEditingProduct.name,
                ingredients: ingList,
                restaurantName: "Summo Demo" // Should ideally come from settings
            });
            const result = data as any;
            handleChannelDataChange('description', result.ifoodDescription, 'digital-menu'); // Using ifood desc as generic
        } catch (e) { alert("Erro na IA"); } finally { setIsGeneratingCopy(false); }
    };

    const handleTagToggle = (tag: string) => {
        const currentTags = editData.tags || selectedProduct?.tags || [];
        if (currentTags.includes(tag)) {
            setEditData(prev => ({ ...prev, tags: currentTags.filter(t => t !== tag) }));
        } else {
            if (currentTags.length >= 3) {
                showToast("Máximo de 3 tags permitido.", "error");
                return;
            }
            setEditData(prev => ({ ...prev, tags: [...currentTags, tag] }));
        }
    };

    // Updated to accept explicit channel target
    const handleChannelDataChange = (field: keyof Omit<ChannelConfig, 'channel'>, value: any, targetChannel?: SalesChannel) => {
        const channelToUpdate = targetChannel || activeChannel;
        const currentChannels = editData.channels || selectedProduct?.channels || [];
        const channelIndex = currentChannels.findIndex(c => c.channel === channelToUpdate);
        if (channelIndex === -1) return;

        const newChannels = [...currentChannels];
        const newChannelConfig = { ...newChannels[channelIndex], [field]: value };
        newChannels[channelIndex] = newChannelConfig;

        setEditData(prev => ({ ...prev, channels: newChannels }));
    };

    const linkOptionGroup = (groupId: string) => {
        const currentIds = editData.optionGroupIds || selectedProduct?.optionGroupIds || [];
        if (currentIds.includes(groupId)) {
            // Toggle OFF (Unlink)
            setEditData(prev => ({ ...prev, optionGroupIds: currentIds.filter(id => id !== groupId) }));
        } else {
            // Toggle ON (Link)
            setEditData(prev => ({ ...prev, optionGroupIds: [...currentIds, groupId] }));
        }
    };

    const unlinkOptionGroup = (groupId: string) => {
        const currentIds = editData.optionGroupIds || selectedProduct?.optionGroupIds || [];
        setEditData(prev => ({ ...prev, optionGroupIds: currentIds.filter(id => id !== groupId) }));
    };

    const handleDelete = useCallback(async () => {
        console.log('[useMenuEditor] handleDelete initiated');
        if (!selectedProduct || !selectedProduct.id) {
            console.warn('[useMenuEditor] Unexpected state: Missing product ID');
            return;
        }

        try {
            console.log(`[useMenuEditor] Deleting product ${selectedProduct.id} ("${selectedProduct.name}")`);

            // Always attempt DB delete (Idempotent: if it's a draft not in DB, this is a no-op 200 OK)
            await handleAction('products', 'delete', selectedProduct.id);

            console.log('[useMenuEditor] Delete/Discard successful');
            showToast('Produto excluído/descartado.', 'info');
            setSelectedProduct(null);
            setEditData({});
            setRecipeEditData({});
        } catch (error) {
            console.error('[useMenuEditor] Delete failed:', error);
            showToast('Erro ao excluir produto.', 'error');
        }
    }, [selectedProduct, handleAction, showToast]);

    return {
        selectedProduct, editData, setEditData, activeTab, setActiveTab,
        currentEditingProduct, isDirty,
        newIngredientId, setNewIngredientId, isGeneratingCopy,
        openEditor, handleOpenCreator, handleClose, handleSave, handleDelete,
        toggleAvailability, onDuplicateProduct,
        addIngredientToRecipe, removeIngredient, updateIngredientAmount, updateRecipeYield,
        handleGenerateCopy, handleTagToggle,
        activeChannel, setActiveChannel, handleChannelDataChange,
        linkOptionGroup, unlinkOptionGroup,
        linkRecipe, unlinkRecipe
    };
};
