import { 
  AttendanceSession, 
  ServiceCounterStation, 
  AttendanceAuditRecord,
  BiometricCaptureProfile,
  TransitionPermissionRule
} from '../types/attendance';

export const INSTITUTIONAL_BIOMETRIC_PROFILE: BiometricCaptureProfile = {
  profileCode: 'SILA_BIO_PROF_ANG_2026_V1',
  authorityCode: 'DNI_MINJUSDH_AO',
  version: '2026.1',
  minFaceQualityScore: 85,
  minFingerprintsQualityScore: 80,
  requiredFingerprintsCount: 10,
  requireDigitalSignature: true,
  captureRulesSummary: 'Perfil Biométrico Institucional Vigente (DNI/MINJUSDH) - Parâmetros homologados pela autoridade nacional.'
};

// 01 — REGRAS EXPLÍCITAS DA MÁQUINA DE ESTADOS CONTROLADA DO SILA (RBAC + ABAC + REAUTH)
export const STATE_MACHINE_RULES: TransitionPermissionRule[] = [
  // Fluxo Normal
  {
    fromStatus: 'SCHEDULED',
    toStatus: 'CHECKED_IN',
    allowedRoles: ['TRIAGE_OFFICER', 'REGISTRATION_OFFICER', 'SUPERVISOR'],
    requiresReauth: false,
    actionCode: 'CHECK_IN',
    description: 'Confirmação presencial do utente no posto (Check-in).'
  },
  {
    fromStatus: 'CHECKED_IN',
    toStatus: 'TRIAGE',
    allowedRoles: ['TRIAGE_OFFICER', 'SUPERVISOR'],
    requiresReauth: false,
    actionCode: 'INICIAR_TRIAGEM',
    description: 'Abertura de conferência prévia e triagem de requisitos.'
  },
  {
    fromStatus: 'TRIAGE',
    toStatus: 'QUEUED',
    allowedRoles: ['TRIAGE_OFFICER', 'SUPERVISOR'],
    requiresReauth: false,
    actionCode: 'APROVAR_TRIAGEM_FILA',
    description: 'Triagem aprovada; utente posicionado na fila de atendimento.'
  },
  {
    fromStatus: 'QUEUED',
    toStatus: 'CALLED',
    allowedRoles: ['REGISTRATION_OFFICER', 'SUPERVISOR'],
    requiresReauth: false,
    actionCode: 'CHAMAR_SENHA',
    description: 'Senha chamada para cabine/balcão de atendimento.'
  },
  {
    fromStatus: 'CALLED',
    toStatus: 'IN_SERVICE',
    allowedRoles: ['REGISTRATION_OFFICER', 'SUPERVISOR'],
    requiresReauth: false,
    actionCode: 'INICIAR_ATENDIMENTO',
    description: 'Apresentação do cidadão no balcão e abertura da sessão.'
  },
  {
    fromStatus: 'IN_SERVICE',
    toStatus: 'BIOMETRIC_CAPTURE',
    allowedRoles: ['REGISTRATION_OFFICER', 'SUPERVISOR'],
    requiresReauth: false,
    actionCode: 'INICIAR_CAPTURA_BIOMETRICA',
    description: 'Acionamento dos periféricos homologados para recolha biométrica.'
  },
  {
    fromStatus: 'BIOMETRIC_CAPTURE',
    toStatus: 'DATA_CONFERENCE',
    allowedRoles: ['REGISTRATION_OFFICER', 'SUPERVISOR'],
    requiresReauth: false,
    actionCode: 'CONFERENCIA_DADOS',
    description: 'Conferência dos dados biográficos e comprovação biométrica.'
  },
  {
    fromStatus: 'DATA_CONFERENCE',
    toStatus: 'COMPLETED',
    allowedRoles: ['REGISTRATION_OFFICER', 'SUPERVISOR'],
    requiresReauth: true, // Reautenticação obrigatória para fecho e encaminhamento
    actionCode: 'CONCLUIR_ATENDIMENTO',
    description: 'Finalização do atendimento e emissão do selo para o Pipeline Core.'
  },

  // SAÍDAS CONTROLADAS (EXCEÇÕES REGULADAS)
  {
    fromStatus: 'CHECKED_IN',
    toStatus: 'NO_SHOW',
    allowedRoles: ['TRIAGE_OFFICER', 'SUPERVISOR'],
    requiresReauth: false,
    actionCode: 'REGISTAR_DESISTENCIA_NAO_COMPARECENCIA',
    description: 'Utente fez check-in mas ausentou-se antes da triagem.'
  },
  {
    fromStatus: 'CHECKED_IN',
    toStatus: 'CANCELLED',
    allowedRoles: ['SUPERVISOR'],
    requiresReauth: true,
    actionCode: 'CANCELAR_SESSAO',
    description: 'Cancelamento formal da sessão por motivo administrativo fundamentado.'
  },
  {
    fromStatus: 'TRIAGE',
    toStatus: 'PENDING_DOCUMENTATION',
    allowedRoles: ['TRIAGE_OFFICER', 'SUPERVISOR'],
    requiresReauth: false,
    actionCode: 'NOTIFICAR_PENDENCIA_DOCUMENTAL',
    description: 'Falta de documento obrigatório; processo retido na triagem.'
  },
  {
    fromStatus: 'BIOMETRIC_CAPTURE',
    toStatus: 'CAPTURE_FAILED',
    allowedRoles: ['REGISTRATION_OFFICER', 'SUPERVISOR'],
    requiresReauth: false,
    actionCode: 'FALHA_CAPTURA_BIOMETRICA',
    description: 'Impossibilidade técnica ou recusa de conformidade no perfil biométrico.'
  },
  {
    fromStatus: 'DATA_CONFERENCE',
    toStatus: 'DISCREPANCY',
    allowedRoles: ['REGISTRATION_OFFICER', 'SUPERVISOR'],
    requiresReauth: true,
    actionCode: 'ASSINALAR_DISCREPANCIA_IDENTIDADE',
    description: 'Inconsistência entre os dados biográficos e o registo nacional.'
  }
];

