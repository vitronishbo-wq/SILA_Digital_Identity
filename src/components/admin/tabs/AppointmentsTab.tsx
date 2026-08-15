import React, { useState } from 'react';
import { 
  Appointment, 
  AppointmentStatus, 
  DailyServicePointCapacity, 
  SlotAvailability, 
  ServiceDefinition,
  AppointmentPolicy,
  EmergencySlotLockEvent,
  OperationalQueueTicket,
  AppointmentAuditRecord,
  ServiceType
} from '../../../types/appointments';
import { 
  INITIAL_APPOINTMENTS, 
  INITIAL_DAILY_CAPACITIES, 
  INITIAL_SLOT_AVAILABILITIES, 
  INITIAL_SERVICE_DEFINITIONS, 
  INITIAL_APPOINTMENT_POLICIES,
  INITIAL_EMERGENCY_LOCK_EVENTS,
  INITIAL_OPERATIONAL_QUEUE,
  INITIAL_APPOINTMENT_AUDIT_LOGS 
} from '../../../data/appointments';
import { 
  Calendar, Clock, CheckCircle2, UserCheck, AlertTriangle, ShieldCheck, 
  Plus, Search, Filter, Lock, Unlock, X, RefreshCw, Layers, ArrowRight,
  MapPin, Check, Ban, Sparkles, Building, Activity, Users, FileCheck, Sliders, AlertOctagon
} from 'lucide-react';

