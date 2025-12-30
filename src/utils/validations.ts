// Input validation and formatting utilities

export const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const isValidPhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
};

/**
 * Converts a phone string to E.164 format.
 * Defaults to Brazil (+55) if no country code provided.
 */
export const toE164Phone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';

    // If it already has country code 55 prefix
    if (digits.length >= 12 && digits.startsWith('55')) {
        return `+${digits}`;
    }

    // Handle case without country code (default to Brazil)
    return `+55${digits}`;
};

export const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const getPasswordStrength = (password: string): {
    strength: number;
    label: string;
    color: string;
    checks: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        numbers: boolean;
        special: boolean;
    };
} => {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks <= 2) {
        return { strength: 25, label: 'Fraca', color: 'bg-red-500', checks };
    }
    if (passedChecks === 3) {
        return { strength: 50, label: 'Média', color: 'bg-yellow-500', checks };
    }
    if (passedChecks === 4) {
        return { strength: 75, label: 'Boa', color: 'bg-blue-500', checks };
    }
    return { strength: 100, label: 'Forte', color: 'bg-green-500', checks };
};

export const isValidName = (name: string): boolean => {
    // At least 2 words, only letters and spaces
    const trimmed = name.trim();
    const words = trimmed.split(/\s+/);
    return words.length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(trimmed);
};

export const formatCEP = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const isValidCEP = (cep: string): boolean => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.length === 8;
};
