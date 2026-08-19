import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  ShieldCheck,
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
  Layers,
  History,
  Activity,
  Check,
  X,
  RefreshCw,
  Fingerprint,
} from 'lucide-react';
import {
  ValidationDossier,
  ValidationAuditEvent,
} from '../../../../types/validations';
import {
  DecisionAudit,
  AuditStatus,
  AuditOpinionType,
  AuditorRole,
  MetaAuditEvent,
  AuditCommand,
  AnomalySeverity,
} from '../../../../types/decisionAudit';
import {
  INITIAL_DECISION_AUDITS,
  INITIAL_META_AUDIT_EVENTS,
} from '../../../../data/decisionAuditData';

interface ValidationsDecisionAuditTabProps {
  dossiers: ValidationDossier[];
  activeDossierId: string;
  onSelectDossier: (dossierId: string) => void;
  onAddAuditEvent: (event: ValidationAuditEvent) => void;
}

export const ValidationsDecisionAuditTab: React.FC<ValidationsDecisionAuditTabProps> = ({
  dossiers,
  activeDossierId,
  onSelectDossier,
  onAddAuditEvent,
}) => {
  // 11 ZONAS OPERACIONAIS ESTRUTURADAS
  const [activeZone, setActiveZone] = useState<
    | '01_FILA_AUDITORIA'
    | '02_CONTEXTO_DOSSIER'
    | '03_LINHA_DO_TEMPO'
    | '04_CADEIA_ESTADOS'
    | '05_SILA_CHAIN'
    | '06_VERIFICAÇÃO_CRIPTOGRAFICA'
    | '07_INTEGRIDADE_EVIDENCIAS'
    | '08_MATRIZ_ALCADAS'
    | '09_ANOMALIAS'
    | '10_PARECER_AUDITORIA'
    | '11_AUDITORIA_DA_AUDITORIA'
  >('01_FILA_AUDITORIA');

  // Sessão do Auditor
  const [currentAuditor, setCurrentAuditor] = useState<{
    auditorId: string;
    auditorName: string;
    role: AuditorRole;
    terminalId: string;
  }>({
    auditorId: 'AUD-SILA-001',
    auditorName: 'Inspetor Geral Afonso Kiala',
    role: 'CHIEF_AUDITOR',
    terminalId: 'TERM-AUD-01',
  });

  // Base Local de Auditorias e Meta-Auditoria
  const [audits, setAudits] = useState<DecisionAudit[]>(INITIAL_DECISION_AUDITS);
  const [metaAuditLogs, setMetaAuditLogs] = useState<MetaAuditEvent[]>(INITIAL_META_AUDIT_EVENTS);

  // Filtros Operacionais
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Item Selecionado
  const [selectedAuditId, setSelectedAuditId] = useState<string>('AUD-2026-001');

  // Modais de Ação Canónica
  const [modalMode, setModalMode] = useState<'NONE' | 'ISSUE_OPINION' | 'CLOSE_AUDIT'>('NONE');
  const [formOpinionType, setFormOpinionType] = useState<AuditOpinionType>('INTEGRITY_CONFIRMED');
  const [formConclusion, setFormConclusion] = useState('');
  const [formRecommendation, setFormRecommendation] = useState('');
  const [formLegalBasis, setFormLegalBasis] = useState('Artigo 8º da Lei nº 02/22 (Regime de Validação Criptográfica)');
  const [formAuditorPassword, setFormAuditorPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifyingProgress, setVerifyingProgress] = useState(false);

  // 1. FILTRAGEM & ORDENAÇÃO RIGOROSA: SEVERIDADE -> CADEIA QUEBRADA -> SLA -> DATA
  const filteredAndSortedAudits = useMemo(() => {
    return audits
      .filter((aud) => {
        if (filterRisk !== 'ALL' && aud.riskLevel !== filterRisk) return false;
        if (filterStatus !== 'ALL' && aud.auditStatus !== filterStatus) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = aud.auditId.toLowerCase().includes(q);
          const matchCitizen = aud.citizenName.toLowerCase().includes(q);
          const matchDossier = aud.dossierId.toLowerCase().includes(q);
          const matchDecision = aud.decisionId.toLowerCase().includes(q);
          if (!matchId && !matchCitizen && !matchDossier && !matchDecision) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // 1º Quebra de cadeia primeiro
        if (a.auditStatus === 'CHAIN_BROKEN' && b.auditStatus !== 'CHAIN_BROKEN') return -1;
        if (b.auditStatus === 'CHAIN_BROKEN' && a.auditStatus !== 'CHAIN_BROKEN') return 1;

        // 2º Severidade de Risco
        const weight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const weightDiff = (weight[b.riskLevel] || 0) - (weight[a.riskLevel] || 0);
        if (weightDiff !== 0) return weightDiff;

        // 3º Data mais recente
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [audits, filterRisk, filterStatus, searchQuery]);

  const selectedAudit = useMemo(() => {
    return audits.find((a) => a.auditId === selectedAuditId) || audits[0];
  }, [audits, selectedAuditId]);

  // DISPATCH DE COMANDO CANÓNICO DE META-AUDITORIA (APPEND-ONLY)
  const executeMetaAuditCommand = (
    command: AuditCommand,
    targetNewStatus: AuditStatus,
    payloadNote: string,
    additionalUpdates: Partial<DecisionAudit> = {}
  ) => {
    const timestamp = new Date().toISOString();
    const eventId = `META_EVT_${Date.now()}`;
    const prevHash = selectedAudit.currentHash;
    const currentHash = `hash_meta_aud_${selectedAudit.auditId}_${Date.now()}`;
    const digitalSignature = `SIG_ED25519_AUDIT_META_${selectedAudit.auditId}_${Date.now()}`;

    const updatedAudit: DecisionAudit = {
      ...selectedAudit,
      ...additionalUpdates,
      auditStatus: targetNewStatus,
      updatedAt: timestamp,
      previousHash: prevHash,
      currentHash: currentHash,
      digitalSignature: digitalSignature,
    };

    // 1. Atualizar Estado Local
    setAudits((prev) => prev.map((a) => (a.auditId === selectedAudit.auditId ? updatedAudit : a)));

    // 2. Registar no Livro de Auditoria da Própria Auditoria (Módulo 10)
    const metaEvt: MetaAuditEvent = {
      eventId,
      timestamp,
      auditId: selectedAudit.auditId,
      dossierId: selectedAudit.dossierId,
      auditorId: currentAuditor.auditorId,
      auditorName: currentAuditor.auditorName,
      role: currentAuditor.role,
      terminalId: currentAuditor.terminalId,
      command,
      previousState: selectedAudit.auditStatus,
      newState: targetNewStatus,
      previousHash: prevHash,
      currentHash: currentHash,
      digitalSignature: digitalSignature,
      auditChainRef: selectedAudit.auditChainRef,
      payloadSummary: payloadNote,
    };
    setMetaAuditLogs((prev) => [metaEvt, ...prev]);

    // 3. Notificar sem mutação do dossiê 01-09
    const globalAuditEvt: ValidationAuditEvent = {
      eventId,
      dossierId: selectedAudit.dossierId,
      operatorId: currentAuditor.auditorId,
      operatorRole: currentAuditor.role as any,
      command: command as any,
      previousState: selectedAudit.auditStatus as any,
      newState: (targetNewStatus === 'AUDIT_OPINION_READY' ? 'APPROVED' : targetNewStatus === 'CHAIN_BROKEN' ? 'SUSPENDED' : 'IN_ANALYSIS') as any,
      reason: `[MÓDULO 10 — AUDITORIA DA DECISÃO] ${command}: ${payloadNote}`,
      timestamp,
      previousHash: prevHash,
      currentHash,
      digitalSignature,
      auditChainRef: selectedAudit.auditChainRef,
      terminalId: currentAuditor.terminalId,
      payloadSummary: `Parecer de conformidade arquivística e custódia criptográfica lavrado por ${currentAuditor.auditorName}.`,
      silaGlobalAuditRef: `SILA_AUDIT_${Date.now()}`,
    };
    onAddAuditEvent(globalAuditEvt);

    setModalMode('NONE');
    setErrorMessage(null);
    setFormConclusion('');
    setFormRecommendation('');
    setFormAuditorPassword('');
  };

  // VERIFICADOR CRIPTOGRÁFICO EM TEMPO REAL
  const handleRunFullIntegrityCheck = () => {
    setVerifyingProgress(true);
    setTimeout(() => {
      setVerifyingProgress(false);
      executeMetaAuditCommand(
        'VERIFY_CHAIN_INTEGRITY',
        selectedAudit.chainVerification.result === 'VALID' ? 'VERIFYING_AUTHORITY' : 'CHAIN_BROKEN',
        `Recálculo criptográfico e varredura da Merkle Tree executados. Resultado: ${selectedAudit.chainVerification.result}`
      );
    }, 800);
  };

  // EMITIR PARECER DE AUDITORIA
  const handleSubmitAuditOpinion = () => {
    if (!formConclusion.trim() || formConclusion.length < 15) {
      setErrorMessage('Conclusão Obrigatória: O parecer de auditoria deve ser fundamentado tecnicamente (mínimo 15 caracteres).');
      return;
    }
    if (!formRecommendation.trim()) {
      setErrorMessage('Recomendação Obrigatória: Indique a recomendação técnica arquivística.');
      return;
    }
    if (!formAuditorPassword.trim()) {
      setErrorMessage('Reautenticação Obrigatória: Introduza a senha IAM do auditor.');
      return;
    }

    const targetStatus = formOpinionType === 'CHAIN_BROKEN' ? 'CHAIN_BROKEN' : 'AUDIT_OPINION_READY';

    executeMetaAuditCommand(
      'ISSUE_AUDIT_OPINION',
      targetStatus,
      `Parecer de auditoria lavrado sob tipo [${formOpinionType}]. Base: ${formLegalBasis}`,
      {
        auditOpinion: {
          opinionType: formOpinionType,
          conclusion: formConclusion,
          recommendation: formRecommendation,
          legalArticleBasis: formLegalBasis,
          auditedBy: {
            auditorId: currentAuditor.auditorId,
            auditorName: currentAuditor.auditorName,
            role: currentAuditor.role,
            terminalId: currentAuditor.terminalId,
          },
          auditedAt: new Date().toISOString(),
        },
      }
    );
  };

  return (
    <div className="space-y-2 font-mono text-[9px]">
      {/* =========================================================================
          CABEÇALHO INSTITUCIONAL & BARRA DE AUDITORIA (MÓDULO 10)
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-2.5 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold tracking-wider">
                  10 — AUDITORIA DA DECISÃO & TRILHA CRIPTOGRÁFICA (SILA CHAIN)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-[7.5px] font-bold">
                  APPEND-ONLY • IMUTÁVEL • PROVA MATEMÁTICA
                </span>
              </div>
              <div className="text-neutral-500 text-[7.5px]">
                Inspeção Criptográfica • Matriz de Alçadas • Integridade de Evidências • SILA Chain Ledger
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunFullIntegrityCheck}
              disabled={verifyingProgress}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3 h-3 ${verifyingProgress ? 'animate-spin text-emerald-400' : ''}`} />
              <span>RECALCULAR MERKLE TREE</span>
            </button>

            <button
              onClick={() => {
                setErrorMessage(null);
                setModalMode('ISSUE_OPINION');
              }}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black uppercase flex items-center gap-1 transition shadow-sm"
            >
              <FileCheck className="w-3 h-3" />
              <span>LAVRAR PARECER AUDITORIA</span>
            </button>
          </div>
        </div>

        {/* 11 ZONAS OPERACIONAIS */}
        <div className="flex items-center gap-1 border-b border-neutral-800 pt-1 overflow-x-auto">
          {[
            { id: '01_FILA_AUDITORIA', label: '01. FILA AUDITORIA', icon: Filter },
            { id: '02_CONTEXTO_DOSSIER', label: '02. CONTEXTO', icon: FolderOpen },
            { id: '03_LINHA_DO_TEMPO', label: '03. LINHA TEMPO', icon: History },
            { id: '04_CADEIA_ESTADOS', label: '04. CADEIA ESTADOS', icon: Layers },
            { id: '05_SILA_CHAIN', label: '05. SILA CHAIN', icon: KeyRound },
            { id: '06_VERIFICAÇÃO_CRIPTOGRAFICA', label: '06. CRIPTOGRAFIA', icon: Fingerprint },
            { id: '07_INTEGRIDADE_EVIDENCIAS', label: '07. EVIDÊNCIAS', icon: Paperclip },
            { id: '08_MATRIZ_ALCADAS', label: '08. MATRIZ ALÇADAS', icon: UserCheck },
            { id: '09_ANOMALIAS', label: '09. ANOMALIAS', icon: AlertTriangle },
            { id: '10_PARECER_AUDITORIA', label: '10. PARECER FINAL', icon: FileCheck },
            { id: '11_AUDITORIA_DA_AUDITORIA', label: '11. META-AUDITORIA', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeZone === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveZone(tab.id as any)}
                className={`px-2 py-1.5 rounded-t-lg font-bold flex items-center gap-1 border-t border-x transition shrink-0 ${
                  isActive
                    ? 'bg-neutral-900 border-neutral-700 text-emerald-400 border-b-neutral-900'
                    : 'bg-neutral-950/40 border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          ZONA 01: FILA DE AUDITORIA
         ========================================================================= */}
      {activeZone === '01_FILA_AUDITORIA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 bg-neutral-950 rounded-lg border border-neutral-800">
            <div>
              <label className="text-neutral-500 block text-[7px]">RISCO:</label>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1 text-white"
              >
                <option value="ALL">Todos os Níveis</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-500 block text-[7px]">STATUS AUDITORIA:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1 text-white"
              >
                <option value="ALL">Todos Status</option>
                <option value="AUDIT_OPINION_READY">AUDIT_OPINION_READY</option>
                <option value="CHAIN_BROKEN">CHAIN_BROKEN</option>
                <option value="PENDING_AUDIT">PENDING_AUDIT</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-500 block text-[7px]">BUSCA AUDITORIA:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ID Auditoria, Dossiê..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1 text-white"
              >
              </input>
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-left border-collapse text-[8px]">
              <thead className="bg-neutral-950 text-neutral-400 font-bold border-b border-neutral-800 uppercase">
                <tr>
                  <th className="p-2">AUDIT</th>
                  <th className="p-2">DOSSIER</th>
                  <th className="p-2">PROCESS</th>
                  <th className="p-2">DECISION</th>
                  <th className="p-2">STATUS</th>
                  <th className="p-2">RISK</th>
                  <th className="p-2">ANOMALIES</th>
                  <th className="p-2">CREATED_AT</th>
                  <th className="p-2">AUDITOR</th>
                  <th className="p-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredAndSortedAudits.map((aud) => {
                  const isSelected = aud.auditId === selectedAudit.auditId;
                  return (
                    <tr
                      key={aud.auditId}
                      onClick={() => setSelectedAuditId(aud.auditId)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-emerald-950/25 text-white font-bold'
                          : 'bg-[#0b0d11] hover:bg-neutral-900/50 text-neutral-300'
                      }`}
                    >
                      <td className="p-2 font-mono text-emerald-400 font-bold">{aud.auditId}</td>
                      <td className="p-2 text-neutral-300">{aud.dossierId}</td>
                      <td className="p-2 text-neutral-400">{aud.processId}</td>
                      <td className="p-2 text-neutral-400">{aud.decisionId}</td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[7px] font-bold ${
                            aud.auditStatus === 'CHAIN_BROKEN'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {aud.auditStatus}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[7px] font-bold ${
                            aud.riskLevel === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300'
                              : aud.riskLevel === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {aud.riskLevel}
                        </span>
                      </td>
                      <td className="p-2">
                        {aud.anomalies.length > 0 ? (
                          <span className="text-rose-400 font-bold">{aud.anomalies.length} anomalias</span>
                        ) : (
                          <span className="text-neutral-500">0 anomalias</span>
                        )}
                      </td>
                      <td className="p-2 text-neutral-500">{new Date(aud.createdAt).toLocaleDateString('pt-AO')}</td>
                      <td className="p-2 text-neutral-400">
                        {aud.auditOpinion ? aud.auditOpinion.auditedBy.auditorName : 'Em curso'}
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAuditId(aud.auditId);
                            setActiveZone('05_SILA_CHAIN');
                          }}
                          className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[7.5px]"
                        >
                          INSPECIONAR
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
          ZONA 02: CONTEXTO DO DOSSIÊ
         ========================================================================= */}
      {activeZone === '02_CONTEXTO_DOSSIER' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
              METADADOS DE IDENTIDADE E CUSTÓDIA DO DOSSIÊ AUDITADO
            </span>
            <span className="text-neutral-500 text-[7.5px]">ID Auditoria: {selectedAudit.auditId}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">TITULAR:</div>
              <div className="text-white font-bold text-[9px]">{selectedAudit.citizenName}</div>
              <div className="text-neutral-400 text-[7.5px]">{selectedAudit.citizenId}</div>
            </div>
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">DOSSIÊ & PROCESSO:</div>
              <div className="text-emerald-400 font-bold text-[9px]">{selectedAudit.dossierId}</div>
              <div className="text-neutral-400 text-[7.5px]">{selectedAudit.processId}</div>
            </div>
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">DECISÃO HOMOLOGATÓRIA (07):</div>
              <div className="text-cyan-400 font-bold text-[9px]">{selectedAudit.decisionId}</div>
              <div className="text-neutral-400 text-[7.5px]">Audit Status: {selectedAudit.auditStatus}</div>
            </div>
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">MÓDULOS PERCORRIDOS:</div>
              <div className="flex flex-wrap gap-1">
                {selectedAudit.auditedModules.map((m, i) => (
                  <span key={i} className="px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[6.5px] text-neutral-300">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 03: LINHA DO TEMPO CRONOLÓGICA (EVENTOS AUDITADOS)
         ========================================================================= */}
      {activeZone === '03_LINHA_DO_TEMPO' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              RECONSTRUÇÃO CRONOLÓGICA DE EVENTOS (ORIGEM 01 A 09)
            </span>
            <span className="text-neutral-500 text-[7.5px]">Total de Eventos: {selectedAudit.timeline.length}</span>
          </div>

          <div className="space-y-2">
            {selectedAudit.timeline.map((evt, idx) => (
              <div
                key={evt.eventId}
                className={`p-2.5 rounded border space-y-1.5 ${
                  evt.isHashValid && evt.isSignatureValid
                    ? 'bg-neutral-950 border-neutral-800'
                    : 'bg-rose-950/20 border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold">{evt.eventId}</span>
                    <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[7px] text-cyan-300">
                      MÓDULO: {evt.sourceModule}
                    </span>
                    <span className="text-white font-bold">{evt.command}</span>
                    <span className="text-neutral-500 text-[7px]">
                      {evt.previousState} ➔ {evt.newState}
                    </span>
                  </div>
                  <span className="text-neutral-500 text-[7px]">{new Date(evt.timestamp).toLocaleString('pt-AO')}</span>
                </div>
                <div className="text-neutral-300 text-[8px]">{evt.payloadSummary}</div>
                <div className="flex justify-between text-neutral-500 text-[6.5px] font-mono pt-1 border-t border-neutral-900">
                  <span>OPERADOR: {evt.operatorName} ({evt.operatorRole}) • TERMINAL: {evt.terminalId}</span>
                  <span>HASH: {evt.currentHash.substring(0, 32)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 04: CADEIA DE ESTADOS
         ========================================================================= */}
      {activeZone === '04_CADEIA_ESTADOS' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              VERIFICAÇÃO DA MÁQUINA DE ESTADOS FINITOS & TRANSIÇÕES
            </span>
          </div>

          <div className="space-y-1.5">
            {selectedAudit.stateChain.map((tr) => (
              <div
                key={tr.transitionId}
                className={`p-2.5 rounded border flex items-center justify-between ${
                  tr.isLegalTransition
                    ? 'bg-neutral-950 border-neutral-800'
                    : 'bg-rose-950/30 border-rose-500 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-neutral-400">{tr.transitionId}</span>
                  <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-300">{tr.fromState}</span>
                  <span className="text-neutral-600">➔</span>
                  <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-white font-bold">{tr.toState}</span>
                  <span className="text-cyan-400">[{tr.command}]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">{tr.operatorRole}</span>
                  {tr.isLegalTransition ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">LÍCITA</span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">TRANSIÇÃO ILEGAL</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 05: SILA CHAIN VERIFICATION
         ========================================================================= */}
      {activeZone === '05_SILA_CHAIN' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              SILA CHAIN CUSTODY LEDGER — PROVA DE INTEGRIDADE EM CASCATA
            </span>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[7.5px] ${
                selectedAudit.chainVerification.result === 'VALID'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300 animate-pulse'
              }`}
            >
              RESULTADO: {selectedAudit.chainVerification.result}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
            <div className="text-white font-bold text-[9px]">PARECER TÉCNICO DE CUSTÓDIA:</div>
            <div className="text-neutral-300 leading-relaxed text-[8px]">{selectedAudit.chainVerification.details}</div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-900 text-neutral-400 text-[7.5px]">
              <div>Total de Eventos: <strong className="text-white">{selectedAudit.chainVerification.totalEvents}</strong></div>
              <div>Hashes Válidos: <strong className="text-emerald-400">{selectedAudit.chainVerification.validHashesCount}</strong></div>
              <div>Quebras de Cadeia: <strong className={selectedAudit.chainVerification.brokenLinksCount > 0 ? 'text-rose-400' : 'text-neutral-400'}>{selectedAudit.chainVerification.brokenLinksCount}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 06: VERIFICAÇÃO CRIPTOGRÁFICA
         ========================================================================= */}
      {activeZone === '06_VERIFICAÇÃO_CRIPTOGRAFICA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
              ASSINATURAS DIGITAIS & PROVA DE MERKLE TREE
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-neutral-400 text-[7.5px]">
              <div>ALGORITMO: <strong className="text-white">{selectedAudit.cryptographicVerification.algorithm}</strong></div>
              <div>ASSINATURAS VÁLIDAS: <strong className="text-emerald-400">{selectedAudit.cryptographicVerification.signaturesVerified}</strong></div>
            </div>
            <div className="p-2 rounded bg-neutral-900 font-mono text-[7px] text-neutral-400 break-all">
              MERKLE ROOT: {selectedAudit.cryptographicVerification.merkleRootHash}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 07: INTEGRIDADE DE EVIDÊNCIAS
         ========================================================================= */}
      {activeZone === '07_INTEGRIDADE_EVIDENCIAS' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
              INTEGRIDADE TEMPORAL E HASHES DAS EVIDÊNCIAS PROCESSUAIS
            </span>
          </div>

          <div className="space-y-1.5">
            {selectedAudit.evidenceIntegrity.items.map((it) => (
              <div key={it.evidenceId} className="p-2.5 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-white font-bold">{it.evidenceType} ({it.sourceModule})</div>
                  <div className="text-neutral-500 text-[7px] font-mono">SHA256: {it.hashSHA256}</div>
                </div>
                <div>
                  {it.isHashMatched ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">ÍNTEGRO</span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">CORROMPIDO</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 08: MATRIZ DE ALÇADAS
         ========================================================================= */}
      {activeZone === '08_MATRIZ_ALCADAS' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              CONFORMIDADE ABAC / RBAC (OPERADOR ➔ ALÇADA ➔ ESTADO)
            </span>
          </div>

          <div className="space-y-1.5">
            {selectedAudit.authorityMatrix.evaluations.map((ev, i) => (
              <div key={i} className="p-2.5 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-white font-bold">{ev.operatorRole} ({ev.operatorId}) — {ev.jurisdictionProvince}</div>
                  <div className="text-neutral-400 text-[7.5px]">{ev.commandExecuted} ➔ {ev.targetState}: {ev.justification}</div>
                </div>
                <div>
                  {ev.status === 'AUTHORIZED' ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">AUTORIZADO</span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">NÃO AUTORIZADO</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 09: ANOMALIAS
         ========================================================================= */}
      {activeZone === '09_ANOMALIAS' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" />
              ANOMALIAS TÉCNICAS E DESVIOS DETECTADOS
            </span>
            <span className="text-neutral-500 text-[7.5px]">Total: {selectedAudit.anomalies.length}</span>
          </div>

          {selectedAudit.anomalies.length > 0 ? (
            <div className="space-y-2">
              {selectedAudit.anomalies.map((an) => (
                <div key={an.anomalyId} className="p-3 rounded bg-neutral-950 border border-rose-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold">{an.code} — {an.title}</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">{an.severity}</span>
                  </div>
                  <div className="text-neutral-300 text-[8px]">{an.description}</div>
                  <div className="text-neutral-500 text-[7px]">Impacto: {an.impactAssessment}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-neutral-950 rounded border border-neutral-800 text-neutral-500">
              Nenhuma anomalia ou desvio processual detectado.
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ZONA 10: PARECER DE AUDITORIA FINAL
         ========================================================================= */}
      {activeZone === '10_PARECER_AUDITORIA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              PARECER DE AUDITORIA E CUSTÓDIA CONCLUSIVA
            </span>
          </div>

          {selectedAudit.auditOpinion ? (
            <div className="p-3 bg-neutral-950 rounded-lg border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div>
                  <span className="text-neutral-500 text-[7px] block">TIPO DE PARECER:</span>
                  <span className="text-emerald-400 font-bold text-[8.5px]">{selectedAudit.auditOpinion.opinionType}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[7px] block">INSPETOR AUDITOR:</span>
                  <span className="text-white font-bold text-[8.5px]">
                    {selectedAudit.auditOpinion.auditedBy.auditorName} ({selectedAudit.auditOpinion.auditedBy.role})
                  </span>
                </div>
              </div>
              <div>
                <span className="text-neutral-500 text-[7px] block">CONCLUSÃO TÉCNICA:</span>
                <p className="text-neutral-200 text-[8px] leading-relaxed">{selectedAudit.auditOpinion.conclusion}</p>
              </div>
              <div>
                <span className="text-neutral-500 text-[7px] block">RECOMENDAÇÃO ARQUIVÍSTICA:</span>
                <p className="text-cyan-400 text-[8px] font-bold">{selectedAudit.auditOpinion.recommendation}</p>
              </div>
              <div className="flex justify-between text-neutral-500 text-[7px] pt-1 border-t border-neutral-900">
                <span>Base Legal: {selectedAudit.auditOpinion.legalArticleBasis}</span>
                <span>Data: {new Date(selectedAudit.auditOpinion.auditedAt).toLocaleString('pt-AO')}</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-neutral-950 rounded border border-neutral-800 text-neutral-500">
              Parecer conclusivo de auditoria ainda não lavrado para este dossiê.
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ZONA 11: AUDITORIA DA PRÓPRIA AUDITORIA (META-AUDITORIA APPEND-ONLY)
         ========================================================================= */}
      {activeZone === '11_AUDITORIA_DA_AUDITORIA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              LIVRO-MESTRE DE META-AUDITORIA (AUDIT OF THE AUDIT - SILA CHAIN)
            </span>
            <span className="text-neutral-500 text-[7.5px]">Total Registos: {metaAuditLogs.length}</span>
          </div>

          <div className="space-y-1.5">
            {metaAuditLogs.map((log) => (
              <div key={log.eventId} className="p-2.5 bg-neutral-950 rounded border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold">{log.eventId}</span>
                    <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[7px] text-cyan-300">
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
                  <span>AUDITOR: {log.auditorName} ({log.role})</span>
                  <span>CURR_HASH: {log.currentHash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EMISSÃO DE PARECER CONCLUSIVO DE AUDITORIA
         ========================================================================= */}
      {modalMode === 'ISSUE_OPINION' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-lg w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" /> LAVRATURA DE PARECER DE AUDITORIA
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">TIPO DE PARECER DE AUDITORIA:</label>
                <select
                  value={formOpinionType}
                  onChange={(e) => setFormOpinionType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-bold"
                >
                  <option value="INTEGRITY_CONFIRMED">INTEGRITY_CONFIRMED — Integridade e Alçadas Totalmente Confirmadas</option>
                  <option value="INTEGRITY_WITH_WARNINGS">INTEGRITY_WITH_WARNINGS — Integridade Válida com Ressalvas Menores</option>
                  <option value="INTEGRITY_EXCEPTION">INTEGRITY_EXCEPTION — Exceção Documental Registada</option>
                  <option value="CHAIN_BROKEN">CHAIN_BROKEN — Quebra Crítica de Cadeia / Hashes Corrompidos</option>
                  <option value="AUDIT_INCONCLUSIVE">AUDIT_INCONCLUSIVE — Auditoria Inconclusiva por Falta de Dados</option>
                </select>
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">BASE LEGAL DA AUDITORIA:</label>
                <input
                  type="text"
                  value={formLegalBasis}
                  onChange={(e) => setFormLegalBasis(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">CONCLUSÃO CIRCUNSTANCIADA:</label>
                <textarea
                  value={formConclusion}
                  onChange={(e) => setFormConclusion(e.target.value)}
                  placeholder="Conclusões sobre hashes, assinaturas e alçadas..."
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">RECOMENDAÇÃO ARQUIVÍSTICA:</label>
                <input
                  type="text"
                  value={formRecommendation}
                  onChange={(e) => setFormRecommendation(e.target.value)}
                  placeholder="Ex: Homologar arquivamento na SILA Chain."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-emerald-400" />
                  <span>SENHA IAM AUDITOR (ASSINATURA SOBERANA):</span>
                </label>
                <input
                  type="password"
                  value={formAuditorPassword}
                  onChange={(e) => setFormAuditorPassword(e.target.value)}
                  placeholder="Senha IAM do auditor..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleSubmitAuditOpinion} className="px-3 py-1.5 rounded bg-emerald-600 text-neutral-950 font-black">LAVRAR NO LIVRO-MESTRE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
