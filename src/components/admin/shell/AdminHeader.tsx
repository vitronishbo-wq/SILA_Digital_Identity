import React, { useState } from 'react';
import { AdminNavTab } from '../../../types/identity';
import { getCurrentSession } from '../../../services/accessControlService';
import { OrganizationalScope } from '../../../types/auth';
import {
  Search,
  Bell,
  Shield,
  Activity,
  CheckCircle2,
  Crown,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
  AlertCircle,
  UserCheck,
  Lock,
  Sparkles,
  Building2
} from 'lucide-react';

interface AdminHeaderProps {
  activeTab: AdminNavTab;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTabChange: (tab: AdminNavTab) => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  onOpenRoleSwitcher?: () => void;
  onOpenReauth?: () => void;
  onOpenPolicyInspector?: () => void;
  currentOrgScope?: OrganizationalScope;
  currentOrgName?: string;
  onOpenOrgSelector?: () => void;
  notificationsCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  onTabChange,
  onOpenProfile,
  onLogout,
  onOpenRoleSwitcher,
  onOpenReauth,
  onOpenPolicyInspector,
  currentOrgScope,
  currentOrgName,
  onOpenOrgSelector,
  notificationsCount = 3
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const currentSession = getCurrentSession();
  const { operator } = currentSession;

  const getBreadcrumbLabel = (tab: AdminNavTab) => {
    switch (tab) {
      case 'INICIO': return '01_INICIO';
      case 'AUTENTICACAO': return '02_IAM_ACESSOS';
      case 'PROCESSOS': return '03_PROCESSOS';
      case 'CIDAOES': return '04_CIDADAOS';
      case 'IDENTIDADE': return '05_IDENTIDADE';
      case 'BI': return '06_BI_CARDS';
      case 'TERRITORIOS': return '07_TERRITORIOS';
      case 'AGENDAMENTOS': return '08_AGENDAMENTOS';
      case 'ATENDIMENTO': return '09_BALCAO';
      case 'VALIDACOES': return '10_VALIDACOES';
      case 'EMISSAO': return '11_EMISSAO';
      case 'AUDITORIA': return '12_AUDITORIA';
      case 'RELATORIOS': return '13_RELATORIOS';
      case 'CONFIGURACOES': return '14_CONFIGURACOES';
      default: return tab;
    }
  };

  const sampleNotifications = [
    { id: 1, title: 'REQ-000189', desc: 'SUBMITTED_DIGITAL', time: '5m', type: 'info' },
    { id: 2, title: 'BIO_APPROVAL', desc: 'PENDING_LUANDA', time: '18m', type: 'warning' },
    { id: 3, title: 'BATCH_4812', desc: 'RSA4096_SIGNED', time: '1h', type: 'success' }
  ];

  return (
    <header className="space-y-2 font-mono select-none">
      {/* HEADER TOP BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#111217] border border-neutral-800 shadow-xl">
        
        {/* BRAND & BREADCRUMB */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-amber-400 tracking-wider">
              SILA / GOVOS
            </span>
            <span className="text-neutral-700">|</span>
            <button
              onClick={onOpenOrgSelector}
              className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer"
              title="ORG_SCOPE"
            >
              <Building2 className="w-3 h-3 text-amber-400" />
              <span>{currentOrgScope || 'MJDH_CENTRAL'}</span>
              <ChevronDown className="w-3 h-3 text-amber-400/70" />
            </button>
          </div>

          <span className="text-neutral-700 hidden sm:inline">&gt;</span>

          {/* BREADCRUMB */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400">
            <span className="text-neutral-300 hidden sm:inline uppercase">
              {currentOrgName || 'MJDH'}
            </span>
            <span className="text-neutral-700 hidden sm:inline">&gt;</span>
            <span className="text-amber-300 uppercase bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
              {getBreadcrumbLabel(activeTab)}
            </span>
          </div>
        </div>

        {/* STATUS, NOTIFICATIONS & USER MENU */}
        <div className="flex items-center justify-between lg:justify-end gap-2 pt-1 lg:pt-0 border-t lg:border-t-0 border-neutral-800">
          
          {/* SYSTEM STATUS & SESSION INDICATOR */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYS_ONLINE (24ms)</span>
            </div>

            <div className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px]">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>SESS_ACTIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* NOTIFICATIONS BUTTON & DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className={`p-1.5 rounded-xl border transition-colors relative ${
                  showNotifications
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
                title="ALERTS"
              >
                <Bell className="w-3.5 h-3.5" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-neutral-950 font-extrabold text-[8px] flex items-center justify-center">
                    {notificationsCount}
                  </span>
                )}
              </button>

              {/* Notifications Popup Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#111217] border border-neutral-800 shadow-2xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Bell className="w-3 h-3 text-amber-400" />
                      SYSTEM ALERTS
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-neutral-500 hover:text-white p-1 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                    {sampleNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[10px]"
                      >
                        <span className="font-bold text-white">{n.title}: <strong className="text-neutral-400">{n.desc}</strong></span>
                        <span className="text-neutral-500 text-[9px]">{n.time}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onTabChange('AUDITORIA');
                    }}
                    className="w-full text-center py-1 text-[10px] font-bold text-amber-400 hover:underline"
                  >
                    AUDIT_LOGS &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* USER MENU BUTTON & DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-1.5 p-1 px-2 rounded-xl border transition-all ${
                  showUserMenu
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                  <Crown className="w-3 h-3 text-amber-400" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] font-bold text-white leading-tight truncate max-w-[90px]">{operator.fullName}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>

              {/* User Menu Popup */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#111217] border border-neutral-800 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 mb-1">
                    <span className="text-xs font-bold text-white block truncate">{operator.fullName}</span>
                    <span className="text-[9px] text-amber-400 block font-mono">{operator.role} • {operator.badgeNumber}</span>
                  </div>

                  {onOpenOrgSelector && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenOrgSelector();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-blue-300 hover:bg-blue-500/10 font-bold"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>ORG_SCOPE ({currentOrgScope || 'MJDH'})</span>
                    </button>
                  )}

                  {onOpenRoleSwitcher && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenRoleSwitcher();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-amber-300 hover:bg-amber-500/10 font-bold"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>SWAP_ROLE ({operator.role})</span>
                    </button>
                  )}

                  {onOpenReauth && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenReauth();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-neutral-300 hover:bg-neutral-900"
                    >
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>RE_AUTH</span>
                    </button>
                  )}

                  {onOpenPolicyInspector && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenPolicyInspector();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-purple-300 hover:bg-purple-500/10 font-bold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>PDP_INSPECT</span>
                    </button>
                  )}

                  <div className="border-t border-neutral-800 my-1 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>EXIT_PORTAL</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* GLOBAL SEARCH BAR */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="SEARCH BI / PROC / NAME / PROV..."
          className="w-full rounded-xl pl-9 pr-8 py-2 text-xs font-mono font-bold bg-[#111217] border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </header>
  );
};
