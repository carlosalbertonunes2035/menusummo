// Onboarding tour configuration using Shepherd.js
// Install: npm install shepherd.js react-shepherd

import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export const createOnboardingTour = (navigate: (path: string) => void) => {
    const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
            classes: 'shepherd-theme-custom',
            scrollTo: { behavior: 'smooth', block: 'center' },
            cancelIcon: {
                enabled: true
            }
        }
    });

    // Step 1: Welcome & Sidebar
    tour.addStep({
        id: 'welcome',
        text: `
            <div class="p-4">
                <h3 class="text-lg font-bold mb-2">👋 Bem-vindo ao SUMMO!</h3>
                <p class="text-gray-600">Vamos fazer um tour rápido de 2 minutos para você conhecer as principais funcionalidades.</p>
            </div>
        `,
        buttons: [
            {
                text: 'Pular Tour',
                classes: 'shepherd-button-secondary',
                action: tour.cancel
            },
            {
                text: 'Começar',
                action: tour.next
            }
        ]
    });

    // Step 2: Sidebar Navigation
    tour.addStep({
        id: 'sidebar',
        text: `
            <div class="p-4">
                <h3 class="text-lg font-bold mb-2">📍 Navegação</h3>
                <p class="text-gray-600">Aqui você acessa todas as funcionalidades do SUMMO. Vamos conhecer as principais!</p>
            </div>
        `,
        attachTo: {
            element: '.sidebar',
            on: 'right'
        },
        buttons: [
            {
                text: 'Voltar',
                classes: 'shepherd-button-secondary',
                action: tour.back
            },
            {
                text: 'Próximo',
                action: tour.next
            }
        ]
    });

    // Step 3: Menu Studio
    tour.addStep({
        id: 'menu-studio',
        text: `
            <div class="p-4">
                <h3 class="text-lg font-bold mb-2">🍔 Menu Studio</h3>
                <p class="text-gray-600">Aqui você cria e gerencia seus produtos, categorias e receitas. Vamos adicionar seu primeiro produto!</p>
            </div>
        `,
        attachTo: {
            element: '[href="/app/menu"]',
            on: 'right'
        },
        buttons: [
            {
                text: 'Voltar',
                classes: 'shepherd-button-secondary',
                action: tour.back
            },
            {
                text: 'Ir para Menu Studio',
                action: () => {
                    navigate('/menu');
                    tour.next();
                }
            }
        ]
    });

    // Step 4: Add Product Button
    tour.addStep({
        id: 'add-product',
        text: `
            <div class="p-4">
                <h3 class="text-lg font-bold mb-2">➕ Adicionar Produto</h3>
                <p class="text-gray-600">Clique aqui para criar seu primeiro produto. Você pode adicionar nome, preço, foto e muito mais!</p>
            </div>
        `,
        attachTo: {
            element: '.add-product-btn',
            on: 'bottom'
        },
        beforeShowPromise: function () {
            return new Promise<void>((resolve) => {
                const interval = setInterval(() => {
                    if (document.querySelector('.add-product-btn')) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
                setTimeout(() => { clearInterval(interval); resolve(); }, 4000);
            });
        },
        buttons: [
            {
                text: 'Voltar',
                classes: 'shepherd-button-secondary',
                action: tour.back
            },
            {
                text: 'Entendi',
                action: tour.next
            }
        ]
    });

    // Step 5: POS
    tour.addStep({
        id: 'pos',
        text: `
            <div class="p-4">
                <h3 class="text-lg font-bold mb-2">💰 PDV (Ponto de Venda)</h3>
                <p class="text-gray-600">Aqui você registra suas vendas de forma rápida e prática. Ideal para atendimento no balcão!</p>
            </div>
        `,
        attachTo: {
            element: '[href="/app/pos"]',
            on: 'right'
        },
        buttons: [
            {
                text: 'Voltar',
                classes: 'shepherd-button-secondary',
                action: tour.back
            },
            {
                text: 'Próximo',
                action: tour.next
            }
        ]
    });

    // Step 6: Dashboard
    tour.addStep({
        id: 'dashboard',
        text: `
            <div class="p-4">
                <h3 class="text-lg font-bold mb-2">📊 Dashboard</h3>
                <p class="text-gray-600">Acompanhe suas vendas, lucro e métricas importantes em tempo real!</p>
            </div>
        `,
        attachTo: {
            element: '[href="/app/launchpad"]',
            on: 'right'
        },
        buttons: [
            {
                text: 'Voltar',
                classes: 'shepherd-button-secondary',
                action: tour.back
            },
            {
                text: 'Próximo',
                action: tour.next
            }
        ]
    });

    // Step 7: Finish
    tour.addStep({
        id: 'finish',
        text: `
            <div class="p-4">
                <h3 class="text-lg font-bold mb-2">🎉 Pronto!</h3>
                <p class="text-gray-600 mb-4">Você já conhece o básico do SUMMO. Agora é hora de colocar a mão na massa!</p>
                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p class="text-sm text-green-800 font-medium">
                        ✅ Próximo passo: Adicione seu primeiro produto no Menu Studio
                    </p>
                </div>
            </div>
        `,
        buttons: [
            {
                text: 'Começar a Usar',
                action: () => {
                    navigate('/menu');
                    tour.complete();
                }
            }
        ]
    });

    return tour;
};

// Custom CSS for tour (add to your global styles)
export const tourStyles = `
.shepherd-theme-custom {
    border-radius: 1rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.shepherd-theme-custom .shepherd-content {
    padding: 0;
}

.shepherd-theme-custom .shepherd-header {
    display: none;
}

.shepherd-theme-custom .shepherd-footer {
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
}

.shepherd-button {
    background: #FF6B00;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.shepherd-button:hover {
    background: #e55f00;
    transform: scale(1.02);
}

.shepherd-button-secondary {
    background: #f3f4f6;
    color: #6b7280;
}

.shepherd-button-secondary:hover {
    background: #e5e7eb;
}

.shepherd-modal-overlay-container {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}
`;