export const INITIAL_SERVICE_COUNTERS: ServiceCounterStation[] = [
  {
    counterId: 'BALCAO-01',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória Ingombota',
    assignedOperatorId: 'OP-LUA-401',
    assignedOperatorName: 'Oficial Esperança Neto',
    operatorRole: 'REGISTRATION_OFFICER',
    assignedServiceTypes: ['PRIMEIRO_BI', 'RENOVACAO_BI'],
    status: 'EM_ATENDIMENTO',
    activeTicketNumber: 'A-012',
    workstation: {
      workstationId: 'WS-ING-01',
      counterId: 'BALCAO-01',
      servicePointId: 'CSIC-ING-001',
      name: 'Cabine Operacional #01',
      ipAddress: '10.14.2.11',
      osVersion: 'SILA Secure Client 4.2.1',
      isReadyForCapture: true,
      devices: [
        {
          deviceId: 'DEV-CAM-01',
          category: 'CAMARA',
          name: 'CÂMARA FACIAL',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-CAM-99124',
          state: 'READY',
          lastPing: 'Há 5s',
          firmwareVersion: 'v2.1.4',
          healthMetrics: 'Calibração Ótica e Iluminação Conforme Perfil Institucional'
        },
        {
          deviceId: 'DEV-BIO-01',
          category: 'SCANNER_BIOMETRICO',
          name: 'BIOMETRIA 10 DEDOS',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-BIO-88210',
          state: 'READY',
          lastPing: 'Há 2s',
          firmwareVersion: 'v4.0.9',
          healthMetrics: 'Sensor Calibrado Conforme Perfil Institucional'
        },
        {
          deviceId: 'DEV-CARD-01',
          category: 'LEITOR_BI',
          name: 'LEITOR CARTÃO BI',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-CARD-11092',
          state: 'READY',
          lastPing: 'Há 12s',
          firmwareVersion: 'v1.8.0',
          healthMetrics: 'Interface Criptográfica Operacional'
        },
        {
          deviceId: 'DEV-SIG-01',
          category: 'PAD_ASSINATURA',
          name: 'ASSINATURA DIGITAL',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-SIG-77341',
          state: 'READY',
          lastPing: 'Há 8s',
          firmwareVersion: 'v3.2.0',
          healthMetrics: 'Calibração do Stylus Conforme Perfil Institucional'
        }
      ]
    },
    todayAttendedCount: 18,
    averageServiceMinutes: 14.5
  },
  {
    counterId: 'BALCAO-02',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória Ingombota',
    assignedOperatorId: 'OP-LUA-402',
    assignedOperatorName: 'Oficial Manuel Kiala',
    operatorRole: 'REGISTRATION_OFFICER',
    assignedServiceTypes: ['RENOVACAO_BI', 'SEGUNDA_VIA_BI'],
    status: 'DISPONIVEL',
    workstation: {
      workstationId: 'WS-ING-02',
      counterId: 'BALCAO-02',
      servicePointId: 'CSIC-ING-001',
      name: 'Cabine Operacional #02',
      ipAddress: '10.14.2.12',
      osVersion: 'SILA Secure Client 4.2.1',
      isReadyForCapture: true,
      devices: [
        {
          deviceId: 'DEV-CAM-02',
          category: 'CAMARA',
          name: 'CÂMARA FACIAL',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-CAM-99125',
          state: 'READY',
          lastPing: 'Há 3s',
          firmwareVersion: 'v2.1.4',
          healthMetrics: 'Calibração Conforme Perfil Institucional'
        },
        {
          deviceId: 'DEV-BIO-02',
          category: 'SCANNER_BIOMETRICO',
          name: 'BIOMETRIA 10 DEDOS',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-BIO-88211',
          state: 'READY',
          lastPing: 'Há 1s',
          firmwareVersion: 'v4.0.9',
          healthMetrics: 'Sensor Calibrado Conforme Perfil Institucional'
        },
        {
          deviceId: 'DEV-CARD-02',
          category: 'LEITOR_BI',
          name: 'LEITOR CARTÃO BI',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-CARD-11093',
          state: 'READY',
          lastPing: 'Há 10s',
          firmwareVersion: 'v1.8.0',
          healthMetrics: 'Interface Criptográfica Operacional'
        },
        {
          deviceId: 'DEV-SIG-02',
          category: 'PAD_ASSINATURA',
          name: 'ASSINATURA DIGITAL',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-SIG-77342',
          state: 'READY',
          lastPing: 'Há 7s',
          firmwareVersion: 'v3.2.0',
          healthMetrics: 'Calibração do Stylus Conforme Perfil Institucional'
        }
      ]
    },
    todayAttendedCount: 22,
    averageServiceMinutes: 11.2
  },
  {
    counterId: 'BALCAO-03',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória Ingombota',
    assignedOperatorId: 'OP-LUA-403',
    assignedOperatorName: 'Supervisora Maria Burity',
    operatorRole: 'SUPERVISOR',
    assignedServiceTypes: ['RECOLHA_BIOMETRICA_ESPECIAL', 'PRIMEIRO_BI'],
    status: 'DISPONIVEL',
    workstation: {
      workstationId: 'WS-ING-03',
      counterId: 'BALCAO-03',
      servicePointId: 'CSIC-ING-001',
      name: 'Cabine Operacional #03 (Especial)',
      ipAddress: '10.14.2.13',
      osVersion: 'SILA Secure Client 4.2.1',
      isReadyForCapture: false,
      devices: [
        {
          deviceId: 'DEV-CAM-03',
          category: 'CAMARA',
          name: 'CÂMARA FACIAL',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-CAM-99129',
          state: 'READY',
          lastPing: 'Há 2s',
          firmwareVersion: 'v2.1.4',
          healthMetrics: 'Calibração Conforme Perfil Institucional'
        },
        {
          deviceId: 'DEV-BIO-03',
          category: 'SCANNER_BIOMETRICO',
          name: 'BIOMETRIA 10 DEDOS',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-BIO-88219',
          state: 'READY',
          lastPing: 'Há 4s',
          firmwareVersion: 'v4.0.9',
          healthMetrics: 'Sensor Calibrado Conforme Perfil Institucional'
        },
        {
          deviceId: 'DEV-CARD-03',
          category: 'LEITOR_BI',
          name: 'LEITOR CARTÃO BI',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-CARD-11099',
          state: 'READY',
          lastPing: 'Há 6s',
          firmwareVersion: 'v1.8.0',
          healthMetrics: 'Interface Criptográfica Operacional'
        },
        {
          deviceId: 'DEV-SIG-03',
          category: 'PAD_ASSINATURA',
          name: 'ASSINATURA DIGITAL',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-SIG-77349',
          state: 'OFFLINE',
          lastPing: 'Sem resposta (22 min)',
          firmwareVersion: 'v3.2.0',
          healthMetrics: 'Cabo USB desconectado / Porta bloqueada'
        }
      ]
    },
    todayAttendedCount: 14,
    averageServiceMinutes: 19.8
  },
  {
    counterId: 'BALCAO-04',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória Ingombota',
    assignedOperatorId: 'OP-LUA-404',
    assignedOperatorName: 'Oficial António Zau',
    operatorRole: 'REGISTRATION_OFFICER',
    assignedServiceTypes: ['REGISTO_NASCIMENTO', 'CERTIDAO_NARRATIVA'],
    status: 'PAUSA_TECNICA',
    workstation: {
      workstationId: 'WS-ING-04',
      counterId: 'BALCAO-04',
      servicePointId: 'CSIC-ING-001',
      name: 'Cabine Operacional #04',
      ipAddress: '10.14.2.14',
      osVersion: 'SILA Secure Client 4.2.1',
      isReadyForCapture: false,
      devices: [
        {
          deviceId: 'DEV-CAM-04',
          category: 'CAMARA',
          name: 'CÂMARA FACIAL',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-CAM-99130',
          state: 'READY',
          lastPing: 'Há 1s',
          firmwareVersion: 'v2.1.4',
          healthMetrics: 'Pronta para recolha institucional'
        },
        {
          deviceId: 'DEV-BIO-04',
          category: 'SCANNER_BIOMETRICO',
          name: 'BIOMETRIA 10 DEDOS',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-BIO-88220',
          state: 'MAINTENANCE',
          lastPing: 'Em calibração',
          firmwareVersion: 'v4.0.9',
          healthMetrics: 'Calibração ótica pelo técnico do posto'
        },
        {
          deviceId: 'DEV-CARD-04',
          category: 'LEITOR_BI',
          name: 'LEITOR CARTÃO BI',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-CARD-11100',
          state: 'READY',
          lastPing: 'Há 15s',
          firmwareVersion: 'v1.8.0',
          healthMetrics: 'Interface Criptográfica Operacional'
        },
        {
          deviceId: 'DEV-SIG-04',
          category: 'PAD_ASSINATURA',
          name: 'ASSINATURA DIGITAL',
          model: 'Homologado Perfil SILA-2026',
          serialNumber: 'SN-SIG-77350',
          state: 'READY',
          lastPing: 'Há 2s',
          firmwareVersion: 'v3.2.0',
          healthMetrics: 'Calibração Conforme Perfil Institucional'
        }
      ]
    },
    todayAttendedCount: 12,
    averageServiceMinutes: 16.0
  }
];

