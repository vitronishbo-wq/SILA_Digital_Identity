import React, { useState } from 'react';
import { Flame, ShieldAlert, AlertTriangle, KeyRound, X } from 'lucide-react';

interface GlobalKillSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmKill: (reason: string) => void;
}

export const GlobalKillSessionsModal: React.FC<GlobalKillSessionsModalProps> = ({
  isOpen,
  onClose,
  onConfirmKill
}) => {
  const [reason, setReason] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A justificativa de auditoria é obrigatória.');
      return;
    }
    if (pin !== '1234') {
      setError('PIN de autorização incorreto (Utilize 1234 para testes).');
      return;
    }
    onConfirmKill(reason);
    setReason('');
    setPin('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-[#111217] border border-rose-500/50 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <Flame className="w-5 h-5 text-rose-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">
              PURGA GLOBAL — ENCERRAR TODAS AS SESSÕES DA REDE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white p-1 rounded-lg"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-sans space-y-1">
          <div className="flex items-center gap-1.5 font-bold font-mono text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>AÇÃO RESTRITA A PERFIS COM ALTA AUTORIDADE</span>
          </div>
          <p>
            Esta operação encerrará imediatamente a sessão de todos os operadores, analistas e técnicos ativos no SILA em todo o território nacional. Todos os postos terão de reautenticar via MFA.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase block">
              MOTIVO / JUSTIFICATIVA FORMAL DE INCIDENTE OU MANUTENÇÃO *
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Ex.: Manutenção urgente de infraestrutura PKI ou suspeita de comprometimento de rede..."
              className="w-full p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase block">
              PIN DE CONFIRMAÇÃO DO ADMINISTRADOR *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="PIN 1234..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-300 font-mono tracking-widest focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {error && (
            <span className="text-[10px] font-bold text-rose-400 block font-mono">
              {error}
            </span>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 hover:bg-neutral-800 font-bold"
              title="Cancelar operação"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-600/30"
              title="Confirmar encerramento de todas as sessões"
            >
              <Flame className="w-4 h-4" />
              <span>EXECUTAR PURGA DA REDE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
