import React from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTeamSettings } from './team/useTeamSettings';
import { TeamHeader } from './team/TeamHeader';
import { MembersTable } from './team/MembersTable';
import { RolesGrid } from './team/RolesGrid';
import { UserModals } from './team/UserModals';
import { RoleModal } from './team/RoleModal';
import { MasterUserProfile } from './MasterUserProfile';
import { Role, SystemUser } from '../../../types/user';

export const TeamSettings: React.FC = () => {
    const { user, systemUser } = useAuth();
    const {
        users, allRoles, loading, activeTab, setActiveTab,
        isUserModalOpen, setIsUserModalOpen,
        isEditUserModalOpen, setIsEditUserModalOpen,
        isRoleModalOpen, setIsRoleModalOpen,
        isMasterProfileOpen, setIsMasterProfileOpen,
        editingRole, setEditingRole,
        editingUser, setEditingUser,
        inviteForm, setInviteForm,
        editForm, setEditForm,
        roleForm, setRoleForm,
        handleSaveRole, handleDeleteRole,
        handleInviteUser, handleUpdateUser, handleDeleteUser
    } = useTeamSettings();

    const handleOpenRoleModal = (role?: Role) => {
        if (role) {
            setEditingRole(role);
            setRoleForm({
                name: role.name,
                description: role.description,
                permissions: role.permissions
            });
        } else {
            setEditingRole(null);
            setRoleForm({ name: '', description: '', permissions: [] });
        }
        setIsRoleModalOpen(true);
    };

    const handleOpenEditUserModal = (user: SystemUser) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            roleId: user.roleId || ''
        });
        setIsEditUserModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <TeamHeader activeTab={activeTab} setActiveTab={setActiveTab} />

            {!systemUser?.tenantId ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <p className="text-yellow-800 font-medium">⚠️ Aguardando informações do usuário...</p>
                    <p className="text-yellow-600 text-sm mt-2">Se esta mensagem persistir, faça logout e login novamente.</p>
                </div>
            ) : (
                <>
                    {activeTab === 'members' && (
                        <MembersTable
                            users={users}
                            loading={loading}
                            currentUserId={user?.uid}
                            onAddMember={() => setIsUserModalOpen(true)}
                            onEditMember={handleOpenEditUserModal}
                            onDeleteMember={handleDeleteUser}
                        />
                    )}

                    {activeTab === 'roles' && (
                        <RolesGrid
                            roles={allRoles}
                            onAddRole={() => handleOpenRoleModal()}
                            onEditRole={handleOpenRoleModal}
                            onDeleteRole={handleDeleteRole}
                        />
                    )}

                    <UserModals
                        isUserModalOpen={isUserModalOpen}
                        setIsUserModalOpen={setIsUserModalOpen}
                        isEditUserModalOpen={isEditUserModalOpen}
                        setIsEditUserModalOpen={setIsEditUserModalOpen}
                        inviteForm={inviteForm}
                        setInviteForm={setInviteForm}
                        editForm={editForm}
                        setEditForm={setEditForm}
                        allRoles={allRoles}
                        editingUser={editingUser}
                        handleInviteUser={handleInviteUser}
                        handleUpdateUser={handleUpdateUser}
                    />

                    <RoleModal
                        isRoleModalOpen={isRoleModalOpen}
                        setIsRoleModalOpen={setIsRoleModalOpen}
                        editingRole={editingRole}
                        roleForm={roleForm}
                        setRoleForm={setRoleForm}
                        handleSaveRole={handleSaveRole}
                    />

                    <MasterUserProfile
                        isOpen={isMasterProfileOpen}
                        onClose={() => setIsMasterProfileOpen(false)}
                    />
                </>
            )}
        </div>
    );
};