// ENTIDADE CONGELADA NÚCLEO: AttendanceSession
export const INITIAL_ATTENDANCES: AttendanceSession[] = [
  {
    attendanceSessionId: 'ATD-2026-0815-001',
    ticketNumber: 'A-012',
    appointmentId: 'AGD-2026-00491',
    processId: 'PRC-2026-00812',
    citizenId: '007129841LA044',
    citizenName: 'Manuel Domingos de Oliveira',
    citizenPhone: '+244 923 441 890',
    serviceType: 'RENOVACAO_BI',
    territoryVersion: 'ANG_TERR_2026_V1',
    provinceId: 'PROV-LUA',
    municipalityId: 'MUN-ING',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória Ingombota',
    counterId: 'BALCAO-01',
    workstationId: 'WS-ING-01',
    operatorId: 'OP-LUA-401',
    operatorName: 'Oficial Esperança Neto',
    operatorRole: 'REGISTRATION_OFFICER',
    status: 'BIOMETRIC_CAPTURE',
    currentPhase: 'ESTACAO_BIOMETRIA',
    checkInAt: '2026-08-15 08:28:10',
    triageAt: '2026-08-15 08:31:00',
    calledAt: '2026-08-15 08:35:05',
    startedAt: '2026-08-15 08:36:12',
    biometricAt: '2026-08-15 08:42:00',
    fastTrack: true,
    fastTrackReason: 'Todos os 5 critérios cumpridos (Processo Validado, Docs Conforme, Id Resolvida, Bio Sim, 0 Pendências)',
    fastTrackEvaluation: {
      processStatus: 'VALIDADO',
      documentationStatus: 'CONFORME',
      identityStatus: 'RESOLVIDA',
      biometricsRequired: true,
      pendingIssuesCount: 0,
      isEligible: true,
      evaluatedAt: '2026-08-15 08:31:00',
      justification: 'Todos os 5 critérios de controlo cumpridos.'
    },
    biometricCaptureRef: 'BIO_REF_LUA_001_8892',
    photoCaptureRef: 'FOTO_REF_LUA_001_1120',
    signatureCaptureRef: 'SIG_REF_LUA_001_9901',
    biometricScores: {
      faceScore: 96,
      fingerprintsScore: 92,
      fingerprintsCount: 10,
      signatureValid: true,
      profileApplied: 'SILA_BIO_PROF_ANG_2026_V1',
      isCompliant: true,
      sha256Proof: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    },
    createdAt: '2026-08-15 08:28:10',
    updatedAt: '2026-08-15 08:42:00',
    auditRef: 'SILA_AUDIT_BLOCK_09_EVT_001'
  },
  {
    attendanceSessionId: 'ATD-2026-0815-002',
    ticketNumber: 'A-014',
    appointmentId: 'AGD-2026-00492',
    processId: 'PRC-2026-00815',
    citizenId: 'CIT-2026-99081',
    citizenName: 'Esperança Neves Kiala',
    citizenPhone: '+244 912 887 123',
    serviceType: 'PRIMEIRO_BI',
    territoryVersion: 'ANG_TERR_2026_V1',
    provinceId: 'PROV-LUA',
    municipalityId: 'MUN-ING',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória Ingombota',
    counterId: 'BALCAO-03',
    workstationId: 'WS-ING-03',
    operatorId: 'OP-LUA-403',
    operatorName: 'Supervisora Maria Burity',
    operatorRole: 'SUPERVISOR',
    status: 'QUEUED',
    currentPhase: 'ESPERA_CHAMADA',
    checkInAt: '2026-08-15 08:52:00',
    triageAt: '2026-08-15 08:55:00',
    fastTrack: true,
    fastTrackReason: 'Processo validado com certidão narrativa conforme.',
    fastTrackEvaluation: {
      processStatus: 'VALIDADO',
      documentationStatus: 'CONFORME',
      identityStatus: 'RESOLVIDA',
      biometricsRequired: true,
      pendingIssuesCount: 0,
      isEligible: true,
      evaluatedAt: '2026-08-15 08:55:00',
      justification: 'Todos os 5 critérios de controlo cumpridos.'
    },
    createdAt: '2026-08-15 08:52:00',
    updatedAt: '2026-08-15 08:55:00',
    auditRef: 'SILA_AUDIT_BLOCK_09_EVT_002'
  },
  {
    attendanceSessionId: 'ATD-2026-0815-003',
    ticketNumber: 'P-004',
    citizenId: '001928471LA011',
    citizenName: 'D. Augusta de Carvalho',
    citizenPhone: '+244 923 111 002',
    serviceType: 'RECOLHA_BIOMETRICA_ESPECIAL',
    territoryVersion: 'ANG_TERR_2026_V1',
    provinceId: 'PROV-LUA',
    municipalityId: 'MUN-ING',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória Ingombota',
    counterId: 'BALCAO-03',
    workstationId: 'WS-ING-03',
    operatorId: 'OP-LUA-403',
    operatorName: 'Supervisora Maria Burity',
    operatorRole: 'SUPERVISOR',
    status: 'CHECKED_IN',
    currentPhase: 'ACOLHIMENTO_TRIAGEM',
    checkInAt: '2026-08-15 09:05:00',
    fastTrack: false,
    fastTrackReason: 'Inelegível: Documentação incompleta (2 pendências documentais em aberto)',
    fastTrackEvaluation: {
      processStatus: 'EM_ANALISE',
      documentationStatus: 'INCOMPLETO',
      identityStatus: 'AMBIGUA',
      biometricsRequired: true,
      pendingIssuesCount: 2,
      isEligible: false,
      evaluatedAt: '2026-08-15 09:05:00',
      justification: 'Fast-Track inelegível: Documentação incompleta.'
    },
    createdAt: '2026-08-15 09:05:00',
    updatedAt: '2026-08-15 09:05:00',
    auditRef: 'SILA_AUDIT_BLOCK_09_EVT_003'
  },
  {
    attendanceSessionId: 'ATD-2026-0815-004',
    ticketNumber: 'A-010',
    appointmentId: 'AGD-2026-00488',
    processId: 'PRC-2026-00799',
    citizenId: '009182374LA088',
    citizenName: 'Teresa da Conceição Burity',
    citizenPhone: '+244 945 119 772',
    serviceType: 'RENOVACAO_BI',
    territoryVersion: 'ANG_TERR_2026_V1',
    provinceId: 'PROV-LUA',
    municipalityId: 'MUN-ING',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória Ingombota',
    counterId: 'BALCAO-02',
    workstationId: 'WS-ING-02',
    operatorId: 'OP-LUA-402',
    operatorName: 'Oficial Manuel Kiala',
    operatorRole: 'REGISTRATION_OFFICER',
    status: 'COMPLETED',
    currentPhase: 'FINALIZADO',
    checkInAt: '2026-08-15 08:05:00',
    triageAt: '2026-08-15 08:08:00',
    calledAt: '2026-08-15 08:12:00',
    startedAt: '2026-08-15 08:13:00',
    biometricAt: '2026-08-15 08:18:00',
    verificationAt: '2026-08-15 08:24:00',
    completedAt: '2026-08-15 08:26:00',
    fastTrack: true,
    fastTrackReason: 'Todos os 5 critérios cumpridos.',
    fastTrackEvaluation: {
      processStatus: 'VALIDADO',
      documentationStatus: 'CONFORME',
      identityStatus: 'RESOLVIDA',
      biometricsRequired: true,
      pendingIssuesCount: 0,
      isEligible: true,
      evaluatedAt: '2026-08-15 08:08:00',
      justification: 'Todos os 5 critérios de controlo cumpridos.'
    },
    biometricCaptureRef: 'BIO_REF_LUA_004_1182',
    photoCaptureRef: 'FOTO_REF_LUA_004_7731',
    signatureCaptureRef: 'SIG_REF_LUA_004_2209',
    biometricScores: {
      faceScore: 98,
      fingerprintsScore: 95,
      fingerprintsCount: 10,
      signatureValid: true,
      profileApplied: 'SILA_BIO_PROF_ANG_2026_V1',
      isCompliant: true,
      sha256Proof: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
    },
    validationRef: 'VAL_CORE_N10_998124',
    createdAt: '2026-08-15 08:05:00',
    updatedAt: '2026-08-15 08:26:00',
    auditRef: 'SILA_AUDIT_BLOCK_09_EVT_004'
  }
];