interface AppointmentsTabProps {
  onOpenReauth?: () => void;
  onOpenPolicyInspector?: () => void;
  onOpenOrgSelector?: () => void;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  onOpenReauth,
  onOpenPolicyInspector,
  onOpenOrgSelector
}) => {
  // Navigation Sub-tabs (Estrutura Completa dos 8 nós)
  const [subTab, setSubTab] = useState<
    | '01_AGENDA' 
    | '02_CAPACIDADE' 
    | '03_SLOTS' 
    | '04_SERVICOS' 
    | '05_POLITICAS' 
    | '06_FILA_OPERACIONAL' 
    | '07_CONTROLO_EMERGENCIA' 
    | '08_AUDITORIA'
  >('01_AGENDA');

  // Datasets State
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [capacities, setCapacities] = useState<DailyServicePointCapacity[]>(INITIAL_DAILY_CAPACITIES);
  const [slots, setSlots] = useState<SlotAvailability[]>(INITIAL_SLOT_AVAILABILITIES);
  const [services] = useState<ServiceDefinition[]>(INITIAL_SERVICE_DEFINITIONS);
  const [policies, setPolicies] = useState<AppointmentPolicy[]>(INITIAL_APPOINTMENT_POLICIES);
  const [queueTickets, setQueueTickets] = useState<OperationalQueueTicket[]>(INITIAL_OPERATIONAL_QUEUE);
  const [lockEvents, setLockEvents] = useState<EmergencySlotLockEvent[]>(INITIAL_EMERGENCY_LOCK_EVENTS);
  const [auditLogs, setAuditLogs] = useState<AppointmentAuditRecord[]>(INITIAL_APPOINTMENT_AUDIT_LOGS);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | AppointmentStatus>('ALL');
  const [servicePointFilter, setServicePointFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState<boolean>(false);
  const [emergencyLockSlotTarget, setEmergencyLockSlotTarget] = useState<SlotAvailability | null>(null);
  const [emergencyReasonInput, setEmergencyReasonInput] = useState<string>('');

  // New Appointment Form State
  const [formCitizenName, setFormCitizenName] = useState('');
  const [formCitizenBi, setFormCitizenBi] = useState('');
  const [formCitizenPhone, setFormCitizenPhone] = useState('');
  const [formServiceType, setFormServiceType] = useState<ServiceType>('PRIMEIRO_BI');
  const [formServicePointId, setFormServicePointId] = useState('CSIC-ING-001');
  const [formTimeSlot, setFormTimeSlot] = useState('09:30 - 10:00');

  // Filtered Appointments
  const filteredAppointments = appointments.filter(app => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (servicePointFilter !== 'ALL' && app.servicePointId !== servicePointFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.citizenName.toLowerCase().includes(q);
      const matchId = app.id.toLowerCase().includes(q);
      const matchProt = app.protocolNumber.toLowerCase().includes(q);
      const matchBi = app.citizenBiNumber?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchProt && !matchBi) return false;
    }
    return true;
  });

  // State Transition Actions com suporte a NÃO_COMPARECEU e routing ao SILA Audit Engine
  const handleTransitionStatus = (appId: string, targetStatus: AppointmentStatus, actionName: any) => {
    const target = appointments.find(a => a.id === appId);
    if (!target) return;

    const previousStatus = target.status;
    const nowStr = new Date().toLocaleString('pt-PT');

    // Chained Hash Generation
    const lastAudit = auditLogs[auditLogs.length - 1];
    const prevHash = lastAudit ? lastAudit.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const currentHash = (Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Date.now().toString(16)).padEnd(64, 'a');
    const globalRef = `SILA_AUDIT_BLOCK_08_EVT_${Date.now()}`;

    const auditRec: AppointmentAuditRecord = {
      id: `AUD-AGD-${Date.now()}`,
      timestamp: nowStr,
      appointmentId: appId,
      servicePointId: target.servicePointId,
      operatorName: 'SuperAdmin Deusfundador',
      operatorRole: 'GOVERNANCE_ADMIN',
      action: actionName,
      previousStatus,
      newStatus: targetStatus,
      previousHash: prevHash,
      currentHash,
      silaGlobalAuditRef: globalRef,
      details: `Transição formal de agendamento: ${previousStatus} → ${targetStatus}. Roteado ao SILA Audit Engine.`
    };

    setAppointments(prev => prev.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          status: targetStatus,
          checkInAt: targetStatus === 'PRESENTE' ? nowStr : a.checkInAt,
          calledAt: targetStatus === 'EM_ATENDIMENTO' ? nowStr : a.calledAt,
          completedAt: targetStatus === 'CONCLUIDO' ? nowStr : a.completedAt,
          cancelledAt: targetStatus === 'CANCELADO' ? nowStr : a.cancelledAt,
          noShowAt: targetStatus === 'NAO_COMPARECEU' ? nowStr : a.noShowAt
        };
      }
      return a;
    }));

    // Se fizer check-in, gera ticket de fila operacional se ainda não existir
    if (targetStatus === 'PRESENTE') {
      const nextTicketNum = `A-${String(queueTickets.length + 15).padStart(3, '0')}`;
      const newTicket: OperationalQueueTicket = {
        ticketNumber: nextTicketNum,
        appointmentId: target.id,
        protocolNumber: target.protocolNumber,
        citizenName: target.citizenName,
        serviceType: target.serviceType,
        servicePointId: target.servicePointId,
        counterId: target.counterId || 'BALCAO-01',
        queueStatus: 'AGUARDANDO_CHAMADA',
        checkInTime: nowStr.split(' ')[1] || '09:00',
        waitTimeMinutes: 0,
        priorityTier: 'NORMAL'
      };
      setQueueTickets(prev => [...prev, newTicket]);
    } else if (targetStatus === 'EM_ATENDIMENTO') {
      setQueueTickets(prev => prev.map(t => t.appointmentId === appId ? { ...t, queueStatus: 'EM_ATENDIMENTO', calledTime: nowStr.split(' ')[1] } : t));
    } else if (targetStatus === 'CONCLUIDO') {
      setQueueTickets(prev => prev.map(t => t.appointmentId === appId ? { ...t, queueStatus: 'CONCLUIDO' } : t));
    }

    setAuditLogs(prev => [...prev, auditRec]);
    if (selectedAppointment && selectedAppointment.id === appId) {
      setSelectedAppointment(prev => prev ? { ...prev, status: targetStatus } : null);
    }
  };

  // Executar Bloqueio/Desbloqueio de Emergência com Justificativa Obrigatória e Auditoria
  const handleExecuteEmergencySlotLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyLockSlotTarget || !emergencyReasonInput.trim()) return;

    const slot = emergencyLockSlotTarget;
    const willBeLocked = !slot.isLocked;
    const nowStr = new Date().toLocaleString('pt-PT');
    const auditId = `AUD-AGD-${Date.now()}`;
    const globalRef = `SILA_AUDIT_BLOCK_08_LOCK_${Date.now()}`;

    // Atualiza o slot
    setSlots(prev => prev.map(s => {
      if (s.id === slot.id) {
        return {
          ...s,
          isLocked: willBeLocked,
          lockReason: willBeLocked ? emergencyReasonInput.trim() : undefined,
          lockedBy: willBeLocked ? 'SuperAdmin Deusfundador' : undefined,
          lockedAt: willBeLocked ? nowStr : undefined
        };
      }
      return s;
    }));

    // Cria evento de emergência estruturado
    const lockEvt: EmergencySlotLockEvent = {
      id: `EMG-LOCK-${Date.now()}`,
      slotId: slot.id,
      servicePointId: slot.servicePointId,
      action: willBeLocked ? 'SLOT_LOCKED' : 'SLOT_UNLOCKED',
      operator: 'SuperAdmin Deusfundador',
      operatorRole: 'GOVERNANCE_ADMIN',
      reason: emergencyReasonInput.trim(),
      timestamp: nowStr,
      affectedCapacity: slot.totalCapacity,
      previousState: slot.isLocked ? 'BLOQUEADO' : 'ABERTO',
      newState: willBeLocked ? 'BLOQUEADO' : 'ABERTO',
      auditId,
      globalAuditSynced: true
    };
    setLockEvents([lockEvt, ...lockEvents]);

    // Grava na trilha operacional
    const lastAudit = auditLogs[auditLogs.length - 1];
    const prevHash = lastAudit ? lastAudit.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const currentHash = (Math.random().toString(36).substring(2) + Date.now().toString(16)).padEnd(64, 'b');

    const auditRec: AppointmentAuditRecord = {
      id: auditId,
      timestamp: nowStr,
      appointmentId: slot.id,
      servicePointId: slot.servicePointId,
      operatorName: 'SuperAdmin Deusfundador',
      operatorRole: 'GOVERNANCE_ADMIN',
      action: willBeLocked ? 'BLOQUEAR_SLOTS' : 'DESBLOQUEAR_SLOTS',
      previousHash: prevHash,
      currentHash,
      silaGlobalAuditRef: globalRef,
      details: `${willBeLocked ? 'Bloqueio' : 'Desbloqueio'} emergencial do slot ${slot.timeSlot} no posto ${slot.servicePointId}. Motivo: ${emergencyReasonInput.trim()}`
    };
    setAuditLogs(prev => [...prev, auditRec]);

    setEmergencyLockSlotTarget(null);
    setEmergencyReasonInput('');
  };

  // Create Appointment Submission
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCitizenName.trim() || !formCitizenPhone.trim()) return;

    const newId = `AGD-2026-00${appointments.length + 490}`;
    const newProt = `PRT-SILA-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp: Appointment = {
      id: newId,
      protocolNumber: newProt,
      citizenName: formCitizenName.trim(),
      citizenBiNumber: formCitizenBi.trim() || undefined,
      citizenPhone: formCitizenPhone.trim(),
      serviceType: formServiceType,
      servicePointId: formServicePointId,
      servicePointName: capacities.find(c => c.servicePointId === formServicePointId)?.servicePointName || 'Posto Oficial',
      provinceCode: 'LUA',
      date: '2026-08-15',
      timeSlot: formTimeSlot,
      status: 'CONFIRMADO',
      createdAt: new Date().toLocaleString('pt-PT'),
      confirmedAt: new Date().toLocaleString('pt-PT'),
      jurisdictionSnapshot: {
        territoryVersion: 'TERR_VER_2026_01',
        provinceId: 'LUA',
        municipalityId: 'LUA-muni-1',
        communeId: 'LUA-com-ing',
        servicePointId: formServicePointId,
        sha256Proof: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      hash: 'fa821b01c3412ea88912d0912fa821b01c3412ea88912d0912fa821b01c3412ea'
    };

    setAppointments([newApp, ...appointments]);

    // Add Audit Record
    const auditRec: AppointmentAuditRecord = {
      id: `AUD-AGD-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-PT'),
      appointmentId: newId,
      servicePointId: formServicePointId,
      operatorName: 'SuperAdmin Deusfundador',
      operatorRole: 'GOVERNANCE_ADMIN',
      action: 'CRIAR_MARCACAO',
      previousStatus: undefined,
      newStatus: 'CONFIRMADO',
      previousHash: auditLogs[auditLogs.length - 1]?.currentHash || '0000000000000000000000000000000000000000000000000000000000000000',
      currentHash: 'c4ca4238a0b923820dcc509a6f75849b' + Date.now().toString(16),
      silaGlobalAuditRef: `SILA_AUDIT_BLOCK_08_NEW_${Date.now()}`,
      details: `Novo agendamento criado para utente ${formCitizenName.trim()} no serviço ${formServiceType}.`
    };
    setAuditLogs(prev => [...prev, auditRec]);

    setShowNewAppointmentModal(false);
    setFormCitizenName('');
    setFormCitizenBi('');
    setFormCitizenPhone('');
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'MARCADO':
        return <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-bold">● MARCADO</span>;
      case 'CONFIRMADO':
        return <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">● CONFIRMADO</span>;
      case 'PRESENTE':
        return <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">● PRESENTE</span>;
      case 'EM_ATENDIMENTO':
        return <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">● EM ATENDIMENTO</span>;
      case 'CONCLUIDO':
        return <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">● CONCLUÍDO</span>;
      case 'CANCELADO':
        return <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">● CANCELADO</span>;
      case 'NAO_COMPARECEU':
        return <span className="px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-400 font-bold border border-rose-800/40">● NÃO COMPARECEU</span>;
    }
  };

  return (
    <div className="space-y-4 font-mono select-none text-xs text-neutral-200">
      
      {/* HEADER ESTRUTURAL — DENSE & MINIMALIST */}
      <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                08 — AGENDAMENTOS & CAPACIDADE
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                ● ESTRUTURA CONGELADA (01–08)
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 font-bold border border-neutral-800">
                LIGAÇÃO FORMAL AO NÓ 07 (POSTOS & JURISDIÇÃO)
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
              Gestão de disponibilidade, capacidade derivada, políticas e ciclo de atendimento com encaminhamento ao SILA Audit Engine.
            </p>
          </div>
        </div>

        {/* COMPACT ACTIONS & STATS */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="hidden lg:flex items-center gap-3 px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400">
            <span>OCUPAÇÃO HOJE: <strong className="text-emerald-400 font-bold">88.4%</strong></span>
            <span>•</span>
            <span>MARCADOS: <strong className="text-white font-bold">{appointments.length}</strong></span>
          </div>
          <button
            onClick={() => setShowNewAppointmentModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[10px] uppercase flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ NOVO AGENDAMENTO</span>
          </button>
        </div>
      </div>

      {/* 8 SUB-TABS CONGELADAS (DENSE INLINE) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin border-b border-neutral-800 text-[10px]">
        {[
          { id: '01_AGENDA', label: '01 AGENDA' },
          { id: '02_CAPACIDADE', label: '02 CAPACIDADE' },
          { id: '03_SLOTS', label: '03 SLOTS' },
          { id: '04_SERVICOS', label: '04 SERVIÇOS' },
          { id: '05_POLITICAS', label: '05 POLÍTICAS' },
          { id: '06_FILA_OPERACIONAL', label: '06 FILA OPERACIONAL' },
          { id: '07_CONTROLO_EMERGENCIA', label: '07 CONTROLO DE EMERGÊNCIA' },
          { id: '08_AUDITORIA', label: '08 AUDITORIA OPERACIONAL' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all uppercase ${
              subTab === tab.id
                ? 'bg-amber-500 text-neutral-950 font-black'
                : 'bg-neutral-950 hover:bg-neutral-900 text-neutral-400 border border-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================
          SUB-TAB 01: AGENDA (Appointments & Ciclo de Vida)
         ========================================================= */}
      {subTab === '01_AGENDA' && (
        <div className="space-y-3">
          {/* COMPACT FILTER BAR */}
          <div className="p-2.5 rounded-2xl bg-[#0f1115] border border-neutral-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por utente, protocolo, BI ou código..."
                className="bg-transparent text-white placeholder-neutral-500 text-[10px] focus:outline-none w-full font-mono"
              />
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="p-1 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-[9px]"
              >
                <option value="ALL">TODOS OS ESTADOS</option>
                <option value="MARCADO">MARCADO</option>
                <option value="CONFIRMADO">CONFIRMADO</option>
                <option value="PRESENTE">PRESENTE</option>
                <option value="EM_ATENDIMENTO">EM ATENDIMENTO</option>
                <option value="CONCLUIDO">CONCLUÍDO</option>
                <option value="NAO_COMPARECEU">NÃO COMPARECEU</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>

              <select
                value={servicePointFilter}
                onChange={(e) => setServicePointFilter(e.target.value)}
                className="p-1 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-[9px]"
              >
                <option value="ALL">TODOS OS POSTOS</option>
                <option value="CSIC-ING-001">Conservatória Ingombota</option>
                <option value="POSTO-TAL-002">Posto Talatona (SIAC)</option>
                <option value="CSIC-HUA-001">Conservatória Huambo</option>
              </select>
            </div>
          </div>

          {/* DENSE APPOINTMENTS TABLE */}
          <div className="rounded-2xl bg-[#0f1115] border border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px] font-mono">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/80 text-neutral-400 uppercase text-[9px]">
                    <th className="p-2.5 font-bold">PROTOCOLO / ID</th>
                    <th className="p-2.5 font-bold">UTENTE</th>
                    <th className="p-2.5 font-bold">SERVIÇO</th>
                    <th className="p-2.5 font-bold">POSTO / BALCÃO</th>
                    <th className="p-2.5 font-bold">HORÁRIO</th>
                    <th className="p-2.5 font-bold">ESTADO</th>
                    <th className="p-2.5 font-bold text-right">COMANDOS DO CICLO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-200">
                  {filteredAppointments.map(app => (
                    <tr 
                      key={app.id}
                      onClick={() => setSelectedAppointment(app)}
                      className="hover:bg-neutral-900/50 transition-colors cursor-pointer"
                    >
                      <td className="p-2.5">
                        <strong className="text-amber-400 block">{app.protocolNumber}</strong>
                        <span className="text-neutral-500 text-[8px]">{app.id}</span>
                      </td>
                      <td className="p-2.5">
                        <strong className="text-white block truncate max-w-[160px]">{app.citizenName}</strong>
                        <span className="text-neutral-400 text-[8px]">{app.citizenBiNumber || 'BI PENDENTE'}</span>
                      </td>
                      <td className="p-2.5">
                        <span className="text-neutral-300 font-sans font-bold">{app.serviceType.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="p-2.5">
                        <span className="text-white block truncate max-w-[150px]">{app.servicePointName}</span>
                        <span className="text-amber-300/80 text-[8px]">{app.counterId || 'BALCÃO AUTOMÁTICO'}</span>
                      </td>
                      <td className="p-2.5 font-mono">
                        <span className="text-white block">{app.date}</span>
                        <span className="text-emerald-400 text-[9px]">{app.timeSlot}</span>
                      </td>
                      <td className="p-2.5">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="p-2.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        {/* CICLO DE ATENDIMENTO CONGELADO */}
                        {app.status === 'CONFIRMADO' && (
                          <>
                            <button
                              onClick={() => handleTransitionStatus(app.id, 'PRESENTE', 'CHECKIN_PRESENCA')}
                              className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase text-[9px]"
                              title="Marcar presença física do cidadão"
                            >
                              CHECK-IN
                            </button>
                            <button
                              onClick={() => handleTransitionStatus(app.id, 'NAO_COMPARECEU', 'REGISTAR_NAO_COMPARECIMENTO')}
                              className="px-1.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold uppercase text-[8px] border border-rose-800/40"
                              title="Registar que o cidadão não compareceu à hora marcada"
                            >
                              FALTA
                            </button>
                          </>
                        )}
                        {app.status === 'PRESENTE' && (
                          <>
                            <button
                              onClick={() => handleTransitionStatus(app.id, 'EM_ATENDIMENTO', 'CHAMAR_SENHA')}
                              className="px-2 py-1 rounded bg-purple-500 hover:bg-purple-400 text-white font-bold uppercase text-[9px]"
                            >
                              CHAMAR
                            </button>
                            <button
                              onClick={() => handleTransitionStatus(app.id, 'NAO_COMPARECEU', 'REGISTAR_NAO_COMPARECIMENTO')}
                              className="px-1.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold uppercase text-[8px] border border-rose-800/40"
                            >
                              DESISTÊNCIA
                            </button>
                          </>
                        )}
                        {app.status === 'EM_ATENDIMENTO' && (
                          <button
                            onClick={() => handleTransitionStatus(app.id, 'CONCLUIDO', 'CONCLUIR')}
                            className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold uppercase text-[9px]"
                          >
                            CONCLUIR
                          </button>
                        )}
                        {app.status !== 'CONCLUIDO' && app.status !== 'CANCELADO' && app.status !== 'NAO_COMPARECEU' && (
                          <button
                            onClick={() => handleTransitionStatus(app.id, 'CANCELADO', 'CANCELAR')}
                            className="px-1.5 py-1 rounded bg-neutral-900 hover:bg-red-500/20 text-neutral-400 hover:text-red-300 font-bold uppercase text-[8px] border border-neutral-800"
                            title="Cancelar agendamento"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 02: CAPACIDADE DERIVADA DOS POSTOS (NÓ 07 LINKAGE)
         ========================================================= */}
      {subTab === '02_CAPACIDADE' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-amber-400 font-bold uppercase text-[11px]">
                02 CAPACIDADE NOMINAL vs. OPERACIONAL REAL POR POSTO
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                BASE OPERACIONAL: DATA ATUAL ({new Date().toLocaleDateString('pt-PT')})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {capacities.map(cap => (
                <div key={cap.servicePointId} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-sans font-bold text-white truncate">{cap.servicePointName}</strong>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      cap.status === 'OPTIMAL' ? 'bg-emerald-500/20 text-emerald-300' :
                      cap.status === 'NEAR_CAPACITY' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      ● {cap.status}
                    </span>
                  </div>

                  {/* MATRIZ DERIVADA */}
                  <div className="grid grid-cols-2 gap-1 text-[9px] text-neutral-400 font-mono">
                    <div>CÓDIGO: <strong className="text-amber-300">{cap.servicePointId}</strong></div>
                    <div>PROVÍNCIA: <strong className="text-white">{cap.provinceCode}</strong></div>
                    <div>BALCÕES ATIVOS: <strong className="text-white">{cap.activeCountersCount}</strong></div>
                    <div>OPERADORES: <strong className="text-white">{cap.availableOperatorsCount}</strong></div>
                    <div>CAP. NOMINAL: <strong className="text-white">{cap.nominalCapacity}/dia</strong></div>
                    <div>VAGAS ABERTAS: <strong className="text-white">{cap.slotsCreatedCount}</strong></div>
                    <div>MARCADOS: <strong className="text-amber-400">{cap.slotsBookedCount}</strong></div>
                    <div>PRESENTES: <strong className="text-blue-400">{cap.slotsPresentCount}</strong></div>
                    <div>ATENDIDOS: <strong className="text-emerald-400">{cap.slotsAttendedCount}</strong></div>
                    <div>NÃO COMPARECEU: <strong className="text-rose-400">{cap.slotsNoShowCount}</strong></div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="space-y-1 pt-1 border-t border-neutral-900">
                    <div className="flex items-center justify-between text-[8px]">
                      <span>TAXA DE OCUPAÇÃO</span>
                      <strong className="text-emerald-400">{cap.occupancyRatePercent}%</strong>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                      <div 
                        className={`h-full ${
                          cap.occupancyRatePercent > 90 ? 'bg-red-500' : cap.occupancyRatePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(cap.occupancyRatePercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 03: SLOTS & DISPONIBILIDADE
         ========================================================= */}
      {subTab === '03_SLOTS' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold uppercase text-[11px]">
              03 GESTÃO DE SLOTS TEMPORAIS & DISPONIBILIDADE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {slots.map(slot => (
              <div key={slot.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <strong className="text-white text-xs">{slot.timeSlot}</strong>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    slot.isLocked ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {slot.isLocked ? 'BLOQUEADO' : 'ABERTO'}
                  </span>
                </div>

                <div className="text-[9px] text-neutral-400 space-y-0.5 font-mono">
                  <div>POSTO: <strong className="text-neutral-200">{slot.servicePointName}</strong></div>
                  <div>CAPACIDADE: <strong className="text-white">{slot.totalCapacity} utentes</strong></div>
                  <div>OCUPADOS: <strong className="text-amber-400">{slot.bookedCount}</strong> | EMERGÊNCIA: <strong className="text-purple-400">{slot.reservedEmergencyCount}</strong></div>
                  {slot.lockReason && (
                    <div className="text-[8px] text-red-400 truncate">MOTIVO: {slot.lockReason}</div>
                  )}
                </div>

                <div className="pt-1.5 border-t border-neutral-900 flex items-center justify-between">
                  <span className="text-neutral-500 text-[8px]">{slot.id}</span>
                  <button
                    onClick={() => {
                      setEmergencyLockSlotTarget(slot);
                      setEmergencyReasonInput(slot.lockReason || '');
                    }}
                    className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase flex items-center gap-1 ${
                      slot.isLocked 
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' 
                        : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                    }`}
                  >
                    {slot.isLocked ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                    <span>{slot.isLocked ? 'DESBLOQUEAR (EMERGÊNCIA)' : 'BLOQUEAR (EMERGÊNCIA)'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 04: CATÁLOGO DE SERVIÇOS QUE PODEM SER AGENDADOS
         ========================================================= */}
      {subTab === '04_SERVICOS' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold uppercase text-[11px]">
              04 CATÁLOGO DE SERVIÇOS AGENDÁVEIS (NÃO JURISDICIONAL)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
            {services.map(srv => (
              <div key={srv.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-white font-sans font-bold">{srv.title}</strong>
                  <span className="text-[8px] px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-amber-300 font-mono">
                    {srv.durationMinutes} MIN
                  </span>
                </div>
                <div className="text-[9px] text-neutral-400 space-y-0.5">
                  <div>CATEGORIA: <strong className="text-neutral-200">{srv.category}</strong></div>
                  <div>BASE LEGAL: <strong className="text-emerald-400">{srv.legalBase}</strong></div>
                </div>
                <div className="pt-1 flex items-center gap-2 text-[8px] font-bold">
                  <span className={`px-1.5 py-0.2 rounded ${srv.requiresBiometrics ? 'bg-emerald-500/15 text-emerald-300' : 'bg-neutral-900 text-neutral-600'}`}>
                    BIOMETRIA {srv.requiresBiometrics ? '✓' : '✗'}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded ${srv.requiresPhotography ? 'bg-emerald-500/15 text-emerald-300' : 'bg-neutral-900 text-neutral-600'}`}>
                    FOTOGRAFIA {srv.requiresPhotography ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 05: POLÍTICAS DE AGENDAMENTO (AppointmentPolicy)
         ========================================================= */}
      {subTab === '05_POLITICAS' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[11px] block">
                05 POLÍTICAS DE AGENDAMENTO (APPOINTMENT POLICY)
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                Regras parametrizadas de antecedência, tolerância, limites simultâneos e cancelamentos.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {policies.map(pol => (
              <div key={pol.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-[10px]">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-1.5">
                  <strong className="text-xs text-white font-bold">{pol.serviceType}</strong>
                  <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    ● {pol.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[9px] text-neutral-400 font-mono">
                  <div>JANELA MÍNIMA: <strong className="text-white">{pol.minAdvanceDays} dia(s)</strong></div>
                  <div>JANELA MÁXIMA: <strong className="text-white">{pol.maxAdvanceDays} dias</strong></div>
                  <div>LIMITE CANCEL.: <strong className="text-amber-400">{pol.cancellationDeadlineHours}h antes</strong></div>
                  <div>TOLERÂNCIA: <strong className="text-emerald-400">{pol.toleranceMinutes} min</strong></div>
                  <div>AGEND. SIMULT.: <strong className="text-white">{pol.maxSimultaneousPerCitizen}</strong></div>
                  <div>LIMITE DIÁRIO/B: <strong className="text-white">{pol.maxDailyCapacityPerCounter}</strong></div>
                </div>

                <div className="pt-1.5 border-t border-neutral-900 text-[8px] text-neutral-400 space-y-1">
                  <div>PRIORIDADE: <strong className="text-amber-300">{pol.priorityTier}</strong></div>
                  <div className="truncate">NOTAS: <span className="text-neutral-500">{pol.notes}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 06: FILA OPERACIONAL (Queue / Attendance)
         ========================================================= */}
      {subTab === '06_FILA_OPERACIONAL' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[11px] block">
                06 FILA OPERACIONAL EM TEMPO REAL & GESTÃO DE SENHAS
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                Monitorização do fluxo de utentes após check-in de presença física.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {queueTickets.map(ticket => (
              <div key={ticket.ticketNumber} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-neutral-950 font-black text-xs font-mono">
                      {ticket.ticketNumber}
                    </span>
                    <strong className="text-white text-xs">{ticket.citizenName}</strong>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    ticket.queueStatus === 'EM_ATENDIMENTO' ? 'bg-purple-500/20 text-purple-300' :
                    ticket.queueStatus === 'CONCLUIDO' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    ● {ticket.queueStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[9px] text-neutral-400 font-mono">
                  <div>PROTOCOLO: <strong className="text-amber-300">{ticket.protocolNumber}</strong></div>
                  <div>BALCÃO: <strong className="text-white">{ticket.counterId}</strong></div>
                  <div>CHECK-IN: <strong className="text-white">{ticket.checkInTime}</strong></div>
                  <div>TEMPO ESPERA: <strong className="text-emerald-400">{ticket.waitTimeMinutes} min</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 07: CONTROLO DE EMERGÊNCIA (SlotLock / Override)
         ========================================================= */}
      {subTab === '07_CONTROLO_EMERGENCIA' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[11px] block">
                07 CONTROLO DE EMERGÊNCIA (SLOT LOCK & CAPACITY OVERRIDE)
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                Registos com permissão elevada de bloqueio de slots e capacidade com auditoria obrigatória.
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {lockEvents.map(evt => (
              <div key={evt.id} className="p-3 rounded-xl bg-neutral-950 border border-red-500/30 space-y-1.5 text-[9px] font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">
                      ● {evt.action}
                    </span>
                    <strong className="text-white text-xs">{evt.slotId}</strong>
                    <span className="text-neutral-500">[{evt.servicePointId}]</span>
                  </div>
                  <span className="text-neutral-500">{evt.timestamp}</span>
                </div>

                <div className="text-[9px] text-neutral-300 font-sans">
                  <strong>MOTIVO REGISTADO:</strong> {evt.reason}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-[8px] text-neutral-400 pt-1 border-t border-neutral-900">
                  <div>OPERADOR: <strong className="text-white">{evt.operator}</strong></div>
                  <div>CAPACIDADE AFECTADA: <strong className="text-amber-300">{evt.affectedCapacity} utentes</strong></div>
                  <div>ESTADO: <strong className="text-red-400">{evt.previousState} &rarr; {evt.newState}</strong></div>
                  <div>AUDIT ID: <strong className="text-emerald-400">{evt.auditId}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 08: AUDITORIA OPERACIONAL COM ROTEAMENTO SILA
         ========================================================= */}
      {subTab === '08_AUDITORIA' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[11px] block">
                08 AUDITORIA OPERACIONAL DO MÓDULO 08 (AGENDAMENTOS)
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                Eventos operacionais locais roteados com hash-chaining para o SILA AUDIT ENGINE global.
              </span>
            </div>
            <span className="text-[9px] text-emerald-400 font-bold font-mono">
              ROTEAMENTO SILA AUDIT ENGINE: ATIVO
            </span>
          </div>

          <div className="space-y-1.5">
            {auditLogs.map(log => (
              <div key={log.id} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-[9px] font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 font-bold">{log.action}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-white">{log.appointmentId}</span>
                    <span className="text-neutral-500">[{log.servicePointId}]</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-[8px] font-bold">{log.silaGlobalAuditRef}</span>
                    <span className="text-neutral-500">{log.timestamp}</span>
                  </div>
                </div>
                <p className="text-neutral-400 font-sans">{log.details}</p>
                <div className="pt-1 border-t border-neutral-900 flex flex-col md:flex-row items-start md:items-center justify-between text-[8px] text-neutral-500 gap-1 truncate">
                  <div className="truncate">PREV_HASH: <span className="text-neutral-400">{log.previousHash}</span></div>
                  <div className="truncate">CURR_HASH: <span className="text-emerald-400 font-bold">{log.currentHash}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: DETALHES DO AGENDAMENTO & SNAPSHOT JURISDICIONAL
         ========================================================= */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111217] border border-amber-500/50 rounded-2xl max-w-lg w-full p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div>
                <h3 className="text-xs font-black text-amber-400 uppercase">
                  FICHA DE AGENDAMENTO: {selectedAppointment.protocolNumber}
                </h3>
                <span className="text-[9px] text-neutral-400 font-mono block">
                  ID: {selectedAppointment.id} | ESTADO: {selectedAppointment.status}
                </span>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-[10px] font-mono">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div>UTENTE: <strong className="text-white block">{selectedAppointment.citizenName}</strong></div>
                <div>BI: <strong className="text-amber-300 block">{selectedAppointment.citizenBiNumber || 'N/A'}</strong></div>
                <div>CONTACTO: <strong className="text-neutral-300 block">{selectedAppointment.citizenPhone}</strong></div>
                <div>SERVIÇO: <strong className="text-emerald-400 block">{selectedAppointment.serviceType}</strong></div>
              </div>

              {/* SNAPSHOT DE JURISDIÇÃO IMUTÁVEL (CONTRATO DO GOVOS NÓ 07) */}
              <div className="p-2.5 rounded-xl bg-neutral-950 border border-amber-500/30 space-y-1">
                <span className="text-amber-400 font-bold uppercase text-[9px] block">
                  SNAPSHOT DE JURISDIÇÃO TERRITORIAL (CONGELADO NO NÓ 07)
                </span>
                <div className="grid grid-cols-2 gap-1 text-[8px] text-neutral-400">
                  <div>VERSÃO TERRITORIAL: <strong className="text-white">{selectedAppointment.jurisdictionSnapshot.territoryVersion}</strong></div>
                  <div>PROVÍNCIA: <strong className="text-white">{selectedAppointment.jurisdictionSnapshot.provinceId}</strong></div>
                  <div>MUNICÍPIO: <strong className="text-white">{selectedAppointment.jurisdictionSnapshot.municipalityId}</strong></div>
                  <div>COMUNA: <strong className="text-white">{selectedAppointment.jurisdictionSnapshot.communeId || 'SEDE'}</strong></div>
                  <div>POSTO DE SERVIÇO: <strong className="text-white">{selectedAppointment.jurisdictionSnapshot.servicePointId}</strong></div>
                </div>
                <div className="text-[7px] text-neutral-500 truncate pt-1 border-t border-neutral-900">
                  SHA256 PROOF: {selectedAppointment.jurisdictionSnapshot.sha256Proof}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-900 text-neutral-300 font-bold uppercase text-[10px]"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: BLOQUEIO / DESBLOQUEIO DE EMERGÊNCIA (COM MOTIVO OBRIGATÓRIO)
         ========================================================= */}
      {emergencyLockSlotTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111217] border border-red-500/50 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-xs font-black text-red-400 uppercase">
                    {emergencyLockSlotTarget.isLocked ? 'DESBLOQUEIO DE EMERGÊNCIA' : 'BLOQUEIO DE EMERGÊNCIA'}
                  </h3>
                  <span className="text-[9px] text-neutral-400 font-mono block">
                    SLOT: {emergencyLockSlotTarget.timeSlot} ({emergencyLockSlotTarget.servicePointName})
                  </span>
                </div>
              </div>
              <button onClick={() => setEmergencyLockSlotTarget(null)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteEmergencySlotLock} className="space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-900/50 text-[9px] text-neutral-300 space-y-1">
                <div>CAPACIDADE AFECTADA: <strong className="text-white">{emergencyLockSlotTarget.totalCapacity} cidadãos</strong></div>
                <div>AUTORIDADE EXIGIDA: <strong className="text-amber-400">GOVERNANCE_ADMIN / SUPERVISÃO</strong></div>
              </div>

              <div>
                <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                  Justificativa Operacional Obrigatória (Trilha de Auditoria)
                </label>
                <textarea
                  required
                  rows={3}
                  value={emergencyReasonInput}
                  onChange={(e) => setEmergencyReasonInput(e.target.value)}
                  placeholder="Ex: Intervenção técnica no posto biométrico, falta de energia ou sobrelotação extraordinária..."
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEmergencyLockSlotTarget(null)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 text-neutral-400 font-bold uppercase hover:bg-neutral-800 text-[10px]"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className={`px-3.5 py-1.5 rounded-xl font-black uppercase text-[10px] ${
                    emergencyLockSlotTarget.isLocked 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950' 
                      : 'bg-red-500 hover:bg-red-400 text-white'
                  }`}
                >
                  CONFIRMAR OPERAÇÃO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: NOVO AGENDAMENTO
         ========================================================= */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111217] border border-amber-500/50 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div>
                <h3 className="text-xs font-black text-amber-400 uppercase">
                  CRIAR NOVO AGENDAMENTO PRESENCIAL
                </h3>
                <span className="text-[9px] text-neutral-400 font-mono block">
                  Registo oficial de vaga com snapshot automático de jurisdição
                </span>
              </div>
              <button onClick={() => setShowNewAppointmentModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-2.5 font-mono text-xs">
              <div>
                <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                  Nome Completo do Cidadão
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manuel António da Silva"
                  value={formCitizenName}
                  onChange={(e) => setFormCitizenName(e.target.value)}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                    N.º do BI (se aplicável)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 007129841LA044"
                    value={formCitizenBi}
                    onChange={(e) => setFormCitizenBi(e.target.value)}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                    Telemóvel
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: +244 923 000 111"
                    value={formCitizenPhone}
                    onChange={(e) => setFormCitizenPhone(e.target.value)}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                  Serviço Solicitado
                </label>
                <select
                  value={formServiceType}
                  onChange={(e) => setFormServiceType(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                    Posto de Atendimento
                  </label>
                  <select
                    value={formServicePointId}
                    onChange={(e) => setFormServicePointId(e.target.value)}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="CSIC-ING-001">Conservatória Ingombota</option>
                    <option value="POSTO-TAL-002">Posto Talatona (SIAC)</option>
                    <option value="CSIC-HUA-001">Conservatória Huambo</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                    Horário (Slot)
                  </label>
                  <select
                    value={formTimeSlot}
                    onChange={(e) => setFormTimeSlot(e.target.value)}
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="08:30 - 09:00">08:30 - 09:00</option>
                    <option value="09:00 - 09:30">09:00 - 09:30</option>
                    <option value="09:30 - 10:00">09:30 - 10:00</option>
                    <option value="10:00 - 10:30">10:00 - 10:30</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 text-neutral-400 font-bold uppercase hover:bg-neutral-800 text-[10px]"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black uppercase text-[10px]"
                >
                  REGISTAR AGENDAMENTO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
