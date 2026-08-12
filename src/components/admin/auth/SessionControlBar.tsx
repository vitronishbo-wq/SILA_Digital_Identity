import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserCheck,
  Lock,
  Key,
  Clock,
  Laptop,
  Globe2,
  RefreshCw,
  LogOut,
  ChevronDown,
  AlertOctagon,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { getCurrentSession, logoutSession } from '../../../services/accessControlService';
import { OperatorRole } from '../../../types/auth';

interface SessionControlBarProps {
  onOpenRoleSwitcher: () => void;
  onOpenReauth: () => void;
  onOpenRecovery: () => void;
  onOpenPolicyInspector: () => void;
  onLogoutNotification?: () => void;
}

export const SessionControlBar: React.FC<SessionControlBarProps> = ({
  onOpenRoleSwitcher,
  onOpenReauth,
  onOpenRecovery,
  onOpenPolicyInspector,
  onLogoutNotification
}) => {
  const session = getCurrentSession();
  const { operator, sessionStart, expiresAt, deviceName, isTrustedDevice, ipAddress, mfaType } = session;

  const [timeLeftMinutes, setTimeLeftMinutes] = useState<number>(55);

  useEffect(() => {
    const updateTimer = () => {
      const exp = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const diffMin = Math.max(0, Math.floor((exp - now) / (1000 * 60)));
      setTimeLeftMinutes(diffMin);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [expiresAt]);

  const getRoleBadgeColor = (role: OperatorRole) => {
    switch (role) {
      case 'GOVERNANCE_ADMIN':
      case 'SYSTEM_ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'SUPERVISOR':
      case 'AUDITOR':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'IDENTITY_ANALYST':
      case 'ISSUANCE_OPERATOR':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'BIOMETRIC_OPERATOR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="bg-[#161822] border border-amber-500/30 rounded-2xl p-3 shadow-xl font-mono text-xs text-neutral-300 space-y-2">
      {/* TOP ROW: CAMADA 2 INDICATOR & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Shield className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-400 tracking-wider text-[11px]">
                CAMADA 2 — IDENTITY & ACCESS (MJDH)
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                RBAC/ABAC PDP ATIVO
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-sans">
              Segurança Institucional • Controlo de Acessos Multifatorial baseados em Funções, Organização e Território
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* ROLE SWITCHER BUTTON */}
          <button
            onClick={onOpenRoleSwitcher}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all"
            title="Alternar Perfil Operacional de Testes (9 Roles)"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>TROCAR ROLE ({operator.role})</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* REAUTH BUTTON */}
          <button
            onClick={onOpenReauth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-[11px] transition-all"
            title="Reautenticar Sessão para Operações Críticas"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">REAUTENTICAR</span>
          </button>

          {/* RECOVERY BUTTON */}
          <button
            onClick={onOpenRecovery}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white text-[11px] transition-all"
            title="Recuperação de Credenciais / PIN"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">RECUPERAR</span>
          </button>

          {/* POLICY INSPECTOR BUTTON */}
          <button
            onClick={onOpenPolicyInspector}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-bold transition-all"
            title="Inspecionar Regras de Autorização em Tempo Real"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>INSPECTOR ABAC/RBAC</span>
          </button>
        </div>
      </div>

      {/* BOTTOM ROW: SESSION SCOPE & TELEMETRY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px]">
        {/* OPERATOR DETAILS */}
        <div className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
              <Shield className="w-3 h-3" />
            </div>
            <div className="truncate">
              <span className="text-white font-bold block truncate">{operator.fullName}</span>
              <span className="text-neutral-500 block text-[9px]">{operator.badgeNumber} • Nível {operator.clearanceLevel}</span>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold shrink-0 ${getRoleBadgeColor(operator.role)}`}>
            {operator.role}
          </span>
        </div>

        {/* ORGANIZATIONAL SCOPE */}
        <div className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-blue-400 shrink-0">
            <Globe2 className="w-3 h-3" />
          </div>
          <div className="truncate">
            <span className="text-neutral-400 font-bold block text-[9px] uppercase">ESCOPO ORGANIZACIONAL</span>
            <span className="text-amber-300 font-semibold block truncate text-[10px]">{operator.organizationName}</span>
          </div>
        </div>

        {/* TERRITORIAL SCOPE */}
        <div className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 shrink-0">
            <UserCheck className="w-3 h-3" />
          </div>
          <div className="truncate">
            <span className="text-neutral-400 font-bold block text-[9px] uppercase">ESCOPO TERRITORIAL</span>
            <span className="text-emerald-300 font-semibold block truncate text-[10px]">
              {operator.territories.join(', ')}
            </span>
          </div>
        </div>

        {/* SESSION TELEMETRY */}
        <div className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-white font-bold block text-[10px]">Expira em {timeLeftMinutes} min</span>
              <span className="text-neutral-500 block text-[9px] truncate">MFA: {mfaType} • IP: {ipAddress}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0" title={deviceName}>
            <Laptop className={`w-3.5 h-3.5 ${isTrustedDevice ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-[9px] font-bold text-emerald-400">OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
