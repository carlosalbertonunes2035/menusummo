'use client';

// components/public/InstagramDock.tsx
import React from 'react';
import { Home, Search, Clock, User } from 'lucide-react';

interface InstagramDockProps {
    activeTab: 'feed' | 'search' | 'orders' | 'profile';
    setActiveTab: (tab: 'feed' | 'search' | 'orders' | 'profile') => void;
    cartCount: number;
    openCart: () => void;
}

const InstagramDock: React.FC<InstagramDockProps> = ({ activeTab, setActiveTab, cartCount, openCart }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 pb-safe z-50">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto relative px-2">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`p-2 transition flex flex-col items-center gap-1 w-14 ${activeTab === 'feed' ? 'text-summo-primary' : 'text-gray-400'}`}
                >
                    <Home size={24} strokeWidth={activeTab === 'feed' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Início</span>
                </button>

                <button
                    onClick={() => setActiveTab('search')}
                    className={`p-2 transition flex flex-col items-center gap-1 w-14 ${activeTab === 'search' ? 'text-summo-primary' : 'text-gray-400'}`}
                >
                    <Search size={24} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Buscar</span>
                </button>

                {/* Central Cart Button */}
                <div className="relative -top-5">
                    <button
                        onClick={openCart}
                        className="bg-summo-primary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-summo-primary/40 active:scale-90 transition-transform border-4 border-gray-50"
                    >
                        <User size={0} className="hidden" /> {/* Dummy hidden icon to satisfy generic layout if needed */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        {cartCount > 0 && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                {cartCount}
                            </div>
                        )}
                    </button>
                </div>

                <button
                    onClick={() => setActiveTab('orders')}
                    className={`p-2 transition flex flex-col items-center gap-1 w-14 ${activeTab === 'orders' ? 'text-summo-primary' : 'text-gray-400'}`}
                >
                    <Clock size={24} strokeWidth={activeTab === 'orders' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Pedidos</span>
                </button>

                <button
                    onClick={() => setActiveTab('profile')}
                    className={`p-2 transition flex flex-col items-center gap-1 w-14 ${activeTab === 'profile' ? 'text-summo-primary' : 'text-gray-400'}`}
                >
                    <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Perfil</span>
                </button>
            </div>
        </div>
    );
};

export default InstagramDock;
