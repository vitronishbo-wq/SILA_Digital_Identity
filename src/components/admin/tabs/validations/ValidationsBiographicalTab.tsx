import React, { useState, useMemo } from 'react';
import {
  ValidationDossier,
  BiographicalValidation,
  BiographicalValidationEngineStatus,
  BiographicalResult,
  FieldMatchStatus,
  DivergenceSeverity,
  BiographicalFieldComparison,
  ValidationException,
  ValidationAuditEvent,
  OperatorContext
} from '../../../../types/validations';
import {
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSearch,
  Scale,
  Lock,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  FileText,
  KeyRound,
  Check,
  X,
  FileSpreadsheet,
  Building2,
  History,
  Info,
  CheckCheck
} from 'lucide-react';

interface ValidationsBiographicalTabProps {
  dossiers: ValidationDossier[];
  activeDossierId: string;
  onSelectDossier: (dossierId: string) => void;
  onUpdateDossier: (updatedDossier: ValidationDossier) => void;
  onAddAuditEvent: (event: ValidationAuditEvent) => void;
  onNavigateToTab?: (tabId: any) => void;
}

export const ValidationsBiographicalTab: React.FC<ValidationsBiographicalTabProps> = ({
  dossiers,
  activeDossierId,
  onSelectDossier,
  onUpdateDossier,
  onAddAuditEvent,
  onNavigateToTab
}) => {
  // Contexto do Operador Atual (Módulo 02 IAM / RBAC + ABAC)
  const currentOperator: OperatorContext = {
    operatorId: 'VAL-N1-0084',
    operatorName: 'Carlos Van-Dúnem',
    role: 'VALIDADOR_N1',
    organization: 'DNI_MINJUSDH',
    provinceId: 'LUANDA',
    servicePointId: 'POSTO-LUANDA-CENTRAL',
    terminalId: 'TERM-VAL-LUA-01',
  };

  // Dossiê selecionado
  const dossier = useMemo(() => {
    return dossiers.find(d => d.dossierId === activeDossierId) || dossiers[0];
  }, [dossiers, activeDossierId]);

  const bio: BiographicalValidation = dossier.biographicalValidation;

  // Filtro na Matriz de Confronto
  const [matrixFilter, setMatrixFilter] = useState<'ALL' | 'MISMATCH_ONLY' | 'MATCH_ONLY'>('ALL');

  // Modais de Comandos
  const [showRunComparisonModal, setShowRunComparisonModal] = useState<boolean>(false);
  const [showProcessDataModal, setShowProcessDataModal] = useState<boolean>(false);
  const [showOfficialRecordModal, setShowOfficialRecordModal] = useState<boolean>(false);
  const [showSanitationModal, setShowSanitationModal] = useState<boolean>(false);
  const [showEscalationModal, setShowEscalationModal] = useState<boolean>(false);
  const [showResolveFieldModal, setShowResolveFieldModal] = useState<BiographicalFieldComparison | null>(null);
  const [showResolveDossierModal, setShowResolveDossierModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

  // Estados de formulários dos modais
  const [sanitationField, setSanitationField] = useState<string>('MOTHER_NAME');
  const [sanitationReason, setSanitationReason] = useState<string>('');
  const [sanitationEvidenceReq, setSanitationEvidenceReq] = useState<string>('Apresentação de Assento de Nascimento original ou Certidão de Narrativa Completa atualizada.');

  const [escalationReason, setEscalationReason] = useState<string>('');
  const [escalationEvidence, setEscalationEvidence] = useState<string>('');

  const [resolveJustification, setResolveJustification] = useState<string>('');
  const [resolveEvidenceDoc, setResolveEvidenceDoc] = useState<string>('');

  // Reautenticação Forte (IAM / MFA)
  const [reauthPassword, setReauthPassword] = useState<string>('');
  const [reauthError, setReauthError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showReauthModal, setShowReauthModal] = useState<boolean>(false);
  const [reauthTitle, setReauthTitle] = useState<string>('');

  // Validação RBAC + ABAC Territorial
  const hasJurisdiction = currentOperator.role === 'SUPERVISOR_N3' || 
    dossier.provinceId === currentOperator.provinceId || 
    dossier.provinceId === 'LUANDA'; // Sede central possui jurisdição ampla

  const canExecuteAnalysis = hasJurisdiction && (
    dossier.status === 'UNDER_ANALYSIS' || 
    dossier.status === 'QUEUED' || 
    dossier.status === 'PENDING_DOCS' ||
    dossier.status === 'SUPERVISOR_REVIEW'
  );

  // Helper para solicitar Reautenticação Forte
  const requestStrongAuth = (actionName: string, onAuthorized: () => void) => {
    setReauthTitle(actionName);
    setPendingAction(() => onAuthorized);
    setReauthPassword('');
    setReauthError(null);
    setShowReauthModal(true);
  };

  const handleConfirmReauth = () => {
    if (!reauthPassword || reauthPassword.length < 4) {
      setReauthError('Credencial IAM / Palavra-passe forte obrigatória (mínimo 4 caracteres).');
      return;
    }
    setShowReauthModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Helper para gerar Hash SHA-256 Mock encadeado
  const generateNewHash = (prev: string, payload: string) => {
    const chars = '0123456789abcdef';
    let res = '';
    for (let i = 0; i < 64; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  };

  // 1. COMANDO: EXECUTAR CONFRONTO BIOGRÁFICO AUTOMÁTICO (MOTOR 02)
  const handleExecuteComparison = () => {
    setShowRunComparisonModal(false);

    // Calcular estatísticas com base nos campos
    const comparisons = bio.fieldComparisons || [];
    const matched = comparisons.filter(c => c.matchStatus === 'MATCH').length;
    const mismatched = comparisons.filter(c => c.matchStatus === 'MISMATCH').length;
    const missing = comparisons.filter(c => c.matchStatus === 'MISSING_SOURCE' || c.matchStatus === 'MISSING_OFFICIAL').length;

    let nextResult: BiographicalResult = 'MATCH';
    let nextStatus: BiographicalValidationEngineStatus = 'MATCH';
    let conf = 100;

    if (mismatched > 0) {
      const hasCritical = comparisons.some(c => c.matchStatus === 'MISMATCH' && c.severity === 'CRITICAL');
      const hasHigh = comparisons.some(c => c.matchStatus === 'MISMATCH' && c.severity === 'HIGH');
      
      // REGRA INSTITUCIONAL: CRITICAL + MISMATCH => SUPERVISOR_REVIEW (NUNCA REJECTED / FRAUDE SUMÁRIA)
      if (hasCritical) {
        nextResult = 'MISMATCH';
        nextStatus = 'SUPERVISOR_REVIEW';
        conf = 65;
      } else if (hasHigh) {
        nextResult = 'PARTIAL_MATCH';
        nextStatus = 'PENDING_REVIEW';
        conf = 82;
      } else {
        nextResult = 'PARTIAL_MATCH';
        nextStatus = 'PENDING_REVIEW';
        conf = 90;
      }
    }

    const timestamp = new Date().toISOString();
    const newHash = generateNewHash(bio.currentHash, `COMPARISON_${dossier.dossierId}_${timestamp}`);
    const signature = `SIG_ECDSA_CIVIL_AUTO_${Math.random().toString(36).substring(2).toUpperCase()}`;

    const updatedBio: BiographicalValidation = {
      ...bio,
      status: nextStatus,
      result: nextResult,
      confidence: conf,
      matchedFields: matched,
      mismatchedFields: mismatched,
      missingFields: missing,
      validatedBy: currentOperator.operatorId,
      validatedAt: timestamp,
      previousHash: bio.currentHash,
      currentHash: newHash,
      digitalSignature: signature,
      civilRecordMatched: true,
      birthEntryVerified: true,
      parentageVerified: mismatched === 0,
      discrepancies: mismatched > 0 ? comparisons.filter(c => c.matchStatus === 'MISMATCH').map(c => `${c.fieldName}: Processo (${c.sourceValue}) vs Oficial (${c.officialValue})`) : [],
    };

    // REGRA 2.1: O resultado do motor alimenta APENAS biographicalValidation. Não decide ValidationDossier.status.
    const updatedDossier: ValidationDossier = {
      ...dossier,
      biographicalValidation: updatedBio,
      updatedAt: timestamp,
    };

    onUpdateDossier(updatedDossier);

    // Evento de Auditoria Append-Only
    const auditEvent: ValidationAuditEvent = {
      eventId: `VAL-EVT-BIO-${Date.now().toString().slice(-6)}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'BIO_COMPARISON_EXECUTED',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Confronto biográfico executado pelo Motor 02. Resultado: ${nextResult} (${conf}% score - não decisório). Conformes: ${matched}, Divergências: ${mismatched}.`,
      timestamp,
      previousHash: dossier.currentHash,
      currentHash: newHash,
      digitalSignature: signature,
      auditChainRef: dossier.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `MOTOR_02: Status ${nextStatus}, Veredito ${nextResult}, Mismatches: ${mismatched}.`,
      silaGlobalAuditRef: `SILA_AUDIT_BIO_${Date.now()}`
    };

    onAddAuditEvent(auditEvent);
  };

  // 2. COMANDO: SOLICITAR SANEAMENTO DOCUMENTAL (EXCEÇÃO)
  const handleCreateSanitation = () => {
    if (!sanitationReason) return;

    requestStrongAuth('SOLICITAR SANEAMENTO DOCUMENTAL AO CIDADÃO', () => {
      const timestamp = new Date().toISOString();
      const exceptionId = `EXC-BIO-${Date.now().toString().slice(-6)}`;

      const newException: ValidationException = {
        exceptionId,
        dossierId: dossier.dossierId,
        type: 'BIOGRAFICA',
        severity: 'HIGH',
        description: `Divergência no campo ${sanitationField}: ${sanitationReason}`,
        evidence: sanitationEvidenceReq,
        assignedTo: currentOperator.operatorId,
        deadline: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        status: 'OPEN',
        auditRef: `AUDIT_${exceptionId}`,
      };

      const newHash = generateNewHash(dossier.currentHash, `SANIZATION_${exceptionId}`);
      const signature = `SIG_SANIZATION_${Math.random().toString(36).substring(2).toUpperCase()}`;

      const updatedBio: BiographicalValidation = {
        ...bio,
        status: 'PENDING_REVIEW',
        exceptions: [...(bio.exceptions || []), newException],
        previousHash: bio.currentHash,
        currentHash: newHash,
        digitalSignature: signature,
      };

      const updatedDossier: ValidationDossier = {
        ...dossier,
        status: 'PENDING_DOCS',
        biographicalValidation: updatedBio,
        exceptions: [...(dossier.exceptions || []), newException],
        updatedAt: timestamp,
      };

      onUpdateDossier(updatedDossier);

      const auditEvent: ValidationAuditEvent = {
        eventId: `VAL-EVT-BIO-${Date.now().toString().slice(-6)}`,
        dossierId: dossier.dossierId,
        operatorId: currentOperator.operatorId,
        operatorRole: currentOperator.role,
        command: 'BIO_SANITATION_REQUESTED',
        previousState: dossier.status,
        newState: 'PENDING_DOCS',
        reason: `Exceção de saneamento ${exceptionId} aberta para o campo ${sanitationField}. Motivo: ${sanitationReason}. Exigência: ${sanitationEvidenceReq}.`,
        timestamp,
        previousHash: dossier.currentHash,
        currentHash: newHash,
        digitalSignature: signature,
        auditChainRef: dossier.auditChainRef,
        terminalId: currentOperator.terminalId,
        payloadSummary: `Saneamento registado para ${sanitationField}. Estado alterado para PENDING_DOCS.`,
        silaGlobalAuditRef: `SILA_AUDIT_EXC_${Date.now()}`
      };

      onAddAuditEvent(auditEvent);
      setShowSanitationModal(false);
      setSanitationReason('');
    });
  };

  // 3. COMANDO: ESCALAR PARA SUPERVISÃO N3
  const handleEscalateToSupervisor = () => {
    if (!escalationReason) return;

    requestStrongAuth('ESCALAR DIVERGÊNCIA BIOGRÁFICA PARA SUPERVISÃO (N3)', () => {
      const timestamp = new Date().toISOString();
      const exceptionId = `EXC-ESC-${Date.now().toString().slice(-6)}`;

      const escalationExc: ValidationException = {
        exceptionId,
        dossierId: dossier.dossierId,
        type: 'BIOGRAFICA',
        severity: 'CRITICAL',
        description: `Escalação para Mesa Supervisora: ${escalationReason}`,
        evidence: escalationEvidence || 'Conflito de dados de identidade sensíveis.',
        assignedTo: 'SUP-NAC-0003',
        deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        status: 'ESCALATED',
        auditRef: `AUDIT_${exceptionId}`,
      };

      const newHash = generateNewHash(dossier.currentHash, `ESCALATION_${exceptionId}`);
      const signature = `SIG_ESCALATION_${Math.random().toString(36).substring(2).toUpperCase()}`;

      const updatedBio: BiographicalValidation = {
        ...bio,
        status: 'SUPERVISOR_REVIEW',
        exceptions: [...(bio.exceptions || []), escalationExc],
        previousHash: bio.currentHash,
        currentHash: newHash,
        digitalSignature: signature,
      };

      const updatedDossier: ValidationDossier = {
        ...dossier,
        status: 'SUPERVISOR_REVIEW',
        priority: 'CRITICAL',
        riskLevel: 'CRITICAL',
        assignedSupervisorId: 'SUP-NAC-0003',
        biographicalValidation: updatedBio,
        exceptions: [...(dossier.exceptions || []), escalationExc],
        updatedAt: timestamp,
      };

      onUpdateDossier(updatedDossier);

      const auditEvent: ValidationAuditEvent = {
        eventId: `VAL-EVT-BIO-${Date.now().toString().slice(-6)}`,
        dossierId: dossier.dossierId,
        operatorId: currentOperator.operatorId,
        operatorRole: currentOperator.role,
        command: 'BIO_ESCALATED',
        previousState: dossier.status,
        newState: 'SUPERVISOR_REVIEW',
        reason: `Dossiê escalado formalmente para supervisão N3. Motivo: ${escalationReason}. Evidência: ${escalationEvidence}.`,
        timestamp,
        previousHash: dossier.currentHash,
        currentHash: newHash,
        digitalSignature: signature,
        auditChainRef: dossier.auditChainRef,
        terminalId: currentOperator.terminalId,
        payloadSummary: `Escalação supervisora: ${escalationReason}.`,
        silaGlobalAuditRef: `SILA_AUDIT_ESC_${Date.now()}`
      };

      onAddAuditEvent(auditEvent);
      setShowEscalationModal(false);
      setEscalationReason('');
      setEscalationEvidence('');
    });
  };

  // 4. COMANDO: RESOLVER DIVERGÊNCIA DE CAMPO ESPECÍFICO
  const handleResolveField = () => {
    if (!showResolveFieldModal || !resolveJustification || !resolveEvidenceDoc) return;

    requestStrongAuth(`RESOLVER DIVERGÊNCIA NO CAMPO: ${showResolveFieldModal.fieldName}`, () => {
      const timestamp = new Date().toISOString();
      const targetFieldCode = showResolveFieldModal.fieldCode;

      const updatedComparisons = (bio.fieldComparisons || []).map(c => {
        if (c.fieldCode === targetFieldCode) {
          return {
            ...c,
            matchStatus: 'MATCH' as FieldMatchStatus,
            isResolved: true,
            resolutionJustification: resolveJustification,
            resolutionEvidence: resolveEvidenceDoc,
            resolvedBy: currentOperator.operatorId,
            resolvedAt: timestamp,
            notes: `Divergência saneada/justificada: ${resolveJustification} (Doc: ${resolveEvidenceDoc})`,
          };
        }
        return c;
      });

      const remainingMismatches = updatedComparisons.filter(c => c.matchStatus === 'MISMATCH').length;
      const nextStatus: BiographicalValidationEngineStatus = remainingMismatches === 0 ? 'RESOLVED' : 'PENDING_REVIEW';
      const nextResult: BiographicalResult = remainingMismatches === 0 ? 'MATCH' : 'PARTIAL_MATCH';

      const newHash = generateNewHash(dossier.currentHash, `RESOLVE_FIELD_${targetFieldCode}`);
      const signature = `SIG_RESOLVE_ECDSA_${Math.random().toString(36).substring(2).toUpperCase()}`;

      const updatedBio: BiographicalValidation = {
        ...bio,
        status: nextStatus,
        result: nextResult,
        confidence: remainingMismatches === 0 ? 100 : 92,
        matchedFields: updatedComparisons.filter(c => c.matchStatus === 'MATCH').length,
        mismatchedFields: remainingMismatches,
        fieldComparisons: updatedComparisons,
        discrepancies: remainingMismatches === 0 ? [] : bio.discrepancies?.filter(d => !d.includes(showResolveFieldModal.fieldName)),
        previousHash: bio.currentHash,
        currentHash: newHash,
        digitalSignature: signature,
        validatedBy: currentOperator.operatorId,
        validatedAt: timestamp,
      };

      const updatedDossier: ValidationDossier = {
        ...dossier,
        biographicalValidation: updatedBio,
        updatedAt: timestamp,
      };

      onUpdateDossier(updatedDossier);

      const auditEvent: ValidationAuditEvent = {
        eventId: `VAL-EVT-BIO-${Date.now().toString().slice(-6)}`,
        dossierId: dossier.dossierId,
        operatorId: currentOperator.operatorId,
        operatorRole: currentOperator.role,
        command: 'BIO_RESOLVED',
        previousState: dossier.status,
        newState: updatedDossier.status,
        reason: `Divergência no campo ${showResolveFieldModal.fieldName} resolvida formalmente por ${currentOperator.operatorName}. Justificativa: ${resolveJustification}. Evidência: ${resolveEvidenceDoc}.`,
        timestamp,
        previousHash: dossier.currentHash,
        currentHash: newHash,
        digitalSignature: signature,
        auditChainRef: dossier.auditChainRef,
        terminalId: currentOperator.terminalId,
        payloadSummary: `Campo ${targetFieldCode} marcado como MATCH após análise probatória.`,
        silaGlobalAuditRef: `SILA_AUDIT_RES_${Date.now()}`
      };

      onAddAuditEvent(auditEvent);
      setShowResolveFieldModal(null);
      setResolveJustification('');
      setResolveEvidenceDoc('');
    });
  };

  // 5. COMANDO: CONFIRMAR RESULTADO BIOGRÁFICO DO MOTOR 02
  const handleCompleteBioValidation = () => {
    requestStrongAuth('CONFIRMAR RESULTADO BIOGRÁFICO DO DOSSIÊ', () => {
      const timestamp = new Date().toISOString();
      const newHash = generateNewHash(dossier.currentHash, `CONFIRM_BIO_${dossier.dossierId}`);
      const signature = `SIG_BIO_CONFIRM_${Math.random().toString(36).substring(2).toUpperCase()}`;

      const updatedBio: BiographicalValidation = {
        ...bio,
        status: 'RESOLVED',
        result: 'MATCH',
        confidence: 100,
        validatedBy: currentOperator.operatorId,
        validatedAt: timestamp,
        previousHash: bio.currentHash,
        currentHash: newHash,
        digitalSignature: signature,
      };

      // REGRA: O resultado retorna ao ValidationDossier.biographicalValidation sem alterar ValidationDossier.status
      const updatedDossier: ValidationDossier = {
        ...dossier,
        biographicalValidation: updatedBio,
        updatedAt: timestamp,
      };

      onUpdateDossier(updatedDossier);

      const auditEvent: ValidationAuditEvent = {
        eventId: `VAL-EVT-BIO-${Date.now().toString().slice(-6)}`,
        dossierId: dossier.dossierId,
        operatorId: currentOperator.operatorId,
        operatorRole: currentOperator.role,
        command: 'BIO_RESOLVED',
        previousState: dossier.status,
        newState: dossier.status,
        reason: `Resultado do Motor 02 confirmado como RESOLVED (MATCH 100%) por ${currentOperator.operatorName}. Registo civil oficial confrontado com sucesso.`,
        timestamp,
        previousHash: dossier.currentHash,
        currentHash: newHash,
        digitalSignature: signature,
        auditChainRef: dossier.auditChainRef,
        terminalId: currentOperator.terminalId,
        payloadSummary: `Confirmação de resultado do motor biográfico registada no dossiê.`,
        silaGlobalAuditRef: `SILA_AUDIT_CONF_${Date.now()}`
      };

      onAddAuditEvent(auditEvent);
      setShowResolveDossierModal(false);
    });
  };

  // Filtragem da Matriz
  const filteredComparisons = useMemo(() => {
    const list = bio.fieldComparisons || [];
    if (matrixFilter === 'MISMATCH_ONLY') {
      return list.filter(c => c.matchStatus === 'MISMATCH');
    }
    if (matrixFilter === 'MATCH_ONLY') {
      return list.filter(c => c.matchStatus === 'MATCH');
    }
    return list;
  }, [bio.fieldComparisons, matrixFilter]);

  // Lista de divergências ativas
  const activeDivergences = useMemo(() => {
    return (bio.fieldComparisons || []).filter(c => c.matchStatus === 'MISMATCH');
  }, [bio.fieldComparisons]);

  return (
    <div id="validations-biographical-root" className="space-y-3 font-mono text-[9px] text-neutral-200">
      {/* =========================================================================
          ZONA 01: IDENTIFICAÇÃO E CONTEXTO DO DOSSIÊ BIOGRÁFICO
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2.5 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black tracking-widest text-cyan-400 uppercase">
                  02 — VALIDAÇÃO BIOGRÁFICA (REGISTO CIVIL NACIONAL)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono text-[8px] border border-neutral-700">
                  CIVIL_CORE_GATEWAY_V2
                </span>
              </div>
              <p className="text-[9px] text-neutral-400 font-mono mt-0.5">
                Confronto probatório estrito entre os dados declarados no processo e a base mestre de Registo Civil (MINJUSDH)
              </p>
            </div>
          </div>

          {/* Seletor Rápido de Dossiê */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-[9px]">DOSSIÊ EM ANÁLISE:</span>
            <select
              value={activeDossierId}
              onChange={e => onSelectDossier(e.target.value)}
              className="bg-neutral-900 border border-cyan-500/30 rounded-lg px-2.5 py-1 text-white font-bold font-mono text-[9px] focus:outline-none focus:border-cyan-400"
            >
              {dossiers.map(d => (
                <option key={d.dossierId} value={d.dossierId}>
                  {d.dossierId} — {d.citizenName} [{d.biographicalValidation.status}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6 Metadados Estruturados da Zona 01 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-2">
            <div className="text-neutral-500 text-[8px] uppercase">DOSSIÊ CANÓNICO</div>
            <div className="text-white font-black truncate">{dossier.dossierId}</div>
            <div className="text-[8px] text-neutral-400 mt-0.5">{dossier.processType}</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-2">
            <div className="text-neutral-500 text-[8px] uppercase">PROCESSO ORIGEM</div>
            <div className="text-cyan-400 font-bold truncate">{dossier.processId}</div>
            <div className="text-[8px] text-neutral-400 mt-0.5">Sessão: {dossier.attendanceSessionId}</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-2">
            <div className="text-neutral-500 text-[8px] uppercase">CIDADÃO DECLARANTE</div>
            <div className="text-white font-bold truncate">{dossier.citizenName}</div>
            <div className="text-[8px] text-neutral-400 mt-0.5">BI: {dossier.nationalIdNumber || '1ª EMISSÃO'}</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-2">
            <div className="text-neutral-500 text-[8px] uppercase">ESTADO DO MOTOR (02)</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`px-1.5 py-0.5 rounded font-black text-[8px] border ${
                bio.status === 'MATCH' || bio.status === 'RESOLVED'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : bio.status === 'PARTIAL_MATCH' || bio.status === 'PENDING_REVIEW'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}>
                {bio.status}
              </span>
            </div>
            <div className="text-[8px] text-neutral-400 mt-0.5">Veredito: {bio.result}</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-2">
            <div className="text-neutral-500 text-[8px] uppercase">FONTE OFICIAL REGISTO</div>
            <div className="text-neutral-300 font-bold truncate">{bio.sourceRecordRef || 'RC_CENTRAL'}</div>
            <div className="text-[8px] text-neutral-400 mt-0.5">Versão: {bio.sourceVersion}</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-2">
            <div className="text-neutral-500 text-[8px] uppercase">RESPONSÁVEL / OPERADOR</div>
            <div className="text-white font-bold truncate">{bio.validatedBy || currentOperator.operatorName}</div>
            <div className="text-[8px] text-neutral-400 mt-0.5">Terminal: {currentOperator.terminalId}</div>
          </div>
        </div>

        {/* Alerta de Jurisdição RBAC/ABAC */}
        {!hasJurisdiction && (
          <div className="bg-rose-950/40 border border-rose-500/50 rounded-lg p-2 flex items-center justify-between text-rose-300">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>AVISO DE JURISDIÇÃO: Este processo pertence à província de {dossier.provinceId}. Operador alocado em {currentOperator.provinceId}. Apenas modo de leitura autorizado.</span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ZONA 04: DECISÃO & ESTATÍSTICA DO MOTOR (COLOCADA EM DESTAQUE SUPERIOR)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-neutral-500 text-[8px] uppercase">SCORE DE CONFIANÇA BIOGRÁFICA</div>
            <div className="text-xl font-black text-cyan-400 mt-0.5">{bio.confidence}%</div>
            <div className="text-[7.5px] text-amber-400 mt-0.5 font-bold">INDICADOR PROBATÓRIO (NÃO DECISÓRIO)</div>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            bio.confidence >= 95 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : bio.confidence >= 80 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {bio.confidence >= 95 ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
        </div>

        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-neutral-500 text-[8px] uppercase">CAMPOS CONFORMES (MATCH)</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{bio.matchedFields} / {(bio.fieldComparisons || []).length}</div>
            <div className="text-[8px] text-neutral-400 mt-0.5">Confrontados com o Registo Civil</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-neutral-500 text-[8px] uppercase">DIVERGÊNCIAS ATIVAS (MISMATCH)</div>
            <div className={`text-xl font-black mt-0.5 ${bio.mismatchedFields > 0 ? 'text-rose-400' : 'text-neutral-400'}`}>
              {bio.mismatchedFields}
            </div>
            <div className="text-[8px] text-neutral-400 mt-0.5">
              {bio.mismatchedFields > 0 ? 'Exige saneamento ou resolução' : 'Nenhuma divergência ativa'}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            bio.mismatchedFields > 0 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-neutral-900 border-neutral-800 text-neutral-500'
          }`}>
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-neutral-500 text-[8px] uppercase">ASSINATURA CRIPTOGRÁFICA</div>
            <div className="text-white font-bold truncate max-w-[140px] mt-0.5">{bio.digitalSignature || 'SIG_PENDING'}</div>
            <div className="text-[8px] text-neutral-500 mt-0.5 truncate">Hash: {bio.currentHash.slice(0, 16)}...</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          ZONA 02: MATRIZ DE CONFRONTO BIOGRÁFICO CAMPO A CAMPO (CENTRAL)
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2.5 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white text-[10px] uppercase">
              MATRIZ PROBATÓRIA CAMPO A CAMPO (PROCESSO vs. ASSENTO CIVIL OFICIAL)
            </span>
          </div>

          {/* Filtros da Tabela */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-[8px]">FILTRAR MATRIZ:</span>
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
              <button
                onClick={() => setMatrixFilter('ALL')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                  matrixFilter === 'ALL' ? 'bg-cyan-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                TODOS ({(bio.fieldComparisons || []).length})
              </button>
              <button
                onClick={() => setMatrixFilter('MISMATCH_ONLY')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                  matrixFilter === 'MISMATCH_ONLY' ? 'bg-rose-500 text-white' : 'text-neutral-400 hover:text-rose-300'
                }`}
              >
                DIVERGÊNCIAS ({bio.mismatchedFields})
              </button>
              <button
                onClick={() => setMatrixFilter('MATCH_ONLY')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                  matrixFilter === 'MATCH_ONLY' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400 hover:text-emerald-300'
                }`}
              >
                CONFORMES ({bio.matchedFields})
              </button>
            </div>
          </div>
        </div>

        {/* Tabela Densa de Confronto */}
        <div className="overflow-x-auto border border-neutral-800 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800 text-[8px] text-neutral-400 uppercase tracking-wider font-bold">
                <th className="py-2 px-2.5 w-1/5">CAMPO BIOGRÁFICO</th>
                <th className="py-2 px-2.5 w-1/4">VALOR NO PROCESSO (ATENDIMENTO 09)</th>
                <th className="py-2 px-2.5 w-1/4">VALOR NO REGISTO OFICIAL (MINJUSDH)</th>
                <th className="py-2 px-2 text-center w-28">ESTADO</th>
                <th className="py-2 px-2 text-center w-24">GRAVIDADE</th>
                <th className="py-2 px-2.5 text-right w-28">AÇÃO / SANEAMENTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 bg-[#0c0e12]">
              {filteredComparisons.map((c, idx) => {
                const isMismatch = c.matchStatus === 'MISMATCH';
                return (
                  <tr
                    key={c.fieldCode || idx}
                    className={`hover:bg-neutral-900/60 transition-colors ${
                      isMismatch ? 'bg-rose-950/15' : c.isResolved ? 'bg-emerald-950/15' : ''
                    }`}
                  >
                    {/* 1. Nome do Campo */}
                    <td className="py-2 px-2.5 font-bold text-neutral-300">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-white">{c.fieldName}</span>
                      </div>
                      <span className="text-[7.5px] text-neutral-500 font-mono font-normal block">{c.fieldCode}</span>
                    </td>

                    {/* 2. Valor no Processo */}
                    <td className="py-2 px-2.5 text-neutral-200">
                      <div className={`font-mono text-[9px] ${isMismatch ? 'text-amber-300 font-bold' : ''}`}>
                        {c.sourceValue || '<NÃO FORNECIDO>'}
                      </div>
                    </td>

                    {/* 3. Valor no Registo Oficial */}
                    <td className="py-2 px-2.5 text-neutral-200">
                      <div className={`font-mono text-[9px] ${isMismatch ? 'text-cyan-300 font-bold' : 'text-neutral-300'}`}>
                        {c.officialValue || '<NÃO REGISTADO>'}
                      </div>
                      {c.notes && (
                        <div className="text-[7.5px] text-neutral-400 mt-0.5 italic">
                          ↳ {c.notes}
                        </div>
                      )}
                    </td>

                    {/* 4. Estado de Match */}
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded font-black text-[8px] border ${
                        c.matchStatus === 'MATCH'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : c.matchStatus === 'MISMATCH'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : c.matchStatus === 'NOT_APPLICABLE'
                          ? 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {c.matchStatus}
                      </span>
                    </td>

                    {/* 5. Gravidade */}
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded font-bold text-[8px] ${
                        c.severity === 'CRITICAL'
                          ? 'bg-rose-600 text-white'
                          : c.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : c.severity === 'MEDIUM'
                          ? 'bg-yellow-500/15 text-yellow-300'
                          : 'text-neutral-500'
                      }`}>
                        {c.matchStatus === 'MISMATCH' ? c.severity : '—'}
                      </span>
                    </td>

                    {/* 6. Ação / Resolução Probatória */}
                    <td className="py-2 px-2.5 text-right">
                      {isMismatch ? (
                        <button
                          onClick={() => {
                            setShowResolveFieldModal(c);
                            setResolveJustification('');
                            setResolveEvidenceDoc('');
                          }}
                          disabled={!canExecuteAnalysis}
                          className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-neutral-950 font-black uppercase text-[8px] flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <span>RESOLVER</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ) : c.isResolved ? (
                        <span className="text-emerald-400 text-[8px] font-bold flex items-center justify-end gap-1">
                          <Check className="w-3 h-3" /> RESOLVIDO
                        </span>
                      ) : (
                        <span className="text-neutral-600 text-[8px]">CONFORME</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          ZONA 03: REGRA ANTIFALSA POSITIVA & PAINEL DE DIVERGÊNCIAS ATIVAS
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] uppercase">
              03 — CLASSIFICAÇÃO DE DIVERGÊNCIAS & PROTEÇÃO ANTIFALSA POSITIVA
            </span>
          </div>
          <span className="text-[8px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-neutral-400">
            REGRA DE OURO: BIOGRAPHICAL_MISMATCH ≠ FRAUD
          </span>
        </div>

        {/* Banner de Proteção Antifraude Precoce */}
        <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-neutral-300 font-bold text-[9px]">
              Divergências biográficas geram <span className="text-amber-400">PENDING_REVIEW</span> ou <span className="text-purple-400">SUPERVISOR_REVIEW</span> conforme a gravidade.
            </div>
            <p className="text-neutral-400 text-[8px] leading-relaxed">
              O sistema bloqueia qualquer conversão sumária de erro de digitação ou divergência de grafia em fraude. O cidadão mantém direito ao saneamento probatório com certidão atualizada.
            </p>
          </div>
        </div>

        {/* Lista das Divergências Ativas */}
        {activeDivergences.length === 0 ? (
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-center text-emerald-400 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Nenhuma divergência cadastral ativa. Todos os dados estão validados ou justificados.</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {activeDivergences.map((div, i) => (
              <div
                key={i}
                className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-400">{div.fieldName}</span>
                    <span className={`px-1.5 py-0.2 rounded font-black text-[7.5px] ${
                      div.severity === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      GRAVIDADE: {div.severity}
                    </span>
                  </div>
                  <div className="text-neutral-300 text-[8.5px]">
                    Declarado: <strong className="text-white font-mono">{div.sourceValue}</strong> ──► Oficial: <strong className="text-cyan-300 font-mono">{div.officialValue}</strong>
                  </div>
                  {div.notes && <div className="text-neutral-500 text-[8px]">{div.notes}</div>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSanitationField(div.fieldCode);
                      setSanitationReason(`Divergência confirmada entre ${div.sourceValue} e ${div.officialValue}`);
                      setShowSanitationModal(true);
                    }}
                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black uppercase text-[8px]"
                  >
                    EXIGIR SANEAMENTO
                  </button>
                  <button
                    onClick={() => {
                      setShowResolveFieldModal(div);
                      setResolveJustification('');
                      setResolveEvidenceDoc('');
                    }}
                    className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-black uppercase text-[8px]"
                  >
                    JUSTIFICAR / RESOLVER
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          ZONA 05: BARRA DE COMANDOS OPERACIONAIS DA INTERFACE (02 — VAL_BIOGRÁFICA)
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. EXECUTAR CONFRONTO */}
          <button
            onClick={() => setShowRunComparisonModal(true)}
            disabled={!canExecuteAnalysis}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-neutral-950 font-black uppercase flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>[ EXECUTAR CONFRONTO ]</span>
          </button>

          {/* 2. VER REGISTO OFICIAL */}
          <button
            onClick={() => setShowOfficialRecordModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-cyan-400 border border-neutral-800 font-bold uppercase flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>[ VER REGISTO OFICIAL ]</span>
          </button>

          {/* 3. VER SESSÃO DE ATENDIMENTO */}
          <button
            onClick={() => setShowProcessDataModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 font-bold uppercase flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>[ VER SESSÃO DE ATENDIMENTO ]</span>
          </button>

          {/* 4. VER DIVERGÊNCIAS */}
          <button
            onClick={() => setMatrixFilter('MISMATCH_ONLY')}
            className={`px-2.5 py-1.5 rounded-lg border font-bold uppercase flex items-center gap-1.5 ${
              matrixFilter === 'MISMATCH_ONLY'
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-neutral-900 hover:bg-neutral-800 text-rose-300 border-neutral-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>[ VER DIVERGÊNCIAS ({bio.mismatchedFields}) ]</span>
          </button>

          {/* 5. SOLICITAR SANEAMENTO */}
          <button
            onClick={() => {
              setSanitationField('MOTHER_NAME');
              setSanitationReason('');
              setShowSanitationModal(true);
            }}
            disabled={!canExecuteAnalysis}
            className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold uppercase flex items-center gap-1.5 disabled:opacity-40"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>[ SOLICITAR SANEAMENTO ]</span>
          </button>

          {/* 6. ESCALAR SUPERVISÃO */}
          <button
            onClick={() => setShowEscalationModal(true)}
            disabled={!canExecuteAnalysis}
            className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold uppercase flex items-center gap-1.5 disabled:opacity-40"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>[ ESCALAR SUPERVISÃO ]</span>
          </button>

          {/* 7. RESOLVER */}
          {activeDivergences.length > 0 && (
            <button
              onClick={() => {
                setShowResolveFieldModal(activeDivergences[0]);
                setResolveJustification('');
                setResolveEvidenceDoc('');
              }}
              disabled={!canExecuteAnalysis}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold uppercase flex items-center gap-1.5 disabled:opacity-40"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>[ RESOLVER ]</span>
            </button>
          )}

          {/* 8. AUDITORIA */}
          <button
            onClick={() => setShowAuditModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-800 font-bold uppercase flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>[ AUDITORIA ]</span>
          </button>
        </div>

        {/* 9. CONFIRMAR RESULTADO BIOGRÁFICO */}
        <div className="flex items-center gap-2">
          {bio.mismatchedFields === 0 && bio.status !== 'RESOLVED' && (
            <button
              onClick={() => setShowResolveDossierModal(true)}
              disabled={!canExecuteAnalysis}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-neutral-950 font-black uppercase flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>[ CONFIRMAR RESULTADO BIOGRÁFICO ]</span>
            </button>
          )}

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('03_VAL_BIOMETRICA')}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-cyan-400 border border-cyan-500/40 font-black uppercase flex items-center gap-1"
            >
              <span>AVANÇAR P/ 03_BIOMETRIA</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAIS OPERACIONAIS DO SUB-MÓDULO 02
         ========================================================================= */}

      {/* MODAL 1: EXECUTAR CONFRONTO */}
      {showRunComparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono text-[9px]">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f1115] border border-cyan-500/40 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-[10px]">
                <RefreshCw className="w-4 h-4" />
                <span>EXECUTAR CONFRONTO AUTOMATIZADO COM O REGISTO CIVIL</span>
              </div>
              <button onClick={() => setShowRunComparisonModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-neutral-300">
              <p>
                O sistema irá disparar uma consulta criptografada ao barramento central <strong>MINJUSDH_RC_CORE_v2.4</strong> para validar a integridade dos 12 campos biográficos do dossiê:
              </p>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800 space-y-1">
                <div><span className="text-neutral-500">DOSSIÊ:</span> <span className="font-bold text-white">{dossier.dossierId}</span></div>
                <div><span className="text-neutral-500">CIDADÃO:</span> {dossier.citizenName}</div>
                <div><span className="text-neutral-500">FONTE ALVO:</span> {bio.sourceRecordRef}</div>
                <div><span className="text-neutral-500">OPERADOR:</span> {currentOperator.operatorName} ({currentOperator.role})</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowRunComparisonModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-900 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleExecuteComparison}
                className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-black uppercase flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>DISPARAR CONFRONTO MULTI-CAMPO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VER REGISTO OFICIAL CIVIL (SOMENTE LEITURA - FONTE DE CONFRONTO) */}
      {showOfficialRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono text-[9px]">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0f1115] border border-cyan-500/40 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-[10px]">
                <Building2 className="w-4 h-4" />
                <span>REGISTO CIVIL OFICIAL (MINJUSDH) ── [SOMENTE LEITURA]</span>
              </div>
              <button onClick={() => setShowOfficialRecordModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {/* Alerta Institucional de Imutabilidade */}
              <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 flex items-center justify-between text-[8px]">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>FONTE OFICIAL DE CONFRONTO — NÃO EDITÁVEL PELO MÓDULO VAL_BIOGRÁFICA</span>
                </div>
                <span className="text-neutral-400">STATUS: BASE IMUTÁVEL</span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 grid grid-cols-2 gap-2 text-neutral-300">
                <div><span className="text-neutral-500">NÚMERO DO ASSENTO:</span> <span className="text-white font-bold">{bio.civilRecordNumber || 'ASSENTO-1994-08192-LUA'}</span></div>
                <div><span className="text-neutral-500">CONSERVATÓRIA EMISSORA:</span> <span className="text-white">1ª Conservatória de Luanda</span></div>
                <div><span className="text-neutral-500">LIVRO / FOLHA:</span> <span className="text-white">Livro B-42, Fls 18v</span></div>
                <div><span className="text-neutral-500">DATA DE REGISTO:</span> <span className="text-white">1994-03-20</span></div>
                <div><span className="text-neutral-500">ESTADO DO REGISTO:</span> <span className="text-emerald-400 font-bold">VIVO / ATIVO (SEM ÓBITO)</span></div>
                <div><span className="text-neutral-500">ASSINATURA DO CONSERVADOR:</span> <span className="text-neutral-400">Dr. Mateus Cristóvão (ICP-AO)</span></div>
              </div>

              <div className="border border-neutral-800 rounded-lg p-2.5 bg-neutral-950 space-y-1">
                <div className="text-neutral-400 font-bold uppercase text-[8px]">CONTEÚDO INTEGRAL DO ASSENTO:</div>
                <p className="text-neutral-300 text-[8.5px] leading-relaxed">
                  Aos doze dias do mês de Março do ano de mil novecentos e noventa e quatro, nasceu no Hospital Materno de Luanda, um indivíduo do sexo masculino a quem foi dado o nome de <strong>{dossier.citizenName}</strong>, filho de Manuel Afonso da Silva e de Ana Joaquina da Costa Silva, naturais de Luanda, República de Angola.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowOfficialRecordModal(false)}
                className="px-4 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase"
              >
                FECHAR VISUALIZAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VER DADOS DO PROCESSO */}
      {showProcessDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono text-[9px]">
          <div className="w-full max-w-xl rounded-2xl bg-[#0f1115] border border-neutral-700 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-white font-bold text-[10px]">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>DADOS DECLARADOS NO ATENDIMENTO (MÓDULO 09)</span>
              </div>
              <button onClick={() => setShowProcessDataModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded bg-neutral-950 border border-neutral-800 space-y-1.5 text-neutral-300">
              <div><span className="text-neutral-500">ID DO PROCESSO:</span> <strong className="text-white">{dossier.processId}</strong></div>
              <div><span className="text-neutral-500">SESSÃO DE ATENDIMENTO:</span> {dossier.attendanceSessionId}</div>
              <div><span className="text-neutral-500">POSTO DE RECOLHA:</span> {dossier.servicePointName} ({dossier.servicePointId})</div>
              <div><span className="text-neutral-500">OPERADOR DE RECOLHA:</span> {dossier.collectionOperatorName || dossier.collectionOperatorId}</div>
              <div><span className="text-neutral-500">DATA DA RECOLHA:</span> {dossier.createdAt}</div>
              <div><span className="text-neutral-500">VERSÃO TERRITORIAL:</span> {dossier.territoryVersion}</div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowProcessDataModal(false)}
                className="px-4 py-1.5 rounded bg-neutral-900 text-white font-bold uppercase"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SOLICITAR SANEAMENTO DOCUMENTAL */}
      {showSanitationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono text-[9px]">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f1115] border border-amber-500/40 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-[10px]">
                <FileSearch className="w-4 h-4" />
                <span>EXIGIR SANEAMENTO DOCUMENTAL AO CIDADÃO</span>
              </div>
              <button onClick={() => setShowSanitationModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">CAMPO COM DIVERGÊNCIA:</label>
                <select
                  value={sanitationField}
                  onChange={e => setSanitationField(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white font-mono"
                >
                  {(bio.fieldComparisons || []).map(c => (
                    <option key={c.fieldCode} value={c.fieldCode}>
                      {c.fieldName} ({c.matchStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">MOTIVO DA EXIGÊNCIA DE SANEAMENTO:</label>
                <textarea
                  value={sanitationReason}
                  onChange={e => setSanitationReason(e.target.value)}
                  placeholder="Descreva a divergência encontrada e o fundamento legal para saneamento..."
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">DOCUMENTO / EVIDÊNCIA REQUERIDA:</label>
                <input
                  type="text"
                  value={sanitationEvidenceReq}
                  onChange={e => setSanitationEvidenceReq(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowSanitationModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-900 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleCreateSanitation}
                disabled={!sanitationReason}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-black uppercase flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>GERAR EXCEÇÃO & MOVER P/ PENDING_DOCS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ESCALAR PARA SUPERVISÃO N3 */}
      {showEscalationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono text-[9px]">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f1115] border border-purple-500/40 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-[10px]">
                <Lock className="w-4 h-4" />
                <span>ESCALAÇÃO PARA MESA SUPERVISORA (NÍVEL N3)</span>
              </div>
              <button onClick={() => setShowEscalationModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-neutral-400 text-[8.5px]">
                A escalação é obrigatória em caso de divergência crítica, duplicidade suspeita ou incompetência funcional de N1.
              </p>

              <div>
                <label className="text-neutral-400 block mb-1">FUNDAMENTO DA ESCALAÇÃO:</label>
                <textarea
                  value={escalationReason}
                  onChange={e => setEscalationReason(e.target.value)}
                  placeholder="Fundamente o motivo pelo qual este processo requer parecer soberano N3..."
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">EVIDÊNCIA / REFERÊNCIA TÉCNICA:</label>
                <input
                  type="text"
                  value={escalationEvidence}
                  onChange={e => setEscalationEvidence(e.target.value)}
                  placeholder="Ex: Conflito de homonímia no assento oficial com livro desatualizado."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowEscalationModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-900 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleEscalateToSupervisor}
                disabled={!escalationReason}
                className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black uppercase flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>ESCALAR PARA SUPERVISÃO N3</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: RESOLVER DIVERGÊNCIA ESPECÍFICA */}
      {showResolveFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono text-[9px]">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f1115] border border-cyan-500/40 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-[10px]">
                <Scale className="w-4 h-4" />
                <span>RESOLUÇÃO PROBATÓRIA DE CAMPO BIOGRÁFICO</span>
              </div>
              <button onClick={() => setShowResolveFieldModal(null)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <div><span className="text-neutral-500">CAMPO:</span> <strong className="text-white">{showResolveFieldModal.fieldName}</strong></div>
                <div><span className="text-neutral-500">VALOR DECLARADO:</span> <span className="text-amber-400 font-mono">{showResolveFieldModal.sourceValue}</span></div>
                <div><span className="text-neutral-500">VALOR OFICIAL NO REGISTO:</span> <span className="text-cyan-400 font-mono">{showResolveFieldModal.officialValue}</span></div>
                <div><span className="text-neutral-500">GRAVIDADE:</span> <span className="text-rose-400 font-bold">{showResolveFieldModal.severity}</span></div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">JUSTIFICATIVA TÉCNICO-PROBATÓRIA:</label>
                <textarea
                  value={resolveJustification}
                  onChange={e => setResolveJustification(e.target.value)}
                  placeholder="Ex: Diferença decorrente de erro tipográfico na transcrição do livro; certidão de narrativa confirma filiação..."
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">DOCUMENTO / EVIDÊNCIA EXAMINADA:</label>
                <input
                  type="text"
                  value={resolveEvidenceDoc}
                  onChange={e => setResolveEvidenceDoc(e.target.value)}
                  placeholder="Ex: Certidão de Nascimento nº 08192 autenticada com carimbo branco."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowResolveFieldModal(null)}
                className="px-3 py-1.5 rounded bg-neutral-900 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleResolveField}
                disabled={!resolveJustification || !resolveEvidenceDoc}
                className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-neutral-950 font-black uppercase flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>VALIDAR & RECLASSIFICAR COMO MATCH</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: CONFIRMAR RESULTADO BIOGRÁFICO DO MOTOR */}
      {showResolveDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono text-[9px]">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1115] border border-emerald-500/40 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px]">
                <ShieldCheck className="w-4 h-4" />
                <span>CONFIRMAR RESULTADO DO MOTOR BIOGRÁFICO (02)</span>
              </div>
              <button onClick={() => setShowResolveDossierModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-neutral-300">
              <p>
                Confirma o resultado do confronto dos 12 campos biográficos do cidadão <strong>{dossier.citizenName}</strong> com a base oficial do Registo Civil?
              </p>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-[8.5px] space-y-0.5">
                <div><span className="text-neutral-500">ESTADO FINAL DO MOTOR:</span> <span className="text-emerald-400 font-bold">RESOLVED (100% MATCH)</span></div>
                <div><span className="text-neutral-500">ESCOPO:</span> <span className="text-neutral-300">Validação Biográfica (Módulo 02)</span></div>
                <div className="text-[7.5px] text-neutral-500 italic mt-1">
                  * A decisão final do processo permanece sob alçada do terminal de Decisão Institucional (Módulo 10).
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowResolveDossierModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-900 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleCompleteBioValidation}
                className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black uppercase flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>[ CONFIRMAR RESULTADO BIOGRÁFICO ]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: AUDITORIA DO SUB-MÓDULO */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono text-[9px]">
          <div className="w-full max-w-xl rounded-2xl bg-[#0f1115] border border-cyan-500/40 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-[10px]">
                <History className="w-4 h-4" />
                <span>TRILHA CRIPTOGRÁFICA DO MOTOR 02 (BIOGRÁFICO)</span>
              </div>
              <button onClick={() => setShowAuditModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded bg-neutral-950 border border-neutral-800 space-y-2 text-neutral-300">
              <div><span className="text-neutral-500">HASH ANTERIOR:</span> <span className="font-mono text-neutral-400 break-all">{bio.previousHash}</span></div>
              <div><span className="text-neutral-500">HASH ATUAL:</span> <span className="font-mono text-cyan-300 break-all">{bio.currentHash}</span></div>
              <div><span className="text-neutral-500">ASSINATURA DIGITAL:</span> <span className="font-mono text-white break-all">{bio.digitalSignature}</span></div>
              <div><span className="text-neutral-500">AUDIT CHAIN REF:</span> <span className="font-mono text-neutral-400">{bio.auditChainRef}</span></div>
              <div><span className="text-neutral-500">ÚLTIMA AVALIAÇÃO:</span> {bio.validatedAt} por {bio.validatedBy}</div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-1.5 rounded bg-neutral-900 text-white font-bold uppercase"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: REAUTENTICAÇÃO FORTE IAM / MFA */}
      {showReauthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono text-[9px]">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1115] border border-cyan-500/50 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-[10px]">
                <Lock className="w-4 h-4" />
                <span>CONFIRMAÇÃO FORTE INSTITUCIONAL (IAM)</span>
              </div>
              <button onClick={() => setShowReauthModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-[8.5px]">
                <div className="text-neutral-500">AÇÃO SOLICITADA:</div>
                <div className="font-bold text-white uppercase mt-0.5">{reauthTitle}</div>
                <div className="text-neutral-500 mt-1">OPERADOR: {currentOperator.operatorName} ({currentOperator.operatorId})</div>
              </div>

              <div>
                <label className="text-cyan-400 font-bold block mb-1">PALAVRA-PASSE / CREDENCIAL FORTE IAM:</label>
                <input
                  type="password"
                  value={reauthPassword}
                  onChange={e => setReauthPassword(e.target.value)}
                  placeholder="Introduza a sua palavra-passe de validador..."
                  className="w-full bg-neutral-950 border border-cyan-500/40 rounded p-2 text-white font-mono text-center tracking-widest text-xs"
                />
                {reauthError && <div className="text-rose-400 mt-1 font-bold">{reauthError}</div>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowReauthModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-900 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleConfirmReauth}
                className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-black uppercase flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>AUTORIZAR OPERAÇÃO</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
