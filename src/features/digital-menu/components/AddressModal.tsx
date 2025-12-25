// components/public/AddressModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Crosshair, Loader2, MapPin } from 'lucide-react';
import { StoreSettings } from '../../../types';

interface AddressModalProps {
    user: {
        name: string;
        phone: string;
        address?: string;
        location?: { lat: number; lng: number } | null;
    };
    settings: StoreSettings;
    onSave: (address: string, coords?: { lat: number, lng: number }) => void;
    onClose: () => void
}

const AddressModal: React.FC<AddressModalProps> = ({ user, settings, onSave, onClose }) => {
    const [form, setForm] = useState({ street: '', number: '', district: '', complement: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user.address) {
            const parts = user.address.split(', ');
            const numberAndDistrict = parts[1] ? parts[1].split(' - ') : ['', ''];
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm({
                street: parts[0] || '',
                number: numberAndDistrict[0] || '',
                district: numberAndDistrict[1] || '',
                complement: parts[2] || ''
            });
        }
    }, [user.address]);

    const handleUseLocation = () => {
        setIsLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                // Mock Reverse Geocoding
                // Em produção, isso chamaria uma API real.
                setTimeout(() => {
                    const mockAddresses = [
                        { street: 'Av. Paulista', district: 'Bela Vista', number: '1578' },
                        { street: 'Rua Augusta', district: 'Consolação', number: '500' },
                        { street: 'Av. Brigadeiro Faria Lima', district: 'Pinheiros', number: '2230' }
                    ];
                    const random = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];

                    setForm({
                        street: random.street,
                        district: random.district,
                        number: random.number,
                        complement: ''
                    });
                    setIsLoading(false);
                }, 1500);
            }, () => {
                alert("Não foi possível obter sua localização precisa. Por favor, digite seu endereço.");
                setIsLoading(false);
            }, { enableHighAccuracy: true, timeout: 5000 });
        } else {
            alert("Geolocalização não suportada neste navegador.");
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!form.street || !form.number || !form.district) {
            alert("Por favor, preencha Rua, Número e Bairro.");
            return;
        }
        const fullAddress = `${form.street}, ${form.number} - ${form.district}${form.complement ? `, ${form.complement}` : ''} `;
        // Mock coordinates center of Sao Paulo for demo
        onSave(fullAddress, { lat: -23.550520, lng: -46.633308 });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in" onClick={onClose}>
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-t-[2rem] w-full max-w-lg mx-auto flex flex-col shadow-2xl animate-slide-in-up max-h-[85vh]">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <MapPin className="text-summo-primary" /> Endereço de Entrega
                    </h3>
                    <button onClick={onClose} className="bg-gray-100 p-2 rounded-full text-gray-500"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto pb-safe">
                    <button onClick={handleUseLocation} disabled={isLoading} className="w-full py-4 bg-blue-50 text-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition border border-blue-100 shadow-sm relative overflow-hidden">
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Crosshair size={20} />}
                        {isLoading ? 'Buscando endereço...' : 'Usar minha localização atual'}
                    </button>

                    <div className="flex items-center gap-4 text-gray-300 text-xs font-bold uppercase"><div className="h-px bg-gray-200 flex-1"></div>OU PREENCHA<div className="h-px bg-gray-200 flex-1"></div></div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Rua / Avenida</label>
                            <input placeholder="Ex: Av. Brasil" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary font-medium transition-all" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Número</label>
                                <input placeholder="123" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary font-medium transition-all" type="tel" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Bairro</label>
                                <input placeholder="Ex: Centro" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary font-medium transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Complemento (Opcional)</label>
                            <input placeholder="Ex: Apto 101, Ao lado da padaria" value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary font-medium transition-all" />
                        </div>
                    </div>

                    <button onClick={handleSubmit} className="w-full py-4 bg-summo-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-summo-primary/30 hover:bg-summo-dark transition mt-2 active:scale-95">
                        Confirmar Endereço
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;
