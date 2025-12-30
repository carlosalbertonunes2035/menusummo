import React from 'react';
import { TeamTab } from './types';

interface TeamHeaderProps {
    activeTab: TeamTab;
    setActiveTab: (tab: TeamTab) => void;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Gestão de Equipe</h2>
                <p className="text-gray-500">Controle quem acessa sua loja e o que podem fazer.</p>
            </div>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('members')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'members' ? 'bg-white shadow text-summo-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Membros
                </button>
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'roles' ? 'bg-white shadow text-summo-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Cargos & Permissões
                </button>
            </div>
        </div>
    );
};
