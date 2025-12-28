import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, limit } from '@firebase/firestore';
import { Shield, Lock, AlertTriangle, CheckCircle, Fingerprint, Database } from 'lucide-react';

const SecurityAudit: React.FC = () => {
    const { user } = useAuth();
    const [idTokenResult, setIdTokenResult] = useState<any>(null);
    const [crossTenantStatus, setCrossTenantStatus] = useState<'IDLE' | 'TESTING' | 'PASS' | 'FAIL'>('IDLE');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            user.getIdTokenResult(true).then(res => {
                setIdTokenResult(res);
            });
        }
    }, [user]);

    const testCrossTenantAccess = async () => {
        setCrossTenantStatus('TESTING');
        setError(null);
        try {
            // Try a query WITHOUT a tenantId filter.
            // Under the new rules, this MUST fail because Firestore rules are not filters.
            // If the user tries to read all products, and some belong to other tenants,
            // the whole request must be blocked.
            const q = query(collection(db, 'products'), limit(1));
            await getDocs(q);

            // If it succeeds, it means the rule is NOT blocking cross-tenant reads 
            // OR there are only products for this tenant (unlikely in prod).
            setCrossTenantStatus('FAIL');
            setError("ALERTA: Acesso global permitido! As regras não estão restringindo o acesso.");
        } catch (err: any) {
            console.log("Expected error received:", err);
            // Permission denied is what we want!
            if (err.code === 'permission-denied') {
                setCrossTenantStatus('PASS');
            } else {
                setCrossTenantStatus('FAIL');
                setError(`Erro inesperado: ${err.message}`);
            }
        }
    };

    if (!user) return <div className="p-8 text-center">Faça login para auditar a segurança.</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <Shield className="text-summo-primary" size={32} />
                <h1 className="text-3xl font-bold text-gray-800">Painel de Auditoria de Segurança</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auth Claims Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Fingerprint className="text-blue-500" size={20} />
                        <h2 className="font-bold text-gray-700">Autenticação (Custom Claims)</h2>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase">Claims Detectados:</p>
                            <pre className="text-[10px] mt-2 bg-gray-900 text-green-400 p-3 rounded-lg overflow-auto max-h-48">
                                {JSON.stringify(idTokenResult?.claims, null, 2)}
                            </pre>
                        </div>

                        <div className="flex items-center gap-2">
                            {idTokenResult?.claims?.tenantId ? (
                                <>
                                    <CheckCircle className="text-green-500" size={16} />
                                    <span className="text-sm font-medium text-green-700">
                                        TenantID Claim: <strong>{idTokenResult.claims.tenantId}</strong>
                                    </span>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="text-red-500" size={16} />
                                    <span className="text-sm font-medium text-red-700">TenantID Claim Ausente!</span>
                                </>
                            )}
                        </div>

                        <p className="text-xs text-gray-400 italic">
                            Nota: Se o claim estiver ausente, as novas regras do Firestore irão bloquear todo acesso.
                        </p>
                    </div>
                </div>

                {/* Firestore Rules Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="text-orange-500" size={20} />
                        <h2 className="font-bold text-gray-700">Teste de Isolamento (Multi-tenant)</h2>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <p className="text-sm text-gray-600">
                            Este teste tentará ler a coleção de produtos <strong>sem filtro de tenant</strong>.
                            As regras atuais devem negar o acesso para proteger a privacidade de outros clientes.
                        </p>

                        <div className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${crossTenantStatus === 'IDLE' ? 'bg-gray-50 border-gray-100' :
                                crossTenantStatus === 'TESTING' ? 'bg-blue-50 border-blue-100' :
                                    crossTenantStatus === 'PASS' ? 'bg-green-50 border-green-200' :
                                        'bg-red-50 border-red-200'
                            }`}>
                            {crossTenantStatus === 'IDLE' && <Database className="text-gray-400" />}
                            {crossTenantStatus === 'TESTING' && <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />}
                            {crossTenantStatus === 'PASS' && <CheckCircle className="text-green-500" />}
                            {crossTenantStatus === 'FAIL' && <AlertTriangle className="text-red-500" />}

                            <span className="font-bold text-sm">
                                {crossTenantStatus === 'IDLE' && "Pronto para testar"}
                                {crossTenantStatus === 'TESTING' && "Testando acesso..."}
                                {crossTenantStatus === 'PASS' && "ISOLAMENTO VERIFICADO ✅"}
                                {crossTenantStatus === 'FAIL' && "FALHA DE SEGURANÇA ⚠️"}
                            </span>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 text-xs rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={testCrossTenantAccess}
                            disabled={crossTenantStatus === 'TESTING'}
                            className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition active:scale-95 disabled:opacity-50"
                        >
                            Executar Teste Antigravity
                        </button>
                    </div>
                </div>
            </div>

            {/* Advice Section */}
            <div className="bg-summo-bg/20 p-6 rounded-2xl border border-summo-primary/10">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-summo-primary" size={18} />
                    Próximos Passos Recomendados
                </h3>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                    <li>Se o <strong>TenantID Claim</strong> estiver ausente, faça Logout e Login novamente.</li>
                    <li>Se o <strong>Isolamento</strong> falhar, revise o arquivo <code>firestore.rules</code>.</li>
                    <li>Sempre use <code>where('tenantId', '==', tenantId)</code> em suas consultas frontend para evitar erros de permissão.</li>
                </ol>
            </div>
        </div>
    );
};

export default SecurityAudit;
