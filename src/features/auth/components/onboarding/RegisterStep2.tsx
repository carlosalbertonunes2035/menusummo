import React, { useState } from 'react';
import { Building2, MapPin, Loader2, ArrowRight, Store, Lock, Eye, EyeOff, ArrowLeft, Truck, ShoppingBag, Coffee, Cake, Check, X } from 'lucide-react';
import { formatCNPJ } from '../../../../services/cnpjService';
import { Address, EstablishmentType, OperationTime } from './types';
import { getPasswordStrength } from '@/utils/validations';

interface RegisterStep2Props {
    businessName: string;
    setBusinessName: (val: string) => void;
    establishmentType: EstablishmentType;
    setEstablishmentType: (val: EstablishmentType) => void;
    operationTime: OperationTime;
    setOperationTime: (val: OperationTime) => void;
    password: string;
    setPassword: (val: string) => void;
    passwordConfirm: string;
    setPasswordConfirm: (val: string) => void;
    cnpj: string;
    setCnpj: (val: string) => void;
    cnpjLoading: boolean;
    onCnpjBlur: () => void;
    address: Address;
    onBack: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

const establishmentTypes = [
    { value: 'restaurant' as EstablishmentType, label: 'Restaurante', icon: Store },
    { value: 'snack_bar' as EstablishmentType, label: 'Lanchonete', icon: ShoppingBag },
    { value: 'food_truck' as EstablishmentType, label: 'Food Truck', icon: Truck },
    { value: 'bakery' as EstablishmentType, label: 'Padaria', icon: Coffee },
    { value: 'confectionery' as EstablishmentType, label: 'Confeitaria', icon: Cake },
    { value: 'other' as EstablishmentType, label: 'Outro', icon: Building2 }
];

const operationTimes = [
    { value: 'new' as OperationTime, label: 'Novo' },
    { value: '1-2y' as OperationTime, label: '1-2 anos' },
    { value: '3-5y' as OperationTime, label: '3-5 anos' },
    { value: '5y+' as OperationTime, label: '5+ anos' }
];

export const RegisterStep2: React.FC<RegisterStep2Props> = ({
    businessName, setBusinessName, establishmentType, setEstablishmentType,
    operationTime, setOperationTime, password, setPassword, passwordConfirm, setPasswordConfirm,
    cnpj, setCnpj, cnpjLoading, onCnpjBlur, address, onBack, onSubmit
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const passwordStrength = getPasswordStrength(password);
    const passwordsMatch = password === passwordConfirm && password.length > 0;

    return (
        <div className="space-y-6 animate-slide-in-up" key="step2">
            <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-3 shadow-lg shadow-blue-500/25">
                    <Building2 size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-summo-text">Agora sobre o seu negócio 🏪</h3>
                <p className="text-sm text-summo-text-muted mt-2">Esses dados criam seu login de acesso</p>
            </div>

            <div className="space-y-5">
                {/* Business Name */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Nome do Negócio</label>
                    <div className="relative group">
                        <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary transition-colors" />
                        <input
                            type="text"
                            value={businessName}
                            onChange={e => setBusinessName(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-summo-primary focus:bg-white outline-none transition-all font-medium text-summo-text placeholder:text-gray-400"
                            placeholder="Ex: Burger da Vila"
                            required
                            autoFocus
                        />
                    </div>
                </div>

                {/* Establishment Type */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Tipo de Estabelecimento</label>
                    <div className="grid grid-cols-3 gap-2">
                        {establishmentTypes.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setEstablishmentType(type.value)}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${establishmentType === type.value
                                    ? 'border-summo-primary bg-summo-primary/5 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <type.icon size={18} className={establishmentType === type.value ? 'text-summo-primary' : 'text-gray-400'} />
                                <span className={`text-[10px] font-bold uppercase ${establishmentType === type.value ? 'text-summo-primary' : 'text-gray-600'}`}>
                                    {type.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Operation Time */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Tempo de Operação</label>
                    <div className="grid grid-cols-4 gap-2">
                        {operationTimes.map((time) => (
                            <button
                                key={time.value}
                                type="button"
                                onClick={() => setOperationTime(time.value)}
                                className={`p-3 rounded-xl border-2 flex items-center justify-center transition-all ${operationTime === time.value
                                    ? 'border-summo-primary bg-summo-primary/5 text-summo-primary shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <span className="text-xs font-bold">{time.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Senha de Acesso</label>
                    <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary transition-colors" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-summo-primary focus:bg-white outline-none transition-all font-medium text-summo-text"
                            placeholder="Crie uma senha forte"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-summo-primary transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {password && (
                        <div className="mt-3 space-y-2 animate-fade-in">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-600">Força da senha:</span>
                                <span className={`text-xs font-bold ${passwordStrength.strength >= 75 ? 'text-green-600' :
                                    passwordStrength.strength >= 50 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                    style={{ width: `${passwordStrength.strength}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {[
                                    { key: 'length', label: 'Mín. 8 caracteres' },
                                    { key: 'uppercase', label: 'Letra maiúscula' },
                                    { key: 'lowercase', label: 'Letra minúscula' },
                                    { key: 'numbers', label: 'Número' },
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex items-center gap-1.5">
                                        {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                                            <Check size={14} className="text-green-500" />
                                        ) : (
                                            <X size={14} className="text-gray-300" />
                                        )}
                                        <span className={`text-xs ${passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                                            ? 'text-green-600 font-medium'
                                            : 'text-gray-400'
                                            }`}>
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Confirmation */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Confirme sua Senha</label>
                    <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary transition-colors" />
                        <input
                            type={showPasswordConfirm ? 'text' : 'password'}
                            value={passwordConfirm}
                            onChange={e => setPasswordConfirm(e.target.value)}
                            className={`w-full pl-11 pr-12 py-4 bg-gray-50 border-2 rounded-2xl focus:bg-white outline-none transition-all font-medium text-summo-text ${passwordConfirm.length > 0
                                ? passwordsMatch
                                    ? 'border-green-500 focus:border-green-500'
                                    : 'border-red-500 focus:border-red-500'
                                : 'border-gray-200 focus:border-summo-primary'
                                }`}
                            placeholder="Digite a senha novamente"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-summo-primary transition-colors"
                        >
                            {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {passwordConfirm && !passwordsMatch && (
                        <p className="text-red-600 text-xs mt-1 ml-1 flex items-center gap-1">
                            <X size={14} /> As senhas não coincidem
                        </p>
                    )}
                    {passwordsMatch && (
                        <p className="text-green-600 text-xs mt-1 ml-1 flex items-center gap-1 animate-fade-in">
                            <Check size={14} /> Senhas coincidem!
                        </p>
                    )}
                </div>

                {/* CNPJ (Optional) */}
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <div className="flex items-start gap-3 mb-3">
                        <Building2 size={18} className="text-blue-600 mt-0.5" />
                        <p className="text-xs text-blue-800 leading-relaxed font-medium">
                            <strong>Opcional:</strong> Insira o CNPJ para preenchermos os dados automaticamente.
                        </p>
                    </div>

                    <div className="relative group">
                        <input
                            type="text"
                            value={formatCNPJ(cnpj)}
                            onChange={e => setCnpj(e.target.value)}
                            onBlur={onCnpjBlur}
                            className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:border-summo-primary outline-none font-mono text-sm shadow-sm"
                            placeholder="00.000.000/0000-00"
                        />
                        {cnpjLoading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-summo-primary animate-spin" />}
                    </div>
                </div>

                {/* Address Preview */}
                {address.street && (
                    <div className="animate-fade-in p-4 bg-green-50 border border-green-200 rounded-2xl">
                        <label className="block text-[10px] font-bold text-green-700 uppercase mb-2 tracking-widest">✓ Localização Detectada</label>
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-green-600 mt-0.5" />
                            <p className="text-sm text-green-800 font-medium leading-tight">
                                {address.street}, {address.number}<br />
                                {address.neighborhood} - {address.city}/{address.state}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={18} /> Voltar
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!businessName || password.length < 6 || !passwordsMatch}
                    className="flex-[2] bg-gradient-to-r from-summo-primary to-orange-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-summo-primary/30 flex justify-center items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Próximo Passo <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};
