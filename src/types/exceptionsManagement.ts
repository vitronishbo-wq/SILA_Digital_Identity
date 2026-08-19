// ============================================================================
// SILA GovOS — 08_EXCECOES_DISCREP: CONTRATOS CANÓNICOS & SANEAMENTO PROCESSUAL
// ============================================================================

import { ValidationRiskLevel, ValidationPriority } from './validations';

/**
 * 01. Tipos & Entidades Canónicas do Módulo 08
 */
export type ExceptionCategory =
  | 'DOCUMENTAL'               // 05: OCR divergente, certidão ilegível, fonte indisponível
  | 'BIOGRAFICA'               // 02: Divergência de filiação, grafia ou data de nascimento
  | 'BIOMETRICA'               // 03: Membro amputado comprovado, índice ICAO/NFIQ2 justificado
  | 'DUPLICIDADE'              // 04: Homonímia perfeita, confronto civil exigido
  | 'REGULATORIA'              // 06: Compliance territorial, procuração, tutela legal
  | 'TECNICA'                  // Falha transitória de conectividade de captura
  | 'DECISORIA';               // 07: Suspensão ou exigência da mesa de despacho

/**
 * 02. Máquina de Estados Fechada
 * OPEN -> ASSIGNED -> UNDER_REVIEW -> SANEAMENTO_REQUESTED -> RESOLVED -> CLOSED
 *                                 └──► ESCALATED_SUPERVISOR_N3
 */
export type ExceptionState =
  | 'OPEN'
  | 'ASSIGNED'
  | 'UNDER_REVIEW'
  | 'SANEAMENTO_REQUESTED'
  | 'ESCALATED_SUPERVISOR_N3'
  | 'RESOLVED'
  | 'CLOSED';

/**
 * Comandos Canónicos de Transição de Estado e Operações
 */
export type ExceptionCommand =
  | 'OPEN'
  | 'ASSIGN'
  | 'REASSIGN'
  | 'OPEN_REVIEW'
  | 'REQUEST_SANEAMENTO'
  | 'ATTACH_EVIDENCE'
  | 'ESCALATE_TO_SUPERVISOR'
  | 'RESOLVE'
  | 'CLOSE'
  | 'AUDIT';

/**
 * Níveis de Alçada Operacional RBAC / ABAC
 */
export type ExceptionOperatorLevel =
  | 'N1_OPERATOR'     // Triagem, Anexação preliminar (Sem alçada decisória)
  | 'N2_VALIDATOR'    // Análise, Saneamento, Resolução de gravidade LOW e MEDIUM
  | 'N3_SUPERVISOR'   // Mesa Supervisora, Resolução de gravidade HIGH e CRITICAL
  | 'DIRECTOR_SILA';  // Alçada Superior Governamental

/**
 * Resoluções Canónicas Fundamentadas
 */
export type ExceptionResolutionType =
  | 'DOCUMENTO_RETIFICATIVO_ANEXADO'  // Certidão retificada oficial anexada
  | 'DISPENSA_LEGAL_COMPROVADA'       // Laudo médico oficial de amputação / dispensa ICAO
  | 'HOMONIMIA_FORMALMENTE_JUSTIFIC'  // Árvore genealógica e assentos comprovam distinção
  | 'DESPACHO_CONSERVADOR_APROVADO'   // Despacho ou parecer de autoridade notarial competente
  | 'SANEAMENTO_REJEITADO_INDEFER';   // Saneamento não comprovado (mantém bloqueio)

/**
 * Evidência / Contraprova Documental Vinculada (ExceptionEvidenceDocument)
 */
export interface ExceptionEvidenceDocument {
  evidenceId: string;
  exceptionId: string;
  dossierId: string;
  documentType:
    | 'CERTIDAO_NARRATIVA_COMPLETA'
    | 'LAUDO_MEDICO_PERICIAL'
    | 'SENTENCA_JUDICIAL_TUTELA'
    | 'DESPACHO_MINISTERIAL_NOTARIAL'
    | 'DOCUMENTO_EQUIVALENTE_OFICIAL';
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  fileHashSha256: string;
  verifiedByOcr: boolean;
  documentSummary: string;
  attachedByOperatorId: string;
  attachedByOperatorName: string;
  attachedAt: string;
}

/**
 * Entidade Canónica Principal: ValidationExceptionRecord
 */
export interface ValidationExceptionRecord {
  exceptionId: string;
  dossierId: string;
  processId: string;
  citizenId: string;
  citizenName: string;
  
  // Origens Canónicas Estritas (Exclusivamente 02 a 07)
  originatingModule:
    | '02_BIOGRAFICA'
    | '03_BIOMETRICA'
    | '04_UNICIDADE'
    | '05_DOCUMENTAL'
    | '06_COMPLIANCE'
    | '07_DECISAO';
  category: ExceptionCategory;
  severity: ValidationRiskLevel; // LOW | MEDIUM | HIGH | CRITICAL
  priority: ValidationPriority;   // URGENT | HIGH | NORMAL | LOW
  
  title: string;
  description: string;
  technicalDetails?: string;
  
  // SLA Operacional e Estados
  state: ExceptionState;
  openedAt: string;
  deadlineSla: string; // Timestamp ISO com limite operacional
  slaRemainingHours: number;
  slaStatus: 'ON_TRACK' | 'WARNING' | 'EXPIRED';
  
  // RBAC/ABAC: Atribuição e Jurisdição
  jurisdictionProvince: string;
  jurisdictionMunicipality: string;
  assignedTo?: {
    operatorId: string;
    operatorName: string;
    role: ExceptionOperatorLevel;
    assignedAt: string;
  };
  requiresSupervisorEscalation: boolean;
  
  // Saneamento & Resolução Vinculativa
  saneamentoNotice?: {
    noticeId: string;
    requestedAt: string;
    requestedByOperatorName: string;
    instructions: string;
    deadlineDate: string;
    status: 'ACTIVE' | 'FULFILLED' | 'EXPIRED';
  };
  
  resolution?: {
    resolutionType: ExceptionResolutionType;
    justificationText: string;
    legalArticleBasis: string;
    resolvedByOperatorId: string;
    resolvedByOperatorName: string;
    resolvedByRole: ExceptionOperatorLevel;
    resolvedAt: string;
  };
  
  // Evidências Vinculadas
  evidencesAttached: ExceptionEvidenceDocument[];
  
  // Custódia e Auditoria Criptográfica SILA Chain (Append-Only)
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
}

/**
 * Evento de Auditoria Estruturado e Append-Only
 */
export interface ExceptionAuditEvent {
  eventId: string;
  exceptionId: string;
  dossierId: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  role: ExceptionOperatorLevel;
  terminalId: string;
  command: ExceptionCommand;
  previousState: ExceptionState;
  newState: ExceptionState;
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
  payloadSummary: string;
}
