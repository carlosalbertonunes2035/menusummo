export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string; // Legacy/Primary address
    location?: any;   // Lat/Lng
    addresses?: any[];
    lastOrderDate: Date | string; // Handle both for safety
    totalOrders: number;
    totalSpent: number;
    favoriteItems?: string[];
    notes?: string;
    segments?: string[]; // VIP, Lost, etc
}

export type Permission = string;

export interface Role {
    id: string; // 'OWNER', 'MANAGER' or generated UUID for custom
    name: string;
    description?: string;
    permissions: Permission[];
    isSystem?: boolean; // If true, cannot be deleted (Owner, standard roles)
    tenantId?: string; // If null, global/system role. If set, custom tenant role.
}

export interface SystemUser {
    id: string;
    tenantId?: string;
    name: string;
    email: string;
    phone?: string; // Telefone do usuário
    role: Role;
    roleId?: string; // Add optional roleId to match usage
    permissions: string[];
    profileImage?: string;
    active?: boolean;
    pin?: string; // PIN for quick access
    cpf?: string; // Brazilian tax ID
    password?: string; // User password
    // Master User Fields (for the first user/owner)
    businessName?: string; // Nome Fantasia da empresa
    cnpj?: string; // CNPJ da empresa
    isMasterUser?: boolean; // Flag to identify the owner/first user
}

export interface Driver {
    id: string;
    tenantId: string;
    name: string;
    phone: string;
    email?: string;
    active: boolean;
    status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'AVAILABLE';
    vehicle?: string;
    commission?: number;
}