export const INITIAL_ATTENDANCE_AUDIT_LOGS: AttendanceAuditRecord[] = [
  {
    id: 'AUD-ATD-001',
    timestamp: '2026-08-15 08:28:15',
    attendanceSessionId: 'ATD-2026-0815-001',
    ticketNumber: 'A-012',
    servicePointId: 'CSIC-ING-001',
    counterId: 'TRIAGEM-01',
    operatorId: 'OP-LUA-403',
    operatorName: 'Supervisora Maria Burity',
    action: 'CHECK_IN',
    fromStatus: 'SCHEDULED',
    toStatus: 'CHECKED_IN',
    currentPhase: 'ACOLHIMENTO_TRIAGEM',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    currentHash: 'c12a4238a0b923820dcc509a6f75849be3b0c44298fc1c149afbf4c8996fb924',
    signature: 'SIG_ECDSA_LUA403_99ae7b2100dfac',
    reauthVerified: true,
    rbacResult: 'GRANTED',
    abacResult: 'GRANTED',
    auditRef: 'SILA_AUDIT_BLOCK_09_EVT_001',
    details: 'Check-in confirmado pelo posto de triagem para cidadão Manuel Domingos de Oliveira.'
  },
  {
    id: 'AUD-ATD-002',
    timestamp: '2026-08-15 08:31:05',
    attendanceSessionId: 'ATD-2026-0815-001',
    ticketNumber: 'A-012',
    servicePointId: 'CSIC-ING-001',
    counterId: 'TRIAGEM-01',
    operatorId: 'OP-LUA-403',
    operatorName: 'Supervisora Maria Burity',
    action: 'APROVAR_TRIAGEM_FILA',
    fromStatus: 'TRIAGE',
    toStatus: 'QUEUED',
    currentPhase: 'ESPERA_CHAMADA',
    previousHash: 'c12a4238a0b923820dcc509a6f75849be3b0c44298fc1c149afbf4c8996fb924',
    currentHash: '77ae8812c3fbe1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signature: 'SIG_ECDSA_LUA403_44de8812c3fba2',
    reauthVerified: true,
    rbacResult: 'GRANTED',
    abacResult: 'GRANTED',
    auditRef: 'SILA_AUDIT_BLOCK_09_EVT_002',
    details: 'Triagem e elegibilidade Fast-Track validadas com sucesso.'
  },
  {
    id: 'AUD-ATD-003',
    timestamp: '2026-08-15 08:35:10',
    attendanceSessionId: 'ATD-2026-0815-001',
    ticketNumber: 'A-012',
    servicePointId: 'CSIC-ING-001',
    counterId: 'BALCAO-01',
    operatorId: 'OP-LUA-401',
    operatorName: 'Oficial Esperança Neto',
    action: 'CHAMAR_SENHA',
    fromStatus: 'QUEUED',
    toStatus: 'CALLED',
    currentPhase: 'CABINE_ATENDIMENTO',
    previousHash: '77ae8812c3fbe1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    currentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signature: 'SIG_ECDSA_LUA401_77de8812c3fbe1',
    reauthVerified: true,
    rbacResult: 'GRANTED',
    abacResult: 'GRANTED',
    auditRef: 'SILA_AUDIT_BLOCK_09_EVT_003',
    details: 'Senha chamada para atendimento no BALCAO-01.'
  },
  {
    id: 'AUD-ATD-004',
    timestamp: '2026-08-15 08:42:15',
    attendanceSessionId: 'ATD-2026-0815-001',
    ticketNumber: 'A-012',
    servicePointId: 'CSIC-ING-001',
    counterId: 'BALCAO-01',
    operatorId: 'OP-LUA-401',
    operatorName: 'Oficial Esperança Neto',
    action: 'INICIAR_CAPTURA_BIOMETRICA',
    fromStatus: 'IN_SERVICE',
    toStatus: 'BIOMETRIC_CAPTURE',
    currentPhase: 'ESTACAO_BIOMETRIA',
    previousHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    currentHash: '872e4e50ce9990d8b041330c47c9ddd11bec6b503ae9386a99da8584e9bb12c4',
    signature: 'SIG_ECDSA_LUA401_11ab3466f91ec0',
    reauthVerified: true,
    rbacResult: 'GRANTED',
    abacResult: 'GRANTED',
    auditRef: 'SILA_AUDIT_BLOCK_09_EVT_004',
    details: 'Recolha biométrica física homologada segundo SILA_BIO_PROF_ANG_2026_V1 (Face 96%, 10 Dedos 92%, Assinatura OK).'
  }
];
