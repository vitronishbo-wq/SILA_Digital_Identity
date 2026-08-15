import React, { useState, useMemo } from 'react';
import {
  ValidationDossier,
  BiometricValidation,
  BiometricEngineStatus,
  QualityResult,
  BiometricMatchResult,
  DuplicateSearchResult,
  ConsolidatedBiometricResult,
  BiometricCaptureProfile,
  QualityCheckItem,
  FacialComparisonResult,
  FingerprintComparisonResult,
  DuplicateSearchExecution,
  BiometricDuplicateCandidate,
  BiometricExceptionRecord,
  ValidationAuditEvent,
  OperatorContext,
} from '../../../../types/validations';
import {
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Lock,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  FileText,
  KeyRound,
  Check,
  X,
  Scale,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  Search,
  User,
  Shield,
  Activity,
  History,
  FileSearch,
  ExternalLink,
  ChevronRight,
  Play,
} from 'lucide-react';

interface ValidationsBiometricTabProps {
  dossiers: ValidationDossier[];
  activeDossierId: string;
  onSelectDossier: (dossierId: string) => void;
  onUpdateDossier: (updatedDossier: ValidationDossier) => void;
  onAddAuditEvent: (event: ValidationAuditEvent) => void;
  onNavigateToTab?: (tabId: any) => void;
}

