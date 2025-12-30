import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConfig } from '../model/hooks/useConfig';

// Mocks
vi.mock('@firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(() => Promise.resolve({
        exists: () => true,
        data: () => ({
            serviceChargeEnabled: true,
            serviceChargePercentage: 0.1,
            peakHoursEnabled: true,
            peakHours: [
                { dayOfWeek: new Date().getDay(), startTime: '00:00', endTime: '23:59', multiplier: 1.5 }
            ]
        })
    })),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(() => vi.fn()),
    serverTimestamp: vi.fn(() => new Date()),
    initializeFirestore: vi.fn(() => ({})),
    persistentLocalCache: vi.fn(),
    persistentMultipleTabManager: vi.fn(),
}));

vi.mock('../../../lib/firebase', () => ({
    db: { type: 'firestore' }
}));

vi.mock('../../../contexts/AuthContext', () => ({
    useAuth: () => ({
        currentUser: { uid: 'admin-1', tenantId: 'tenant-1' }
    })
}));

describe('useConfig Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should calculate service charge with peak hour multiplier', async () => {
        const { result } = renderHook(() => useConfig());

        await act(async () => {
            await result.current.loadConfig();
        });

        // 10% * 1.5 = 15%
        expect(result.current.getServiceCharge(100)).toBe(15);
    });
});
