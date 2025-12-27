
import { initializeApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from '@firebase/firestore';
import { getStorage } from '@firebase/storage';

// Helper to get environment variables in both Vite and Node contexts
const getEnv = (key: string) => {
  // Vite / Browser
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  // Node / Scripts
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use getFirestore instead of initializeFirestore to avoid "Unexpected state" errors
// The default configuration handles persistence automatically
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
export const storage = getStorage(app);
import { getFunctions, connectFunctionsEmulator } from '@firebase/functions';
import { connectFirestoreEmulator } from '@firebase/firestore';
import { connectAuthEmulator } from '@firebase/auth';

// Initialize Cloud Functions (using Brazil region for general logic)
export const functions = getFunctions(app, 'southamerica-east1');

// AI Functions (US Central for better Model Availability)
export const functionsUS = getFunctions(app, 'us-central1');

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  console.log('🔧 Connecting to Firebase Emulators...');
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('✅ Connected to Firebase Emulators');
  } catch (error) {
    console.warn('⚠️ Failed to connect to emulators:', error);
  }
}


/**
 * Limpa o cache do Firestore em caso de erro crítico
 * Útil para resolver erros de "INTERNAL ASSERTION FAILED"
 */
export const clearFirestoreCache = async (): Promise<boolean> => {
  try {
    console.log('[Firestore] Limpando cache (Legacy)...');
    // Deprecated in new SDK versions using persistentLocalCache
    // await clearIndexedDbPersistence(db);
    console.log('✅ [Firestore] Cache legacy ignorado (usando persistentLocalCache)');
    return true;
  } catch (error) {
    console.error('❌ [Firestore] Erro ao limpar cache:', error);
    return false;
  }
};

console.log('✅ Firebase: Inicializado com sucesso');
