/**
 * CONTRATO CANÓNICO DO SUBMÓDULO 09 — MESA DE REVISÃO SUPERVISORA (NÍVEL N3 / DIRECÇÃO)
 * 
 * Regra Soberana SILA GovOS:
 * 02–08 produzem evidências, scores e exceções.
 * 09 produz PARECER TÉCNICO SUPERVISÓRIO / ARBITRAGEM.
 * 07 continua sendo a única autoridade para decisão institucional vinculativa (FinalDecision).
 */

export type SupervisoryReviewStatus =
  | 'PENDING_REVIEW'
  | 'ASSIGNED'
  | 'UNDER_SUPERVISORY_ANALYSIS'
  | 'REQUEST_ADDITIONAL_INFORMATION'
  | 'TECHNICAL_OPINION_READY'
  | 'HOMOLOGATED'
  | 'RETURNED_FOR_CORRECTION'
  | 'CLOSED';

export type SupervisoryEscalationLevel =
  | 'ESCALATED_N2'
  | 'ESCALATED_N3';

export type SupervisoryDespachoType =
  | 'FAVORABLE_OPINION'
  | 'UNFAVORABLE_OPINION'
  | 'ADDITIONAL_INFORMATION_REQUIRED'
  | 'RETURN_FOR_CORRECTION'
  | 'SUPERVISORY_HOMOLOGATION';

export type SupervisoryOperatorRole =
  | 'N1_OPERATOR'     // Consulta preliminar
  | 'N2_VALIDATOR'    // Revisão técnica e emissão de parecer inicial
  | 'N3_SUPERVISOR'   // Homologação, arbitragem soberana e supervisão
  | 'DIRECTOR_SILA';  // Homologação extraordinária de cúpula

export interface SupervisoryPreviousOpinion {
  opinionId: string;
  issuedByOperatorId: string;
  issuedByOperatorName: string;
  role: SupervisoryOperatorRole;
  timestamp: string;
  opinionSummary: string;
  recommendation: 'FAVORABLE' | 'UNFAVORABLE' | 'DILIGENCE_REQUIRED';
}

export interface SupervisoryReview {
  reviewId: string;
  dossierId: string;
  processId: string;
  citizenId: string;
  citizenName: string;
  exceptionId?: string;
  originatingModule: '02_BIOGRAFICA' | '03_BIOMETRICA' | '04_UNICIDADE' | '05_DOCUMENTAL' | '06_COMPLIANCE' | '07_DECISAO' | '08_EXCECOES';
  escalationLevel: SupervisoryEscalationLevel;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reviewReason: string;
  reviewStatus: SupervisoryReviewStatus;
  
  // SLA Operacional
  slaRemainingHours: number;
  slaLimitHours: number;
  slaStatus: 'NORMAL' | 'WARNING' | 'EXPIRED';
  openedAt: string;
  deadlineDate: string;

  // Jurisdição e ABAC
  jurisdictionProvince: string;
  jurisdictionMunicipality: string;

  // Acervo Probatório Referenciado
  evidencesSummary: string[];
  previousOpinions: SupervisoryPreviousOpinion[];

  // Atribuição e Parecer Técnico
  assignedSupervisor?: {
    operatorId: string;
    operatorName: string;
    role: SupervisoryOperatorRole;
    assignedAt: string;
  };
  
  // Despacho / Parecer do Supervisor
  supervisoryDespacho?: {
    despachoType: SupervisoryDespachoType;
    technicalGrounds: string;
    recommendation: string;
    legalArticleBasis: string;
    reviewedBy: {
      operatorId: string;
      operatorName: string;
      role: SupervisoryOperatorRole;
      terminalId: string;
    };
    reviewedAt: string;
  };

  // Trilha de Auditoria Criptográfica SILA Chain (Imutável)
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
}

export type SupervisoryCommand =
  | 'OPEN_REVIEW'
  | 'ASSIGN_SUPERVISOR'
  | 'REQUEST_MORE_INFO'
  | 'SUBMIT_TECHNICAL_OPINION'
  | 'HOMOLOGATE_SUPERVISION'
  | 'RETURN_TO_SANEAMENTO'
  | 'CLOSE_REVIEW';

export interface SupervisoryAuditEvent {
  eventId: string;
  reviewId: string;
  dossierId: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  role: SupervisoryOperatorRole;
  terminalId: string;
  command: SupervisoryCommand;
  previousState: SupervisoryReviewStatus;
  newState: SupervisoryReviewStatus;
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
  payloadSummary: string;
}
