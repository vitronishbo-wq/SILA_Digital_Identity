import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  RefreshCw,
  Send,
  Building,
  KeyRound,
  Filter,
  Eye,
  FileSearch,
  BadgeAlert,
  FileCheck2,
  Layers,
  ArrowRight,
  UserCheck,
  Check,
  X,
  History,
  ShieldAlert,
  BookOpen,
  Paperclip,
  Clock,
  Briefcase,
  Search,
  ArrowUpRight,
  FolderOpen,
  UserPlus,
  Compass,
  FilePlus,
  Scale,
} from 'lucide-react';
import {
  ValidationDossier,
  ValidationAuditEvent,
} from '../../../../types/validations';
import {
  ValidationExceptionRecord,
  ExceptionState,
  ExceptionCategory,
  ExceptionOperatorLevel,
  ExceptionResolutionType,
  ExceptionEvidenceDocument,
  ExceptionAuditEvent,
  ExceptionCommand,
} from '../../../../types/exceptionsManagement';
import {
  INITIAL_EXCEPTIONS_RECORDS,
  INITIAL_EXCEPTIONS_AUDIT_LOGS,
} from '../../../../data/exceptionsData';

interface ValidationsExceptionsTabProps {
  dossiers: ValidationDossier[];
  activeDossierId: string;
  onSelectDossier: (dossierId: string) => void;
  onUpdateDossier: (updated: ValidationDossier) => void;
  onAddAuditEvent: (event: ValidationAuditEvent) => void;
}

