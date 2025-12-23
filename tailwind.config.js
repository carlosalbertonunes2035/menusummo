/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // SUMMO PALETTE
                summo: {
                    primary: 'var(--summo-primary)',
                    'primary-fg': 'var(--summo-primary-fg)',
                    secondary: 'var(--summo-secondary)',
                    bg: 'var(--summo-bg)',
                    surface: 'var(--summo-surface)',
                    text: 'var(--summo-text)',
                    muted: 'var(--summo-text-muted)',
                    border: 'var(--summo-border)',
                    dark: '#111827',
                    success: 'var(--summo-secondary)',
                    danger: '#EF4444',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                mono: ['Source Code Pro', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-in-up': 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'bounce-slow': 'bounce 3s infinite',
                'ping-short': 'ping 0.5s cubic-bezier(0, 0, 0.2, 1) 1',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideInUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                slideInRight: {
                    '0%': { transform: 'translateX(20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' }
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' }
                }
            }
        }
    },
    plugins: [],
}
