import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  Eye,
  Lock,
  Building2,
  RefreshCw,
  QrCode,
  Shield,
  FileText,
  UserCheck,
  ChevronRight,
  Sparkles,
  RotateCcw,
  AlertCircle,
  History,
  Layers,
  Database,
  ExternalLink,
  ShieldAlert,
  Printer,
  Download,
  Fingerprint
} from 'lucide-react';

export type BIDocumentStatus =
  | 'ACTIVE'
  | 'EXPIRING'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'CANCELLED'
  | 'REPLACED'
  | 'IN_PRODUCTION'
  | 'APPLICATION'
  | 'NOT_ISSUED';

export type BIOperationType = 'PRIMEIRO' | 'RENOVACAO' | 'SUBSTITUICAO' | 'CORRECAO';

export interface BIDocumentItem {
  biNumber: string;
  cardSerial: string;
  identityId: string;
  citizenName: string;
  birthDate: string;
  gender: 'M' | 'F';
  province: string;
  municipio: string;
  issueDate: string;
  expiryDate: string;
  status: BIDocumentStatus;
  operationType: BIOperationType;
  sourceProcessId: string;
  digitalCredentialStatus: 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'PENDING';
  lifecycleStep: 'IDENTITY_VERIFIED' | 'ELIGIBLE' | 'APPLICATION' | 'BIOMETRICS' | 'APPROVED' | 'PERSONALIZATION' | 'ISSUED' | 'ACTIVE' | 'EXPIRED' | 'REPLACED' | 'SUSPENDED' | 'REVOKED';
  replacedByBiNumber?: string;
  previousBiNumber?: string;
  issuingPost: string;
  pkiSignatureHash: string;
  photoUrl?: string;
  recentVerificationsCount: number;
  isFlagged?: boolean;
  flagReason?: string;
}

interface BiCardsTabProps {
  onOpenReauth?: () => void;
  onOpenPolicyInspector?: () => void;
  onOpenOrgSelector?: () => void;
  onNavigateToProcesses?: (processId?: string) => void;
  onNavigateToIdentity?: (identityId?: string) => void;
  onNavigateToCitizens?: () => void;
}

// MOCK DEMO DATA FOR BI DOCUMENTS
const DEMO_BI_DOCUMENTS: BIDocumentItem[] = [
  {
    biNumber: '001508576HO034',
    cardSerial: 'AO-88201942',
    identityId: 'ID-00000123',
    citizenName: 'MARCELINO CAMATI SAPALO',
    birthDate: '15/04/1992',
    gender: 'M',
    province: 'Luanda',
    municipio: 'Belas',
    issueDate: '23/07/2021',
    expiryDate: '22/07/2031',
    status: 'ACTIVE',
    operationType: 'RENOVACAO',
    sourceProcessId: 'REQ-000184',
    digitalCredentialStatus: 'ACTIVE',
    lifecycleStep: 'ACTIVE',
    previousBiNumber: '001508576HO021',
    issuingPost: 'Posto Emissor SIAC Talatona',
    pkiSignatureHash: '0x9a8f12c4b8e920d1',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    recentVerificationsCount: 14
  },
  {
    biNumber: '002981045HA041',
    cardSerial: 'AO-99410211',
    identityId: 'ID-00000124',
    citizenName: 'ANA PAULA FERREIRA DOS SANTOS',
    birthDate: '03/11/1988',
    gender: 'F',
    province: 'Luanda',
    municipio: 'Cazenga',
    issueDate: '10/01/2024',
    expiryDate: '09/01/2034',
    status: 'ACTIVE',
    operationType: 'PRIMEIRO',
    sourceProcessId: 'REQ-000185',
    digitalCredentialStatus: 'ACTIVE',
    lifecycleStep: 'ACTIVE',
    issuingPost: 'Conservatória do Registo Civil do Cazenga',
    pkiSignatureHash: '0x321fa98711ef0021',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    recentVerificationsCount: 8
  },
  {
    biNumber: '003112984HU012',
    cardSerial: 'AO-77102983',
    identityId: 'ID-00000125',
    citizenName: 'JOÃO BATISTA KIALA',
    birthDate: '22/09/1975',
    gender: 'M',
    province: 'Huambo',
    municipio: 'Huambo',
    issueDate: '15/05/2016',
    expiryDate: '14/05/2026',
    status: 'EXPIRING',
    operationType: 'RENOVACAO',
    sourceProcessId: 'REQ-000186',
    digitalCredentialStatus: 'ACTIVE',
    lifecycleStep: 'ACTIVE',
    issuingPost: 'Delegacia Provincial da Justiça do Huambo',
    pkiSignatureHash: '0x12bb44e098a123ff',
    recentVerificationsCount: 22
  },
  {
    biNumber: '004019283BG098',
    cardSerial: 'AO-66201988',
    identityId: 'ID-00000126',
    citizenName: 'ESPERANÇA MANUELA KASSOMA',
    birthDate: '11/02/1999',
    gender: 'F',
    province: 'Benguela',
    municipio: 'Lobito',
    issueDate: '01/08/2026',
    expiryDate: '01/08/2036',
    status: 'IN_PRODUCTION',
    operationType: 'SUBSTITUICAO',
    sourceProcessId: 'REQ-000187',
    digitalCredentialStatus: 'PENDING',
    lifecycleStep: 'PERSONALIZATION',
    issuingPost: 'Posto Emissor Lobito Central',
    pkiSignatureHash: '0x77aa11299ef01041',
    recentVerificationsCount: 0
  },
  {
    biNumber: '005882109CAB02',
    cardSerial: 'AO-55410988',
    identityId: 'ID-00000127',
    citizenName: 'ANTÓNIO FRANCISCO BUMBA',
    birthDate: '30/06/1980',
    gender: 'M',
    province: 'Cabinda',
    municipio: 'Cabinda',
    issueDate: '12/03/2022',
    expiryDate: '11/03/2032',
    status: 'SUSPENDED',
    operationType: 'SUBSTITUICAO',
    sourceProcessId: 'REQ-000188',
    digitalCredentialStatus: 'SUSPENDED',
    lifecycleStep: 'SUSPENDED',
    issuingPost: 'Conservatória do Registo Civil de Cabinda',
    pkiSignatureHash: '0x55ef0192348aa120',
    recentVerificationsCount: 3,
    isFlagged: true,
    flagReason: 'Inconsistência na assinatura digital detectada no posto de verificação SIAC'
  },
  {
    biNumber: '001508576HO021',
    cardSerial: 'AO-44109281',
    identityId: 'ID-00000123',
    citizenName: 'MARCELINO CAMATI SAPALO',
    birthDate: '15/04/1992',
    gender: 'M',
    province: 'Luanda',
    municipio: 'Belas',
    issueDate: '23/07/2011',
    expiryDate: '22/07/2021',
    status: 'REPLACED',
    operationType: 'PRIMEIRO',
    sourceProcessId: 'REQ-000012',
    digitalCredentialStatus: 'REVOKED',
    lifecycleStep: 'REPLACED',
    replacedByBiNumber: '001508576HO034',
    issuingPost: 'Posto Emissor SIAC Maianga',
    pkiSignatureHash: '0x11ab22cd33ef4455',
    recentVerificationsCount: 45
  }
];

