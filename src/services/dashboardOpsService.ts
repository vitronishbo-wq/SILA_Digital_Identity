// DASHBOARD OPERATIONS & INFRASTRUCTURE SERVICES
// Handles state and operations for the SILA/GovOS Admin Command Center

export type EnvironmentType = 'DEMO' | 'STAGING' | 'PRODUCTION';

export type TimeframeFilter = 'HOJE' | '24H' | '7D' | '30D' | 'MES_ATUAL' | 'PERSONALIZADO';

export type AutoRefreshRate = 'OFF' | '10S' | '30S' | '60S';

export interface ServiceHealth {
  id: string;
  name: string;
  category: 'BIOMETRIA' | 'PKI' | 'IMPRESSAO' | 'REGISTO_CIVIL' | 'REDE' | 'DATABASE';
  status: 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
  latencyMs: number;
  uptimePercent: number;
  lastCheckedAt: string;
}

export interface OperationalTask {
  id: string;
  processNumber: string;
  citizenName: string;
  taskTitle: string;
  priority: 'ALTA' | 'MEDIA' | 'CRITICA';
  category: 'VALIDACAO' | 'BIOMETRIA' | 'EMISSAO' | 'DUPLICIDADE';
  createdAt: string;
  assignedRole: string;
  status: 'PENDENTE' | 'EM_ANALISE' | 'CONCLUIDO';
}

export interface SystemIncident {
  id: string;
  code: string;
  severity: 'ALTA' | 'CRITICA' | 'MODERADA';
  title: string;
  impactScope: string;
  serviceAffected: string;
  reportedAt: string;
  status: 'ABERTO' | 'EM_MITIGACAO' | 'RESOLVIDO';
}

export interface AdminAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  targetId: string;
  ipAddress: string;
  status: 'SUCESSO' | 'NEGADO' | 'REAUTENTICADO';
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  read: boolean;
  linkTab?: string;
}

export interface DelegationSession {
  active: boolean;
  delegatedRole?: string;
  delegatorName?: string;
  dispatchRef?: string;
  supervisorName?: string;
  reason?: string;
  startedAt?: string;
  expiresAt?: string;
}

export interface BreakGlassSession {
  active: boolean;
  justification?: string;
  legalTicketRef?: string;
  activatedBy?: string;
  activatedAt?: string;
}

// INITIAL STATE STUBS
export const INITIAL_SERVICES_HEALTH: ServiceHealth[] = [
  { id: 'srv-1', name: 'Motor AFIS/ABIS Biométrico', category: 'BIOMETRIA', status: 'HEALTHY', latencyMs: 18, uptimePercent: 99.98, lastCheckedAt: 'Agora' },
  { id: 'srv-2', name: 'GovOS PKI RSA-4096 / Assinador', category: 'PKI', status: 'HEALTHY', latencyMs: 12, uptimePercent: 100.0, lastCheckedAt: 'Agora' },
  { id: 'srv-3', name: 'Gravadora Laser de Cartões (MJDH Central)', category: 'IMPRESSAO', status: 'HEALTHY', latencyMs: 45, uptimePercent: 99.4, lastCheckedAt: 'Agora' },
  { id: 'srv-4', name: 'Ponte com Registo Civil (DNRC)', category: 'REGISTO_CIVIL', status: 'DEGRADED', latencyMs: 142, uptimePercent: 98.1, lastCheckedAt: 'Há 1m' },
  { id: 'srv-5', name: 'Intranet Gov / VPN Criptografada', category: 'REDE', status: 'HEALTHY', latencyMs: 8, uptimePercent: 99.99, lastCheckedAt: 'Agora' },
  { id: 'srv-6', name: 'Firestore Realtime Sync Cloud', category: 'DATABASE', status: 'HEALTHY', latencyMs: 24, uptimePercent: 99.95, lastCheckedAt: 'Agora' }
];

