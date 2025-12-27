import React from 'react';
import { Product } from '@/types';
import { ImageIcon, Loader2, Plus, Trash2, Wand2, X, Check } from 'lucide-react';
import { useImageUpload } from '../../../hooks/useImageUpload';
import { functions, functionsUS } from '@/lib/firebase/client';
import { httpsCallable } from '@firebase/functions';
import { slugify } from '@/lib/seoUtils';

interface ProductImageManagerProps {
    product: Product;
    currentImage: string;
    onImageChange: (url: string) => void;
    onUpdate: (field: keyof Product, value: any) => void;
    productName: string;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
    product,
    currentImage,
    onImageChange,
    onUpdate,
    productName
}) => {
    const { uploadImage, isUploading, isDragging, setIsDragging } = useImageUpload(product.id || 'new-product');
    const [isGeneratingAI, setIsGeneratingAI] = React.useState(false);

    const imageFit = product.imageFit || 'cover';

    // Helper for SEO Metadata
    const getSeoMetadata = (file: File | Blob) => {
        return {
            customMetadata: {
                product: productName || 'Produto Sem Nome',
                business: 'MenuSummo', // Ideal: Get from Auth/Context
                originalName: file instanceof File ? file.name : 'ai-generated.jpg',
                uploadedBy: 'Menu Studio'
            },
            contentType: file.type
        };
    };

    const getSeoFilename = () => {
        return slugify(productName || 'produto');
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

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
                const metadata = getSeoMetadata(fileToUpload);
                const filename = getSeoFilename();

                const url = await uploadImage(fileToUpload, filename, metadata);
                onImageChange(url);
            } catch (err) {
                alert('Erro ao processar imagem.');
            }
        }
    };

    const processImageWithAI = async (url: string, mimeType: string) => {
        setIsGeneratingAI(true);
        try {
            console.log('[ProductImageManager] 🚀 Auto-Enhance Triggered for:', url);

            const generateImageFn = httpsCallable(functionsUS, 'enhanceProductImage');
            const { data } = await generateImageFn({
                productName: productName || 'Produto',
                fileUrl: url,
                mimeType
            });

            // Handle Rich Response { image, analysis }
            const result = data as any;
            const enhancedImage = result.image || result;
            const analysis = result.analysis;

            if (enhancedImage) {
                setPreviewImage(enhancedImage);
            }

            if (analysis) {
                const aiDesc = `Ingredientes Visíveis: ${analysis.ingredients}.\nVibe: ${analysis.vibe}`;
                console.log('[ProductImageManager] 🧠 AI Insights:', aiDesc);

                if (product.description === '' || !product.description) {
                    onUpdate('description', aiDesc);
                }
            }
        } catch (e) {
            console.error('[ProductImageManager] AI Failed:', e);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Arquivo muito grande. Máximo 5MB.');
            return;
        }

        try {
            // 1. Upload (Instant) with SEO
            const metadata = getSeoMetadata(file);
            const filename = getSeoFilename();
            const url = await uploadImage(file, filename, metadata);
            onImageChange(url);
        } catch (err) {
            alert('Erro ao enviar imagem.');
        }
    };

    const [previewImage, setPreviewImage] = React.useState<string | null>(null);

    const handleGenerateAI = async () => {
        if (!currentImage) return;
        await processImageWithAI(currentImage, 'image/jpeg');
    };

    const handleApplyPreview = async () => {
        if (!previewImage) return;

        try {
            // Safer: Download and re-upload to our bucket to ensure ownership.
            const res = await fetch(previewImage);
            const blob = await res.blob();

            // SEO for AI Image
            const metadata = {
                customMetadata: {
                    product: productName || 'Produto',
                    business: 'MenuSummo',
                    type: 'AI-Enhanced',
                    source: 'Imagen 3'
                },
                contentType: 'image/jpeg'
            };
            const filename = slugify((productName || 'produto') + '-ia');

            const url = await uploadImage(blob, filename, metadata);

            onImageChange(url);
            setPreviewImage(null);
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar a nova imagem.');
        }
    };

    const handleDiscardPreview = () => {
        setPreviewImage(null);
    };

    return (
        <div className="space-y-3">
            {/* ... header ... */}
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 uppercase block">
                    Imagem do Produto
                </label>
            </div>

            {/* ... dropzon ... */}
            <div
                className="relative group selection-none"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <label className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition relative overflow-hidden ${isDragging ? 'border-summo-primary bg-summo-bg scale-105 shadow-xl' : 'hover:bg-gray-50 border-gray-200'}`}>

                    {/* LOADING STATE */}
                    {isUploading || isGeneratingAI ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 size={24} className="animate-spin text-summo-primary" />
                            <span className="text-[10px] font-bold text-gray-400">
                                {isGeneratingAI ? 'Aprimorando (IA)...' : 'Enviando...'}
                            </span>
                        </div>
                    ) : previewImage ? (
                        /* PREVIEW MODE (AI Result) */
                        <div className="w-full h-full relative group/img overflow-hidden bg-gray-50">
                            <img
                                src={previewImage}
                                className="w-full h-full object-cover"
                                alt="AI Preview"
                            />
                            {/* Comparison / Actions Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-sm flex flex-col gap-2 z-20 animate-in slide-in-from-bottom-5">
                                <span className="text-white text-[10px] font-bold text-center uppercase tracking-wider mb-1">
                                    Resultado IA (Preview)
                                </span>
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleApplyPreview(); }}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                    >
                                        <Check size={14} /> Aplicar
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleDiscardPreview(); }}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                    >
                                        <X size={14} /> Descartar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : currentImage ? (
                        /* CURRENT IMAGE MODE */
                        <div className="w-full h-full relative group/img overflow-hidden bg-gray-50">
                            {/* Blurred background (Only visible if contained) */}
                            {imageFit === 'contain' && (
                                <img
                                    src={currentImage}
                                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-125 transition-all duration-500"
                                    aria-hidden="true"
                                    alt=""
                                />
                            )}
                            {/* Actual image */}
                            <img
                                src={currentImage}
                                className={`relative w-full h-full z-10 transition-all duration-500 object-cover`}
                                alt={productName}
                            />

                            {/* Controls Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-3 flex justify-center gap-2 z-20 translate-y-full group-hover/img:translate-y-0 transition-transform bg-gradient-to-t from-black/60 to-transparent">

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (window.confirm('Remover esta imagem?')) {
                                            onImageChange('');
                                        }
                                    }}
                                    className="bg-white text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition shadow-lg transform hover:scale-110"
                                    title="Excluir Imagem"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* EMPTY STATE */
                        <div className="flex flex-col items-center gap-3 p-4 text-center">
                            <div className="p-3 bg-gray-50 rounded-full text-gray-400 group-hover:bg-white group-hover:text-summo-primary transition shadow-sm">
                                <ImageIcon size={32} />
                            </div>
                            <span className="text-sm text-gray-500 font-medium leading-tight max-w-[140px]">
                                Arraste ou clique para adicionar
                            </span>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading || isGeneratingAI}
                        onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                        onChange={handleFileSelect}
                    />
                    {isDragging && (
                        <div className="absolute inset-0 bg-summo-primary/10 flex items-center justify-center backdrop-blur-[1px]">
                            <Plus size={32} className="text-summo-primary animate-bounce" />
                        </div>
                    )}
                </label>
            </div>

            {/* AI Enhancement Button */}
            {!previewImage && (
                <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI || isUploading || !product.id || !currentImage}
                    className="w-full p-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold text-sm shadow-lg border border-white/20"
                    title="Aprimora a foto atual para estilo profissional (Food Porn)"
                >
                    {isGeneratingAI ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Aprimorando...
                        </>
                    ) : (
                        <>
                            <Wand2 size={16} />
                            Aprimorar Foto (IA)
                        </>
                    )}
                </button>
            )}


        </div>
    );
};
