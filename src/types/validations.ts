// ============================================================================
// SILA GovOS — MÓDULO 10: VALIDAÇÕES & DECISÃO INSTITUCIONAL
// Arquitetura Congelada: Orquestrador Soberano de Conformidade e Decisão
// ============================================================================

/**
 * 1. FRONTEIRAS ARQUITETURAIS RÍGIDAS
 * ----------------------------------------------------------------------------
 * O Módulo 10 é a camada central de verificação, conformidade e decisão do processo.
 * Cadeia de Valor Institucional:
 * 09 COMPLETED ──► 10 ValidationDossier ──► 01 FILA_VALIDACAO ──► 02–06 MOTORES 
 *   ──► 07 DECISAO_FINAL ──► 08 EXCEÇÕES ──► 09 REVISÃO SUPERVISORA ──► 10 AUDITORIA ──► 11 EMISSÃO
 *
 * PROIBIÇÕES RÍGIDAS (ISOLAMENTO DE DOMÍNIO):
 * ❌ NÃO cria cidadão (Módulo 04)
 * ❌ NÃO altera assentos no Registo Civil (Módulo 04/05/06)
 * ❌ NÃO cria identidade de raiz (Módulo 05)
 * ❌ NÃO recolhe dados biométricos em balcão (Módulo 09)
 * ❌ NÃO cria nem altera agendamentos ou capacidade (Módulo 08)
 * ❌ NÃO cria nem altera postos ou jurisdições (Módulo 01/07)
 * ❌ NÃO emite fisicamente cartões de BI ou credenciais finais (Módulo 11)
 * ❌ NÃO executa matching biométrico proprietário no cliente (usa Gateway ABIS)
 * ----------------------------------------------------------------------------
 */

export type ProcessType = 'PRIMEIRA_EMISSAO' | 'RENOVACAO' | 'SEGUNDA_VIA' | 'ATUALIZACAO_DADOS';

// 25. Nomenclatura Padronizada Obrigatória
export type ValidationRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ValidationPriority = 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL';

// Compatibilidade de tipo
export type RiskLevel = ValidationRiskLevel;
export type PriorityLevel = ValidationPriority;

/**
 * 2. MÁQUINA DE ESTADOS DA VALIDAÇÃO (CORRIGIDA & CONGELADA)
 * 
 * QUEUED ──► AUTO_PROCESSING ──► UNDER_ANALYSIS ──► APPROVED ──► EMISSION_AUTHORIZED (──► 11)
 *                  │                   │
 *                  ▼                   ├──► PENDING_DOCS ──► DOCUMENTS_RECEIVED ──► AUTO_PROCESSING / UNDER_ANALYSIS
 *             [AUTO_REJECT]            │
 *                                      ├──► SUPERVISOR_REVIEW ──┬──► APPROVED ──► EMISSION_AUTHORIZED
 *                                      │                        └──► REJECTED ──► CLOSED
 *                                      └──► REJECTED ──► CLOSED
 */
export type ValidationStatus =
  | 'QUEUED'                // 01 — Na Fila Central de Validação
  | 'AUTO_PROCESSING'       // Processamento assíncrono dos motores especializados
  | 'UNDER_ANALYSIS'        // Em análise ativa por técnico validador (N1/N2)
  | 'PENDING_DOCS'          // Exceção: Documentação suplementar ou saneamento exigido
  | 'DOCUMENTS_RECEIVED'    // Documentação recebida, pronto para reanálise/auto-processamento
  | 'SUPERVISOR_REVIEW'     // 09 — Escalado para análise e mesa de decisão supervisora (N3)
  | 'APPROVED'              // Veredito institucional positivo concedido
  | 'EMISSION_AUTHORIZED'   // Despachado formalmente para o Módulo 11 (EMISSÃO)
  | 'REJECTED'              // Veredito institucional indeferido
  | 'CLOSED'                // Processo encerrado após rejeição formal ou anulação
  | 'CANCELLED';            // Anulado por motivo processual/jurisdicional

