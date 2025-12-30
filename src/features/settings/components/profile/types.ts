export interface UserProfileData {
    name: string;
    email: string;
    phone: string;
    profileImage: string;
    businessName: string;
    cnpj: string;
}

export interface PasswordData {
    currentPassword: '';
    newPassword: '';
    confirmPassword: '';
}

export type ProfileTab = 'personal' | 'company' | 'security';
