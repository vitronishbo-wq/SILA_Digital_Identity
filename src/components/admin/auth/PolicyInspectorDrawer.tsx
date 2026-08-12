import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  OperatorRole,
  OrganizationalScope,
  ResourceScope,
  ActionType,
  AccessEvaluationRequest
} from '../../../types/auth';
import { evaluateAccessPolicy, getCurrentSession } from '../../../services/accessControlService';

interface PolicyInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyInspectorDrawer: React.FC<PolicyInspectorDrawerProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const session = getCurrentSession();

  // Test parameters state
  const [testRole, setTestRole] = useState<OperatorRole>(session.operator.role);
  const [testOrg, setTestOrg] = useState<OrganizationalScope>(session.operator.organization);
  const [testTerritories, setTestTerritories] = useState<string>('Luanda, Cazenga');
  const [testTargetTerritory, setTestTargetTerritory] = useState<string>('Luanda');
  const [testResource, setTestResource] = useState<ResourceScope>('PROCESS');
  const [testAction, setTestAction] = useState<ActionType>('APPROVE');
  const [testMfa, setTestMfa] = useState<boolean>(true);

  const territoriesArray = testTerritories.split(',').map(s => s.trim()).filter(Boolean);

  const request: AccessEvaluationRequest = {
    role: testRole,
    organization: testOrg,
    operatorTerritories: territoriesArray,
    targetTerritory: testTargetTerritory,
    resource: testResource,
    action: testAction,
    lastReauthenticatedAt: session.lastReauthenticatedAt,
    mfaVerified: testMfa
  };

  const decision = evaluateAccessPolicy(request);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm font-mono animate-in fade-in duration-200">
      <div className="bg-[#111217] border-l border-neutral-800 w-full max-w-2xl h-full p-6 space-y-5 overflow-y-auto shadow-2xl relative flex flex-col justify-between">
        
        <div className="space-y-5">
          {/* HEADER */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-wider uppercase">
                  SIMULADOR DE POLÍTICAS ABAC / RBAC (PDP)
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Validação da Fórmula MJDH: ROLE + ORGANIZATION + TERRITORY + RESOURCE + ACTION + POLICY
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SIMULATOR INPUT FORM */}
          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                CONFIGURAR PARÂMETROS DO TESTE DE ACESSO
              </span>
              <button
                onClick={() => {
                  setTestRole(session.operator.role);
                  setTestOrg(session.operator.organization);
                }}
                className="text-[10px] text-neutral-400 hover:text-white underline"
              >
                Copiar da Sessão Atual
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* ROLE */}
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase">1. ROLE (PAPEL)</label>
                <select
                  value={testRole}
                  onChange={(e) => setTestRole(e.target.value as OperatorRole)}
                  className="w-full rounded-xl px-2.5 py-2 bg-neutral-950 border border-neutral-800 text-amber-300 font-bold"
                >
                  <option value="SERVICE_AGENT">SERVICE_AGENT</option>
                  <option value="IDENTITY_ANALYST">IDENTITY_ANALYST</option>
                  <option value="BIOMETRIC_OPERATOR">BIOMETRIC_OPERATOR</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="ISSUANCE_OPERATOR">ISSUANCE_OPERATOR</option>
                  <option value="AUDITOR">AUDITOR</option>
                  <option value="REPORTING_OFFICER">REPORTING_OFFICER</option>
                  <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
                  <option value="GOVERNANCE_ADMIN">GOVERNANCE_ADMIN</option>
                </select>
              </div>

              {/* ORGANIZATION */}
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase">2. ORGANIZAÇÃO</label>
                <select
                  value={testOrg}
                  onChange={(e) => setTestOrg(e.target.value as OrganizationalScope)}
                  className="w-full rounded-xl px-2.5 py-2 bg-neutral-950 border border-neutral-800 text-blue-300 font-bold"
                >
                  <option value="MJDH_CENTRAL">MJDH_CENTRAL</option>
                  <option value="DNIC_LUANDA">DNIC_LUANDA</option>
                  <option value="POSTO_ATENDIMENTO_LUANDA">POSTO_ATENDIMENTO_LUANDA</option>
                  <option value="POSTO_ATENDIMENTO_BENGUELA">POSTO_ATENDIMENTO_BENGUELA</option>
                  <option value="POSTO_ATENDIMENTO_HUAMBO">POSTO_ATENDIMENTO_HUAMBO</option>
                  <option value="POSTO_ATENDIMENTO_CABINDA">POSTO_ATENDIMENTO_CABINDA</option>
                </select>
              </div>

              {/* OPERATOR TERRITORIES */}
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase">3. TERRITÓRIOS OPERADOR</label>
                <input
                  type="text"
                  value={testTerritories}
                  onChange={(e) => setTestTerritories(e.target.value)}
                  placeholder="Ex: Luanda, Cazenga ou NACIONAL"
                  className="w-full rounded-xl px-2.5 py-2 bg-neutral-950 border border-neutral-800 text-emerald-300 font-bold"
                />
              </div>

              {/* TARGET TERRITORY */}
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase">4. TERRITÓRIO DO RECURSO</label>
                <input
                  type="text"
                  value={testTargetTerritory}
                  onChange={(e) => setTestTargetTerritory(e.target.value)}
                  placeholder="Ex: Luanda, Benguela, Huambo"
                  className="w-full rounded-xl px-2.5 py-2 bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              {/* RESOURCE */}
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase">5. RECURSO (RESOURCE)</label>
                <select
                  value={testResource}
                  onChange={(e) => setTestResource(e.target.value as ResourceScope)}
                  className="w-full rounded-xl px-2.5 py-2 bg-neutral-950 border border-neutral-800 text-purple-300 font-bold"
                >
                  <option value="PROCESS">PROCESS (Processos de BI)</option>
                  <option value="CITIZEN">CITIZEN (Ficha de Cidadão)</option>
                  <option value="BIOMETRIC">BIOMETRIC (AFIS / Dactiloscopia)</option>
                  <option value="ISSUANCE">ISSUANCE (Emissão / Lotes)</option>
                  <option value="TERRITORY">TERRITORY (Mapeamento Territórios)</option>
                  <option value="AUDIT">AUDIT (Logs de Auditoria)</option>
                  <option value="REPORT">REPORT (Relatórios Nacionais)</option>
                  <option value="CONFIG">CONFIG (Configurações do Sistema)</option>
                  <option value="SYSTEM_USERS">SYSTEM_USERS (Gestão de Utilizadores)</option>
                </select>
              </div>

              {/* ACTION */}
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase">6. AÇÃO (ACTION)</label>
                <select
                  value={testAction}
                  onChange={(e) => setTestAction(e.target.value as ActionType)}
                  className="w-full rounded-xl px-2.5 py-2 bg-neutral-950 border border-neutral-800 text-teal-300 font-bold"
                >
                  <option value="READ">READ (Consultar)</option>
                  <option value="CREATE">CREATE (Criar Novo)</option>
                  <option value="UPDATE">UPDATE (Alterar / Editar)</option>
                  <option value="APPROVE">APPROVE (Aprovar / Decidir)</option>
                  <option value="REJECT">REJECT (Rejeitar Processo)</option>
                  <option value="COLLECT_BIOMETRICS">COLLECT_BIOMETRICS (Recolher Digital/Face)</option>
                  <option value="ISSUE_CARD">ISSUE_CARD (Imprimir / Emitir BI)</option>
                  <option value="EXPORT">EXPORT (Exportar Dados/Relatório)</option>
                  <option value="MANAGE_USERS">MANAGE_USERS (Gerir Utilizadores)</option>
                  <option value="DELETE">DELETE (Eliminar Registo)</option>
                  <option value="GOVERN">GOVERN (Governar Políticas)</option>
                </select>
              </div>
            </div>

            {/* MFA TOGGLE */}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
              <span className="text-xs text-neutral-300 font-bold">Autenticação MFA/TOTP Verificada?</span>
              <button
                type="button"
                onClick={() => setTestMfa(!testMfa)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  testMfa ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {testMfa ? 'MFA VERIFICADO (OK)' : 'MFA PENDENTE (FALHA)'}
              </button>
            </div>
          </div>

          {/* EVALUATION DECISION RESULT */}
          <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
            decision.allowed
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {decision.allowed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400" />
                )}
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider">
                    {decision.allowed ? 'DECISÃO: ACESSO AUTORIZADO' : 'DECISÃO: ACESSO NEGADO'}
                  </h3>
                  <span className="text-[10px] font-mono opacity-80">
                    Status da Política: {decision.evaluatedFactors.policyStatus}
                  </span>
                </div>
              </div>
              {decision.requiresReauth && (
                <span className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                  REQUER REAUTENTICAÇÃO
                </span>
              )}
            </div>

            <p className="text-xs font-sans leading-relaxed bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
              {decision.reason}
            </p>

            {/* FACTORS BREAKDOWN */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
              <div className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800">
                <span className="text-neutral-500 block">Papel Evaluado</span>
                <span className="text-amber-300 font-bold">{decision.evaluatedFactors.role}</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800">
                <span className="text-neutral-500 block">Match Territorial</span>
                <span className={decision.evaluatedFactors.territoryMatch ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {decision.evaluatedFactors.territoryMatch ? 'SIM (Dentro do Escopo)' : 'NÃO (Jurisdição Violada)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider"
          >
            Fechar Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
