import React, { useState } from 'react';
import { AdminNavTab } from '../../../types/identity';
import { getCurrentSession } from '../../../services/accessControlService';
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
  Sparkles
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
  notificationsCount = 3
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const currentSession = getCurrentSession();
  const { operator } = currentSession;

  const getBreadcrumbLabel = (tab: AdminNavTab) => {
    switch (tab) {
      case 'INICIO': return 'INÍCIO DO PORTAL';
      case 'PROCESSOS': return 'GESTÃO DE PROCESSOS';
      case 'CIDAOES': return 'REGISTO DE CIDADÃOS';
      case 'IDENTIDADE': return 'SERVIÇOS DE IDENTIDADE';
      case 'BI': return 'BILHETE DE IDENTIDADE (BI)';
      case 'TERRITORIOS': return 'GESTÃO DE TERRITÓRIOS';
      case 'AGENDAMENTOS': return 'AGENDAMENTOS & ATENDIMENTO';
      case 'ATENDIMENTO': return 'BALCÃO DE ATENDIMENTO';
      case 'VALIDACOES': return 'AUDITORIA DE VALIDAÇÕES';
      case 'EMISSAO': return 'CENTRAL DE EMISSÃO';
      case 'AUDITORIA': return 'LOGS DE AUDITORIA';
      case 'RELATORIOS': return 'RELATÓRIOS E ESTATÍSTICAS';
      case 'CONFIGURACOES': return 'CONFIGURAÇÕES DO SISTEMA';
      default: return tab;
    }
  };

  const sampleNotifications = [
    { id: 1, title: 'Novo processo recebido', desc: 'Processo REQ-000189 submetido via Balcão Digital', time: 'Há 5m', type: 'info' },
    { id: 2, title: 'Validação biométrica pendente', desc: 'Aprovação requerida em Luanda Central', time: 'Há 18m', type: 'warning' },
    { id: 3, title: 'Emissão concluída', desc: 'Lote #4812 emitido com assinatura RSA-4096', time: 'Há 1h', type: 'success' }
  ];

  return (
    <header className="space-y-3 font-mono select-none">
      {/* HEADER TOP BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 md:p-4 rounded-2xl bg-[#111217] border border-neutral-800 shadow-xl">
        
        {/* BRAND & BREADCRUMB */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white tracking-widest bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              SILA GOVOS
            </span>
            <span className="text-neutral-600 font-light">|</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              MJDH
            </span>
          </div>

          <span className="text-neutral-700 hidden sm:inline">&gt;</span>

          {/* BREADCRUMB */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400">
            <span className="text-neutral-500 hidden sm:inline">MINISTÉRIO DA JUSTIÇA E DOS DIREITOS HUMANOS</span>
            <span className="text-neutral-600 hidden sm:inline">&gt;</span>
            <span className="text-amber-300 uppercase tracking-wide bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-lg">
              {getBreadcrumbLabel(activeTab)}
            </span>
          </div>
        </div>

        {/* STATUS, NOTIFICATIONS & USER MENU */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-800">
          
          {/* SYSTEM STATUS & SESSION INDICATOR */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* System Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="uppercase tracking-wider">ONLINE (24ms)</span>
            </div>

            {/* Session Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px]">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Sessão MJDH Ativa</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* NOTIFICATIONS BUTTON & DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className={`p-2 rounded-xl border transition-colors relative ${
                  showNotifications
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
                title="Notificações do Sistema"
                aria-label="Abrir Notificações"
              >
                <Bell className="w-4 h-4" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 font-bold text-[9px] flex items-center justify-center animate-pulse">
                    {notificationsCount}
                  </span>
                )}
              </button>

              {/* Notifications Popup Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#111217] border border-neutral-800 shadow-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      NOTIFICAÇÕES (MJDH)
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-neutral-500 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {sampleNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-colors flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white">{n.title}</span>
                          <span className="text-[9px] text-neutral-500">{n.time}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-sans leading-tight">
                          {n.desc}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onTabChange('AUDITORIA');
                    }}
                    className="w-full text-center py-1.5 text-[10px] font-bold text-amber-400 hover:underline pt-1"
                  >
                    Ver todos os Alertas na Auditoria &rarr;
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
                className={`flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border transition-all ${
                  showUserMenu
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] font-bold text-white leading-tight truncate max-w-[100px]">{operator.fullName}</span>
                  <span className="text-[8px] text-amber-400 leading-none">{operator.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {/* User Menu Popup */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111217] border border-neutral-800 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 mb-1">
                    <span className="text-xs font-bold text-white block truncate">{operator.fullName}</span>
                    <span className="text-[9px] text-amber-400 block font-mono">{operator.roleTitle}</span>
                    <span className="text-[8px] text-neutral-500 block truncate">{operator.badgeNumber} • {operator.organizationName}</span>
                  </div>

                  {onOpenRoleSwitcher && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenRoleSwitcher();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-amber-300 hover:bg-amber-500/10 transition-colors font-bold"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Trocar Função RBAC/ABAC</span>
                    </button>
                  )}

                  {onOpenReauth && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenReauth();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:bg-neutral-900 hover:text-amber-300 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Reautenticar Sessão</span>
                    </button>
                  )}

                  {onOpenPolicyInspector && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenPolicyInspector();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-purple-300 hover:bg-purple-500/10 transition-colors font-bold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Simulador de Políticas PDP</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onOpenProfile) onOpenProfile();
                      else onTabChange('CONFIGURACOES');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:bg-neutral-900 hover:text-amber-300 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Perfil do Operador</span>
                  </button>

                  <div className="border-t border-neutral-800 my-1 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Sair do Portal</span>
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
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar globalmente por Nº de BI, Processo, Nome do Cidadão ou Província..."
          className="w-full rounded-2xl pl-10 pr-10 py-2.5 text-xs font-mono font-semibold bg-[#111217] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 shadow-inner transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
