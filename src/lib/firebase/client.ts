
import { initializeApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  clearIndexedDbPersistence
} from '@firebase/firestore';
import { getStorage } from '@firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use getFirestore instead of initializeFirestore to avoid "Unexpected state" errors
// The default configuration handles persistence automatically
export const db = getFirestore(app);

export const storage = getStorage(app);

// Enable offline persistence with error handling
(async () => {
  try {
    await enableIndexedDbPersistence(db, {
      forceOwnership: true
    });
    console.log('✅ Firebase: Persistência offline habilitada');
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Firestore: Múltiplas abas abertas, persistência desabilitada');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Firestore: Persistência não disponível neste navegador');
    } else {
      console.error('❌ Firestore: Erro ao habilitar persistência:', err);
    }
  }
})();

/**
 * Limpa o cache do Firestore em caso de erro crítico
 * Útil para resolver erros de "INTERNAL ASSERTION FAILED"
 */
export const clearFirestoreCache = async (): Promise<boolean> => {
  try {
    console.log('[Firestore] Limpando cache...');
    await clearIndexedDbPersistence(db);
    console.log('✅ [Firestore] Cache limpo com sucesso');
    return true;
  } catch (error) {
    console.error('❌ [Firestore] Erro ao limpar cache:', error);
    return false;
  }
};

console.log('✅ Firebase: Inicializado com sucesso');
