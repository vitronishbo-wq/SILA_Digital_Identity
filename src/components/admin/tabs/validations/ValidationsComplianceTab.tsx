import React, { useState, useMemo } from 'react';
import {
  Scale,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  RefreshCw,
  Send,
  Database,
  Building,
  KeyRound,
  Filter,
  Eye,
  FileSearch,
  BadgeAlert,
  HelpCircle,
  FileCheck2,
  GitCompare,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertCircle,
  FileBadge,
  SlidersHorizontal,
  XCircle,
  ListFilter,
  CheckSquare,
} from 'lucide-react';
import {
  ValidationDossier,
  ValidationAuditEvent,
} from '../../../../types/validations';
import {
  ComplianceValidation,
  AppliedRuleItem,
  ComplianceCheckItem,
  ComplianceFindingItem,
  ComplianceExceptionItem,
  ComplianceNonConformityItem,
  ComplianceEvidenceItem,
  ComplianceSourceRef,
  ComplianceEngineStatus,
  ComplianceSeverityLevel,
  ComplianceResultType,
  ComplianceResolutionType,
} from '../../../../types/complianceValidation';

interface ValidationsComplianceTabProps {
  dossiers: ValidationDossier[];
  activeDossierId: string;
  onSelectDossier: (dossierId: string) => void;
  onUpdateDossier: (updated: ValidationDossier) => void;
  onAddAuditEvent: (event: ValidationAuditEvent) => void;
}

