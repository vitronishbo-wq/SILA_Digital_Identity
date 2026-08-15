import { 
  Appointment, 
  DailyServicePointCapacity, 
  SlotAvailability, 
  ServiceDefinition,
  AppointmentPolicy,
  EmergencySlotLockEvent,
  OperationalQueueTicket,
  AppointmentAuditRecord 
} from '../types/appointments';

// 04 — CATÁLOGO DE SERVIÇOS QUE PODEM SER AGENDADOS
export const INITIAL_SERVICE_DEFINITIONS: ServiceDefinition[] = [
  {
    id: 'PRIMEIRO_BI',
    title: 'Emissão do 1.º Bilhete de Identidade (Nacional)',
    category: 'IDENTIFICACAO_CIVIL',
    durationMinutes: 20,
    requiresBiometrics: true,
    requiresPhotography: true,
    legalBase: 'Lei n.º 04/09 & Dec. Pres. 12/18'
  },
  {
    id: 'RENOVACAO_BI',
    title: 'Renovação Ordinária de Bilhete de Identidade',
    category: 'IDENTIFICACAO_CIVIL',
    durationMinutes: 15,
    requiresBiometrics: true,
    requiresPhotography: true,
    legalBase: 'Dec. Executivo 28/22'
  },
  {
    id: 'SEGUNDA_VIA_BI',
    title: 'Segunda Via por Extravio / Deterioração',
    category: 'IDENTIFICACAO_CIVIL',
    durationMinutes: 15,
    requiresBiometrics: true,
    requiresPhotography: true,
    legalBase: 'Dec. Executivo 28/22'
  },
  {
    id: 'REGISTO_NASCIMENTO',
    title: 'Assento e Registo de Nascimento Presencial',
    category: 'REGISTO_CIVIL',
    durationMinutes: 25,
    requiresBiometrics: false,
    requiresPhotography: false,
    legalBase: 'Código do Registo Civil'
  },
  {
    id: 'CERTIDAO_NARRATIVA',
    title: 'Emissão de Certidão Narrativa Completa',
    category: 'REGISTO_CIVIL',
    durationMinutes: 10,
    requiresBiometrics: false,
    requiresPhotography: false,
    legalBase: 'Código do Registo Civil'
  },
  {
    id: 'RECOLHA_BIOMETRICA_ESPECIAL',
    title: 'Recolha Biometria Especial / Atendimento Prioritário',
    category: 'SERVICOS_ESPECIAIS',
    durationMinutes: 30,
    requiresBiometrics: true,
    requiresPhotography: true,
    legalBase: 'Regulamento de Atendimento Inclusivo MJDH'
  }
];

// 05 — POLÍTICAS DE AGENDAMENTO
export const INITIAL_APPOINTMENT_POLICIES: AppointmentPolicy[] = [
  {
    id: 'POL-PRIMEIRO-BI-01',
    serviceType: 'PRIMEIRO_BI',
    minAdvanceDays: 1,
    maxAdvanceDays: 30,
    cancellationDeadlineHours: 12,
    toleranceMinutes: 15,
    maxSimultaneousPerCitizen: 1,
    maxDailyCapacityPerCounter: 35,
    requiresNationalIdPrecheck: false,
    priorityTier: 'NORMAL',
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    notes: 'Exige assento de nascimento prévio digitalizado.'
  },
  {
    id: 'POL-RENOVACAO-BI-01',
    serviceType: 'RENOVACAO_BI',
    minAdvanceDays: 1,
    maxAdvanceDays: 45,
    cancellationDeadlineHours: 6,
    toleranceMinutes: 15,
    maxSimultaneousPerCitizen: 1,
    maxDailyCapacityPerCounter: 40,
    requiresNationalIdPrecheck: true,
    priorityTier: 'NORMAL',
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    notes: 'Validação automática do número de BI existente no nó 04.'
  },
  {
    id: 'POL-SEGUNDA-VIA-01',
    serviceType: 'SEGUNDA_VIA_BI',
    minAdvanceDays: 1,
    maxAdvanceDays: 15,
    cancellationDeadlineHours: 6,
    toleranceMinutes: 15,
    maxSimultaneousPerCitizen: 1,
    maxDailyCapacityPerCounter: 30,
    requiresNationalIdPrecheck: true,
    priorityTier: 'NORMAL',
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    notes: 'Requer auto de extravio policial ou declaração formal anexada.'
  },
  {
    id: 'POL-REGISTO-NASC-01',
    serviceType: 'REGISTO_NASCIMENTO',
    minAdvanceDays: 0,
    maxAdvanceDays: 60,
    cancellationDeadlineHours: 4,
    toleranceMinutes: 20,
    maxSimultaneousPerCitizen: 2,
    maxDailyCapacityPerCounter: 25,
    requiresNationalIdPrecheck: false,
    priorityTier: 'PRIORITARIO_INCLUSIVO',
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    notes: 'Prioridade mãe e recém-nascido conforme decreto do MJDH.'
  },
  {
    id: 'POL-CERTIDAO-01',
    serviceType: 'CERTIDAO_NARRATIVA',
    minAdvanceDays: 0,
    maxAdvanceDays: 15,
    cancellationDeadlineHours: 2,
    toleranceMinutes: 10,
    maxSimultaneousPerCitizen: 3,
    maxDailyCapacityPerCounter: 50,
    requiresNationalIdPrecheck: false,
    priorityTier: 'NORMAL',
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    notes: 'Emissão rápida em balcão automatizado.'
  },
  {
    id: 'POL-BIOMETRIA-ESP-01',
    serviceType: 'RECOLHA_BIOMETRICA_ESPECIAL',
    minAdvanceDays: 2,
    maxAdvanceDays: 20,
    cancellationDeadlineHours: 24,
    toleranceMinutes: 30,
    maxSimultaneousPerCitizen: 1,
    maxDailyCapacityPerCounter: 15,
    requiresNationalIdPrecheck: false,
    priorityTier: 'URGENTE_OFICIAL',
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    notes: 'Cabine móvel / atendimento assistido a cidadãos com mobilidade reduzida.'
  }
];

