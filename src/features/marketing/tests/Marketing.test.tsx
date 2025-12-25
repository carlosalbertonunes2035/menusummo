import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Marketing from '../pages/Marketing';
import * as AppContext from '@/contexts/AppContext';
import * as DataContext from '@/contexts/DataContext';
import * as AuthContext from '@/features/auth/context/AuthContext';

// Mock contexts
vi.mock('@/contexts/AppContext', () => ({
    useApp: vi.fn()
}));

vi.mock('@/contexts/DataContext', () => ({
    useData: vi.fn()
}));

vi.mock('@/features/auth/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('@/hooks/useOrders', () => ({
    useOrders: vi.fn(() => ({ data: [] }))
}));

vi.mock('@/lib/firebase/storageService', () => ({
    storageService: {
        uploadFile: vi.fn()
    }
}));

vi.mock('@/services/slugService', () => ({
    generateUniqueSlug: vi.fn()
}));

const mockSettings = {
    brandName: 'Pizzaria Original',
    logoUrl: '',
    address: 'Rua Teste, 123',
    storefront: { slug: 'pizza-original' },
    digitalMenu: {
        branding: {
            primaryColor: '#000000',
            backgroundColor: '#ffffff',
            promoBanners: [],
            bannerRotationSeconds: 5
        },
        layout: 'LIST'
    },
    seo: { title: '', description: '', keywords: [] },
    analytics: { googleAnalyticsId: '', metaPixelId: '' }
};

describe('Marketing Component', () => {
    const setSettingsMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (AppContext.useApp as any).mockReturnValue({
            settings: mockSettings,
            setSettings: setSettingsMock,
            showToast: vi.fn(),
            handleAction: vi.fn()
        });
        (DataContext.useData as any).mockReturnValue({
            products: [],
            stories: [],
            coupons: [],
            orders: []
        });
        (AuthContext.useAuth as any).mockReturnValue({
            systemUser: { tenantId: 'test-tenant' }
        });
    });

    it('should render initial settings in Showcase tab', () => {
        render(<Marketing />);

        const input = screen.getByDisplayValue('Pizzaria Original');
        expect(input).toBeTruthy();
    });

    it('should enable save button when changes are made', () => {
        render(<Marketing />);

        // The save button only appears if hasChanges is true
        expect(screen.queryByText('Salvar Alterações')).not.toBeInTheDocument();

        const input = screen.getByLabelText(/Nome Fantasia/i);
        fireEvent.change(input, { target: { value: 'Pizzaria Nova', name: 'brandName' } });

        expect(screen.getByText('Salvar Alterações')).toBeInTheDocument();
    });

    it('should call setSettings when save button is clicked', () => {
        render(<Marketing />);

        const input = screen.getByLabelText(/Nome Fantasia/i);
        fireEvent.change(input, { target: { value: 'Pizzaria Nova', name: 'brandName' } });

        const saveButton = screen.getByText('Salvar Alterações');
        fireEvent.click(saveButton);

        expect(setSettingsMock).toHaveBeenCalled();
        const callArgs = setSettingsMock.mock.calls[0][0];
        expect(callArgs.brandName).toBe('Pizzaria Nova');
    });
});
