import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { StoreSettings } from '../../../../types';

interface AcceptedPaymentsCardProps {
    settings: StoreSettings;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const AcceptedPaymentsCard: React.FC<AcceptedPaymentsCardProps> = ({ settings, onChange }) => {
    const bankAccounts = settings.bankAccounts || [];

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" /> Meios de Pagamento e Destinos
            </h3>

            <div className="space-y-4">
                {/* Dinheiro */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-700 text-sm">Dinheiro (Espécie)</span>
                    <div className="flex items-center gap-3">
                        <select
                            name="financial.payment.destinations.cash"
                            value={(settings.financial?.payment as any)?.destinations?.cash || ''}
                            onChange={onChange}
                            className="text-xs p-2 rounded-lg border border-gray-200 bg-white font-medium text-gray-600 outline-none focus:border-emerald-500"
                        >
                            <option value="">Selecione o Destino...</option>
                            {bankAccounts.filter(a => a.accountType === 'CASH_DRAWER' || a.accountType === 'WALLET').map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="payment.acceptCash" checked={settings.payment?.acceptCash || false} onChange={onChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>
                </div>

                {/* Pix */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-700 text-sm">Pix</span>
                        <div className="flex items-center gap-3">
                            <select
                                name="financial.payment.destinations.pix"
                                value={(settings.financial?.payment as any)?.destinations?.pix || ''}
                                onChange={onChange}
                                className="text-xs p-2 rounded-lg border border-gray-200 bg-white font-medium text-gray-600 outline-none focus:border-emerald-500"
                            >
                                <option value="">Conta de Destino...</option>
                                {bankAccounts.filter(a => a.accountType === 'CHECKING' || a.accountType === 'SAVINGS').map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="payment.acceptPix" checked={settings.payment?.acceptPix || false} onChange={onChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>
                    {settings.payment?.acceptPix && (
                        <div className="animate-in slide-in-from-top-2">
                            <input
                                type="text"
                                name="payment.pixKey"
                                value={settings.payment?.pixKey || ''}
                                onChange={onChange}
                                placeholder="Chave Pix (CPF, CNPJ, Email...)"
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-emerald-500 transition"
                            />
                        </div>
                    )}
                </div>

                {/* Cartões */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-700 text-sm">Cartões de Crédito/Débito</span>
                        <div className="flex items-center gap-3">
                            <select
                                name="financial.payment.destinations.card"
                                value={(settings.financial?.payment as any)?.destinations?.card || ''}
                                onChange={onChange}
                                className="text-xs p-2 rounded-lg border border-gray-200 bg-white font-medium text-gray-600 outline-none focus:border-emerald-500"
                            >
                                <option value="">Conta de Recebimento...</option>
                                {bankAccounts.filter(a => a.accountType === 'CHECKING').map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="payment.acceptCard" checked={settings.payment?.acceptCard || false} onChange={onChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>
                    <div className={`grid grid-cols-2 gap-2 ${!settings.payment?.acceptCard ? 'opacity-50 pointer-events-none' : ''}`}>
                        {['visa', 'mastercard', 'elo', 'amex', 'hipercard'].map(brand => (
                            <label key={brand} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs font-bold text-gray-600 cursor-pointer hover:bg-white transition">
                                <input type="checkbox" name={`payment.brands.${brand}`} checked={(settings.payment?.brands as any)?.[brand] || false} onChange={onChange} className="w-4 h-4 rounded text-blue-500" />
                                <span className="capitalize">{brand}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Vales */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-700 text-sm">Vales Refeição</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="payment.acceptVouchers" checked={settings.payment?.acceptVouchers || false} onChange={onChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>
                    <div className={`grid grid-cols-2 gap-2 ${!settings.payment?.acceptVouchers ? 'opacity-50 pointer-events-none' : ''}`}>
                        {['alelo', 'ticket', 'sodexo', 'vr'].map(brand => (
                            <label key={brand} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs font-bold text-gray-600 cursor-pointer hover:bg-white transition">
                                <input type="checkbox" name={`payment.vouchers.${brand}`} checked={(settings.payment?.vouchers as any)?.[brand] || false} onChange={onChange} className="w-4 h-4 rounded text-blue-500" />
                                <span className="capitalize">{brand}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
