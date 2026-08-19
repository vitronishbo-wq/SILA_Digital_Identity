// ============================================================================
// SILA GovOS — 05_VAL_DOCUMENTAL: CONTRATOS CANÓNICOS & MÁQUINA DE ESTADOS
// ============================================================================

import { ValidationRiskLevel } from './validations';

/**
 * Máquina de Estados Canónica da Validação Documental (Submódulo 05)
 * PENDING_ANALYSIS ──► DOCUMENTS_RECEIVED ──► OCR_ANALYSIS ──► AUTHENTICITY_CHECK 
 *   ──► CROSS_REFERENCE ──► RESULT_READY ──► CONFIRMED_RESULT
 * 
 * Estados de Exceção:
 * PENDING_DOCUMENTS | DOCUMENT_EXCEPTION | INCONSISTENCY_FOUND | SUPERVISOR_REVIEW | RESOLVED
 */
export type DocumentalEngineStatus =
  | 'PENDING_ANALYSIS'
  | 'DOCUMENTS_RECEIVED'
  | 'OCR_ANALYSIS'
  | 'AUTHENTICITY_CHECK'
  | 'CROSS_REFERENCE'
  | 'RESULT_READY'
  | 'CONFIRMED_RESULT'
  | 'PENDING_DOCUMENTS'
  | 'DOCUMENT_EXCEPTION'
  | 'INCONSISTENCY_FOUND'
  | 'SUPERVISOR_REVIEW'
  | 'RESOLVED';

export type DocumentAuthenticityStatus =
  | 'VALID'             // Válido e verificado contra fonte/criptografia
  | 'EXPIRED'           // Documento caducado
  | 'ILLEGIBLE'         // Ilegível / baixa resolução OCR
  | 'INCONSISTENT'      // Inconsistente com bases oficiais
  | 'UNVERIFIABLE'      // Fonte oficial indisponível / não verificável
  | 'SUSPECT'           // Suspeita material / adulteração de elementos
  | 'SOURCE_UNAVAILABLE'; // Fonte oficial externa indisponível

export type DocumentTypeAO =
  | 'CERTIDAO_NASCIMENTO'
  | 'ASSENTO_NASCIMENTO'
  | 'BI_ANTERIOR'
  | 'PROVA_RESIDENCIA'
  | 'ASSENTO_CASAMENTO'
  | 'CERTIDAO_OBITO'
  | 'SENTENCA_TRIBUNAL'
  | 'DOCUMENTO_ESTRANGEIRO';

export type DocumentSeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DocumentOcrFieldItem {
  fieldName: string;
  fieldLabel: string;
  extractedValue: string;
  officialExpectedValue?: string;
  confidenceScore: number;       // 0 - 100% de confiança OCR
  isMatch: boolean;
  isDivergence: boolean;
  notes?: string;
}

export interface DocumentPresentedMatrixItem {
  documentId: string;
  documentType: DocumentTypeAO;
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate?: string;
  holderName: string;
  
  // Estado & Métricas
  documentState: 'ATTACHED' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'PENDING_RESUBMISSION';
  ocrStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'ILLEGIBLE';
  ocrQualityScore: number;       // 0 - 100%
  ocrFields: DocumentOcrFieldItem[];
  
  authenticityStatus: DocumentAuthenticityStatus;
  consistencyStatus: 'CONSISTENT' | 'DIVERGENT' | 'INCONSISTENT' | 'UNCHECKED';
  processMatchStatus: 'MATCH' | 'MISMATCH' | 'PARTIAL_MATCH';
  
  // Fonte Oficial
  officialSourceReference: string;
  officialSourceStatus: 'ONLINE_VERIFIED' | 'SOURCE_UNAVAILABLE' | 'NOT_APPLICABLE' | 'ARCHIVE_INDEXED';
  
  resultSummary: string;
  severity: DocumentSeverityLevel;
  requiredAction: 'NONE' | 'REQUEST_NEW_COPY' | 'MANUAL_CONFRONTATION' | 'ESCALATE_N3' | 'CONFIRM';
}

export interface DocumentOfficialSourceRef {
  sourceCode: string;
  sourceName: string;
  endpointType: 'SIRGC_API' | 'DNI_HISTORICAL_ARCHIVE' | 'ICP_AO_CRL' | 'CONSERVATORIA_LOCAL';
  availabilityStatus: 'ONLINE' | 'SOURCE_UNAVAILABLE' | 'DEGRADED';
  lastCheckedAt: string;
  recordsIndexed: number;
}

export interface DocumentCrossReferenceItem {
  targetDomain: 'PROCESSO' | 'IDENTIDADE' | 'REGISTO_CIVIL' | '02_BIOGRAFICA' | '03_BIOMETRICA' | '04_UNICIDADE';
  fieldOrVector: string;
  documentValue: string;
  targetValue: string;
  confrontationType: 'COINCIDENCIA' | 'DIVERGENCIA' | 'AUSENCIA_INFO' | 'INCONSISTENCIA_MATERIAL';
  isExplainable: boolean;
  notes: string;
}

export interface DocumentExceptionItem {
  exceptionId: string;
  documentId: string;
  severity: DocumentSeverityLevel;
  code: string;
  title: string;
  description: string;
  requiresSupervisorAction: boolean;
  isResolved: boolean;
  resolutionNotes?: string;
}

export interface DocumentalValidation {
  validationId: string;
  dossierId: string;
  processId: string;
  documentSetId: string;
  
  engineCode: 'DOC_INTEGRITY_SERVICE';
  engineStatus: DocumentalEngineStatus;
  
  // Matriz de Documentos & Fontes
  documents: DocumentPresentedMatrixItem[];
  sourceReferences: DocumentOfficialSourceRef[];
  
  // Resultados dos Módulos Especializados
  ocrResult: {
    overallQualityScore: number;
    totalFieldsExtracted: number;
    fieldsCoincidentCount: number;
    fieldsDivergentCount: number;
    status: 'COMPLETE' | 'PARTIAL' | 'POOR_QUALITY' | 'FAILED';
  };
  
  authenticityResult: {
    overallAuthenticity: DocumentAuthenticityStatus;
    icpAoSignatureValid: boolean;
    physicalSecurityFeaturesScore: number; // 0 - 100%
    status: 'AUTHENTIC' | 'SUSPECT' | 'EXPIRED' | 'UNVERIFIABLE';
  };
  
  consistencyResult: {
    isConsistent: boolean;
    divergenceCount: number;
    inconsistencyCount: number;
    notes?: string;
  };
  
  crossReferenceResult: {
    confrontations: DocumentCrossReferenceItem[];
    overallMatch: boolean;
  };
  
  documentaryResult: {
    resultCode: 'CONFORM_APPROVED' | 'DIVERGENCE_JUSTIFIED' | 'INSUFFICIENT_SANEAMENTO' | 'SUSPECT_SUPERVISOR_REFERRED';
    summary: string;
    criticalFlagsCount: number;
  };
  
  exceptions: DocumentExceptionItem[];
  
  // Operacional & Pareceres
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
