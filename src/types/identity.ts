export type DocumentType = 'BI' | 'REGISTO_CIVIL' | 'NIF';

export type DocumentStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING_RENEWAL' | 'SUSPENDED';

export interface CitizenDocument {
  id: string;
  type: DocumentType;
  title: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  status: DocumentStatus;
  hashSignature: string;
  qrPayload: string;
  metadata?: Record<string, string>;
}

export interface Citizen {
  id: string;
  biNumber: string;
  fullName: string;
  preferredName: string;
  photoUrl: string;
  birthDate: string;
  nationality: string;
  gender: 'M' | 'F' | 'X';
  address: string;
  provincia?: string;
  municipio?: string;
  naturalidade?: string;
  filiacaoPai?: string;
  filiacaoMae?: string;
  status: 'VERIFIED' | 'PENDING' | 'REVOKED';
  biometricHash: string;
  lastVerifiedAt: string;
  processCount?: number;
  validationCount?: number;
  auditEventsCount?: number;
  documents: CitizenDocument[];
}

export interface VerificationLog {
  id: string;
  citizenId: string;
  citizenName: string;
  biNumber: string;
  timestamp: string;
  verifierName: string;
  verifierType: 'POLICE' | 'AIRPORT' | 'BANK' | 'PUBLIC_PORTAL' | 'GOV_API';
  status: 'VERIFIED' | 'FAILED' | 'PENDING' | 'FLAGGED';
  location: string;
  responseTimeMs: number;
}

export interface AdminKPIData {
  verificationsCount: number;
  verificationsGrowthPercent: number;
  renewalsPending: number;
  renewalsGrowthPercent: number;
  securityAlerts: number;
  systemLatencyMs: number;
  systemStatus: 'Optimal' | 'Degraded' | 'Maintenance';
}

export interface ChartDataPoint {
  time: string;
  volume: number;
  verified: number;
  pending: number;
}

export type PortalMode = 'CITIZEN_PWA' | 'ADMIN_PORTAL' | 'PUBLIC_VERIFIER';
export type CitizenNavTab = 'HOME' | 'WALLET' | 'SCANNER' | 'PROFILE';
export type AdminNavTab = 
  | 'INICIO' 
  | 'PROCESSOS' 
  | 'CIDAOES' 
  | 'IDENTIDADE' 
  | 'BI' 
  | 'TERRITORIOS'
  | 'AGENDAMENTOS' 
  | 'ATENDIMENTO' 
  | 'VALIDACOES' 
  | 'EMISSAO' 
  | 'AUDITORIA' 
  | 'RELATORIOS' 
  | 'CONFIGURACOES';
