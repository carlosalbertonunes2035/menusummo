import React, { useState, useMemo } from 'react';
import { Ingredient, StockMovementType, ShoppingListItem } from '../../../types';
import { useRecipesQuery } from '@/lib/react-query/queries/useRecipesQuery';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useStockQuery } from '@/lib/react-query/queries/useStockQuery';
import { useIngredientsQuery } from '@/lib/react-query/queries/useIngredientsQuery';
import { useDebounce } from '../../../lib/hooks';
import { searchMatch } from '../../../lib/utils';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from '@firebase/functions';
import { parseNFeXML } from '../../../services/nfeParser';
import { useInfiniteIngredients } from './queries';
import { useAuth } from '@/features/auth/context/AuthContext';

export type ModalType = 'ADD' | 'EDIT' | 'RESTOCK' | 'LOSS' | 'SHOPPING_ADD' | null;
export type TabType = 'OVERVIEW' | 'INVENTORY' | 'HISTORY' | 'SHOPPING';

export interface BulkItemCandidate {
    rawName: string;
    quantity: number;
    totalCost: number;
    unit?: string;
    matchedIngredientId: string;
}

export const useStock = () => {
    const { systemUser } = useAuth();
    const { tenantId } = useApp();
    const { showToast } = useToast();
    const { recipes } = useRecipesQuery(tenantId);

    // 1. Pagination State
    const {
        data: paginatedIngredients,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: ingredientsLoading
    } = useInfiniteIngredients(systemUser?.tenantId);

    const ingredients = useMemo(() => {
        return paginatedIngredients?.pages.flatMap(page => page.docs) || [];
    }, [paginatedIngredients]);

    // showToast removed
    const { movements: stockMovements, shoppingList, addMovement, saveShoppingItem, deleteShoppingItem } = useStockQuery(tenantId);
    const { saveIngredient, deleteIngredient } = useIngredientsQuery(tenantId);

    const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
    const [modalType, setModalType] = useState<ModalType>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [shoppingSearchTerm, setShoppingSearchTerm] = useState('');

    // Form States
    const [formData, setFormData] = useState({
        name: '', unit: 'kg', currentStock: '', minStock: '', costPerUnit: '', restockQty: '', restockTotalCost: '', lossReason: '', image: '',
        purchaseUnit: '', conversionFactor: '1', isBulkEntry: false
    });
    const [shoppingFormData, setShoppingFormData] = useState({ name: '', quantity: '1', unit: 'un', ingredientId: '' });

    // Bulk Import States
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [dragActive, setDragActive] = useState<string | null>(null);
    const [bulkItems, setBulkItems] = useState<BulkItemCandidate[]>([]);

    // --- Computed ---
    const selectedIngredient = useMemo(() => ingredients.find(i => i.id === selectedId), [ingredients, selectedId]);

    const filteredIngredients = useMemo(() =>
        ingredients.filter(ing => searchMatch(ing.name, debouncedSearch)),
        [ingredients, debouncedSearch]);

    const filteredIngredientsForShopping = useMemo(() => {
        if (!shoppingSearchTerm) return [];
        return ingredients.filter(ing => searchMatch(ing.name, shoppingSearchTerm));
    }, [ingredients, shoppingSearchTerm]);

    const costPreview = useMemo(() => {
        if (modalType !== 'RESTOCK' || !selectedIngredient) return null;
        const qty = Number(formData.restockQty);
        const totalCost = Number(formData.restockTotalCost);
        if (!qty || !totalCost) return null;

        const isBulk = formData.isBulkEntry;
        const actualQty = isBulk ? qty * (selectedIngredient.conversionFactor || 1) : qty;

        const oldTotalValue = selectedIngredient.currentStock * (selectedIngredient.costPerUnit || 0);
        const newTotalStock = selectedIngredient.currentStock + actualQty;
        const newWeightedCost = (oldTotalValue + totalCost) / newTotalStock;

        return { newCost: newWeightedCost };
    }, [modalType, selectedIngredient, formData.restockQty, formData.restockTotalCost]);

    // --- Actions ---
    const openAddModal = (initialName: string = '') => {
        setFormData({ name: initialName, unit: 'kg', currentStock: '', minStock: '', costPerUnit: '', restockQty: '', restockTotalCost: '', image: '', lossReason: '', purchaseUnit: '', conversionFactor: '1', isBulkEntry: false });
        setModalType('ADD');
    };

    const openEditModal = (ing: Ingredient) => {
        setFormData({
            name: ing.name,
            unit: ing.unit,
            currentStock: ing.currentStock.toString(),
            minStock: ing.minStock.toString(),
            costPerUnit: (ing.costPerUnit || 0).toString(),
            restockQty: '',
            restockTotalCost: '',
            lossReason: '',
            image: ing.image || '',
            purchaseUnit: ing.purchaseUnit || '',
            conversionFactor: (ing.conversionFactor || 1).toString(),
            isBulkEntry: false
        });
        setSelectedId(ing.id);
        setModalType('EDIT');
    };

    const openRestockModal = (ing: Ingredient) => {
        setFormData({
            ...formData,
            restockQty: '',
            restockTotalCost: '',
            isBulkEntry: false,
            purchaseUnit: ing.purchaseUnit || '',
            conversionFactor: (ing.conversionFactor || 1).toString()
        });
        setSelectedId(ing.id);
        setModalType('RESTOCK');
    };

    const openLossModal = (ing: Ingredient) => {
        setFormData({ ...formData, restockQty: '', lossReason: '' });
        setSelectedId(ing.id);
        setModalType('LOSS');
    };

    const openShoppingAdd = (ing?: Ingredient) => {
        if (ing) {
            setShoppingFormData({ name: ing.name, quantity: '1', unit: ing.unit, ingredientId: ing.id });
            setShoppingSearchTerm(ing.name);
        } else {
            setShoppingFormData({ name: '', quantity: '1', unit: 'un', ingredientId: '' });
            setShoppingSearchTerm('');
        }
        setModalType('SHOPPING_ADD');
    };

    const closeModal = () => {
        setModalType(null);
        setShoppingSearchTerm('');
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (modalType === 'SHOPPING_ADD') {
            if (!shoppingFormData.name) return;
            saveShoppingItem({
                name: shoppingFormData.name,
                quantity: parseFloat(shoppingFormData.quantity),
                unit: shoppingFormData.unit,
                checked: false,
                ingredientId: shoppingFormData.ingredientId || undefined
            });
        } else if (modalType === 'ADD') {
            if (!formData.name) return;
            saveIngredient({
                name: formData.name, unit: formData.unit,
                currentStock: Number(formData.currentStock), minStock: Number(formData.minStock),
                costPerUnit: Number(formData.costPerUnit), image: formData.image, isActive: true,
                purchaseUnit: formData.purchaseUnit, conversionFactor: Number(formData.conversionFactor)
            });
        } else if (modalType === 'EDIT' && selectedId) {
            saveIngredient({
                id: selectedId,
                name: formData.name, unit: formData.unit,
                currentStock: Number(formData.currentStock), minStock: Number(formData.minStock),
                costPerUnit: Number(formData.costPerUnit), image: formData.image,
                purchaseUnit: formData.purchaseUnit, conversionFactor: Number(formData.conversionFactor)
            });
        } else if (modalType === 'RESTOCK' && selectedId && selectedIngredient) {
            let qty = Number(formData.restockQty);
            const cost = Number(formData.restockTotalCost);

            if (formData.isBulkEntry) {
                qty = qty * (selectedIngredient.conversionFactor || 1);
            }

            saveIngredient({ id: selectedId, currentStock: selectedIngredient.currentStock + qty });
            addMovement({
                ingredientId: selectedId, ingredientName: selectedIngredient.name,
                type: StockMovementType.IN, quantity: qty, cost, date: new Date(),
                reason: formData.isBulkEntry ? `Entrada em Lote (${formData.restockQty} ${selectedIngredient.purchaseUnit})` : undefined
            });
            showToast('Estoque Atualizado', 'success');
        } else if (modalType === 'LOSS' && selectedId && selectedIngredient) {
            const qty = Number(formData.restockQty);
            saveIngredient({ id: selectedId, currentStock: selectedIngredient.currentStock - qty });
            addMovement({
                ingredientId: selectedId, ingredientName: selectedIngredient.name,
                type: StockMovementType.LOSS, quantity: -qty, cost: 0, reason: formData.lossReason, date: new Date()
            });
            showToast('Perda Registrada', 'error');
        }
        closeModal();
    };

    // --- Bulk Helpers ---
    const autoMatchItems = (items: any[]): BulkItemCandidate[] => {
        return items.map((item: any) => {
            const matchedIng = ingredients.find(ing => searchMatch(ing.name, item.rawName) || searchMatch(item.rawName, ing.name));
            return { rawName: item.rawName, quantity: item.quantity, totalCost: item.totalCost, unit: item.unit, matchedIngredientId: matchedIng ? matchedIng.id : "" };
        });
    };

    const processAiFile = async (file: File) => {
        setIsAnalyzing(true);
        setBulkItems([]); // Clear previous
        try {
            const { base64, mimeType } = await (window as any).compressImage(file, 1000);
            const analyzeReceiptFn = httpsCallable(functions, 'analyzeReceipt');
            // Ensure base64 is a proper Data URI if not already
            const dataUri = base64.startsWith('data:') ? base64 : `data:${mimeType};base64,${base64}`;
            const { data } = await analyzeReceiptFn({ fileUrl: dataUri, mimeType });
            setBulkItems(autoMatchItems(data as any[]));
            showToast("Leitura IA concluída!", 'success');
        } catch (error) { console.error(error); showToast("Erro ao analisar.", 'error'); }
        finally { setIsAnalyzing(false); }
    };

    const processXmlFile = async (file: File) => {
        setIsAnalyzing(true);
        setBulkItems([]);
        try {
            const items = await parseNFeXML(file);
            setBulkItems(autoMatchItems(items));
            showToast("XML processado!", 'success');
        } catch (error) { console.error(error); showToast("XML inválido.", 'error'); }
        finally { setIsAnalyzing(false); }
    };

    const confirmBulkImport = () => {
        let count = 0;
        bulkItems.forEach(item => {
            if (item.matchedIngredientId) {
                const ing = ingredients.find(i => i.id === item.matchedIngredientId);
                if (ing) {
                    saveIngredient({ id: ing.id, currentStock: ing.currentStock + item.quantity });
                    addMovement({
                        ingredientId: ing.id, ingredientName: ing.name,
                        type: StockMovementType.IN, quantity: item.quantity, cost: item.totalCost, date: new Date()
                    });
                    count++;
                }
            }
        });
        showToast(`${count} itens importados!`, 'success');
        setModalType(null);
        setBulkItems([]);
    };

    return {
        // State
        activeTab, setActiveTab,
        modalType, setModalType,
        selectedId, setSelectedId,
        searchTerm, setSearchTerm,
        shoppingSearchTerm, setShoppingSearchTerm,
        formData, setFormData,
        shoppingFormData, setShoppingFormData,
        isAnalyzing, bulkItems, setBulkItems, dragActive, setDragActive,
        recipes,

        // Data
        ingredients, stockMovements, shoppingList,
        filteredIngredients, filteredIngredientsForShopping,
        selectedIngredient, costPreview,

        // Pagination
        fetchNextPage, hasNextPage, isFetchingNextPage, ingredientsLoading,

        // Handlers
        openAddModal, openEditModal, openRestockModal, openLossModal, openShoppingAdd, closeModal, handleFormSubmit,
        processAiFile, processXmlFile, confirmBulkImport,
        saveIngredient, deleteIngredient, saveShoppingItem, deleteShoppingItem // Exposed new actions
    };
};
