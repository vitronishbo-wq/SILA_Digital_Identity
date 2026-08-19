import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';
import { getClientEnvironment } from '../config/environment';
import firebaseConfigJson from '../../firebase-applet-config.json';

const clientEnv = getClientEnvironment();

// Configuração canónica priorizando variáveis de ambiente com fallback para arquivo de provisionamento
const firebaseConfig = {
  apiKey: clientEnv.firebaseApiKey || firebaseConfigJson.apiKey,
  authDomain: clientEnv.firebaseAuthDomain || firebaseConfigJson.authDomain,
  projectId: clientEnv.firebaseProjectId || firebaseConfigJson.projectId,
  storageBucket: clientEnv.firebaseStorageBucket || firebaseConfigJson.storageBucket,
  messagingSenderId: clientEnv.firebaseMessagingSenderId || firebaseConfigJson.messagingSenderId,
  appId: clientEnv.firebaseAppId || firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const targetDbId = clientEnv.firestoreDatabaseId || firebaseConfigJson.firestoreDatabaseId || '(default)';

/**
 * Inicialização resiliente do Firestore com cache local persistente e suporte multi-tab.
 * Se o backend remoto estiver temporariamente indisponível ou em rede restrita,
 * o Firestore opera de forma transparente no cache local sem travar a interface.
 */
export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
}, targetDbId);
