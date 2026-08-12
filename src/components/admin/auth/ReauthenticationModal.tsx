import React, { useState } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import { reauthenticateSession, getCurrentSession } from '../../../services/accessControlService';

interface ReauthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionTitle?: string;
  actionDescription?: string;
}

export const ReauthenticationModal: React.FC<ReauthenticationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'OPERAÇÃO CRÍTICA MJDH',
  actionDescription = 'Esta ação exige confirmação de segurança com Senha de Operador e Token TOTP/MFA.'
}) => {
  if (!isOpen) return null;

  const session = getCurrentSession();
  const [pin, setPin] = useState('');
  const [totp, setTotp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pin || pin.length < 4) {
      setError('Introduza o PIN de Operador de pelo menos 4 dígitos.');
      return;
    }

    if (!totp || totp.length !== 6) {
      setError('Introduza o código MFA / TOTP de 6 dígitos.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ok = reauthenticateSession(pin);
      setIsSubmitting(false);

      if (ok) {
        onSuccess();
        onClose();
      } else {
        setError('PIN ou token TOTP inválido. A tentativa foi registada na auditoria.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono animate-in fade-in duration-200">
      <div className="bg-[#111217] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-white tracking-wider uppercase">
                REAUTENTICAÇÃO OBRIGATÓRIA
              </h2>
              <p className="text-[10px] text-amber-400 font-bold">
                CAMADA 2 — PROTOCOLO DE SEGURANÇA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ACTION INFO */}
        <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="text-[10px] font-bold text-amber-300 uppercase block">
            {actionTitle}
          </span>
          <p className="text-xs text-neutral-300 font-sans leading-relaxed">
            {actionDescription}
          </p>
          <div className="pt-2 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
            <span>Operador: <strong className="text-white">{session.operator.fullName}</strong></span>
            <span>Público: <strong className="text-amber-400">{session.operator.badgeNumber}</strong></span>
          </div>
        </div>

        {/* ERROR NOTICE */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>PIN / SENHA DE OPERADOR (MJDH)</span>
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
              <span>TOKEN MFA / CÓDIGO TOTP (6 DÍGITOS)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={totp}
                onChange={(e) => setTotp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full rounded-xl px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono font-bold text-center text-sm tracking-widest focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setTotp('881902')}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-300 text-[10px] font-bold shrink-0 transition-colors"
                title="Simular código de gerador TOTP MJDH"
              >
                Gerar Simulação
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>VALIDANDO...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>CONFIRMAR REAUTENTICAÇÃO</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
