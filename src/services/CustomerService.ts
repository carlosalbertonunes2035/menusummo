
import { Customer } from '@/types';
import { CustomerRepository } from '@/lib/repository/CustomerRepository';
import { BaseService } from './BaseService';

export class CustomerService extends BaseService<Customer, CustomerRepository> {
    constructor(isMockMode: boolean = false) {
        super(new CustomerRepository(isMockMode));
    }

    async getCustomerByPhone(phone: string, tenantId: string): Promise<Customer | null> {
        return this.repository.findByPhone(phone, tenantId);
    }
}

export const customerService = (isMockMode: boolean = false) => new CustomerService(isMockMode);
