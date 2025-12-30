import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCNPJData } from '../../../../services/cnpjService';
import {
    OnboardingStep, RegistrationData, Address, SalesChannels, DeliveryChannels,
    DigitalMenuConfig, OwnerRole, EstablishmentType, OperationTime,
    CurrentSystem, BusinessGoal, MainChallenge
} from './types';

export function useAuthForms() {
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<OnboardingStep>(1);
    const [cnpjLoading, setCnpjLoading] = useState(false);

    // === STEP 1: Personal Identity ===
    const [ownerName, setOwnerName] = useState('');
    const [ownerRole, setOwnerRole] = useState<OwnerRole>('owner');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // === STEP 2: Business & Security ===
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [establishmentType, setEstablishmentType] = useState<EstablishmentType>('restaurant');
    const [operationTime, setOperationTime] = useState<OperationTime>('new');
    const [cnpj, setCnpj] = useState('');
    const [legalName, setLegalName] = useState('');
    const [address, setAddress] = useState<Address>({
        zip: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: ''
    });

    // === STEP 3: Business Intelligence ===
    const [segment, setSegment] = useState('Hamburgueria');
    const [monthlyRevenue, setMonthlyRevenue] = useState('Até R$ 5k');
    const [salesChannels, setSalesChannels] = useState<SalesChannels>({
        ownDelivery: false, counter: false, dineIn: false,
        ifood: false, rappi: false, aiqfome: false, otherApps: []
    });
    const [digitalMenu, setDigitalMenu] = useState<DigitalMenuConfig>({
        hasOwn: false, platform: ''
    });
    const [currentSystem, setCurrentSystem] = useState<CurrentSystem>('none');
    const [currentSystemName, setCurrentSystemName] = useState('');
    const [goals, setGoals] = useState<BusinessGoal[]>([]);
    const [mainChallenge, setMainChallenge] = useState<MainChallenge>('profit');

    // Legacy compatibility
    const [deliveryChannels, setDeliveryChannels] = useState<DeliveryChannels>({
        ownDelivery: false, ifood: false, rappi: false, aiqfome: false, others: false
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signIn(email, password);
        } catch (err: any) {
            if (err.code === 'auth/wrong-password') setError('Senha incorreta.');
            else if (err.code === 'auth/user-not-found') setError('Usuário não encontrado.');
            else if (err.code === 'auth/too-many-requests') setError('Muitas tentativas. Tente novamente mais tarde.');
            else setError('Erro ao processar login.');
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (step === 1) {
            if (!ownerName || !email || !phone) {
                setError('Preencha todos os seus dados de contato.');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!businessName) {
                setError('O nome do seu negócio é importante.');
                return;
            }
            if (password.length < 6) {
                setError('Uma senha forte precisa de ao menos 6 caracteres.');
                return;
            }
            setStep(3);
        }
    };

    const handleCNPJBlur = async () => {
        if (!cnpj || cnpj.length < 14) return;
        setCnpjLoading(true);
        try {
            const data = await fetchCNPJData(cnpj);
            if (data) {
                setLegalName(data.nome);
                setAddress({
                    zip: data.cep, street: data.logradouro, number: data.numero,
                    neighborhood: data.bairro, city: data.municipio, state: data.uf,
                    complement: data.complemento
                });
            }
        } catch (err) {
            console.warn("CNPJ lookup failed", err);
        } finally {
            setCnpjLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Build service types from sales channels
            const serviceTypes: string[] = [];
            if (salesChannels.ownDelivery) serviceTypes.push('delivery');
            if (salesChannels.counter) serviceTypes.push('takeaway');
            if (salesChannels.dineIn) serviceTypes.push('indoor');

            // Sync delivery channels for legacy compatibility
            const syncedDeliveryChannels: DeliveryChannels = {
                ownDelivery: salesChannels.ownDelivery,
                ifood: salesChannels.ifood,
                rappi: salesChannels.rappi,
                aiqfome: salesChannels.aiqfome,
                others: salesChannels.otherApps.length > 0
            };

            await signUp({
                // Step 1
                ownerName, ownerRole, email, phone,
                // Step 2
                password, businessName, establishmentType, operationTime,
                legalName: legalName || businessName, cnpj, address,
                // Step 3
                segment, monthlyRevenue, salesChannels, digitalMenu,
                currentSystem, currentSystemName, goals, mainChallenge,
                // Legacy
                deliveryChannels: syncedDeliveryChannels, serviceTypes
            });
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta.');
        } finally {
            setLoading(false);
        }
    };

    const toggleChannel = (channel: keyof DeliveryChannels) => {
        setDeliveryChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
    };

    const toggleSalesChannel = (channel: keyof SalesChannels) => {
        if (channel === 'otherApps') return; // Handle separately
        setSalesChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
    };

    const toggleGoal = (goal: BusinessGoal) => {
        setGoals(prev =>
            prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
        );
    };

    const addOtherApp = (app: string) => {
        if (app && !salesChannels.otherApps.includes(app)) {
            setSalesChannels(prev => ({
                ...prev,
                otherApps: [...prev.otherApps, app]
            }));
        }
    };

    const removeOtherApp = (app: string) => {
        setSalesChannels(prev => ({
            ...prev,
            otherApps: prev.otherApps.filter(a => a !== app)
        }));
    };

    return {
        isLogin, setIsLogin, loading, error, setError, step, setStep,
        // Step 1
        ownerName, setOwnerName, ownerRole, setOwnerRole,
        email, setEmail, phone, setPhone,
        // Step 2
        password, setPassword, passwordConfirm, setPasswordConfirm,
        businessName, setBusinessName,
        establishmentType, setEstablishmentType, operationTime, setOperationTime,
        cnpj, setCnpj, legalName, address, cnpjLoading,
        // Step 3
        segment, setSegment, monthlyRevenue, setMonthlyRevenue,
        salesChannels, toggleSalesChannel, addOtherApp, removeOtherApp,
        digitalMenu, setDigitalMenu,
        currentSystem, setCurrentSystem, currentSystemName, setCurrentSystemName,
        goals, toggleGoal, mainChallenge, setMainChallenge,
        // Legacy
        deliveryChannels, toggleChannel,
        // Actions
        handleLogin, handleNextStep, handleCNPJBlur, handleRegister
    };
}
