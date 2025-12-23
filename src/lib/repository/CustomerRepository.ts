
import { Customer } from '../../types';
import { BaseRepository } from './BaseRepository';
import { query, collection, where, getDocs } from '@firebase/firestore';
import { db } from '../../lib/firebase/client';

export class CustomerRepository extends BaseRepository<Customer> {
    constructor(isMockMode: boolean = false) {
        super('customers', isMockMode);
    }

    async findByPhone(phone: string, tenantId: string): Promise<Customer | null> {
        if (this.isMockMode) {
            const all = await this.getAll(tenantId);
            const cleanPhone = phone.replace(/\D/g, '');
            return all.find((c: Customer) => c.phone && c.phone.replace(/\D/g, '') === cleanPhone) || null;
        }

        const q = query(
            collection(db, 'customers'),
            where("tenantId", "==", tenantId),
            where("phone", "==", phone)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) return snapshot.docs[0].data() as Customer;

        return null;
    }
}