export const ValidationsComplianceTab: React.FC<ValidationsComplianceTabProps> = ({
  dossiers,
  activeDossierId,
  onSelectDossier,
  onUpdateDossier,
  onAddAuditEvent,
}) => {
  // 8 Sub-Vistas Canónicas Estritas do Módulo 06
  const [activeSubView, setActiveSubView] = useState<
    | '01_CONTEXTO'
    | '02_REGRAS'
    | '03_CHECKS'
    | '04_FINDINGS'
    | '05_EVIDENCIAS'
    | '06_EXCECOES'
    | '07_RESOLUCAO'
    | '08_AUDITORIA'
  >('01_CONTEXTO');

  // Operador IAM autenticado
  const currentOperator = {
    operatorId: 'JUR-N2-0041',
    operatorName: 'Dra. Luísa Gaspar',
    role: 'ANALISTA_JURIDICO' as const,
    terminalId: 'TERM-JUR-LUA-02',
    organization: 'DNI_MINJUSDH' as const,
  };

  // Dossiê selecionado
  const dossier = dossiers.find((d) => d.dossierId === activeDossierId) || dossiers[0];

  // Regra selecionada para inspeção jurídica detalhada
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  // Estados dos Modais Operacionais
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [supervisorPriority, setSupervisorPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('HIGH');
  const [supervisorReason, setSupervisorReason] = useState('');

  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
  const [findingRuleCode, setFindingRuleCode] = useState('RULE_DOC_VALIDITY');
  const [findingSeverity, setFindingSeverity] = useState<ComplianceSeverityLevel>('MEDIUM');
  const [findingReason, setFindingReason] = useState('');
  const [findingEvidence, setFindingEvidence] = useState('');
  const [findingImpact, setFindingImpact] = useState('');
  const [findingAction, setFindingAction] = useState('REQUEST_CORRECTION');

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveType, setResolveType] = useState<ComplianceResolutionType>('RESOLVED');
  const [resolveNotes, setResolveNotes] = useState('');
  const [operatorPassword, setOperatorPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Estado transitório do motor
  const [isEvaluating, setIsEvaluating] = useState(false);

  // GERAÇÃO / CONSUMO EXCLUSIVO DE REGRAS LEGAIS CANÓNICAS E FICTÍCIAS
  const compVal: ComplianceValidation = useMemo(() => {
    const sources: ComplianceSourceRef[] = [
      { sourceCode: 'LEI_04_21', sourceName: 'Lei da Identificação Civil (Lei nº 04/21)', normativeGazette: 'Iª Série - N.º 142 de 2021', status: 'ONLINE' },
      { sourceCode: 'DEC_EXEC_45_20', sourceName: 'Regulamento de Emissão de BI (Decreto Executivo 45/20)', normativeGazette: 'Iª Série - N.º 88 de 2020', status: 'ONLINE' },
      { sourceCode: 'CIRC_DNI_09_25', sourceName: 'Instrução Normativa SIRGC/ICP-AO', normativeGazette: 'Circular Geral DNI nº 09/2025', status: 'ONLINE' },
      { sourceCode: 'REG_ISENCOES_20', sourceName: 'Regime de Gratuidade e Isenções Emolumentares', normativeGazette: 'Decreto Presidencial 182/20', status: 'ONLINE' },
    ];

    let rules: AppliedRuleItem[] = [];
    let checks: ComplianceCheckItem[] = [];
    let findings: ComplianceFindingItem[] = [];
    let exceptions: ComplianceExceptionItem[] = [];
    let nonConformities: ComplianceNonConformityItem[] = [];
    let evidenceList: ComplianceEvidenceItem[] = [];

    let resultStatus: ComplianceResultType = 'COMPLIANT';
    let overallSeverity: ComplianceSeverityLevel = 'LOW';
    let resolutionType: ComplianceResolutionType = 'NO_ACTION';
    let engineStatus: ComplianceEngineStatus = 'CONFIRMED_RESULT';
    let reviewRequired = false;

    if (dossier.dossierId === 'DOS-2026-AGO-00194') {
      // Caso 1: Renovação ordinária com BI caducado e confronto de homónimo validado no 04
      rules = [
        {
          ruleId: 'R-01',
          ruleCode: 'RULE_AGE_MAJORITY',
          ruleTitle: 'Maioridade Legal Civil do Requerente',
          version: 'v2026.1.4',
          originatingNorm: 'Lei n.º 04/21, Art. 8º (Capacidade Civil)',
          category: 'CAPACIDADE_JURIDICA',
          applicability: 'APPLICABLE',
          conditionSummary: 'Idade igual ou superior a 18 anos completos na data do pedido.',
          requiredEvidence: 'Data de nascimento extraída do Assento Civil ou BI anterior.',
          evaluatedEvidence: 'Nascimento em 1988-11-04 (37 anos).',
          result: 'PASS',
          severityIfViolated: 'HIGH',
          requiredAction: 'Nenhuma ação requerida.',
          evidenceSourceRef: '02_VAL_BIOGRAFICA / SIRGC_NACIONAL',
          evaluatedAt: '2026-08-15T09:15:25Z',
          resolutionOwnerRole: 'ANALISTA_JURIDICO',
        },
        {
          ruleId: 'R-02',
          ruleCode: 'RULE_RENEWAL_WINDOW',
          ruleTitle: 'Admissibilidade da Renovação por Caducidade',
          version: 'v2026.1.4',
          originatingNorm: 'Decreto Executivo 45/20, Art. 14º',
          category: 'REGIME_EMISSAO_PRAZOS',
          applicability: 'APPLICABLE',
          conditionSummary: 'BI anterior expirado ou nos últimos 6 meses de vigência.',
          requiredEvidence: 'Data de validade do documento anterior no acervo DNI.',
          evaluatedEvidence: 'Validade caducada em 2025-04-10.',
          result: 'PASS',
          severityIfViolated: 'LOW',
          requiredAction: 'Nenhuma ação requerida.',
          evidenceSourceRef: '05_VAL_DOCUMENTAL / DNI_MASTER_ARCHIVE',
          evaluatedAt: '2026-08-15T09:15:25Z',
          resolutionOwnerRole: 'ANALISTA_JURIDICO',
        },
        {
          ruleId: 'R-03',
          ruleCode: 'RULE_FILIACAO_CONSISTENCY',
          ruleTitle: 'Integridade da Filiação nos Registos',
          version: 'v2026.1.4',
          originatingNorm: 'Lei n.º 04/21, Art. 12º',
          category: 'INTEGRIDADE_FILIACAO',
          applicability: 'APPLICABLE',
          conditionSummary: 'Concordância dos nomes dos progenitores entre o assento e pedido.',
          requiredEvidence: 'Menção de pai e mãe coincidentes no SIRGC.',
          evaluatedEvidence: 'FRANCISCO KIALA / TERESA MANUELA KIALA coincidentes.',
          result: 'PASS',
          severityIfViolated: 'CRITICAL',
          requiredAction: 'Nenhuma ação requerida.',
          evidenceSourceRef: '02_VAL_BIOGRAFICA / 05_VAL_DOCUMENTAL',
          evaluatedAt: '2026-08-15T09:15:25Z',
          resolutionOwnerRole: 'ANALISTA_JURIDICO',
        },
        {
          ruleId: 'R-04',
          ruleCode: 'RULE_UNIQUENESS_VERIFIED',
          ruleTitle: 'Inexistência de Colisão de Identidade Ativa',
          version: 'v2026.1.4',
          originatingNorm: 'Lei n.º 04/21, Art. 3º (Princípio da Unicidade)',
          category: 'CAPACIDADE_JURIDICA',
          applicability: 'APPLICABLE',
          conditionSummary: 'Resolução formal de qualquer candidato ou homónimo gerado no 04.',
          requiredEvidence: 'Parecer técnico conclusivo de unicidade.',
          evaluatedEvidence: 'Candidato Homónimo (Sufixo JÚNIOR) formalmente justificado no 04.',
          result: 'PASS',
          severityIfViolated: 'CRITICAL',
          requiredAction: 'Nenhuma ação requerida.',
          evidenceSourceRef: '04_VAL_UNICIDADE',
          evaluatedAt: '2026-08-15T09:15:25Z',
          resolutionOwnerRole: 'ANALISTA_JURIDICO',
        },
      ];

      checks = [
        { checkId: 'CHK-01', ruleCode: 'RULE_AGE_MAJORITY', domainModule: '02_BIOGRAFICA', inputDataSummary: '1988-11-04', checkStatus: 'PASS', evidenceValue: '37 Anos', notes: 'Conforme' },
        { checkId: 'CHK-02', ruleCode: 'RULE_RENEWAL_WINDOW', domainModule: '05_DOCUMENTAL', inputDataSummary: '2025-04-10', checkStatus: 'PASS', evidenceValue: 'Caducado', notes: 'Conforme' },
        { checkId: 'CHK-03', ruleCode: 'RULE_FILIACAO_CONSISTENCY', domainModule: '02_BIOGRAFICA', inputDataSummary: 'Filiação', checkStatus: 'PASS', evidenceValue: 'Concordante', notes: 'Conforme' },
        { checkId: 'CHK-04', ruleCode: 'RULE_UNIQUENESS_VERIFIED', domainModule: '04_UNICIDADE', inputDataSummary: 'Unicidade', checkStatus: 'PASS', evidenceValue: 'Homónimo Resolvido', notes: 'Conforme' },
      ];

      evidenceList = [
        { evidenceId: 'EVD-01', sourceModule: '02_BIOGRAFICA', fieldOrVector: 'Data Nascimento', evidenceValue: '1988-11-04', officialSource: 'SIRGC_NACIONAL', verificationTimestamp: '2026-08-15T09:15:20Z', isImmutableConfirmed: true },
        { evidenceId: 'EVD-02', sourceModule: '05_DOCUMENTAL', fieldOrVector: 'BI Anterior', evidenceValue: '001948211BA033', officialSource: 'DNI_MASTER_ARCHIVE', verificationTimestamp: '2026-08-15T09:15:21Z', isImmutableConfirmed: true },
        { evidenceId: 'EVD-03', sourceModule: '04_UNICIDADE', fieldOrVector: 'Resolução Unicidade', evidenceValue: 'UNIQUE_RESOLVED', officialSource: '04_VAL_UNICIDADE', verificationTimestamp: '2026-08-15T09:15:23Z', isImmutableConfirmed: true },
      ];
    } else if (dossier.dossierId === 'DOS-2026-AGO-00196') {
      // Caso 2: Averbação de casamento com acréscimo de apelido marital
      rules = [
        {
          ruleId: 'R-01',
          ruleCode: 'RULE_MARITAL_NAME_CHANGE',
          ruleTitle: 'Alteração Legal de Nome por Casamento',
          version: 'v2026.1.4',
          originatingNorm: 'Código do Registo Civil, Art. 54º e Lei 04/21 Art. 19º',
          category: 'AVERBACOES_ESTADO_CIVIL',
          applicability: 'APPLICABLE',
          conditionSummary: 'Apresentação de Assento de Casamento averbado no SIRGC.',
          requiredEvidence: 'Assento de Casamento com menção expressa de adoção de apelidos.',
          evaluatedEvidence: 'Assento CAS-2026-BENG-0081 com averbamento de ANA PAULA CHIVELA DA SILVA.',
          result: 'PASS',
          severityIfViolated: 'HIGH',
          requiredAction: 'Nenhuma ação requerida.',
          evidenceSourceRef: '05_VAL_DOCUMENTAL / SIRGC_NACIONAL',
          evaluatedAt: '2026-08-15T09:15:25Z',
          resolutionOwnerRole: 'ANALISTA_JURIDICO',
        },
        {
          ruleId: 'R-02',
          ruleCode: 'RULE_AGE_MAJORITY',
          ruleTitle: 'Maioridade Legal Civil do Requerente',
          version: 'v2026.1.4',
          originatingNorm: 'Lei n.º 04/21, Art. 8º',
          category: 'CAPACIDADE_JURIDICA',
          applicability: 'APPLICABLE',
          conditionSummary: 'Maioridade civil confirmada.',
          requiredEvidence: 'Data de nascimento no assento de origem.',
          evaluatedEvidence: '1992-05-18 (34 anos).',
          result: 'PASS',
          severityIfViolated: 'HIGH',
          requiredAction: 'Nenhuma ação requerida.',
          evidenceSourceRef: '02_VAL_BIOGRAFICA',
          evaluatedAt: '2026-08-15T09:15:25Z',
          resolutionOwnerRole: 'ANALISTA_JURIDICO',
        },
      ];

      checks = [
        { checkId: 'CHK-01', ruleCode: 'RULE_MARITAL_NAME_CHANGE', domainModule: '05_DOCUMENTAL', inputDataSummary: 'Assento Casamento', checkStatus: 'PASS', evidenceValue: 'Averbamento Válido', notes: 'Conforme' },
        { checkId: 'CHK-02', ruleCode: 'RULE_AGE_MAJORITY', domainModule: '02_BIOGRAFICA', inputDataSummary: '1992-05-18', checkStatus: 'PASS', evidenceValue: '34 Anos', notes: 'Conforme' },
      ];

      evidenceList = [
        { evidenceId: 'EVD-01', sourceModule: '05_DOCUMENTAL', fieldOrVector: 'Assento Casamento', evidenceValue: 'CAS-2026-BENG-0081', officialSource: 'SIRGC_NACIONAL', verificationTimestamp: '2026-08-15T09:15:20Z', isImmutableConfirmed: true },
      ];
    } else if (dossier.dossierId === 'DOS-2026-AGO-00195') {
      // Caso 3: Fonte externa temporariamente indisponível (Conservatória offline) - Não Conformidade MEDIUM / Saneamento
      rules = [
        {
          ruleId: 'R-01',
          ruleCode: 'RULE_DOC_SOURCE_ONLINE',
          ruleTitle: 'Verificação Oficial da Fonte Remota',
          version: 'v2026.1.4',
          originatingNorm: 'Circular Geral DNI nº 09/2025, Art. 4º',
          category: 'TERRITORIALIDADE_COMPETENCIA',
          applicability: 'APPLICABLE',
          conditionSummary: 'Atestação online da fonte emissora do documento.',
          requiredEvidence: 'Comunicação direta com o servidor da Conservatória do Lobito.',
          evaluatedEvidence: 'Telemetria do Módulo 05 indica SOURCE_UNAVAILABLE.',
          result: 'FAIL',
          severityIfViolated: 'MEDIUM',
          requiredAction: 'Solicitar saneamento ou aguardar restabelecimento de link da fonte.',
          evidenceSourceRef: '05_VAL_DOCUMENTAL / CONS_LOBITO_REMOTE',
          evaluatedAt: '2026-08-15T09:15:25Z',
          resolutionOwnerRole: 'ANALISTA_JURIDICO',
        },
      ];

      checks = [
        { checkId: 'CHK-01', ruleCode: 'RULE_DOC_SOURCE_ONLINE', domainModule: '05_DOCUMENTAL', inputDataSummary: 'Posto Lobito', checkStatus: 'FAIL', evidenceValue: 'SOURCE_UNAVAILABLE', notes: 'Servidor Offline' },
      ];

      findings = [
        {
          findingId: 'FND-195-01',
          ruleCode: 'RULE_DOC_SOURCE_ONLINE',
          violatingEvidence: 'Status SOURCE_UNAVAILABLE na verificação do documento DOC-195-01.',
          reason: 'Impossibilidade temporária de consulta à base local da conservatória emissora.',
          severity: 'MEDIUM',
          impactAssessment: 'Impede a confirmação ordinária imediata sem constituir vício material.',
          requiredAction: 'REQUEST_CORRECTION',
          resolutionStatus: 'OPEN',
          resolutionNotes: 'Aguardando reteste de conectividade governamental.',
        },
      ];

      nonConformities = [
        { nonConformityId: 'NC-01', ruleCode: 'RULE_DOC_SOURCE_ONLINE', description: 'Fonte externa indisponível para checagem imediata.', severity: 'MEDIUM', sourceModule: '05_VAL_DOCUMENTAL', isMaterialInconsistency: false },
      ];

      evidenceList = [
        { evidenceId: 'EVD-01', sourceModule: '05_DOCUMENTAL', fieldOrVector: 'Status Conexão Conservatória', evidenceValue: 'SOURCE_UNAVAILABLE', officialSource: 'CONS_LOBITO_REMOTE', verificationTimestamp: '2026-08-15T09:15:20Z', isImmutableConfirmed: true },
      ];

      resultStatus = 'PARTIALLY_COMPLIANT';
      overallSeverity = 'MEDIUM';
      resolutionType = 'REQUEST_CORRECTION';
      engineStatus = 'NON_COMPLIANCE_FOUND';
    } else {
      // Caso Padrão Conforme
      rules = [
        {
          ruleId: 'R-01',
          ruleCode: 'RULE_AGE_MAJORITY',
          ruleTitle: 'Maioridade Legal Civil do Requerente',
          version: 'v2026.1.4',
          originatingNorm: 'Lei n.º 04/21, Art. 8º',
          category: 'CAPACIDADE_JURIDICA',
          applicability: 'APPLICABLE',
          conditionSummary: 'Idade legal verificada.',
          requiredEvidence: 'Registo biográfico oficial.',
          evaluatedEvidence: `${dossier.citizenName} com idade confirmada.`,
          result: 'PASS',
          severityIfViolated: 'HIGH',
          requiredAction: 'Nenhuma ação requerida.',
          evidenceSourceRef: '02_VAL_BIOGRAFICA',
          evaluatedAt: '2026-08-15T09:15:25Z',
          resolutionOwnerRole: 'ANALISTA_JURIDICO',
        },
      ];

      checks = [
        { checkId: 'CHK-01', ruleCode: 'RULE_AGE_MAJORITY', domainModule: '02_BIOGRAFICA', inputDataSummary: dossier.citizenName, checkStatus: 'PASS', evidenceValue: 'Conforme', notes: 'Conforme' },
      ];

      evidenceList = [
        { evidenceId: 'EVD-01', sourceModule: '02_BIOGRAFICA', fieldOrVector: 'Registo Biográfico', evidenceValue: 'CONFIRMADO', officialSource: 'SIRGC_NACIONAL', verificationTimestamp: '2026-08-15T09:15:20Z', isImmutableConfirmed: true },
      ];
    }

    return {
      validationId: `VAL-CMP-2026-${dossier.dossierId.replace(/[^0-9]/g, '')}`,
      dossierId: dossier.dossierId,
      processId: dossier.processId,
      engineCode: 'REGULATORY_RULES_ENGINE',
      engineStatus,
      rulesApplied: rules,
      complianceChecks: checks,
      findings,
      exceptions,
      nonConformities,
      evidence: evidenceList,
      sourceReferences: sources,
      complianceResult: resultStatus,
      severity: overallSeverity,
      resolution: resolutionType,
      reviewRequired,
      reviewerId: currentOperator.operatorId,
      reviewerName: currentOperator.operatorName,
      reviewerRole: currentOperator.role,
      reviewedAt: '2026-08-15T09:15:26Z',
      evaluatedAt: '2026-08-15T09:15:26Z',
      previousHash: dossier.previousHash,
      currentHash: `hash_cmp_${dossier.dossierId.substring(4)}_p12`,
      digitalSignature: `SIG_CMP_VAL_${dossier.dossierId.substring(4)}_ED25519`,
      auditChainRef: dossier.auditChainRef,
    };
  }, [dossier]);

  const activeRule = useMemo(() => {
    if (selectedRuleId) {
      return compVal.rulesApplied.find((r) => r.ruleId === selectedRuleId) || compVal.rulesApplied[0];
    }
    return compVal.rulesApplied[0] || null;
  }, [compVal.rulesApplied, selectedRuleId]);

  // COMANDO: RUN_COMPLIANCE_CHECK
  const handleRunComplianceCheck = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);

      const auditEvt: ValidationAuditEvent = {
        eventId: `EVT_CMP_RUN_${Date.now()}`,
        dossierId: dossier.dossierId,
        operatorId: currentOperator.operatorId,
        operatorRole: currentOperator.role,
        command: 'EVALUATE_RULES',
        previousState: dossier.status,
        newState: dossier.status,
        reason: `Execução do motor de regras normativas. Regras aplicadas: ${compVal.rulesApplied.length}. Checks realizados: ${compVal.complianceChecks.length}.`,
        timestamp: new Date().toISOString(),
        previousHash: compVal.currentHash,
        currentHash: `hash_cmp_run_${Date.now()}`,
        digitalSignature: `SIG_CMP_RUN_${Date.now()}`,
        auditChainRef: compVal.auditChainRef,
        terminalId: currentOperator.terminalId,
        payloadSummary: `Avaliação de Compliance Executada. Veredito: ${compVal.complianceResult}. Severidade: ${compVal.severity}.`,
        silaGlobalAuditRef: `SILA_CMP_RUN_${Date.now()}`,
      };
      onAddAuditEvent(auditEvt);
    }, 600);
  };

  // COMANDO: REGISTAR FINDING DE COMPLIANCE
  const handleRecordFinding = () => {
    if (!findingReason.trim() || !findingEvidence.trim()) return;

    const auditEvt: ValidationAuditEvent = {
      eventId: `EVT_CMP_FND_${Date.now()}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'RECORD_EXCEPTION',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Registo de finding de compliance: [${findingSeverity}] Regra: ${findingRuleCode}. Motivo: ${findingReason}. Evidência: ${findingEvidence}`,
      timestamp: new Date().toISOString(),
      previousHash: compVal.currentHash,
      currentHash: `hash_cmp_fnd_${Date.now()}`,
      digitalSignature: `SIG_CMP_FND_${Date.now()}`,
      auditChainRef: compVal.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Finding de Compliance Registado. Regra: ${findingRuleCode}, Ação Requerida: ${findingAction}.`,
      silaGlobalAuditRef: `SILA_CMP_FND_${Date.now()}`,
    };
    onAddAuditEvent(auditEvt);

    setIsFindingModalOpen(false);
    setFindingReason('');
    setFindingEvidence('');
    setFindingImpact('');
  };

  // COMANDO: ESCALATE_TO_SUPERVISOR
  const handleEscalateToSupervisor = () => {
    if (!supervisorReason.trim()) return;

    const auditEvt: ValidationAuditEvent = {
      eventId: `EVT_CMP_ESCALATE_${Date.now()}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'ESCALATE_TO_SUPERVISOR',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Dossiê de compliance encaminhado para a Mesa Supervisora (N3). Prioridade: ${supervisorPriority}. Parecer: ${supervisorReason}`,
      timestamp: new Date().toISOString(),
      previousHash: compVal.currentHash,
      currentHash: `hash_cmp_sup_${Date.now()}`,
      digitalSignature: `SIG_CMP_SUP_${Date.now()}`,
      auditChainRef: compVal.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Encaminhamento de Compliance N3. Motivo: ${supervisorReason}`,
      silaGlobalAuditRef: `SILA_CMP_SUP_${Date.now()}`,
    };
    onAddAuditEvent(auditEvt);

    setIsSupervisorModalOpen(false);
    setSupervisorReason('');
  };

  // COMANDO: RESOLVE / CONFIRM_RESULT COM REAUTENTICAÇÃO FORTE IAM
  const handleResolveCompliance = () => {
    if (!operatorPassword.trim()) {
      setAuthError('Autenticação forte obrigatória: introduza a senha IAM do analista jurídico.');
      return;
    }
    if (operatorPassword !== '123456' && operatorPassword.length < 4) {
      setAuthError('Senha de operador inválida para assinatura criptográfica.');
      return;
    }

    // Trava Institucional: Casos CRITICAL exigem N3
    if (
      currentOperator.role === 'ANALISTA_JURIDICO' &&
      resolveType === 'RESOLVED' &&
      compVal.findings.some((f) => f.severity === 'CRITICAL')
    ) {
      setAuthError(
        'Regra Institucional: Casos com severidade CRITICAL exigem homologação formal da Mesa Supervisora (N3).'
      );
      return;
    }

    const auditEvt: ValidationAuditEvent = {
      eventId: `EVT_CMP_RESOLVE_${Date.now()}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'RESOLVE',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Resolução de compliance homologada com autenticação forte. Resolução: ${resolveType}. Parecer: ${resolveNotes || 'Conforme com o quadro normativo.'}`,
      timestamp: new Date().toISOString(),
      previousHash: compVal.currentHash,
      currentHash: `hash_cmp_res_${Date.now()}`,
      digitalSignature: `SIG_CMP_RES_${Date.now()}`,
      auditChainRef: compVal.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Resolução de Compliance: ${resolveType}. Analista: ${currentOperator.operatorName} (${currentOperator.role})`,
      silaGlobalAuditRef: `SILA_CMP_RES_${Date.now()}`,
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
          CABEÇALHO DE COMANDO & REGRA CRÍTICA INSTITUCIONAL (06)
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold tracking-wider">
                  06 — VALIDAÇÃO DE CONFORMIDADE LEGAL & REGRAS REGULATÓRIAS
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[8px] font-bold">
                  RULESET v2026.1
                </span>
              </div>
              <div className="text-neutral-500 text-[8px]">
                Matriz de Regras • Rastreabilidade Regra ➔ Evidência ➔ Finding ➔ Resolução • Consumo Exclusivo de 01–05
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-lg">
              <span className="text-neutral-500 text-[8px]">STATUS MOTOR:</span>
              <span
                className={`font-black uppercase px-1.5 py-0.5 rounded ${
                  compVal.engineStatus === 'CONFIRMED_RESULT' || compVal.engineStatus === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : compVal.engineStatus === 'NON_COMPLIANCE_FOUND' || compVal.engineStatus === 'SUPERVISOR_REVIEW'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {compVal.engineStatus}
              </span>
            </div>

            <button
              onClick={handleRunComplianceCheck}
              disabled={isEvaluating}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 font-bold border border-neutral-700 flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3 h-3 ${isEvaluating ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isEvaluating ? 'AVALIANDO...' : 'RUN_CHECK'}</span>
            </button>

            <button
              onClick={() => setIsFindingModalOpen(true)}
              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40 flex items-center gap-1 transition"
            >
              <BadgeAlert className="w-3 h-3" />
              <span>REGISTAR FINDING</span>
            </button>

            <button
              onClick={() => setIsSupervisorModalOpen(true)}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1 transition"
            >
              <Send className="w-3 h-3" />
              <span>ENCAMINHAR N3</span>
            </button>

            <button
              onClick={() => setIsResolveModalOpen(true)}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black uppercase flex items-center gap-1 transition shadow-sm"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>HOMOLOGAR</span>
            </button>
          </div>
        </div>

        {/* REGRA INSTITUCIONAL VINCULATIVA */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-2 flex items-center justify-between text-emerald-300/90 text-[8px]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong>REGRA INSTITUCIONAL DE COMPLIANCE:</strong>{' '}
              <span className="text-emerald-200 font-bold">NON_COMPLIANCE ≠ FRAUD</span>,{' '}
              <span className="text-emerald-200 font-bold">RULE_VIOLATION ≠ FRAUD</span>,{' '}
              <span className="text-emerald-200 font-bold">INCONSISTENCY ≠ FRAUD</span> e{' '}
              <span className="text-emerald-200 font-bold">MISSING_INFORMATION ≠ FRAUD</span>. Não conformidades administrativas e ausência de prova documental externa não autorizam rejeição sumária em N1/N2.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 font-mono text-[7.5px] border border-neutral-800">
            DNI/MINJUSDH ART. 41º
          </span>
        </div>

        {/* FILA DE SELEÇÃO DE DOSSIÊS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-neutral-500 uppercase font-bold shrink-0 text-[8px] flex items-center gap-1">
            <Filter className="w-2.5 h-2.5" />
            FILA DE DOSSIÊS:
          </span>
          {dossiers.map((d) => {
            const isSelected = d.dossierId === dossier.dossierId;
            return (
              <button
                key={d.dossierId}
                onClick={() => {
                  onSelectDossier(d.dossierId);
                  setSelectedRuleId(null);
                }}
                className={`px-2 py-1 rounded border text-left shrink-0 transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-mono">{d.dossierId}</span>
                <span className="text-neutral-500 max-w-[100px] truncate">{d.citizenName}</span>
              </button>
            );
          })}
        </div>

        {/* 8 SUB-VIEWS OPERACIONAIS INLINE */}
        <div className="flex items-center gap-1 border-b border-neutral-800 pt-1 overflow-x-auto">
          {[
            { id: '01_CONTEXTO', label: '01. CONTEXTO', icon: FileText },
            { id: '02_REGRAS', label: `02. REGRAS (${compVal.rulesApplied.length})`, icon: Layers },
            { id: '03_CHECKS', label: `03. CHECKS (${compVal.complianceChecks.length})`, icon: CheckSquare },
            { id: '04_FINDINGS', label: `04. FINDINGS (${compVal.findings.length})`, icon: BadgeAlert },
            { id: '05_EVIDENCIAS', label: `05. EVIDÊNCIAS (${compVal.evidence.length})`, icon: FileSearch },
            { id: '06_EXCECOES', label: `06. EXCEÇÕES (${compVal.exceptions.length})`, icon: Award },
            { id: '07_RESOLUCAO', label: '07. RESOLUÇÃO', icon: Scale },
            { id: '08_AUDITORIA', label: '08. AUDITORIA', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubView(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 border-t border-x transition shrink-0 ${
                  isActive
                    ? 'bg-neutral-900 border-neutral-700 text-emerald-400 border-b-neutral-900'
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
          SUB-VIEW 01: CONTEXTO
         ========================================================================= */}
      {activeSubView === '01_CONTEXTO' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">CIDADÃO REQUERENTE</div>
              <div className="text-sm font-black text-white truncate mt-0.5">{dossier.citizenName}</div>
              <div className="text-neutral-400 text-[8px] mt-1 font-mono">
                Processo: {dossier.processId} • Pedido: {dossier.processType}
              </div>
            </div>

            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">RESULTADO DO COMPLIANCE</div>
              <div className="text-sm font-black text-emerald-400 mt-0.5">{compVal.complianceResult}</div>
              <div className="text-neutral-400 text-[8px] mt-1 font-mono">
                Severidade Geral: {compVal.severity}
              </div>
            </div>

            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">RESOLUÇÃO OPERACIONAL</div>
              <div className="text-sm font-black text-white mt-0.5">{compVal.resolution}</div>
              <div className="text-neutral-400 text-[8px] mt-1">
                Findings Ativos: {compVal.findings.length}
              </div>
            </div>

            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">ANALISTA JURÍDICO</div>
              <div className="text-sm font-black text-white mt-0.5">{compVal.reviewerName}</div>
              <div className="text-neutral-400 text-[8px] mt-1">
                Alçada: {compVal.reviewerRole}
              </div>
            </div>
          </div>

          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-neutral-200 font-bold text-[9px]">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>FONTES NORMATIVAS & DIPLOMAS LEGAIS VINCULADOS</span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Repositório Oficial do Ministério da Justiça e dos Direitos Humanos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {compVal.sourceReferences.map((src) => (
                <div key={src.sourceCode} className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-[8.5px]">{src.sourceName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[7.5px]">
                      {src.status}
                    </span>
                  </div>
                  <div className="text-neutral-500 text-[8px]">Diário da República: {src.normativeGazette}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 02: REGRAS APLICADAS
         ========================================================================= */}
      {activeSubView === '02_REGRAS' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>MATRIZ DE REGRAS LEGAIS APLICADAS ({compVal.rulesApplied.length})</span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Rastreabilidade de cada regra avaliada contra os dados do processo
              </span>
            </div>

            <div className="overflow-x-auto border border-neutral-800 rounded-lg">
              <table className="w-full text-left text-[8.5px] border-collapse">
                <thead>
                  <tr className="bg-neutral-900/90 text-neutral-400 border-b border-neutral-800 uppercase font-bold text-[7.5px]">
                    <th className="p-2">CÓDIGO / TÍTULO DA REGRA</th>
                    <th className="p-2">ORIGEM NORMATIVA</th>
                    <th className="p-2">CATEGORIA</th>
                    <th className="p-2 text-center">APLICABILIDADE</th>
                    <th className="p-2 text-center">RESULTADO</th>
                    <th className="p-2 text-center">SEVERIDADE</th>
                    <th className="p-2 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/60">
                  {compVal.rulesApplied.map((rule) => (
                    <tr key={rule.ruleId} className="hover:bg-neutral-900/40 transition">
                      <td className="p-2 font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <FileBadge className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{rule.ruleTitle}</span>
                        </div>
                        <div className="text-neutral-500 text-[7.5px] font-mono">{rule.ruleCode} • {rule.version}</div>
                      </td>
                      <td className="p-2 text-neutral-300 max-w-[150px] truncate">{rule.originatingNorm}</td>
                      <td className="p-2 font-mono text-neutral-400">{rule.category}</td>
                      <td className="p-2 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 text-[7.5px]">
                          {rule.applicability}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        {rule.result === 'PASS' ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[7.5px] font-bold">
                            PASS
                          </span>
                        ) : rule.result === 'FAIL' ? (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[7.5px] font-bold">
                            FAIL
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[7.5px] font-bold">
                            {rule.result}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold ${
                            rule.severityIfViolated === 'LOW'
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : rule.severityIfViolated === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-300'
                              : 'bg-rose-500/10 text-rose-300'
                          }`}
                        >
                          {rule.severityIfViolated}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => {
                            setSelectedRuleId(rule.ruleId);
                            setActiveSubView('03_CHECKS');
                          }}
                          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold border border-neutral-700"
                        >
                          INSPECIONAR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 03: CHECKS EXECUTADOS
         ========================================================================= */}
      {activeSubView === '03_CHECKS' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>CHECKS DE CONFORMIDADE EXECUTADOS ({compVal.complianceChecks.length})</span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Cruzamento direto com os módulos de suporte 01, 02, 03, 04 e 05
              </span>
            </div>

            <div className="overflow-x-auto border border-neutral-800 rounded-lg">
              <table className="w-full text-left text-[8.5px] border-collapse">
                <thead>
                  <tr className="bg-neutral-900/90 text-neutral-400 border-b border-neutral-800 uppercase font-bold text-[7.5px]">
                    <th className="p-2">CHECK ID</th>
                    <th className="p-2">REGRA VINCULADA</th>
                    <th className="p-2">MÓDULO DE ORIGEM</th>
                    <th className="p-2">DADO DE ENTRADA</th>
                    <th className="p-2">EVIDÊNCIA CONFERIDA</th>
                    <th className="p-2 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/60">
                  {compVal.complianceChecks.map((chk) => (
                    <tr key={chk.checkId} className="hover:bg-neutral-900/40 transition">
                      <td className="p-2 font-mono text-cyan-400 font-bold">{chk.checkId}</td>
                      <td className="p-2 font-bold text-white">{chk.ruleCode}</td>
                      <td className="p-2 font-mono text-neutral-300">{chk.domainModule}</td>
                      <td className="p-2 text-neutral-300 font-mono">{chk.inputDataSummary}</td>
                      <td className="p-2 text-emerald-300 font-mono">{chk.evidenceValue}</td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold border ${
                            chk.checkStatus === 'PASS'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {chk.checkStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 04: FINDINGS REGISTADOS
         ========================================================================= */}
      {activeSubView === '04_FINDINGS' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                <BadgeAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>FINDINGS DE NÃO CONFORMIDADE REGISTADOS ({compVal.findings.length})</span>
              </div>
              <button
                onClick={() => setIsFindingModalOpen(true)}
                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40"
              >
                + ADICIONAR FINDING
              </button>
            </div>

            {compVal.findings.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950/40 rounded-lg border border-neutral-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-neutral-200 font-bold text-sm">Nenhum Finding de Não Conformidade</div>
                <div className="text-neutral-500 text-[8px]">
                  O processo cumpre integralmente os requisitos da Lei nº 04/21 e normativos vigentes.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {compVal.findings.map((f) => (
                  <div key={f.findingId} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-[8.5px]">{f.ruleCode}</span>
                        <span className="font-mono text-neutral-500 text-[8px]">{f.findingId}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold ${
                            f.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          SEVERIDADE: {f.severity}
                        </span>
                      </div>
                      <p className="text-neutral-300 text-[8px]">{f.reason}</p>
                      <div className="text-neutral-500 text-[7.5px]">
                        Evidência Violadora: <strong className="text-neutral-300">{f.violatingEvidence}</strong>
                      </div>
                      <div className="text-neutral-500 text-[7.5px]">
                        Impacto: {f.impactAssessment} • Ação Necessária: <strong className="text-amber-400">{f.requiredAction}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 05: EVIDÊNCIAS UTILIZADAS
         ========================================================================= */}
      {activeSubView === '05_EVIDENCIAS' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                <FileSearch className="w-3.5 h-3.5 text-emerald-400" />
                <span>INVENTÁRIO DE EVIDÊNCIAS CONSUMIDAS ({compVal.evidence.length})</span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Rastreabilidade de vetores e campos probatórios
              </span>
            </div>

            <div className="overflow-x-auto border border-neutral-800 rounded-lg">
              <table className="w-full text-left text-[8.5px] border-collapse">
                <thead>
                  <tr className="bg-neutral-900/90 text-neutral-400 border-b border-neutral-800 uppercase font-bold text-[7.5px]">
                    <th className="p-2">EVIDÊNCIA ID</th>
                    <th className="p-2">MÓDULO FONTE</th>
                    <th className="p-2">CAMPO / VETOR</th>
                    <th className="p-2">VALOR PROBATÓRIO</th>
                    <th className="p-2">FONTE OFICIAL</th>
                    <th className="p-2 text-center">INTEGRIDADE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/60">
                  {compVal.evidence.map((evd) => (
                    <tr key={evd.evidenceId} className="hover:bg-neutral-900/40 transition">
                      <td className="p-2 font-mono text-cyan-400 font-bold">{evd.evidenceId}</td>
                      <td className="p-2 font-mono text-neutral-300">{evd.sourceModule}</td>
                      <td className="p-2 font-bold text-white">{evd.fieldOrVector}</td>
                      <td className="p-2 text-emerald-300 font-mono">{evd.evidenceValue}</td>
                      <td className="p-2 text-neutral-400">{evd.officialSource}</td>
                      <td className="p-2 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[7.5px] font-bold">
                          CONFIRMADA
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 06: EXCEÇÕES & ISENÇÕES
         ========================================================================= */}
      {activeSubView === '06_EXCECOES' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>EXCEÇÕES E ISENÇÕES NORMATIVAS ({compVal.exceptions.length})</span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Enquadramentos especiais fundamentados por lei
              </span>
            </div>

            {compVal.exceptions.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950/40 rounded-lg border border-neutral-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-neutral-600 mx-auto" />
                <div className="text-neutral-300 font-bold text-sm">Nenhuma Exceção Registada</div>
                <div className="text-neutral-500 text-[8px]">
                  O processo tramita pelo regime geral ordinário sem despachos de isenção especial.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {compVal.exceptions.map((exc) => (
                  <div key={exc.exceptionId} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-white font-bold text-[8.5px]">{exc.ruleCode}</div>
                      <div className="text-neutral-400 text-[8px]">Base: {exc.legalBasis}</div>
                      <div className="text-neutral-500 text-[7.5px]">Motivo: {exc.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 07: RESOLUÇÃO OPERACIONAL (DISPONÍVEL PARA 07)
         ========================================================================= */}
      {activeSubView === '07_RESOLUCAO' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div>
                <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PARECER & RESOLUÇÃO DE COMPLIANCE (DISPONÍVEL PARA 07 — DECISÃO_FINAL)</span>
                </div>
                <div className="text-neutral-500 text-[8px]">
                  Resultado estrito do Módulo 06 para consumo soberano pelo Submódulo 07
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 text-[8px] border border-neutral-800">
                ANALISTA: {compVal.reviewerName} ({compVal.reviewerRole})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-400 text-[8px] uppercase">STATUS DO MOTOR 06</div>
                <div className="text-base font-black text-emerald-400">{compVal.engineStatus}</div>
                <div className="text-neutral-500 text-[8px]">Resultado: {compVal.complianceResult}</div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-400 text-[8px] uppercase">RESOLUÇÃO HOMOLOGADA</div>
                <div className="text-base font-black text-white">{compVal.resolution}</div>
                <div className="text-neutral-500 text-[8px]">Data: {new Date(compVal.reviewedAt || '').toLocaleDateString('pt-AO')}</div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-400 text-[8px] uppercase">PARECERISTA RESPONSÁVEL</div>
                <div className="text-base font-black text-white">{compVal.reviewerName}</div>
                <div className="text-neutral-500 text-[8px]">Alçada: {compVal.reviewerRole}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
              <div className="text-neutral-500 text-[8px]">
                * O parecer de compliance alimenta o Módulo 07 sem alterar o status geral do dossiê.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSupervisorModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ENCAMINHAR SUPERVISOR N3</span>
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
          SUB-VIEW 08: CUSTÓDIA SILA & AUDITORIA APPEND-ONLY
         ========================================================================= */}
      {activeSubView === '08_AUDITORIA' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-neutral-200 font-bold text-[9px]">
                  CUSTÓDIA CRIPTOGRÁFICA & AUDITORIA DE COMPLIANCE (SILA CHAIN APPEND-ONLY)
                </span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Ref Global: <strong className="text-neutral-300">{compVal.auditChainRef}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-500 text-[8px] uppercase">HASH ANTERIOR DO BLOCO (PREVIOUS_HASH)</div>
                <div className="font-mono text-[8px] text-neutral-300 break-all bg-neutral-900 p-1.5 rounded border border-neutral-800">
                  {compVal.previousHash}
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-500 text-[8px] uppercase">HASH ATUAL DE COMPLIANCE (CURRENT_HASH)</div>
                <div className="font-mono text-[8px] text-emerald-400 break-all bg-neutral-900 p-1.5 rounded border border-neutral-800">
                  {compVal.currentHash}
                </div>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
              <div className="text-neutral-500 text-[8px] uppercase">ASSINATURA DIGITAL DO MOTOR JURÍDICO</div>
              <div className="font-mono text-[8px] text-emerald-400 break-all bg-neutral-900 p-1.5 rounded border border-neutral-800">
                {compVal.digitalSignature}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: REGISTO DE FINDING DE COMPLIANCE
         ========================================================================= */}
      {isFindingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-lg w-full p-4 space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <BadgeAlert className="w-4 h-4" />
                <span>REGISTAR FINDING DE NÃO CONFORMIDADE</span>
              </div>
              <button onClick={() => setIsFindingModalOpen(false)} className="text-neutral-500 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">REGRA VIOLADA:</label>
                <input
                  type="text"
                  value={findingRuleCode}
                  onChange={(e) => setFindingRuleCode(e.target.value)}
                  placeholder="Ex: RULE_AGE_MAJORITY..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">SEVERIDADE DO FINDING:</label>
                <select
                  value={findingSeverity}
                  onChange={(e) => setFindingSeverity(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                >
                  <option value="LOW">LOW — Informativo / Sem Bloqueio</option>
                  <option value="MEDIUM">MEDIUM — Pendência Saneável</option>
                  <option value="HIGH">HIGH — Inconsistência Normativa Relevante</option>
                  <option value="CRITICAL">CRITICAL — Bloqueio de Confirmação Ordinária</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">MOTIVO TÉCNICO:</label>
                <textarea
                  value={findingReason}
                  onChange={(e) => setFindingReason(e.target.value)}
                  placeholder="Descreva o motivo da não conformidade..."
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white placeholder-neutral-600 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">EVIDÊNCIA CONCRETA UTILIZADA:</label>
                <input
                  type="text"
                  value={findingEvidence}
                  onChange={(e) => setFindingEvidence(e.target.value)}
                  placeholder="Ex: Assento SIRGC nº 1988/0912 sem averbação..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">AÇÃO REQUERIDA:</label>
                <select
                  value={findingAction}
                  onChange={(e) => setFindingAction(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                >
                  <option value="REQUEST_CORRECTION">REQUEST_CORRECTION — Solicitar Retificação de Dados</option>
                  <option value="REQUEST_DOCUMENTATION">REQUEST_DOCUMENTATION — Solicitar Novo Documento</option>
                  <option value="SUPERVISOR_REVIEW">SUPERVISOR_REVIEW — Encaminhar para N3</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setIsFindingModalOpen(false)} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 font-bold">
                CANCELAR
              </button>
              <button
                onClick={handleRecordFinding}
                disabled={!findingReason.trim() || !findingEvidence.trim()}
                className="px-3 py-1.5 rounded bg-rose-600 text-white font-black hover:bg-rose-500 disabled:opacity-50"
              >
                REGISTAR FINDING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ENCAMINHAMENTO PARA SUPERVISÃO JURÍDICA (N3)
         ========================================================================= */}
      {isSupervisorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-lg w-full p-4 space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Send className="w-4 h-4" />
                <span>ENCAMINHAMENTO PARA SUPERVISÃO JURÍDICA (N3)</span>
              </div>
              <button onClick={() => setIsSupervisorModalOpen(false)} className="text-neutral-500 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">PRIORIDADE:</label>
                <select
                  value={supervisorPriority}
                  onChange={(e) => setSupervisorPriority(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                >
                  <option value="NORMAL">NORMAL (SLA 24 Horas)</option>
                  <option value="HIGH">ALTA (SLA 8 Horas - Dúvida Hermenêutica)</option>
                  <option value="URGENT">URGENTE (SLA 2 Horas - Conflito Normativo Grave)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">MOTIVO DO ENCAMINHAMENTO:</label>
                <textarea
                  value={supervisorReason}
                  onChange={(e) => setSupervisorReason(e.target.value)}
                  placeholder="Fundamentação técnica para a Mesa Supervisora..."
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white placeholder-neutral-600 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setIsSupervisorModalOpen(false)} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 font-bold">
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
          MODAL 3: HOMOLOGAÇÃO COM REAUTENTICAÇÃO FORTE IAM
         ========================================================================= */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-lg w-full p-4 space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>HOMOLOGAÇÃO DE RESOLUÇÃO (REAUTENTICAÇÃO IAM)</span>
              </div>
              <button onClick={() => setIsResolveModalOpen(false)} className="text-neutral-500 hover:text-white">
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
                <label className="text-neutral-400 block mb-1">TIPO DE RESOLUÇÃO:</label>
                <select
                  value={resolveType}
                  onChange={(e) => setResolveType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                >
                  <option value="RESOLVED">RESOLVED — Processo Conforme Homologado</option>
                  <option value="REQUEST_CORRECTION">REQUEST_CORRECTION — Solicitar Retificação de Dados</option>
                  <option value="REQUEST_DOCUMENTATION">REQUEST_DOCUMENTATION — Solicitar Novo Documento</option>
                  <option value="EXCEPTION_REVIEW">EXCEPTION_REVIEW — Revisão de Exceção Legal</option>
                  <option value="SUPERVISOR_REVIEW">SUPERVISOR_REVIEW — Encaminhar Parecer N3</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">FUNDAMENTAÇÃO TÉCNICA:</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Fundamentação com citação de diploma legal..."
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white placeholder-neutral-600 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-emerald-400" />
                  <span>SENHA IAM DO ANALISTA JURÍDICO:</span>
                </label>
                <input
                  type="password"
                  value={operatorPassword}
                  onChange={(e) => setOperatorPassword(e.target.value)}
                  placeholder="Introduza a sua credencial forte..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
                />
                <span className="text-neutral-500 text-[7.5px] mt-0.5 block">
                  Assinatura vinculada à credencial institucional do MINJUSDH.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setIsResolveModalOpen(false)} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 font-bold">
                CANCELAR
              </button>
              <button onClick={handleResolveCompliance} className="px-3 py-1.5 rounded bg-emerald-600 text-neutral-950 font-black hover:bg-emerald-500 shadow-sm">
                ASSINAR E HOMOLOGAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
