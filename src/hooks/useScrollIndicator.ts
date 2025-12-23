import { useEffect, useState, RefObject } from 'react';

/**
 * Hook to detect scroll position and show/hide scroll indicators
 */
export const useScrollIndicator = (ref: RefObject<HTMLElement>) => {
    const [showTopShadow, setShowTopShadow] = useState(false);
    const [showBottomShadow, setShowBottomShadow] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = element;
            setShowTopShadow(scrollTop > 10);
            setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 10);
        };

        // Initial check
        handleScroll();

        // Listen to scroll events
        element.addEventListener('scroll', handleScroll);

        // Also check on resize
        const resizeObserver = new ResizeObserver(handleScroll);
        resizeObserver.observe(element);

        return () => {
            element.removeEventListener('scroll', handleScroll);
            resizeObserver.disconnect();
        };
    }, [ref]);

    return { showTopShadow, showBottomShadow };
};
