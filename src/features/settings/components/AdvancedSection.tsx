import React from 'react';
import { Bell } from 'lucide-react';
import { AdvancedForm } from './SettingsForms';
import { StoreSettings } from '../../../types';

interface AdvancedSectionProps {
    settings: StoreSettings;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    notificationStatus: NotificationPermission;
    onRequestNotifications: () => void;
}

const AdvancedSection: React.FC<AdvancedSectionProps> = ({
    settings,
    onChange,
    notificationStatus,
    onRequestNotifications
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <AdvancedForm settings={settings} onChange={onChange} />
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <Bell size={20} /> Notificações do Sistema
                </h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                        <p className="font-bold text-gray-800">Alertas de Pedidos e Estoque</p>
                        <p className="text-xs text-gray-500">Receba avisos mesmo com o app minimizado.</p>
                    </div>
                    <button
                        onClick={onRequestNotifications}
                        disabled={notificationStatus === 'granted'}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition ${notificationStatus === 'granted'
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-summo-primary text-white hover:bg-summo-dark shadow-md'
                            }`}
                    >
                        {notificationStatus === 'granted' ? 'Ativado' : notificationStatus === 'denied' ? 'Bloqueado' : 'Ativar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedSection;
