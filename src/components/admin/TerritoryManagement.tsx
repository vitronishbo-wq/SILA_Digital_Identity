import React, { useState } from 'react';
import { ProvinceTerritory, Municipality, Commune, INITIAL_PROVINCES } from '../../data/territory';
import { 
  ServicePoint, 
  JurisdictionRule, 
  TerritoryResponsibility, 
  TerritoryChangeProposal, 
  TerritoryAuditRecord,
  TerritoryType,
  ProposalStatus,
  TerritoryVersion,
  HistoricalJurisdictionLookup
} from '../../types/territory';
import { 
  MapPin, Plus, Building, ShieldCheck, Crown, ChevronRight, Layers, 
  CheckCircle2, Globe, FileText, UserCheck, AlertTriangle, Activity, 
  Lock, X, Check, Search, Filter, ShieldAlert, Cpu, Eye, ArrowRight,
  Compass, Radio, Sparkles, History, CheckCheck, Landmark, GitBranch,
  Calendar, KeyRound, Clock
} from 'lucide-react';

// DATASET: TERRITORIAL VERSIONS (VERSIONAMENTO FORMAL DO GOVOS)
const INITIAL_TERRITORY_VERSIONS: TerritoryVersion[] = [
  {
    versionId: 'TERR_VER_2026_01',
    officialDecree: 'Lei n.º 14/24 — Nova Divisão Político-Administrativa de Angola',
    validFrom: '2024-08-01',
    validTo: 'PRESENTE',
    isCurrent: true,
    provincesCount: 21,
    municipalitiesCount: 325,
    communesCount: 1240,
    servicePointsCount: 142,
    publishedBy: 'Diário da República I Série n.º 152 / Presidência da República',
    checksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    notes: 'Configuração em vigor. Criação das províncias do Icolo e Bengo, Moxico Leste e divisão de Luanda.'
  },
  {
    versionId: 'TERR_VER_2016_02',
    officialDecree: 'Lei n.º 18/16 — Divisão Político-Administrativa Histórica',
    validFrom: '2016-06-15',
    validTo: '2024-07-31',
    isCurrent: false,
    provincesCount: 18,
    municipalitiesCount: 164,
    communesCount: 518,
    servicePointsCount: 98,
    publishedBy: 'Diário da República I Série n.º 98 / Assembleia Nacional',
    checksumSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    notes: 'Versão histórica arquivada. Preservada para auditoria de processos e BIs emitidos até Julho de 2024.'
  }
];

// DATASET: HISTORICAL LOOKUPS MOCK
const INITIAL_HISTORICAL_LOOKUPS: HistoricalJurisdictionLookup[] = [
  {
    processId: 'REQ-2024-0089',
    citizenName: 'Manuel Domingos Kiala',
    processDate: '2024-02-15',
    matchedVersionId: 'TERR_VER_2016_02',
    effectiveProvinceCode: 'BGO',
    effectiveProvinceName: 'Bengo (Caxito / Icolo e Bengo unificado)',
    effectiveMunicipalityName: 'Icolo e Bengo',
    effectiveServicePointId: 'POSTO-BGO-CAT-01',
    effectiveJurisdictionScope: 'MUNICIPAL',
    isImmutableSnapshot: true
  },
  {
    processId: 'REQ-2026-00187',
    citizenName: 'Esperança Santos Silva',
    processDate: '2026-08-12',
    matchedVersionId: 'TERR_VER_2026_01',
    effectiveProvinceCode: 'ICB',
    effectiveProvinceName: 'Icolo e Bengo (Nova Província)',
    effectiveMunicipalityName: 'Catete Sede',
    effectiveServicePointId: 'POSTO-ICB-001',
    effectiveJurisdictionScope: 'PROVINCIAL',
    isImmutableSnapshot: true
  }
];

// DATASET: INITIAL SERVICE POINTS
const INITIAL_SERVICE_POINTS: ServicePoint[] = [
  {
    id: 'CSIC-ING-001',
    name: 'Conservatória do Registo Civil & Posto BI - Ingombota',
    type: 'CONSERVATORIA',
    provinceCode: 'LUA',
    provinceName: 'Luanda',
    municipalityId: 'LUA-muni-1',
    municipalityName: 'Luanda (Ingombota)',
    communeName: 'Ingombota',
    status: 'OPERACIONAL',
    capabilities: { biometrics: true, photography: true, civilRegistry: true, biIssuance: true },
    dailyCapacity: 450,
    operatingHours: '08:00 - 16:30'
  },
  {
    id: 'POSTO-TAL-002',
    name: 'Posto de Identificação Civil - Talatona (SIAC)',
    type: 'POSTO_IDENTIFICACAO',
    provinceCode: 'LUA',
    provinceName: 'Luanda',
    municipalityId: 'LUA-muni-2',
    municipalityName: 'Talatona',
    communeName: 'Talatona',
    status: 'OPERACIONAL',
    capabilities: { biometrics: true, photography: true, civilRegistry: false, biIssuance: true },
    dailyCapacity: 300,
    operatingHours: '08:00 - 17:00'
  },
  {
    id: 'BALCAO-VIA-003',
    name: 'Balcão Digital SILA - Viana Zango 8000',
    type: 'BALCAO_SILA',
    provinceCode: 'LUA',
    provinceName: 'Luanda',
    municipalityId: 'LUA-muni-3',
    municipalityName: 'Viana',
    communeName: 'Zango',
    status: 'OPERACIONAL',
    capabilities: { biometrics: true, photography: true, civilRegistry: true, biIssuance: true },
    dailyCapacity: 600,
    operatingHours: '07:30 - 18:00'
  },
  {
    id: 'CSIC-HUA-001',
    name: 'Conservatória do Registo Civil de Huambo Sede',
    type: 'CONSERVATORIA',
    provinceCode: 'HUA',
    provinceName: 'Huambo',
    municipalityId: 'HUA-muni-1',
    municipalityName: 'Huambo',
    communeName: 'Huambo Sede',
    status: 'OPERACIONAL',
    capabilities: { biometrics: true, photography: true, civilRegistry: true, biIssuance: true },
    dailyCapacity: 280,
    operatingHours: '08:00 - 16:00'
  },
  {
    id: 'POSTO-BGU-001',
    name: 'Posto de Atendimento do Lobito Restinga',
    type: 'POSTO_IDENTIFICACAO',
    provinceCode: 'BGU',
    provinceName: 'Benguela',
    municipalityId: 'BGU-muni-2',
    municipalityName: 'Lobito',
    communeName: 'Restinga',
    status: 'MANUTENÇÃO',
    capabilities: { biometrics: true, photography: true, civilRegistry: false, biIssuance: true },
    dailyCapacity: 180,
    operatingHours: '08:00 - 15:30'
  }
];

