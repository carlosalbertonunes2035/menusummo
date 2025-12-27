import { ref, uploadBytes, getDownloadURL, deleteObject } from "@firebase/storage";
import { storage } from "./client";

/**
 * Service to handle Firebase Storage operations
 */
export const storageService = {
    /**
     * Uploads a file to a specific path in storage
     */
    /**
     * Uploads a file to a specific path in storage with optional metadata
     */
    async uploadFile(file: File | Blob, path: string, metadata?: any): Promise<string> {
        // Enforce real upload
        console.log(`[StorageService] Uploading to: ${path}`);

        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file, metadata);
            const url = await getDownloadURL(snapshot.ref);
            console.log(`[StorageService] Upload success: ${url}`);
            return url;
        } catch (error: any) {
            console.error("[StorageService] Upload failed:", error);
            throw error;
        }
    },

    /**
     * Uploads a product image
     * Path: tenants/{tenantId}/products/{productId}/{filename}
     */
    async uploadProductImage(
        file: File | Blob,
        tenantId: string,
        productId: string,
        customName?: string,
        metadata?: any
    ): Promise<string> {
        const extension = file instanceof File ? file.name.split('.').pop() : 'png';
        const finalName = customName ? `${customName}_${Date.now()}` : `main-image_${Date.now()}`;
        const path = `tenants/${tenantId}/products/${productId}/${finalName}.${extension}`;

        return this.uploadFile(file, path, metadata);
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
        customName?: string,
        metadata?: any
    ): Promise<{ mainUrl: string; thumbnailUrl: string }> {
        const extension = file instanceof File ? file.name.split('.').pop() : 'jpg';
        const timestamp = Date.now();
        const baseName = customName || 'main-image';

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
        const mainPath = `tenants/${tenantId}/products/${productId}/${baseName}_${timestamp}.${extension}`;
        const mainUrl = await this.uploadFile(mainBlob, mainPath, metadata);

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
        const thumbPath = `tenants/${tenantId}/products/${productId}/${baseName}_thumb_${timestamp}.${extension}`;
        const thumbnailUrl = await this.uploadFile(thumbBlob, thumbPath, metadata);

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
