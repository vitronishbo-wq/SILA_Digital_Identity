import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, KeyRound, CheckCircle2, X } from 'lucide-react';

interface EmergencyBreakGlassModalProps {
  isOpen: boolean;
  isActive: boolean;
  onClose: () => void;
  onActivate: (justification: string, ticketRef: string) => void;
  onDeactivate: () => void;
}

export const EmergencyBreakGlassModal: React.FC<EmergencyBreakGlassModalProps> = ({
  isOpen,
  isActive,
  onClose,
  onActivate,
  onDeactivate
}) => {
  const [justification, setJustification] = useState('');
  const [ticketRef, setTicketRef] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim() || !ticketRef.trim()) {
      setError('Justificativa e Referência de Despacho são obrigatórias.');
      return;
    }
    if (pin !== '1234') {
      setError('PIN de autorização incorreto (1234).');
      return;
    }
    onActivate(justification, ticketRef);
    setJustification('');
    setTicketRef('');
    setPin('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-[#111217] border border-amber-500/50 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertOctagon className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">
              PROTOCOLO DE EMERGÊNCIA (BREAK-GLASS)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white p-1 rounded-lg"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isActive ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold font-mono text-amber-400">
                <ShieldAlert className="w-5 h-5" />
                <span>MODO DE EMERGÊNCIA JURÍDICA ATUALMENTE ATIVO</span>
              </div>
              <p className="font-sans text-neutral-300">
                As restrições habituais de jurisdição e validação foram elevadas temporariamente. Todas as ações executadas neste estado são enviadas ao Gabinete de Auditoria MJDH.
              </p>
            </div>

            <button
              onClick={() => {
                onDeactivate();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              title="Desativar Modo de Emergência e retornar ao modo normal"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>DESATIVAR MODO BREAK-GLASS E RESTAURAR REGRAS PADRÃO</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleActivateSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-sans">
              O recurso <strong className="text-amber-400">Break-Glass</strong> permite a ultrapassagem legal de barreiras de autorização em situações extraordinárias (ex.: catástrofes, falha de infraestrutura nacional ou requisição judicial urgente).
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase block">
                Nº DO DESPACHO / MANDADO / TICKET DE EMERGÊNCIA *
              </label>
              <input
                type="text"
                value={ticketRef}
                onChange={(e) => {
                  setTicketRef(e.target.value);
                  setError('');
                }}
                placeholder="Ex.: DESPACHO-MJDH-2026/0812-URG"
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase block">
                JUSTIFICATIVA LEGAL E OPERACIONAL OBRIGATÓRIA *
              </label>
              <textarea
                rows={2}
                value={justification}
                onChange={(e) => {
                  setJustification(e.target.value);
                  setError('');
                }}
                placeholder="Descreva fundamentação legal e necessidade imperiosa do serviço..."
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase block">
                PIN DO AUTORIZADOR (1234) *
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
              <span className="text-[10px] font-bold text-rose-400 block">
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
                title="Ativar Break-Glass"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>ATIVAR BREAK-GLASS</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
