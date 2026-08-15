import React, { useState, useMemo } from 'react';
import {
  ValidationDossier,
  ValidationStatus,
  ProcessType,
  ValidationRiskLevel,
  ValidationPriority,
  ValidationDecision,
  ValidationException,
  ValidationAuditEvent
} from '../../../types/validations';
import {
  INITIAL_VALIDATION_DOSSIERS,
  INITIAL_VALIDATION_AUDIT_LOGS
} from '../../../data/validations';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  ShieldAlert,
  Layers,
  FileCheck,
  Fingerprint,
  UserCheck,
  Lock,
  ArrowRight,
  KeyRound,
  Scale,
  Check,
  X
} from 'lucide-react';
import { ValidationsQueueTab } from './validations/ValidationsQueueTab';
import { ValidationsBiographicalTab } from './validations/ValidationsBiographicalTab';
import { ValidationsBiometricTab } from './validations/ValidationsBiometricTab';
import { ValidationsUniquenessTab } from './validations/ValidationsUniquenessTab';

export const ValidationsTab: React.FC = () => {
  // 10 Sub-módulos Operacionais Institucionais
  const [subTab, setSubTab] = useState<
    | '01_FILA_VALIDACAO'
    | '02_VAL_BIOGRAFICA'
    | '03_VAL_BIOMETRICA'
    | '04_UNICIDADE_DUPLICADOS'
    | '05_VAL_DOCUMENTAL'
    | '06_REGRAS_CONFORMIDADE'
    | '07_DECISAO_FINAL'
    | '08_EXCECOES_DISCREP'
    | '09_REVISAO_SUPERVISORA'
    | '10_AUDITORIA_DECISAO'
  >('01_FILA_VALIDACAO');

  // Estado dos Dossiês e Auditoria
  const [dossiers, setDossiers] = useState<ValidationDossier[]>(INITIAL_VALIDATION_DOSSIERS);
  const [auditLogs, setAuditLogs] = useState<ValidationAuditEvent[]>(INITIAL_VALIDATION_AUDIT_LOGS);
  
  // Dossiê Ativo Selecionado para Análise/Decisão
  const [selectedDossierId, setSelectedDossierId] = useState<string>(INITIAL_VALIDATION_DOSSIERS[0].dossierId);

  // Modais de Decisão Final
  const [showReauthDecisionModal, setShowReauthDecisionModal] = useState<boolean>(false);
  const [pendingDecisionType, setPendingDecisionType] = useState<'APPROVED' | 'REJECTED' | 'SUSPENDED'>('APPROVED');
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [decisionLegalCode, setDecisionLegalCode] = useState<string>('DEC_LEG_OK_ART12');
  const [reauthPassword, setReauthPassword] = useState<string>('');
  const [reauthError, setReauthError] = useState<string | null>(null);

  // Dossiê selecionado ativo
  const activeDossier = useMemo(() => {
    return dossiers.find(d => d.dossierId === selectedDossierId) || dossiers[0];
  }, [dossiers, selectedDossierId]);

  const handleUpdateDossier = (updated: ValidationDossier) => {
    setDossiers(prev => prev.map(d => d.dossierId === updated.dossierId ? updated : d));
  };

  const handleAddAuditEvent = (newEvent: ValidationAuditEvent) => {
    setAuditLogs(prev => [...prev, newEvent]);
  };

  const handleSelectDossierForAnalysis = (dossierId: string) => {
    setSelectedDossierId(dossierId);
    setSubTab('02_VAL_BIOGRAFICA');
  };

  const handleViewAuditChain = () => {
    setSubTab('10_AUDITORIA_DECISAO');
  };

  // EXECUÇÃO DE DECISÃO INSTITUCIONAL VINCULATIVA COM REAUTENTICAÇÃO FORTE IAM
  const handleExecuteDecision = () => {
    if (!reauthPassword || reauthPassword.length < 4) {
      setReauthError('Credencial de autenticação forte IAM inválida ou incompleta.');
      return;
    }

    const decision: ValidationDecision = {
      decisionId: `DEC-${Date.now().toString().slice(-6)}`,
      verdict: pendingDecisionType,
      decidedBy: {
        userId: 'VAL-N1-0084',
        operatorName: 'Carlos Van-Dúnem',
        role: 'VALIDATOR',
        terminalId: 'TERM-VAL-LUA-01',
      },
      legalJustificationCode: decisionLegalCode,
      justificationNotes: decisionNotes || 'Parecer emitido em conformidade com as validações oficiais dos motores.',
      nextModuleDestination: pendingDecisionType === 'APPROVED' ? '11_EMISSAO' : pendingDecisionType === 'SUSPENDED' ? 'PENDING_SANEAMENTO' : 'ARCHIVED',
      signatureToken: `SIG_VERDICT_ECDSA_${Math.random().toString(36).substring(2).toUpperCase()}`,
      decidedAt: new Date().toISOString(),
    };

    let nextStatus: ValidationStatus = 'APPROVED';
    if (pendingDecisionType === 'APPROVED') nextStatus = 'EMISSION_AUTHORIZED';
    if (pendingDecisionType === 'REJECTED') nextStatus = 'REJECTED';
    if (pendingDecisionType === 'SUSPENDED') nextStatus = 'PENDING_DOCS';

    setDossiers(prev =>
      prev.map(d => {
        if (d.dossierId === activeDossier.dossierId) {
          return {
            ...d,
            status: nextStatus,
            decision: decision,
            updatedAt: new Date().toISOString(),
          };
        }
        return d;
      })
    );

    // Trilha Imutável de Decisão
    const newEvent: ValidationAuditEvent = {
      eventId: `VAL-EVT-${Date.now().toString().slice(-6)}`,
      dossierId: activeDossier.dossierId,
      operatorId: 'VAL-N1-0084',
      operatorRole: 'VALIDADOR_N1',
      command: pendingDecisionType === 'APPROVED' ? 'APPROVE' : pendingDecisionType === 'REJECTED' ? 'REJECT' : 'SUSPEND',
      previousState: activeDossier.status,
      newState: nextStatus,
      reason: `Veredito ${pendingDecisionType} emitido formalmente. Fundamento: ${decisionLegalCode}. Destino: ${decision.nextModuleDestination}.`,
      timestamp: new Date().toISOString(),
      previousHash: auditLogs[auditLogs.length - 1]?.currentHash || activeDossier.currentHash,
      currentHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      digitalSignature: decision.signatureToken,
      auditChainRef: activeDossier.auditChainRef,
      terminalId: 'TERM-VAL-LUA-01',
      payloadSummary: `Veredito ${pendingDecisionType} emitido formalmente. Fundamento: ${decisionLegalCode}. Destino: ${decision.nextModuleDestination}.`,
      silaGlobalAuditRef: `SILA_AUDIT_${Date.now()}`
    };
    setAuditLogs(prev => [...prev, newEvent]);

    setShowReauthDecisionModal(false);
    setReauthPassword('');
    setReauthError(null);
  };

  return (
    <div id="validations-tab-root" className="space-y-2.5 font-sans text-neutral-200">
      {/* =========================================================================
          CABEÇALHO OPERACIONAL DE VALIDAÇÕES & DECISÃO INSTITUCIONAL
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-widest text-emerald-400 uppercase">
                10 — VALIDAÇÕES & DECISÃO INSTITUCIONAL
              </span>
              <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono text-[9px] border border-neutral-700">
                ORQUESTRADOR SOBERANO
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
              Confronto Probatório Multi-Motor: Registo Civil • ABIS/AFIS • Unicidade • Documental • Conformidade Legal
            </p>
          </div>
        </div>

        {/* Telemetria Global do Módulo 10 */}
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
            <span className="text-neutral-400">NA FILA:</span>
            <span className="text-amber-400 font-bold">{dossiers.filter(d => d.status === 'QUEUED').length}</span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
            <span className="text-neutral-400">EM ANÁLISE:</span>
            <span className="text-cyan-400 font-bold">{dossiers.filter(d => d.status === 'UNDER_ANALYSIS').length}</span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
            <span className="text-neutral-400">DESPACHADOS P/ 11:</span>
            <span className="text-emerald-400 font-bold">{dossiers.filter(d => d.status === 'EMISSION_AUTHORIZED').length}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BARRA DE NAVEGAÇÃO DOS 10 SUBMÓDULOS DE VALIDAÇÃO
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto text-[9px] font-mono scrollbar-thin">
        {[
          { id: '01_FILA_VALIDACAO', label: '01_FILA_VALIDACAO', icon: Layers },
          { id: '02_VAL_BIOGRAFICA', label: '02_VAL_BIOGRAFICA', icon: UserCheck },
          { id: '03_VAL_BIOMETRICA', label: '03_VAL_BIOMETRICA', icon: Fingerprint },
          { id: '04_UNICIDADE_DUPLICADOS', label: '04_UNICIDADE_DUPLICADOS', icon: ShieldAlert },
          { id: '05_VAL_DOCUMENTAL', label: '05_VAL_DOCUMENTAL', icon: FileCheck },
          { id: '06_REGRAS_CONFORMIDADE', label: '06_REGRAS_CONFORMIDADE', icon: Shield },
          { id: '07_DECISAO_FINAL', label: '07_DECISAO_FINAL', icon: Scale },
          { id: '08_EXCECOES_DISCREP', label: '08_EXCECOES_DISCREP', icon: AlertTriangle },
          { id: '09_REVISAO_SUPERVISORA', label: '09_REVISAO_SUPERVISORA', icon: Lock },
          { id: '10_AUDITORIA_DECISAO', label: '10_AUDITORIA_DECISAO', icon: KeyRound },
        ].map(item => {
          const Icon = item.icon;
          const isActive = subTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id as any)}
              className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          01 — FILA CENTRAL DE VALIDAÇÃO (SUB-MÓDULO DEDICADO E FECHADO)
         ========================================================================= */}
      {subTab === '01_FILA_VALIDACAO' && (
        <ValidationsQueueTab
          dossiers={dossiers}
          onUpdateDossier={handleUpdateDossier}
          onAddAuditEvent={handleAddAuditEvent}
          onSelectDossierForAnalysis={handleSelectDossierForAnalysis}
          onViewAuditChain={handleViewAuditChain}
        />
      )}

      {/* =========================================================================
          02 — VALIDAÇÃO BIOGRÁFICA (CONFRONTO COM REGISTO CIVIL)
         ========================================================================= */}
      {subTab === '02_VAL_BIOGRAFICA' && (
        <ValidationsBiographicalTab
          dossiers={dossiers}
          activeDossierId={selectedDossierId}
          onSelectDossier={setSelectedDossierId}
          onUpdateDossier={handleUpdateDossier}
          onAddAuditEvent={handleAddAuditEvent}
          onNavigateToTab={setSubTab}
        />
      )}

      {/* =========================================================================
          03 — VALIDAÇÃO BIOMÉTRICA (GATEWAY ABIS / AFIS)
         ========================================================================= */}
      {subTab === '03_VAL_BIOMETRICA' && (
        <ValidationsBiometricTab
          dossiers={dossiers}
          activeDossierId={selectedDossierId}
          onSelectDossier={setSelectedDossierId}
          onUpdateDossier={handleUpdateDossier}
          onAddAuditEvent={handleAddAuditEvent}
          onNavigateToTab={(tabKey) => setSubTab(tabKey as any)}
        />
      )}

      {/* =========================================================================
          04 — UNICIDADE / DUPLICIDADE (ANTIFRAUDE GOVERNAMENTAL)
         ========================================================================= */}
      {subTab === '04_UNICIDADE_DUPLICADOS' && (
        <ValidationsUniquenessTab
          dossiers={dossiers}
          activeDossierId={selectedDossierId}
          onSelectDossier={setSelectedDossierId}
          onUpdateDossier={handleUpdateDossier}
          onAddAuditEvent={handleAddAuditEvent}
          onNavigateToTab={(tabKey) => setSubTab(tabKey as any)}
        />
      )}

      {/* =========================================================================
          05 — VALIDAÇÃO DOCUMENTAL
         ========================================================================= */}
      {subTab === '05_VAL_DOCUMENTAL' && (
        <div className="space-y-3 font-mono text-[9px]">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <FileCheck className="w-4 h-4" />
                <span>05 — INTEGRIDADE E AUTENTICIDADE DOCUMENTAL</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                STATUS: {activeDossier.documentalValidation.status}
              </span>
            </div>

            <div className="space-y-2">
              {activeDossier.documentalValidation.presentedDocuments.map((doc, idx) => (
                <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{doc.documentType}</span>
                      <span className="text-neutral-500">Nº {doc.documentNumber}</span>
                    </div>
                    <div className="text-neutral-400 text-[8px]">
                      EMITIDO POR: {doc.issuingAuthority} • DATA: {doc.issueDate}
                    </div>
                    {doc.notes && <div className="text-amber-400 text-[8px]">{doc.notes}</div>}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded font-bold border ${
                      doc.status === 'VALID'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
              <div className="text-neutral-400">MOTOR: {activeDossier.documentalValidation.engineCode}</div>
              <button
                onClick={() => setSubTab('06_REGRAS_CONFORMIDADE')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-neutral-950 font-black uppercase flex items-center gap-1"
              >
                <span>AVANÇAR P/ REGRAS LEGAIS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          06 — REGRAS DE CONFORMIDADE NORMATIVA
         ========================================================================= */}
      {subTab === '06_REGRAS_CONFORMIDADE' && (
        <div className="space-y-3 font-mono text-[9px]">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Shield className="w-4 h-4" />
                <span>06 — MOTOR DE REGRAS NORMATIVAS E CONFORMIDADE LEGAL</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold border ${
                activeDossier.complianceValidation.isCompliant
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                CONFORMIDADE: {activeDossier.complianceValidation.isCompliant ? 'CONFORME' : 'EXIGE PARECER'}
              </span>
            </div>

            <div className="space-y-2">
              {activeDossier.complianceValidation.rulesEvaluated.map((rule, idx) => (
                <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{rule.ruleCode}</span>
                      <span className="text-neutral-500">[{rule.version}]</span>
                      <span className="text-cyan-400">{rule.legalBasis}</span>
                    </div>
                    <div className="text-neutral-400 mt-0.5">{rule.description}</div>
                    <div className="text-[8px] text-neutral-500 mt-0.5">EVIDÊNCIA: {rule.evidence}</div>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      rule.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {rule.passed ? 'PASS' : 'VIOLATION'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
              <div className="text-neutral-400">MOTOR: {activeDossier.complianceValidation.engineCode}</div>
              <button
                onClick={() => setSubTab('07_DECISAO_FINAL')}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black uppercase flex items-center gap-1"
              >
                <span>TERMINAL DE DECISÃO VINCULATIVA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          07 — TERMINAL DE DECISÃO INSTITUCIONAL VINCULATIVA
         ========================================================================= */}
      {subTab === '07_DECISAO_FINAL' && (
        <div className="space-y-3 font-mono text-[9px]">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Scale className="w-4 h-4" />
                <span>07 — TERMINAL DE DECISÃO INSTITUCIONAL SOBERANA</span>
              </div>
              <span className="text-neutral-400">DOSSIER: <strong className="text-white">{activeDossier.dossierId}</strong></span>
            </div>

            {/* Matriz Obrigatória de Conformidade Soberana */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-2">
              <div className="text-neutral-400 font-bold border-b border-neutral-900 pb-1">
                MATRIZ DE CONFORMIDADE OBRIGATÓRIA ANTES DO VEREDITO
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                  <div className="text-neutral-500 text-[8px]">BIOGRÁFICA</div>
                  <div className="font-bold text-emerald-400 mt-1">✓ VERIFIED</div>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                  <div className="text-neutral-500 text-[8px]">BIOMÉTRICA</div>
                  <div className="font-bold text-emerald-400 mt-1">✓ VERIFIED</div>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                  <div className="text-neutral-500 text-[8px]">UNICIDADE</div>
                  <div className="font-bold text-emerald-400 mt-1">✓ UNIQUE</div>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                  <div className="text-neutral-500 text-[8px]">DOCUMENTAL</div>
                  <div className="font-bold text-emerald-400 mt-1">✓ VALID</div>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                  <div className="text-neutral-500 text-[8px]">CONFORMIDADE</div>
                  <div className="font-bold text-emerald-400 mt-1">✓ PASSED</div>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                  <div className="text-neutral-500 text-[8px]">JURISDIÇÃO</div>
                  <div className="font-bold text-emerald-400 mt-1">✓ VALID</div>
                </div>
              </div>
            </div>

            {/* Veredito Atual / Painel de Decisão */}
            {activeDossier.decision ? (
              <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold text-xs">VEREDITO FORMAL REGISTADO: {activeDossier.decision.verdict}</span>
                  <span className="text-neutral-400">{activeDossier.decision.decidedAt}</span>
                </div>
                <div className="text-neutral-300">
                  <div><span className="text-neutral-500">DECISOR:</span> {activeDossier.decision.decidedBy.operatorName} ({activeDossier.decision.decidedBy.role})</div>
                  <div><span className="text-neutral-500">FUNDAMENTO:</span> {activeDossier.decision.legalJustificationCode}</div>
                  <div><span className="text-neutral-500">DESTINO:</span> <strong className="text-emerald-400">{activeDossier.decision.nextModuleDestination}</strong></div>
                  <div><span className="text-neutral-500">TOKEN ASSINATURA:</span> {activeDossier.decision.signatureToken}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-neutral-400">
                  Selecione o veredito vinculativo e forneça a reautenticação obrigatória (IAM):
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setPendingDecisionType('APPROVED');
                      setDecisionLegalCode('DEC_LEG_OK_ART12');
                      setShowReauthDecisionModal(true);
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>[ APROVAR & AUTORIZAR EMISSÃO (11) ]</span>
                  </button>
                  <button
                    onClick={() => {
                      setPendingDecisionType('SUSPENDED');
                      setDecisionLegalCode('DEC_SUSP_DOCS_PENDING');
                      setShowReauthDecisionModal(true);
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>[ SUSPENDER / EXIGIR SANEAMENTO ]</span>
                  </button>
                  <button
                    onClick={() => {
                      setPendingDecisionType('REJECTED');
                      setDecisionLegalCode('DEC_ERR_FRAUD_ART45');
                      setShowReauthDecisionModal(true);
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>[ REJEITAR / INDEFERIR ]</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          08 — EXCEÇÕES E DISCREPÂNCIAS
         ========================================================================= */}
      {subTab === '08_EXCECOES_DISCREP' && (
        <div className="space-y-3 font-mono text-[9px]">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>08 — GESTÃO DE EXCEÇÕES E DISCREPÂNCIAS OPERACIONAIS</span>
              </div>
            </div>

            <div className="space-y-2">
              {!activeDossier.exceptions || activeDossier.exceptions.length === 0 ? (
                <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-center text-neutral-500">
                  Nenhuma exceção ou discrepância ativa registada para este dossiê.
                </div>
              ) : (
                activeDossier.exceptions.map(exc => (
                  <div key={exc.exceptionId} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400">{exc.exceptionId} • TIPO: {exc.type}</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">GRAVIDADE: {exc.severity}</span>
                    </div>
                    <div className="text-white font-bold">{exc.description}</div>
                    <div className="text-neutral-400">EVIDÊNCIA: {exc.evidence}</div>
                    <div className="text-neutral-500 text-[8px]">RESPONSÁVEL: {exc.assignedTo} • PRAZO: {exc.deadline}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          09 — REVISÃO SUPERVISORA (MESA DE DECISÃO EXCEPCIONAL)
         ========================================================================= */}
      {subTab === '09_REVISAO_SUPERVISORA' && (
        <div className="space-y-3 font-mono text-[9px]">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>09 — MESA DE DECISÃO SUPERVISORA (NÍVEL N3)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-800">
                ACESSO RESTRITO POR PIN / BIOMETRIA
              </span>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
              <div className="text-neutral-400 font-bold">DOSSIÊS EM QUARENTENA / SUPERVISÃO:</div>
              <p className="text-neutral-300 leading-relaxed">
                Casos com suspeita de duplicidade (SUSPECT_DUPLICATE), divergência documental insanável em N1 ou scores inconclusivos são tratados nesta mesa sob duplo parecer soberano.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          10 — AUDITORIA DA DECISÃO (TRILHA CRIPTOGRÁFICA ENCADEADA)
         ========================================================================= */}
      {subTab === '10_AUDITORIA_DECISAO' && (
        <div className="space-y-3 font-mono text-[9px]">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <KeyRound className="w-4 h-4" />
                <span>10 — LIVRO-MESTRE DE AUDITORIA CRIPTOGRÁFICA (APPEND-ONLY)</span>
              </div>
              <span className="text-neutral-400 font-mono text-[8px]">
                PREVIOUS_HASH ──► COMMAND ──► CURRENT_HASH ──► SIGNATURE
              </span>
            </div>

            <div className="space-y-2">
              {auditLogs.map(evt => (
                <div key={evt.eventId} className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">{evt.eventId} • {evt.command}</span>
                    <span className="text-neutral-500">{evt.timestamp}</span>
                  </div>
                  <div className="text-neutral-300">{evt.reason || evt.payloadSummary}</div>
                  <div className="text-[8px] text-neutral-500 truncate">
                    CURR_HASH: {evt.currentHash} • SIGNATURE: {evt.digitalSignature}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REAUTENTICAÇÃO FORTE INSTITUCIONAL (MÓDULO 02 IAM / MFA)
         ========================================================================= */}
      {showReauthDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono text-[9px]">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1115] border border-emerald-500/40 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>CONFIRMAÇÃO SOBERANA & REAUTENTICAÇÃO IAM</span>
              </div>
              <button onClick={() => setShowReauthDecisionModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <div><span className="text-neutral-500">VEREDITO:</span> <strong className="text-white">{pendingDecisionType}</strong></div>
                <div><span className="text-neutral-500">FUNDAMENTO LEGAL:</span> {decisionLegalCode}</div>
                <div><span className="text-neutral-500">DESTINO:</span> {pendingDecisionType === 'APPROVED' ? 'MÓDULO 11 — EMISSÃO' : 'ARQUIVAMENTO / SANEAMENTO'}</div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">OBSERVAÇÕES DO DECISOR:</label>
                <textarea
                  value={decisionNotes}
                  onChange={e => setDecisionNotes(e.target.value)}
                  placeholder="Fundamentação técnica e legal do parecer..."
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-emerald-400 font-bold block mb-1">CREDENTIAL FORTE IAM / MFA:</label>
                <input
                  type="password"
                  value={reauthPassword}
                  onChange={e => setReauthPassword(e.target.value)}
                  placeholder="Introduza a palavra-passe do operador..."
                  className="w-full bg-neutral-950 border border-emerald-500/40 rounded p-2 text-white font-mono text-center tracking-widest"
                />
                {reauthError && <div className="text-rose-400 mt-1">{reauthError}</div>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowReauthDecisionModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-900 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleExecuteDecision}
                className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black uppercase flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ASSINAR & HOMOLOGAR DECISÃO</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
