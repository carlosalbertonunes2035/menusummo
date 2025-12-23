import React, { memo, useState } from 'react';
import { ChevronDown, ArrowRight, Wallet, Clock, AlertTriangle, DollarSign, TrendingUp, ShoppingBag, Activity, ArrowUp, ArrowDown, Settings, LogOut, LayoutGrid, Zap } from 'lucide-react';
import { ALL_MODULES } from '../Sidebar';
import { useAuth } from '../../../features/auth/context/AuthContext';

export const LaunchpadHeader: React.FC<{ storeName: string, greeting: string, stats: any, isLoading?: boolean, onNavigate: (id: string) => void }> = memo(({ storeName, greeting, stats, isLoading, onNavigate }) => {
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative rounded-[2.5rem] shadow-xl shadow-orange-900/20 min-h-[240px] flex flex-col justify-between text-white isolate z-20 overflow-hidden mb-2 transition-all">
            {/* Vibrant Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-600 to-red-800 -z-10">
                {/* Abstract Shapes for Depth */}
                <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white opacity-10 rounded-full blur-3xl pointer-events-none mix-blend-overlay"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-yellow-400 opacity-20 rounded-full blur-3xl pointer-events-none mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="p-6 lg:p-10 flex flex-col justify-between h-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center z-30 gap-4">
                    <div className="animate-slide-in-right">
                        <h1 className="text-3xl lg:text-5xl font-black mb-2 tracking-tight drop-shadow-sm">{greeting}! 🍊</h1>
                        <p className="text-orange-50 text-lg font-medium opacity-90">Sua operação está rodando a todo vapor.</p>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-3 bg-black/20 hover:bg-black/30 p-2 pr-4 rounded-full border border-white/10 backdrop-blur-md transition-all cursor-pointer active:scale-95 shadow-lg"
                        >
                            <div className="w-10 h-10 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-white/50">
                                {storeName.charAt(0)}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="font-bold text-sm text-white leading-tight">{storeName}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <p className="text-[10px] text-white/90 font-bold uppercase tracking-wide">Online</p>
                                </div>
                            </div>
                            <ChevronDown size={16} className={`text-white/80 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isOpen && (
                            <>
                                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slide-in-up origin-top-right ring-1 ring-black/5">
                                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Logado como</p>
                                        <p className="text-sm font-bold text-gray-800 truncate">{user?.email}</p>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <button onClick={() => { onNavigate('settings'); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-summo-primary transition">
                                            <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500"><Settings size={14} /></div>
                                            Configurações
                                        </button>
                                        <button onClick={() => { logout(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition">
                                            <div className="p-1.5 bg-red-100 rounded-lg text-red-500"><LogOut size={14} /></div>
                                            Sair do Sistema
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 z-10">
                    <button onClick={() => onNavigate('finance')} className="bg-black/20 border border-white/10 backdrop-blur-md p-4 rounded-2xl text-left transition-all hover:bg-black/30 hover:border-white/30 cursor-pointer group hover:-translate-y-1 active:scale-95 duration-300">
                        <div className="flex items-center gap-2 mb-2"><div className="p-1.5 bg-white/20 rounded-lg"><DollarSign size={16} className="text-white" /></div><p className="text-xs font-bold text-white/80 uppercase tracking-wide">Faturamento</p></div>
                        <p className="text-2xl lg:text-3xl font-black text-white tracking-tight">R$ {stats.revenue.toFixed(2)}</p>
                        <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${stats.revenueChange >= 0 ? 'text-green-300 bg-green-500/20' : 'text-red-300 bg-red-500/20'} w-fit px-2 py-1 rounded-lg backdrop-blur-sm`}>
                            {stats.revenueChange >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {Math.abs(stats.revenueChange).toFixed(1)}%
                        </div>
                    </button>
                    <button onClick={() => onNavigate('finance')} className="bg-black/20 border border-white/10 backdrop-blur-md p-4 rounded-2xl text-left transition-all hover:bg-black/30 hover:border-white/30 cursor-pointer group hover:-translate-y-1 active:scale-95 duration-300 hidden md:block">
                        <div className="flex items-center gap-2 mb-2"><div className="p-1.5 bg-white/20 rounded-lg"><TrendingUp size={16} className="text-white" /></div><p className="text-xs font-bold text-white/80 uppercase tracking-wide">Lucro Líquido</p></div>
                        <p className="text-2xl lg:text-3xl font-black text-white tracking-tight">R$ {stats.profit.toFixed(2)}</p>
                        <p className="text-xs mt-2 font-bold text-white/60">Margem: {stats.margin.toFixed(1)}%</p>
                    </button>
                    <button onClick={() => onNavigate('orders')} className="bg-black/20 border border-white/10 backdrop-blur-md p-4 rounded-2xl text-left transition-all hover:bg-black/30 hover:border-white/30 cursor-pointer group hover:-translate-y-1 active:scale-95 duration-300">
                        <div className="flex items-center gap-2 mb-2"><div className="p-1.5 bg-white/20 rounded-lg"><ShoppingBag size={16} className="text-white" /></div><p className="text-xs font-bold text-white/80 uppercase tracking-wide">Pedidos</p></div>
                        <p className="text-2xl lg:text-3xl font-black text-white tracking-tight">{stats.orderCount}</p>
                        <p className="text-xs mt-2 font-bold text-white/60">Ticket: R$ {stats.ticket.toFixed(2)}</p>
                    </button>
                    <button onClick={() => onNavigate('orders')} className="bg-black/20 border border-white/10 backdrop-blur-md p-4 rounded-2xl text-left transition-all hover:bg-black/30 hover:border-white/30 cursor-pointer group hover:-translate-y-1 active:scale-95 duration-300 hidden md:block">
                        <div className="flex items-center gap-2 mb-2"><div className="p-1.5 bg-white/20 rounded-lg"><Activity size={16} className="text-white" /></div><p className="text-xs font-bold text-white/80 uppercase tracking-wide">Ritmo</p></div>
                        <p className="text-2xl lg:text-3xl font-black text-white tracking-tight">{stats.ordersLastHour} <span className="text-sm font-medium text-white/60">/h</span></p>
                        <p className="text-xs mt-2 font-bold text-white/60">Ontem: {stats.ordersSameHourYesterday}</p>
                    </button>
                </div>
            </div>
        </div>
    );
});

