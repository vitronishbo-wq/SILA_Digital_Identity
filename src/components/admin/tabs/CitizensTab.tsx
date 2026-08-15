import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  UserCheck,
  Building2,
  MapPin,
  FileText,
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  Award,
  ChevronRight,
  Eye,
  Lock,
  RefreshCw,
  X,
  Plus,
  Phone,
  Calendar,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
  Download,
  AlertCircle
} from 'lucide-react';
import { getCurrentSession } from '../../../services/accessControlService';

export type CitizenState =
  | 'REGISTADO'
  | 'NAO_REGISTADO'
  | 'EM_REGULARIZACAO'
  | 'FALECIDO'
  | 'SUSPENSO_ADMINISTRATIVAMENTE';

export type BIState =
  | 'NAO_EMITIDO'
  | 'VALIDO'
  | 'EXPIRADO'
  | 'SUSPENSO'
  | 'CANCELADO'
  | 'EM_RENOVACAO';

export type RegistrationType = 'NASCIMENTO' | 'BI' | 'OUTRO';

export interface RelatedProcessSummary {
  id: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface CitizenRecord {
  id: string;
  fullName: string;
  biNumber: string;
  birthRegistrationNo: string;
  phone: string;
  province: string;
  municipality: string;
  citizenState: CitizenState;
  biState: BIState;
  registrationType: RegistrationType;
  lastValidatedAt: string;
  processCount: number;
  dob: string;
  sex: 'M' | 'F';
  birthPlace: string;
  nationality: string;
  fatherName: string;
  motherName: string;
  address: string;
  email: string;
  biIssueDate: string;
  biExpiryDate: string;
  digitalCredentialHash: string;
  hasDuplicitySuspect?: boolean;
  duplicityMatches?: number;
  relatedProcesses: RelatedProcessSummary[];
  validations: {
    key: string;
    label: string;
    passed: boolean;
    source: string;
    timestamp: string;
  }[];
  identityHistory: {
    time: string;
    event: string;
    details: string;
  }[];
  accessAuditLogs: {
    time: string;
    actor: string;
    role: string;
    org: string;
    territory: string;
    purpose: string;
    status: 'AUTHORIZED';
  }[];
}

interface CitizensTabProps {
  onOpenReauth?: () => void;
  onOpenPolicyInspector?: () => void;
  onOpenOrgSelector?: () => void;
  onNavigateToProcesses?: (procId?: string) => void;
}

export const CitizensTab: React.FC<CitizensTabProps> = ({
  onOpenReauth,
  onOpenPolicyInspector,
  onOpenOrgSelector,
  onNavigateToProcesses
}) => {
  const session = getCurrentSession();
  const { operator } = session;

  // SEARCH & FILTERS
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCitizenState, setFilterCitizenState] = useState<string>('ALL');
  const [filterBIState, setFilterBIState] = useState<string>('ALL');
  const [filterProvince, setFilterProvince] = useState<string>('ALL');
  const [filterRegType, setFilterRegType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'RELEVANCE' | 'NAME' | 'REG_DATE' | 'VALIDATION' | 'STATE'>('RELEVANCE');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // IAM POPOVER
  const [showAccessDetails, setShowAccessDetails] = useState(false);

  // CITIZEN INSPECTOR MODAL
  const [selectedCitizen, setSelectedCitizen] = useState<CitizenRecord | null>(null);
  const [detailTab, setDetailTab] = useState<
    'IDENTIDADE' | 'DOCUMENTO' | 'REGISTO_CIVIL' | 'PROCESSOS' | 'VALIDACOES' | 'HISTORICO' | 'AUDITORIA'
  >('IDENTIDADE');

  const [showFullBiography, setShowFullBiography] = useState(false);
  const [showCredentialPreview, setShowCredentialPreview] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // MOCK CITIZEN DATASET
  const [citizensList] = useState<CitizenRecord[]>([
    {
      id: 'CID-000123',
      fullName: 'JOÃO MANUEL DA SILVA',
      biNumber: '001234567LA032',
      birthRegistrationNo: '2020/1182/LUANDA',
      phone: '+244 923 112 001',
      province: 'Luanda',
      municipality: 'Ingombota',
      citizenState: 'REGISTADO',
      biState: 'VALIDO',
      registrationType: 'BI',
      lastValidatedAt: '2026-08-12 14:20',
      processCount: 3,
      dob: '12/04/1988',
      sex: 'M',
      birthPlace: 'Luanda, Ingombota',
      nationality: 'ANGOLANA',
      fatherName: 'Manuel Bernardo da Silva',
      motherName: 'Maria José da Silva',
      address: 'Bairro Maianga, Rua 12, Casa 4B, Luanda',
      email: 'j.silva@email.ao',
      biIssueDate: '23/07/2021',
      biExpiryDate: '22/07/2031',
      digitalCredentialHash: '0x8f10a294b...rsa4096',
      relatedProcesses: [
        { id: 'REQ-000187', type: 'Primeiro BI', status: 'APROVADO', createdAt: '2021-07-20' },
        { id: 'REQ-000152', type: 'Atualização de Morada', status: 'CONCLUÍDO', createdAt: '2023-03-10' },
        { id: 'REQ-000103', type: 'Renovação BI Digital', status: 'CONCLUÍDO', createdAt: '2025-11-01' }
      ],
      validations: [
        { key: 'v1', label: 'IDENTIDADE CIVIL', passed: true, source: 'SILA_CORE', timestamp: '12/08/2026 14:20' },
        { key: 'v2', label: 'REGISTO CIVIL (NASCIMENTO)', passed: true, source: 'REGISTO_CIVIL_MJDH', timestamp: '12/08/2026 14:20' },
        { key: 'v3', label: 'BILHETE DE IDENTIDADE', passed: true, source: 'CENTRAL_BI', timestamp: '12/08/2026 14:20' },
        { key: 'v4', label: 'BIOMETRIA AFIS', passed: true, source: 'AFIS_NATIONAL', timestamp: '12/08/2026 14:20' },
        { key: 'v5', label: 'CHECAGEM DUPLICIDADE', passed: true, source: 'AFIS_NATIONAL', timestamp: '12/08/2026 14:20' }
      ],
      identityHistory: [
        { time: '23/07/2021', event: 'BI_EMITIDO', details: 'Emissão inicial do Bilhete de Identidade em Luanda Central' },
        { time: '10/03/2023', event: 'DADOS_ATUALIZADOS', details: 'Atualização de residência e contacto telefónico' },
        { time: '12/08/2026', event: 'CONSULTA_VALIDADA', details: 'Identidade verificada em balcão oficial via SILA GOVOS' }
      ],
      accessAuditLogs: [
        { time: '12/08/2026 14:20', actor: operator.fullName, role: operator.role, org: operator.organizationName, territory: 'NACIONAL', purpose: 'VERIFICACAO_IDENTIDADE', status: 'AUTHORIZED' }
      ]
    },
    {
      id: 'CID-000124',
      fullName: 'ANTÓNIO PEDRO NETO',
      biNumber: '004829102LA049',
      birthRegistrationNo: '1982/1182/HUAMBO',
      phone: '+244 923 456 789',
      province: 'Huambo',
      municipality: 'Huambo',
      citizenState: 'REGISTADO',
      biState: 'EXPIRADO',
      registrationType: 'BI',
      lastValidatedAt: '2026-08-12 11:10',
      processCount: 2,
      dob: '14/05/1982',
      sex: 'M',
      birthPlace: 'Huambo, Caála',
      nationality: 'ANGOLANA',
      fatherName: 'Pedro Afonso Neto',
      motherName: 'Maria da Conceição Neto',
      address: 'Bairro Benfica, Rua 4, Casa 12, Huambo',
      email: 'a.neto@email.ao',
      biIssueDate: '10/05/2016',
      biExpiryDate: '09/05/2026',
      digitalCredentialHash: '0x32a1884c...rsa4096',
      relatedProcesses: [
        { id: 'REQ-000186', type: 'Renovação BI', status: 'PENDENTE', createdAt: '2026-08-12' }
      ],
      validations: [
        { key: 'v1', label: 'IDENTIDADE CIVIL', passed: true, source: 'SILA_CORE', timestamp: '12/08/2026 11:10' },
        { key: 'v2', label: 'REGISTO CIVIL', passed: true, source: 'REGISTO_CIVIL_MJDH', timestamp: '12/08/2026 11:10' },
        { key: 'v3', label: 'BILHETE DE IDENTIDADE', passed: false, source: 'CENTRAL_BI', timestamp: '12/08/2026 11:10' }
      ],
      identityHistory: [
        { time: '10/05/2016', event: 'BI_EMITIDO', details: 'Emissão de BI em Huambo' },
        { time: '09/05/2026', event: 'BI_EXPIRADO', details: 'Documento atingiu o termo de validade' }
      ],
      accessAuditLogs: [
        { time: '12/08/2026 11:10', actor: 'Analista Huambo-03', role: 'IDENTITY_ANALYST', org: 'Posto Central Huambo', territory: 'Huambo', purpose: 'ANALISE_PROCESSO', status: 'AUTHORIZED' }
      ]
    },
    {
      id: 'CID-000125',
      fullName: 'MARIA JOSÉ FERREIRA',
      biNumber: '009823101HA039',
      birthRegistrationNo: '2024/0019/HUAMBO',
      phone: '+244 931 442 889',
      province: 'Huambo',
      municipality: 'Caála',
      citizenState: 'REGISTADO',
      biState: 'NAO_EMITIDO',
      registrationType: 'NASCIMENTO',
      lastValidatedAt: '2026-08-12 10:00',
      processCount: 1,
      dob: '20/09/2006',
      sex: 'F',
      birthPlace: 'Huambo, Caála',
      nationality: 'ANGOLANA',
      fatherName: 'José António Ferreira',
      motherName: 'Amélia Rosa Ferreira',
      address: 'Bairro Benfica, Rua 3, Casa 98, Caála',
      email: 'm.ferreira@email.ao',
      biIssueDate: 'N/A',
      biExpiryDate: 'N/A',
      digitalCredentialHash: 'N/A',
      relatedProcesses: [
        { id: 'REQ-000185', type: 'Primeiro BI', status: 'NOVO', createdAt: '2026-08-12' }
      ],
      validations: [
        { key: 'v1', label: 'REGISTO CIVIL (ASSENTO)', passed: true, source: 'SILA_REGISTER', timestamp: '12/08/2026 10:00' },
        { key: 'v2', label: 'EMISSÃO BI', passed: false, source: 'CENTRAL_BI', timestamp: '12/08/2026 10:00' }
      ],
      identityHistory: [
        { time: '20/09/2006', event: 'REGISTO_NASCIMENTO', details: 'Lavrado assento de nascimento em Caála' }
      ],
      accessAuditLogs: [
        { time: '12/08/2026 10:00', actor: 'Ana Bernardo', role: 'SERVICE_AGENT', org: 'Posto Caála', territory: 'Huambo', purpose: 'INICIO_PRIMEIRO_BI', status: 'AUTHORIZED' }
      ]
    },
    {
      id: 'CID-000126',
      fullName: 'SEBASTIÃO BENJAMIM CAMBUTA',
      biNumber: '007718201CA091',
      birthRegistrationNo: '1979/0091/CABINDA',
      phone: '+244 944 881 029',
      province: 'Cabinda',
      municipality: 'Buco-Zau',
      citizenState: 'SUSPENSO_ADMINISTRATIVAMENTE',
      biState: 'SUSPENSO',
      registrationType: 'BI',
      lastValidatedAt: '2026-08-11 14:20',
      processCount: 2,
      dob: '18/11/1979',
      sex: 'M',
      birthPlace: 'Cabinda, Buco-Zau',
      nationality: 'ANGOLANA',
      fatherName: 'Benjamim Cambuta',
      motherName: 'Nzuzi Cambuta',
      address: 'Bairro Comercial, Rua 1, Cabinda',
      email: 's.cambuta@email.ao',
      biIssueDate: '15/01/2019',
      biExpiryDate: '14/01/2029',
      digitalCredentialHash: '0x9910c...SUSPENDED',
      hasDuplicitySuspect: true,
      duplicityMatches: 1,
      relatedProcesses: [
        { id: 'REQ-000190', type: 'Correção de Dados', status: 'SUSPENSO', createdAt: '2026-08-10' }
      ],
      validations: [
        { key: 'v1', label: 'IDENTIDADE CIVIL', passed: true, source: 'SILA_CORE', timestamp: '11/08/2026 14:20' },
        { key: 'v2', label: 'CHECAGEM DUPLICIDADE', passed: false, source: 'AFIS_ENGINE', timestamp: '11/08/2026 14:20' }
      ],
      identityHistory: [
        { time: '11/08/2026', event: 'PROCESSO_SUSPENSO', details: 'Suspeita de duplicidade bioplates com BI 003310291LA011' }
      ],
      accessAuditLogs: [
        { time: '11/08/2026 14:20', actor: 'Dra. Rosa Neto', role: 'AUDITOR', org: 'Gabinete Jurídico MJDH', territory: 'NACIONAL', purpose: 'INVESTIGACAO_DUPLICIDADE', status: 'AUTHORIZED' }
      ]
    }
  ]);

  // FILTERED CITIZENS
  const filteredCitizens = citizensList.filter((c) => {
    // Search query: Name, BI, Process, Birth Reg
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.biNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.birthRegistrationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.relatedProcesses.some(p => p.id.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterCitizenState !== 'ALL' && c.citizenState !== filterCitizenState) return false;
    if (filterBIState !== 'ALL' && c.biState !== filterBIState) return false;
    if (filterProvince !== 'ALL' && c.province !== filterProvince) return false;
    if (filterRegType !== 'ALL' && c.registrationType !== filterRegType) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'NAME') return a.fullName.localeCompare(b.fullName);
    if (sortBy === 'STATE') return a.citizenState.localeCompare(b.citizenState);
    if (sortBy === 'VALIDATION') return b.lastValidatedAt.localeCompare(a.lastValidatedAt);
    return 0;
  });

