import React, { useState, useEffect } from 'react';
import { Citizen, VerificationLog, AdminNavTab } from '../../types/identity';
import { DEMO_CITIZENS, DEMO_VERIFICATIONS } from '../../data/demoData';
import { SilaLogo } from '../common/SilaLogo';
import { TerritoryManagement } from './TerritoryManagement';
import { subscribeProcesses, updateProcessStatusInDb } from '../../services/processService';
import { AdminSidebar } from './shell/AdminSidebar';
import { AdminHeader } from './shell/AdminHeader';
import { AdminErrorBoundary } from './shell/AdminErrorBoundary';
import { SessionControlBar } from './auth/SessionControlBar';
import { OperatorRoleSwitcherModal } from './auth/OperatorRoleSwitcherModal';
import { ReauthenticationModal } from './auth/ReauthenticationModal';
import { CredentialRecoveryModal } from './auth/CredentialRecoveryModal';
import { PolicyInspectorDrawer } from './auth/PolicyInspectorDrawer';
import { AccessGuard } from './auth/AccessGuard';
import {
  LayoutDashboard, Users, ShieldCheck, RefreshCw, FileText,
  Search, Bell, LogOut, Activity, AlertTriangle, CheckCircle2,
  ChevronRight, ChevronLeft, MapPin, Crown, Calendar, UserCheck,
  Award, FileCheck, Settings, BarChart2, Inbox, ArrowRight,
  Filter, Check, X, RotateCcw, AlertCircle, Clock, Sparkles, Lock, Shield, Eye
} from 'lucide-react';

export interface ProcessItem {
  id: string;
  cidadao: string;
  tipo: 'Renovação' | 'Primeiro' | 'Substituição';
  estado: 'Novo' | 'Em análise' | 'Biometria' | 'Pendente' | 'Aprovado' | 'Devolvido' | 'Rejeitado';
  dataCriacao: string;
  identidadeStatus: 'CONFIRMADA' | 'PENDENTE' | 'NAO_ENCONTRADA';
  documentacaoStatus: 'OFICIAIS' | 'INCOMPLETA' | 'REJEITADA';
  biometriaStatus: 'RECEBIDA' | 'PENDENTE';
  fotografiaStatus: 'RECEBIDA' | 'PENDENTE';
  analiseStatus: 'EM_ANALISE' | 'CONCLUIDA' | 'PENDENTE';
  emissaoStatus: 'PENDENTE' | 'EMITIDO' | 'BLOQUEADO';
}

const INITIAL_PROCESSES: ProcessItem[] = [
  {
    id: 'REQ-000184',
    cidadao: 'JOÃO MANUEL DA SILVA',
    tipo: 'Renovação',
    estado: 'Em análise',
    dataCriacao: 'Hoje, 14:20',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'OFICIAIS',
    biometriaStatus: 'RECEBIDA',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'EM_ANALISE',
    emissaoStatus: 'PENDENTE'
  },
  {
    id: 'REQ-000185',
    cidadao: 'MARIA JOSÉ FERREIRA',
    tipo: 'Primeiro',
    estado: 'Biometria',
    dataCriacao: 'Hoje, 13:45',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'OFICIAIS',
    biometriaStatus: 'PENDENTE',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'PENDENTE',
    emissaoStatus: 'PENDENTE'
  },
  {
    id: 'REQ-000186',
    cidadao: 'ANTÓNIO PEDRO NETO',
    tipo: 'Renovação',
    estado: 'Pendente',
    dataCriacao: 'Hoje, 11:10',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'INCOMPLETA',
    biometriaStatus: 'RECEBIDA',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'PENDENTE',
    emissaoStatus: 'PENDENTE'
  },
  {
    id: 'REQ-000187',
    cidadao: 'TERESA AMÉLIA BENGUELA',
    tipo: 'Primeiro',
    estado: 'Aprovado',
    dataCriacao: 'Ontem, 16:30',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'OFICIAIS',
    biometriaStatus: 'RECEBIDA',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'CONCLUIDA',
    emissaoStatus: 'EMITIDO'
  },
  {
    id: 'REQ-000188',
    cidadao: 'CARLOS ALBERTO DOS SANTOS',
    tipo: 'Renovação',
    estado: 'Novo',
    dataCriacao: 'Hoje, 15:02',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'OFICIAIS',
    biometriaStatus: 'RECEBIDA',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'PENDENTE',
    emissaoStatus: 'PENDENTE'
  },
  {
    id: 'REQ-000189',
    cidadao: 'ISABEL VICTORIA ZAIRE',
    tipo: 'Primeiro',
    estado: 'Em análise',
    dataCriacao: 'Hoje, 10:15',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'OFICIAIS',
    biometriaStatus: 'RECEBIDA',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'EM_ANALISE',
    emissaoStatus: 'PENDENTE'
  }
];

