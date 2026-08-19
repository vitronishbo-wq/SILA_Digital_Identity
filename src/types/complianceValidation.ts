// ============================================================================
// SILA GovOS — 06_VAL_COMPLIANCE: CONTRATOS CANÓNICOS & MÁQUINA DE REGRAS LEGAIS
// ============================================================================

export type ComplianceEngineStatus =
  | 'PENDING_ANALYSIS'
  | 'RULES_LOADING'
  | 'COMPLIANCE_CHECK'
  | 'FINDINGS_REVIEW'
  | 'RESULT_READY'
  | 'CONFIRMED_RESULT'
  | 'RULES_UNAVAILABLE'
  | 'INSUFFICIENT_DATA'
  | 'NON_COMPLIANCE_FOUND'
  | 'SUPERVISOR_REVIEW'
  | 'RESOLUTION_REQUIRED'
  | 'RESOLVED'
  | 'CHECK_FAILED';

export type ComplianceSeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplianceResultType =
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'PARTIALLY_COMPLIANT'
  | 'INSUFFICIENT_DATA'
  | 'NOT_APPLICABLE'
  | 'UNRESOLVED';

export type ComplianceResolutionType =
  | 'NO_ACTION'
  | 'REQUEST_CORRECTION'
  | 'REQUEST_DOCUMENTATION'
  | 'SUPERVISOR_REVIEW'
  | 'EXCEPTION_REVIEW'
  | 'RESOLVED';

export type RuleCategory =
  | 'CAPACIDADE_JURIDICA'
  | 'REGIME_EMISSAO_PRAZOS'
  | 'INTEGRIDADE_FILIACAO'
  | 'TERRITORIALIDADE_COMPETENCIA'
  | 'AVERBACOES_ESTADO_CIVIL'
  | 'REGIME_ISENCOES_TAXAS'
  | 'PROTECAO_DADOS_LGPD_AO';

export interface AppliedRuleItem {
  ruleId: string;
  ruleCode: string;
  ruleTitle: string;
  version: string;
  originatingNorm: string;      // Ex: Lei da Identificação Civil (Lei n.º 04/21), Art. 8º
  category: RuleCategory;
  applicability: 'APPLICABLE' | 'NOT_APPLICABLE' | 'CONDITIONALLY_APPLICABLE';
  conditionSummary: string;
  requiredEvidence: string;
  evaluatedEvidence: string;
  result: 'PASS' | 'FAIL' | 'INSUFFICIENT_DATA' | 'EXEMPTED';
  severityIfViolated: ComplianceSeverityLevel;
  exceptionRef?: string;
  requiredAction: string;
  evidenceSourceRef: string;
  evaluatedAt: string;
  resolutionOwnerRole: 'ANALISTA_JURIDICO' | 'SUPERVISOR_N3' | 'AUDITOR_SILA';
}

export interface ComplianceCheckItem {
  checkId: string;
  ruleCode: string;
  domainModule: '01_CONTEXTO' | '02_BIOGRAFICA' | '03_BIOMETRICA' | '04_UNICIDADE' | '05_DOCUMENTAL';
  inputDataSummary: string;
  checkStatus: 'PASS' | 'FAIL' | 'UNCHECKED';
  evidenceValue: string;
  notes: string;
}

export interface ComplianceFindingItem {
  findingId: string;
  ruleCode: string;
  violatingEvidence: string;
  reason: string;
  severity: ComplianceSeverityLevel;
  impactAssessment: string;
  requiredAction: string;
  resolutionStatus: 'OPEN' | 'IN_CORRECTION' | 'SUPERVISOR_REFERRED' | 'RESOLVED_WAIVED' | 'RESOLVED_RECTIFIED';
  resolutionNotes?: string;
}

export interface ComplianceExceptionItem {
  exceptionId: string;
  ruleCode: string;
  legalBasis: string;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  isApproved: boolean;
}

export interface ComplianceNonConformityItem {
  nonConformityId: string;
  ruleCode: string;
  description: string;
  severity: ComplianceSeverityLevel;
  sourceModule: string;
  isMaterialInconsistency: boolean;
}

export interface ComplianceEvidenceItem {
  evidenceId: string;
  sourceModule: '01_CONTEXTO' | '02_BIOGRAFICA' | '03_BIOMETRICA' | '04_UNICIDADE' | '05_DOCUMENTAL';
  fieldOrVector: string;
  evidenceValue: string;
  officialSource: string;
  verificationTimestamp: string;
  isImmutableConfirmed: boolean;
}

export interface ComplianceSourceRef {
  sourceCode: string;
  sourceName: string;
  normativeGazette: string;
  status: 'ONLINE' | 'SOURCE_UNAVAILABLE' | 'ARCHIVE_LOCAL';
}

export interface ComplianceValidation {
  validationId: string;
  dossierId: string;
  processId: string;
  
  engineCode: 'REGULATORY_RULES_ENGINE';
  engineStatus: ComplianceEngineStatus;
  
  // Matriz de Regras, Checks e Findings
  rulesApplied: AppliedRuleItem[];
  complianceChecks: ComplianceCheckItem[];
  findings: ComplianceFindingItem[];
  exceptions: ComplianceExceptionItem[];
  nonConformities: ComplianceNonConformityItem[];
  evidence: ComplianceEvidenceItem[];
  sourceReferences: ComplianceSourceRef[];
  
  // Resultados Finais do Motor 06
  complianceResult: ComplianceResultType;
  severity: ComplianceSeverityLevel;
  resolution: ComplianceResolutionType;
  reviewRequired: boolean;
  
  // Operacional & Parecer Legal
  reviewerId?: string;
  reviewerName?: string;
  reviewerRole?: string;
  reviewedAt?: string;
  
  // Custódia SILA Chain Append-Only
  evaluatedAt: string;
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
}
