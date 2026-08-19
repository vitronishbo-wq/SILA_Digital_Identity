/**
 * CONTRATO CANÓNICO DO SUBMÓDULO 11 — GESTÃO DE EMISSÃO & PERSONALIZAÇÃO DE BI
 * 
 * Regra Soberana SILA GovOS:
 * 07 AUTORIZA (EMISSION_AUTHORIZED). 11 EXECUTA.
 * 11 NUNCA decide quem é ou não cidadão; apenas executa materialmente a emissão autorizada.
 * Imutável, com segregação de funções, PKI ICAO Doc 9303 e custódia rastreada.
 */

export type EmissionStatus =
  | 'PENDING_AUTHORIZATION'
  | 'AUTHORIZED'
  | 'PERSONALIZATION'
  | 'SECURITY_CHECK'
  | 'READY_FOR_PRODUCTION'
  | 'PRODUCED'
  | 'QUALITY_CHECK'
  | 'DELIVERABLE'
  | 'DELIVERED'
  | 'CLOSED'
  // Exceções Operacionais da Fábrica de Emissão
  | 'AUTHORIZATION_INVALID'
  | 'PERSONALIZATION_ERROR'
  | 'SECURITY_FAILURE'
  | 'PRODUCTION_FAILURE'
  | 'QUALITY_FAILURE'
  | 'CUSTODY_EXCEPTION'
  | 'CANCELLED_BY_AUTHORITY';

export type EmissionOperatorRole =
  | 'EMISSION_OPERATOR'     // Operador de Linha de Produção e Gravação
  | 'SECURITY_CHIP_ENGINEER'// Engenheiro de Segurança de Chaves Criptográficas ICAO
  | 'QUALITY_INSPECTOR'     // Inspetor de Controlo de Qualidade Físico/Óptico
  | 'CUSTODY_OFFICER'       // Oficial de Guarda, Transporte e Entrega ao Cidadão
  | 'CONSERVADOR_N3';       // Conservador de Alçada (Origem da Autorização)

export interface BiPersonalizationData {
  documentNumber: string;        // Número Oficial do BI/DNI (ex: 004829102LA042)
  fullName: string;              // Nome Completo Homologado
  dateOfBirth: string;           // Data de Nascimento (YYYY-MM-DD)
  gender: 'M' | 'F';
  nationality: 'ANGOLANA';
  maritalStatus: string;
  fatherName: string;
  motherName: string;
  naturalnessProvince: string;
  naturalnessMunicipality: string;
  residenceAddress: string;
  heightMeters: number;
  photoRefSHA256: string;
  fingerprintMinutiaeRefSHA256: string;
  expiryDate: string;
  issueDate: string;
}

export interface BiSecurityFeatures {
  mrzLine1: string;              // Linha 1 MRZ ICAO Doc 9303
  mrzLine2: string;              // Linha 2 MRZ ICAO Doc 9303
  mrzLine3: string;              // Linha 3 MRZ ICAO Doc 9303
  chipUid: string;               // Identificador Físico Único do Chip de Policarbonato
  chipPublicKeyCertSha256: string;
  pkiCscaSignatureRef: string;
  laserEngravingBatch: string;
  opticalVariableInkBatch: string;
  kinegramSerial: string;
}

export interface BiProductionReference {
  printerId: string;
  batchLotNumber: string;
  cardBlankSerial: string;
  producedAt: string;
  producedByOperatorId: string;
  temperatureSensorCheck: boolean;
  pressureLaminationCheck: boolean;
}

export interface BiCustodyReference {
  currentLocation: 'CENTRAL_FACTORY' | 'SECURE_DISPATCH' | 'MUNICIPAL_SERVICE_POINT' | 'DELIVERED_TO_CITIZEN';
  courierDispatchTrackingRef?: string;
  securePouchSealNumber?: string;
  dispatchedAt?: string;
  receivedAtServicePointAt?: string;
  deliveredToCitizenAt?: string;
  receivedByCitizenProofType?: 'BIOMETRIC_MATCH_VERIFIED' | 'PHYSICAL_SIGNATURE_RECEIPT';
}

export interface BiEmission {
  emissionId: string;
  dossierId: string;
  processId: string;
  citizenId: string;
  decisionId: string;
  authorizationRef: string;
  
  emissionStatus: EmissionStatus;
  documentType: 'BILHETE_DE_IDENTIDADE_NACIONAL' | 'CARTAO_DE_RESIDENCIA';
  
  personalizationData: BiPersonalizationData;
  securityFeatures: BiSecurityFeatures;
  productionReference?: BiProductionReference;
  custodyReference: BiCustodyReference;

  issuedAt: string;
  issuedBy: {
    operatorId: string;
    operatorName: string;
    role: EmissionOperatorRole;
    terminalId: string;
  };

  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
}

export type EmissionCommand =
  | 'VIEW_AUTHORIZATION'
  | 'START_PERSONALIZATION'
  | 'RUN_SECURITY_CHECK'
  | 'AUTHORIZE_PRODUCTION_EXECUTION'
  | 'REGISTER_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'REGISTER_CUSTODY'
  | 'REGISTER_DELIVERY'
  | 'REPORT_EXCEPTION'
  | 'AUDITORIA';

export interface EmissionAuditEvent {
  eventId: string;
  timestamp: string;
  emissionId: string;
  dossierId: string;
  processId: string;
  authorizationRef: string;
  operatorId: string;
  operatorName: string;
  role: EmissionOperatorRole;
  terminalId: string;
  command: EmissionCommand;
  previousState: EmissionStatus;
  newState: EmissionStatus;
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  auditChainRef: string;
  payloadSummary: string;
}
