
import React, { useState, useEffect } from 'react';
import { StoreSettings, Driver, SystemUser, Role } from '@/types';
import { TENANTS, GET_DEFAULT_SETTINGS } from '@/constants';
import {
    Save, Printer, Store as StoreIcon, Clock, Truck,
    Bike, AlertTriangle, CreditCard, LayoutGrid, Monitor,
    Plus, Trash2, ChevronRight, Bell, Activity, Building2, Check, Briefcase, SlidersHorizontal, Cpu, Users, Shield, Lock, Plug, Key, LogOut, Smartphone, Loader2,
    Wand2, Info
} from 'lucide-react';
import { useDrivers } from '@/hooks/useDrivers';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { requestNotificationPermission } from '@/services/notificationService';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import {
    StoreForm, ScheduleForm, DeliveryForm,
    PaymentForm, InterfaceForm, PrinterForm, IntegrationsForm, OperationForm
} from '../components/SettingsForms';
import SubscriptionSection from '../components/SubscriptionSection';
import MotoboysSection from '../components/MotoboysSection';
import SystemSection from '../components/SystemSection';
import AdvancedSection from '../components/AdvancedSection';
import { StoreSettingsSchema } from '@/lib/schemas';
import { z } from 'zod';
import { PageContainer } from '@/components/layouts/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';


import { MenuImporter } from '../../../scripts/menu-importer/importer';

