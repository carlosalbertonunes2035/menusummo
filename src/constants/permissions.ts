
export interface PermissionGroup {
    id: string;
    label: string;
    description: string;
    capabilities: PermissionDefinition[];
}

export interface PermissionDefinition {
    id: string; // 'view:pos'
    label: string; // 'Acessar PDV'
    risk?: 'low' | 'medium' | 'high' | 'critical'; // Nível de risco
}

// Catálogo completo de permissões com níveis de risco
export const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        id: 'pos',
        label: 'Frente de Caixa (PDV)',
        description: 'Vendas, abertura e fechamento de caixa.',
        capabilities: [
            { id: 'view:pos', label: 'Acessar Tela de Vendas', risk: 'low' },
            { id: 'pos:sell', label: 'Realizar Vendas', risk: 'medium' },
            { id: 'pos:discount', label: 'Aplicar Descontos Manuais', risk: 'high' },
            { id: 'pos:cancel', label: 'Cancelar Vendas', risk: 'high' },
        ]
    },
    {
        id: 'cash',
        label: 'Gestão de Caixa',
        description: 'Controle de abertura, fechamento e movimentações de caixa.',
        capabilities: [
            { id: 'view:cash_register', label: 'Ver Histórico de Caixa', risk: 'medium' },
            { id: 'cash:open', label: 'Abrir Caixa', risk: 'high' },
            { id: 'cash:close', label: 'Fechar Caixa', risk: 'high' },
            { id: 'cash:withdraw', label: 'Sangria de Caixa', risk: 'critical' },
            { id: 'manage:cash_register', label: 'Gerenciar Caixa (Completo)', risk: 'critical' },
        ]
    },
    {
        id: 'orders',
        label: 'Gestão de Pedidos',
        description: 'Controle de fluxo de pedidos (Delivery/Mesa).',
        capabilities: [
            { id: 'view:orders', label: 'Visualizar Pedidos', risk: 'low' },
            { id: 'orders:accept', label: 'Aceitar Pedidos', risk: 'medium' },
            { id: 'orders:edit', label: 'Editar Pedidos', risk: 'high' },
            { id: 'orders:cancel', label: 'Cancelar Pedidos', risk: 'high' },
            { id: 'manage:order_status', label: 'Alterar Status (Aceitar/Pronto)', risk: 'medium' },
            { id: 'manage:order_cancel', label: 'Cancelar Pedidos (Legacy)', risk: 'high' },
        ]
    },
    {
        id: 'kds',
        label: 'Cozinha (KDS)',
        description: 'Tela de produção.',
        capabilities: [
            { id: 'view:kds', label: 'Ver Tela de Produção', risk: 'low' },
            { id: 'kds:complete', label: 'Concluir Pratos', risk: 'medium' },
            { id: 'manage:kds', label: 'Gerenciar Produção (Completo)', risk: 'medium' },
        ]
    },
    {
        id: 'menu',
        label: 'Cardápio e Produtos',
        description: 'Gestão de produtos, categorias e preços.',
        capabilities: [
            { id: 'view:menu', label: 'Ver Cardápio', risk: 'low' },
            { id: 'menu:create', label: 'Criar Produtos', risk: 'medium' },
            { id: 'menu:edit', label: 'Editar Produtos', risk: 'medium' },
            { id: 'menu:delete', label: 'Excluir Produtos', risk: 'high' },
            { id: 'menu:pricing', label: 'Alterar Preços', risk: 'critical' },
            { id: 'manage:products', label: 'Gerenciar Produtos (Completo)', risk: 'high' },
        ]
    },
    {
        id: 'inventory',
        label: 'Estoque',
        description: 'Gestão de estoque e fichas técnicas.',
        capabilities: [
            { id: 'view:inventory', label: 'Ver Estoque', risk: 'low' },
            { id: 'stock:adjust', label: 'Ajustar Estoque', risk: 'high' },
            { id: 'stock:transfer', label: 'Transferir Estoque', risk: 'medium' },
            { id: 'manage:stock', label: 'Gerenciar Estoque (Completo)', risk: 'high' },
            { id: 'manage:suppliers', label: 'Gerir Fornecedores', risk: 'medium' },
        ]
    },
    {
        id: 'finance',
        label: 'Financeiro',
        description: 'DRE, Contas e Relatórios.',
        capabilities: [
            { id: 'view:finance', label: 'Ver Painel Financeiro', risk: 'medium' },
            { id: 'finance:reports', label: 'Relatórios Financeiros', risk: 'high' },
            { id: 'finance:expenses', label: 'Lançar Despesas', risk: 'high' },
            { id: 'finance:edit', label: 'Editar Transações', risk: 'critical' },
            { id: 'manage:expenses', label: 'Gerenciar Despesas (Completo)', risk: 'high' },
            { id: 'manage:finance', label: 'Gerenciar Financeiro (Completo)', risk: 'critical' },
            { id: 'view:reports', label: 'Ver Relatórios Gerenciais', risk: 'high' },
        ]
    },
    {
        id: 'crm',
        label: 'Clientes (CRM)',
        description: 'Dados de clientes e fidelidade.',
        capabilities: [
            { id: 'view:customers', label: 'Ver Clientes', risk: 'low' },
            { id: 'crm:edit', label: 'Editar Clientes', risk: 'medium' },
            { id: 'crm:export', label: 'Exportar Dados (LGPD)', risk: 'critical' },
            { id: 'manage:customers', label: 'Gerenciar Clientes (Completo)', risk: 'medium' },
        ]
    },
    {
        id: 'marketing',
        label: 'Marketing',
        description: 'Campanhas, cupons e comunicação.',
        capabilities: [
            { id: 'view:marketing', label: 'Ver Campanhas', risk: 'low' },
            { id: 'marketing:create', label: 'Criar Campanhas', risk: 'medium' },
            { id: 'marketing:send', label: 'Enviar Mensagens em Massa', risk: 'high' },
            { id: 'manage:discounts', label: 'Gerenciar Cupons e Descontos', risk: 'high' },
        ]
    },
    {
        id: 'logistics',
        label: 'Logística',
        description: 'Gestão de entregas e entregadores.',
        capabilities: [
            { id: 'view:logistics', label: 'Ver Logística', risk: 'low' },
            { id: 'logistics:dispatch', label: 'Despachar Pedidos', risk: 'medium' },
            { id: 'manage:logistics', label: 'Gerenciar Logística (Completo)', risk: 'high' },
        ]
    },
    {
        id: 'settings',
        label: 'Configurações',
        description: 'Configurações sensíveis da loja.',
        capabilities: [
            { id: 'view:settings', label: 'Acessar Configurações', risk: 'low' },
            { id: 'settings:edit', label: 'Editar Configurações', risk: 'critical' },
            { id: 'settings:integrations', label: 'Gerenciar Integrações (API)', risk: 'critical' },
            { id: 'manage:settings', label: 'Gerenciar Configurações (Completo)', risk: 'critical' },
        ]
    },
    {
        id: 'team',
        label: 'Gestão de Equipe',
        description: 'Controle de membros e permissões.',
        capabilities: [
            { id: 'view:team', label: 'Ver Equipe', risk: 'low' },
            { id: 'team:invite', label: 'Convidar Membros', risk: 'high' },
            { id: 'team:edit', label: 'Editar Membros', risk: 'high' },
            { id: 'team:remove', label: 'Remover Membros', risk: 'critical' },
            { id: 'team:roles', label: 'Gerenciar Cargos e Permissões', risk: 'critical' },
            { id: 'manage:team', label: 'Gerenciar Equipe (Completo)', risk: 'critical' },
        ]
    },
    {
        id: 'operation_apps',
        label: 'Aplicativos Operacionais',
        description: 'Acesso a aplicativos de função específica (Garçom/Entregador).',
        capabilities: [
            { id: 'view:waiter', label: 'App do Garçom (Mesas)', risk: 'low' },
            { id: 'waiter:tables', label: 'Gerenciar Mesas', risk: 'medium' },
            { id: 'view:delivery_app', label: 'App do Entregador', risk: 'low' },
            { id: 'driver:routes', label: 'Ver Rotas de Entrega', risk: 'medium' },
            { id: 'manage:delivery_status', label: 'Atualizar Status de Entrega', risk: 'medium' },
        ]
    },
    {
        id: 'dashboard',
        label: 'Dashboard e Relatórios',
        description: 'Visão geral e análises.',
        capabilities: [
            { id: 'view:dashboard', label: 'Ver Dashboard', risk: 'low' },
            { id: 'dashboard:analytics', label: 'Análises Avançadas', risk: 'medium' },
        ]
    }
];

