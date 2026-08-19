export type OperatorRole = 
  | 'SERVICE_AGENT'        // Agente de Atendimento
  | 'IDENTITY_ANALYST'      // Analista de Identidade Civil
  | 'BIOMETRIC_OPERATOR'   // Operador Biométrico
  | 'SUPERVISOR'           // Supervisor de Balcão
  | 'ISSUANCE_OPERATOR'    // Operador de Emissão
  | 'AUDITOR'              // Auditor de Conformidade
  | 'REPORTING_OFFICER'    // Oficial de Relatórios
  | 'SYSTEM_ADMIN'         // Administrador de Sistema
  | 'GOVERNANCE_ADMIN';    // Administrador de Governação

export type ResourceScope = 
  | 'PROCESS'
  | 'CITIZEN'
  | 'BIOMETRIC'
  | 'ISSUANCE'
  | 'TERRITORY'
  | 'AGENDAMENTO'
  | 'ATENDIMENTO'
  | 'VALIDATION'
  | 'AUDIT'
  | 'REPORT'
  | 'CONFIG'
  | 'SYSTEM_USERS';

export type ActionType = 
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'COLLECT_BIOMETRICS'
  | 'ISSUE_CARD'
  | 'EXPORT'
  | 'MANAGE_USERS'
  | 'GOVERN';

export type OrganizationalScope = 
  | 'MJDH_CENTRAL'
  | 'DNIC_LUANDA'
  | 'POSTO_ATENDIMENTO_LUANDA'
  | 'POSTO_ATENDIMENTO_BENGUELA'
  | 'POSTO_ATENDIMENTO_HUAMBO'
  | 'POSTO_ATENDIMENTO_CABINDA'
  | 'BALCAO_DIGITAL_NACIONAL';

// State machine definitions:
// LOCKED → CITIZEN_AUTHENTICATED → ADMIN_AUTHENTICATED → AUTHORIZED_OPERATION
// With transitions for REAUTH_REQUIRED, IAM_VERIFICATION, COMMAND_AUTHORIZED, SILA_CHAIN_AUDIT
export type AppAuthState =
  | 'LOCKED'
  | 'CITIZEN_AUTHENTICATED'
  | 'ADMIN_AUTHENTICATED'
  | 'REAUTH_REQUIRED'
  | 'IAM_VERIFICATION'
  | 'COMMAND_AUTHORIZED'
  | 'AUTHORIZED_OPERATION';

export interface CitizenSession {
  authenticatedAt: string;
  citizenBiNumber: string;
  authMethod: 'PIN' | 'BIOMETRIC' | 'CREDENTIALS';
  sessionStatus: 'ACTIVE' | 'EXPIRED';
}

export interface AdminAuthenticationRequest {
  secretSequence?: string;
  operatorRole?: OperatorRole;
  hardwareKeyPresent?: boolean;
}

export interface AdminAuthenticationResult {
  success: boolean;
  session?: OperatorSession;
  errorMessage?: string;
}

export interface PolicyCondition {
  requiresMfa: boolean;
  requiresReauthMinutes?: number; // Reauth required if last reauth > X minutes ago
  allowedIpSubnet?: string;
  allowedTerritories?: string[]; // e.g., ['Luanda', 'Cacuaco'] or ['ALL']
  allowedWorkingHoursOnly?: boolean;
  maxDailyApprovals?: number;
}

export interface OperatorProfile {
  id: string;
  badgeNumber: string;
  fullName: string;
  email: string;
  role: OperatorRole;
  roleTitle: string;
  organization: OrganizationalScope;
  organizationName: string;
  territories: string[]; // e.g. ['Luanda', 'Belas'] or ['NACIONAL']
  clearanceLevel: number; // 1 to 5
}

export interface OperatorSession {
  operator: OperatorProfile;
  sessionStart: string;
  expiresAt: string;
  lastActiveAt: string;
  lastReauthenticatedAt: string;
  mfaVerified: boolean;
  mfaType: 'TOTP' | 'HARDWARE_KEY' | 'SMS_TOKEN';
  deviceId: string;
  deviceName: string;
  isTrustedDevice: boolean;
  ipAddress: string;
  sessionStatus: 'ACTIVE' | 'EXPIRED' | 'LOCKED' | 'PENDING_MFA';
}

export interface AccessEvaluationRequest {
  role: OperatorRole;
  organization: OrganizationalScope;
  operatorTerritories: string[];
  resource: ResourceScope;
  targetTerritory?: string; // Territory of the target citizen/process
  action: ActionType;
  lastReauthenticatedAt: string;
  mfaVerified: boolean;
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  requiresReauth: boolean;
  evaluatedFactors: {
    role: string;
    organization: string;
    territoryMatch: boolean;
    resource: string;
    action: string;
    policyStatus: string;
  };
}
