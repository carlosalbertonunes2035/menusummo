import React, { useState, useMemo } from 'react';
import { PERMISSION_GROUPS, ROLE_TEMPLATES, PermissionDefinition } from '@/constants/permissions';
import { Shield, Search, AlertTriangle, AlertCircle, Info, Sparkles, Check } from 'lucide-react';

interface PermissionBuilderProps {
    selectedPermissions: string[];
    onChange: (permissions: string[]) => void;
}

export const PermissionBuilder: React.FC<PermissionBuilderProps> = ({
    selectedPermissions,
    onChange
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [filterRisk, setFilterRisk] = useState<string | null>(null);

    // Risk level colors and icons
    const riskConfig = {
        low: { color: 'text-green-600 bg-green-50 border-green-200', icon: Info, label: 'Baixo Risco' },
        medium: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: AlertCircle, label: 'Médio Risco' },
        high: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: AlertTriangle, label: 'Alto Risco' },
        critical: { color: 'text-red-600 bg-red-50 border-red-200', icon: Shield, label: 'Crítico' }
    };

    // Filter permissions by search and risk
    const filteredGroups = useMemo(() => {
        return PERMISSION_GROUPS.map(group => ({
            ...group,
            capabilities: group.capabilities.filter(cap => {
                const matchesSearch = cap.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cap.id.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesRisk = !filterRisk || cap.risk === filterRisk;
                return matchesSearch && matchesRisk;
            })
        })).filter(group => group.capabilities.length > 0);
    }, [searchTerm, filterRisk]);

    // Toggle permission
    const togglePermission = (permissionId: string) => {
        if (selectedPermissions.includes(permissionId)) {
            onChange(selectedPermissions.filter(p => p !== permissionId));
        } else {
            onChange([...selectedPermissions, permissionId]);
        }
    };

    // Apply template
    const applyTemplate = (templateKey: string) => {
        const template = ROLE_TEMPLATES[templateKey as keyof typeof ROLE_TEMPLATES];
        if (template) {
            onChange(template.permissions);
            setSelectedTemplate(templateKey);
        }
    };

    // Select all in group
    const selectAllInGroup = (groupId: string) => {
        const group = PERMISSION_GROUPS.find(g => g.id === groupId);
        if (group) {
            const groupPermissions = group.capabilities.map(c => c.id);
            const newPermissions = [...new Set([...selectedPermissions, ...groupPermissions])];
            onChange(newPermissions);
        }
    };

    // Clear all in group
    const clearAllInGroup = (groupId: string) => {
        const group = PERMISSION_GROUPS.find(g => g.id === groupId);
        if (group) {
            const groupPermissions = group.capabilities.map(c => c.id);
            onChange(selectedPermissions.filter(p => !groupPermissions.includes(p)));
        }
    };

    // Stats
    const stats = useMemo(() => {
        const allPermissions = PERMISSION_GROUPS.flatMap(g => g.capabilities);
        const selected = allPermissions.filter(p => selectedPermissions.includes(p.id));
        return {
            total: selectedPermissions.length,
            low: selected.filter(p => p.risk === 'low').length,
            medium: selected.filter(p => p.risk === 'medium').length,
            high: selected.filter(p => p.risk === 'high').length,
            critical: selected.filter(p => p.risk === 'critical').length
        };
    }, [selectedPermissions]);

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="bg-gradient-to-r from-summo-primary/10 to-orange-100/20900/20 rounded-2xl p-6 border border-summo-primary/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="text-summo-primary" size={24} />
                        Construtor de Permissões
                    </h3>
                    <div className="text-sm font-bold text-summo-primary">
                        {stats.total} permissões selecionadas
                    </div>
                </div>

                {/* Risk Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(riskConfig).map(([risk, config]) => {
                        const Icon = config.icon;
                        const count = stats[risk as keyof typeof stats];
                        return (
                            <div key={risk} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.color}`}>
                                <Icon size={16} />
                                <div>
                                    <div className="text-xs opacity-75">{config.label}</div>
                                    <div className="font-bold">{count}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Templates */}
            <div>
                <h4 className="text-sm font-bold text-gray-700300 mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-summo-primary" />
                    Templates Rápidos
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
                        <button
                            key={key}
                            onClick={() => applyTemplate(key)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${selectedTemplate === key
                                    ? 'border-summo-primary bg-summo-primary/5'
                                    : 'border-gray-200700 hover:border-summo-primary/50'
                                }`}
                        >
                            <div className="font-bold text-sm text-gray-900">{template.name}</div>
                            <div className="text-xs text-gray-500400 mt-1">{template.description}</div>
                            <div className="text-xs text-summo-primary font-bold mt-2">
                                {template.permissions.length} permissões
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar permissões..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300600 bg-white800 focus:ring-2 focus:ring-summo-primary outline-none"
                    />
                </div>
                <select
                    value={filterRisk || ''}
                    onChange={(e) => setFilterRisk(e.target.value || null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300600 bg-white800 focus:ring-2 focus:ring-summo-primary outline-none"
                >
                    <option value="">Todos os Níveis</option>
                    <option value="low">Baixo Risco</option>
                    <option value="medium">Médio Risco</option>
                    <option value="high">Alto Risco</option>
                    <option value="critical">Crítico</option>
                </select>
            </div>

            {/* Permission Groups */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {filteredGroups.map(group => {
                    const groupPermissions = group.capabilities.map(c => c.id);
                    const selectedInGroup = groupPermissions.filter(p => selectedPermissions.includes(p)).length;
                    const allSelected = selectedInGroup === groupPermissions.length;

                    return (
                        <div key={group.id} className="bg-white800 rounded-xl border border-gray-200700 overflow-hidden">
                            {/* Group Header */}
                            <div className="p-4 bg-gray-50900/50 border-b border-gray-200700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h5 className="font-bold text-gray-900">{group.label}</h5>
                                        <p className="text-xs text-gray-500400 mt-1">{group.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500400">
                                            {selectedInGroup}/{groupPermissions.length}
                                        </span>
                                        <button
                                            onClick={() => allSelected ? clearAllInGroup(group.id) : selectAllInGroup(group.id)}
                                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-summo-primary/10 text-summo-primary hover:bg-summo-primary/20 transition"
                                        >
                                            {allSelected ? 'Limpar' : 'Selecionar Todos'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {group.capabilities.map(permission => {
                                    const isSelected = selectedPermissions.includes(permission.id);
                                    const riskStyle = permission.risk ? riskConfig[permission.risk] : riskConfig.low;
                                    const RiskIcon = riskStyle.icon;

                                    return (
                                        <label
                                            key={permission.id}
                                            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                                    ? 'border-summo-primary bg-summo-primary/5'
                                                    : 'border-gray-200700 hover:border-summo-primary/30'
                                                }`}
                                        >
                                            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-summo-primary border-summo-primary'
                                                    : 'bg-white800 border-gray-300600'
                                                }`}>
                                                {isSelected && <Check size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => togglePermission(permission.id)}
                                                className="hidden"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-gray-900">
                                                    {permission.label}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <code className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100900 text-gray-600400">
                                                        {permission.id}
                                                    </code>
                                                    {permission.risk && (
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${riskStyle.color}`}>
                                                            <RiskIcon size={10} />
                                                            {riskStyle.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredGroups.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <Search size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhuma permissão encontrada</p>
                </div>
            )}
        </div>
    );
};