export const AlertWidgets: React.FC<{ lateOrders: number, lowStock: number, onNavigate: (id: string) => void }> = memo(({ lateOrders, lowStock, onNavigate }) => (
    <div className="h-full flex flex-col gap-4">
        {lateOrders > 0 && (
            <div className="bg-white p-5 rounded-3xl flex items-center justify-between shadow-sm border border-red-100 hover:border-red-300 hover:shadow-red-200/50 relative overflow-hidden group cursor-pointer hover:-translate-y-0.5 transition duration-300" onClick={() => onNavigate('kds')}>
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                <div className="flex items-center gap-4 pl-2">
                    <div className="bg-red-50 p-3 rounded-2xl text-red-500 group-hover:scale-110 transition-transform"><Clock size={28} /></div>
                    <div className="text-left">
                        <p className="font-bold text-gray-800 text-lg leading-none mb-1">Cozinha Atrasada!</p>
                        <p className="text-sm text-red-500 font-bold">{lateOrders} {lateOrders > 1 ? 'pedidos demorando' : 'pedido demorando'}.</p>
                    </div>
                </div>
                <ArrowRight className="text-gray-300 group-hover:text-red-500 transition-colors" />
            </div>
        )}
        {lowStock > 0 && (
            <div className="bg-white p-5 rounded-3xl flex items-center justify-between shadow-sm border border-orange-100 hover:border-orange-300 hover:shadow-orange-200/50 relative overflow-hidden group cursor-pointer hover:-translate-y-0.5 transition duration-300" onClick={() => onNavigate('stock')}>
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>
                <div className="flex items-center gap-4 pl-2">
                    <div className="bg-orange-50 p-3 rounded-2xl text-orange-500 group-hover:scale-110 transition-transform"><AlertTriangle size={28} /></div>
                    <div className="text-left">
                        <p className="font-bold text-gray-800 text-lg leading-none mb-1">Reposição Urgente</p>
                        <p className="text-sm text-orange-500 font-bold">{lowStock} {lowStock > 1 ? 'itens acabando' : 'item acabando'}.</p>
                    </div>
                </div>
                <ArrowRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
            </div>
        )}
    </div>
));

