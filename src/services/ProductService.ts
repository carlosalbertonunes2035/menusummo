
import { Product } from '@/types';
import { ProductRepository } from '@/lib/repository/ProductRepository';
import { BaseService } from './BaseService';

export class ProductService extends BaseService<Product, ProductRepository> {
    constructor(isMockMode: boolean = false) {
        super(new ProductRepository(isMockMode));
    }

    async getProductsByCategory(tenantId: string, category: string): Promise<Product[]> {
        return this.repository.getByCategory(tenantId, category);
    }
}

export const productService = (isMockMode: boolean = false) => new ProductService(isMockMode);
