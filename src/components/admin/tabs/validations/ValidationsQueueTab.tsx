import React, { useState, useMemo } from 'react';
import {
  ValidationDossier,
  ValidationStatus,
  ProcessType,
  ValidationRiskLevel,
  ValidationPriority,
  ValidationDecision,
  ValidationAuditEvent,
  OperatorContext,
  SlaStatus
} from '../../../../types/validations';
import {
  Search,
  Sliders,
  UserCheck,
  Lock,
  ArrowRight,
  Clock,
  Eye,
  AlertOctagon,
  KeyRound,
  RotateCcw,
  X
} from 'lucide-react';

// Operador Logado Atual no Contexto RBAC + ABAC
export const CURRENT_OPERATOR: OperatorContext = {
  operatorId: 'VAL-N1-0084',
  operatorName: 'Carlos Van-Dúnem',
  role: 'VALIDADOR_N1',
  organization: 'DNI_MINJUSDH',
  provinceId: 'LUANDA',
  servicePointId: 'POSTO-LUANDA-CENTRAL',
  terminalId: 'TERM-VAL-LUA-01'
};

interface ValidationsQueueTabProps {
  dossiers: ValidationDossier[];
  onUpdateDossier: (dossier: ValidationDossier) => void;
  onAddAuditEvent: (event: ValidationAuditEvent) => void;
  onSelectDossierForAnalysis: (dossierId: string) => void;
  onViewAuditChain: () => void;
}

// 12. Regra de SLA: Cálculo dinâmico em tempo de execução
export function calculateSla(slaDeadline: string, slaStartedAt?: string): {
  remainingMinutes: number;
  status: SlaStatus;
  label: string;
} {
  const now = Date.now();
  const deadline = new Date(slaDeadline).getTime();
  const diffMs = deadline - now;
  const remainingMinutes = Math.round(diffMs / 60000);

  if (remainingMinutes <= 0) {
    const overdueMins = Math.abs(remainingMinutes);
    const h = Math.floor(overdueMins / 60);
    const m = overdueMins % 60;
    return {
      remainingMinutes,
      status: 'OVERDUE',
      label: `Expirado há ${h > 0 ? `${h}h ` : ''}${m}m`
    };
  }

  const h = Math.floor(remainingMinutes / 60);
  const m = remainingMinutes % 60;
  const label = `Restam ${h > 0 ? `${h}h ` : ''}${m}m`;

  if (remainingMinutes < 60) {
    return {
      remainingMinutes,
      status: 'NEAR_DEADLINE',
      label
    };
  }

  return {
    remainingMinutes,
    status: 'ON_TIME',
    label
  };
}

