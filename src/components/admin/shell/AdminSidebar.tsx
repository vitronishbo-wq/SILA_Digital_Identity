import React from 'react';
import { AdminNavTab } from '../../../types/identity';
import { SilaLogo } from '../../common/SilaLogo';
import {
  LayoutDashboard,
  Inbox,
  Users,
  ShieldCheck,
  FileCheck,
  MapPin,
  Calendar,
  UserCheck,
  Award,
  RefreshCw,
  FileText,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Crown,
  LogOut,
  ExternalLink,
  User
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: AdminNavTab;
  onTabChange: (tab: AdminNavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCitizenPwa?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export interface SidebarLinkItem {
  id: AdminNavTab;
  label: string;
  icon: React.ReactNode;
}

export const SIDEBAR_ITEMS: SidebarLinkItem[] = [
  { id: 'INICIO', label: 'INÍCIO', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'PROCESSOS', label: 'PROCESSOS', icon: <Inbox className="w-4 h-4" /> },
  { id: 'CIDAOES', label: 'CIDADÃOS', icon: <Users className="w-4 h-4" /> },
  { id: 'IDENTIDADE', label: 'IDENTIDADE', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'BI', label: 'BI', icon: <FileCheck className="w-4 h-4" /> },
  { id: 'TERRITORIOS', label: 'TERRITÓRIOS', icon: <MapPin className="w-4 h-4" /> },
  { id: 'AGENDAMENTOS', label: 'AGENDAMENTOS', icon: <Calendar className="w-4 h-4" /> },
  { id: 'ATENDIMENTO', label: 'ATENDIMENTO', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'VALIDACOES', label: 'VALIDAÇÕES', icon: <Award className="w-4 h-4" /> },
  { id: 'EMISSAO', label: 'EMISSÃO', icon: <RefreshCw className="w-4 h-4" /> },
  { id: 'AUDITORIA', label: 'AUDITORIA', icon: <FileText className="w-4 h-4" /> },
  { id: 'RELATORIOS', label: 'RELATÓRIOS', icon: <BarChart2 className="w-4 h-4" /> },
  { id: 'CONFIGURACOES', label: 'CONFIGURAÇÕES', icon: <Settings className="w-4 h-4" /> },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onOpenCitizenPwa,
  onOpenProfile,
  onLogout
}) => {
  return (
    <aside
      className={`bg-[#111217] border-b md:border-b-0 md:border-r border-neutral-800/80 transition-all duration-300 flex flex-col justify-between shrink-0 font-mono select-none ${
        isCollapsed ? 'w-full md:w-20 p-3' : 'w-full md:w-64 p-4 md:p-5'
      }`}
    >
      <div>
        {/* Header with Collapse Toggle Button */}
        <div className="pb-4 border-b border-neutral-800/80 flex items-center justify-between">
          {!isCollapsed ? (
            <SilaLogo size="sm" showSubtitle={false} />
          ) : (
            <div className="mx-auto text-amber-400 font-extrabold text-xs tracking-tighter">
              SILA
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors mx-auto md:mx-0"
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            aria-label={isCollapsed ? 'Expandir Sidebar' : 'Recolher Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* SuperAdmin Operator Card */}
        {!isCollapsed && (
          <div className="my-3 flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-900/90 border border-amber-500/30">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-amber-400 uppercase truncate">Deusfundador</span>
              <span className="text-[9px] text-neutral-400">MJDH SuperAdmin</span>
            </div>
          </div>
        )}

        {/* Navigation Items (Exclusivamente navegação global) */}
        <nav className="space-y-1 mt-3 max-h-[calc(100vh-230px)] overflow-y-auto pr-1 custom-scrollbar">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className="shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* RODAPÉ DA SIDEBAR */}
      <div className="pt-3 mt-2 border-t border-neutral-800/80 space-y-1.5">
        {/* 1. Ir para Citizen PWA */}
        {onOpenCitizenPwa && (
          <button
            onClick={onOpenCitizenPwa}
            title={isCollapsed ? 'Ir para Citizen PWA' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-amber-300 text-xs font-mono transition-colors ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              {!isCollapsed && <span className="truncate">Citizen PWA</span>}
            </div>
            {!isCollapsed && <span className="text-[10px] text-neutral-500">&rarr;</span>}
          </button>
        )}

        {/* 2. Perfil */}
        <button
          onClick={onOpenProfile || (() => onTabChange('CONFIGURACOES'))}
          title={isCollapsed ? 'Perfil do Operador' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-neutral-900/40 hover:bg-neutral-900 text-neutral-400 hover:text-white text-xs font-mono transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <User className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
          {!isCollapsed && <span>Perfil</span>}
        </button>

        {/* 3. Sair */}
        <button
          onClick={onLogout}
          title={isCollapsed ? 'Encerrar Sessão' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
};