export const INITIAL_TASKS: OperationalTask[] = [
  { id: 'tsk-01', processNumber: 'REQ-2026-00189', citizenName: 'Kamba Francisco Manuel', taskTitle: 'Validação de Duplicidade Dactiloscópica (Limiar 89%)', priority: 'CRITICA', category: 'DUPLICIDADE', createdAt: '10 min atrás', assignedRole: 'IDENTITY_ANALYST', status: 'PENDENTE' },
  { id: 'tsk-02', processNumber: 'REQ-2026-00192', citizenName: 'Mariana Isabel dos Santos', taskTitle: 'Aprovação de Emissão com Nome Alterado por Casamento', priority: 'ALTA', category: 'VALIDACAO', createdAt: '25 min atrás', assignedRole: 'SUPERVISOR', status: 'PENDENTE' },
  { id: 'tsk-03', processNumber: 'REQ-2026-00198', citizenName: 'António Ndongala Kiala', taskTitle: 'Autorização de Impressão Laser Lote Urgente', priority: 'ALTA', category: 'EMISSAO', createdAt: '40 min atrás', assignedRole: 'ISSUANCE_OPERATOR', status: 'PENDENTE' },
  { id: 'tsk-04', processNumber: 'REQ-2026-00204', citizenName: 'Teresa Amélia Vunge', taskTitle: 'Verificação de Impressão Digital Riscada / Incapacidade', priority: 'MEDIA', category: 'BIOMETRIA', createdAt: '1h atrás', assignedRole: 'BIOMETRIC_OPERATOR', status: 'PENDENTE' },
  { id: 'tsk-05', processNumber: 'REQ-2026-00210', citizenName: 'Mateus José Bento', taskTitle: 'Confirmação de Isenção de Emolumentos por Incapacidade', priority: 'MEDIA', category: 'VALIDACAO', createdAt: '2h atrás', assignedRole: 'SERVICE_AGENT', status: 'PENDENTE' }
];

export const INITIAL_INCIDENTS: SystemIncident[] = [
  { id: 'inc-01', code: 'INC-2026-081', severity: 'MODERADA', title: 'Oscilação de Link VPN no Posto Huambo', impactScope: 'Posto de Atendimento Huambo', serviceAffected: 'Intranet Gov / VPN', reportedAt: 'Há 12 min', status: 'EM_MITIGACAO' },
  { id: 'inc-02', code: 'INC-2026-082', severity: 'ALTA', title: 'Manutenção Térmica Preventiva na Gravadora Laser #02', impactScope: 'Centro de Personalização MJDH', serviceAffected: 'Impressão Laser', reportedAt: 'Há 45 min', status: 'ABERTO' }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'not-01', title: 'Lote de Cartões Concluído', message: 'O Lote #4812 com 250 BI foi assinado digitalmente com RSA-4096.', timestamp: '5 min atrás', type: 'SUCCESS', read: false, linkTab: 'EMISSAO' },
  { id: 'not-02', title: 'Alerta de Duplicidade Biométrica', message: 'Detector de FACIAL encontrou correspondência de 94.2% no Processo REQ-00189.', timestamp: '18 min atrás', type: 'CRITICAL', read: false, linkTab: 'PROCESSOS' },
  { id: 'not-03', title: 'Sincronização com Registo Civil', message: 'Serviço DNRC restabelecido com latência normalizada.', timestamp: '1h atrás', type: 'INFO', read: true, linkTab: 'VALIDACOES' },
  { id: 'not-04', title: 'Atualização de Política ABAC', message: 'Regra de reautenticação em 15 minutos foi ativada pelo Administrador de Governação.', timestamp: '3h atrás', type: 'WARNING', read: true, linkTab: 'AUTENTICACAO' }
];

export const INITIAL_MY_AUDIT_LOGS: AdminAuditEntry[] = [
  { id: 'aud-101', timestamp: new Date(Date.now() - 2 * 60000).toLocaleTimeString(), action: 'LOGIN_MFA_SUCESSO', resource: 'SESSION', targetId: 'Sessão #8812', ipAddress: '10.220.14.89', status: 'SUCESSO', details: 'Autenticação com chave de hardware FIDO2 e TOTP.' },
  { id: 'aud-102', timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString(), action: 'TROCA_DE_ROLE', resource: 'IAM_RBAC', targetId: 'IDENTITY_ANALYST', ipAddress: '10.220.14.89', status: 'SUCESSO', details: 'Alteração de perfil ativo para Analista de Identidade.' },
  { id: 'aud-103', timestamp: new Date(Date.now() - 32 * 60000).toLocaleTimeString(), action: 'CONSULTA_PROCESSO', resource: 'PROCESS', targetId: 'REQ-2026-00189', ipAddress: '10.220.14.89', status: 'SUCESSO', details: 'Visualização completa do dossiê biográfico do cidadão.' },
  { id: 'aud-104', timestamp: new Date(Date.now() - 50 * 60000).toLocaleTimeString(), action: 'REAUTENTICACAO', resource: 'AUTH_CRITICAL', targetId: 'Sessão #8812', ipAddress: '10.220.14.89', status: 'REAUTENTICADO', details: 'Validação de PIN de operador de 6 dígitos.' }
];