// 03 — SLOTS DE DISPONIBILIDADE
export const INITIAL_SLOT_AVAILABILITIES: SlotAvailability[] = [
  {
    id: 'SLOT-ING-0830',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória do Registo Civil & Posto BI - Ingombota',
    provinceCode: 'LUA',
    date: '2026-08-15',
    timeSlot: '08:30 - 09:00',
    totalCapacity: 30,
    bookedCount: 28,
    reservedEmergencyCount: 2,
    isLocked: false
  },
  {
    id: 'SLOT-ING-0900',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória do Registo Civil & Posto BI - Ingombota',
    provinceCode: 'LUA',
    date: '2026-08-15',
    timeSlot: '09:00 - 09:30',
    totalCapacity: 30,
    bookedCount: 30,
    reservedEmergencyCount: 0,
    isLocked: true,
    lockReason: 'SOBRELOTAÇÃO_DETECTADA_PELO_SISTEMA',
    lockedBy: 'SuperAdmin Deusfundador',
    lockedAt: '2026-08-15 07:45'
  },
  {
    id: 'SLOT-ING-0930',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória do Registo Civil & Posto BI - Ingombota',
    provinceCode: 'LUA',
    date: '2026-08-15',
    timeSlot: '09:30 - 10:00',
    totalCapacity: 30,
    bookedCount: 24,
    reservedEmergencyCount: 2,
    isLocked: false
  },
  {
    id: 'SLOT-ING-1000',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória do Registo Civil & Posto BI - Ingombota',
    provinceCode: 'LUA',
    date: '2026-08-15',
    timeSlot: '10:00 - 10:30',
    totalCapacity: 30,
    bookedCount: 19,
    reservedEmergencyCount: 3,
    isLocked: false
  },
  {
    id: 'SLOT-TAL-0900',
    servicePointId: 'POSTO-TAL-002',
    servicePointName: 'Posto de Identificação Civil - Talatona (SIAC)',
    provinceCode: 'LUA',
    date: '2026-08-15',
    timeSlot: '09:00 - 09:30',
    totalCapacity: 25,
    bookedCount: 22,
    reservedEmergencyCount: 2,
    isLocked: false
  },
  {
    id: 'SLOT-HUA-0900',
    servicePointId: 'CSIC-HUA-001',
    servicePointName: 'Conservatória do Registo Civil de Huambo Sede',
    provinceCode: 'HUA',
    date: '2026-08-15',
    timeSlot: '09:00 - 09:30',
    totalCapacity: 20,
    bookedCount: 14,
    reservedEmergencyCount: 2,
    isLocked: false
  }
];

