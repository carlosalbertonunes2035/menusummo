import React, { useState } from 'react';
import { UserPlus, Phone, Mail, ArrowRight, Crown, Users, ChefHat, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import { OwnerRole } from './types';
import { formatPhone, isValidPhone, isValidEmail, isValidName } from '@/utils/validations';

interface RegisterStep1Props {
    ownerName: string;
    setOwnerName: (val: string) => void;
    ownerRole: OwnerRole;
    setOwnerRole: (val: OwnerRole) => void;
    phone: string;
    setPhone: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const roleOptions = [
    { value: 'owner' as OwnerRole, label: 'Proprietário', icon: Crown, color: 'text-amber-500' },
    { value: 'manager' as OwnerRole, label: 'Gerente', icon: Briefcase, color: 'text-blue-500' },
    { value: 'chef' as OwnerRole, label: 'Chef', icon: ChefHat, color: 'text-orange-500' },
    { value: 'other' as OwnerRole, label: 'Outro', icon: Users, color: 'text-gray-500' }
];

export const RegisterStep1: React.FC<RegisterStep1Props> = ({
    ownerName, setOwnerName, ownerRole, setOwnerRole, phone, setPhone, email, setEmail, onSubmit
}) => {
    const [touched, setTouched] = useState({
        name: false,
        phone: false,
        email: false
    });

    const validations = {
        name: ownerName.length > 0 && isValidName(ownerName),
        phone: phone.length > 0 && isValidPhone(phone),
        email: email.length > 0 && isValidEmail(email)
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setPhone(formatted);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({ name: true, phone: true, email: true });

        if (validations.name && validations.phone && validations.email) {
            onSubmit(e);
        }
    };

    return (
        <div className="space-y-6 animate-slide-in-up" key="step1">
            <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-summo-primary to-orange-600 mb-3 shadow-lg shadow-summo-primary/25">
                    <UserPlus size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-summo-text">Prazer em conhecer você! 👋</h3>
                <p className="text-sm text-summo-text-muted mt-2">Você está criando seu acesso ao SUMMO</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Owner Name */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Seu Nome Completo</label>
                    <div className="relative group">
                        <UserPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary transition-colors" />
                        <input
                            type="text"
                            value={ownerName}
                            onChange={e => setOwnerName(e.target.value)}
                            onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                            className={`w-full pl-11 pr-12 py-4 bg-gray-50 border-2 rounded-2xl focus:bg-white outline-none transition-all font-medium text-summo-text placeholder:text-gray-400 ${touched.name
                                    ? validations.name
                                        ? 'border-green-500 focus:border-green-500'
                                        : 'border-red-500 focus:border-red-500'
                                    : 'border-gray-200 focus:border-summo-primary'
                                }`}
                            placeholder="Ex: João da Silva"
                            required
                            autoFocus
                        />
                        {touched.name && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {validations.name ? (
                                    <CheckCircle size={20} className="text-green-500" />
                                ) : (
                                    <AlertCircle size={20} className="text-red-500" />
                                )}
                            </div>
                        )}
                    </div>
                    {touched.name && !validations.name && (
                        <p className="text-red-600 text-xs mt-1 ml-1">Digite seu nome completo (nome e sobrenome)</p>
                    )}
                </div>

                {/* Owner Role */}
                <div>
                    <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">Qual é o seu papel?</label>
                    <div className="grid grid-cols-4 gap-2">
                        {roleOptions.map((role) => (
                            <button
                                key={role.value}
                                type="button"
                                onClick={() => setOwnerRole(role.value)}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${ownerRole === role.value
                                        ? 'border-summo-primary bg-summo-primary/5 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <role.icon size={20} className={ownerRole === role.value ? 'text-summo-primary' : role.color} />
                                <span className={`text-[10px] font-bold uppercase ${ownerRole === role.value ? 'text-summo-primary' : 'text-gray-600'}`}>
                                    {role.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">WhatsApp</label>
                        <div className="relative group">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary transition-colors" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                                className={`w-full pl-11 pr-12 py-4 bg-gray-50 border-2 rounded-2xl focus:bg-white outline-none transition-all font-medium text-summo-text placeholder:text-gray-400 ${touched.phone
                                        ? validations.phone
                                            ? 'border-green-500 focus:border-green-500'
                                            : 'border-red-500 focus:border-red-500'
                                        : 'border-gray-200 focus:border-summo-primary'
                                    }`}
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                                required
                            />
                            {touched.phone && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {validations.phone ? (
                                        <CheckCircle size={20} className="text-green-500" />
                                    ) : (
                                        <AlertCircle size={20} className="text-red-500" />
                                    )}
                                </div>
                            )}
                        </div>
                        {touched.phone && !validations.phone && (
                            <p className="text-red-600 text-xs mt-1 ml-1">Digite um número válido com DDD</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-summo-text-muted uppercase mb-2 ml-1 tracking-wider">E-mail</label>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-summo-primary transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value.toLowerCase())}
                                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                                className={`w-full pl-11 pr-12 py-4 bg-gray-50 border-2 rounded-2xl focus:bg-white outline-none transition-all font-medium text-summo-text placeholder:text-gray-400 ${touched.email
                                        ? validations.email
                                            ? 'border-green-500 focus:border-green-500'
                                            : 'border-red-500 focus:border-red-500'
                                        : 'border-gray-200 focus:border-summo-primary'
                                    }`}
                                placeholder="joao@empresa.com"
                                required
                            />
                            {touched.email && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {validations.email ? (
                                        <CheckCircle size={20} className="text-green-500" />
                                    ) : (
                                        <AlertCircle size={20} className="text-red-500" />
                                    )}
                                </div>
                            )}
                        </div>
                        {touched.email && !validations.email && (
                            <p className="text-red-600 text-xs mt-1 ml-1">Digite um e-mail válido</p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-summo-primary to-orange-600 text-white py-4 font-bold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-summo-primary/30 flex justify-center items-center gap-2 mt-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!validations.name || !validations.phone || !validations.email}
                >
                    Continuar para o Negócio <ArrowRight size={20} />
                </button>
            </form>
        </div>
    );
};
