import React, { useState } from 'react';
import { 
  AttendanceSession, 
  AttendanceSessionStatus, 
  AttendancePhase,
  ServiceCounterStation, 
  AttendanceAuditRecord,
  DeviceOperationalState,
  WorkstationDevice,
  BiometricCaptureProfile,
  TransitionPermissionRule,
  TransitionContext
} from '../../../types/attendance';
import { 
  INITIAL_ATTENDANCES, 
  INITIAL_SERVICE_COUNTERS, 
  INITIAL_ATTENDANCE_AUDIT_LOGS,
  INSTITUTIONAL_BIOMETRIC_PROFILE,
  STATE_MACHINE_RULES
} from '../../../data/attendance';
import { 
  UserCheck, Users, Clock, ShieldCheck, CheckCircle2, AlertTriangle, 
  Search, Plus, Play, Check, X, Camera, Fingerprint, 
  FileText, ArrowRight, RefreshCw, Cpu, HardDrive, KeyRound, 
  Sliders, Award, FileCheck, ShieldAlert, Lock, AlertOctagon, HelpCircle, FileSearch
} from 'lucide-react';

interface AttendanceTabProps {
  onOpenReauth?: () => void;
  onOpenPolicyInspector?: () => void;
  onOpenOrgSelector?: () => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = () => {
  // Sub-tabs operacionais
  const [subTab, setSubTab] = useState<
    | '01_SESSAO_BALCAO' 
    | '02_TRIAGEM_CHECKIN' 
    | '03_FILA_POSTO' 
    | '04_MAQUINA_ESTADOS'
    | '05_ESTACOES_HARDWARE' 
    | '06_AUDITORIA_OP'
  >('01_SESSAO_BALCAO');

  // Datasets State
  const [attendances, setAttendances] = useState<AttendanceSession[]>(INITIAL_ATTENDANCES);
  const [counters, setCounters] = useState<ServiceCounterStation[]>(INITIAL_SERVICE_COUNTERS);
  const [auditLogs, setAuditLogs] = useState<AttendanceAuditRecord[]>(INITIAL_ATTENDANCE_AUDIT_LOGS);
  
  // Perfil Biométrico Institucional Vigente
  const [biometricProfile, setBiometricProfile] = useState<BiometricCaptureProfile>(INSTITUTIONAL_BIOMETRIC_PROFILE);

  // Contexto Operador Atual (para avaliação estrita de RBAC + ABAC + Reautenticação)
  const [currentOperatorContext, setCurrentOperatorContext] = useState<TransitionContext>({
    operatorId: 'OP-LUA-401',
    operatorRole: 'REGISTRATION_OFFICER',
    operatorServicePointId: 'CSIC-ING-001',
    operatorCounterId: 'BALCAO-01',
    territoryScope: 'PROV-LUA / MUN-ING',
    authLevel: 'LEVEL_2_PIN',
    reauthConfirmed: true
  });

  // Sessão Ativa Selecionada / Balcão Selecionado
  const [activeSessionId, setActiveSessionId] = useState<string>('ATD-2026-0815-001');
  const [selectedCounterId, setSelectedCounterId] = useState<string>('BALCAO-01');

  // Modais de Controlo
  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(false);
  const [showReauthModal, setShowReauthModal] = useState<boolean>(false);
  const [showBioProfileModal, setShowBioProfileModal] = useState<boolean>(false);
  const [editBioProfile, setEditBioProfile] = useState<BiometricCaptureProfile>(INSTITUTIONAL_BIOMETRIC_PROFILE);
  const [pendingTransition, setPendingTransition] = useState<{
    session: AttendanceSession;
    rule: TransitionPermissionRule;
    justification?: string;
  } | null>(null);
  const [reauthPinInput, setReauthPinInput] = useState<string>('');
  const [transitionJustification, setTransitionJustification] = useState<string>('');

  // Filtros de busca
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AttendanceSessionStatus>('ALL');
  const [isCapturingBio, setIsCapturingBio] = useState<boolean>(false);

  // Active Objects
  const activeSession = attendances.find(a => a.attendanceSessionId === activeSessionId) || attendances[0];
  const currentCounter = counters.find(c => c.counterId === selectedCounterId) || counters[0];

  // Helper para Fase correspondente a cada Estado
  const getPhaseFromStatus = (status: AttendanceSessionStatus): AttendancePhase => {
    switch (status) {
      case 'SCHEDULED': return 'AGENDAMENTO';
      case 'CHECKED_IN':
      case 'TRIAGE': return 'ACOLHIMENTO_TRIAGEM';
      case 'QUEUED': return 'ESPERA_CHAMADA';
      case 'CALLED':
      case 'IN_SERVICE': return 'CABINE_ATENDIMENTO';
      case 'BIOMETRIC_CAPTURE': return 'ESTACAO_BIOMETRIA';
      case 'DATA_CONFERENCE': return 'CONFERENCIA_VALIDACAO';
      case 'COMPLETED': return 'FINALIZADO';
      default: return 'EXCEPTION_HANDLING';
    }
  };

  // Avaliação de Transição: RBAC + ABAC + Estado Atual + Permissão de Operação
  const evaluateTransitionSecurity = (
    session: AttendanceSession,
    targetStatus: AttendanceSessionStatus,
    operator: TransitionContext
  ): {
    allowed: boolean;
    rule: TransitionPermissionRule | null;
    rbacGranted: boolean;
    abacGranted: boolean;
    reauthRequired: boolean;
    reason: string;
  } => {
    const rule = STATE_MACHINE_RULES.find(
      r => r.fromStatus === session.status && r.toStatus === targetStatus
    );

    if (!rule) {
      return {
        allowed: false,
        rule: null,
        rbacGranted: false,
        abacGranted: false,
        reauthRequired: false,
        reason: `Transição de estado proibida pela Máquina de Estados: ${session.status} → ${targetStatus}.`
      };
    }

    // 1. RBAC Check
    const rbacGranted = rule.allowedRoles.includes(operator.operatorRole);
    if (!rbacGranted) {
      return {
        allowed: false,
        rule,
        rbacGranted: false,
        abacGranted: false,
        reauthRequired: rule.requiresReauth,
        reason: `RBAC Negado: Função '${operator.operatorRole}' não autorizada para '${rule.actionCode}'.`
      };
    }

    // 2. ABAC Check (Posto físico, escopo territorial e balcão)
    let abacGranted = true;
    if (session.servicePointId !== operator.operatorServicePointId) {
      abacGranted = false;
      return {
        allowed: false,
        rule,
        rbacGranted: true,
        abacGranted: false,
        reauthRequired: rule.requiresReauth,
        reason: `ABAC Negado: Operador pertence ao posto ${operator.operatorServicePointId}, mas a sessão é do posto ${session.servicePointId}.`
      };
    }

    return {
      allowed: true,
      rule,
      rbacGranted: true,
      abacGranted: true,
      reauthRequired: rule.requiresReauth,
      reason: 'Autorização RBAC + ABAC concedida.'
    };
  };

  // Desencadear Pedido de Transição de Estado
  const requestStateTransition = (targetStatus: AttendanceSessionStatus, optionalJustification?: string) => {
    if (!activeSession) return;

    const evalResult = evaluateTransitionSecurity(activeSession, targetStatus, currentOperatorContext);

    if (!evalResult.allowed || !evalResult.rule) {
      alert(`[BLOQUEIO DE SEGURANÇA SILA]\n${evalResult.reason}`);
      return;
    }

    if (evalResult.reauthRequired) {
      setPendingTransition({
        session: activeSession,
        rule: evalResult.rule,
        justification: optionalJustification || ''
      });
      setReauthPinInput('');
      setShowReauthModal(true);
    } else {
      executeStateTransition(activeSession, evalResult.rule, optionalJustification);
    }
  };

  // Executar Transição e Gravar Auditoria Append-Only
  const executeStateTransition = (
    session: AttendanceSession, 
    rule: TransitionPermissionRule,
    justification?: string
  ) => {
    const nowStr = new Date().toLocaleString('pt-PT');
    const newStatus = rule.toStatus;
    const newPhase = getPhaseFromStatus(newStatus);

    // Chaining de Auditoria Criptográfica
    const lastAudit = auditLogs[auditLogs.length - 1];
    const prevHash = lastAudit ? lastAudit.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const currentHash = (Math.random().toString(36).substring(2) + Date.now().toString(16)).padEnd(64, '0');
    const signature = `SIG_ECDSA_${currentOperatorContext.operatorId}_${Math.random().toString(16).substring(2, 14)}`;
    const auditRef = `SILA_AUDIT_BLOCK_09_EVT_${Date.now()}`;

    const auditRecord: AttendanceAuditRecord = {
      id: `AUD-ATD-${Date.now()}`,
      timestamp: nowStr,
      attendanceSessionId: session.attendanceSessionId,
      ticketNumber: session.ticketNumber,
      servicePointId: session.servicePointId,
      counterId: session.counterId,
      operatorId: currentOperatorContext.operatorId,
      operatorName: session.operatorName,
      action: rule.actionCode,
      fromStatus: session.status,
      toStatus: newStatus,
      currentPhase: newPhase,
      previousHash: prevHash,
      currentHash,
      signature,
      reauthVerified: rule.requiresReauth,
      rbacResult: 'GRANTED',
      abacResult: 'GRANTED',
      auditRef,
      details: justification ? `[${rule.description}] Motivo: ${justification}` : rule.description
    };

    setAttendances(prev => prev.map(item => {
      if (item.attendanceSessionId === session.attendanceSessionId) {
        return {
          ...item,
          status: newStatus,
          currentPhase: newPhase,
          checkInAt: newStatus === 'CHECKED_IN' ? nowStr : item.checkInAt,
          triageAt: newStatus === 'TRIAGE' || newStatus === 'QUEUED' ? (item.triageAt || nowStr) : item.triageAt,
          calledAt: newStatus === 'CALLED' ? nowStr : item.calledAt,
          startedAt: newStatus === 'IN_SERVICE' ? (item.startedAt || nowStr) : item.startedAt,
          biometricAt: newStatus === 'BIOMETRIC_CAPTURE' ? nowStr : item.biometricAt,
          verificationAt: newStatus === 'DATA_CONFERENCE' ? nowStr : item.verificationAt,
          completedAt: newStatus === 'COMPLETED' ? nowStr : item.completedAt,
          validationRef: newStatus === 'COMPLETED' ? `VAL_CORE_N10_${Date.now()}` : item.validationRef,
          updatedAt: nowStr,
          auditRef
        };
      }
      return item;
    }));

    setAuditLogs(prev => [...prev, auditRecord]);
    setShowReauthModal(false);
    setPendingTransition(null);
  };

  // Simular Recolha Biometrica Física Conforme Perfil Institucional
  const handlePerformBiometricCapture = (sessionId: string) => {
    const canCapture = currentCounter.workstation.devices
      .filter(d => d.category === 'CAMARA' || d.category === 'SCANNER_BIOMETRICO')
      .every(d => d.state === 'READY');

    if (!canCapture) {
      alert(`Impossível iniciar recolha: Dispositivos de captura da cabine ${selectedCounterId} não estão em estado READY.`);
      return;
    }

    setIsCapturingBio(true);
    setTimeout(() => {
      setIsCapturingBio(false);
      const bioProof = (Math.random().toString(36).substring(2) + Date.now().toString(16)).padEnd(64, 'b');
      
      const faceScore = 96;
      const fingerScore = 92;
      const isCompliant = 
        faceScore >= biometricProfile.minFaceQualityScore && 
        fingerScore >= biometricProfile.minFingerprintsQualityScore;

      setAttendances(prev => prev.map(a => {
        if (a.attendanceSessionId === sessionId) {
          return {
            ...a,
            status: 'DATA_CONFERENCE',
            currentPhase: 'CONFERENCIA_VALIDACAO',
            biometricScores: {
              faceScore,
              fingerprintsScore: fingerScore,
              fingerprintsCount: biometricProfile.requiredFingerprintsCount,
              signatureValid: biometricProfile.requireDigitalSignature,
              profileApplied: biometricProfile.profileCode,
              isCompliant,
              sha256Proof: bioProof
            },
            biometricCaptureRef: `BIO_REF_${Date.now()}`,
            photoCaptureRef: `FOTO_REF_${Date.now()}`,
            signatureCaptureRef: `SIG_REF_${Date.now()}`,
            updatedAt: new Date().toLocaleString('pt-PT')
          };
        }
        return a;
      }));

      // Trilha de Auditoria
      const lastAudit = auditLogs[auditLogs.length - 1];
      const prevHash = lastAudit ? lastAudit.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
      const currentHash = (Math.random().toString(36).substring(2) + Date.now().toString(16)).padEnd(64, 'c');
      const signature = `SIG_ECDSA_${currentOperatorContext.operatorId}_${Math.random().toString(16).substring(2, 14)}`;

      const auditRec: AttendanceAuditRecord = {
        id: `AUD-ATD-${Date.now()}`,
        timestamp: new Date().toLocaleString('pt-PT'),
        attendanceSessionId: sessionId,
        ticketNumber: activeSession.ticketNumber,
        servicePointId: 'CSIC-ING-001',
        counterId: selectedCounterId,
        operatorId: currentOperatorContext.operatorId,
        operatorName: activeSession.operatorName,
        action: 'CONFERENCIA_DADOS',
        fromStatus: 'BIOMETRIC_CAPTURE',
        toStatus: 'DATA_CONFERENCE',
        currentPhase: 'CONFERENCIA_VALIDACAO',
        previousHash: prevHash,
        currentHash,
        signature,
        reauthVerified: false,
        rbacResult: 'GRANTED',
        abacResult: 'GRANTED',
        auditRef: `SILA_AUDIT_BLOCK_09_BIO_${Date.now()}`,
        details: `Recolha física concluída conforme perfil institucional ${biometricProfile.profileCode}. Face ${faceScore}%, 10 Dedos ${fingerScore}%.`
      };
      setAuditLogs(prev => [...prev, auditRec]);
    }, 1200);
  };

  // Alterar Estado de Dispositivo (Simulação Operacional de Telemetria)
  const handleUpdateDeviceState = (counterId: string, deviceId: string, newState: DeviceOperationalState) => {
    setCounters(prev => prev.map(c => {
      if (c.counterId === counterId) {
        const updatedDevices = c.workstation.devices.map(d => {
          if (d.deviceId === deviceId) {
            return { ...d, state: newState, lastPing: 'Agora' };
          }
          return d;
        });
        const isReady = updatedDevices.every(d => d.state === 'READY');
        return {
          ...c,
          workstation: {
            ...c.workstation,
            devices: updatedDevices,
            isReadyForCapture: isReady
          }
        };
      }
      return c;
    }));
  };

  // Filtro de Atendimentos
  const filteredAttendances = attendances.filter(item => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.citizenName.toLowerCase().includes(q);
      const matchTicket = item.ticketNumber.toLowerCase().includes(q);
      const matchBi = item.citizenId.toLowerCase().includes(q);
      const matchId = item.attendanceSessionId.toLowerCase().includes(q);
      if (!matchName && !matchTicket && !matchBi && !matchId) return false;
    }
    return true;
  });

  const getStatusBadge = (status: AttendanceSessionStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-bold border border-neutral-700">● SCHEDULED</span>;
      case 'CHECKED_IN':
        return <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-bold border border-neutral-700">● CHECKED_IN</span>;
      case 'TRIAGE':
        return <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">● TRIAGE</span>;
      case 'QUEUED':
        return <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">● QUEUED</span>;
      case 'CALLED':
        return <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">● CALLED</span>;
      case 'IN_SERVICE':
        return <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">● IN_SERVICE</span>;
      case 'BIOMETRIC_CAPTURE':
        return <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 animate-pulse">● BIOMETRIC_CAPTURE</span>;
      case 'DATA_CONFERENCE':
        return <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">● DATA_CONFERENCE</span>;
      case 'COMPLETED':
        return <span className="px-1.5 py-0.2 rounded bg-emerald-600/30 text-emerald-200 font-bold border border-emerald-500/50">● COMPLETED</span>;
      // Saídas controladas
      case 'NO_SHOW':
        return <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 font-bold border border-neutral-700">● NO_SHOW</span>;
      case 'CANCELLED':
        return <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-400 font-bold border border-red-800">● CANCELLED</span>;
      case 'PENDING_DOCUMENTATION':
        return <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-bold border border-amber-700">● PENDING_DOCS</span>;
      case 'CAPTURE_FAILED':
        return <span className="px-1.5 py-0.2 rounded bg-red-900/40 text-red-300 font-bold border border-red-700">● CAPTURE_FAILED</span>;
      case 'DISCREPANCY':
        return <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-bold border border-rose-700">● DISCREPANCY</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-bold">{status}</span>;
    }
  };

  const getDeviceStateBadge = (state: DeviceOperationalState) => {
    switch (state) {
      case 'READY':
        return <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">READY</span>;
      case 'CONNECTED':
        return <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">CONNECTED</span>;
      case 'BUSY':
        return <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 animate-pulse">BUSY</span>;
      case 'ERROR':
        return <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/40">ERROR</span>;
      case 'OFFLINE':
        return <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-bold border border-neutral-700">OFFLINE</span>;
      case 'MAINTENANCE':
        return <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">MAINTENANCE</span>;
    }
  };

  return (
    <div className="space-y-4 font-mono select-none text-xs text-neutral-200">
      
      {/* HEADER ESTRUTURAL — DENSE & MINIMALIST */}
      <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                09 — SESSÃO DE ATENDIMENTO FÍSICO CONTROLADO & MÁQUINA DE ESTADOS
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                ● ENTIDADE NÚCLEO: AttendanceSession
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30">
                ● CAMADA DE EXECUÇÃO PURA
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
              O Módulo 09 executa o ciclo presencial. Não é autoridade nem emissor de dados cadastrais.
            </p>
          </div>
        </div>

        {/* COMPACT ACTIONS & OPERATOR CONTEXT */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="hidden lg:flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400">
            <span>OPERADOR: <strong className="text-white font-bold">{currentOperatorContext.operatorId}</strong></span>
            <span>•</span>
            <span>PERFIL: <strong className="text-amber-400 font-bold">{currentOperatorContext.operatorRole}</strong></span>
            <span>•</span>
            <span>NÍVEL AUTH: <strong className="text-emerald-400 font-bold">{currentOperatorContext.authLevel}</strong></span>
          </div>
          <button
            onClick={() => setShowCheckInModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[10px] uppercase flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ NOVO CHECK-IN</span>
          </button>
        </div>
      </div>

      {/* REGRA DE GOVERNANÇA: O QUE NÃO ENTRA NO 09 */}
      <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-[8.5px] font-mono">
        <div className="flex items-center gap-2 text-red-300">
          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
          <span>
            <strong className="text-red-200">FRONTEIRA ARQUITETURAL:</strong> O 09 executa a sessão presencial. <strong>Não é a autoridade dos dados.</strong>
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap text-neutral-400 text-[8px]">
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">❌ Criar Cidadão</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">❌ Alterar Identidade</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">❌ Criar Território</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">❌ Criar Posto/Agendamento</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">❌ Emitir BI</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">❌ Gerir RBAC/IAM</span>
        </div>
      </div>

      {/* 6 SUB-TABS OPERACIONAIS */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin border-b border-neutral-800 text-[10px]">
        {[
          { id: '01_SESSAO_BALCAO', label: '01 SESSÃO DO BALCÃO (CABINE)' },
          { id: '02_TRIAGEM_CHECKIN', label: '02 TRIAGEM & FAST-TRACK' },
          { id: '03_FILA_POSTO', label: '03 FILA PRESENCIAL' },
          { id: '04_MAQUINA_ESTADOS', label: '04 MÁQUINA DE ESTADOS DO SILA' },
          { id: '05_ESTACOES_HARDWARE', label: '05 ESTAÇÕES & HARDWARE' },
          { id: '06_AUDITORIA_OP', label: '06 AUDITORIA DO ATENDIMENTO' }
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
          SUB-TAB 01: SESSÃO DO BALCÃO (CABINE OPERACIONAL DE ATENDIMENTO)
          INTERFACE CONGELADA EXTREMAMENTE MINIMALISTA
         ========================================================= */}
      {subTab === '01_SESSAO_BALCAO' && (
        <div className="max-w-xl mx-auto space-y-3 font-mono">
          
          {/* SELETOR COMPACTO DE SESSÃO / FILA DO BALCÃO (CASO O OPERADOR DESEJE TROCAR) */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-bold">BALCÃO:</span>
              <select
                value={selectedCounterId}
                onChange={(e) => setSelectedCounterId(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 text-amber-400 rounded px-1.5 py-0.5 text-[10px] font-bold focus:outline-none"
              >
                {counters.map(c => (
                  <option key={c.counterId} value={c.counterId}>{c.counterId}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-bold">FILA:</span>
              <select
                value={activeSession?.attendanceSessionId}
                onChange={(e) => setActiveSessionId(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 text-white rounded px-2 py-0.5 text-[10px] font-bold focus:outline-none"
              >
                {attendances.map(a => (
                  <option key={a.attendanceSessionId} value={a.attendanceSessionId}>
                    {a.ticketNumber} — {a.citizenName} ({a.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PAINEL MINIMALISTA CONGELADO */}
          {activeSession && (
            <div className="rounded-xl border border-neutral-700 bg-black shadow-2xl overflow-hidden text-neutral-200">
              
              {/* TOPO: IDENTIFICADOR E POSTO • BALCÃO */}
              <div className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between text-xs tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-black">09_ATENDIMENTO</span>
                </div>
                <div className="text-neutral-400 font-bold">
                  <span>{activeSession.servicePointName || 'POSTO'}</span>
                  <span className="mx-1.5 text-neutral-600">•</span>
                  <span className="text-white">{activeSession.counterId || selectedCounterId}</span>
                </div>
              </div>

              {/* CORPO: QUEM, QUAL PROCESSO, ESTADO E AÇÕES */}
              <div className="p-6 md:p-8 space-y-6">
                
                {/* DADOS PRINCIPAIS */}
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-black text-amber-400 tracking-tight">
                    SENHA {activeSession.ticketNumber}
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white tracking-wide uppercase">
                    {activeSession.citizenName}
                  </div>
                  <div className="text-xs text-neutral-400 font-mono tracking-wider">
                    {activeSession.processId || activeSession.appointmentId || activeSession.attendanceSessionId}
                  </div>
                </div>

                {/* ESTADO ATUAL */}
                <div className="py-2 flex items-center gap-2 text-sm md:text-base font-bold">
                  {activeSession.status === 'COMPLETED' ? (
                    <span className="text-emerald-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                      CONCLUÍDO
                    </span>
                  ) : activeSession.status === 'BIOMETRIC_CAPTURE' ? (
                    <span className="text-indigo-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block animate-pulse"></span>
                      RECOLHA BIOMÉTRICA
                    </span>
                  ) : activeSession.status === 'DATA_CONFERENCE' ? (
                    <span className="text-cyan-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
                      CONFERÊNCIA DE DADOS
                    </span>
                  ) : activeSession.status === 'IN_SERVICE' ? (
                    <span className="text-purple-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block animate-pulse"></span>
                      EM ATENDIMENTO
                    </span>
                  ) : activeSession.status === 'CALLED' ? (
                    <span className="text-amber-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-pulse"></span>
                      CHAMADA REALIZADA
                    </span>
                  ) : activeSession.status === 'QUEUED' ? (
                    <span className="text-cyan-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                      EM FILA DE ESPERA
                    </span>
                  ) : (
                    <span className="text-neutral-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                      {activeSession.status.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                {/* BOTÕES DE COMANDO OPERACIONAL (4 AÇÕES PRINCIPAIS) */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  
                  {/* [ CONFERIR ] */}
                  <button
                    onClick={() => {
                      if (activeSession.status === 'TRIAGE' || activeSession.status === 'CHECKED_IN') {
                        requestStateTransition('QUEUED');
                      } else {
                        requestStateTransition('DATA_CONFERENCE');
                      }
                    }}
                    className={`py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border ${
                      activeSession.status === 'DATA_CONFERENCE'
                        ? 'bg-neutral-800 text-amber-300 border-amber-500'
                        : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    [ CONFERIR ]
                  </button>

                  {/* [ BIOMETRIA ] */}
                  <button
                    onClick={() => {
                      if (activeSession.status === 'BIOMETRIC_CAPTURE') {
                        handlePerformBiometricCapture(activeSession.attendanceSessionId);
                      } else {
                        requestStateTransition('BIOMETRIC_CAPTURE');
                      }
                    }}
                    disabled={isCapturingBio}
                    className={`py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border ${
                      activeSession.status === 'BIOMETRIC_CAPTURE'
                        ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500 animate-pulse'
                        : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    {isCapturingBio ? '[ A CAPTURAR... ]' : '[ BIOMETRIA ]'}
                  </button>

                  {/* [ FOTO ] */}
                  <button
                    onClick={() => {
                      if (activeSession.status !== 'BIOMETRIC_CAPTURE') {
                        requestStateTransition('BIOMETRIC_CAPTURE');
                      }
                      handlePerformBiometricCapture(activeSession.attendanceSessionId);
                    }}
                    disabled={isCapturingBio}
                    className="py-3 px-4 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 font-bold text-xs uppercase tracking-wider border border-neutral-700 hover:border-neutral-500 transition-all"
                  >
                    [ FOTO ]
                  </button>

                  {/* [ CONCLUIR ] */}
                  <button
                    onClick={() => requestStateTransition('COMPLETED')}
                    className="py-3 px-4 rounded-lg bg-neutral-900/80 hover:bg-emerald-950 text-emerald-400 font-black text-xs uppercase tracking-wider border border-emerald-800/80 hover:border-emerald-500 transition-all"
                  >
                    [ CONCLUIR ]
                  </button>
                </div>

                {/* ATALHOS RÁPIDOS ADICIONAIS QUANDO APLICÁVEL */}
                {activeSession.status === 'QUEUED' && (
                  <button
                    onClick={() => requestStateTransition('CALLED')}
                    className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all"
                  >
                    CHAMAR PRÓXIMO
                  </button>
                )}
                {activeSession.status === 'CALLED' && (
                  <button
                    onClick={() => requestStateTransition('IN_SERVICE')}
                    className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    INICIAR ATENDIMENTO NO BALCÃO
                  </button>
                )}
              </div>

              {/* RODAPÉ: TELEMETRIA DE PRONTIDÃO DOS DISPOSITIVOS */}
              <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-[11px] font-bold text-neutral-400">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* CÂMERA */}
                  <div className="flex items-center gap-1.5">
                    <span>CÂMERA</span>
                    <span className={currentCounter.workstation.devices.some(d => d.category === 'CAMARA' && d.state === 'READY') ? 'text-emerald-400' : 'text-red-400'}>
                      ●
                    </span>
                  </div>

                  {/* BIOMETRIA */}
                  <div className="flex items-center gap-1.5">
                    <span>BIOMETRIA</span>
                    <span className={currentCounter.workstation.devices.some(d => d.category === 'SCANNER_BIOMETRICO' && d.state === 'READY') ? 'text-emerald-400' : 'text-red-400'}>
                      ●
                    </span>
                  </div>

                  {/* LEITOR */}
                  <div className="flex items-center gap-1.5">
                    <span>LEITOR</span>
                    <span className={currentCounter.workstation.devices.some(d => d.category === 'LEITOR_BI' && d.state === 'READY') ? 'text-emerald-400' : 'text-red-400'}>
                      ●
                    </span>
                  </div>

                  {/* ASSINATURA */}
                  <div className="flex items-center gap-1.5">
                    <span>ASSINATURA</span>
                    <span className={currentCounter.workstation.devices.some(d => d.category === 'PAD_ASSINATURA' && d.state === 'READY') ? 'text-emerald-400' : 'text-red-400'}>
                      ●
                    </span>
                  </div>
                </div>

                {/* STATUS GERAL DA CABINE */}
                <span className={currentCounter.workstation.isReadyForCapture ? 'text-emerald-400 text-[10px]' : 'text-amber-400 text-[10px]'}>
                  {currentCounter.workstation.isReadyForCapture ? 'PRONTO' : 'ATENÇÃO HARDWARE'}
                </span>
              </div>

            </div>
          )}

        </div>
      )}

      {/* =========================================================
          SUB-TAB 04: MÁQUINA DE ESTADOS DO SILA (DIAGRAMA & REGRAS CONGELADAS)
         ========================================================= */}
      {subTab === '04_MAQUINA_ESTADOS' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[11px] block">
                04 MÁQUINA DE ESTADOS CONGELADA & TRANSIÇÕES CONTROLADAS
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                Cada transição requer RBAC + ABAC + Verificação do Estado Atual + Eventual Reautenticação + Auditoria Append-Only.
              </span>
            </div>
          </div>

          {/* FLUXO NORMAL */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <span className="text-emerald-400 font-bold text-[9.5px] uppercase block">FLUXO NORMAL (PIPELINE CENTRAL)</span>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[8px] font-mono">
              {[
                'SCHEDULED', 'CHECKED_IN', 'TRIAGE', 'QUEUED', 'CALLED', 
                'IN_SERVICE', 'BIOMETRIC_CAPTURE', 'DATA_CONFERENCE', 'COMPLETED'
              ].map((st, idx, arr) => (
                <React.Fragment key={st}>
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-center shrink-0 min-w-[95px]">
                    <span className="text-[6.5px] text-neutral-500 block">PASSO {idx + 1}</span>
                    <strong className="text-white block">{st}</strong>
                  </div>
                  {idx < arr.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* SAÍDAS CONTROLADAS (EXCEÇÕES REGULADAS) */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <span className="text-rose-400 font-bold text-[9.5px] uppercase block">SAÍDAS CONTROLADAS (EXCEÇÕES REGULADAS)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[8px] font-mono">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-neutral-400 block">CHECKED_IN →</span>
                <strong className="text-rose-400 block">NO_SHOW / CANCELLED</strong>
                <span className="text-[7px] text-neutral-500 block">Desistência do utente ou cancelamento formal supervisionado.</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-neutral-400 block">TRIAGE →</span>
                <strong className="text-amber-400 block">PENDING_DOCUMENTATION</strong>
                <span className="text-[7px] text-neutral-500 block">Falta de documento obrigatório; processo retido na triagem.</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-neutral-400 block">BIOMETRIC_CAPTURE →</span>
                <strong className="text-red-400 block">CAPTURE_FAILED</strong>
                <span className="text-[7px] text-neutral-500 block">Impossibilidade técnica ou recusa de conformidade no perfil.</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-neutral-400 block">DATA_CONFERENCE →</span>
                <strong className="text-purple-400 block">DISCREPANCY</strong>
                <span className="text-[7px] text-neutral-500 block">Divergência de dados biográficos ou filiação com registo central.</span>
              </div>
            </div>
          </div>

          {/* TABELA DE REGRAS E RBAC/REAUTH */}
          <div className="rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden">
            <table className="w-full text-left border-collapse text-[9px] font-mono">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 uppercase text-[8px]">
                  <th className="p-2 font-bold">DE ESTADO</th>
                  <th className="p-2 font-bold">PARA ESTADO</th>
                  <th className="p-2 font-bold">CÓDIGO AÇÃO</th>
                  <th className="p-2 font-bold">ROLES PERMITIDAS (RBAC)</th>
                  <th className="p-2 font-bold">REAUTH REQUERIDO?</th>
                  <th className="p-2 font-bold">DESCRIÇÃO OPERACIONAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {STATE_MACHINE_RULES.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-2 font-bold text-amber-400">{rule.fromStatus}</td>
                    <td className="p-2 font-bold text-white">{rule.toStatus}</td>
                    <td className="p-2 text-cyan-300">{rule.actionCode}</td>
                    <td className="p-2">
                      <div className="flex gap-1 flex-wrap">
                        {rule.allowedRoles.map(r => (
                          <span key={r} className="px-1 py-0.2 rounded bg-neutral-900 text-neutral-300 text-[7px] border border-neutral-800">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2">
                      {rule.requiresReauth ? (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[7.5px] border border-amber-500/30">
                          SIM (PIN/BIO)
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-500 text-[7.5px]">
                          NÃO
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-neutral-400 text-[7.5px]">{rule.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 02: TRIAGEM & FAST-TRACK (5 CRITÉRIOS)
         ========================================================= */}
      {subTab === '02_TRIAGEM_CHECKIN' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[11px] block">
                02 POSTO DE TRIAGEM & AVALIAÇÃO FAST-TRACK (5 CRITÉRIOS DE CONTROLO)
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                REGRA INSTITUCIONAL: PROCESSO=VALIDADO ∧ DOCUMENTAÇÃO=CONFORME ∧ IDENTIDADE=RESOLVIDA ∧ BIOMETRIA=SIM ∧ PENDÊNCIA=NONE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {attendances.map(item => (
              <div key={item.attendanceSessionId} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-[9px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.2 rounded bg-amber-500 text-neutral-950 font-bold">
                    {item.ticketNumber}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <div>
                  <strong className="text-white text-xs block font-sans truncate">{item.citizenName}</strong>
                  <span className="text-neutral-400">{item.serviceType.replace(/_/g, ' ')}</span>
                </div>

                {/* MATRIZ DE CRITÉRIOS DESTE UTENTE */}
                {item.fastTrackEvaluation ? (
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-[8px] space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">PROCESSO:</span>
                      <strong className={item.fastTrackEvaluation.processStatus === 'VALIDADO' ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.fastTrackEvaluation.processStatus}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">DOCS:</span>
                      <strong className={item.fastTrackEvaluation.documentationStatus === 'CONFORME' ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.fastTrackEvaluation.documentationStatus}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">IDENTIDADE:</span>
                      <strong className={item.fastTrackEvaluation.identityStatus === 'RESOLVIDA' ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.fastTrackEvaluation.identityStatus}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">PENDÊNCIAS:</span>
                      <strong className={item.fastTrackEvaluation.pendingIssuesCount === 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {item.fastTrackEvaluation.pendingIssuesCount === 0 ? 'NONE (0)' : `${item.fastTrackEvaluation.pendingIssuesCount}`}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded bg-neutral-900 text-neutral-500 text-[8px]">
                    Avaliação Fast-Track ainda não realizada.
                  </div>
                )}

                <div className="pt-1 border-t border-neutral-900 flex items-center justify-between text-[8px] text-neutral-400">
                  <span>AGENDAMENTO: {item.appointmentId || 'ESPONTÂNEO'}</span>
                  <span>CHECK-IN: {item.checkInAt?.split(' ')[1] || '---'}</span>
                </div>

                {item.status === 'CHECKED_IN' && (
                  <div className="pt-1 flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setActiveSessionId(item.attendanceSessionId);
                        requestStateTransition('TRIAGE');
                      }}
                      className="flex-1 py-1 rounded bg-blue-500 hover:bg-blue-400 text-white font-bold uppercase text-[8px]"
                    >
                      INICIAR TRIAGEM
                    </button>
                  </div>
                )}

                {item.status === 'TRIAGE' && (
                  <div className="pt-1 flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setActiveSessionId(item.attendanceSessionId);
                        requestStateTransition('QUEUED');
                      }}
                      className="flex-1 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold uppercase text-[8px]"
                    >
                      APROVAR & FILA
                    </button>
                    <button
                      onClick={() => {
                        setActiveSessionId(item.attendanceSessionId);
                        requestStateTransition('PENDING_DOCUMENTATION', 'Falta certidão original');
                      }}
                      className="px-2 py-1 rounded bg-amber-600/30 text-amber-300 hover:bg-amber-600/40 font-bold uppercase text-[8px]"
                    >
                      PENDÊNCIA
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 03: FILA PRESENCIAL GERAL DO POSTO
         ========================================================= */}
      {subTab === '03_FILA_POSTO' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold uppercase text-[11px]">
              03 PAINEL GERAL DE SENHAS & CHAMADAS DO POSTO
            </span>
          </div>

          <div className="rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden">
            <table className="w-full text-left border-collapse text-[10px] font-mono">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 uppercase text-[9px]">
                  <th className="p-2 font-bold">SENHA</th>
                  <th className="p-2 font-bold">UTENTE</th>
                  <th className="p-2 font-bold">SERVIÇO</th>
                  <th className="p-2 font-bold">ELEGIBILIDADE</th>
                  <th className="p-2 font-bold">BALCÃO</th>
                  <th className="p-2 font-bold">ESTADO</th>
                  <th className="p-2 font-bold">CHECK-IN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {filteredAttendances.map(item => (
                  <tr key={item.attendanceSessionId} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-2 font-bold text-amber-400">{item.ticketNumber}</td>
                    <td className="p-2 text-white font-sans">{item.citizenName}</td>
                    <td className="p-2 text-neutral-300">{item.serviceType.replace(/_/g, ' ')}</td>
                    <td className="p-2">
                      {item.fastTrack ? (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[8px]">
                          FAST-TRACK
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-bold text-[8px]">
                          REGULAR
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-white font-bold">{item.counterId}</td>
                    <td className="p-2">{getStatusBadge(item.status)}</td>
                    <td className="p-2 text-emerald-400">{item.checkInAt?.split(' ')[1] || '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 05: ESTAÇÕES & HARDWARE COM PERFIL BIOMÉTRICO INSTITUCIONAL
         ========================================================= */}
      {subTab === '05_ESTACOES_HARDWARE' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-4">
          {/* PAINEL DO PERFIL BIOMÉTRICO INSTITUCIONAL VIGENTE */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <div>
                  <strong className="text-white text-[10px] uppercase font-bold">PERFIL BIOMÉTRICO INSTITUCIONAL VIGENTE</strong>
                  <span className="text-[8px] text-neutral-400 block">
                    Parâmetros homologados pela autoridade competente ({biometricProfile.authorityCode})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[8px] font-bold border border-amber-500/30">
                  {biometricProfile.profileCode}
                </span>
                <button
                  onClick={() => {
                    setEditBioProfile({ ...biometricProfile });
                    setShowBioProfileModal(true);
                  }}
                  className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-bold text-[8px] border border-neutral-700 uppercase"
                >
                  CONFIGURAR PERFIL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[8px] font-mono">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block">SCORE MÍNIMO FACIAL:</span>
                <strong className="text-emerald-400 text-[10px]">{biometricProfile.minFaceQualityScore}%</strong>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block">SCORE MÍNIMO DACTILAR:</span>
                <strong className="text-emerald-400 text-[10px]">{biometricProfile.minFingerprintsQualityScore}%</strong>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block">DEDOS REQUERIDOS:</span>
                <strong className="text-emerald-400 text-[10px]">{biometricProfile.requiredFingerprintsCount} Dedos (Rolados/Planos)</strong>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block">ASSINATURA DIGITAL:</span>
                <strong className="text-emerald-400 text-[10px]">{biometricProfile.requireDigitalSignature ? 'OBRIGATÓRIA' : 'OPCIONAL'}</strong>
              </div>
            </div>
          </div>

          {/* CABINES OPERACIONAIS & TELEMETRIA DE HARDWARE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {counters.map(ctr => (
              <div key={ctr.counterId} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-1.5">
                  <div>
                    <span className="text-amber-400 font-bold uppercase text-[10px]">{ctr.counterId} • {ctr.workstation.name}</span>
                    <span className="text-[8px] text-neutral-400 block">{ctr.assignedOperatorName} ({ctr.operatorRole})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    ctr.workstation.isReadyForCapture 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {ctr.workstation.isReadyForCapture ? 'CAPTURA PRONTA' : 'REVISÃO DISPOSITIVOS'}
                  </span>
                </div>

                <div className="space-y-1">
                  {ctr.workstation.devices.map(dev => (
                    <div key={dev.deviceId} className="p-1.5 rounded bg-neutral-900 border border-neutral-800/80 flex items-center justify-between text-[8px] font-mono">
                      <div>
                        <strong className="text-white block">{dev.name}</strong>
                        <span className="text-neutral-500 block">{dev.model} • SN: {dev.serialNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getDeviceStateBadge(dev.state)}
                        <select
                          value={dev.state}
                          onChange={(e) => handleUpdateDeviceState(ctr.counterId, dev.deviceId, e.target.value as any)}
                          className="bg-neutral-950 border border-neutral-700 text-[7px] text-neutral-300 rounded px-1 py-0.5"
                        >
                          <option value="READY">READY</option>
                          <option value="CONNECTED">CONNECTED</option>
                          <option value="BUSY">BUSY</option>
                          <option value="ERROR">ERROR</option>
                          <option value="OFFLINE">OFFLINE</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 06: AUDITORIA DO ATENDIMENTO (APPEND-ONLY + HASH + ASSINATURA)
         ========================================================= */}
      {subTab === '06_AUDITORIA_OP' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[11px] block">
                06 AUDITORIA DO ATENDIMENTO & TRILHA CRIPTOGRÁFICA APPEND-ONLY
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                Cada evento regista: RBAC, ABAC, Verificação de Reautenticação, Assinatura Digital do Operador e Hash Encadeado.
              </span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 font-mono border border-neutral-800">
              {auditLogs.length} EVENTOS REGISTADOS
            </span>
          </div>

          <div className="rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden">
            <table className="w-full text-left border-collapse text-[8.5px] font-mono">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 uppercase text-[7.5px]">
                  <th className="p-2 font-bold">TIMESTAMP</th>
                  <th className="p-2 font-bold">SESSÃO / SENHA</th>
                  <th className="p-2 font-bold">AÇÃO</th>
                  <th className="p-2 font-bold">TRANSIÇÃO DE ESTADO</th>
                  <th className="p-2 font-bold">OPERADOR</th>
                  <th className="p-2 font-bold">RBAC / ABAC</th>
                  <th className="p-2 font-bold">REAUTH</th>
                  <th className="p-2 font-bold">HASH ATUAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-2 text-neutral-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-2 font-bold text-amber-400">{log.ticketNumber} ({log.attendanceSessionId})</td>
                    <td className="p-2 text-cyan-300 font-bold">{log.action}</td>
                    <td className="p-2 text-white">
                      <span className="text-neutral-500">{log.fromStatus}</span> → <span className="text-emerald-400 font-bold">{log.toStatus}</span>
                    </td>
                    <td className="p-2 text-neutral-300">{log.operatorName} ({log.operatorId})</td>
                    <td className="p-2">
                      <span className="px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-bold text-[7px]">
                        {log.rbacResult}/{log.abacResult}
                      </span>
                    </td>
                    <td className="p-2">
                      {log.reauthVerified ? (
                        <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[7px]">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="px-1 py-0.2 rounded bg-neutral-900 text-neutral-500 text-[7px]">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-neutral-500 font-mono text-[7px] truncate max-w-[100px]">
                      {log.currentHash.substring(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE REAUTENTICAÇÃO OBRIGATÓRIA (PIN / BIOMETRIA DO OPERADOR)
         ========================================================= */}
      {showReauthModal && pendingTransition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1115] border border-amber-500/40 p-4 space-y-3 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                <Lock className="w-4 h-4" />
                <span>REAUTENTICAÇÃO OBRIGATÓRIA DE OPERAÇÃO</span>
              </div>
              <button
                onClick={() => {
                  setShowReauthModal(false);
                  setPendingTransition(null);
                }}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-[8.5px]">
              <div className="flex justify-between text-neutral-400">
                <span>AÇÃO SOLICITADA:</span>
                <strong className="text-white">{pendingTransition.rule.actionCode}</strong>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>TRANSIÇÃO:</span>
                <strong className="text-amber-400">{pendingTransition.session.status} → {pendingTransition.rule.toStatus}</strong>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>OPERADOR:</span>
                <strong className="text-emerald-400">{currentOperatorContext.operatorId} ({currentOperatorContext.operatorRole})</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] text-neutral-400 uppercase font-bold block">
                JUSTIFICAÇÃO OPERACIONAL (GRAVADA NA AUDITORIA):
              </label>
              <input
                type="text"
                value={transitionJustification}
                onChange={(e) => setTransitionJustification(e.target.value)}
                placeholder="Ex.: Conferência física validada e biometria conforme."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-[9px] text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] text-neutral-400 uppercase font-bold block">
                DIGITE O PIN DE REAUTENTICAÇÃO OU CONFIRMAÇÃO DO TOKEN FÍSICO:
              </label>
              <input
                type="password"
                maxLength={6}
                value={reauthPinInput}
                onChange={(e) => setReauthPinInput(e.target.value)}
                placeholder="••••••"
                className="w-full bg-neutral-950 border border-amber-500/40 rounded-lg p-2 text-center text-sm font-bold text-amber-300 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowReauthModal(false);
                  setPendingTransition(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-[9px] uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={() => {
                  if (reauthPinInput.length < 4) {
                    alert('PIN de operador inválido. Mínimo 4 dígitos.');
                    return;
                  }
                  executeStateTransition(pendingTransition.session, pendingTransition.rule, transitionJustification);
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[9px] uppercase flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CONFIRMAR & ASSINAR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE CONFIGURAÇÃO DO PERFIL BIOMÉTRICO INSTITUCIONAL
         ========================================================= */}
      {showBioProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f1115] border border-amber-500/40 p-4 space-y-3 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                <Sliders className="w-4 h-4" />
                <span>CONFIGURAR PARÂMETROS DO PERFIL BIOMÉTRICO (DNI/MINJUSDH)</span>
              </div>
              <button
                onClick={() => setShowBioProfileModal(false)}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[9px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">CÓDIGO DO PERFIL:</label>
                  <input
                    type="text"
                    value={editBioProfile.profileCode}
                    onChange={(e) => setEditBioProfile({ ...editBioProfile, profileCode: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-1.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">AUTORIDADE HOMOLOGADORA:</label>
                  <input
                    type="text"
                    value={editBioProfile.authorityCode}
                    onChange={(e) => setEditBioProfile({ ...editBioProfile, authorityCode: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-1.5 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">SCORE MÍNIMO FACIAL (%):</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={editBioProfile.minFaceQualityScore}
                    onChange={(e) => setEditBioProfile({ ...editBioProfile, minFaceQualityScore: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-1.5 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">SCORE MÍNIMO DACTILAR (%):</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={editBioProfile.minFingerprintsQualityScore}
                    onChange={(e) => setEditBioProfile({ ...editBioProfile, minFingerprintsQualityScore: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-1.5 text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">DEDOS REQUERIDOS:</label>
                  <select
                    value={editBioProfile.requiredFingerprintsCount}
                    onChange={(e) => setEditBioProfile({ ...editBioProfile, requiredFingerprintsCount: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-1.5 text-white font-bold"
                  >
                    <option value={10}>10 Dedos (Rolados + Planos)</option>
                    <option value={4}>4 Dedos (Planos)</option>
                    <option value={2}>2 Polegares</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">ASSINATURA DIGITAL:</label>
                  <select
                    value={editBioProfile.requireDigitalSignature ? 'true' : 'false'}
                    onChange={(e) => setEditBioProfile({ ...editBioProfile, requireDigitalSignature: e.target.value === 'true' })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-1.5 text-white font-bold"
                  >
                    <option value="true">OBRIGATÓRIA</option>
                    <option value="false">OPCIONAL / EXCEÇÃO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">SUMÁRIO DE REGRAS:</label>
                <textarea
                  value={editBioProfile.captureRulesSummary}
                  onChange={(e) => setEditBioProfile({ ...editBioProfile, captureRulesSummary: e.target.value })}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-1.5 text-neutral-300"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowBioProfileModal(false)}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-400 font-bold text-[9px] uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={() => {
                  setBiometricProfile({ ...editBioProfile });
                  setShowBioProfileModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[9px] uppercase"
              >
                SALVAR PERFIL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE CHECK-IN RÁPIDO NO POSTO
         ========================================================= */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1115] border border-neutral-800 p-4 space-y-3 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                <Plus className="w-4 h-4" />
                <span>NOVO CHECK-IN PRESENCIAL NO POSTO</span>
              </div>
              <button
                onClick={() => setShowCheckInModal(false)}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-[9px]">
              <label className="text-neutral-400 block">NÚMERO DO BI OU CÓDIGO DO AGENDAMENTO (MÓDULO 08):</label>
              <input
                type="text"
                placeholder="Ex.: 007129841LA044 ou AGD-2026-00491"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white text-[10px] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCheckInModal(false)}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-400 font-bold text-[9px] uppercase"
              >
                FECHAR
              </button>
              <button
                onClick={() => {
                  setShowCheckInModal(false);
                  alert('Check-in registado com sucesso e senha emitida.');
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[9px] uppercase"
              >
                EMITIR SENHA CHECK-IN
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
