// 09 — SESSÃO DE ATENDIMENTO FÍSICO CONTROLADO & MÁQUINA DE ESTADOS DO SILA
//
// ============================================================================
// PRINCÍPIO ARQUITETURAL: O MÓDULO 09 EXECUTA. NÃO É A AUTORIDADE DOS DADOS.
// ============================================================================
// ❌ O QUE NÃO ENTRA NO 09 (Fronteiras Arquiteturais Rígidas):
//   ❌ Não cria cidadão (autoridade do Registo / Módulo 04 & 06)
//   ❌ Não altera identidade oficial
//   ❌ Não cria território (autoridade da Divisão Territorial / Módulo 01)
//   ❌ Não cria posto (autoridade da Infraestrutura de Postos / Módulo 07)
//   ❌ Não cria agendamento (autoridade do Agendamento / Módulo 08)
//   ❌ Não altera capacidade das conservatórias
//   ❌ Não emite BI (autoridade da Emissão & Gráfica / Módulo 10 & 11)
//   ❌ Não aprova identidade nacional (autoridade da Auditoria & Validação / Módulo 05)
//   ❌ Não gere utilizadores ou RBAC (autoridade do IAM / Módulo 02)
//   ❌ Não edita dados oficiais diretamente
//
// ✅ O QUE O 09 FAZ:
//   ✔ Executa a sessão presencial controlada do cidadão no posto
//   ✔ Gere o ciclo de vida físico (Check-in, Triagem, Fila, Chamada, Cabine, Biometria, Fecho)
//   ✔ Aplica a Máquina de Estados estrita com RBAC/ABAC e Reautenticação
//   ✔ Integra telemetria e prontidão do hardware homologado da cabine
//   ✔ Gera provas de conformidade e cadeia criptográfica append-only para o Core
// ============================================================================

export type AttendanceSessionStatus =
  | 'SCHEDULED'
  | 'CHECKED_IN'
  | 'TRIAGE'
  | 'QUEUED'
  | 'CALLED'
  | 'IN_SERVICE'
  | 'BIOMETRIC_CAPTURE'
  | 'DATA_CONFERENCE'
  | 'COMPLETED'
  // Saídas controladas:
  | 'NO_SHOW'
  | 'CANCELLED'
  | 'PENDING_DOCUMENTATION'
  | 'CAPTURE_FAILED'
  | 'DISCREPANCY';

export type AttendancePhase =
  | 'AGENDAMENTO'
  | 'ACOLHIMENTO_TRIAGEM'
  | 'ESPERA_CHAMADA'
  | 'CABINE_ATENDIMENTO'
  | 'ESTACAO_BIOMETRIA'
  | 'CONFERENCIA_VALIDACAO'
  | 'FINALIZADO'
  | 'EXCEPTION_HANDLING';

export interface FastTrackEligibilityEvaluation {
  processStatus: 'VALIDADO' | 'PENDENTE' | 'EM_ANALISE' | 'RECUSADO';
  documentationStatus: 'CONFORME' | 'INCOMPLETO' | 'NAO_CONFORME';
  identityStatus: 'RESOLVIDA' | 'AMBIGUA' | 'NAO_RESOLVIDA';
  biometricsRequired: boolean;
  pendingIssuesCount: number;
  isEligible: boolean;
  evaluatedAt: string;
  justification: string;
}

// 01 — ENTIDADE CONGELADA COMO NÚCLEO EXCLUSIVO: AttendanceSession
export interface AttendanceSession {
  // Identificador mestre
  attendanceSessionId: string; // Ex: "ATD-2026-0815-001"
  ticketNumber: string; // Ex: "A-012", "P-004", "E-001"

  // Referências estruturais do Cidadão & Processo
  appointmentId?: string; // Link para Módulo 08
  processId?: string; // Link para Módulo 03
  citizenId: string; // Link para Módulo 04 / 06 (BI ou ID Cidadão)
  citizenName: string;
  citizenPhone: string;
  serviceType: string;

  // Localização territorial & infraestrutura física
  territoryVersion: string; // Ex: "ANG_TERR_2026_V1"
  provinceId: string; // Ex: "PROV-LUA"
  municipalityId: string; // Ex: "MUN-ING"
  servicePointId: string; // Ex: "CSIC-ING-001"
  servicePointName: string;
  counterId: string; // Ex: "BALCAO-01"
  workstationId?: string; // Ex: "WS-ING-01"

  // Operador responsável
  operatorId: string; // Ex: "OP-LUA-401"
  operatorName: string;
  operatorRole?: string;

  // Estado e Fase da Máquina de Estados
  status: AttendanceSessionStatus;
  currentPhase: AttendancePhase;

  // Timestamps controlados de cada etapa
  checkInAt?: string;
  triageAt?: string;
  calledAt?: string;
  startedAt?: string;
  biometricAt?: string;
  verificationAt?: string;
  completedAt?: string;

