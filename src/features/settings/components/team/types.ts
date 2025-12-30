import { Role, SystemUser } from '../../../../types/user';

export type TeamTab = 'members' | 'roles';

export interface InviteForm {
    name: string;
    email: string;
    roleId: string;
}

export interface EditForm {
    name: string;
    email: string;
    phone: string;
    roleId: string;
}

export interface RoleForm extends Partial<Role> {
    name: string;
    description: string;
    permissions: string[];
}

export interface TeamSettingsState {
    users: SystemUser[];
    customRoles: Role[];
    loading: boolean;
    activeTab: TeamTab;
    isUserModalOpen: boolean;
    isEditUserModalOpen: boolean;
    isRoleModalOpen: boolean;
    isMasterProfileOpen: boolean;
    editingRole: Role | null;
    editingUser: SystemUser | null;
    inviteForm: InviteForm;
    editForm: EditForm;
    roleForm: RoleForm;
}
