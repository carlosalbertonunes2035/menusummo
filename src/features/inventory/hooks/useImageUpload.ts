import { useState, useMemo } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { storageService } from '@/lib/firebase/storageService';

export const useImageUpload = (productId: string) => {
    const { systemUser } = useAuth();
    const tenantId = systemUser?.tenantId || 'global';

    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const uploadImage = async (file: File | Blob, customName?: string, metadata?: any): Promise<string> => {
        if (!productId) {
            throw new Error('Product ID is required for image upload');
        }

        setIsUploading(true);
        try {
            let uploadSource: File | Blob = file;

            // Compress if possible
            if (file instanceof File && (window as any).compressImage) {
                try {
                    const compressed = await (window as any).compressImage(file, 1200, 0.85);
                    uploadSource = compressed.blob || file;
                } catch (e) {
                    console.warn('Compression failed, using original file', e);
                }
            }

            return await storageService.uploadProductImage(
                uploadSource,
                tenantId,
                productId,
                customName, // Pass custom filename
                metadata // Pass custom metadata
            );
        } finally {
            setIsUploading(false);
        }
    };

    const uploadImageWithThumbnail = async (file: File | Blob): Promise<{ mainUrl: string; thumbnailUrl: string }> => {
        if (!productId) {
            throw new Error('Product ID is required for image upload');
        }

        setIsUploading(true);
        try {
            return await storageService.uploadProductImageWithThumbnail(file, tenantId, productId);
        } finally {
            setIsUploading(false);
        }
    };

    return {
        uploadImage,
        uploadImageWithThumbnail,
        isUploading,
        isDragging,
        setIsDragging
    };
};
