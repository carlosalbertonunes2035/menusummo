import React, { useState } from 'react';
import { Building2, LogOut, Info, Calendar } from 'lucide-react';
import { DiagnosticsForm } from './SettingsForms';
import { seedJCBarData } from '../../../scripts/seedJCBarMenu';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../auth/context/AuthContext';
import { StoreSettings } from '../../../types';

interface SystemSectionProps {
    userEmail?: string;
    tenantId: string;
    onLogout: () => void;
    settings: StoreSettings;
    onUpdateSettings: (s: StoreSettings) => void;
}

const SystemSection: React.FC<SystemSectionProps> = ({ userEmail, tenantId, onLogout, settings, onUpdateSettings }) => {
    const { showToast } = useToast();
    const { isMockMode } = useAuth();
    const [seeding, setSeeding] = useState(false);

    const handleSeed = async () => {
        const lastSeedMsg = settings.lastSeedingAt
            ? `\n\nATENÇÃO: Você já populou os dados anteriormente em: ${new Date(settings.lastSeedingAt).toLocaleString()}`
            : "";

        if (!confirm(`Isso irá criar novos produtos e ingredientes.${lastSeedMsg}\n\nDeseja continuar com a primeira etapa de confirmação?`)) return;
        if (!confirm(`TEM CERTEZA? Esta ação pode gerar duplicatas se você já possuir itens com nomes diferentes no cardápio.`)) return;

        setSeeding(true);
        try {
            await seedJCBarData(isMockMode);

            // Update lastSeedingAt timestamp
            const now = new Date().toISOString();
            onUpdateSettings({
                ...settings,
                lastSeedingAt: now
            });

            // Dispatch event to force update if in mock mode
            if (isMockMode) {
                window.dispatchEvent(new Event('local-db-updated'));
            }
            showToast("Dados do JC Bar importados com sucesso!", "success");
        } catch (e) {
            console.error(e);
            showToast("Erro ao importar dados", "error");
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <Building2 size={20} /> Dados da Sessão
                    </h4>
                    <button
                        onClick={onLogout}
                        className="text-xs bg-red-50 text-red-600 px-3 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-100 transition"
                    >
                        <LogOut size={14} /> Sair da Conta
                    </button>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm font-bold text-gray-800">Usuário Logado</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                    <div className="mt-2 flex gap-2">
                        <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded">
                            Tenant: {tenantId}
                        </span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="mb-4 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                        <Info size={18} className="text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-blue-900">Popular Dados (Seed)</p>
                            <p className="text-xs text-blue-700 mt-1">Isso preenche seu sistema com o cardápio padrão do JC Bar para testes.</p>
                            {settings.lastSeedingAt && (
                                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-blue-800 bg-white/50 w-fit px-2 py-1 rounded-md border border-blue-200">
                                    <Calendar size={12} /> Última vez: {new Date(settings.lastSeedingAt).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="w-full py-3 bg-summo-primary text-white rounded-xl font-bold text-sm hover:bg-summo-dark transition flex justify-center items-center gap-2 shadow-sm active:scale-[0.98]"
                    >
                        {seeding ? 'Importando...' : 'Importar Cardápio JC Bar'}
                    </button>
                </div>
            </div>
            <DiagnosticsForm />
        </div>
    );
};

export default SystemSection;
