import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

interface SessionLockModalProps {
  isLocked: boolean;
  operatorName: string;
  badgeNumber: string;
  onUnlock: () => void;
}

export const SessionLockModal: React.FC<SessionLockModalProps> = ({
  isLocked,
  operatorName,
  badgeNumber,
  onUnlock
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin.length >= 4) {
      setError(false);
      setPin('');
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-neutral-950/95 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#111217] border border-amber-500/40 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <Lock className="w-10 h-10 text-amber-400 animate-pulse" />
          </div>
          <span className="text-xs font-extrabold text-amber-400 tracking-widest uppercase">
            SESSÃO MJDH BLOQUEADA
          </span>
          <h2 className="text-base font-bold text-white">
            {operatorName}
          </h2>
          <span className="text-[11px] text-neutral-400 font-mono">
            CRACHÁ: {badgeNumber}
          </span>
        </div>

        <p className="text-xs text-neutral-400 text-center font-sans">
          A sua estação de trabalho foi temporariamente bloqueada para proteção de dados de identificação civil. Insira o seu PIN de operador (padrão: <span className="text-amber-300 font-mono font-bold">1234</span>) para retomar a sessão.
        </p>

        <form onSubmit={handleUnlockSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase block">
              PIN DE SEGURANÇA DO OPERADOR
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Insira PIN de 4 a 6 dígitos..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-center text-sm font-mono tracking-widest text-amber-300 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
              />
            </div>
            {error && (
              <span className="text-[10px] font-bold text-rose-400 block text-center">
                PIN incorreto! Utilize 1234 para o ambiente de testes.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            title="Desbloquear Estação de Trabalho"
          >
            <span>DESBLOQUEAR SESSÃO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-800">
          <span className="text-[9px] text-neutral-500 font-mono block">
            ESTAÇÃO PROTEGIDA • GOVOS PKI MJDH • LUANDA, ANGOLA
          </span>
        </div>
      </div>
    </div>
  );
};
