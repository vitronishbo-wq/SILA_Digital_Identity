import {
  OperatorRole,
  OrganizationalScope,
  OperatorProfile,
  OperatorSession,
  ResourceScope,
  ActionType,
  AccessEvaluationRequest,
  AccessDecision
} from '../types/auth';

// SAMPLE PRE-CONFIGURED OPERATORS COVERING ALL 9 ROLES
export const MJDH_OPERATORS: Record<OperatorRole, OperatorProfile> = {
  SERVICE_AGENT: {
    id: 'op-001',
    badgeNumber: 'AGT-8812',
    fullName: 'Ana Maria Bernardo',
    email: 'ana.bernardo@minjusdh.gov.ao',
    role: 'SERVICE_AGENT',
    roleTitle: 'Agente de Atendimento Presencial',
    organization: 'POSTO_ATENDIMENTO_LUANDA',
    organizationName: 'Posto de Atendimento de Luanda (Talatona)',
    territories: ['Luanda', 'Talatona', 'Kilamba Kiaxi'],
    clearanceLevel: 1
  },
  IDENTITY_ANALYST: {
    id: 'op-002',
    badgeNumber: 'ANL-4409',
    fullName: 'Mateus Kiala Ndongala',
    email: 'mateus.ndongala@minjusdh.gov.ao',
    role: 'IDENTITY_ANALYST',
    roleTitle: 'Analista de Identidade Civil',
    organization: 'DNIC_LUANDA',
    organizationName: 'Direcção Nacional de Identificação Civil',
    territories: ['Luanda', 'Cazenga', 'Viana', 'Icolo e Bengo'],
    clearanceLevel: 3
  },
  BIOMETRIC_OPERATOR: {
    id: 'op-003',
    badgeNumber: 'BIO-9912',
    fullName: 'Esperança Fátima Bento',
    email: 'esperanca.bento@minjusdh.gov.ao',
    role: 'BIOMETRIC_OPERATOR',
    roleTitle: 'Técnica de Recolha Biométrica e Dactiloscópica',
    organization: 'POSTO_ATENDIMENTO_LUANDA',
    organizationName: 'Posto de Atendimento de Luanda (Cazenga)',
    territories: ['Luanda', 'Cazenga'],
    clearanceLevel: 2
  },
  SUPERVISOR: {
    id: 'op-004',
    badgeNumber: 'SUP-1004',
    fullName: 'Dr. Sebastião Francisco Vunge',
    email: 'sebastiao.vunge@minjusdh.gov.ao',
    role: 'SUPERVISOR',
    roleTitle: 'Supervisor de Balcão e Atendimento',
    organization: 'POSTO_ATENDIMENTO_LUANDA',
    organizationName: 'Supervisão Regional de Luanda',
    territories: ['Luanda', 'Bengo'],
    clearanceLevel: 4
  },
  ISSUANCE_OPERATOR: {
    id: 'op-005',
    badgeNumber: 'ISS-7731',
    fullName: 'João Baptista Chivela',
    email: 'joao.chivela@minjusdh.gov.ao',
    role: 'ISSUANCE_OPERATOR',
    roleTitle: 'Operador de Emissão e Personalização de BI',
    organization: 'MJDH_CENTRAL',
    organizationName: 'Centro Nacional de Personalização de Cartões',
    territories: ['NACIONAL'],
    clearanceLevel: 3
  },
  AUDITOR: {
    id: 'op-006',
    badgeNumber: 'AUD-3002',
    fullName: 'Dra. Rosa
 Conceição Neto',
    email: 'rosa.neto@minjusdh.gov.ao',
    role: 'AUDITOR',
    roleTitle: 'Auditora de Conformidade e Integridade',
    organization: 'MJDH_CENTRAL',
    organizationName: 'Gabinete de Inspecção e Auditoria MJDH',
    territories: ['NACIONAL'],
    clearanceLevel: 4
  },
  REPORTING_OFFICER: {
    id: 'op-007',
    badgeNumber: 'RPT-5520',
    fullName: 'Manuel Domingos Pestana',
    email: 'manuel.pestana@minjusdh.gov.ao',
    role: 'REPORTING_OFFICER',
    roleTitle: 'Oficial de Estatística e Relatórios Governamentais',
    organization: 'MJDH_CENTRAL',
    organizationName: 'Gabinete de Estudos e Planeamento Estatístico',
    territories: ['NACIONAL'],
    clearanceLevel: 2
  },
  SYSTEM_ADMIN: {
    id: 'op-008',
    badgeNumber: 'SYS-0001',
    fullName: 'Eng. Paulo Henrique Santos',
    email: 'paulo.santos@minjusdh.gov.ao',
    role: 'SYSTEM_ADMIN',
    roleTitle: 'Administrador de Sistemas e Infraestrutura',
    organization: 'MJDH_CENTRAL',
    organizationName: 'Direcção de Tecnologias de Informação',
    territories: ['NACIONAL'],
    clearanceLevel: 5
  },
  GOVERNANCE_ADMIN: {
    id: 'op-009',
    badgeNumber: 'GOV-9000',
    fullName: 'Deusfundador (SuperAdmin)',
    email: 'deusfundador@minjusdh.gov.ao',
    role: 'GOVERNANCE_ADMIN',
    roleTitle: 'Administrador de Governação e Políticas Nacionais',
    organization: 'MJDH_CENTRAL',
    organizationName: 'Conselho Superior de Identificação Civil MJDH',
    territories: ['NACIONAL'],
    clearanceLevel: 5
  }
};