/**
 * SLA Operacional Calculado
 */
export type SlaStatus = 'ON_TIME' | 'NEAR_DEADLINE' | 'OVERDUE';

export interface ValidationSlaInfo {
  slaStartedAt: string;
  slaDeadline: string;
  slaRemainingMinutes: number;
  slaStatus: SlaStatus;
}

/**
 * 3. MOTORES ESPECIALIZADOS ORQUESTRADOS
 */

// 02 — Validação Biográfica (Registo Civil) — Contrato Formal
export type BiographicalValidationEngineStatus = 
  | 'NOT_STARTED'
  | 'AUTO_COMPARISON'
  | 'MATCH'
  | 'PARTIAL_MATCH'
  | 'MISMATCH'
  | 'PENDING_REVIEW'
  | 'SUPERVISOR_REVIEW'
  | 'RESOLVED';

export type BiographicalResult = 'MATCH' | 'PARTIAL_MATCH' | 'MISMATCH' | 'INCONCLUSIVE';

export type FieldMatchStatus = 
  | 'MATCH' 
  | 'MISMATCH' 
  | 'MISSING_SOURCE' 
  | 'MISSING_OFFICIAL' 
  | 'NOT_APPLICABLE';

export type DivergenceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface BiographicalFieldComparison {
  fieldCode: string;
  fieldName: string;
  sourceValue: string;
  officialValue: string;
  matchStatus: FieldMatchStatus;
  severity: DivergenceSeverity;
  notes?: string;
  isResolved?: boolean;
  resolutionJustification?: string;
  resolutionEvidence?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface BiographicalValidation {
  validationId: string;
  dossierId: string;
  processId: string;
  citizenId: string;
  nationalIdNumber?: string;
  engineCode: 'CIVIL_CORE_GATEWAY_V2';
  status: BiographicalValidationEngineStatus;
  result: BiographicalResult;
  confidence: number;                  // 0-100%
  matchedFields: number;
  mismatchedFields: number;
  missingFields: number;
  sourceRecordRef: string;             // ex: "RC_ASSENTO_LIVRO_2026_0912"
  sourceVersion: string;               // ex: "MINJUSDH_RC_CORE_v2.4"
  validatedBy: string;
  validatedAt: string;
  exceptions: ValidationException[];
  fieldComparisons: BiographicalFieldComparison[];
  civilRecordMatched?: boolean;
  civilRecordNumber?: string;
  birthEntryVerified?: boolean;
  parentageVerified?: boolean;
  maritalStatusVerified?: boolean;
  deceasedFlag?: boolean;
  discrepancies?: string[];
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
}

// Alias para compatibilidade estrutural
export type BiographicalValidationResult = BiographicalValidation;

// 03 — Validação Biométrica (ABIS / AFIS Nacional) — Contrato Formal
export type BiometricEngineStatus = 
  | 'NOT_STARTED'
  | 'QUALITY_CHECK'
  | 'BIOMETRIC_COMPARISON'
  | 'DUPLICATE_SEARCH'
  | 'RESULT_READY'
  | 'QUALITY_FAILED'
  | 'MATCH_PENDING'
  | 'EXCEPTION_REVIEW'
  | 'SUPERVISOR_REVIEW'
  | 'RESOLVED'
  | 'CONFIRMED_RESULT';

export type QualityResult = 'PASS' | 'FAIL' | 'NOT_AVAILABLE' | 'EXCEPTION';
export type BiometricMatchResult = 'MATCH' | 'NON_MATCH' | 'INCONCLUSIVE' | 'NOT_EXECUTED';
export type DuplicateSearchResult = 'NO_CANDIDATE' | 'CANDIDATE_FOUND' | 'MULTIPLE_CANDIDATES' | 'INCONCLUSIVE' | 'NOT_EXECUTED';
export type BiometricReviewStatus = 'PENDING' | 'IN_REVIEW' | 'SUPERVISOR_REQUIRED' | 'RESOLVED' | 'CONFIRMED';
export type ConsolidatedBiometricResult = 'BIOMETRICALLY_CONFORMANT' | 'BIOMETRICALLY_NON_CONFORMANT' | 'INCONCLUSIVE' | 'REQUIRES_SUPERVISOR';

export type BiometricExceptionCode = 
  | 'LOW_QUALITY'
  | 'MISSING_FINGER'
  | 'DAMAGED_FINGER'
  | 'UNREADABLE_FINGER'
  | 'FACIAL_CAPTURE_FAILED'
  | 'TEMPORARY_CAPTURE_FAILURE'
  | 'EQUIPMENT_FAILURE'
  | 'MEDICAL_EXCEPTION'
  | 'OTHER_AUTHORIZED_EXCEPTION';

export interface BiometricExceptionRecord {
  exceptionId: string;
  code: BiometricExceptionCode;
  affectedFinger?: BiometricElementCode;
  description: string;
  evidence: string;
  operatorId: string;
  operatorName?: string;
  timestamp: string;
  justification: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requiresSupervisor: boolean;
  medicalDocRef?: string;
  supervisorNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type BiometricElementCode = 
  | 'FOTO' 
  | 'DEDO_POLEGAR_DIR' 
  | 'DEDO_INDICADOR_DIR' 
  | 'DEDO_MEDIO_DIR' 
  | 'DEDO_ANELAR_DIR' 
  | 'DEDO_MINIMO_DIR' 
  | 'DEDO_POLEGAR_ESQ' 
  | 'DEDO_INDICADOR_ESQ' 
  | 'DEDO_MEDIO_ESQ' 
  | 'DEDO_ANELAR_ESQ' 
  | 'DEDO_MINIMO_ESQ' 
  | 'ASSINATURA';

export interface CaptureQualityItem {
  element: BiometricElementCode;
  label: string;
  captured: boolean;
  score: number;                         // 0-100 (ou NFIQ2 convertido 0-100)
  threshold: number;                     // Limiar definido pelo Perfil Institucional
  status: QualityResult;
  exceptionCode?: BiometricExceptionCode;
  notes?: string;
}

export interface FacialComparisonDetail {
  referenceUsed: string;                 // ex: "REC_FOTO_ICAO_2026_09"
  engineName: string;                    // ex: "AFIS_CORE_FACE_v4.8"
  score: number;                         // 0-100 (ex: 96.4)
  institutionalThreshold: number;        // ex: 85.0
  result: BiometricMatchResult;
  engineVersion: string;                 // ex: "v4.8.2_BUILD_2026"
  livenessScore?: number;                // 0-100
  evaluatedAt: string;
}

export interface FingerprintComparisonDetail {
  fingersCompared: string[];             // ex: ["INDICADOR_DIR", "POLEGAR_DIR", "INDICADOR_ESQ"]
  minutiaeCount: number;                 // ex: 68
  averageQuality: number;                // NFIQ2 médio (ex: 88)
  score: number;                         // 0-100 (ex: 94.2)
  institutionalThreshold: number;        // ex: 80.0
  result: BiometricMatchResult;
  engineName: string;                    // ex: "ABIS_MINUTIAE_MATCHER_v3.2"
  engineVersion: string;                 // ex: "v3.2.1"
  evaluatedAt: string;
}

export interface AbisCandidate {
  candidateId: string;
  citizenName: string;
  nationalIdNumber?: string;
  matchScore: number;
  matchType: 'FACIAL' | 'FINGERPRINT' | 'MULTIMODAL';
  status: 'SUSPECT_DUPLICATE' | 'SUPERVISOR_REVIEW' | 'CLEARED';
  notes?: string;
}

export interface DuplicateSearchDetail {
  engineName: string;                    // ex: "ABIS_NATIONAL_SEARCH_v5"
  engineVersion: string;                 // ex: "v5.1"
  result: DuplicateSearchResult;
  candidatesCount: number;
  candidates: AbisCandidate[];
  searchTimestamp: string;
  statusNotes?: string;
}

export interface BiometricCaptureProfile {
  profileId: string;                     // ex: "PROFILE_NACIONAL_DNI_2026"
  profileVersion: string;                // ex: "v2026.1"
  minFacialQuality: number;              // 80
  minFingerprintQuality: number;         // 70 (NFIQ2 >= 70)
  minFingersCount: number;               // 4
  mandatoryFingers: string[];            // ["INDICADOR_DIR", "INDICADOR_ESQ", "POLEGAR_DIR", "POLEGAR_ESQ"]
  requirePhoto: boolean;                 // true
  requireFingerprints: boolean;          // true
  requireSignature: boolean;             // true
  homologatingAuthority: string;         // "Direção Nacional de Identificação Civil (DNIC)"
  effectiveDate: string;                 // "2026-01-01"
}

export interface BiometricValidation {
  validationId: string;
  dossierId: string;
  processId: string;
  citizenId: string;
  attendanceSessionId: string;
  territoryVersion: string;
  servicePointId: string;
  captureProfileId: string;
  captureProfileVersion: string;
  status: BiometricEngineStatus;
  qualityResult: QualityResult;
  facialMatchResult: BiometricMatchResult;
  fingerprintMatchResult: BiometricMatchResult;
  duplicateSearchResult: DuplicateSearchResult;
  consolidatedResult: ConsolidatedBiometricResult;
  exceptions: BiometricExceptionRecord[];
  reviewStatus: BiometricReviewStatus;
  confidenceIndicator: number;           // 0-100 (Indicador técnico, não decisório)
  validatedAt: string;
  validatorId: string;
  validatorName?: string;
  
  // Detalhes dos motores especializados
  captureProfile: BiometricCaptureProfile;
  qualityMatrix: CaptureQualityItem[];
  facialComparison: FacialComparisonDetail;
  fingerprintComparison: FingerprintComparisonDetail;
  duplicateSearch: DuplicateSearchDetail;

  // Campos de compatibilidade para integrações existentes
  engineCode?: 'ABIS_NATIONAL_GATEWAY';
  faceMatchScore?: number;
  fingerprintsMatchScore?: number;
  minutiaeCount?: number;
  liveDetectionPassed?: boolean;
  duplicateBiometricRef?: string;
  evaluatedAt?: string;
  notes?: string;
  
  // Hashes & Auditoria Imutável
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
}

// Alias para compatibilidade estrutural
export type BiometricValidationResult = BiometricValidation;
export type QualityCheckItem = CaptureQualityItem;
export type FacialComparisonResult = FacialComparisonDetail;
export type FingerprintComparisonResult = FingerprintComparisonDetail;
export type DuplicateSearchExecution = DuplicateSearchDetail;
export type BiometricDuplicateCandidate = AbisCandidate;

// 04 — Unicidade / Duplicidade (Antifraude Governamental)
// REGRAS CRÍTICAS INSTITUCIONAIS:
// 1. DUPLICATE_CANDIDATE ≠ FRAUD
// 2. HOMONYM ≠ DUPLICATE
// 3. N1 NUNCA CLASSIFICA SUSPEITA COMO FRAUDE NEM REJEITA DEFINITIVAMENTE

export type UniquenessEngineStatus = 
  | 'PENDING_ANALYSIS'
  | 'SEARCHING'
  | 'CANDIDATES_FOUND'
  | 'NO_MATCH'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'SUPERVISOR_REVIEW'
  | 'INSUFFICIENT_DATA'
  | 'SEARCH_FAILED'
  | 'UNIQUE'
  | 'SUSPECT_DUPLICATE'
  | 'CONFIRMED_FRAUD';

export type UniquenessResultType = 
  | 'NO_MATCH'
  | 'POSSIBLE_MATCH'
  | 'STRONG_MATCH'
  | 'CONFIRMED_DUPLICATE'
  | 'UNRESOLVED';

export type UniquenessMatchType = 'BIOMETRIC' | 'BIOGRAPHICAL' | 'DOCUMENTAL' | 'MULTIMODAL' | 'NONE';

export type UniquenessResolutionType = 
  | 'CLEARED_UNIQUE'
  | 'CONFIRMED_HOMONYM'
  | 'SUPERVISOR_REFERRED'
  | 'CONFIRMED_DUPLICATE_MERGE'
  | 'SUSPECT_FRAUD_ESCALATED'
  | 'INSUFFICIENT_DATA_SANEAMENTO'
  | 'PENDING';

export interface CandidateEvidenceField {
  field: string;
  applicantValue: string;
  candidateValue: string;
  isMatch: boolean;
  isContradiction: boolean;
  evidenceSource: 'REGISTO_CIVIL' | 'ABIS_NATIONAL' | 'DNI_HISTORICO' | 'ARQUIVO_CENTRAL';
  notes?: string;
}

export interface UniquenessCandidate {
  candidateId: string;
  citizenName: string;
  nationalIdNumber?: string;
  birthDate?: string;
  motherName?: string;
  fatherName?: string;
  birthPlace?: string;
  sourceEngine: 'ABIS_1N' | 'CIVIL_REGISTRY_SEARCH' | 'IDENTITY_GRAPH' | 'DOC_CROSS_MATCH';
  matchType: UniquenessMatchType;
  overallMatchDegree: number; // 0 - 100%
  biometricScore?: number;
  biographicalScore?: number;
  documentScore?: number;
  matchingFields: string[];
  contradictoryFields: string[];
  evidenceFields: CandidateEvidenceField[];
  discoveryEvidence: string;
  classification: 'POSSIBLE_MATCH' | 'STRONG_MATCH' | 'HOMONYM_PROBABLE' | 'DEFINITIVE_COLLISION';
  requiresReview: boolean;
  status: 'PENDING_REVIEW' | 'REVIEWED_CLEARED' | 'REVIEWED_CONFIRMED' | 'ESCALATED';
  reviewNotes?: string;
}

export interface UniquenessSearchScope {
  civilRegistryNational: boolean;
  abisNationalGallery: boolean;
  historicalDniDatabase: boolean;
  vitalEventsRegisters: boolean;
  lastSearchExecution: string;
}

export interface UniquenessValidation {
  validationId?: string;
  dossierId?: string;
  processId?: string;
  citizenId?: string;
  status: UniquenessEngineStatus;
  result?: UniquenessResultType;
  searchReference?: string;
  searchScope?: UniquenessSearchScope;
  candidateCount?: number;
  candidates?: UniquenessCandidate[];
  matchType?: UniquenessMatchType;
  confidence?: number; // 0 - 100%
  resolution?: UniquenessResolutionType;
  resolutionNotes?: string;
  reviewRequired?: boolean;
  assignedReviewer?: string;
  assignedReviewerName?: string;
  assignedReviewerRole?: string;
  resolvedAt?: string;
  
  // Metadados Legados e de Suporte
  engineCode: 'IDENTITY_UNIQUENESS_PROBE';
  collisionRiskLevel: ValidationRiskLevel;
  identityCollisionNotes?: string;
  duplicateCitizenId?: string;
  duplicateCitizenName?: string;
  evidenceRef?: string;
  evaluatedAt: string;
  
  // Hashes & Auditoria Imutável (SILA Chain)
  previousHash?: string;
  currentHash?: string;
  digitalSignature?: string;
  auditChainRef?: string;
}

export type UniquenessValidationResult = UniquenessValidation;
export type UniquenessStatus = UniquenessEngineStatus;

// 05 — Validação Documental
export type DocumentIntegrityStatus = 'VALID' | 'INVALID' | 'SUSPICIOUS' | 'EXPIRED';

export interface DocumentItemValidation {
  documentType: 'CERTIDAO_NASCIMENTO' | 'ASSENTO_NASCIMENTO' | 'BI_ANTERIOR' | 'PROVA_RESIDENCIA' | 'ASSENTO_CASAMENTO';
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate?: string;
  authenticityConfirmed: boolean;
  digitalSignatureValid: boolean;
  status: DocumentIntegrityStatus;
  notes?: string;
}

export interface DocumentalValidationResult {
  engineCode: 'DOC_INTEGRITY_SERVICE';
  status: DocumentIntegrityStatus;
  presentedDocuments: DocumentItemValidation[];
  evaluatedAt: string;
}

// 06 — Motor Normativo de Regras de Conformidade
export interface ComplianceRuleEvaluation {
  ruleCode: string;
  description: string;
  legalBasis: string;                   // Ex: "Lei da Identificação Civil, Art. 14º"
  version: string;
  inputEvaluated: string;
  passed: boolean;
  evidence: string;
  evaluatedAt: string;
}

export interface ComplianceValidationResult {
  engineCode: 'REGULATORY_RULES_ENGINE';
  isCompliant: boolean;
  rulesEvaluated: ComplianceRuleEvaluation[];
  rulesPassed: string[];
  rulesViolated: string[];
  requiresSupervisorApproval: boolean;
  evaluatedAt: string;
}

/**
 * 4. DECISÃO INSTITUCIONAL VINCULATIVA (07 / 09)
 * 25. Nome Padronizado: ValidationDecision
 */
export type VerdictType = 'APPROVED' | 'SUSPENDED' | 'REJECTED';
export type RejectionCategory = 
  | 'FRAUD_SUSPECT' 
  | 'BIOMETRIC_COLLISION' 
  | 'FALSE_DECLARATION' 
  | 'INVALID_DOCUMENTS' 
  | 'REGULATORY_BREACH' 
  | 'OTHER';

export interface ValidationDecision {
  decisionId: string;
  verdict: VerdictType;
  decidedBy: {
    userId: string;
    operatorName: string;
    role: 'VALIDATOR' | 'SUPERVISOR' | 'DIRECTOR' | 'SYSTEM_AUTO';
    terminalId: string;
  };
  legalJustificationCode: string;       // Ex: "DEC_LEG_OK_ART12", "DEC_ERR_FRAUD_ART45"
  justificationNotes?: string;
  rejectionReason?: RejectionCategory;
  nextModuleDestination: '11_EMISSAO' | 'ARCHIVED' | 'CRIMINAL_REFERRAL' | 'PENDING_SANEAMENTO';
  signatureToken: string;               // Token Criptográfico assinado
  decidedAt: string;
}

// Compatibilidade de tipo
export type InstitutionalDecision = ValidationDecision;

/**
 * 5. EXCEÇÕES E DISCREPÂNCIAS (08)
 * 25. Nome Padronizado: ValidationException
 */
export type ExceptionCategory = 
  | 'DOCUMENTAL' 
  | 'BIOGRAFICA' 
  | 'BIOMETRICA' 
  | 'DUPLICIDADE' 
  | 'REGULATORIA' 
  | 'TECNICA' 
  | 'JURISDICIONAL';

export type ExceptionStatus = 'OPEN' | 'ASSIGNED' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED' | 'CLOSED';

export interface ValidationException {
  exceptionId: string;
  dossierId: string;
  type: ExceptionCategory;
  severity: ValidationRiskLevel;
  description: string;
  evidence: string;
  assignedTo?: string;
  deadline: string;
  status: ExceptionStatus;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  auditRef: string;
}

/**
 * 6. ENTIDADE MESTRE: VALIDATION DOSSIER (Entrada do 09 -> Orquestração do 10)
 * 27 Campos Obrigatórios e Estritos do Contrato
 */
export interface ValidationDossier {
  // 1-12: Identificação Canónica, Cidadão, Processo e Território
  dossierId: string;                    // 1. ID Canónico (ex: "DOS_2026_AGO_00192")
  processId: string;                    // 2. Ref do Processo (REQ-...)
  citizenId: string;                    // 3. Ref Cidadão
  citizenName: string;                  // 4. Nome Oficial do Cidadão
  nationalIdNumber?: string;            // 5. BI atual se renovação
  attendanceSessionId: string;          // 6. Sessão Presencial (Módulo 09)
  territoryVersion: string;             // 7. Versão da Divisão Político-Administrativa (DPA-2026.1)
  provinceId: string;                   // 8. Província de Jurisdição
  municipalityId: string;               // 9. Município de Jurisdição
  servicePointId: string;               // 10. Posto de Atendimento de Origem
  collectionOperatorId: string;         // 11. Operador da Recolha no 09
  createdAt: string;                    // 12. Timestamp de Criação

  // 13-17: Ciclo de Vida, Fila e Atribuição
  status: ValidationStatus;             // 13. Estado Atual
  priority: ValidationPriority;         // 14. Prioridade Operacional (NORMAL | HIGH | URGENT | CRITICAL)
  riskLevel: ValidationRiskLevel;       // 15. Nível de Risco Padronizado (LOW | MEDIUM | HIGH | CRITICAL)
  assignedValidatorId?: string;         // 16. Validador Responsável
  slaDeadline: string;                  // 17. Timestamp Limite de Resolução

  // 18-22: Resultados dos Motores Especializados
  biographicalValidation: BiographicalValidationResult; // 18. Confronto Registo Civil
  biometricValidation: BiometricValidationResult;       // 19. Gateway ABIS/AFIS
  uniquenessValidation: UniquenessValidationResult;     // 20. Antifraude / Unicidade
  documentalValidation: DocumentalValidationResult;     // 21. Autenticidade Documental
  complianceValidation: ComplianceValidationResult;     // 22. Motor Normativo Legal

  // 23: Decisão Institucional Vinculativa
  decision?: ValidationDecision;        // 23. Veredito Soberano

  // 24-27: Imutabilidade, Encadeamento e Auditoria
  previousHash: string;                 // 24. Hash Anterior
  currentHash: string;                  // 25. Hash Atual
  digitalSignature: string;             // 26. Assinatura Digital do Dossiê
  auditChainRef: string;                // 27. Referência Global de Auditoria
  
  // Metadados de Suporte e Processo
  processType: ProcessType;
  servicePointName?: string;
  collectionOperatorName?: string;
  assignedValidatorName?: string;
  assignedSupervisorId?: string;
  exceptions?: ValidationException[];
  slaStartedAt?: string;
  updatedAt?: string;
}

/**
 * 7. AUDITORIA DA DECISÃO (10 — Imutável e Encadeada)
 * 25. Nome Padronizado: ValidationAuditEvent
 */
export interface ValidationAuditEvent {
  eventId: string;
  dossierId: string;
  operatorId: string;
  operatorRole?: string;
  command: string;
  previousState: ValidationStatus;
  newState: ValidationStatus;
  reason: string;
  timestamp: string;
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
  terminalId?: string;
  payloadSummary?: string;
  silaGlobalAuditRef?: string;
}

/**
 * 8. REGRAS RBAC + ABAC CONTEXTUAIS
 */
export interface OperatorContext {
  operatorId: string;
  operatorName: string;
  role: 'OPERADOR_BALCAO' | 'VALIDADOR_N1' | 'VALIDADOR_ESPECIALISTA_N2' | 'SUPERVISOR_N3' | 'AUDITOR_INSPECAO';
  organization: 'DNI_MINJUSDH';
  provinceId: string;
  servicePointId: string;
  terminalId: string;
}