export const BiCardsTab: React.FC<BiCardsTabProps> = ({
  onOpenReauth,
  onOpenPolicyInspector,
  onOpenOrgSelector,
  onNavigateToProcesses,
  onNavigateToIdentity,
  onNavigateToCitizens
}) => {
  // SEARCH & FILTER STATE
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedOperation, setSelectedOperation] = useState<string>('ALL');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');

  // SELECTED BI INSPECTION DRAWER / MODAL
  const [selectedBi, setSelectedBi] = useState<BIDocumentItem | null>(null);
  const [inspectorSubTab, setInspectorSubTab] = useState<'SUMMARY' | 'LIFECYCLE' | 'SECURITY' | 'CREDENTIAL' | 'HISTORY' | 'AUDIT'>('SUMMARY');

  // ACTION MODALS STATE
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [replacementReason, setReplacementReason] = useState('PERDA');

  // FILTER LOGIC
  const filteredDocuments = useMemo(() => {
    return DEMO_BI_DOCUMENTS.filter((doc) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        doc.biNumber.toLowerCase().includes(term) ||
        doc.citizenName.toLowerCase().includes(term) ||
        doc.identityId.toLowerCase().includes(term) ||
        doc.sourceProcessId.toLowerCase().includes(term) ||
        doc.cardSerial.toLowerCase().includes(term);

      const matchesStatus =
        selectedStatus === 'ALL' || doc.status === selectedStatus;

      const matchesOperation =
        selectedOperation === 'ALL' || doc.operationType === selectedOperation;

      const matchesProvince =
        selectedProvince === 'ALL' || doc.province.toLowerCase() === selectedProvince.toLowerCase();

      return matchesSearch && matchesStatus && matchesOperation && matchesProvince;
    });
  }, [searchTerm, selectedStatus, selectedOperation, selectedProvince]);

  // STATUS BADGE HELPER
  const getStatusBadge = (status: BIDocumentStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'EXPIRING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'EXPIRED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'SUSPENDED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'REVOKED':
      case 'CANCELLED':
        return 'bg-rose-900/40 text-rose-400 border-rose-700/50';
      case 'REPLACED':
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
      case 'IN_PRODUCTION':
      case 'APPLICATION':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  const getStatusLabel = (status: BIDocumentStatus) => {
    switch (status) {
      case 'ACTIVE': return 'VÁLIDO';
      case 'EXPIRING': return 'A EXPIRAR';
      case 'EXPIRED': return 'EXPIRADO';
      case 'SUSPENDED': return 'SUSPENSO';
      case 'REVOKED': return 'REVOGADO';
      case 'CANCELLED': return 'CANCELADO';
      case 'REPLACED': return 'SUBSTITUÍDO';
      case 'IN_PRODUCTION': return 'EM PRODUÇÃO';
      case 'APPLICATION': return 'EM RENOVAÇÃO';
      case 'NOT_ISSUED': return 'NÃO EMITIDO';
      default: return status;
    }
  };

  return (
    <div className="space-y-5 text-neutral-200 font-sans">
      {/* =========================================================
          06.01 BREADCRUMB & TOP INSTITUTIONAL BAR
         ========================================================= */}
      <div className="p-3.5 rounded-2xl bg-[#111217] border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-neutral-400 flex-wrap">
          <span className="text-amber-400 font-bold">SILA / GOVOS</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-neutral-300 font-bold">MJDH_CENTRAL</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-neutral-400">CONSELHO SUPERIOR DE IDENTIFICAÇÃO CIVIL MJDH</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            06_BI_CARDS
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SYS_ONLINE (24ms)
          </span>
          <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-xl">
            SESS_ACTIVE
          </span>
          <span className="text-[10px] text-neutral-400 font-bold bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-xl">
            🔔 4 NOTIF
          </span>
          <span className="text-[10px] text-purple-300 font-bold bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-xl">
            DeusFundador (SuperAdmin)
          </span>
        </div>
      </div>

      {/* =========================================================
          06.02 IAM SECURITY & CONTROL BANNER (RECOLHÍVEL)
         ========================================================= */}
      <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-inner">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-neutral-500 font-bold uppercase text-[10px]">CAMADA IAM ACCESSO:</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
            GOVERNANCE_ADMIN
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold">
            ÂMBITO: NACIONAL
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
            MFA ✓
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
            SESSION ACTIVE ✓
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPolicyInspector && (
            <button
              onClick={onOpenPolicyInspector}
              className="px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-bold uppercase transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              POLÍTICA DE DOCUMENTOS
            </button>
          )}
          {onOpenReauth && (
            <button
              onClick={onOpenReauth}
              className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[10px] font-bold uppercase transition-colors"
            >
              ELEVAR MFA
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          06.03 MODULE HEADER & GLOBAL SYSTEM STATE (PRIMER BLOCO)
         ========================================================= */}
      <div className="p-5 rounded-2xl bg-[#111217] border border-neutral-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h1 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
                ✦ MÓDULO DE BILHETE DE IDENTIDADE (06_BI)
              </h1>
            </div>
            <p className="text-xs text-neutral-400 font-sans">
              Fonte autoritativa documental para controlo de emissão, validade, ciclo de vida e credencial digital do BI da República de Angola.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-neutral-500 text-[10px] block uppercase font-bold">AUTORIDADE DOCUMENTAL:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                ● ONLINE (SILA_DOCUMENT_SERVER)
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-neutral-500 text-[10px] block uppercase font-bold">AUDITORIA DE DOCUMENTOS:</span>
              <span className="text-amber-300 font-bold">● ACTIVE & IMUTÁVEL</span>
            </div>
          </div>
        </div>

        {/* METRICS CARDS (ESTADO GLOBAL DE DOCUMENTOS) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">BI TOTAL EMITIDOS</span>
            <span className="text-base font-extrabold text-white block">1.482.910</span>
            <span className="text-[9px] text-emerald-400">NÓ MJDH REGISTADO</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-emerald-500/30 space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">VÁLIDOS (ACTIVE)</span>
            <span className="text-base font-extrabold text-emerald-300 block">1.320.100</span>
            <span className="text-[9px] text-neutral-400">89.0% DA POPULAÇÃO</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-amber-500/30 space-y-1">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">A EXPIRAR / EXPIRADOS</span>
            <span className="text-base font-extrabold text-amber-300 block">84.200</span>
            <span className="text-[9px] text-amber-400/80">REQUER RENOVAÇÃO</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-purple-500/30 space-y-1">
            <span className="text-[10px] text-purple-400 uppercase font-bold block">SUSPENSOS / CANCELADOS</span>
            <span className="text-base font-extrabold text-purple-300 block">12.450</span>
            <span className="text-[9px] text-purple-400/80">DECISÃO JUDICIAL/ADMIN</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-blue-500/30 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-blue-400 uppercase font-bold block">EM PRODUÇÃO / RENOVAÇÃO</span>
            <span className="text-base font-extrabold text-blue-300 block">66.160</span>
            <span className="text-[9px] text-blue-400/80">EM TRAMITAÇÃO (03)</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          06.04 PESQUISA GLOBAL & FILTROS AVANÇADOS DE BI
         ========================================================= */}
      <div className="p-4 rounded-2xl bg-[#111217] border border-neutral-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 font-mono">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              PESQUISA DE DOCUMENTO DE BI (BI / PROC / NAME / PROV / SERIAL)
            </span>
          </div>
          <span className="text-[10px] text-neutral-400">
            A EXIBIR <strong className="text-amber-400">{filteredDocuments.length}</strong> DOCUMENTO(S)
          </span>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative font-mono">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Q SEARCH BI (EX: 001508576HO034), NOME, ID IDENTIDADE, PROCESSO (EX: REQ-000184) OU SERIAL CARTÃO..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* FILTERS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
          {/* ESTADO DO BI */}
          <div>
            <label className="text-[10px] text-neutral-500 block mb-1 font-bold uppercase">
              ESTADO DO DOCUMENTO:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500/60"
            >
              <option value="ALL">TODOS OS ESTADOS</option>
              <option value="ACTIVE">VÁLIDO (ACTIVE)</option>
              <option value="EXPIRING">A EXPIRAR (EXPIRING)</option>
              <option value="EXPIRED">EXPIRADO (EXPIRED)</option>
              <option value="SUSPENDED">SUSPENSO (SUSPENDED)</option>
              <option value="REVOKED">REVOGADO (REVOKED)</option>
              <option value="CANCELLED">CANCELADO (CANCELLED)</option>
              <option value="REPLACED">SUBSTITUÍDO (REPLACED)</option>
              <option value="IN_PRODUCTION">EM PRODUÇÃO (IN_PRODUCTION)</option>
            </select>
          </div>

          {/* TIPO DE OPERAÇÃO */}
          <div>
            <label className="text-[10px] text-neutral-500 block mb-1 font-bold uppercase">
              TIPO DE OPERAÇÃO:
            </label>
            <select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500/60"
            >
              <option value="ALL">TODAS AS OPERAÇÕES</option>
              <option value="PRIMEIRO">PRIMEIRO BI</option>
              <option value="RENOVACAO">RENOVAÇÃO</option>
              <option value="SUBSTITUICAO">SUBSTITUIÇÃO</option>
              <option value="CORRECAO">CORREÇÃO</option>
            </select>
          </div>

          {/* PROVÍNCIA */}
          <div>
            <label className="text-[10px] text-neutral-500 block mb-1 font-bold uppercase">
              PROVÍNCIA EMISSORA:
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500/60"
            >
              <option value="ALL">TODAS AS PROVÍNCIAS</option>
              <option value="Luanda">Luanda</option>
              <option value="Huambo">Huambo</option>
              <option value="Benguela">Benguela</option>
              <option value="Cabinda">Cabinda</option>
              <option value="Huíla">Huíla</option>
              <option value="Uíge">Uíge</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================
          06.05 REPRESENTAÇÃO VISUAL DOCUMENTAL (MINI BI CARDS GRID)
         ========================================================= */}
      <div className="space-y-3 font-mono">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-amber-400" />
            CARTÕES DOCUMENTAIS DE BI (VISUAL REPRESENTATION)
          </span>
          <span className="text-[10px] text-neutral-500">CLIQUE EM "VER BI ›" PARA INSPECIONAR FICHA COMPLETA</span>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#111217] border border-neutral-800 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
            <h3 className="text-xs font-bold text-white uppercase">Nenhum Bilhete de Identidade Encontrado</h3>
            <p className="text-[11px] text-neutral-400 max-w-sm mx-auto font-sans">
              Ajuste os termos da pesquisa ou limpe os filtros para visualizar os documentos registados na autoridade MJDH.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.biNumber + doc.cardSerial}
                className="p-4 rounded-2xl bg-[#111217] border border-neutral-800 hover:border-amber-500/50 transition-all duration-200 space-y-3.5 relative overflow-hidden group shadow-lg"
              >
                {/* ANGOLA BI CARD HEADER */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-neutral-900 via-amber-950/20 to-neutral-900 border border-amber-500/30 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-extrabold text-amber-400 tracking-wider block uppercase">
                      REPÚBLICA DE ANGOLA
                    </span>
                    <span className="text-[8px] text-neutral-400 block uppercase font-sans font-bold">
                      MINISTÉRIO DA JUSTIÇA E DOS DIREITOS HUMANOS
                    </span>
                    <strong className="text-[11px] font-extrabold text-white block tracking-tight uppercase">
                      BILHETE DE IDENTIDADE
                    </strong>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase whitespace-nowrap ${getStatusBadge(doc.status)}`}>
                    {getStatusLabel(doc.status)}
                  </span>
                </div>

                {/* CARD BODY: PHOTO + CITIZEN DETAILS */}
                <div className="flex gap-3 items-center">
                  {/* CITIZEN PHOTO */}
                  <div className="w-16 h-20 rounded-lg bg-neutral-900 border border-neutral-700 flex-shrink-0 overflow-hidden relative flex items-center justify-center text-neutral-600">
                    {doc.photoUrl ? (
                      <img src={doc.photoUrl} alt={doc.citizenName} className="w-full h-full object-cover" />
                    ) : (
                      <UserCheck className="w-8 h-8 text-neutral-700" />
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[7px] text-center text-neutral-400 py-0.5 font-mono">
                      ICAO DOC
                    </span>
                  </div>

                  {/* DETAILS */}
                  <div className="space-y-1 text-xs overflow-hidden flex-1">
                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase font-bold">TITULAR:</span>
                      <strong className="text-white text-xs font-sans font-bold uppercase block truncate group-hover:text-amber-300">
                        {doc.citizenName}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div>
                        <span className="text-[8px] text-neutral-500 block uppercase">Nº DO BI:</span>
                        <strong className="text-amber-300 font-bold block">{doc.biNumber}</strong>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-500 block uppercase">VALIDADE:</span>
                        <strong className="text-white font-bold block">{doc.expiryDate}</strong>
                      </div>
                    </div>

                    <div className="text-[9px] text-neutral-400 flex items-center gap-2 pt-0.5">
                      <span>SERIAL: <strong className="text-neutral-300">{doc.cardSerial}</strong></span>
                      <span>• {doc.province}</span>
                    </div>
                  </div>
                </div>

                {/* FLAGGED ALERT IN CARD */}
                {doc.isFlagged && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] flex items-center gap-1.5 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">⚠ DOCUMENTO SINALIZADO PELO SISTEMA</span>
                  </div>
                )}

                {/* CARD FOOTER ACTIONS */}
                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-neutral-500 text-[9px]">
                    PROC: <strong className="text-neutral-300">{doc.sourceProcessId}</strong>
                  </span>

                  <button
                    onClick={() => {
                      setSelectedBi(doc);
                      setInspectorSubTab('SUMMARY');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-neutral-900 group-hover:bg-amber-500 border border-neutral-700 group-hover:border-amber-500 text-amber-300 group-hover:text-neutral-950 font-bold uppercase transition-all duration-150 flex items-center gap-1"
                  >
                    VER BI &rsaquo;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================
          06.06 FICHA COMPLETA DO BI DETAIL INSPECTOR (MODAL / DRAWER)
         ========================================================= */}
      {selectedBi && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#111217] border border-neutral-800 rounded-3xl max-w-4xl w-full p-5 sm:p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200 my-auto">
            
            {/* INSPECTOR HEADER */}
            <div className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap font-mono">
                  <span className="text-[10px] text-amber-400 font-extrabold uppercase bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-xl">
                    INSPECTOR DE BILHETE DE IDENTIDADE
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-xl text-[10px] font-bold border uppercase ${getStatusBadge(selectedBi.status)}`}>
                    {getStatusLabel(selectedBi.status)}
                  </span>
                  {selectedBi.isFlagged && (
                    <span className="px-2.5 py-0.5 rounded-xl text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      ⚠ FLAGGED
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-white uppercase tracking-tight font-sans">
                  {selectedBi.citizenName}
                </h2>
                <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                  <span>Nº BI: <strong className="text-amber-300">{selectedBi.biNumber}</strong></span>
                  <span>• SERIAL: <strong className="text-white">{selectedBi.cardSerial}</strong></span>
                  <span>• PROVÍNCIA: <strong className="text-neutral-300">{selectedBi.province}</strong></span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBi(null)}
                className="p-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* NAVIGATION SUB-TABS INSIDE INSPECTOR */}
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto text-xs font-mono">
              {[
                { id: 'SUMMARY', label: '01. FICHA TÉCNICA' },
                { id: 'LIFECYCLE', label: '02. CICLO DE VIDA (LIFECYCLE)' },
                { id: 'SECURITY', label: '03. SEGURANÇA & PKI' },
                { id: 'CREDENTIAL', label: '04. CREDENCIAL DIGITAL' },
                { id: 'HISTORY', label: '05. CADEIA DE SUBSTITUIÇÃO' },
                { id: 'AUDIT', label: '06. AUDITORIA' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setInspectorSubTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-bold text-[11px] ${
                    inspectorSubTab === tab.id
                      ? 'bg-amber-500 text-neutral-950 font-extrabold shadow'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* SUB-TAB 01: FICHA TÉCNICA & VINCULAÇÕES */}
            {inspectorSubTab === 'SUMMARY' && (
              <div className="space-y-4 font-mono">
                {/* REPRESENTAÇÃO VISUAL REPETIDA EM DESTAQUE */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">
                      REPÚBLICA DE ANGOLA — DOCUMENTO OFICIAL DE IDENTIDADE
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">TITULAR DO DOCUMENTO:</span>
                        <strong className="text-white font-sans text-sm block font-bold uppercase">{selectedBi.citizenName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">Nº DO BI:</span>
                        <strong className="text-amber-300 text-sm block font-bold">{selectedBi.biNumber}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">DATA DE EMISSÃO:</span>
                        <strong className="text-white block">{selectedBi.issueDate}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">DATA DE VALIDADE:</span>
                        <strong className="text-emerald-400 block font-bold">{selectedBi.expiryDate} (VÁLIDO)</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">POSTO EMISSOR:</span>
                        <strong className="text-neutral-300 block">{selectedBi.issuingPost}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">OPERAÇÃO ORIGEM:</span>
                        <strong className="text-purple-300 block font-bold">{selectedBi.operationType}</strong>
                      </div>
                    </div>
                  </div>

                  {/* LINKS DE NAVEGAÇÃO CRUZADA A OUTROS MÓDULOS */}
                  <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase block">
                        VINCULAÇÕES ANCORADAS
                      </span>

                      {/* 11. VINCULAÇÃO À IDENTIDADE (MÓDULO 05) */}
                      <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                        <span className="text-[9px] text-neutral-500 block uppercase font-bold">VÍNCULO IDENTIDADE (05):</span>
                        <strong className="text-amber-300 text-xs block">{selectedBi.identityId}</strong>
                        <button
                          onClick={() => {
                            if (onNavigateToIdentity) onNavigateToIdentity(selectedBi.identityId);
                          }}
                          className="w-full mt-1 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[9px] font-bold uppercase transition-colors text-center flex items-center justify-center gap-1"
                        >
                          VER IDENTIDADE (05) &rsaquo;
                        </button>
                      </div>

                      {/* 12. VINCULAÇÃO AO PROCESSO (MÓDULO 03) */}
                      <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                        <span className="text-[9px] text-neutral-500 block uppercase font-bold">PROCESSO ORIGEM (03):</span>
                        <strong className="text-blue-300 text-xs block">{selectedBi.sourceProcessId}</strong>
                        <button
                          onClick={() => {
                            if (onNavigateToProcesses) onNavigateToProcesses(selectedBi.sourceProcessId);
                          }}
                          className="w-full mt-1 px-2 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-[9px] font-bold uppercase transition-colors text-center flex items-center justify-center gap-1"
                        >
                          VER PROCESSO (03) &rsaquo;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACCORDION / TABLE FOR VALIDATION CHECKLIST */}
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block">
                    MATRIZ DE VALIDAÇÃO UNIFICADA DO DOCUMENTO
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                      <span className="text-neutral-400">VÍNCULO IDENTIDADE:</span>
                      <strong className="text-emerald-400">✓ VÁLIDO</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                      <span className="text-neutral-400">ASSINATURA PKI:</span>
                      <strong className="text-emerald-400">✓ VÁLIDA</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                      <span className="text-neutral-400">TESTE REVOGAÇÃO:</span>
                      <strong className="text-emerald-400">✓ OK</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                      <span className="text-neutral-400">MATCH AFIS:</span>
                      <strong className="text-purple-300">✓ 99.8%</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 02: CICLO DE VIDA DO DOCUMENTO (LIFECYCLE SCHEMATIC) */}
            {inspectorSubTab === 'LIFECYCLE' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    13. ESQUEMA DO CICLO DE VIDA DO BILHETE DE IDENTIDADE (BI LIFECYCLE)
                  </span>
                  <span className="text-[10px] text-neutral-400">ETAPA ATUAL: <strong className="text-emerald-400">{selectedBi.lifecycleStep}</strong></span>
                </div>

                {/* LIFECYCLE STEPPER PIPELINE */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                    {[
                      { step: 'IDENTITY_VERIFIED', label: '01. IDENTIDADE' },
                      { step: 'ELIGIBLE', label: '02. ELEGIBILIDADE' },
                      { step: 'APPLICATION', label: '03. REQUERIMENTO' },
                      { step: 'BIOMETRICS', label: '04. BIOMETRIA' },
                      { step: 'APPROVED', label: '05. APROVAÇÃO' },
                      { step: 'PERSONALIZATION', label: '06. PRODUÇÃO' },
                      { step: 'ISSUED', label: '07. EMISSÃO' },
                      { step: 'ACTIVE', label: '08. ATIVO (VÁLIDO)' }
                    ].map((st, idx) => (
                      <React.Fragment key={st.step}>
                        <div className={`p-2 rounded-xl text-center border font-bold min-w-[90px] ${
                          st.step === selectedBi.lifecycleStep || (selectedBi.lifecycleStep === 'ACTIVE' && idx <= 7)
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-neutral-950 text-neutral-500 border-neutral-800'
                        }`}>
                          <span className="block text-[9px] text-neutral-400">{st.label}</span>
                          <span className="text-[8px]">{st.step === selectedBi.lifecycleStep ? '● ATUAL' : '✓ CONCLUÍDO'}</span>
                        </div>
                        {idx < 7 && <ArrowRight className="w-3.5 h-3.5 text-neutral-600 hidden lg:block" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                    14. DEFINIÇÃO RÍGIDA DE ESTADOS DO DOCUMENTO:
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-neutral-300">
                    <li>• <strong className="text-emerald-400">ACTIVE (VÁLIDO):</strong> Documento oficialmente em vigor, aceito em todas as instituições.</li>
                    <li>• <strong className="text-purple-300">SUSPENDED (SUSPENSO):</strong> Documento temporariamente inativo por medida cautelar ou investigação.</li>
                    <li>• <strong className="text-rose-400">REVOKED (REVOGADO):</strong> Documento tornado nulo por decisão judicial ou fraude grave.</li>
                    <li>• <strong className="text-rose-300">CANCELLED (CANCELADO):</strong> Documento cancelado por erro administrativo de emissão.</li>
                    <li>• <strong className="text-neutral-400">REPLACED (SUBSTITUÍDO):</strong> Documento histórico antigo substituído por uma nova via/renovação.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* SUB-TAB 03: SEGURANÇA & CRIPTOGRAFIA PKI */}
            {inspectorSubTab === 'SECURITY' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    20. SEGURANÇA DO DOCUMENTO E INTEGRIDADE PKI (DOCUMENT SECURITY)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ ASSINATURA PKI VÁLIDA</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 block uppercase">HASH DE ASSINATURA PKI MJDH:</span>
                    <strong className="text-amber-300 font-mono text-[11px] block break-all">{selectedBi.pkiSignatureHash}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 block uppercase">AUTORIDADE EMISSORA (ISSUER):</span>
                    <strong className="text-white block font-bold">GOVERNO DE ANGOLA / MJDH CENTRAL</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 block uppercase">ESTADO DE REVOGAÇÃO (CRL/OCSP):</span>
                    <strong className="text-emerald-400 block font-bold">✓ NÃO REVOGADO (NOT_REVOKED)</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 block uppercase">CHIP DE SEGURANÇA IC:</span>
                    <strong className="text-emerald-400 block font-bold">✓ CHIP ATIVO & VERIFICADO</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[10px] text-neutral-400 space-y-1">
                  <span>🔒 <strong>Chaves Privadas Protegidas:</strong> O módulo não exibe chaves privadas sob nenhuma circunstância. A verificação é efetuada por validação de chave pública autorizada MJDH PKI Root.</span>
                </div>
              </div>
            )}

            {/* SUB-TAB 04: CREDENCIAL DIGITAL (PWA SILA) */}
            {inspectorSubTab === 'CREDENTIAL' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    22. CREDENCIAL DIGITAL PWA vs. BI FÍSICO
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ PWA_SYNC_ACTIVE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">BI FÍSICO (CARTÃO)</span>
                    <div className="space-y-1 text-xs">
                      <div><span>ESTADO: </span><strong className="text-emerald-400">{selectedBi.status}</strong></div>
                      <div><span>SERIAL: </span><strong className="text-white">{selectedBi.cardSerial}</strong></div>
                      <div><span>EMISSÃO: </span><strong className="text-neutral-300">{selectedBi.issueDate}</strong></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">CREDENCIAL DIGITAL PWA (SILA)</span>
                    <div className="space-y-1 text-xs">
                      <div><span>ESTADO CREDENCIAL: </span><strong className="text-emerald-400">{selectedBi.digitalCredentialStatus}</strong></div>
                      <div><span>CÓDIGO QR OFFLINE: </span><strong className="text-amber-300">✓ VÁLIDO & ASSINADO</strong></div>
                      <div><span>VERIFICAÇÕES OFFLINE: </span><strong className="text-white">{selectedBi.recentVerificationsCount} VERIFICAÇÕES</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 05: CADEIA DE SUBSTITUIÇÃO E HISTÓRICO */}
            {inspectorSubTab === 'HISTORY' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    19. CADEIA DE SUBSTITUIÇÃO HISTÓRICA DO DOCUMENTO (BI CHAIN)
                  </span>
                  <span className="text-[10px] text-neutral-400">HISTÓRICO IMUTÁVEL MJDH</span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                      <span className="text-[9px] text-neutral-500 block uppercase">BI ANTERIOR (#001)</span>
                      <strong className="text-neutral-400 font-bold">{selectedBi.previousBiNumber || '001508576HO021'}</strong>
                      <span className="block text-[8px] text-rose-400 mt-0.5">● SUBSTITUÍDO (REPLACED)</span>
                    </div>

                    <ArrowRight className="w-5 h-5 text-amber-400" />

                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                      <span className="text-[9px] text-emerald-400 block uppercase">BI ATUAL (#002)</span>
                      <strong className="text-amber-300 font-bold">{selectedBi.biNumber}</strong>
                      <span className="block text-[8px] text-emerald-400 mt-0.5">● ATIVO (ACTIVE)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 06: AUDITORIA DE DOCUMENTO */}
            {inspectorSubTab === 'AUDIT' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    32. LOGS DE AUDITORIA DO DOCUMENTO (BI_AUDIT_LOGS)
                  </span>
                  <span className="text-[10px] text-neutral-400">AUDITORIA NACIONAL IMUTÁVEL</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-wider bg-neutral-900">
                        <th className="py-2 px-3 font-bold">OPERADOR / ATOR</th>
                        <th className="py-2 px-3 font-bold">AÇÃO</th>
                        <th className="py-2 px-3 font-bold">ORGANISMO / TERRITÓRIO</th>
                        <th className="py-2 px-3 font-bold text-right">TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-[11px]">
                      <tr className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 font-bold text-amber-300">DeusFundador (SuperAdmin)</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">BI_VERIFIED_INSPECTION</td>
                        <td className="py-2 px-3 text-neutral-300">MJDH_CENTRAL (Luanda)</td>
                        <td className="py-2 px-3 text-right text-neutral-400">12/08/2026 14:42:01</td>
                      </tr>
                      <tr className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 font-bold text-blue-300">Agente_SIAC_Talatona</td>
                        <td className="py-2 px-3 text-blue-400 font-bold">CREDENTIAL_ISSUED_PWA</td>
                        <td className="py-2 px-3 text-neutral-300">SIAC_TALATONA (Luanda)</td>
                        <td className="py-2 px-3 text-right text-neutral-400">23/07/2021 09:15:30</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* OPERATIONAL ACTIONS FOOTER */}
            <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {/* 16. INICIAR RENOVAÇÃO (ENCAMINHA PARA 03_PROCESSOS) */}
                <button
                  onClick={() => {
                    if (onNavigateToProcesses) onNavigateToProcesses();
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold uppercase transition-colors flex items-center gap-1.5 shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  INICIAR RENOVAÇÃO (03)
                </button>

                {/* 17. SOLICITAR SUBSTITUIÇÃO */}
                <button
                  onClick={() => setShowReplacementModal(true)}
                  className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold uppercase transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  SOLICITAR SUBSTITUIÇÃO
                </button>

                {/* 29. SUSPENDER BI */}
                {selectedBi.status !== 'SUSPENDED' && (
                  <button
                    onClick={() => setShowSuspendModal(true)}
                    className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold uppercase transition-colors"
                  >
                    SUSPENDER BI
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedBi(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold uppercase hover:bg-neutral-800 transition-colors"
              >
                FECHAR INSPECTOR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SUSPEND BI MODAL (AÇÃO RESTRITA REQUER MOTIVO)
         ========================================================= */}
      {showSuspendModal && selectedBi && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111217] border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 font-mono shadow-2xl">
            <div className="flex items-center gap-2 text-purple-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-extrabold uppercase text-white">SUSPENDER BILHETE DE IDENTIDADE</h3>
            </div>

            <p className="text-xs text-neutral-300 font-sans">
              Esta ação alterará o estado do BI <strong>{selectedBi.biNumber}</strong> para <strong>SUSPENDED</strong> e notificará o motor de credenciais PWA.
            </p>

            <div>
              <label className="text-[10px] text-neutral-500 block mb-1 font-bold uppercase">MOTIVO JURÍDICO / ADMINISTRATIVO:</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Informe a fundamentação da suspensão do documento..."
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/60 h-20"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={() => {
                  alert(`BI ${selectedBi.biNumber} suspenso com sucesso. Evento registado em auditoria MJDH.`);
                  setShowSuspendModal(false);
                  setSelectedBi({ ...selectedBi, status: 'SUSPENDED', lifecycleStep: 'SUSPENDED' });
                }}
                disabled={!suspendReason.trim()}
                className="px-3 py-2 rounded-xl bg-purple-500 text-neutral-950 font-extrabold uppercase disabled:opacity-50"
              >
                CONFIRMAR SUSPENSÃO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          REPLACEMENT BI MODAL (MOTIVOS DE SUBSTITUIÇÃO)
         ========================================================= */}
      {showReplacementModal && selectedBi && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111217] border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 font-mono shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-sm font-extrabold uppercase text-white">SOLICITAR SUBSTITUIÇÃO DE BI</h3>
            </div>

            <p className="text-xs text-neutral-300 font-sans">
              Solicitação de 2ª via / substituição do documento <strong>{selectedBi.biNumber}</strong>. A operação criará um novo requerimento no Módulo de Processos (03).
            </p>

            <div>
              <label className="text-[10px] text-neutral-500 block mb-1 font-bold uppercase">MOTIVO DA SUBSTITUIÇÃO:</label>
              <select
                value={replacementReason}
                onChange={(e) => setReplacementReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500/60"
              >
                <option value="PERDA">PERDA / EXTRAVIO</option>
                <option value="ROUBO">ROUBO / FURTO (COM PARTICIPAÇÃO)</option>
                <option value="DANO">DANO FÍSICO / DETERIORAÇÃO</option>
                <option value="ALTERACAO_DADOS">ALTERAÇÃO DE DADOS CIVIS</option>
                <option value="ERRO_EMISSAO">ERRO DE EMISSÃO ADMINISTRATIVO</option>
                <option value="OUTRO">OUTRO MOTIVO JUSTIFICADO</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowReplacementModal(false)}
                className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={() => {
                  alert(`Solicitação de substituição (${replacementReason}) encaminhada ao Módulo 03_PROCESSOS.`);
                  setShowReplacementModal(false);
                  if (onNavigateToProcesses) onNavigateToProcesses();
                }}
                className="px-3 py-2 rounded-xl bg-amber-500 text-neutral-950 font-extrabold uppercase"
              >
                ENCAMINHAR PARA PROCESSOS (03) &rsaquo;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
