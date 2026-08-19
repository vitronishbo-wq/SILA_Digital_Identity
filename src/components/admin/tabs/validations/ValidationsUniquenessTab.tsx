import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Users,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  RefreshCw,
  Send,
  Database,
  Building,
  UserCheck,
  KeyRound,
  ChevronRight,
  Scale,
  AlertCircle,
  Filter,
  Fingerprint,
} from 'lucide-react';
import {
  ValidationDossier,
  ValidationAuditEvent,
  UniquenessValidation,
  UniquenessEngineStatus,
  UniquenessResultType,
  UniquenessCandidate,
  UniquenessResolutionType,
} from '../../../../types/validations';

interface ValidationsUniquenessTabProps {
  dossiers: ValidationDossier[];
  activeDossierId: string;
  onSelectDossier: (dossierId: string) => void;
  onUpdateDossier: (updated: ValidationDossier) => void;
  onAddAuditEvent: (event: ValidationAuditEvent) => void;
  onNavigateToTab?: (tabKey: string) => void;
}

export const ValidationsUniquenessTab: React.FC<ValidationsUniquenessTabProps> = ({
  dossiers,
  activeDossierId,
  onSelectDossier,
  onUpdateDossier,
  onAddAuditEvent,
}) => {
  // Sub-vistas estritas do módulo 04
  const [activeSubView, setActiveSubView] = useState<
    '01_CONTEXTO' | '02_SEARCH' | '03_CANDIDATES' | '04_COMPARISON' | '05_RESOLUTION' | '06_AUDIT'
  >('01_CONTEXTO');

  // Operador autenticado no IAM
  const currentOperator = {
    operatorId: 'VAL-N1-0084',
    operatorName: 'Carlos Van-Dúnem',
    role: 'VALIDADOR_N1' as const,
    terminalId: 'TERM-VAL-LUA-01',
    organization: 'DNI_MINJUSDH' as const,
  };

  // Dossiê selecionado (somente leitura para metadados mestre)
  const dossier = dossiers.find((d) => d.dossierId === activeDossierId) || dossiers[0];

  // Candidato selecionado para comparação detalhada das evidências
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Estados dos Modais
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [supervisorPriority, setSupervisorPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('HIGH');
  const [supervisorReason, setSupervisorReason] = useState('');

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveType, setResolveType] = useState<UniquenessResolutionType>('CLEARED_UNIQUE');
  const [resolveNotes, setResolveNotes] = useState('');
  const [operatorPassword, setOperatorPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Estado transitório do motor
  const [isSearching, setIsSearching] = useState(false);

  // Extração estrita de UniquenessValidation a partir do ValidationDossier
  const uniq: UniquenessValidation = useMemo(() => {
    const raw = dossier.uniquenessValidation;

    let defaultCandidates: UniquenessCandidate[] = [];

    if (dossier.dossierId === 'DOS-2026-AGO-00194') {
      defaultCandidates = [
        {
          candidateId: 'CIT-AO-081190',
          citizenName: 'ANTONIO FRANCISCO KIALA JUNIOR',
          nationalIdNumber: '001889211BA012',
          birthDate: '1988-11-04',
          motherName: 'TERESA MANUELA KIALA',
          fatherName: 'FRANCISCO KIALA',
          birthPlace: 'BENGUELA / LOBITO',
          sourceEngine: 'ABIS_1N',
          matchType: 'MULTIMODAL',
          overallMatchDegree: 78.4,
          biometricScore: 61.5,
          biographicalScore: 95.0,
          documentScore: 80.0,
          matchingFields: ['BIRTH_DATE', 'MOTHER_NAME', 'FATHER_NAME', 'BIRTH_PLACE', 'GENDER'],
          contradictoryFields: ['FULL_NAME_SUFFIX', 'NATIONAL_ID_NUMBER', 'PHOTO_FACIAL_STRUCTURE'],
          discoveryEvidence: 'Cluster multimodal ABIS com colisão dactilar (92%) e homonímia direta com sufixo JÚNIOR.',
          classification: 'STRONG_MATCH',
          requiresReview: true,
          status: 'PENDING_REVIEW',
          evidenceFields: [
            { field: 'Nome Completo', applicantValue: 'ANTONIO FRANCISCO KIALA', candidateValue: 'ANTONIO FRANCISCO KIALA JUNIOR', isMatch: false, isContradiction: true, evidenceSource: 'REGISTO_CIVIL', notes: 'Sufixo JUNIOR presente no candidato homónimo.' },
            { field: 'Data de Nascimento', applicantValue: '1988-11-04', candidateValue: '1988-11-04', isMatch: true, isContradiction: false, evidenceSource: 'REGISTO_CIVIL', notes: 'Datas rigorosamente coincidentes.' },
            { field: 'Filiação Materna', applicantValue: 'TERESA MANUELA KIALA', candidateValue: 'TERESA MANUELA KIALA', isMatch: true, isContradiction: false, evidenceSource: 'REGISTO_CIVIL', notes: 'Mesma mãe registada.' },
            { field: 'Filiação Paterna', applicantValue: 'FRANCISCO KIALA', candidateValue: 'FRANCISCO KIALA', isMatch: true, isContradiction: false, evidenceSource: 'REGISTO_CIVIL', notes: 'Mesmo pai registado.' },
            { field: 'Naturalidade', applicantValue: 'BENGUELA / LOBITO', candidateValue: 'BENGUELA / LOBITO', isMatch: true, isContradiction: false, evidenceSource: 'REGISTO_CIVIL', notes: 'Mesmo posto e conservatória.' },
            { field: 'BI Anterior / Registo', applicantValue: '001948211BA033', candidateValue: '001889211BA012', isMatch: false, isContradiction: true, evidenceSource: 'DNI_HISTORICO', notes: 'Número de bilhete diferente emitido em 2014.' },
            { field: 'Score Facial 1:N', applicantValue: 'Ref ATT-003', candidateValue: 'Ref Galeria 081190', isMatch: false, isContradiction: true, evidenceSource: 'ABIS_NATIONAL', notes: 'Score Facial 61.5% (Abaixo do limiar 85%).' },
            { field: 'Score AFIS Dactilar', applicantValue: '10 Dedos Rolados', candidateValue: 'Dedos D1/D2/D6/D7', isMatch: true, isContradiction: false, evidenceSource: 'ABIS_NATIONAL', notes: 'Score dactilar 92% com 80 minúcias coincidentes.' },
          ],
        },
        {
          candidateId: 'CIT-AO-077421',
          citizenName: 'ANTONIO FRANCISCO KIALA',
          nationalIdNumber: '003912001LA088',
          birthDate: '1975-02-18',
          motherName: 'ANA MARIA KIALA',
          fatherName: 'FRANCISCO KIALA',
          birthPlace: 'LUANDA / SAMBIZANGA',
          sourceEngine: 'CIVIL_REGISTRY_SEARCH',
          matchType: 'BIOGRAPHICAL',
          overallMatchDegree: 42.0,
          biometricScore: 12.0,
          biographicalScore: 68.0,
          documentScore: 40.0,
          matchingFields: ['FULL_NAME', 'FATHER_NAME'],
          contradictoryFields: ['BIRTH_DATE', 'MOTHER_NAME', 'BIRTH_PLACE', 'BIOMETRICS'],
          discoveryEvidence: 'Homonímia pura detetada na base de registo civil nacional sem vínculo biométrico.',
          classification: 'HOMONYM_PROBABLE',
          requiresReview: false,
          status: 'REVIEWED_CLEARED',
          evidenceFields: [
            { field: 'Nome Completo', applicantValue: 'ANTONIO FRANCISCO KIALA', candidateValue: 'ANTONIO FRANCISCO KIALA', isMatch: true, isContradiction: false, evidenceSource: 'REGISTO_CIVIL', notes: 'Homonímia estrita.' },
            { field: 'Data de Nascimento', applicantValue: '1988-11-04', candidateValue: '1975-02-18', isMatch: false, isContradiction: true, evidenceSource: 'REGISTO_CIVIL', notes: 'Divergência temporal de 13 anos.' },
            { field: 'Mãe', applicantValue: 'TERESA MANUELA KIALA', candidateValue: 'ANA MARIA KIALA', isMatch: false, isContradiction: true, evidenceSource: 'REGISTO_CIVIL', notes: 'Filiação distinta.' },
            { field: 'Biometria 1:N', applicantValue: 'Padrão 2026', candidateValue: 'Galeria 077421', isMatch: false, isContradiction: true, evidenceSource: 'ABIS_NATIONAL', notes: 'Score de colisão 12% (Inexistente).' },
          ],
        }
      ];
    } else if (dossier.dossierId === 'DOS-2026-AGO-00193') {
      defaultCandidates = [
        {
          candidateId: 'CIT-AO-049182',
          citizenName: 'MARIA ESPERANÇA NETO',
          nationalIdNumber: '002819231HA011',
          birthDate: '1999-12-05',
          motherName: 'JOANA PAULA NETO',
          fatherName: 'AUGUSTO NETO',
          birthPlace: 'HUAMBO / CAÁLA',
          sourceEngine: 'CIVIL_REGISTRY_SEARCH',
          matchType: 'BIOGRAPHICAL',
          overallMatchDegree: 51.0,
          biometricScore: 8.0,
          biographicalScore: 92.0,
          documentScore: 50.0,
          matchingFields: ['FULL_NAME', 'BIRTH_PLACE_PROVINCE'],
          contradictoryFields: ['BIRTH_DATE', 'MOTHER_NAME', 'FATHER_NAME', 'BIOMETRICS'],
          discoveryEvidence: 'Homonímia estrita identificada na base provincial do Huambo.',
          classification: 'HOMONYM_PROBABLE',
          requiresReview: false,
          status: 'REVIEWED_CLEARED',
          evidenceFields: [
            { field: 'Nome Completo', applicantValue: 'MARIA ESPERANÇA NETO', candidateValue: 'MARIA ESPERANÇA NETO', isMatch: true, isContradiction: false, evidenceSource: 'REGISTO_CIVIL', notes: 'Homonímia nominal exata.' },
            { field: 'Data de Nascimento', applicantValue: '2007-08-14', candidateValue: '1999-12-05', isMatch: false, isContradiction: true, evidenceSource: 'REGISTO_CIVIL', notes: 'Divergência de 8 anos.' },
            { field: 'Filiação', applicantValue: 'Teresa Neto / João Neto', candidateValue: 'Joana Paula Neto / Augusto Neto', isMatch: false, isContradiction: true, evidenceSource: 'REGISTO_CIVIL', notes: 'Pais totalmente diferentes.' },
            { field: 'Biometria 1:N ABIS', applicantValue: 'Template Huambo 2026', candidateValue: 'Galeria 049182', isMatch: false, isContradiction: true, evidenceSource: 'ABIS_NATIONAL', notes: 'Confronto negativo no ABIS.' },
          ],
        }
      ];
    } else if (dossier.dossierId === 'DOS-2026-AGO-00196') {
      defaultCandidates = [
        {
          candidateId: 'CIT-AO-098812_LEGACY',
          citizenName: 'ANA PAULA CHIVELA DA SILVA',
          nationalIdNumber: '006129841BE019',
          birthDate: '1984-07-22',
          motherName: 'MARGARIDA CHIVELA',
          fatherName: 'MANUEL CHIVELA',
          birthPlace: 'BENGUELA / BENGUELA',
          sourceEngine: 'DOC_CROSS_MATCH',
          matchType: 'DOCUMENTAL',
          overallMatchDegree: 65.0,
          biometricScore: 92.0,
          biographicalScore: 70.0,
          documentScore: 85.0,
          matchingFields: ['NATIONAL_ID_NUMBER', 'BIRTH_DATE', 'MOTHER_NAME', 'FATHER_NAME', 'BIOMETRICS'],
          contradictoryFields: ['SURNAME_ADDITION_MARRIAGE'],
          discoveryEvidence: 'Registo histórico do BI anterior coincidente com alteração de apelido por casamento.',
          classification: 'POSSIBLE_MATCH',
          requiresReview: true,
          status: 'PENDING_REVIEW',
          evidenceFields: [
            { field: 'Nome no Registo', applicantValue: 'ANA PAULA CHIVELA', candidateValue: 'ANA PAULA CHIVELA DA SILVA', isMatch: false, isContradiction: true, evidenceSource: 'REGISTO_CIVIL', notes: 'Adição de apelido marital requer averbação.' },
            { field: 'Nº BI Anterior', applicantValue: '006129841BE019', candidateValue: '006129841BE019', isMatch: true, isContradiction: false, evidenceSource: 'DNI_HISTORICO', notes: 'Mesmo bilhete histórico.' },
            { field: 'Biometria 1:1', applicantValue: 'Template Benguela', candidateValue: 'Histórico 2016', isMatch: true, isContradiction: false, evidenceSource: 'ABIS_NATIONAL', notes: 'Biometria 92% coincidente (Mesma pessoa).' },
          ],
        }
      ];
    }

    const candidates = raw?.candidates && raw.candidates.length > 0 ? raw.candidates : defaultCandidates;

    let initialStatus: UniquenessEngineStatus = 'NO_MATCH';
    if (raw?.status) {
      if (raw.status === 'UNIQUE') initialStatus = 'NO_MATCH';
      else if (raw.status === 'SUSPECT_DUPLICATE') initialStatus = 'CANDIDATES_FOUND';
      else initialStatus = raw.status as UniquenessEngineStatus;
    } else if (candidates.length > 0) {
      initialStatus = 'CANDIDATES_FOUND';
    }

    let initialResult: UniquenessResultType = 'NO_MATCH';
    if (raw?.result) {
      initialResult = raw.result;
    } else if (candidates.length > 0) {
      initialResult = candidates[0].classification === 'STRONG_MATCH' ? 'STRONG_MATCH' : 'POSSIBLE_MATCH';
    }

    return {
      validationId: raw?.validationId || `VAL-UNIQ-2026-${dossier.dossierId.replace(/[^0-9]/g, '')}`,
      dossierId: dossier.dossierId,
      processId: dossier.processId,
      citizenId: dossier.citizenId,
      status: initialStatus,
      result: initialResult,
      searchReference: raw?.searchReference || `SRCH_UNIQ_${dossier.dossierId.substring(4)}`,
      searchScope: raw?.searchScope || {
        civilRegistryNational: true,
        abisNationalGallery: true,
        historicalDniDatabase: true,
        vitalEventsRegisters: true,
        lastSearchExecution: raw?.evaluatedAt || '2026-08-15T09:15:23Z',
      },
      candidateCount: raw?.candidateCount ?? candidates.length,
      candidates: candidates,
      matchType: raw?.matchType || (candidates.length > 0 ? candidates[0].matchType : 'NONE'),
      confidence: raw?.confidence ?? (candidates.length > 0 ? 88 : 99),
      resolution: raw?.resolution || (candidates.length > 0 ? 'PENDING' : 'CLEARED_UNIQUE'),
      resolutionNotes: raw?.resolutionNotes || raw?.identityCollisionNotes || '',
      reviewRequired: raw?.reviewRequired ?? (candidates.length > 0),
      assignedReviewer: raw?.assignedReviewer || dossier.assignedValidatorId,
      assignedReviewerName: raw?.assignedReviewerName || dossier.assignedValidatorName,
      assignedReviewerRole: raw?.assignedReviewerRole || 'VALIDADOR_N1',
      resolvedAt: raw?.resolvedAt,
      engineCode: 'IDENTITY_UNIQUENESS_PROBE',
      collisionRiskLevel: raw?.collisionRiskLevel || (candidates.length > 0 ? 'CRITICAL' : 'LOW'),
      identityCollisionNotes: raw?.identityCollisionNotes || (candidates.length > 0 ? 'Colisão potencial identificada no cruzamento de dados.' : 'Sem colisões detetadas.'),
      duplicateCitizenId: raw?.duplicateCitizenId || (candidates[0]?.candidateId),
      duplicateCitizenName: raw?.duplicateCitizenName || (candidates[0]?.citizenName),
      evaluatedAt: raw?.evaluatedAt || new Date().toISOString(),
      previousHash: raw?.previousHash || dossier.previousHash,
      currentHash: raw?.currentHash || dossier.currentHash,
      digitalSignature: raw?.digitalSignature || `SIG_UNIQ_${dossier.dossierId.substring(4)}`,
      auditChainRef: raw?.auditChainRef || dossier.auditChainRef,
    };
  }, [dossier]);

  // Candidato ativo para o sub-módulo 04_COMPARISON
  const activeCandidate = useMemo(() => {
    if (selectedCandidateId) {
      return uniq.candidates?.find((c) => c.candidateId === selectedCandidateId) || uniq.candidates?.[0] || null;
    }
    return uniq.candidates?.[0] || null;
  }, [uniq.candidates, selectedCandidateId]);

  // COMANDO: RUN_UNIQUENESS_SEARCH
  const canRunSearch = uniq.status !== 'SEARCHING';

  const handleRunSearch = () => {
    if (!canRunSearch) return;

    setIsSearching(true);
    const searchingUniq: UniquenessValidation = {
      ...uniq,
      status: 'SEARCHING',
    };
    onUpdateDossier({ ...dossier, uniquenessValidation: searchingUniq });

    setTimeout(() => {
      setIsSearching(false);
      const isSuspect = dossier.dossierId === 'DOS-2026-AGO-00194';
      const isHomonym = dossier.dossierId === 'DOS-2026-AGO-00193';
      const isUpdate = dossier.dossierId === 'DOS-2026-AGO-00196';

      let nextStatus: UniquenessEngineStatus = 'NO_MATCH';
      let nextResult: UniquenessResultType = 'NO_MATCH';

      if (isSuspect || isHomonym || isUpdate) {
        nextStatus = 'CANDIDATES_FOUND';
        nextResult = isSuspect ? 'STRONG_MATCH' : 'POSSIBLE_MATCH';
      }

      const updatedUniq: UniquenessValidation = {
        ...uniq,
        status: nextStatus,
        result: nextResult,
        searchScope: {
          ...uniq.searchScope!,
          lastSearchExecution: new Date().toISOString(),
        },
        evaluatedAt: new Date().toISOString(),
        currentHash: `hash_uniq_${Math.random().toString(36).substring(2, 12)}`,
        digitalSignature: `SIG_UNIQ_SRCH_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      };

      // Atualiza exclusivamente a propriedade uniquenessValidation (ValidationDossier.status intocado)
      const updatedDossier: ValidationDossier = {
        ...dossier,
        uniquenessValidation: updatedUniq,
        updatedAt: new Date().toISOString(),
      };

      onUpdateDossier(updatedDossier);

      // Registo de auditoria imutável completo (SILA Chain)
      const auditEvt: ValidationAuditEvent = {
        eventId: `EVT_UNIQ_SRCH_${Date.now()}`,
        dossierId: dossier.dossierId,
        operatorId: currentOperator.operatorId,
        operatorRole: currentOperator.role,
        command: 'RUN_UNIQUENESS_SEARCH',
        previousState: dossier.status,
        newState: dossier.status,
        reason: `Pesquisa multimodal de unicidade concluída. Estado do motor: ${nextStatus}. Candidatos: ${updatedUniq.candidateCount}.`,
        timestamp: new Date().toISOString(),
        previousHash: uniq.currentHash || dossier.currentHash,
        currentHash: updatedUniq.currentHash,
        digitalSignature: updatedUniq.digitalSignature,
        auditChainRef: uniq.auditChainRef || dossier.auditChainRef,
        terminalId: currentOperator.terminalId,
        payloadSummary: `Status: ${nextStatus}. Escopo: ABIS 1:N, SIRGC, DNI Histórico, Factos Vitais. Candidatos: ${updatedUniq.candidateCount}.`,
        silaGlobalAuditRef: `SILA_UNIQ_SRCH_${Date.now()}`,
      };
      onAddAuditEvent(auditEvt);
    }, 600);
  };

  // COMANDO: COMPARE_CANDIDATE (Transição obrigatória para UNDER_REVIEW)
  const handleSelectCandidateForComparison = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setActiveSubView('04_COMPARISON');

    if (uniq.status === 'CANDIDATES_FOUND') {
      const updatedUniq: UniquenessValidation = {
        ...uniq,
        status: 'UNDER_REVIEW',
        currentHash: `hash_uniq_rev_${Math.random().toString(36).substring(2, 12)}`,
      };
      onUpdateDossier({ ...dossier, uniquenessValidation: updatedUniq });

      const auditEvt: ValidationAuditEvent = {
        eventId: `EVT_UNIQ_COMP_${Date.now()}`,
        dossierId: dossier.dossierId,
        operatorId: currentOperator.operatorId,
        operatorRole: currentOperator.role,
        command: 'COMPARE_CANDIDATE',
        previousState: dossier.status,
        newState: dossier.status,
        reason: `Abertura de análise pericial comparativa para o candidato ${candidateId}. Transição para UNDER_REVIEW.`,
        timestamp: new Date().toISOString(),
        previousHash: uniq.currentHash || dossier.currentHash,
        currentHash: updatedUniq.currentHash,
        digitalSignature: updatedUniq.digitalSignature || `SIG_COMP_${candidateId}`,
        auditChainRef: uniq.auditChainRef || dossier.auditChainRef,
        terminalId: currentOperator.terminalId,
        payloadSummary: `Comparação detalhada do candidato ${candidateId}. Separação de coincidências e contradições.`,
        silaGlobalAuditRef: `SILA_UNIQ_COMP_${Date.now()}`,
      };
      onAddAuditEvent(auditEvt);
    }
  };

  // COMANDO: REQUEST_SUPERVISOR
  const canRequestSupervisor =
    uniq.status === 'CANDIDATES_FOUND' ||
    uniq.status === 'UNDER_REVIEW' ||
    uniq.result === 'POSSIBLE_MATCH' ||
    uniq.result === 'STRONG_MATCH';

  const handleEscalateToSupervisor = () => {
    if (!supervisorReason.trim()) return;

    const updatedUniq: UniquenessValidation = {
      ...uniq,
      status: 'SUPERVISOR_REVIEW',
      reviewRequired: true,
      resolution: 'SUPERVISOR_REFERRED',
      resolutionNotes: `[ENCAMINHADO N3 - ${supervisorPriority}] ${supervisorReason}`,
      resolvedAt: new Date().toISOString(),
      assignedReviewerRole: 'SUPERVISOR_N3',
      currentHash: `hash_uniq_sup_${Math.random().toString(36).substring(2, 12)}`,
      digitalSignature: `SIG_UNIQ_SUP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    const updatedDossier: ValidationDossier = {
      ...dossier,
      uniquenessValidation: updatedUniq,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDossier(updatedDossier);

    const auditEvt: ValidationAuditEvent = {
      eventId: `EVT_UNIQ_ESCALATE_${Date.now()}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'REQUEST_SUPERVISOR',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Colisão de identidade encaminhada para Mesa Supervisora Biográfica/Antifraude (Prioridade: ${supervisorPriority}). Parecer: ${supervisorReason}`,
      timestamp: new Date().toISOString(),
      previousHash: uniq.currentHash || dossier.currentHash,
      currentHash: updatedUniq.currentHash,
      digitalSignature: updatedUniq.digitalSignature,
      auditChainRef: uniq.auditChainRef || dossier.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Encaminhamento de colisão: ${uniq.duplicateCitizenId || 'N/A'}. Prioridade: ${supervisorPriority}. Motivo: ${supervisorReason}`,
      silaGlobalAuditRef: `SILA_UNIQ_SUP_${Date.now()}`,
    };
    onAddAuditEvent(auditEvt);

    setIsSupervisorModalOpen(false);
    setSupervisorReason('');
  };

  // COMANDO: RESOLVE
  const canOpenResolveModal =
    uniq.status === 'NO_MATCH' ||
    uniq.status === 'UNDER_REVIEW' ||
    uniq.status === 'SUPERVISOR_REVIEW' ||
    uniq.status === 'RESOLVED';

  const handleResolveUniqueness = () => {
    if (!operatorPassword.trim()) {
      setAuthError('Autenticação forte obrigatória: introduza a senha IAM do operador.');
      return;
    }
    if (operatorPassword !== '123456' && operatorPassword.length < 4) {
      setAuthError('Senha de operador inválida para assinatura criptográfica.');
      return;
    }

    // Trava RBAC: N1 não pode homologar fraude nem fusão de duplicidade definitiva
    if (
      currentOperator.role === 'VALIDADOR_N1' &&
      (resolveType === 'CONFIRMED_DUPLICATE_MERGE' || resolveType === 'SUSPECT_FRAUD_ESCALATED')
    ) {
      setAuthError(
        'Regra Institucional: Operador N1 não possui autoridade para declarar fraude ou fundir registos. Encaminhe para a Mesa Supervisora (N3).'
      );
      return;
    }

    // Trava de Alçada: Casos com Forte Correspondência não podem ser limpos por N1 sem revisão supervisora
    if (
      currentOperator.role === 'VALIDADOR_N1' &&
      uniq.result === 'STRONG_MATCH' &&
      resolveType === 'CLEARED_UNIQUE'
    ) {
      setAuthError(
        'Trava de Segurança: Casos com Forte Correspondência (STRONG_MATCH) não podem ser limpos por operador N1. É obrigatório o encaminhamento para Supervisão N3.'
      );
      return;
    }

    const nextStatus: UniquenessEngineStatus =
      resolveType === 'SUPERVISOR_REFERRED' ? 'SUPERVISOR_REVIEW' : 'RESOLVED';

    const updatedUniq: UniquenessValidation = {
      ...uniq,
      status: nextStatus,
      resolution: resolveType,
      resolutionNotes: resolveNotes || `Parecer técnico homologado como: ${resolveType}`,
      reviewRequired: false,
      resolvedAt: new Date().toISOString(),
      assignedReviewer: currentOperator.operatorId,
      assignedReviewerName: currentOperator.operatorName,
      assignedReviewerRole: currentOperator.role,
      currentHash: `hash_uniq_res_${Math.random().toString(36).substring(2, 12)}`,
      digitalSignature: `SIG_UNIQ_RESOLVED_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    const updatedDossier: ValidationDossier = {
      ...dossier,
      uniquenessValidation: updatedUniq,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDossier(updatedDossier);

    const auditEvt: ValidationAuditEvent = {
      eventId: `EVT_UNIQ_RESOLVE_${Date.now()}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'RESOLVE',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Resolução de unicidade registada com autenticação forte. Parecer: ${resolveType}. Notas: ${resolveNotes}`,
      timestamp: new Date().toISOString(),
      previousHash: uniq.currentHash || dossier.currentHash,
      currentHash: updatedUniq.currentHash,
      digitalSignature: updatedUniq.digitalSignature,
      auditChainRef: uniq.auditChainRef || dossier.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Resolução Unicidade: ${resolveType}. Operador: ${currentOperator.operatorName} (${currentOperator.role}). Hash: ${updatedUniq.currentHash}`,
      silaGlobalAuditRef: `SILA_UNIQ_RES_${Date.now()}`,
    };
    onAddAuditEvent(auditEvt);

    setIsResolveModalOpen(false);
    setResolveNotes('');
    setOperatorPassword('');
    setAuthError(null);
  };

  return (
    <div className="space-y-3 font-mono text-[9px]">
      {/* =========================================================================
          CABEÇALHO DE COMANDO & REGRA CRÍTICA INSTITUCIONAL
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold tracking-wider">
                  04 — VALIDAÇÃO DE UNICIDADE & DUPLICIDADE (ANTIFRAUDE NACIONAL)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[8px] font-bold">
                  SILA v2026.1
                </span>
              </div>
              <div className="text-neutral-500 text-[8px]">
                Cruzamento Multimodal: Registo Civil Nacional • ABIS 1:N (18M) • Base Histórica DNI • Grafos de Filiação
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-lg">
              <span className="text-neutral-500 text-[8px]">STATUS:</span>
              <span
                className={`font-black uppercase px-1.5 py-0.5 rounded ${
                  uniq.status === 'NO_MATCH' || uniq.status === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : uniq.status === 'CANDIDATES_FOUND' || uniq.status === 'UNDER_REVIEW' || uniq.status === 'SUPERVISOR_REVIEW'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {uniq.status}
              </span>
            </div>

            <button
              onClick={handleRunSearch}
              disabled={isSearching || !canRunSearch}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 font-bold border border-neutral-700 flex items-center gap-1 transition"
              title="Re-executar varredura nos motores"
            >
              <RefreshCw className={`w-3 h-3 ${isSearching ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isSearching ? 'PESQUISANDO...' : 'RE-PESQUISAR'}</span>
            </button>

            {canRequestSupervisor && (
              <button
                onClick={() => setIsSupervisorModalOpen(true)}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1 transition"
              >
                <Send className="w-3 h-3" />
                <span>ENCAMINHAR SUPERVISÃO (N3)</span>
              </button>
            )}

            <button
              onClick={() => {
                if (uniq.status === 'CANDIDATES_FOUND') {
                  const updatedUniq: UniquenessValidation = { ...uniq, status: 'UNDER_REVIEW' };
                  onUpdateDossier({ ...dossier, uniquenessValidation: updatedUniq });
                }
                setIsResolveModalOpen(true);
              }}
              disabled={!canOpenResolveModal && uniq.status !== 'CANDIDATES_FOUND'}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-neutral-950 font-black uppercase flex items-center gap-1 transition shadow-sm"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>RESOLVER UNICIDADE</span>
            </button>
          </div>
        </div>

        {/* REGRA INSTITUCIONAL CRÍTICA VINCULATIVA */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-2 flex items-center justify-between text-amber-300/90 text-[8px]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>REGRA INSTITUCIONAL VINCULATIVA:</strong>{' '}
              <span className="text-amber-200 font-bold">DUPLICATE_CANDIDATE ≠ FRAUD</span> e{' '}
              <span className="text-amber-200 font-bold">HOMONYM ≠ DUPLICATE</span>. Operadores N1 não podem rejeitar processos por suspeita nem imputar dolo antes da deliberação da Mesa de Supervisão.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 font-mono text-[7.5px] border border-neutral-800">
            MINJUSDH / DNIC ART. 29º
          </span>
        </div>

        {/* BARRA DE SELEÇÃO DE DOSSIÊ ATIVO */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-neutral-500 uppercase font-bold shrink-0 text-[8px] flex items-center gap-1">
            <Filter className="w-2.5 h-2.5" />
            FILA DE CASOS:
          </span>
          {dossiers.map((d) => {
            const hasCand = (d.uniquenessValidation?.candidates?.length || 0) > 0 || d.dossierId === 'DOS-2026-AGO-00194';
            const isSelected = d.dossierId === dossier.dossierId;
            return (
              <button
                key={d.dossierId}
                onClick={() => {
                  onSelectDossier(d.dossierId);
                  setSelectedCandidateId(null);
                }}
                className={`px-2 py-1 rounded border text-left shrink-0 transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hasCand ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="font-mono">{d.dossierId}</span>
                <span className="text-neutral-500 max-w-[100px] truncate">{d.citizenName}</span>
                {hasCand && (
                  <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[7px] font-bold">
                    COLISÃO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* NAVEGAÇÃO INTERNA SUB-TABS DENSAS */}
        <div className="flex items-center gap-1 border-b border-neutral-800 pt-1">
          {[
            { id: '01_CONTEXTO', label: '01. CONTEXTO & DADOS DE ENTRADA', icon: FileText },
            { id: '02_SEARCH', label: '02. ESCOPO DE PESQUISA & MOTORES', icon: Search },
            { id: '03_CANDIDATES', label: `03. CANDIDATOS DETETADOS (${uniq.candidateCount})`, icon: Users },
            { id: '04_COMPARISON', label: '04. COMPARATIVO DETALHADO (EVIDÊNCIAS)', icon: GitCompare },
            { id: '05_RESOLUTION', label: '05. PARECER & RESOLUÇÃO TÉCNICA', icon: Scale },
            { id: '06_AUDIT', label: '06. CUSTÓDIA SILA & AUDITORIA', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubView(tab.id as any)}
                className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 border-t border-x transition ${
                  isActive
                    ? 'bg-neutral-900 border-neutral-700 text-amber-400 border-b-neutral-900'
                    : 'bg-neutral-950/40 border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB 01: CONTEXTO E DADOS DE ENTRADA
         ========================================================================= */}
      {activeSubView === '01_CONTEXTO' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">CIDADÃO REQUERENTE</div>
              <div className="text-sm font-black text-white truncate mt-0.5">{dossier.citizenName}</div>
              <div className="text-neutral-400 text-[8px] mt-1 font-mono">
                ID: {dossier.citizenId} • BI: {dossier.nationalIdNumber || 'N/A'}
              </div>
            </div>

            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">STATUS DO CONFRONTO BIOGRÁFICO (02)</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[8px] uppercase ${
                    dossier.biographicalValidation.status === 'MATCH' || dossier.biographicalValidation.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {dossier.biographicalValidation.status}
                </span>
                <span className="text-neutral-400 text-[8px]">
                  Confiança: {dossier.biographicalValidation.confidence}%
                </span>
              </div>
              <div className="text-neutral-500 text-[8px] mt-1 truncate">
                Assento: {dossier.biographicalValidation.civilRecordNumber || 'ASSENTO-OFICIAL'}
              </div>
            </div>

            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">STATUS DO GATEWAY BIOMÉTRICO (03)</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[8px] uppercase ${
                    dossier.biometricValidation.status === 'CONFIRMED_RESULT' || dossier.biometricValidation.status === 'RESULT_READY'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {dossier.biometricValidation.status}
                </span>
                <span className="text-neutral-400 text-[8px]">
                  Face: {dossier.biometricValidation.faceMatchScore}% • AFIS: {dossier.biometricValidation.fingerprintsMatchScore}%
                </span>
              </div>
              <div className="text-neutral-500 text-[8px] mt-1 truncate">
                Motor: {dossier.biometricValidation.engineCode}
              </div>
            </div>

            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">NÍVEL DE RISCO DE COLISÃO</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                    uniq.collisionRiskLevel === 'LOW'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : uniq.collisionRiskLevel === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  RISCO: {uniq.collisionRiskLevel}
                </span>
                <span className="text-neutral-400 text-[8px]">Candidatos: {uniq.candidateCount}</span>
              </div>
              <div className="text-neutral-500 text-[8px] mt-1 truncate">
                Resolução Atual: {uniq.resolution}
              </div>
            </div>
          </div>

          {/* VETORES ENVIADOS PARA VARREDURA MULTIMODAL */}
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-neutral-200 font-bold text-[9px]">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>VETORES DE IDENTIFICAÇÃO ENVIADOS PARA VARREDURA MULTIMODAL</span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                ORIGEM: Módulo 02 (Registo Civil) + Módulo 03 (Galeria Biométrica ISO 19794)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-2 space-y-1.5">
                <div className="text-amber-400/90 font-bold text-[8px] flex items-center gap-1 border-b border-neutral-800 pb-1">
                  <UserCheck className="w-3 h-3" />
                  <span>VETOR BIOGRÁFICO (CANÓNICO)</span>
                </div>
                <div className="space-y-1 text-[8.5px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Nome:</span>
                    <span className="text-white font-bold">{dossier.citizenName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Nascimento:</span>
                    <span className="text-neutral-300">
                      {dossier.biographicalValidation.fieldComparisons.find((f) => f.fieldCode === 'BIRTH_DATE')?.officialValue || '1988-11-04'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Filiação Pai:</span>
                    <span className="text-neutral-300 truncate max-w-[140px]">
                      {dossier.biographicalValidation.fieldComparisons.find((f) => f.fieldCode === 'FATHER_NAME')?.officialValue || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Filiação Mãe:</span>
                    <span className="text-neutral-300 truncate max-w-[140px]">
                      {dossier.biographicalValidation.fieldComparisons.find((f) => f.fieldCode === 'MOTHER_NAME')?.officialValue || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-2 space-y-1.5">
                <div className="text-cyan-400/90 font-bold text-[8px] flex items-center gap-1 border-b border-neutral-800 pb-1">
                  <Fingerprint className="w-3 h-3" />
                  <span>VETOR BIOMÉTRICO (TEMPLATES ABIS)</span>
                </div>
                <div className="space-y-1 text-[8.5px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Score Facial 1:1:</span>
                    <span className="text-white font-bold">{dossier.biometricValidation.faceMatchScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Score AFIS Dactilar:</span>
                    <span className="text-white font-bold">{dossier.biometricValidation.fingerprintsMatchScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Minúcias ISO 19794-2:</span>
                    <span className="text-cyan-400">{dossier.biometricValidation.minutiaeCount} pontos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Ref Template Galeria:</span>
                    <span className="text-neutral-400 font-mono text-[7.5px] truncate max-w-[120px]">
                      {dossier.biometricValidation.auditChainRef}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-2 space-y-1.5">
                <div className="text-emerald-400/90 font-bold text-[8px] flex items-center gap-1 border-b border-neutral-800 pb-1">
                  <Building className="w-3 h-3" />
                  <span>VETOR DOCUMENTAL & HISTÓRICO</span>
                </div>
                <div className="space-y-1 text-[8.5px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">BI Anterior:</span>
                    <span className="text-white font-mono">{dossier.nationalIdNumber || 'PRIMEIRA EMISSÃO'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Assento Nascimento:</span>
                    <span className="text-neutral-300 font-mono">{dossier.biographicalValidation.civilRecordNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Posto Origem:</span>
                    <span className="text-neutral-400 truncate max-w-[130px]">{dossier.servicePointName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">DPA Versão:</span>
                    <span className="text-neutral-400">{dossier.territoryVersion}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 02: ESCOPO DE PESQUISA & MOTORES
         ========================================================================= */}
      {activeSubView === '02_SEARCH' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div>
                <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>ESCOPO DE BUSCA NACIONAL MULTI-BASE</span>
                </div>
                <div className="text-neutral-500 text-[8px]">
                  Configuração de sondagem federada em tempo real sobre os 4 repositórios soberanos
                </div>
              </div>
              <div className="text-neutral-400 text-[8px]">
                Última Execução: <span className="text-white font-bold">{uniq.searchScope?.lastSearchExecution || '2026-08-15T09:15:23Z'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-2">
                <div className="text-neutral-300 font-bold text-[8.5px] border-b border-neutral-800/80 pb-1 flex items-center justify-between">
                  <span>1. BASE NACIONAL DE REGISTO CIVIL (SIRGC)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[7.5px] font-bold">ATIVO</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[8px]">
                  <div className="bg-neutral-900 p-1.5 rounded border border-neutral-800">
                    <div className="text-neutral-500">ALGORITMO</div>
                    <div className="text-white font-bold">Double Metaphone AO</div>
                  </div>
                  <div className="bg-neutral-900 p-1.5 rounded border border-neutral-800">
                    <div className="text-neutral-500">LIMIAR HOMONÍMIA</div>
                    <div className="text-amber-300 font-bold">&gt;= 75% Similaridade</div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-2">
                <div className="text-neutral-300 font-bold text-[8.5px] border-b border-neutral-800/80 pb-1 flex items-center justify-between">
                  <span>2. GALERIA ABIS 1:N NACIONAL (FACIAL + DACTILAR)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[7.5px] font-bold">ATIVO</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[8px]">
                  <div className="bg-neutral-900 p-1.5 rounded border border-neutral-800">
                    <div className="text-neutral-500">MOTOR ABIS</div>
                    <div className="text-white font-bold">AFIS/ABIS v5.1 Cluster</div>
                  </div>
                  <div className="bg-neutral-900 p-1.5 rounded border border-neutral-800">
                    <div className="text-neutral-500">LIMIAR ALERTA 1:N</div>
                    <div className="text-amber-300 font-bold">&gt;= 75.0% Multimodal</div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-2">
                <div className="text-neutral-300 font-bold text-[8.5px] border-b border-neutral-800/80 pb-1 flex items-center justify-between">
                  <span>3. BASE HISTÓRICA DE BILHETES DE IDENTIDADE (DNI)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[7.5px] font-bold">ATIVO</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[8px]">
                  <div className="bg-neutral-900 p-1.5 rounded border border-neutral-800">
                    <div className="text-neutral-500">REPOSITÓRIO</div>
                    <div className="text-white font-bold">DNI Master Index (1975-2026)</div>
                  </div>
                  <div className="bg-neutral-900 p-1.5 rounded border border-neutral-800">
                    <div className="text-neutral-500">INTEGRIDADE HASH</div>
                    <div className="text-emerald-400 font-bold">Verificado ICP-AO</div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-2">
                <div className="text-neutral-300 font-bold text-[8.5px] border-b border-neutral-800/80 pb-1 flex items-center justify-between">
                  <span>4. REGISTOS DE FACTOS VITAIS (ÓBITOS & EMANCIPAÇÕES)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[7.5px] font-bold">ATIVO</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[8px]">
                  <div className="bg-neutral-900 p-1.5 rounded border border-neutral-800">
                    <div className="text-neutral-500">FLAG ÓBITO</div>
                    <div className="text-emerald-400 font-bold">NÃO REGISTADO (VIVO)</div>
                  </div>
                  <div className="bg-neutral-900 p-1.5 rounded border border-neutral-800">
                    <div className="text-neutral-500">CONFIANÇA PROBE</div>
                    <div className="text-white font-bold">100% Sincronizado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 03: CANDIDATOS DETETADOS
         ========================================================================= */}
      {activeSubView === '03_CANDIDATES' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-neutral-200 font-bold text-[9px]">
                  CANDIDATOS ENCONTRADOS NA VARREDURA ({uniq.candidateCount})
                </span>
              </div>
              <div className="text-neutral-500 text-[8px]">
                Clique num candidato para abrir o comparativo detalhado de evidências e transitar para UNDER_REVIEW
              </div>
            </div>

            {uniq.candidates?.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950/40 rounded-lg border border-neutral-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-neutral-200 font-bold text-sm">Nenhuma Colisão de Identidade Encontrada</div>
                <div className="inline-block px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[8px] font-bold">
                  RESULTADO: NO_MATCH • UNICIDADE ATESTADA
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {uniq.candidates?.map((cand, idx) => {
                  const isSelected = activeCandidate?.candidateId === cand.candidateId;
                  return (
                    <div
                      key={cand.candidateId}
                      onClick={() => handleSelectCandidateForComparison(cand.candidateId)}
                      className={`p-3 rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center font-bold text-[8px] text-amber-400">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-white font-black text-xs flex items-center gap-2">
                              <span>{cand.citizenName}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold ${
                                  cand.classification === 'STRONG_MATCH'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : cand.classification === 'HOMONYM_PROBABLE'
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {cand.classification}
                              </span>
                            </div>
                            <div className="text-neutral-500 text-[8px]">
                              ID: {cand.candidateId} • BI: {cand.nationalIdNumber || 'N/A'} • Nasc: {cand.birthDate || 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-[7.5px] text-neutral-500">GRAU DE CORRESPONDÊNCIA</div>
                            <div className="text-sm font-black text-amber-400">{cand.overallMatchDegree}%</div>
                          </div>
                          <div className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800 text-[8px] text-neutral-300">
                            <span>MOTOR: </span>
                            <span className="font-bold text-white">{cand.sourceEngine}</span>
                          </div>
                          <button className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold border border-amber-500/30 flex items-center gap-1 text-[8px]">
                            <span>COMPARAR EVIDÊNCIAS</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-[8px]">
                        <div className="bg-neutral-900/60 p-1.5 rounded border border-neutral-800/80">
                          <span className="text-emerald-400 font-bold">CAMPOS COINCIDENTES ({cand.matchingFields.length}): </span>
                          <span className="text-neutral-300">{cand.matchingFields.join(', ')}</span>
                        </div>
                        <div className="bg-neutral-900/60 p-1.5 rounded border border-neutral-800/80">
                          <span className="text-rose-400 font-bold">CONTRADIÇÕES ({cand.contradictoryFields.length}): </span>
                          <span className="text-neutral-300">{cand.contradictoryFields.join(', ')}</span>
                        </div>
                        <div className="bg-neutral-900/60 p-1.5 rounded border border-neutral-800/80 truncate">
                          <span className="text-neutral-400">EVIDÊNCIA: </span>
                          <span className="text-neutral-300">{cand.discoveryEvidence}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 04: COMPARATIVO DETALHADO (EVIDÊNCIAS LADO A LADO)
         ========================================================================= */}
      {activeSubView === '04_COMPARISON' && (
        <div className="space-y-3">
          {!activeCandidate ? (
            <div className="p-6 bg-[#0b0d11] border border-neutral-800 rounded-xl text-center text-neutral-500">
              Nenhum candidato selecionado.
            </div>
          ) : (
            <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                <div>
                  <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                    <GitCompare className="w-3.5 h-3.5 text-amber-400" />
                    <span>CONFRONTO PROBATÓRIO LADO A LADO</span>
                  </div>
                  <div className="text-neutral-500 text-[8px]">
                    Requerente <strong className="text-white">{dossier.citizenName}</strong> vs Candidato{' '}
                    <strong className="text-amber-300">{activeCandidate.citizenName}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 text-[8px] border border-neutral-800">
                    CLASSIFICAÇÃO: <strong className="text-amber-400">{activeCandidate.classification}</strong>
                  </span>
                  <button
                    onClick={() => setActiveSubView('05_RESOLUTION')}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black uppercase flex items-center gap-1"
                  >
                    <span>EMITIR PARECER DE RESOLUÇÃO</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* PAINEL COMPARATIVO TABELADO DENSE */}
              <div className="overflow-x-auto border border-neutral-800 rounded-lg">
                <table className="w-full text-left text-[8.5px] border-collapse">
                  <thead>
                    <tr className="bg-neutral-900/90 text-neutral-400 border-b border-neutral-800 uppercase font-bold text-[7.5px]">
                      <th className="p-2">CAMPO / VETOR</th>
                      <th className="p-2 bg-neutral-900/40">DADOS DO REQUERENTE (ATUAL)</th>
                      <th className="p-2 bg-amber-950/20 text-amber-300">DADOS DO CANDIDATO ENCONTRADO</th>
                      <th className="p-2 text-center">CONFORMIDADE</th>
                      <th className="p-2">FONTE PROBATÓRIA</th>
                      <th className="p-2">ANÁLISE EXPLICÁVEL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/60">
                    {activeCandidate.evidenceFields.map((ev, i) => (
                      <tr key={i} className="hover:bg-neutral-900/40 transition">
                        <td className="p-2 font-bold text-neutral-300">{ev.field}</td>
                        <td className="p-2 text-white font-mono">{ev.applicantValue}</td>
                        <td className="p-2 text-amber-200 font-mono font-bold bg-amber-950/10">
                          {ev.candidateValue}
                        </td>
                        <td className="p-2 text-center">
                          {ev.isMatch ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[7.5px] font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5" /> COINCIDENTE
                            </span>
                          ) : ev.isContradiction ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[7.5px] font-bold">
                              <AlertCircle className="w-2.5 h-2.5" /> DIVERGENTE
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[7.5px]">
                              NEUTRO
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-neutral-400 font-mono text-[7.5px]">{ev.evidenceSource}</td>
                        <td className="p-2 text-neutral-300 text-[8px]">{ev.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SÍNTESE DE CONTRADIÇÕES E COINCIDÊNCIAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-lg p-2.5 space-y-1">
                  <div className="text-emerald-400 font-bold text-[8.5px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ELEMENTOS COINCIDENTES</span>
                  </div>
                  <p className="text-neutral-300 text-[8px] leading-relaxed">
                    Coincidências verificadas em filiação, data de nascimento e traços dactilares.
                  </p>
                </div>

                <div className="bg-amber-950/10 border border-amber-500/20 rounded-lg p-2.5 space-y-1">
                  <div className="text-amber-400 font-bold text-[8.5px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>CONTRADIÇÕES IDENTIFICADAS</span>
                  </div>
                  <p className="text-neutral-300 text-[8px] leading-relaxed">
                    Divergência de score facial e sufixos nominais. A existência de contradições impede conclusão sumária de falsidade ideológica em N1.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 05: PARECER & RESOLUÇÃO TÉCNICA
         ========================================================================= */}
      {activeSubView === '05_RESOLUTION' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div>
                <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>PARECER TÉCNICO DE UNICIDADE & CONTROLO DE AUTORIDADE</span>
                </div>
                <div className="text-neutral-500 text-[8px]">
                  Emissão de resolução formal da análise de duplicidade (Exclusivo para UniquenessValidation)
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 text-[8px] border border-neutral-800">
                OPERADOR: {currentOperator.operatorName} ({currentOperator.role})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-400 text-[8px] uppercase">STATUS ATUAL DO MOTOR</div>
                <div className="text-base font-black text-amber-400">{uniq.status}</div>
                <div className="text-neutral-500 text-[8px]">Resultado: {uniq.result}</div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-400 text-[8px] uppercase">RESOLUÇÃO FORMAL</div>
                <div className="text-base font-black text-emerald-400">{uniq.resolution}</div>
                <div className="text-neutral-500 text-[8px]">
                  Homologado em: {uniq.resolvedAt ? new Date(uniq.resolvedAt).toLocaleDateString('pt-AO') : 'PENDENTE'}
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-400 text-[8px] uppercase">ANALISTA RESPONSÁVEL</div>
                <div className="text-base font-black text-white">{uniq.assignedReviewerName || currentOperator.operatorName}</div>
                <div className="text-neutral-500 text-[8px]">Função: {uniq.assignedReviewerRole || currentOperator.role}</div>
              </div>
            </div>

            {/* PARECER TÉCNICO FORMULADO */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
              <div className="text-neutral-300 font-bold text-[8.5px]">PARECER TÉCNICO REGISTADO NO PROCESSO:</div>
              <div className="p-2.5 rounded bg-neutral-900/80 border border-neutral-800 text-neutral-200 text-[8.5px] leading-relaxed">
                {uniq.resolutionNotes || uniq.identityCollisionNotes || 'Nenhuma nota de resolução registrada.'}
              </div>
            </div>

            {/* AÇÕES DE RESOLUÇÃO */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
              <div className="text-neutral-500 text-[8px]">
                * Todas as resoluções exigem assinatura digital e registo criptográfico SILA.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSupervisorModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ENCAMINHAR PARA SUPERVISOR N3</span>
                </button>

                <button
                  onClick={() => setIsResolveModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black uppercase flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>HOMOLOGAR RESOLUÇÃO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 06: CUSTÓDIA SILA & AUDITORIA IMUTÁVEL
         ========================================================================= */}
      {activeSubView === '06_AUDIT' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-neutral-200 font-bold text-[9px]">
                  CUSTÓDIA CRIPTOGRÁFICA & AUDITORIA DE UNICIDADE (SILA CHAIN)
                </span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Ref Global: <strong className="text-neutral-300">{uniq.auditChainRef}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-500 text-[8px] uppercase">HASH ANTERIOR DO BLOCO (PREVIOUS_HASH)</div>
                <div className="font-mono text-[8px] text-neutral-300 break-all bg-neutral-900 p-1.5 rounded border border-neutral-800">
                  {uniq.previousHash}
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-500 text-[8px] uppercase">HASH ATUAL DO VETOR UNICIDADE (CURRENT_HASH)</div>
                <div className="font-mono text-[8px] text-emerald-400 break-all bg-neutral-900 p-1.5 rounded border border-neutral-800">
                  {uniq.currentHash}
                </div>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
              <div className="text-neutral-500 text-[8px] uppercase">ASSINATURA DIGITAL DO MOTOR (ECDSA / ED25519)</div>
              <div className="font-mono text-[8px] text-cyan-400 break-all bg-neutral-900 p-1.5 rounded border border-neutral-800">
                {uniq.digitalSignature}
              </div>
            </div>

            <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-2 text-neutral-400 text-[8px] flex items-center justify-between">
              <span>
                Validação de unicidade vinculada e pronta para consumo soberano pelo <strong>07 — Terminal de Decisão</strong>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ENCAMINHAMENTO PARA SUPERVISÃO (MESA N3)
         ========================================================================= */}
      {isSupervisorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-lg w-full p-4 space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Send className="w-4 h-4" />
                <span>ENCAMINHAMENTO PARA MESA SUPERVISORA (N3)</span>
              </div>
              <button
                onClick={() => setIsSupervisorModalOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">NÍVEL DE PRIORIDADE OPERACIONAL:</label>
                <select
                  value={supervisorPriority}
                  onChange={(e) => setSupervisorPriority(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                >
                  <option value="NORMAL">NORMAL (SLA 24 Horas)</option>
                  <option value="HIGH">ALTA (SLA 8 Horas - Colisão Homónima)</option>
                  <option value="URGENT">URGENTE (SLA 2 Horas - Suspeita de Fraude Multimodal)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">PARECER / MOTIVO DO ENCAMINHAMENTO:</label>
                <textarea
                  value={supervisorReason}
                  onChange={(e) => setSupervisorReason(e.target.value)}
                  placeholder="Descreva o motivo do encaminhamento (ex: Colisão de impressões digitais com homónimo com sufixo divergente...)"
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white placeholder-neutral-600 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setIsSupervisorModalOpen(false)}
                className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-bold"
              >
                CANCELAR
              </button>
              <button
                onClick={handleEscalateToSupervisor}
                disabled={!supervisorReason.trim()}
                className="px-3 py-1.5 rounded bg-amber-500 text-neutral-950 font-black hover:bg-amber-400 disabled:opacity-50"
              >
                CONFIRMAR ENCAMINHAMENTO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: RESOLVER UNICIDADE COM REAUTENTICAÇÃO FORTE IAM
         ========================================================================= */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-lg w-full p-4 space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>HOMOLOGAÇÃO TÉCNICA DE UNICIDADE (COM REAUTENTICAÇÃO)</span>
              </div>
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {authError && (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[8px]">
                {authError}
              </div>
            )}

            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">TIPO DE RESOLUÇÃO DO MOTOR:</label>
                <select
                  value={resolveType}
                  onChange={(e) => setResolveType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                >
                  <option value="CLEARED_UNIQUE">CLEARED_UNIQUE — Unicidade Comprovada (Sem Colisão)</option>
                  <option value="CONFIRMED_HOMONYM">CONFIRMED_HOMONYM — Homonímia Legítima Confirmada</option>
                  <option value="SUPERVISOR_REFERRED">SUPERVISOR_REFERRED — Encaminhar para Parecer N3</option>
                  <option value="INSUFFICIENT_DATA_SANEAMENTO">INSUFFICIENT_DATA_SANEAMENTO — Dados Insuficientes</option>
                  <option value="CONFIRMED_DUPLICATE_MERGE" disabled={currentOperator.role === 'VALIDADOR_N1'}>
                    CONFIRMED_DUPLICATE_MERGE — Duplicidade Real com Fusão (Apenas N3)
                  </option>
                  <option value="SUSPECT_FRAUD_ESCALATED" disabled={currentOperator.role === 'VALIDADOR_N1'}>
                    SUSPECT_FRAUD_ESCALATED — Fraude Documental/Biométrica (Apenas N3)
                  </option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">JUSTIFICATIVA TÉCNICA:</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Fundamentação técnica da resolução de unicidade..."
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white placeholder-neutral-600 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-amber-400" />
                  <span>SENHA IAM DO OPERADOR (ASSINATURA CRIPTOGRÁFICA):</span>
                </label>
                <input
                  type="password"
                  value={operatorPassword}
                  onChange={(e) => setOperatorPassword(e.target.value)}
                  placeholder="Introduza a sua credencial forte..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
                />
                <span className="text-neutral-500 text-[7.5px] mt-0.5 block">
                  Reautenticação forte em conformidade com ICP-Angola e SILA Security Rule.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-bold"
              >
                CANCELAR
              </button>
              <button
                onClick={handleResolveUniqueness}
                className="px-3 py-1.5 rounded bg-emerald-600 text-neutral-950 font-black hover:bg-emerald-500 shadow-sm"
              >
                ASSINAR E HOMOLOGAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
