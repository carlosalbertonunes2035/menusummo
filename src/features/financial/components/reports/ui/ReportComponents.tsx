import React from 'react';

export type DatePreset = 'TODAY' | 'YESTERDAY' | '7D' | 'MONTH' | 'CUSTOM';
export type ReportTab = 'OVERVIEW' | 'SALES' | 'PRODUCTS' | 'ENGINEERING' | 'CUSTOMERS' | 'FINANCE';

// KPI Card Component
export const KPICard: React.FC<{ title: string, value: string, icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white printable-kpi p-6 rounded-2xl shadow-sm border border-gray-100 page-break-avoid">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-summo-dark">{value}</h3>
            </div>
            <div className="p-3 bg-summo-bg rounded-full text-summo-primary">
                <Icon size={24} />
            </div>
        </div>
    </div>
);

// Tab Button Component
export const TabButton: React.FC<{ id: ReportTab, label: string, icon: React.ElementType, activeTab: ReportTab, setActiveTab: (t: ReportTab) => void }> = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === id ? 'border-summo-primary text-summo-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
        <Icon size={16} /> {label}
    </button>
);

// Table Card Component
export const TableCard: React.FC<{ title: string, headers: string[], children: React.ReactNode }> = ({ title, headers, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden page-break-avoid">
        <h3 className="text-xl font-bold text-summo-dark p-6">{title}</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        {headers.map((h, i) => <th key={i} className={`p-4 font-bold ${i > 0 ? 'text-center' : 'text-left'} ${i === headers.length - 1 ? 'text-right' : ''}`}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    </div>
);

// Gauge Card Component
export const GaugeCard: React.FC<{ label: string, value: number, unit?: string }> = ({ label, value, unit = '' }) => {
    const safeValue = isNaN(value) ? 0 : value;
    const color = safeValue > 50 ? '#00E096' : safeValue > 25 ? '#FFD600' : '#FF3B30';
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (safeValue / 100) * circumference;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center page-break-avoid">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <p className="text-2xl font-bold text-summo-dark mt-2">{safeValue.toFixed(1)}{unit}</p>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
        </div>
    );
};