interface AdminPortalAppProps {
  citizens: Citizen[];
  onSelectCitizen: (citizen: Citizen) => void;
  onOpenCitizenPwa?: () => void;
  onOpenPublicVerifier?: () => void;
}

export const AdminPortalApp: React.FC<AdminPortalAppProps> = ({
  citizens = DEMO_CITIZENS,
  onOpenCitizenPwa
}) => {
  const [activeTab, setActiveTab] = useState<AdminNavTab>('INICIO');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);
  const [selectedProcess, setSelectedProcess] = useState<ProcessItem | null>(null);
  const [processFilter, setProcessFilter] = useState<'ALL' | 'NOVOS' | 'EM_ANALISE' | 'PENDENTES' | 'APROVADOS'>('ALL');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State for CIDADÃOS tab filtering & details
  const [citizenQuery, setCitizenQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [filterProvincia, setFilterProvincia] = useState('TODAS');
  const [filterMunicipio, setFilterMunicipio] = useState('TODOS');
  const [filterDocType, setFilterDocType] = useState('TODOS');
  const [filterData, setFilterData] = useState('TODOS');
  const [selectedCitizenProfile, setSelectedCitizenProfile] = useState<Citizen | null>(null);

  // State for Registo de Ocorrência / Pedido de Alteração modal
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false);
  const [occurrenceReason, setOccurrenceReason] = useState('');
  const [occurrenceSubmitted, setOccurrenceSubmitted] = useState(false);

  // Camada 2 — Identity & Access state modals
  const [showRoleSwitcherModal, setShowRoleSwitcherModal] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showPolicyInspector, setShowPolicyInspector] = useState(false);
  const [authNonce, setAuthNonce] = useState(0);

  // Real-time synchronization with Firestore
  useEffect(() => {
    const unsubscribe = subscribeProcesses((firestoreProcesses) => {
      setProcesses(firestoreProcesses);
      // Keep selectedProcess in sync if open
      if (selectedProcess) {
        const updated = firestoreProcesses.find(p => p.id === selectedProcess.id);
        if (updated) {
          setSelectedProcess(updated);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedProcess?.id]);

  const showNotification = (text: string) => {
    setNotificationMsg(text);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleUpdateProcessStatus = async (
    processId: string, 
    newEstado: 'Aprovado' | 'Devolvido' | 'Rejeitado',
    actionLabel: string
  ) => {
    const analiseStatus = newEstado === 'Aprovado' ? 'CONCLUIDA' : 'PENDENTE';
    const emissaoStatus = newEstado === 'Aprovado' ? 'EMITIDO' : 'BLOQUEADO';

    await updateProcessStatusInDb(processId, newEstado, {
      analiseStatus,
      emissaoStatus
    });

    showNotification(`Processo ${processId} ${actionLabel} no Firestore.`);
  };

  const handleCreateOccurrenceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setOccurrenceSubmitted(true);
    setTimeout(() => {
      setOccurrenceSubmitted(false);
      setShowOccurrenceModal(false);
      setOccurrenceReason('');
      showNotification('Pedido de Alteração submetido com sucesso para Auditoria da Conservatória.');
    }, 1500);
  };

  const sidebarLinks: { id: AdminNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'INICIO', label: 'INÍCIO', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'PROCESSOS', label: 'PROCESSOS', icon: <Inbox className="w-4 h-4" /> },
    { id: 'CIDAOES', label: 'CIDADÃOS', icon: <Users className="w-4 h-4" /> },
    { id: 'IDENTIDADE', label: 'IDENTIDADE', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'BI', label: 'BI', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'TERRITORIOS', label: 'TERRITÓRIOS (21 Províncias)', icon: <MapPin className="w-4 h-4" /> },
    { id: 'AGENDAMENTOS', label: 'AGENDAMENTOS', icon: <Calendar className="w-4 h-4" /> },
    { id: 'ATENDIMENTO', label: 'ATENDIMENTO', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'VALIDACOES', label: 'VALIDAÇÕES', icon: <Award className="w-4 h-4" /> },
    { id: 'EMISSAO', label: 'EMISSÃO', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'AUDITORIA', label: 'AUDITORIA', icon: <FileText className="w-4 h-4" /> },
    { id: 'RELATORIOS', label: 'RELATÓRIOS', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'CONFIGURACOES', label: 'CONFIGURAÇÕES', icon: <Settings className="w-4 h-4" /> },
  ];

  const filteredProcesses = processes.filter(p => {
    const matchesSearch = p.cidadao.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (processFilter === 'NOVOS') return p.estado === 'Novo';
    if (processFilter === 'EM_ANALISE') return p.estado === 'Em análise' || p.estado === 'Biometria';
    if (processFilter === 'PENDENTES') return p.estado === 'Pendente';
    if (processFilter === 'APROVADOS') return p.estado === 'Aprovado';
    return true;
  });

  const filteredCitizens = (citizens.length ? citizens : DEMO_CITIZENS).filter(c => {
    const q = citizenQuery.toLowerCase();
    const matchesQuery = c.fullName.toLowerCase().includes(q) || 
                         c.biNumber.toLowerCase().includes(q) || 
                         (c.provincia && c.provincia.toLowerCase().includes(q));
    if (!matchesQuery) return false;

    if (filterEstado !== 'TODOS') {
      if (filterEstado === 'ATIVO' && c.status !== 'VERIFIED') return false;
      if (filterEstado === 'PENDENTE' && c.status !== 'PENDING') return false;
      if (filterEstado === 'SUSPENSO' && c.status !== 'REVOKED') return false;
    }

    if (filterProvincia !== 'TODAS' && c.provincia !== filterProvincia) {
      return false;
    }

    return true;
  });

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Aprovado': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Em análise': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Biometria': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Novo': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Pendente': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'Devolvido': return 'bg-neutral-800 text-neutral-400 border-neutral-700';
      case 'Rejeitado': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default: return 'bg-neutral-800 text-neutral-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-neutral-200 flex flex-col md:flex-row pt-12 md:pt-14 font-mono select-none">
      
      {/* Toast notification banner */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-neutral-950 text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* CAMADA 1 — RECOLHÍVEL SIDEBAR */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedCitizenProfile(null);
          setSelectedProcess(null);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenCitizenPwa={onOpenCitizenPwa}
        onOpenProfile={() => setActiveTab('CONFIGURACOES')}
        onLogout={() => showNotification('Sessão encerrada com segurança.')}
      />

      {/* CAMADA 1 — MAIN CONTENT AREA WITH SHELL HEADER & ERROR BOUNDARY */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* GLOBAL HEADER (Breadcrumb, Search, Notifications, Status, User Menu) */}
        <AdminHeader
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onTabChange={setActiveTab}
          onOpenProfile={() => setActiveTab('CONFIGURACOES')}
          onLogout={() => showNotification('Sessão encerrada com segurança.')}
          onOpenRoleSwitcher={() => setShowRoleSwitcherModal(true)}
          onOpenReauth={() => setShowReauthModal(true)}
          onOpenPolicyInspector={() => setShowPolicyInspector(true)}
          notificationsCount={3}
        />

        {/* CAMADA 2 — IDENTITY & ACCESS SESSION CONTROL BAR */}
        <SessionControlBar
          key={`session-bar-${authNonce}`}
          onOpenRoleSwitcher={() => setShowRoleSwitcherModal(true)}
          onOpenReauth={() => setShowReauthModal(true)}
          onOpenRecovery={() => setShowRecoveryModal(true)}
          onOpenPolicyInspector={() => setShowPolicyInspector(true)}
          onLogoutNotification={() => showNotification('Sessão encerrada com segurança.')}
        />

        <AdminErrorBoundary>

        {/* =========================================================
            TAB 1: HOME DO MINISTÉRIO (INÍCIO)
           ========================================================= */}
        {activeTab === 'INICIO' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* 1. PROCESSOS KPI CARD */}
            <div className="p-6 rounded-3xl bg-[#111318] border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  PROCESSOS
                </span>
                <button 
                  onClick={() => setActiveTab('PROCESSOS')} 
                  className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1 font-sans"
                >
                  <span>Ver todos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
                  <span className="text-3xl font-extrabold text-white tracking-tight">1.284</span>
                  <span className="text-xs font-bold text-amber-400 uppercase mt-2">Em análise</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
                  <span className="text-3xl font-extrabold text-white tracking-tight">86</span>
                  <span className="text-xs font-bold text-orange-400 uppercase mt-2">Pendentes</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between">
                  <span className="text-3xl font-extrabold text-white tracking-tight">42</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase mt-2">Hoje</span>
                </div>
              </div>
            </div>

            {/* 2. ATENÇÃO CARD */}
            <div className="p-6 rounded-3xl bg-[#111318] border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  ATENÇÃO
                </span>
              </div>

              <div className="space-y-2 text-xs font-sans">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-neutral-200">
                  <span className="font-bold font-mono">12 processos aguardam ação</span>
                  <button 
                    onClick={() => setActiveTab('PROCESSOS')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[10px] font-bold uppercase hover:bg-amber-500/30"
                  >
                    Resolver
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-neutral-200">
                  <span className="font-bold font-mono">3 documentos sinalizados</span>
                  <button 
                    onClick={() => setActiveTab('PROCESSOS')}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-[10px] font-bold uppercase hover:bg-rose-500/30"
                  >
                    Auditar
                  </button>
                </div>
              </div>
            </div>

            {/* 3. ATIVIDADE RECENTE STREAM */}
            <div className="p-6 rounded-3xl bg-[#111318] border border-neutral-800 space-y-4">
              <div className="border-b border-neutral-800/80 pb-3">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-widest">
                  ATIVIDADE RECENTE
                </span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="font-medium text-neutral-200">Novo pedido registado (REQ-000188)</span>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-500">2 min</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="font-medium text-neutral-200">Biometria recebida com sucesso</span>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-500">8 min</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-medium text-neutral-200">BI aprovado pelo conservador</span>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-500">14 min</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 2: PROCESSOS (THE HEART OF THE SYSTEM)
           ========================================================= */}
        {activeTab === 'PROCESSOS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* PROCESSOS TITLE & SEARCH */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">
                  PROCESSOS DE REGISTO & BI
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Central de validação, emissão e análise do Ministério da Justiça
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar ID ou Cidadão..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111217] border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* PROCESS FILTERS: [ Todos ] [ Novos ] [ Em análise ] [ Pendentes ] [ Aprovados ] */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'NOVOS', label: 'Novos' },
                { id: 'EM_ANALISE', label: 'Em análise' },
                { id: 'PENDENTES', label: 'Pendentes' },
                { id: 'APROVADOS', label: 'Aprovados' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setProcessFilter(f.id as any)}
                  className={`px-4 py-2 rounded-xl font-bold uppercase transition-all whitespace-nowrap ${
                    processFilter === f.id
                      ? 'bg-amber-500 text-neutral-950 shadow-md'
                      : 'bg-[#111217] text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  [ {f.label} ]
                </button>
              ))}
            </div>

            {/* PROCESSES TABLE */}
            <div className="p-4 rounded-3xl bg-[#111318] border border-neutral-800 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-wider">
                    <th className="pb-3 px-3 font-bold">ID</th>
                    <th className="pb-3 px-3 font-bold">CIDADÃO</th>
                    <th className="pb-3 px-3 font-bold">TIPO</th>
                    <th className="pb-3 px-3 font-bold">ESTADO</th>
                    <th className="pb-3 px-3 font-bold text-right">AÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-sans">
                  {filteredProcesses.map(proc => (
                    <tr 
                      key={proc.id} 
                      onClick={() => setSelectedProcess(proc)}
                      className="hover:bg-neutral-900/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-3 font-mono font-bold text-amber-400">{proc.id}</td>
                      <td className="py-3.5 px-3 font-bold text-white uppercase">{proc.cidadao}</td>
                      <td className="py-3.5 px-3 font-mono text-neutral-300">{proc.tipo}</td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getBadgeClass(proc.estado)}`}>
                          {proc.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProcess(proc);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-400 text-[11px] font-mono font-bold uppercase transition-colors"
                        >
                          Analisar &rsaquo;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProcesses.length === 0 && (
                <div className="py-12 text-center text-xs text-neutral-500 font-sans">
                  Nenhum processo encontrado com os filtros aplicados.
                </div>
              )}
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 3: CIDADÃOS
           ========================================================= */}
        {activeTab === 'CIDAOES' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* SEARCH & FILTERS HEADER */}
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">
                  CONSULTA NACIONAL DE CIDADÃOS
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Pesquisa autorizada do Ministério da Justiça. Operador em modo de Leitura e Validação.
                </p>
              </div>

              {/* SEARCH BAR [ 🔍 Nome / BI / Processo ] */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="[ 🔍 Nome / BI / Processo ]"
                  value={citizenQuery}
                  onChange={(e) => setCitizenQuery(e.target.value)}
                  className="w-full bg-[#111217] border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono shadow-inner"
                />
              </div>

              {/* FILTER BAR: Estado, Província, Município, Tipo de Documento, Data */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 text-xs font-mono">
                
                {/* Filtro Estado */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-500 uppercase">Estado</label>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="bg-[#111217] border border-neutral-800 rounded-xl px-2.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="TODOS">Todos os Estados</option>
                    <option value="ATIVO">Ativo</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="SUSPENSO">Suspenso</option>
                  </select>
                </div>

                {/* Filtro Província */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-500 uppercase">Província</label>
                  <select
                    value={filterProvincia}
                    onChange={(e) => setFilterProvincia(e.target.value)}
                    className="bg-[#111217] border border-neutral-800 rounded-xl px-2.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="TODAS">Todas (21 Províncias)</option>
                    <option value="Luanda">Luanda</option>
                    <option value="Benguela">Benguela</option>
                    <option value="Huambo">Huambo</option>
                    <option value="Huíla">Huíla</option>
                    <option value="Cabinda">Cabinda</option>
                    <option value="Zaire">Zaire</option>
                  </select>
                </div>

                {/* Filtro Município */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-500 uppercase">Município</label>
                  <select
                    value={filterMunicipio}
                    onChange={(e) => setFilterMunicipio(e.target.value)}
                    className="bg-[#111217] border border-neutral-800 rounded-xl px-2.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="TODOS">Todos Municípios</option>
                    <option value="Ingombota">Ingombota</option>
                    <option value="Viana">Viana</option>
                    <option value="Talatona">Talatona</option>
                    <option value="Benguela">Benguela</option>
                    <option value="Huambo">Huambo</option>
                  </select>
                </div>

                {/* Filtro Tipo Documento */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-500 uppercase">Tipo Documento</label>
                  <select
                    value={filterDocType}
                    onChange={(e) => setFilterDocType(e.target.value)}
                    className="bg-[#111217] border border-neutral-800 rounded-xl px-2.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="TODOS">Todos os Tipos</option>
                    <option value="BI">BI (Bilhete de Identidade)</option>
                    <option value="REGISTO_CIVIL">Assento de Nascimento</option>
                    <option value="NIF">NIF Fiscal</option>
                  </select>
                </div>

                {/* Filtro Data */}
                <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
                  <label className="text-[10px] text-neutral-500 uppercase">Data Registo</label>
                  <select
                    value={filterData}
                    onChange={(e) => setFilterData(e.target.value)}
                    className="bg-[#111217] border border-neutral-800 rounded-xl px-2.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="TODOS">Qualquer Data</option>
                    <option value="HOJE">Hoje</option>
                    <option value="SEMANA">Esta Semana</option>
                    <option value="MES">Este Mês</option>
                  </select>
                </div>

              </div>
            </div>

            {/* LISTA DE CIDADÃOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCitizens.map(cit => (
                <div
                  key={cit.id}
                  onClick={() => setSelectedCitizenProfile(cit)}
                  className="p-5 rounded-3xl bg-[#111318] border border-neutral-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-4 hover:shadow-xl group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={cit.photoUrl}
                        alt={cit.fullName}
                        className="w-12 h-12 rounded-2xl object-cover border border-neutral-700 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-extrabold text-white uppercase group-hover:text-amber-400 transition-colors">
                          {cit.fullName}
                        </h3>
                        <div className="text-xs font-mono text-neutral-400 mt-0.5">
                          <span>BI: </span>
                          <span className="text-amber-400 font-bold">{cit.biNumber}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border uppercase ${
                      cit.status === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {cit.status === 'VERIFIED' ? 'ATIVO' : 'PENDENTE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-sans pt-2 border-t border-neutral-800/80">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-500 uppercase font-mono">Processos</span>
                      <span className="font-mono font-bold text-white">{cit.processCount || 1}</span>
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-neutral-500 uppercase font-mono">Última Validação</span>
                      <span className="font-mono font-bold text-neutral-300">{cit.lastVerifiedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCitizens.length === 0 && (
              <div className="p-12 rounded-3xl bg-[#111318] border border-neutral-800 text-center text-xs text-neutral-500 font-sans">
                Nenhum cidadão encontrado com os filtros aplicados.
              </div>
            )}

          </div>
        )}

        {/* =========================================================
            TAB 6: TERRITÓRIOS (21 PROVÍNCIAS - SUPERADMIN)
           ========================================================= */}
        {activeTab === 'TERRITORIOS' && (
          <TerritoryManagement />
        )}

        {/* OTHER TABS FALLBACK CONTAINER */}
        {activeTab !== 'INICIO' && activeTab !== 'PROCESSOS' && activeTab !== 'CIDAOES' && activeTab !== 'TERRITORIOS' && (
          <div className="p-8 rounded-3xl bg-[#111318] border border-neutral-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              MÓDULO DE {activeTab}
            </h3>
            <p className="text-xs text-neutral-400 font-sans max-w-md mx-auto">
              Acesso restrito ao Ministério da Justiça e Direitos Humanos (MJDH). Todos os registos de auditabilidade mantidos ativos.
            </p>
          </div>
        )}

        </AdminErrorBoundary>
      </main>

      {/* =========================================================
          PROCESSO INDIVIDUAL MODAL (REQ-000184)
         ========================================================= */}
      {selectedProcess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111217] border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 tracking-wider">
                  {selectedProcess.id}
                </span>
                <h3 className="text-base font-extrabold text-white uppercase mt-0.5">
                  {selectedProcess.cidadao}
                </h3>
                <span className="text-xs text-neutral-400 uppercase font-sans block">
                  {selectedProcess.tipo.toUpperCase()} DE BI
                </span>
              </div>

              <button
                onClick={() => setSelectedProcess(null)}
                className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ESTADO BANNER */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500 uppercase">ESTADO ATUAL</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getBadgeClass(selectedProcess.estado)}`}>
                {selectedProcess.estado}
              </span>
            </div>

            {/* CHECKLIST DE VALIDAÇÃO DO MINISTÉRIO */}
            <div className="space-y-3 text-xs font-sans">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="font-bold text-neutral-300 uppercase font-mono">IDENTIDADE</span>
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                  <span>✓ Encontrada</span>
                  <span>✓ Confirmada</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="font-bold text-neutral-300 uppercase font-mono">DOCUMENTAÇÃO</span>
                <span className="text-emerald-400 font-mono font-bold">✓ Dados oficiais</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="font-bold text-neutral-300 uppercase font-mono">BIOMETRIA</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {selectedProcess.biometriaStatus === 'RECEBIDA' ? '✓ Recebida' : '○ Pendente'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="font-bold text-neutral-300 uppercase font-mono">FOTOGRAFIA</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {selectedProcess.fotografiaStatus === 'RECEBIDA' ? '✓ Recebida' : '○ Pendente'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="font-bold text-neutral-300 uppercase font-mono">ANÁLISE</span>
                <span className={selectedProcess.analiseStatus === 'CONCLUIDA' ? 'text-emerald-400 font-mono font-bold' : 'text-amber-400 font-mono font-bold'}>
                  {selectedProcess.analiseStatus === 'CONCLUIDA' ? '✓ Concluída' : '● Em análise'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="font-bold text-neutral-300 uppercase font-mono">EMISSÃO</span>
                <span className={selectedProcess.emissaoStatus === 'EMITIDO' ? 'text-emerald-400 font-mono font-bold' : 'text-neutral-500 font-mono'}>
                  {selectedProcess.emissaoStatus === 'EMITIDO' ? '✓ Emitido' : '○ Pendente'}
                </span>
              </div>
            </div>

            {/* TIMELINE DO PROCESSO */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  TIMELINE
                </span>
                <span className="text-[10px] text-neutral-500 uppercase">REGISTOS TEMPORAIS</span>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">08:42</span>
                  <span className="text-neutral-300">Pedido criado</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">09:10</span>
                  <span className="text-neutral-300">Identidade consultada</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">10:22</span>
                  <span className="text-neutral-300">Atendimento realizado</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">10:24</span>
                  <span className="text-neutral-300">Biometria recebida</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">10:25</span>
                  <span className="text-neutral-300">Fotografia recebida</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">10:26</span>
                  <span className="text-neutral-300">Processo atribuído a operador</span>
                </div>
              </div>
            </div>

            {/* REGRAS ARQUITETURAIS: EDICÃO DE IDENTIDADE BLOQUEADA */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2 text-amber-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="font-bold font-mono text-[11px]">FONTE OFICIAL AUTORIZADA</span>
                </div>
                <button
                  onClick={() => setShowOccurrenceModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-400 font-mono text-[10px] font-bold uppercase transition-colors"
                >
                  Registar Ocorrência
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 font-sans leading-tight">
                O operador não pode editar livremente a identidade. Operações permitidas: consultar → analisar → aprovar/rejeitar → registrar ocorrência.
              </p>
            </div>

            {/* DECISION ACTION BUTTONS: [ APROVAR ] [ DEVOLVER ] [ REJEITAR ] */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={() => handleUpdateProcessStatus(selectedProcess.id, 'Aprovado', 'APROVADO')}
                className="py-3 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                APROVAR
              </button>

              <button
                onClick={() => handleUpdateProcessStatus(selectedProcess.id, 'Devolvido', 'DEVOLVIDO')}
                className="py-3 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
              >
                DEVOLVER
              </button>

              <button
                onClick={() => handleUpdateProcessStatus(selectedProcess.id, 'Rejeitado', 'REJEITADO')}
                className="py-3 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
              >
                REJEITAR
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          PERFIL ADMINISTRATIVO DO CIDADÃO MODAL
         ========================================================= */}
      {selectedCitizenProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111217] border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header com Foto & Autorização */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCitizenProfile.photoUrl}
                  alt={selectedCitizenProfile.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                />
                <div>
                  <h3 className="text-lg font-extrabold text-white uppercase">
                    {selectedCitizenProfile.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                    <span className="text-neutral-400">BI:</span>
                    <span className="text-amber-400 font-bold">{selectedCitizenProfile.biNumber}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase">
                      NÍVEL DE AUTORIZAÇÃO: CONSERVADOR NÍVEL 2
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCitizenProfile(null)}
                className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SEÇÃO: IDENTIDADE */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  IDENTIDADE
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  FONTE OFICIAL AUTORIZADA
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Nome Completo</span>
                  <span className="text-white font-bold">{selectedCitizenProfile.fullName}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Data de Nascimento</span>
                  <span className="text-white font-bold">{selectedCitizenProfile.birthDate}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Naturalidade</span>
                  <span className="text-white font-bold">{selectedCitizenProfile.naturalidade || 'Luanda'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Gênero / Nacionalidade</span>
                  <span className="text-white font-bold">{selectedCitizenProfile.gender === 'M' ? 'Masculino' : 'Feminino'} • {selectedCitizenProfile.nationality}</span>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Filiação</span>
                  <span className="text-neutral-300 block font-medium">Pai: {selectedCitizenProfile.filiacaoPai || 'Manuel Agostinho da Silva'}</span>
                  <span className="text-neutral-300 block font-medium">Mãe: {selectedCitizenProfile.filiacaoMae || 'Maria Antónia Pedro'}</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO: DOCUMENTO */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  DOCUMENTO
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Nº BI</span>
                  <span className="text-amber-400 font-bold font-mono">{selectedCitizenProfile.biNumber}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Estado</span>
                  <span className="text-emerald-400 font-bold font-mono uppercase">{selectedCitizenProfile.status === 'VERIFIED' ? 'ATIVO' : 'PENDENTE'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Emissão</span>
                  <span className="text-neutral-300 font-mono">2021-08-14</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Validade</span>
                  <span className="text-neutral-300 font-mono">2026-08-14</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO: METRICAS - PROCESSOS, VALIDAÇÕES, AUDITORIA */}
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-2xl font-extrabold text-amber-400 block">{selectedCitizenProfile.processCount || 3}</span>
                <span className="text-[10px] text-neutral-400 uppercase">PROCESSOS</span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-2xl font-extrabold text-blue-400 block">{selectedCitizenProfile.validationCount || 18}</span>
                <span className="text-[10px] text-neutral-400 uppercase">VALIDAÇÕES</span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-2xl font-extrabold text-emerald-400 block">{selectedCitizenProfile.auditEventsCount || 42}</span>
                <span className="text-[10px] text-neutral-400 uppercase">EVENTOS AUDITORIA</span>
              </div>
            </div>

            {/* AVISO DE AUTORIZAÇÃO & SOLICITAÇÃO DE ALTERAÇÃO */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs font-sans">
              <div className="flex items-center gap-2 text-amber-300 font-mono font-bold">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>RESTRIÇÃO DE OPERADOR</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-tight">
                O operador só vê os dados para os quais possui autorização explícita (Conservador Nível 2). Edição direta de identidade proibida por razões de integridade e soberania nacional.
              </p>

              <button
                onClick={() => {
                  setShowOccurrenceModal(true);
                  setSelectedCitizenProfile(null);
                }}
                className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-mono font-bold text-xs uppercase hover:bg-amber-400 transition-colors"
              >
                [ REGISTAR PEDIDO DE ALTERAÇÃO / OCORRÊNCIA ]
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE PEDIDO DE ALTERAÇÃO / REGISTO DE OCORRÊNCIA
         ========================================================= */}
      {showOccurrenceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111217] border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase">
                  PEDIDO DE ALTERAÇÃO / OCORRÊNCIA
                </h3>
                <span className="text-[10px] font-mono text-amber-400 block mt-0.5">
                  FLUXO: PEDIDO &rsaquo; ANÁLISE &rsaquo; AUTORIZAÇÃO &rsaquo; AUDITORIA
                </span>
              </div>

              <button
                onClick={() => setShowOccurrenceModal(false)}
                className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOccurrenceRequest} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
                  Motivo da Ocorrência / Alteração
                </label>
                <textarea
                  required
                  rows={4}
                  value={occurrenceReason}
                  onChange={(e) => setOccurrenceReason(e.target.value)}
                  placeholder="Descreva a divergência observada nos dados oficiais ou motivo do pedido..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[10px] font-mono text-neutral-400 space-y-1">
                <div className="text-amber-400 font-bold">CIRCUTO DE SEGURANÇA:</div>
                <div>1. PEDIDO DE ALTERAÇÃO registado pelo operador</div>
                <div>2. ANÁLISE pela Conservatória do Registo Civil</div>
                <div>3. AUTORIZAÇÃO pelo Conservador Geral</div>
                <div>4. ATUALIZAÇÃO DA FONTE OFICIAL com Hash RSA</div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOccurrenceModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-neutral-900 text-neutral-400 font-mono font-bold hover:bg-neutral-800"
                >
                  CANCELAR
                </button>

                <button
                  type="submit"
                  disabled={occurrenceSubmitted}
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono font-bold uppercase transition-colors"
                >
                  {occurrenceSubmitted ? 'SUBMETENDO...' : 'SUBMETER PEDIDO'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