// 01 — AGENDAMENTOS (Com estado NÃO_COMPARECEU e snapshot territorial completo)
export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'AGD-2026-00491',
    protocolNumber: 'PRT-SILA-9901',
    citizenName: 'Manuel Domingos de Oliveira',
    citizenBiNumber: '007129841LA044',
    citizenPhone: '+244 923 441 890',
    citizenEmail: 'm.oliveira@angola.ao',
    serviceType: 'RENOVACAO_BI',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória do Registo Civil & Posto BI - Ingombota',
    provinceCode: 'LUA',
    date: '2026-08-15',
    timeSlot: '08:30 - 09:00',
    counterId: 'BALCAO-03',
    status: 'EM_ATENDIMENTO',
    createdAt: '2026-08-10 11:20',
    confirmedAt: '2026-08-10 11:22',
    checkInAt: '2026-08-15 08:28',
    calledAt: '2026-08-15 08:35',
    jurisdictionSnapshot: {
      territoryVersion: 'TERR_VER_2026_01',
      provinceId: 'LUA',
      municipalityId: 'LUA-muni-1',
      communeId: 'LUA-com-ing',
      servicePointId: 'CSIC-ING-001',
      sha256Proof: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
    },
    hash: 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: 'AGD-2026-00492',
    protocolNumber: 'PRT-SILA-9902',
    citizenName: 'Esperança Neves Kiala',
    citizenBiNumber: '008912344LA099',
    citizenPhone: '+244 912 887 123',
    citizenEmail: 'esperanca.kiala@net.ao',
    serviceType: 'PRIMEIRO_BI',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória do Registo Civil & Posto BI - Ingombota',
    provinceCode: 'LUA',
    date: '2026-08-15',
    timeSlot: '09:00 - 09:30',
    counterId: 'BALCAO-01',
    status: 'PRESENTE',
    createdAt: '2026-08-11 14:05',
    confirmedAt: '2026-08-11 14:06',
    checkInAt: '2026-08-15 08:52',
    jurisdictionSnapshot: {
      territoryVersion: 'TERR_VER_2026_01',
      provinceId: 'LUA',
      municipalityId: 'LUA-muni-1',
      communeId: 'LUA-com-ing',
      servicePointId: 'CSIC-ING-001',
      sha256Proof: '8f92b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9070'
    },
    hash: 'b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef12'
  },
  {
    id: 'AGD-2026-00493',
    protocolNumber: 'PRT-SILA-9903',
    citizenName: 'António Bento Capingana',
    citizenBiNumber: '004128912HU031',
    citizenPhone: '+244 934 551 002',
    serviceType: 'SEGUNDA_VIA_BI',
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória do Registo Civil & Posto BI - Ingombota',
    provinceCode: 'LUA',
    date: '2026-08-15',
    timeSlot: '09:30 - 10:00',
    status: 'CONFIRMADO',
    createdAt: '2026-08-12 09:40',
    confirmedAt: '2026-08-12 09:41',
    jurisdictionSnapshot: {
      territoryVersion: 'TERR_VER_2026_01',
      provinceId: 'LUA',
      municipalityId: 'LUA-muni-1',
      communeId: 'LUA-com-ing',
      servicePointId: 'CSIC-ING-001',
      sha256Proof: '9f01b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9071'
    },
    hash: 'c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef1234'
  },
  {
    id: 'AGD-2026-00494',
    protocolNumber: 'PRT-SILA-9904',
    citizenName: 'Teresa da Conceição Burity',
    citizenBiNumber: '009182374LA088',
    citizenPhone: '+244 945 119 772',
    serviceType: 'REGISTO_NASCIMENTO',
    servicePointId: 'POSTO-TAL-002',
    servicePointName: 'Posto de Identificação Civil - Talatona (SIAC)',
    provinceCode: 'LUA',
    date: '2026-08-15',
    timeSlot: '09:00 - 09:30',
    status: 'CONCLUIDO',
    createdAt: '2026-08-12 16:15',
    confirmedAt: '2026-08-12 16:16',
    checkInAt: '2026-08-15 08:45',
    completedAt: '2026-08-15 09:12',
    jurisdictionSnapshot: {
      territoryVersion: 'TERR_VER_2026_01',
      provinceId: 'LUA',
      municipalityId: 'LUA-muni-2',
      communeId: 'LUA-com-tal',
      servicePointId: 'POSTO-TAL-002',
      sha256Proof: 'af12b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9072'
    },
    hash: 'd4e5f678901234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: 'AGD-2026-00495',
    protocolNumber: 'PRT-SILA-9905',
    citizenName: 'João Garcia Zau',
    citizenBiNumber: '006129841CA012',
    citizenPhone: '+244 928 331 445',
    serviceType: 'PRIMEIRO_BI',
    servicePointId: 'CSIC-HUA-001',
    servicePointName: 'Conservatória do Registo Civil de Huambo Sede',
    provinceCode: 'HUA',
    date: '2026-08-15',
    timeSlot: '09:00 - 09:30',
    status: 'NAO_COMPARECEU',
    createdAt: '2026-08-14 18:20',
    confirmedAt: '2026-08-14 18:21',
    noShowAt: '2026-08-15 09:45',
    jurisdictionSnapshot: {
      territoryVersion: 'TERR_VER_2026_01',
      provinceId: 'HUA',
      municipalityId: 'HUA-muni-1',
      communeId: 'HUA-com-sede',
      servicePointId: 'CSIC-HUA-001',
      sha256Proof: 'bf23b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9073'
    },
    hash: 'e5f678901234567890abcdef1234567890abcdef1234567890abcdef12345678'
  }
];

