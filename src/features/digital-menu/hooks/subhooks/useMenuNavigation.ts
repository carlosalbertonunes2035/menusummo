import { useEffect, useRef } from 'react';
import { Product, StoreSettings } from '../../../../types';
import { getProductChannel } from '../../../../lib/utils';

interface UseMenuNavigationProps {
    selectedProductForDetail: Product | null;
    setSelectedProductForDetail: (p: Product | null) => void;
    settings: StoreSettings;
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    categories: string[];
    storeSlug: string;
}

export function useMenuNavigation({
    selectedProductForDetail,
    setSelectedProductForDetail,
    settings,
    activeCategory,
    setActiveCategory,
    categories,
    storeSlug
}: UseMenuNavigationProps) {
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isManualScrolling = useRef(false);

    // SEO Syncing
    useEffect(() => {
        if (selectedProductForDetail) {
            const prod = selectedProductForDetail;
            const channel = getProductChannel(prod, 'digital-menu');
            const title = prod.seoTitle || channel.displayName || prod.name;
            const desc = prod.seoDescription || channel.description || prod.description || '';

            document.title = `${title} | ${settings.brandName || 'Summo'}`;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', desc);
        } else {
            document.title = `${settings.brandName || 'Summo'} - Cardápio Digital`;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', settings.seo?.description || '');
        }
    }, [selectedProductForDetail, settings]);

    // Scroll Spy
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (isManualScrolling.current) return;
            const offset = 180;
            let currentCat = activeCategory;
            let minDiff = Infinity;

            categories.forEach(cat => {
                const el = categoryRefs.current[cat];
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const diff = Math.abs(rect.top - offset);
                    if (diff < minDiff) {
                        minDiff = diff;
                        currentCat = cat;
                    }
                }
            });

            if (currentCat !== activeCategory) {
                setActiveCategory(currentCat);
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [categories, activeCategory, setActiveCategory]);

    const scrollToCategory = (cat: string, clearSearch: () => void, setFeedTab: () => void) => {
        isManualScrolling.current = true;
        clearSearch();
        setFeedTab();
        setActiveCategory(cat);
        const el = categoryRefs.current[cat];
        if (el && scrollContainerRef.current) {
            const yOffset = -160;
            const container = scrollContainerRef.current;
            const containerTop = container.getBoundingClientRect().top;
            const elTop = el.getBoundingClientRect().top;
            const scrollPos = elTop - containerTop + container.scrollTop + yOffset;
            container.scrollTo({ top: scrollPos, behavior: 'smooth' });
        }
        setTimeout(() => { isManualScrolling.current = false; }, 800);
    };

    const updateUrlForProduct = (p: Product | null) => {
        const baseUrl = `/loja/${storeSlug}`;
        if (p) {
            const productUrl = `${baseUrl}/produto/${p.slug || p.id}`;
            window.history.replaceState({ modal: true }, '', productUrl);
        } else {
            window.history.replaceState({ modal: false }, '', baseUrl);
        }
    };

    return {
        categoryRefs,
        scrollContainerRef,
        scrollToCategory,
        updateUrlForProduct
    };
}
