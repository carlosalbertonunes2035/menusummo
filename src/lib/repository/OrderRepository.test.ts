import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderRepository } from './OrderRepository';
import { Order, OrderStatus, OrderType, PaymentMethod } from '../../types';

// Mock Firebase
const {
    mockDoc,
    mockSetDoc,
    mockUpdateDoc,
    mockGetDoc,
    mockCollection,
    mockGetDocs,
    mockQuery,
    mockWhere,
    mockServerTimestamp
} = vi.hoisted(() => ({
    mockDoc: vi.fn(),
    mockSetDoc: vi.fn(),
    mockUpdateDoc: vi.fn(),
    mockGetDoc: vi.fn(),
    mockCollection: vi.fn(),
    mockGetDocs: vi.fn(),
    mockQuery: vi.fn(),
    mockWhere: vi.fn(),
    mockServerTimestamp: vi.fn(),
}));

vi.mock('@firebase/firestore', () => ({
    doc: mockDoc,
    setDoc: mockSetDoc,
    updateDoc: mockUpdateDoc,
    getDoc: mockGetDoc,
    collection: mockCollection,
    getDocs: mockGetDocs,
    query: mockQuery,
    where: mockWhere,
    serverTimestamp: mockServerTimestamp,
}));

vi.mock('../../lib/firebase/client', () => ({
    db: {}
}));

describe('OrderRepository', () => {
    let repository: OrderRepository;
    const mockOrder: Order = {
        id: 'order-123',
        tenantId: 'store-1',
        customerName: 'John Doe',
        items: [],
        status: OrderStatus.PENDING,
        total: 100,
        createdAt: new Date(),
        type: OrderType.DINE_IN,
        cost: 50,
        origin: 'POS',
        payments: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockServerTimestamp.mockReturnValue('TIMESTAMP');
        repository = new OrderRepository(false); // Test Firebase mode
    });

    it('should create an order', async () => {
        mockDoc.mockReturnValue('doc-ref');
        await repository.create(mockOrder, 'store-1');

        expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'orders', mockOrder.id);
        expect(mockSetDoc).toHaveBeenCalledWith('doc-ref', expect.objectContaining({
            ...mockOrder,
            tenantId: 'store-1',
            createdAt: expect.anything(),
            updatedAt: expect.anything()
        }));
    });

    it('should update an order', async () => {
        mockDoc.mockReturnValue('doc-ref');
        const updateData = { status: OrderStatus.COMPLETED };

        await repository.update(mockOrder.id, updateData, 'store-1');

        expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'orders', mockOrder.id);
        expect(mockUpdateDoc).toHaveBeenCalledWith('doc-ref', expect.objectContaining({
            ...updateData,
            updatedAt: expect.anything()
        }));
    });

    it('should get an order by id', async () => {
        mockDoc.mockReturnValue('doc-ref');
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => mockOrder
        });

        const result = await repository.getById(mockOrder.id, 'store-1');

        expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'orders', mockOrder.id);
        expect(mockGetDoc).toHaveBeenCalledWith('doc-ref');
        expect(result).toEqual(mockOrder);
    });

    it('should return null if order not found by id', async () => {
        mockDoc.mockReturnValue('doc-ref');
        mockGetDoc.mockResolvedValue({
            exists: () => false
        });

        const result = await repository.getById('non-existent', 'store-1');

        expect(result).toBeNull();
    });

    it('should get all orders for a tenant', async () => {
        mockCollection.mockReturnValue('collection-ref');
        mockQuery.mockReturnValue('query-ref');
        mockGetDocs.mockResolvedValue({
            docs: [{ data: () => mockOrder }]
        });

        const result = await repository.getAll('store-1');

        expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'orders');
        expect(mockWhere).toHaveBeenCalledWith('tenantId', '==', 'store-1');
        expect(mockGetDocs).toHaveBeenCalledWith('query-ref');
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(mockOrder);
    });
});
