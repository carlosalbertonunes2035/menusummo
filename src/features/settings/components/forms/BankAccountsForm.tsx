import React, { useState } from 'react';
import { StoreSettings } from '@/types';
import { BankAccount, BankAccountType } from '@/types/finance';
import { Plus, Trash2, Edit2, Wallet, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

interface BankAccountsFormProps {
    settings: StoreSettings;
    onChange: (e: any) => void;
    // Ideally we should have a specific handler for accounts, but we'll mock it for now 
    // or assume settings has a 'bankAccounts' field if we extend StoreSettings.
    // For now, let's assume we are modifying a local state that *will* be part of settings or a separate collection.
    // Given the architecture, this should probably be a separate collection hook, but for Settings UI, we'll try to keep it simple.
    // OPTION: We extend StoreSettings to include `bankAccounts` list or we accept a separate prop.
    // Let's assume we added `bankAccounts: BankAccount[]` to StoreSettings in a future step, or strictly for UI layout now.
}

// Temporary mock until we connect to backend/settings
const MOCK_ACCOUNTS: BankAccount[] = [
    { id: '1', name: 'Caixa da Loja', bankName: 'Interno', accountType: 'CASH_DRAWER', initialBalance: 500, currentBalance: 1250.50, currency: 'BRL', isActive: true, createdAt: new Date() },
    { id: '2', name: 'Conta Principal', bankName: 'Banco Inter', accountType: 'CHECKING', initialBalance: 0, currentBalance: 35400.00, currency: 'BRL', isActive: true, createdAt: new Date() }
];

export const BankAccountsForm: React.FC<BankAccountsFormProps> = ({ settings, onChange }) => {
    const [accounts, setAccounts] = useState<BankAccount[]>(MOCK_ACCOUNTS);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({});

    const handleSave = () => {
        if (!newAccount.name) return;

        const account: BankAccount = {
            id: Math.random().toString(36).substr(2, 9),
            name: newAccount.name,
            bankName: newAccount.bankName || 'Outro',
            accountType: newAccount.accountType || 'CHECKING',
            initialBalance: Number(newAccount.initialBalance) || 0,
            currentBalance: Number(newAccount.initialBalance) || 0,
            currency: 'BRL',
            isActive: true,
            createdAt: new Date(),
            ...newAccount
        } as BankAccount;

        setAccounts([...accounts, account]);
        setNewAccount({});
        setIsEditing(null);

        // Propagate to parent if needed
        // onChange({ target: { name: 'bankAccounts', value: [...accounts, account] } });
    };

    const handleDelete = (id: string) => {
        handleUpdateSettings(accounts.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <Wallet size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Contas Bancárias e Caixas</h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Cadastre onde o dinheiro entra e sai. Vincule estas contas aos métodos de pagamento para conciliação automática.
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {accounts.map(acc => (
                    <div key={acc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${acc.accountType === 'CASH_DRAWER' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                {acc.accountType === 'CASH_DRAWER' ? <Wallet size={20} /> : <Building2 size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{acc.name}</h4>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <span className="capitalize">{acc.bankName}</span>
                                    <span>•</span>
                                    <span className="font-mono bg-gray-50 px-1 rounded">R$ {acc.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-blue-500 transition">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(acc.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* New Account Button/Form */}
                {isEditing === 'NEW' ? (
                    <div className="bg-white p-6 rounded-xl border-2 border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-bold text-gray-800 mb-4">Nova Conta</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Nome da Conta</label>
                                <input
                                    autoFocus
                                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-800 outline-none focus:bg-white focus:ring-2 ring-emerald-100 transition"
                                    placeholder="Ex: Inter PJ"
                                    value={newAccount.name || ''}
                                    onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Instituição</label>
                                <input
                                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-800 outline-none focus:bg-white focus:ring-2 ring-emerald-100 transition"
                                    placeholder="Ex: Banco Inter"
                                    value={newAccount.bankName || ''}
                                    onChange={e => setNewAccount({ ...newAccount, bankName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Tipo</label>
                                <select
                                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-800 outline-none focus:bg-white focus:ring-2 ring-emerald-100 transition"
                                    value={newAccount.accountType || 'CHECKING'}
                                    onChange={e => setNewAccount({ ...newAccount, accountType: e.target.value as BankAccountType })}
                                >
                                    <option value="CHECKING">Conta Corrente</option>
                                    <option value="SAVINGS">Poupança</option>
                                    <option value="CASH_DRAWER">Caixa Físico (Gaveta)</option>
                                    <option value="WALLET">Carteira Digital</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Saldo Inicial</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-800 outline-none focus:bg-white focus:ring-2 ring-emerald-100 transition"
                                    placeholder="0,00"
                                    value={newAccount.initialBalance || ''}
                                    onChange={e => setNewAccount({ ...newAccount, initialBalance: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setIsEditing(null)} className="px-4 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2 rounded-xl font-bold bg-emerald-500 text-white shadow-emerald-200 shadow-lg hover:shadow-xl hover:bg-emerald-600 transition">Salvar Conta</button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing('NEW')}
                        className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50 transition"
                    >
                        <Plus size={20} /> Adicionar Nova Conta
                    </button>
                )}
            </div>

            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>
                    <b>Dica:</b> O "Caixa da Loja" é criado automaticamente para gerenciar vendas em dinheiro no balcão.
                </p>
            </div>
        </div>
    );
};
