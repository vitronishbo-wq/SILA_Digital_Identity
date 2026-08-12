import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Shield,
  Activity,
  Lock,
  Flame,
  AlertOctagon,
  Users,
  RefreshCw,
  Building2,
  MapPin,
  Clock,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Check,
  X,
  FileText,
  Sliders,
  Laptop,
  Globe2,
  ListTodo,
  ShieldAlert,
  ArrowRight,
  Filter,
  Sparkles,
  KeyRound,
  History
} from 'lucide-react';
import {
  EnvironmentType,
  TimeframeFilter,
  AutoRefreshRate,
  ServiceHealth,
  OperationalTask,
  SystemIncident,
  NotificationItem,
  AdminAuditEntry,
  DelegationSession,
  BreakGlassSession,
  INITIAL_SERVICES_HEALTH,
  INITIAL_TASKS,
  INITIAL_INCIDENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MY_AUDIT_LOGS
} from '../../../services/dashboardOpsService';
import { getCurrentSession } from '../../../services/accessControlService';
import { OrganizationalScope } from '../../../types/auth';

interface InicioDashboardTabProps {
  onOpenProcessTab: (processNumber?: string) => void;
  onOpenAuditTab: () => void;
  onOpenLockSession: () => void;
  onOpenKillSessions: () => void;
  onOpenBreakGlass: () => void;
  onOpenDelegation: () => void;
  onOpenOrgSelector: () => void;
  breakGlassSession: BreakGlassSession;
  delegationSession: DelegationSession;
  currentOrgScope: OrganizationalScope;
  currentOrgName: string;
}

