import React, { useState } from 'react';
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
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Building2,
  MapPin,
  FileCheck,
  Sliders,
  ShieldAlert,
  Crown,
  KeyRound,
  Fingerprint,
  Users,
  Search,
  Activity,
  Flame,
  ShieldCheck,
  Eye,
  Check,
  X,
  FileCode
} from 'lucide-react';
import { getCurrentSession, MJDH_OPERATORS } from '../../../services/accessControlService';
import { OperatorRole } from '../../../types/auth';

interface IdentityAccessTabProps {
  onOpenRoleSwitcher: () => void;
  onOpenReauth: () => void;
  onOpenRecovery: () => void;
  onOpenPolicyInspector: () => void;
  onOpenOrgSelector?: () => void;
  onOpenBreakGlass?: () => void;
  onOpenDelegation?: () => void;
  onOpenLockSession?: () => void;
}

export type IAMSubLayer =
  | '02.1_AUTHENTICATION'
  | '02.2_SESSION_MANAGEMENT'
  | '02.3_DEVICE_TRUST'
  | '02.4_MFA'
  | '02.5_REAUTHENTICATION'
  | '02.6_RBAC'
  | '02.7_ABAC'
  | '02.8_ORGANIZATIONAL_SCOPE'
  | '02.9_TERRITORIAL_SCOPE'
  | '02.10_USER_MANAGEMENT'
  | '02.11_ROLE_MANAGEMENT'
  | '02.12_PERMISSION_MANAGEMENT'
  | '02.13_CREDENTIAL_RECOVERY'
  | '02.14_SECURITY_EVENTS'
  | '02.15_ACCESS_AUDIT'
  | '02.16_PRIVILEGED_ACCESS'
  | '02.17_POLICY_MANAGEMENT';

