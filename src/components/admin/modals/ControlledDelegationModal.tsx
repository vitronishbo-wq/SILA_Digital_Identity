import React, { useState } from 'react';
import { Users, UserCheck, Shield, KeyRound, X } from 'lucide-react';
import { OperatorRole } from '../../../types/auth';

interface ControlledDelegationModalProps {
  isOpen: boolean;
  activeDelegation: boolean;
  onClose: () => void;
  onStartDelegation: (targetRole: OperatorRole, dispatchRef: string, supervisorName: string) => void;
  onEndDelegation: () => void;
}

export const ControlledDelegationModal: React.FC<ControlledDelegationModalProps> = ({
  isOpen,
  activeDelegation,
  onClose,
  onStartDelegation,
  onEndDelegation
}) => {
  const [targetRole, setTargetRole] = useState<OperatorRole>('IDENTITY_ANALYST');
  const [dispatchRef, setDispatchRef] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchRef.trim() || !supervisorName.trim()) {
      setError('Despacho de Delegação e Nome do Supervisor são obrigatórios.');
      return;
    }
    if (pin !== '1234') {
      setError('PIN incorreto (1234).');
      return;
    }
    onStartDelegation(targetRole, dispatchRef, supervisorName);
    setDispatchRef('');
    setSupervisorName('');
    setPin('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-[#111217] border border-blue-500/40 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">
              DELEGAÇÃO CONTROLADA DE FUNÇÕES (IMPERSONATION FORMAL)
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

        {activeDelegation ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 space-y-2">
              <span className="font-bold block text-sm">DELEGAÇÃO FORMAL EM EXECUÇÃO</span>
              <p className="font-sans text-neutral-300">
                Está a atuar com mandato temporário respaldado por Despacho de Supervisão. Todas as ações mantêm rasto duplo: o seu utilizador original e o perfil delegado.
              </p>
            </div>

            <button
              onClick={() => {
                onEndDelegation();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              title="Encerrar Delegação"
            >
              <UserCheck className="w-4 h-4" />
              <span>REVOGAR DELEGAÇÃO E VOLTAR À FUNÇÃO TITULAR</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-neutral-400 font-sans text-xs">
              Diferente de uma simples troca de perfil, a <strong className="text-white">Delegação Controlada</strong> exige despacho formal, autorização do supervisor e gera rastreabilidade de responsabilidade civil em auditoria.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase block">
                FUNÇÃO A ASSUMIR TEMPORARIAMENTE *
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as OperatorRole)}
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-300 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="IDENTITY_ANALYST">IDENTITY_ANALYST — Analista de Identidade</option>
                <option value="BIOMETRIC_OPERATOR">BIOMETRIC_OPERATOR — Técnico Biométrico</option>
                <option value="SUPERVISOR">SUPERVISOR — Supervisor de Balcão</option>
                <option value="ISSUANCE_OPERATOR">ISSUANCE_OPERATOR — Operador de Emissão</option>
                <option value="AUDITOR">AUDITOR — Auditor de Conformidade</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase block">
                Nº DO DESPACHO DE SUBSTITUIÇÃO / DELEGAÇÃO *
              </label>
              <input
                type="text"
                value={dispatchRef}
                onChange={(e) => {
                  setDispatchRef(e.target.value);
                  setError('');
                }}
                placeholder="Ex.: ORD-SUBST-2026/0411-DNIC"
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase block">
                SUPERVISOR OU AUTORIDADE QUE APROVOU *
              </label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => {
                  setSupervisorName(e.target.value);
                  setError('');
                }}
                placeholder="Ex.: Dr. Sebastião Francisco Vunge"
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase block">
                PIN DO OPERADOR (1234) *
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
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-300 font-mono tracking-widest focus:outline-none focus:border-blue-500"
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
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/30"
                title="Iniciar Delegação Formal"
              >
                <Shield className="w-4 h-4" />
                <span>INICIAR DELEGAÇÃO FORMAL</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
