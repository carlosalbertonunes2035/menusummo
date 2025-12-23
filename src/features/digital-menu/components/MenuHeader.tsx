import React from 'react';
import { LayoutList, LayoutGrid, Square, Sun, Moon, LogOut, Clock } from 'lucide-react';

interface MenuHeaderProps {
    settings: any;
    isOpen: boolean;
    eta: string;
    viewMode: 'GRID' | 'LIST' | 'FEED';
    setViewMode: (mode: 'GRID' | 'LIST' | 'FEED') => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
    settings, isOpen, eta, viewMode, setViewMode, isDarkMode, setIsDarkMode
}) => {
    return (
        <header className="flex-none bg-summo-surface z-30 pt-safe relative shadow-sm border-b border-summo-border">
            <div className="px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-summo-border">
                        <img src={settings.logoUrl || "https://ui-avatars.com/api/?name=SUMMO"} className="w-full h-full object-cover" alt="Logo" />
                    </div>
                    <div>
                        <h1 className="font-bold text-summo-text text-base leading-tight">{settings.brandName}</h1>
                        <div className="flex items-center gap-2 text-xs">
                            <span className={`flex items-center gap-1 ${isOpen ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}`}>
                                <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-50 animate-pulse' : 'bg-red-50'}`}></div>
                                {isOpen ? 'Aberto' : 'Fechado'}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-summo-text-muted flex items-center gap-1"><Clock size={10} /> {eta}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (viewMode === 'LIST') setViewMode('GRID');
                            else if (viewMode === 'GRID') setViewMode('FEED');
                            else setViewMode('LIST');
                        }}
                        className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-summo-border text-summo-text-muted hover:text-summo-primary transition"
                        title={`Modo: ${viewMode === 'LIST' ? 'Lista' : viewMode === 'GRID' ? 'Grid' : 'Feed'}`}
                    >
                        {viewMode === 'LIST' && <LayoutList size={16} />}
                        {viewMode === 'GRID' && <LayoutGrid size={16} />}
                        {viewMode === 'FEED' && <Square size={16} />}
                    </button>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-summo-border text-summo-text-muted">
                        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <button onClick={() => { }} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
};
