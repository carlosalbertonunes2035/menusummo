import { User } from '@firebase/auth';
import { SystemUser } from '@/types';
import { STANDARD_ROLES } from '@/constants/roles';

// Convert STANDARD_ROLES array to Record for easy lookup
const ROLES_MAP = STANDARD_ROLES.reduce((acc, role) => {
    acc[role.id] = role;
    return acc;
}, {} as Record<string, typeof STANDARD_ROLES[0]>);

export const MOCK_ADMIN_USER = {
    uid: 'mock-admin-uid-001',
    email: 'admin@summo.demo',
    displayName: 'Admin User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => { },
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => { },
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
} as unknown as User;

export const MOCK_SYSTEM_USER: SystemUser = {
    id: 'mock-admin-uid-001',
    name: 'Admin User',
    email: 'admin@summo.demo',
    tenantId: '',
    roleId: 'OWNER',
    role: ROLES_MAP['OWNER'],
    permissions: ROLES_MAP['OWNER'].permissions,
    active: true
};