// ACTIVE SESSION STATE IN MEMORY
let currentActiveSession: OperatorSession = {
  operator: MJDH_OPERATORS.GOVERNANCE_ADMIN, // Default initial view is SuperAdmin Deusfundador
  sessionStart: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour session
  lastActiveAt: new Date().toISOString(),
  lastReauthenticatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
  mfaVerified: true,
  mfaType: 'TOTP',
  deviceId: 'TERM-MJDH-LUANDA-001',
  deviceName: 'Estação de Trabalho Autorizada MJDH-001 (Ubuntu Hardened)',
  isTrustedDevice: true,
  ipAddress: '10.220.14.88',
  sessionStatus: 'ACTIVE'
};

/**
 * Get current active operator session
 */
export function getCurrentSession(): OperatorSession {
  return currentActiveSession;
}

/**
 * Switch active operator role (Simulating multi-role institutional login)
 */
export function switchActiveOperator(role: OperatorRole): OperatorSession {
  const profile = MJDH_OPERATORS[role] || MJDH_OPERATORS.GOVERNANCE_ADMIN;
  currentActiveSession = {
    ...currentActiveSession,
    operator: profile,
    sessionStart: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date().toISOString(),
    lastReauthenticatedAt: new Date().toISOString(),
    mfaVerified: true,
    sessionStatus: 'ACTIVE'
  };
  return currentActiveSession;
}

/**
 * Perform Reauthentication for critical operations
 */
export function reauthenticateSession(pinOrPassword: string): boolean {
  if (pinOrPassword && pinOrPassword.length >= 4) {
    currentActiveSession = {
      ...currentActiveSession,
      lastReauthenticatedAt: new Date().toISOString(),
      mfaVerified: true,
      sessionStatus: 'ACTIVE'
    };
    return true;
  }
  return false;
}

/**
 * Trigger logout
 */
export function logoutSession(): void {
  currentActiveSession = {
    ...currentActiveSession,
    sessionStatus: 'EXPIRED'
  };
}

/**
 * CORE POLICY DECISION ENGINE (PDP)
 * Evaluates access based on: ROLE + ORGANIZATION + TERRITORY + RESOURCE + ACTION + POLICY
 * Never assumes ADMIN = full access!
 */
