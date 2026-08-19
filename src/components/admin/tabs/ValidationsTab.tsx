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
  CreditCard,
  Check,
  X
} from 'lucide-react';
import { ValidationsQueueTab } from './validations/ValidationsQueueTab';
import { ValidationsBiographicalTab } from './validations/ValidationsBiographicalTab';
import { ValidationsBiometricTab } from './validations/ValidationsBiometricTab';
import { ValidationsUniquenessTab } from './validations/ValidationsUniquenessTab';
import { ValidationsDocumentalTab } from './validations/ValidationsDocumentalTab';
import { ValidationsComplianceTab } from './validations/ValidationsComplianceTab';
import { ValidationsFinalDecisionTab } from './validations/ValidationsFinalDecisionTab';
import { ValidationsExceptionsTab } from './validations/ValidationsExceptionsTab';
import { ValidationsSupervisoryTab } from './validations/ValidationsSupervisoryTab';
import { ValidationsDecisionAuditTab } from './validations/ValidationsDecisionAuditTab';
import { ValidationsEmissionTab } from './validations/ValidationsEmissionTab';

export const ValidationsTab: React.FC = () => {
  // 11 Sub-módulos Operacionais Institucionais
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
    | '11_GESTAO_EMISSAO'
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
          { id: '11_GESTAO_EMISSAO', label: '11_GESTAO_EMISSAO', icon: CreditCard },
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
          05 — VALIDAÇÃO DOCUMENTAL (INTEGRIDADE & AUTENTICIDADE CRIPTOGRÁFICA)
         ========================================================================= */}
      {subTab === '05_VAL_DOCUMENTAL' && (
        <ValidationsDocumentalTab
          dossiers={dossiers}
          activeDossierId={selectedDossierId}
          onSelectDossier={setSelectedDossierId}
          onUpdateDossier={handleUpdateDossier}
          onAddAuditEvent={handleAddAuditEvent}
        />
      )}

      {/* =========================================================================
          06 — REGRAS DE CONFORMIDADE NORMATIVA & LEGAL (LEI 04/21)
         ========================================================================= */}
      {subTab === '06_REGRAS_CONFORMIDADE' && (
        <ValidationsComplianceTab
          dossiers={dossiers}
          activeDossierId={selectedDossierId}
          onSelectDossier={setSelectedDossierId}
          onUpdateDossier={handleUpdateDossier}
          onAddAuditEvent={handleAddAuditEvent}
        />
      )}

      {/* =========================================================================
          07 — TERMINAL DE DECISÃO INSTITUCIONAL VINCULATIVA
         ========================================================================= */}
      {subTab === '07_DECISAO_FINAL' && (
        <ValidationsFinalDecisionTab
          dossiers={dossiers}
          activeDossierId={selectedDossierId}
          onSelectDossier={setSelectedDossierId}
          onUpdateDossier={handleUpdateDossier}
          onAddAuditEvent={handleAddAuditEvent}
        />
      )}

      {/* =========================================================================
          08 — EXCEÇÕES E DISCREPÂNCIAS (SANEAMENTO PROCESSUAL)
         ========================================================================= */}
      {subTab === '08_EXCECOES_DISCREP' && (
        <ValidationsExceptionsTab
          dossiers={dossiers}
          activeDossierId={activeDossier.dossierId}
          onSelectDossier={setSelectedDossierId}
          onUpdateDossier={handleUpdateDossier}
          onAddAuditEvent={handleAddAuditEvent}
        />
      )}

      {/* =========================================================================
          09 — REVISÃO SUPERVISORA (MESA DE DECISÃO EXCEPCIONAL / NÍVEL N3)
         ========================================================================= */}
      {subTab === '09_REVISAO_SUPERVISORA' && (
        <ValidationsSupervisoryTab
          dossiers={dossiers}
          activeDossierId={selectedDossierId}
          onSelectDossier={setSelectedDossierId}
          onUpdateDossier={handleUpdateDossier}
          onAddAuditEvent={handleAddAuditEvent}
        />
      )}

      {/* =========================================================================
          10 — AUDITORIA DA DECISÃO (TRILHA CRIPTOGRÁFICA ENCADEADA)
         ========================================================================= */}
      {subTab === '10_AUDITORIA_DECISAO' && (
        <ValidationsDecisionAuditTab
          dossiers={dossiers}
          activeDossierId={selectedDossierId}
          onSelectDossier={setSelectedDossierId}
          onAddAuditEvent={handleAddAuditEvent}
        />
      )}

      {/* =========================================================================
          11 — GESTÃO DE EMISSÃO & PERSONALIZAÇÃO DE BI (FÁBRICA NACIONAL)
         ========================================================================= */}
      {subTab === '11_GESTAO_EMISSAO' && (
        <ValidationsEmissionTab
          dossiers={dossiers}
          activeDossierId={selectedDossierId}
          onSelectDossier={setSelectedDossierId}
          onAddAuditEvent={handleAddAuditEvent}
        />
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
