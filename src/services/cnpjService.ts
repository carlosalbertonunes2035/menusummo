// Service for CNPJ lookup using BrasilAPI (more reliable than ReceitaWS)
export interface CNPJData {
    cnpj: string;
    nome: string;
    fantasia: string;
    telefone: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
    email?: string;
}

/**
 * Fetches company data from CNPJ using BrasilAPI (primary) with ReceitaWS fallback
 * @param cnpj - CNPJ number (with or without formatting)
 * @returns Company data or null if not found
 */
export async function fetchCNPJData(cnpj: string): Promise<CNPJData | null> {
    try {
        // Remove formatting from CNPJ
        const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

        if (cleanCNPJ.length !== 14) {
            throw new Error('CNPJ deve ter 14 dígitos');
        }

        // Try BrasilAPI first (no CORS issues, more reliable)
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);

            if (!response.ok) {
                throw new Error('CNPJ não encontrado na BrasilAPI');
            }

            const data = await response.json();
            return data;
        } catch (brasilApiError) {
            console.warn('BrasilAPI failed, trying ReceitaWS fallback:', brasilApiError);

            // Fallback to ReceitaWS
            const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`);

            if (!response.ok) {
                throw new Error('Erro ao buscar CNPJ');
            }

            const data = await response.json();

            if (data.status === 'ERROR') {
                throw new Error(data.message || 'CNPJ não encontrado');
            }

            // Convert ReceitaWS format to BrasilAPI format
            return {
                cnpj: data.cnpj,
                nome: data.nome,
                fantasia: data.fantasia,
                logradouro: data.logradouro,
                numero: data.numero,
                complemento: data.complemento,
                bairro: data.bairro,
                municipio: data.municipio,
                uf: data.uf,
                cep: data.cep,
                telefone: data.telefone,
                email: data.email
            };
        }
    } catch (error) {
        console.error('Error fetching CNPJ:', error);
        throw error;
    }
}

/**
 * Formats CNPJ number with mask: 00.000.000/0000-00
 */
export function formatCNPJ(cnpj: string): string {
    const clean = cnpj.replace(/[^\d]/g, '');
    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Validates CNPJ number
 */
export function validateCNPJ(cnpj: string): boolean {
    const clean = cnpj.replace(/[^\d]/g, '');

    if (clean.length !== 14) return false;

    // Check if all digits are the same
    if (/^(\d)\1+$/.test(clean)) return false;

    // Validate check digits
    let length = clean.length - 2;
    let numbers = clean.substring(0, length);
    const digits = clean.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = clean.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits.charAt(1));
}
