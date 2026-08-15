import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  UserCheck,
  Building2,
  MapPin,
  FileText,
  Fingerprint,
  ShieldAlert,
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
  AlertCircle,
  Link,
  QrCode,
  Key,
  Shield,
  Activity,
  FileCode,
  Sliders,
  Sparkles,
  Zap
} from 'lucide-react';
import { getCurrentSession } from '../../../services/accessControlService';

export type IdentityStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'DECEASED'
  | 'MERGED'
  | 'UNDER_REVIEW';

export type ConflictStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED';

export interface IdentityEvidence {
  key: string;
  category: 'REGISTRATION' | 'DOCUMENT' | 'BIOMETRIC' | 'VALIDATION' | 'UNIQUENESS';
  label: string;
  source: string;
  timestamp: string;
  integrityHash: string;
  verified: boolean;
}

export interface IdentityEvent {
  id: string;
  time: string;
  type:
    | 'IDENTITY_CREATED'
    | 'BI_LINKED'
    | 'BIOMETRICS_VERIFIED'
    | 'CREDENTIAL_ISSUED'
    | 'CREDENTIAL_VERIFIED'
    | 'CREDENTIAL_REVOKED'
    | 'IDENTITY_SUSPENDED'
    | 'IDENTITY_REACTIVATED';
  actor: string;
  details: string;
}

export interface IdentityConflict {
  id: string;
  type: string;
  description: string;
  identitiesInvolved: string[];
  status: ConflictStatus;
  detectedAt: string;
  assignedTo: string;
}

export interface IdentityRecord {
  id: string; // ID-00000123
  fullName: string;
  biNumber: string;
  civilRegistrationNo: string; // REG-000123
  processId: string;
  province: string;
  status: IdentityStatus;
  credentialStatus: 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'NOT_ISSUED';
  uniquenessStatus: 'PASSED' | 'SUSPECT' | 'UNDER_INVESTIGATION';
  pwaLinked: boolean;
  qrVerificationEnabled: boolean;
  createdAt: string;
  lastVerifiedAt: string;
  sourceAuthority: string; // MJDH_CENTRAL
  
  // Biometrics Metadata (No raw image/templates exposed)
  biometrics: {
    photoVerified: boolean;
    fingerprintVerified: boolean;
    signatureVerified: boolean;
    afisScore: number;
    lastMatchTime: string;
  };

  evidences: IdentityEvidence[];
  events: IdentityEvent[];
  auditLogs: {
    time: string;
    actor: string;
    role: string;
    org: string;
    territory: string;
    action: string;
    result: string;
  }[];
}

interface IdentityChainTabProps {
  onOpenReauth?: () => void;
  onOpenPolicyInspector?: () => void;
  onOpenOrgSelector?: () => void;
  onNavigateToProcesses?: (procId?: string) => void;
  onNavigateToCitizens?: () => void;
}

