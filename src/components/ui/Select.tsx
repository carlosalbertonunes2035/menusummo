import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, Search } from 'lucide-react';

export interface SelectOption {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: (string | SelectOption)[];
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;

    // Create Mode
    allowCreate?: boolean;
    onCreate?: (newValue: string) => void;
    createLabel?: string;

    // Search
    searchable?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    label,
    placeholder = 'Selecione...',
    className = '',
    disabled = false,
    allowCreate = false,
    onCreate,
    createLabel = 'Criar Nova Opção',
    searchable = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Normalize options
    const normalizedOptions: SelectOption[] = options.map(opt =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
    );

    const selectedOption = normalizedOptions.find(o => o.value === value);

    // Filter options
    const filteredOptions = normalizedOptions.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleCreate = () => {
        if (onCreate && searchTerm) {
            onCreate(searchTerm);
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full p-4 border-2 rounded-xl outline-none text-sm font-bold transition cursor-pointer flex items-center justify-between group text-left ${isOpen
                        ? 'border-summo-primary bg-white shadow-md ring-2 ring-summo-primary/10'
                        : 'bg-gray-50 border-transparent hover:bg-gray-100'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption?.icon}
                    <span className={selectedOption ? 'text-gray-800' : 'text-gray-400'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-summo-primary' : 'group-hover:text-gray-600'}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col min-w-[200px]">

                    {/* Search Bar */}
                    {(searchable || allowCreate) && (
                        <div className="p-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder={searchable ? "Buscar..." : "Digite para criar..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-summo-primary/20 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    <div className="overflow-y-auto p-1 py-1 custom-scrollbar max-h-[250px]">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full text-left p-3 rounded-lg text-sm font-medium transition flex items-center justify-between group mb-0.5 ${opt.value === value
                                            ? 'bg-summo-bg/50 text-summo-primary'
                                            : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {opt.icon}
                                        {opt.label}
                                    </div>
                                    {opt.value === value && <Check size={16} className="text-summo-primary" />}
                                </button>
                            ))
                        ) : (
                            !allowCreate && (
                                <div className="p-4 text-center text-gray-400 text-xs">
                                    Nenhuma opção encontrada.
                                </div>
                            )
                        )}

                        {/* Create New Option (if enabled and searching) */}
                        {allowCreate && searchTerm && !filteredOptions.find(o => o.label.toLowerCase() === searchTerm.toLowerCase()) && (
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="w-full text-left p-3 rounded-lg hover:bg-orange-50 text-summo-primary font-bold transition flex items-center gap-2 text-sm mt-1"
                            >
                                <div className="p-1.5 bg-summo-primary text-white rounded-md shadow-sm shadow-orange-200">
                                    <Plus size={12} strokeWidth={3} />
                                </div>
                                Criar "{searchTerm}"
                            </button>
                        )}

                        {/* Static Create Button (if enabled and no search term) */}
                        {allowCreate && !searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    // Trigger creation mode in parent or focus input
                                    if (onCreate) onCreate('__TRIGGER_CREATE__');
                                }}
                                className="w-full text-left p-3 rounded-lg hover:bg-orange-50 text-summo-primary font-bold transition flex items-center gap-2 text-sm border-t border-gray-50 mt-1"
                            >
                                <div className="p-1.5 bg-summo-primary text-white rounded-md shadow-sm shadow-orange-200">
                                    <Plus size={12} strokeWidth={3} />
                                </div>
                                {createLabel}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
