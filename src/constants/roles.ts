import { Role } from '../types/user';

export const STANDARD_ROLES: Role[] = [
    {
        id: 'OWNER',
        name: 'Dono',
        description: 'Acesso total e irrestrito a todas as funcionalidades do sistema.',
        permissions: ['*'], // Wildcard para super admin
        isSystem: true,
        tenantId: undefined // Global
    },
    {
        id: 'MANAGER',
        name: 'Gerente',
        description: 'Gestão operacional completa, financeiro e estoque. Sem acesso a configurações sensíveis da assinatura.',
        permissions: [
            'view:dashboard',
            'view:pos', 'view:orders', 'view:kds',
            'view:inventory', 'manage:inventory',
            'view:finance', 'manage:finance', // Pode ver e gerenciar lucro/custo
            'view:customers', 'manage:customers',
            'manage:products',
            'manage:discounts',
            'manage:team', // Permissão para gerenciar usuários e cargos
            'view:settings' // Acesso básico a configurações não sensíveis
        ],
        isSystem: true,
        tenantId: undefined // Global
    },
    {
        id: 'CASHIER',
        name: 'Operador de Caixa',
        description: 'Foco em vendas (PDV), gestão de pedidos e fechamento de caixa.',
        permissions: [
            'view:pos', 'manage:pos', // Vender
            'view:orders', 'manage:orders', // Aceitar/recusar/despachar
            'view:customers', // Buscar cliente para pedido
            'view:cash_register', 'manage:cash_register' // Abrir/fechar caixa
        ],
        isSystem: true,
        tenantId: undefined // Global
    },
    {
        id: 'KITCHEN',
        name: 'Cozinha',
        description: 'Visualização exclusiva da tela de produção (KDS).',
        permissions: [
            'view:kds', 'manage:kds_status' // Apenas ver e mudar status de prato
        ],
        isSystem: true,
        tenantId: undefined // Global
    },
    {
        id: 'DRIVER',
        name: 'Entregador',
        description: 'Acesso ao aplicativo de entregas para visualizar rotas e pedidos atribuídos.',
        permissions: [
            'view:delivery_app', 'manage:delivery_status'
        ],
        isSystem: true,
        tenantId: undefined // Global
    },
    {
        id: 'WAITER',
        name: 'Garçom',
        description: 'Acesso ao aplicativo de mesas para lançar pedidos e acompanhar status.',
        permissions: [
            'view:waiter', 'manage:orders', 'view:menu'
        ],
        isSystem: true,
        tenantId: undefined // Global
    }
];
