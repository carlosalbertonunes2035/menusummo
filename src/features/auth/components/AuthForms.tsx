import React from 'react';
import { LogIn, UserPlus, AlertCircle, Check } from 'lucide-react';
import { useAuthForms } from './onboarding/useAuthForms';
import { AuthLayout } from './onboarding/AuthLayout';
import { LoginForm } from './onboarding/LoginForm';
import { RegisterStep1 } from './onboarding/RegisterStep1';
import { RegisterStep2 } from './onboarding/RegisterStep2';
import { RegisterStep3 } from './onboarding/RegisterStep3';

const ProgressIndicator: React.FC<{ currentStep: 1 | 2 | 3 }> = ({ currentStep }) => {
    const steps = [
        { number: 1, label: 'Identidade' },
        { number: 2, label: 'Negócio' },
        { number: 3, label: 'Personalização' }
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep > step.number
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : currentStep === step.number
                                    ? 'bg-gradient-to-br from-summo-primary to-orange-600 text-white shadow-lg shadow-summo-primary/30 scale-110'
                                    : 'bg-gray-200 text-gray-400'
                                }`}>
                                {currentStep > step.number ? <Check size={18} /> : step.number}
                            </div>
                            <span className={`text-xs font-bold mt-2 transition-colors ${currentStep >= step.number ? 'text-summo-text' : 'text-gray-400'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const AuthForms: React.FC = () => {
    const {
        isLogin, setIsLogin, loading, error, setError, step, setStep,
        // Step 1
        ownerName, setOwnerName, ownerRole, setOwnerRole,
        email, setEmail, phone, setPhone,
        // Step 2
        password, setPassword, passwordConfirm, setPasswordConfirm,
        businessName, setBusinessName,
        establishmentType, setEstablishmentType, operationTime, setOperationTime,
        cnpj, setCnpj, cnpjLoading, address,
        // Step 3
        segment, setSegment, monthlyRevenue, setMonthlyRevenue,
        salesChannels, toggleSalesChannel, addOtherApp, removeOtherApp,
        digitalMenu, setDigitalMenu,
        currentSystem, setCurrentSystem, currentSystemName, setCurrentSystemName,
        goals, toggleGoal, mainChallenge, setMainChallenge,
        // Actions
        handleLogin, handleNextStep, handleCNPJBlur, handleRegister
    } = useAuthForms();

    return (
        <AuthLayout>
            <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
                <button
                    onClick={() => { setIsLogin(true); setStep(1); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-summo-text shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <LogIn size={18} /> Login
                </button>
                <button
                    onClick={() => { setIsLogin(false); setStep(1); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-summo-text shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <UserPlus size={18} /> Novo Negócio
                </button>
            </div>

            {!isLogin && <ProgressIndicator currentStep={step} />}

            {isLogin ? (
                <LoginForm
                    email={email} setEmail={setEmail}
                    password={password} setPassword={setPassword}
                    handleLogin={handleLogin} loading={loading}
                />
            ) : (
                <>
                    {step === 1 && (
                        <RegisterStep1
                            ownerName={ownerName} setOwnerName={setOwnerName}
                            ownerRole={ownerRole} setOwnerRole={setOwnerRole}
                            phone={phone} setPhone={setPhone}
                            email={email} setEmail={setEmail}
                            onSubmit={handleNextStep}
                        />
                    )}
                    {step === 2 && (
                        <RegisterStep2
                            businessName={businessName} setBusinessName={setBusinessName}
                            establishmentType={establishmentType} setEstablishmentType={setEstablishmentType}
                            operationTime={operationTime} setOperationTime={setOperationTime}
                            password={password} setPassword={setPassword}
                            passwordConfirm={passwordConfirm} setPasswordConfirm={setPasswordConfirm}
                            cnpj={cnpj} setCnpj={setCnpj}
                            cnpjLoading={cnpjLoading} onCnpjBlur={handleCNPJBlur}
                            address={address}
                            onBack={() => setStep(1)} onSubmit={handleNextStep}
                        />
                    )}
                    {step === 3 && (
                        <RegisterStep3
                            segment={segment} setSegment={setSegment}
                            monthlyRevenue={monthlyRevenue} setMonthlyRevenue={setMonthlyRevenue}
                            salesChannels={salesChannels} toggleSalesChannel={toggleSalesChannel}
                            addOtherApp={addOtherApp} removeOtherApp={removeOtherApp}
                            digitalMenu={digitalMenu} setDigitalMenu={setDigitalMenu}
                            currentSystem={currentSystem} setCurrentSystem={setCurrentSystem}
                            currentSystemName={currentSystemName} setCurrentSystemName={setCurrentSystemName}
                            goals={goals} toggleGoal={toggleGoal}
                            mainChallenge={mainChallenge} setMainChallenge={setMainChallenge}
                            onBack={() => setStep(2)} onSubmit={handleRegister}
                            loading={loading}
                        />
                    )}
                </>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl font-medium flex items-center gap-3 animate-slide-in-up">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    {error}
                </div>
            )}
        </AuthLayout>
    );
};

export default AuthForms;
