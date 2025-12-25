import React, { useState } from 'react';
import { Building2, Search, Loader2, Sparkles, MapPin, Calculator, Lock, Edit3 } from 'lucide-react';
import { useApp } from '../../../../contexts/AppContext';
import AddressAutocomplete from '../../../../components/ui/AddressAutocomplete';
import { GeocodeResult } from '../../../../services/googleMapsService';
import { fetchCNPJData, formatCNPJ, validateCNPJ } from '../../../../services/cnpjService';
import { SettingsFormProps } from './types';
import { inputClass, labelClass, cardClass } from './shared';

export const StoreForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => {
    const { showToast } = useApp();
    const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);

    const handleCNPJLookup = async () => {
        if (!settings.cnpj) {
            showToast('Digite um CNPJ para buscar', 'error');
            return;
        }

        if (!validateCNPJ(settings.cnpj)) {
            showToast('CNPJ inválido', 'error');
            return;
        }

        setIsLoadingCNPJ(true);
        try {
            const data = await fetchCNPJData(settings.cnpj);

            if (data) {
                // Auto-fill form fields
                const updateField = (name: string, value: string) => {
                    onChange({ target: { name, value, type: 'text' } } as React.ChangeEvent<HTMLInputElement>);
                };

                updateField('company.legalName', data.nome);
                updateField('brandName', data.fantasia || data.nome);
                updateField('company.cnpj', formatCNPJ(data.cnpj));
                // Update company.address sub-fields
                updateField('company.address.street', data.logradouro);
                updateField('company.address.number', data.numero);
                updateField('company.address.neighborhood', data.bairro);
                updateField('company.address.city', data.municipio);
                updateField('company.address.state', data.uf);
                updateField('company.address.zip', data.cep);

                updateField('company.phone', data.telefone);

                showToast('Dados da empresa carregados com sucesso!', 'success');
            }
        } catch (error: any) {
            showToast(error.message || 'Erro ao buscar CNPJ', 'error');
        } finally {
            setIsLoadingCNPJ(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cardClass}>
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><Building2 size={20} /> Dados Cadastrais (Fiscal)</h4>
                <p className="text-xs text-slate-500">Informações legais da empresa para notas fiscais e relatórios.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Razão Social</label><input type="text" name="company.legalName" value={settings.company?.legalName || ''} onChange={onChange} className={inputClass} placeholder="Razão Social Ltda" /></div>
                    <div>
                        <label className={labelClass}>CNPJ</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="company.cnpj"
                                value={settings.company?.cnpj || ''}
                                onChange={onChange}
                                className={inputClass}
                                placeholder="00.000.000/0001-00"
                            />
                            <button
                                onClick={handleCNPJLookup}
                                disabled={isLoadingCNPJ}
                                className="bg-summo-primary hover:bg-summo-dark text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                title="Buscar dados da empresa pela Receita Federal"
                            >
                                {isLoadingCNPJ ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                {isLoadingCNPJ ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>
                        <p className="text-xs text-summo-primary mt-1 flex items-center gap-1">
                            <Sparkles size={12} />
                            Digite o CNPJ e clique em "Buscar" para preencher automaticamente
                        </p>
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Unidade / Filial</label>
                    <input type="text" name="unitName" value={settings.unitName} onChange={onChange} className={inputClass} placeholder="Ex: Matriz, Loja 02..." />
                </div>
            </div>

            {/* FINANCIAL INTELLIGENCE SETTINGS - NEW */}
            <div className={cardClass}>
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><Calculator size={20} /> Inteligência de Precificação</h4>
                <p className="text-xs text-slate-500">Dados usados para calcular sugestões de preços e margens reais.</p>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className={labelClass}>Impostos (Simples/Outros)</label>
                        <div className="relative"><input type="number" name="financial.taxRate" value={settings.financial?.taxRate || 0} onChange={onChange} className={`${inputClass} pr-8`} placeholder="0" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span></div>
                        <p className="text-[10px] text-slate-400 mt-1">DAS, ICMS, etc sobre faturamento.</p>
                    </div>
                </div>
            </div>

            <div className={cardClass}>
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><MapPin size={20} /> Localização e Contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Telefone Principal</label><input type="text" name="company.phone" value={settings.company?.phone || ''} onChange={onChange} className={inputClass} /></div>
                    <div>
                        <label className={labelClass}>Endereço Completo</label>
                        <AddressAutocomplete
                            value={settings.address}
                            onChange={(addr) => onChange({ target: { name: 'address', value: addr } } as any)}
                            onSelect={(result: GeocodeResult) => {
                                onChange({ target: { name: 'address', value: result.address } } as any);
                                // Also update nested lat/lng if available
                                if (result.lat && result.lng) {
                                    onChange({ target: { name: 'company.location', value: { lat: result.lat, lng: result.lng } } } as any);
                                }
                            }}
                            placeholder="Digite o endereço da loja..."
                        />
                    </div>
                </div>
            </div>

            <div className={cardClass}>
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><Lock size={20} /> Segurança e Acesso da Conta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Email do Admin</label>
                        <input type="email" disabled value="admin@loja.com" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className={labelClass}>Alterar Senha</label>
                        <button className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-100:bg-slate-700 text-left flex justify-between items-center group">
                            <span>********</span> <Edit3 size={16} className="text-slate-400 group-hover:text-summo-primary" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};
