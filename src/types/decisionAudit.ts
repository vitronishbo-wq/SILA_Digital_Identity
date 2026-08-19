/**
 * CONTRATO CANÓNICO DO SUBMÓDULO 10 — AUDITORIA DA DECISÃO & TRILHA CRIPTOGRÁFICA
 * 
 * Regra Soberana SILA GovOS:
 * Consome eventos, estados e evidências dos Módulos 01 a 09.
 * Produz exclusivamente DecisionAudit e pareceres de integridade.
 * NÃO modifica decisões (07), exceções (08) ou revisões (09).
 * Append-Only, imutável e à prova de adulteração.
 */

export type AuditStatus =
  | 'PENDING_AUDIT'
  | 'COLLECTING_EVENTS'
  | 'VERIFYING_CHAIN'
  | 'VERIFYING_EVIDENCE'
  | 'VERIFYING_AUTHORITY'
  | 'ANALYZING_ANOMALIES'
  | 'AUDIT_OPINION_READY'
  | 'CLOSED'
  // Exceções de Auditoria
  | 'AUDIT_INCONCLUSIVE'
  | 'CHAIN_BROKEN'
  | 'CRITICAL_ANOMALY'
  | 'SUPERVISOR_REVIEW';

export type ChainVerificationResult =
  | 'VALID'
  | 'INVALID'
  | 'INCOMPLETE'
  | 'INCONCLUSIVE';

export type AnomalySeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type AuditOpinionType =
  | 'INTEGRITY_CONFIRMED'
  | 'INTEGRITY_WITH_WARNINGS'
  | 'INTEGRITY_EXCEPTION'
  | 'CHAIN_BROKEN'
  | 'AUDIT_INCONCLUSIVE';

export type AuditorRole =
  | 'CHIEF_AUDITOR'
  | 'SECURITY_AUDITOR'
  | 'INSPECTOR_GENERAL'
  | 'SYSTEM_VERIFIER';

export interface AuditTimelineEvent {
  eventId: string;
  sourceModule: string;
  operatorId: string;
  operatorName: string;
  operatorRole: string;
  terminalId: string;
  timestamp: string;
  previousState: string;
  newState: string;
  command: string;
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  payloadSummary: string;
  isHashValid: boolean;
  isSignatureValid: boolean;
  isAuthorityCompliant: boolean;
}

export interface AuditStateTransition {
  transitionId: string;
  fromState: string;
  toState: string;
  command: string;
  operatorId: string;
  operatorRole: string;
  timestamp: string;
  isLegalTransition: boolean;
  notes?: string;
}

export interface AuditEvidenceCheck {
  evidenceId: string;
  evidenceType: string;
  sourceModule: string;
  hashSHA256: string;
  linkedProcessId: string;
  linkedEventId: string;
  timestamp: string;
  isExists: boolean;
  isHashMatched: boolean;
  isTemporalOrderValid: boolean;
}

export interface AuditAuthorityCheck {
  operatorId: string;
  operatorRole: string;
  jurisdictionProvince: string;
  jurisdictionMunicipality: string;
  commandExecuted: string;
  targetState: string;
  status: 'AUTHORIZED' | 'UNAUTHORIZED' | 'INCONCLUSIVE';
  justification: string;
}

export interface AuditAnomaly {
  anomalyId: string;
  code: string;
  severity: AnomalySeverity;
  title: string;
  description: string;
  detectedInModule: string;
  affectedEventId?: string;
  timestamp: string;
  impactAssessment: string;
}

export interface DecisionAudit {
  auditId: string;
  dossierId: string;
  processId: string;
  decisionId: string;
  citizenId: string;
  citizenName: string;
  auditedModules: string[];
  auditStatus: AuditStatus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  timeline: AuditTimelineEvent[];
  stateChain: AuditStateTransition[];
  
  chainVerification: {
    result: ChainVerificationResult;
    totalEvents: number;
    validHashesCount: number;
    brokenLinksCount: number;
    details: string;
  };
  
  cryptographicVerification: {
    algorithm: 'ED25519-SHA512-GOV' | 'ECDSA-SECP256K1';
    signaturesVerified: number;
    signaturesInvalid: number;
    merkleRootHash: string;
    isMerkleProofValid: boolean;
  };
  
  evidenceIntegrity: {
    totalChecked: number;
    passed: number;
    failed: number;
    items: AuditEvidenceCheck[];
  };
  
  authorityMatrix: {
    totalEvaluations: number;
    compliantCount: number;
    violationsCount: number;
    evaluations: AuditAuthorityCheck[];
  };
  
  anomalies: AuditAnomaly[];
  
  auditOpinion?: {
    opinionType: AuditOpinionType;
    conclusion: string;
    recommendation: string;
    legalArticleBasis: string;
    auditedBy: {
      auditorId: string;
      auditorName: string;
      role: AuditorRole;
      terminalId: string;
    };
    auditedAt: string;
  };
  
  createdAt: string;
  updatedAt: string;
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
}

export type AuditCommand =
  | 'START_AUDIT'
  | 'COLLECT_EVENTS'
  | 'VERIFY_CHAIN_INTEGRITY'
  | 'VERIFY_EVIDENCES'
  | 'VERIFY_AUTHORITY_MATRIX'
  | 'DETECT_ANOMALIES'
  | 'ISSUE_AUDIT_OPINION'
  | 'CLOSE_AUDIT';

export interface MetaAuditEvent {
  eventId: string;
  timestamp: string;
  auditId: string;
  dossierId: string;
  auditorId: string;
  auditorName: string;
  role: AuditorRole;
  terminalId: string;
  command: AuditCommand;
  previousState: AuditStatus;
  newState: AuditStatus;
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
  payloadSummary: string;
}
