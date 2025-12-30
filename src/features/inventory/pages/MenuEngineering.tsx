
import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, LayoutTemplate, Loader2, Import, Wand2
} from 'lucide-react';
import { searchMatch } from '../../../lib/utils';
import { useApp } from '../../../contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '../../auth/context/AuthContext';
import { useMenuEditor } from '../hooks/useMenuEditor';
import ErrorBoundary from '../../../components/ui/ErrorBoundary';
import ProductEditor from '../components/menu/ProductEditor';
import MenuImportModal from '../components/menu/MenuImportModal';
import { collection, query, orderBy, limit, onSnapshot, deleteDoc, doc } from '@firebase/firestore';
import { db } from '../../../lib/firebase/client';
import { useInfiniteProducts, useIngredients } from '../hooks/queries';
import { useInView } from 'react-intersection-observer';
import { MenuProductCard } from '../components/menu/MenuProductCard';

const MenuEngineering: React.FC = () => {
    // Hoist hooks
    const { systemUser } = useAuth();
    const { showToast } = useToast();
    const { data: ingredients = [] } = useIngredients(systemUser?.tenantId);

    // 1. Pagination State
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: paginatedData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: productsLoading
    } = useInfiniteProducts(systemUser?.tenantId, selectedCategory);

    const { ref: loadMoreRef, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const products = useMemo(() => {
        return paginatedData?.pages.flatMap(page => page.docs) || [];
    }, [paginatedData]);

    const menuEditorLogic = useMenuEditor();
    const { openEditor, handleOpenCreator, toggleAvailability } = menuEditorLogic;

    // ... existing state ...
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [activeJob, setActiveJob] = useState<any>(null); // New State

    // 1. Listen for Active Jobs
    const [ignoredJobIds, setIgnoredJobIds] = useState<Set<string>>(new Set());

    React.useEffect(() => {
        if (!systemUser?.tenantId) return;

        const jobsRef = collection(db, `tenants/${systemUser.tenantId}/import_jobs`);
        // Limit 5 to find recent ones, then pick the latest valid one
        const q = query(jobsRef, orderBy('createdAt', 'desc'), limit(1));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setActiveJob(null);
                return;
            }

            const latestJob = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;

            // STATUS CHECK:
            // 1. If completed (100%), we don't show the loader anymore
            if (latestJob.status === 'completed') {
                setActiveJob(null);
                return;
            }

            // 2. AGE CHECK:
            // If the job is older than 60 minutes, we assume it's dead/irrelevant history.
            // This prevents "Zombie" jobs from days ago appearing when you delete a recent one.
            const createdAt = latestJob.createdAt?.toDate ? latestJob.createdAt.toDate() : new Date();
            const now = new Date();
            const diffMins = (now.getTime() - createdAt.getTime()) / 1000 / 60;

            if (diffMins > 60) {
                setActiveJob(null);
                return;
            }

            // 3. STALE CHECK (15-60 mins):
            // It's recent enough to show, but might be stuck.
            if (diffMins > 15) {
                setActiveJob({ ...latestJob, isStale: true });
            } else {
                setActiveJob(latestJob);
            }
        });

        return () => unsubscribe();
    }, [systemUser?.tenantId]);

    const [isCancelling, setIsCancelling] = useState(false);

    const handleClearJob = async () => {
        if (!activeJob?.id || !systemUser?.tenantId || isCancelling) return;

        setIsCancelling(true);
        // OPTIMISTIC UPDATE: Clear UI immediately
        const prevJob = activeJob;
        setActiveJob(null);

        // KILL TASK: Permanently delete the document.
        try {
            await deleteDoc(doc(db, `tenants/${systemUser.tenantId}/import_jobs`, prevJob.id));
            showToast("Tarefa cancelada e removida.", "success");
        } catch (error) {
            console.error("Erro ao cancelar:", error);
            // Revert on critical failure (optional, but usually better to just let it go)
            showToast("Erro ao cancelar tarefa no servidor, mas ocultada localmente.", "error");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleImportSuccess = () => {
        // Force refresh or just close modal, data context should handle subscriptions
        // Ideally show success toast which is done inside modal
        // window.location.reload(); // Optional if subscription is not live
    };

    // Categories for the Capsule Header
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['Todos', ...Array.from(cats)];
    }, [products]);

    // 1. Enrich Products with Calculated Stats
    const productsWithStats = useMemo(() => {
        return products.map(p => {
            const posChannel = p.channels.find(c => c.channel === 'pos') || p.channels[0];
            const price = posChannel?.price || 0;
            const cost = p.cost || 0; // Assuming cost is on the product root
            const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

            return {
                ...p,
                marginPercent: margin
            };
        });
    }, [products]);

    // 2. Filter Logic
    const filteredProducts = useMemo(() => {
        let items = productsWithStats;

        // Filter by Category
        if (selectedCategory !== 'Todos') {
            items = items.filter(p => p.category === selectedCategory);
        }

        // Filter by Search
        if (searchQuery) {
            items = items.filter(p =>
                searchMatch(p.name, searchQuery) ||
                searchMatch(p.category, searchQuery) ||
                searchMatch(p.description || '', searchQuery)
            );
        }

        return items;
    }, [productsWithStats, selectedCategory, searchQuery]);

    const handleCreateType = (type: 'SIMPLE' | 'COMBO') => {
        handleOpenCreator(selectedCategory, type);
        setIsTypeModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50 animate-fade-in relative">

            {/* HEADER AREA (No Sidebar) */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">

                {/* Top Row: Title + Actions */}
                <div className="p-4 lg:px-8 lg:py-5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-summo-bg p-2 rounded-xl text-summo-primary">
                            <LayoutTemplate size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 leading-none">Menu Studio</h1>
                            <p className="text-xs text-gray-500 mt-1">{filteredProducts.length} itens cadastrados</p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar item..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-summo-primary focus:ring-2 focus:ring-summo-primary/20 outline-none bg-gray-50 text-gray-800 text-sm transition-all"
                            />
                        </div>
                        <button onClick={() => setIsImportModalOpen(true)} className="bg-white text-gray-700 border border-gray-200 px-3 py-2.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition flex items-center gap-2 active:scale-95" title="Importar Cardápio">
                            <Import size={20} /> <span className="hidden xl:inline">Importar</span>
                        </button>
                        <button onClick={() => setIsTypeModalOpen(true)} className="add-product-btn bg-summo-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-summo-primary/30 hover:bg-summo-dark transition flex items-center gap-2 whitespace-nowrap active:scale-95">
                            <Plus size={20} /> <span className="hidden sm:inline">Novo Produto</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Category Capsules (Scrollable) */}
                <div className="px-4 lg:px-8 pb-3 overflow-x-auto no-scrollbar flex gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border ${selectedCategory === cat
                                ? 'bg-gray-800 text-white border-gray-800 shadow-md'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">

                {/* SCENARIO 1: IMPORT IN PROGRESS */}
                {activeJob && (
                    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-xl max-w-lg w-full relative overflow-hidden">
                            {/* Animated Background */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-summo-primary to-transparent animate-shimmer" />

                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <span className="text-4xl">⚡</span>
                            </div>

                            <h3 className="text-2xl font-black text-gray-800 mb-2">
                                {activeJob.isStale ? "Parece que demorou demais..." : "A IA está lendo seu cardápio..."}
                            </h3>
                            <p className="text-gray-500 mb-8 text-lg">
                                {activeJob.message || "Processando..."}
                                {activeJob.isStale && <br />}
                                {activeJob.isStale && <span className="text-red-400 text-sm">(Esta tarefa parece travada)</span>}
                            </p>

                            {/* Real Progress Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-4 border border-gray-100">
                                <div
                                    className={`h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(249,115,22,0.5)] ${activeJob.isStale ? 'bg-gray-400 w-full' : 'bg-gradient-to-r from-orange-500 to-pink-500'}`}
                                    style={{ width: activeJob.isStale ? '100%' : `${activeJob.progress || 5}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">{activeJob.progress || 0}% Concluído</p>

                            {/* Cancel / Clear Button */}
                            <button
                                onClick={handleClearJob}
                                disabled={isCancelling}
                                className="text-sm font-bold text-gray-400 hover:text-red-500 underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCancelling ? "Cancelando..." : (activeJob.isStale ? "Cancelar e Tentar Novamente" : "Cancelar")}
                            </button>
                        </div>
                    </div>
                )}

                {/* SCENARIO 2: PRODUCT LIST (OR EMPTY STATE) */}
                {/* SCENARIO 2: PRODUCT LIST (OR EMPTY STATE) */}
                {!activeJob && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredProducts.map((product, index) => (
                            <ErrorBoundary key={product.id || `product-${index}`} scope={`Card: ${product.name}`} fallback={<div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm">Erro ao carregar produto</div>}>
                                <MenuProductCard
                                    product={product}
                                    onOpenEditor={openEditor}
                                    onToggleAvailability={toggleAvailability}
                                    isEditorOpen={menuEditorLogic.selectedProduct?.id === product.id}
                                />
                            </ErrorBoundary>
                        ))}

                        {/* Empty State */}
                        {!productsLoading && filteredProducts.length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-400 flex flex-col items-center max-w-md mx-auto">
                                <div className="bg-gray-100 p-6 rounded-full mb-6">
                                    <Wand2 size={48} className="text-purple-500 opacity-80" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Comece seu Cardápio</h3>
                                <p className="text-sm text-gray-500 mb-8">
                                    Você ainda não tem produtos cadastrados. Que tal usar nossa IA para importar tudo automaticamente?
                                </p>

                                <button
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-purple-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mb-4"
                                >
                                    <Import size={20} /> Importar Cardápio (iFood/PDF)
                                </button>

                                <button onClick={() => setIsTypeModalOpen(true)} className="text-sm font-bold text-gray-500 hover:text-gray-700 underline">
                                    Criar manualmente
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Loading State for Infinite Scroll */}
                <div
                    ref={loadMoreRef}
                    className="py-10 flex flex-col items-center justify-center gap-2"
                >
                    {isFetchingNextPage ? (
                        <>
                            <Loader2 className="animate-spin text-summo-primary" size={24} />
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Carregando mais...</p>
                        </>
                    ) : hasNextPage ? (
                        <p className="text-xs text-gray-400 font-medium">Continue rolando para carregar mais</p>
                    ) : products.length > 0 ? (
                        <p className="text-xs text-gray-300 font-medium italic">Fim da lista. Todos os {products.length} itens carregados.</p>
                    ) : null}
                </div>
            </div>

            <ProductEditor logic={menuEditorLogic} />

            {/* --- TYPE SELECTION MODAL --- */}
            {
                isTypeModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-scale-in relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-summo-primary/10 to-transparent rounded-full -translate-y-32 translate-x-32 blur-3xl pointer-events-none" />

                            <div className="text-center mb-8 relative z-10">
                                <h2 className="text-2xl font-black text-gray-900 mb-2">O que vamos criar?</h2>
                                <p className="text-gray-500">Escolha o tipo de item para começar.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <button
                                    onClick={() => handleCreateType('SIMPLE')}
                                    className="flex flex-col items-center p-6 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:bg-white hover:border-summo-primary hover:shadow-xl transition-all group"
                                >
                                    <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <div className="w-8 h-8 bg-summo-primary rounded-lg" />
                                    </div>
                                    <span className="font-bold text-lg text-gray-800 group-hover:text-summo-primary">Produto Simples</span>
                                    <span className="text-xs text-gray-500 text-center mt-2">Item único, com ficha técnica e preço fixo.</span>
                                </button>

                                <button
                                    onClick={() => handleCreateType('COMBO')}
                                    className="flex flex-col items-center p-6 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:bg-white hover:border-orange-500 hover:shadow-xl transition-all group"
                                >
                                    <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <div className="flex gap-1">
                                            <div className="w-4 h-6 bg-orange-500 rounded-sm" />
                                            <div className="w-4 h-4 bg-orange-400 rounded-full self-end" />
                                        </div>
                                    </div>
                                    <span className="font-bold text-lg text-gray-800 group-hover:text-orange-600">Combo</span>
                                    <span className="text-xs text-gray-500 text-center mt-2">Conjunto de produtos com preço promocional.</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setIsTypeModalOpen(false)}
                                className="mt-8 w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )
            }

            {
                isImportModalOpen && (
                    <MenuImportModal
                        isOpen={isImportModalOpen}
                        onClose={() => setIsImportModalOpen(false)}
                        onSuccess={handleImportSuccess}
                    />
                )
            }

        </div >
    );
};

export default React.memo(MenuEngineering);
