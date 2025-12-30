import React from 'react';
import { Droplet } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-6 relative overflow-y-auto font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-summo-primary/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-summo-primary/5 blur-[120px] rounded-full"></div>

            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fade-in relative z-10 border border-gray-100 my-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-summo-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-summo-primary/40 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Droplet size={32} fill="currentColor" className="drop-shadow-sm" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-summo-text tracking-tighter mb-1">SUMMO</h2>
                    <p className="text-summo-text-muted font-medium text-xs italic">"Extraia o máximo do seu negócio"</p>
                </div>
                {children}
            </div>

            {/* Bottom Branding */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/10 text-[10px] font-black uppercase tracking-[0.3em] pointer-events-none select-none whitespace-nowrap">
                SUMMO OS • MAXIMIZING PROFIT
            </div>
        </div>
    );
};
