// ============================================================================
// SILA GovOS — 07_DECISAO_FINAL: MODELO CANÓNICO DE DADOS & ESTADOS VINCULATIVOS
// ============================================================================

import { ValidationRiskLevel } from './validations';

/**
 * Estados Canónicos da Decisão Final (Submódulo 07):
 * PENDING_DECISION | DECISION_ANALYSIS | PENDING_SUPERVISOR | APPROVED | SUSPENDED | REJECTED | EMISSION_AUTHORIZED | CLOSED
 */
export type FinalDecisionState =
  | 'PENDING_DECISION'
  | 'DECISION_ANALYSIS'
  | 'PENDING_SUPERVISOR'
  | 'APPROVED'
  | 'SUSPENDED'
  | 'REJECTED'
  | 'EMISSION_AUTHORIZED'
  | 'CLOSED';

/**
 * Decisões Formais Canónicas:
 * APPROVE | SUSPEND | REJECT
 */
export type FinalDecisionAction = 'APPROVE' | 'SUSPEND' | 'REJECT';

/**
 * Alçadas e Níveis Institucionais:
 * N1_OPERATOR | N2_VALIDATOR | N3_SUPERVISOR | DIRECTOR_SOVEREIGN
 */
export type FinalDecisionAuthorityLevel =
  | 'N1_OPERATOR'
  | 'N2_VALIDATOR'
  | 'N3_SUPERVISOR'
  | 'DIRECTOR_SOVEREIGN';

/**
 * Categorias de Impedimentos Bloqueantes:
 */
export type ImpedimentCategory =
  | 'SUPERVISOR_REVIEW'
  | 'REQUIRES_SUPERVISOR'
  | 'CRITICAL_EXCEPTION_UNRESOLVED'
  | 'UNRESOLVED_COLLISION'
  | 'PENDING_CRITICAL_DOCS'
  | 'PENDING_CRITICAL_COMPLIANCE'
  | 'INCONCLUSIVE_BIOMETRICS';

export interface FinalDecisionImpediment {
  category: ImpedimentCategory;
  sourceModule: '02_BIOGRAFICA' | '03_BIOMETRICA' | '04_UNICIDADE' | '05_DOCUMENTAL' | '06_COMPLIANCE';
  description: string;
  isBlocking: boolean;
  requiresSupervisor: boolean;
}

export interface ModuleReferences02To06 {
  module02_BiographicalRef: {
    status: 'PASS' | 'FLAGGED' | 'INCONSISTENT';
    matchedFields: number;
    mismatchedFields: number;
    recordRef: string;
  };
  module03_BiometricRef: {
    status: 'VERIFIED_MATCH' | 'UNDER_THRESHOLD' | 'INCONCLUSIVE';
    facialScore: number;
    fingerprintScore: number;
    matchRef: string;
  };
  module04_UniquenessRef: {
    status: 'UNIQUE_CONFIRMED' | 'HOMONYM_JUSTIFIED' | 'COLLISION_BLOCKED';
    candidateCount: number;
    collisionRef: string;
  };
  module05_DocumentalRef: {
    status: 'AUTHENTIC' | 'DOCUMENT_EXCEPTION' | 'SOURCE_UNAVAILABLE' | 'SUSPECT';
    ocrConfidence: number;
    docVerificationRef: string;
  };
  module06_ComplianceRef: {
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'SUPERVISOR_REVIEW';
    rulesPassed: number;
    rulesViolated: number;
    complianceRef: string;
  };
}

/**
 * Estrutura Canónica Obrigatória do FinalDecision
 */
export interface FinalDecision {
  decisionId: string;
  dossierId: string;
  processId: string;
  citizenId: string;
  
  // Referências aos submódulos especializados 02-06
  moduleRefs: ModuleReferences02To06;
  
  // Decisão e Motivação Obrigatória
  state: FinalDecisionState;
  decision: FinalDecisionAction;
  decisionReason: string;
  decisionAuthority: string; // Ex: Gabinete de Identificação Civil / DNI
  decisionLevel: FinalDecisionAuthorityLevel;
  
  // Autoria, Alçada e Carimbo Temporal
  decidedBy: {
    operatorId: string;
    operatorName: string;
    role: FinalDecisionAuthorityLevel;
    terminalId: string;
    organization: string;
  };
  decidedAt: string;
  
  // Verificações de Segurança Obrigatórias em Decisões Críticas
  securityValidations: {
    authenticationVerified: boolean;
    rbacVerified: boolean;
    abacVerified: boolean;
    reauthenticationPerformed: boolean;
    signatureVerified: boolean;
    legalGroundsVerified: boolean;
    legalArticleCode: string;
  };
  
  // Separação Estrita de Emissão
  emissionAuthorizationRef?: string;
  emissionAuthorizedAt?: string;
  emissionAuthorizedBy?: string;
  
  // Cadeia Criptográfica SILA Chain (Imutabilidade Append-Only)
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
}

/**
 * Evento Canónico de Auditoria Decisória Encadeada
 */
export interface FinalDecisionAuditEvent {
  eventId: string;
  decisionId: string;
  dossierId: string;
  operatorId: string;
  operatorName: string;
  operatorAlcada: FinalDecisionAuthorityLevel;
  decisionAction: FinalDecisionAction | 'SUBMIT_FOR_SUPERVISION' | 'AUTHORIZE_EMISSION' | 'CORRECTION_ENCADEADA';
  decisionFundamento: string;
  legalArticleCode: string;
  timestamp: string;
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
  reauthSessionId: string;
  terminalId: string;
}
