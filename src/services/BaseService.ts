
import { CollectionName } from '@/types/collections';
import { BaseRepository } from '@/lib/repository/BaseRepository';

export abstract class BaseService<T extends { id: string }, R extends BaseRepository<T>> {
    protected repository: R;

    constructor(repository: R) {
        this.repository = repository;
    }

    async getById(id: string, tenantId: string): Promise<T | null> {
        try {
            return await this.repository.getById(id, tenantId);
        } catch (error) {
            console.error(`Error in BaseService.getById for collection ${id}:`, error);
            throw error;
        }
    }

    async list(tenantId: string): Promise<T[]> {
        try {
            return await this.repository.getAll(tenantId);
        } catch (error) {
            console.error(`Error in BaseService.list:`, error);
            throw error;
        }
    }

    async save(data: T, tenantId: string): Promise<string> {
        try {
            if (!tenantId) throw new Error("TenantId is required for saving.");

            // If it has an ID, we try to update it as our Repository.update now uses setDoc(merge:true)
            // which works as an upsert if the ID is known.
            if (data.id) {
                await this.repository.update(data.id, data, tenantId);
                return data.id;
            }

            // If no ID, create a new one
            return await this.repository.create(data, tenantId);
        } catch (error) {
            console.error(`Error in BaseService.save for ${this.repository.constructor.name}:`, error);
            throw error;
        }
    }

    async remove(id: string, tenantId: string): Promise<void> {
        try {
            await this.repository.delete(id, tenantId);
        } catch (error) {
            console.error(`Error in BaseService.remove:`, error);
            throw error;
        }
    }
}