const Settings: React.FC = () => {
    const { settings: contextSettings, setSettings: setContextSettings, handleAction, showToast, tenantId, switchTenant } = useApp();
    const { logout, user, role, systemUser } = useAuth();
    const isMockMode = false;

    const [activeTab, setActiveTab] = useState('STORE');
    const [localSettings, setLocalSettings] = useState<StoreSettings>(() => {
        const defaults = GET_DEFAULT_SETTINGS(tenantId);
        return { ...defaults, ...contextSettings, printer: { ...defaults.printer, ...contextSettings?.printer } };
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [notificationStatus, setNotificationStatus] = useState(Notification.permission);

    // --- PERMISSION LOGIC ---
    const hasPermission = (required: string) => {
        if (!role || !role.permissions) return false;
        if (role.permissions.includes('*')) return true;
        return role.permissions.includes(required);
    };

    const allMenuItems = [
        { id: 'STORE', label: 'Dados da Empresa', icon: StoreIcon, description: 'CNPJ, endereço e segurança da conta.', permission: 'manage:settings' },
        { id: 'TEAM', label: 'Gestão de Equipe', icon: Users, description: 'Colaboradores, acessos e cargos.', permission: 'manage:team' },
        { id: 'INTEGRATIONS', label: 'Integrações (API)', icon: Plug, description: 'Conexões externas (Gemini, iFood, WhatsApp).', permission: 'manage:settings' },
        { id: 'OPERATION', label: 'Operação', icon: SlidersHorizontal, description: 'Modos e tempos de pedido.', permission: 'manage:settings' },
        { id: 'HOURS', label: 'Horários', icon: Clock, description: 'Funcionamento do estabelecimento.', permission: 'manage:settings' },
        { id: 'DELIVERY', label: 'Delivery', icon: Truck, description: 'Taxas, raio e pedido mínimo.', permission: 'manage:settings' },
        { id: 'PAYMENT', label: 'Pagamento', icon: CreditCard, description: 'Meios aceitos e chaves Pix.', permission: 'manage:finance' },
        { id: 'MOTOBOYS', label: 'Entregadores', icon: Bike, description: 'Cadastro de motoboys (Logística).', permission: 'manage:logistics' },
        { id: 'INTERFACE', label: 'Interface', icon: LayoutGrid, description: 'Aparência do sistema.', permission: 'manage:settings' },
        { id: 'PRINTER', label: 'Impressão', icon: Printer, description: 'Tamanho do papel e vias.', permission: 'view:settings' },
        { id: 'SUBSCRIPTION', label: 'Assinatura', icon: Briefcase, description: 'Gerencie seu plano SUMMO.', permission: 'manage:settings' },
        { id: 'ADVANCED', label: 'Avançado', icon: Cpu, description: 'Notificações e dados locais.', permission: 'view:settings' },
        { id: 'SYSTEM', label: 'Sistema', icon: Activity, description: 'Troca de loja e diagnósticos.', permission: 'view:settings' },
    ];

    const menuItems = allMenuItems.filter(item => {
        if (role?.permissions.includes('*')) return true;
        if (item.id === 'MOTOBOYS') return hasPermission('manage:logistics') || hasPermission('manage:settings');
        return hasPermission(item.permission);
    });

    // --- EFFECTS ---

    useEffect(() => {
        const defaults = GET_DEFAULT_SETTINGS(tenantId);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalSettings(prev => ({
            ...defaults,
            ...contextSettings,
            printer: { ...defaults.printer, ...contextSettings?.printer },
            payment: { ...defaults.payment, ...contextSettings?.payment },
            delivery: { ...defaults.delivery, ...contextSettings?.delivery },
            interface: { ...defaults.interface, ...contextSettings?.interface }
        }));
        setHasChanges(false);
    }, [contextSettings, tenantId]);

    // Auto-select first available tab if current active is not visible
    useEffect(() => {
        if (menuItems.length > 0 && !menuItems.find(i => i.id === activeTab)) {
            setActiveTab(menuItems[0].id);
        }
    }, [menuItems, activeTab]);


    // --- HANDLERS ---

    const handleSave = () => {
        try {
            StoreSettingsSchema.parse(localSettings);
        } catch (err) {
            if (err instanceof z.ZodError) {
                const firstError = err.errors[0];
                const path = firstError.path.join(' > ');
                showToast(`Erro em "${path}": ${firstError.message}`, "error");
                return;
            }
        }
        setContextSettings(localSettings);
        setHasChanges(false);
        showToast("Configurações salvas com sucesso!", "success");
    };

    // Helper para atualização imutável de objetos aninhados
    const setNestedValue = (obj: any, path: string[], value: any): any => {
        const [head, ...tail] = path;
        if (tail.length === 0) {
            return { ...obj, [head]: value };
        }
        return {
            ...obj,
            [head]: setNestedValue(obj[head] || {}, tail, value)
        };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const keys = name.split('.');
        let parsedValue: any = value;
        if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;
        if (type === 'number') parsedValue = parseFloat(value) || 0;

        setLocalSettings(prev => setNestedValue(prev, keys, parsedValue));
        setHasChanges(true);
    };

    const handleScheduleChange = (dayIndex: number, field: string, value: any) => {
        if (field === 'initialize') {
            const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
            const newSchedule = days.map(d => ({
                day: d, openTime: '18:00', closeTime: '23:00', isOpen: true
            }));
            setLocalSettings(prev => ({ ...prev, schedule: newSchedule }));
            setHasChanges(true);
            return;
        }
        const newSchedule = [...localSettings.schedule];
        (newSchedule[dayIndex] as any)[field] = value;
        setLocalSettings(prev => ({ ...prev, schedule: newSchedule }));
        setHasChanges(true);
    };

    const toggleDockItem = (moduleId: string) => {
        const current = localSettings.dockItems || [];
        let updated: string[];
        if (current.includes(moduleId)) updated = current.filter(id => id !== moduleId);
        else updated = [...current, moduleId];
        setLocalSettings(prev => ({ ...prev, dockItems: updated }));
        setHasChanges(true);
    };

    const { data: drivers } = useDrivers();
    const [isImporting, setIsImporting] = useState(false);

    const handleImportMenu = async () => {
        if (!systemUser?.tenantId) return; // Fix: use systemUser.tenantId
        if (!window.confirm("Isso importará dados de exemplo do JC Espetaria. Deseja continuar?")) return;

        setIsImporting(true);
        try {
            const importer = new MenuImporter(systemUser.tenantId);
            await importer.runImport();
            showToast("Importação Inteligente concluída com sucesso!", "success");
        } catch (error) {
            console.error(error);
            showToast("Erro na importação.", "error");
        } finally {
            setIsImporting(false);
        }
    };

    const handleAddDriver = (driver: { name: string; phone: string; vehicle: string }) => {
        if (!driver.name || !driver.phone) return showToast("Nome e telefone são obrigatórios.", "error");
        handleAction('drivers', 'add', undefined, driver);
    };

    const handleDeleteDriver = (driverId: string) => {
        handleAction('drivers', 'delete', driverId);
    };

    const handleRequestNotifications = async () => {
        const granted = await requestNotificationPermission();
        setNotificationStatus(Notification.permission);
        if (granted) showToast('Notificações ativadas!', 'success');
        else showToast('Permissão negada ou bloqueada.', 'error');
    };

    const isLoadingRole = !role && !isMockMode;

    if (isLoadingRole) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00] to-orange-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <Shield size={64} className="text-[#FF6B00] relative z-10" />
                    <div className="absolute -bottom-2 -right-2 bg-white900 rounded-full p-1.5 shadow-lg">
                        <Loader2 size={20} className="text-[#FF6B00] animate-spin" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Validando Permissões...</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto">Conectando ao núcleo do sistema para verificar suas credenciais.</p>
            </div>
        );
    }

    if (menuItems.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <Lock size={48} className="text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">Acesso Restrito</h3>
                <p className="text-gray-500 mt-2">Você não tem permissão para visualizar nenhuma configuração.</p>
                <p className="text-gray-400 text-sm mt-1">Contate o administrador do tenant {tenantId}.</p>
                <button onClick={() => window.location.href = '/app'} className="mt-8 px-6 py-2 bg-gray-100 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors">Voltar para o Início</button>
            </div>
        );
    }


    const activeMenuItem = menuItems.find(item => item.id === activeTab);
    const ActiveIcon = activeMenuItem?.icon || StoreIcon;

    // Lazy loaded components for isolation
    const TeamSettingsLazy = React.lazy(() => import('../components/TeamSettings').then(module => ({ default: module.TeamSettings })));

    const renderContent = () => {
        const commonProps = { settings: localSettings, onChange: handleInputChange };

        switch (activeTab) {
            case 'STORE': return <StoreForm {...commonProps} />;
            case 'TEAM':
                return (
                    <ErrorBoundary>
                        <React.Suspense fallback={
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00] to-orange-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                    <Loader2 size={40} className="text-[#FF6B00] animate-spin relative z-10" />
                                </div>
                                <p className="text-slate-400 font-medium mt-4 animate-pulse">Carregando módulo de equipe...</p>
                            </div>
                        }>
                            <TeamSettingsLazy />
                        </React.Suspense>
                    </ErrorBoundary>
                );
            case 'OPERATION': return <OperationForm {...commonProps} />;
            case 'HOURS': return <ScheduleForm {...commonProps} onScheduleChange={handleScheduleChange} />;
            case 'DELIVERY': return <DeliveryForm {...commonProps} />;
            case 'PAYMENT': return <PaymentForm {...commonProps} />;
            case 'INTEGRATIONS': return <IntegrationsForm {...commonProps} />;
            case 'SUBSCRIPTION': return <SubscriptionSection />;
            case 'INTERFACE': return <InterfaceForm {...commonProps} onToggleDockItem={toggleDockItem} />;

            case 'PRINTER': return <PrinterForm {...commonProps} />;
            case 'MOTOBOYS': return <MotoboysSection drivers={drivers} onAddDriver={handleAddDriver} onDeleteDriver={handleDeleteDriver} />;
            case 'SYSTEM': return <SystemSection userEmail={user?.email ?? undefined} tenantId={tenantId} onLogout={logout} settings={localSettings} onUpdateSettings={setContextSettings} />;
            case 'ADVANCED': return <AdvancedSection settings={localSettings} onChange={handleInputChange} notificationStatus={notificationStatus} onRequestNotifications={handleRequestNotifications} />;
            default: return null;
        }
    };

    return (
        <PageContainer className="h-full flex flex-col">

            <div className="h-full flex flex-col md:flex-row bg-gray-50/50 animate-fade-in relative">
                {/* Mobile View */}
                <div className="md:hidden flex flex-col h-full">
                    <div className="flex-none bg-white border-b border-gray-200 z-30 shadow-sm relative">
                        <div className="flex items-center justify-between p-4 pb-2">
                            <h2 className="text-xl font-bold text-summo-dark">Configurações</h2>
                            {hasChanges && <button onClick={handleSave} className="bg-emerald-500 text-white p-2 rounded-full shadow-lg animate-bounce"><Save size={20} /></button>}
                        </div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-thin snap-x px-4 pb-3">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border snap-start ${activeTab === item.id ? 'bg-summo-dark text-white border-summo-dark shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'}`}
                                >
                                    <item.icon size={16} /> {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 pb-24">
                        <ErrorBoundary>
                            {renderContent()}
                        </ErrorBoundary>
                    </div>
                </div>

                {/* Desktop View: Control Panel + Form */}
                <div className="hidden md:grid grid-cols-12 gap-8 flex-1 p-8 overflow-hidden">
                    {/* Control Panel (Primary Navigation) */}
                    <div
                        className="col-span-5 lg:col-span-4 overflow-y-auto scrollbar-thin scroll-smooth relative"
                        role="tablist"
                        aria-label="Categorias de configuração"
                    >
                        <h2 className="text-2xl font-bold text-gray-800">Painel de Controle</h2>
                        <p className="text-sm text-gray-500 mt-1">Selecione uma categoria para editar.</p>
                        <div className="space-y-3 mt-6">
                            {menuItems.map(item => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-4 focus-visible:outline-summo-primary ${isActive ? 'bg-white border-summo-primary shadow-lg' : 'bg-white border-transparent hover:border-summo-primary/50 hover:shadow-md'}`}
                                    >
                                        <div className={`p-3 rounded-xl ${isActive ? 'bg-summo-bg text-summo-primary' : 'bg-gray-100 text-gray-500'}`}><Icon size={20} /></div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{item.label}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                        <div className="pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Wand2 className="text-purple-500" /> Ferramentas de IA (Beta)
                            </h3>
                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-800">Importador Inteligente de Cardápio</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Engenharia reversa de cardápios (iFood/PDF) para gerar produtos, receitas e insumos automaticamente.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleImportMenu}
                                        disabled={isImporting}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isImporting ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                                        Importar "JC Espetaria"
                                    </button>
                                </div>
                                <div className="text-xs text-purple-600 bg-purple-100 p-3 rounded-lg flex items-center gap-2">
                                    <Info size={14} />
                                    <span>Isso irá popular seu sistema com 20+ produtos, insumos e receitas simuladas do JC Espetaria.</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Form Panel (Secondary View) */}
                    <div
                        className="col-span-7 lg:col-span-8 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                        role="tabpanel"
                        id={`panel-${activeTab}`}
                        aria-labelledby={`tab-${activeTab}`}
                    >
                        <div className="p-6 border-b border-gray-100 z-10 bg-white/80 backdrop-blur-md flex-shrink-0">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <ActiveIcon className="text-summo-primary" size={24} aria-hidden="true" />
                                {activeMenuItem?.label}
                            </h3>
                        </div>
                        <div
                            className="flex-1 overflow-y-auto scrollbar-summo scroll-smooth relative"
                        >
                            <div className="p-6">
                                <ErrorBoundary>
                                    {renderContent()}
                                </ErrorBoundary>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                            <button onClick={handleSave} disabled={!hasChanges} className={`w-full py-3 rounded-xl font-bold shadow-sm transition flex items-center justify-center gap-2 ${hasChanges ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                <Save size={18} /> {hasChanges ? 'Salvar Alterações' : 'Salvo'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </PageContainer>
    );
};

export default Settings;
