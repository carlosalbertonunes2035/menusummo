
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, ChannelConfig, SalesChannel, Ingredient } from '../../../types';
import { Recipe, RecipeIngredient } from '../../../types/recipe';
import { useData } from '../../../contexts/DataContext';
import { useApp } from '../../../contexts/AppContext';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from '@firebase/functions';
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
    const hasChanges = useMemo(() => {
        if (!selectedProduct) return false;

        const productChanged = Object.keys(editData).length > 0 && Object.keys(editData).some(key => {
            const _key = key as keyof Product;
            return JSON.stringify(editData[_key]) !== JSON.stringify(selectedProduct[_key]);
        });

        const originalRecipe = recipes.find(r => r.productId === selectedProduct.id);
        const recipeChanged = JSON.stringify(recipeEditData) !== JSON.stringify(originalRecipe || { ingredients: [], yield: 1, yieldUnit: 'porção' });

        return productChanged || recipeChanged;
    }, [selectedProduct, editData, recipeEditData, recipes]);

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

    const handleSave = useCallback(async () => {
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
                    return;
                }
                showToast('Erro de Validação', 'error');
                return;
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

            } catch (error) {
                showToast('Erro ao salvar.', 'error');
            }
        }
    }, [selectedProduct, currentEditingProduct, editData, recipeEditData, onUpdateProduct, handleAction, showToast, recipes]);

    const handleClose = useCallback(async () => {
        if (hasChanges) {
            if (window.confirm("Você realizou alterações no produto.\n\nDeseja SALVAR as mudanças antes de sair?\n\n[OK] = Salvar e Fechar\n[Cancelar] = Descartar alterações e Fechar")) {
                await handleSave();
            }
        }
        setSelectedProduct(null);
        setEditData({});
        setRecipeEditData({});
    }, [hasChanges, handleSave]);

    const openEditor = (product: Product) => {
        if (selectedProduct && hasChanges && !window.confirm("Descartar alterações do produto atual?")) return;
        setSelectedProduct(product);
        setEditData({});
        setRecipeEditData({});
        setActiveTab('GENERAL');
    };

    const handleOpenCreator = (initialCategory: string, initialType: 'SIMPLE' | 'COMBO' = 'SIMPLE') => {
        if (selectedProduct && hasChanges && !window.confirm("Descartar alterações atuais?")) return;
        const newProd: Product = {
            id: '', name: 'Novo Produto', category: initialCategory !== 'Todos' ? initialCategory : 'Geral',
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

    const toggleAvailability = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        const newChannels = product.channels.map(c => ({ ...c, isAvailable: !c.isAvailable }));
        onUpdateProduct({ id: product.id, channels: newChannels });
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
        if (!currentIds.includes(groupId)) {
            setEditData(prev => ({ ...prev, optionGroupIds: [...currentIds, groupId] }));
        }
    };

    const unlinkOptionGroup = (groupId: string) => {
        const currentIds = editData.optionGroupIds || selectedProduct?.optionGroupIds || [];
        setEditData(prev => ({ ...prev, optionGroupIds: currentIds.filter(id => id !== groupId) }));
    };

    const handleDelete = useCallback(async () => {
        if (!selectedProduct || !selectedProduct.id) return;

        if (window.confirm(`Tem certeza que deseja EXCLUIR o produto "${selectedProduct.name}"?\n\nEssa ação não pode ser desfeita.`)) {
            try {
                await handleAction('products', 'delete', selectedProduct.id);
                showToast('Produto excluído com sucesso.', 'info');
                setSelectedProduct(null);
                setEditData({});
                setRecipeEditData({});
            } catch (error) {
                console.error(error);
                showToast('Erro ao excluir produto.', 'error');
            }
        }
    }, [selectedProduct, handleAction, showToast]);

    return {
        selectedProduct, editData, setEditData, activeTab, setActiveTab,
        currentEditingProduct, hasChanges,
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