// DATASET: RESPONSIBILITIES
const INITIAL_RESPONSIBILITIES: TerritoryResponsibility[] = [
  {
    id: 'RESP-LUA-01',
    territoryCode: 'LUA',
    territoryName: 'Província de Luanda',
    organization: 'MJDH - Ministério da Justiça e Direitos Humanos',
    unitName: 'Delegação Provincial de Identificação Civil de Luanda',
    administratorName: 'Dra. Maria Antónia Burity',
    administratorRole: 'DIRETORA_PROVINCIAL',
    contactEmail: 'm.burity@mjdh.gov.ao'
  },
  {
    id: 'RESP-HUA-01',
    territoryCode: 'HUA',
    territoryName: 'Província do Huambo',
    organization: 'MJDH - Ministério da Justiça e Direitos Humanos',
    unitName: 'Delegação Provincial de Identificação Civil do Huambo',
    administratorName: 'Dr. João Capingana',
    administratorRole: 'DIRETOR_PROVINCIAL',
    contactEmail: 'j.capingana@mjdh.gov.ao'
  },
  {
    id: 'RESP-BGU-01',
    territoryCode: 'BGU',
    territoryName: 'Província de Benguela',
    organization: 'MJDH - Ministério da Justiça e Direitos Humanos',
    unitName: 'Delegação Provincial de Identificação Civil de Benguela',
    administratorName: 'Dra. Rosa Neto',
    administratorRole: 'DIRETORA_PROVINCIAL',
    contactEmail: 'r.neto@mjdh.gov.ao'
  }
];

// DATASET: JURISDICTIONS FOR ABAC ENFORCEMENT
const INITIAL_JURISDICTIONS: JurisdictionRule[] = [
  {
    id: 'JUR-001',
    scopeLevel: 'NATIONAL',
    territoryCode: 'ANGOLA',
    territoryName: 'Nacional (Angola)',
    allowedRoles: ['SUPERADMIN', 'GOVERNANCE_ADMIN', 'MINISTRO_JUSTICA', 'CONSELHO_SUPERIOR'],
    restrictedActions: [],
    abacCondition: 'MATCH_ALL_TERRITORIES (Full System Oversight)'
  },
  {
    id: 'JUR-002',
    scopeLevel: 'PROVINCIAL',
    territoryCode: 'LUA',
    territoryName: 'Luanda',
    allowedRoles: ['PROVINCIAL_ADMIN', 'CONSERVADOR_CHEFE', 'INSPECTOR_PROVINCIAL'],
    restrictedActions: ['APPROVE_FOREIGN_BORDER_BI', 'OVERRIDE_NATIONAL_AFIS'],
    abacCondition: 'context.operator.territory === "LUA"'
  },
  {
    id: 'JUR-003',
    scopeLevel: 'PROVINCIAL',
    territoryCode: 'HUA',
    territoryName: 'Huambo',
    allowedRoles: ['PROVINCIAL_ADMIN', 'CONSERVADOR_CHEFE'],
    restrictedActions: ['APPROVE_FOREIGN_BORDER_BI', 'OVERRIDE_NATIONAL_AFIS'],
    abacCondition: 'context.operator.territory === "HUA"'
  },
  {
    id: 'JUR-004',
    scopeLevel: 'SERVICE_POINT',
    territoryCode: 'CSIC-ING-001',
    territoryName: 'Conservatória Ingombota',
    allowedRoles: ['REGISTRATION_OFFICER', 'BIOMETRIC_OPERATOR'],
    restrictedActions: ['REVOKE_CIVIL_STATUS', 'APPROVE_DUPLICATE_MERGE'],
    abacCondition: 'context.operator.servicePointId === "CSIC-ING-001"'
  }
];

// DATASET: PROPOSALS (WORKFLOW RIGOROSO)
const INITIAL_PROPOSALS: TerritoryChangeProposal[] = [
  {
    id: 'PROP-TERR-2026-001',
    territoryName: 'Nova Comuna do Zango 5',
    type: 'COMMUNE',
    provinceCode: 'LUA',
    municipalityName: 'Viana',
    proposerName: 'Dr. António Burity',
    proposerRole: 'PROVINCIAL_ADMIN',
    justification: 'Expansão populacional na centralidade do Zango 5 exige a criação de uma nova comuna administrativa.',
    status: 'VALIDACAO',
    createdAt: '01/08/2026'
  },
  {
    id: 'PROP-TERR-2026-002',
    territoryName: 'Posto de Identificação do Aeroporto Dr. António Agostinho Neto',
    type: 'SERVICE_POINT',
    provinceCode: 'ICB',
    municipalityName: 'Catete',
    proposerName: 'SuperAdmin Deusfundador',
    proposerRole: 'GOVERNANCE_ADMIN',
    justification: 'Atendimento prioritário de fronteira e emissão expressa para cidadãos e diplomatas.',
    status: 'APROVACAO',
    createdAt: '05/08/2026'
  }
];