// Helper para obter todas as permissões como array plano
export const getAllPermissions = (): string[] => {
    return PERMISSION_GROUPS.flatMap(group =>
        group.capabilities.map(cap => cap.id)
    );
};

// Helper para obter permissão por ID
export const getPermissionById = (id: string): PermissionDefinition | undefined => {
    for (const group of PERMISSION_GROUPS) {
        const permission = group.capabilities.find(cap => cap.id === id);
        if (permission) return permission;
    }
    return undefined;
};

// Helper para filtrar permissões por nível de risco
export const getPermissionsByRisk = (risk: 'low' | 'medium' | 'high' | 'critical'): PermissionDefinition[] => {
    return PERMISSION_GROUPS.flatMap(group =>
        group.capabilities.filter(cap => cap.risk === risk)
    );
};

// Templates de cargos pré-definidos
export const ROLE_TEMPLATES = {
    OWNER: {
        name: 'Dono',
        description: 'Acesso total e irrestrito ao sistema',
        permissions: ['*']
    },
    MANAGER: {
        name: 'Gerente',
        description: 'Gestão operacional completa, sem acesso a configurações críticas',
        permissions: [
            'view:dashboard', 'dashboard:analytics',
            'view:pos', 'pos:sell', 'pos:discount',
            'view:cash_register', 'cash:open', 'cash:close',
            'view:orders', 'orders:accept', 'orders:edit', 'manage:order_status',
            'view:menu', 'menu:create', 'menu:edit', 'manage:products',
            'view:inventory', 'stock:adjust', 'manage:stock',
            'view:finance', 'finance:reports', 'finance:expenses', 'manage:expenses',
            'view:customers', 'crm:edit', 'manage:customers',
            'view:marketing', 'marketing:create',
            'view:team', 'team:invite', 'team:edit',
            'view:settings'
        ]
    },
    CASHIER: {
        name: 'Operador de Caixa',
        description: 'Foco em vendas e gestão de caixa',
        permissions: [
            'view:pos', 'pos:sell',
            'view:cash_register', 'cash:open', 'cash:close',
            'view:orders', 'orders:accept', 'manage:order_status',
            'view:customers'
        ]
    },
    KITCHEN: {
        name: 'Cozinha',
        description: 'Apenas tela de produção',
        permissions: [
            'view:kds', 'kds:complete', 'manage:kds'
        ]
    },
    WAITER: {
        name: 'Garçom',
        description: 'Gestão de mesas e pedidos',
        permissions: [
            'view:waiter', 'waiter:tables',
            'view:menu',
            'view:orders', 'orders:accept', 'manage:order_status'
        ]
    },
    DRIVER: {
        name: 'Entregador',
        description: 'App de entregas',
        permissions: [
            'view:delivery_app', 'driver:routes', 'manage:delivery_status'
        ]
    },
    ANALYST: {
        name: 'Analista',
        description: 'Visualização e relatórios, sem edição',
        permissions: [
            'view:dashboard', 'dashboard:analytics',
            'view:pos', 'view:orders', 'view:menu', 'view:inventory',
            'view:finance', 'finance:reports', 'view:reports',
            'view:customers', 'view:marketing'
        ]
    }
};

// Converte templates em array de roles para uso na UI
export const SYSTEM_ROLES_LIST = Object.entries(ROLE_TEMPLATES).map(([key, template]) => ({
    id: key, // MANAGER, CASHIER, etc.
    name: template.name,
    description: template.description,
    permissions: template.permissions,
    isSystem: true,
    tenantId: 'system'
}));