export const ValidationsExceptionsTab: React.FC<ValidationsExceptionsTabProps> = ({
  dossiers,
  activeDossierId,
  onSelectDossier,
  onUpdateDossier,
  onAddAuditEvent,
}) => {
  // 8 Zonas Operacionais Estruturadas
  const [activeSubView, setActiveSubView] = useState<
    | '01_FILA_EXCECOES'
    | '02_CONTEXTO_DOSSIER'
    | '03_DETALHE_DISCREPANCIA'
    | '04_EVIDENCIAS_ACERVO'
    | '05_SANEAMENTO_PROCESSUAL'
    | '06_RESOLUCAO_VINCULATIVA'
    | '07_ALCADA_REAUTENTICACAO'
    | '08_AUDITORIA_ENCADEADA'
  >('01_FILA_EXCECOES');

  // Operador IAM Ativo Autenticado (Sessão Soberana)
  const [currentOperator, setCurrentOperator] = useState<{
    operatorId: string;
    operatorName: string;
    role: ExceptionOperatorLevel;
    terminalId: string;
    jurisdictionProvince: string;
    jurisdictionMunicipality: string;
    organization: string;
  }>({
    operatorId: 'SILA-EXC-N2-0044',
    operatorName: 'Dra. Luísa Gaspar (Validadora de Exceções)',
    role: 'N2_VALIDATOR',
    terminalId: 'TERM-EXC-LUA-03',
    jurisdictionProvince: 'LUANDA',
    jurisdictionMunicipality: 'VIANA',
    organization: 'DNI_GABINETE_SANEAMENTO',
  });

  // Base de Dados Local de Exceções & Auditoria
  const [exceptions, setExceptions] = useState<ValidationExceptionRecord[]>(INITIAL_EXCEPTIONS_RECORDS);
  const [auditLogs, setAuditLogs] = useState<ExceptionAuditEvent[]>(INITIAL_EXCEPTIONS_AUDIT_LOGS);

  // Filtros Operacionais
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterOrigin, setFilterOrigin] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Exceção Selecionada
  const [selectedExceptionId, setSelectedExceptionId] = useState<string>('EXC-2026-00902');

  // Modais de Ação Canónica
  const [modalMode, setModalMode] = useState<
    'NONE' | 'ASSIGN' | 'REASSIGN' | 'REQUEST_SANEAMENTO' | 'ATTACH_EVIDENCE' | 'ESCALATE_N3' | 'RESOLVE' | 'CLOSE'
  >('NONE');

  // Formulário Operacional
  const [formJustification, setFormJustification] = useState('');
  const [formLegalBasis, setFormLegalBasis] = useState('Decreto Presidencial nº 12/22, Artigo 9º');
  const [formResolutionType, setFormResolutionType] = useState<ExceptionResolutionType>('DOCUMENTO_RETIFICATIVO_ANEXADO');
  const [formDocType, setFormDocType] = useState<ExceptionEvidenceDocument['documentType']>('CERTIDAO_NARRATIVA_COMPLETA');
  const [formDocNumber, setFormDocNumber] = useState('');
  const [formDocAuthority, setFormDocAuthority] = useState('');
  const [formDocSummary, setFormDocSummary] = useState('');
  const [formOperatorPassword, setFormOperatorPassword] = useState('');
  const [formTargetOperator, setFormTargetOperator] = useState('SILA-EXC-N2-0044');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. FILTRAGEM & ORDENAÇÃO RIGOROSA: SLA -> SEVERIDADE -> CRIAÇÃO
  const filteredAndSortedExceptions = useMemo(() => {
    return exceptions
      .filter((exc) => {
        if (filterCategory !== 'ALL' && exc.category !== filterCategory) return false;
        if (filterState !== 'ALL' && exc.state !== filterState) return false;
        if (filterSeverity !== 'ALL' && exc.severity !== filterSeverity) return false;
        if (filterOrigin !== 'ALL' && exc.originatingModule !== filterOrigin) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = exc.exceptionId.toLowerCase().includes(q);
          const matchCitizen = exc.citizenName.toLowerCase().includes(q);
          const matchDossier = exc.dossierId.toLowerCase().includes(q);
          const matchTitle = exc.title.toLowerCase().includes(q);
          if (!matchId && !matchCitizen && !matchDossier && !matchTitle) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // 1º SLA (Menor tempo restante primeiro)
        if (a.slaRemainingHours !== b.slaRemainingHours) {
          return a.slaRemainingHours - b.slaRemainingHours;
        }
        // 2º Severidade (CRITICAL > HIGH > MEDIUM > LOW)
        const severityWeight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const weightA = severityWeight[a.severity] || 0;
        const weightB = severityWeight[b.severity] || 0;
        if (weightA !== weightB) return weightB - weightA;
        // 3º Criação (Mais recentes primeiro)
        return new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime();
      });
  }, [exceptions, filterCategory, filterState, filterSeverity, filterOrigin, searchQuery]);

  const selectedException = useMemo(() => {
    return exceptions.find((e) => e.exceptionId === selectedExceptionId) || exceptions[0];
  }, [exceptions, selectedExceptionId]);

  // ABAC / RBAC: Verificação de Competência Operacional
  const rbacStatus = useMemo(() => {
    const isN1 = currentOperator.role === 'N1_OPERATOR';
    const isN2 = currentOperator.role === 'N2_VALIDATOR';
    const isN3 = currentOperator.role === 'N3_SUPERVISOR' || currentOperator.role === 'DIRECTOR_SILA';

    // Regras de Alçada por Severidade
    const canResolveSeverity =
      (selectedException.severity === 'LOW' || selectedException.severity === 'MEDIUM') ? (isN2 || isN3) : isN3;

    // Regras por Estado
    const canAssign = isN2 || isN3;
    const canRequestSaneamento = isN2 || isN3;
    const canAttachEvidence = true; // N1, N2, N3 podem anexar evidência
    const canEscalate = true;
    const canClose = isN3;

    return {
      canResolve: canResolveSeverity,
      canAssign,
      canRequestSaneamento,
      canAttachEvidence,
      canEscalate,
      canClose,
      isAlcadaSufficient: canResolveSeverity,
    };
  }, [currentOperator.role, selectedException]);

  // HELPER: DISPATCH DE COMANDO CANÓNICO COM AUDITORIA APPEND-ONLY
  const executeCanonicalCommand = (
    command: ExceptionCommand,
    targetNewState: ExceptionState,
    payloadNote: string,
    additionalUpdates: Partial<ValidationExceptionRecord> = {}
  ) => {
    const timestamp = new Date().toISOString();
    const eventId = `EVT_EXC_${Date.now()}`;
    const prevHash = selectedException.currentHash;
    const currentHash = `hash_exc_${selectedException.exceptionId}_${command.toLowerCase()}_${Date.now()}`;
    const digitalSignature = `SIG_ED25519_GOV_${command}_${selectedException.exceptionId}_${Date.now()}`;

    const updatedRecord: ValidationExceptionRecord = {
      ...selectedException,
      ...additionalUpdates,
      state: targetNewState,
      previousHash: prevHash,
      currentHash: currentHash,
      digitalSignature: digitalSignature,
    };

    // 1. Atualizar Fila de Exceções
    setExceptions((prev) => prev.map((e) => (e.exceptionId === selectedException.exceptionId ? updatedRecord : e)));

    // 2. Append-Only no Livro de Auditoria de Exceções
    const auditEvt: ExceptionAuditEvent = {
      eventId,
      exceptionId: selectedException.exceptionId,
      dossierId: selectedException.dossierId,
      timestamp,
      operatorId: currentOperator.operatorId,
      operatorName: currentOperator.operatorName,
      role: currentOperator.role,
      terminalId: currentOperator.terminalId,
      command,
      previousState: selectedException.state,
      newState: targetNewState,
      previousHash: prevHash,
      currentHash: currentHash,
      digitalSignature,
      auditChainRef: selectedException.auditChainRef,
      payloadSummary: payloadNote,
    };
    setAuditLogs((prev) => [auditEvt, ...prev]);

    // 3. Propagar evento para Auditoria Global do Dossiê sem duplicação
    const globalAuditEvt: ValidationAuditEvent = {
      eventId,
      dossierId: selectedException.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role as any,
      command: command as any,
      previousState: selectedException.state as any,
      newState: (targetNewState === 'RESOLVED' ? 'APPROVED' : targetNewState === 'SANEAMENTO_REQUESTED' ? 'PENDING_DOCS' : 'IN_ANALYSIS') as any,
      reason: `[MÓDULO 08] ${command}: ${payloadNote}`,
      timestamp,
      previousHash: prevHash,
      currentHash,
      digitalSignature,
      auditChainRef: selectedException.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Execução de ${command} por ${currentOperator.operatorName} (${currentOperator.role}).`,
      silaGlobalAuditRef: `SILA_EXC_${Date.now()}`,
    };
    onAddAuditEvent(globalAuditEvt);

    setModalMode('NONE');
    setErrorMessage(null);
    setFormJustification('');
    setFormDocNumber('');
    setFormDocAuthority('');
    setFormDocSummary('');
    setFormOperatorPassword('');
  };

  // VALIDAR REAUTENTICAÇÃO FORTE IAM
  const verifyIamPassword = (): boolean => {
    if (!formOperatorPassword.trim()) {
      setErrorMessage('Reautenticação Obrigatória: Introduza a senha institucional IAM.');
      return false;
    }
    if (formOperatorPassword !== '123456' && formOperatorPassword.length < 4) {
      setErrorMessage('Credencial IAM inválida para autorização desta operação crítica.');
      return false;
    }
    return true;
  };

  // HANDLERS OPERACIONAIS DOS COMANDOS
  const handleAssign = () => {
    if (selectedException.state === 'CLOSED' || selectedException.state === 'RESOLVED') {
      setErrorMessage('Transição Ilegal: Exceção já encerrada ou resolvida.');
      return;
    }
    const opName =
      formTargetOperator === 'SILA-EXC-N2-0044'
        ? 'Dra. Luísa Gaspar'
        : formTargetOperator === 'SILA-EXC-N3-0012'
        ? 'Dr. Afonso Viana'
        : 'Téc. Manuel Kiala';
    const role: ExceptionOperatorLevel =
      formTargetOperator === 'SILA-EXC-N3-0012'
        ? 'N3_SUPERVISOR'
        : formTargetOperator === 'SILA-EXC-N2-0044'
        ? 'N2_VALIDATOR'
        : 'N1_OPERATOR';

    executeCanonicalCommand(
      'ASSIGN',
      'ASSIGNED',
      `Exceção atribuída formalmente a ${opName} (${role}).`,
      {
        assignedTo: {
          operatorId: formTargetOperator,
          operatorName: opName,
          role,
          assignedAt: new Date().toISOString(),
        },
      }
    );
  };

  const handleOpenReview = () => {
    if (selectedException.state === 'OPEN') {
      setErrorMessage('Transição Ilegal: Deve primeiro ser atribuída (ASSIGNED) antes de entrar em análise.');
      return;
    }
    executeCanonicalCommand(
      'OPEN_REVIEW',
      'UNDER_REVIEW',
      `Análise técnica e confronto de assentos iniciados pelo operador.`
    );
  };

  const handleRequestSaneamento = () => {
    if (!formJustification.trim() || formJustification.length < 10) {
      setErrorMessage('Instrução Mandatória: Descreva detalhadamente as instruções de saneamento (mínimo 10 caracteres).');
      return;
    }
    executeCanonicalCommand(
      'REQUEST_SANEAMENTO',
      'SANEAMENTO_REQUESTED',
      `Notificação formal de saneamento emitida: ${formJustification}`,
      {
        saneamentoNotice: {
          noticeId: `NOT-SAN-${Date.now()}`,
          requestedAt: new Date().toISOString(),
          requestedByOperatorName: currentOperator.operatorName,
          instructions: formJustification,
          deadlineDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
          status: 'ACTIVE',
        },
      }
    );
  };

  const handleAttachEvidence = () => {
    if (!formDocNumber.trim() || !formDocAuthority.trim() || !formDocSummary.trim()) {
      setErrorMessage('Dados Obrigatórios: Preencha o número do documento, autoridade emissora e súmula da contraprova.');
      return;
    }

    const newEvidence: ExceptionEvidenceDocument = {
      evidenceId: `EVD-DOC-${Date.now()}`,
      exceptionId: selectedException.exceptionId,
      dossierId: selectedException.dossierId,
      documentType: formDocType,
      documentNumber: formDocNumber,
      issuingAuthority: formDocAuthority,
      issueDate: new Date().toISOString().split('T')[0],
      fileHashSha256: `sha256_${Date.now()}_ocr_verified_doc`,
      verifiedByOcr: true,
      documentSummary: formDocSummary,
      attachedByOperatorId: currentOperator.operatorId,
      attachedByOperatorName: currentOperator.operatorName,
      attachedAt: new Date().toISOString(),
    };

    const updatedEvidences = [...selectedException.evidencesAttached, newEvidence];
    executeCanonicalCommand(
      'ATTACH_EVIDENCE',
      'UNDER_REVIEW',
      `Contraprova ${formDocType} nº ${formDocNumber} anexada aos autos.`,
      {
        evidencesAttached: updatedEvidences,
      }
    );
  };

  const handleEscalateToSupervisor = () => {
    executeCanonicalCommand(
      'ESCALATE_TO_SUPERVISOR',
      'ESCALATED_SUPERVISOR_N3',
      `Exceção escalada para a Mesa Supervisora N3 por exigência de gravidade / complexidade.`,
      {
        requiresSupervisorEscalation: true,
        assignedTo: {
          operatorId: 'SILA-EXC-N3-0012',
          operatorName: 'Dr. Afonso Viana (Supervisor)',
          role: 'N3_SUPERVISOR',
          assignedAt: new Date().toISOString(),
        },
      }
    );
  };

  const handleResolve = () => {
    if (selectedException.state === 'OPEN') {
      setErrorMessage('Transição Ilegal: Proibido salto direto de OPEN para RESOLVED.');
      return;
    }
    if (!rbacStatus.canResolve) {
      setErrorMessage(`Alçada Insuficiente: Exceções de severidade ${selectedException.severity} exigem perfil N3_SUPERVISOR.`);
      return;
    }
    if (!formJustification.trim() || formJustification.length < 15) {
      setErrorMessage('Fundamentação Obrigatória: É mandatório fornecer parecer circunstanciado (mínimo 15 caracteres).');
      return;
    }
    if (!verifyIamPassword()) return;

    executeCanonicalCommand(
      'RESOLVE',
      'RESOLVED',
      `Exceção resolvida e homologada sob o tipo [${formResolutionType}]. Base: ${formLegalBasis}`,
      {
        resolution: {
          resolutionType: formResolutionType,
          justificationText: formJustification,
          legalArticleBasis: formLegalBasis,
          resolvedByOperatorId: currentOperator.operatorId,
          resolvedByOperatorName: currentOperator.operatorName,
          resolvedByRole: currentOperator.role,
          resolvedAt: new Date().toISOString(),
        },
      }
    );
  };

  const handleClose = () => {
    if (selectedException.state !== 'RESOLVED') {
      setErrorMessage('Transição Ilegal: Somente exceções em estado RESOLVED podem ser arquivadas/fechadas.');
      return;
    }
    if (!rbacStatus.canClose) {
      setErrorMessage('Alçada Insuficiente: O encerramento definitivo (CLOSE) é restrito à Mesa Supervisora N3.');
      return;
    }
    if (!verifyIamPassword()) return;

    executeCanonicalCommand(
      'CLOSE',
      'CLOSED',
      `Processo de exceção encerrado e arquivado em definitivo na cadeia de custódia.`
    );
  };

  return (
    <div className="space-y-2 font-mono text-[9px]">
      {/* =========================================================================
          CABEÇALHO INSTITUCIONAL & BARRA DE ESTADO IAM / RBAC (MÓDULO 08)
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-2.5 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold tracking-wider">
                  08 — GESTÃO DE EXCEÇÕES, DISCREPÂNCIAS & SANEAMENTO PROCESSUAL
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20 text-[7.5px] font-bold">
                  SANEAMENTO ADMINISTRATIVO
                </span>
              </div>
              <div className="text-neutral-500 text-[7.5px]">
                Saneamento Legal • Contraprovas Documentais • Resoluções Fundamentadas • SILA Chain Custody
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* SELETOR DE ALÇADA PARA TESTE RBAC / ABAC */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-lg">
              <span className="text-neutral-500 text-[7.5px]">ALÇADA OPERACIONAL:</span>
              <select
                value={currentOperator.role}
                onChange={(e) => {
                  const role = e.target.value as ExceptionOperatorLevel;
                  setCurrentOperator({
                    ...currentOperator,
                    role,
                    operatorName:
                      role === 'N3_SUPERVISOR'
                        ? 'Dr. Afonso Viana (Supervisor N3)'
                        : role === 'N1_OPERATOR'
                        ? 'Téc. Manuel Kiala (Operador N1)'
                        : 'Dra. Luísa Gaspar (Validadora N2)',
                  });
                }}
                className="bg-neutral-950 border border-neutral-700 text-amber-400 font-bold text-[7.5px] rounded px-1 py-0.5"
              >
                <option value="N1_OPERATOR">N1_OPERATOR (Triagem / Sem Alçada)</option>
                <option value="N2_VALIDATOR">N2_VALIDATOR (Alçada Média N2)</option>
                <option value="N3_SUPERVISOR">N3_SUPERVISOR (Mesa Supervisora N3)</option>
              </select>
            </div>

            {/* BOTÕES DE AÇÃO CANÓNICA */}
            <button
              onClick={() => {
                setErrorMessage(null);
                setModalMode('REQUEST_SANEAMENTO');
              }}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-neutral-950 font-black uppercase flex items-center gap-1 transition shadow-sm"
            >
              <Send className="w-3 h-3" />
              <span>SANEAMENTO</span>
            </button>

            <button
              onClick={() => {
                setErrorMessage(null);
                setModalMode('ATTACH_EVIDENCE');
              }}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-black uppercase flex items-center gap-1 transition shadow-sm"
            >
              <Paperclip className="w-3 h-3" />
              <span>ANEXAR EVIDÊNCIA</span>
            </button>

            <button
              onClick={() => {
                setErrorMessage(null);
                setModalMode('RESOLVE');
              }}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black uppercase flex items-center gap-1 transition shadow-sm"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>RESOLVER EXCEÇÃO</span>
            </button>
          </div>
        </div>

        {/* 8 ZONAS OPERACIONAIS */}
        <div className="flex items-center gap-1 border-b border-neutral-800 pt-1 overflow-x-auto">
          {[
            { id: '01_FILA_EXCECOES', label: '01. FILA DE EXCEÇÕES', icon: Filter },
            { id: '02_CONTEXTO_DOSSIER', label: '02. CONTEXTO & REQ.', icon: FolderOpen },
            { id: '03_DETALHE_DISCREPANCIA', label: '03. DISCREPÂNCIA & ORIGEM', icon: FileSearch },
            { id: '04_EVIDENCIAS_ACERVO', label: '04. ACERVO PROBATÓRIO', icon: Paperclip },
            { id: '05_SANEAMENTO_PROCESSUAL', label: '05. SANEAMENTO', icon: Send },
            { id: '06_RESOLUCAO_VINCULATIVA', label: '06. RESOLUÇÃO VINCULATIVA', icon: FileCheck2 },
            { id: '07_ALCADA_REAUTENTICACAO', label: '07. ALÇADA & IAM', icon: UserCheck },
            { id: '08_AUDITORIA_ENCADEADA', label: '08. AUDITORIA SILA CHAIN', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubView(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 border-t border-x transition shrink-0 ${
                  isActive
                    ? 'bg-neutral-900 border-neutral-700 text-amber-400 border-b-neutral-900'
                    : 'bg-neutral-950/40 border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          ZONA 01: FILA DE EXCEÇÕES COM FILTROS OPERACIONAIS E ORDENAÇÃO SLA
         ========================================================================= */}
      {activeSubView === '01_FILA_EXCECOES' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          {/* BARRA DE FILTROS OPERACIONAIS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-2 bg-neutral-950 rounded-lg border border-neutral-800">
            <div>
              <label className="text-neutral-500 block text-[7px]">CATEGORIA:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1 text-white"
              >
                <option value="ALL">Todas Categorias</option>
                <option value="DUPLICIDADE">DUPLICIDADE / Homonímia</option>
                <option value="DOCUMENTAL">DOCUMENTAL / OCR</option>
                <option value="BIOGRAFICA">BIOGRAFICA</option>
                <option value="BIOMETRICA">BIOMETRICA / Dispensa</option>
                <option value="REGULATORIA">REGULATORIA / Tutela</option>
                <option value="DECISORIA">DECISORIA / Suspensão</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-500 block text-[7px]">ESTADO:</label>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1 text-white"
              >
                <option value="ALL">Todos Estados</option>
                <option value="OPEN">OPEN</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="SANEAMENTO_REQUESTED">SANEAMENTO_REQUESTED</option>
                <option value="ESCALATED_SUPERVISOR_N3">ESCALATED_SUPERVISOR_N3</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-500 block text-[7px]">SEVERIDADE:</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1 text-white"
              >
                <option value="ALL">Todas Severidades</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-500 block text-[7px]">ORIGEM (02-07):</label>
              <select
                value={filterOrigin}
                onChange={(e) => setFilterOrigin(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1 text-white"
              >
                <option value="ALL">Todas Origens</option>
                <option value="02_BIOGRAFICA">02_BIOGRAFICA</option>
                <option value="03_BIOMETRICA">03_BIOMETRICA</option>
                <option value="04_UNICIDADE">04_UNICIDADE</option>
                <option value="05_DOCUMENTAL">05_DOCUMENTAL</option>
                <option value="06_COMPLIANCE">06_COMPLIANCE</option>
                <option value="07_DECISAO">07_DECISAO</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-500 block text-[7px]">PESQUISA RÁPIDA:</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ID, Cidadão, Dossiê..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1 pl-5 text-white"
                />
                <Search className="w-3 h-3 text-neutral-500 absolute left-1.5 top-1.5" />
              </div>
            </div>
          </div>

          {/* TABELA DENSA DE EXCEÇÕES ORDENADAS */}
          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-left border-collapse text-[8px]">
              <thead className="bg-neutral-950 text-neutral-400 font-bold border-b border-neutral-800 uppercase">
                <tr>
                  <th className="p-2">ID EXCEÇÃO</th>
                  <th className="p-2">ORIGEM</th>
                  <th className="p-2">CIDADÃO / DOSSIÊ</th>
                  <th className="p-2">TÍTULO DA DISCREPÂNCIA</th>
                  <th className="p-2">SEVERIDADE</th>
                  <th className="p-2">SLA OPERACIONAL</th>
                  <th className="p-2">ESTADO</th>
                  <th className="p-2">RESPONSÁVEL</th>
                  <th className="p-2 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredAndSortedExceptions.map((exc) => {
                  const isSelected = exc.exceptionId === selectedException.exceptionId;
                  return (
                    <tr
                      key={exc.exceptionId}
                      onClick={() => setSelectedExceptionId(exc.exceptionId)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-amber-950/20 text-white font-bold'
                          : 'bg-[#0b0d11] hover:bg-neutral-900/50 text-neutral-300'
                      }`}
                    >
                      <td className="p-2 font-mono text-amber-400 font-bold">{exc.exceptionId}</td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[7px]">
                          {exc.originatingModule}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="font-bold text-white">{exc.citizenName}</div>
                        <div className="text-neutral-500 text-[7px]">{exc.dossierId}</div>
                      </td>
                      <td className="p-2 max-w-[200px] truncate" title={exc.title}>
                        {exc.title}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold text-[7px] ${
                            exc.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : exc.severity === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {exc.severity}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-neutral-500" />
                          <span
                            className={
                              exc.slaStatus === 'EXPIRED'
                                ? 'text-rose-400 font-bold'
                                : exc.slaStatus === 'WARNING'
                                ? 'text-amber-400 font-bold'
                                : 'text-emerald-400'
                            }
                          >
                            {exc.slaRemainingHours}h restantes
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[7px] font-bold ${
                            exc.state === 'RESOLVED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : exc.state === 'CLOSED'
                              ? 'bg-neutral-800 text-neutral-400'
                              : exc.state === 'SANEAMENTO_REQUESTED'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {exc.state}
                        </span>
                      </td>
                      <td className="p-2 text-neutral-400">
                        {exc.assignedTo ? exc.assignedTo.operatorName : <span className="text-neutral-600">Não atribuído</span>}
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExceptionId(exc.exceptionId);
                            setActiveSubView('03_DETALHE_DISCREPANCIA');
                          }}
                          className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[7.5px]"
                        >
                          DETALHES
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 02: CONTEXTO & REQUERIMENTO
         ========================================================================= */}
      {activeSubView === '02_CONTEXTO_DOSSIER' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              CONTEXTO DO REQUERIMENTO & JURISDIÇÃO PROCESSUAL
            </span>
            <span className="text-neutral-500 text-[7.5px]">Dossiê: {selectedException.dossierId}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">CIDADÃO / TITULAR:</div>
              <div className="text-white font-bold text-[9px]">{selectedException.citizenName}</div>
              <div className="text-neutral-400 text-[7.5px]">ID Cidadão: {selectedException.citizenId}</div>
            </div>

            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">PROCESSO & REGISTO:</div>
              <div className="text-amber-400 font-bold text-[9px]">{selectedException.processId}</div>
              <div className="text-neutral-400 text-[7.5px]">Abertura: {new Date(selectedException.openedAt).toLocaleString('pt-AO')}</div>
            </div>

            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">JURISDIÇÃO TERRITORIAL (ABAC):</div>
              <div className="text-cyan-400 font-bold text-[9px]">{selectedException.jurisdictionProvince} — {selectedException.jurisdictionMunicipality}</div>
              <div className="text-neutral-400 text-[7.5px]">Posto Delegado: DNI-CENTRO</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 03: DISCREPÂNCIA & ORIGEM (MÓDULOS 02 A 07)
         ========================================================================= */}
      {activeSubView === '03_DETALHE_DISCREPANCIA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5 text-amber-400" />
              DISCREPÂNCIA REGISTADA • ORIGEM CANÓNICA: {selectedException.originatingModule}
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[7.5px]">
              SEVERIDADE: {selectedException.severity}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
            <div className="font-bold text-white text-[9px]">{selectedException.title}</div>
            <div className="text-neutral-300 text-[8px] leading-relaxed">{selectedException.description}</div>
            {selectedException.technicalDetails && (
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 text-[7.5px] font-mono">
                Log Técnico / Barramento: {selectedException.technicalDetails}
              </div>
            )}
          </div>

          {/* BOTÕES DE COMANDO DIRETO */}
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
            {selectedException.state === 'OPEN' && (
              <button
                onClick={() => setModalMode('ASSIGN')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>ATRIBUIR (ASSIGN)</span>
              </button>
            )}

            {selectedException.state === 'ASSIGNED' && (
              <button
                onClick={handleOpenReview}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1"
              >
                <FileSearch className="w-3 h-3" />
                <span>INICIAR ANÁLISE (OPEN_REVIEW)</span>
              </button>
            )}

            <button
              onClick={handleEscalateToSupervisor}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded flex items-center gap-1"
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>ESCALAR PARA SUPERVISOR N3</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 04: ACERVO PROBATÓRIO (EVIDÊNCIAS & CONTRAPROVAS)
         ========================================================================= */}
      {activeSubView === '04_EVIDENCIAS_ACERVO' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-amber-400" />
              ACERVO PROBATÓRIO • CONTRAPROVAS & CERTIDÕES VINCULADAS
            </span>
            <button
              onClick={() => setModalMode('ATTACH_EVIDENCE')}
              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[7.5px]"
            >
              + ANEXAR NOVA EVIDÊNCIA
            </button>
          </div>

          {selectedException.evidencesAttached.length === 0 ? (
            <div className="p-8 text-center bg-neutral-950 rounded border border-neutral-800 text-neutral-500">
              Nenhuma contraprova ou certidão retificativa anexada até o momento para a exceção {selectedException.exceptionId}.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedException.evidencesAttached.map((doc) => (
                <div key={doc.evidenceId} className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">
                      {doc.documentType} • Nº {doc.documentNumber}
                    </span>
                    <span className="text-neutral-500 text-[7px]">{doc.issuingAuthority} • {doc.issueDate}</span>
                  </div>
                  <div className="text-neutral-300 text-[8px]">{doc.documentSummary}</div>
                  <div className="flex items-center justify-between text-neutral-500 text-[7px] pt-1 border-t border-neutral-900">
                    <span>Anexado por: {doc.attachedByOperatorName}</span>
                    <span className="font-mono">HASH SHA256: {doc.fileHashSha256}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ZONA 05: SANEAMENTO PROCESSUAL
         ========================================================================= */}
      {activeSubView === '05_SANEAMENTO_PROCESSUAL' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-400" />
              SANEAMENTO PROCESSUAL & NOTIFICAÇÕES FORMAIS
            </span>
            <span className="text-neutral-500 text-[7.5px]">Artigo 9º do Regulamento de Identificação</span>
          </div>

          {selectedException.saneamentoNotice ? (
            <div className="p-3 bg-neutral-950 rounded-lg border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">
                  NOTIFICAÇÃO ATIVA: {selectedException.saneamentoNotice.noticeId}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[7px]">
                  STATUS: {selectedException.saneamentoNotice.status}
                </span>
              </div>
              <div className="text-neutral-200 text-[8px]">{selectedException.saneamentoNotice.instructions}</div>
              <div className="flex justify-between text-neutral-500 text-[7px]">
                <span>Emitido por: {selectedException.saneamentoNotice.requestedByOperatorName}</span>
                <span>Prazo Limite: {selectedException.saneamentoNotice.deadlineDate}</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-neutral-950 rounded border border-neutral-800 text-neutral-500">
              Nenhuma notificação formal de saneamento emitida para esta exceção.
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ZONA 06: RESOLUÇÃO VINCULATIVA
         ========================================================================= */}
      {activeSubView === '06_RESOLUCAO_VINCULATIVA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              PARECER E HOMOLOGAÇÃO DE RESOLUÇÃO DA EXCEÇÃO
            </span>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[7.5px] ${
                selectedException.state === 'RESOLVED'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {selectedException.state === 'RESOLVED' ? 'RESOLVIDA' : 'PENDENTE DE HOMOLOGAÇÃO'}
            </span>
          </div>

          {selectedException.resolution ? (
            <div className="p-3 bg-neutral-950 rounded-lg border border-emerald-500/30 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border-b border-neutral-800 pb-2">
                <div>
                  <span className="text-neutral-500 text-[7px] block">TIPO DE RESOLUÇÃO:</span>
                  <span className="text-emerald-400 font-bold text-[8.5px]">{selectedException.resolution.resolutionType}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[7px] block">HOMOLOGADO POR:</span>
                  <span className="text-white font-bold text-[8.5px]">
                    {selectedException.resolution.resolvedByOperatorName} ({selectedException.resolution.resolvedByRole})
                  </span>
                </div>
              </div>
              <div>
                <span className="text-neutral-500 text-[7px] block">PARECER FUNDAMENTADO:</span>
                <p className="text-neutral-200 text-[8px] leading-relaxed">{selectedException.resolution.justificationText}</p>
              </div>
              <div className="flex justify-between text-neutral-500 text-[7px]">
                <span>Base Legal: {selectedException.resolution.legalArticleBasis}</span>
                <span>Data: {new Date(selectedException.resolution.resolvedAt).toLocaleString('pt-AO')}</span>
              </div>

              {selectedException.state === 'RESOLVED' && rbacStatus.canClose && (
                <div className="pt-2 border-t border-neutral-800 flex justify-end">
                  <button
                    onClick={() => setModalMode('CLOSE')}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>ENCERRAR EXCEÇÃO (CLOSE)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center bg-neutral-950 rounded border border-neutral-800 text-neutral-500">
              Exceção aguardando parecer final e resolução formal.
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ZONA 07: ALÇADA & IAM (RBAC/ABAC)
         ========================================================================= */}
      {activeSubView === '07_ALCADA_REAUTENTICACAO' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              MATRIZ DE COMPETÊNCIA, ALÇADAS & REAUTENTICAÇÃO FORTE IAM
            </span>
            <span className="text-neutral-500 text-[7.5px]">Decreto DNI Art. 21º</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1.5">
              <div className="text-neutral-400 font-bold border-b border-neutral-800 pb-1">OPERADOR EM SESSÃO</div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nome:</span>
                <span className="text-white font-bold">{currentOperator.operatorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Alçada:</span>
                <span className="text-amber-400 font-bold">{currentOperator.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Terminal / Jurisdição:</span>
                <span className="text-neutral-300">{currentOperator.terminalId} • {currentOperator.jurisdictionProvince}</span>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1.5">
              <div className="text-neutral-400 font-bold border-b border-neutral-800 pb-1">REQUISITO DA EXCEÇÃO</div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Gravidade:</span>
                <span className="text-rose-400 font-bold">{selectedException.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Alçada Exigida:</span>
                <span className="text-white font-bold">
                  {selectedException.severity === 'CRITICAL' || selectedException.severity === 'HIGH'
                    ? 'N3_SUPERVISOR'
                    : 'N2_VALIDATOR'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status Permissão:</span>
                <span className={`font-bold ${rbacStatus.canResolve ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {rbacStatus.canResolve ? 'AUTORIZADO PARA DECISÃO' : 'RESTRITO A SUPERVISOR N3'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 08: AUDITORIA SILA CHAIN (APPEND-ONLY)
         ========================================================================= */}
      {activeSubView === '08_AUDITORIA_ENCADEADA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              LIVRO-MESTRE DE AUDITORIA CRIPTOGRÁFICA (SILA CHAIN EXCEPTION LEDGER)
            </span>
            <span className="text-neutral-500 text-[7.5px]">Total Registos: {auditLogs.length}</span>
          </div>

          <div className="space-y-1.5">
            {auditLogs.map((log) => (
              <div key={log.eventId} className="p-2.5 bg-neutral-950 rounded border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">{log.eventId}</span>
                    <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[7px] text-amber-300">
                      COMANDO: {log.command}
                    </span>
                    <span className="text-neutral-500 text-[7px]">
                      {log.previousState} ➔ {log.newState}
                    </span>
                  </div>
                  <span className="text-neutral-500 text-[7px]">{new Date(log.timestamp).toLocaleString('pt-AO')}</span>
                </div>
                <div className="text-neutral-300 text-[8px]">{log.payloadSummary}</div>
                <div className="flex justify-between text-neutral-500 text-[6.5px] font-mono pt-0.5 border-t border-neutral-900">
                  <span>OPERADOR: {log.operatorName} ({log.role})</span>
                  <span>CURR_HASH: {log.currentHash.substring(0, 30)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAIS OPERACIONAIS CANÓNICOS
         ========================================================================= */}

      {/* MODAL: ATRIBUIR (ASSIGN) */}
      {modalMode === 'ASSIGN' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-md w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" /> ATRIBUIÇÃO FORMAL DE EXCEÇÃO
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div>
              <label className="text-neutral-400 block mb-1">OPERADOR RESPONSÁVEL:</label>
              <select
                value={formTargetOperator}
                onChange={(e) => setFormTargetOperator(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
              >
                <option value="SILA-EXC-N2-0044">Dra. Luísa Gaspar (N2_VALIDATOR)</option>
                <option value="SILA-EXC-N3-0012">Dr. Afonso Viana (N3_SUPERVISOR)</option>
                <option value="SILA-EXC-N1-0002">Téc. Manuel Kiala (N1_OPERATOR)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleAssign} className="px-3 py-1.5 rounded bg-amber-600 text-neutral-950 font-black">HOMOLOGAR ATRIBUIÇÃO</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SANEAMENTO */}
      {modalMode === 'REQUEST_SANEAMENTO' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-md w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Send className="w-4 h-4" /> EMISSÃO DE NOTIFICAÇÃO DE SANEAMENTO
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div>
              <label className="text-neutral-400 block mb-1">INSTRUÇÕES DE SANEAMENTO PARA O REQUERENTE / POSTO:</label>
              <textarea
                value={formJustification}
                onChange={(e) => setFormJustification(e.target.value)}
                placeholder="Indique o documento oficial ou assento que deve ser apresentado..."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleRequestSaneamento} className="px-3 py-1.5 rounded bg-amber-600 text-neutral-950 font-black">EMITIR SANEAMENTO</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ANEXAR EVIDÊNCIA */}
      {modalMode === 'ATTACH_EVIDENCE' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-md w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-blue-400 font-bold flex items-center gap-1.5">
                <Paperclip className="w-4 h-4" /> ANEXAR CONTRAPROVA DOCUMENTAL
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">TIPO DE DOCUMENTO:</label>
                <select
                  value={formDocType}
                  onChange={(e) => setFormDocType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                >
                  <option value="CERTIDAO_NARRATIVA_COMPLETA">Certidão Narrativa Completa</option>
                  <option value="LAUDO_MEDICO_PERICIAL">Laudo Médico Pericial (Amputação / ICAO)</option>
                  <option value="SENTENCA_JUDICIAL_TUTELA">Sentença Judicial de Tutela / Adoção</option>
                  <option value="DESPACHO_MINISTERIAL_NOTARIAL">Despacho Notarial do Conservador</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Nº DO DOCUMENTO:</label>
                  <input
                    type="text"
                    value={formDocNumber}
                    onChange={(e) => setFormDocNumber(e.target.value)}
                    placeholder="Ex: CERT-2026-99"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">AUTORIDADE EMISSORA:</label>
                  <input
                    type="text"
                    value={formDocAuthority}
                    onChange={(e) => setFormDocAuthority(e.target.value)}
                    placeholder="Ex: Conservatória de Viana"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">SÚMULA DA EVIDÊNCIA:</label>
                <textarea
                  value={formDocSummary}
                  onChange={(e) => setFormDocSummary(e.target.value)}
                  placeholder="Resumo do facto comprovado pelo documento..."
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleAttachEvidence} className="px-3 py-1.5 rounded bg-blue-600 text-white font-black">ANEXAR CONTRAPROVA</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESOLUÇÃO VINCULATIVA COM REAUTENTICAÇÃO IAM */}
      {modalMode === 'RESOLVE' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-lg w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> RESOLUÇÃO VINCULATIVA DA EXCEÇÃO
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">TIPO DE RESOLUÇÃO CANÓNICA:</label>
                <select
                  value={formResolutionType}
                  onChange={(e) => setFormResolutionType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-bold"
                >
                  <option value="DOCUMENTO_RETIFICATIVO_ANEXADO">DOCUMENTO_RETIFICATIVO_ANEXADO — Certidão Retificada</option>
                  <option value="DISPENSA_LEGAL_COMPROVADA">DISPENSA_LEGAL_COMPROVADA — Laudo Médico / ICAO</option>
                  <option value="HOMONIMIA_FORMALMENTE_JUSTIFIC">HOMONIMIA_FORMALMENTE_JUSTIFIC — Árvore Genealógica</option>
                  <option value="DESPACHO_CONSERVADOR_APROVADO">DESPACHO_CONSERVADOR_APROVADO — Parecer Notarial</option>
                </select>
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">BASE LEGAL:</label>
                <input
                  type="text"
                  value={formLegalBasis}
                  onChange={(e) => setFormLegalBasis(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">PARECER FUNDAMENTADO:</label>
                <textarea
                  value={formJustification}
                  onChange={(e) => setFormJustification(e.target.value)}
                  placeholder="Enquadramento fáctico e jurídico da decisão..."
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-emerald-400" />
                  <span>SENHA IAM (REAUTENTICAÇÃO FORTE):</span>
                </label>
                <input
                  type="password"
                  value={formOperatorPassword}
                  onChange={(e) => setFormOperatorPassword(e.target.value)}
                  placeholder="Senha institucional para emissão da assinatura..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleResolve} className="px-3 py-1.5 rounded bg-emerald-600 text-neutral-950 font-black">HOMOLOGAR RESOLUÇÃO</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FECHAR EXCEÇÃO (CLOSE) */}
      {modalMode === 'CLOSE' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-md w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-purple-400 font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> ENCERRAMENTO DEFINITIVO (CLOSE)
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div className="text-neutral-300">
              Confirma o arquivamento definitivo da exceção <strong className="text-amber-400">{selectedException.exceptionId}</strong>?
            </div>
            <div>
              <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-purple-400" />
                <span>SENHA IAM SUPERVISOR:</span>
              </label>
              <input
                type="password"
                value={formOperatorPassword}
                onChange={(e) => setFormOperatorPassword(e.target.value)}
                placeholder="Senha de supervisor N3..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleClose} className="px-3 py-1.5 rounded bg-purple-600 text-white font-black">ENCERRAR DEFINITIVAMENTE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
