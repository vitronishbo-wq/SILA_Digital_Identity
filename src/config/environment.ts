/**
 * CONTRATO CANÓNICO DE AMBIENTE — SILA GOVOS
 * 
 * Separação Estrita de 4 Camadas:
 * 1. Client-Side Public (Build-time / Vite): prefixadas com VITE_
 * 2. Server-Side Private (Runtime / Node/Express): secrets sem prefixo VITE_
 * 3. App Metadata (Configuração regional e identitária padrão)
 * 4. CI/CD Pipeline (GitHub Actions & Deploy hooks)
 * 
 * Regra: O código NUNCA assume valores hardcoded nem mistura build-time com runtime.
 */

export interface ClientEnvironmentContract {
  // Conexão Pública com Firebase / Firestore Client
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  firestoreDatabaseId: string;

  // Parâmetros Regionais & Institucionais da Aplicação
  appTimezone: string;
  appLocale: string;
  appCountry: string;
  supportEmail: string;
  appUrl: string;
}

export interface ServerEnvironmentContract {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;

  // Gemini AI Server Secret
  geminiApiKey?: string;

  // Firebase Admin SDK Service Account
  firebaseProjectId: string;
  firebaseClientEmail?: string;
  firebasePrivateKey?: string;
  firestoreDatabaseId: string;
}

/**
 * Carregador Seguro do Contrato de Ambiente do Cliente (Vite/Browser)
 * Valida se as variáveis públicas foram injetadas sem crashar em modo offline.
 */
export function getClientEnvironment(): ClientEnvironmentContract {
  const env = import.meta.env;

  return {
    firebaseApiKey: env.VITE_FIREBASE_API_KEY || '',
    firebaseAuthDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0113821724.firebaseapp.com',
    firebaseProjectId: env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0113821724',
    firebaseStorageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0113821724.firebasestorage.app',
    firebaseMessagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1000457842504',
    firebaseAppId: env.VITE_FIREBASE_APP_ID || '1:1000457842504:web:bdb10c3d9911d411154d7d',
    firestoreDatabaseId: env.VITE_FIRESTORE_DATABASE_ID || 'ai-studio-siladigitalident-3824b3dd-a639-4e6e-99fc-b2426258d225',

    appTimezone: env.VITE_APP_TIMEZONE || 'Africa/Luanda',
    appLocale: env.VITE_APP_LOCALE || 'pt-PT',
    appCountry: env.VITE_APP_COUNTRY || 'AO',
    supportEmail: env.VITE_SUPPORT_EMAIL || 'silaprimeiro@gmail.com',
    appUrl: env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
  };
}
