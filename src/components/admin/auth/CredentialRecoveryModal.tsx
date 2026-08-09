import React, { useState } from 'react';
import {
  X,
  Key,
  Smartphone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send
} from 'lucide-react';

interface CredentialRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CredentialRecoveryModal: React.FC<CredentialRecoveryModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'SUCCESS'>('REQUEST');
  const [identifier, setIdentifier] = useState('AGT-8812');
  const [channel, setChannel] = useState<'SMS' | 'INTRANET_EMAIL'>('INTRANET_EMAIL');
  const [tokenCode, setTokenCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('VERIFY');
      setStatusMessage(`Código de recuperação enviado para a conta institucional MJDH associada ao identificador '${identifier}'.`);
    }, 800);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenCode || !newPassword) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('SUCCESS');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono animate-in fade-in duration-200">
      <div className="bg-[#111217] border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-white tracking-wider uppercase">
                RECUPERAÇÃO DE CREDENCIAIS
              </h2>
              <p className="text-[10px] text-neutral-400 font-sans">
                Portal de Apoio Técnico e Gestão de Acessos MJDH
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

        {/* STEP 1: REQUEST */}
        {step === 'REQUEST' && (
          <form onSubmit={handleSendRecoveryCode} className="space-y-4">
            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              Introduza o seu N.º de Crachá Funcional MJDH, BI ou E-mail Governamental para solicitar o envio do token de segurança.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-300 block">
                IDENTIFICADOR DO OPERADOR / BI
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ex: AGT-8812 ou 004812932LA042"
                className="w-full rounded-xl px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-300 block">
                CANAL DE ENVIO DO TOKEN DE VALIDAÇÃO
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('INTRANET_EMAIL')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs transition-all ${
                    channel === 'INTRANET_EMAIL'
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>E-mail MJDH</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('SMS')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs transition-all ${
                    channel === 'SMS'
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>SMS Institucional</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !identifier}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SOLICITAR TOKEN DE RECUPERAÇÃO</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: VERIFY */}
        {step === 'VERIFY' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-sans">
              {statusMessage}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-300 block">
                CÓDIGO TOKEN RECEBIDO (6 DÍGITOS)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tokenCode}
                  onChange={(e) => setTokenCode(e.target.value)}
                  placeholder="EX: 489201"
                  className="w-full rounded-xl px-3.5 py-2 bg-neutral-950 border border-neutral-800 text-amber-400 font-mono font-bold text-center text-sm"
                />
                <button
                  type="button"
                  onClick={() => setTokenCode('489201')}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-[10px] font-bold shrink-0"
                >
                  Preencher Demo
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-300 block">
                NOVA SENHA DE OPERADOR MJDH
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl px-3.5 py-2 bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep('REQUEST')}
                className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !tokenCode || !newPassword}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ATUALIZAR CREDENCIAIS</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                CREDENCIAIS ATUALIZADAS COM SUCESSO
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                A sua nova chave de acesso foi registada no cofre de identidades institucionais MJDH.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Concluir
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
