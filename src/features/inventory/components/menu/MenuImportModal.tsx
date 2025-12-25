import React, { useState, useEffect, useCallback } from 'react';
import { X, Upload, Store, Search, Loader2, Wand2, FileText, Camera, Info, CheckCircle2, Zap, BarChart3, TrendingDown, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../auth/context/AuthContext';
import { useApp } from '../../../../contexts/AppContext';
import { httpsCallable } from '@firebase/functions';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { functions, storage } from '../../../../lib/firebase/client';
import { useMenuImport } from '../../hooks/useMenuImport';

interface MenuImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const MenuImportModal: React.FC<MenuImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { systemUser } = useAuth();
    const { showToast } = useApp();
    const [step, setStep] = useState<'SELECT' | 'IFOOD_LINK' | 'VISION_UPLOAD' | 'SCANNING' | 'CONFIRM' | 'AI_PROCESSING' | 'RESULTS'>('SELECT');
    const [ifoodLink, setIfoodLink] = useState('');
    const [scrapedData, setScrapedData] = useState<any>(null);
    const [importResults, setImportResults] = useState<any>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { startImport } = useMenuImport();



    const handleSearchStore = async () => {
        if (!ifoodLink.includes('ifood.com.br')) {
            showToast("Link inválido. Use a URL oficial do iFood.", "error");
            return;
        }

        setStep('SCANNING');

        try {
            const scrapeFn = httpsCallable(functions, 'scrapeIfoodMenu');
            const result = await scrapeFn({ url: ifoodLink });
            const data = result.data as any;

            if (data && data.success) {
                setScrapedData(data);
                setStep('CONFIRM');
            } else {
                throw new Error(data?.error || "Dados não encontrados.");
            }
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Erro ao conectar com o iFood. Tente novamente.", "error");
            setStep('IFOOD_LINK');
        }
    };


    // Execute AI-powered import
    const executeAIImport = async (payload: any) => {
        if (!systemUser?.tenantId) return;

        setStep('AI_PROCESSING');
        setIsImporting(true);

        try {
            const smartImportFn = httpsCallable(functions, 'startSmartImport');
            const result = await smartImportFn({
                ...payload,
                tenantId: systemUser.tenantId
            });

            setImportResults(result.data);
            setStep('RESULTS');
            setIsImporting(false);
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Falha no processamento da IA.", "error");
            setStep('SELECT');
            setIsImporting(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!systemUser?.tenantId) return;

        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            showToast("Formato inválido. Use JPG, PNG ou PDF.", "error");
            return;
        }

        setStep('SCANNING');

        try {
            const timestamp = Date.now();
            const storagePath = `imports/${systemUser.tenantId}/${timestamp}_${file.name}`;
            const storageReference = ref(storage, storagePath);

            console.log(`[Storage] Uploading: ${storagePath} (${file.type})`);
            const uploadResult = await uploadBytes(storageReference, file, {
                contentType: file.type
            });
            const downloadUrl = await getDownloadURL(uploadResult.ref);

            // Trigger Background Job
            await startImport(downloadUrl, file.type);

            // Close modal after starting background job
            showToast("Importação iniciada em segundo plano. Você será notificado ao concluir.", "success");
            onClose();
        } catch (error: any) {
            console.error(error);
            showToast("Erro ao iniciar importação.", "error");
            setStep('VISION_UPLOAD');
        }
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    }, [systemUser?.tenantId]);


    const executeImport = async () => {
        if (!systemUser?.tenantId || !scrapedData) return;

        const items: any[] = [];
        scrapedData.items?.forEach((item: any) => {
            items.push(item);
        });

        executeAIImport({ items });
    };

    const totalItems = scrapedData?.items?.length || 0;
    const avgPrice = (scrapedData?.items?.reduce((acc: number, item: any) => acc + item.price, 0) || 0) / (totalItems || 1);

    const content = () => {
        switch (step) {
            case 'SELECT':
                return (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold uppercase tracking-wider mb-2">
                                <Zap size={12} /> Engenharia de Dados High-End
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Sincronizador de <span className="text-orange-500">Lucratividade</span></h2>
                            <p className="text-slate-400">Escolha o canal de entrada para alimentar sua inteligência.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setStep('IFOOD_LINK')}
                                className="group relative flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-orange-500/50 hover:bg-white/10 transition-all text-left overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                                    <Store size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">Importar iFood</h3>
                                    <p className="text-xs text-slate-400 mt-1">Extraímos produtos e aplicamos reverse engineering.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setStep('VISION_UPLOAD')}
                                className="group relative flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-blue-500/50 hover:bg-white/10 transition-all text-left overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Camera size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Visão (Foto/PDF)</h3>
                                    <p className="text-xs text-slate-400 mt-1">Analise fotos de cardápios físicos ou arquivos PDF.</p>
                                </div>
                            </button>

                        </div>
                    </div>
                );

            case 'VISION_UPLOAD':
                return (
                    <div className="space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-white">Importação Visual</h2>
                            <p className="text-slate-400 mt-1">Arraste ou selecione a foto do seu cardápio físico.</p>
                        </div>

                        <div
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`relative h-64 border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center gap-4 ${isDragging
                                ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                                : 'border-white/10 bg-white/5 hover:border-blue-500/30 hover:bg-white/10'
                                }`}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            />
                            <label
                                htmlFor="file-upload"
                                className="w-20 h-20 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                            >
                                <Upload size={32} />
                            </label>
                            <div className="text-center">
                                <p className="text-white font-bold">Arraste o arquivo aqui</p>
                                <p className="text-slate-500 text-xs mt-1">JPG, PNG ou PDF (máx 10MB)</p>
                            </div>
                        </div>

                        <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex gap-4 items-start">
                            <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-slate-300 leading-relaxed">
                                <span className="text-blue-400 font-bold">Dica:</span> Fotos bem iluminadas garantem que o Gemini detecte os preços e nomes com 99% de precisão.
                            </p>
                        </div>

                        <button onClick={() => setStep('SELECT')} className="w-full py-4 text-slate-400 font-bold hover:text-white transition-colors">Voltar</button>
                    </div>
                );

            case 'IFOOD_LINK':
                return (
                    <div className="space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white">Digitalizar do iFood</h2>
                            <p className="text-slate-400 mt-1">O SUMMO vai varrer sua loja em busca de ineficiências.</p>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
                                <Store size={20} />
                            </div>
                            <input
                                type="text"
                                autoFocus
                                value={ifoodLink}
                                onChange={(e) => setIfoodLink(e.target.value)}
                                placeholder="https://www.ifood.com.br/delivery/..."
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none text-white transition-all placeholder:text-slate-600"
                            />
                        </div>

                        <div className="bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10 flex gap-4 items-start">
                            <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-slate-300 leading-relaxed">
                                <span className="text-orange-400 font-bold">Aviso:</span> Se o iFood estiver fechado, a extração pode falhar. Nesses casos, prefira enviar uma Foto/PDF do cardápio.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep('SELECT')} className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition-colors">Voltar</button>
                            <button
                                onClick={handleSearchStore}
                                disabled={!ifoodLink}
                                className="flex-[2] py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-500 shadow-xl shadow-orange-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Zap size={18} /> EXTRAIR DO IFOOD
                            </button>
                        </div>
                    </div>
                );

            case 'SCANNING':
                return (
                    <div className="py-20 flex flex-col items-center text-center space-y-6 relative overflow-hidden rounded-3xl">
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/50 blur-sm animate-[scan_2s_linear_infinite]" />
                            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-20" />
                        </div>

                        <div className="relative">
                            <Loader2 size={64} className="text-orange-500 animate-spin" />
                            <Search size={24} className="absolute inset-0 m-auto text-white animate-pulse" />
                        </div>

                        <div className="space-y-2 relative z-10">
                            <h2 className="text-2xl font-black text-white">Escaneando...</h2>
                            <p className="text-slate-400 max-w-xs mx-auto animate-pulse">
                                Interceptando dados e preparando contexto para a Inteligência Artificial.
                            </p>
                        </div>

                        <style>{`
                            @keyframes scan {
                                0% { top: 0% }
                                100% { top: 100% }
                            }
                        `}</style>
                    </div>
                );

            case 'CONFIRM':
                return (
                    <div className="space-y-8 animate-in zoom-in duration-300">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-white">{scrapedData?.restaurant}</h2>
                            <p className="text-slate-400">Cardápio detectado com sucesso.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Itens Totais</span>
                                <p className="text-2xl font-black text-white">{totalItems}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Preço Médio</span>
                                <p className="text-2xl font-black text-white">R$ {avgPrice.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep('SELECT')} className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition-colors">Cancelar</button>
                            <button
                                onClick={executeImport}
                                disabled={isImporting}
                                className="flex-[2] py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-500 shadow-xl shadow-green-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {isImporting ? <Loader2 size={18} className="animate-spin" /> : <BarChart3 size={18} />}
                                {isImporting ? 'SINCRONIZANDO...' : 'CONFIRMAR IMPORTAÇÃO'}
                            </button>
                        </div>
                    </div>
                );


            case 'AI_PROCESSING':
                return (
                    <div className="py-16 flex flex-col items-center text-center space-y-6">
                        <div className="relative">
                            <Loader2 size={64} className="text-green-500 animate-spin" />
                            <Wand2 size={24} className="absolute inset-0 m-auto text-white animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white">Gemini Processando...</h2>
                            <p className="text-slate-400 max-w-xs mx-auto animate-pulse">
                                Gerando receitas, calculando CMV e cruzando dados de estoque.
                            </p>
                        </div>
                    </div>
                );

            case 'RESULTS':
                const summary = importResults?.results || [];
                return (
                    <div className="space-y-6 animate-in zoom-in duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white">Sucesso Total!</h2>
                            <p className="text-sm text-slate-400">{importResults?.message}</p>
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Produtos Identificados</p>
                            {/* Assuming for now the response doesn't detail items to simplify UI but we mention the success */}
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                                <p className="text-white text-sm">Os produtos estão sendo criadosatomicamente com suas fichas técnicas vinculadas.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => { onSuccess(); onClose(); }}
                            className="w-full py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-500 shadow-xl shadow-orange-900/20 active:scale-[0.98] transition-all"
                        >
                            FECHAR E REVISAR NO MENU STUDIO
                        </button>
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900/90 border border-white/5 rounded-[2.5rem] p-8 max-w-xl w-full shadow-[0_0_80px_-15px_rgba(249,115,22,0.15)] relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-600/5 blur-[100px] rounded-full" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full" />

                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all">
                    <X size={24} />
                </button>

                <div className="relative z-10">
                    {content()}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MenuImportModal;