  // OPEN CITIZEN PROFILE & LOG AUDIT EVENT
  const handleOpenCitizen = (citizen: CitizenRecord) => {
    // Audit Event: CITIZEN_RECORD_ACCESSED
    const auditEntry = {
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: operator.fullName,
      role: operator.role,
      org: operator.organizationName || 'MJDH_CENTRAL',
      territory: operator.territories[0] || 'NACIONAL',
      purpose: 'CONSULTA_FICHA_OFICIAL',
      status: 'AUTHORIZED' as const
    };

    const updatedCitizen = {
      ...citizen,
      accessAuditLogs: [auditEntry, ...citizen.accessAuditLogs]
    };

    setSelectedCitizen(updatedCitizen);
    setDetailTab('IDENTIDADE');
    setShowFullBiography(false);
    setShowCredentialPreview(false);
  };

  const handleExportQuery = () => {
    setExportNotice('EXPORT_LOGGED: Consulta exportada e registrada nos Logs de Auditoria MJDH.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const getCitizenStateBadge = (state: CitizenState) => {
    switch (state) {
      case 'REGISTADO': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'NAO_REGISTADO': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'EM_REGULARIZACAO': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'FALECIDO': return 'bg-neutral-800 text-neutral-400 border-neutral-700';
      case 'SUSPENSO_ADMINISTRATIVAMENTE': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default: return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  const getBIStateBadge = (biState: BIState) => {
    switch (biState) {
      case 'VALIDO': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'EXPIRADO': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'NAO_EMITIDO': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'SUSPENSO': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'CANCELADO': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'EM_RENOVACAO': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      default: return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="space-y-3 font-mono select-none text-xs">
      
      {/* HEADER PATH & INTERNAL METADATA BAR (04.2) */}
      <div className="p-3 rounded-2xl bg-[#111217] border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 shadow-xl">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-white uppercase tracking-wider">
            <span className="text-amber-400">SILA / GOVOS</span>
            <span className="text-neutral-600">&gt;</span>
            <span>MJDH_CENTRAL</span>
            <span className="text-neutral-600">&gt;</span>
            <span className="text-neutral-400">CONSELHO SUPERIOR DE IDENTIFICAÇÃO CIVIL MJDH</span>
            <span className="text-neutral-600">&gt;</span>
            <span className="text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">04_CIDADÃOS</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1 font-mono">
            <span>MODULE_ID: <strong className="text-white">CIDADÃOS</strong></span>
            <span>•</span>
            <span>VER: <strong className="text-amber-300">4.2.0</strong></span>
            <span>•</span>
            <span>ORG_CTX: <strong className="text-blue-300">{operator.organization}</strong></span>
            <span>•</span>
            <span>SCOPE: <strong className="text-emerald-300">{operator.territories.join(', ')}</strong></span>
            <span>•</span>
            <span>SESS: <strong className="text-neutral-300">SESS-99421</strong></span>
          </div>
        </div>

        {/* COMPACT LAYER 2 ACCESS BADGE (04.4) */}
        <div className="relative">
          <button
            onClick={() => setShowAccessDetails(!showAccessDetails)}
            className="px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 text-neutral-300 flex items-center gap-1.5 font-bold text-[10px]"
            title="CAMADA 2 - IAM POPUP"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>ACCESS: <strong className="text-amber-300">{operator.role}</strong> • {operator.territories[0]} • ✓</span>
            <span className="text-neutral-500 text-[9px] underline">[DETALHES]</span>
          </button>

          {showAccessDetails && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111217] border border-amber-500/40 p-3 z-50 shadow-2xl space-y-2 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase">IAM ACCESS CONTEXT</span>
                <button onClick={() => setShowAccessDetails(false)} className="text-neutral-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex justify-between"><span className="text-neutral-500">ROLE:</span><strong className="text-amber-300">{operator.role}</strong></div>
                <div className="flex justify-between"><span className="text-neutral-500">ORGANIZATION:</span><strong className="text-blue-300">{operator.organization}</strong></div>
                <div className="flex justify-between"><span className="text-neutral-500">TERRITORY:</span><strong className="text-emerald-300">{operator.territories.join(', ')}</strong></div>
                <div className="flex justify-between"><span className="text-neutral-500">SESSION:</span><strong className="text-emerald-400">ACTIVE (SESS-99421)</strong></div>
                <div className="flex justify-between"><span className="text-neutral-500">MFA:</span><strong className="text-emerald-400">FIDO2_VERIFIED</strong></div>
                <div className="flex justify-between"><span className="text-neutral-500">REAUTH:</span><strong className="text-emerald-400">VALID (15m window)</strong></div>
              </div>
              {onOpenPolicyInspector && (
                <button onClick={() => { setShowAccessDetails(false); onOpenPolicyInspector(); }} className="w-full text-center py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-[9px]">
                  INSPECT PDP POLICY &rarr;
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TITLE & ACTION BAR (04.5) */}
      <div className="p-3 rounded-2xl bg-[#111217] border border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h1 className="text-xs font-extrabold text-white uppercase tracking-wider">
            04 — CONSULTA NACIONAL DE CIDADÃOS
          </h1>
          <p className="text-[10px] text-neutral-400">
            Pesquisa autorizada de identidade e estado documental
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* VIEW MODE TOGGLE */}
          <div className="flex items-center p-0.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-bold">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-amber-500 text-neutral-950 font-extrabold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              TABELA DENSA
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-amber-500 text-neutral-950 font-extrabold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              CARTÕES
            </button>
          </div>

          <button
            onClick={handleExportQuery}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 font-bold text-xs uppercase flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>EXPORTAR CONSULTA</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold animate-in fade-in duration-150">
          {exportNotice}
        </div>
      )}

      {/* SEARCH & FILTERS BAR (04.6 & 04.7) */}
      <div className="p-3 rounded-2xl bg-[#111217] border border-neutral-800 space-y-2.5 shadow-lg">
        {/* INTERNAL SEARCH INPUT */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Q SEARCH NAME / BI / PROCESS / BIRTH_REGISTRATION / PHONE / PROVINCE..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 shadow-inner"
          />
        </div>

        {/* FILTERS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
          {/* ESTADO CIDADÃO */}
          <div className="flex flex-col gap-1 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 font-bold uppercase">ESTADO CIDADÃO:</span>
            <select
              value={filterCitizenState}
              onChange={(e) => setFilterCitizenState(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value="ALL" className="bg-neutral-900">TODOS</option>
              <option value="REGISTADO" className="bg-neutral-900">REGISTADO</option>
              <option value="NAO_REGISTADO" className="bg-neutral-900">NÃO REGISTADO</option>
              <option value="EM_REGULARIZACAO" className="bg-neutral-900">EM REGULARIZAÇÃO</option>
              <option value="FALECIDO" className="bg-neutral-900">FALECIDO</option>
              <option value="SUSPENSO_ADMINISTRATIVAMENTE" className="bg-neutral-900">SUSPENSO ADMIN</option>
            </select>
          </div>

          {/* ESTADO BI */}
          <div className="flex flex-col gap-1 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 font-bold uppercase">ESTADO DO BI:</span>
            <select
              value={filterBIState}
              onChange={(e) => setFilterBIState(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value="ALL" className="bg-neutral-900">TODOS</option>
              <option value="VALIDO" className="bg-neutral-900">VÁLIDO</option>
              <option value="EXPIRADO" className="bg-neutral-900">EXPIRADO</option>
              <option value="NAO_EMITIDO" className="bg-neutral-900">NÃO EMITIDO</option>
              <option value="SUSPENSO" className="bg-neutral-900">SUSPENSO</option>
              <option value="CANCELADO" className="bg-neutral-900">CANCELADO</option>
              <option value="EM_RENOVACAO" className="bg-neutral-900">EM RENOVAÇÃO</option>
            </select>
          </div>

          {/* TIPO REGISTO */}
          <div className="flex flex-col gap-1 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 font-bold uppercase">TIPO REGISTO:</span>
            <select
              value={filterRegType}
              onChange={(e) => setFilterRegType(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value="ALL" className="bg-neutral-900">TODOS</option>
              <option value="NASCIMENTO" className="bg-neutral-900">NASCIMENTO</option>
              <option value="BI" className="bg-neutral-900">BI</option>
              <option value="OUTRO" className="bg-neutral-900">OUTRO</option>
            </select>
          </div>

          {/* PROVÍNCIA */}
          <div className="flex flex-col gap-1 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 font-bold uppercase">PROVÍNCIA:</span>
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value="ALL" className="bg-neutral-900">TODAS (21)</option>
              <option value="Luanda" className="bg-neutral-900">Luanda</option>
              <option value="Benguela" className="bg-neutral-900">Benguela</option>
              <option value="Huambo" className="bg-neutral-900">Huambo</option>
              <option value="Huíla" className="bg-neutral-900">Huíla</option>
              <option value="Cabinda" className="bg-neutral-900">Cabinda</option>
            </select>
          </div>

          {/* ORDENAÇÃO */}
          <div className="flex flex-col gap-1 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 font-bold uppercase">ORDENAR:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value="RELEVANCE" className="bg-neutral-900">RELEVÂNCIA</option>
              <option value="NAME" className="bg-neutral-900">NOME</option>
              <option value="VALIDATION" className="bg-neutral-900">ÚLTIMA VALIDAÇÃO</option>
              <option value="STATE" className="bg-neutral-900">ESTADO</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS LISTING: DENSE TABLE OR CARDS */}
      {viewMode === 'TABLE' ? (
        <div className="p-3 rounded-2xl bg-[#111217] border border-neutral-800 overflow-x-auto shadow-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-wider">
                <th className="pb-2.5 px-3 font-bold">CID_ID</th>
                <th className="pb-2.5 px-3 font-bold">NOME COMPLETO</th>
                <th className="pb-2.5 px-3 font-bold">Nº DE BI</th>
                <th className="pb-2.5 px-3 font-bold">ESTADO CIDADÃO</th>
                <th className="pb-2.5 px-3 font-bold">ESTADO BI</th>
                <th className="pb-2.5 px-3 font-bold">PROVÍNCIA</th>
                <th className="pb-2.5 px-3 font-bold">ÚLTIMA VALIDAÇÃO</th>
                <th className="pb-2.5 px-3 font-bold text-right">AÇÃO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
              {filteredCitizens.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => handleOpenCitizen(c)}
                  className="hover:bg-neutral-900/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3 font-bold text-amber-400">{c.id}</td>
                  <td className="py-3 px-3 font-bold text-white uppercase font-sans group-hover:text-amber-300">
                    {c.fullName}
                    {c.hasDuplicitySuspect && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-mono">
                        DUPLICIDADE ({c.duplicityMatches})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-300">
                    {c.biNumber !== 'N/A' ? c.biNumber : 'NÃO EMITIDO'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getCitizenStateBadge(c.citizenState)}`}>
                      {c.citizenState}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getBIStateBadge(c.biState)}`}>
                      {c.biState}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-white">{c.province}</td>
                  <td className="py-3 px-3 text-neutral-400">{c.lastValidatedAt}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCitizen(c);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 group-hover:bg-amber-500 border border-neutral-700 group-hover:border-amber-500 text-amber-300 group-hover:text-neutral-950 text-[10px] font-mono font-bold uppercase transition-colors"
                    >
                      VER FICHA &rsaquo;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCitizens.map((c) => (
            <div
              key={c.id}
              onClick={() => handleOpenCitizen(c)}
              className="p-3.5 rounded-2xl bg-[#111217] border border-neutral-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-2.5 shadow-lg group"
            >
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800/80 pb-2">
                <div>
                  <span className="text-[10px] text-neutral-500 font-mono block">{c.id}</span>
                  <h3 className="text-xs font-extrabold text-white font-sans uppercase group-hover:text-amber-300 transition-colors">
                    {c.fullName}
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getCitizenStateBadge(c.citizenState)}`}>
                  {c.citizenState}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div>
                  <span className="text-neutral-500 block">Nº DE BI:</span>
                  <strong className="text-amber-300">{c.biNumber !== 'N/A' ? c.biNumber : 'NÃO EMITIDO'}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">ESTADO DO BI:</span>
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border uppercase ${getBIStateBadge(c.biState)}`}>
                    {c.biState}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">PROVÍNCIA:</span>
                  <strong className="text-white">{c.province}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">PROCESSOS:</span>
                  <strong className="text-blue-300">{c.processCount} VINCULADO(S)</strong>
                </div>
              </div>

              {c.hasDuplicitySuspect && (
                <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span>POSSÍVEL DUPLICIDADE ({c.duplicityMatches} MATCH)</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[9px] text-neutral-500 font-mono">
                <span>VAL: {c.lastValidatedAt}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCitizen(c);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 group-hover:bg-amber-500 border border-amber-500/40 group-hover:text-neutral-950 text-amber-300 font-bold transition-all flex items-center gap-1"
                >
                  <span>VER CIDADÃO</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCitizens.length === 0 && (
        <div className="p-8 rounded-2xl bg-[#111217] border border-neutral-800 text-center space-y-3 font-mono">
          <div className="text-amber-400 font-bold text-xs">NENHUM REGISTO LOCALIZADO COM OS FILTROS SOLICITADOS</div>
          <p className="text-[11px] text-neutral-400 font-sans max-w-md mx-auto">
            Não existe uma ficha direta para estes critérios. Caso o cidadão não possua registo ou BI, inicie um processo no módulo oficial de tramitação.
          </p>
          <button
            onClick={() => {
              if (onNavigateToProcesses) onNavigateToProcesses();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs uppercase"
          >
            INICIAR PROCESSO DE REGISTO EM 03_PROCESSOS &rarr;
          </button>
        </div>
      )}

      {/* ====================================================================
          FICHA DO CIDADÃO (CITIZEN PROFILE INSPECTOR MODAL - 04.11 - 04.24)
         ==================================================================== */}
      {selectedCitizen && (
        <div className="fixed inset-0 z-[9990] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 font-mono select-none overflow-y-auto">
          <div className="w-full max-w-5xl my-auto p-5 rounded-3xl bg-[#111217] border border-amber-500/40 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            
            {/* PROFILE HEADER (04.11) */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                {/* PHOTO CONTAINER (ONLY DISPLAYED INSIDE AUTHORIZED CITIZEN PROFILE SHEET) */}
                <div className="w-14 h-16 rounded-xl bg-neutral-900 border border-neutral-700 flex flex-col items-center justify-center text-neutral-500 text-[8px] font-bold">
                  <UserCheck className="w-6 h-6 text-amber-400 mb-0.5" />
                  <span>ICAO_PHOTO</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white font-sans uppercase">
                      {selectedCitizen.fullName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getCitizenStateBadge(selectedCitizen.citizenState)}`}>
                      {selectedCitizen.citizenState}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400 mt-1">
                    <span>CID_ID: <strong className="text-white">{selectedCitizen.id}</strong></span>
                    <span>•</span>
                    <span>BI: <strong className="text-amber-300">{selectedCitizen.biNumber}</strong></span>
                    <span>•</span>
                    <span>ESTADO BI: <strong className="text-emerald-300">{selectedCitizen.biState}</strong></span>
                    <span>•</span>
                    <span>PROV: <strong className="text-white">{selectedCitizen.province}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCitizen(null)}
                  className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:text-white text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PROFILE SUB-TABS SELECTOR (04.11) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-neutral-800 text-[10px] font-bold">
              {[
                { id: 'IDENTIDADE', label: '01 IDENTIDADE' },
                { id: 'DOCUMENTO', label: '02 DOCUMENTO BI' },
                { id: 'REGISTO_CIVIL', label: '03 REGISTO CIVIL' },
                { id: 'PROCESSOS', label: '04 PROCESSOS' },
                { id: 'VALIDACOES', label: '05 VALIDAÇÕES' },
                { id: 'HISTORICO', label: '06 HISTÓRICO' },
                { id: 'AUDITORIA', label: '07 AUDITORIA ACESSO' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDetailTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    detailTab === t.id
                      ? 'bg-amber-500 text-neutral-950 font-extrabold shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* SUB-TAB 01: IDENTIDADE (04.12 - ACCESS PROGRESSIVO E RESTRIÇÃO DE CAMPOS) */}
            {detailTab === 'IDENTIDADE' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">1ª CAMADA — DADOS MÍNIMOS DE IDENTIDADE</span>
                  <button
                    onClick={() => setShowFullBiography(!showFullBiography)}
                    className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 text-amber-300 text-[10px] font-bold"
                  >
                    {showFullBiography ? 'OCULTAR DADOS RESTRITOS' : '[VER DADOS COMPLETOS (RESTRICTED)]'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-[10px] text-neutral-500 block">NOME COMPLETO:</span><strong className="text-white font-sans">{selectedCitizen.fullName}</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">DATA NASCIMENTO:</span><strong className="text-white">{selectedCitizen.dob}</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">SEXO:</span><strong className="text-white">{selectedCitizen.sex === 'M' ? 'MASCULINO' : 'FEMININO'}</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">NATURALIDADE:</span><strong className="text-white">{selectedCitizen.birthPlace}</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">NACIONALIDADE:</span><strong className="text-emerald-300">{selectedCitizen.nationality}</strong></div>
                </div>

                {/* 2ª CAMADA — DADOS SENSÍVEIS E RESTRITOS */}
                {showFullBiography && (
                  <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2 text-xs font-mono animate-in fade-in duration-150">
                    <span className="text-[10px] font-bold text-purple-400 uppercase block border-b border-neutral-800 pb-1">
                      2ª CAMADA — FILIAÇÃO, MORADA & CONTACTOS (FIELD_LEVEL_AUTHORIZATION: RESTRICTED)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div><span className="text-[10px] text-neutral-500 block">NOME DO PAI:</span><strong className="text-white font-sans">{selectedCitizen.fatherName}</strong></div>
                      <div><span className="text-[10px] text-neutral-500 block">NOME DA MÃE:</span><strong className="text-white font-sans">{selectedCitizen.motherName}</strong></div>
                      <div><span className="text-[10px] text-neutral-500 block">MORADA DE RESIDÊNCIA:</span><strong className="text-white font-sans">{selectedCitizen.address}</strong></div>
                      <div><span className="text-[10px] text-neutral-500 block">CONTACTO TELEFÓNICO:</span><strong className="text-amber-300">{selectedCitizen.phone}</strong></div>
                      <div><span className="text-[10px] text-neutral-500 block">CORREIO ELETRÓNICO:</span><strong className="text-amber-300">{selectedCitizen.email}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 02: DOCUMENTO BI (04.13 - SEM BOTÃO DE EDITAR BI) */}
            {detailTab === 'DOCUMENTO' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">DOCUMENTO DE IDENTIDADE OFICIAL</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-[10px] text-neutral-500 block">Nº DO BI:</span><strong className="text-amber-300">{selectedCitizen.biNumber}</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">DATA DE EMISSÃO:</span><strong className="text-white">{selectedCitizen.biIssueDate}</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">DATA DE VALIDADE:</span><strong className="text-white">{selectedCitizen.biExpiryDate}</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">ESTADO DO BI:</span><span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getBIStateBadge(selectedCitizen.biState)}`}>{selectedCitizen.biState}</span></div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[10px]">
                    <span className="text-neutral-500 block">ASSINATURA DIGITAL PKI / DIGESTO:</span>
                    <strong className="text-purple-300 font-mono">{selectedCitizen.digitalCredentialHash}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowCredentialPreview(!showCredentialPreview)}
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold"
                    >
                      {showCredentialPreview ? 'OCULTAR CREDENCIAL' : 'VER CREDENCIAL DIGITAL'}
                    </button>
                  </div>
                </div>

                {showCredentialPreview && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-amber-500/10 border border-amber-500/40 space-y-2 animate-in zoom-in-95 duration-150">
                    <div className="flex justify-between text-[10px] border-b border-amber-500/30 pb-1">
                      <span className="font-extrabold text-amber-400">REPÚBLICA DE ANGOLA — BILHETE DE IDENTIDADE DIGITAL</span>
                      <span className="text-neutral-400">PKI RSA-4096</span>
                    </div>
                    <div className="grid grid-cols-2 text-[11px]">
                      <div><strong>{selectedCitizen.fullName}</strong></div>
                      <div className="text-right"><strong className="text-amber-300">{selectedCitizen.biNumber}</strong></div>
                    </div>
                  </div>
                )}

                <div className="p-2 rounded-xl bg-neutral-900/50 border border-neutral-800 text-[10px] text-neutral-400">
                  ⚠️ <strong>Aviso de Arquitetura:</strong> A ficha de cidadão é uma visão autorizada de leitura e validação. Nenhuma alteração direta ao BI pode ser realizada aqui; qualquer modificação deve obrigatoriamente transitar por um processo oficial no módulo <strong className="text-amber-300">03_PROCESSOS</strong>.
                </div>
              </div>
            )}

            {/* SUB-TAB 03: REGISTO CIVIL & CADEIA DE CONFIANÇA (04.14 - 04.15) */}
            {detailTab === 'REGISTO_CIVIL' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">ASSENTO DE NASCIMENTO & CADEIA DE CONFIANÇA</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                    ✓ SILA REGISTER VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-[10px] text-neutral-500 block">Nº ASSENTO NASCIMENTO:</span><strong className="text-amber-300">{selectedCitizen.birthRegistrationNo}</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">FONTE OFICIAL:</span><strong className="text-white">CONSERVATÓRIA DO REGISTO CIVIL MJDH</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">ESTADO DA VALIDAÇÃO:</span><strong className="text-emerald-400">✓ VALIDADO NA FONTE</strong></div>
                </div>

                {/* VISUAL TRUST CHAIN DIAGRAM (04.15) */}
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block">CADEIA DE CONFIANÇA INSTITUCIONAL</span>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center">
                      <strong className="block">REGISTO DE NASCIMENTO</strong>
                      <span className="text-[8px] text-neutral-400">{selectedCitizen.birthRegistrationNo}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 hidden sm:block" />
                    <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-center">
                      <strong className="block">IDENTIDADE CIVIL</strong>
                      <span className="text-[8px] text-neutral-400">{selectedCitizen.id}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 hidden sm:block" />
                    <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center">
                      <strong className="block">BILHETE DE IDENTIDADE</strong>
                      <span className="text-[8px] text-neutral-400">{selectedCitizen.biNumber}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 hidden sm:block" />
                    <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-center">
                      <strong className="block">CREDENCIAL DIGITAL</strong>
                      <span className="text-[8px] text-neutral-400">RSA-4096 SIGNED</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 04: PROCESSOS RELACIONADOS (04.16) */}
            {detailTab === 'PROCESSOS' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">PROCESSOS RELACIONADOS COM O CIDADÃO</span>
                  {onNavigateToProcesses && (
                    <button
                      onClick={() => onNavigateToProcesses()}
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px]"
                    >
                      ABRIR MÓDULO PROCESSOS &rarr;
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-neutral-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-neutral-900 text-[10px] text-neutral-400 uppercase">
                      <tr>
                        <th className="p-2.5">PROCESS_ID</th>
                        <th className="p-2.5">TIPO</th>
                        <th className="p-2.5">STATUS</th>
                        <th className="p-2.5">DATA</th>
                        <th className="p-2.5 text-right">AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-[11px]">
                      {selectedCitizen.relatedProcesses.map((p) => (
                        <tr key={p.id}>
                          <td className="p-2.5 font-bold text-amber-400">{p.id}</td>
                          <td className="p-2.5 text-white font-bold">{p.type}</td>
                          <td className="p-2.5 text-emerald-400 font-bold">{p.status}</td>
                          <td className="p-2.5 text-neutral-400">{p.createdAt}</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => {
                                if (onNavigateToProcesses) onNavigateToProcesses(p.id);
                              }}
                              className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-amber-300 font-bold text-[10px]"
                            >
                              VER NO MÓDULO PROCESSOS &rsaquo;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 05: VALIDAÇÕES (04.17) */}
            {detailTab === 'VALIDACOES' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">EVIDÊNCIAS DE VALIDAÇÃO TÉCNICA</span>
                <div className="space-y-1.5">
                  {selectedCitizen.validations.map((v) => (
                    <div key={v.key} className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        {v.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                        <span className="font-bold text-white">{v.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                        <span>SOURCE: <strong className="text-amber-300">{v.source}</strong></span>
                        <span>{v.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 06: HISTÓRICO (04.18) */}
            {detailTab === 'HISTORICO' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">HISTÓRICO EVENTUAL DA IDENTIDADE</span>
                <div className="space-y-2 border-l-2 border-amber-500/40 pl-3">
                  {selectedCitizen.identityHistory.map((h, idx) => (
                    <div key={idx} className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-amber-400 font-bold">{h.time}</span>
                        <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-white font-bold">{h.event}</span>
                      </div>
                      <p className="text-neutral-300 font-sans text-[11px]">{h.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 07: AUDITORIA DE ACESSO (04.19) */}
            {detailTab === 'AUDITORIA' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">LOGS DE AUDITORIA DE ACESSO A ESTA FICHA (CITIZEN_RECORD_ACCESSED)</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold">
                    APPEND-ONLY AUDIT
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-neutral-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-neutral-900 text-[10px] text-neutral-400 uppercase">
                      <tr>
                        <th className="p-2.5">TIMESTAMP</th>
                        <th className="p-2.5">ACTOR</th>
                        <th className="p-2.5">ROLE</th>
                        <th className="p-2.5">ORG</th>
                        <th className="p-2.5">PURPOSE</th>
                        <th className="p-2.5 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-[11px]">
                      {selectedCitizen.accessAuditLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-amber-400">{log.time}</td>
                          <td className="p-2.5 text-white font-bold">{log.actor}</td>
                          <td className="p-2.5 text-neutral-300">{log.role}</td>
                          <td className="p-2.5 text-neutral-400">{log.org}</td>
                          <td className="p-2.5 text-purple-300 font-bold">{log.purpose}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-400">{log.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FIELD LEVEL AUTHORIZATION TABLE FOOTER */}
            <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-400 font-mono">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>FIELD_LEVEL_AUTHORIZATION: Nome/BI (L1 OK) • Morada/Filiação (L2 Restricted) • Biometria/Audit (L3 Locked)</span>
              </div>
              <button
                onClick={() => setSelectedCitizen(null)}
                className="px-3 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold uppercase"
              >
                FECHAR FICHA
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
