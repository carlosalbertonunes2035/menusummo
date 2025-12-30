import React, { useState } from 'react';
import { Plus, Trash2, Bike } from 'lucide-react';
import { Driver } from '../../../types';

interface MotoboysSectionProps {
    drivers: Driver[];
    onAddDriver?: (driver: { name: string; phone: string; vehicle: string }) => void;
    onDeleteDriver?: (driverId: string) => void;
}

const MotoboysSection: React.FC<MotoboysSectionProps> = ({ drivers, onAddDriver, onDeleteDriver }) => {
    const [newDriver, setNewDriver] = useState({ name: '', phone: '', vehicle: '' });

    const handleAdd = () => {
        if (!newDriver.name || !newDriver.phone) return;
        onAddDriver(newDriver);
        setNewDriver({ name: '', phone: '', vehicle: '' });
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-4 text-gray-800">Equipe de Entrega (Logística)</h4>
                <p className="text-xs text-gray-500 mb-4">Estes cadastros aparecem na tela de expedição para atribuição de pedidos.</p>
                <div className="space-y-3">
                    {drivers.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">Nenhum entregador.</p>
                    ) : (
                        drivers.map(d => (
                            <div key={d.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <p className="font-bold text-sm text-gray-800">{d.name}</p>
                                    <p className="text-xs text-gray-500">{d.phone} • {d.vehicle}</p>
                                </div>
                                <button
                                    onClick={() => onDeleteDriver(d.id)}
                                    className="p-2 bg-white text-red-400 hover:text-red-600 rounded-lg border border-gray-200 shadow-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-4 text-gray-800">Novo Entregador</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        type="text"
                        placeholder="Nome"
                        value={newDriver.name}
                        onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Telefone"
                        value={newDriver.phone}
                        onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Veículo (Ex: Honda CG)"
                        value={newDriver.vehicle}
                        onChange={e => setNewDriver({ ...newDriver, vehicle: e.target.value })}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    className="mt-4 w-full bg-summo-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-summo-primary transition shadow-lg"
                >
                    <Plus size={18} /> Cadastrar Entregador
                </button>
            </div>
        </div>
    );
};

export default MotoboysSection;
