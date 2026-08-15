import React, { useState } from 'react';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Building2,
  MapPin,
  FileText,
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  UserCheck,
  ArrowRight,
  ChevronRight,
  Plus,
  RefreshCw,
  Lock,
  RotateCcw,
  Ban,
  Sliders,
  Eye,
  FileCheck,
  Award,
  Layers,
  Sparkles,
  ChevronDown,
  X,
  Check,
  Phone,
  Hash,
  Database
} from 'lucide-react';
import { getCurrentSession, MJDH_OPERATORS } from '../../../services/accessControlService';

export type ProcessType =
  | 'FIRST_BI'
  | 'RENEWAL'
  | 'REPLACEMENT'
  | 'DATA_UPDATE'
  | 'DATA_CORRECTION'
  | 'BIRTH_REGISTRATION';

export type ProcessStage =
  | 'DOCUMENTAL'
  | 'BIOMETRIA'
  | 'VALIDACAO'
  | 'DECISAO'
  | 'EMISSAO';

export type ProcessStatus =
  | 'NOVO'
  | 'EM_ANALISE'
  | 'PENDENTE'
  | 'APROVADO'
  | 'REJEITADO'
  | 'SUSPENSO'
  | 'CANCELADO'
  | 'CONCLUIDO';

export type QueueScope = 'MY_QUEUE' | 'UNIT_QUEUE' | 'PROVINCE_QUEUE' | 'NATIONAL_QUEUE';

export type SLAStatus = 'NORMAL' | 'WARNING' | 'OVERDUE';

export interface ProcessRecord {
  id: string;
  citizenId: string;
  citizenName: string;
  biNumber: string;
  birthRegistrationNo: string;
  phone: string;
  province: string;
  unit: string;
  type: ProcessType;
  stage: ProcessStage;
  status: ProcessStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  slaHoursRemaining: number;
  slaStatus: SLAStatus;
  // Detail biographical
  dob: string;
  fatherName: string;
  motherName: string;
  birthPlace: string;
  address: string;
  biStatus: 'EXPIRADO' | 'PRIMEIRA_EMISSAO' | 'EXTRAVIADO' | 'DANIFICADO' | 'ATUALIZACAO';
  // Documents
  docs: {
    id: string;
    name: string;
    status: 'RECEIVED' | 'VALIDATED' | 'PENDING' | 'REJECTED';
  }[];
  // Biometrics
  bioStatus: 'NOT_STARTED' | 'SCHEDULED' | 'RECEIVED' | 'IN_VALIDATION' | 'VALIDATED' | 'REJECTED';
  bioDetails: {
    photo: boolean;
    wsq10Print: boolean;
    signature: boolean;
    hashVerified: boolean;
    afisMatchScore: number; // 0 = no match (clean)
  };
  // Validations
  validations: {
    key: string;
    label: string;
    passed: boolean;
    validator: string;
    timestamp: string;
  }[];
  // Duplicity check
  duplicityCheck: {
    checked: boolean;
    suspectedMatch: boolean;
    matchedBi?: string;
    matchScore?: number;
  };
  // History timeline
  history: {
    time: string;
    actor: string;
    action: string;
    details: string;
  }[];
  // Audit log
  audit: {
    time: string;
    actor: string;
    role: string;
    ip: string;
    policy: string;
    reauth: boolean;
  }[];
}

interface ProcessesTabProps {
  onOpenReauth?: () => void;
  onOpenPolicyInspector?: () => void;
  onOpenOrgSelector?: () => void;
}

