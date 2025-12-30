import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOnboardingTour, tourStyles } from '@/utils/onboardingTour';
import { useApp } from '@/contexts/AppContext';

export const OnboardingTourController: React.FC = () => {
    const navigate = useNavigate();
    const { settings, setSettings } = useApp();
    const tourRef = useRef<any>(null);

    useEffect(() => {
        // Inject custom styles
        const styleId = 'summo-tour-styles';
        if (!document.getElementById(styleId)) {
            const styleElement = document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = tourStyles;
            document.head.appendChild(styleElement);
        }

        // Logic to auto-start tour
        const shouldStartTour = settings.onboarding?.isCompleted === false && !localStorage.getItem('summo_tour_seen');

        if (shouldStartTour) {
            setTimeout(() => {
                startTour();
            }, 1500); // Small delay for "WOW" effect
        }

        return () => {
            if (tourRef.current) {
                tourRef.current.cancel();
            }
        };
    }, []);

    const startTour = () => {
        if (!tourRef.current) {
            tourRef.current = createOnboardingTour((path) => navigate('/app' + path));

            tourRef.current.on('complete', () => {
                localStorage.setItem('summo_tour_seen', 'true');
                setSettings({ ...settings, onboarding: { ...settings.onboarding, isCompleted: true } as any });
            });

            tourRef.current.on('cancel', () => {
                localStorage.setItem('summo_tour_seen', 'true');
            });
        }
        tourRef.current.start();
    };

    return (
        <button
            onClick={startTour}
            className="fixed bottom-6 right-6 z-50 p-4 bg-summo-primary text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group overflow-hidden"
            title="Dúvidas? Iniciar Tour"
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <div className="relative flex items-center gap-2">
                <span className="font-bold text-sm hidden group-hover:block animate-in fade-in slide-in-from-right-4">
                    Como funciona?
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle">
                    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
                </svg>
            </div>
        </button>
    );
};
