import { ServicePoint } from './territory';

export type AppointmentStatus = 
  | 'MARCADO' 
  | 'CONFIRMADO' 
  | 'PRESENTE' 
  | 'EM_ATENDIMENTO' 
  | 'CONCLUIDO' 
  | 'CANCELADO' 
  | 'NAO_COMPARECEU';

export type ServiceType = 
  | 'PRIMEIRO_BI' 
  | 'RENOVACAO_BI' 
  | 'SEGUNDA_VIA_BI' 
  | 'REGISTO_NASCIMENTO' 
  | 'CERTIDAO_NARRATIVA' 
  | 'RECOLHA_BIOMETRICA_ESPECIAL';

export interface ServiceDefinition {
  id: ServiceType;
  title: string;
  category: 'IDENTIFICACAO_CIVIL' | 'REGISTO_CIVIL' | 'SERVICOS_ESPECIAIS';
  durationMinutes: number;
  requiresBiometrics: boolean;
  requiresPhotography: boolean;
  legalBase: string; // e.g. "Decreto Presidencial 12/18"
}

// 05 — POLÍTICAS DE AGENDAMENTO (AppointmentPolicy)
export interface AppointmentPolicy {
  id: string; // e.g. "POL-PRIMEIRO-BI-01"
  serviceType: ServiceType;
  minAdvanceDays: number;       // Janela mínima de agendamento prévio (dias)
  maxAdvanceDays: number;       // Janela máxima de agendamento (dias)
  cancellationDeadlineHours: number; // Prazo limite para cancelamento (horas antes)
  toleranceMinutes: number;     // Tolerância de atraso no check-in (minutos)
  maxSimultaneousPerCitizen: number; // Limite de agendamentos ativos simultâneos por cidadão
  maxDailyCapacityPerCounter: number; // Limite diário por balcão
  requiresNationalIdPrecheck: boolean; // Validação prévia de BI se aplicável
  priorityTier: 'NORMAL' | 'PRIORITARIO_INCLUSIVO' | 'URGENTE_OFICIAL';
  status: 'ACTIVE' | 'INACTIVE';
  validFrom: string;
  notes: string;
}

// 03 & 07 — SLOTS & CONTROLO DE EMERGÊNCIA
export interface SlotAvailability {
  id: string; // e.g. "SLOT-LUA-ING-20260815-0900"
  servicePointId: string;
  servicePointName: string;
  provinceCode: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM (e.g. "09:00 - 09:30")
  totalCapacity: number;
  bookedCount: number;
  reservedEmergencyCount: number;
  isLocked: boolean;
  lockReason?: string;
  lockedBy?: string;
  lockedAt?: string;
}

export interface EmergencySlotLockEvent {
  id: string;
  slotId: string;
  servicePointId: string;
  action: 'SLOT_LOCKED' | 'SLOT_UNLOCKED' | 'CAPACITY_OVERRIDE';
  operator: string;
  operatorRole: string;
  reason: string;
  timestamp: string;
  affectedCapacity: number;
  previousState: 'ABERTO' | 'BLOQUEADO';
  newState: 'ABERTO' | 'BLOQUEADO';
  auditId: string;
  globalAuditSynced: boolean;
}

// 01 — AGENDAMENTO (Appointment com Snapshot Territorial Imutável)
export interface Appointment {
  id: string; // e.g. "AGD-2026-00492"
  protocolNumber: string; // e.g. "PRT-SILA-9921"
  citizenName: string;
  citizenBiNumber?: string;
  citizenPhone: string;
  citizenEmail?: string;
  serviceType: ServiceType;
  servicePointId: string;
  servicePointName: string;
  provinceCode: string;
  date: string;
  timeSlot: string;
  counterId?: string; // Balcão 1, 2, etc.
  status: AppointmentStatus;
  createdAt: string;
  confirmedAt?: string;
  checkInAt?: string;
  calledAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  noShowAt?: string;
  jurisdictionSnapshot: {
    territoryVersion: string;
    provinceId: string;
    municipalityId: string;
    communeId?: string;
    servicePointId: string;
    sha256Proof: string;
  };
  hash: string;
}

// 02 — CAPACIDADE DERIVADA DOS POSTOS
export interface DailyServicePointCapacity {
  servicePointId: string;
  servicePointName: string;
  provinceCode: string;
  date: string;
  nominalCapacity: number;        // Capacidade nominal de infraestrutura (Nó 07)
  activeCountersCount: number;    // Balcões operacionais físicos
  availableOperatorsCount: number;// Operadores escalados
  slotsCreatedCount: number;      // Vagas abertas geradas
  slotsBookedCount: number;       // Marcados
  slotsPresentCount: number;      // Presentes no recinto
  slotsAttendedCount: number;     // Atendidos/Concluídos
  slotsNoShowCount: number;       // Não compareceram
  slotsCancelledCount: number;    // Cancelados
  occupancyRatePercent: number;   // Taxa de ocupação calculada
  status: 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERLOADED' | 'MAINTENANCE';
}

// 06 — FILA OPERACIONAL (Queue Ticket)
export interface OperationalQueueTicket {
  ticketNumber: string; // e.g. "A-014", "P-003"
  appointmentId: string;
  protocolNumber: string;
  citizenName: string;
  serviceType: ServiceType;
  servicePointId: string;
  counterId?: string;
  operatorId?: string;
  queueStatus: 'AGUARDANDO_CHAMADA' | 'CHAMADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'DESISTENCIA';
  checkInTime: string;
  calledTime?: string;
  waitTimeMinutes: number;
  priorityTier: 'NORMAL' | 'PRIORITARIO_INCLUSIVO' | 'URGENTE_OFICIAL';
}

// 08 — AUDITORIA OPERACIONAL DO MÓDULO 08 COM ROTEAMENTO AO SILA AUDIT ENGINE
export interface AppointmentAuditRecord {
  id: string;
  timestamp: string;
  appointmentId: string;
  servicePointId: string;
  operatorName: string;
  operatorRole: string;
  action: 
    | 'CRIAR_MARCACAO' 
    | 'CONFIRMAR' 
    | 'CHECKIN_PRESENCA' 
    | 'CHAMAR_SENHA' 
    | 'CONCLUIR' 
    | 'CANCELAR' 
    | 'REGISTAR_NAO_COMPARECIMENTO'
    | 'BLOQUEAR_SLOTS'
    | 'DESBLOQUEAR_SLOTS'
    | 'ATUALIZAR_POLITICA';
  previousStatus?: AppointmentStatus;
  newStatus?: AppointmentStatus;
  previousHash: string;
  currentHash: string;
  silaGlobalAuditRef: string; // Encaminhamento transversal para o SILA AUDIT ENGINE
  details: string;
}