// DATASET: AUDIT LOGS
const INITIAL_AUDIT_LOGS: TerritoryAuditRecord[] = [
  {
    id: 'AUD-TERR-101',
    timestamp: '10/08/2026 14:30',
    operatorName: 'SuperAdmin Deusfundador',
    operatorRole: 'SUPERADMIN',
    action: 'ATIVAR_POSTO_SERVICO',
    territoryCode: 'CSIC-ING-001',
    territoryName: 'Conservatória Ingombota',
    details: 'Capacidades biométricas validadas e ligadas à rede central GovOS SILA.',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    currentHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    eventSignature: 'RSA4096_SILA_TERR_NODE_AUTH_GEN_001'
  },
  {
    id: 'AUD-TERR-102',
    timestamp: '08/08/2026 09:15',
    operatorName: 'Dra. Maria Burity',
    operatorRole: 'PROVINCIAL_ADMIN',
    action: 'SUBMETER_PROPOSTA_ALTERACAO',
    territoryCode: 'LUA',
    territoryName: 'Luanda',
    details: 'Submetida proposta para criação do Posto de Atendimento Zango 5.',
    previousHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    currentHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    eventSignature: 'RSA4096_SILA_TERR_NODE_AUTH_GEN_002'
  }
];

export const TerritoryManagement: React.FC = () => {
  // Main Tree Navigation Tab State
  const [activeSubTab, setActiveSubTab] = useState<
    | '01_NATIONAL' 
    | '02_PROVINCES' 
    | '03_MUNICIPALITIES' 
    | '04_COMMUNES' 
    | '05_SERVICE_POINTS' 
    | '06_JURISDICTIONS' 
    | '07_RESPONSIBILITIES' 
    | '08_ADDRESSING' 
    | '09_MAP' 
    | '10_PROPOSALS' 
    | '11_AUDIT'
    | '12_VERSIONING'
  >('02_PROVINCES');

  // Datasets
  const [provinces, setProvinces] = useState<ProvinceTerritory[]>(INITIAL_PROVINCES);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('LUA');
  const [selectedMuniId, setSelectedMuniId] = useState<string | null>('LUA-muni-1');
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>(INITIAL_SERVICE_POINTS);
  const [responsibilities] = useState<TerritoryResponsibility[]>(INITIAL_RESPONSIBILITIES);
  const [jurisdictions] = useState<JurisdictionRule[]>(INITIAL_JURISDICTIONS);
  const [proposals, setProposals] = useState<TerritoryChangeProposal[]>(INITIAL_PROPOSALS);
  const [auditLogs, setAuditLogs] = useState<TerritoryAuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [territoryVersions, setTerritoryVersions] = useState<TerritoryVersion[]>(INITIAL_TERRITORY_VERSIONS);
  const [historicalLookups] = useState<HistoricalJurisdictionLookup[]>(INITIAL_HISTORICAL_LOOKUPS);

  // Modal State: Propor Alteração Territorial (Workflow)
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [propTerritoryName, setPropTerritoryName] = useState('');
  const [propTerritoryType, setPropTerritoryType] = useState<TerritoryType>('MUNICIPALITY');
  const [propProvinceCode, setPropProvinceCode] = useState('LUA');
  const [propMunicipalityName, setPropMunicipalityName] = useState('');
  const [propJustification, setPropJustification] = useState('');

  // Historical Lookup Simulation State
  const [lookupQueryProcessId, setLookupQueryProcessId] = useState('');
  const [lookupResult, setLookupResult] = useState<HistoricalJurisdictionLookup | null>(null);

  // Selected Province Detail Tab State
  const [selectedProvinceViewTab, setSelectedProvinceViewTab] = useState<
    'MUNICIPALITIES' | 'SERVICE_POINTS' | 'JURISDICTION' | 'RESPONSIBILITY' | 'AUDIT'
  >('MUNICIPALITIES');

  // Search/Filter state inside tabs
  const [servicePointQuery, setServicePointQuery] = useState('');

  const selectedProvince = provinces.find(p => p.code === selectedProvinceCode) || provinces[0];
  const selectedMuni = selectedProvince.municipalities.find(m => m.id === selectedMuniId) || selectedProvince.municipalities[0];

  // Helper Population estimate based on Province code
  const getProvincePopulation = (code: string): string => {
    switch (code) {
      case 'LUA': return '9.1M';
      case 'BGU': return '2.8M';
      case 'HUA': return '2.5M';
      case 'HUI': return '3.0M';
      case 'UIG': return '1.7M';
      case 'MAL': return '1.1M';
      case 'CAB': return '850K';
      default: return '~1.2M';
    }
  };

  // Submit new Territory Proposal
  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTerritoryName.trim() || !propJustification.trim()) return;

    const newProposal: TerritoryChangeProposal = {
      id: `PROP-TERR-2026-00${proposals.length + 1}`,
      territoryName: propTerritoryName.trim(),
      type: propTerritoryType,
      provinceCode: propProvinceCode,
      municipalityName: propMunicipalityName.trim() || undefined,
      proposerName: 'SuperAdmin Deusfundador',
      proposerRole: 'GOVERNANCE_ADMIN',
      justification: propJustification.trim(),
      status: 'PROPOSTA',
      createdAt: new Date().toLocaleDateString('pt-PT')
    };

    setProposals([newProposal, ...proposals]);

    const lastAudit = auditLogs[0];
    const prevHash = lastAudit ? lastAudit.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const currHash = (Math.random().toString(36).substring(2) + Date.now().toString(16) + Math.random().toString(36).substring(2)).padEnd(64, '0');

    const auditRec: TerritoryAuditRecord = {
      id: `AUD-TERR-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-PT'),
      operatorName: 'SuperAdmin Deusfundador',
      operatorRole: 'GOVERNANCE_ADMIN',
      action: 'SUBMETER_PROPOSTA_ALTERACAO',
      territoryCode: propProvinceCode,
      territoryName: propTerritoryName.trim(),
      details: `Proposta de criação de ${propTerritoryType} submetida para validação legal.`,
      previousHash: prevHash,
      currentHash: currHash,
      eventSignature: `RSA4096_SILA_SIG_${Date.now()}`
    };
    setAuditLogs([auditRec, ...auditLogs]);

    setShowProposalModal(false);
    setPropTerritoryName('');
    setPropJustification('');
  };

  // Advance Proposal Status (Workflow)
  const handleAdvanceProposal = (propId: string, currentStatus: ProposalStatus) => {
    let nextStatus: ProposalStatus = currentStatus;
    if (currentStatus === 'PROPOSTA') nextStatus = 'VALIDACAO';
    else if (currentStatus === 'VALIDACAO') nextStatus = 'APROVACAO';
    else if (currentStatus === 'APROVACAO') nextStatus = 'PUBLICACAO';
    else if (currentStatus === 'PUBLICACAO') nextStatus = 'ATIVO';

    setProposals(prev =>
      prev.map(p => {
        if (p.id === propId) {
          return {
            ...p,
            status: nextStatus,
            approvedAt: nextStatus === 'ATIVO' ? new Date().toLocaleDateString('pt-PT') : p.approvedAt,
            approvedBy: nextStatus === 'ATIVO' ? 'SuperAdmin Deusfundador' : p.approvedBy
          };
        }
        return p;
      })
    );

    // If activated, add to active province municipalities or communes if applicable
    const propObj = proposals.find(p => p.id === propId);
    if (propObj && nextStatus === 'ATIVO') {
      if (propObj.type === 'MUNICIPALITY') {
        const newMuni: Municipality = {
          id: `${propObj.provinceCode}-muni-${Date.now()}`,
          name: propObj.territoryName,
          communes: [{ id: `${propObj.provinceCode}-com-sede`, name: `${propObj.territoryName} Sede` }]
        };
        setProvinces(prev =>
          prev.map(p => p.code === propObj.provinceCode ? { ...p, municipalities: [...p.municipalities, newMuni] } : p)
        );
      }
    }
  };

  const handleRunLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupQueryProcessId.trim().toUpperCase();
    const found = historicalLookups.find(h => h.processId.toUpperCase() === query) || historicalLookups[0];
    setLookupResult(found);
  };

  return (
    <div className="space-y-4 font-mono select-none text-xs text-neutral-200">
      
      {/* HEADER ESTRUTURAL — DENSE & MINIMALIST */}
      <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                07 — TERRITÓRIOS & JURISDIÇÕES
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                ● ONLINE
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 font-bold border border-neutral-800">
                VERSÃO ATIVA: TERR_VER_2026_01
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
              Camada de soberania administrativa, postos, tutela e autorização ABAC/RBAC.
            </p>
          </div>
        </div>

        {/* COMPACT ACTIONS & STATS */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="hidden lg:flex items-center gap-3 px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400">
            <span>21 PROVÍNCIAS</span>
            <span>•</span>
            <span>325 MUNICÍPIOS</span>
            <span>•</span>
            <span>142 POSTOS</span>
          </div>
          <button
            onClick={() => setShowProposalModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[10px] uppercase flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ PROPOR ALTERAÇÃO</span>
          </button>
        </div>
      </div>

      {/* PRIMARY SUB-TREE NAVIGATION TABS (DENSE INLINE) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin border-b border-neutral-800 text-[10px]">
        {[
          { id: '01_NATIONAL', label: '01 PAÍS' },
          { id: '02_PROVINCES', label: '02 PROVÍNCIAS (21)' },
          { id: '03_MUNICIPALITIES', label: '03 MUNICÍPIOS' },
          { id: '04_COMMUNES', label: '04 COMUNAS' },
          { id: '05_SERVICE_POINTS', label: '05 POSTOS' },
          { id: '06_JURISDICTIONS', label: '06 JURISDIÇÕES ABAC' },
          { id: '07_RESPONSIBILITIES', label: '07 RESPONSABILIDADES' },
          { id: '08_ADDRESSING', label: '08 ENDEREÇAMENTO' },
          { id: '09_MAP', label: '09 MAPA COBERTURA' },
          { id: '10_PROPOSALS', label: '10 PROPOSTAS & WORKFLOW' },
          { id: '12_VERSIONING', label: '12 VERSIONAMENTO & SNAPSHOTS' },
          { id: '11_AUDIT', label: '11 AUDITORIA' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all uppercase ${
              activeSubTab === tab.id
                ? 'bg-amber-500 text-neutral-950 font-black'
                : 'bg-neutral-950 hover:bg-neutral-900 text-neutral-400 border border-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================
          NODE 01: PAÍS (ANGOLA)
         ========================================================= */}
      {activeSubTab === '01_NATIONAL' && (
        <div className="p-4 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold uppercase text-[11px]">
              01 PAÍS — REPÚBLICA DE ANGOLA [SOBERANIA CENTRAL]
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              STATUS: ATIVO
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 text-[9px] uppercase font-bold block">ISO 3166-1 ALPHA-2 / 3</span>
              <strong className="text-white text-sm font-black block mt-0.5">AO / AGO (024)</strong>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 text-[9px] uppercase font-bold block">DIVISÕES PROVINCIAIS</span>
              <strong className="text-amber-300 text-sm font-black block mt-0.5">21 PROVÍNCIAS</strong>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 text-[9px] uppercase font-bold block">TOTAL DE MUNICÍPIOS</span>
              <strong className="text-emerald-400 text-sm font-black block mt-0.5">325 MUNICÍPIOS</strong>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 text-[9px] uppercase font-bold block">UNICIDADE AFIS</span>
              <strong className="text-blue-300 text-sm font-black block mt-0.5">CENTRAL 1:N ATIVO</strong>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          NODE 02: PROVÍNCIAS (MINIMAL DENSE GRID & EXPANSION)
         ========================================================= */}
      {activeSubTab === '02_PROVINCES' && (
        <div className="space-y-3">
          
          {/* 21 PROVINCES COMPACT GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {provinces.map(prov => {
              const isSelected = prov.code === selectedProvinceCode;
              return (
                <button
                  key={prov.code}
                  onClick={() => {
                    setSelectedProvinceCode(prov.code);
                    setSelectedMuniId(prov.municipalities[0]?.id || null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-black uppercase tracking-wider">{prov.code}</strong>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                      ● ATIVA
                    </span>
                  </div>
                  <span className="text-[11px] font-sans font-bold text-white block truncate mt-0.5">
                    {prov.name}
                  </span>
                  <div className="mt-1.5 pt-1 border-t border-neutral-900 flex items-center justify-between text-[9px] text-neutral-400">
                    <span>{prov.municipalities.length} MUNIC.</span>
                    <span className="text-amber-400/90 font-bold">{getProvincePopulation(prov.code)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SELECTED PROVINCE DETAILED VIEW */}
          {selectedProvince && (
            <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-amber-500/30 space-y-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-black text-xs">
                    {selectedProvince.code}
                  </div>
                  <strong className="text-xs text-white uppercase tracking-wide">
                    PROVÍNCIA DE {selectedProvince.name.toUpperCase()} [{selectedProvince.code}]
                  </strong>
                </div>

                <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-xl border border-neutral-800 text-[10px]">
                  {[
                    { id: 'MUNICIPALITIES', label: 'MUNICÍPIOS' },
                    { id: 'SERVICE_POINTS', label: 'POSTOS' },
                    { id: 'JURISDICTION', label: 'JURISDIÇÃO' },
                    { id: 'RESPONSIBILITY', label: 'RESPONSABILIDADE' },
                    { id: 'AUDIT', label: 'AUDITORIA' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedProvinceViewTab(tab.id as any)}
                      className={`px-2 py-1 rounded-lg font-bold uppercase transition-all ${
                        selectedProvinceViewTab === tab.id
                          ? 'bg-amber-500 text-neutral-950 font-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* VIEW: MUNICIPALITIES */}
              {selectedProvinceViewTab === 'MUNICIPALITIES' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {selectedProvince.municipalities.map(muni => (
                    <div
                      key={muni.id}
                      onClick={() => setSelectedMuniId(muni.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        muni.id === selectedMuniId
                          ? 'bg-amber-500/10 border-amber-500/50 text-white'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-sans font-bold">{muni.name}</strong>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono">
                          {muni.communes.length} COMUNAS
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {muni.communes.map(c => (
                          <span key={c.id} className="px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 text-[9px]">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW: SERVICE POINTS */}
              {selectedProvinceViewTab === 'SERVICE_POINTS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {servicePoints.filter(sp => sp.provinceCode === selectedProvinceCode).map(sp => (
                    <div key={sp.id} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-[11px] text-white truncate">{sp.name}</strong>
                        <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          sp.status === 'OPERACIONAL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          ● {sp.status}
                        </span>
                      </div>
                      <div className="text-[9px] text-neutral-400 flex items-center gap-2">
                        <span>ID: <strong className="text-amber-300 font-mono">{sp.id}</strong></span>
                        <span>•</span>
                        <span>MUNI: <strong>{sp.municipalityName}</strong></span>
                        <span>•</span>
                        <span>CAP: <strong className="text-emerald-400">{sp.dailyCapacity}/dia</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 text-[8px] font-bold">
                        <span className={`px-1.5 py-0.2 rounded ${sp.capabilities.biometrics ? 'bg-emerald-500/15 text-emerald-300' : 'bg-neutral-900 text-neutral-600'}`}>
                          BIOMETRIA {sp.capabilities.biometrics ? '✓' : '✗'}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded ${sp.capabilities.photography ? 'bg-emerald-500/15 text-emerald-300' : 'bg-neutral-900 text-neutral-600'}`}>
                          FOTO {sp.capabilities.photography ? '✓' : '✗'}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded ${sp.capabilities.biIssuance ? 'bg-emerald-500/15 text-emerald-300' : 'bg-neutral-900 text-neutral-600'}`}>
                          EMISSÃO BI {sp.capabilities.biIssuance ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW: JURISDICTION ABAC */}
              {selectedProvinceViewTab === 'JURISDICTION' && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-[10px]">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase">
                    <Lock className="w-3.5 h-3.5" />
                    <span>RESTRIÇÕES DE ESCOPO ABAC — {selectedProvince.name.toUpperCase()}</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800 font-mono text-emerald-400 space-y-0.5">
                    <div>POLÍTICA: <span className="text-white">ABAC_TERRITORY_SCOPE_MATCH</span></div>
                    <div>REGRA: context.operator.territory === "{selectedProvince.code}" || role === "SUPERADMIN"</div>
                    <div>STATUS: <span className="text-emerald-300 font-bold">ENFORCED (403 EM CASO DE DESVIO)</span></div>
                  </div>
                </div>
              )}

              {/* VIEW: RESPONSIBILITY */}
              {selectedProvinceViewTab === 'RESPONSIBILITY' && (
                <div className="space-y-2">
                  {responsibilities.filter(r => r.territoryCode === selectedProvinceCode).map(resp => (
                    <div key={resp.id} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] space-y-1">
                      <div>TUTELA: <strong className="text-white">{resp.organization}</strong></div>
                      <div>UNIDADE: <strong className="text-amber-300">{resp.unitName}</strong></div>
                      <div>TITULAR: <strong className="text-emerald-300">{resp.administratorName} ({resp.administratorRole})</strong></div>
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW: AUDIT */}
              {selectedProvinceViewTab === 'AUDIT' && (
                <div className="space-y-1.5">
                  {auditLogs.filter(a => a.territoryCode === selectedProvinceCode).map(log => (
                    <div key={log.id} className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-[9px] flex items-center justify-between">
                      <div>
                        <strong className="text-white">{log.action}</strong>: <span className="text-neutral-400 font-sans">{log.details}</span>
                      </div>
                      <span className="text-neutral-500 font-mono">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* =========================================================
          NODE 03: MUNICÍPIOS (DENSE TABLE)
         ========================================================= */}
      {activeSubTab === '03_MUNICIPALITIES' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold uppercase text-[11px]">
              03 MUNICÍPIOS SOB JURISDIÇÃO DE {selectedProvince.name.toUpperCase()} [{selectedProvince.code}]
            </span>
            <span className="text-[9px] text-neutral-400 font-mono">
              TOTAL: {selectedProvince.municipalities.length} MUNICÍPIOS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {selectedProvince.municipalities.map(muni => (
              <div key={muni.id} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-sans font-bold text-white">{muni.name}</strong>
                  <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">● ATIVO</span>
                </div>
                <div className="text-[9px] text-neutral-400 flex items-center justify-between">
                  <span>ID: <strong className="text-amber-300 font-mono">{muni.id}</strong></span>
                  <span>{muni.communes.length} COMUNAS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          NODE 04: COMUNAS
         ========================================================= */}
      {activeSubTab === '04_COMMUNES' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-emerald-400 font-bold uppercase text-[11px]">
              04 COMUNAS DO MUNICÍPIO: {selectedMuni ? selectedMuni.name.toUpperCase() : 'SELECIONADO'}
            </span>
          </div>

          {selectedMuni && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {selectedMuni.communes.map(c => (
                <div key={c.id} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <strong className="text-[11px] font-bold text-white block">{c.name}</strong>
                  <span className="text-[9px] text-amber-300 font-mono block">CÓDIGO: {c.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          NODE 05: POSTOS DE ATENDIMENTO
         ========================================================= */}
      {activeSubTab === '05_SERVICE_POINTS' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold uppercase text-[11px]">
              05 POSTOS & BALCÕES DE ATENDIMENTO SILA (CONSERVATÓRIAS / SIAC / POSTOS)
            </span>
            <input
              type="text"
              value={servicePointQuery}
              onChange={(e) => setServicePointQuery(e.target.value)}
              placeholder="Filtrar por nome ou código..."
              className="px-2.5 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {servicePoints
              .filter(sp => sp.name.toLowerCase().includes(servicePointQuery.toLowerCase()) || sp.id.toLowerCase().includes(servicePointQuery.toLowerCase()))
              .map(sp => (
                <div key={sp.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-sans font-bold text-white truncate">{sp.name}</strong>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      sp.status === 'OPERACIONAL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      ● {sp.status}
                    </span>
                  </div>
                  <div className="text-[9px] text-neutral-400 space-y-0.5">
                    <div>CÓDIGO: <strong className="text-amber-300">{sp.id}</strong> ({sp.type})</div>
                    <div>JURISDIÇÃO: <strong>{sp.communeName}, {sp.municipalityName} [{sp.provinceCode}]</strong></div>
                    <div>CAPACIDADE: <strong className="text-emerald-400">{sp.dailyCapacity} Atendimentos/Dia</strong></div>
                  </div>
                  <div className="pt-1 border-t border-neutral-900 flex items-center gap-1 text-[8px] font-bold">
                    <span className={`px-1.5 py-0.2 rounded ${sp.capabilities.biometrics ? 'bg-emerald-500/15 text-emerald-300' : 'bg-neutral-900 text-neutral-600'}`}>
                      BIOMETRIA {sp.capabilities.biometrics ? '✓' : '✗'}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded ${sp.capabilities.photography ? 'bg-emerald-500/15 text-emerald-300' : 'bg-neutral-900 text-neutral-600'}`}>
                      FOTO {sp.capabilities.photography ? '✓' : '✗'}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded ${sp.capabilities.biIssuance ? 'bg-emerald-500/15 text-emerald-300' : 'bg-neutral-900 text-neutral-600'}`}>
                      EMISSÃO BI {sp.capabilities.biIssuance ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =========================================================
          NODE 06: JURISDIÇÕES ABAC
         ========================================================= */}
      {activeSubTab === '06_JURISDICTIONS' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold uppercase text-[11px]">
              06 JURISDIÇÕES DE ACESSO & POLÍTICAS ABAC
            </span>
          </div>

          <div className="space-y-2">
            {jurisdictions.map(jur => (
              <div key={jur.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-[10px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase text-[9px]">
                      {jur.scopeLevel}
                    </span>
                    <strong className="text-white uppercase">{jur.territoryName} [{jur.territoryCode}]</strong>
                  </div>
                  <span className="text-neutral-500 font-mono">{jur.id}</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-[9px] font-mono space-y-0.5">
                  <div>PAPÉIS AUTORIZADOS: <span className="text-emerald-300 font-bold">{jur.allowedRoles.join(', ')}</span></div>
                  <div>CONDIÇÃO ABAC: <span className="text-amber-300 font-bold">{jur.abacCondition}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          NODE 07: RESPONSABILIDADES
         ========================================================= */}
      {activeSubTab === '07_RESPONSIBILITIES' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold uppercase text-[11px]">
              07 RESPONSABILIDADES & TUTELAS INSTITUCIONAIS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {responsibilities.map(r => (
              <div key={r.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-[10px]">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-1">
                  <strong className="text-white uppercase">{r.territoryName}</strong>
                  <span className="text-amber-300 font-mono">{r.id}</span>
                </div>
                <div>TUTELA: <strong className="text-neutral-300">{r.organization}</strong></div>
                <div>UNIDADE: <strong className="text-amber-300">{r.unitName}</strong></div>
                <div>TITULAR: <strong className="text-emerald-300">{r.administratorName} ({r.administratorRole})</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          NODE 08: ENDEREÇAMENTO vs. TERRITÓRIO
         ========================================================= */}
      {activeSubTab === '08_ADDRESSING' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold uppercase text-[11px]">
              08 SEPARAÇÃO ARQUITETURAL: ENDEREÇO DO CIDADÃO ≠ TERRITÓRIO ADMINISTRATIVO
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
            <div className="p-3 rounded-xl bg-neutral-950 border border-amber-500/30 space-y-2">
              <strong className="text-amber-400 uppercase block">1. TERRITÓRIO ADMINISTRATIVO (ESTRUTURA GOVOS)</strong>
              <p className="text-neutral-400 font-sans">
                Província &rsaquo; Município &rsaquo; Comuna. Fornece IDs fixos e imutáveis para autorização ABAC/RBAC e jurisdição processual.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-emerald-500/30 space-y-2">
              <strong className="text-emerald-400 uppercase block">2. ENDEREÇO DECLARADO (DADOS DO UTENTE)</strong>
              <p className="text-neutral-400 font-sans">
                Bairro &rsaquo; Rua &rsaquo; Número &rsaquo; Referência. Preenchido pelo utente, deriva automaticamente o ID territorial sem impor taxonomia administrativa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          NODE 09: MAPA DE COBERTURA
         ========================================================= */}
      {activeSubTab === '09_MAP' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold uppercase text-[11px]">
              09 MAPA DE COBERTURA BIOMÉTRICA & DISPONIBILIDADE OPERACIONAL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px]">
            {provinces.slice(0, 8).map(p => (
              <div key={p.code} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold">{p.name}</strong>
                  <span className="text-emerald-400 font-mono font-bold">98% CAP.</span>
                </div>
                <div className="text-neutral-500 flex items-center justify-between text-[9px]">
                  <span>{p.municipalities.length} Municípios</span>
                  <span className="text-amber-300">Biometria Ativa</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          NODE 10: PROPOSTAS & WORKFLOW DE GOVERNANÇA TERRITORIAL
         ========================================================= */}
      {activeSubTab === '10_PROPOSALS' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[11px] block">
                10 GOVERNANÇA TERRITORIAL (PROPOSTA &rarr; VALIDAÇÃO &rarr; APROVAÇÃO &rarr; PUBLICAÇÃO &rarr; ATIVO)
              </span>
              <p className="text-[10px] text-neutral-400 font-sans mt-0.5">
                Criações e alterações territoriais são estritamente controladas por fluxo formal de aprovação da autoridade.
              </p>
            </div>
            <button
              onClick={() => setShowProposalModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[10px] uppercase"
            >
              + SUBMETER PROPOSTA
            </button>
          </div>

          <div className="space-y-2">
            {proposals.map(prop => (
              <div key={prop.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-[10px]">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-1.5">
                  <div>
                    <strong className="text-white uppercase block text-[11px]">{prop.territoryName}</strong>
                    <span className="text-neutral-400 font-mono text-[9px]">
                      TIPO: {prop.type} | PROVÍNCIA: {prop.provinceCode} | PROPONENTE: {prop.proposerName} ({prop.proposerRole})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold uppercase text-[9px]">
                    FASE: {prop.status}
                  </span>
                </div>

                <p className="text-neutral-300 font-sans italic text-[10px]">
                  "{prop.justification}"
                </p>

                {/* WORKFLOW PROGRESS VISUALIZER */}
                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-900 text-[9px] font-mono">
                  <div className="flex items-center gap-1">
                    {['PROPOSTA', 'VALIDACAO', 'APROVACAO', 'PUBLICACAO', 'ATIVO'].map((st, idx) => {
                      const isCurrent = prop.status === st;
                      return (
                        <span
                          key={st}
                          className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                            isCurrent ? 'bg-amber-500 text-neutral-950 font-black' : 'bg-neutral-900 text-neutral-600'
                          }`}
                        >
                          {idx + 1}. {st}
                        </span>
                      );
                    })}
                  </div>

                  {prop.status !== 'ATIVO' && (
                    <button
                      onClick={() => handleAdvanceProposal(prop.id, prop.status)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold uppercase text-[9px]"
                    >
                      AVANÇAR FASE &rarr;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          NODE 12: VERSIONAMENTO TERRITORIAL & SNAPSHOTS IMUTÁVEIS
         ========================================================= */}
      {activeSubTab === '12_VERSIONING' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3.5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[11px] block">
                12 CAMADA TRANSVERSAL DE VERSIONAMENTO TERRITORIAL & SNAPSHOTS
              </span>
              <p className="text-[10px] text-neutral-400 font-sans mt-0.5">
                Preservação histórica imutável das jurisdições para processos civis abertos sob divisões político-administrativas anteriores.
              </p>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30">
              CHECKSUM SHA-256 IMUTÁVEL
            </span>
          </div>

          {/* TERRITORY VERSIONS LIST */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">CONFIGURAÇÕES TERRITORIAIS PUBLICADAS NO DIÁRIO DA REPÚBLICA:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {territoryVersions.map(ver => (
                <div
                  key={ver.versionId}
                  className={`p-3 rounded-xl border text-[10px] font-mono space-y-1.5 ${
                    ver.isCurrent 
                      ? 'bg-amber-500/10 border-amber-500/40 text-neutral-200' 
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-xs font-black">{ver.versionId}</strong>
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[8px] ${
                      ver.isCurrent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-800 text-neutral-500'
                    }`}>
                      {ver.isCurrent ? '● ATUAL / EM VIGOR' : 'HISTÓRICO ARQUIVADO'}
                    </span>
                  </div>

                  <div className="text-neutral-300 font-sans font-bold text-[10px]">
                    {ver.officialDecree}
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[9px] text-neutral-400">
                    <div>VIGÊNCIA: <strong className="text-white">{ver.validFrom} &rarr; {ver.validTo}</strong></div>
                    <div>PROVÍNCIAS: <strong className="text-amber-300">{ver.provincesCount}</strong></div>
                    <div>MUNICÍPIOS: <strong className="text-white">{ver.municipalitiesCount}</strong></div>
                    <div>POSTOS: <strong className="text-emerald-400">{ver.servicePointsCount}</strong></div>
                  </div>

                  <div className="pt-1 border-t border-neutral-900 text-[8px] text-neutral-500 truncate">
                    SHA256: {ver.checksumSha256}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORICAL PROCESS JURISDICTION RESOLVER */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase block">
              RESOLUÇÃO DE JURISDIÇÃO HISTÓRICA POR PROCESSO (AUDITORIA IMUTÁVEL)
            </span>
            <p className="text-[9px] text-neutral-400 font-sans">
              Consulte a versão territorial que vigorava na data exata em que o processo do cidadão foi aberto:
            </p>

            <form onSubmit={handleRunLookup} className="flex items-center gap-2">
              <input
                type="text"
                value={lookupQueryProcessId}
                onChange={(e) => setLookupQueryProcessId(e.target.value)}
                placeholder="Insira o ID do processo (Ex: REQ-2024-0089 ou REQ-2026-00187)..."
                className="flex-1 p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase text-[10px]"
              >
                RESOLVER SNAPSHOT
              </button>
            </form>

            {lookupResult && (
              <div className="mt-2 p-2.5 rounded-xl bg-neutral-900 border border-emerald-500/30 text-[10px] font-mono space-y-1 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold uppercase">SNAPSHOT RESOLVIDO COM SUCESSO</span>
                  <span className="text-neutral-500">{lookupResult.processId} ({lookupResult.citizenName})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-[9px]">
                  <div>DATA DO PROCESSO: <strong className="text-white">{lookupResult.processDate}</strong></div>
                  <div>VERSÃO APLICADA: <strong className="text-amber-300">{lookupResult.matchedVersionId}</strong></div>
                  <div>PROVÍNCIA VIGENTE: <strong className="text-white">{lookupResult.effectiveProvinceName}</strong></div>
                  <div>POSTO RESPONSÁVEL: <strong className="text-emerald-300">{lookupResult.effectiveServicePointId}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          NODE 11: AUDITORIA TERRITORIAL
         ========================================================= */}
      {activeSubTab === '11_AUDIT' && (
        <div className="p-3.5 rounded-2xl bg-[#0f1115] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold uppercase text-[11px]">
              11 REGISTO IMUTÁVEL DE AUDITORIA TERRITORIAL & GOVERNANÇA
            </span>
          </div>

          <div className="space-y-1.5">
            {auditLogs.map(log => (
              <div key={log.id} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-[9px] font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 font-bold">{log.action}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-white font-bold">{log.territoryName} [{log.territoryCode}]</span>
                  </div>
                  <div className="text-right text-neutral-500">
                    <span className="text-emerald-300 font-bold">{log.operatorName} ({log.operatorRole})</span>
                    <span className="ml-2">{log.timestamp}</span>
                  </div>
                </div>
                <p className="text-neutral-400 font-sans text-[9px]">{log.details}</p>
                <div className="pt-1 border-t border-neutral-900 flex flex-col md:flex-row items-start md:items-center justify-between text-[8px] text-neutral-500 gap-1 truncate">
                  <div className="truncate">PREV_HASH: <span className="text-neutral-400">{log.previousHash}</span></div>
                  <div className="truncate">CURR_HASH: <span className="text-emerald-400 font-bold">{log.currentHash}</span></div>
                  <div className="truncate text-amber-500/80">SIG: {log.eventSignature}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: SUBMETER PROPOSTA DE ALTERAÇÃO TERRITORIAL
         ========================================================= */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111217] border border-amber-500/50 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div>
                <h3 className="text-xs font-black text-amber-400 uppercase">
                  SUBMETER PROPOSTA DE ALTERAÇÃO TERRITORIAL
                </h3>
                <span className="text-[9px] text-neutral-400 font-mono block">
                  Fluxo de Aprovação Formal da Divisão Político-Administrativa
                </span>
              </div>
              <button onClick={() => setShowProposalModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-2.5 font-mono text-xs">
              <div>
                <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                  Tipo de Unidade Territorial
                </label>
                <select
                  value={propTerritoryType}
                  onChange={(e) => setPropTerritoryType(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  <option value="MUNICIPALITY">MUNICÍPIO</option>
                  <option value="COMMUNE">COMUNA</option>
                  <option value="SERVICE_POINT">POSTO DE ATENDIMENTO</option>
                  <option value="PROVINCE">PROVÍNCIA</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                  Província Tutelar
                </label>
                <select
                  value={propProvinceCode}
                  onChange={(e) => setPropProvinceCode(e.target.value)}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name} [{p.code}]</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                  Nome da Nova Unidade Territorial
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nova Comuna do Zango 5"
                  value={propTerritoryName}
                  onChange={(e) => setPropTerritoryName(e.target.value)}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                  Fundamentação / Despacho Instrutório
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Insira o número de Despacho ou motivação técnica..."
                  value={propJustification}
                  onChange={(e) => setPropJustification(e.target.value)}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-sans text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 text-neutral-400 font-bold uppercase hover:bg-neutral-800 text-[10px]"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black uppercase text-[10px]"
                >
                  SUBMETER PROPOSTA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