  // Fast-Track controlado
  fastTrack: boolean;
  fastTrackReason: string;
  fastTrackEvaluation?: FastTrackEligibilityEvaluation;

  // Referências de captura biométrica institucional
  biometricCaptureRef?: string;
  photoCaptureRef?: string;
  signatureCaptureRef?: string;

  // Detalhes da recolha biométrica efetuada
  biometricScores?: {
    faceScore: number;
    fingerprintsScore: number;
    fingerprintsCount: number;
    signatureValid: boolean;
    profileApplied: string;
    isCompliant: boolean;
    sha256Proof: string;
  };

  // Referência de validação
  validationRef?: string;

  // Timestamps de auditoria e ciclo de vida
  createdAt: string;
  updatedAt: string;

  // Referência do nó na trilha de auditoria global
  auditRef: string;
}

// 02 — REGRAS DE TRANSIÇÃO CONTROLADA (MÁQUINA DE ESTADOS + RBAC/ABAC + AUDIT)
export interface TransitionContext {
  operatorId: string;
  operatorRole: 'SUPERVISOR' | 'REGISTRATION_OFFICER' | 'TRIAGE_OFFICER' | 'AUDITOR';
  operatorServicePointId: string;
  operatorCounterId: string;
  territoryScope: string;
  authLevel: 'LEVEL_1_PASSWORD' | 'LEVEL_2_PIN' | 'LEVEL_3_BIOMETRIC_REAUTH';
  justification?: string;
  reauthConfirmed?: boolean;
}

export interface TransitionPermissionRule {
  fromStatus: AttendanceSessionStatus;
  toStatus: AttendanceSessionStatus;
  allowedRoles: Array<'SUPERVISOR' | 'REGISTRATION_OFFICER' | 'TRIAGE_OFFICER' | 'AUDITOR'>;
  requiresReauth: boolean;
  requiresStrictCriteria?: boolean;
  actionCode: string;
  description: string;
}

// 03 — PERFIL BIOMÉTRICO INSTITUCIONAL
export interface BiometricCaptureProfile {
  profileCode: string;
  authorityCode: string;
  version: string;
  minFaceQualityScore: number;
  minFingerprintsQualityScore: number;
  requiredFingerprintsCount: number;
  requireDigitalSignature: boolean;
  captureRulesSummary: string;
}

// 04 — HARDWARE & ESTAÇÕES
export type DeviceCategory = 'CAMARA' | 'SCANNER_BIOMETRICO' | 'LEITOR_BI' | 'PAD_ASSINATURA' | 'IMPRESSORA_SENHAS' | 'TERMINAL_PAGAMENTO';

export type DeviceOperationalState = 
  | 'CONNECTED'
  | 'READY'
  | 'BUSY'
  | 'ERROR'
  | 'OFFLINE'
  | 'MAINTENANCE';

export interface WorkstationDevice {
  deviceId: string;
  category: DeviceCategory;
  name: string;
  model: string;
  serialNumber: string;
  state: DeviceOperationalState;
  lastPing: string;
  firmwareVersion: string;
  healthMetrics?: string;
}

export interface WorkstationStation {
  workstationId: string;
  counterId: string;
  servicePointId: string;
  name: string;
  ipAddress: string;
  osVersion: string;
  isReadyForCapture: boolean;
  devices: WorkstationDevice[];
}

export interface ServiceCounterStation {
  counterId: string;
  servicePointId: string;
  servicePointName: string;
  assignedOperatorId: string;
  assignedOperatorName: string;
  operatorRole: string;
  assignedServiceTypes: string[];
  status: 'DISPONIVEL' | 'EM_ATENDIMENTO' | 'PAUSA_TECNICA' | 'OFFLINE';
  activeTicketNumber?: string;
  workstation: WorkstationStation;
  todayAttendedCount: number;
  averageServiceMinutes: number;
}

// 05 — AUDITORIA DO ATENDIMENTO (APPEND-ONLY COM ASSINATURA E HASH ENCADERNADO)
export interface AttendanceAuditRecord {
  id: string;
  timestamp: string;
  attendanceSessionId: string;
  ticketNumber: string;
  servicePointId: string;
  counterId: string;
  operatorId: string;
  operatorName: string;
  action: string;
  fromStatus: AttendanceSessionStatus;
  toStatus: AttendanceSessionStatus;
  currentPhase: AttendancePhase;
  previousHash: string;
  currentHash: string;
  signature: string;
  reauthVerified: boolean;
  rbacResult: 'GRANTED' | 'DENIED';
  abacResult: 'GRANTED' | 'DENIED';
  auditRef: string;
  details: string;
  isCorrection?: boolean;
  originalEventId?: string;
  correctionJustification?: string;
}
