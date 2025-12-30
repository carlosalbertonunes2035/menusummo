import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductRepository } from './ProductRepository';
import { Product } from '../../types';

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
    db: mockDb,
    auth: {
        currentUser: { uid: 'test-user-123' }
    }
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

// Mock LocalStorage (for fallback, though we are primarily testing Firebase path or can test both)
vi.mock('../../lib/localStorage', () => ({
    getCollection: vi.fn(() => []),
    setCollection: vi.fn(),
}));

describe('ProductRepository (Firebase Mode)', () => {
    let repository: ProductRepository;
    const tenantId = 'test-tenant';
    const mockProduct: Product = {
        id: 'prod-1',
        name: 'Burger',
        category: 'Food',
        cost: 5.00,
        ingredients: [],
        channels: [
            { channel: 'pos', price: 15.00, isAvailable: true }
        ],
        tags: [],
        optionGroupIds: []
    } as any; // Cast as any to avoid needing all optional fields for test

    beforeEach(() => {
        vi.clearAllMocks();
        mockServerTimestamp.mockReturnValue('TIMESTAMP');
        // Instantiate repository in "Real Mode" (isMockMode = false)
        repository = new ProductRepository(false);
    });

    it('should create a product in Firestore', async () => {
        mockDoc.mockReturnValue('doc-ref'); // Mock doc() returning a ref

        await repository.create(mockProduct, tenantId);

        expect(mockDoc).toHaveBeenCalledWith(mockDb, 'products', mockProduct.id);
        expect(mockSetDoc).toHaveBeenCalledWith('doc-ref', expect.objectContaining({
            ...mockProduct,
            tenantId,
            createdAt: expect.anything(),
            updatedAt: expect.anything()
        }));
    });

    it('should update a product in Firestore', async () => {
        mockDoc.mockReturnValue('doc-ref');
        const updates = { name: 'Burger Updated' };

        await repository.update(mockProduct.id, updates, tenantId);

        expect(mockDoc).toHaveBeenCalledWith(mockDb, 'products', mockProduct.id);
        expect(mockSetDoc).toHaveBeenCalledWith('doc-ref', expect.objectContaining({
            ...updates,
            tenantId,
            updatedAt: expect.anything()
        }), { merge: true });
    });

    it('should delete a product from Firestore', async () => {
        mockDoc.mockReturnValue('doc-ref');

        await repository.delete(mockProduct.id, tenantId);

        expect(mockDoc).toHaveBeenCalledWith(mockDb, 'products', mockProduct.id);
        expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref');
    });

    it('should get a product by ID from Firestore', async () => {
        mockDoc.mockReturnValue('doc-ref');
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => mockProduct
        });

        const result = await repository.getById(mockProduct.id, tenantId);

        expect(mockDoc).toHaveBeenCalledWith(mockDb, 'products', mockProduct.id);
        expect(mockGetDoc).toHaveBeenCalledWith('doc-ref');
        expect(result).toEqual(mockProduct);
    });

    it('should return null if product not found', async () => {
        mockDoc.mockReturnValue('doc-ref');
        mockGetDoc.mockResolvedValue({
            exists: () => false,
            data: () => undefined
        });

        const result = await repository.getById('non-existent', tenantId);
        expect(result).toBeNull();
    });

    it('should get all products for a tenant from Firestore', async () => {
        mockCollection.mockReturnValue('collection-ref');
        mockWhere.mockReturnValue('where-constraint');
        mockQuery.mockReturnValue('query-ref');
        mockGetDocs.mockResolvedValue({
            docs: [
                { data: () => mockProduct }
            ]
        });

        const result = await repository.getAll(tenantId);

        expect(mockCollection).toHaveBeenCalledWith(mockDb, 'products');
        expect(mockWhere).toHaveBeenCalledWith('tenantId', '==', tenantId);
        expect(mockQuery).toHaveBeenCalledWith('collection-ref', 'where-constraint');
        expect(result).toEqual([mockProduct]);
    });
});
