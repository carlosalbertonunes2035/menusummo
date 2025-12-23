
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart3, PieChart as PieChartIcon, Star, Users, Loader2, Calendar, Download, ChevronDown, FileSpreadsheet, FileText, Target, DollarSign, TrendingUp } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { useOrders } from '@/hooks/useOrders';
import { useCustomers } from '@/hooks/useCustomers';
import { useExpenses } from '@/hooks/useExpenses';
import { useDrivers } from '@/hooks/useDrivers';
import { useApp } from '../../../contexts/AppContext';
import { formatDateForInput, generateCSV, downloadCSV } from '../components/reports/utils/exportUtils';
import { DatePreset, ReportTab, TabButton } from '../components/reports/ui/ReportComponents';
import OverviewTab from '../components/reports/tabs/OverviewTab';
import SalesTab from '../components/reports/tabs/SalesTab';
import FinanceTab from '../components/reports/tabs/FinanceTab';
import EngineeringTab from '../components/reports/tabs/EngineeringTab';
import ProductsTab from '../components/reports/tabs/ProductsTab';
import CustomersTab from '../components/reports/tabs/CustomersTab';
import { PageContainer } from '@/components/layouts/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';


const Reports: React.FC = () => {
    const { products } = useData();
    const { data: orders } = useOrders({ limit: 1000 });
    const { data: customers } = useCustomers({ limit: 500 });
    const { data: expenses } = useExpenses({ limit: 500 });
    const { data: drivers } = useDrivers();
    const { settings } = useApp();
    const [activeTab, setActiveTab] = useState<ReportTab>('OVERVIEW');
    const [datePreset, setDatePreset] = useState<DatePreset>('TODAY');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const dateRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    // --- Popover Outside Click Logic ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dateRef.current && !dateRef.current.contains(event.target as Node)) setIsDatePopoverOpen(false);
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) setIsExportMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Date Filtering Logic ---
    const setDateRange = (preset: DatePreset) => {
        setDatePreset(preset);
        if (preset !== 'CUSTOM') {
            setIsDatePopoverOpen(false);
        }
    };

    useEffect(() => {
        if (datePreset === 'CUSTOM') return;
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        switch (datePreset) {
            case 'TODAY':
                setStartDate(startOfToday);
                setEndDate(endOfToday);
                break;
            case 'YESTERDAY': {
                const y = new Date(startOfToday);
                y.setDate(y.getDate() - 1);
                const ey = new Date(y);
                ey.setHours(23, 59, 59);
                setStartDate(y);
                setEndDate(ey);
                break;
            }
            case '7D': {
                const sd = new Date(startOfToday);
                sd.setDate(sd.getDate() - 6);
                setStartDate(sd);
                setEndDate(endOfToday);
                break;
            }
            case 'MONTH': {
                const sm = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(sm);
                setEndDate(endOfToday);
                break;
            }
        }
    }, [datePreset]);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(new Date(e.target.value + 'T00:00:00'));
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(new Date(e.target.value + 'T23:59:59'));

    const filteredOrders = useMemo(() => orders.filter(o => { const d = new Date(o.createdAt); return d >= startDate && d <= endDate; }), [orders, startDate, endDate]);
    const filteredExpenses = useMemo(() => expenses.filter(e => { const d = new Date(e.date); return d >= startDate && d <= endDate; }), [expenses, startDate, endDate]);

    const { productRanking, customerRanking } = useMemo(() => {
        const prodData: { [key: string]: { name: string; qty: number; revenue: number } } = {};
        filteredOrders.flatMap(o => o.items).forEach(item => {
            if (!prodData[item.productId]) prodData[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
            prodData[item.productId].qty += item.quantity;
            prodData[item.productId].revenue += item.price * item.quantity;
        });

        const custData: { [key: string]: { name: string; orders: number; spent: number } } = {};
        filteredOrders.forEach(order => {
            if (!order.customerName || order.customerName === 'Cliente Balcão') return;
            const key = order.customerName.toLowerCase();
            if (!custData[key]) custData[key] = { name: order.customerName, orders: 0, spent: 0 };
            custData[key].orders += 1;
            custData[key].spent += order.total;
        });

        return {
            productRanking: Object.values(prodData).sort((a, b) => b.revenue - a.revenue),
            customerRanking: Object.values(custData).sort((a, b) => b.spent - a.spent)
        };
    }, [filteredOrders]);


    const handleExport = (type: 'PDF' | 'CSV') => {
        setIsExportMenuOpen(false);
        if (type === 'PDF') return window.print();

        let data: any[] = [];
        let headers: Record<string, string> = {};
        const filename = `relatorio_${activeTab.toLowerCase()}_${formatDateForInput(startDate)}_a_${formatDateForInput(endDate)}.csv`;

        switch (activeTab) {
            case 'PRODUCTS': data = productRanking; headers = { name: 'Produto', qty: 'Qtd Vendida', revenue: 'Receita (R$)' }; break;
            case 'CUSTOMERS': data = customerRanking; headers = { name: 'Cliente', orders: 'Pedidos', spent: 'Total Gasto (R$)' }; break;
            default: alert('Exportação para CSV não disponível para esta aba.'); return;
        }

        const csv = generateCSV(data, headers);
        downloadCSV(csv, filename);
    };


    const renderTabContent = () => {
        switch (activeTab) {
            case 'OVERVIEW': return <OverviewTab orders={filteredOrders} />;
            case 'SALES': return <SalesTab orders={filteredOrders} drivers={drivers} />;
            case 'PRODUCTS': return <ProductsTab ranking={productRanking} />;
            case 'ENGINEERING': return <EngineeringTab orders={filteredOrders} products={products} />;
            case 'CUSTOMERS': return <CustomersTab ranking={customerRanking} />;
            case 'FINANCE': return <FinanceTab orders={filteredOrders} expenses={filteredExpenses} />;
            default: return null;
        }
    };

    if (!orders || !products || !customers) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-summo-primary" size={32} /></div>;

    return (
        <PageContainer>
            <Breadcrumbs />
            <div className="h-full flex flex-col bg-gray-50/50 animate-fade-in printable-report">
                <style>{`
                    @media print {
                        body, #root, .printable-report { height: auto; overflow: visible; background: white !important; }
                        .non-printable { display: none !important; }
                        .printable-header, .printable-title { display: block !important; }
                        .printable-kpi, .bg-white { background: transparent !important; box-shadow: none !important; border: 1px solid #eee !important; }
                        .grid { display: grid !important; }
                        .recharts-wrapper { width: 100% !important; height: 100% !important; }
                        .page-break-avoid { page-break-inside: avoid; }
                    }
                `}</style>

                <div className="hidden printable-header p-4 border-b border-gray-300">
                    <h1 className="text-2xl font-bold">{settings.brandName}</h1>
                    <p>Relatório de Performance</p>
                    <p className="text-sm text-gray-600">Período: {startDate.toLocaleDateString('pt-BR')} a {endDate.toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Header: Title and Date Filters */}
                <div className="non-printable bg-gradient-to-br from-summo-dark to-summo-primary text-white p-4 lg:p-6 shadow-lg flex-shrink-0 z-20">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                        <h2 className="text-2xl font-bold">Central de Relatórios</h2>
                        <div ref={exportRef} className="relative">
                            <button onClick={() => setIsExportMenuOpen(prev => !prev)} className="bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/20 transition flex items-center gap-2">
                                <Download size={16} /> Exportar <ChevronDown size={14} />
                            </button>
                            {isExportMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-xl text-gray-700 py-1 z-30 animate-fade-in">
                                    <button onClick={() => handleExport('PDF')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"><FileText size={16} /> PDF</button>
                                    <button onClick={() => handleExport('CSV')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"><FileSpreadsheet size={16} /> Excel (CSV)</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div ref={dateRef} className="relative w-fit">
                        <button onClick={() => setIsDatePopoverOpen(prev => !prev)} className="bg-black/20 border border-white/10 p-2 px-4 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-black/30 transition">
                            <Calendar size={16} /> <span>{startDate.toLocaleDateString('pt-BR')} - {endDate.toLocaleDateString('pt-BR')}</span> <ChevronDown size={16} />
                        </button>
                        {isDatePopoverOpen && (
                            <div className="absolute top-full left-0 mt-2 bg-white text-gray-800 p-4 rounded-xl shadow-2xl z-30 w-72 animate-fade-in">
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {(['TODAY', 'YESTERDAY', '7D', 'MONTH'] as DatePreset[]).map(p => (
                                        <button key={p} onClick={() => setDateRange(p)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${datePreset === p ? 'bg-summo-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {p === 'TODAY' ? 'Hoje' : p === 'YESTERDAY' ? 'Ontem' : p === '7D' ? '7 Dias' : 'Este Mês'}
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-gray-100 pt-4 space-y-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase">Período Personalizado</h4>
                                    <div><label className="text-xs">De:</label><input type="date" value={formatDateForInput(startDate)} onChange={handleStartDateChange} onClick={() => setDatePreset('CUSTOM')} className="w-full p-2 border border-gray-200 rounded" /></div>
                                    <div><label className="text-xs">Até:</label><input type="date" value={formatDateForInput(endDate)} onChange={handleEndDateChange} onClick={() => setDatePreset('CUSTOM')} className="w-full p-2 border border-gray-200 rounded" /></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="non-printable px-4 lg:px-6 bg-white border-b border-gray-100 shadow-sm flex-shrink-0 z-10 overflow-x-auto">
                    <div className="flex gap-6 min-w-max">
                        <TabButton id="OVERVIEW" label="Visão Geral" icon={BarChart3} activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton id="SALES" label="Vendas" icon={PieChartIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton id="PRODUCTS" label="Produtos" icon={Star} activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton id="ENGINEERING" label="Engenharia" icon={Target} activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton id="CUSTOMERS" label="Clientes" icon={Users} activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton id="FINANCE" label="Financeiro" icon={DollarSign} activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    {renderTabContent()}
                </div>
            </div>
        </PageContainer>
    );
};

export default Reports;
