import { StoreSettings } from '@/types';

export function useLoyalty(localSettings: StoreSettings) {
    const loyalty = localSettings.loyalty || {
        enabled: false,
        pointsPerCurrency: 1,
        cashbackValuePer100Points: 5,
        minRedemptionPoints: 100,
        branding: {
            name: 'Cashback',
            color: '#FFD700'
        }
    };

    const pointsPerCurrency = loyalty.pointsPerCurrency || 1;
    const cashbackValuePer100Points = loyalty.cashbackValuePer100Points || 5;
    const currencyName = loyalty.branding?.name || 'Cashback';

    const simulation = {
        spendValue: 100,
        earnedPoints: 100 * pointsPerCurrency,
        discountValue: (((100 * pointsPerCurrency) / 100) * cashbackValuePer100Points).toFixed(2),
        effectiveCashback: ((pointsPerCurrency / 100) * cashbackValuePer100Points * 100).toFixed(1)
    };

    return {
        loyalty,
        simulation,
        currencyName
    };
}