export const InicioDashboardTab: React.FC<InicioDashboardTabProps> = ({
  onOpenProcessTab,
  onOpenAuditTab,
  onOpenLockSession,
  onOpenKillSessions,
  onOpenBreakGlass,
  onOpenDelegation,
  onOpenOrgSelector,
  breakGlassSession,
  delegationSession,
  currentOrgScope,
  currentOrgName
}) => {
  const session = getCurrentSession();
  const { operator } = session;

  // LOCAL OPERATIONAL STATES
  const [environment, setEnvironment] = useState<EnvironmentType>('DEMO');
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('HOJE');
  const [territoryScope, setTerritoryScope] = useState<string>('LUANDA');
  const [autoRefresh, setAutoRefresh] = useState<AutoRefreshRate>('30S');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Agora');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // DATA COLLECTIONS
  const [services, setServices] = useState<ServiceHealth[]>(INITIAL_SERVICES_HEALTH);
  const [tasks, setTasks] = useState<OperationalTask[]>(INITIAL_TASKS);
  const [incidents, setIncidents] = useState<SystemIncident[]>(INITIAL_INCIDENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditEntry[]>(INITIAL_MY_AUDIT_LOGS);

  // ACTIVE SUB-PANEL VIEW IN DASHBOARD
  const [activeView, setActiveView] = useState<'TAREFAS' | 'SERVICOS' | 'INCIDENTES' | 'AUDITORIA'>('TAREFAS');

  // CONFIRMATION DIALOG STATE
  const [selectedTaskAction, setSelectedTaskAction] = useState<{ task: OperationalTask; action: 'APROVAR' | 'AUDITAR' | 'REJEITAR' } | null>(null);

  // AUTO-REFRESH EFFECT
  useEffect(() => {
    if (autoRefresh === 'OFF') return;
    const intervalMs = autoRefresh === '10S' ? 10000 : autoRefresh === '30S' ? 30000 : 60000;
    const timer = setInterval(() => {
      triggerManualRefresh();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const triggerManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 600);
  };

  const handleExecuteTaskAction = (taskId: string, actionName: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const newAuditEntry: AdminAuditEntry = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      action: `TAREFA_${actionName}`,
      resource: 'PROCESS',
      targetId: taskId,
      ipAddress: '10.220.14.89',
      status: 'SUCESSO',
      details: `Executada ação ${actionName} pelo operador ${operator.badgeNumber}.`
    };
    setAuditLogs((prev) => [newAuditEntry, ...prev]);
  };

  return (
    <div className="space-y-4 font-mono select-none text-xs">
      
      {/* 1. ENV & SCOPE BAR */}
      <div className="p-3 rounded-2xl bg-[#111217] border border-neutral-800 shadow-xl flex flex-wrap items-center justify-between gap-2">
        
        <div className="flex flex-wrap items-center gap-2">
          {/* ENV TAG & SELECTOR */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-extrabold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>ENV: {environment}</span>
          </div>

          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
            className="px-2 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-neutral-300 focus:outline-none focus:border-amber-500"
            title="ENV"
          >
            <option value="DEMO">DEMO</option>
            <option value="STAGING">STG</option>
            <option value="PRODUCTION">PRD</option>
          </select>

          {/* ORG SCOPE SELECTOR MODAL TRIGGER */}
          <button
            onClick={onOpenOrgSelector}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold hover:bg-blue-500/20 transition-all text-[11px]"
            title="ORG"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>ORG: {currentOrgScope}</span>
          </button>

          {/* JURISDICTION CONTEXT */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-bold">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-neutral-500">JUR:</span>
            <select
              value={territoryScope}
              onChange={(e) => setTerritoryScope(e.target.value)}
              className="bg-transparent text-emerald-400 font-extrabold focus:outline-none"
              title="JUR"
            >
              <option value="NACIONAL">NAC</option>
              <option value="LUANDA">LDA</option>
              <option value="CAZENGA">CZG</option>
              <option value="TALATONA">TLT</option>
            </select>
          </div>
        </div>

        {/* TIMEFRAME & SYNC */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as TimeframeFilter)}
              className="bg-transparent text-white font-bold focus:outline-none"
              title="TTL"
            >
              <option value="HOJE">HOJE</option>
              <option value="24H">24H</option>
              <option value="7D">7D</option>
              <option value="30D">30D</option>
              <option value="MES_ATUAL">MÊS</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1">
            <span className="text-neutral-500">SYNC:</span>
            <select
              value={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.value as AutoRefreshRate)}
              className="bg-transparent text-amber-300 font-bold focus:outline-none"
              title="SYNC"
            >
              <option value="OFF">OFF</option>
              <option value="10S">10S</option>
              <option value="30S">30S</option>
              <option value="60S">60S</option>
            </select>
          </div>

          <button
            onClick={triggerManualRefresh}
            disabled={isRefreshing}
            className={`p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all ${
              isRefreshing ? 'animate-spin text-amber-400' : ''
            }`}
            title={`SYNC (${lastSyncTime})`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ACTIVE BANNERS */}
      {breakGlassSession.active && (
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/50 text-amber-300 text-[11px] font-bold flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
            <span>BRK-GLS: {breakGlassSession.legalTicketRef}</span>
          </div>
          <button
            onClick={onOpenBreakGlass}
            className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-neutral-950 text-[10px] font-extrabold uppercase"
          >
            OFF / CFG
          </button>
        </div>
      )}

      {delegationSession.active && (
        <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/50 text-blue-300 text-[11px] font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400 shrink-0" />
            <span>DEL-AUTH: {delegationSession.dispatchRef} ({delegationSession.supervisorName})</span>
          </div>
          <button
            onClick={onOpenDelegation}
            className="px-2.5 py-0.5 rounded-lg bg-blue-500 text-white text-[10px] font-extrabold uppercase"
          >
            OFF
          </button>
        </div>
      )}

      {/* 2. COMMANDS BAR (MODAL SELECTORS & DIRECT ACTIONS) */}
      <div className="p-2.5 rounded-2xl bg-[#111217] border border-neutral-800 shadow-xl flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          CMD / OPS
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={onOpenLockSession}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-amber-500/20 border border-neutral-800 text-neutral-300 font-bold flex items-center gap-1 transition-all text-[11px]"
            title="LOCK"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>LOCK</span>
          </button>

          <button
            onClick={onOpenBreakGlass}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-amber-500/20 border border-neutral-800 text-amber-400 font-bold flex items-center gap-1 transition-all text-[11px]"
            title="BRK-GLS"
          >
            <AlertOctagon className="w-3 h-3 text-amber-400" />
            <span>BRK-GLS</span>
          </button>

          <button
            onClick={onOpenDelegation}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-blue-500/20 border border-neutral-800 text-blue-300 font-bold flex items-center gap-1 transition-all text-[11px]"
            title="DEL-AUTH"
          >
            <Users className="w-3 h-3 text-blue-400" />
            <span>DEL-AUTH</span>
          </button>

          {(operator.role === 'SUPERVISOR' || operator.role === 'SYSTEM_ADMIN' || operator.role === 'GOVERNANCE_ADMIN') && (
            <button
              onClick={onOpenKillSessions}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold flex items-center gap-1 transition-all text-[11px]"
              title="SYS-PURGE"
            >
              <Flame className="w-3 h-3 text-rose-500" />
              <span>SYS-PURGE</span>
            </button>
          )}

          <button
            onClick={() => setActiveView('AUDITORIA')}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold flex items-center gap-1 transition-all text-[11px]"
            title="MY-AUD"
          >
            <History className="w-3 h-3 text-purple-400" />
            <span>MY-AUD</span>
          </button>
        </div>
      </div>

      {/* 3. DENSE TABULAR KPI MATRIX (REPLACED ALL CARDS) */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-[#111217]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
            <tr>
              <th className="p-2.5">KPI</th>
              <th className="p-2.5 text-center">VAL</th>
              <th className="p-2.5 text-center">DELTA / STAT</th>
              <th className="p-2.5 text-right">SCOPE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 text-[11px]">
            <tr className="hover:bg-neutral-900/40">
              <td className="p-2.5 font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                PROC_PEND
              </td>
              <td className="p-2.5 text-center font-extrabold text-white">1.284</td>
              <td className="p-2.5 text-center text-emerald-400 font-bold">+12.4% 24H</td>
              <td className="p-2.5 text-right text-neutral-500">{currentOrgScope}</td>
            </tr>
            <tr className="hover:bg-neutral-900/40">
              <td className="p-2.5 font-bold text-amber-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                TASKS_ACT
              </td>
              <td className="p-2.5 text-center font-extrabold text-amber-300">{tasks.length}</td>
              <td className="p-2.5 text-center text-amber-400 font-bold">REQ_ACT</td>
              <td className="p-2.5 text-right text-neutral-500">{operator.role}</td>
            </tr>
            <tr className="hover:bg-neutral-900/40">
              <td className="p-2.5 font-bold text-rose-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                AFIS_DUP
              </td>
              <td className="p-2.5 text-center font-extrabold text-rose-300">3</td>
              <td className="p-2.5 text-center text-rose-400 font-bold">HIGH_PRIO</td>
              <td className="p-2.5 text-right text-neutral-500">BIO_AFIS</td>
            </tr>
            <tr className="hover:bg-neutral-900/40">
              <td className="p-2.5 font-bold text-emerald-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                BI_EMIT
              </td>
              <td className="p-2.5 text-center font-extrabold text-emerald-300">482</td>
              <td className="p-2.5 text-center text-emerald-400 font-bold">RSA-4096 OK</td>
              <td className="p-2.5 text-right text-neutral-500">MJDH_PKI</td>
            </tr>
            <tr className="hover:bg-neutral-900/40">
              <td className="p-2.5 font-bold text-blue-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                OPS_ONLINE
              </td>
              <td className="p-2.5 text-center font-extrabold text-blue-300">148</td>
              <td className="p-2.5 text-center text-neutral-400 font-bold">18 POSTS</td>
              <td className="p-2.5 text-right text-neutral-500">INTRANET</td>
            </tr>
            <tr className="hover:bg-neutral-900/40">
              <td className="p-2.5 font-bold text-purple-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                SRV_UPTIME
              </td>
              <td className="p-2.5 text-center font-extrabold text-purple-300">99.8%</td>
              <td className="p-2.5 text-center text-emerald-400 font-bold">6/6 NODES</td>
              <td className="p-2.5 text-right text-neutral-500">GOVOS_NET</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. MAIN SUB-PANEL TABS */}
      <div className="p-4 rounded-2xl bg-[#111217] border border-neutral-800 space-y-3 shadow-2xl">
        
        {/* TAB BUTTONS */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveView('TAREFAS')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1.5 ${
                activeView === 'TAREFAS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-amber-400" />
              <span>TASKS ({tasks.length})</span>
            </button>

            <button
              onClick={() => setActiveView('SERVICOS')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1.5 ${
                activeView === 'SERVICOS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>SRV ({services.length})</span>
            </button>

            <button
              onClick={() => setActiveView('INCIDENTES')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1.5 ${
                activeView === 'INCIDENTES'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>INC ({incidents.length})</span>
            </button>

            <button
              onClick={() => setActiveView('AUDITORIA')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1.5 ${
                activeView === 'AUDITORIA'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>AUD ({auditLogs.length})</span>
            </button>
          </div>

          <button
            onClick={() => onOpenProcessTab()}
            className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1 shrink-0"
          >
            <span>PROC-DOC &rarr;</span>
          </button>
        </div>

        {/* SUB-VIEW 1: TASKS */}
        {activeView === 'TAREFAS' && (
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-neutral-500 text-xs rounded-xl bg-neutral-950 border border-neutral-800">
                EMPTY_TASKS
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                    <tr>
                      <th className="p-2.5">PROC</th>
                      <th className="p-2.5">CITIZEN / UTENTE</th>
                      <th className="p-2.5">TASK</th>
                      <th className="p-2.5 text-center">PRIO</th>
                      <th className="p-2.5 text-center">ACT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-neutral-900/50">
                        <td className="p-2.5 font-bold text-amber-300 whitespace-nowrap">
                          {t.processNumber}
                          <span className="block text-[9px] text-neutral-500">{t.createdAt}</span>
                        </td>
                        {/* ONLY CITIZEN DATA IS FULL TEXT */}
                        <td className="p-2.5 text-white font-sans font-medium whitespace-nowrap">{t.citizenName}</td>
                        <td className="p-2.5 text-neutral-300 font-sans text-xs">
                          {t.taskTitle}
                          <span className="block text-[9px] font-mono text-neutral-500">{t.category}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                            t.priority === 'CRITICA'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : t.priority === 'ALTA'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleExecuteTaskAction(t.id, 'APROVADA')}
                              className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1"
                              title="APR"
                            >
                              <Check className="w-3 h-3" />
                              <span>APR</span>
                            </button>

                            <button
                              onClick={() => onOpenProcessTab(t.processNumber)}
                              className="px-2 py-0.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center gap-1"
                              title="AUD"
                            >
                              <Eye className="w-3 h-3" />
                              <span>AUD</span>
                            </button>

                            <button
                              onClick={() => handleExecuteTaskAction(t.id, 'REJEITADA')}
                              className="px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[10px] font-bold flex items-center gap-1"
                              title="REJ"
                            >
                              <X className="w-3 h-3" />
                              <span>REJ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SUB-VIEW 2: SERVICES DENSE TABLE */}
        {activeView === 'SERVICOS' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">SERVICE</th>
                  <th className="p-2.5">CAT</th>
                  <th className="p-2.5 text-center">LATENCY</th>
                  <th className="p-2.5 text-center">UPTIME</th>
                  <th className="p-2.5 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-900/50">
                    <td className="p-2.5 font-bold text-white">{s.name}</td>
                    <td className="p-2.5 text-neutral-400">{s.category}</td>
                    <td className="p-2.5 text-center font-bold text-amber-300">{s.latencyMs}ms</td>
                    <td className="p-2.5 text-center font-bold text-emerald-400">{s.uptimePercent}%</td>
                    <td className="p-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        s.status === 'HEALTHY'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : s.status === 'DEGRADED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUB-VIEW 3: INCIDENTS TABLE */}
        {activeView === 'INCIDENTES' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">CODE</th>
                  <th className="p-2.5">INCIDENT</th>
                  <th className="p-2.5">SCOPE</th>
                  <th className="p-2.5 text-center">ACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-neutral-900/50">
                    <td className="p-2.5 font-bold text-rose-400">{inc.code}</td>
                    <td className="p-2.5 text-white font-sans font-medium">
                      {inc.title}
                      <span className="block text-[9px] text-neutral-500 font-mono">{inc.reportedAt}</span>
                    </td>
                    <td className="p-2.5 text-neutral-300 text-xs font-mono">
                      {inc.serviceAffected} ({inc.impactScope})
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => {
                          setIncidents((prev) => prev.filter((i) => i.id !== inc.id));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold"
                        title="FIX"
                      >
                        FIX
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUB-VIEW 4: AUDIT TRAIL */}
        {activeView === 'AUDITORIA' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
                <tr>
                  <th className="p-2.5">TIME</th>
                  <th className="p-2.5">ACT</th>
                  <th className="p-2.5">TARGET</th>
                  <th className="p-2.5">IP</th>
                  <th className="p-2.5">STATUS</th>
                  <th className="p-2.5">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                {auditLogs.map((a) => (
                  <tr key={a.id} className="hover:bg-neutral-900/50">
                    <td className="p-2.5 font-bold text-amber-300">{a.timestamp}</td>
                    <td className="p-2.5 text-white font-bold">{a.action}</td>
                    <td className="p-2.5 text-neutral-300">{a.targetId}</td>
                    <td className="p-2.5 text-neutral-400">{a.ipAddress}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                        {a.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-neutral-400 text-[10px]">{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