export const GrowthWidget: React.FC<{ atRisk: number, lost: number, onNavigate: (id: string) => void }> = memo(({ atRisk, lost, onNavigate }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-0.5 transition duration-300" onClick={() => onNavigate('crm')}>
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
            <Zap size={120} />
        </div>
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-4"><Zap size={20} className="text-purple-600 fill-purple-600" /> Motor de Crescimento</h3>

        <div className="flex-1 space-y-3">
            {atRisk > 0 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-2xl border border-yellow-100">
                    <div className="bg-white text-yellow-600 p-2 rounded-xl font-black text-lg min-w-[40px] text-center shadow-sm">{atRisk}</div>
                    <div>
                        <p className="text-yellow-800 font-bold text-sm">Clientes VIP em Risco</p>
                        <p className="text-yellow-700 text-xs">Ausentes há 30 dias.</p>
                    </div>
                </div>
            )}
            {lost > 0 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl border border-red-100 opacity-90 hover:opacity-100 transition">
                    <div className="bg-white text-red-600 p-2 rounded-xl font-black text-lg min-w-[40px] text-center shadow-sm">{lost}</div>
                    <div>
                        <p className="text-red-800 font-bold text-sm">Clientes Perdidos</p>
                        <p className="text-red-700 text-xs">Ausentes há +60 dias.</p>
                    </div>
                </div>
            )}
            {atRisk === 0 && lost === 0 && (
                <div className="text-center py-6 text-green-600 bg-green-50 rounded-2xl border border-green-100">
                    <p className="font-bold text-sm">Sua base está saudável! 🚀</p>
                    <p className="text-xs">Nenhum cliente em risco hoje.</p>
                </div>
            )}
        </div>

        <button className="w-full mt-4 bg-gray-50 text-gray-600 py-3 rounded-xl text-xs font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">
            Acessar CRM e Agir
        </button>
    </div>
));

export const AppGrid: React.FC<{ onNavigate: (id: string) => void }> = memo(({ onNavigate }) => (
    <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3"><LayoutGrid size={22} className="text-summo-primary" /> Módulos Operacionais</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6 render-auto">
            {ALL_MODULES.filter(m => !['launchpad', 'support'].includes(m.id)).map(module => (
                <button key={module.id} onClick={() => onNavigate(module.id)} className="group bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:border-orange-200/50 hover:shadow-orange-500/20 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center text-center active:scale-95 duration-200 hover:-translate-y-1 relative overflow-hidden">
                    <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${module.gradient || 'from-gray-400 to-gray-600'} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ring-4 ring-white relative z-10`}>
                        <module.icon size={30} strokeWidth={2} className="drop-shadow-sm" />
                    </div>
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <h3 className="font-bold text-gray-800 text-base group-hover:text-summo-primary transition-colors leading-tight relative z-10">{module.label}</h3>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium relative z-10">{module.description}</p>
                </button>
            ))}
        </div>
    </div>
));

export const FooterWidget: React.FC<{ onNavigate: (id: string) => void }> = memo(({ onNavigate }) => (
    <button onClick={() => onNavigate('finance')} className="w-full bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-xl hover:shadow-yellow-500/10 hover:border-yellow-200 transition group active:scale-[0.99] duration-300 mt-4">
        <div className="flex items-center gap-6">
            <div className="p-5 bg-gradient-to-br from-yellow-400 to-amber-600 text-white rounded-3xl shadow-lg group-hover:scale-110 transition-transform rotate-3 ring-4 ring-yellow-50"><Wallet size={32} /></div>
            <div className="text-left">
                <h3 className="font-bold text-xl text-gray-800 group-hover:text-amber-600 transition-colors">Precisa ver o dinheiro?</h3>
                <p className="text-gray-500 font-medium">Toque aqui para abrir o caixa e ver o lucro do dia.</p>
            </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-full text-gray-400 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm"><ArrowRight size={24} /></div>
    </button>
));
