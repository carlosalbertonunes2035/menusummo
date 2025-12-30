'use client';



// components/public/ProfileTab.tsx
import React from 'react';
import { User, MapPin, LogOut, Smartphone, Shield } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { useToast } from '../../../contexts/ToastContext';


interface ProfileTabProps {
    user: { name: string; phone: string; address?: string };
    setUser: (user: Partial<{ name: string; phone: string; address: string }>) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user, setUser }) => {
    const { showToast } = useToast();


    const handleLogout = () => {
        if (window.confirm('Tem certeza que deseja sair? Seus dados de perfil serão limpos.')) {
            setUser({ name: '', phone: '', address: '' });
        }
    };

    const handleSync = () => {
        showToast('Código de verificação enviado! (Funcionalidade em desenvolvimento)', 'info');
    };

    return (
        <div className="py-4 space-y-6 pb-24">
            <div className="flex items-center gap-4 mb-6 px-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                    {user.name ? user.name[0].toUpperCase() : <User size={32} />}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{user.name || 'Visitante'}</h2>
                    <p className="text-sm text-gray-500">{user.phone || 'Sem telefone'}</p>
                </div>
            </div>

            <div className="space-y-4 px-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><User size={18} /> Dados Pessoais</h3>
                    <div className="space-y-3">
                        <input placeholder="Seu Nome" value={user.name} onChange={e => setUser({ name: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-summo-primary" />
                        <input placeholder="Seu Telefone (WhatsApp)" value={user.phone} onChange={e => setUser({ phone: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-summo-primary" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><MapPin size={18} /> Endereço Padrão</h3>
                    <textarea placeholder="Seu endereço salvo aparecerá aqui." value={user.address} readOnly className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none resize-none h-24 text-gray-500 cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-2">*Para alterar o endereço, edite na sacola de compras.</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Shield size={18} /> Sincronizar Conta</h3>
                    <p className="text-xs text-gray-500 mb-4">Acesse seus pedidos e endereços salvos em qualquer dispositivo. Enviaremos um código para seu WhatsApp para confirmar sua identidade.</p>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input placeholder="Seu Telefone" className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-summo-primary" />
                        </div>
                        <button onClick={handleSync} className="bg-summo-primary text-white font-bold px-4 rounded-lg hover:bg-summo-dark transition">Sincronizar</button>
                    </div>
                </div>


                <button onClick={handleLogout} className="w-full py-3 text-red-500 font-bold bg-red-50 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition"><LogOut size={18} /> Sair da Conta</button>
            </div>
        </div>
    );
};

export default ProfileTab;