export const IdentityAccessTab: React.FC<IdentityAccessTabProps> = ({
  onOpenRoleSwitcher,
  onOpenReauth,
  onOpenRecovery,
  onOpenPolicyInspector,
  onOpenOrgSelector,
  onOpenBreakGlass,
  onOpenDelegation,
  onOpenLockSession
}) => {
  const session = getCurrentSession();
  const { operator, sessionStart, expiresAt, lastReauthenticatedAt, deviceName, deviceId, isTrustedDevice, ipAddress, mfaType, mfaVerified } = session;

  const [activeLayer, setActiveLayer] = useState<IAMSubLayer>('02.1_AUTHENTICATION');
  const [searchFilter, setSearchFilter] = useState('');

  const layersList: { code: IAMSubLayer; num: string; name: string; tag: string }[] = [
    { code: '02.1_AUTHENTICATION', num: '02.1', name: 'AUTHENTICATION', tag: 'AUTH' },
    { code: '02.2_SESSION_MANAGEMENT', num: '02.2', name: 'SESSION MANAGEMENT', tag: 'SESS' },
    { code: '02.3_DEVICE_TRUST', num: '02.3', name: 'DEVICE TRUST', tag: 'DEV_TRUST' },
    { code: '02.4_MFA', num: '02.4', name: 'MFA', tag: 'MFA' },
    { code: '02.5_REAUTHENTICATION', num: '02.5', name: 'REAUTHENTICATION', tag: 'RE_AUTH' },
    { code: '02.6_RBAC', num: '02.6', name: 'RBAC', tag: 'RBAC' },
    { code: '02.7_ABAC', num: '02.7', name: 'ABAC', tag: 'ABAC' },
    { code: '02.8_ORGANIZATIONAL_SCOPE', num: '02.8', name: 'ORGANIZATIONAL SCOPE', tag: 'ORG_SCOPE' },
    { code: '02.9_TERRITORIAL_SCOPE', num: '02.9', name: 'TERRITORIAL SCOPE', tag: 'JUR_SCOPE' },
    { code: '02.10_USER_MANAGEMENT', num: '02.10', name: 'USER MANAGEMENT', tag: 'USR_MGMT' },
    { code: '02.11_ROLE_MANAGEMENT', num: '02.11', name: 'ROLE MANAGEMENT', tag: 'ROLE_MGMT' },
    { code: '02.12_PERMISSION_MANAGEMENT', num: '02.12', name: 'PERMISSION MANAGEMENT', tag: 'PERM_MGMT' },
    { code: '02.13_CREDENTIAL_RECOVERY', num: '02.13', name: 'CREDENTIAL RECOVERY', tag: 'REC_CRED' },
    { code: '02.14_SECURITY_EVENTS', num: '02.14', name: 'SECURITY EVENTS', tag: 'SEC_EVT' },
    { code: '02.15_ACCESS_AUDIT', num: '02.15', name: 'ACCESS AUDIT', tag: 'ACC_AUD' },
    { code: '02.16_PRIVILEGED_ACCESS', num: '02.16', name: 'PRIVILEGED ACCESS', tag: 'PRIV_ACC' },
    { code: '02.17_POLICY_MANAGEMENT', num: '02.17', name: 'POLICY MANAGEMENT', tag: 'POL_MGMT' }
  ];

  const rolesList: OperatorRole[] = [
    'SERVICE_AGENT',
    'IDENTITY_ANALYST',
    'BIOMETRIC_OPERATOR',
    'SUPERVISOR',
    'ISSUANCE_OPERATOR',
    'AUDITOR',
    'REPORTING_OFFICER',
    'SYSTEM_ADMIN',
    'GOVERNANCE_ADMIN'
  ];

  return (
    <div className="space-y-4 font-mono select-none text-xs">
      
      {/* TOP HEADER BAR */}
      <div className="p-3.5 rounded-2xl bg-[#111217] border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-extrabold text-white tracking-wider uppercase">
                02 — AUTENTICAÇÃO & GESTÃO DE ACESSOS (IAM / SILA)
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                17 LAYERS
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
              <span>OP: <strong className="text-white">{operator.fullName}</strong></span>
              <span>•</span>
              <span>ROLE: <strong className="text-amber-300">{operator.role}</strong></span>
              <span>•</span>
              <span>ORG: <strong className="text-blue-300">{operator.organization}</strong></span>
            </div>
          </div>
        </div>

        {/* TOP DIRECT ACTIONS */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={onOpenRoleSwitcher}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1"
            title="SWITCH_ROLE"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>ROLE ({operator.role})</span>
          </button>

          {onOpenOrgSelector && (
            <button
              onClick={onOpenOrgSelector}
              className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold text-[11px] flex items-center gap-1"
              title="ORG_SCOPE"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>ORG ({operator.organization})</span>
            </button>
          )}

          <button
            onClick={onOpenPolicyInspector}
            className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-[11px] flex items-center gap-1"
            title="PDP_INSPECT"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>PDP_INSPECT</span>
          </button>

          {onOpenLockSession && (
            <button
              onClick={onOpenLockSession}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-[11px] flex items-center gap-1"
              title="LOCK"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>LOCK</span>
            </button>
          )}
        </div>
      </div>

      {/* 17 CLASSIFICATION LAYERS SELECTOR MATRIX */}
      <div className="p-3 rounded-2xl bg-[#111217] border border-neutral-800 space-y-2 shadow-lg">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            CLASSIFICAÇÃO DAS CAMADAS IAM (02.1 – 02.17)
          </span>
          <div className="relative w-48">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="FILTER LAYER..."
              className="w-full pl-7 pr-2 py-0.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[10px] text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {layersList
            .filter((l) =>
              l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
              l.num.includes(searchFilter) ||
              l.tag.toLowerCase().includes(searchFilter.toLowerCase())
            )
            .map((l) => {
              const isSelected = activeLayer === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => setActiveLayer(l.code)}
                  className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/40 shadow-md'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                  title={l.name}
                >
                  <span className="text-[9px] font-extrabold text-amber-400 font-mono">{l.num}</span>
                  <span className="text-[10px] font-bold truncate tracking-tight">{l.tag}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* DYNAMIC LAYER VIEW CONTENT */}
      <div className="p-4 rounded-2xl bg-[#111217] border border-neutral-800 space-y-3 shadow-2xl">
        
        {/* LAYER TITLE BAR */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-extrabold">
              {layersList.find((l) => l.code === activeLayer)?.num}
            </span>
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              {layersList.find((l) => l.code === activeLayer)?.name}
            </span>
          </div>

          <span className="text-[10px] text-neutral-500 font-mono">
            LAYER_CODE: {activeLayer}
          </span>
        </div>

        {/* 02.1 AUTHENTICATION */}
        {activeLayer === '02.1_AUTHENTICATION' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">METHOD</th>
                  <th className="p-2.5">PROTOCOL</th>
                  <th className="p-2.5 text-center">STATUS</th>
                  <th className="p-2.5 text-center">LAST_AUTH</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-white">PKI_RSA_CARD</td>
                  <td className="p-2.5 text-neutral-400">X.509v3 / GovOS SmartCard</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">VERIFIED</td>
                  <td className="p-2.5 text-center text-neutral-300">{new Date(sessionStart).toLocaleTimeString()}</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenReauth} className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">RE_AUTH</button>
                  </td>
                </tr>
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-white">KERBEROS_INTRANET</td>
                  <td className="p-2.5 text-neutral-400">MJDH.GOV.AO / AD-SSO</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">ACTIVE</td>
                  <td className="p-2.5 text-center text-neutral-300">08:00:00</td>
                  <td className="p-2.5 text-right">
                    <button className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-[10px]">TEST_SSO</button>
                  </td>
                </tr>
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-white">BIOMETRIC_OPERATOR_MATCH</td>
                  <td className="p-2.5 text-neutral-400">WSQ / 1:1 Match Local</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">ENROLLED</td>
                  <td className="p-2.5 text-center text-neutral-300">08:00:05</td>
                  <td className="p-2.5 text-right">
                    <button className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-[10px]">VERIFY_BIO</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.2 SESSION MANAGEMENT */}
        {activeLayer === '02.2_SESSION_MANAGEMENT' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">SESS_ID</th>
                  <th className="p-2.5">OPERATOR / BADGE</th>
                  <th className="p-2.5 text-center">IP_ADDR</th>
                  <th className="p-2.5 text-center">TTL_REMAIN</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-amber-300">SESS-99421-CURR</td>
                  <td className="p-2.5 text-white font-sans font-medium">{operator.fullName} ({operator.badgeNumber})</td>
                  <td className="p-2.5 text-center text-neutral-300">{ipAddress}</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">54m 12s</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenLockSession} className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">LOCK</button>
                  </td>
                </tr>
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-neutral-400">SESS-88102-POSTO1</td>
                  <td className="p-2.5 text-white font-sans font-medium">Manuel António Domingos (CRAC-MJDH-10294)</td>
                  <td className="p-2.5 text-center text-neutral-300">10.220.14.88</td>
                  <td className="p-2.5 text-center text-amber-400 font-bold">12m 04s</td>
                  <td className="p-2.5 text-right">
                    <button className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-[10px]">KILL</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.3 DEVICE TRUST */}
        {activeLayer === '02.3_DEVICE_TRUST' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">DEVICE_NAME</th>
                  <th className="p-2.5">DEVICE_ID</th>
                  <th className="p-2.5">HARDWARE_TPM</th>
                  <th className="p-2.5 text-center">TRUST_STATUS</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-white">{deviceName}</td>
                  <td className="p-2.5 text-amber-300 font-mono">{deviceId}</td>
                  <td className="p-2.5 text-emerald-400 font-bold">TPM 2.0 / HARDENED</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">TRUSTED</span>
                  </td>
                  <td className="p-2.5 text-right">
                    <button className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold text-[10px]">CFG_DEV</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.4 MFA */}
        {activeLayer === '02.4_MFA' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">MFA_FACTOR</th>
                  <th className="p-2.5">PROVIDER</th>
                  <th className="p-2.5 text-center">VERIFIED</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-white">HARDWARE_TOKEN_FIDO2</td>
                  <td className="p-2.5 text-neutral-400">YubiKey GovOS Sec1</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">TRUE</td>
                  <td className="p-2.5 text-right">
                    <button className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]">VERIFY</button>
                  </td>
                </tr>
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-white">TOTP_AUTHENTICATOR</td>
                  <td className="p-2.5 text-neutral-400">GovOS Auth App</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">TRUE</td>
                  <td className="p-2.5 text-right">
                    <button className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">RESET_MFA</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.5 REAUTHENTICATION */}
        {activeLayer === '02.5_REAUTHENTICATION' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">SCOPE</th>
                  <th className="p-2.5">WINDOW_LIMIT</th>
                  <th className="p-2.5 text-center">LAST_CHECK</th>
                  <th className="p-2.5 text-center">STATUS</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-white">CRITICAL_OPS (APPROVE/PRINT)</td>
                  <td className="p-2.5 text-neutral-400">15 MIN</td>
                  <td className="p-2.5 text-center text-amber-300">{new Date(lastReauthenticatedAt).toLocaleTimeString()}</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">VALID</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenReauth} className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">EXEC_REAUTH</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.6 RBAC */}
        {activeLayer === '02.6_RBAC' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">ROLE_CODE</th>
                  <th className="p-2.5">CLEARANCE</th>
                  <th className="p-2.5 text-center">PERMISSIONS_COUNT</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                {rolesList.map((r) => (
                  <tr key={r} className="hover:bg-neutral-900/50">
                    <td className="p-2.5 font-bold text-amber-300">{r}</td>
                    <td className="p-2.5 text-neutral-400">LEVEL {MJDH_OPERATORS[r].clearanceLevel}/5</td>
                    <td className="p-2.5 text-center font-bold text-white">18 PERMS</td>
                    <td className="p-2.5 text-right">
                      <button onClick={onOpenRoleSwitcher} className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">SWAP_ROLE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 02.7 ABAC */}
        {activeLayer === '02.7_ABAC' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">PDP_FACTOR</th>
                  <th className="p-2.5">ATTRIBUTE_VAL</th>
                  <th className="p-2.5 text-center">MATCH_STATUS</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-amber-300">1. SUBJECT_ROLE</td>
                  <td className="p-2.5 text-white">{operator.role}</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">MATCH</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenPolicyInspector} className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-[10px]">PDP_INSPECT</button>
                  </td>
                </tr>
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-blue-300">2. ORG_SCOPE</td>
                  <td className="p-2.5 text-white">{operator.organization}</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">MATCH</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenOrgSelector} className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-[10px]">CHANGE_ORG</button>
                  </td>
                </tr>
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-emerald-300">3. TERRITORY_SCOPE</td>
                  <td className="p-2.5 text-white">{operator.territories.join(', ')}</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">MATCH</td>
                  <td className="p-2.5 text-right">
                    <button className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold text-[10px]">CHK_JUR</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.8 ORGANIZATIONAL SCOPE */}
        {activeLayer === '02.8_ORGANIZATIONAL_SCOPE' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">ORG_CODE</th>
                  <th className="p-2.5">ORGANIZATION_NAME</th>
                  <th className="p-2.5 text-center">JURISDICTION</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-amber-300">MJDH_CENTRAL</td>
                  <td className="p-2.5 text-white">Ministério da Justiça e Direitos Humanos (Central)</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">NACIONAL</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenOrgSelector} className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-[10px]">SELECT</button>
                  </td>
                </tr>
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-amber-300">DNIC_LUANDA</td>
                  <td className="p-2.5 text-white">Direcção Nacional de Identificação Civil (DNIC)</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">PROVINCIAL</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenOrgSelector} className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-[10px]">SELECT</button>
                  </td>
                </tr>
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-amber-300">BALCAO_DIGITAL_NACIONAL</td>
                  <td className="p-2.5 text-white">Balcão Digital Nacional MJDH</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">NACIONAL</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenOrgSelector} className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-[10px]">SELECT</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.9 TERRITORIAL SCOPE */}
        {activeLayer === '02.9_TERRITORIAL_SCOPE' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">SCOPE_CODE</th>
                  <th className="p-2.5">REGION</th>
                  <th className="p-2.5 text-center">TYPE</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-emerald-300">NACIONAL</td>
                  <td className="p-2.5 text-white">Angola (Todos Postos e Conservatórias)</td>
                  <td className="p-2.5 text-center text-neutral-400">REP_ANGOLA</td>
                  <td className="p-2.5 text-right">
                    <button className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]">APPLY</button>
                  </td>
                </tr>
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-emerald-300">LUANDA</td>
                  <td className="p-2.5 text-white">Província de Luanda</td>
                  <td className="p-2.5 text-center text-neutral-400">PROV_SCOPE</td>
                  <td className="p-2.5 text-right">
                    <button className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]">APPLY</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.10 USER MANAGEMENT */}
        {activeLayer === '02.10_USER_MANAGEMENT' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">BADGE</th>
                  <th className="p-2.5">CITIZEN / OPERATOR NAME</th>
                  <th className="p-2.5">ROLE</th>
                  <th className="p-2.5">ORG</th>
                  <th className="p-2.5 text-center">STATUS</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                {Object.values(MJDH_OPERATORS).map((op) => (
                  <tr key={op.badgeNumber} className="hover:bg-neutral-900/50">
                    <td className="p-2.5 font-bold text-amber-300">{op.badgeNumber}</td>
                    {/* CITIZEN / OPERATOR FULL NAME */}
                    <td className="p-2.5 text-white font-sans font-medium">{op.fullName}</td>
                    <td className="p-2.5 text-amber-400 font-bold">{op.role}</td>
                    <td className="p-2.5 text-blue-300">{op.organization}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">ACTIVE</span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button onClick={onOpenRoleSwitcher} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold text-[10px]">EDIT</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 02.11 ROLE MANAGEMENT */}
        {activeLayer === '02.11_ROLE_MANAGEMENT' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">ROLE</th>
                  <th className="p-2.5">ROLE_TITLE</th>
                  <th className="p-2.5 text-center">LVL</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                {rolesList.map((r) => (
                  <tr key={r} className="hover:bg-neutral-900/50">
                    <td className="p-2.5 font-bold text-amber-300">{r}</td>
                    <td className="p-2.5 text-white font-sans">{MJDH_OPERATORS[r].roleTitle}</td>
                    <td className="p-2.5 text-center text-emerald-400 font-bold">{MJDH_OPERATORS[r].clearanceLevel}/5</td>
                    <td className="p-2.5 text-right">
                      <button onClick={onOpenRoleSwitcher} className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">ASSIGN</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 02.12 PERMISSION MANAGEMENT */}
        {activeLayer === '02.12_PERMISSION_MANAGEMENT' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">PERM_CODE</th>
                  <th className="p-2.5">RESOURCE</th>
                  <th className="p-2.5">ACTION</th>
                  <th className="p-2.5 text-center">POLICY</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-amber-300">PROCESS:APPROVE</td>
                  <td className="p-2.5 text-neutral-300">CIVIL_IDENTITY_PROCESS</td>
                  <td className="p-2.5 text-emerald-400 font-bold">APPROVE</td>
                  <td className="p-2.5 text-center text-purple-300 font-bold">ANALYST_OR_SUPERVISOR</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenPolicyInspector} className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-[10px]">CFG_PERM</button>
                  </td>
                </tr>
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-amber-300">CARD:PRINT_LASER</td>
                  <td className="p-2.5 text-neutral-300">EMISSION_LASER_PRINTER</td>
                  <td className="p-2.5 text-emerald-400 font-bold">PRINT</td>
                  <td className="p-2.5 text-center text-purple-300 font-bold">ISSUANCE_OPERATOR_ONLY</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenPolicyInspector} className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-[10px]">CFG_PERM</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.13 CREDENTIAL RECOVERY */}
        {activeLayer === '02.13_CREDENTIAL_RECOVERY' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">RECOVERY_REQ</th>
                  <th className="p-2.5">CITIZEN / OPERATOR</th>
                  <th className="p-2.5">CHANNEL</th>
                  <th className="p-2.5 text-center">STATUS</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-amber-300">REC-2026-00912</td>
                  <td className="p-2.5 text-white font-sans font-medium">{operator.fullName} ({operator.badgeNumber})</td>
                  <td className="p-2.5 text-neutral-400">SMS_INTRANET_2FA</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">READY</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenRecovery} className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">EXEC_REC</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.14 SECURITY EVENTS */}
        {activeLayer === '02.14_SECURITY_EVENTS' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">EVT_ID</th>
                  <th className="p-2.5">TYPE</th>
                  <th className="p-2.5">TARGET / IP</th>
                  <th className="p-2.5 text-center">SEV</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-rose-400">EVT-99201</td>
                  <td className="p-2.5 text-white">OUT_OF_SCOPE_ACCESS_ATTEMPT</td>
                  <td className="p-2.5 text-neutral-400">10.220.14.99 (CRAC-MJDH-10294)</td>
                  <td className="p-2.5 text-center text-rose-400 font-bold">HIGH</td>
                  <td className="p-2.5 text-right">
                    <button className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-[10px]">ACK</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.15 ACCESS AUDIT */}
        {activeLayer === '02.15_ACCESS_AUDIT' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">TIME</th>
                  <th className="p-2.5">SUBJECT</th>
                  <th className="p-2.5">RESOURCE</th>
                  <th className="p-2.5 text-center">DECISION</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-amber-300">{new Date().toLocaleTimeString()}</td>
                  <td className="p-2.5 text-white font-sans">{operator.fullName} ({operator.badgeNumber})</td>
                  <td className="p-2.5 text-neutral-400">PROCESS_BI_2026_00129</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">PERMIT</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenPolicyInspector} className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-[10px]">VERIFY_PDP</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.16 PRIVILEGED ACCESS */}
        {activeLayer === '02.16_PRIVILEGED_ACCESS' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">TYPE</th>
                  <th className="p-2.5">REF_DISPATCH</th>
                  <th className="p-2.5">SUPERVISOR</th>
                  <th className="p-2.5 text-center">STATUS</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-amber-300">BREAK_GLASS_EMERGENCY</td>
                  <td className="p-2.5 text-white">DESPACHO-MJDH-2026/0819</td>
                  <td className="p-2.5 text-neutral-400">Gabinete do Secretário de Estado</td>
                  <td className="p-2.5 text-center text-amber-400 font-bold">CONFIGURED</td>
                  <td className="p-2.5 text-right">
                    {onOpenBreakGlass && (
                      <button onClick={onOpenBreakGlass} className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">ACTIVATE</button>
                    )}
                  </td>
                </tr>
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-blue-300">FORMAL_DELEGATION</td>
                  <td className="p-2.5 text-white">MANDATO-DEL-2026/012</td>
                  <td className="p-2.5 text-neutral-400">Dra. Maria Esperança (DNIC)</td>
                  <td className="p-2.5 text-center text-blue-400 font-bold">READY</td>
                  <td className="p-2.5 text-right">
                    {onOpenDelegation && (
                      <button onClick={onOpenDelegation} className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-[10px]">DELEGATE</button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 02.17 POLICY MANAGEMENT */}
        {activeLayer === '02.17_POLICY_MANAGEMENT' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">POLICY_ID</th>
                  <th className="p-2.5">ENGINE</th>
                  <th className="p-2.5">RULE_SUMMARY</th>
                  <th className="p-2.5 text-center">STATE</th>
                  <th className="p-2.5 text-right">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                <tr className="hover:bg-neutral-900/50">
                  <td className="p-2.5 font-bold text-purple-300">POL-ABAC-MJDH-v4.2</td>
                  <td className="p-2.5 text-neutral-400">XACML / PDP Serverless Engine</td>
                  <td className="p-2.5 text-white">Enforce Duty Separation & 6 Context Factors</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">ENFORCING</td>
                  <td className="p-2.5 text-right">
                    <button onClick={onOpenPolicyInspector} className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-[10px]">INSPECT</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
