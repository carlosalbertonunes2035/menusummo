import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerRepository } from './CustomerRepository';
import { Customer } from '../../types';

// Use vi.hoisted to mock Firebase functions
const {
    mockDoc, mockSetDoc, mockDeleteDoc, mockUpdateDoc, mockGetDoc,
    mockCollection, mockGetDocs, mockQuery, mockWhere, mockDb,
    mockServerTimestamp
} = vi.hoisted(() => ({
    mockDoc: vi.fn(),
    mockSetDoc: vi.fn(),
    mockDeleteDoc: vi.fn(),
    mockUpdateDoc: vi.fn(),
    mockGetDoc: vi.fn(),
    mockCollection: vi.fn(),
    mockGetDocs: vi.fn(),
    mockQuery: vi.fn(),
    mockWhere: vi.fn(),
    mockDb: {},
    mockServerTimestamp: vi.fn(),
}));

// Mock Firebase imports
vi.mock('../../lib/firebase/client', () => ({
    db: mockDb
}));

vi.mock('@firebase/firestore', () => ({
    doc: mockDoc,
    setDoc: mockSetDoc,
    deleteDoc: mockDeleteDoc,
    updateDoc: mockUpdateDoc,
    getDoc: mockGetDoc,
    collection: mockCollection,
    getDocs: mockGetDocs,
    query: mockQuery,
    where: mockWhere,
    serverTimestamp: mockServerTimestamp,
}));

// Mock LocalStorage
vi.mock('../../lib/localStorage', () => ({
    getCollection: vi.fn(() => []),
    setCollection: vi.fn(),
}));

describe('CustomerRepository (Firebase Mode)', () => {
    let repository: CustomerRepository;
    const tenantId = 'test-tenant';
    const mockCustomer: Customer = {
        id: 'cust-1',
        name: 'John Doe',
        phone: '11999999999',
        address: 'Main St',
        totalSpent: 100,
        totalOrders: 5,
        lastOrderDate: new Date(),
        segments: ['VIP']
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockServerTimestamp.mockReturnValue('TIMESTAMP');
        repository = new CustomerRepository(false);
    });

    it('should create a customer in Firestore', async () => {
        mockDoc.mockReturnValue('doc-ref');

        await repository.create(mockCustomer, tenantId);

        expect(mockDoc).toHaveBeenCalledWith(mockDb, 'customers', mockCustomer.id);
        expect(mockSetDoc).toHaveBeenCalledWith('doc-ref', expect.objectContaining({
            ...mockCustomer,
            tenantId,
            createdAt: expect.anything(),
            updatedAt: expect.anything()
        }));
    });

    it('should update a customer in Firestore', async () => {
        mockDoc.mockReturnValue('doc-ref');
        const updates = { totalSpent: 150 };

        await repository.update(mockCustomer.id, updates, tenantId);

        expect(mockDoc).toHaveBeenCalledWith(mockDb, 'customers', mockCustomer.id);
        expect(mockUpdateDoc).toHaveBeenCalledWith('doc-ref', expect.objectContaining({
            ...updates,
            updatedAt: expect.anything()
        }));
    });

    it('should find a customer by phone in Firestore', async () => {
        mockCollection.mockReturnValue('collection-ref');
        // Expect strict query construction
        // logic: query(collection(db, 'customers'), where("phone", "==", phone), where("tenantId", "==", tenantId));

        mockWhere.mockImplementation((field, op, val) => `where-${field}-${val}`);
        mockQuery.mockReturnValue('query-ref');
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [{ data: () => mockCustomer }]
        });

        const result = await repository.findByPhone(mockCustomer.phone, tenantId);

        expect(mockCollection).toHaveBeenCalledWith(mockDb, 'customers');
        // We expect mockQuery to be called with the collection ref and the where clauses
        expect(mockQuery).toHaveBeenCalled();
        expect(mockGetDocs).toHaveBeenCalledWith('query-ref');
        expect(result).toEqual(mockCustomer);
    });

    it('should return null if customer not found by phone', async () => {
        mockCollection.mockReturnValue('collection-ref');
        mockQuery.mockReturnValue('query-ref');
        mockGetDocs.mockResolvedValue({
            empty: true,
            docs: []
        });

        const result = await repository.findByPhone('00000000000', tenantId);
        expect(result).toBeNull();
    });

    it('should get all customers for a tenant from Firestore', async () => {
        mockCollection.mockReturnValue('collection-ref');
        mockWhere.mockImplementation((field, op, val) => `where-${field}-${val}`);
        mockQuery.mockReturnValue('query-ref');
        mockGetDocs.mockResolvedValue({
            docs: [{ data: () => mockCustomer }]
        });

        const result = await repository.getAll(tenantId);

        expect(mockCollection).toHaveBeenCalledWith(mockDb, 'customers');
        expect(mockQuery).toHaveBeenCalledWith(
            expect.anything(), // It might wrap the query differently, typically query(col, where...)
            expect.stringContaining('where-tenantId-test-tenant')
        );
        expect(result).toEqual([mockCustomer]);
    });
});
