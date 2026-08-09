import React, { useState } from 'react';
import { Citizen } from '../../types/identity';
import { X, Copy, Check, ShieldCheck, Download, ExternalLink, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatBiNumber } from '../../utils/cryptoUtils';

interface BiDetailModalProps {
  citizen: Citizen;
  onClose: () => void;
  onOpenScanner?: () => void;
}

export const BiDetailModal: React.FC<BiDetailModalProps> = ({
  citizen,
  onClose,
  onOpenScanner
}) => {
  const [copied, setCopied] = useState(false);
  const primaryDoc = citizen.documents.find(d => d.type === 'BI') || citizen.documents[0];

  const handleCopyHash = () => {
    navigator.clipboard.writeText(primaryDoc?.qrPayload || citizen.biNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-white font-bold">
              DADOS INSTITUCIONAIS DO BI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Profile Summary */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <img
              src={citizen.photoUrl}
              alt={citizen.fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/60"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-lg font-bold text-white truncate">{citizen.fullName}</span>
              <span className="text-xs font-mono text-amber-400 font-semibold">{formatBiNumber(citizen.biNumber)}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  ATIVO & VERIFICADO
                </span>
              </div>
            </div>
          </div>

          {/* Institutional Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 min-w-0">
              <span className="text-[10px] text-neutral-500 uppercase block">EMISSOR OFICIAL</span>
              <span className="text-neutral-200 font-semibold mt-0.5 block truncate">{primaryDoc?.issuingAuthority}</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 min-w-0">
              <span className="text-[10px] text-neutral-500 uppercase block">DATA DE VALIDADE</span>
              <span className="text-amber-400 font-bold mt-0.5 block truncate">{primaryDoc?.expiryDate}</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 min-w-0">
              <span className="text-[10px] text-neutral-500 uppercase block">DATA DE NASCIMENTO</span>
              <span className="text-neutral-200 font-semibold mt-0.5 block truncate">{citizen.birthDate}</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 min-w-0">
              <span className="text-[10px] text-neutral-500 uppercase block">GÉNERO / NACIONALIDADE</span>
              <span className="text-neutral-200 font-semibold mt-0.5 block truncate">{citizen.gender} • {citizen.nationality}</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 col-span-2 min-w-0">
              <span className="text-[10px] text-neutral-500 uppercase block">MORADA REGISTADA</span>
              <span className="text-neutral-200 font-semibold mt-0.5 block truncate">{citizen.address}</span>
            </div>
          </div>

          {/* QR Code and Cryptographic Token */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
              <QRCodeSVG
                value={primaryDoc?.qrPayload || citizen.biNumber}
                size={110}
                level="Q"
              />
            </div>
            <div className="flex flex-col flex-1 min-w-0 text-xs font-mono">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-1">
                TOKEN CRIPTOGRÁFICO QR (RSA-4096)
              </span>
              <p className="text-neutral-400 text-[11px] truncate mb-2">
                {primaryDoc?.hashSignature || citizen.biometricHash}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors text-[11px] font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIADO' : 'COPIAR TOKEN'}</span>
                </button>

                {onOpenScanner && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenScanner();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors text-[11px] font-semibold"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>TESTAR QR NO LEITOR</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950">
          <span className="text-[10px] font-mono text-neutral-500">
            SILA DIGITAL GOV.AO • VERIFICADO EM {citizen.lastVerifiedAt}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-bold transition-all shadow-md active:scale-95"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};