// 02 — CAPACIDADE DOS POSTOS (Derivada com separação explícita de métricas operacionais)
export const INITIAL_DAILY_CAPACITIES: DailyServicePointCapacity[] = [
  {
    servicePointId: 'CSIC-ING-001',
    servicePointName: 'Conservatória do Registo Civil & Posto BI - Ingombota',
    provinceCode: 'LUA',
    date: '2026-08-15',
    nominalCapacity: 450,
    activeCountersCount: 12,
    availableOperatorsCount: 14,
    slotsCreatedCount: 420,
    slotsBookedCount: 395,
    slotsPresentCount: 180,
    slotsAttendedCount: 168,
    slotsNoShowCount: 12,
    slotsCancelledCount: 5,
    occupancyRatePercent: 94,
    status: 'NEAR_CAPACITY'
  },
  {
    servicePointId: 'POSTO-TAL-002',
    servicePointName: 'Posto de Identificação Civil - Talatona (SIAC)',
    provinceCode: 'LUA',
    date: '2026-08-15',
    nominalCapacity: 300,
    activeCountersCount: 8,
    availableOperatorsCount: 8,
    slotsCreatedCount: 280,
    slotsBookedCount: 210,
    slotsPresentCount: 102,
    slotsAttendedCount: 94,
    slotsNoShowCount: 6,
    slotsCancelledCount: 2,
    occupancyRatePercent: 75,
    status: 'OPTIMAL'
  },
  {
    servicePointId: 'BALCAO-VIA-003',
    servicePointName: 'Balcão Digital SILA - Viana Zango 8000',
    provinceCode: 'LUA',
    date: '2026-08-15',
    nominalCapacity: 600,
    activeCountersCount: 16,
    availableOperatorsCount: 18,
    slotsCreatedCount: 560,
    slotsBookedCount: 540,
    slotsPresentCount: 235,
    slotsAttendedCount: 220,
    slotsNoShowCount: 10,
    slotsCancelledCount: 8,
    occupancyRatePercent: 96,
    status: 'NEAR_CAPACITY'
  },
  {
    servicePointId: 'CSIC-HUA-001',
    servicePointName: 'Conservatória do Registo Civil de Huambo Sede',
    provinceCode: 'HUA',
    date: '2026-08-15',
    nominalCapacity: 280,
    activeCountersCount: 7,
    availableOperatorsCount: 7,
    slotsCreatedCount: 260,
    slotsBookedCount: 180,
    slotsPresentCount: 82,
    slotsAttendedCount: 75,
    slotsNoShowCount: 7,
    slotsCancelledCount: 1,
    occupancyRatePercent: 69,
    status: 'OPTIMAL'
  },
  {
    servicePointId: 'POSTO-BGU-001',
    servicePointName: 'Posto de Atendimento do Lobito Restinga',
    provinceCode: 'BGU',
    date: '2026-08-15',
    nominalCapacity: 180,
    activeCountersCount: 2,
    availableOperatorsCount: 2,
    slotsCreatedCount: 80,
    slotsBookedCount: 80,
    slotsPresentCount: 42,
    slotsAttendedCount: 40,
    slotsNoShowCount: 2,
    slotsCancelledCount: 0,
    occupancyRatePercent: 100,
    status: 'OVERLOADED'
  }
];

