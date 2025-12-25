/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],

    theme: {
        extend: {
            colors: {
                // SUMMO BRAND PALETTE - Orange Primary
                summo: {
                    // Primary Orange Spectrum
                    primary: '#FF6B00',
                    'primary-light': '#FF8534',
                    'primary-dark': '#EA580C',
                    'primary-fg': '#ffffff',

                    // Secondary Success Green
                    secondary: '#10B981',
                    'secondary-dark': '#059669',

                    // Neutral Backgrounds
                    bg: '#F8FAFC',
                    surface: '#ffffff',

                    // Text Colors
                    text: '#0F172A',
                    muted: '#64748B',

                    // Borders
                    border: '#E2E8F0',

                    // Semantic Colors
                    dark: '#111827',
                    success: '#10B981',
                    danger: '#EF4444',
                    warning: '#F59E0B',
                    info: '#3B82F6',
                },

                // Orange Extended Palette for gradients and variations
                orange: {
                    50: '#FFF7ED',
                    100: '#FFEDD5',
                    200: '#FED7AA',
                    300: '#FDBA74',
                    400: '#FB923C',
                    500: '#FF6B00', // Primary
                    600: '#EA580C',
                    700: '#C2410C',
                    800: '#9A3412',
                    900: '#7C2D12',
                },

                // Amber for gradient transitions
                amber: {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24',
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                    800: '#92400E',
                    900: '#78350F',
                },
            },

            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                mono: ['Source Code Pro', 'monospace'],
            },

            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-in-up': 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'bounce-slow': 'bounce 3s infinite',
                'ping-short': 'ping 0.5s cubic-bezier(0, 0, 0.2, 1) 1',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
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
                },
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(255, 107, 0, 0.3)' },
                    '100%': { boxShadow: '0 0 30px rgba(255, 107, 0, 0.6)' }
                }
            },

            backgroundImage: {
                'gradient-orange': 'linear-gradient(135deg, #FF6B00 0%, #F59E0B 100%)',
                'gradient-orange-warm': 'linear-gradient(135deg, #FF6B00 0%, #FDBA74 100%)',
                'gradient-orange-amber': 'linear-gradient(135deg, #FF6B00 0%, #D97706 100%)',
            },

            boxShadow: {
                'orange-sm': '0 1px 2px 0 rgba(255, 107, 0, 0.05)',
                'orange-md': '0 4px 6px -1px rgba(255, 107, 0, 0.1), 0 2px 4px -1px rgba(255, 107, 0, 0.06)',
                'orange-lg': '0 10px 15px -3px rgba(255, 107, 0, 0.2), 0 4px 6px -2px rgba(255, 107, 0, 0.1)',
                'orange-xl': '0 20px 25px -5px rgba(255, 107, 0, 0.2), 0 10px 10px -5px rgba(255, 107, 0, 0.1)',
            }
        }
    },
    plugins: [],
}
