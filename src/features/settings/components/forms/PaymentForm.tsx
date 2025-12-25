import React from 'react';
import { SettingsFormProps } from './types';
import { inputClass, cardClass } from './shared';

export const PaymentForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => (
    <div className={cardClass}>
        <div>
            <h4 className="font-bold mb-4 text-slate-800">Meios de Pagamento</h4>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-700">Dinheiro</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="payment.acceptCash" checked={settings.payment.acceptCash} onChange={onChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-700">Pix</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="payment.acceptPix" checked={settings.payment.acceptPix} onChange={onChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
                {settings.payment.acceptPix && (
                    <input type="text" name="payment.pixKey" value={settings.payment.pixKey} onChange={onChange} placeholder="Chave PIX (CPF/CNPJ/Email)" className={inputClass} />
                )}
            </div>
        </div>

        <div>
            <h4 className="font-bold mb-4 text-slate-800">Bandeiras de Cartão</h4>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl mb-3">
                <span className="font-bold text-slate-700">Aceita Cartão (Débito/Crédito)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="payment.acceptCard" checked={settings.payment.acceptCard} onChange={onChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
            </div>
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${!settings.payment.acceptCard ? 'opacity-50 pointer-events-none' : ''}`}>
                {Object.keys(settings.payment.brands || {}).map(brand => (
                    <label key={brand} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700">
                        <input type="checkbox" name={`payment.brands.${brand}`} checked={(settings.payment.brands as any)?.[brand] || false} onChange={onChange} className="w-4 h-4 rounded text-summo-primary" />
                        <span className="font-medium capitalize">{brand}</span>
                    </label>
                ))}
            </div>
        </div>

        <div>
            <h4 className="font-bold mb-4 text-slate-800">Vales Refeição/Alimentação</h4>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl mb-3">
                <span className="font-bold text-slate-700">Aceita Vales</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="payment.acceptVouchers" checked={settings.payment.acceptVouchers} onChange={onChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
            </div>
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${!settings.payment.acceptVouchers ? 'opacity-50 pointer-events-none' : ''}`}>
                {Object.keys(settings.payment.vouchers || {}).map(brand => (
                    <label key={brand} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700">
                        <input type="checkbox" name={`payment.vouchers.${brand}`} checked={(settings.payment.vouchers as any)?.[brand] || false} onChange={onChange} className="w-4 h-4 rounded text-summo-primary" />
                        <span className="font-medium capitalize">{brand}</span>
                    </label>
                ))}
            </div>
        </div>
    </div>
);
