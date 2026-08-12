import React, { useState } from 'react';
import { ShieldAlert, Lock, UserCheck, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { ResourceScope, ActionType } from '../../../types/auth';
import { getCurrentSession, evaluateAccessPolicy } from '../../../services/accessControlService';
import { ReauthenticationModal } from './ReauthenticationModal';

interface AccessGuardProps {
  resource: ResourceScope;
  action: ActionType;
  targetTerritory?: string;
  children: React.ReactNode;
  onOpenRoleSwitcher?: () => void;
  fallbackMessage?: string;
}

export const AccessGuard: React.FC<AccessGuardProps> = ({
  resource,
  action,
  targetTerritory,
  children,
  onOpenRoleSwitcher,
  fallbackMessage
}) => {
  const session = getCurrentSession();
  const [showReauth, setShowReauth] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);

  const request = {
    role: session.operator.role,
    organization: session.operator.organization,
    operatorTerritories: session.operator.territories,
    targetTerritory,
    resource,
    action,
    lastReauthenticatedAt: session.lastReauthenticatedAt,
    mfaVerified: session.mfaVerified
  };

  const decision = evaluateAccessPolicy(request);

  if (decision.allowed) {
    return <>{children}</>;
  }

  return (
    <div className="p-8 rounded-3xl bg-[#111217] border-2 border-rose-500/30 text-neutral-200 font-mono space-y-5 shadow-2xl max-w-3xl mx-auto my-6 relative overflow-hidden">
      {/* BACKGROUND SHIELD DECORATION */}
      <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
        <ShieldAlert className="w-64 h-64 text-rose-500" />
      </div>

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
              RESTRIÇÃO DE ACESSO — PROTOCOLO CAMADA 2 (MJDH)
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white tracking-wider uppercase">
            OPERADOR NÃO AUTORIZADO PARA ESTE RECURSO
          </h3>
          <p className="text-xs text-neutral-400 font-sans">
            {fallbackMessage || 'A política de segurança ABAC/RBAC restringiu esta operação.'}
          </p>
        </div>
      </div>

      {/* REASON DETAIL */}
      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-neutral-500 font-bold uppercase">
          <span>MOTIVO TÉCNICO DETETADO PELO PDP</span>
          <span>STATUS: {decision.evaluatedFactors.policyStatus}</span>
        </div>
        <p className="text-xs text-rose-300 font-mono leading-relaxed">
          {decision.reason}
        </p>
      </div>

      {/* EVALUATION MATRIX DETAILS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-neutral-500 block">Papel do Operador</span>
          <span className="text-amber-400 font-bold block">{session.operator.role}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-neutral-500 block">Organização</span>
          <span className="text-blue-400 font-bold block truncate">{session.operator.organization}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-neutral-500 block">Recurso Requerido</span>
          <span className="text-purple-400 font-bold block">{resource} ({action})</span>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-neutral-500 block">Scope Territorial</span>
          <span className="text-emerald-400 font-bold block truncate">{session.operator.territories.join(', ')}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800">
        <span className="text-[10px] text-neutral-500 font-sans">
          Em caso de necessidade de serviço, consulte o seu Supervisor de Balcão.
        </span>

        <div className="flex items-center gap-2">
          {decision.requiresReauth && (
            <button
              onClick={() => setShowReauth(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Reautenticar Agora</span>
            </button>
          )}

          {onOpenRoleSwitcher && (
            <button
              onClick={onOpenRoleSwitcher}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Alternar Função (Switch Role)</span>
            </button>
          )}
        </div>
      </div>

      {/* REAUTH MODAL */}
      <ReauthenticationModal
        isOpen={showReauth}
        onClose={() => setShowReauth(false)}
        onSuccess={() => setReloadNonce(reloadNonce + 1)}
        actionTitle={`ACESSO A ${resource}`}
        actionDescription={`Reautenticação para validar o acesso da função '${session.operator.role}' ao recurso '${resource}'.`}
      />
    </div>
  );
};
