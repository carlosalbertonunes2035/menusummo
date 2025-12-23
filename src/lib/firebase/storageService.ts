import { ref, uploadBytes, getDownloadURL, deleteObject } from "@firebase/storage";
import { storage } from "./client";

/**
 * Service to handle Firebase Storage operations
 */
export const storageService = {
    /**
     * Uploads a file to a specific path in storage
     */
    async uploadFile(file: File | Blob, path: string): Promise<string> {
        // --- OFFLINE/MOCK FALLBACK ---
        // If there's no active firebase session or in mock mode, use base64
        const isMockEntry = localStorage.getItem('summo_mock_session') === 'true';
        if (isMockEntry) {
            console.warn("[StorageService] Mock mode detected. using Data URL fallback.");
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        }

        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            return getDownloadURL(snapshot.ref);
        } catch (error: any) {
            if (error.code === 'storage/unauthorized') {
                console.warn("[StorageService] Unauthorized. Falling back to Data URL for local session.");
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            }
            throw error;
        }
    },

    /**
     * Uploads a product image
     * Path: tenants/{tenantId}/products/{productId}/{filename}
     */
    async uploadProductImage(file: File | Blob, tenantId: string, productId: string, filename: string = 'main-image'): Promise<string> {
        const extension = file instanceof File ? file.name.split('.').pop() : 'png';
        const path = `tenants/${tenantId}/products/${productId}/${filename}_${Date.now()}.${extension}`;
        return this.uploadFile(file, path);
    },

    /**
     * Uploads a story image
     * Path: tenants/{tenantId}/stories/{timestamp}_{filename}
     */
    async uploadStoryImage(file: File | Blob, tenantId: string, filename: string = 'story'): Promise<string> {
        const extension = file instanceof File ? file.name.split('.').pop() : 'png';
        const path = `tenants/${tenantId}/stories/${Date.now()}_${filename}.${extension}`;
        return this.uploadFile(file, path);
    },

    /**
     * Uploads a product image with thumbnail
     * Path: tenants/{tenantId}/products/{productId}/{filename}
     * Returns: { mainUrl, thumbnailUrl }
     */
    async uploadProductImageWithThumbnail(
        file: File | Blob,
        tenantId: string,
        productId: string,
        filename: string = 'main-image'
    ): Promise<{ mainUrl: string; thumbnailUrl: string }> {
        const extension = file instanceof File ? file.name.split('.').pop() : 'jpg';
        const timestamp = Date.now();

        // Upload main image (high quality, 1200px)
        let mainBlob: Blob = file;
        if (file instanceof File && (window as any).compressImage) {
            try {
                const compressed = await (window as any).compressImage(file, 1200, 0.85);
                mainBlob = compressed.blob || file;
            } catch (e) {
                console.warn('Failed to compress main image, using original', e);
            }
        }
        const mainPath = `tenants/${tenantId}/products/${productId}/${filename}_${timestamp}.${extension}`;
        const mainUrl = await this.uploadFile(mainBlob, mainPath);

        // Upload thumbnail (low quality, 400px)
        let thumbBlob: Blob = file;
        if (file instanceof File && (window as any).compressImage) {
            try {
                const compressed = await (window as any).compressImage(file, 400, 0.7);
                thumbBlob = compressed.blob || file;
            } catch (e) {
                console.warn('Failed to compress thumbnail, using original', e);
            }
        }
        const thumbPath = `tenants/${tenantId}/products/${productId}/${filename}_thumb_${timestamp}.${extension}`;
        const thumbnailUrl = await this.uploadFile(thumbBlob, thumbPath);

        return { mainUrl, thumbnailUrl };
    },

    /**
     * Deletes a file from storage by its URL or Path
     */
    async deleteFile(fileUrlOrPath: string): Promise<void> {
        // If it's a full URL, we need to extract the path or use refFromURL (not available in web SDK directly easily)
        // For simplicity, we assume if it starts with http, we might need a different approach or just ignore for now
        // If it's a path like 'products/123/img.png', we can use it directly
        if (fileUrlOrPath.startsWith('http')) {
            // Extracting path from Firebase Storage URL is tricky manually, 
            // but usually we save the path in Firestore too if we want easy cleanup.
            // For now, let's just support direct paths if provided.
            console.warn("Delete by URL not yet implemented fully. Use storage path.");
            return;
        }
        const storageRef = ref(storage, fileUrlOrPath);
        await deleteObject(storageRef);
    }
};
