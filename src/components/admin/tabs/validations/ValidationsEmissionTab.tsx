import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  FileText,
  Paperclip,
  FolderOpen,
  ArrowUpRight,
  UserPlus,
  Send,
  Eye,
  Scale,
  BadgeAlert,
  FileCheck,
  RotateCcw,
  KeyRound,
  ShieldCheck,
  Layers,
  History,
  Printer,
  Cpu,
  Truck,
  Check,
  X,
  RefreshCw,
  QrCode,
  Fingerprint,
} from 'lucide-react';
import {
  ValidationDossier,
  ValidationAuditEvent,
} from '../../../../types/validations';
import {
  BiEmission,
  EmissionStatus,
  EmissionOperatorRole,
  EmissionCommand,
  EmissionAuditEvent,
} from '../../../../types/biEmission';
import {
  INITIAL_BI_EMISSIONS,
  INITIAL_EMISSION_AUDIT_LOGS,
} from '../../../../data/biEmissionData';

interface ValidationsEmissionTabProps {
  dossiers: ValidationDossier[];
  activeDossierId: string;
  onSelectDossier: (dossierId: string) => void;
  onAddAuditEvent: (event: ValidationAuditEvent) => void;
}

export const ValidationsEmissionTab: React.FC<ValidationsEmissionTabProps> = ({
  dossiers,
  activeDossierId,
  onSelectDossier,
  onAddAuditEvent,
}) => {
  // 9 ZONAS OPERACIONAIS ESTRUTURADAS
  const [activeZone, setActiveZone] = useState<
    | '01_CONTEXTO'
    | '02_AUTORIZACAO'
    | '03_PERSONALIZACAO'
    | '04_SEGURANCA'
    | '05_PRODUCAO'
    | '06_QUALIDADE'
    | '07_CUSTODIA'
    | '08_ENTREGA'
    | '09_AUDITORIA'
  >('01_CONTEXTO');

  // Sessão do Operador Fabril / Engenheiro de Emissão
  const [currentOperator, setCurrentOperator] = useState<{
    operatorId: string;
    operatorName: string;
    role: EmissionOperatorRole;
    terminalId: string;
  }>({
    operatorId: 'SILA-FAC-OP-01',
    operatorName: 'Téc. Paulo Mendes (Operador Fabril)',
    role: 'EMISSION_OPERATOR',
    terminalId: 'TERM-PRINT-01',
  });

  // Base Local de Ordens de Emissão e Auditoria
  const [emissions, setEmissions] = useState<BiEmission[]>(INITIAL_BI_EMISSIONS);
  const [auditLogs, setAuditLogs] = useState<EmissionAuditEvent[]>(INITIAL_EMISSION_AUDIT_LOGS);

  // Filtros Operacionais
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Item Selecionado
  const [selectedEmissionId, setSelectedEmissionId] = useState<string>('EMI-2026-0091');

  // Modais de Ação Canónica
  const [modalMode, setModalMode] = useState<
    'NONE' | 'PERSONALIZATION' | 'SECURITY_CHECK' | 'PRODUCE' | 'QUALITY' | 'CUSTODY_DISPATCH' | 'DELIVERY'
  >('NONE');

  const [formOperatorPassword, setFormOperatorPassword] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. FILTRAGEM & ORDENAÇÃO
  const filteredAndSortedEmissions = useMemo(() => {
    return emissions
      .filter((emi) => {
        if (filterStatus !== 'ALL' && emi.emissionStatus !== filterStatus) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = emi.emissionId.toLowerCase().includes(q);
          const matchCitizen = emi.personalizationData.fullName.toLowerCase().includes(q);
          const matchDoc = emi.personalizationData.documentNumber.toLowerCase().includes(q);
          const matchDossier = emi.dossierId.toLowerCase().includes(q);
          if (!matchId && !matchCitizen && !matchDoc && !matchDossier) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }, [emissions, filterStatus, searchQuery]);

  const selectedEmission = useMemo(() => {
    return emissions.find((e) => e.emissionId === selectedEmissionId) || emissions[0];
  }, [emissions, selectedEmissionId]);

  // HELPER: DISPATCH DE COMANDO CANÓNICO DE EMISSÃO (APPEND-ONLY)
  const executeCanonicalEmissionCommand = (
    command: EmissionCommand,
    targetNewStatus: EmissionStatus,
    payloadNote: string,
    additionalUpdates: Partial<BiEmission> = {}
  ) => {
    const timestamp = new Date().toISOString();
    const eventId = `EVT_EMI_${Date.now()}`;
    const prevHash = selectedEmission.currentHash;
    const currentHash = `hash_emi_${selectedEmission.emissionId}_${command.toLowerCase()}_${Date.now()}`;
    const digitalSignature = `SIG_ED25519_EMI_${command}_${selectedEmission.emissionId}_${Date.now()}`;

    const updatedEmission: BiEmission = {
      ...selectedEmission,
      ...additionalUpdates,
      emissionStatus: targetNewStatus,
      previousHash: prevHash,
      currentHash: currentHash,
      digitalSignature: digitalSignature,
    };

    // 1. Atualizar Estado Local
    setEmissions((prev) => prev.map((e) => (e.emissionId === selectedEmission.emissionId ? updatedEmission : e)));

    // 2. Registar no Livro de Auditoria de Emissão (Módulo 11)
    const auditEvt: EmissionAuditEvent = {
      eventId,
      timestamp,
      emissionId: selectedEmission.emissionId,
      dossierId: selectedEmission.dossierId,
      processId: selectedEmission.processId,
      authorizationRef: selectedEmission.authorizationRef,
      operatorId: currentOperator.operatorId,
      operatorName: currentOperator.operatorName,
      role: currentOperator.role,
      terminalId: currentOperator.terminalId,
      command,
      previousState: selectedEmission.emissionStatus,
      newState: targetNewStatus,
      previousHash: prevHash,
      currentHash: currentHash,
      digitalSignature: digitalSignature,
      auditChainRef: selectedEmission.auditChainRef,
      payloadSummary: payloadNote,
    };
    setAuditLogs((prev) => [auditEvt, ...prev]);

    // 3. Propagar para Auditoria Global do Dossiê sem alterar o status do dossiê ou decisão
    const globalAuditEvt: ValidationAuditEvent = {
      eventId,
      dossierId: selectedEmission.dossierId,
      operatorId: currentOperator.operatorId,
      operatorRole: currentOperator.role as any,
      command: command as any,
      previousState: selectedEmission.emissionStatus as any,
      newState: (targetNewStatus === 'DELIVERED' ? 'ISSUED' : 'IN_ANALYSIS') as any,
      reason: `[MÓDULO 11 — GESTÃO DE EMISSÃO] ${command}: ${payloadNote}`,
      timestamp,
      previousHash: prevHash,
      currentHash,
      digitalSignature,
      auditChainRef: selectedEmission.auditChainRef,
      terminalId: currentOperator.terminalId,
      payloadSummary: `Execução fabril: ${payloadNote}`,
      silaGlobalAuditRef: `SILA_EMI_${Date.now()}`,
    };
    onAddAuditEvent(globalAuditEvt);

    setModalMode('NONE');
    setErrorMessage(null);
    setFormNotes('');
    setFormOperatorPassword('');
  };

  // VERIFICAR REAUTENTICAÇÃO IAM
  const verifyIamPassword = (): boolean => {
    if (!formOperatorPassword.trim()) {
      setErrorMessage('Reautenticação Obrigatória: Introduza a senha IAM do operador fabril.');
      return false;
    }
    if (formOperatorPassword !== '123456' && formOperatorPassword.length < 4) {
      setErrorMessage('Credencial IAM fabril inválida.');
      return false;
    }
    return true;
  };

  // HANDLERS DOS COMANDOS FABRIS
  const handleStartPersonalization = () => {
    if (selectedEmission.emissionStatus !== 'AUTHORIZED') {
      setErrorMessage('Transição Ilegal: Somente ordens com status AUTHORIZED podem iniciar personalização.');
      return;
    }
    executeCanonicalEmissionCommand(
      'START_PERSONALIZATION',
      'PERSONALIZATION',
      'Gravação laser dos dados biográficos no cartão de policarbonato iniciada.'
    );
  };

  const handleRunSecurityCheck = () => {
    if (selectedEmission.emissionStatus !== 'PERSONALIZATION') {
      setErrorMessage('Transição Ilegal: Requer etapa de personalização em andamento.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      executeCanonicalEmissionCommand(
        'RUN_SECURITY_CHECK',
        'READY_FOR_PRODUCTION',
        'Gravação criptográfica do Chip ICAO (LDS DG1-DG14) e Kinegram validados com sucesso.'
      );
    }, 600);
  };

  const handleRegisterProduction = () => {
    if (selectedEmission.emissionStatus !== 'READY_FOR_PRODUCTION') {
      setErrorMessage('Transição Ilegal: Requer aprovação de segurança prévia.');
      return;
    }
    executeCanonicalEmissionCommand(
      'REGISTER_PRODUCTION',
      'PRODUCED',
      'Cartão físico de policarbonato produzido na impressora industrial PRINTER-IND-POLY-01.',
      {
        productionReference: {
          printerId: 'PRINTER-IND-POLY-01',
          batchLotNumber: 'LOT-2026-08-W3',
          cardBlankSerial: `BLANK-PC-${Date.now().toString().slice(-7)}`,
          producedAt: new Date().toISOString(),
          producedByOperatorId: currentOperator.operatorId,
          temperatureSensorCheck: true,
          pressureLaminationCheck: true,
        },
      }
    );
  };

  const handleQualityCheck = () => {
    if (selectedEmission.emissionStatus !== 'PRODUCED') {
      setErrorMessage('Transição Ilegal: Requer produção física prévia.');
      return;
    }
    executeCanonicalEmissionCommand(
      'QUALITY_CHECK',
      'DELIVERABLE',
      'Controlo de qualidade óptico e leitura de chip sem contacto validados com 100% de conformidade ICAO.'
    );
  };

  const handleRegisterCustodyDispatch = () => {
    if (selectedEmission.emissionStatus !== 'DELIVERABLE') {
      setErrorMessage('Transição Ilegal: Requer controlo de qualidade aprovado.');
      return;
    }
    executeCanonicalEmissionCommand(
      'REGISTER_CUSTODY',
      'DELIVERABLE',
      'Cartão selado em malote de segurança e despachado para o posto municipal de atendimento.',
      {
        custodyReference: {
          ...selectedEmission.custodyReference,
          currentLocation: 'MUNICIPAL_SERVICE_POINT',
          courierDispatchTrackingRef: `DISP-EXP-${Date.now().toString().slice(-6)}`,
          securePouchSealNumber: `SEAL-${Date.now().toString().slice(-5)}`,
          dispatchedAt: new Date().toISOString(),
          receivedAtServicePointAt: new Date().toISOString(),
        },
      }
    );
  };

  const handleRegisterDelivery = () => {
    if (selectedEmission.emissionStatus !== 'DELIVERABLE') {
      setErrorMessage('Transição Ilegal: O cartão deve estar em estado DELIVERABLE no posto de atendimento.');
      return;
    }
    if (!verifyIamPassword()) return;

    executeCanonicalEmissionCommand(
      'REGISTER_DELIVERY',
      'DELIVERED',
      'Documento de identificação entregue ao cidadão com validação biométrica de 1:1 positiva.',
      {
        custodyReference: {
          ...selectedEmission.custodyReference,
          currentLocation: 'DELIVERED_TO_CITIZEN',
          deliveredToCitizenAt: new Date().toISOString(),
          receivedByCitizenProofType: 'BIOMETRIC_MATCH_VERIFIED',
        },
      }
    );
  };

  return (
    <div className="space-y-2 font-mono text-[9px]">
      {/* =========================================================================
          CABEÇALHO INSTITUCIONAL & BARRA DA FÁBRICA DE EMISSÃO (MÓDULO 11)
         ========================================================================= */}
      <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-2.5 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold tracking-wider">
                  11 — GESTÃO DE EMISSÃO & PERSONALIZAÇÃO DE BI (FÁBRICA NACIONAL)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 text-[7.5px] font-bold">
                  EXECUÇÃO MATERIAL • 07 AUTORIZA ➔ 11 EXECUTA
                </span>
              </div>
              <div className="text-neutral-500 text-[7.5px]">
                Gravação a Laser • Gravação Chip ICAO Doc 9303 • Controlo de Qualidade • Rastreabilidade de Custódia
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* SELETOR DE ALÇADA FABRIL */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-lg">
              <span className="text-neutral-500 text-[7.5px]">PAPEL FABRIL:</span>
              <select
                value={currentOperator.role}
                onChange={(e) => {
                  const role = e.target.value as EmissionOperatorRole;
                  setCurrentOperator({
                    ...currentOperator,
                    role,
                    operatorName:
                      role === 'EMISSION_OPERATOR'
                        ? 'Téc. Paulo Mendes (Operador Fabril)'
                        : role === 'SECURITY_CHIP_ENGINEER'
                        ? 'Eng. Kwanza Neto (Eng. Chip)'
                        : role === 'QUALITY_INSPECTOR'
                        ? 'Téc. Alberto Viana (Inspetor Qualidade)'
                        : 'Oficial de Guichê Fernando Kiala',
                  });
                }}
                className="bg-neutral-950 border border-neutral-700 text-cyan-400 font-bold text-[7.5px] rounded px-1 py-0.5"
              >
                <option value="EMISSION_OPERATOR">EMISSION_OPERATOR (Personalização & Laser)</option>
                <option value="SECURITY_CHIP_ENGINEER">SECURITY_CHIP_ENGINEER (Chaves ICAO Chip)</option>
                <option value="QUALITY_INSPECTOR">QUALITY_INSPECTOR (Controlo de Qualidade)</option>
                <option value="CUSTODY_OFFICER">CUSTODY_OFFICER (Expedição & Entrega)</option>
              </select>
            </div>

            {/* BOTÕES DE AÇÃO CANÓNICA CONDICIONADOS */}
            {selectedEmission.emissionStatus === 'AUTHORIZED' && (
              <button
                onClick={handleStartPersonalization}
                className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-black uppercase flex items-center gap-1 transition shadow-sm"
              >
                <Printer className="w-3 h-3" />
                <span>INICIAR GRAVAÇÃO LASER</span>
              </button>
            )}

            {selectedEmission.emissionStatus === 'PERSONALIZATION' && (
              <button
                onClick={handleRunSecurityCheck}
                disabled={isProcessing}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-black uppercase flex items-center gap-1 transition shadow-sm"
              >
                <Cpu className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>GRAVAR CHIP ICAO (DG1-14)</span>
              </button>
            )}

            {selectedEmission.emissionStatus === 'READY_FOR_PRODUCTION' && (
              <button
                onClick={handleRegisterProduction}
                className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-black uppercase flex items-center gap-1 transition shadow-sm"
              >
                <Printer className="w-3 h-3" />
                <span>PRODUZIR CARTÃO FÍSICO</span>
              </button>
            )}

            {selectedEmission.emissionStatus === 'PRODUCED' && (
              <button
                onClick={handleQualityCheck}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black uppercase flex items-center gap-1 transition shadow-sm"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>APROVAR QUALIDADE</span>
              </button>
            )}

            {selectedEmission.emissionStatus === 'DELIVERABLE' && selectedEmission.custodyReference.currentLocation === 'CENTRAL_FACTORY' && (
              <button
                onClick={handleRegisterCustodyDispatch}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-neutral-950 font-black uppercase flex items-center gap-1 transition shadow-sm"
              >
                <Truck className="w-3 h-3" />
                <span>DESPACHAR MALOTE POSTAL</span>
              </button>
            )}

            {selectedEmission.emissionStatus === 'DELIVERABLE' && selectedEmission.custodyReference.currentLocation === 'MUNICIPAL_SERVICE_POINT' && (
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setModalMode('DELIVERY');
                }}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black uppercase flex items-center gap-1 transition shadow-sm"
              >
                <UserCheck className="w-3 h-3" />
                <span>ENTREGAR AO CIDADÃO</span>
              </button>
            )}
          </div>
        </div>

        {/* 9 ZONAS OPERACIONAIS */}
        <div className="flex items-center gap-1 border-b border-neutral-800 pt-1 overflow-x-auto">
          {[
            { id: '01_CONTEXTO', label: '01. CONTEXTO & FILA', icon: Filter },
            { id: '02_AUTORIZACAO', label: '02. AUTORIZAÇÃO (07)', icon: ShieldCheck },
            { id: '03_PERSONALIZACAO', label: '03. PERSONALIZAÇÃO', icon: FileText },
            { id: '04_SEGURANCA', label: '04. SEGURANÇA & CHIP', icon: Cpu },
            { id: '05_PRODUCAO', label: '05. PRODUÇÃO FÍSICA', icon: Printer },
            { id: '06_QUALIDADE', label: '06. QUALIDADE ICAO', icon: CheckCircle2 },
            { id: '07_CUSTODIA', label: '07. CUSTÓDIA & MALOTE', icon: Truck },
            { id: '08_ENTREGA', label: '08. ENTREGA AO TITULAR', icon: UserCheck },
            { id: '09_AUDITORIA', label: '09. AUDITORIA SILA CHAIN', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeZone === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveZone(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-t-lg font-bold flex items-center gap-1 border-t border-x transition shrink-0 ${
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
          ZONA 01: CONTEXTO & FILA DE EMISSÃO
         ========================================================================= */}
      {activeZone === '01_CONTEXTO' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-neutral-950 rounded-lg border border-neutral-800">
            <div>
              <label className="text-neutral-500 block text-[7px]">STATUS DA ORDEM:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1 text-white"
              >
                <option value="ALL">Todos Status</option>
                <option value="AUTHORIZED">AUTHORIZED</option>
                <option value="PERSONALIZATION">PERSONALIZATION</option>
                <option value="READY_FOR_PRODUCTION">READY_FOR_PRODUCTION</option>
                <option value="PRODUCED">PRODUCED</option>
                <option value="DELIVERABLE">DELIVERABLE</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="AUTHORIZATION_INVALID">AUTHORIZATION_INVALID</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-500 block text-[7px]">PESQUISA RÁPIDA:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ID Emissão, Cidadão, BI, Dossiê..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1 text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-left border-collapse text-[8px]">
              <thead className="bg-neutral-950 text-neutral-400 font-bold border-b border-neutral-800 uppercase">
                <tr>
                  <th className="p-2">ID EMISSÃO</th>
                  <th className="p-2">Nº BI / DNI</th>
                  <th className="p-2">TITULAR HOMOLOGADO</th>
                  <th className="p-2">AUTORIZAÇÃO (07)</th>
                  <th className="p-2">STATUS FÁBRICA</th>
                  <th className="p-2">CUSTÓDIA</th>
                  <th className="p-2 text-right">AÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredAndSortedEmissions.map((emi) => {
                  const isSelected = emi.emissionId === selectedEmission.emissionId;
                  return (
                    <tr
                      key={emi.emissionId}
                      onClick={() => setSelectedEmissionId(emi.emissionId)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-cyan-950/25 text-white font-bold'
                          : 'bg-[#0b0d11] hover:bg-neutral-900/50 text-neutral-300'
                      }`}
                    >
                      <td className="p-2 font-mono text-cyan-400 font-bold">{emi.emissionId}</td>
                      <td className="p-2 font-mono text-white font-bold">{emi.personalizationData.documentNumber}</td>
                      <td className="p-2">{emi.personalizationData.fullName}</td>
                      <td className="p-2 text-neutral-400 font-mono text-[7px]">{emi.authorizationRef}</td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[7px] font-bold ${
                            emi.emissionStatus === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : emi.emissionStatus === 'DELIVERABLE'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : emi.emissionStatus === 'AUTHORIZATION_INVALID'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {emi.emissionStatus}
                        </span>
                      </td>
                      <td className="p-2 text-neutral-400">{emi.custodyReference.currentLocation}</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmissionId(emi.emissionId);
                            setActiveZone('03_PERSONALIZACAO');
                          }}
                          className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[7.5px]"
                        >
                          EXAMINAR
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 02: AUTORIZAÇÃO FORMAL (PROVENIENTE DO 07)
         ========================================================================= */}
      {activeZone === '02_AUTORIZACAO' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              VALIDAÇÃO CRIPTOGRÁFICA DA AUTORIZAÇÃO DE EMISSÃO (MÓDULO 07)
            </span>
            <span className="text-neutral-500 text-[7.5px]">Ref: {selectedEmission.authorizationRef}</span>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <span className="text-neutral-500 text-[7px] block">DECISÃO VINCULATIVA:</span>
                <span className="text-cyan-400 font-bold text-[8.5px]">{selectedEmission.decisionId}</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[7px] block">PROCESSO & DOSSIÊ:</span>
                <span className="text-white font-bold text-[8.5px]">{selectedEmission.processId} ({selectedEmission.dossierId})</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[7px] block">ESTADO DA AUTORIZAÇÃO:</span>
                <span className="text-emerald-400 font-bold text-[8.5px]">VÁLIDA & ASSINADA PELO CONSERVADOR</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 03: PERSONALIZAÇÃO (CAMPOS AUTORIZADOS DO BI)
         ========================================================================= */}
      {activeZone === '03_PERSONALIZACAO' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              CAMPOS AUTORIZADOS PARA GRAVAÇÃO NO POLICARBONATO
            </span>
            <span className="text-cyan-400 font-bold font-mono">BI: {selectedEmission.personalizationData.documentNumber}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">NOME COMPLETO:</div>
              <div className="text-white font-bold text-[8.5px]">{selectedEmission.personalizationData.fullName}</div>
              <div className="text-neutral-500 text-[7px]">NASCIMENTO: {selectedEmission.personalizationData.dateOfBirth} ({selectedEmission.personalizationData.gender})</div>
            </div>

            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">FILIAÇÃO:</div>
              <div className="text-neutral-300 text-[8px]">Pai: {selectedEmission.personalizationData.fatherName}</div>
              <div className="text-neutral-300 text-[8px]">Mãe: {selectedEmission.personalizationData.motherName}</div>
            </div>

            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-neutral-500 text-[7px]">NATURALIDADE & RESIDÊNCIA:</div>
              <div className="text-neutral-300 text-[8px]">{selectedEmission.personalizationData.naturalnessProvince} — {selectedEmission.personalizationData.naturalnessMunicipality}</div>
              <div className="text-neutral-500 text-[7px] truncate">{selectedEmission.personalizationData.residenceAddress}</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 04: SEGURANÇA & CHIP ICAO DOC 9303
         ========================================================================= */}
      {activeZone === '04_SEGURANCA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              ESTRUTURA DE DADOS DO CHIP (ICAO LDS) & ZONA MRZ
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
            <div className="font-mono bg-neutral-900 p-2 rounded text-cyan-300 text-[7.5px] space-y-0.5 tracking-wider">
              <div>{selectedEmission.securityFeatures.mrzLine1}</div>
              <div>{selectedEmission.securityFeatures.mrzLine2}</div>
              <div>{selectedEmission.securityFeatures.mrzLine3}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-neutral-400 text-[7.5px] pt-1">
              <div>CHIP UID: <strong className="text-white">{selectedEmission.securityFeatures.chipUid}</strong></div>
              <div>KINEGRAM SERIAL: <strong className="text-white">{selectedEmission.securityFeatures.kinegramSerial}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 05: PRODUÇÃO FÍSICA
         ========================================================================= */}
      {activeZone === '05_PRODUCAO' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              PARÂMETROS DE PRODUÇÃO FÍSICA & LAMINAÇÃO
            </span>
          </div>

          {selectedEmission.productionReference ? (
            <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-neutral-400 text-[7.5px]">
                <div>IMPRESSORA: <strong className="text-white">{selectedEmission.productionReference.printerId}</strong></div>
                <div>LOTE DE PRODUÇÃO: <strong className="text-white">{selectedEmission.productionReference.batchLotNumber}</strong></div>
                <div>SERIAL DO BLANK: <strong className="text-white">{selectedEmission.productionReference.cardBlankSerial}</strong></div>
                <div>DATA PRODUÇÃO: <strong className="text-white">{new Date(selectedEmission.productionReference.producedAt).toLocaleDateString('pt-AO')}</strong></div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-neutral-950 rounded border border-neutral-800 text-neutral-500">
              Cartão ainda não submetido à impressora física de policarbonato.
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ZONA 06: QUALIDADE ICAO
         ========================================================================= */}
      {activeZone === '06_QUALIDADE' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              CONTROLO DE QUALIDADE ÓPTICO & LEITURA NFC
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-neutral-500 text-[7px] block">GRAVAÇÃO LASER</span>
                <span className="text-emerald-400 font-bold">100% APROVADO</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-neutral-500 text-[7px] block">LEITURA CHIP NFC</span>
                <span className="text-emerald-400 font-bold">CONFORME ICAO</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-neutral-500 text-[7px] block">LAMINAÇÃO & OVI</span>
                <span className="text-emerald-400 font-bold">SEM BOLHAS / VÍCIOS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 07: CUSTÓDIA & MALOTE
         ========================================================================= */}
      {activeZone === '07_CUSTODIA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              RASTREAMENTO DE CUSTÓDIA E EXPEDIÇÃO SEGURA
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-900 text-cyan-400 font-bold text-[7.5px]">
              LOCAL ATUAL: {selectedEmission.custodyReference.currentLocation}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-neutral-400 text-[7.5px]">
              <div>GUIA DE DESPACHO: <strong className="text-white">{selectedEmission.custodyReference.courierDispatchTrackingRef || 'N/A'}</strong></div>
              <div>LACRE DO MALOTE: <strong className="text-white">{selectedEmission.custodyReference.securePouchSealNumber || 'N/A'}</strong></div>
              <div>RECEBIDO NO POSTO: <strong className="text-white">{selectedEmission.custodyReference.receivedAtServicePointAt ? new Date(selectedEmission.custodyReference.receivedAtServicePointAt).toLocaleString('pt-AO') : 'Pendente'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONA 08: ENTREGA AO TITULAR
         ========================================================================= */}
      {activeZone === '08_ENTREGA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              ENTREGA AO CIDADÃO & VALIDAÇÃO BIOMÉTRICA NO GUICHÊ
            </span>
          </div>

          {selectedEmission.emissionStatus === 'DELIVERED' ? (
            <div className="p-3 bg-neutral-950 rounded border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-[9px]">
                <CheckCircle2 className="w-4 h-4" />
                <span>BILHETE DE IDENTIDADE ENTREGUE AO TITULAR COM SUCESSO</span>
              </div>
              <div className="text-neutral-300 text-[8px]">
                Entregue em {new Date(selectedEmission.custodyReference.deliveredToCitizenAt!).toLocaleString('pt-AO')} mediante confirmação biométrica de 1:1 ao vivo no guichê.
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-neutral-950 rounded border border-neutral-800 text-neutral-500">
              O documento aguarda entrega ao cidadão no posto de atendimento.
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ZONA 09: AUDITORIA SILA CHAIN (APPEND-ONLY)
         ========================================================================= */}
      {activeZone === '09_AUDITORIA' && (
        <div className="bg-[#0b0d11] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-200 font-bold text-[8.5px] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              LIVRO-MESTRE DE AUDITORIA FABRIL (SILA CHAIN EMISSION LEDGER)
            </span>
            <span className="text-neutral-500 text-[7.5px]">Total Registos: {auditLogs.length}</span>
          </div>

          <div className="space-y-1.5">
            {auditLogs.map((log) => (
              <div key={log.eventId} className="p-2.5 bg-neutral-950 rounded border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">{log.eventId}</span>
                    <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[7px] text-amber-300">
                      COMANDO: {log.command}
                    </span>
                    <span className="text-neutral-500 text-[7px]">
                      {log.previousState} ➔ {log.newState}
                    </span>
                  </div>
                  <span className="text-neutral-500 text-[7px]">{new Date(log.timestamp).toLocaleString('pt-AO')}</span>
                </div>
                <div className="text-neutral-300 text-[8px]">{log.payloadSummary}</div>
                <div className="flex justify-between text-neutral-500 text-[6.5px] font-mono pt-0.5 border-t border-neutral-900">
                  <span>OPERADOR: {log.operatorName} ({log.role})</span>
                  <span>CURR_HASH: {log.currentHash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ENTREGA AO CIDADÃO COM REAUTENTICAÇÃO IAM
         ========================================================================= */}
      {modalMode === 'DELIVERY' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1017] border border-neutral-700 rounded-xl max-w-md w-full p-4 space-y-3 font-mono text-[9px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> CONFIRMAÇÃO DE ENTREGA AO TITULAR
              </span>
              <button onClick={() => setModalMode('NONE')} className="text-neutral-500 hover:text-white">✕</button>
            </div>
            {errorMessage && <div className="p-2 rounded bg-rose-950/50 border border-rose-500 text-rose-300 text-[8px]">{errorMessage}</div>}
            <div className="text-neutral-300">
              Confirma a entrega do Bilhete de Identidade <strong className="text-white">{selectedEmission.personalizationData.documentNumber}</strong> ao cidadão <strong className="text-cyan-400">{selectedEmission.personalizationData.fullName}</strong> após matching biométrico presencial?
            </div>
            <div>
              <label className="text-neutral-400 block mb-1 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-cyan-400" />
                <span>SENHA IAM DO OFICIAL DE GUICHÊ:</span>
              </label>
              <input
                type="password"
                value={formOperatorPassword}
                onChange={(e) => setFormOperatorPassword(e.target.value)}
                placeholder="Senha IAM de guichê..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-white font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button onClick={() => setModalMode('NONE')} className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300">CANCELAR</button>
              <button onClick={handleRegisterDelivery} className="px-3 py-1.5 rounded bg-emerald-600 text-neutral-950 font-black">CONFIRMAR ENTREGA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