export function evaluateAccessPolicy(req: AccessEvaluationRequest): AccessDecision {
  const {
    role,
    organization,
    operatorTerritories,
    resource,
    targetTerritory,
    action,
    lastReauthenticatedAt,
    mfaVerified
  } = req;

  // 1. Check MFA
  if (!mfaVerified) {
    return {
      allowed: false,
      reason: 'Acesso negado: Autenticação Multifactor (MFA/TOTP) obrigatória não verificada.',
      requiresReauth: true,
      evaluatedFactors: {
        role,
        organization,
        territoryMatch: false,
        resource,
        action,
        policyStatus: 'REJECTED_MISSING_MFA'
      }
    };
  }

  // 2. Check Reauthentication requirement for critical actions (APPROVE, ISSUE_CARD, DELETE, MANAGE_USERS, GOVERN)
  const CRITICAL_ACTIONS: ActionType[] = ['APPROVE', 'ISSUE_CARD', 'DELETE', 'MANAGE_USERS', 'GOVERN'];
  const isCriticalAction = CRITICAL_ACTIONS.includes(action);
  const minutesSinceReauth = (Date.now() - new Date(lastReauthenticatedAt).getTime()) / (1000 * 60);

  if (isCriticalAction && minutesSinceReauth > 15) {
    return {
      allowed: false,
      reason: 'Reautenticação necessária: Operação crítica requer validação de senha/PIN nos últimos 15 minutos.',
      requiresReauth: true,
      evaluatedFactors: {
        role,
        organization,
        territoryMatch: true,
        resource,
        action,
        policyStatus: 'REQUIRES_REAUTHENTICATION'
      }
    };
  }

  // 3. Territorial Scope Matching
  const isNationalTerritory = operatorTerritories.includes('NACIONAL') || operatorTerritories.includes('ALL');
  const hasTerritoryMatch = isNationalTerritory || !targetTerritory || operatorTerritories.includes(targetTerritory);

  if (!hasTerritoryMatch) {
    return {
      allowed: false,
      reason: `Fora do Escopo Territorial: O operador está restrito às jurisdições [${operatorTerritories.join(', ')}], mas o recurso pertence a [${targetTerritory}].`,
      requiresReauth: false,
      evaluatedFactors: {
        role,
        organization,
        territoryMatch: false,
        resource,
        action,
        policyStatus: 'REJECTED_TERRITORIAL_SCOPE'
      }
    };
  }

  // 4. Matrix Evaluation by Role + Resource + Action (RBAC + ABAC Policy Matrix)
  let isAllowedByRoleAndScope = false;
  let policyDetail = 'Ação permitida pelas políticas operacionais MJDH.';

  switch (role) {
    case 'SERVICE_AGENT':
      // Agente de Atendimento: Pode ler cidadãos/processos de sua jurisdição, criar atendimentos e agendamentos.
      if (['AGENDAMENTO', 'ATENDIMENTO', 'CITIZEN', 'PROCESS'].includes(resource) && ['READ', 'CREATE', 'UPDATE'].includes(action)) {
        isAllowedByRoleAndScope = true;
      } else {
        policyDetail = 'Agentes de Atendimento não têm permissão para aprovar processos, recolher biometria avançada ou alterar configurações.';
      }
      break;

    case 'IDENTITY_ANALYST':
      // Analista de Identidade: Análise e decisão sobre processos, cidadãos, BI e validações.
      if (['PROCESS', 'CITIZEN', 'BI', 'VALIDATION'].includes(resource) && ['READ', 'UPDATE', 'APPROVE', 'REJECT'].includes(action)) {
        isAllowedByRoleAndScope = true;
      } else if (resource === 'BIOMETRIC' && action === 'READ') {
        isAllowedByRoleAndScope = true;
      } else {
        policyDetail = 'Analistas de Identidade não gerem utilizadores nem realizam emissão física de cartões.';
      }
      break;

    case 'BIOMETRIC_OPERATOR':
      // Operador Biométrico: Recolha biométrica, consulta de dados e verificação dactiloscópica.
      if (resource === 'BIOMETRIC' && ['READ', 'CREATE', 'COLLECT_BIOMETRICS', 'UPDATE'].includes(action)) {
        isAllowedByRoleAndScope = true;
      } else if (['CITIZEN', 'PROCESS'].includes(resource) && ['READ', 'UPDATE'].includes(action)) {
        isAllowedByRoleAndScope = true;
      } else {
        policyDetail = 'Operadores Biométricos estão restritos à recolha, calibração AFIS e verificação dactiloscópica.';
      }
      break;

    case 'SUPERVISOR':
      // Supervisor de Balcão: Pode aprovar exceções, visualizar tudo no seu posto/território, e reatribuir casos.
      if (['PROCESS', 'CITIZEN', 'AGENDAMENTO', 'ATENDIMENTO', 'BIOMETRIC', 'VALIDATION'].includes(resource) && ['READ', 'CREATE', 'UPDATE', 'APPROVE', 'REJECT'].includes(action)) {
        isAllowedByRoleAndScope = true;
      } else if (resource === 'AUDIT' && action === 'READ') {
        isAllowedByRoleAndScope = true;
      } else {
        policyDetail = 'Supervisores não podem alterar parâmetros de infraestrutura nem governar políticas nacionais.';
      }
      break;

    case 'ISSUANCE_OPERATOR':
      // Operador de Emissão: Gestão do lote de impressão, leitura e emissão do documento BI.
      if (resource === 'ISSUANCE' && ['READ', 'CREATE', 'UPDATE', 'ISSUE_CARD'].includes(action)) {
        isAllowedByRoleAndScope = true;
      } else if (['BI', 'PROCESS', 'CITIZEN'].includes(resource) && ['READ', 'UPDATE'].includes(action)) {
        isAllowedByRoleAndScope = true;
      } else {
        policyDetail = 'Operadores de Emissão não alteram registos cívicos nem gerem utilizadores.';
      }
      break;

    case 'AUDITOR':
      // Auditor de Conformidade: Leitura total e exportação de logs de auditoria e relatórios. NENHUMA alteração de dados.
      if (['AUDIT', 'REPORT', 'VALIDATION', 'PROCESS', 'CITIZEN'].includes(resource) && ['READ', 'EXPORT'].includes(action)) {
        isAllowedByRoleAndScope = true;
      } else {
        policyDetail = 'Auditores possuem acesso estritamente de leitura (Read-Only) e exportação de registos de integridade.';
      }
      break;

    case 'REPORTING_OFFICER':
      // Oficial de Relatórios: Visualização e exportação de estatísticas operacionais e territoriais.
      if (['REPORT', 'TERRITORY', 'PROCESS', 'VALIDATION'].includes(resource) && ['READ', 'EXPORT'].includes(action)) {
        isAllowedByRoleAndScope = true;
      } else {
        policyDetail = 'Oficiais de Relatórios não têm acesso a modificações nominais ou decisões de processos.';
      }
      break;

    case 'SYSTEM_ADMIN':
      // Administrador de Sistema: Gestão de utilizadores, configurações de servidor e territórios.
      // NOTA CRÍTICA: SYSTEM_ADMIN NÃO pode recolher biometria nem emitir cartões diretamente! (Princípio do menor privilégio)
      if (['CONFIG', 'SYSTEM_USERS', 'TERRITORY', 'AUDIT'].includes(resource) && ['READ', 'CREATE', 'UPDATE', 'MANAGE_USERS', 'DELETE'].includes(action)) {
        isAllowedByRoleAndScope = true;
      } else if (['PROCESS', 'CITIZEN', 'REPORT'].includes(resource) && action === 'READ') {
        isAllowedByRoleAndScope = true;
      } else if (['COLLECT_BIOMETRICS', 'ISSUE_CARD'].includes(action)) {
        isAllowedByRoleAndScope = false;
        policyDetail = 'Administradores de Sistema NÃO possuem permissão para emitir cartões ou recolher biometria (Segregação de Funções).';
      } else {
        isAllowedByRoleAndScope = true;
      }
      break;

    case 'GOVERNANCE_ADMIN':
      // Administrador de Governação (SuperAdmin): Governação de políticas, auditoria nacional, e regras globais.
      if (['GOVERN', 'MANAGE_USERS', 'APPROVE', 'READ', 'CREATE', 'UPDATE', 'EXPORT'].includes(action)) {
        isAllowedByRoleAndScope = true;
      } else if (['COLLECT_BIOMETRICS', 'ISSUE_CARD'].includes(action)) {
        // Mesmo SuperAdmin precisa de papel operacional para emissão direta no balcão
        isAllowedByRoleAndScope = false;
        policyDetail = 'SuperAdmin de Governação não realiza tarefas físicas de balcão (Emissão/Biometria directas sem credencial de operador).';
      } else {
        isAllowedByRoleAndScope = true;
      }
      break;
  }

  if (!isAllowedByRoleAndScope) {
    return {
      allowed: false,
      reason: `Acesso Negado pela Política ABAC/RBAC: O perfil '${role}' na organização '${organization}' não tem autorização para realizar a ação '${action}' sobre o recurso '${resource}'. ${policyDetail}`,
      requiresReauth: false,
      evaluatedFactors: {
        role,
        organization,
        territoryMatch: true,
        resource,
        action,
        policyStatus: 'REJECTED_ROLE_POLICY'
      }
    };
  }

  return {
    allowed: true,
    reason: 'Acesso Autorizado: Política RBAC + ABAC validada com sucesso.',
    requiresReauth: false,
    evaluatedFactors: {
      role,
      organization,
      territoryMatch: true,
      resource,
      action,
      policyStatus: 'GRANTED'
    }
  };
}
