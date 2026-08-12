import React, { useState } from 'react';
import { AlertTriangle, KeyRound, CheckCircle2, X } from 'lucide-react';

interface CriticalConfirmModalProps {
  isOpen: boolean;
  actionTitle: string;
  actionDescription: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const CriticalConfirmModal: React.FC<CriticalConfirmModalProps> = ({
  isOpen,
  actionTitle,
  actionDescription,
  onClose,
  onConfirm
}) => {
  const [reason, setReason] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A justificativa operacional de auditoria é obrigatória.');
      return;
    }
    if (pin !== '1234') {
      setError('PIN incorreto (1234).');
      return;
    }
    onConfirm(reason);
    setReason('');
    setPin('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9995] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#111217] border border-amber-500/50 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">
              CONFIRMAÇÃO DE OPERAÇÃO CRÍTICA
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

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">{actionTitle}</h4>
          <p className="text-xs text-neutral-400 font-sans">{actionDescription}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase block">
              JUSTIFICATIVA DA AÇÃO (AUDITORIA) *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Ex.: Validação dactiloscópica verificada no leitor óptico..."
              className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase block">
              PIN DE SEGURANÇA (1234) *
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
                placeholder="1234..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-300 font-mono tracking-widest focus:outline-none focus:border-amber-500"
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
              title="Cancelar"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20"
              title="Confirmar Operação"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CONFIRMAR OPERAÇÃO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
