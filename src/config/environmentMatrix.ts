export type VariableClassification =
  | 'PUBLIC_BUILD'     // Injetada no bundle JS do Vite (prefixada com VITE_)
  | 'BACKEND_RUNTIME'  // Segredo/configuração privada de servidor (Render / Node)
  | 'SHARED_RUNTIME'   // Constante operacional compartilhada
  | 'BUILD_CONTROL'    // Flag de controle do compilador e CI/CD
  | 'LOCAL_ONLY';      // Específica de sandbox local

export interface EnvironmentVariableDefinition {
  name: string;
  domain: string;
  classification: VariableClassification;
  isSecret: boolean;
  isPubliclyExposed: boolean;
  isRequiredInProduction: boolean;
  requiredAt: 'BUILD_TIME' | 'RUNTIME' | 'PIPELINE_INIT';
  origin: 'GITHUB_SECRETS' | 'RENDER_ENV' | 'ENV_LOCAL' | 'DEVELOPER';
  consumedBy: 'FRONTEND_VITE' | 'BACKEND_NODE' | 'CI_PIPELINE';
  description: string;
  defaultValue?: string;
}

export const CANONICAL_ENVIRONMENT_MATRIX: EnvironmentVariableDefinition[] = [
  // 01. Application
  {
    name: 'VITE_APP_TIMEZONE',
    domain: 'Application',
    classification: 'SHARED_RUNTIME',
    isSecret: false,
    isPubliclyExposed: true,
    isRequiredInProduction: true,
    requiredAt: 'BUILD_TIME',
    origin: 'DEVELOPER',
    consumedBy: 'FRONTEND_VITE',
    defaultValue: 'Africa/Luanda',
    description: 'Fuso horário oficial da República de Angola',
  },
  {
    name: 'VITE_APP_LOCALE',
    domain: 'Application',
    classification: 'SHARED_RUNTIME',
    isSecret: false,
    isPubliclyExposed: true,
    isRequiredInProduction: true,
    requiredAt: 'BUILD_TIME',
    origin: 'DEVELOPER',
    consumedBy: 'FRONTEND_VITE',
    defaultValue: 'pt-PT',
    description: 'Localidade padrão',
  },
  {
    name: 'VITE_APP_COUNTRY',
    domain: 'Application',
    classification: 'SHARED_RUNTIME',
    isSecret: false,
    isPubliclyExposed: true,
    isRequiredInProduction: true,
    requiredAt: 'BUILD_TIME',
    origin: 'DEVELOPER',
    consumedBy: 'FRONTEND_VITE',
    defaultValue: 'AO',
    description: 'Código de jurisdição nacional',
  },
  {
    name: 'VITE_SUPPORT_EMAIL',
    domain: 'Application',
    classification: 'PUBLIC_BUILD',
    isSecret: false,
    isPubliclyExposed: true,
    isRequiredInProduction: true,
    requiredAt: 'BUILD_TIME',
    origin: 'DEVELOPER',
    consumedBy: 'FRONTEND_VITE',
    defaultValue: 'silaprimeiro@gmail.com',
    description: 'E-mail de suporte institucional',
  },
  {
    name: 'VITE_APP_URL',
    domain: 'Application',
    classification: 'PUBLIC_BUILD',
    isSecret: false,
    isPubliclyExposed: true,
    isRequiredInProduction: false,
    requiredAt: 'BUILD_TIME',
    origin: 'ENV_LOCAL',
    consumedBy: 'FRONTEND_VITE',
    description: 'URL base da aplicação frontend',
  },

  // 02. Server
  {
    name: 'NODE_ENV',
    domain: 'Server',
    classification: 'BACKEND_RUNTIME',
    isSecret: false,
    isPubliclyExposed: false,
    isRequiredInProduction: true,
    requiredAt: 'RUNTIME',
    origin: 'RENDER_ENV',
    consumedBy: 'BACKEND_NODE',
    defaultValue: 'production',
    description: 'Ambiente de execução Node.js',
  },
  {
    name: 'PORT',
    domain: 'Server',
    classification: 'BACKEND_RUNTIME',
    isSecret: false,
    isPubliclyExposed: false,
    isRequiredInProduction: true,
    requiredAt: 'RUNTIME',
    origin: 'RENDER_ENV',
    consumedBy: 'BACKEND_NODE',
    defaultValue: '3000',
    description: 'Porta de escuta do servidor HTTP',
  },
  {
    name: 'VITE_API_BASE_URL',
    domain: 'Server',
    classification: 'SHARED_RUNTIME',
    isSecret: false,
    isPubliclyExposed: true,
    isRequiredInProduction: false,
    requiredAt: 'BUILD_TIME',
    origin: 'RENDER_ENV',
    consumedBy: 'FRONTEND_VITE',
    description: 'URL do backend proxy',
  },

  // 04. Firebase Client (Público)
  {
    name: 'VITE_FIREBASE_API_KEY',
    domain: 'Firebase',
    classification: 'PUBLIC_BUILD',
    isSecret: false,
    isPubliclyExposed: true,
    isRequiredInProduction: true,
    requiredAt: 'BUILD_TIME',
    origin: 'GITHUB_SECRETS',
    consumedBy: 'FRONTEND_VITE',
    description: 'Chave pública Firebase Web SDK',
  },
  {
    name: 'VITE_FIREBASE_AUTH_DOMAIN',
    domain: 'Firebase',
    classification: 'PUBLIC_BUILD',
    isSecret: false,
    isPubliclyExposed: true,
    isRequiredInProduction: true,
    requiredAt: 'BUILD_TIME',
    origin: 'GITHUB_SECRETS',
    consumedBy: 'FRONTEND_VITE',
    defaultValue: 'gen-lang-client-0113821724.firebaseapp.com',
    description: 'Domínio de autenticação Firebase',
  },
  {
    name: 'VITE_FIREBASE_PROJECT_ID',
    domain: 'Firebase',
    classification: 'PUBLIC_BUILD',
    isSecret: false,
    isPubliclyExposed: true,
    isRequiredInProduction: true,
    requiredAt: 'BUILD_TIME',
    origin: 'GITHUB_SECRETS',
    consumedBy: 'FRONTEND_VITE',
    defaultValue: 'gen-lang-client-0113821724',
    description: 'Project ID do Firebase',
  },

  // 05. Firestore (Canónico)
  {
    name: 'VITE_FIRESTORE_DATABASE_ID',
    domain: 'Firestore',
    classification: 'PUBLIC_BUILD',
    isSecret: false,
    isPubliclyExposed: true,
    isRequiredInProduction: true,
    requiredAt: 'BUILD_TIME',
    origin: 'DEVELOPER',
    consumedBy: 'FRONTEND_VITE',
    defaultValue: 'ai-studio-siladigitalident-3824b3dd-a639-4e6e-99fc-b2426258d225',
    description: 'Database ID canónico do Firestore no Client SDK',
  },
  {
    name: 'FIRESTORE_DATABASE_ID',
    domain: 'Firestore',
    classification: 'BACKEND_RUNTIME',
    isSecret: false,
    isPubliclyExposed: false,
    isRequiredInProduction: true,
    requiredAt: 'RUNTIME',
    origin: 'RENDER_ENV',
    consumedBy: 'BACKEND_NODE',
    defaultValue: 'ai-studio-siladigitalident-3824b3dd-a639-4e6e-99fc-b2426258d225',
    description: 'Database ID canónico do Firestore no Admin SDK',
  },
  {
    name: 'FIREBASE_CLIENT_EMAIL',
    domain: 'Firestore',
    classification: 'BACKEND_RUNTIME',
    isSecret: true,
    isPubliclyExposed: false,
    isRequiredInProduction: true,
    requiredAt: 'RUNTIME',
    origin: 'RENDER_ENV',
    consumedBy: 'BACKEND_NODE',
    description: 'E-mail do Service Account administrativo',
  },
  {
    name: 'FIREBASE_PRIVATE_KEY',
    domain: 'Firestore',
    classification: 'BACKEND_RUNTIME',
    isSecret: true,
    isPubliclyExposed: false,
    isRequiredInProduction: true,
    requiredAt: 'RUNTIME',
    origin: 'RENDER_ENV',
    consumedBy: 'BACKEND_NODE',
    description: 'Chave privada PEM do Service Account (Server-Side Only)',
  },

  // 06. AI (Gemini Engine)
  {
    name: 'GEMINI_API_KEY',
    domain: 'AI',
    classification: 'BACKEND_RUNTIME',
    isSecret: true,
    isPubliclyExposed: false,
    isRequiredInProduction: true,
    requiredAt: 'RUNTIME',
    origin: 'RENDER_ENV',
    consumedBy: 'BACKEND_NODE',
    description: 'Chave do Google GenAI SDK (Server-Side Only)',
  },

  // 16. Governance (Dados Administrativos Internos - PRIVADOS)
  {
    name: 'GOVERNANCE_FOUNDER_NAME',
    domain: 'Governance',
    classification: 'BACKEND_RUNTIME',
    isSecret: true,
    isPubliclyExposed: false,
    isRequiredInProduction: false,
    requiredAt: 'RUNTIME',
    origin: 'RENDER_ENV',
    consumedBy: 'BACKEND_NODE',
    description: 'Nome da autoridade soberana fundadora (Server-Side Only)',
  },
  {
    name: 'GOVERNANCE_PHONE',
    domain: 'Governance',
    classification: 'BACKEND_RUNTIME',
    isSecret: true,
    isPubliclyExposed: false,
    isRequiredInProduction: false,
    requiredAt: 'RUNTIME',
    origin: 'RENDER_ENV',
    consumedBy: 'BACKEND_NODE',
    description: 'Contacto administrativo interno (Server-Side Only)',
  },
];

/**
 * Validador Estrito do Contrato de Ambiente
 * Bloqueia pipelines e compilações caso haja exposição indevida de segredos ou falta de variáveis
 */
export function validateEnvironmentContract(envObject: Record<string, string | undefined>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const def of CANONICAL_ENVIRONMENT_MATRIX) {
    const val = envObject[def.name] || def.defaultValue;

    // 1. Impedir que um segredo seja exposto através do prefixo VITE_*
    if (def.isSecret && def.name.startsWith('VITE_')) {
      errors.push(`[VIOLAÇÃO_SEGURANÇA_FATAL] Segredo de backend ${def.name} exposto com prefixo público VITE_*`);
    }

    // 2. Bloquear se variável obrigatória de produção/build estiver ausente
    if (def.isRequiredInProduction && (!val || val.trim() === '')) {
      errors.push(`[CONTRATO_INCOMPLETO] Variável obrigatória ausente: ${def.name} (Domínio: ${def.domain})`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