export const IdentityChainTab: React.FC<IdentityChainTabProps> = ({
  onOpenReauth,
  onOpenPolicyInspector,
  onOpenOrgSelector,
  onNavigateToProcesses,
  onNavigateToCitizens
}) => {
  const session = getCurrentSession();
  const { operator } = session;

  // IAM POPUP
  const [showAccessDetails, setShowAccessDetails] = useState(false);

  // SEARCH & FILTERS
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterUniqueness, setFilterUniqueness] = useState<string>('ALL');
  const [filterProvince, setFilterProvince] = useState<string>('ALL');

  // SELECTED IDENTITY INSPECTOR
  const [selectedIdentity, setSelectedIdentity] = useState<IdentityRecord | null>(null);
  const [inspectorTab, setInspectorTab] = useState<
    'ROOT_OF_TRUST' | 'BIOMETRICS' | 'UNIQUENESS' | 'CREDENTIALS' | 'EVIDENCE' | 'OPERATIONS' | 'EVENTS' | 'AUDIT'
  >('ROOT_OF_TRUST');

  // STATE MODAL (ALL 7 OPERATIONAL STATES & CREDENTIAL REVOCATION)
  const [showActionModal, setShowActionModal] = useState<
    IdentityStatus | 'REVOKE_CREDENTIAL' | null
  >(null);
  const [actionReason, setActionReason] = useState('');
  const [actionTargetMergedId, setActionTargetMergedId] = useState('');
  const [actionConfirmationNotice, setActionConfirmationNotice] = useState<string | null>(null);
  const [authorizationError, setAuthorizationError] = useState<string | null>(null);

  // CONFLICTS MODAL
  const [selectedConflict, setSelectedConflict] = useState<IdentityConflict | null>(null);

  // MOCK DATASET: IDENTITIES (COVERING ALL 7 OPERATIONAL STATES)
  const [identitiesList, setIdentitiesList] = useState<IdentityRecord[]>([
    {
      id: 'ID-00000123',
      fullName: 'JOÃO MANUEL DA SILVA',
      biNumber: '001234567LA032',
      civilRegistrationNo: 'REG-2020-1182',
      processId: 'REQ-000187',
      province: 'Luanda',
      status: 'ACTIVE',
      credentialStatus: 'ACTIVE',
      uniquenessStatus: 'PASSED',
      pwaLinked: true,
      qrVerificationEnabled: true,
      createdAt: '23/07/2021',
      lastVerifiedAt: '12/08/2026 14:20',
      sourceAuthority: 'MJDH_CENTRAL',
      biometrics: {
        photoVerified: true,
        fingerprintVerified: true,
        signatureVerified: true,
        afisScore: 99.8,
        lastMatchTime: '12/08/2026 14:20'
      },
      evidences: [
        { key: 'e1', category: 'REGISTRATION', label: 'Assento de Nascimento Registado na Conservatória', source: 'SILA_CIVIL_REGISTRY', timestamp: '23/07/2021', integrityHash: '0x8f20a...1294', verified: true },
        { key: 'e2', category: 'DOCUMENT', label: 'Bilhete de Identidade Emitido pelo MJDH', source: 'CENTRAL_BI_SYSTEM', timestamp: '23/07/2021', integrityHash: '0x321fa...9921', verified: true },
        { key: 'e3', category: 'BIOMETRIC', label: 'Verificação Biométrica AFIS 10-Print Match', source: 'AFIS_NATIONAL_SERVER', timestamp: '12/08/2026', integrityHash: '0x77aa1...4410', verified: true },
        { key: 'e4', category: 'UNIQUENESS', label: 'Certificado de Unicidade Nacional de Identidade', source: 'UNIQUENESS_ENGINE_V4', timestamp: '12/08/2026', integrityHash: '0x100ab...5520', verified: true }
      ],
      events: [
        { id: 'evt-1', time: '23/07/2021 10:00', type: 'IDENTITY_CREATED', actor: 'SILA_AUTO_PROVISION', details: 'Identidade Civil vinculada ao Assento REG-2020-1182' },
        { id: 'evt-2', time: '23/07/2021 11:30', type: 'BI_LINKED', actor: 'OPERADOR_LUANDA_01', details: 'Bilhete de Identidade 001234567LA032 vinculado à Identidade' },
        { id: 'evt-3', time: '12/08/2026 14:20', type: 'CREDENTIAL_VERIFIED', actor: operator.fullName, details: 'Verificação da credencial digital em balcão oficial via QR Code' }
      ],
      auditLogs: [
        { time: '12/08/2026 14:20', actor: operator.fullName, role: operator.role, org: operator.organizationName, territory: 'NACIONAL', action: 'INSPECIONAR_CADEIA_CONFIANCA', result: 'AUTHORIZED' }
      ]
    },
    {
      id: 'ID-00000124',
      fullName: 'ANTÓNIO PEDRO NETO',
      biNumber: '004829102LA049',
      civilRegistrationNo: 'REG-1982-1182',
      processId: 'REQ-000186',
      province: 'Huambo',
      status: 'UNDER_REVIEW',
      credentialStatus: 'EXPIRED',
      uniquenessStatus: 'PASSED',
      pwaLinked: false,
      qrVerificationEnabled: false,
      createdAt: '10/05/2016',
      lastVerifiedAt: '12/08/2026 11:10',
      sourceAuthority: 'MJDH_HUAMBO',
      biometrics: {
        photoVerified: true,
        fingerprintVerified: true,
        signatureVerified: false,
        afisScore: 94.2,
        lastMatchTime: '12/08/2026 11:10'
      },
      evidences: [
        { key: 'e1', category: 'REGISTRATION', label: 'Assento de Nascimento Huambo', source: 'SILA_CIVIL_REGISTRY', timestamp: '10/05/2016', integrityHash: '0x2211b...4490', verified: true },
        { key: 'e2', category: 'DOCUMENT', label: 'BI Expirado em Maio de 2026', source: 'CENTRAL_BI_SYSTEM', timestamp: '09/05/2026', integrityHash: '0x9922c...1102', verified: false }
      ],
      events: [
        { id: 'evt-10', time: '10/05/2016 09:00', type: 'IDENTITY_CREATED', actor: 'POSTO_HUAMBO', details: 'Identidade gerada para emissão inicial de BI' },
        { id: 'evt-11', time: '09/05/2026 00:00', type: 'IDENTITY_SUSPENDED', actor: 'SYSTEM_EXPIRY_CRON', details: 'Caducidade do documento de suporte (BI Expirado)' }
      ],
      auditLogs: [
        { time: '12/08/2026 11:10', actor: 'Analista Huambo-03', role: 'IDENTITY_ANALYST', org: 'Posto Huambo', territory: 'Huambo', action: 'VERIFICAR_EVIDENCIAS', result: 'AUTHORIZED' }
      ]
    },
    {
      id: 'ID-00000125',
      fullName: 'SEBASTIÃO BENJAMIM CAMBUTA',
      biNumber: '007718201CA091',
      civilRegistrationNo: 'REG-1979-0091',
      processId: 'REQ-000190',
      province: 'Cabinda',
      status: 'SUSPENDED',
      credentialStatus: 'REVOKED',
      uniquenessStatus: 'SUSPECT',
      pwaLinked: true,
      qrVerificationEnabled: false,
      createdAt: '15/01/2019',
      lastVerifiedAt: '11/08/2026 14:20',
      sourceAuthority: 'MJDH_CENTRAL',
      biometrics: {
        photoVerified: true,
        fingerprintVerified: false,
        signatureVerified: true,
        afisScore: 62.1,
        lastMatchTime: '11/08/2026 14:20'
      },
      evidences: [
        { key: 'e10', category: 'REGISTRATION', label: 'Assento Civil Cabinda', source: 'SILA_CIVIL_REGISTRY', timestamp: '15/01/2019', integrityHash: '0x3344a...9911', verified: true },
        { key: 'e11', category: 'UNIQUENESS', label: 'Alerta AFIS: Correspondência Biométrica com ID-00000099', source: 'AFIS_ENGINE', timestamp: '11/08/2026', integrityHash: '0x9900c...SUSPECT', verified: false }
      ],
      events: [
        { id: 'evt-20', time: '11/08/2026 14:20', type: 'IDENTITY_SUSPENDED', actor: 'Dra. Rosa Neto', details: 'Identidade suspensa devido a conflito de unicidade bioplates' },
        { id: 'evt-21', time: '11/08/2026 14:21', type: 'CREDENTIAL_REVOKED', actor: 'Dra. Rosa Neto', details: 'Credencial digital revogada de forma preventiva' }
      ],
      auditLogs: [
        { time: '11/08/2026 14:20', actor: 'Dra. Rosa Neto', role: 'AUDITOR', org: 'MJDH_CENTRAL', territory: 'NACIONAL', action: 'SUSPENDER_IDENTIDADE', result: 'EXECUTED' }
      ]
    },
    {
      id: 'ID-00000126',
      fullName: 'MARIA ISABEL LOPES DA COSTA',
      biNumber: '009182736BE012',
      civilRegistrationNo: 'REG-2026-0041',
      processId: 'REQ-000210',
      province: 'Benguela',
      status: 'PENDING',
      credentialStatus: 'NOT_ISSUED',
      uniquenessStatus: 'PASSED',
      pwaLinked: false,
      qrVerificationEnabled: false,
      createdAt: '01/08/2026',
      lastVerifiedAt: '01/08/2026 09:15',
      sourceAuthority: 'MJDH_BENGUELA',
      biometrics: {
        photoVerified: true,
        fingerprintVerified: false,
        signatureVerified: true,
        afisScore: 88.0,
        lastMatchTime: '01/08/2026 09:15'
      },
      evidences: [
        { key: 'e30', category: 'REGISTRATION', label: 'Assento de Nascimento Registado', source: 'SILA_CIVIL_REGISTRY', timestamp: '01/08/2026', integrityHash: '0x8811d...7700', verified: true }
      ],
      events: [
        { id: 'evt-30', time: '01/08/2026 09:15', type: 'IDENTITY_CREATED', actor: 'POSTO_BENGUELA_02', details: 'Registo inicial criado, aguardando validação de impressões dactiloscópicas AFIS' }
      ],
      auditLogs: [
        { time: '01/08/2026 09:15', actor: 'Operador Benguela', role: 'REGISTRATION_OFFICER', org: 'Posto Benguela', territory: 'Benguela', action: 'CRIAR_REGISTO_PENDENTE', result: 'AUTHORIZED' }
      ]
    },
    {
      id: 'ID-00000127',
      fullName: 'MATEUS CHIVANGULULA',
      biNumber: '003319283NE081',
      civilRegistrationNo: 'REG-2015-8821',
      processId: 'REQ-000099',
      province: 'Namibe',
      status: 'REVOKED',
      credentialStatus: 'REVOKED',
      uniquenessStatus: 'SUSPECT',
      pwaLinked: false,
      qrVerificationEnabled: false,
      createdAt: '12/03/2015',
      lastVerifiedAt: '05/06/2026 16:40',
      sourceAuthority: 'MJDH_CENTRAL',
      biometrics: {
        photoVerified: false,
        fingerprintVerified: false,
        signatureVerified: false,
        afisScore: 0.0,
        lastMatchTime: '05/06/2026 16:40'
      },
      evidences: [
        { key: 'e40', category: 'VALIDATION', label: 'Sentença Judicial de Anulação de Registo Falso', source: 'TRIBUNAL_COMARCA_NAMIBE', timestamp: '05/06/2026', integrityHash: '0x7700a...JUDICIAL', verified: true }
      ],
      events: [
        { id: 'evt-40', time: '05/06/2026 16:40', type: 'IDENTITY_SUSPENDED', actor: 'GOVERNANCE_ADMIN', details: 'Identidade revogada definitivamente nos termos da Sentença do Tribunal de Comarca' }
      ],
      auditLogs: [
        { time: '05/06/2026 16:40', actor: 'Administrador Central', role: 'GOVERNANCE_ADMIN', org: 'MJDH_CENTRAL', territory: 'NACIONAL', action: 'REVOGAR_IDENTIDADE', result: 'EXECUTED' }
      ]
    },
    {
      id: 'ID-00000128',
      fullName: 'GASPAR DOMINGOS FRANCISCO',
      biNumber: '001198273LA019',
      civilRegistrationNo: 'REG-1955-0012',
      processId: 'REQ-000011',
      province: 'Luanda',
      status: 'DECEASED',
      credentialStatus: 'REVOKED',
      uniquenessStatus: 'PASSED',
      pwaLinked: false,
      qrVerificationEnabled: false,
      createdAt: '10/01/2012',
      lastVerifiedAt: '20/07/2026 10:00',
      sourceAuthority: 'MJDH_CONSERVATORIA_1_LUANDA',
      biometrics: {
        photoVerified: true,
        fingerprintVerified: true,
        signatureVerified: true,
        afisScore: 99.9,
        lastMatchTime: '20/07/2026 10:00'
      },
      evidences: [
        { key: 'e50', category: 'REGISTRATION', label: 'Certidão de Óbito n.º 4410/2026 - 1.ª Conservatória', source: 'CONSERVATORIA_CIVIL', timestamp: '20/07/2026', integrityHash: '0x9922a...OBITO', verified: true }
      ],
      events: [
        { id: 'evt-50', time: '20/07/2026 10:00', type: 'IDENTITY_SUSPENDED', actor: 'Conservador Principal', details: 'Averbamento de Registo de Óbito no Assento de Nascimento e encerramento da Identidade Civil' }
      ],
      auditLogs: [
        { time: '20/07/2026 10:00', actor: 'Conservador Principal', role: 'CONSERVADOR_GERAL', org: 'Conservatória Luanda', territory: 'Luanda', action: 'AVERBAR_OBITO', result: 'EXECUTED' }
      ]
    },
    {
      id: 'ID-00000129',
      fullName: 'CARLOS ALBERTO DALA (DUPLICADO)',
      biNumber: '002233445LA099',
      civilRegistrationNo: 'REG-2018-9901',
      processId: 'REQ-000144',
      province: 'Uíge',
      status: 'MERGED',
      credentialStatus: 'REVOKED',
      uniquenessStatus: 'PASSED',
      pwaLinked: false,
      qrVerificationEnabled: false,
      createdAt: '05/04/2018',
      lastVerifiedAt: '02/08/2026 15:30',
      sourceAuthority: 'MJDH_CENTRAL',
      biometrics: {
        photoVerified: true,
        fingerprintVerified: true,
        signatureVerified: true,
        afisScore: 99.9,
        lastMatchTime: '02/08/2026 15:30'
      },
      evidences: [
        { key: 'e60', category: 'UNIQUENESS', label: 'Relatório Unificação de Identidade Duplicada -> Destino: ID-00000123', source: 'SILA_MERGE_ENGINE', timestamp: '02/08/2026', integrityHash: '0x11223...MERGED', verified: true }
      ],
      events: [
        { id: 'evt-60', time: '02/08/2026 15:30', type: 'IDENTITY_SUSPENDED', actor: 'Analista Unicidade', details: 'Registo duplicado unificado na Identidade Principal ID-00000123' }
      ],
      auditLogs: [
        { time: '02/08/2026 15:30', actor: 'Analista Unicidade', role: 'IDENTITY_ANALYST', org: 'MJDH_CENTRAL', territory: 'NACIONAL', action: 'UNIFICAR_IDENTIDADES', result: 'EXECUTED' }
      ]
    }
  ]);

  // ABAC / IAM AUTHORIZATION CHECKER FOR STATE TRANSITIONS
  const checkOperatorStateAuthorization = (
    targetState: IdentityStatus | 'REVOKE_CREDENTIAL'
  ): { isAuthorized: boolean; requiredRole: string; reason: string } => {
    const role = (operator?.role || '').toUpperCase();
    const isSuperOrGovAdmin =
      role.includes('SUPER') ||
      role.includes('GOVERNANCE') ||
      role.includes('DEUS') ||
      role.includes('DIRECTOR') ||
      role.includes('CONSELHO');

    // High privilege roles have full access for any operational state
    if (isSuperOrGovAdmin) {
      return {
        isAuthorized: true,
        requiredRole: 'GOVERNANCE_ADMIN',
        reason: 'Autorizado como Administrador do Sistema / Governação'
      };
    }

    // Irreversible / Sensitive states require GOVERNANCE_ADMIN / CONSELHO SUPERIOR approval
    if (targetState === 'DECEASED' || targetState === 'MERGED' || targetState === 'REVOKED') {
      return {
        isAuthorized: false,
        requiredRole: 'GOVERNANCE_ADMIN / CONSELHO SUPERIOR',
        reason: `A transição para o estado '<sup>${targetState}</sup>' exige homologação do Conselho Superior de Identificação Civil do MJDH.`
      };
    }

    // Analysts can handle ACTIVE, PENDING, SUSPENDED, UNDER_REVIEW
    if (role.includes('ANALYST') || role.includes('AUDITOR') || role.includes('INSPECTOR')) {
      return {
        isAuthorized: true,
        requiredRole: 'IDENTITY_ANALYST',
        reason: 'Autorizado como Analista de Identidade / Auditor'
      };
    }

    // Basic operators cannot directly modify sensitive statuses without elevation
    return {
      isAuthorized: false,
      requiredRole: 'IDENTITY_ANALYST ou GOVERNANCE_ADMIN',
      reason: `O seu perfil atual (${operator?.role || 'OPERADOR'}) não possui privilégios de decisão administrativa para alterar o estado para '${targetState}'.`
    };
  };

  // MOCK DATASET: CONFLICTS
  const [conflictsList] = useState<IdentityConflict[]>([
    {
      id: 'CNF-2026-0041',
      type: 'DUPLICIDADE_BIOMETRICA_AFIS',
      description: 'Dactiloscopia (10-Print) de ID-00000125 apresenta 89.4% de similaridade com ID-00000099.',
      identitiesInvolved: ['ID-00000125', 'ID-00000099'],
      status: 'OPEN',
      detectedAt: '11/08/2026 14:15',
      assignedTo: 'Inspecção Geral MJDH'
    },
    {
      id: 'CNF-2026-0038',
      type: 'DIVERGENCIA_ASSENTO_NASCIMENTO',
      description: 'A data de nascimento no documento físico diverge em 4 dias do Assento de Registo Civil MJDH.',
      identitiesInvolved: ['ID-00000124'],
      status: 'UNDER_REVIEW',
      detectedAt: '10/08/2026 09:30',
      assignedTo: 'Conservatória Huambo'
    }
  ]);

  // FILTERED IDENTITIES
  const filteredIdentities = identitiesList.filter((item) => {
    const matchesQuery =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.biNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.civilRegistrationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.processId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.province.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (filterUniqueness !== 'ALL' && item.uniquenessStatus !== filterUniqueness) return false;
    if (filterProvince !== 'ALL' && item.province !== filterProvince) return false;

    return true;
  });

  const handleOpenIdentity = (record: IdentityRecord) => {
    // Audit Event Log
    const auditEntry = {
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: operator.fullName,
      role: operator.role,
      org: operator.organizationName || 'MJDH_CENTRAL',
      territory: operator.territories[0] || 'NACIONAL',
      action: 'INSPECIONAR_CADEIA_CONFIANCA',
      result: 'AUTHORIZED'
    };

    const updated = {
      ...record,
      auditLogs: [auditEntry, ...record.auditLogs]
    };

    setSelectedIdentity(updated);
    setInspectorTab('ROOT_OF_TRUST');
  };

  const handleExecuteStateAction = () => {
    if (!selectedIdentity || !showActionModal) return;

    // Check authorization first
    const authCheck = checkOperatorStateAuthorization(showActionModal);
    if (!authCheck.isAuthorized) {
      setAuthorizationError(`ACESSO BLOQUEADO POR POLÍTICA ABAC/IAM: ${authCheck.reason}`);
      return;
    }

    if (!actionReason.trim()) {
      setActionConfirmationNotice('ERRO: O motivo jurídico/administrativo é obrigatório.');
      return;
    }

    if (showActionModal === 'MERGED' && !actionTargetMergedId.trim()) {
      setActionConfirmationNotice('ERRO: Para unificação, informe o ID da Identidade de Destino Principal.');
      return;
    }

    let updatedStatus = selectedIdentity.status;
    let updatedCred = selectedIdentity.credentialStatus;
    let eventType: IdentityEvent['type'] = 'IDENTITY_SUSPENDED';
    let details = actionReason;

    if (showActionModal === 'REVOKE_CREDENTIAL') {
      updatedCred = 'REVOKED';
      eventType = 'CREDENTIAL_REVOKED';
      details = `Credencial digital revogada por: ${actionReason}`;
    } else {
      updatedStatus = showActionModal;
      if (showActionModal === 'ACTIVE') eventType = 'IDENTITY_REACTIVATED';
      else if (showActionModal === 'SUSPENDED') eventType = 'IDENTITY_SUSPENDED';
      else if (showActionModal === 'MERGED') details = `Unificado em ${actionTargetMergedId}. Motivo: ${actionReason}`;
      else details = `Estado alterado para ${showActionModal}. Motivo: ${actionReason}`;
    }

    const newEvent: IdentityEvent = {
      id: `evt-${Date.now()}`,
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: eventType,
      actor: `${operator.fullName} (${operator.role})`,
      details
    };

    const newAudit = {
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: operator.fullName,
      role: operator.role,
      org: operator.organizationName || 'MJDH_CENTRAL',
      territory: operator.territories[0] || 'NACIONAL',
      action: `DEFINIR_ESTADO_${showActionModal}`,
      result: 'EXECUTED_AUTHORIZED'
    };

    const updatedRecord: IdentityRecord = {
      ...selectedIdentity,
      status: updatedStatus,
      credentialStatus: updatedCred,
      events: [newEvent, ...selectedIdentity.events],
      auditLogs: [newAudit, ...selectedIdentity.auditLogs]
    };

    // Update dataset
    setIdentitiesList((prev) => prev.map((i) => (i.id === updatedRecord.id ? updatedRecord : i)));
    setSelectedIdentity(updatedRecord);
    setShowActionModal(null);
    setActionReason('');
    setActionTargetMergedId('');
    setAuthorizationError(null);
    setActionConfirmationNotice(`ESTADO ATUALIZADO COM SUCESSO PARA '${updatedStatus}'. REGISTADO EM AUDITORIA (ABAC OK).`);
    setTimeout(() => setActionConfirmationNotice(null), 5000);
  };

  const getStatusBadge = (s: IdentityStatus) => {
    switch (s) {
      case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'PENDING': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'SUSPENDED': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'REVOKED': return 'bg-rose-900/40 text-rose-300 border-rose-700/60';
      case 'DECEASED': return 'bg-neutral-800 text-neutral-400 border-neutral-700';
      case 'MERGED': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'UNDER_REVIEW': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default: return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  const getStatusLabel = (s: IdentityStatus) => {
    switch (s) {
      case 'ACTIVE': return 'ACTIVE (VÁLIDO / ATIVO)';
      case 'PENDING': return 'PENDING (REGISTO PENDENTE)';
      case 'SUSPENDED': return 'SUSPENDED (PREVENTIVAMENTE SUSPENSO)';
      case 'REVOKED': return 'REVOKED (REVOGADO / ANULADO)';
      case 'DECEASED': return 'DECEASED (AVERBADO ÓBITO)';
      case 'MERGED': return 'MERGED (UNIFICADO / DUPLICADO)';
      case 'UNDER_REVIEW': return 'UNDER_REVIEW (EM INVESTIGAÇÃO AFIS)';
      default: return s;
    }
  };

  return (
    <div className="space-y-3 font-mono select-none text-xs">
      
      {/* 05.02 HEADER PATH & INTERNAL METADATA BAR */}
      <div className="p-3 rounded-2xl bg-[#111217] border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 shadow-xl">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-white uppercase tracking-wider">
            <span className="text-amber-400">SILA / GOVOS</span>
            <span className="text-neutral-600">&gt;</span>
            <span>MJDH_CENTRAL</span>
            <span className="text-neutral-600">&gt;</span>
            <span className="text-neutral-400">CONSELHO SUPERIOR DE IDENTIFICAÇÃO CIVIL MJDH</span>
            <span className="text-neutral-600">&gt;</span>
            <span className="text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">05_IDENTIDADE</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1 font-mono">
            <span>MODULE_ID: <strong className="text-white">IDENTIDADE_NATIONAL_TRUST</strong></span>
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

        {/* COMPACT LAYER 2 ACCESS BADGE (05.04) */}
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

      {/* MODULE HEADER BAR (05.05) */}
      <div className="p-3.5 rounded-2xl bg-[#111217] border border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h1 className="text-xs font-extrabold text-white uppercase tracking-wider">
              ✦ MÓDULO DE IDENTIDADE
            </h1>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
              MJDH • IDENTITY AUTHORITY
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            Cadeia de confiança que valida unicidade, vinculação ao Registo Civil e credenciamento oficial.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-bold font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AUTHORITY ONLINE
          </span>
          <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5" />
            AUDIT ACTIVE
          </span>
        </div>
      </div>

      {/* 05.06 BLOCK: FONTE DE AUTORIDADE (DENSE TABLE & SYSTEM HEALTH) */}
      <div className="p-4 rounded-2xl bg-[#111217] border border-neutral-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
              FONTE DE AUTORIDADE (MJDH CENTRAL AUTHORITY & SOURCES)
            </h2>
          </div>
          <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SYS_ONLINE (24ms)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-wider bg-neutral-900/60">
                <th className="py-2.5 px-3 font-bold">NÓ DE AUTORIDADE</th>
                <th className="py-2.5 px-3 font-bold">TIPO DE SERVIÇO</th>
                <th className="py-2.5 px-3 font-bold">ESTADO DE SYNC</th>
                <th className="py-2.5 px-3 font-bold">ÚLTIMO CHECK</th>
                <th className="py-2.5 px-3 font-bold">MÁSCARA ABAC/MFA</th>
                <th className="py-2.5 px-3 font-bold text-right">AÇÃO DE REDE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-[11px]">
              <tr className="hover:bg-neutral-900/40">
                <td className="py-2.5 px-3 font-bold text-amber-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  MJDH_CENTRAL_CORE
                </td>
                <td className="py-2.5 px-3 text-neutral-300">Registo Unificado de Identidade</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ● CONECTADO
                  </span>
                </td>
                <td className="py-2.5 px-3 text-neutral-400">12/08/2026 14:31:22</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">PDP_ACTIVE (LEVEL_2)</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="text-[10px] text-amber-300 font-bold uppercase">PING 12ms</span>
                </td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="py-2.5 px-3 font-bold text-blue-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  SILA_CIVIL_REGISTRY
                </td>
                <td className="py-2.5 px-3 text-neutral-300">Fonte de Assentos e Nascimento</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ● SYNCHRONIZED
                  </span>
                </td>
                <td className="py-2.5 px-3 text-neutral-400">12/08/2026 14:30:00</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">ABAC_AUTHORIZED</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="text-[10px] text-amber-300 font-bold uppercase">VERIFIED</span>
                </td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="py-2.5 px-3 font-bold text-purple-400 flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-purple-500" />
                  AFIS_NATIONAL_SERVER
                </td>
                <td className="py-2.5 px-3 text-neutral-300">Motor de Unicidade Biométrica</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    ● 10-PRINT MATCHING
                  </span>
                </td>
                <td className="py-2.5 px-3 text-neutral-400">12/08/2026 14:31:05</td>
                <td className="py-2.5 px-3 text-rose-400 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-rose-400" />
                  MÁSCARA_PROTEGIDA
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className="text-[10px] text-purple-300 font-bold uppercase">AFIS 99.8%</span>
                </td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="py-2.5 px-3 font-bold text-emerald-400 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                  PKI_CREDENTIAL_ISSUER
                </td>
                <td className="py-2.5 px-3 text-neutral-300">Emissão de Credenciais PWA SILA</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ● ACTIVE_ISSUER
                  </span>
                </td>
                <td className="py-2.5 px-3 text-neutral-400">12/08/2026 14:28:10</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">PKI_SIGNED</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase">VALID</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR (05.01 & 05.07) */}
      <div className="p-3 rounded-2xl bg-[#111217] border border-neutral-800 space-y-2.5 shadow-lg">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Q SEARCH IDENTITY_ID (ID-00000123) / BI / REGISTO_CIVIL / PROCESS / NAME / PROVINCE..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 shadow-inner"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
          <div className="flex flex-col gap-1 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 font-bold uppercase">ESTADO IDENTIDADE:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value="ALL" className="bg-neutral-900">TODOS OS ESTADOS (7 ESTADOS)</option>
              <option value="ACTIVE" className="bg-neutral-900">ACTIVE — VÁLIDO / ATIVO</option>
              <option value="PENDING" className="bg-neutral-900">PENDING — REGISTO PENDENTE</option>
              <option value="SUSPENDED" className="bg-neutral-900">SUSPENDED — SUSPENSO PREVENTIVO</option>
              <option value="REVOKED" className="bg-neutral-900">REVOKED — REVOGADO / ANULADO</option>
              <option value="DECEASED" className="bg-neutral-900">DECEASED — FALECIDO (ÓBITO)</option>
              <option value="MERGED" className="bg-neutral-900">MERGED — UNIFICADO / DUPLICADO</option>
              <option value="UNDER_REVIEW" className="bg-neutral-900">UNDER_REVIEW — EM ANÁLISE</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 font-bold uppercase">UNICIDADE / AFIS:</span>
            <select
              value={filterUniqueness}
              onChange={(e) => setFilterUniqueness(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value="ALL" className="bg-neutral-900">TODOS OS RESULTADOS</option>
              <option value="PASSED" className="bg-neutral-900">PASSED (UNICIDADE OK)</option>
              <option value="SUSPECT" className="bg-neutral-900">SUSPECT (DUPLICIDADE)</option>
              <option value="UNDER_INVESTIGATION" className="bg-neutral-900">INVESTIGAÇÃO</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <span className="text-neutral-500 font-bold uppercase">PROVÍNCIA:</span>
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value="ALL" className="bg-neutral-900">TODAS AS PROVÍNCIAS</option>
              <option value="Luanda" className="bg-neutral-900">Luanda</option>
              <option value="Huambo" className="bg-neutral-900">Huambo</option>
              <option value="Cabinda" className="bg-neutral-900">Cabinda</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <span className="text-neutral-500 text-[10px] font-bold font-mono">
              REGISTOS LOCALIZADOS: <strong className="text-amber-400">{filteredIdentities.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {actionConfirmationNotice && (
        <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold animate-in fade-in duration-150">
          {actionConfirmationNotice}
        </div>
      )}

      {/* DENSE TABLE: IDENTITIES LIST (MÓDULO 05 - DADOS BÁSICOS) */}
      <div className="p-3 rounded-2xl bg-[#111217] border border-neutral-800 overflow-x-auto shadow-lg">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-wider bg-neutral-900/60">
              <th className="py-2.5 px-3 font-bold">ID IDENTIDADE</th>
              <th className="py-2.5 px-3 font-bold">NOME</th>
              <th className="py-2.5 px-3 font-bold">STATUS</th>
              <th className="py-2.5 px-3 font-bold">ORIGEM</th>
              <th className="py-2.5 px-3 font-bold">ÚLTIMA VERIFICAÇÃO</th>
              <th className="py-2.5 px-3 font-bold text-right">AÇÃO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
            {filteredIdentities.map((item) => (
              <tr
                key={item.id}
                onClick={() => handleOpenIdentity(item)}
                className="hover:bg-neutral-900/60 cursor-pointer transition-colors group"
              >
                <td className="py-3 px-3 font-bold text-amber-400 whitespace-nowrap">{item.id}</td>
                <td className="py-3 px-3 font-bold text-white uppercase font-sans group-hover:text-amber-300">
                  {item.fullName}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-neutral-300 whitespace-nowrap">
                  <span className="text-amber-300 font-bold">{item.sourceAuthority}</span>
                  <span className="text-neutral-500 text-[10px] ml-1">({item.province})</span>
                </td>
                <td className="py-3 px-3 text-neutral-400 whitespace-nowrap">{item.lastVerifiedAt}</td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenIdentity(item);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 group-hover:bg-amber-500 border border-neutral-700 group-hover:border-amber-500 text-amber-300 group-hover:text-neutral-950 text-[10px] font-mono font-bold uppercase transition-colors"
                  >
                    INSPECIONAR &rsaquo;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 05.22 IDENTITY CONFLICTS MANAGEMENT BOARD */}
      <div className="p-4 rounded-2xl bg-[#111217] border border-neutral-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
              CONFLITOS DE IDENTIDADE EM ABERTO (IDENTITY CONFLICTS)
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold">
            {conflictsList.length} CASOS EM ANÁLISE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {conflictsList.map((c) => (
            <div key={c.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[10px]">
                <strong className="text-rose-400">{c.id}</strong>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
                  {c.status}
                </span>
              </div>
              <p className="text-[11px] font-sans text-neutral-300">{c.description}</p>
              <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-800">
                <span>ENVOLVIDOS: <strong className="text-white">{c.identitiesInvolved.join(', ')}</strong></span>
                <button
                  onClick={() => setSelectedConflict(c)}
                  className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 font-bold uppercase text-[9px]"
                >
                  INVESTIGAR &rsaquo;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 05.24 SOURCE SYNCHRONIZATION MONITOR */}
      <div className="p-3.5 rounded-2xl bg-[#111217] border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono">
        <div>
          <span className="text-neutral-500 block font-bold uppercase">MONITORIZAÇÃO DE FONTES DE AUTORIDADE (MJDH SOURCES)</span>
          <span className="text-white">MJDH_CENTRAL • SILA_REGISTER • CENTRAL_BI • AFIS_NATIONAL</span>
        </div>
        <div className="flex items-center gap-4">
          <div><span className="text-neutral-500">ÚLTIMA SYNC:</span> <strong className="text-emerald-400">14:31:22</strong></div>
          <div><span className="text-neutral-500">PENDENTES:</span> <strong className="text-white">0</strong></div>
          <div><span className="text-neutral-500">ERROS:</span> <strong className="text-emerald-400">0</strong></div>
        </div>
      </div>

      {/* ====================================================================
          FICHA DA CADEIA DE CONFIANÇA DA IDENTIDADE (INSPECTOR MODAL - 05.09 - 05.21)
         ==================================================================== */}
      {selectedIdentity && (
        <div className="fixed inset-0 z-[9990] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 font-mono select-none overflow-y-auto">
          <div className="w-full max-w-5xl my-auto p-5 rounded-3xl bg-[#111217] border border-amber-500/40 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            
            {/* INSPECTOR HEADER */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white font-sans uppercase">
                    {selectedIdentity.fullName}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getStatusBadge(selectedIdentity.status)}`}>
                    {selectedIdentity.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400 mt-1">
                  <span>IDENTITY_ID: <strong className="text-amber-400">{selectedIdentity.id}</strong></span>
                  <span>•</span>
                  <span>BI LINKED: <strong className="text-amber-300">{selectedIdentity.biNumber}</strong></span>
                  <span>•</span>
                  <span>REGISTO CIVIL: <strong className="text-white">{selectedIdentity.civilRegistrationNo}</strong></span>
                  <span>•</span>
                  <span>FONTE: <strong className="text-emerald-300">{selectedIdentity.sourceAuthority}</strong></span>
                </div>
              </div>

              <button
                onClick={() => setSelectedIdentity(null)}
                className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:text-white text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SUB-TABS SELECTOR */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-neutral-800 text-[10px] font-bold">
              {[
                { id: 'ROOT_OF_TRUST', label: '01 ROOT OF TRUST' },
                { id: 'BIOMETRICS', label: '02 BIOMETRIA' },
                { id: 'UNIQUENESS', label: '03 UNICIDADE' },
                { id: 'CREDENTIALS', label: '04 CREDENCIAIS' },
                { id: 'EVIDENCE', label: '05 EVIDÊNCIAS' },
                { id: 'OPERATIONS', label: '06 OPERAÇÕES DE ESTADO' },
                { id: 'EVENTS', label: '07 EVENTOS' },
                { id: 'AUDIT', label: '08 AUDITORIA ACESSO' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setInspectorTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    inspectorTab === t.id
                      ? 'bg-amber-500 text-neutral-950 font-extrabold shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* SUB-TAB 01: ROOT OF TRUST & TRUSTED PIPELINE (DENSE TABLE FORMAT) */}
            {inspectorTab === 'ROOT_OF_TRUST' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    CADEIA DE ANCORAGEM & ROOT OF TRUST INSTITUCIONAL (MJDH)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                    ✓ MJDH_ROOT_VALIDATED
                  </span>
                </div>

                {/* DENSE TABLE FOR ROOT OF TRUST NODES */}
                <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-wider bg-neutral-900">
                        <th className="py-2 px-3 font-bold">COMPONENTE DA CADEIA</th>
                        <th className="py-2 px-3 font-bold">IDENTIFICADOR OFICIAL</th>
                        <th className="py-2 px-3 font-bold">FONTE DE AUTORIDADE</th>
                        <th className="py-2 px-3 font-bold">ESTADO DE ANCORAGEM</th>
                        <th className="py-2 px-3 font-bold text-right">HASH DE INTEGRIDADE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-[11px]">
                      <tr className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 font-bold text-emerald-400 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          01. REGISTO CIVIL
                        </td>
                        <td className="py-2 px-3 text-amber-300 font-bold">{selectedIdentity.civilRegistrationNo}</td>
                        <td className="py-2 px-3 text-neutral-300">Conservatória Civil MJDH</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            ✓ ANCORADO
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-400">0x8f20a...1294</td>
                      </tr>
                      <tr className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 font-bold text-blue-400 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5" />
                          02. IDENTIDADE CIVIL
                        </td>
                        <td className="py-2 px-3 text-white font-bold">{selectedIdentity.id}</td>
                        <td className="py-2 px-3 text-neutral-300">Nó Central MJDH</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            ✓ VINCULADO
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-400">0x321fa...9921</td>
                      </tr>
                      <tr className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 font-bold text-amber-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          03. DOCUMENTO BI
                        </td>
                        <td className="py-2 px-3 text-amber-300 font-bold">{selectedIdentity.biNumber}</td>
                        <td className="py-2 px-3 text-neutral-300">Sistema Central BI (DNIC)</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            ✓ EMITIDO & VÁLIDO
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-400">0x77aa1...4410</td>
                      </tr>
                      <tr className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 font-bold text-purple-400 flex items-center gap-1.5">
                          <Fingerprint className="w-3.5 h-3.5" />
                          04. BIOMETRIA AFIS
                        </td>
                        <td className="py-2 px-3 text-purple-300 font-bold">10-PRINT MATCH</td>
                        <td className="py-2 px-3 text-neutral-300">Motor AFIS Nacional</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            ✓ SCORE 99.8%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-400">0x100ab...5520</td>
                      </tr>
                      <tr className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 font-bold text-pink-400 flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5" />
                          05. CREDENCIAL PWA
                        </td>
                        <td className="py-2 px-3 text-pink-300 font-bold">PKI_SIGNED_QR</td>
                        <td className="py-2 px-3 text-neutral-300">Carteira Cidadão GOVOS</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            ✓ ASSINADA
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-400">0xef991...8812</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 02: BIOMETRIA (ABAC MASK ENFORCEMENT TABLE) */}
            {inspectorTab === 'BIOMETRICS' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-bold text-amber-400 uppercase">
                      MÁSCARA DE PROTEÇÃO ABAC — VINCULAÇÃO BIOMÉTRICA
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    ABAC_MASK_ACTIVE
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-wider bg-neutral-900">
                        <th className="py-2 px-3 font-bold">CAMPO BIOMÉTRICO</th>
                        <th className="py-2 px-3 font-bold">ESTADO DE VERIFICAÇÃO</th>
                        <th className="py-2 px-3 font-bold">VALOR EXPOSTO / MÁSCARA ABAC</th>
                        <th className="py-2 px-3 font-bold text-right">REQUISITO DE DESBLOQUEIO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-[11px]">
                      <tr className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 font-bold text-neutral-200">FOTOGRAFIA ICAO (FACIAL)</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">✓ VERIFIED (ICAO Doc 9303)</td>
                        <td className="py-2 px-3 text-neutral-400 font-mono">[FOTO FORMATADA EXIBIDA]</td>
                        <td className="py-2 px-3 text-right text-neutral-500">ABAC Level 1 (Operator)</td>
                      </tr>
                      <tr className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 font-bold text-neutral-200">MINÚCIAS DACTILOSCÓPICAS WSQ</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">✓ 10-PRINT AFIS MATCH (99.8%)</td>
                        <td className="py-2 px-3 text-rose-400 font-bold font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 inline-block">
                          🔒 [PROTEGIDO POR MÁSCARA ABAC: BIOMETRICS_RESTRICTED]
                        </td>
                        <td className="py-2 px-3 text-right text-rose-300 font-bold">MFA + GOVERNANCE_ROLE</td>
                      </tr>
                      <tr className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 font-bold text-neutral-200">TEMPLATES AFIS BIOMÉTRICOS</td>
                        <td className="py-2 px-3 text-purple-300 font-bold">✓ ENCRYPTED IN VAULT</td>
                        <td className="py-2 px-3 text-rose-400 font-bold font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 inline-block">
                          🔒 [MÁSCARA ATIVA: HASH CACHED 0x99a...442]
                        </td>
                        <td className="py-2 px-3 text-right text-rose-300 font-bold">MFA + BIOMETRIC_READER</td>
                      </tr>
                      <tr className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 font-bold text-neutral-200">ASSINATURA DIGITAL VECTORIAL</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">✓ VERIFIED (PKI)</td>
                        <td className="py-2 px-3 text-neutral-300">Assinatura Digital Confirmada</td>
                        <td className="py-2 px-3 text-right text-neutral-500">ABAC Level 1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
                  <span>🔒 <strong>Política ABAC MJDH:</strong> A biometria em bruto é protegida contra extração ou visualização não autorizada de acordo com a Lei de Proteção de Dados de Angola.</span>
                  {onOpenReauth && (
                    <button
                      onClick={onOpenReauth}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[9px] font-bold uppercase whitespace-nowrap"
                    >
                      [SOLICITAR ELEVAÇÃO MFA]
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 03: UNICIDADE (05.14) */}
            {inspectorTab === 'UNIQUENESS' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">VERIFICAÇÃO DE UNICIDADE NACIONAL</span>
                
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">ESTADO DA VERIFICAÇÃO DE DUPLICIDADE:</span>
                    <strong className="text-emerald-400 text-sm">
                      {selectedIdentity.uniquenessStatus === 'PASSED' ? '✓ DUPLICATE CHECK PASSED (0 MATCHES)' : '⚠ ALERTA DE POSSÍVEL DUPLICIDADE'}
                    </strong>
                  </div>
                  {selectedIdentity.uniquenessStatus !== 'PASSED' && (
                    <button className="px-3 py-1.5 rounded bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] uppercase">
                      INVESTIGAR NO PAINEL DE CONFLITOS &rsaquo;
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 04: CREDENCIAIS (05.15 - 05.17) */}
            {inspectorTab === 'CREDENTIALS' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">CREDENCIAIS DIGITAIS & VINCULAÇÃO PWA</span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">ESTADO DA CREDENCIAL:</span>
                    <strong className={selectedIdentity.credentialStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}>
                      {selectedIdentity.credentialStatus}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">CARTEIRA PWA VINCULADA:</span>
                    <strong className="text-blue-300">{selectedIdentity.pwaLinked ? '✓ SIM (LINKED)' : 'NÃO'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">VALIDAÇÃO VIA QR CODE:</span>
                    <strong className="text-purple-300">{selectedIdentity.qrVerificationEnabled ? '✓ ATIVADA' : 'DESATIVADA'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex justify-end">
                  <button
                    onClick={() => setShowActionModal('REVOKE_CREDENTIAL')}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase"
                  >
                    [REVOGAR CREDENCIAL DIGITAL]
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 05: EVIDÊNCIAS (05.19) */}
            {inspectorTab === 'EVIDENCE' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">CAMADA DE EVIDÊNCIAS CRIPTOGRÁFICAS DE INTEGRIDADE</span>
                <div className="space-y-1.5">
                  {selectedIdentity.evidences.map((ev) => (
                    <div key={ev.key} className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{ev.label}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">HASH: {ev.integrityHash}</span>
                      </div>
                      <div className="text-right text-[10px]">
                        <span className="text-amber-300 font-bold block">{ev.source}</span>
                        <span className="text-neutral-400">{ev.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 06: OPERAÇÕES DE ESTADO (05.17, 05.18 & 05.25 - 7 ESTADOS OPERACIONAIS) */}
            {inspectorTab === 'OPERATIONS' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">
                    GESTAO DE ESTADOS OPERACIONAIS DA IDENTIDADE (ABAC MATRICIAL)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono">
                    ESTADO ATUAL: <strong className="text-amber-300 uppercase">{selectedIdentity.status}</strong>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5 text-[10px]">
                  <p className="text-neutral-300 font-sans">
                    ⚠️ <strong>Regra de Integridade do Registo Civil:</strong> A alteração de estado da Identidade Civil modifica a validade legal em tempo real na rede governamental. Cada transição é assinada pelo operador <strong className="text-amber-300">{operator.fullName}</strong> ({operator.role}) e exige fundamentação jurídica/administrativa.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                    PAINEL DE TRANSIÇÃO DE ESTADOS OPERACIONAIS (SELECCIONAR NOVO ESTADO):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {/* ACTIVE */}
                    <button
                      onClick={() => { setAuthorizationError(null); setShowActionModal('ACTIVE'); }}
                      disabled={selectedIdentity.status === 'ACTIVE'}
                      className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                        selectedIdentity.status === 'ACTIVE'
                          ? 'opacity-40 bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      <strong className="block text-xs uppercase">[ACTIVE]</strong>
                      <span className="text-[9px] text-neutral-400">Ativar / Restabelecer validade civil do cidadão</span>
                    </button>

                    {/* PENDING */}
                    <button
                      onClick={() => { setAuthorizationError(null); setShowActionModal('PENDING'); }}
                      disabled={selectedIdentity.status === 'PENDING'}
                      className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                        selectedIdentity.status === 'PENDING'
                          ? 'opacity-40 bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      <strong className="block text-xs uppercase">[PENDING]</strong>
                      <span className="text-[9px] text-neutral-400">Marcar como pendente de recolha ou validação</span>
                    </button>

                    {/* SUSPENDED */}
                    <button
                      onClick={() => { setAuthorizationError(null); setShowActionModal('SUSPENDED'); }}
                      disabled={selectedIdentity.status === 'SUSPENDED'}
                      className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                        selectedIdentity.status === 'SUSPENDED'
                          ? 'opacity-40 bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed'
                          : 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/40 text-orange-300'
                      }`}
                    >
                      <strong className="block text-xs uppercase">[SUSPENDED]</strong>
                      <span className="text-[9px] text-neutral-400">Suspender temporariamente por instrução</span>
                    </button>

                    {/* UNDER_REVIEW */}
                    <button
                      onClick={() => { setAuthorizationError(null); setShowActionModal('UNDER_REVIEW'); }}
                      disabled={selectedIdentity.status === 'UNDER_REVIEW'}
                      className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                        selectedIdentity.status === 'UNDER_REVIEW'
                          ? 'opacity-40 bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed'
                          : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/40 text-purple-300'
                      }`}
                    >
                      <strong className="block text-xs uppercase">[UNDER_REVIEW]</strong>
                      <span className="text-[9px] text-neutral-400">Submeter a investigação técnica/AFIS</span>
                    </button>

                    {/* REVOKED */}
                    <button
                      onClick={() => { setAuthorizationError(null); setShowActionModal('REVOKED'); }}
                      disabled={selectedIdentity.status === 'REVOKED'}
                      className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                        selectedIdentity.status === 'REVOKED'
                          ? 'opacity-40 bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed'
                          : 'bg-rose-900/20 hover:bg-rose-900/40 border-rose-700/60 text-rose-300'
                      }`}
                    >
                      <strong className="block text-xs uppercase flex items-center gap-1">
                        [REVOKED] <Lock className="w-3 h-3 text-rose-400" />
                      </strong>
                      <span className="text-[9px] text-neutral-400">Revogar e anular por decisão superior</span>
                    </button>

                    {/* DECEASED */}
                    <button
                      onClick={() => { setAuthorizationError(null); setShowActionModal('DECEASED'); }}
                      disabled={selectedIdentity.status === 'DECEASED'}
                      className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                        selectedIdentity.status === 'DECEASED'
                          ? 'opacity-40 bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed'
                          : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <strong className="block text-xs uppercase flex items-center gap-1">
                        [DECEASED] <Lock className="w-3 h-3 text-neutral-400" />
                      </strong>
                      <span className="text-[9px] text-neutral-400">Averbar Assento de Óbito e encerrar</span>
                    </button>

                    {/* MERGED */}
                    <button
                      onClick={() => { setAuthorizationError(null); setShowActionModal('MERGED'); }}
                      disabled={selectedIdentity.status === 'MERGED'}
                      className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                        selectedIdentity.status === 'MERGED'
                          ? 'opacity-40 bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed'
                          : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/40 text-blue-300'
                      }`}
                    >
                      <strong className="block text-xs uppercase flex items-center gap-1">
                        [MERGED] <Lock className="w-3 h-3 text-blue-400" />
                      </strong>
                      <span className="text-[9px] text-neutral-400">Unificar registo duplicado no ID principal</span>
                    </button>

                    {/* REVOKE CREDENTIAL */}
                    <button
                      onClick={() => { setAuthorizationError(null); setShowActionModal('REVOKE_CREDENTIAL'); }}
                      className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-rose-500/40 text-rose-300 text-left font-mono"
                    >
                      <strong className="block text-xs uppercase">[REVOGAR CREDENCIAL PWA]</strong>
                      <span className="text-[9px] text-neutral-400">Invalidar token de autenticação mobile</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 07: EVENTOS DA IDENTIDADE (05.20) */}
            {inspectorTab === 'EVENTS' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">HISTÓRICO IMUTÁVEL DE EVENTOS DA IDENTIDADE</span>
                <div className="space-y-2 border-l-2 border-amber-500/40 pl-3">
                  {selectedIdentity.events.map((evt) => (
                    <div key={evt.id} className="text-xs space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300">{evt.time}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-700 text-white font-bold uppercase">{evt.type}</span>
                        <span className="text-[10px] text-neutral-500">por {evt.actor}</span>
                      </div>
                      <p className="text-[11px] font-sans text-neutral-300">{evt.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 08: AUDITORIA DE ACESSO (05.21) */}
            {inspectorTab === 'AUDIT' && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">LOG DE AUDITORIA DE ACESSO À IDENTIDADE</span>
                <div className="overflow-x-auto rounded-xl border border-neutral-800 text-[10px]">
                  <table className="w-full text-left font-mono">
                    <thead className="bg-neutral-900 text-neutral-400 uppercase">
                      <tr>
                        <th className="p-2">DATA/HORA</th>
                        <th className="p-2">OPERADOR</th>
                        <th className="p-2">FUNÇÃO</th>
                        <th className="p-2">AÇÃO</th>
                        <th className="p-2">RESULTADO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {selectedIdentity.auditLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td className="p-2 text-neutral-400">{log.time}</td>
                          <td className="p-2 font-bold text-white">{log.actor}</td>
                          <td className="p-2 text-amber-300">{log.role}</td>
                          <td className="p-2 text-neutral-300">{log.action}</td>
                          <td className="p-2 text-emerald-400 font-bold">{log.result}</td>
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

      {/* STATE ACTION CONFIRMATION MODAL */}
      {showActionModal && selectedIdentity && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-lg p-5 rounded-3xl bg-[#111217] border border-amber-500/50 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>MUDANÇA DE ESTADO DA IDENTIDADE (ABAC VERIFICATION)</span>
              </div>
              <button onClick={() => { setShowActionModal(null); setAuthorizationError(null); }} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-neutral-500">IDENTIDADE ALVO:</span>
                  <strong className="text-amber-300">{selectedIdentity.id} ({selectedIdentity.fullName})</strong>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-neutral-500">ESTADO ATUAL:</span>
                  <strong className="text-neutral-300 uppercase">{selectedIdentity.status}</strong>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-neutral-500">NOVO ESTADO SOLICITADO:</span>
                  <strong className="text-emerald-400 uppercase font-extrabold">{showActionModal}</strong>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-neutral-500">OPERADOR EXECUTANTE:</span>
                  <strong className="text-blue-300">{operator.fullName} ({operator.role})</strong>
                </div>
              </div>

              {/* ABAC AUTHORIZATION STATUS CHECK DISPLAY */}
              {(() => {
                const authCheck = checkOperatorStateAuthorization(showActionModal);
                return (
                  <div className={`p-2.5 rounded-xl border text-[10px] space-y-1 ${
                    authCheck.isAuthorized
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold uppercase">
                      {authCheck.isAuthorized ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>AUTORIZADO PELO SISTEMA ABAC ({operator.role})</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-rose-400" />
                          <span>REQUER PERFIL RESTRITO: {authCheck.requiredRole}</span>
                        </>
                      )}
                    </div>
                    <p className="font-sans text-[10px] text-neutral-300 leading-relaxed">
                      {authCheck.reason}
                    </p>
                  </div>
                );
              })()}

              {authorizationError && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[10px] font-bold space-y-1">
                  <p>{authorizationError}</p>
                  {onOpenReauth && (
                    <button
                      onClick={onOpenReauth}
                      className="mt-1 px-3 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] uppercase block"
                    >
                      AUTENTICAR COM FIDO2 / ELEVAR PRIVILÉGIOS &rarr;
                    </button>
                  )}
                </div>
              )}

              {/* IF TARGET IS MERGED, ASK FOR PRIMARY TARGET ID */}
              {showActionModal === 'MERGED' && (
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-bold block">
                    ID DA IDENTIDADE PRINCIPAL DE DESTINO (MERGE TARGET ID):
                  </label>
                  <input
                    type="text"
                    value={actionTargetMergedId}
                    onChange={(e) => setActionTargetMergedId(e.target.value)}
                    placeholder="Ex: ID-00000123"
                    className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-amber-300 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase font-bold block">
                  FUNDAMENTAÇÃO JURÍDICA / ADMINISTRATIVA OBRIGATÓRIA:
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Insira o número de Despacho, Sentença Judicial ou justificação regulamentar para o log de auditoria..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => { setShowActionModal(null); setAuthorizationError(null); }}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={handleExecuteStateAction}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs uppercase shadow-lg"
              >
                EXECUTAR ALTERAÇÃO & AUDITAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFLICT INVESTIGATION MODAL */}
      {selectedConflict && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-lg p-5 rounded-3xl bg-[#111217] border border-amber-500/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase">INVESTIGAÇÃO DE CONFLITO DE IDENTIDADE</span>
              <button onClick={() => setSelectedConflict(null)} className="text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div><span className="text-neutral-500">CONFLITO:</span> <strong className="text-rose-400">{selectedConflict.id}</strong></div>
              <div><span className="text-neutral-500">TIPO:</span> <strong className="text-white">{selectedConflict.type}</strong></div>
              <p className="p-2.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 font-sans">{selectedConflict.description}</p>
              <div><span className="text-neutral-500">ENVOLVIDOS:</span> <strong className="text-amber-300">{selectedConflict.identitiesInvolved.join(', ')}</strong></div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setSelectedConflict(null)} className="px-3 py-1.5 rounded-xl bg-neutral-900 text-neutral-300 text-xs font-bold uppercase">FECHAR</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
