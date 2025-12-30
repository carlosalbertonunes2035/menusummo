
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, ChannelConfig, SalesChannel, Ingredient } from '../../../types';
import { Recipe, RecipeIngredient } from '../../../types/recipe';
import { useIngredientsQuery } from '@/lib/react-query/queries/useIngredientsQuery';
import { useApp } from '../../../contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { db, functions } from '@/lib/firebase/client';
import { useAuth } from '../../auth/context/AuthContext';
import { httpsCallable } from '@firebase/functions';
import { collection, doc } from '@firebase/firestore';
import { ProductSchema } from '../../../lib/schemas';
import { useProductsQuery } from '@/lib/react-query/queries/useProductsQuery';
import { useRecipesQuery } from '@/lib/react-query/queries/useRecipesQuery';
import { z } from 'zod';

export const useMenuEditor = () => {
    const { tenantId } = useApp();
    const { systemUser } = useAuth();
    const { showToast } = useToast();
    const { ingredients, saveIngredient } = useIngredientsQuery(tenantId);

    const { products, saveProduct, deleteProduct } = useProductsQuery(tenantId);
    const { recipes, saveRecipe, deleteRecipe } = useRecipesQuery(tenantId);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editData, setEditData] = useState<Partial<Product>>({});
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'OPTIONS' | 'ENGINEERING' | 'CHANNELS' | 'SEO'>('GENERAL');
    const [activeChannel, setActiveChannel] = useState<SalesChannel>('pos');
    const [newIngredientId, setNewIngredientId] = useState('');
    const [recipeEditData, setRecipeEditData] = useState<Partial<Recipe> | null>(null);
    const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

    // Helpers
    const onUpdateProduct = useCallback(async (p: Partial<Product>): Promise<string | undefined> => {
        const result = await saveProduct(p);
        return result.id;
    }, [saveProduct]);

    const onDuplicateProduct = async (p: Product) => {
        await saveProduct({ ...p, id: undefined, name: p.name + ' (Cópia)' });
        showToast('Produto duplicado!', 'success');
    };

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
            const currentRecipeIngredients = recipeEditData?.ingredients || [];
            const currentYield = recipeEditData?.yield || 1;

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
            recipe: recipeEditData || {}, // Fallback for UI
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
        // Ignore if recipeEditData is not initialized yet (null)
        if (!recipeEditData) {
            return productChanged || isDraftModified;
        }

        // If there is an existing recipe in DB, compare against it.
        // If NOT, we must compare against the "Inferred Recipe" derived from product.ingredients (Legacy support).
        const baselineRecipe: Partial<Recipe> = foundRecipe || {
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

        // Ignore recipe change if both are essentially empty defaults
        if (recipeChanged) {
            const isBaseEmpty = (baselineRecipe.ingredients?.length || 0) === 0;
            const isCurrEmpty = (recipeEditData.ingredients?.length || 0) === 0;
            if (isBaseEmpty && isCurrEmpty) return productChanged || isDraftModified;
        }

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
        setRecipeEditData((prev: Partial<Recipe> | null) => ({ ...(prev || {}), yield: val }));
    };

    const handleSave = useCallback(async (): Promise<boolean> => {
        if (selectedProduct && currentEditingProduct) {
            const dataToSave = { ...editData };
            const currentRecipeData = recipeEditData || { ingredients: [], yield: 1, yieldUnit: 'porção' }; // Fallback

            // Se mudamos a receita no editor, sugerimos salvar a receita primeiro ou sincronizar custo
            const finalProduct = {
                ...selectedProduct,
                ...dataToSave,
                cost: currentEditingProduct.realCost,
                ownerUid: systemUser?.id || '',
                tenantId: tenantId,
                // Garantimos que a lista de ingredientes no produto reflita a receita linkada
                ingredients: (currentRecipeData.ingredients || [])
                    .map((ri: RecipeIngredient) => ({
                        ingredientId: ri.ingredientId,
                        amount: ri.quantity
                    }))
                    .filter((i: { ingredientId: string; amount: number }) => i.amount > 0)
            };

            // AI AUTO-CREATION: Resolve placeholders and create missing ingredients
            try {
                const resolvedIngredients = await Promise.all(finalProduct.ingredients.map(async (i) => {
                    if (typeof i.ingredientId === 'string' && i.ingredientId.startsWith('NEW_')) {
                        const name = i.ingredientId.replace('NEW_', '');
                        const existing = ingredients.find(inv => inv.name.toLowerCase() === name.toLowerCase());
                        if (existing) return { ...i, ingredientId: existing.id };

                        // Find original AI metadata from recipeEditData
                        const aiMeta = (currentRecipeData.ingredients || []).find((ri: any) => ri.ingredientId === i.ingredientId) as any;

                        const result = await saveIngredient({
                            name,
                            unit: aiMeta?.unit || 'und',
                            cost: aiMeta?.cost || 0,
                            ownerUid: systemUser?.id || '',
                            tenantId
                        });
                        return { ...i, ingredientId: result.id };
                    }
                    return i;
                }));

                finalProduct.ingredients = resolvedIngredients as any;

                // Also update the recipe data we might save later
                currentRecipeData.ingredients = currentRecipeData.ingredients?.map((ri: any) => {
                    const resolved = (resolvedIngredients as any[]).find(prev => prev.name === ri.name || prev.ingredientId.includes(ri.name));
                    if (resolved) return { ...ri, ingredientId: resolved.ingredientId };
                    return ri;
                });

            } catch (err) {
                console.error("AI Auto-create failed:", err);
                showToast('Erro ao criar insumos da IA.', 'error');
                return false;
            }

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
                if (currentRecipeData.id) {
                    const recipeData: Partial<Recipe> = {
                        ...currentRecipeData,
                        ingredients: (currentRecipeData.ingredients || []).filter((i: RecipeIngredient) => i.quantity > 0),
                        totalCost: currentEditingProduct.realCost * (currentRecipeData.yield || 1)
                    };
                    await saveRecipe(recipeData);
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
                    setRecipeEditData(null);
                }
                return true;

            } catch (error) {
                showToast('Erro ao salvar.', 'error');
                return false;
            }
        }
        return false;
    }, [selectedProduct, currentEditingProduct, editData, recipeEditData, onUpdateProduct, saveRecipe, showToast, recipes]);

    const handleClose = useCallback(async (force?: boolean) => {
        if (!force && isDirty) {
            if (window.confirm("Deseja SALVAR as alterações antes de sair?\n\n[OK] = Salvar e Sair\n[Cancelar] = Sair sem Salvar (Descartar)")) {
                const saved = await handleSave();
                if (!saved) return; // If save failed, stay open to retry
            }
        }

        // Reset everything (Success path for Save OR Discard path)
        setSelectedProduct(null);
        setEditData({});
        setRecipeEditData(null);
    }, [isDirty, handleSave, selectedProduct, editData]);

    const openEditor = (product: Product) => {
        if (selectedProduct && isDirty && !window.confirm("Descartar alterações do produto atual?")) return;
        setSelectedProduct(product);
        setEditData({});
        setRecipeEditData(null); // Wait for useEffect to load it
        setActiveTab('GENERAL');
    };

    const handleOpenCreator = (initialCategory: string, initialType: 'SIMPLE' | 'COMBO' = 'SIMPLE') => {
        if (selectedProduct && isDirty && !window.confirm("Descartar alterações atuais?")) return;

        // Generate a real ID immediately so the product is "tracked"
        const newId = doc(collection(db, 'products')).id;

        const newProd: Product = {
            id: newId,
            ownerUid: systemUser?.id || '',
            tenantId: tenantId,
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

        // Ensure initialized
        const currentData = recipeEditData || { ingredients: [], yield: 1, yieldUnit: 'porção' };

        const currentIngredients = currentData.ingredients || [];
        if (currentIngredients.find((i: RecipeIngredient) => i.ingredientId === idToAdd)) return;

        const ing = ingredients.find(i => i.id === idToAdd);
        const recipe = recipes.find(r => r.id === idToAdd);
        const unit = ing ? ing.unit : recipe?.yieldUnit || 'und';

        setRecipeEditData({
            ...currentData,
            ingredients: [...currentIngredients, { ingredientId: idToAdd, quantity: 1, unit }]
        });
        setNewIngredientId('');
    };

    const removeIngredient = (index: number) => {
        if (!recipeEditData) return;
        const currentIngredients = recipeEditData.ingredients || [];
        const updated = [...currentIngredients];
        updated.splice(index, 1);
        setRecipeEditData((prev: Partial<Recipe> | null) => ({ ...(prev || {}), ingredients: updated }));
    };

    const updateIngredientAmount = (index: number, val: number) => {
        if (!recipeEditData) return;
        const currentIngredients = recipeEditData.ingredients || [];
        const updated = [...currentIngredients];
        updated[index] = { ...updated[index], quantity: val };
        setRecipeEditData((prev: Partial<Recipe> | null) => ({ ...(prev || {}), ingredients: updated }));
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

            await deleteProduct(selectedProduct.id);

            console.log('[useMenuEditor] Delete/Discard successful');
            showToast('Produto excluído/descartado.', 'info');
            setSelectedProduct(null);
            setEditData({});
            setRecipeEditData({});
        } catch (error) {
            console.error('[useMenuEditor] Delete failed:', error);
            showToast('Erro ao excluir produto.', 'error');
        }
    }, [selectedProduct, deleteProduct, showToast]);

    // Simplified Discard
    const discardChanges = useCallback(() => {
        handleClose(true); // Force close
    }, [handleClose]);

    const calculateComboCost = useCallback((items: any[]) => {
        return items.reduce((acc, item) => {
            const childProduct = products.find(p => p.id === item.productId);
            // Use realCost (calculated from recipe) or fallback to cost field
            const productCost = childProduct?.realCost || childProduct?.cost || 0;
            return acc + (productCost * item.quantity);
        }, 0);
    }, [products]);

    const handleComboUpdate = useCallback((comboItems: any[]) => {
        const totalCost = calculateComboCost(comboItems);

        setEditData(prev => ({
            ...prev,
            comboItems,
            cost: totalCost,
            // Combos inherit cost from children, so realCost is same as cost
            realCost: totalCost,
            recipeId: undefined,
        }));
    }, [calculateComboCost, setEditData]);

    return {
        selectedProduct, editData, setEditData, activeTab, setActiveTab,
        currentEditingProduct, isDirty,
        newIngredientId, setNewIngredientId, isGeneratingCopy,
        openEditor, handleOpenCreator, handleClose, handleSave, handleDelete, discardChanges,
        toggleAvailability, onDuplicateProduct,
        addIngredientToRecipe, removeIngredient, updateIngredientAmount, updateRecipeYield,
        handleGenerateCopy, handleTagToggle,
        activeChannel, setActiveChannel, handleChannelDataChange,
        linkOptionGroup, unlinkOptionGroup,
        linkRecipe, unlinkRecipe,
        handleComboUpdate
    };
};