// 06 — FILA OPERACIONAL (Tickets ativos)
export const INITIAL_OPERATIONAL_QUEUE: OperationalQueueTicket[] = [
  {
    ticketNumber: 'A-012',
    appointmentId: 'AGD-2026-00491',
    protocolNumber: 'PRT-SILA-9901',
    citizenName: 'Manuel Domingos de Oliveira',
    serviceType: 'RENOVACAO_BI',
    servicePointId: 'CSIC-ING-001',
    counterId: 'BALCAO-03',
    operatorId: 'OP-LUA-402',
    queueStatus: 'EM_ATENDIMENTO',
    checkInTime: '08:28',
    calledTime: '08:35',
    waitTimeMinutes: 7,
    priorityTier: 'NORMAL'
  },
  {
    ticketNumber: 'A-014',
    appointmentId: 'AGD-2026-00492',
    protocolNumber: 'PRT-SILA-9902',
    citizenName: 'Esperança Neves Kiala',
    serviceType: 'PRIMEIRO_BI',
    servicePointId: 'CSIC-ING-001',
    counterId: 'BALCAO-01',
    queueStatus: 'AGUARDANDO_CHAMADA',
    checkInTime: '08:52',
    waitTimeMinutes: 12,
    priorityTier: 'NORMAL'
  }
];

// 07 — REGISTOS DE CONTROLO DE EMERGÊNCIA
export const INITIAL_EMERGENCY_LOCK_EVENTS: EmergencySlotLockEvent[] = [
  {
    id: 'EMG-LOCK-001',
    slotId: 'SLOT-ING-0900',
    servicePointId: 'CSIC-ING-001',
    action: 'SLOT_LOCKED',
    operator: 'SuperAdmin Deusfundador',
    operatorRole: 'GOVERNANCE_ADMIN',
    reason: 'Intervenção técnica temporária no posto biométrico 02 e sobrelotação do recinto.',
    timestamp: '2026-08-15 07:45:00',
    affectedCapacity: 30,
    previousState: 'ABERTO',
    newState: 'BLOQUEADO',
    auditId: 'AUD-AGD-100',
    globalAuditSynced: true
  }
];

// 08 — AUDITORIA OPERACIONAL DO MÓDULO 08 COM REF AO SILA AUDIT ENGINE
export const INITIAL_APPOINTMENT_AUDIT_LOGS: AppointmentAuditRecord[] = [
  {
    id: 'AUD-AGD-100',
    timestamp: '2026-08-15 07:45:00',
    appointmentId: 'SLOT-ING-0900',
    servicePointId: 'CSIC-ING-001',
    operatorName: 'SuperAdmin Deusfundador',
    operatorRole: 'GOVERNANCE_ADMIN',
    action: 'BLOQUEAR_SLOTS',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    currentHash: 'c12a4238a0b923820dcc509a6f75849be3b0c44298fc1c149afbf4c8996fb924',
    silaGlobalAuditRef: 'SILA_AUDIT_BLOCK_08_GEN_9901',
    details: 'Bloqueio emergencial de slot com justificativa operacional gravada no GovOS.'
  },
  {
    id: 'AUD-AGD-101',
    timestamp: '2026-08-15 08:28:10',
    appointmentId: 'AGD-2026-00491',
    servicePointId: 'CSIC-ING-001',
    operatorName: 'Dra. Maria Burity',
    operatorRole: 'PROVINCIAL_ADMIN',
    action: 'CHECKIN_PRESENCA',
    previousStatus: 'CONFIRMADO',
    newStatus: 'PRESENTE',
    previousHash: 'c12a4238a0b923820dcc509a6f75849be3b0c44298fc1c149afbf4c8996fb924',
    currentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    silaGlobalAuditRef: 'SILA_AUDIT_BLOCK_08_GEN_9902',
    details: 'Validação presencial do utente na triagem com atribuição de senha A-012.'
  },
  {
    id: 'AUD-AGD-102',
    timestamp: '2026-08-15 08:35:00',
    appointmentId: 'AGD-2026-00491',
    servicePointId: 'CSIC-ING-001',
    operatorName: 'Oficial João Kiala',
    operatorRole: 'REGISTRATION_OFFICER',
    action: 'CHAMAR_SENHA',
    previousStatus: 'PRESENTE',
    newStatus: 'EM_ATENDIMENTO',
    previousHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    currentHash: '872e4e50ce9990d8b041330c47c9ddd11bec6b503ae9386a99da8584e9bb12c4',
    silaGlobalAuditRef: 'SILA_AUDIT_BLOCK_08_GEN_9903',
    details: 'Chamada de senha para o Balcão 03 com posto biométrico ativado.'
  }
];
