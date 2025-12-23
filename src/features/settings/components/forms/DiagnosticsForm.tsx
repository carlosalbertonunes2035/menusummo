import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, HardDrive, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../../../../contexts/AppContext';
import { cardClass } from './shared';

export const DiagnosticsForm: React.FC = () => {
    const { resetTenantData, deduplicateTenantData } = useApp();
    const [stats, setStats] = useState({
        storageUsed: 0,
        storageQuota: 0,
        isOnline: navigator.onLine,
        lastSync: new Date().toLocaleTimeString()
    });

    useEffect(() => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(estimate => {
                setStats(prev => ({
                    ...prev,
                    storageUsed: estimate.usage || 0,
                    storageQuota: estimate.quota || 0
                }));
            });
        }
    }, []);

    const usedMB = (stats.storageUsed / 1024 / 1024).toFixed(2);

    return (
        <div className={cardClass}>
            <h4 className="font-bold mb-4 text-slate-800 dark:text-slate-100">Diagnóstico do Sistema</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Status Conexão</p>
                    <div className={`flex items-center gap-2 font-bold ${stats.isOnline ? 'text-emerald-600' : 'text-red-500'}`}>
                        {stats.isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
                        {stats.isOnline ? 'Online' : 'Offline'}
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Cache Local</p>
                    <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                        <HardDrive size={20} /> {usedMB} MB
                    </div>
                </div>
            </div>
            <h5 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-3 uppercase tracking-wider">
                <AlertTriangle size={16} /> Zona de Perigo (Ações Irreversíveis)
            </h5>
            <div className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-sm font-bold text-red-800 dark:text-red-200">Limpar Duplicatas</p>
                        <p className="text-xs text-red-600/70 dark:text-red-400/70 leading-relaxed">Remove itens com nomes idênticos (produtos, insumos e receitas). Útil se você clicar em 'Seed' várias vezes.</p>
                    </div>
                    <button
                        onClick={async () => {
                            if (window.confirm("Isso irá remover produtos, ingredientes e receitas com nomes duplicados.\n\nDeseja continuar?")) {
                                await deduplicateTenantData();
                            }
                        }}
                        className="shrink-0 flex items-center gap-2 px-6 py-2.5 bg-summo-primary hover:bg-summo-dark text-white rounded-xl font-bold text-xs shadow-lg shadow-summo-primary/20 transition active:scale-95 transition-all"
                    >
                        <Trash2 size={14} /> Corrigir Duplicatas
                    </button>
                </div>

                <div className="pt-6 border-t border-red-100 dark:border-red-900/20 flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-sm font-bold text-red-800 dark:text-red-200 italic underline">Reset Total de Dados</p>
                        <p className="text-xs text-red-600/70 dark:text-red-400/70 leading-relaxed font-semibold">APAGA TUDO: Produtos, Insumos, Receitas, Pedidos, Clientes e Histórico. Use para começar do zero absoluto.</p>
                    </div>
                    <button
                        onClick={async () => {
                            if (window.confirm("🚨 ATENÇÃO: Deseja apagar ABSOLUTAMENTE TODOS os dados (produtos, insumos, receitas, pedidos e histórico) permanentemente?")) {
                                if (window.confirm("TEM CERTEZA ABSOLUTA? Esta ação NÃO PODE SER DESFEITA. O sistema será reiniciado totalmente limpo.")) {
                                    await resetTenantData();
                                }
                            }
                        }}
                        className="shrink-0 flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-500/20 transition active:scale-95 transition-all"
                    >
                        <Trash2 size={14} /> FORÇAR RESET TOTAL
                    </button>
                </div>
            </div>
        </div >
    );
};
