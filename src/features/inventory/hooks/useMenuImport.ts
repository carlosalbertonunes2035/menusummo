import { db } from '@/lib/firebase/client';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { collection, addDoc, onSnapshot, doc, serverTimestamp, DocumentSnapshot } from '@firebase/firestore';

export interface ImportJob {
    id: string;
    fileUrl: string;
    mimeType: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    message: string;
    totalItems?: number;
    createdAt: any;
    createdBy: string;
}

export function useMenuImport() {
    const { systemUser } = useAuth();
    const { showToast } = useApp();

    const startImport = async (fileUrl: string, mimeType: string) => {
        if (!systemUser?.tenantId) {
            showToast('Tenant ID não encontrado.', 'error');
            return;
        }

        const jobsRef = collection(db, 'tenants', systemUser.tenantId, 'import_jobs');

        try {
            const docRef = await addDoc(jobsRef, {
                fileUrl,
                mimeType,
                status: 'pending',
                progress: 0,
                message: 'Iniciando...',
                createdAt: serverTimestamp(),
                createdBy: systemUser.id
            });

            monitorJob(docRef.id);
            return docRef.id;
        } catch (error: any) {
            console.error('[useMenuImport] Erro ao criar job:', error);
            showToast('Erro ao iniciar importação.', 'error');
            throw error;
        }
    };

    const monitorJob = (jobId: string) => {
        if (!systemUser?.tenantId) return;

        const jobRef = doc(db, 'tenants', systemUser.tenantId, 'import_jobs', jobId);

        showToast('Preparando importação...', 'info');

        const unsubscribe = onSnapshot(jobRef, (snap: DocumentSnapshot) => {
            const data = snap.data() as ImportJob;
            if (!data) return;

            if (data.status === 'processing') {
                // Update every 20% to avoid notification fatigue
                if (data.progress % 20 === 0 && data.progress > 0) {
                    showToast(`Progresso de Importação: ${data.progress}%`, 'info');
                }
            }

            if (data.status === 'completed') {
                showToast('Cardápio Importado com Sucesso!', 'success');
                unsubscribe();
            }

            if (data.status === 'error') {
                showToast(`Erro na importação: ${data.message}`, 'error');
                unsubscribe();
            }
        });
    };

    return { startImport };
}
