import React, { useState, useRef } from 'react';
import { Citizen, CitizenDocument } from '../../types/identity';
import { FileUp, FileCheck, CheckCircle2, X, ShieldCheck, Fingerprint, Lock, QrCode, PenTool, Download, Plus, Sparkles, Key } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface DocumentSigningModalProps {
  citizen: Citizen;
  onClose: () => void;
  onAddDocument: (doc: CitizenDocument) => void;
}

export const DocumentSigningModal: React.FC<DocumentSigningModalProps> = ({
  citizen,
  onClose,
  onAddDocument
}) => {
  const [step, setStep] = useState<'UPLOAD' | 'AUTHENTICATE' | 'SUCCESS'>('UPLOAD');
  const [docType, setDocType] = useState<string>('Contrato de Prestação');
  const [docTitle, setDocTitle] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [signing, setSigning] = useState<boolean>(false);
  const [signedDoc, setSignedDoc] = useState<CitizenDocument | null>(null);

  // Swipe-down dismissal gesture state
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFileName(selected.name);
      if (!docTitle) {
        setDocTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setFileName(droppedFile.name);
      if (!docTitle) {
        setDocTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleStartSigning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !docTitle) return;
    setStep('AUTHENTICATE');
  };

  const handleConfirmSignature = () => {
    setSigning(true);
    setTimeout(() => {
      const randomHex = Math.floor(100000 + Math.random() * 900000);
      const docId = `DOC-${Date.now().toString().slice(-6)}`;
      const protocol = `SILA-ASS-2026-${randomHex}`;
      const hash = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      const newDocument: CitizenDocument = {
        id: docId,
        type: 'BI', // Standard official document format
        title: docTitle || fileName || 'Documento Assinado',
        documentNumber: protocol,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: 'PERMANENTE',
        issuingAuthority: 'SILA ASSINATURA QUALIFICADA',
        status: 'ACTIVE',
        hashSignature: hash,
        qrPayload: `https://sila-gov.ao/verify-signature?doc=${protocol}&citizen=${citizen.biNumber}`,
        metadata: {
          'TIPO': docType,
          'ASSINANTE': citizen.fullName,
          'BI NÚMERO': citizen.biNumber,
          'CHAVE': 'RSA-4096 SILA GOV'
        }
      };

      setSignedDoc(newDocument);
      setSigning(false);
      setStep('SUCCESS');
    }, 1200);
  };

  const handleSaveToWallet = () => {
    if (signedDoc) {
      onAddDocument(signedDoc);
      onClose();
    }
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
        className="relative w-full max-w-md bg-[#111319] border-t sm:border border-amber-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden p-6 pt-3 flex flex-col space-y-4 touch-pan-y"
      >
        {/* Mobile Handle Indicator */}
        <div className="w-12 h-1.5 bg-neutral-700 hover:bg-amber-500 rounded-full mx-auto cursor-grab active:cursor-grabbing transition-colors" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center justify-between pr-8 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono tracking-wider font-bold">
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>ASSINATURA DIGITAL QUALIFICADA</span>
          </div>
        </div>

        {/* STEP 1: UPLOAD DOCUMENT */}
        {step === 'UPLOAD' && (
          <form onSubmit={handleStartSigning} className="space-y-4">
            
            {/* File Drag & Drop Zone */}
            <div className="relative">
              <label
                htmlFor="doc-file-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-150 ${
                  file
                    ? 'border-emerald-500/70 bg-emerald-500/10'
                    : isDragging
                    ? 'border-amber-400 bg-amber-500/15 scale-[1.01]'
                    : 'border-amber-500/30 bg-neutral-900/50 hover:bg-neutral-900 hover:border-amber-500/70'
                }`}
              >
                <input
                  id="doc-file-upload"
                  type="file"
                  accept="application/pdf,image/*,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center gap-3 text-emerald-400">
                    <FileCheck className="w-8 h-8 flex-shrink-0" />
                    <div className="text-left">
                      <span className="text-xs font-mono font-bold block truncate max-w-[210px] text-white">
                        {fileName}
                      </span>
                      <span className="text-[10px] text-emerald-400 uppercase font-mono font-semibold">
                        DOCUMENTO CARREGADO
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-11 h-11 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-neutral-200 font-semibold tracking-tight">
                      PDF, IMAGEM OU CONTRATO
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Arraste ou toque para carregar documento
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* Document Type & Title */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                  Tipo de Documento
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Assento de Nascimento">Assento de Nascimento (Registo Civil)</option>
                  <option value="Requerimento Emissão BI">Requerimento de Emissão do BI</option>
                  <option value="Certidão de Casamento">Certidão de Casamento Digital</option>
                  <option value="Declaração de Residência BI">Declaração de Residência para BI</option>
                  <option value="Procuração do Registo">Procuração do Registo Civil</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                  Nome / Título do Documento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Contrato de Prestação de Serviços"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Submitter Info Preview */}
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-neutral-300 font-semibold">{citizen.fullName}</span>
              </div>
              <span className="text-amber-400 font-bold">BI: {citizen.biNumber}</span>
            </div>

            <button
              type="submit"
              disabled={!file && !docTitle}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              <span>AVANÇAR PARA ASSINATURA</span>
            </button>
          </form>
        )}

        {/* STEP 2: BIOMETRIC / RSA AUTHENTICATION */}
        {step === 'AUTHENTICATE' && (
          <div className="py-4 space-y-5 text-center animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight font-mono">
                AUTENTICAR ASSINATURA DIGITAL
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                A assinar «{docTitle}» com o seu certificado oficial.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">TITULAR:</span>
                <span className="text-white font-bold">{citizen.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">BI ELETRÓNICO:</span>
                <span className="text-amber-400 font-bold">{citizen.biNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">ENCLAVE DE SEGURA:</span>
                <span className="text-emerald-400 font-bold">RSA-4096 / SHA-256</span>
              </div>
            </div>

            <div className="py-2 flex flex-col items-center">
              <button
                onClick={handleConfirmSignature}
                disabled={signing}
                className="w-24 h-24 rounded-full bg-amber-500/15 border-2 border-amber-500/50 hover:border-amber-400 text-amber-400 flex flex-col items-center justify-center gap-1.5 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-95 group"
              >
                {signing ? (
                  <Key className="w-8 h-8 text-amber-400 animate-spin" />
                ) : (
                  <>
                    <Fingerprint className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-mono font-black uppercase text-amber-300">TOQUE AQUI</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] font-mono text-neutral-400">
              Toque no sensor biométrico para carimbar a assinatura digital irrevogável.
            </p>
          </div>
        )}

        {/* STEP 3: SUCCESS & ADD TO WALLET */}
        {step === 'SUCCESS' && signedDoc && (
          <div className="py-2 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight font-mono">
                DOCUMENTO ASSINADO COM SUCESSO!
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                A assinatura qualificada foi associada à sua identidade digital.
              </p>
            </div>

            {/* Protocol & QR Token Card */}
            <div className="w-full p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between font-mono">
              <div className="text-left space-y-1">
                <span className="text-[9px] text-neutral-500 uppercase block">PROTOCOLO DE ASSINATURA</span>
                <span className="text-amber-400 text-xs font-bold block">{signedDoc.documentNumber}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block">VERIFICADO SILA GOV.AO</span>
              </div>
              <div className="p-1.5 bg-white rounded-xl shrink-0">
                <QRCodeSVG value={signedDoc.qrPayload} size={54} />
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-2 pt-1">
              <button
                onClick={handleSaveToWallet}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-neutral-950" />
                <span>ADICIONAR À WALLET</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs font-semibold transition-colors"
              >
                FECHAR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
