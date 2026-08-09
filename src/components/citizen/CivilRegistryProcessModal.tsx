import React, { useState, useRef } from 'react';
import { Citizen } from '../../types/identity';
import { saveProcess } from '../../services/processService';
import { Calendar, CheckCircle2, Clock, AlertTriangle, Building2, UserCheck, Smartphone, ShieldCheck, ArrowRight, X, Sparkles, RefreshCw, FileText, Fingerprint, MapPin, Camera, Plus, Trash2, FileCheck, UploadCloud } from 'lucide-react';

interface CivilRegistryProcessModalProps {
  citizen: Citizen;
  onClose: () => void;
  onCompleteProcess?: (newBiNumber?: string) => void;
}

type ProcessType = 'NEW_REGISTRATION' | 'RENEWAL';
type ProcessStage = 'SELECTION' | 'PDF_ATTACH' | 'SILA_VALIDATION' | 'ANALYSIS' | 'APPOINTMENT' | 'IN_PERSON' | 'ISSUED';

interface AttachedDoc {
  id: string;
  title: string;
  fileName: string;
  required: boolean;
}

export const CivilRegistryProcessModal: React.FC<CivilRegistryProcessModalProps> = ({
  citizen,
  onClose,
  onCompleteProcess
}) => {
  const [processType, setProcessType] = useState<ProcessType>('NEW_REGISTRATION');
  const [stage, setStage] = useState<ProcessStage>('SELECTION');
  const [selectedBalcao, setSelectedBalcao] = useState('Balcão BUAP - Luanda Centro');
  const [appointmentDate, setAppointmentDate] = useState('2026-08-15 10:30');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(true);

  // Attached PDF files list (automated default items depending on process type)
  const [attachedPdfs, setAttachedPdfs] = useState<AttachedDoc[]>([]);

  // Ultra-simplified auto-filled data fields (OCR extracted automatically from PDFs)
  const [childName, setChildName] = useState<string>(citizen.fullName);
  const [refNumber, setRefNumber] = useState<string>('2026/0019842');

  // Swipe-down gesture
  const [translateY, setTranslateY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartY.current;
    if (diffY > 0) {
      setTranslateY(diffY);
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 110) {
      onClose();
    } else {
      setTranslateY(0);
    }
    touchStartY.current = null;
    setIsSwiping(false);
  };

  const handleSelectProcessType = (type: ProcessType) => {
    setProcessType(type);
    if (type === 'NEW_REGISTRATION') {
      setAttachedPdfs([
        { id: '1', title: 'Assento de Nascimento (0 a 5 anos)', fileName: 'Assento_Nascimento_2026.pdf', required: true },
        { id: '2', title: 'BI do Pai', fileName: 'BI_Pai_Oficial.pdf', required: true },
        { id: '3', title: 'BI da Mãe', fileName: 'BI_Mae_Oficial.pdf', required: true }
      ]);
    } else {
      setAttachedPdfs([
        { id: '1', title: 'Cópia BI Anterior Caducado', fileName: 'BI_Anterior_Copia.pdf', required: true }
      ]);
    }
    setStage('PDF_ATTACH');
  };

  const handleAddMorePdf = () => {
    const nextNum = attachedPdfs.length + 1;
    const newDoc: AttachedDoc = {
      id: Date.now().toString(),
      title: `Documento Adicional ${nextNum} (PDF)`,
      fileName: `Documento_Anexo_${nextNum}.pdf`,
      required: false
    };
    setAttachedPdfs(prev => [...prev, newDoc]);
  };

  const handleRemovePdf = (id: string) => {
    setAttachedPdfs(prev => prev.filter(doc => doc.id !== id));
  };

  const handleStartAutomatedValidation = async () => {
    setIsProcessing(true);
    setStage('SILA_VALIDATION');

    // Create process in Firestore for real-time synchronization with Admin
    const newReqId = `REQ-000${Math.floor(200 + Math.random() * 800)}`;
    await saveProcess({
      id: newReqId,
      cidadao: citizen.fullName.toUpperCase(),
      tipo: processType === 'RENEWAL' ? 'Renovação' : 'Primeiro',
      estado: 'Em análise',
      dataCriacao: 'Hoje, ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      identidadeStatus: 'CONFIRMADA',
      documentacaoStatus: 'OFICIAIS',
      biometriaStatus: 'RECEBIDA',
      fotografiaStatus: 'RECEBIDA',
      analiseStatus: 'EM_ANALISE',
      emissaoStatus: 'PENDENTE'
    });

    // Instant SILA automated cross-reference checking
    setTimeout(() => {
      setStage('ANALYSIS');
      setIsProcessing(false);
    }, 1400);
  };

  const handleSimulateAnalysis = (approved: boolean) => {
    setIsApproved(approved);
    if (approved) {
      setStage('APPOINTMENT');
    }
  };

  const handleConfirmAppointment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStage('IN_PERSON');
    }, 1000);
  };

  const handleSimulateInPersonBiometrics = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStage('ISSUED');
      if (onCompleteProcess) {
        onCompleteProcess();
      }
    }, 1500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
        className="relative w-full max-w-md bg-[#0f1117] border-t sm:border border-amber-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden p-5 pt-3 flex flex-col space-y-3.5 touch-pan-y"
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-neutral-700 hover:bg-amber-500 rounded-full mx-auto cursor-grab active:cursor-grabbing transition-colors" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center justify-between pr-8 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>REGISTO CIVIL & IDENTIDADE DIGITAL</span>
          </div>
        </div>

        {/* ARCHITECTURAL RESPONSIBILITY SPLIT BANNER */}
        <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] font-mono">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Smartphone className="w-3 h-3 text-amber-400" />
              <span>SILA IDENTITY</span>
            </div>
            <p className="text-neutral-400 leading-tight text-[9px]">
              Agendamento, Análise e Credencial
            </p>
          </div>
          <div className="space-y-0.5 border-l border-neutral-800 pl-2">
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>MINISTÉRIO DA JUSTIÇA</span>
            </div>
            <p className="text-neutral-400 leading-tight text-[9px]">
              Validação de Assento, Biometria & BI
            </p>
          </div>
        </div>

        {/* STAGE 1: SELECTION (0 TO 5 YEARS vs RENEWAL) */}
        {stage === 'SELECTION' && (
          <div className="space-y-3 pt-1">
            <div className="text-center space-y-1">
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
                SOLUÇÃO FOCADA ULTRALEVE
              </div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                NOVO REGISTO OU RENOVAÇÃO
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Prioridade: Crianças (0 a 5 anos) e Renovação BI
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => handleSelectProcessType('NEW_REGISTRATION')}
                className="p-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 hover:border-amber-400 text-left transition-all active:scale-95 space-y-2 group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-white block uppercase">
                    NOVO REGISTO
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 font-bold block mt-0.5">
                    0 a 5 anos (Assento + BI Pais)
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleSelectProcessType('RENEWAL')}
                className="p-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all active:scale-95 space-y-2 group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-white block uppercase">
                    RENOVAÇÃO BI
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold block mt-0.5">
                    BI Caducado / Substituição
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: PDF ATTACHMENTS WITH AUTOMATED "+" BUTTON & AUTO-FILLED DATA */}
        {stage === 'PDF_ATTACH' && (
          <div className="space-y-3 pt-1 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold font-mono text-white uppercase">
                  ANEXAR DOCUMENTOS (PDF)
                </h4>
                <p className="text-[10px] font-mono text-neutral-400">
                  {processType === 'NEW_REGISTRATION' ? 'Assento de Nascimento + BI dos Pais' : 'Cópia do BI Caducado'}
                </p>
              </div>

              {/* AUTOMATED "+" BUTTON TO ADD MORE PDFS */}
              <button
                onClick={handleAddMorePdf}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-mono font-bold uppercase transition-all active:scale-95 border border-amber-400 shrink-0"
                title="Anexar mais documentos PDF"
              >
                <Plus className="w-3.5 h-3.5 text-neutral-950 stroke-[3]" />
                <span>ADICIONAR PDF</span>
              </button>
            </div>

            {/* List of PDFs attached */}
            <div className="space-y-1.5 max-h-[130px] overflow-y-auto pr-1">
              {attachedPdfs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between font-mono text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-neutral-200 font-semibold block text-[10px] truncate">
                        {doc.title}
                      </span>
                      <span className="text-[9px] text-amber-400 font-bold block truncate">
                        {doc.fileName}
                      </span>
                    </div>
                  </div>

                  {!doc.required && (
                    <button
                      onClick={() => handleRemovePdf(doc.id)}
                      className="p-1 rounded-md text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remover documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* ULTRA-SIMPLIFIED AUTOMATED DATA EXTRACTION FIELDS */}
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-amber-500/30 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>DADOS EXTRAÍDOS AUTOMATICAMENTE (OCR)</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  99% PRECISÃO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-0.5">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-0.5">
                    Nº Assento / BI
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleStartAutomatedValidation}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <UploadCloud className="w-4 h-4" />
              <span>SUBMETER PARA VALIDAÇÃO AUTOMÁTICA</span>
            </button>
          </div>
        )}

        {/* STAGE 3: SILA AUTOMATED CROSS-REFERENCE CHECKING */}
        {stage === 'SILA_VALIDATION' && (
          <div className="py-6 text-center space-y-3 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Sparkles className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1 font-mono">
              <h4 className="text-xs font-bold text-white uppercase">VALIDAÇÃO SILA AUTOMÁTICA</h4>
              <p className="text-[10px] text-neutral-400">Cruzando BI dos Pais e Assento com a Base do Registo...</p>
            </div>
          </div>
        )}

        {/* STAGE 4: MINISTÉRIO DA JUSTIÇA CASE ANALYSIS */}
        {stage === 'ANALYSIS' && (
          <div className="space-y-3 font-mono text-xs animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 text-[9px] uppercase">PROCESSO</span>
                <span className="text-amber-400 font-bold">
                  {processType === 'NEW_REGISTRATION' ? 'NOVO REGISTO (0-5 ANOS)' : 'RENOVAÇÃO BI'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 text-[9px] uppercase">DOCUMENTOS PDF</span>
                <span className="text-white font-bold">{attachedPdfs.length} Anexados</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 text-[9px] uppercase">AUTORIDADE</span>
                <span className="text-emerald-400 font-bold">MINISTÉRIO DA JUSTIÇA</span>
              </div>
            </div>

            {/* Decision trigger buttons */}
            <div className="space-y-2 pt-0.5">
              <button
                onClick={() => handleSimulateAnalysis(true)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>APROVADO &gt; SEGUIR PARA AGENDAMENTO</span>
              </button>

              <button
                onClick={() => handleSimulateAnalysis(false)}
                className="w-full py-2 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PENDENTE: NOTIFICAR CORREÇÃO DE DOCUMENTOS</span>
              </button>
            </div>

            {!isApproved && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300">
                Notificação enviada: Anexar novamente o PDF do BI dos Pais com melhor nitidez.
              </div>
            )}
          </div>
        )}

        {/* STAGE 5: BALCÃO APPOINTMENT SCHEDULING */}
        {stage === 'APPOINTMENT' && (
          <div className="space-y-3 font-mono text-xs animate-in fade-in duration-200">
            <div className="text-center space-y-0.5">
              <h4 className="text-xs font-bold text-white uppercase">AGENDAMENTO PRESENCIAL NOTIFICADO</h4>
              <p className="text-[10px] text-neutral-400">Posto de Atendimento do Ministério da Justiça</p>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                  Balcão Oficial
                </label>
                <select
                  value={selectedBalcao}
                  onChange={(e) => setSelectedBalcao(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Balcão BUAP - Luanda Centro">Balcão BUAP - Luanda Centro</option>
                  <option value="Posto DNIC - Talatona">Posto DNIC - Talatona</option>
                  <option value="Conservatória do Registo Civil - Viana">Conservatória do Registo Civil - Viana</option>
                  <option value="Posto Integrado GOV - Kilamba">Posto Integrado GOV - Kilamba</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-neutral-400 uppercase font-bold block mb-1">
                  Data e Hora Notificada pelo MinJus
                </label>
                <input
                  type="text"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              onClick={handleConfirmAppointment}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Calendar className="w-4 h-4" />
              <span>CONFIRMAR PRESENÇA PRESENCIAL</span>
            </button>
          </div>
        )}

        {/* STAGE 6: IN-PERSON BIOMETRICS & PHOTO CAPTURE AT BALCÃO */}
        {stage === 'IN_PERSON' && (
          <div className="space-y-3 font-mono text-xs text-center animate-in fade-in duration-200">
            <div className="p-3 rounded-2xl bg-neutral-950 border border-emerald-500/40 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <MapPin className="w-4 h-4" />
                <span>{selectedBalcao}</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center pt-0.5">
                <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                  <Fingerprint className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-[9px] text-neutral-300 font-bold block">BIOMETRIA</span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                  <Camera className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-[9px] text-neutral-300 font-bold block">FOTOGRAFIA</span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                  <UserCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[9px] text-neutral-300 font-bold block">VALIDAÇÃO</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSimulateInPersonBiometrics}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-mono text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-neutral-950" />
              )}
              <span>CONCLUIR EMISSÃO OFICIAL PELO MINJUS</span>
            </button>
          </div>
        )}

        {/* STAGE 7: ISSUED & SILA CREDENTIAL GENERATED */}
        {stage === 'ISSUED' && (
          <div className="py-2 text-center space-y-3 animate-in zoom-in-95 duration-200 font-mono">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white uppercase">CREDENCIAL SILA EMITIDA!</h4>
              <p className="text-[11px] text-neutral-400">BI Digital ativo na Wallet com validação offline QR.</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all"
            >
              VER BI DIGITAL NA WALLET
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
