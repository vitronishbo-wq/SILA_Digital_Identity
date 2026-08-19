import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  RefreshCw,
  Send,
  Database,
  Building,
  KeyRound,
  ChevronRight,
  Scale,
  AlertCircle,
  Filter,
  Eye,
  FileX2,
  FileSearch,
  Cpu,
  BadgeAlert,
  HelpCircle,
  FileCheck2,
  GitCompare,
  Layers,
  ArrowRight,
  ShieldCheck,
  ServerOff,
  Wifi,
} from 'lucide-react';
import {
  ValidationDossier,
  ValidationAuditEvent,
} from '../../../../types/validations';
import {
  DocumentalValidation,
  DocumentPresentedMatrixItem,
  DocumentOfficialSourceRef,
  DocumentCrossReferenceItem,
  DocumentExceptionItem,
  DocumentalEngineStatus,
} from '../../../../types/documentalValidation';

interface ValidationsDocumentalTabProps {
  dossiers: ValidationDossier[];
  activeDossierId: string;
  onSelectDossier: (dossierId: string) => void;
  onUpdateDossier: (updated: ValidationDossier) => void;
  onAddAuditEvent: (event: ValidationAuditEvent) => void;
}

export const ValidationsDocumentalTab: React.FC<ValidationsDocumentalTabProps> = ({
  dossiers,
  activeDossierId,
  onSelectDossier,
  onUpdateDossier,
  onAddAuditEvent,
}) => {
  // 8 Sub-Vistas Canónicas do Módulo 05
  const [activeSubView, setActiveSubView] = useState<
    | '01_CONTEXTO'
    | '02_DOCUMENTOS'
    | '03_OCR'
    | '04_AUTENTICIDADE'
    | '05_CONFRONTO'
    | '06_EXCECOES'
    | '07_RESULTADO'
    | '08_AUDITORIA'
  >('01_CONTEXTO');

  // Operador IAM autenticado
  const currentOperator = {
    operatorId: 'VAL-N1-0084',
    operatorName: 'Carlos Van-Dúnem',
    role: 'VALIDADOR_N1' as const,
    terminalId: 'TERM-VAL-LUA-01',
    organization: 'DNI_MINJUSDH' as const,
  };

  // Dossiê selecionado
  const dossier = dossiers.find((d) => d.dossierId === activeDossierId) || dossiers[0];

  // Documento selecionado para inspeção técnica detalhada
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Estados dos Modais Operacionais
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [supervisorPriority, setSupervisorPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('HIGH');
  const [supervisorReason, setSupervisorReason] = useState('');

  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [exceptionTitle, setExceptionTitle] = useState('');
  const [exceptionSeverity, setExceptionSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [exceptionDescription, setExceptionDescription] = useState('');

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveType, setResolveType] = useState<
    'CONFORM_APPROVED' | 'DIVERGENCE_JUSTIFIED' | 'INSUFFICIENT_SANEAMENTO' | 'SUSPECT_SUPERVISOR_REFERRED'
  >('CONFORM_APPROVED');
  const [resolveNotes, setResolveNotes] = useState('');
  const [operatorPassword, setOperatorPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Estado transitório do motor
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // GERAÇÃO / CONSUMO EXCLUSIVO DE DADOS DEMONSTRATIVOS DOCUMENTAIS (RIGOROSOS & FICTÍCIOS)
  const docVal: DocumentalValidation = useMemo(() => {
    let docs: DocumentPresentedMatrixItem[] = [];
    let sources: DocumentOfficialSourceRef[] = [
      { sourceCode: 'SIRGC_NACIONAL', sourceName: 'Sistema Integrado do Registo Civil (SIRGC)', endpointType: 'SIRGC_API', availabilityStatus: 'ONLINE', lastCheckedAt: '2026-08-15T09:15:20Z', recordsIndexed: 14200500 },
      { sourceCode: 'DNI_MASTER_ARCHIVE', sourceName: 'Arquivo Mestre DNI (1975–2026)', endpointType: 'DNI_HISTORICAL_ARCHIVE', availabilityStatus: 'ONLINE', lastCheckedAt: '2026-08-15T09:15:21Z', recordsIndexed: 18900200 },
      { sourceCode: 'ICP_AO_CRL', sourceName: 'Infraestrutura de Chaves Públicas de Angola (ICP-AO)', endpointType: 'ICP_AO_CRL', availabilityStatus: 'ONLINE', lastCheckedAt: '2026-08-15T09:15:22Z', recordsIndexed: 5400 },
      { sourceCode: 'CONS_LOBITO_REMOTE', sourceName: 'Conservatória do Registo Civil do Lobito (Posto Local)', endpointType: 'CONSERVATORIA_LOCAL', availabilityStatus: dossier.dossierId === 'DOS-2026-AGO-00195' ? 'SOURCE_UNAVAILABLE' : 'ONLINE', lastCheckedAt: '2026-08-15T09:15:23Z', recordsIndexed: 89000 }
    ];

    let confrontations: DocumentCrossReferenceItem[] = [];
    let exceptions: DocumentExceptionItem[] = [];

    if (dossier.dossierId === 'DOS-2026-AGO-00194') {
      // Caso de Demonstração 1: BI Anterior com divergência de sufixo e assento de nascimento
      docs = [
        {
          documentId: 'DOC-194-01',
          documentType: 'BI_ANTERIOR',
          documentNumber: '001948211BA033',
          issuingAuthority: 'DNI / MINJUSDH - Benguela',
          issueDate: '2015-04-10',
          expiryDate: '2025-04-10',
          holderName: 'ANTONIO FRANCISCO KIALA',
          documentState: 'VERIFIED',
          ocrStatus: 'SUCCESS',
          ocrQualityScore: 94.5,
          ocrFields: [
            { fieldName: 'NOME_COMPLETO', fieldLabel: 'Nome Completo', extractedValue: 'ANTONIO FRANCISCO KIALA', officialExpectedValue: 'ANTONIO FRANCISCO KIALA', confidenceScore: 98, isMatch: true, isDivergence: false },
            { fieldName: 'NUMERO_BI', fieldLabel: 'Número do Bilhete', extractedValue: '001948211BA033', officialExpectedValue: '001948211BA033', confidenceScore: 99, isMatch: true, isDivergence: false },
            { fieldName: 'NASCIMENTO', fieldLabel: 'Data Nascimento', extractedValue: '1988-11-04', officialExpectedValue: '1988-11-04', confidenceScore: 96, isMatch: true, isDivergence: false },
            { fieldName: 'MAE', fieldLabel: 'Mãe', extractedValue: 'TERESA MANUELA KIALA', officialExpectedValue: 'TERESA MANUELA KIALA', confidenceScore: 93, isMatch: true, isDivergence: false },
            { fieldName: 'PAI', fieldLabel: 'Pai', extractedValue: 'FRANCISCO KIALA', officialExpectedValue: 'FRANCISCO KIALA', confidenceScore: 95, isMatch: true, isDivergence: false },
          ],
          authenticityStatus: 'EXPIRED',
          consistencyStatus: 'CONSISTENT',
          processMatchStatus: 'MATCH',
          officialSourceReference: 'DNI_MASTER_ARCHIVE',
          officialSourceStatus: 'ONLINE_VERIFIED',
          resultSummary: 'BI Anterior caducado em 2025 (motivo de renovação legítimo).',
          severity: 'LOW',
          requiredAction: 'CONFIRM',
        },
        {
          documentId: 'DOC-194-02',
          documentType: 'ASSENTO_NASCIMENTO',
          documentNumber: '1988/0912-LOB',
          issuingAuthority: 'Conservatória do Registo Civil do Lobito',
          issueDate: '2026-06-12',
          holderName: 'ANTONIO FRANCISCO KIALA',
          documentState: 'VERIFIED',
          ocrStatus: 'SUCCESS',
          ocrQualityScore: 88.0,
          ocrFields: [
            { fieldName: 'NOME_ASSENTADO', fieldLabel: 'Nome Assentado', extractedValue: 'ANTONIO FRANCISCO KIALA', officialExpectedValue: 'ANTONIO FRANCISCO KIALA', confidenceScore: 92, isMatch: true, isDivergence: false },
            { fieldName: 'NUM_ASSENTO', fieldLabel: 'Nº do Assento', extractedValue: '1988/0912-LOB', officialExpectedValue: '1988/0912-LOB', confidenceScore: 95, isMatch: true, isDivergence: false },
          ],
          authenticityStatus: 'VALID',
          consistencyStatus: 'CONSISTENT',
          processMatchStatus: 'MATCH',
          officialSourceReference: 'SIRGC_NACIONAL',
          officialSourceStatus: 'ONLINE_VERIFIED',
          resultSummary: 'Certidão conforme emitida electronicamente com assinatura ICP-AO.',
          severity: 'LOW',
          requiredAction: 'CONFIRM',
        }
      ];

      confrontations = [
        { targetDomain: 'PROCESSO', fieldOrVector: 'Nome do Titular', documentValue: 'ANTONIO FRANCISCO KIALA', targetValue: 'ANTONIO FRANCISCO KIALA', confrontationType: 'COINCIDENCIA', isExplainable: true, notes: 'Identidade idêntica entre BI anterior e formulário.' },
        { targetDomain: 'REGISTO_CIVIL', fieldOrVector: 'Assento Nº', documentValue: '1988/0912-LOB', targetValue: '1988/0912-LOB', confrontationType: 'COINCIDENCIA', isExplainable: true, notes: 'Assento confirmado no SIRGC.' },
        { targetDomain: '02_BIOGRAFICA', fieldOrVector: 'Filiação Completa', documentValue: 'FRANCISCO KIALA / TERESA MANUELA KIALA', targetValue: 'FRANCISCO KIALA / TERESA MANUELA KIALA', confrontationType: 'COINCIDENCIA', isExplainable: true, notes: 'Pais coincidentes.' },
        { targetDomain: '03_BIOMETRICA', fieldOrVector: 'Vínculo Biométrico Titular', documentValue: 'Template BI 2015', targetValue: 'Captura 2026 (92%)', confrontationType: 'COINCIDENCIA', isExplainable: true, notes: 'Correspondência dactilar com BI histórico.' },
        { targetDomain: '04_UNICIDADE', fieldOrVector: 'Candidato Homónimo Sufixo JÚNIOR', documentValue: 'ANTONIO FRANCISCO KIALA', targetValue: 'Candidato: ... JUNIOR', confrontationType: 'DIVERGENCIA', isExplainable: true, notes: 'Documento original comprova ausência do sufixo JÚNIOR no requerente.' },
      ];
    } else if (dossier.dossierId === 'DOS-2026-AGO-00196') {
      // Caso de Demonstração 2: Divergência de Nome por Casamento (Averbação Válida)
      docs = [
        {
          documentId: 'DOC-196-01',
          documentType: 'ASSENTO_CASAMENTO',
          documentNumber: 'CAS-2026-BENG-0081',
          issuingAuthority: '1ª Conservatória do Registo Civil de Benguela',
          issueDate: '2026-01-15',
          holderName: 'ANA PAULA CHIVELA DA SILVA',
          documentState: 'VERIFIED',
          ocrStatus: 'SUCCESS',
          ocrQualityScore: 96.0,
          ocrFields: [
            { fieldName: 'NOME_SOLTEIRA', fieldLabel: 'Nome de Solteira', extractedValue: 'ANA PAULA CHIVELA', officialExpectedValue: 'ANA PAULA CHIVELA', confidenceScore: 99, isMatch: true, isDivergence: false },
            { fieldName: 'NOME_ADOTADO', fieldLabel: 'Nome Adotado', extractedValue: 'ANA PAULA CHIVELA DA SILVA', officialExpectedValue: 'ANA PAULA CHIVELA DA SILVA', confidenceScore: 98, isMatch: true, isDivergence: false, notes: 'Adição de apelido marital.' },
          ],
          authenticityStatus: 'VALID',
          consistencyStatus: 'DIVERGENT',
          processMatchStatus: 'MATCH',
          officialSourceReference: 'SIRGC_NACIONAL',
          officialSourceStatus: 'ONLINE_VERIFIED',
          resultSummary: 'Divergência nominal explicada e justificada pelo assento de casamento.',
          severity: 'LOW',
          requiredAction: 'CONFIRM',
        }
      ];

      confrontations = [
        { targetDomain: 'PROCESSO', fieldOrVector: 'Nome do Titular', documentValue: 'ANA PAULA CHIVELA DA SILVA', targetValue: 'ANA PAULA CHIVELA DA SILVA', confrontationType: 'COINCIDENCIA', isExplainable: true, notes: 'Conforme processo de renovação por alteração de estado civil.' },
        { targetDomain: 'REGISTO_CIVIL', fieldOrVector: 'Nome de Solteira', documentValue: 'ANA PAULA CHIVELA', targetValue: 'ANA PAULA CHIVELA', confrontationType: 'COINCIDENCIA', isExplainable: true, notes: 'Assento de nascimento de origem sem apelido marital.' },
        { targetDomain: '02_BIOGRAFICA', fieldOrVector: 'Averbação de Casamento', documentValue: 'CAS-2026-BENG-0081', targetValue: 'AVERBAMENTO_PRESENTE', confrontationType: 'COINCIDENCIA', isExplainable: true, notes: 'Averbação validada no 02.' },
      ];
    } else if (dossier.dossierId === 'DOS-2026-AGO-00195') {
      // Caso de Demonstração 3: Fonte Oficial Indisponível (Conservatória Local Offline)
      docs = [
        {
          documentId: 'DOC-195-01',
          documentType: 'CERTIDAO_NASCIMENTO',
          documentNumber: 'CERT-2026-LOB-991',
          issuingAuthority: 'Conservatória do Lobito',
          issueDate: '2026-05-10',
          holderName: dossier.citizenName,
          documentState: 'ATTACHED',
          ocrStatus: 'PARTIAL',
          ocrQualityScore: 71.0,
          ocrFields: [
            { fieldName: 'NOME_TITULAR', fieldLabel: 'Nome', extractedValue: dossier.citizenName, officialExpectedValue: dossier.citizenName, confidenceScore: 82, isMatch: true, isDivergence: false },
          ],
          authenticityStatus: 'SOURCE_UNAVAILABLE',
          consistencyStatus: 'UNCHECKED',
          processMatchStatus: 'PARTIAL_MATCH',
          officialSourceReference: 'CONS_LOBITO_REMOTE',
          officialSourceStatus: 'SOURCE_UNAVAILABLE',
          resultSummary: 'Servidor local da conservatória emissora inacessível temporariamente.',
          severity: 'MEDIUM',
          requiredAction: 'MANUAL_CONFRONTATION',
        }
      ];

      exceptions = [
        { exceptionId: 'EXC-195-01', documentId: 'DOC-195-01', severity: 'MEDIUM', code: 'EXC_SOURCE_UNAVAILABLE', title: 'Fonte Emissora Local Offline', description: 'Impossibilidade temporária de consulta à base local da Conservatória do Lobito. Não constitui irregularidade material.', requiresSupervisorAction: false, isResolved: false }
      ];

      confrontations = [
        { targetDomain: 'REGISTO_CIVIL', fieldOrVector: 'Consulta Online Fonte', documentValue: 'CERT-2026-LOB-991', targetValue: 'OFFLINE', confrontationType: 'AUSENCIA_INFO', isExplainable: true, notes: 'Aguardando reestabelecimento do enlace de dados com a conservatória.' }
      ];
    } else {
      // Caso de Demonstração Padrão Conforme
      docs = [
        {
          documentId: `DOC-${dossier.dossierId.substring(4)}-01`,
          documentType: 'BI_ANTERIOR',
          documentNumber: dossier.nationalIdNumber || '002819231HA011',
          issuingAuthority: 'DNI / MINJUSDH - Luanda',
          issueDate: '2016-08-10',
          expiryDate: '2026-08-10',
          holderName: dossier.citizenName,
          documentState: 'VERIFIED',
          ocrStatus: 'SUCCESS',
          ocrQualityScore: 97.0,
          ocrFields: [
            { fieldName: 'NOME_TITULAR', fieldLabel: 'Nome Completo', extractedValue: dossier.citizenName, officialExpectedValue: dossier.citizenName, confidenceScore: 99, isMatch: true, isDivergence: false },
          ],
          authenticityStatus: 'VALID',
          consistencyStatus: 'CONSISTENT',
          processMatchStatus: 'MATCH',
          officialSourceReference: 'DNI_MASTER_ARCHIVE',
          officialSourceStatus: 'ONLINE_VERIFIED',
          resultSummary: 'Documento oficial válido e autenticado ICP-AO.',
          severity: 'LOW',
          requiredAction: 'CONFIRM',
        }
      ];

      confrontations = [
        { targetDomain: 'PROCESSO', fieldOrVector: 'Identificação Geral', documentValue: dossier.citizenName, targetValue: dossier.citizenName, confrontationType: 'COINCIDENCIA', isExplainable: true, notes: 'Conformidade 100% atestada.' }
      ];
    }

    return {
      validationId: `VAL-DOC-2026-${dossier.dossierId.replace(/[^0-9]/g, '')}`,
      dossierId: dossier.dossierId,
      processId: dossier.processId,
      documentSetId: `DOCSET-${dossier.dossierId.substring(4)}`,
      engineCode: 'DOC_INTEGRITY_SERVICE',
      engineStatus: exceptions.length > 0 ? 'DOCUMENT_EXCEPTION' : 'CONFIRMED_RESULT',
      documents: docs,
      sourceReferences: sources,
      ocrResult: {
        overallQualityScore: docs.reduce((acc, d) => acc + d.ocrQualityScore, 0) / docs.length,
        totalFieldsExtracted: docs.reduce((acc, d) => acc + d.ocrFields.length, 0),
        fieldsCoincidentCount: docs.reduce((acc, d) => acc + d.ocrFields.filter(f => f.isMatch).length, 0),
        fieldsDivergentCount: docs.reduce((acc, d) => acc + d.ocrFields.filter(f => f.isDivergence).length, 0),
        status: 'COMPLETE',
      },
      authenticityResult: {
        overallAuthenticity: docs.some(d => d.authenticityStatus === 'SOURCE_UNAVAILABLE') ? 'SOURCE_UNAVAILABLE' : 'VALID',
        icpAoSignatureValid: true,
        physicalSecurityFeaturesScore: 92.5,
        status: 'AUTHENTIC',
      },
      consistencyResult: {
        isConsistent: !docs.some(d => d.consistencyStatus === 'INCONSISTENT'),
        divergenceCount: docs.filter(d => d.consistencyStatus === 'DIVERGENT').length,
        inconsistencyCount: docs.filter(d => d.consistencyStatus === 'INCONSISTENT').length,
        notes: 'Análise de consistência multi-fonte executada.',
      },
      crossReferenceResult: {
        confrontations,
        overallMatch: !confrontations.some(c => c.confrontationType === 'INCONSISTENCIA_MATERIAL'),
      },
      documentaryResult: {
        resultCode: exceptions.length > 0 ? 'INSUFFICIENT_SANEAMENTO' : 'CONFORM_APPROVED',
        summary: 'Matriz documental validada e confrontada contra o SIRGC e arquivo histórico.',
        criticalFlagsCount: exceptions.filter(e => e.severity === 'CRITICAL').length,
      },
      exceptions,
      reviewerId: currentOperator.operatorId,
      reviewerName: currentOperator.operatorName,
      reviewerRole: currentOperator.role,
      reviewedAt: '2026-08-15T09:15:24Z',
      evaluatedAt: '2026-08-15T09:15:24Z',
      previousHash: dossier.previousHash,
      currentHash: `hash_doc_${dossier.dossierId.substring(4)}_k91`,
      digitalSignature: `SIG_DOC_VAL_${dossier.dossierId.substring(4)}_ICP`,
      auditChainRef: dossier.auditChainRef,
    };
  }, [dossier]);

  const activeDoc = useMemo(() => {
    if (selectedDocId) {
      return docVal.documents.find((d) => d.documentId === selectedDocId) || docVal.documents[0];
    }
    return docVal.documents[0] || null;
  }, [docVal.documents, selectedDocId]);

  // COMANDO: EXECUTE_DOCUMENT_ANALYSIS
  const handleExecuteAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);

      const auditEvt: ValidationAuditEvent = {
        eventId: `EVT_DOC_ANALYSIS_${Date.now()}`,
        dossierId: dossier.dossierId,
        operatorId: currentOperator.operatorId,
        operatorRole: currentOperator.role,
        command: 'EXECUTE_DOCUMENT_ANALYSIS',
        previousState: dossier.status,
        newState: dossier.status,
        reason: `Execução da esteira completa de análise documental (OCR, Autenticidade ICP-AO, Fontes Oficiais e Confronto Cruzado).`,
        timestamp: new Date().toISOString(),
        previousHash: docVal.currentHash,
        currentHash: `hash_doc_an_${Date.now()}`,
        digitalSignature: `SIG_DOC_EXEC_${Date.now()}`,
        auditChainRef: docVal.auditChainRef,
        terminalId: currentOperator.terminalId,
        payloadSummary: `Análise Documental Concluída. Docs: ${docVal.documents.length}. Qualidade OCR: ${docVal.ocrResult.overallQualityScore}%.`,
        silaGlobalAuditRef: `SILA_DOC_EXEC_${Date.now()}`,
      };
      onAddAuditEvent(auditEvt);
    }, 600);
  };

  // COMANDO: RECORD_EXCEPTION
  const handleRecordException = () => {
    if (!exceptionTitle.trim() || !exceptionDescription.trim()) return;

    const auditEvt: ValidationAuditEvent = {
      eventId: `EVT_DOC_EXC_${Date.now()}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'RECORD_EXCEPTION',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Registo de exceção documental: [${exceptionSeverity}] ${exceptionTitle}. Descrição: ${exceptionDescription}`,
      timestamp: new Date().toISOString(),
      previousHash: docVal.currentHash,
      currentHash: `hash_doc_exc_${Date.now()}`,
      digitalSignature: `SIG_DOC_EXC_${Date.now()}`,
      auditChainRef: docVal.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Exceção Documental Registada. Severidade: ${exceptionSeverity}.`,
      silaGlobalAuditRef: `SILA_DOC_EXC_${Date.now()}`,
    };
    onAddAuditEvent(auditEvt);

    setIsExceptionModalOpen(false);
    setExceptionTitle('');
    setExceptionDescription('');
  };

  // COMANDO: ESCALATE_TO_SUPERVISOR
  const handleEscalateToSupervisor = () => {
    if (!supervisorReason.trim()) return;

    const auditEvt: ValidationAuditEvent = {
      eventId: `EVT_DOC_ESCALATE_${Date.now()}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'ESCALATE_TO_SUPERVISOR',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Dossiê documental encaminhado para Mesa Supervisora N3. Prioridade: ${supervisorPriority}. Parecer: ${supervisorReason}`,
      timestamp: new Date().toISOString(),
      previousHash: docVal.currentHash,
      currentHash: `hash_doc_sup_${Date.now()}`,
      digitalSignature: `SIG_DOC_SUP_${Date.now()}`,
      auditChainRef: docVal.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Encaminhamento Documental N3. Motivo: ${supervisorReason}`,
      silaGlobalAuditRef: `SILA_DOC_SUP_${Date.now()}`,
    };
    onAddAuditEvent(auditEvt);

    setIsSupervisorModalOpen(false);
    setSupervisorReason('');
  };

  // COMANDO: RESOLVE / CONFIRM_RESULT COM REAUTENTICAÇÃO FORTE IAM
  const handleResolveDocumental = () => {
    if (!operatorPassword.trim()) {
      setAuthError('Autenticação forte obrigatória: introduza a senha IAM do operador.');
      return;
    }
    if (operatorPassword !== '123456' && operatorPassword.length < 4) {
      setAuthError('Senha de operador inválida para assinatura criptográfica.');
      return;
    }

    // Trava RBAC: N1 não pode declarar suspeitas de fraude ou indeferimentos graves
    if (
      currentOperator.role === 'VALIDADOR_N1' &&
      resolveType === 'SUSPECT_SUPERVISOR_REFERRED' &&
      docVal.exceptions.some(e => e.severity === 'CRITICAL')
    ) {
      setAuthError(
        'Regra Institucional: Casos com severidade CRITICAL exigem encaminhamento formal para a Mesa Supervisora N3.'
      );
      return;
    }

    const auditEvt: ValidationAuditEvent = {
      eventId: `EVT_DOC_RESOLVE_${Date.now()}`,
      dossierId: dossier.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role,
      command: 'RESOLVE',
      previousState: dossier.status,
      newState: dossier.status,
      reason: `Resolução de conformidade documental homologada com autenticação forte. Veredito: ${resolveType}. Justificativa: ${resolveNotes || 'Conforme'}`,
      timestamp: new Date().toISOString(),
      previousHash: docVal.currentHash,
      currentHash: `hash_doc_res_${Date.now()}`,
      digitalSignature: `SIG_DOC_RES_${Date.now()}`,
      auditChainRef: docVal.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Resolução Documental: ${resolveType}. Operador: ${currentOperator.operatorName} (${currentOperator.role})`,
      silaGlobalAuditRef: `SILA_DOC_RES_${Date.now()}`,
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
          CABEÇALHO DE COMANDO & REGRA CRÍTICA INSTITUCIONAL (05)
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold tracking-wider">
                  05 — VALIDAÇÃO DOCUMENTAL & CONFRONTO DE AUTENTICIDADE
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[8px] font-bold">
                  SILA v2026.1
                </span>
              </div>
              <div className="text-neutral-500 text-[8px]">
                Matriz de Documentos • OCR • Chancelas ICP-AO • Confronto Multi-Domínio (02, 03, 04, Registo Civil)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-lg">
              <span className="text-neutral-500 text-[8px]">STATUS MOTOR:</span>
              <span
                className={`font-black uppercase px-1.5 py-0.5 rounded ${
                  docVal.engineStatus === 'CONFIRMED_RESULT' || docVal.engineStatus === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : docVal.engineStatus === 'DOCUMENT_EXCEPTION' || docVal.engineStatus === 'SUPERVISOR_REVIEW'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {docVal.engineStatus}
              </span>
            </div>

            <button
              onClick={handleExecuteAnalysis}
              disabled={isAnalyzing}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 font-bold border border-neutral-700 flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isAnalyzing ? 'ANALISANDO...' : 'EXEC_ANALYSIS'}</span>
            </button>

            <button
              onClick={() => setIsExceptionModalOpen(true)}
              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40 flex items-center gap-1 transition"
            >
              <BadgeAlert className="w-3 h-3" />
              <span>REGISTAR EXCEÇÃO</span>
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

        {/* REGRA INSTITUCIONAL CRÍTICA VINCULATIVA */}
        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-2 flex items-center justify-between text-cyan-300/90 text-[8px]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              <strong>REGRA INSTITUCIONAL VINCULATIVA:</strong>{' '}
              <span className="text-cyan-200 font-bold">DOCUMENT_MISMATCH ≠ FRAUD</span>,{' '}
              <span className="text-cyan-200 font-bold">DOCUMENT_SUSPECT ≠ FRAUD</span> e{' '}
              <span className="text-cyan-200 font-bold">INCONSISTENCY ≠ FRAUD</span>. Falhas de leitura OCR ou fontes oficiais indisponíveis (SOURCE_UNAVAILABLE) não autorizam rejeição ou imputação de dolo em N1.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 font-mono text-[7.5px] border border-neutral-800">
            MINJUSDH / DNI ART. 34º
          </span>
        </div>

        {/* FILA DE SELEÇÃO DE CASOS */}
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
                  setSelectedDocId(null);
                }}
                className={`px-2 py-1 rounded border text-left shrink-0 transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
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
            { id: '02_DOCUMENTOS', label: `02. DOCUMENTOS (${docVal.documents.length})`, icon: Layers },
            { id: '03_OCR', label: '03. OCR & EXTRAÇÃO', icon: FileSearch },
            { id: '04_AUTENTICIDADE', label: '04. AUTENTICIDADE', icon: Cpu },
            { id: '05_CONFRONTO', label: '05. CONFRONTO', icon: GitCompare },
            { id: '06_EXCECOES', label: `06. EXCEÇÕES (${docVal.exceptions.length})`, icon: BadgeAlert },
            { id: '07_RESULTADO', label: '07. RESULTADO', icon: Scale },
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
                    ? 'bg-neutral-900 border-neutral-700 text-cyan-400 border-b-neutral-900'
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
          SUB-VIEW 01: CONTEXTO DOCUMENTAL
         ========================================================================= */}
      {activeSubView === '01_CONTEXTO' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">CIDADÃO REQUERENTE</div>
              <div className="text-sm font-black text-white truncate mt-0.5">{dossier.citizenName}</div>
              <div className="text-neutral-400 text-[8px] mt-1 font-mono">
                ID: {dossier.citizenId} • BI: {dossier.nationalIdNumber || 'PRIMEIRA EMISSÃO'}
              </div>
            </div>

            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">TOTAL DE DOCUMENTOS NO LOTE</div>
              <div className="text-sm font-black text-cyan-400 mt-0.5">{docVal.documents.length} Apresentados</div>
              <div className="text-neutral-400 text-[8px] mt-1 font-mono">
                Lote: {docVal.documentSetId}
              </div>
            </div>

            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">QUALIDADE GERAL OCR</div>
              <div className="text-sm font-black text-emerald-400 mt-0.5">{docVal.ocrResult.overallQualityScore}%</div>
              <div className="text-neutral-400 text-[8px] mt-1">
                Campos Extraídos: {docVal.ocrResult.totalFieldsExtracted} ({docVal.ocrResult.fieldsCoincidentCount} Coincidentes)
              </div>
            </div>

            <div className="bg-[#0b0d11] border border-neutral-800 rounded-lg p-2.5">
              <div className="text-neutral-500 text-[8px] uppercase">ESTADO DE AUTENTICIDADE</div>
              <div className="text-sm font-black text-white mt-0.5">{docVal.authenticityResult.overallAuthenticity}</div>
              <div className="text-neutral-400 text-[8px] mt-1">
                Chave ICP-AO: {docVal.authenticityResult.icpAoSignatureValid ? 'VÁLIDA' : 'NÃO VERIFICADA'}
              </div>
            </div>
          </div>

          {/* FONTES OFICIAIS DISPONÍVEIS */}
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-neutral-200 font-bold text-[9px]">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>REPOSITÓRIOS E FONTES OFICIAIS SOBERANAS CONSULTADAS</span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Consulta Federada em Tempo Real (SILA Engine v2026.1)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {docVal.sourceReferences.map((src) => (
                <div key={src.sourceCode} className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-[8.5px]">{src.sourceName}</span>
                    </div>
                    <div className="text-neutral-500 text-[8px]">
                      Tipo: {src.endpointType} • Registos Indexados: {src.recordsIndexed.toLocaleString('pt-AO')}
                    </div>
                  </div>
                  <div className="text-right">
                    {src.availabilityStatus === 'ONLINE' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] font-bold flex items-center gap-1">
                        <Wifi className="w-2.5 h-2.5" /> ONLINE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] font-bold flex items-center gap-1">
                        <ServerOff className="w-2.5 h-2.5" /> INDISPONÍVEL
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 02: MATRIZ DE DOCUMENTOS APRESENTADOS
         ========================================================================= */}
      {activeSubView === '02_DOCUMENTOS' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>MATRIZ COMPLETA DE DOCUMENTOS APRESENTADOS</span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Conformidade individual de cada documento instruído no processo
              </span>
            </div>

            <div className="overflow-x-auto border border-neutral-800 rounded-lg">
              <table className="w-full text-left text-[8.5px] border-collapse">
                <thead>
                  <tr className="bg-neutral-900/90 text-neutral-400 border-b border-neutral-800 uppercase font-bold text-[7.5px]">
                    <th className="p-2">TIPO DOCUMENTAL</th>
                    <th className="p-2">NÚMERO / REF</th>
                    <th className="p-2">AUTORIDADE EMISSORA</th>
                    <th className="p-2">EMISSÃO / VALIDADE</th>
                    <th className="p-2 text-center">OCR</th>
                    <th className="p-2 text-center">AUTENTICIDADE</th>
                    <th className="p-2 text-center">FONTE OFICIAL</th>
                    <th className="p-2 text-center">SEVERIDADE</th>
                    <th className="p-2 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/60">
                  {docVal.documents.map((doc) => (
                    <tr key={doc.documentId} className="hover:bg-neutral-900/40 transition">
                      <td className="p-2 font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>{doc.documentType}</span>
                      </td>
                      <td className="p-2 font-mono text-cyan-300">{doc.documentNumber}</td>
                      <td className="p-2 text-neutral-400 truncate max-w-[140px]">{doc.issuingAuthority}</td>
                      <td className="p-2 text-neutral-300">
                        {doc.issueDate} {doc.expiryDate ? `➔ ${doc.expiryDate}` : ''}
                      </td>
                      <td className="p-2 text-center font-bold text-emerald-400">{doc.ocrQualityScore}%</td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold border ${
                            doc.authenticityStatus === 'VALID'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : doc.authenticityStatus === 'EXPIRED'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : doc.authenticityStatus === 'SOURCE_UNAVAILABLE'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {doc.authenticityStatus}
                        </span>
                      </td>
                      <td className="p-2 text-center font-mono text-[7.5px] text-neutral-400">
                        {doc.officialSourceStatus}
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold ${
                            doc.severity === 'LOW'
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : doc.severity === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-300'
                              : 'bg-rose-500/10 text-rose-300'
                          }`}
                        >
                          {doc.severity}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => {
                            setSelectedDocId(doc.documentId);
                            setActiveSubView('03_OCR');
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
          SUB-VIEW 03: OCR & EXTRAÇÃO TEXTUAL
         ========================================================================= */}
      {activeSubView === '03_OCR' && (
        <div className="space-y-3">
          {!activeDoc ? (
            <div className="p-6 bg-[#0b0d11] border border-neutral-800 rounded-xl text-center text-neutral-500">
              Nenhum documento selecionado.
            </div>
          ) : (
            <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                <div>
                  <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                    <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
                    <span>EXTRAÇÃO OCR & ANÁLISE DE CONFIANÇA TEXTUAL</span>
                  </div>
                  <div className="text-neutral-500 text-[8px]">
                    Documento Ativo: <strong className="text-white">{activeDoc.documentType}</strong> (Nº {activeDoc.documentNumber})
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 text-[8px] border border-neutral-800">
                    CONFIANÇA MÉDIA OCR: <strong className="text-cyan-400">{activeDoc.ocrQualityScore}%</strong>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-neutral-800 rounded-lg">
                <table className="w-full text-left text-[8.5px] border-collapse">
                  <thead>
                    <tr className="bg-neutral-900/90 text-neutral-400 border-b border-neutral-800 uppercase font-bold text-[7.5px]">
                      <th className="p-2">CAMPO DOCUMENTAL</th>
                      <th className="p-2 bg-neutral-900/40">VALOR EXTRAÍDO OCR</th>
                      <th className="p-2 bg-cyan-950/20 text-cyan-300">VALOR OFICIAL ESPERADO</th>
                      <th className="p-2 text-center">CONFIANÇA</th>
                      <th className="p-2 text-center">CONFORMIDADE</th>
                      <th className="p-2">OBSERVAÇÕES EXPLICATIVAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/60">
                    {activeDoc.ocrFields.map((field, i) => (
                      <tr key={i} className="hover:bg-neutral-900/40 transition">
                        <td className="p-2 font-bold text-neutral-300">{field.fieldLabel}</td>
                        <td className="p-2 text-white font-mono">{field.extractedValue}</td>
                        <td className="p-2 text-cyan-200 font-mono font-bold bg-cyan-950/10">
                          {field.officialExpectedValue || '—'}
                        </td>
                        <td className="p-2 text-center text-cyan-400 font-bold">{field.confidenceScore}%</td>
                        <td className="p-2 text-center">
                          {field.isMatch ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[7.5px] font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5" /> COINCIDENTE
                            </span>
                          ) : field.isDivergence ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[7.5px] font-bold">
                              <AlertCircle className="w-2.5 h-2.5" /> DIVERGÊNCIA
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[7.5px]">
                              INFORMATIVO
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-neutral-300 text-[8px]">{field.notes || 'Conformidade validada.'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 04: AUTENTICIDADE & CHANCELAS
         ========================================================================= */}
      {activeSubView === '04_AUTENTICIDADE' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>VERIFICAÇÃO DE AUTENTICIDADE & ELEMENTOS DE SEGURANÇA ICP-AO</span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Score Físico: <strong className="text-emerald-400">{docVal.authenticityResult.physicalSecurityFeaturesScore}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-2">
                <div className="text-neutral-300 font-bold text-[8.5px] border-b border-neutral-800/80 pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>ASSINATURA DIGITAL ICP-AO</span>
                </div>
                <div className="space-y-1.5 text-[8.5px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Validade Criptográfica:</span>
                    <span className="text-emerald-400 font-bold">VÁLIDA & ATIVA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Autoridade Certificadora:</span>
                    <span className="text-white font-mono">AC-RAIZ-ANGOLA</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-2">
                <div className="text-neutral-300 font-bold text-[8.5px] border-b border-neutral-800/80 pb-1 flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-cyan-400" />
                  <span>CRUZAMENTO DE REGISTO OFICIAL</span>
                </div>
                <div className="space-y-1.5 text-[8.5px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Registo no SIRGC:</span>
                    <span className="text-emerald-400 font-bold">CONFIRMADO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Matrícula no Arquivo:</span>
                    <span className="text-white font-mono">LIVRO A-88 / FLS 14</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-2">
                <div className="text-neutral-300 font-bold text-[8.5px] border-b border-neutral-800/80 pb-1 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>CHANCELAS DE SEGURANÇA FÍSICA</span>
                </div>
                <div className="space-y-1.5 text-[8.5px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Fibras UV & Microtexto:</span>
                    <span className="text-emerald-400 font-bold">CONFIRMADAS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Selo Branco / Holograma:</span>
                    <span className="text-emerald-400 font-bold">INTEGRO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 05: CONFRONTO MULTI-DOMÍNIO
         ========================================================================= */}
      {activeSubView === '05_CONFRONTO' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
                <span>CONFRONTO CRUZADO: DOCUMENTOS ↔ MÓDULOS 01 A 04 & REGISTO CIVIL</span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Discriminação probatória de coincidências, divergências e ausência de informação
              </span>
            </div>

            <div className="overflow-x-auto border border-neutral-800 rounded-lg">
              <table className="w-full text-left text-[8.5px] border-collapse">
                <thead>
                  <tr className="bg-neutral-900/90 text-neutral-400 border-b border-neutral-800 uppercase font-bold text-[7.5px]">
                    <th className="p-2">DOMÍNIO ALVO</th>
                    <th className="p-2">CAMPO / VETOR</th>
                    <th className="p-2">DADO DO DOCUMENTO</th>
                    <th className="p-2">DADO NO DOMÍNIO ALVO</th>
                    <th className="p-2 text-center">TIPO DE CONFRONTO</th>
                    <th className="p-2">ANÁLISE EXPLICÁVEL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/60">
                  {docVal.crossReferenceResult.confrontations.map((conf, idx) => (
                    <tr key={idx} className="hover:bg-neutral-900/40 transition">
                      <td className="p-2 font-bold text-cyan-400 font-mono">{conf.targetDomain}</td>
                      <td className="p-2 font-bold text-neutral-300">{conf.fieldOrVector}</td>
                      <td className="p-2 text-white font-mono">{conf.documentValue}</td>
                      <td className="p-2 text-neutral-300 font-mono">{conf.targetValue}</td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold border ${
                            conf.confrontationType === 'COINCIDENCIA'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : conf.confrontationType === 'DIVERGENCIA'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : conf.confrontationType === 'AUSENCIA_INFO'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {conf.confrontationType}
                        </span>
                      </td>
                      <td className="p-2 text-neutral-300 text-[8px]">{conf.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 06: EXCEÇÕES DOCUMENTAIS
         ========================================================================= */}
      {activeSubView === '06_EXCECOES' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                <BadgeAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>EXCEÇÕES E DIVERGÊNCIAS DOCUMENTAIS REGISTADAS ({docVal.exceptions.length})</span>
              </div>
              <button
                onClick={() => setIsExceptionModalOpen(true)}
                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40"
              >
                + ADICIONAR EXCEÇÃO
              </button>
            </div>

            {docVal.exceptions.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950/40 rounded-lg border border-neutral-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-neutral-200 font-bold text-sm">Nenhuma Exceção Documental Registada</div>
                <div className="text-neutral-500 text-[8px]">
                  Todos os documentos anexos encontram-se regulares e sem pendências materiais.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {docVal.exceptions.map((exc) => (
                  <div key={exc.exceptionId} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-[8.5px]">{exc.title}</span>
                        <span className="font-mono text-neutral-500 text-[8px]">{exc.code}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold ${
                            exc.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          SEVERIDADE: {exc.severity}
                        </span>
                      </div>
                      <p className="text-neutral-400 text-[8px]">{exc.description}</p>
                    </div>

                    <div>
                      {exc.requiresSupervisorAction && (
                        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[8px] font-bold border border-amber-500/30">
                          EXIGE N3
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 07: PARECER & RESULTADO TÉCNICO
         ========================================================================= */}
      {activeSubView === '07_RESULTADO' && (
        <div className="space-y-3">
          <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div>
                <div className="text-neutral-200 font-bold text-[9px] flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PARECER TÉCNICO DE CONFORMIDADE DOCUMENTAL (DISPONÍVEL PARA 06 & 07)</span>
                </div>
                <div className="text-neutral-500 text-[8px]">
                  Resultado estrito do Módulo 05 para consumo soberano pelo 06 (Compliance) e 07 (Decisão Final)
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 text-[8px] border border-neutral-800">
                OPERADOR: {currentOperator.operatorName} ({currentOperator.role})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-400 text-[8px] uppercase">STATUS DO MOTOR 05</div>
                <div className="text-base font-black text-cyan-400">{docVal.engineStatus}</div>
                <div className="text-neutral-500 text-[8px]">Autenticidade: {docVal.authenticityResult.overallAuthenticity}</div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-400 text-[8px] uppercase">RESULTADO HOMOLOGADO</div>
                <div className="text-base font-black text-emerald-400">{docVal.documentaryResult.resultCode}</div>
                <div className="text-neutral-500 text-[8px]">Data: {new Date(docVal.reviewedAt || '').toLocaleDateString('pt-AO')}</div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-400 text-[8px] uppercase">AVALIADOR RESPONSÁVEL</div>
                <div className="text-base font-black text-white">{docVal.reviewerName}</div>
                <div className="text-neutral-500 text-[8px]">Função: {docVal.reviewerRole}</div>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
              <div className="text-neutral-300 font-bold text-[8.5px]">PARECER TÉCNICO REGISTADO NO PROCESSO:</div>
              <div className="p-2.5 rounded bg-neutral-900/80 border border-neutral-800 text-neutral-200 text-[8.5px] leading-relaxed">
                {docVal.documentaryResult.summary}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
              <div className="text-neutral-500 text-[8px]">
                * O parecer documental é anexado sem alterar o status geral do dossiê.
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
                  <span>HOMOLOGAR PARECER</span>
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
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-neutral-200 font-bold text-[9px]">
                  CUSTÓDIA CRIPTOGRÁFICA & AUDITORIA DOCUMENTAL (SILA CHAIN APPEND-ONLY)
                </span>
              </div>
              <span className="text-neutral-500 text-[8px]">
                Ref Global: <strong className="text-neutral-300">{docVal.auditChainRef}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-500 text-[8px] uppercase">HASH ANTERIOR DO BLOCO (PREVIOUS_HASH)</div>
                <div className="font-mono text-[8px] text-neutral-300 break-all bg-neutral-900 p-1.5 rounded border border-neutral-800">
                  {docVal.previousHash}
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="text-neutral-500 text-[8px] uppercase">HASH ATUAL DO VETOR DOCUMENTAL (CURRENT_HASH)</div>
                <div className="font-mono text-[8px] text-emerald-400 break-all bg-neutral-900 p-1.5 rounded border border-neutral-800">
                  {docVal.currentHash}
                </div>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
              <div className="text-neutral-500 text-[8px] uppercase">ASSINATURA DIGITAL DO MOTOR (ECDSA / ICP-AO)</div>
              <div className="font-mono text-[8px] text-cyan-400 break-all bg-neutral-900 p-1.5 rounded border border-neutral-800">
                {docVal.digitalSignature}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: REGISTO DE EXCEÇÃO DOCUMENTAL
         ========================================================================= */}
      {isExceptionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-lg w-full p-4 space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <BadgeAlert className="w-4 h-4" />
                <span>REGISTAR EXCEÇÃO DOCUMENTAL</span>
              </div>
              <button onClick={() => setIsExceptionModalOpen(false)} className="text-neutral-500 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-neutral-400 block mb-1">TÍTULO DA EXCEÇÃO:</label>
                <input
                  type="text"
                  value={exceptionTitle}
                  onChange={(e) => setExceptionTitle(e.target.value)}
                  placeholder="Ex: Ilegibilidade de Carimbo na Certidão..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">NÍVEL DE SEVERIDADE:</label>
                <select
                  value={exceptionSeverity}
                  onChange={(e) => setExceptionSeverity(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                >
                  <option value="LOW">LOW — Informativo / Sem Bloqueio</option>
                  <option value="MEDIUM">MEDIUM — Divergência Explicável / Saneamento</option>
                  <option value="HIGH">HIGH — Inconsistência Material</option>
                  <option value="CRITICAL">CRITICAL — Bloqueio de Confirmação Ordinária</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">DESCRIÇÃO TÉCNICA:</label>
                <textarea
                  value={exceptionDescription}
                  onChange={(e) => setExceptionDescription(e.target.value)}
                  placeholder="Descreva detalhadamente a exceção identificada..."
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white placeholder-neutral-600 focus:border-rose-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setIsExceptionModalOpen(false)} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 font-bold">
                CANCELAR
              </button>
              <button
                onClick={handleRecordException}
                disabled={!exceptionTitle.trim() || !exceptionDescription.trim()}
                className="px-3 py-1.5 rounded bg-rose-600 text-white font-black hover:bg-rose-500 disabled:opacity-50"
              >
                REGISTAR EXCEÇÃO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ENCAMINHAMENTO PARA SUPERVISÃO (N3)
         ========================================================================= */}
      {isSupervisorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-lg w-full p-4 space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Send className="w-4 h-4" />
                <span>ENCAMINHAMENTO DE DOCUMENTO PARA SUPERVISÃO (N3)</span>
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
                  <option value="HIGH">ALTA (SLA 8 Horas - Inconsistência Documental)</option>
                  <option value="URGENT">URGENTE (SLA 2 Horas - Suspeita de Fraude Física)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">MOTIVO DO ENCAMINHAMENTO:</label>
                <textarea
                  value={supervisorReason}
                  onChange={(e) => setSupervisorReason(e.target.value)}
                  placeholder="Fundamentação técnica do encaminhamento..."
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
          MODAL 3: HOMOLOGAR COM REAUTENTICAÇÃO FORTE IAM
         ========================================================================= */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-lg w-full p-4 space-y-3 font-mono text-[9px] shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>HOMOLOGAÇÃO TÉCNICA DOCUMENTAL (COM REAUTENTICAÇÃO)</span>
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
                <label className="text-neutral-400 block mb-1">TIPO DE RESOLUÇÃO DOCUMENTAL:</label>
                <select
                  value={resolveType}
                  onChange={(e) => setResolveType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white"
                >
                  <option value="CONFORM_APPROVED">CONFORM_APPROVED — Documentos Autênticos e Conformes</option>
                  <option value="DIVERGENCE_JUSTIFIED">DIVERGENCE_JUSTIFIED — Divergência Aceite/Justificada</option>
                  <option value="INSUFFICIENT_SANEAMENTO">INSUFFICIENT_SANEAMENTO — Solicitar Saneamento de Documento</option>
                  <option value="SUSPECT_SUPERVISOR_REFERRED" disabled={currentOperator.role === 'VALIDADOR_N1' && docVal.exceptions.some(e => e.severity === 'CRITICAL')}>
                    SUSPECT_SUPERVISOR_REFERRED — Encaminhar para Parecer N3
                  </option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">JUSTIFICATIVA TÉCNICA:</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Fundamentação técnica da resolução..."
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white placeholder-neutral-600 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-cyan-400" />
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
              <button onClick={() => setIsResolveModalOpen(false)} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 font-bold">
                CANCELAR
              </button>
              <button onClick={handleResolveDocumental} className="px-3 py-1.5 rounded bg-emerald-600 text-neutral-950 font-black hover:bg-emerald-500 shadow-sm">
                ASSINAR E HOMOLOGAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
