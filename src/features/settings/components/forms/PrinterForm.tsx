import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, HardDrive, Printer, Plus, Zap, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../../../../contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useProductsQuery } from '@/lib/react-query/queries/useProductsQuery';
import { PrinterDevice } from '../../../../types';
import { SettingsFormProps } from './types';
import { inputClass, labelClass } from './shared';

export const PrinterForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => {
    const { tenantId } = useApp();
    const { showToast } = useToast();
    const { products } = useProductsQuery(tenantId);
    const [agentStatus, setAgentStatus] = useState<'ONLINE' | 'OFFLINE' | 'CHECKING'>('CHECKING');
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);
    const [systemPrinters, setSystemPrinters] = useState<string[]>([]);
    const [agentInfo, setAgentInfo] = useState<{ version?: string, tenantId?: string } | null>(null);

    // Extract categories from products
    const categories = Array.from(new Set((products || []).map(p => p.category))).filter(Boolean);

    const checkStatus = async () => {
        setIsLoadingStatus(true);
        try {
            const res = await fetch('http://localhost:3030/status', { signal: AbortSignal.timeout(1500) }).catch(() => null);
            const isOnline = res && res.ok;
            setAgentStatus(isOnline ? 'ONLINE' : 'OFFLINE');

            if (isOnline) {
                const data = await res.json();
                setAgentInfo({ version: data.version, tenantId: data.config?.tenantId });

                const printersRes = await fetch('http://localhost:3030/printers').catch(() => null);
                if (printersRes && printersRes.ok) {
                    const pData = await printersRes.json();
                    setSystemPrinters(pData.printers || []);
                }
            } else {
                setAgentInfo(null);
            }
        } catch (e) {
            setAgentStatus('OFFLINE');
            setAgentInfo(null);
        } finally {
            setIsLoadingStatus(false);
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const handleAddPrinter = () => {
        const newPrinter: PrinterDevice = {
            id: `p_${Date.now()}`,
            name: 'Nova Impressora',
            systemName: systemPrinters[0] || '',
            paperWidth: '80mm',
            fontSize: 'NORMAL',
            printCopies: 1,
            autoPrint: true,
            categoryIds: []
        };

        const currentDevices = settings.printer?.devices || [];
        const updatedDevices = [...currentDevices, newPrinter];
        onChange({ target: { name: 'printer.devices', value: updatedDevices } } as any);
    };

    const handleRemovePrinter = (id: string) => {
        const updatedDevices = (settings.printer.devices || []).filter((p: PrinterDevice) => p.id !== id);
        onChange({ target: { name: 'printer.devices', value: updatedDevices } } as any);
    };

    const updatePrinter = (id: string, field: string, value: any) => {
        const updatedDevices = settings.printer.devices.map((p: PrinterDevice) =>
            p.id === id ? { ...p, [field]: value } : p
        );
        onChange({ target: { name: 'printer.devices', value: updatedDevices } } as any);
    };

    const toggleCategory = (printerId: string, category: string) => {
        const printer = settings.printer.devices.find((p: PrinterDevice) => p.id === printerId);
        if (!printer) return;

        const current = printer.categoryIds || [];
        const updated = current.includes(category)
            ? current.filter((c: string) => c !== category)
            : [...current, category];

        updatePrinter(printerId, 'categoryIds', updated);
    };

    const handleTestPrint = async (device: PrinterDevice) => {
        showToast(`Enviando teste para ${device.name}...`, "info");
        try {
            const res = await fetch('http://localhost:3030/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'TEST',
                    content: `SUMMO TEST PRINT\nImpressora: ${device.name}\nLocal: ${device.systemName}`,
                    options: { printerName: device.systemName }
                }),
                signal: AbortSignal.timeout(2000)
            }).catch(() => null);

            if (res && res.ok) showToast("Impressão de teste enviada!", "success");
            else showToast("Falha. Verifique o Agente.", "error");
        } catch (e) {
            showToast("Erro de conexão.", "error");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Agent Status Banner */}
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${agentStatus === 'ONLINE' ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${agentStatus === 'ONLINE' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-orange-500 text-white animate-pulse shadow-lg shadow-orange-500/20'}`}>
                        {agentStatus === 'ONLINE' ? <Wifi size={20} /> : <WifiOff size={20} />}
                    </div>
                    <div>
                        <h4 className={`font-bold text-sm ${agentStatus === 'ONLINE' ? 'text-emerald-800' : 'text-orange-800'}`}>
                            {agentStatus === 'ONLINE' ? 'Agente SUMMO Conectado' : 'Agente SUMMO não detectado'}
                        </h4>
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] opacity-70">
                                {agentStatus === 'ONLINE' ? `${systemPrinters.length} impressoras detectadas no sistema. ${agentInfo?.version ? `(Versão: ${agentInfo.version})` : ''}` : 'O Agente deve estar rodando para imprimir cupons locais.'}
                            </p>
                            {agentStatus === 'ONLINE' && (
                                <a href="http://localhost:3030/status" target="_blank" className="text-[9px] font-bold text-emerald-600 hover:underline flex items-center gap-1">
                                    <CheckCircle size={10} /> Verificar status direto (localhost:3030)
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={checkStatus} disabled={isLoadingStatus} className="p-2 hover:bg-black/5 rounded-lg transition" title="Sincronizar">
                        <RefreshCw size={16} className={isLoadingStatus ? 'animate-spin' : ''} />
                    </button>
                    {agentStatus !== 'ONLINE' ? (
                        <div className="flex gap-2 w-full">
                            <a
                                href="/SUMMO-Printer-Agent.exe"
                                download
                                className="flex-1 md:flex-none bg-summo-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:scale-105 transition shadow-sm"
                            >
                                <HardDrive size={14} /> Baixar Agente EXE
                            </a>
                        </div>
                    ) : (
                        <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            Ativo e Pronto
                        </div>
                    )}
                </div>
            </div>

            {/* Printers List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><Printer size={20} /> Impressoras Cadastradas</h3>
                    <button onClick={handleAddPrinter} className="flex items-center gap-2 text-sm font-bold bg-summo-primary text-white px-3 py-1.5 rounded-lg hover:bg-summo-dark transition shadow-sm">
                        <Plus size={16} /> Adicionar
                    </button>
                </div>

                {(!settings.printer.devices || settings.printer.devices.length === 0) ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Printer className="mx-auto text-slate-300 mb-2" size={48} />
                        <p className="text-slate-500 text-sm font-medium">Nenhuma impressora configurada.</p>
                        <button onClick={handleAddPrinter} className="mt-4 text-summo-primary font-bold text-sm">Clique para adicionar a primeira</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {settings.printer.devices.map((device: PrinterDevice, idx: number) => (
                            <div key={device.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-summo-primary shadow-sm">{idx + 1}</div>
                                        <input
                                            type="text"
                                            value={device.name}
                                            onChange={(e) => updatePrinter(device.id, 'name', e.target.value)}
                                            className="bg-transparent font-bold text-slate-800 outline-none border-b border-transparent focus:border-summo-primary pr-2"
                                            placeholder="Ex: Cozinha"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleTestPrint(device)} className="p-2 text-slate-400 hover:text-summo-primary transition" title="Teste de Impressão">
                                            <Zap size={16} />
                                        </button>
                                        <button onClick={() => handleRemovePrinter(device.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conexão Local</h5>
                                        <div>
                                            <label className={labelClass}>Impressora no Windows</label>
                                            {agentStatus === 'ONLINE' && systemPrinters.length > 0 ? (
                                                <select
                                                    value={device.systemName}
                                                    onChange={(e) => updatePrinter(device.id, 'systemName', e.target.value)}
                                                    className={inputClass}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {systemPrinters.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={device.systemName}
                                                        onChange={(e) => updatePrinter(device.id, 'systemName', e.target.value)}
                                                        className={inputClass}
                                                        placeholder="Digite o nome exato"
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">Manual</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelClass}>Largura</label>
                                                <select value={device.paperWidth} onChange={(e) => updatePrinter(device.id, 'paperWidth', e.target.value)} className={inputClass}>
                                                    <option value="58mm">58mm</option>
                                                    <option value="80mm">80mm</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Vias</label>
                                                <input type="number" value={device.printCopies} onChange={(e) => updatePrinter(device.id, 'printCopies', parseInt(e.target.value) || 1)} className={inputClass} min="1" max="5" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estilo</h5>
                                        <div>
                                            <label className={labelClass}>Fonte</label>
                                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                                {['NORMAL', 'LARGE'].map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => updatePrinter(device.id, 'fontSize', size)}
                                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${device.fontSize === size ? 'bg-white text-summo-primary shadow-sm' : 'text-slate-500'}`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Auto-Imprimir</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={device.autoPrint} onChange={(e) => updatePrinter(device.id, 'autoPrint', e.target.checked)} className="sr-only peer" />
                                                <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Encaminhamento</h5>
                                        <div className="flex flex-wrap gap-1.5">
                                            {categories.length === 0 ? (
                                                <p className="text-[10px] text-slate-400 italic">Crie categorias para rotear.</p>
                                            ) : (
                                                categories.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => toggleCategory(device.id, cat)}
                                                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition border ${device.categoryIds?.includes(cat)
                                                            ? 'bg-summo-primary/10 text-summo-primary border-summo-primary/20'
                                                            : 'bg-white text-slate-400 border-slate-200'}`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        {(!device.categoryIds || device.categoryIds.length === 0) && (
                                            <div className="flex items-center gap-1 text-[9px] text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-100">
                                                <AlertTriangle size={10} />
                                                Imprimir tudo (Geral)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
