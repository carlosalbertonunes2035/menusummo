import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { SummoButton } from '@/components/ui/SummoButton';
import { SummoInput } from '@/components/ui/SummoInput';

interface TableSection {
    name: string;
    range: [number, number];
    color: string;
}

interface TableConfig {
    totalTables: number;
    prefix: string;
    startNumber: number;
    sections?: TableSection[];
}

const DEFAULT_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
];

export const TableSettings: React.FC = () => {
    const { settings, setSettings: updateSettings } = useApp();
    const { showToast } = useToast();

    const [config, setConfig] = useState<TableConfig>({
        totalTables: settings.tables?.totalTables || 20,
        prefix: settings.tables?.prefix || 'Mesa',
        startNumber: settings.tables?.startNumber || 1,
        sections: settings.tables?.sections || []
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleAddSection = () => {
        const lastSection = config.sections?.[config.sections.length - 1];
        const startRange = lastSection ? lastSection.range[1] + 1 : config.startNumber;
        const endRange = Math.min(startRange + 9, config.totalTables);

        setConfig(prev => ({
            ...prev,
            sections: [
                ...(prev.sections || []),
                {
                    name: `Seção ${(prev.sections?.length || 0) + 1}`,
                    range: [startRange, endRange],
                    color: DEFAULT_COLORS[(prev.sections?.length || 0) % DEFAULT_COLORS.length]
                }
            ]
        }));
    };

    const handleRemoveSection = (index: number) => {
        setConfig(prev => ({
            ...prev,
            sections: prev.sections?.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateSection = (index: number, field: keyof TableSection, value: any) => {
        setConfig(prev => ({
            ...prev,
            sections: prev.sections?.map((section, i) =>
                i === index ? { ...section, [field]: value } : section
            )
        }));
    };

    const handleSave = async () => {
        // Validation
        if (config.totalTables < 1 || config.totalTables > 200) {
            showToast('Quantidade de mesas deve estar entre 1 e 200', 'error');
            return;
        }

        if (!config.prefix.trim()) {
            showToast('Prefixo não pode estar vazio', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await updateSettings({
                tables: config
            });
            showToast('Configuração de mesas salva!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar configuração', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuração de Mesas</h2>
                <p className="text-gray-500">Configure a quantidade e organização das mesas do seu restaurante</p>
            </div>

            {/* Basic Config */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
                <h3 className="font-bold text-gray-800">Configuração Básica</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Quantidade Total
                        </label>
                        <SummoInput
                            type="number"
                            min={1}
                            max={200}
                            value={config.totalTables}
                            onChange={(e) => setConfig(prev => ({ ...prev, totalTables: parseInt(e.target.value) || 1 }))}
                            placeholder="20"
                        />
                        <p className="text-xs text-gray-500 mt-1">Máximo: 200 mesas</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Prefixo
                        </label>
                        <SummoInput
                            type="text"
                            value={config.prefix}
                            onChange={(e) => setConfig(prev => ({ ...prev, prefix: e.target.value }))}
                            placeholder="Mesa"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ex: "Mesa", "Table"</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Numeração Inicial
                        </label>
                        <SummoInput
                            type="number"
                            min={0}
                            value={config.startNumber}
                            onChange={(e) => setConfig(prev => ({ ...prev, startNumber: parseInt(e.target.value) || 1 }))}
                            placeholder="1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ex: 1 (Mesa 01) ou 100 (Mesa 100)</p>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-gray-500 mb-2">PREVIEW</p>
                    <div className="flex gap-2 flex-wrap">
                        {Array.from({ length: Math.min(5, config.totalTables) }, (_, i) => {
                            const tableNum = config.startNumber + i;
                            return (
                                <div key={i} className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700">
                                    {config.prefix} {tableNum.toString().padStart(2, '0')}
                                </div>
                            );
                        })}
                        {config.totalTables > 5 && (
                            <div className="px-3 py-2 text-sm text-gray-400">
                                ... +{config.totalTables - 5} mesas
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-800">Seções / Áreas (Opcional)</h3>
                        <p className="text-sm text-gray-500">Organize mesas por áreas do restaurante</p>
                    </div>
                    <SummoButton
                        onClick={handleAddSection}
                        leftIcon={<Plus size={18} />}
                        variant="secondary"
                    >
                        Adicionar Seção
                    </SummoButton>
                </div>

                {config.sections && config.sections.length > 0 ? (
                    <div className="space-y-3">
                        {config.sections.map((section, index) => (
                            <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <input
                                    type="color"
                                    value={section.color}
                                    onChange={(e) => handleUpdateSection(index, 'color', e.target.value)}
                                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white shadow-sm"
                                />
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <SummoInput
                                        type="text"
                                        value={section.name}
                                        onChange={(e) => handleUpdateSection(index, 'name', e.target.value)}
                                        placeholder="Nome da seção"
                                    />
                                    <SummoInput
                                        type="number"
                                        value={section.range[0]}
                                        onChange={(e) => handleUpdateSection(index, 'range', [parseInt(e.target.value) || 1, section.range[1]])}
                                        placeholder="Início"
                                    />
                                    <SummoInput
                                        type="number"
                                        value={section.range[1]}
                                        onChange={(e) => handleUpdateSection(index, 'range', [section.range[0], parseInt(e.target.value) || 1])}
                                        placeholder="Fim"
                                    />
                                </div>
                                <button
                                    onClick={() => handleRemoveSection(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">Nenhuma seção configurada</p>
                        <p className="text-xs">Adicione seções para organizar mesas por áreas</p>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <SummoButton
                    onClick={handleSave}
                    disabled={isSaving}
                    leftIcon={<Save size={18} />}
                    className="shadow-lg"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Configuração'}
                </SummoButton>
            </div>
        </div>
    );
};
