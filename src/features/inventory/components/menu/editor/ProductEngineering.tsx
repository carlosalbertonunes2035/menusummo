import React, { useMemo } from 'react';
import { Product, Ingredient, ChannelConfig, SalesChannel } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useApp } from '@/contexts/AppContext';
import { Calculator, ChefHat, Link2Off, Trash2, AlertTriangle, DollarSign, TrendingUp, Layers, Info, ListPlus, Plus, Tag, CheckCircle2, ShoppingCart, Tv, Globe, Monitor } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useProductPricing, calculateIdealPrice } from '../../../hooks/useProductPricing';

// Extended Product Interface to handle optional recipe/combo fields
interface ExtendedProduct extends Product {
    recipe?: any;
    comboItems?: any[];
    comboSteps?: any[];
    realCost?: number;
}

interface ProductEngineeringProps {
    product: ExtendedProduct;
    linkRecipe: (id: string) => void;
    unlinkRecipe: () => void;
    onChannelDataChange: (field: keyof Omit<ChannelConfig, 'channel'>, value: any, channel?: SalesChannel) => void;
}

const ChannelPricingCard: React.FC<{
    channel: SalesChannel;
    product: Product;
    settings: any;
    onChannelDataChange: any;
    label: string;
    icon: any;
    color: string;
}> = ({ channel, product, settings, onChannelDataChange, label, icon: Icon, color }) => {
    const pricing = useProductPricing(product, settings, channel);

    const channelFees = channel === 'ifood'
        ? ((settings.integrations?.ifood?.commissionRate || 0) + (settings.integrations?.ifood?.financialFee || 0))
        : 0;

    const suggestedPrice = calculateIdealPrice(
        pricing.cost,
        25, // Target Margin 25%
        settings.financial?.taxRate || 0,
        settings.financial?.fixedCostRate || 0,
        channelFees,
        settings.financial?.packagingAvgCost || 0
    );

    const chData = product.channels?.find(c => c.channel === channel) || { price: 0, promotionalPrice: 0 };

    return (
        <div className={`bg-white p-5 rounded-3xl border-2 transition-all shadow-sm flex flex-col h-full ${pricing.profit > 0 ? 'border-gray-100' : 'border-red-100 bg-red-50/10'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl text-white ${color}`}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <h5 className="font-black text-xs uppercase tracking-tight text-gray-800">{label}</h5>
                        <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${pricing.profit > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-[10px] font-bold text-gray-400">Lucro: {pricing.margin.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block text-[8px] font-black text-gray-400 uppercase">Sugestão Summo</span>
                    <span className="text-[10px] font-black text-summo-primary">{formatCurrency(suggestedPrice)}</span>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Preço de Venda</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={chData.price || ''}
                            onChange={(e) => onChannelDataChange('price', e.target.value === '' ? null : parseFloat(e.target.value), channel)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-summo-primary focus:bg-white rounded-xl outline-none text-sm font-black transition"
                            placeholder="0,00"
                        />
                    </div>
                </div>

                {channel !== 'ifood' && (
                    <div>
                        <label className="text-[10px] font-black text-summo-primary uppercase mb-1 block flex items-center gap-1">
                            <Tag size={10} /> Preço Promo
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-summo-primary/50 text-xs font-bold">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={chData.promotionalPrice || ''}
                                onChange={(e) => onChannelDataChange('promotionalPrice', e.target.value === '' ? null : parseFloat(e.target.value), channel)}
                                className="w-full pl-9 pr-3 py-2.5 bg-summo-bg/30 border-2 border-transparent focus:border-summo-primary focus:bg-white rounded-xl outline-none text-sm font-black text-summo-primary transition"
                                placeholder="Opcional"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-[140px] relative mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pricing.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {pricing.pieData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                            formatter={(v: any) => formatCurrency(Number(v))}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <span className="block text-[8px] font-black text-gray-400 uppercase leading-none">Lucro</span>
                        <span className={`text-xs font-black ${pricing.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(pricing.profit)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-gray-100">
                <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <span className="block text-[8px] font-black text-gray-400 uppercase">CMV Real</span>
                    <span className={`text-xs font-black ${pricing.cmvPercent > 35 ? 'text-red-500' : 'text-gray-700'}`}>{pricing.cmvPercent.toFixed(1)}%</span>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <span className="block text-[8px] font-black text-gray-400 uppercase">Margem</span>
                    <span className={`text-xs font-black ${pricing.margin < 15 ? 'text-red-500' : 'text-green-600'}`}>{pricing.margin.toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
};

export const ProductEngineering: React.FC<ProductEngineeringProps> = ({
    product,
    linkRecipe,
    unlinkRecipe,
    onChannelDataChange,
}) => {
    const { ingredients, recipes } = useData();
    const { settings } = useApp();

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header com Resumo de Custo */}
            <div className="bg-summo-dark py-8 px-6 rounded-3xl text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-summo-primary/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-summo-primary rounded-lg">
                                <Calculator size={20} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Engenharia Financeira</h3>
                        </div>
                        <p className="text-gray-400 text-sm font-medium">Análise de custos fixos, variáveis e lucro por canal.</p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <span className="block text-[10px] font-black text-summo-primary uppercase tracking-widest mb-1">Custo de Produção</span>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-xs font-bold text-gray-400">R$</span>
                                <span className="text-4xl font-black">{(product.realCost || 0).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                        <div className="text-right">
                            <span className="block text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Média de Lucro</span>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-4xl font-black text-green-400">~25</span>
                                <span className="text-xl font-black text-green-400">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insumos e Receita */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <ChefHat size={18} className="text-summo-primary" /> Ficha Técnica e Insumos
                    </h4>
                    {product.recipe?.id && (
                        <button onClick={unlinkRecipe} className="text-[10px] font-black text-red-500 hover:underline flex items-center gap-1 uppercase">
                            <Link2Off size={12} /> Desvincular Receita
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-xs font-black text-gray-400 uppercase block mb-1">Vincular Base de Custo</label>
                        <select
                            value={product.recipe?.id || ''}
                            onChange={(e) => linkRecipe(e.target.value)}
                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-summo-primary focus:bg-white rounded-2xl outline-none text-sm font-bold transition"
                        >
                            <option value="">-- Selecionar Receita ou Insumo Base --</option>
                            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </div>

                {product.recipe?.ingredients && product.recipe.ingredients.length > 0 && (
                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {product.recipe.ingredients.map((item: any, idx: number) => {
                                const ing = ingredients.find(i => i.id === item.ingredientId);
                                const subRec = recipes.find(r => r.id === item.ingredientId);
                                const costPerUnit = ing ? (ing.costPerUnit || ing.cost || 0) : ((subRec?.totalCost || 0) / (subRec?.yield || 1));

                                return (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-50 shadow-sm transition hover:shadow-md">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                <Layers size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-800 leading-none">{ing?.name || subRec?.name || 'Item'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold mt-1">{item.quantity} {item.unit} x {formatCurrency(costPerUnit)}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-gray-800">{formatCurrency(item.quantity * costPerUnit)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Cenários de Precificação */}
            <div>
                <div className="flex justify-between items-center mb-6 px-2">
                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp size={18} className="text-summo-primary" /> Raio-X de Preços por Canal
                    </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ChannelPricingCard
                        channel="pos"
                        product={product}
                        settings={settings}
                        onChannelDataChange={onChannelDataChange}
                        label="PDV / Balcão"
                        icon={Monitor}
                        color="bg-blue-500"
                    />
                    <ChannelPricingCard
                        channel="digital-menu"
                        product={product}
                        settings={settings}
                        onChannelDataChange={onChannelDataChange}
                        label="Cardápio Digital"
                        icon={Globe}
                        color="bg-green-500"
                    />
                    <ChannelPricingCard
                        channel="ifood"
                        product={product}
                        settings={settings}
                        onChannelDataChange={onChannelDataChange}
                        label="iFood / Delivery"
                        icon={Tv}
                        color="bg-red-500"
                    />
                </div>
            </div>
        </div>
    );
};
