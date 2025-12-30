
import React, { useState, useMemo } from 'react';
import { Order, Driver, OrderStatus, OrderType } from '../../../types';
import { MapPin, Send, MessageCircle, UserCheck, Navigation, Loader2, ExternalLink, CheckSquare, Square, Route, Map as MapIcon } from 'lucide-react';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from '@firebase/functions';
import { generateWhatsAppLink, generateGoogleMapsRouteLink, generateDriverManifest } from '../../../lib/utils';
import ReactMarkdown from 'react-markdown';
import { useOrders } from '@/hooks/useOrders';
import { useDrivers } from '@/hooks/useDrivers';
import { useApp } from '../../../contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';

import { DriverSettlement } from '../components/DriverSettlement';

const Logistics: React.FC = () => {
    // ... existing hooks ...
    const { data: orders, loading: ordersLoading, updateStatus: updateOrderStatus, assignDriver } = useOrders({ limit: 200 });
    const { data: drivers, loading: driversLoading, updateStatus: updateDriverStatus } = useDrivers();
    const { settings } = useApp();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'DISPATCH' | 'SETTLEMENT'>('DISPATCH');

    // ... existing Memos and States (selectedOrders, etc) ...
    const readyOrders = useMemo(() => orders.filter(o => o.status === OrderStatus.READY && o.type === OrderType.DELIVERY), [orders]);
    const activeDeliveries = useMemo(() => orders.filter(o => o.status === OrderStatus.DELIVERING), [orders]);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [analyzingRoute, setAnalyzingRoute] = useState(false);
    const [routeAnalysis, setRouteAnalysis] = useState<{ text: string, chunks: any[] } | null>(null);
    const [isOptimizingBatch, setIsOptimizingBatch] = useState(false);
    const [optimizedBatch, setOptimizedBatch] = useState<{ sequence: string[], summary: string, mapLink: string } | null>(null);
    const [optimizedOrderSequence, setOptimizedOrderSequence] = useState<string[]>([]);

    // ... existing handlers (toggleOrderSelection, handleDispatch, etc) ...
    const toggleOrderSelection = (orderId: string) => {
        setSelectedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
        setRouteAnalysis(null); setOptimizedBatch(null); setOptimizedOrderSequence([]);
    };

    const handleDispatch = async (driver: Driver, orderIds: string[]) => {
        if (orderIds.length === 0) return;
        try {
            const updates = orderIds.map(async (id) => {
                const sequenceIndex = optimizedOrderSequence.indexOf(id);
                const deliverySequence = sequenceIndex !== -1 ? sequenceIndex + 1 : undefined;

                await assignDriver({ orderId: id, driverId: driver.id, deliverySequence });
            });

            await Promise.all(updates);
            await updateDriverStatus({ driverId: driver.id, status: 'BUSY' });

            showToast(`Despachado para ${driver.name}`, 'success');
            let waLink = '';
            if (orderIds.length === 1) {
                const order = orders.find(o => o.id === orderIds[0]);
                if (order) waLink = generateWhatsAppLink(driver.phone, order.customerName, order.deliveryAddress || "Retirada", "A caminho");
            } else if (optimizedBatch && optimizedOrderSequence.length > 0) {
                const orderedOrders = optimizedOrderSequence.map(id => orders.find(o => o.id === id)).filter(Boolean) as Order[];
                waLink = `https://wa.me/${driver.phone}?text=${encodeURIComponent(generateDriverManifest(driver.name, orderedOrders, optimizedBatch.mapLink))}`;
            } else {
                waLink = `https://wa.me/${driver.phone}?text=${encodeURIComponent(`Olá ${driver.name}, você tem ${orderIds.length} novas entregas atribuídas!`)}`;
            }
            if (waLink) window.open(waLink, '_blank');
            setSelectedOrders([]); setRouteAnalysis(null); setOptimizedBatch(null); setOptimizedOrderSequence([]);
        } catch (error) {
            console.error(error);
            showToast('Erro ao despachar', 'error');
        }
    };

    const handleAnalyzeSingleRoute = async (order: Order) => {
            if (!order.deliveryAddress) { showToast?.("Endereço de entrega não definido", 'error'); return; }
            setAnalyzingRoute(true); setRouteAnalysis(null);
            try {
                const getDeliveryRouteInfoFn = httpsCallable(functions, 'getDeliveryRouteInfoFn');
                const { data } = await getDeliveryRouteInfoFn({ origin: settings.address, destination: order.deliveryAddress });
                const response = data as any;
                setRouteAnalysis({ text: response.text || "Sem informações de rota.", chunks: [] });
            } catch (e) { console.error(e); showToast?.("Erro ao calcular rota", 'error'); } finally { setAnalyzingRoute(false); }
        };

        const handleOptimizeBatch = async () => {
            const selectedOrdersData = readyOrders.filter(o => selectedOrders.includes(o.id));
            const addresses = selectedOrdersData.map(o => o.deliveryAddress || "").filter(Boolean);
            if (addresses.length < 2) { showToast?.("Selecione pelo menos 2 pedidos para otimizar.", 'info'); return; }
            setIsOptimizingBatch(true); setOptimizedBatch(null); setOptimizedOrderSequence([]);
            try {
                const optimizeDeliveryRouteFn = httpsCallable(functions, 'optimizeDeliveryRouteFn');
                const { data } = await optimizeDeliveryRouteFn({ origin: settings.address, destinations: addresses });
                const result = data as any;
                if (result && result.optimizedSequence) {
                    const sortedAddresses: string[] = [];
                    const sortedOrderIds: string[] = [];
                    result.optimizedSequence.forEach((index: number) => {
                        const arrayIndex = index - 1;
                        if (selectedOrdersData[arrayIndex]) { sortedAddresses.push(addresses[arrayIndex]); sortedOrderIds.push(selectedOrdersData[arrayIndex].id); }
                    });
                    setOptimizedBatch({ sequence: sortedAddresses, summary: result.summary, mapLink: generateGoogleMapsRouteLink(settings.address, sortedAddresses) });
                    setOptimizedOrderSequence(sortedOrderIds);
                    showToast?.("Rota otimizada!", 'success');
                } else { showToast?.("Erro na otimização.", 'error'); }
            } catch (e) { console.error(e); showToast?.("Erro na otimização.", 'error'); } finally { setIsOptimizingBatch(false); }
        };

        const displayOrders = useMemo(() => {
            if (optimizedOrderSequence.length === 0) return readyOrders;
            return [...readyOrders].sort((a, b) => {
                const idxA = optimizedOrderSequence.indexOf(a.id);
                const idxB = optimizedOrderSequence.indexOf(b.id);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                return (idxA !== -1) ? -1 : (idxB !== -1) ? 1 : 0;
            });
        }, [readyOrders, optimizedOrderSequence]);

        if (!orders || !drivers) return <div className="h-full flex items-center justify-center text-gray-400"><Loader2 className="animate-spin" /></div>;

        return (
            <div className="h-full flex flex-col p-4 lg:p-6 bg-gray-50/50">
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 pb-1">
                    <button
                        onClick={() => setActiveTab('DISPATCH')}
                        className={`pb-2 px-4 font-bold text-sm transition ${activeTab === 'DISPATCH' ? 'text-summo-primary border-b-2 border-summo-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Despacho & Roteirização
                    </button>
                    <button
                        onClick={() => setActiveTab('SETTLEMENT')}
                        className={`pb-2 px-4 font-bold text-sm transition ${activeTab === 'SETTLEMENT' ? 'text-summo-primary border-b-2 border-summo-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Acerto de Motoboys (Caixa)
                    </button>
                </div>

                {activeTab === 'SETTLEMENT' ? (
                    <DriverSettlement />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
                        {/* Pending Orders Column */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-yellow-50 rounded-t-2xl flex-shrink-0 flex justify-between items-center">
                                <h2 className="font-bold text-yellow-700 flex items-center gap-2"><MapPin size={20} /> Aguardando ({readyOrders.length})</h2>
                                {selectedOrders.length > 1 && (
                                    <button onClick={handleOptimizeBatch} disabled={isOptimizingBatch} className="text-xs bg-yellow-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-yellow-700 transition flex items-center gap-1 shadow-sm">
                                        {isOptimizingBatch ? <Loader2 size={14} className="animate-spin" /> : <Route size={14} />} Otimizar ({selectedOrders.length})
                                    </button>
                                )}
                            </div>
                            {optimizedBatch && (
                                <div className="p-4 bg-blue-50 border-b border-blue-100 animate-fade-in">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700 font-bold flex items-center justify-center min-w-[40px] h-[40px] text-lg">
                                            {optimizedOrderSequence.length > 0 ? optimizedOrderSequence.length : <Route size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-blue-800 text-sm">Rota Inteligente</h4>
                                            <p className="text-xs text-blue-600 mt-1 mb-2">{optimizedBatch.summary}</p>
                                            <a href={optimizedBatch.mapLink} target="_blank" rel="noreferrer" className="bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 flex items-center gap-1 w-fit"><MapIcon size={14} /> Abrir Mapa</a>
                                            <div className="mt-3"><p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Atribuir a:</p><div className="grid grid-cols-2 gap-2">{drivers.map(driver => (<button key={driver.id} onClick={() => handleDispatch(driver, selectedOrders)} disabled={driver.status === 'BUSY'} className="bg-white border border-blue-200 p-2 rounded text-xs font-bold text-gray-700 hover:bg-blue-100 flex items-center justify-between disabled:opacity-50"><span>{driver.name}</span>{driver.status === 'AVAILABLE' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}</button>))}</div></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="p-4 space-y-3 overflow-y-auto flex-1">
                                {readyOrders.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-gray-400"><MapPin size={40} className="opacity-20 mb-2" /><p className="font-bold">Sem entregas pendentes.</p></div> :
                                    displayOrders.map(order => {
                                        const isSelected = selectedOrders.includes(order.id);
                                        const stopIndex = optimizedOrderSequence.indexOf(order.id);
                                        return (
                                            <div key={order.id} className={`p-4 rounded-xl border transition relative flex flex-col gap-2 ${isSelected ? 'border-summo-primary bg-summo-bg ring-1 ring-summo-primary' : 'border-gray-100 hover:border-summo-primary/50'}`}>
                                                <div className="flex items-start gap-3">
                                                    <button onClick={() => toggleOrderSelection(order.id)} className="text-summo-primary mt-1">{isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-300" />}</button>
                                                    <div className="flex-1 cursor-pointer" onClick={() => selectedOrders.length === 0 && toggleOrderSelection(order.id)}>
                                                        <div className="flex justify-between items-center"><span className="font-bold text-summo-dark">#{order.id.slice(-4)} - {order.customerName}</span>{stopIndex !== -1 && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">#{stopIndex + 1}</span>}</div>
                                                        <div className="flex justify-between items-center mt-1"><p className="text-sm text-gray-600 flex items-center gap-1"><MapPin size={14} /> {order.deliveryAddress}</p><span className="text-xs text-gray-400">{order.items.length} itens</span></div>
                                                    </div>
                                                </div>
                                                {isSelected && selectedOrders.length === 1 && (
                                                    <div className="pt-3 border-t border-summo-primary/20 animate-fade-in ml-8">
                                                        <div className="mb-2 flex justify-between items-center"><button onClick={(e) => { e.stopPropagation(); handleAnalyzeSingleRoute(order); }} disabled={analyzingRoute} className="text-[10px] bg-summo-primary text-white px-2 py-1 rounded hover:bg-summo-dark transition disabled:opacity-50 flex gap-1 items-center">{analyzingRoute ? <Loader2 size={10} className="animate-spin" /> : <Navigation size={10} />} Analisar Rota</button></div>
                                                        {routeAnalysis && <div className="text-xs text-gray-600 mb-3 bg-white p-2 rounded border"><ReactMarkdown>{routeAnalysis.text}</ReactMarkdown></div>}
                                                        <div className="grid grid-cols-1 gap-2">{drivers.map(driver => (<button key={driver.id} onClick={(e) => { e.stopPropagation(); handleDispatch(driver, [order.id]); }} disabled={driver.status === 'BUSY'} className={`flex items-center justify-between bg-white p-2 rounded border transition text-sm ${driver.status === 'BUSY' ? 'opacity-50' : 'hover:bg-gray-50'}`}><span>{driver.name}</span><Send size={14} className="text-summo-primary" /></button>))}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        {/* Active Deliveries Column */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-blue-50 rounded-t-2xl flex-shrink-0"><h2 className="font-bold text-blue-700 flex items-center gap-2"><UserCheck size={20} /> Em Rota ({activeDeliveries.length})</h2></div>
                            <div className="p-4 space-y-3 overflow-y-auto flex-1">
                                {activeDeliveries.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-gray-400"><UserCheck size={40} className="opacity-20 mb-2" /><p className="font-bold">Nenhum pedido em rota.</p></div> :
                                    activeDeliveries.map(order => (
                                        <div key={order.id} className="p-4 rounded-xl border border-blue-100 bg-blue-50/30">
                                            <div className="flex justify-between items-center mb-2"><span className="font-bold text-gray-800">#{order.id.slice(-4)} - {order.customerName}</span><span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Na Rua</span></div>
                                            <p className="text-sm text-gray-500 mb-1">{order.deliveryAddress}</p>
                                            <p className="text-xs text-blue-600 font-bold mb-3 flex items-center gap-1"><UserCheck size={12} /> {drivers.find(d => d.id === order.driverId)?.name || 'Desconhecido'}</p>
                                            <div className="flex gap-2"><button onClick={() => updateOrderStatus({ orderId: order.id, status: OrderStatus.COMPLETED })} className="flex-1 bg-white border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-green-50 hover:text-green-600 transition font-medium">Concluir</button><button onClick={() => window.open(generateWhatsAppLink(drivers.find(d => d.id === order.driverId)?.phone || '', "Admin", "Rota", ""), '_blank')} className="p-2 bg-white border border-gray-200 rounded-lg text-green-600 hover:bg-green-50"><MessageCircle size={18} /></button></div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default React.memo(Logistics);
