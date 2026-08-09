import React, { useState, useEffect } from 'react';
import { Citizen } from '../../types/identity';
import { Fingerprint, Scan, ShieldCheck, CheckCircle2, X, Lock, Key } from 'lucide-react';
import { formatBiNumber } from '../../utils/cryptoUtils';

interface BiometricAuthModalProps {
  citizen: Citizen;
  onAuthenticated: () => void;
  onCancel: () => void;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  citizen,
  onAuthenticated,
  onCancel
}) => {
  const [authMethod, setAuthMethod] = useState<'FACE_ID' | 'TOUCH_ID'>('FACE_ID');
  const [status, setStatus] = useState<'SCANNING' | 'VERIFIED'>('SCANNING');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      if (current <= 100) {
        setProgress(current);
      }
      if (current >= 100) {
        clearInterval(interval);
        setStatus('VERIFIED');
        setTimeout(() => {
          onAuthenticated();
        }, 550);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [authMethod, onAuthenticated]);

  const handleInstantApprove = () => {
    setStatus('VERIFIED');
    setProgress(100);
    setTimeout(() => {
      onAuthenticated();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm bg-neutral-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 flex flex-col items-center text-center space-y-5">
        
        {/* Close / Cancel Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Cancelar autenticação"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Institutional Shield Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono tracking-widest uppercase font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>AUTENTICAÇÃO BIOMÉTRICA GOV.AO</span>
        </div>

        {/* Citizen Quick Ident */}
        <div className="flex flex-col items-center space-y-1">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/50 bg-neutral-800 shadow-md mb-1">
            <img
              src={citizen.photoUrl}
              alt={citizen.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-bold text-white uppercase">{citizen.fullName}</span>
          <span className="text-xs font-mono text-amber-400 font-semibold">{formatBiNumber(citizen.biNumber)}</span>
        </div>

        {/* Biometric Scanning Visual Engine */}
        <div className="relative w-36 h-36 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden shadow-inner group">
          {status === 'SCANNING' ? (
            <>
              {/* Pulsing ring */}
              <div className="absolute inset-0 border-2 border-amber-500/30 rounded-3xl animate-ping opacity-25" />

              {/* Scanning Laser Line */}
              <div
                className="absolute inset-x-0 h-0.5 bg-amber-400 shadow-[0_0_15px_#f59e0b] transition-all duration-100 ease-linear"
                style={{
                  top: `${progress}%`
                }}
              />

              {authMethod === 'FACE_ID' ? (
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Scan className="w-14 h-14 text-amber-400 animate-pulse" />
                  <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
                    FACE ID
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Fingerprint className="w-14 h-14 text-amber-400 animate-pulse" />
                  <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
                    TOUCH ID
                  </span>
                </div>
              )}
            </>
          ) : (
            /* Verified Success State */
            <div className="flex flex-col items-center justify-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                BIOMETRIA VALIDADA
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full space-y-2">
          <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs font-mono text-neutral-400">
            {status === 'SCANNING'
              ? `Verificando hash biométrico (${progress}%)...`
              : 'Assinatura RSA-4096 destravada com sucesso'}
          </p>
        </div>

        {/* Method selector switcher */}
        {status === 'SCANNING' && (
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] font-mono">
            <button
              onClick={() => {
                setAuthMethod('FACE_ID');
                setProgress(10);
              }}
              className={`px-3 py-1 rounded-lg transition-colors ${
                authMethod === 'FACE_ID'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              FaceID
            </button>
            <button
              onClick={() => {
                setAuthMethod('TOUCH_ID');
                setProgress(10);
              }}
              className={`px-3 py-1 rounded-lg transition-colors ${
                authMethod === 'TOUCH_ID'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              TouchID
            </button>
          </div>
        )}

        {/* Instant Approval override button for quick testing */}
        <div className="w-full pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs font-semibold transition-colors"
          >
            CANCELAR
          </button>

          {status === 'SCANNING' && (
            <button
              onClick={handleInstantApprove}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1"
              title="Aprovar de imediato para visualização demo"
            >
              <Key className="w-3.5 h-3.5" />
              <span>APROVAR AGORA</span>
            </button>
          )}
        </div>

        {/* Cryptographic footnote */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-neutral-500">
          <Lock className="w-3 h-3 text-amber-500/80" />
          <span>SECURE ENCLAVE • SILA GOV.AO</span>
        </div>
      </div>
    </div>
  );
};