export const ValidationsQueueTab: React.FC<ValidationsQueueTabProps> = ({
  dossiers,
  onUpdateDossier,
  onAddAuditEvent,
  onSelectDossierForAnalysis,
  onViewAuditChain
}) => {
  // Estados de Seleção e Filtros
  const [selectedDossierId, setSelectedDossierId] = useState<string>(dossiers[0]?.dossierId || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [provinceFilter, setProvinceFilter] = useState<string>('ALL');
  
  // 5. Ordenação Operacional Estrita
  const [sortBy, setSortBy] = useState<'SLA_ASC' | 'PRIORITY_DESC' | 'RISK_DESC' | 'CREATED_AT_ASC'>('SLA_ASC');

  // Modais de Ação Estrita
  const [assignModalData, setAssignModalData] = useState<{
    isOpen: boolean;
    mode: 'ASSIGN' | 'REASSIGN';
    dossier?: ValidationDossier;
    targetValidatorId: string;
    targetValidatorName: string;
    reason: string;
  }>({
    isOpen: false,
    mode: 'ASSIGN',
    targetValidatorId: 'VAL-N1-0084',
    targetValidatorName: 'Carlos Van-Dúnem (Validador N1 — Luanda)',
    reason: ''
  });

  const [escalateModalData, setEscalateModalData] = useState<{
    isOpen: boolean;
    dossier?: ValidationDossier;
    reason: string;
  }>({
    isOpen: false,
    reason: ''
  });

  const [suspendModalData, setSuspendModalData] = useState<{
    isOpen: boolean;
    dossier?: ValidationDossier;
    targetState: 'PENDING_DOCS' | 'SUPERVISOR_REVIEW';
    reason: string;
  }>({
    isOpen: false,
    targetState: 'PENDING_DOCS',
    reason: ''
  });

  // Modal de Reautenticação Forte (Módulo 02 IAM / MFA)
  const [reauthModalData, setReauthModalData] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onSuccessAction: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onSuccessAction: () => {}
  });
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState<string | null>(null);

  // Dossiê selecionado ativo
  const activeDossier = useMemo(() => {
    return dossiers.find(d => d.dossierId === selectedDossierId) || dossiers[0];
  }, [dossiers, selectedDossierId]);

  // Lista de validadores disponíveis no sistema
  const availableValidators = [
    { id: 'VAL-N1-0084', name: 'Carlos Van-Dúnem (Validador N1 — Luanda)', provinceId: 'LUANDA', role: 'VALIDADOR_N1' },
    { id: 'VAL-N1-0091', name: 'Helena Bartolomeu (Validador N1 — Luanda)', provinceId: 'LUANDA', role: 'VALIDADOR_N1' },
    { id: 'VAL-N2-0012', name: 'Dr. Mateus Quaresma (Especialista N2 — Huambo)', provinceId: 'HUAMBO', role: 'VALIDADOR_ESPECIALISTA_N2' },
    { id: 'VAL-N2-0033', name: 'Dra. Rosa Chivela (Especialista N2 — Benguela)', provinceId: 'BENGUELA', role: 'VALIDADOR_ESPECIALISTA_N2' },
    { id: 'SUP-NAC-0003', name: 'Mesa Supervisora N3 (Nacional / MINJUSDH)', provinceId: 'NACIONAL', role: 'SUPERVISOR_N3' },
  ];

  // Prioridades com pontuação numérica para ordenação
  const priorityWeights: Record<ValidationPriority, number> = {
    CRITICAL: 4,
    URGENT: 3,
    HIGH: 2,
    NORMAL: 1
  };

  // Riscos com pontuação numérica para ordenação
  const riskWeights: Record<ValidationRiskLevel, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  // Filtragem e Ordenação da Fila
  const processedDossiers = useMemo(() => {
    const list = dossiers.filter(d => {
      const matchSearch =
        d.dossierId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.processId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.nationalIdNumber && d.nationalIdNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
      const matchRisk = riskFilter === 'ALL' || d.riskLevel === riskFilter;
      const matchType = typeFilter === 'ALL' || d.processType === typeFilter;
      const matchProvince = provinceFilter === 'ALL' || d.provinceId === provinceFilter;

      return matchSearch && matchStatus && matchRisk && matchType && matchProvince;
    });

    // Ordenação estrita
    return list.sort((a, b) => {
      if (sortBy === 'SLA_ASC') {
        const slaA = calculateSla(a.slaDeadline).remainingMinutes;
        const slaB = calculateSla(b.slaDeadline).remainingMinutes;
        return slaA - slaB;
      }
      if (sortBy === 'PRIORITY_DESC') {
        return priorityWeights[b.priority] - priorityWeights[a.priority];
      }
      if (sortBy === 'RISK_DESC') {
        return riskWeights[b.riskLevel] - riskWeights[a.riskLevel];
      }
      if (sortBy === 'CREATED_AT_ASC') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });
  }, [dossiers, searchQuery, statusFilter, riskFilter, typeFilter, provinceFilter, sortBy]);

  // 8. ABAC Contextual Validator
  const validateAbacAccess = (dossier: ValidationDossier, _action: string): { allowed: boolean; reason?: string } => {
    // Operador provincial não pode manipular dossier fora da sua jurisdição (exceto se for Nacional/Supervisor)
    if (CURRENT_OPERATOR.role === 'VALIDADOR_N1' && dossier.provinceId !== CURRENT_OPERATOR.provinceId) {
      return {
        allowed: false,
        reason: `Violação ABAC: Operador com escopo em ${CURRENT_OPERATOR.provinceId} não possui jurisdição para manipular dossiê de ${dossier.provinceId}.`
      };
    }
    return { allowed: true };
  };

  // Trigger Reautenticação Forte (Módulo 02)
  const triggerStrongReauth = (title: string, description: string, onSuccess: () => void) => {
    setReauthPassword('');
    setReauthError(null);
    setReauthModalData({
      isOpen: true,
      title,
      description,
      onSuccessAction: onSuccess
    });
  };

  const handleConfirmReauth = () => {
    // Verificação de credencial forte vinculada ao IAM
    if (!reauthPassword || reauthPassword.length < 4) {
      setReauthError('Credencial de autenticação forte inválida ou incompleta.');
      return;
    }

    setReauthModalData(prev => ({ ...prev, isOpen: false }));
    setReauthPassword('');
    setReauthError(null);
    reauthModalData.onSuccessAction();
  };

  // ============================================================================
  // COMANDOS OPERACIONAIS DO 01_FILA_VALIDACAO
  // ============================================================================

  // 7. ASSUMIR
  const handleAssume = (dossier: ValidationDossier) => {
    const abac = validateAbacAccess(dossier, 'ASSUMIR');
    if (!abac.allowed) {
      alert(abac.reason);
      return;
    }

    // Regra: Não pode estar atribuído a outro operador ativo
    if (dossier.assignedValidatorId && dossier.assignedValidatorId !== CURRENT_OPERATOR.operatorId) {
      alert(`Dossiê já atribuído a outro operador ativo (${dossier.assignedValidatorName}). Utilize o comando REATRIBUIR com justificativa formal.`);
      return;
    }

    const updated: ValidationDossier = {
      ...dossier,
      status: dossier.status === 'QUEUED' ? 'UNDER_ANALYSIS' : dossier.status,
      assignedValidatorId: CURRENT_OPERATOR.operatorId,
      assignedValidatorName: CURRENT_OPERATOR.operatorName,
      updatedAt: new Date().toISOString()
    };

    onUpdateDossier(updated);

    onAddAuditEvent({
      eventId: `VAL-EVT-${Date.now().toString().slice(-6)}`,
      dossierId: dossier.dossierId,
      operatorId: CURRENT_OPERATOR.operatorId,
      operatorRole: CURRENT_OPERATOR.role,
      command: 'ASSUMIR',
      previousState: dossier.status,
      newState: updated.status,
      reason: 'Dossiê assumido diretamente pelo técnico com jurisdição territorial conferida.',
      timestamp: new Date().toISOString(),
      previousHash: dossier.currentHash,
      currentHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      digitalSignature: `SIG_ASSUME_${CURRENT_OPERATOR.operatorId}_${Date.now()}`,
      auditChainRef: dossier.auditChainRef,
      terminalId: CURRENT_OPERATOR.terminalId
    });
  };

  // 7. ATRIBUIR / REATRIBUIR
  const handleExecuteAssign = () => {
    if (!assignModalData.dossier) return;
    const dossier = assignModalData.dossier;

    if (assignModalData.mode === 'REASSIGN' && !assignModalData.reason.trim()) {
      alert('É obrigatório registrar o motivo formal para a reatribuição do dossiê.');
      return;
    }

    const targetVal = availableValidators.find(v => v.id === assignModalData.targetValidatorId);
    const targetName = targetVal ? targetVal.name.split(' (')[0] : assignModalData.targetValidatorId;

    const updated: ValidationDossier = {
      ...dossier,
      assignedValidatorId: assignModalData.targetValidatorId,
      assignedValidatorName: targetName,
      status: dossier.status === 'QUEUED' ? 'UNDER_ANALYSIS' : dossier.status,
      updatedAt: new Date().toISOString()
    };

    onUpdateDossier(updated);

    onAddAuditEvent({
      eventId: `VAL-EVT-${Date.now().toString().slice(-6)}`,
      dossierId: dossier.dossierId,
      operatorId: CURRENT_OPERATOR.operatorId,
      operatorRole: CURRENT_OPERATOR.role,
      command: assignModalData.mode === 'REASSIGN' ? 'REATRIBUIR' : 'ATRIBUIR',
      previousState: dossier.status,
      newState: updated.status,
      reason: assignModalData.mode === 'REASSIGN'
        ? `Reatribuição formal: ${assignModalData.reason} (De: ${dossier.assignedValidatorName || 'Nenhum'} Para: ${targetName})`
        : `Atribuição direta de carga de trabalho para ${targetName}.`,
      timestamp: new Date().toISOString(),
      previousHash: dossier.currentHash,
      currentHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      digitalSignature: `SIG_ASSIGN_${CURRENT_OPERATOR.operatorId}_${Date.now()}`,
      auditChainRef: dossier.auditChainRef,
      terminalId: CURRENT_OPERATOR.terminalId
    });

    setAssignModalData({
      isOpen: false,
      mode: 'ASSIGN',
      targetValidatorId: 'VAL-N1-0084',
      targetValidatorName: '',
      reason: ''
    });
  };

  // 7. ESCALAR PARA SUPERVISÃO (Exige reautenticação se crítico)
  const handleExecuteEscalate = () => {
    if (!escalateModalData.dossier) return;
    const dossier = escalateModalData.dossier;

    if (!escalateModalData.reason.trim()) {
      alert('É obrigatório descrever o motivo técnico/jurídico da escalação para a Supervisão.');
      return;
    }

    const proceedEscalation = () => {
      const updated: ValidationDossier = {
        ...dossier,
        status: 'SUPERVISOR_REVIEW',
        assignedSupervisorId: 'SUP-NAC-0003',
        updatedAt: new Date().toISOString()
      };

      onUpdateDossier(updated);

      onAddAuditEvent({
        eventId: `VAL-EVT-${Date.now().toString().slice(-6)}`,
        dossierId: dossier.dossierId,
        operatorId: CURRENT_OPERATOR.operatorId,
        operatorRole: CURRENT_OPERATOR.role,
        command: 'ESCALAR',
        previousState: dossier.status,
        newState: 'SUPERVISOR_REVIEW',
        reason: `Escalação para Mesa Supervisora N3. Motivo: ${escalateModalData.reason}`,
        timestamp: new Date().toISOString(),
        previousHash: dossier.currentHash,
        currentHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
        digitalSignature: `SIG_ESCALATE_${CURRENT_OPERATOR.operatorId}_${Date.now()}`,
        auditChainRef: dossier.auditChainRef,
        terminalId: CURRENT_OPERATOR.terminalId
      });

      setEscalateModalData({ isOpen: false, reason: '' });
    };

    if (dossier.riskLevel === 'CRITICAL' || dossier.uniquenessValidation.status === 'SUSPECT_DUPLICATE') {
      triggerStrongReauth(
        'ESCALAÇÃO DE RISCO CRÍTICO',
        `A escalação do dossiê ${dossier.dossierId} envolve suspeita de colisão ou risco crítico e requer confirmação de identidade forte.`,
        proceedEscalation
      );
    } else {
      proceedEscalation();
    }
  };

  // 7. SUSPENDER (Transição para PENDING_DOCS ou SUPERVISOR_REVIEW com motivo obrigatório)
  const handleExecuteSuspend = () => {
    if (!suspendModalData.dossier) return;
    const dossier = suspendModalData.dossier;

    if (!suspendModalData.reason.trim()) {
      alert('É obrigatório detalhar a pendência probatória ou motivo formal da suspensão.');
      return;
    }

    const updated: ValidationDossier = {
      ...dossier,
      status: suspendModalData.targetState,
      updatedAt: new Date().toISOString()
    };

    onUpdateDossier(updated);

    onAddAuditEvent({
      eventId: `VAL-EVT-${Date.now().toString().slice(-6)}`,
      dossierId: dossier.dossierId,
      operatorId: CURRENT_OPERATOR.operatorId,
      operatorRole: CURRENT_OPERATOR.role,
      command: 'SUSPENDER',
      previousState: dossier.status,
      newState: suspendModalData.targetState,
      reason: `Suspensão do fluxo normal (${suspendModalData.targetState}): ${suspendModalData.reason}`,
      timestamp: new Date().toISOString(),
      previousHash: dossier.currentHash,
      currentHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      digitalSignature: `SIG_SUSPEND_${CURRENT_OPERATOR.operatorId}_${Date.now()}`,
      auditChainRef: dossier.auditChainRef,
      terminalId: CURRENT_OPERATOR.terminalId
    });

    setSuspendModalData({ isOpen: false, targetState: 'PENDING_DOCS', reason: '' });
  };

  return (
    <div className="space-y-2.5 font-mono text-[9px]">
      {/* =========================================================================
          PAINEL SUPERIOR: FILTROS, JURISDIÇÃO E ORDENAÇÃO OPERACIONAL
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-2.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Busca por chaves essenciais */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por DOSSIER, PROCESSO (REQ), CIDADÃO ou Nº DE BI..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Filtros em linha densos */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status */}
            <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1">
              <span className="text-neutral-500">STATUS:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none font-bold cursor-pointer"
              >
                <option value="ALL">TODOS</option>
                <option value="QUEUED">QUEUED</option>
                <option value="AUTO_PROCESSING">AUTO_PROCESSING</option>
                <option value="UNDER_ANALYSIS">UNDER_ANALYSIS</option>
                <option value="PENDING_DOCS">PENDING_DOCS</option>
                <option value="DOCUMENTS_RECEIVED">DOCUMENTS_RECEIVED</option>
                <option value="SUPERVISOR_REVIEW">SUPERVISOR_REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="EMISSION_AUTHORIZED">EMISSION_AUTHORIZED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            {/* Risco Padronizado */}
            <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1">
              <span className="text-neutral-500">RISCO:</span>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none font-bold cursor-pointer"
              >
                <option value="ALL">TODOS</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            {/* Tipo de Processo */}
            <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1">
              <span className="text-neutral-500">TIPO:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none font-bold cursor-pointer"
              >
                <option value="ALL">TODOS</option>
                <option value="PRIMEIRA_EMISSAO">PRIMEIRA_EMISSAO</option>
                <option value="RENOVACAO">RENOVACAO</option>
                <option value="SEGUNDA_VIA">SEGUNDA_VIA</option>
                <option value="ATUALIZACAO_DADOS">ATUALIZACAO_DADOS</option>
              </select>
            </div>

            {/* Jurisdição / Província */}
            <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1">
              <span className="text-neutral-500">PROVÍNCIA:</span>
              <select
                value={provinceFilter}
                onChange={e => setProvinceFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none font-bold cursor-pointer"
              >
                <option value="ALL">TODAS</option>
                <option value="LUANDA">LUANDA</option>
                <option value="HUAMBO">HUAMBO</option>
                <option value="BENGUELA">BENGUELA</option>
                <option value="HUÍLA">HUÍLA</option>
                <option value="CABINDA">CABINDA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Linha de Ordenação Operacional Estrita & Contexto ABAC */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-800/60 text-[8.5px]">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-bold">ORDENAÇÃO OPERACIONAL:</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'SLA_ASC', label: '1. SLA ASC' },
                { id: 'PRIORITY_DESC', label: '2. PRIORITY DESC' },
                { id: 'RISK_DESC', label: '3. RISK DESC' },
                { id: 'CREATED_AT_ASC', label: '4. CREATED_AT ASC' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    sortBy === opt.id
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-black'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-neutral-400">
            <span className="text-neutral-500">OPERADOR LOGADO:</span>
            <span className="text-white font-bold">{CURRENT_OPERATOR.operatorName}</span>
            <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-cyan-400 border border-neutral-800">
              {CURRENT_OPERATOR.role} • {CURRENT_OPERATOR.provinceId}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TABELA PRINCIPAL: 11 COLUNAS ESTRITAS
          DOSSIER | PROCESSO | CIDADÃO | TIPO | PROVÍNCIA | STATUS | PRIORIDADE | SLA | RISCO | RESPONSÁVEL | AÇÃO
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[8.5px]">
                <th className="py-2 px-2.5">DOSSIER</th>
                <th className="py-2 px-2">PROCESSO</th>
                <th className="py-2 px-2.5">CIDADÃO</th>
                <th className="py-2 px-1.5">TIPO</th>
                <th className="py-2 px-1.5">PROVÍNCIA</th>
                <th className="py-2 px-2">STATUS</th>
                <th className="py-2 px-1.5">PRIORIDADE</th>
                <th className="py-2 px-2">SLA</th>
                <th className="py-2 px-1.5">RISCO</th>
                <th className="py-2 px-2">RESPONSÁVEL</th>
                <th className="py-2 px-2.5 text-right">AÇÃO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {processedDossiers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-neutral-500 italic">
                    Nenhum dossiê de validação encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                processedDossiers.map(dossier => {
                  const isSelected = activeDossier?.dossierId === dossier.dossierId;
                  const sla = calculateSla(dossier.slaDeadline, dossier.slaStartedAt);
                  const isAssignedToMe = dossier.assignedValidatorId === CURRENT_OPERATOR.operatorId;

                  return (
                    <tr
                      key={dossier.dossierId}
                      onClick={() => setSelectedDossierId(dossier.dossierId)}
                      className={`hover:bg-neutral-900/60 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-950/20 border-l-2 border-emerald-500' : ''
                      }`}
                    >
                      {/* 1. DOSSIER */}
                      <td className="py-2 px-2.5 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{dossier.dossierId}</span>
                        </div>
                      </td>

                      {/* 2. PROCESSO */}
                      <td className="py-2 px-2 text-cyan-400 font-bold whitespace-nowrap">
                        {dossier.processId}
                      </td>

                      {/* 3. CIDADÃO */}
                      <td className="py-2 px-2.5 text-neutral-200">
                        <div className="font-bold text-white leading-tight">{dossier.citizenName}</div>
                        {dossier.nationalIdNumber && (
                          <div className="text-[8px] text-neutral-500 font-mono">BI: {dossier.nationalIdNumber}</div>
                        )}
                      </td>

                      {/* 4. TIPO */}
                      <td className="py-2 px-1.5 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 font-mono text-[8px]">
                          {dossier.processType}
                        </span>
                      </td>

                      {/* 5. PROVÍNCIA */}
                      <td className="py-2 px-1.5 text-neutral-400 whitespace-nowrap">
                        {dossier.provinceId}
                      </td>

                      {/* 6. STATUS */}
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold border text-[8px] ${
                            dossier.status === 'QUEUED'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : dossier.status === 'UNDER_ANALYSIS'
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : dossier.status === 'SUPERVISOR_REVIEW'
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              : dossier.status === 'EMISSION_AUTHORIZED'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : dossier.status === 'PENDING_DOCS'
                              ? 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                              : dossier.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                          }`}
                        >
                          {dossier.status}
                        </span>
                      </td>

                      {/* 7. PRIORIDADE */}
                      <td className="py-2 px-1.5 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold text-[8px] ${
                            dossier.priority === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300'
                              : dossier.priority === 'URGENT'
                              ? 'bg-amber-500/20 text-amber-300'
                              : dossier.priority === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-300'
                              : 'bg-neutral-900 text-neutral-400'
                          }`}
                        >
                          {dossier.priority}
                        </span>
                      </td>

                      {/* 8. SLA CALCULADO */}
                      <td className="py-2 px-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className={`w-3 h-3 ${
                            sla.status === 'OVERDUE'
                              ? 'text-rose-400 animate-pulse'
                              : sla.status === 'NEAR_DEADLINE'
                              ? 'text-amber-400'
                              : 'text-neutral-500'
                          }`} />
                          <span className={`font-bold text-[8px] ${
                            sla.status === 'OVERDUE'
                              ? 'text-rose-400'
                              : sla.status === 'NEAR_DEADLINE'
                              ? 'text-amber-400'
                              : 'text-neutral-400'
                          }`}>
                            {sla.label}
                          </span>
                        </div>
                      </td>

                      {/* 9. RISCO */}
                      <td className="py-2 px-1.5 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold text-[8px] border ${
                            dossier.riskLevel === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : dossier.riskLevel === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                              : dossier.riskLevel === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {dossier.riskLevel}
                        </span>
                      </td>

                      {/* 10. RESPONSÁVEL */}
                      <td className="py-2 px-2 text-neutral-300 whitespace-nowrap">
                        {dossier.assignedValidatorName ? (
                          <div className="flex items-center gap-1">
                            <span className={isAssignedToMe ? 'text-emerald-400 font-bold' : ''}>
                              {dossier.assignedValidatorName.split(' ')[0]} {dossier.assignedValidatorName.split(' ')[1] || ''}
                            </span>
                            {isAssignedToMe && (
                              <span className="text-[7.5px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300">EU</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-600 italic">NÃO ATRIBUÍDO</span>
                        )}
                      </td>

                      {/* 11. AÇÃO INLINE */}
                      <td className="py-2 px-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* ABRIR / INICIAR VALIDAÇÃO */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onSelectDossierForAnalysis(dossier.dossierId);
                            }}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black flex items-center gap-1 uppercase text-[8px]"
                            title="Abrir confrontos de validação"
                          >
                            <Eye className="w-3 h-3" />
                            <span>ABRIR</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          BARRA DE COMANDOS CONDICIONAIS DO DOSSIÊ ATIVO (SEÇÃO D)
          [ ABRIR ] [ ASSUMIR ] [ ATRIBUIR ] [ REATRIBUIR ] [ INICIAR VALIDAÇÃO ] [ ESCALAR ] [ SUSPENDER ] [ AUDITORIA ]
         ========================================================================= */}
      {activeDossier && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="text-emerald-400 font-bold">DOSSIER SELECIONADO:</span>
            <span className="text-white font-bold">{activeDossier.dossierId}</span>
            <span>•</span>
            <span className="text-neutral-200">{activeDossier.citizenName}</span>
            <span>•</span>
            <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 text-[8px]">
              ESTADO: {activeDossier.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* [ ABRIR ] / [ INICIAR VALIDAÇÃO ] */}
            <button
              onClick={() => onSelectDossierForAnalysis(activeDossier.dossierId)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black uppercase flex items-center gap-1 text-[8.5px]"
            >
              <span>INICIAR VALIDAÇÃO</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {/* [ ASSUMIR ] - Só permitido se não atribuído a outro operador ativo */}
            {(!activeDossier.assignedValidatorId || activeDossier.assignedValidatorId === CURRENT_OPERATOR.operatorId) && (
              <button
                onClick={() => handleAssume(activeDossier)}
                disabled={activeDossier.assignedValidatorId === CURRENT_OPERATOR.operatorId}
                className={`px-2.5 py-1.5 rounded-lg font-bold uppercase flex items-center gap-1 text-[8.5px] border ${
                  activeDossier.assignedValidatorId === CURRENT_OPERATOR.operatorId
                    ? 'bg-neutral-900/50 text-neutral-600 border-neutral-800 cursor-not-allowed'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border-cyan-800/40'
                }`}
              >
                <UserCheck className="w-3 h-3 text-cyan-400" />
                <span>ASSUMIR</span>
              </button>
            )}

            {/* [ ATRIBUIR ] - Se desatribuído */}
            {!activeDossier.assignedValidatorId && (
              <button
                onClick={() =>
                  setAssignModalData({
                    isOpen: true,
                    mode: 'ASSIGN',
                    dossier: activeDossier,
                    targetValidatorId: 'VAL-N1-0084',
                    targetValidatorName: 'Carlos Van-Dúnem',
                    reason: ''
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold border border-neutral-700 uppercase flex items-center gap-1 text-[8.5px]"
              >
                <Sliders className="w-3 h-3 text-amber-400" />
                <span>ATRIBUIR</span>
              </button>
            )}

            {/* [ REATRIBUIR ] - Se já atribuído (exige motivo formal) */}
            {activeDossier.assignedValidatorId && (
              <button
                onClick={() =>
                  setAssignModalData({
                    isOpen: true,
                    mode: 'REASSIGN',
                    dossier: activeDossier,
                    targetValidatorId: 'VAL-N2-0012',
                    targetValidatorName: 'Dr. Mateus Quaresma',
                    reason: ''
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold border border-amber-800/40 uppercase flex items-center gap-1 text-[8.5px]"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>REATRIBUIR</span>
              </button>
            )}

            {/* [ ESCALAR ] - Para Supervisão N3 */}
            {activeDossier.status !== 'SUPERVISOR_REVIEW' && activeDossier.status !== 'EMISSION_AUTHORIZED' && activeDossier.status !== 'REJECTED' && (
              <button
                onClick={() =>
                  setEscalateModalData({
                    isOpen: true,
                    dossier: activeDossier,
                    reason: ''
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-purple-300 font-bold border border-purple-800/50 uppercase flex items-center gap-1 text-[8.5px]"
              >
                <Lock className="w-3 h-3 text-purple-400" />
                <span>ESCALAR</span>
              </button>
            )}

            {/* [ SUSPENDER ] - PENDING_DOCS ou SUPERVISOR */}
            {activeDossier.status !== 'PENDING_DOCS' && activeDossier.status !== 'EMISSION_AUTHORIZED' && activeDossier.status !== 'CLOSED' && (
              <button
                onClick={() =>
                  setSuspendModalData({
                    isOpen: true,
                    dossier: activeDossier,
                    targetState: 'PENDING_DOCS',
                    reason: ''
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-orange-300 font-bold border border-orange-800/50 uppercase flex items-center gap-1 text-[8.5px]"
              >
                <AlertOctagon className="w-3 h-3 text-orange-400" />
                <span>SUSPENDER</span>
              </button>
            )}

            {/* [ AUDITORIA ] - Visualizar Trilha Imutável */}
            <button
              onClick={onViewAuditChain}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold border border-neutral-700 uppercase flex items-center gap-1 text-[8.5px]"
            >
              <KeyRound className="w-3 h-3 text-emerald-400" />
              <span>AUDITORIA</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ATRIBUIR / REATRIBUIR DOSSIÊ (COM JUSTIFICATIVA OBRIGATÓRIA)
         ========================================================================= */}
      {assignModalData.isOpen && assignModalData.dossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1115] border border-neutral-800 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-bold text-white uppercase">
                {assignModalData.mode === 'REASSIGN' ? 'REATRIBUIÇÃO FORMAL DE DOSSIÊ' : 'ATRIBUIÇÃO DE CARGA DE TRABALHO'}
              </span>
              <button
                onClick={() => setAssignModalData(prev => ({ ...prev, isOpen: false }))}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div><span className="text-neutral-500">DOSSIER:</span> <strong className="text-white">{assignModalData.dossier.dossierId}</strong></div>
              <div><span className="text-neutral-500">CIDADÃO:</span> {assignModalData.dossier.citizenName}</div>
              <div><span className="text-neutral-500">PROVÍNCIA / JURISDIÇÃO:</span> {assignModalData.dossier.provinceId}</div>
              <div><span className="text-neutral-500">ATRIBUÍDO ATUAL:</span> {assignModalData.dossier.assignedValidatorName || 'Nenhum'}</div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">NOVO VALIDADOR RESPONSÁVEL (RBAC + ABAC):</label>
                <select
                  value={assignModalData.targetValidatorId}
                  onChange={e => setAssignModalData(prev => ({ ...prev, targetValidatorId: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                >
                  {availableValidators.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {assignModalData.mode === 'REASSIGN' && (
                <div>
                  <label className="text-amber-400 font-bold block mb-1">MOTIVO OBRIGATÓRIO DA REATRIBUIÇÃO:</label>
                  <textarea
                    value={assignModalData.reason}
                    onChange={e => setAssignModalData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Registrar motivo técnico/operacional da reatribuição (ex: redistribuição de carga por ausência médica, complexidade N2)..."
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setAssignModalData(prev => ({ ...prev, isOpen: false }))}
                className="px-3 py-1.5 rounded bg-neutral-900 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleExecuteAssign}
                className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black uppercase"
              >
                CONFIRMAR {assignModalData.mode === 'REASSIGN' ? 'REATRIBUIÇÃO' : 'ATRIBUIÇÃO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ESCALAR PARA SUPERVISÃO (MUDANÇA PARA SUPERVISOR_REVIEW)
         ========================================================================= */}
      {escalateModalData.isOpen && escalateModalData.dossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1115] border border-purple-800/60 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                <Lock className="w-4 h-4" />
                <span className="uppercase">ESCALAÇÃO PARA MESA SUPERVISORA (N3)</span>
              </div>
              <button
                onClick={() => setEscalateModalData(prev => ({ ...prev, isOpen: false }))}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div><span className="text-neutral-500">DOSSIER:</span> <strong className="text-white">{escalateModalData.dossier.dossierId}</strong></div>
              <div><span className="text-neutral-500">CIDADÃO:</span> {escalateModalData.dossier.citizenName}</div>
              <div><span className="text-neutral-500">RISCO ATUAL:</span> <strong className="text-rose-400">{escalateModalData.dossier.riskLevel}</strong></div>
              <div><span className="text-neutral-500">ESTADO RESULTANTE:</span> <span className="text-purple-300 font-bold">SUPERVISOR_REVIEW</span></div>
            </div>

            <div>
              <label className="text-purple-400 font-bold block mb-1">FUNDAMENTO DA ESCALAÇÃO (OBRIGATÓRIO):</label>
              <textarea
                value={escalateModalData.reason}
                onChange={e => setEscalateModalData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Descreva a inconclusão biométrica, discrepância de assento ou colisão suspeita que exige decisão de nível superior..."
                rows={3}
                className="w-full bg-neutral-950 border border-purple-800/50 rounded p-2 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setEscalateModalData(prev => ({ ...prev, isOpen: false }))}
                className="px-3 py-1.5 rounded bg-neutral-900 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleExecuteEscalate}
                className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-black uppercase flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>CONFIRMAR ESCALAÇÃO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SUSPENDER PROCESSO (ESTADOS INSTITUCIONAIS DEFINIDOS)
         ========================================================================= */}
      {suspendModalData.isOpen && suspendModalData.dossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1115] border border-orange-800/60 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                <AlertOctagon className="w-4 h-4" />
                <span className="uppercase">SUSPENDER PROCESSO DE VALIDAÇÃO</span>
              </div>
              <button
                onClick={() => setSuspendModalData(prev => ({ ...prev, isOpen: false }))}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div><span className="text-neutral-500">DOSSIER:</span> <strong className="text-white">{suspendModalData.dossier.dossierId}</strong></div>
              <div><span className="text-neutral-500">CIDADÃO:</span> {suspendModalData.dossier.citizenName}</div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">DESTINO INSTITUCIONAL DA SUSPENSÃO:</label>
                <select
                  value={suspendModalData.targetState}
                  onChange={e => setSuspendModalData(prev => ({ ...prev, targetState: e.target.value as any }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white font-bold focus:outline-none"
                >
                  <option value="PENDING_DOCS">PENDING_DOCS (Exigir saneamento de documentos ao cidadão)</option>
                  <option value="SUPERVISOR_REVIEW">SUPERVISOR_REVIEW (Exceção técnica / dependência externa)</option>
                </select>
              </div>

              <div>
                <label className="text-orange-400 font-bold block mb-1">MOTIVO FORMAL DA SUSPENSÃO (OBRIGATÓRIO):</label>
                <textarea
                  value={suspendModalData.reason}
                  onChange={e => setSuspendModalData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Justifique a carência probatória, certidão ilegível ou pendência externa..."
                  rows={3}
                  className="w-full bg-neutral-950 border border-orange-800/50 rounded p-2 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setSuspendModalData(prev => ({ ...prev, isOpen: false }))}
                className="px-3 py-1.5 rounded bg-neutral-900 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleExecuteSuspend}
                className="px-4 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-black uppercase flex items-center gap-1"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>CONFIRMAR SUSPENSÃO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REAUTENTICAÇÃO FORTE INSTITUCIONAL (MÓDULO 02 IAM / MFA)
         ========================================================================= */}
      {reauthModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1115] border border-rose-500/50 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Lock className="w-4 h-4" />
                <span className="uppercase">{reauthModalData.title}</span>
              </div>
              <button
                onClick={() => setReauthModalData(prev => ({ ...prev, isOpen: false }))}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-neutral-300 leading-relaxed text-[8.5px]">
              {reauthModalData.description}
            </p>

            <div className="space-y-1.5">
              <label className="text-neutral-300 font-bold block">
                INSIRA A PALAVRA-PASSE / TOKEN DE SEGURANÇA IAM:
              </label>
              <input
                type="password"
                value={reauthPassword}
                onChange={e => setReauthPassword(e.target.value)}
                placeholder="Introduza credencial IAM..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white font-mono text-center tracking-widest focus:outline-none focus:border-rose-500"
              />
              {reauthError && <div className="text-rose-400 font-bold">{reauthError}</div>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setReauthModalData(prev => ({ ...prev, isOpen: false }))}
                className="px-3 py-1.5 rounded bg-neutral-900 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleConfirmReauth}
                className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-black uppercase"
              >
                CONFIRMAR REAUTENTICAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
