import React from 'react';
import { Trash2, Save } from 'lucide-react';

interface ProductEditorFooterProps {
    isEditMode: boolean;
    canGoNext: boolean;
    onDelete: () => void;
    onSaveAndClose: () => void;
    onNext?: () => void;
}

export const ProductEditorFooter: React.FC<ProductEditorFooterProps> = ({
    isEditMode,
    canGoNext,
    onDelete,
    onSaveAndClose,
    onNext
}) => {
    return (
        <div className="bg-white border-t border-gray-200 sticky bottom-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="p-4 pb-safe lg:pb-4 flex items-center justify-between gap-4">
                {/* Delete Button - Left Side */}
                <button
                    onClick={onDelete}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex-shrink-0"
                    title={isEditMode ? "Excluir Produto (Ctrl+D)" : "Descartar Rascunho"}
                >
                    <Trash2 size={20} />
                </button>

                {/* Navigation Buttons - Right Side */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                    {/* Always Show Save Button for Quick Access */}
                    <button
                        onClick={onSaveAndClose}
                        className="px-6 py-3 bg-white text-summo-primary border-2 border-summo-primary/10 rounded-xl font-bold hover:bg-summo-bg transition flex items-center justify-center gap-2 active:scale-95"
                        title="Salvar e Fechar (Ctrl+S)"
                    >
                        <Save size={18} /> Salvar
                    </button>

                    {canGoNext && onNext ? (
                        <button
                            onClick={onNext}
                            className="px-6 py-3 bg-summo-primary text-white rounded-xl font-bold hover:bg-summo-dark transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-summo-primary/20"
                        >
                            Próximo →
                        </button>
                    ) : (
                        <button
                            onClick={onSaveAndClose}
                            className="px-6 py-3 bg-summo-primary text-white rounded-xl font-bold shadow-lg shadow-summo-primary/30 hover:bg-summo-dark transition flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Save size={20} /> Concluir
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