export const ValidationsBiometricTab: React.FC<ValidationsBiometricTabProps> = ({
  dossiers,
  activeDossierId,
  onSelectDossier,
  onUpdateDossier,
  onAddAuditEvent,
  onNavigateToTab,
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
    return dossiers.find((d) => d.dossierId === activeDossierId) || dossiers[0];
  }, [dossiers, activeDossierId]);

  const bio: BiometricValidation = dossier.biometricValidation;

  // Sub-painel interno do Módulo 03
  const [activePanel, setActivePanel] = useState<
    'QUALITY_MATRIX' | 'FACIAL_COMPARISON' | 'FINGERPRINT_AFIS' | 'DUPLICATE_ABIS' | 'EXCEPTIONS' | 'PROFILE_SPEC'
  >('QUALITY_MATRIX');

  // Modais de Ação Operacional
  const [showRunPipelineModal, setShowRunPipelineModal] = useState<boolean>(false);
  const [showConfirmResultModal, setShowConfirmResultModal] = useState<boolean>(false);
  const [showAddExceptionModal, setShowAddExceptionModal] = useState<boolean>(false);
  const [showSupervisorEscalateModal, setShowSupervisorEscalateModal] = useState<boolean>(false);
  const [showAuditChainModal, setShowAuditChainModal] = useState<boolean>(false);
  const [selectedCandidateForDetails, setSelectedCandidateForDetails] = useState<BiometricDuplicateCandidate | null>(null);

  // Estados de formulários nos modais
  const [exceptionCode, setExceptionCode] = useState<string>('AMPUTATION_MEDICAL');
  const [exceptionFinger, setExceptionFinger] = useState<string>('DEDO_INDICADOR_DIR');
  const [exceptionJustification, setExceptionJustification] = useState<string>('');
  const [exceptionEvidenceDoc, setExceptionEvidenceDoc] = useState<string>('Laudo Médico Pericial nº 2026/8841 emitido por Hospital Central.');

  const [escalationReason, setEscalationReason] = useState<string>('');
  const [escalationPriority, setEscalationPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('HIGH');

  const [confirmationNotes, setConfirmationNotes] = useState<string>('Homologação técnica de biometria efetuada em conformidade com o Perfil DNI 2026.');

  // Reautenticação Forte IAM
  const [reauthPassword, setReauthPassword] = useState<string>('');
  const [reauthError, setReauthError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Utilitário de cálculo de hash criptográfico encadeado
  const generateAuditHash = (prevHash: string, payload: string) => {
    const raw = `${prevHash}_${payload}_${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  };

  // ---------------------------------------------------------------------------
  // COMANDO: EXECUTAR MOTOR ABIS / PIPELINE DE VALIDAÇÃO BIOMÉTRICA
  // ---------------------------------------------------------------------------
  const handleExecutePipeline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Regras estritas: Se houver colisão de duplicidade ou score baixo, vai para SUPERVISOR_REVIEW
      const hasDuplicateCandidate = bio.duplicateSearchResult === 'CANDIDATE_FOUND' || (bio.duplicateSearch?.candidates?.length ?? 0) > 0;
      const isFacialInconclusive = bio.facialComparison?.result === 'INCONCLUSIVE' || bio.facialMatchResult === 'INCONCLUSIVE';
      
      let nextStatus: BiometricEngineStatus = 'RESULT_READY';
      let nextConsolidated: ConsolidatedBiometricResult = 'BIOMETRICALLY_CONFORMANT';
      let nextReviewStatus: 'IN_REVIEW' | 'CONFIRMED' | 'SUPERVISOR_REQUIRED' = 'IN_REVIEW';

      if (hasDuplicateCandidate || isFacialInconclusive || bio.exceptions.length > 0) {
        nextStatus = 'SUPERVISOR_REVIEW';
        nextConsolidated = 'REQUIRES_SUPERVISOR';
        nextReviewStatus = 'SUPERVISOR_REQUIRED';
      }

      const updatedBio: BiometricValidation = {
        ...bio,
        status: nextStatus,
        consolidatedResult: nextConsolidated,
        reviewStatus: nextReviewStatus,
        validatedAt: new Date().toISOString(),
        validatorId: currentOperator.operatorId,
        validatorName: currentOperator.operatorName,
      };

      const updatedDossier: ValidationDossier = {
        ...dossier,
        biometricValidation: updatedBio,
        updatedAt: new Date().toISOString(),
      };

      onUpdateDossier(updatedDossier);

      // Registo de auditoria
      const auditEvt: ValidationAuditEvent = {
        eventId: `EVT-BIO-PIPE-${Date.now()}`,
        dossierId: dossier.dossierId,
        operatorId: currentOperator.operatorId,
        operatorRole: currentOperator.role,
        command: 'RUN_COMPARISON',
        previousState: dossier.status,
        newState: dossier.status,
        reason: `Pipeline de validação biométrica ABIS/AFIS re-executado pelo operador ${currentOperator.operatorName}. Resultado: ${nextConsolidated}.`,
        timestamp: new Date().toISOString(),
        previousHash: bio.currentHash || dossier.currentHash,
        currentHash: generateAuditHash(bio.currentHash || dossier.currentHash, 'RUN_BIOMETRIC_PIPELINE'),
        digitalSignature: `SIG_ABIS_EXEC_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        auditChainRef: bio.auditChainRef || dossier.auditChainRef,
        terminalId: currentOperator.terminalId,
        payloadSummary: `Estado Motor: ${nextStatus}. Face: ${bio.faceMatchScore}%, AFIS: ${bio.fingerprintsMatchScore}%, Duplicidade: ${bio.duplicateSearchResult}`,
        silaGlobalAuditRef: `SILA_BIO_PIPE_${Date.now()}`,
      };
      onAddAuditEvent(auditEvt);

      setIsProcessing(false);
      setShowRunPipelineModal(false);
    }, 600);
  };

  // ---------------------------------------------------------------------------
  // COMANDO: HOMOLOGAÇÃO / CONFIRMAÇÃO DO RESULTADO BIOMÉTRICO (REAUTENTICAÇÃO FORTE)
  // ---------------------------------------------------------------------------
  const handleConfirmBiometricResult = () => {
    if (!reauthPassword || reauthPassword.length < 4) {
      setReauthError('Senha de reautenticação forte IAM obrigatória.');
      return;
    }

    const updatedBio: BiometricValidation = {
      ...bio,
      status: 'CONFIRMED_RESULT',
      reviewStatus: 'CONFIRMED',
      notes: confirmationNotes,
      validatedAt: new Date().toISOString(),
      validatorId: currentOperator.operatorId,
      validatorName: currentOperator.operatorName,
      digitalSignature: `SIG_CONFIRM_ECDSA_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
    };

    // IMPORTANTE: NÃO altera dossier.status (a decisão final pertence ao Módulo 07)
    const updatedDossier: ValidationDossier = {
      ...dossier,
      biometricValidation: updatedBio,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDossier(updatedDossier);

    const auditEvt: ValidationAuditEvent = {
      eventId: `EVT-BIO-CONF-${Date.now()}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'CONFIRM_RESULT',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Resultado biométrico homologado com autenticação forte. Parecer: ${confirmationNotes}`,
      timestamp: new Date().toISOString(),
      previousHash: bio.currentHash || dossier.currentHash,
      currentHash: generateAuditHash(bio.currentHash || dossier.currentHash, 'CONFIRM_BIO_RESULT'),
      digitalSignature: updatedBio.digitalSignature,
      auditChainRef: bio.auditChainRef || dossier.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Homologação biométrica confirmada pelo operador ${currentOperator.operatorName}.`,
      silaGlobalAuditRef: `SILA_BIO_CONFIRM_${Date.now()}`,
    };
    onAddAuditEvent(auditEvt);

    setShowConfirmResultModal(false);
    setReauthPassword('');
    setReauthError(null);
  };

  // ---------------------------------------------------------------------------
  // COMANDO: REGISTAR EXCEÇÃO BIOMÉTRICA (AMPUTAÇÃO, DEFORMIDADE, ETC.)
  // ---------------------------------------------------------------------------
  const handleAddBiometricException = () => {
    if (!exceptionJustification || exceptionJustification.length < 5) {
      alert('É obrigatório descrever a justificativa técnica e probatória da exceção.');
      return;
    }

    const newException: BiometricExceptionRecord = {
      exceptionId: `EXC-BIO-${Date.now().toString().slice(-6)}`,
      code: exceptionCode as any,
      affectedFinger: exceptionFinger as any,
      description: `Exceção para ${exceptionFinger}: ${exceptionCode}`,
      evidence: exceptionEvidenceDoc,
      operatorId: currentOperator.operatorId,
      operatorName: currentOperator.operatorName,
      timestamp: new Date().toISOString(),
      justification: exceptionJustification,
      status: 'PENDING',
      requiresSupervisor: true,
    };

    const updatedExceptions = [...bio.exceptions, newException];

    const updatedBio: BiometricValidation = {
      ...bio,
      exceptions: updatedExceptions,
      status: 'SUPERVISOR_REVIEW',
      consolidatedResult: 'REQUIRES_SUPERVISOR',
      reviewStatus: 'SUPERVISOR_REQUIRED',
    };

    const updatedDossier: ValidationDossier = {
      ...dossier,
      biometricValidation: updatedBio,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDossier(updatedDossier);

    const auditEvt: ValidationAuditEvent = {
      eventId: `EVT-BIO-EXC-${Date.now()}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'RECORD_EXCEPTION',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Exceção biométrica registada: ${exceptionCode} (${exceptionFinger}). Justificativa: ${exceptionJustification}`,
      timestamp: new Date().toISOString(),
      previousHash: bio.currentHash || dossier.currentHash,
      currentHash: generateAuditHash(bio.currentHash || dossier.currentHash, 'ADD_BIO_EXCEPTION'),
      digitalSignature: `SIG_EXC_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      auditChainRef: bio.auditChainRef || dossier.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Registo de exceção biométrica ${newException.exceptionId}`,
      silaGlobalAuditRef: `SILA_BIO_EXC_${Date.now()}`,
    };
    onAddAuditEvent(auditEvt);

    setShowAddExceptionModal(false);
    setExceptionJustification('');
  };

  // ---------------------------------------------------------------------------
  // COMANDO: ENCAMINHAR PARA MESA DE SUPERVISÃO TÉCNICA (N3 / ABIS SUPERVISOR)
  // ---------------------------------------------------------------------------
  const handleEscalateToSupervisor = () => {
    if (!escalationReason || escalationReason.length < 5) {
      alert('Justificativa de escalonamento obrigatória.');
      return;
    }

    const updatedBio: BiometricValidation = {
      ...bio,
      status: 'SUPERVISOR_REVIEW',
      reviewStatus: 'SUPERVISOR_REQUIRED',
      consolidatedResult: 'REQUIRES_SUPERVISOR',
      notes: `Escalonado para Mesa Supervisora. Motivo: ${escalationReason}`,
      validatedAt: new Date().toISOString(),
      validatorId: currentOperator.operatorId,
      validatorName: currentOperator.operatorName,
    };

    const updatedDossier: ValidationDossier = {
      ...dossier,
      biometricValidation: updatedBio,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDossier(updatedDossier);

    const auditEvt: ValidationAuditEvent = {
      eventId: `EVT-BIO-ESC-${Date.now()}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'ESCALATE_TO_SUPERVISOR',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Dossiê encaminhado para Mesa Supervisora Biometrica (Prioridade: ${escalationPriority}). Motivo: ${escalationReason}`,
      timestamp: new Date().toISOString(),
      previousHash: bio.currentHash || dossier.currentHash,
      currentHash: generateAuditHash(bio.currentHash || dossier.currentHash, 'ESCALATE_BIO_SUPERVISOR'),
      digitalSignature: `SIG_ESC_BIO_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      auditChainRef: bio.auditChainRef || dossier.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Escalonamento supervisor com prioridade ${escalationPriority}.`,
      silaGlobalAuditRef: `SILA_BIO_ESC_${Date.now()}`,
    };
    onAddAuditEvent(auditEvt);

    setShowSupervisorEscalateModal(false);
    setEscalationReason('');
  };

  return (
    <div id="validations-biometric-tab-root" className="space-y-3 font-mono text-[9px] text-neutral-200">
      {/* =========================================================================
          CABEÇALHO OPERACIONAL DO SUB-MÓDULO 03: VALIDAÇÃO BIOMÉTRICA (ABIS / AFIS)
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-widest text-cyan-400 uppercase">
                03 — VAL_BIOMÉTRICA
              </span>
              <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono text-[9px] border border-neutral-700">
                GATEWAY ABIS / AFIS
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono text-[9px] border border-cyan-800">
                PERFIL: {bio.captureProfileVersion || 'v2026.1'}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
              Conformidade Técnica de Captura • Minúcias NFIQ2 • Confronto Facial ICAO • Galeria 1:N ABIS
            </p>
          </div>
        </div>

        {/* Seletor de Dossiê Rápido */}
        <div className="flex items-center gap-2">
          <label className="text-neutral-400 text-[9px]">DOSSIÊ ATIVO:</label>
          <select
            value={dossier.dossierId}
            onChange={(e) => onSelectDossier(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-white font-mono text-[10px] focus:outline-none focus:border-cyan-500"
          >
            {dossiers.map((d) => (
              <option key={d.dossierId} value={d.dossierId}>
                {d.dossierId} — {d.citizenName} ({d.nationalIdNumber || '1ª EMISSÃO'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =========================================================================
          PAINEL DE IDENTIFICAÇÃO DO PROCESSO & TELEMETRIA DO MOTOR BIOMÉTRICO
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {/* Identificação do Processo */}
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-2.5 space-y-1">
          <div className="text-neutral-400 font-bold flex items-center justify-between border-b border-neutral-800 pb-1">
            <span>DADOS DO PROCESSO</span>
            <span className="text-cyan-400">{dossier.processType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">CIDADÃO:</span>
            <span className="text-white font-bold truncate max-w-[140px]">{dossier.citizenName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">ID CIDADÃO:</span>
            <span className="text-neutral-300">{dossier.citizenId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">SESSÃO CAPTURA:</span>
            <span className="text-neutral-300">{bio.attendanceSessionId || dossier.attendanceSessionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">POSTO ORIGEM:</span>
            <span className="text-neutral-300 truncate max-w-[140px]">{dossier.servicePointName}</span>
          </div>
        </div>

        {/* Estado da Máquina de Estados Biométricos */}
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-2.5 space-y-1">
          <div className="text-neutral-400 font-bold flex items-center justify-between border-b border-neutral-800 pb-1">
            <span>ESTADO DO MOTOR</span>
            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${
              bio.status === 'CONFIRMED_RESULT'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : bio.status === 'SUPERVISOR_REVIEW'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
            }`}>
              {bio.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">QUALIDADE TÉCNICA:</span>
            <span className={`font-bold ${bio.qualityResult === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {bio.qualityResult}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">CONFRONTO FACIAL:</span>
            <span className={`font-bold ${bio.facialMatchResult === 'MATCH' ? 'text-emerald-400' : bio.facialMatchResult === 'INCONCLUSIVE' ? 'text-amber-400' : 'text-rose-400'}`}>
              {bio.facialMatchResult} ({bio.faceMatchScore}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">CONFRONTO DACTILAR:</span>
            <span className={`font-bold ${bio.fingerprintMatchResult === 'MATCH' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {bio.fingerprintMatchResult} ({bio.fingerprintsMatchScore}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">PESQUISA 1:N ABIS:</span>
            <span className={`font-bold ${bio.duplicateSearchResult === 'NO_CANDIDATE' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {bio.duplicateSearchResult}
            </span>
          </div>
        </div>

        {/* Indicador de Confiança Técnica & Regra Probatória */}
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-2.5 space-y-1">
          <div className="text-neutral-400 font-bold flex items-center justify-between border-b border-neutral-800 pb-1">
            <span>INDICADOR TÉCNICO</span>
            <span className="text-cyan-400 font-bold text-xs">{bio.confidenceIndicator || 90}%</span>
          </div>
          <div className="text-[8px] text-neutral-400 leading-relaxed">
            <span className="text-amber-300 font-bold">REGRA PROBATÓRIA INSTITUCIONAL:</span>
            <br />
            Score alto ≠ Aprovação do Cidadão
            <br />
            Score baixo ≠ Fraude Automática
            <br />
            Colisão ABIS ≠ Rejeição Imediata
          </div>
          <div className="pt-1 border-t border-neutral-800/60 flex justify-between">
            <span className="text-neutral-500">EXCEÇÕES REGISTADAS:</span>
            <span className={`font-bold ${bio.exceptions.length > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
              {bio.exceptions.length} caso(s)
            </span>
          </div>
        </div>

        {/* Painel de Ações e Homologação */}
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-2.5 flex flex-col justify-between">
          <div>
            <div className="text-neutral-400 font-bold border-b border-neutral-800 pb-1 flex items-center justify-between">
              <span>RESULTADO CONSOLIDADO</span>
              <span className={`px-1.5 py-0.2 rounded text-[8px] font-black ${
                bio.consolidatedResult === 'BIOMETRICALLY_CONFORMANT'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {bio.consolidatedResult}
              </span>
            </div>
            <div className="text-[8px] text-neutral-400 mt-1">
              Validador: <span className="text-white">{bio.validatorName || 'Carlos Van-Dúnem'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button
              onClick={() => setShowRunPipelineModal(true)}
              className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center justify-center gap-1 border border-neutral-700"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>RE-EXECUTAR</span>
            </button>

            <button
              onClick={() => setShowConfirmResultModal(true)}
              disabled={bio.status === 'CONFIRMED_RESULT'}
              className={`px-2 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 border ${
                bio.status === 'CONFIRMED_RESULT'
                  ? 'bg-neutral-900 text-neutral-500 border-neutral-800 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-neutral-950 border-cyan-500 font-black'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>HOMOLOGAR</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SUB-BARRA DE NAVEGAÇÃO INTERNA DO MÓDULO 03
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-1.5 flex items-center justify-between overflow-x-auto gap-1 scrollbar-thin">
        <div className="flex items-center gap-1">
          {[
            { id: 'QUALITY_MATRIX', label: '1. MATRIZ DE QUALIDADE TÉCNICA', icon: Activity },
            { id: 'FACIAL_COMPARISON', label: '2. CONFRONTO FACIAL (1:1 / 1:N)', icon: Eye },
            { id: 'FINGERPRINT_AFIS', label: '3. CONFRONTO DACTILAR (AFIS)', icon: Fingerprint },
            { id: 'DUPLICATE_ABIS', label: '4. PESQUISA 1:N / DUPLICIDADE', icon: Search },
            { id: 'EXCEPTIONS', label: `5. EXCEÇÕES BIOMÉTRICAS (${bio.exceptions.length})`, icon: AlertTriangle },
            { id: 'PROFILE_SPEC', label: '6. PERFIL VERSIONADO (DNI-2026)', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePanel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddExceptionModal(true)}
            className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>REGISTAR EXCEÇÃO</span>
          </button>
          <button
            onClick={() => setShowSupervisorEscalateModal(true)}
            className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>ESCALAR SUPERVISÃO</span>
          </button>
          <button
            onClick={() => setShowAuditChainModal(true)}
            className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 flex items-center gap-1"
          >
            <History className="w-3 h-3 text-cyan-400" />
            <span>TRILHA SILA</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PAINEL 1: MATRIZ DE QUALIDADE TÉCNICA DA CAPTURA (ISO/IEC 19794 & NFIQ2)
         ========================================================================= */}
      {activePanel === 'QUALITY_MATRIX' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Activity className="w-4 h-4" />
              <span>MATRIZ DE CONFORMIDADE E QUALIDADE TÉCNICA DA CAPTURA</span>
            </div>
            <div className="flex items-center gap-3 text-[8px] text-neutral-400">
              <span>LIMIAR FOTO: &gt;= {bio.captureProfile?.minFacialQuality || 80}%</span>
              <span>LIMIAR DACTILAR: &gt;= {bio.captureProfile?.minFingerprintQuality || 70}% (NFIQ2)</span>
              <span>MÍNIMO DEDOS: {bio.captureProfile?.minFingersCount || 4}</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800 text-[8px]">
                  <th className="p-2">ELEMENTO BIOMÉTRICO</th>
                  <th className="p-2">DESCRITIVO NORMATIVO</th>
                  <th className="p-2 text-center">CAPTURADO</th>
                  <th className="p-2 text-center">SCORE OBTIDO</th>
                  <th className="p-2 text-center">LIMIAR PERFIL</th>
                  <th className="p-2 text-center">STATUS</th>
                  <th className="p-2">NOTAS / EVIDÊNCIAS DE CONFORMIDADE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-[9px]">
                {(bio.qualityMatrix || []).map((item, idx) => {
                  const isPass = item.status === 'PASS';
                  const isFail = item.status === 'FAIL';
                  const isExc = item.status === 'EXCEPTION';
                  return (
                    <tr key={idx} className="hover:bg-neutral-900/40">
                      <td className="p-2 font-bold text-white flex items-center gap-1.5">
                        {item.element === 'FOTO' ? (
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        ) : item.element === 'ASSINATURA' ? (
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span>{item.element}</span>
                      </td>
                      <td className="p-2 text-neutral-300">{item.label}</td>
                      <td className="p-2 text-center">
                        {item.captured ? (
                          <span className="text-emerald-400 font-bold">SIM</span>
                        ) : (
                          <span className="text-rose-400 font-bold">NÃO</span>
                        )}
                      </td>
                      <td className="p-2 text-center font-bold">
                        <span className={item.score >= item.threshold ? 'text-emerald-400' : 'text-amber-400'}>
                          {item.score}%
                        </span>
                      </td>
                      <td className="p-2 text-center text-neutral-400">{item.threshold}%</td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                            isPass
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isExc
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2 text-neutral-400 text-[8px] font-sans">{item.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-2 flex items-center justify-between text-[8px] text-neutral-400">
            <div>
              <span>PAD Anti-Spoofing: </span>
              <span className="text-emerald-400 font-bold">
                {bio.facialComparison?.livenessScore ? `${bio.facialComparison.livenessScore}% (APROVADO)` : 'APROVADO'}
              </span>
            </div>
            <div>
              <span>Autoridade Homologadora do Perfil: </span>
              <span className="text-white font-bold">{bio.captureProfile?.homologatingAuthority || 'DNIC'}</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAINEL 2: CONFRONTO FACIAL (1:1 / 1:N ICAO & PROVA DE VIDA)
         ========================================================================= */}
      {activePanel === 'FACIAL_COMPARISON' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Eye className="w-4 h-4" />
              <span>CONFRONTO FACIAL BIOMÉTRICO (1:1 / 1:N ICAO 19794-5)</span>
            </div>
            <span className={`px-2 py-0.5 rounded font-bold border ${
              bio.facialMatchResult === 'MATCH'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : bio.facialMatchResult === 'INCONCLUSIVE'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}>
              RESULTADO: {bio.facialMatchResult}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Foto Capturada Atual */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex flex-col items-center justify-center space-y-2">
              <div className="text-neutral-400 font-bold text-[9px] uppercase">Fotografia Capturada (Módulo 09)</div>
              <div className="w-32 h-40 bg-neutral-900 border-2 border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center text-neutral-500">
                <User className="w-12 h-12 text-neutral-600 mb-1" />
                <span className="text-[8px] text-center px-2">ICAO 19794-5 500 DPI Live Capture</span>
              </div>
              <div className="text-[8px] text-neutral-400 text-center">
                Sessão: {dossier.attendanceSessionId}
                <br />
                Liveness Score: <span className="text-emerald-400 font-bold">{bio.facialComparison?.livenessScore || 98}%</span>
              </div>
            </div>

            {/* Fotografia de Confronto Oficial / Histórico */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex flex-col items-center justify-center space-y-2">
              <div className="text-neutral-400 font-bold text-[9px] uppercase">Referência Oficial de Confronto</div>
              <div className="w-32 h-40 bg-neutral-900 border-2 border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center text-neutral-500">
                <Shield className="w-12 h-12 text-neutral-600 mb-1" />
                <span className="text-[8px] text-center px-2">Base DNI / Registo Civil Central</span>
              </div>
              <div className="text-[8px] text-neutral-400 text-center">
                Ref: {bio.facialComparison?.referenceUsed || 'REC_DNI_HISTORICO_OFFICIAL'}
                <br />
                Status: <span className="text-cyan-400 font-bold">CONFRONTO ATIVO</span>
              </div>
            </div>

            {/* Métricas e Algoritmo de Confronto */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-neutral-400 font-bold border-b border-neutral-800 pb-1">MÉTRICAS DO MOTOR FACIAL</div>
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">MOTOR:</span>
                    <span className="text-white font-bold">{bio.facialComparison?.engineName || 'AFIS_CORE_FACE_v4.8'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">VERSÃO DO MOTOR:</span>
                    <span className="text-neutral-300">{bio.facialComparison?.engineVersion || 'v4.8.2_BUILD_2026'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SCORE OBTIDO:</span>
                    <span className={`font-black text-sm ${
                      (bio.facialComparison?.score || bio.faceMatchScore) >= 85 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {bio.facialComparison?.score || bio.faceMatchScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">LIMIAR INSTITUCIONAL:</span>
                    <span className="text-neutral-300 font-bold">&gt;= {bio.facialComparison?.institutionalThreshold || 85}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">DATA DA AVALIAÇÃO:</span>
                    <span className="text-neutral-400 text-[8px]">{bio.facialComparison?.evaluatedAt || bio.evaluatedAt}</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-2 text-[8px] text-neutral-400">
                {bio.facialMatchResult === 'MATCH' ? (
                  <span className="text-emerald-300">Confronto facial 1:1 atesta correspondência positiva e supera o limiar de aceitação técnica institucional.</span>
                ) : bio.facialMatchResult === 'INCONCLUSIVE' ? (
                  <span className="text-amber-300">Confronto facial inconclusivo (score abaixo do limiar). Requer revisão de perito supervisor conforme regra BIOMETRIC_NON_MATCH ≠ FRAUDE.</span>
                ) : (
                  <span className="text-rose-300">Divergência facial acentuada. Não constitui fraude automática; dossiê retido para parecer pericial especializado.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAINEL 3: CONFRONTO DACTILAR (AFIS / MINÚCIAS NFIQ2)
         ========================================================================= */}
      {activePanel === 'FINGERPRINT_AFIS' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Fingerprint className="w-4 h-4" />
              <span>CONFRONTO DACTILAR (AFIS MINUTIAE MATCHER ISO/IEC 19794-2)</span>
            </div>
            <span className={`px-2 py-0.5 rounded font-bold border ${
              bio.fingerprintMatchResult === 'MATCH'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}>
              STATUS AFIS: {bio.fingerprintMatchResult}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-400 mb-1">SCORE AFIS GERAL</div>
              <div className="text-xl font-black text-emerald-400">{bio.fingerprintsMatchScore}%</div>
              <div className="text-[8px] text-neutral-500 mt-1">Limiar institucional: &gt;= 80%</div>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-400 mb-1">TOTAL MINÚCIAS VALIDADAS</div>
              <div className="text-xl font-black text-cyan-400">{bio.minutiaeCount} pts</div>
              <div className="text-[8px] text-neutral-500 mt-1">Bifurcações e Terminações</div>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-400 mb-1">QUALIDADE MÉDIA NFIQ2</div>
              <div className="text-xl font-black text-emerald-400">{bio.fingerprintComparison?.averageQuality || 91}%</div>
              <div className="text-[8px] text-neutral-500 mt-1">Padrão NIST NFIQ2</div>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-400 mb-1">MOTOR EXECUTOR</div>
              <div className="text-sm font-bold text-white">{bio.fingerprintComparison?.engineName || 'ABIS_MINUTIAE_v3.2'}</div>
              <div className="text-[8px] text-neutral-500 mt-1">Build certificado DNIC</div>
            </div>
          </div>

          {/* Dactilograma Detalhado dos Dedos Obrigatórios */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
            <div className="text-neutral-400 font-bold text-[8px] border-b border-neutral-800 pb-1">
              DEDOS OBRIGATÓRIOS CONFRONTADOS CONFORME PERFIL DE CAPTURA
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[8px]">
              {(bio.fingerprintComparison?.fingersCompared || ['DEDO_POLEGAR_DIR', 'DEDO_INDICADOR_DIR', 'DEDO_POLEGAR_ESQ', 'DEDO_INDICADOR_ESQ']).map((f, i) => (
                <div key={i} className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-2 flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold block">{f}</span>
                    <span className="text-neutral-400">Minúcias: 18-24 pts</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">MATCH</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAINEL 4: PESQUISA 1:N EM GALERIA NACIONAL ABIS (ISOLAMENTO DE DUPLICIDADE)
         ========================================================================= */}
      {activePanel === 'DUPLICATE_ABIS' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Search className="w-4 h-4" />
              <span>PESQUISA 1:N EM GALERIA NACIONAL ABIS (CONTROLO DE DUPLICIDADE)</span>
            </div>
            <span className={`px-2 py-0.5 rounded font-bold border ${
              bio.duplicateSearchResult === 'NO_CANDIDATE'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {bio.duplicateSearchResult === 'NO_CANDIDATE' ? 'SEM COLISÃO NA GALERIA 1:N' : 'CANDIDATO DETETADO (SUPERVISOR_REVIEW)'}
            </span>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between text-[8px]">
            <div>
              <span className="text-neutral-400">GALERIA CONSULTADA: </span>
              <span className="text-white font-bold">BASE NACIONAL DE IDENTIFICAÇÃO CIVIL (ABIS 1:N)</span>
              <span className="ml-3 text-neutral-400">TOTAL CANDIDATOS: </span>
              <span className="text-cyan-400 font-bold">{bio.duplicateSearch?.candidatesCount || 0}</span>
            </div>
            <div className="text-amber-300 font-bold">
              REGRA DE OURO: DUPLICATE_CANDIDATE ≠ FRAUDE
            </div>
          </div>

          {/* Tabela de Candidatos */}
          {bio.duplicateSearch?.candidates && bio.duplicateSearch.candidates.length > 0 ? (
            <div className="overflow-x-auto border border-neutral-800 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800 text-[8px]">
                    <th className="p-2">ID CANDIDATO</th>
                    <th className="p-2">NOME REGISTADO</th>
                    <th className="p-2">Nº BI / REF</th>
                    <th className="p-2 text-center">SCORE MULTIMODAL</th>
                    <th className="p-2 text-center">MODALIDADE</th>
                    <th className="p-2 text-center">STATUS</th>
                    <th className="p-2">PARECER DE TRIAGEM</th>
                    <th className="p-2 text-center">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-[9px]">
                  {bio.duplicateSearch.candidates.map((cand, idx) => (
                    <tr key={idx} className="hover:bg-neutral-900/40">
                      <td className="p-2 font-mono text-cyan-400 font-bold">{cand.candidateId}</td>
                      <td className="p-2 text-white font-bold">{cand.citizenName}</td>
                      <td className="p-2 text-neutral-300">{cand.nationalIdNumber || '—'}</td>
                      <td className="p-2 text-center font-bold text-amber-400">{cand.matchScore}%</td>
                      <td className="p-2 text-center text-neutral-300">{cand.matchType}</td>
                      <td className="p-2 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[8px]">
                          {cand.status}
                        </span>
                      </td>
                      <td className="p-2 text-neutral-400 text-[8px] font-sans">{cand.notes}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => setSelectedCandidateForDetails(cand)}
                          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-[8px]"
                        >
                          DETALHAR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-white font-bold text-xs">Nenhum Candidato ou Colisão Biometria 1:N Detetada</div>
              <div className="text-neutral-400 text-[8px]">
                A pesquisa na galeria nacional atesta a unicidade dos dados recolhidos para este processo.
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          PAINEL 5: EXCEÇÕES BIOMÉTRICAS REGISTADAS
         ========================================================================= */}
      {activePanel === 'EXCEPTIONS' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>REGISTO E GESTÃO DE EXCEÇÕES BIOMÉTRICAS (AMPUTAÇÕES / INCACIDADES)</span>
            </div>
            <button
              onClick={() => setShowAddExceptionModal(true)}
              className="px-2 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-neutral-950 font-black flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>NOVA EXCEÇÃO</span>
            </button>
          </div>

          {bio.exceptions.length > 0 ? (
            <div className="space-y-2">
              {bio.exceptions.map((exc, idx) => (
                <div key={idx} className="bg-neutral-950 border border-amber-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{exc.exceptionId}</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-bold">
                        {exc.code}
                      </span>
                      {exc.affectedFinger && (
                        <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 text-[8px]">
                          {exc.affectedFinger}
                        </span>
                      )}
                    </div>
                    <span className="text-[8px] text-neutral-400">{exc.timestamp}</span>
                  </div>

                  <div className="text-[9px] text-neutral-300">{exc.description}</div>
                  <div className="bg-neutral-900/80 rounded p-2 text-[8px] text-neutral-400">
                    <span className="text-white font-bold">EVIDÊNCIA: </span>
                    {exc.evidence}
                    <br />
                    <span className="text-white font-bold">JUSTIFICATIVA: </span>
                    {exc.justification}
                  </div>
                  <div className="flex justify-between text-[8px] text-neutral-500">
                    <span>Operador: {exc.operatorName} ({exc.operatorId})</span>
                    <span>Requer Homologação Supervisora: {exc.requiresSupervisor ? 'SIM' : 'NÃO'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-white font-bold text-xs">Nenhuma Exceção Biometrica Registada</div>
              <div className="text-neutral-400 text-[8px]">
                Todos os 10 dedos e dados faciais foram recolhidos segundo o perfil integral padrão.
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          PAINEL 6: ESPECIFICAÇÃO DO PERFIL BIOMÉTRICO VERSIONADO
         ========================================================================= */}
      {activePanel === 'PROFILE_SPEC' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Sliders className="w-4 h-4" />
              <span>ESPECIFICAÇÃO DO PERFIL BIOMÉTRICO HOMOLOGADO (REGULAÇÃO DNIC)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
              {bio.captureProfile?.profileId || 'PROFILE_NACIONAL_DNI_2026'} ({bio.captureProfile?.profileVersion || 'v2026.1'})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-2">
              <div className="text-neutral-400 font-bold border-b border-neutral-800 pb-1">LIMIARES E EXIGÊNCIAS</div>
              <div className="space-y-1 text-[8px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">QUALIDADE FACIAL MÍNIMA:</span>
                  <span className="text-white font-bold">&gt;= {bio.captureProfile?.minFacialQuality || 80}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">QUALIDADE DACTILAR MÍNIMA:</span>
                  <span className="text-white font-bold">&gt;= {bio.captureProfile?.minFingerprintQuality || 70}% (NFIQ2)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">QUANTIDADE MÍNIMA DE DEDOS:</span>
                  <span className="text-white font-bold">{bio.captureProfile?.minFingersCount || 4} dedos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">FOTOGRAFIA OBRIGATÓRIA:</span>
                  <span className="text-emerald-400 font-bold">SIM (ICAO 19794-5)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">ASSINATURA DIGITAL PAD:</span>
                  <span className="text-emerald-400 font-bold">SIM (Vetorial 200Hz)</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-2">
              <div className="text-neutral-400 font-bold border-b border-neutral-800 pb-1">HOMOLOGAÇÃO & VIGÊNCIA</div>
              <div className="space-y-1 text-[8px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">AUTORIDADE HOMOLOGADORA:</span>
                  <span className="text-white font-bold">{bio.captureProfile?.homologatingAuthority || 'Direção Nacional de Identificação Civil (DNIC)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">DATA DE EFICÁCIA LEGAL:</span>
                  <span className="text-white font-bold">{bio.captureProfile?.effectiveDate || '2026-01-01'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">TERRITÓRIO ATIVO:</span>
                  <span className="text-cyan-400 font-bold">{bio.territoryVersion || 'DPA-2026.1'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAIS OPERACIONAIS DO 03 — VAL_BIOMÉTRICA
         ========================================================================= */}

      {/* Modal 1: Re-executar Pipeline de Validação Biometrica */}
      {showRunPipelineModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-cyan-500/40 rounded-xl p-4 max-w-lg w-full space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>RE-EXECUTAR PIPELINE COMPLETO ABIS / AFIS</span>
              </div>
              <button onClick={() => setShowRunPipelineModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5 text-[8px] text-neutral-300">
              <p>Esta operação invocará os seguintes motores especializados em cadeia:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-neutral-400">
                <li>Motor Facial AFIS (ICAO 19794-5) 1:1 e Prova de Vida</li>
                <li>Motor Dactilar AFIS NFIQ2 (ISO/IEC 19794-2) 10 Dedos</li>
                <li>Pesquisa de Duplicidade 1:N na Galeria Nacional ABIS</li>
              </ul>
              <div className="text-cyan-300 font-bold mt-1">
                Dossiê Alvo: {dossier.dossierId} — {dossier.citizenName}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowRunPipelineModal(false)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700"
              >
                CANCELAR
              </button>
              <button
                onClick={handleExecutePipeline}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-black flex items-center gap-1"
              >
                {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                <span>{isProcessing ? 'PROCESSANDO...' : 'EXECUTAR AGORA'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Homologação e Confirmação de Resultado (Reautenticação Forte IAM) */}
      {showConfirmResultModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-cyan-500/40 rounded-xl p-4 max-w-lg w-full space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>HOMOLOGAÇÃO TÉCNICA BIOMÉTRICA (REAUTENTICAÇÃO FORTE IAM)</span>
              </div>
              <button onClick={() => setShowConfirmResultModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-[8px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">DOSSIÊ:</span>
                  <span className="text-white font-bold">{dossier.dossierId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">CIDADÃO:</span>
                  <span className="text-white">{dossier.citizenName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">RESULTADO A HOMOLOGAR:</span>
                  <span className="text-cyan-400 font-bold">{bio.consolidatedResult}</span>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">NOTAS / PARECER TÉCNICO DE HOMOLOGAÇÃO:</label>
                <textarea
                  value={confirmationNotes}
                  onChange={(e) => setConfirmationNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white font-mono text-[9px] focus:outline-none focus:border-cyan-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-cyan-400 block mb-1 font-bold">SENHA DO OPERADOR (IAM / MFA):</label>
                <input
                  type="password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  placeholder="Introduza sua credencial para assinar digitalmente..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white font-mono text-[10px] focus:outline-none focus:border-cyan-500"
                />
                {reauthError && <div className="text-rose-400 text-[8px] mt-1 font-bold">{reauthError}</div>}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowConfirmResultModal(false)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700"
              >
                CANCELAR
              </button>
              <button
                onClick={handleConfirmBiometricResult}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-black flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>CONFIRMAR & ASSINAR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Registar Exceção Biometrica */}
      {showAddExceptionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-amber-500/40 rounded-xl p-4 max-w-lg w-full space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>REGISTAR EXCEÇÃO BIOMÉTRICA (AMPUTAÇÃO / INCAPACIDADE)</span>
              </div>
              <button onClick={() => setShowAddExceptionModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">CÓDIGO DE EXCEÇÃO:</label>
                  <select
                    value={exceptionCode}
                    onChange={(e) => setExceptionCode(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-1.5 text-white font-mono text-[9px] focus:outline-none focus:border-amber-500"
                  >
                    <option value="AMPUTATION_MEDICAL">AMPUTAÇÃO MÉDICA</option>
                    <option value="TEMPORARY_BANDAGE">BANDAGEM TEMPORÁRIA</option>
                    <option value="PHYSICAL_DEFORMITY">DEFORMIDADE FÍSICA PERMANENTE</option>
                    <option value="SEVERE_SKIN_CONDITION">AFECÇÃO DERMATOLÓGICA GRAVE</option>
                    <option value="OTHER_AUTHORIZED_EXCEPTION">OUTRA EXCEÇÃO AUTORIZADA</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">DEDO / ELEMENTO AFETADO:</label>
                  <select
                    value={exceptionFinger}
                    onChange={(e) => setExceptionFinger(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-1.5 text-white font-mono text-[9px] focus:outline-none focus:border-amber-500"
                  >
                    <option value="DEDO_POLEGAR_DIR">Polegar Direito (D1)</option>
                    <option value="DEDO_INDICADOR_DIR">Indicador Direito (D2)</option>
                    <option value="DEDO_MEDIO_DIR">Médio Direito (D3)</option>
                    <option value="DEDO_ANELAR_DIR">Anelar Direito (D4)</option>
                    <option value="DEDO_MINIMO_DIR">Mínimo Direito (D5)</option>
                    <option value="DEDO_POLEGAR_ESQ">Polegar Esquerdo (D6)</option>
                    <option value="DEDO_INDICADOR_ESQ">Indicador Esquerdo (D7)</option>
                    <option value="DEDO_MEDIO_ESQ">Médio Esquerdo (D8)</option>
                    <option value="DEDO_ANELAR_ESQ">Anelar Esquerdo (D9)</option>
                    <option value="DEDO_MINIMO_ESQ">Mínimo Esquerdo (D10)</option>
                    <option value="FOTO">Fotografia Facial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">EVIDÊNCIA / DOCUMENTO COMPROVATIVO:</label>
                <input
                  type="text"
                  value={exceptionEvidenceDoc}
                  onChange={(e) => setExceptionEvidenceDoc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white font-mono text-[9px] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">JUSTIFICATIVA TÉCNICA E PROBATÓRIA:</label>
                <textarea
                  value={exceptionJustification}
                  onChange={(e) => setExceptionJustification(e.target.value)}
                  placeholder="Descreva o fundamento técnico para dispensa ou exceção da recolha biométrica..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white font-mono text-[9px] focus:outline-none focus:border-amber-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowAddExceptionModal(false)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700"
              >
                CANCELAR
              </button>
              <button
                onClick={handleAddBiometricException}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-neutral-950 font-black flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>REGISTAR EXCEÇÃO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Escalonar Mesa Supervisora */}
      {showSupervisorEscalateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-rose-500/40 rounded-xl p-4 max-w-lg w-full space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>ENCAMINHAR PARA MESA DE SUPERVISÃO TÉCNICA</span>
              </div>
              <button onClick={() => setShowSupervisorEscalateModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">PRIORIDADE DE ENCAMINHAMENTO:</label>
                <select
                  value={escalationPriority}
                  onChange={(e) => setEscalationPriority(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-1.5 text-white font-mono text-[9px] focus:outline-none focus:border-rose-500"
                >
                  <option value="NORMAL">NORMAL (SLA 24 Horas)</option>
                  <option value="HIGH">ALTA (SLA 12 Horas)</option>
                  <option value="URGENT">URGENTE (SLA 2 Horas)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">MOTIVO DO ESCALONAMENTO TÉCNICO:</label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="Indique o motivo pelo qual a correspondência biométrica requer parecer de supervisor..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white font-mono text-[9px] focus:outline-none focus:border-rose-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowSupervisorEscalateModal(false)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700"
              >
                CANCELAR
              </button>
              <button
                onClick={handleEscalateToSupervisor}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center gap-1"
              >
                <ArrowRight className="w-3 h-3" />
                <span>ENCAMINHAR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Trilha de Auditoria Criptográfica SILA */}
      {showAuditChainModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-cyan-500/40 rounded-xl p-4 max-w-xl w-full space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <History className="w-4 h-4" />
                <span>TRILHA DE AUDITORIA CRIPTOGRÁFICA DO MÓDULO 03</span>
              </div>
              <button onClick={() => setShowAuditChainModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2 text-[8px]">
              <div>
                <span className="text-neutral-500">BLOCO DE AUDITORIA SILA: </span>
                <span className="text-white font-bold">{bio.auditChainRef || dossier.auditChainRef}</span>
              </div>
              <div>
                <span className="text-neutral-500">HASH ANTERIOR: </span>
                <span className="text-neutral-400 break-all">{bio.previousHash || dossier.previousHash}</span>
              </div>
              <div>
                <span className="text-neutral-500">HASH ATUAL: </span>
                <span className="text-cyan-400 font-bold break-all">{bio.currentHash || dossier.currentHash}</span>
              </div>
              <div>
                <span className="text-neutral-500">ASSINATURA DIGITAL DO MOTOR: </span>
                <span className="text-emerald-400 break-all">{bio.digitalSignature || 'SIG_ABIS_ECDSA_GENUINE_BLOCK'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowAuditChainModal(false)}
                className="px-4 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 font-bold hover:bg-neutral-700"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Detalhar Candidato Duplicado */}
      {selectedCandidateForDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-amber-500/40 rounded-xl p-4 max-w-md w-full space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Search className="w-4 h-4" />
                <span>DETALHES DO CANDIDATO 1:N ({selectedCandidateForDetails.candidateId})</span>
              </div>
              <button onClick={() => setSelectedCandidateForDetails(null)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-1.5 text-[8px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">NOME DO CANDIDATO:</span>
                <span className="text-white font-bold">{selectedCandidateForDetails.citizenName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nº DO BI REGISTADO:</span>
                <span className="text-neutral-300">{selectedCandidateForDetails.nationalIdNumber || 'PRIMEIRA EMISSÃO'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">SCORE MULTIMODAL:</span>
                <span className="text-amber-400 font-bold">{selectedCandidateForDetails.matchScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">MODALIDADE:</span>
                <span className="text-neutral-300">{selectedCandidateForDetails.matchType}</span>
              </div>
              <div className="pt-2 border-t border-neutral-800">
                <span className="text-neutral-500 block mb-1">NOTAS DA TRIAGEM:</span>
                <span className="text-neutral-300 font-sans">{selectedCandidateForDetails.notes}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-800">
              <button
                onClick={() => setSelectedCandidateForDetails(null)}
                className="px-4 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 font-bold hover:bg-neutral-700"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
