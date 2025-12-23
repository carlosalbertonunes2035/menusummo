
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
            // Standard validation or processing could go here
            if (data.id) {
                const existing = await this.repository.getById(data.id, tenantId);
                if (existing) {
                    await this.repository.update(data.id, data, tenantId);
                    return data.id;
                }
            }
            return await this.repository.create(data, tenantId);
        } catch (error) {
            console.error(`Error in BaseService.save:`, error);
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
