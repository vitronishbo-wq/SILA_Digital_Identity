import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  FileText,
  Paperclip,
  FolderOpen,
  ArrowUpRight,
  UserPlus,
  Send,
  Eye,
  Scale,
  BadgeAlert,
  FileCheck,
  RotateCcw,
  KeyRound,
  ShieldCheck,
  Layers,
  History,
} from 'lucide-react';
import {
  ValidationDossier,
  ValidationAuditEvent,
} from '../../../../types/validations';
import {
  SupervisoryReview,
  SupervisoryReviewStatus,
  SupervisoryDespachoType,
  SupervisoryOperatorRole,
  SupervisoryAuditEvent,
  SupervisoryCommand,
} from '../../../../types/supervisoryManagement';
import {
  INITIAL_SUPERVISORY_REVIEWS,
  INITIAL_SUPERVISORY_AUDIT_LOGS,
} from '../../../../data/supervisoryData';

interface ValidationsSupervisoryTabProps {
  dossiers: ValidationDossier[];
  activeDossierId: string;
  onSelectDossier: (dossierId: string) => void;
  onUpdateDossier: (updated: ValidationDossier) => void;
  onAddAuditEvent: (event: ValidationAuditEvent) => void;
}

export const ValidationsSupervisoryTab: React.FC<ValidationsSupervisoryTabProps> = ({
  dossiers,
  activeDossierId,
  onSelectDossier,
  onUpdateDossier,
  onAddAuditEvent,
}) => {
  // 8 ZONAS OPERACIONAIS ESTRUTURADAS
  const [activeZone, setActiveZone] = useState<
    | '01_FILA_SUPERVISORA'
    | '02_CONTEXTO_DOSSIER'
    | '03_EXCECAO_ORIGEM'
    | '04_ACERVO_EVIDENCIAS'
    | '05_PARECERES_ANTERIORES'
    | '06_REVISAO_ARBITRAGEM'
    | '07_DESPACHO_HOMOLOGACAO'
    | '08_AUDITORIA_SILA_CHAIN'
  >('01_FILA_SUPERVISORA');

  // Sessão do Operador Autenticado
  const [currentOperator, setCurrentOperator] = useState<{
    operatorId: string;
    operatorName: string;
    role: SupervisoryOperatorRole;
    terminalId: string;
    jurisdictionProvince: string;
    jurisdictionMunicipality: string;
  }>({
    operatorId: 'SILA-EXC-N3-0012',
    operatorName: 'Dr. Afonso Viana (Supervisor N3)',
    role: 'N3_SUPERVISOR',
    terminalId: 'TERM-EXC-LUA-03',
    jurisdictionProvince: 'LUANDA',
    jurisdictionMunicipality: 'VIANA',
  });

  // Base Local de Revisões e Auditoria de Supervisão
  const [reviews, setReviews] = useState<SupervisoryReview[]>(INITIAL_SUPERVISORY_REVIEWS);
  const [auditLogs, setAuditLogs] = useState<SupervisoryAuditEvent[]>(INITIAL_SUPERVISORY_AUDIT_LOGS);

  // Filtros Operacionais
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterOrigin, setFilterOrigin] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Item Selecionado
  const [selectedReviewId, setSelectedReviewId] = useState<string>('REV-SUP-2026-0041');

  // Modais de Ação Canónica
  const [modalMode, setModalMode] = useState<
    'NONE' | 'ASSIGN' | 'REQUEST_INFO' | 'DESPACHO_TECNICO' | 'HOMOLOGATE' | 'RETURN_SANEAMENTO' | 'CLOSE'
  >('NONE');

  // Formulários de Parecer e Reautenticação IAM
  const [formDespachoType, setFormDespachoType] = useState<SupervisoryDespachoType>('FAVORABLE_OPINION');
  const [formTechnicalGrounds, setFormTechnicalGrounds] = useState('');
  const [formRecommendation, setFormRecommendation] = useState('');
  const [formLegalBasis, setFormLegalBasis] = useState('Decreto Presidencial nº 12/22, Artigos 14º e 21º');
  const [formSupervisorPassword, setFormSupervisorPassword] = useState('');
  const [formTargetOperator, setFormTargetOperator] = useState('SILA-EXC-N3-0012');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. FILTRAGEM & ORDENAÇÃO RIGOROSA: SLA -> SEVERIDADE -> DATA
  const filteredAndSortedReviews = useMemo(() => {
    return reviews
      .filter((rev) => {
        if (filterSeverity !== 'ALL' && rev.severity !== filterSeverity) return false;
        if (filterStatus !== 'ALL' && rev.reviewStatus !== filterStatus) return false;
        if (filterOrigin !== 'ALL' && rev.originatingModule !== filterOrigin) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = rev.reviewId.toLowerCase().includes(q);
          const matchCitizen = rev.citizenName.toLowerCase().includes(q);
          const matchDossier = rev.dossierId.toLowerCase().includes(q);
          const matchReason = rev.reviewReason.toLowerCase().includes(q);
          if (!matchId && !matchCitizen && !matchDossier && !matchReason) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // 1º SLA (Menor tempo primeiro)
        if (a.slaRemainingHours !== b.slaRemainingHours) {
          return a.slaRemainingHours - b.slaRemainingHours;
        }
        // 2º Severidade (CRITICAL > HIGH > MEDIUM > LOW)
        const weight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const weightDiff = (weight[b.severity] || 0) - (weight[a.severity] || 0);
        if (weightDiff !== 0) return weightDiff;
        // 3º Data (Mais recentes primeiro)
        return new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime();
      });
  }, [reviews, filterSeverity, filterStatus, filterOrigin, searchQuery]);

  const selectedReview = useMemo(() => {
    return reviews.find((r) => r.reviewId === selectedReviewId) || reviews[0];
  }, [reviews, selectedReviewId]);

  // ABAC / RBAC DA MESA SUPERVISORA
  const rbacStatus = useMemo(() => {
    const isN1 = currentOperator.role === 'N1_OPERATOR';
    const isN2 = currentOperator.role === 'N2_VALIDATOR';
    const isN3 = currentOperator.role === 'N3_SUPERVISOR' || currentOperator.role === 'DIRECTOR_SILA';

    return {
      canConsult: true,
      canReview: isN2 || isN3,
      canHomologate: isN3,
      canArbitrate: isN3,
      canReturnSaneamento: isN2 || isN3,
      canClose: isN3,
    };
  }, [currentOperator.role]);

  // HELPER: DISPATCH DE COMANDO CANÓNICO SUPERVISOR
  const executeCanonicalSupervisoryCommand = (
    command: SupervisoryCommand,
    targetNewStatus: SupervisoryReviewStatus,
    payloadNote: string,
    additionalUpdates: Partial<SupervisoryReview> = {}
  ) => {
    const timestamp = new Date().toISOString();
    const eventId = `EVT_SUP_${Date.now()}`;
    const prevHash = selectedReview.currentHash;
    const currentHash = `hash_sup_${selectedReview.reviewId}_${command.toLowerCase()}_${Date.now()}`;
    const digitalSignature = `SIG_ED25519_GOV_SUP_${command}_${selectedReview.reviewId}_${Date.now()}`;

    const updatedRecord: SupervisoryReview = {
      ...selectedReview,
      ...additionalUpdates,
      reviewStatus: targetNewStatus,
      previousHash: prevHash,
      currentHash: currentHash,
      digitalSignature: digitalSignature,
    };

    // 1. Atualizar Estado Local
    setReviews((prev) => prev.map((r) => (r.reviewId === selectedReview.reviewId ? updatedRecord : r)));

    // 2. Append-Only no Livro de Auditoria do Módulo 09
    const auditEvt: SupervisoryAuditEvent = {
      eventId,
      reviewId: selectedReview.reviewId,
      dossierId: selectedReview.dossierId,
      timestamp,
      operatorId: currentOperator.operatorId,
      operatorName: currentOperator.operatorName,
      role: currentOperator.role,
      terminalId: currentOperator.terminalId,
      command,
      previousState: selectedReview.reviewStatus,
      newState: targetNewStatus,
      previousHash: prevHash,
      currentHash: currentHash,
      digitalSignature: digitalSignature,
      auditChainRef: selectedReview.auditChainRef,
      payloadSummary: payloadNote,
    };
    setAuditLogs((prev) => [auditEvt, ...prev]);

    // 3. Propagar para Auditoria Global do Dossiê sem mutação dos módulos 02-08
    const globalAuditEvt: ValidationAuditEvent = {
      eventId,
      dossierId: selectedReview.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role as any,
      command: command as any,
      previousState: selectedReview.reviewStatus as any,
      newState: (targetNewStatus === 'HOMOLOGATED' ? 'APPROVED' : targetNewStatus === 'RETURNED_FOR_CORRECTION' ? 'PENDING_DOCS' : 'IN_ANALYSIS') as any,
      reason: `[MÓDULO 09 — MESA SUPERVISORA] ${command}: ${payloadNote}`,
      timestamp,
      previousHash: prevHash,
      currentHash,
      digitalSignature,
      auditChainRef: selectedReview.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Despacho de supervisão emitido por ${currentOperator.operatorName} (${currentOperator.role}).`,
      silaGlobalAuditRef: `SILA_SUP_${Date.now()}`,
    };
    onAddAuditEvent(globalAuditEvt);

    setModalMode('NONE');
    setErrorMessage(null);
    setFormTechnicalGrounds('');
    setFormRecommendation('');
    setFormSupervisorPassword('');
  };

  // VERIFICAR REAUTENTICAÇÃO IAM FORTE
  const verifyIamPassword = (): boolean => {
    if (!formSupervisorPassword.trim()) {
      setErrorMessage('Reautenticação Obrigatória: Introduza a senha institucional IAM de supervisor.');
      return false;
    }
    if (formSupervisorPassword !== '123456' && formSupervisorPassword.length < 4) {
      setErrorMessage('Credencial IAM de supervisão inválida para emissão de assinatura soberana.');
      return false;
    }
    return true;
  };

  // HANDLERS DOS COMANDOS
  const handleAssign = () => {
    if (selectedReview.reviewStatus === 'CLOSED' || selectedReview.reviewStatus === 'HOMOLOGATED') {
      setErrorMessage('Transição Ilegal: Revisão já homologada ou encerrada.');
      return;
    }
    executeCanonicalSupervisoryCommand(
      'ASSIGN_SUPERVISOR',
      'ASSIGNED',
      `Processo de supervisão atribuído formalmente a ${currentOperator.operatorName} (${currentOperator.role}).`,
      {
        assignedSupervisor: {
          operatorId: currentOperator.operatorId,
          operatorName: currentOperator.operatorName,
          role: currentOperator.role,
          assignedAt: new Date().toISOString(),
        },
      }
    );
  };

  const handleOpenAnalysis = () => {
    if (selectedReview.reviewStatus === 'PENDING_REVIEW') {
      setErrorMessage('Transição Ilegal: Requer atribuição prévia (ASSIGNED) antes da abertura de análise.');
      return;
    }
    executeCanonicalSupervisoryCommand(
      'OPEN_REVIEW',
      'UNDER_SUPERVISORY_ANALYSIS',
      `Análise técnica supervisora iniciada nos autos.`
    );
  };

  const handleRequestMoreInfo = () => {
    if (!formTechnicalGrounds.trim() || formTechnicalGrounds.length < 10) {
      setErrorMessage('Fundamentação Mandatória: Especifique os elementos adicionais requeridos (mínimo 10 caracteres).');
      return;
    }
    executeCanonicalSupervisoryCommand(
      'REQUEST_MORE_INFO',
      'REQUEST_ADDITIONAL_INFORMATION',
      `Diligência de informação complementar solicitada: ${formTechnicalGrounds}`
    );
  };

  const handleSubmitTechnicalOpinion = () => {
    if (!rbacStatus.canReview) {
      setErrorMessage('Alçada Insuficiente: Apenas N2 ou N3 podem lavrar parecer técnico supervisor.');
      return;
    }
    if (!formTechnicalGrounds.trim() || formTechnicalGrounds.length < 15) {
      setErrorMessage('Fundamentação Obrigatória: O parecer técnico deve ser circunstanciado (mínimo 15 caracteres).');
      return;
    }
    if (!formRecommendation.trim()) {
      setErrorMessage('Recomendação Obrigatória: Indique a recomendação formal para a mesa de decisão.');
      return;
    }

    executeCanonicalSupervisoryCommand(
      'SUBMIT_TECHNICAL_OPINION',
      'TECHNICAL_OPINION_READY',
      `Parecer técnico emitido sob tipo [${formDespachoType}]. Base: ${formLegalBasis}`,
      {
        supervisoryDespacho: {
          despachoType: formDespachoType,
          technicalGrounds: formTechnicalGrounds,
          recommendation: formRecommendation,
          legalArticleBasis: formLegalBasis,
          reviewedBy: {
            operatorId: currentOperator.operatorId,
            operatorName: currentOperator.operatorName,
            role: currentOperator.role,
            terminalId: currentOperator.terminalId,
          },
          reviewedAt: new Date().toISOString(),
        },
      }
    );
  };

  const handleHomologate = () => {
    if (selectedReview.reviewStatus === 'PENDING_REVIEW') {
      setErrorMessage('Transição Ilegal: Proibido salto direto de PENDING_REVIEW para HOMOLOGATED.');
      return;
    }
    if (!rbacStatus.canHomologate) {
      setErrorMessage('Alçada Insuficiente: A homologação supervisora é restrita ao perfil N3_SUPERVISOR.');
      return;
    }
    if (!verifyIamPassword()) return;

    executeCanonicalSupervisoryCommand(
      'HOMOLOGATE_SUPERVISION',
      'HOMOLOGATED',
      `Homologação de supervisão lavrada. Parecer técnico disponibilizado ao Módulo 07 para decisão vinculativa.`,
      {
        supervisoryDespacho: selectedReview.supervisoryDespacho || {
          despachoType: 'SUPERVISORY_HOMOLOGATION',
          technicalGrounds: 'Homologação supervisora das diligências e conformidades técnicas apresentadas.',
          recommendation: 'Encaminhar ao Módulo 07 para decisão de homologação.',
          legalArticleBasis: 'Artigo 21º do Decreto Regulamentar de Identificação',
          reviewedBy: {
            operatorId: currentOperator.operatorId,
            operatorName: currentOperator.operatorName,
            role: currentOperator.role,
            terminalId: currentOperator.terminalId,
          },
          reviewedAt: new Date().toISOString(),
        },
      }
    );
  };

  const handleReturnSaneamento = () => {
    if (!formTechnicalGrounds.trim() || formTechnicalGrounds.length < 10) {
      setErrorMessage('Motivação Obrigatória: Indique os vícios a serem sanados no Módulo 08.');
      return;
    }
    executeCanonicalSupervisoryCommand(
      'RETURN_TO_SANEAMENTO',
      'RETURNED_FOR_CORRECTION',
      `Dossiê devolvido ao Módulo 08 para saneamento processual: ${formTechnicalGrounds}`
    );
  };

  const handleCloseReview = () => {
    if (selectedReview.reviewStatus !== 'HOMOLOGATED' && selectedReview.reviewStatus !== 'RETURNED_FOR_CORRECTION') {
      setErrorMessage('Transição Ilegal: Somente revisões homologadas ou devolvidas podem ser encerradas na mesa.');
      return;
    }
    if (!rbacStatus.canClose) {
      setErrorMessage('Alçada Insuficiente: O encerramento definitivo da revisão é restrito a N3_SUPERVISOR.');
      return;
    }
    if (!verifyIamPassword()) return;

    executeCanonicalSupervisoryCommand(
      'CLOSE_REVIEW',
      'CLOSED',
      `Processo de revisão supervisora arquivado e concluído na cadeia de custódia.`
    );
  };

  return (
    <div className="space-y-2 font-mono text-[9px]">
      {/* =========================================================================
          CABEÇALHO INSTITUCIONAL & BARRA DE ESTADO SUPERVISOR (MÓDULO 09)
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-2.5 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold tracking-wider">
                  09 — MESA DE REVISÃO SUPERVISORA (NÍVEL N3 / DIRECÇÃO)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/20 text-[7.5px] font-bold">
                  ARBITRAGEM & SUPERVISÃO TÉCNICA
                </span>
              </div>
              <div className="text-neutral-500 text-[7.5px]">
                Revisão de Recursos • Arbitragem de Conflitos • Parecer Técnico Supervisor • SILA Chain Custody
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
                  const role = e.target.value as SupervisoryOperatorRole;
                  setCurrentOperator({
                    ...currentOperator,
                    role,
                    operatorName:
                      role === 'N3_SUPERVISOR'
                        ? 'Dr. Afonso Viana (Supervisor N3)'
                        : role === 'N2_VALIDATOR'
                        ? 'Dra. Luísa Gaspar (Validadora N2)'
                        : 'Téc. Alberto Dinis (Operador N1)',
                  });
                }}
                className="bg-neutral-950 border border-neutral-700 text-purple-400 font-bold text-[7.5px] rounded px-1 py-0.5"
              >
                <option value="N1_OPERATOR">N1_OPERATOR (Apenas Consulta)</option>
                <option value="N2_VALIDATOR">N2_VALIDATOR (Revisão Técnica / Parecer)</option>
                <option value="N3_SUPERVISOR">N3_SUPERVISOR (Homologação / Arbitragem)</option>
              </select>
            </div>

            {/* BOTÕES DE AÇÃO CANÓNICA */}
            <button
              onClick={() => {
                setErrorMessage(null);
                setModalMode('RETURN_SANEAMENTO');
              }}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-neutral-950 font-black uppercase flex items-center gap-1 transition shadow-sm"
            >
              <RotateCcw className="w-3 h-3" />
              <span>DEVOLVER SANEAMENTO</span>
            </button>

            <button
              onClick={() => {
                setErrorMessage(null);
                setModalMode('DESPACHO_TECNICO');
              }}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-black uppercase flex items-center gap-1 transition shadow-sm"
            >
              <FileText className="w-3 h-3" />
              <span>EMITIR PARECER</span>
            </button>

            <button
              onClick={() => {
                setErrorMessage(null);
                setModalMode('HOMOLOGATE');
              }}
              className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-black uppercase flex items-center gap-1 transition shadow-sm"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>HOMOLOGAR SUPERVISÃO</span>
            </button>
          </div>
        </div>

        {/* 8 ZONAS OPERACIONAIS */}
        <div className="flex items-center gap-1 border-b border-neutral-800 pt-1 overflow-x-auto">
          {[
            { id: '01_FILA_SUPERVISORA', label: '01. FILA SUPERVISORA', icon: Filter },
            { id: '02_CONTEXTO_DOSSIER', label: '02. CONTEXTO & REQ.', icon: FolderOpen },
            { id: '03_EXCECAO_ORIGEM', label: '03. EXCEÇÃO & ORIGEM', icon: AlertTriangle },
            { id: '04_ACERVO_EVIDENCIAS', label: '04. ACERVO PROBATÓRIO', icon: Paperclip },
            { id: '05_PARECERES_ANTERIORES', label: '05. PARECERES ANTERIORES', icon: History },
            { id: '06_REVISAO_ARBITRAGEM', label: '06. REVISÃO / ARBITRAGEM', icon: Scale },
            { id: '07_DESPACHO_HOMOLOGACAO', label: '07. DESPACHO & HOMOLOGAÇÃO', icon: FileCheck },
            { id: '08_AUDITORIA_SILA_CHAIN', label: '08. AUDITORIA SILA CHAIN', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeZone === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveZone(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 border-t border-x transition shrink-0 ${
                  isActive
                    ? 'bg-neutral-900 border-neutral-700 text-purple-400 border-b-neutral-900'
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
          ZONA 01: FILA SUPERVISORA COM ORDENAÇÃO RIGOROSA (SLA -> SEVERIDADE -> DATA)
         ========================================================================= */}
      {activeZone === '01_FILA_SUPERVISORA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          {/* BARRA DE FILTROS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 bg-neutral-950 rounded-lg border border-neutral-800">
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
              </select>
            </div>

            <div>
              <label className="text-neutral-500 block text-[7px]">STATUS:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1 text-white"
              >
                <option value="ALL">Todos Status</option>
                <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="UNDER_SUPERVISORY_ANALYSIS">UNDER_SUPERVISORY_ANALYSIS</option>
                <option value="REQUEST_ADDITIONAL_INFORMATION">REQUEST_ADDITIONAL_INFORMATION</option>
                <option value="TECHNICAL_OPINION_READY">TECHNICAL_OPINION_READY</option>
                <option value="HOMOLOGATED">HOMOLOGATED</option>
                <option value="RETURNED_FOR_CORRECTION">RETURNED_FOR_CORRECTION</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-500 block text-[7px]">ORIGEM (02-08):</label>
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

          {/* TABELA DENSA DE REVISÕES */}
          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-left border-collapse text-[8px]">
              <thead className="bg-neutral-950 text-neutral-400 font-bold border-b border-neutral-800 uppercase">
                <tr>
                  <th className="p-2">ID REVISÃO</th>
                  <th className="p-2">ORIGEM</th>
                  <th className="p-2">CIDADÃO / DOSSIÊ</th>
                  <th className="p-2">MOTIVO DO ESCALONAMENTO</th>
                  <th className="p-2">SEVERIDADE</th>
                  <th className="p-2">SLA SUPERVISÃO</th>
                  <th className="p-2">STATUS</th>
                  <th className="p-2">SUPERVISOR</th>
                  <th className="p-2 text-right">AÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredAndSortedReviews.map((rev) => {
                  const isSelected = rev.reviewId === selectedReview.reviewId;
                  return (
                    <tr
                      key={rev.reviewId}
                      onClick={() => setSelectedReviewId(rev.reviewId)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-purple-950/25 text-white font-bold'
                          : 'bg-[#0b0d11] hover:bg-neutral-900/50 text-neutral-300'
                      }`}
                    >
                      <td className="p-2 font-mono text-purple-400 font-bold">{rev.reviewId}</td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[7px]">
                          {rev.originatingModule}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="font-bold text-white">{rev.citizenName}</div>
                        <div className="text-neutral-500 text-[7px]">{rev.dossierId}</div>
                      </td>
                      <td className="p-2 max-w-[220px] truncate" title={rev.reviewReason}>
                        {rev.reviewReason}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold text-[7px] ${
                            rev.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          }`}
                        >
                          {rev.severity}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-neutral-500" />
                          <span
                            className={
                              rev.slaStatus === 'WARNING'
                                ? 'text-amber-400 font-bold'
                                : 'text-emerald-400'
                            }
                          >
                            {rev.slaRemainingHours}h restantes
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[7px] font-bold ${
                            rev.reviewStatus === 'HOMOLOGATED'
                              ? 'bg-purple-500/20 text-purple-300'
                              : rev.reviewStatus === 'RETURNED_FOR_CORRECTION'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {rev.reviewStatus}
                        </span>
                      </td>
                      <td className="p-2 text-neutral-400">
                        {rev.assignedSupervisor ? rev.assignedSupervisor.operatorName : <span className="text-neutral-600">Não atribuído</span>}
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReviewId(rev.reviewId);
                            setActiveZone('06_REVISAO_ARBITRAGEM');
                          }}
                          className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[7.5px]"
                        >
                          EXAMINAR
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
      {activeZone === '02_CONTEXTO_DOSSIER' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
              CONTEXTO DO PROCESSO SOB REVISÃO SUPERVISORA
            </span>
            <span className="text-neutral-500 text-[7.5px]">Dossiê: {selectedReview.dossierId}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">CIDADÃO / TITULAR:</div>
              <div className="text-white font-bold text-[9px]">{selectedReview.citizenName}</div>
              <div className="text-neutral-400 text-[7.5px]">ID Cidadão: {selectedReview.citizenId}</div>
            </div>

            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">PROCESSO & ESCALONAMENTO:</div>
              <div className="text-purple-400 font-bold text-[9px]">{selectedReview.processId}</div>
              <div className="text-neutral-400 text-[7.5px]">Nível: {selectedReview.escalationLevel}</div>
            </div>

            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">JURISDIÇÃO TERRITORIAL (ABAC):</div>
              <div className="text-cyan-400 font-bold text-[9px]">{selectedReview.jurisdictionProvince} — {selectedReview.jurisdictionMunicipality}</div>
              <div className="text-neutral-400 text-[7.5px]">Abertura: {new Date(selectedReview.openedAt).toLocaleString('pt-AO')}</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 03: EXCEÇÃO & ORIGEM (MÓDULOS 02 A 08)
         ========================================================================= */}
      {activeZone === '03_EXCECAO_ORIGEM' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
              EXCEÇÃO ESCALADA • ORIGEM CANÓNICA: {selectedReview.originatingModule}
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[7.5px]">
              SEVERIDADE: {selectedReview.severity}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
            <div className="font-bold text-white text-[9px]">MOTIVO DO ESCALONAMENTO SUPERVISOR:</div>
            <div className="text-neutral-300 text-[8px] leading-relaxed">{selectedReview.reviewReason}</div>
            {selectedReview.exceptionId && (
              <div className="text-amber-400 text-[7.5px]">
                Referência Exceção Módulo 08: <strong>{selectedReview.exceptionId}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 04: ACERVO PROBATÓRIO (EVIDÊNCIAS CONSULTADAS)
         ========================================================================= */}
      {activeZone === '04_ACERVO_EVIDENCIAS' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-purple-400" />
              ACERVO PROBATÓRIO E LAUDOS PERICIAIS ASSOCIADOS
            </span>
            <span className="text-neutral-500 text-[7.5px]">Total de Peças: {selectedReview.evidencesSummary.length}</span>
          </div>

          <div className="space-y-1.5">
            {selectedReview.evidencesSummary.map((ev, idx) => (
              <div key={idx} className="p-2 bg-neutral-950 rounded border border-neutral-800 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-neutral-300 text-[8px]">{ev}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 05: PARECERES ANTERIORES & HISTÓRICO
         ========================================================================= */}
      {activeZone === '05_PARECERES_ANTERIORES' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-purple-400" />
              PARECERES TÉCNICOS ANTERIORES (MESA N1 / N2)
            </span>
            <span className="text-neutral-500 text-[7.5px]">Total: {selectedReview.previousOpinions.length}</span>
          </div>

          <div className="space-y-2">
            {selectedReview.previousOpinions.map((opn) => (
              <div key={opn.opinionId} className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{opn.issuedByOperatorName} ({opn.role})</span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold text-[7px] ${
                      opn.recommendation === 'FAVORABLE'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : opn.recommendation === 'UNFAVORABLE'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {opn.recommendation}
                  </span>
                </div>
                <div className="text-neutral-300 text-[8px]">{opn.opinionSummary}</div>
                <div className="text-neutral-500 text-[7px]">{new Date(opn.timestamp).toLocaleString('pt-AO')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 06: REVISÃO TÉCNICA & ARBITRAGEM
         ========================================================================= */}
      {activeZone === '06_REVISAO_ARBITRAGEM' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-purple-400" />
              MESA DE REVISÃO TÉCNICA E ARBITRAGEM SUPERVISORA
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[7.5px]">
              ESTADO: {selectedReview.reviewStatus}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
            <div className="text-neutral-300 text-[8px]">
              A apreciação nesta mesa realiza a conciliação técnica entre evidências, certidões e pareceres de N1/N2, produzindo parecer orientador para a homologação do Módulo 07 sem substituição da soberania decisória.
            </div>

            {/* BOTÕES DE COMANDO DIRETO */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-900">
              {selectedReview.reviewStatus === 'PENDING_REVIEW' && (
                <button
                  onClick={handleAssign}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>ATRIBUIR A MIM (ASSIGN)</span>
                </button>
              )}

              {selectedReview.reviewStatus === 'ASSIGNED' && (
                <button
                  onClick={handleOpenAnalysis}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>ABRIR ANÁLISE (OPEN_REVIEW)</span>
                </button>
              )}

              <button
                onClick={() => setModalMode('REQUEST_INFO')}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>SOLICITAR DILIGÊNCIA ADICIONAL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 07: DESPACHO & HOMOLOGAÇÃO
         ========================================================================= */}
      {activeZone === '07_DESPACHO_HOMOLOGACAO' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-purple-400" />
              DESPACHO TÉCNICO & HOMOLOGAÇÃO SUPERVISORA
            </span>
            <span className="text-neutral-500 text-[7.5px]">Disponibilização para Módulo 07</span>
          </div>

          {selectedReview.supervisoryDespacho ? (
            <div className="p-3 bg-neutral-950 rounded-lg border border-purple-500/30 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border-b border-neutral-800 pb-2">
                <div>
                  <span className="text-neutral-500 text-[7px] block">TIPO DE DESPACHO:</span>
                  <span className="text-purple-400 font-bold text-[8.5px]">{selectedReview.supervisoryDespacho.despachoType}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[7px] block">SUPERVISOR RELATOR:</span>
                  <span className="text-white font-bold text-[8.5px]">
                    {selectedReview.supervisoryDespacho.reviewedBy.operatorName} ({selectedReview.supervisoryDespacho.reviewedBy.role})
                  </span>
                </div>
              </div>
              <div>
                <span className="text-neutral-500 text-[7px] block">FUNDAMENTAÇÃO TÉCNICA:</span>
                <p className="text-neutral-200 text-[8px] leading-relaxed">{selectedReview.supervisoryDespacho.technicalGrounds}</p>
              </div>
              <div>
                <span className="text-neutral-500 text-[7px] block">RECOMENDAÇÃO FORMAL:</span>
                <p className="text-emerald-400 text-[8px] font-bold">{selectedReview.supervisoryDespacho.recommendation}</p>
              </div>
              <div className="flex justify-between text-neutral-500 text-[7px] pt-1 border-t border-neutral-900">
                <span>Base Legal: {selectedReview.supervisoryDespacho.legalArticleBasis}</span>
                <span>Data: {new Date(selectedReview.supervisoryDespacho.reviewedAt).toLocaleString('pt-AO')}</span>
              </div>

              {selectedReview.reviewStatus === 'HOMOLOGATED' && rbacStatus.canClose && (
                <div className="pt-2 border-t border-neutral-800 flex justify-end">
                  <button
                    onClick={() => setModalMode('CLOSE')}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>ENCERRAR REVISÃO (CLOSE)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center bg-neutral-950 rounded border border-neutral-800 text-neutral-500">
              Nenhum despacho técnico ou homologação lavrada até o momento.
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ZONA 08: AUDITORIA SILA CHAIN (APPEND-ONLY)
         ========================================================================= */}
      {activeZone === '08_AUDITORIA_SILA_CHAIN' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              LIVRO-MESTRE DE AUDITORIA CRIPTOGRÁFICA (SILA CHAIN SUPERVISORY LEDGER)
            </span>
            <span className="text-neutral-500 text-[7.5px]">Total Registos: {auditLogs.length}</span>
          </div>

          <div className="space-y-1.5">
            {auditLogs.map((log) => (
              <div key={log.eventId} className="p-2.5 bg-neutral-950 rounded border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-purple-400 font-bold">{log.eventId}</span>
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
                  <span>SUPERVISOR: {log.operatorName} ({log.role})</span>
                  <span>CURR_HASH: {log.currentHash.substring(0, 30)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAIS OPERACIONAIS CANÓNICOS DO MÓDULO 09
         ========================================================================= */}

      {/* MODAL: EMITIR PARECER TÉCNICO */}
      {modalMode === 'DESPACHO_TECNICO' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-lg w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-purple-400 font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> EMISSÃO DE PARECER TÉCNICO SUPERVISOR
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">TIPO DE DESPACHO TÉCNICO:</label>
                <select
                  value={formDespachoType}
                  onChange={(e) => setFormDespachoType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-bold"
                >
                  <option value="FAVORABLE_OPINION">FAVORABLE_OPINION — Parecer Favorável com Recomendações</option>
                  <option value="UNFAVORABLE_OPINION">UNFAVORABLE_OPINION — Parecer Desfavorável por Vício Insanável</option>
                  <option value="ADDITIONAL_INFORMATION_REQUIRED">ADDITIONAL_INFORMATION_REQUIRED — Diligência Complementar</option>
                  <option value="RETURN_FOR_CORRECTION">RETURN_FOR_CORRECTION — Devolução para Saneamento</option>
                  <option value="SUPERVISORY_HOMOLOGATION">SUPERVISORY_HOMOLOGATION — Homologação Prévia</option>
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
                <label className="text-neutral-400 block mb-1">FUNDAMENTAÇÃO TÉCNICA CIRCUNSTANCIADA:</label>
                <textarea
                  value={formTechnicalGrounds}
                  onChange={(e) => setFormTechnicalGrounds(e.target.value)}
                  placeholder="Enquadramento fáctico, análise de evidências e razões do parecer..."
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">RECOMENDAÇÃO FORMAL PARA A MESA DE DECISÃO (07):</label>
                <input
                  type="text"
                  value={formRecommendation}
                  onChange={(e) => setFormRecommendation(e.target.value)}
                  placeholder="Ex: Recomenda-se homologação com averbação da certidão narrativa nº 441/2026."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleSubmitTechnicalOpinion} className="px-3 py-1.5 rounded bg-purple-600 text-white font-black">LAVRAR PARECER</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HOMOLOGAÇÃO COM REAUTENTICAÇÃO FORTE */}
      {modalMode === 'HOMOLOGATE' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-md w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-purple-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> HOMOLOGAÇÃO SUPERVISORA
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div className="text-neutral-300">
              Confirma a emissão da homologação de supervisão para o processo <strong className="text-purple-400">{selectedReview.reviewId}</strong>?
            </div>
            <div>
              <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-purple-400" />
                <span>SENHA IAM SUPERVISOR (ASSINATURA SOBERANA):</span>
              </label>
              <input
                type="password"
                value={formSupervisorPassword}
                onChange={(e) => setFormSupervisorPassword(e.target.value)}
                placeholder="Senha de supervisor N3..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleHomologate} className="px-3 py-1.5 rounded bg-purple-600 text-white font-black">HOMOLOGAR SUPERVISÃO</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DEVOLUÇÃO PARA SANEAMENTO */}
      {modalMode === 'RETURN_SANEAMENTO' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-md w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> DEVOLUÇÃO PARA SANEAMENTO (MÓDULO 08)
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div>
              <label className="text-neutral-400 block mb-1">MOTIVAÇÃO DA DEVOLUÇÃO E VÍCIOS IDENTIFICADOS:</label>
              <textarea
                value={formTechnicalGrounds}
                onChange={(e) => setFormTechnicalGrounds(e.target.value)}
                placeholder="Indique os pontos que necessitam de novas contraprovas no Módulo 08..."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleReturnSaneamento} className="px-3 py-1.5 rounded bg-amber-600 text-neutral-950 font-black">DEVOLVER AO 08</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SOLICITAR INFORMAÇÕES ADICIONAIS */}
      {modalMode === 'REQUEST_INFO' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-md w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-blue-400 font-bold flex items-center gap-1.5">
                <Send className="w-4 h-4" /> SOLICITAÇÃO DE DILIGÊNCIA COMPLEMENTAR
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div>
              <label className="text-neutral-400 block mb-1">DILIGÊNCIA OU DOCUMENTO ADICIONAL REQUERIDO:</label>
              <textarea
                value={formTechnicalGrounds}
                onChange={(e) => setFormTechnicalGrounds(e.target.value)}
                placeholder="Descreva as informações complementares necessárias..."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleRequestMoreInfo} className="px-3 py-1.5 rounded bg-blue-600 text-white font-black">SOLICITAR DILIGÊNCIA</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENCERRAMENTO (CLOSE) */}
      {modalMode === 'CLOSE' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-md w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-purple-400 font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> ENCERRAMENTO DEFINITIVO DA REVISÃO
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div className="text-neutral-300">
              Confirma o arquivamento definitivo da revisão <strong className="text-purple-400">{selectedReview.reviewId}</strong>?
            </div>
            <div>
              <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-purple-400" />
                <span>SENHA IAM SUPERVISOR:</span>
              </label>
              <input
                type="password"
                value={formSupervisorPassword}
                onChange={(e) => setFormSupervisorPassword(e.target.value)}
                placeholder="Senha de supervisor N3..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleCloseReview} className="px-3 py-1.5 rounded bg-purple-600 text-white font-black">ENCERRAR DEFINITIVAMENTE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