export const ProcessesTab: React.FC<ProcessesTabProps> = ({
  onOpenReauth,
  onOpenPolicyInspector,
  onOpenOrgSelector
}) => {
  const session = getCurrentSession();
  const { operator } = session;

  // QUEUE SELECTION
  const [activeQueue, setActiveQueue] = useState<QueueScope>('MY_QUEUE');

  // FILTERS & SEARCH
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  // ACCESS LAYER POPOVER TOGGLE
  const [showAccessDetails, setShowAccessDetails] = useState(false);

  // MODALS
  const [selectedProcess, setSelectedProcess] = useState<ProcessRecord | null>(null);
  const [detailTab, setDetailTab] = useState<
    'IDENTIDADE' | 'DOCUMENTOS' | 'BIOMETRIA' | 'VALIDACOES' | 'DUPLICIDADE' | 'DECISAO' | 'ATRIBUICAO' | 'HISTORICO' | 'AUDITORIA'
  >('IDENTIDADE');

  const [showNewProcessModal, setShowNewProcessModal] = useState(false);
  const [showFullBiography, setShowFullBiography] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState<'APPROVE' | 'RETURN' | 'SUSPEND' | 'REJECT' | null>(null);

  // DECISION INPUT REASONS
  const [decisionReasonCategory, setDecisionReasonCategory] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [scheduleBioDate, setScheduleBioDate] = useState('');
  const [scheduleBioUnit, setScheduleBioUnit] = useState('Posto Central Huambo');

  // MOCK PROCESSES DATASET
  const [processesList, setProcessesList] = useState<ProcessRecord[]>([
    {
      id: 'REQ-000184',
      citizenId: 'CID-882104',
      citizenName: 'JOÃO MANUEL DA SILVA',
      biNumber: '002910283LA042',
      birthRegistrationNo: '2020/1182/LUANDA',
      phone: '+244 923 112 001',
      province: 'Luanda',
      unit: 'Posto Talatona',
      type: 'RENEWAL',
      stage: 'VALIDACAO',
      status: 'EM_ANALISE',
      assignedTo: 'Mateus Kiala Ndongala (IDENTITY_ANALYST)',
      createdAt: '2026-08-12 09:15',
      updatedAt: '2026-08-12 11:30',
      slaHoursRemaining: 14,
      slaStatus: 'NORMAL',
      dob: '12/04/1988',
      fatherName: 'Manuel Bernardo da Silva',
      motherName: 'Maria José da Silva',
      birthPlace: 'Luanda, Ingombota',
      address: 'Bairro Maianga, Rua 12, Casa 4B',
      biStatus: 'EXPIRADO',
      docs: [
        { id: 'doc-1', name: 'BI Anterior (Cópia Digital)', status: 'VALIDATED' },
        { id: 'doc-2', name: 'Assento de Nascimento / Registo Civil', status: 'VALIDATED' },
        { id: 'doc-3', name: 'Comprovativo de Residência', status: 'RECEIVED' }
      ],
      bioStatus: 'VALIDATED',
      bioDetails: { photo: true, wsq10Print: true, signature: true, hashVerified: true, afisMatchScore: 0 },
      validations: [
        { key: 'v1', label: 'IDENTIDADE CIVIL', passed: true, validator: 'SYS_AUTOMATION', timestamp: '09:16' },
        { key: 'v2', label: 'DOCUMENTAÇÃO', passed: true, validator: 'ANL-4409', timestamp: '10:00' },
        { key: 'v3', label: 'BIOMETRIA AFIS', passed: true, validator: 'AFIS_ENGINE', timestamp: '10:05' },
        { key: 'v4', label: 'DUPLICIDADE', passed: true, validator: 'AFIS_ENGINE', timestamp: '10:05' },
        { key: 'v5', label: 'ELEGIBILIDADE', passed: true, validator: 'MJDH_PDP', timestamp: '10:06' }
      ],
      duplicityCheck: { checked: true, suspectedMatch: false },
      history: [
        { time: '09:15', actor: 'Cidadão / Balcão Digital', action: 'PROCESSO_SUBMETIDO', details: 'Submissão de pedido de renovação' },
        { time: '10:00', actor: 'Mateus Kiala (ANL-4409)', action: 'VALIDACAO_DOCUMENTAL', details: 'Documentos validados com sucesso' }
      ],
      audit: [
        { time: '09:15', actor: 'USR-DIGITAL', role: 'CITIZEN', ip: '102.218.42.11', policy: 'ALLOW_SUBMIT', reauth: false },
        { time: '10:00', actor: 'ANL-4409', role: 'IDENTITY_ANALYST', ip: '10.220.14.88', policy: 'ALLOW_VALIDATE', reauth: true }
      ]
    },
    {
      id: 'REQ-000185',
      citizenId: 'CID-991205',
      citizenName: 'MARIA JOSÉ FERREIRA',
      biNumber: '009823101HA039',
      birthRegistrationNo: '2024/0019/HUAMBO',
      phone: '+244 931 442 889',
      province: 'Huambo',
      unit: 'Posto Central Huambo',
      type: 'FIRST_BI',
      stage: 'BIOMETRIA',
      status: 'NOVO',
      assignedTo: 'Sem Atribuição',
      createdAt: '2026-08-12 10:00',
      updatedAt: '2026-08-12 10:00',
      slaHoursRemaining: 22,
      slaStatus: 'NORMAL',
      dob: '20/09/2006',
      fatherName: 'José António Ferreira',
      motherName: 'Amélia Rosa Ferreira',
      birthPlace: 'Huambo, Caála',
      address: 'Bairro Benfica, Rua 3, Casa 98',
      biStatus: 'PRIMEIRA_EMISSAO',
      docs: [
        { id: 'doc-1', name: 'Assento de Nascimento', status: 'VALIDATED' },
        { id: 'doc-2', name: 'Atestado de Residência', status: 'RECEIVED' }
      ],
      bioStatus: 'SCHEDULED',
      bioDetails: { photo: false, wsq10Print: false, signature: false, hashVerified: false, afisMatchScore: 0 },
      validations: [
        { key: 'v1', label: 'IDENTIDADE CIVIL', passed: true, validator: 'SYS_AUTOMATION', timestamp: '10:01' },
        { key: 'v2', label: 'DOCUMENTAÇÃO', passed: true, validator: 'AGT-8812', timestamp: '10:05' }
      ],
      duplicityCheck: { checked: true, suspectedMatch: false },
      history: [
        { time: '10:00', actor: 'Ana Bernardo (AGT-8812)', action: 'PROCESSO_CRIADO', details: 'Abertura de primeiro BI no posto' }
      ],
      audit: [
        { time: '10:00', actor: 'AGT-8812', role: 'SERVICE_AGENT', ip: '10.220.14.12', policy: 'ALLOW_CREATE', reauth: true }
      ]
    },
    {
      id: 'REQ-000186',
      citizenId: 'CID-991823',
      citizenName: 'ANTÓNIO PEDRO NETO',
      biNumber: '004829102LA049',
      birthRegistrationNo: '1982/1182/HUAMBO',
      phone: '+244 923 456 789',
      province: 'Huambo',
      unit: 'Posto Central Huambo',
      type: 'RENEWAL',
      stage: 'DOCUMENTAL',
      status: 'PENDENTE',
      assignedTo: 'Analista Huambo-03',
      createdAt: '2026-08-12 08:30',
      updatedAt: '2026-08-12 11:10',
      slaHoursRemaining: 3,
      slaStatus: 'WARNING',
      dob: '14/05/1982',
      fatherName: 'Pedro Afonso Neto',
      motherName: 'Maria da Conceição Neto',
      birthPlace: 'Huambo, Caála',
      address: 'Bairro Benfica, Rua 4, Casa 12',
      biStatus: 'EXPIRADO',
      docs: [
        { id: 'doc-1', name: 'BI Anterior (Original)', status: 'VALIDATED' },
        { id: 'doc-2', name: 'Assento de Nascimento', status: 'VALIDATED' },
        { id: 'doc-3', name: 'Comprovativo de Residência', status: 'PENDING' }
      ],
      bioStatus: 'RECEIVED',
      bioDetails: { photo: true, wsq10Print: true, signature: true, hashVerified: true, afisMatchScore: 0 },
      validations: [
        { key: 'v1', label: 'IDENTIDADE CIVIL', passed: true, validator: 'SYS_AUTOMATION', timestamp: '08:31' },
        { key: 'v2', label: 'DOCUMENTAÇÃO', passed: false, validator: 'ANL-HUAMBO-03', timestamp: '11:10' }
      ],
      duplicityCheck: { checked: true, suspectedMatch: false },
      history: [
        { time: '08:30', actor: 'Cidadão', action: 'SUBMETIDO', details: 'Submissão inicial do pedido' },
        { time: '11:10', actor: 'Analista Huambo-03', action: 'PENDENCIA_NOTIFICADA', details: 'Comprovativo de residência ilegível' }
      ],
      audit: [
        { time: '11:10', actor: 'ANL-HUAMBO-03', role: 'IDENTITY_ANALYST', ip: '10.220.18.4', policy: 'ALLOW_FLAG_PENDING', reauth: true }
      ]
    },
    {
      id: 'REQ-000187',
      citizenId: 'CID-771029',
      citizenName: 'TERESA AMÉLIA BENGUELA',
      biNumber: '001928301BA012',
      birthRegistrationNo: '1995/0412/BENGUELA',
      phone: '+244 912 300 491',
      province: 'Benguela',
      unit: 'Conservatória de Benguela',
      type: 'FIRST_BI',
      stage: 'EMISSAO',
      status: 'APROVADO',
      assignedTo: 'João Chivela (ISSUANCE_OPERATOR)',
      createdAt: '2026-08-11 16:30',
      updatedAt: '2026-08-12 09:00',
      slaHoursRemaining: 0,
      slaStatus: 'NORMAL',
      dob: '03/02/1995',
      fatherName: 'António Bento Benguela',
      motherName: 'Amélia Teresa Benguela',
      birthPlace: 'Benguela, Lobito',
      address: 'Zona Alta, Bloco 2, Ap 101',
      biStatus: 'PRIMEIRA_EMISSAO',
      docs: [
        { id: 'doc-1', name: 'Assento de Nascimento Oficial', status: 'VALIDATED' }
      ],
      bioStatus: 'VALIDATED',
      bioDetails: { photo: true, wsq10Print: true, signature: true, hashVerified: true, afisMatchScore: 0 },
      validations: [
        { key: 'v1', label: 'IDENTIDADE CIVIL', passed: true, validator: 'SYS', timestamp: '16:31' },
        { key: 'v2', label: 'DOCUMENTAÇÃO', passed: true, validator: 'ANL-3001', timestamp: '17:00' },
        { key: 'v3', label: 'BIOMETRIA AFIS', passed: true, validator: 'AFIS', timestamp: '17:05' },
        { key: 'v4', label: 'APROVAÇÃO', passed: true, validator: 'SUP-1004', timestamp: '09:00' }
      ],
      duplicityCheck: { checked: true, suspectedMatch: false },
      history: [
        { time: '16:30', actor: 'Posto Lobito', action: 'CRIADO', details: 'Registo de pedido presencial' },
        { time: '09:00', actor: 'Dr. Sebastião Vunge (SUP-1004)', action: 'PROCESSO_APROVADO', details: 'Aprovação final para emissão' }
      ],
      audit: [
        { time: '09:00', actor: 'SUP-1004', role: 'SUPERVISOR', ip: '10.220.14.10', policy: 'ALLOW_APPROVE', reauth: true }
      ]
    },
    {
      id: 'REQ-000190',
      citizenId: 'CID-551022',
      citizenName: 'SEBASTIÃO BENJAMIM CAMBUTA',
      biNumber: '007718201CA091',
      birthRegistrationNo: '1979/0091/CABINDA',
      phone: '+244 944 881 029',
      province: 'Cabinda',
      unit: 'Posto Fronteiriço Yema',
      type: 'DATA_CORRECTION',
      stage: 'VALIDACAO',
      status: 'SUSPENSO',
      assignedTo: 'Gabinete Jurídico MJDH',
      createdAt: '2026-08-10 11:00',
      updatedAt: '2026-08-11 14:20',
      slaHoursRemaining: -12,
      slaStatus: 'OVERDUE',
      dob: '18/11/1979',
      fatherName: 'Benjamim Cambuta',
      motherName: 'Nzuzi Cambuta',
      birthPlace: 'Cabinda, Buco-Zau',
      address: 'Bairro Comercial, Rua 1',
      biStatus: 'ATUALIZACAO',
      docs: [
        { id: 'doc-1', name: 'BI Com Alteração de Nome', status: 'REJECTED' },
        { id: 'doc-2', name: 'Despacho Judicial de Retificação', status: 'RECEIVED' }
      ],
      bioStatus: 'IN_VALIDATION',
      bioDetails: { photo: true, wsq10Print: true, signature: true, hashVerified: false, afisMatchScore: 98.4 },
      validations: [
        { key: 'v1', label: 'DUPLICIDADE AFIS', passed: false, validator: 'AFIS_ENGINE', timestamp: '14:20' }
      ],
      duplicityCheck: { checked: true, suspectedMatch: true, matchedBi: '003310291LA011', matchScore: 98.4 },
      history: [
        { time: '14:20', actor: 'AFIS Engine', action: 'SUSPEITA_DUPLICIDADE', details: 'Score 98.4% com BI 003310291LA011' },
        { time: '14:21', actor: 'Dra. Rosa Neto (AUD-3002)', action: 'PROCESSO_SUSPENSO', details: 'Encaminhado para auditoria jurídica' }
      ],
      audit: [
        { time: '14:21', actor: 'AUD-3002', role: 'AUDITOR', ip: '10.220.10.1', policy: 'ALLOW_SUSPEND', reauth: true }
      ]
    }
  ]);

  // QUEUE COUNTS
  const queueCounts = {
    MY_QUEUE: processesList.filter(p => p.assignedTo.includes(operator.badgeNumber) || p.assignedTo.includes(operator.fullName)).length || 3,
    UNIT_QUEUE: processesList.filter(p => p.unit.toLowerCase().includes(operator.organization.toLowerCase()) || p.province === 'Luanda').length || 8,
    PROVINCE_QUEUE: processesList.filter(p => p.province === 'Luanda' || p.province === 'Huambo').length || 34,
    NATIONAL_QUEUE: processesList.length + 1280
  };

  // FILTERED PROCESSES LIST
  const filteredProcesses = processesList.filter(p => {
    // Queue scope filter
    if (activeQueue === 'MY_QUEUE' && !(p.assignedTo.includes(operator.badgeNumber) || p.assignedTo.includes(operator.fullName) || p.id === 'REQ-000184')) {
      // Allow demo visibility
    }

    // Search query
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.biNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.birthRegistrationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;

    // Stage filter
    if (filterStage !== 'ALL' && p.stage !== filterStage) return false;

    // Type filter
    if (filterType !== 'ALL' && p.type !== filterType) return false;

    return true;
  });

  // HANDLERS
  const handleAssignToMe = (procId: string) => {
    setProcessesList(prev =>
      prev.map(p => {
        if (p.id === procId) {
          const newAssignee = `${operator.fullName} (${operator.badgeNumber})`;
          return {
            ...p,
            assignedTo: newAssignee,
            history: [
              ...p.history,
              { time: new Date().toLocaleTimeString(), actor: `${operator.badgeNumber}`, action: 'ATRIBUICAO_OPERADOR', details: `Atribuído a ${newAssignee}` }
            ]
          };
        }
        return p;
      })
    );
    if (selectedProcess && selectedProcess.id === procId) {
      setSelectedProcess(prev => prev ? { ...prev, assignedTo: `${operator.fullName} (${operator.badgeNumber})` } : null);
    }
  };

  const handleExecuteDecision = () => {
    if (!selectedProcess || !showDecisionModal) return;

    let targetStatus: ProcessStatus = 'EM_ANALISE';
    let targetStage: ProcessStage = selectedProcess.stage;
    let actionCode = '';

    if (showDecisionModal === 'APPROVE') {
      targetStatus = 'APROVADO';
      targetStage = 'EMISSÃO' as any;
      actionCode = 'PROCESSO_APROVADO';
    } else if (showDecisionModal === 'RETURN') {
      targetStatus = 'PENDENTE';
      actionCode = 'PROCESSO_DEVOLVIDO';
    } else if (showDecisionModal === 'SUSPEND') {
      targetStatus = 'SUSPENSO';
      actionCode = 'PROCESSO_SUSPENSO';
    } else if (showDecisionModal === 'REJECT') {
      targetStatus = 'REJEITADO';
      actionCode = 'PROCESSO_REJEITADO';
    }

    const newHistory = {
      time: new Date().toLocaleTimeString(),
      actor: `${operator.fullName} (${operator.badgeNumber})`,
      action: actionCode,
      details: `${decisionReasonCategory}: ${decisionNotes || 'Sem observações adicionais'}`
    };

    const newAudit = {
      time: new Date().toLocaleTimeString(),
      actor: operator.badgeNumber,
      role: operator.role,
      ip: '10.220.14.88',
      policy: `ALLOW_${showDecisionModal}`,
      reauth: true
    };

    setProcessesList(prev =>
      prev.map(p => {
        if (p.id === selectedProcess.id) {
          return {
            ...p,
            status: targetStatus,
            stage: targetStage,
            history: [...p.history, newHistory],
            audit: [...p.audit, newAudit]
          };
        }
        return p;
      })
    );

    setSelectedProcess(prev => prev ? {
      ...prev,
      status: targetStatus,
      stage: targetStage,
      history: [...prev.history, newHistory],
      audit: [...prev.audit, newAudit]
    } : null);

    setShowDecisionModal(null);
    setDecisionReasonCategory('');
    setDecisionNotes('');
  };

  const handleCreateNewProcess = (type: ProcessType, citizenNameInput: string, biInput: string) => {
    const newId = `REQ-000${191 + processesList.length}`;
    const newRecord: ProcessRecord = {
      id: newId,
      citizenId: `CID-${Math.floor(100000 + Math.random() * 900000)}`,
      citizenName: citizenNameInput.toUpperCase() || 'MANUEL ANTÓNIO CAMACHO',
      biNumber: biInput.toUpperCase() || '008819201LA088',
      birthRegistrationNo: '2026/0991/LUANDA',
      phone: '+244 923 000 111',
      province: operator.territories[0] || 'Luanda',
      unit: operator.organizationName || 'Posto Central',
      type: type,
      stage: 'DOCUMENTAL',
      status: 'NOVO',
      assignedTo: `${operator.fullName} (${operator.badgeNumber})`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      slaHoursRemaining: 24,
      slaStatus: 'NORMAL',
      dob: '01/01/1990',
      fatherName: 'Pai Exemplo',
      motherName: 'Mãe Exemplo',
      birthPlace: 'Luanda',
      address: 'Bairro Central',
      biStatus: type === 'FIRST_BI' ? 'PRIMEIRA_EMISSAO' : 'EXPIRADO',
      docs: [
        { id: 'doc-1', name: 'Documento de Identificação Base', status: 'RECEIVED' },
        { id: 'doc-2', name: 'Assento de Nascimento / Registo Civil', status: 'VALIDATED' }
      ],
      bioStatus: 'SCHEDULED',
      bioDetails: { photo: false, wsq10Print: false, signature: false, hashVerified: false, afisMatchScore: 0 },
      validations: [
        { key: 'v1', label: 'IDENTIDADE CIVIL', passed: true, validator: 'SYS', timestamp: new Date().toLocaleTimeString() }
      ],
      duplicityCheck: { checked: true, suspectedMatch: false },
      history: [
        { time: new Date().toLocaleTimeString(), actor: operator.badgeNumber, action: 'PROCESSO_CRIADO', details: `Processo de ${type} aberto via painel` }
      ],
      audit: [
        { time: new Date().toLocaleTimeString(), actor: operator.badgeNumber, role: operator.role, ip: '10.220.14.88', policy: 'ALLOW_CREATE_PROCESS', reauth: true }
      ]
    };

    setProcessesList([newRecord, ...processesList]);
    setShowNewProcessModal(false);
    setSelectedProcess(newRecord);
  };

  const getStatusBadge = (status: ProcessStatus) => {
    switch (status) {
      case 'NOVO': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'EM_ANALISE': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'PENDENTE': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'APROVADO': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'REJEITADO': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'SUSPENSO': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'CANCELADO': return 'bg-neutral-800 text-neutral-400 border-neutral-700';
      case 'CONCLUIDO': return 'bg-emerald-500/30 text-emerald-200 border-emerald-500/50';
      default: return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  const getSLABadge = (p: ProcessRecord) => {
    if (p.slaStatus === 'OVERDUE' || p.slaHoursRemaining < 0) {
      return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">ATRASADO ({Math.abs(p.slaHoursRemaining)}h)</span>;
    }
    if (p.slaStatus === 'WARNING' || p.slaHoursRemaining <= 4) {
      return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">{p.slaHoursRemaining}h (WARN)</span>;
    }
    return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">{p.slaHoursRemaining}h</span>;
  };

  return (
    <div className="space-y-3 font-mono select-none text-xs">
      
      {/* HEADER PATH & INTERNAL METADATA BAR */}
      <div className="p-3 rounded-2xl bg-[#111217] border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 shadow-xl">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-white uppercase tracking-wider">
            <span className="text-amber-400">SILA / GOVOS</span>
            <span className="text-neutral-600">&gt;</span>
            <span>MJDH_CENTRAL</span>
            <span className="text-neutral-600">&gt;</span>
            <span className="text-neutral-400">CONSELHO SUPERIOR DE IDENTIFICAÇÃO CIVIL</span>
            <span className="text-neutral-600">&gt;</span>
            <span className="text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">03_PROCESSOS</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1 font-mono">
            <span>MODULE_ID: <strong className="text-white">PROCESSOS</strong></span>
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

        {/* COMPACT LAYER 2 ACCESS BADGE */}
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

      {/* TITLE & ACTION BAR */}
      <div className="p-3 rounded-2xl bg-[#111217] border border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h1 className="text-xs font-extrabold text-white uppercase tracking-wider">
            03 — PROCESSOS DE REGISTO & BI
          </h1>
          <p className="text-[10px] text-neutral-400">
            Central de validação, análise e tramitação
          </p>
        </div>

        <button
          onClick={() => setShowNewProcessModal(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ NOVO PROCESSO</span>
        </button>
      </div>

      {/* QUEUES SELECTOR BAR (03.26) */}
      <div className="p-2 rounded-2xl bg-[#111217] border border-neutral-800 flex flex-wrap items-center gap-1.5 shadow-inner">
        <span className="text-[10px] font-bold text-neutral-500 uppercase px-2">FILA:</span>
        <button
          onClick={() => setActiveQueue('MY_QUEUE')}
          className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
            activeQueue === 'MY_QUEUE'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <span>MINHA FILA</span>
          <span className="px-1.5 py-0.2 rounded bg-neutral-950/40 text-[10px] font-extrabold">{queueCounts.MY_QUEUE}</span>
        </button>

        <button
          onClick={() => setActiveQueue('UNIT_QUEUE')}
          className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
            activeQueue === 'UNIT_QUEUE'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <span>UNIDADE</span>
          <span className="px-1.5 py-0.2 rounded bg-neutral-950/40 text-[10px] font-extrabold">{queueCounts.UNIT_QUEUE}</span>
        </button>

        <button
          onClick={() => setActiveQueue('PROVINCE_QUEUE')}
          className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
            activeQueue === 'PROVINCE_QUEUE'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <span>PROVÍNCIA</span>
          <span className="px-1.5 py-0.2 rounded bg-neutral-950/40 text-[10px] font-extrabold">{queueCounts.PROVINCE_QUEUE}</span>
        </button>

        <button
          onClick={() => setActiveQueue('NATIONAL_QUEUE')}
          className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
            activeQueue === 'NATIONAL_QUEUE'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <span>NACIONAL</span>
          <span className="px-1.5 py-0.2 rounded bg-neutral-950/40 text-[10px] font-extrabold">{queueCounts.NATIONAL_QUEUE}</span>
        </button>
      </div>

      {/* SEARCH & FILTERS BAR (03.7 & 03.8) */}
      <div className="p-3 rounded-2xl bg-[#111217] border border-neutral-800 space-y-2.5 shadow-lg">
        {/* INTERNAL SEARCH INPUT */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Q SEARCH ID / BI / NAME / REG / PHONE / PROV / ASSIGNEE..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 shadow-inner"
          />
        </div>

        {/* SELECT FILTERS: STATUS, STAGE, TYPE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
          {/* STATUS FILTER */}
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 font-bold uppercase">STATUS:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none w-full"
            >
              <option value="ALL" className="bg-neutral-900">TODOS OS ESTADOS</option>
              <option value="NOVO" className="bg-neutral-900">NOVO</option>
              <option value="EM_ANALISE" className="bg-neutral-900">EM_ANALISE</option>
              <option value="PENDENTE" className="bg-neutral-900">PENDENTE</option>
              <option value="APROVADO" className="bg-neutral-900">APROVADO</option>
              <option value="REJEITADO" className="bg-neutral-900">REJEITADO</option>
              <option value="SUSPENSO" className="bg-neutral-900">SUSPENSO</option>
              <option value="CANCELADO" className="bg-neutral-900">CANCELADO</option>
              <option value="CONCLUIDO" className="bg-neutral-900">CONCLUIDO</option>
            </select>
          </div>

          {/* STAGE FILTER */}
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 font-bold uppercase">STAGE:</span>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none w-full"
            >
              <option value="ALL" className="bg-neutral-900">TODAS AS ETAPAS</option>
              <option value="DOCUMENTAL" className="bg-neutral-900">DOCUMENTAL</option>
              <option value="BIOMETRIA" className="bg-neutral-900">BIOMETRIA</option>
              <option value="VALIDACAO" className="bg-neutral-900">VALIDACAO</option>
              <option value="DECISAO" className="bg-neutral-900">DECISAO</option>
              <option value="EMISSAO" className="bg-neutral-900">EMISSAO</option>
            </select>
          </div>

          {/* TYPE FILTER */}
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 font-bold uppercase">TYPE:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none w-full"
            >
              <option value="ALL" className="bg-neutral-900">TODOS OS TIPOS</option>
              <option value="FIRST_BI" className="bg-neutral-900">FIRST_BI (1º BI)</option>
              <option value="RENEWAL" className="bg-neutral-900">RENEWAL (Renovação)</option>
              <option value="REPLACEMENT" className="bg-neutral-900">REPLACEMENT (2ª Via)</option>
              <option value="DATA_UPDATE" className="bg-neutral-900">DATA_UPDATE (Atualização)</option>
              <option value="DATA_CORRECTION" className="bg-neutral-900">DATA_CORRECTION (Correção)</option>
              <option value="BIRTH_REGISTRATION" className="bg-neutral-900">BIRTH_REGISTRATION (Registo)</option>
            </select>
          </div>
        </div>
      </div>

      {/* DENSE PROCESSES TABLE (03.10) */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-[#111217] shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase">
            <tr>
              <th className="p-3">PROC_ID</th>
              <th className="p-3">CITIZEN_NAME</th>
              <th className="p-3">TYPE</th>
              <th className="p-3">STAGE</th>
              <th className="p-3 text-center">STATUS</th>
              <th className="p-3">ASSIGNED_TO</th>
              <th className="p-3 text-center">SLA</th>
              <th className="p-3 text-right">ACT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 text-[11px]">
            {filteredProcesses.map((p) => (
              <tr
                key={p.id}
                onClick={() => setSelectedProcess(p)}
                className="hover:bg-neutral-900/80 cursor-pointer transition-colors"
              >
                <td className="p-3 font-bold text-amber-400">{p.id}</td>
                {/* CITIZEN NAME INTEGRITY PRESERVED */}
                <td className="p-3 font-sans font-bold text-white uppercase">{p.citizenName}</td>
                <td className="p-3 text-neutral-300 font-bold">{p.type}</td>
                <td className="p-3 text-neutral-400">{p.stage}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getStatusBadge(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-neutral-300 text-[10px] truncate max-w-[140px]">{p.assignedTo}</td>
                <td className="p-3 text-center text-[10px]">
                  {getSLABadge(p)}
                </td>
                <td className="p-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedProcess(p)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase"
                  >
                    ANALISAR &rsaquo;
                  </button>
                  {p.assignedTo === 'Sem Atribuição' && (
                    <button
                      onClick={() => handleAssignToMe(p.id)}
                      className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold text-[10px]"
                    >
                      ASSIGN
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProcesses.length === 0 && (
          <div className="p-8 text-center text-neutral-500 text-xs font-mono">
            NO_MATCH: Nenhum processo encontrado com os filtros selecionados.
          </div>
        )}
      </div>

      {/* ====================================================================
          PROCESS DETAIL INSPECTOR MODAL (03.11 - 03.30)
         ==================================================================== */}
      {selectedProcess && (
        <div className="fixed inset-0 z-[9990] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 font-mono select-none overflow-y-auto">
          <div className="w-full max-w-5xl my-auto p-5 rounded-3xl bg-[#111217] border border-amber-500/40 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            
            {/* PROCESS DETAIL HEADER BAR (03.12) */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                    {selectedProcess.id}
                  </span>
                  <span className="text-sm font-extrabold text-white uppercase">
                    {selectedProcess.citizenName}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getStatusBadge(selectedProcess.status)}`}>
                    {selectedProcess.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400 mt-1">
                  <span>BI: <strong className="text-white">{selectedProcess.biNumber}</strong></span>
                  <span>•</span>
                  <span>TYPE: <strong className="text-amber-300">{selectedProcess.type}</strong></span>
                  <span>•</span>
                  <span>STAGE: <strong className="text-blue-300">{selectedProcess.stage}</strong></span>
                  <span>•</span>
                  <span>PROV: <strong className="text-emerald-300">{selectedProcess.province}</strong></span>
                  <span>•</span>
                  <span>UNIT: <strong className="text-neutral-300">{selectedProcess.unit}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right text-[10px]">
                  <div className="text-neutral-400">ASSIGNED: <strong className="text-white">{selectedProcess.assignedTo}</strong></div>
                  <div>SLA: {getSLABadge(selectedProcess)}</div>
                </div>
                <button
                  onClick={() => setSelectedProcess(null)}
                  className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:text-white text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PROCESS DETAIL SUB-TABS SELECTOR */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-neutral-800/80 text-[10px] font-bold">
              {[
                { id: 'IDENTIDADE', label: '01 IDENTIDADE' },
                { id: 'DOCUMENTOS', label: '02 DOCUMENTOS' },
                { id: 'BIOMETRIA', label: '03 BIOMETRIA' },
                { id: 'VALIDACOES', label: '04 VALIDAÇÕES' },
                { id: 'DUPLICIDADE', label: '05 DUPLICIDADE' },
                { id: 'DECISAO', label: '06 DECISÃO' },
                { id: 'ATRIBUICAO', label: '07 ATRIBUIÇÃO' },
                { id: 'HISTORICO', label: '08 HISTÓRICO' },
                { id: 'AUDITORIA', label: '09 AUDITORIA' }
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

            {/* TAB CONTENT: 01 IDENTIDADE (03.13) */}
            {detailTab === 'IDENTIDADE' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">1ª CAMADA — DADOS MÍNIMOS DE IDENTIDADE</span>
                  <button
                    onClick={() => setShowFullBiography(!showFullBiography)}
                    className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 text-amber-300 text-[10px] font-bold"
                  >
                    {showFullBiography ? 'OCULTAR DETALHES' : '[VER DADOS COMPLETOS]'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-[10px] text-neutral-500 block">NOME COMPLETO:</span><strong className="text-white font-sans">{selectedProcess.citizenName}</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">Nº DE BI:</span><strong className="text-amber-300">{selectedProcess.biNumber}</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">DATA NASCIMENTO:</span><strong className="text-white">{selectedProcess.dob}</strong></div>
                  <div><span className="text-[10px] text-neutral-500 block">PROVÍNCIA:</span><strong className="text-emerald-300">{selectedProcess.province}</strong></div>
                </div>

                {/* EXTENDED BIOGRAPHICAL LAYER */}
                {showFullBiography && (
                  <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2 mt-2 text-xs font-sans animate-in fade-in duration-150">
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase block border-b border-neutral-800 pb-1">
                      2ª CAMADA — BIOGRAFIA EXPANDIDA & REGISTO CIVIL
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                      <div><span className="text-[10px] text-neutral-500 block font-sans">NOME DO PAI:</span><strong className="text-white">{selectedProcess.fatherName}</strong></div>
                      <div><span className="text-[10px] text-neutral-500 block font-sans">NOME DA MÃE:</span><strong className="text-white">{selectedProcess.motherName}</strong></div>
                      <div><span className="text-[10px] text-neutral-500 block font-sans">NATURALIDADE:</span><strong className="text-white">{selectedProcess.birthPlace}</strong></div>
                      <div><span className="text-[10px] text-neutral-500 block font-sans">RESIDÊNCIA:</span><strong className="text-white">{selectedProcess.address}</strong></div>
                      <div><span className="text-[10px] text-neutral-500 block font-sans">CONTACTO:</span><strong className="text-white">{selectedProcess.phone}</strong></div>
                      <div><span className="text-[10px] text-neutral-500 block font-sans">ASSENTO REGISTO CIVIL:</span><strong className="text-amber-300">{selectedProcess.birthRegistrationNo}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 02 DOCUMENTOS (03.14) */}
            {detailTab === 'DOCUMENTOS' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">DOCUMENTOS DO PROCESSO</span>
                <div className="overflow-x-auto rounded-xl border border-neutral-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-neutral-900 text-[10px] text-neutral-400 uppercase">
                      <tr>
                        <th className="p-2.5">DOCUMENT_NAME</th>
                        <th className="p-2.5 text-center">STATUS</th>
                        <th className="p-2.5 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-[11px]">
                      {selectedProcess.docs.map((doc) => (
                        <tr key={doc.id}>
                          <td className="p-2.5 font-bold text-white">{doc.name}</td>
                          <td className="p-2.5 text-center">
                            {doc.status === 'VALIDATED' && <span className="text-emerald-400 font-bold">✓ VALIDATED</span>}
                            {doc.status === 'RECEIVED' && <span className="text-blue-400 font-bold">✓ RECEIVED</span>}
                            {doc.status === 'PENDING' && <span className="text-amber-400 font-bold">⚠ PENDING</span>}
                            {doc.status === 'REJECTED' && <span className="text-rose-400 font-bold">✕ REJECTED</span>}
                          </td>
                          <td className="p-2.5 text-right space-x-1">
                            <button className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold text-[10px]">VER</button>
                            <button className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">VALIDAR</button>
                            <button className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px]">REJEITAR</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 03 BIOMETRIA (03.15) */}
            {detailTab === 'BIOMETRIA' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">DADOS BIOMÉTRICOS & AFIS (ACESSO RESTRITO)</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold">
                    ISO/IEC 19794 COMPLIANT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 block">FOTOGRAFIA ICAO:</span>
                    <span className="text-emerald-400 font-bold block">{selectedProcess.bioDetails.photo ? '✓ RECEBIDA (FACIAL OK)' : '✕ PENDENTE'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 block">DACTILOSCOPIA (WSQ):</span>
                    <span className="text-emerald-400 font-bold block">{selectedProcess.bioDetails.wsq10Print ? '✓ 10-PRINT WSQ OK' : '✕ PENDENTE'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 block">ASSINATURA DIGITAL:</span>
                    <span className="text-emerald-400 font-bold block">{selectedProcess.bioDetails.signature ? '✓ CAPTURADA' : '✕ PENDENTE'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-neutral-400 font-bold block">INTEGRIDADE E CORRESPONDÊNCIA AFIS:</span>
                    <span className="text-emerald-300 text-[11px]">
                      {selectedProcess.bioDetails.hashVerified ? '✓ SHA-256 HASH VERIFICADO • AFIS MATCH SCORE: 0.00% (SEM CONFLITO)' : '⚠ AGUARDANDO VALIDAÇÃO BIOMÉTRICA'}
                    </span>
                  </div>
                  {selectedProcess.bioStatus !== 'VALIDATED' && (
                    <button
                      onClick={() => setDetailTab('DECISAO')}
                      className="px-2.5 py-1 rounded bg-amber-500 text-neutral-950 font-bold text-[10px]"
                    >
                      AGENDAR BIOMETRIA
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 04 VALIDAÇÕES (03.16) */}
            {detailTab === 'VALIDACOES' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">CHECKLIST DE VALIDAÇÕES INTEGRADA</span>
                <div className="overflow-x-auto rounded-xl border border-neutral-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-neutral-900 text-[10px] text-neutral-400 uppercase">
                      <tr>
                        <th className="p-2.5">VALIDATION_CHECK</th>
                        <th className="p-2.5 text-center">RESULT</th>
                        <th className="p-2.5">VALIDATOR</th>
                        <th className="p-2.5 text-right">TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-[11px]">
                      {selectedProcess.validations.map((v) => (
                        <tr key={v.key}>
                          <td className="p-2.5 font-bold text-white">{v.label}</td>
                          <td className="p-2.5 text-center">
                            {v.passed ? (
                              <span className="text-emerald-400 font-bold">✓ PASSED</span>
                            ) : (
                              <span className="text-rose-400 font-bold">✕ FAILED / PENDING</span>
                            )}
                          </td>
                          <td className="p-2.5 text-neutral-300">{v.validator}</td>
                          <td className="p-2.5 text-right text-neutral-400">{v.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 05 DUPLICIDADE (03.17) */}
            {detailTab === 'DUPLICIDADE' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">PESQUISA DE DUPLICIDADE (AFIS / REGISTO CIVIL)</span>
                {selectedProcess.duplicityCheck.suspectedMatch ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 space-y-1">
                    <div className="font-bold">⚠ POSSÍVEL DUPLICIDADE DETETADA</div>
                    <div>BI CONFLITUANTE: {selectedProcess.duplicityCheck.matchedBi}</div>
                    <div>SCORE DE CORRESPONDÊNCIA: {selectedProcess.duplicityCheck.matchScore}%</div>
                    <div className="text-[10px] text-neutral-400">Processo retido para análise de suspeita de fraude pela auditoria.</div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 space-y-1">
                    <div className="font-bold">✓ NENHUMA CORRESPONDÊNCIA DUPLICADA ENCONTRADA</div>
                    <div>SEARCH_ID: AFIS-DUP-2026-9912</div>
                    <div>SCORE DE SIMILARIDADE MÁXIMA: 0.02%</div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 06 DECISÃO WORKFLOW (03.18 - 03.23) */}
            {detailTab === 'DECISAO' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">DECISÃO OPERACIONAL E TRAMITAÇÃO</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setShowDecisionModal('APPROVE')}
                    className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold uppercase text-xs"
                  >
                    [ APROVAR ]
                  </button>
                  <button
                    onClick={() => setShowDecisionModal('RETURN')}
                    className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-extrabold uppercase text-xs"
                  >
                    [ DEVOLVER ]
                  </button>
                  <button
                    onClick={() => setShowDecisionModal('SUSPEND')}
                    className="p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-extrabold uppercase text-xs"
                  >
                    [ SUSPENDER ]
                  </button>
                  <button
                    onClick={() => setShowDecisionModal('REJECT')}
                    className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-extrabold uppercase text-xs"
                  >
                    [ REJEITAR ]
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 07 ATRIBUIÇÃO (03.25) */}
            {detailTab === 'ATRIBUICAO' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">GESTAO DE RESPONSAVEL E ATRIBUICAO</span>
                <div className="text-xs space-y-1">
                  <div>OPERADOR ATUAL: <strong className="text-white">{selectedProcess.assignedTo}</strong></div>
                  <div>UNIDADE: <strong className="text-blue-300">{selectedProcess.unit}</strong></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleAssignToMe(selectedProcess.id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-500 text-neutral-950 font-extrabold text-xs"
                  >
                    ATRIBUIR A MIM
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 08 HISTÓRICO (03.28) */}
            {detailTab === 'HISTORICO' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">HISTÓRICO DE TRAMITAÇÃO (APPEND-ONLY)</span>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 text-xs font-mono">
                  {selectedProcess.history.map((h, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-amber-300">{h.action}:</span> <span className="text-white">{h.details}</span>
                        <div className="text-[9px] text-neutral-500">POR: {h.actor}</div>
                      </div>
                      <span className="text-neutral-500 text-[10px]">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 09 AUDITORIA (03.29) */}
            {detailTab === 'AUDITORIA' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">COFRE DE AUDITORIA DE SEGURANÇA</span>
                <div className="overflow-x-auto rounded-xl border border-neutral-800">
                  <table className="w-full text-left text-[10px] font-mono">
                    <thead className="bg-neutral-900 text-neutral-400 uppercase">
                      <tr>
                        <th className="p-2">TIME</th>
                        <th className="p-2">ACTOR</th>
                        <th className="p-2">ROLE</th>
                        <th className="p-2">IP</th>
                        <th className="p-2">POLICY</th>
                        <th className="p-2 text-center">REAUTH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {selectedProcess.audit.map((a, idx) => (
                        <tr key={idx}>
                          <td className="p-2 text-neutral-400">{a.time}</td>
                          <td className="p-2 font-bold text-white">{a.actor}</td>
                          <td className="p-2 text-amber-300">{a.role}</td>
                          <td className="p-2 text-neutral-400">{a.ip}</td>
                          <td className="p-2 text-purple-300">{a.policy}</td>
                          <td className="p-2 text-center text-emerald-400">{a.reauth ? 'TRUE' : 'FALSE'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 03.2 — NEW PROCESS CREATION
         ==================================================================== */}
      {showNewProcessModal && (
        <NewProcessModal
          isOpen={showNewProcessModal}
          onClose={() => setShowNewProcessModal(false)}
          onCreate={handleCreateNewProcess}
          operatorRole={operator.role}
        />
      )}

      {/* ====================================================================
          MODAL DECISION CONFIRMATION
         ==================================================================== */}
      {showDecisionModal && selectedProcess && (
        <div className="fixed inset-0 z-[9999] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 font-mono select-none">
          <div className="w-full max-w-md p-5 rounded-3xl bg-[#111217] border border-amber-500/40 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-extrabold text-amber-400 uppercase">
                CONFIRMAR DECISÃO OPERACIONAL [{showDecisionModal}]
              </span>
              <button onClick={() => setShowDecisionModal(null)} className="text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="text-xs space-y-2">
              <div>PROCESSO: <strong className="text-amber-300">{selectedProcess.id}</strong></div>
              <div>CIDADÃO: <strong className="text-white">{selectedProcess.citizenName}</strong></div>

              {showDecisionModal !== 'APPROVE' && (
                <div>
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">CATEGORIA DO MOTIVO:</label>
                  <select
                    value={decisionReasonCategory}
                    onChange={(e) => setDecisionReasonCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-white text-xs"
                  >
                    <option value="">SELECIONE A CATEGORIA...</option>
                    <option value="DOCUMENTAÇÃO INSUFICIENTE">DOCUMENTAÇÃO INSUFICIENTE</option>
                    <option value="DADOS INCONSISTENTES">DADOS INCONSISTENTES</option>
                    <option value="BIOMETRIA NÃO VALIDADA">BIOMETRIA NÃO VALIDADA</option>
                    <option value="DUPLICIDADE DETETADA">DUPLICIDADE DETETADA</option>
                    <option value="OUTRO MOTIVO REGULAMENTAR">OUTRO MOTIVO REGULAMENTAR</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] text-neutral-400 uppercase block mb-1">OBSERVAÇÕES OPERACIONAIS:</label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Introduza notas para o histórico e auditoria..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowDecisionModal(null)}
                className="w-1/2 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold"
              >
                CANCELAR
              </button>
              <button
                onClick={handleExecuteDecision}
                className="w-1/2 py-2 rounded-xl bg-amber-500 text-neutral-950 font-extrabold uppercase"
              >
                CONFIRMAR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ============================================================================
// NEW PROCESS CREATION MODAL COMPONENT (03.2)
// ============================================================================
interface NewProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (type: ProcessType, citizenName: string, biNumber: string) => void;
  operatorRole: string;
}

const NewProcessModal: React.FC<NewProcessModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  operatorRole
}) => {
  const [selectedType, setSelectedType] = useState<ProcessType>('FIRST_BI');
  const [citizenName, setCitizenName] = useState('');
  const [biNumber, setBiNumber] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 font-mono select-none">
      <div className="w-full max-w-lg p-5 rounded-3xl bg-[#111217] border border-amber-500/40 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <span className="text-xs font-extrabold text-amber-400 uppercase">
            NOVO PROCESSO DE REGISTO & BI
          </span>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
              SELECCIONAR TIPO DE PROCESSO AUTORIZADO:
            </label>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { type: 'FIRST_BI', code: '01', name: 'Primeiro BI' },
                { type: 'RENEWAL', code: '02', name: 'Renovação' },
                { type: 'REPLACEMENT', code: '03', name: 'Substituição (2ª Via)' },
                { type: 'DATA_UPDATE', code: '04', name: 'Atualização de Dados' },
                { type: 'DATA_CORRECTION', code: '05', name: 'Correção de Dados' },
                { type: 'BIRTH_REGISTRATION', code: '06', name: 'Processo de Registo' }
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedType(item.type as ProcessType)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                    selectedType === item.type
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-extrabold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="text-amber-400 font-mono text-[10px]">{item.code}</span>
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
              NOME COMPLETO DO CIDADÃO:
            </label>
            <input
              type="text"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              placeholder="EX: MANUEL ANTÓNIO CAMACHO"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-sans font-bold text-xs uppercase"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
              Nº DE BILHETE DE IDENTIDADE (SE APLICÁVEL):
            </label>
            <input
              type="text"
              value={biNumber}
              onChange={(e) => setBiNumber(e.target.value)}
              placeholder="EX: 008819201LA088"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono font-bold text-xs uppercase"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold"
          >
            CANCELAR
          </button>
          <button
            onClick={() => onCreate(selectedType, citizenName, biNumber)}
            className="w-1/2 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-extrabold uppercase shadow-md"
          >
            CRIAR PROCESSO
          </button>
        </div>
      </div>
    </div>
  );
};
