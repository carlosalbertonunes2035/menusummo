import React from 'react';
import { Ticket, Layout } from 'lucide-react';
import { useCouponTable } from './useCouponTable';
import { RobotService } from '@/services/robotService';

export const CouponTable: React.FC = () => {
    const {
        coupons,
        isCreating,
        setIsCreating,
        formData,
        setFormData,
        getAnalytics,
        handleCreate,
        toggleStatus,
        handleDelete
    } = useCouponTable();

    return (
        <div className="space-y-6">
            {/* Header & Create Button */}
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <Ticket size={24} className="text-rose-500" /> Gestão de Cupons
                    </h3>
                    <p className="text-sm text-gray-500">Crie, monitore e gerencie suas campanhas de desconto.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className={`px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${isCreating ? 'bg-gray-100 text-gray-600' : 'bg-rose-600 text-white shadow-lg shadow-rose-200'}`}
                >
                    {isCreating ? 'Cancelar' : 'Novo Cupom'}
                </button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-rose-100 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                    <h4 className="font-bold text-gray-800 mb-4">Configurar Novo Cupom</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Código do Cupom</label>
                            <input
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full p-3 border rounded-xl uppercase font-bold bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-rose-500"
                                placeholder="Ex: BEMVINDO10"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Desconto</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                                className="w-full p-3 border rounded-xl bg-gray-50 outline-none"
                            >
                                <option value="PERCENTAGE">Porcentagem (%)</option>
                                <option value="FIXED">Valor Fixo (R$)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Valor do Desconto</label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                                className="w-full p-3 border rounded-xl font-bold text-green-600 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Pedido Mínimo (R$)</label>
                            <input
                                type="number"
                                value={formData.minOrderValue}
                                onChange={e => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                                className="w-full p-3 border rounded-xl outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Limite de Usos (0 = Infinito)</label>
                            <input
                                type="number"
                                value={formData.usageLimit}
                                onChange={e => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                className="w-full p-3 border rounded-xl outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase w-full mb-1">Sugestões Rápidas:</span>
                        {RobotService.getCouponTemplates().map(tpl => (
                            <button
                                key={tpl.code}
                                onClick={() => setFormData({
                                    code: tpl.code,
                                    type: tpl.type as 'PERCENTAGE' | 'FIXED',
                                    value: tpl.value,
                                    minOrderValue: (tpl as any).minOrderValue || 0,
                                    usageLimit: 0
                                })}
                                className="text-[10px] font-bold px-2 py-1 rounded bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition"
                            >
                                + {tpl.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleCreate} className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition shadow-md">
                        Criar Campanha
                    </button>
                </div>
            )}

            {/* Coupons List */}
            <div className="grid grid-cols-1 gap-4">
                {coupons.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <Ticket size={48} className="mx-auto mb-2 text-gray-300" />
                        <p>Nenhum cupom ativo no momento.</p>
                    </div>
                ) : (
                    coupons.map(coupon => {
                        const stats = getAnalytics(coupon.code);
                        return (
                            <div key={coupon.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-all ${coupon.isActive ? 'border-gray-200 opacity-100' : 'border-gray-100 opacity-60 bg-gray-50'}`}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    {/* Info Left */}
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                            <Ticket size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xl text-gray-800 tracking-wide">{coupon.code}</h4>
                                            <p className="text-sm font-medium text-gray-500">
                                                {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `R$ ${coupon.value.toFixed(2)} OFF`}
                                                {(coupon.minOrderValue || 0) > 0 && ` • Mín. R$ ${coupon.minOrderValue}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Middle */}
                                    <div className="flex-1 w-full md:w-auto grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Usos</p>
                                            <p className="font-bold text-gray-700">{stats.count}</p>
                                        </div>
                                        <div className="text-center border-l border-gray-200">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Faturamento</p>
                                            <p className="font-bold text-green-600">R$ {stats.revenue.toFixed(2)}</p>
                                        </div>
                                        <div className="text-center border-l border-gray-200">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Desc. Dado</p>
                                            <p className="font-bold text-rose-500">R$ {stats.discount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Actions Right */}
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => toggleStatus(coupon)}
                                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold border transition ${coupon.isActive ? 'border-gray-300 text-gray-600 hover:bg-gray-100' : 'bg-green-600 text-white border-green-600 hover:bg-green-700'}`}
                                        >
                                            {coupon.isActive ? 'Pausar' : 'Ativar'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="px-3 py-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                                        >
                                            <span className="sr-only">Excluir</span>
                                            <Layout size={16} className="rotate-45" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
