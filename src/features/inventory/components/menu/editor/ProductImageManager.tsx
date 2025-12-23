import React from 'react';
import { Product } from '@/types';
import { ImageIcon, Loader2, Plus, Trash2, Wand2, X } from 'lucide-react';
import { useImageUpload } from '../../../hooks/useImageUpload';
import { generateProductImage } from '@/services/geminiService';

interface ProductImageManagerProps {
    product: Product;
    currentImage: string;
    onImageChange: (url: string) => void;
    productName: string;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
    product,
    currentImage,
    onImageChange,
    productName
}) => {
    const { uploadImage, isUploading, isDragging, setIsDragging } = useImageUpload(product.id || 'new-product');
    const [isGeneratingAI, setIsGeneratingAI] = React.useState(false);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (!product.id) {
            alert('Salve o produto primeiro para habilitar o upload de imagem.');
            return;
        }

        let fileToUpload: File | Blob | null = null;

        // 1. Files
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            fileToUpload = e.dataTransfer.files[0];
        }
        // 2. URLs (Drag from Google)
        else {
            const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
            if (url && url.startsWith('http')) {
                try {
                    const res = await fetch(url);
                    fileToUpload = await res.blob();
                } catch (err) {
                    console.error('Link direto bloqueado por CORS', err);
                    alert('Link direto bloqueado. Tente baixar e arrastar o arquivo.');
                }
            }
        }

        if (fileToUpload) {
            try {
                const url = await uploadImage(fileToUpload);
                onImageChange(url);
            } catch (err) {
                alert('Erro ao processar imagem.');
            }
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!product.id) {
            alert('Salve o produto primeiro para habilitar o upload de imagem.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Arquivo muito grande. Máximo 5MB.');
            return;
        }

        try {
            const url = await uploadImage(file);
            onImageChange(url);
        } catch (err) {
            alert('Erro ao enviar imagem.');
        }
    };

    const handleGenerateAI = async () => {
        if (!product.id) {
            alert('Salve o produto primeiro para usar a IA de imagem.');
            return;
        }

        setIsGeneratingAI(true);
        try {
            const imgBase64 = await generateProductImage(productName);
            if (imgBase64) {
                const res = await fetch(imgBase64);
                const blob = await res.blob();
                const url = await uploadImage(blob);
                onImageChange(url);
            }
        } catch (e) {
            alert('Erro na IA');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase block">
                Imagem do Produto
            </label>

            <div
                className="relative group"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <label className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition relative overflow-hidden ${isDragging ? 'border-summo-primary bg-summo-bg scale-105 shadow-xl' : 'hover:bg-gray-50 border-gray-200'}`}>
                    {isUploading || isGeneratingAI ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 size={24} className="animate-spin text-summo-primary" />
                            <span className="text-[10px] font-bold text-gray-400">
                                {isGeneratingAI ? 'Gerando com IA...' : 'Enviando...'}
                            </span>
                        </div>
                    ) : currentImage ? (
                        <div className="w-full h-full relative group/img overflow-hidden bg-gray-50">
                            {/* Blurred background */}
                            <img
                                src={currentImage}
                                className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-125"
                                aria-hidden="true"
                                alt=""
                            />
                            {/* Actual image */}
                            <img
                                src={currentImage}
                                className="relative w-full h-full object-contain z-10"
                                alt={productName}
                            />

                            {/* Removal overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center z-20">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (window.confirm('Remover esta imagem?')) {
                                            onImageChange('');
                                        }
                                    }}
                                    className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition transform hover:scale-110 shadow-xl"
                                    title="Excluir Imagem"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <ImageIcon size={32} className="text-gray-300" />
                            <span className="text-xs text-gray-400 font-bold">
                                Arraste ou clique para adicionar
                            </span>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading || isGeneratingAI}
                        onChange={handleFileSelect}
                    />
                    {isDragging && (
                        <div className="absolute inset-0 bg-summo-primary/10 flex items-center justify-center backdrop-blur-[1px]">
                            <Plus size={32} className="text-summo-primary animate-bounce" />
                        </div>
                    )}
                </label>
            </div>

            {/* AI Generation Button */}
            <button
                onClick={handleGenerateAI}
                disabled={isGeneratingAI || isUploading || !product.id}
                className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold text-sm shadow-lg"
            >
                {isGeneratingAI ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Gerando...
                    </>
                ) : (
                    <>
                        <Wand2 size={16} />
                        Gerar com IA
                    </>
                )}
            </button>
        </div>
    );
};
