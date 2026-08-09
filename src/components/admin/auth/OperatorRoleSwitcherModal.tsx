import React, { useState } from 'react';
import {
  X,
  UserCheck,
  ShieldAlert,
  Building2,
  MapPin,
  CheckCircle2,
  Lock,
  ChevronRight,
  Shield,
  Crown,
  Users,
  Key,
  FileSearch,
  BarChart3,
  Settings,
  Flame
} from 'lucide-react';
import { OperatorRole } from '../../types/auth';
import { MJDH_OPERATORS, switchActiveOperator, getCurrentSession } from '../../services/accessControlService';

interface OperatorRoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSwitched: () => void;
}

export const OperatorRoleSwitcherModal: React.FC<OperatorRoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  onRoleSwitched
}) => {
  if (!isOpen) return null;

  const currentSession = getCurrentSession();
  const currentRole = currentSession.operator.role;
  const [selectedRole, setSelectedRole] = useState<OperatorRole>(currentRole);

  const handleApplyRole = () => {
    switchActiveOperator(selectedRole);
    onRoleSwitched();
    onClose();
  };

  const roleList: { role: OperatorRole; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      role: 'SERVICE_AGENT',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      desc: 'Atendimento presencial no balcão, agendamentos, registo inicial de processos e verificação balcão.'
    },
    {
      role: 'IDENTITY_ANALYST',
      icon: <FileSearch className="w-4 h-4 text-blue-400" />,
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
      desc: 'Análise documental de cidadãos, validação de filiação/certidões, aprovação/rejeição de pedidos de BI.'
    },
    {
      role: 'BIOMETRIC_OPERATOR',
      icon: <Key className="w-4 h-4 text-teal-400" />,
      color: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
      desc: 'Recolha dactiloscópica 10-impressões, captura facial regulada OACI, verificação de duplicados AFIS.'
    },
    {
      role: 'SUPERVISOR',
      icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      desc: 'Supervisão de posto regional, aprovação de exceções de jurisdição e reatribuição de processos.'
    },
    {
      role: 'ISSUANCE_OPERATOR',
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      color: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
      desc: 'Gestão da central de personalização de cartões BI, impressão laser, gravação de chip e lotes.'
    },
    {
      role: 'AUDITOR',
      icon: <Shield className="w-4 h-4 text-indigo-400" />,
      color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
      desc: 'Acesso estritamente de LEITURA e AUDITORIA. Monitorização de conformidade e integridade cívica.'
    },
    {
      role: 'REPORTING_OFFICER',
      icon: <BarChart3 className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
      desc: 'Análise de métricas, gráficos operacionais e emissão de relatórios governamentais territoriais.'
    },
    {
      role: 'SYSTEM_ADMIN',
      icon: <Settings className="w-4 h-4 text-cyan-400" />,
      color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
      desc: 'Administração de utilizadores do sistema, gestão técnica de servidores e parâmetros de rede.'
    },
    {
      role: 'GOVERNANCE_ADMIN',
      icon: <Crown className="w-4 h-4 text-amber-300" />,
      color: 'border-amber-400/50 bg-amber-400/10 text-amber-200',
      desc: 'SuperAdministrador de Governação (Deusfundador). Gestão de políticas nacionais e auditoria global.'
    }
  ];

  const activeProfile = MJDH_OPERATORS[selectedRole];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono animate-in fade-in duration-200">
      <div className="bg-[#111217] border border-neutral-800 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl overflow-hidden relative">
        
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wider uppercase">
                SELECIONAR PAPEL OPERACIONAL (RBAC / ABAC)
              </h2>
              <p className="text-xs text-neutral-400 font-sans">
                Selecione qual das 9 funções institucionais do MJDH deseja assumir nesta sessão.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTICE BOX */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-sans flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-mono uppercase font-bold text-amber-200 block mb-0.5">
              REGRA DE SEGURANÇA MJDH: NUNCA ASSUMIR ADMIN = ACESSO TOTAL
            </strong>
            O acesso a cada recurso e funcionalidade depende rigorosamente de:{' '}
            <span className="font-mono text-white bg-neutral-900 px-1 py-0.5 rounded border border-neutral-700">
              ROLE + ORGANIZATION + TERRITORY + RESOURCE + ACTION + POLICY
            </span>
          </div>
        </div>

        {/* ROLE SELECTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {roleList.map((item) => {
            const isSelected = selectedRole === item.role;
            const isCurrent = currentRole === item.role;

            return (
              <button
                key={item.role}
                onClick={() => setSelectedRole(item.role)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 relative ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-lg ring-1 ring-amber-500/40'
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-white tracking-wider">
                      {item.role}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      SESSÃO ATIVA
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-neutral-400 font-sans leading-tight line-clamp-2">
                  {item.desc}
                </p>

                <div className="text-[9px] text-amber-400 font-mono font-bold pt-1 border-t border-neutral-800/80">
                  {MJDH_OPERATORS[item.role].roleTitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* SELECTED ROLE PREVIEW DETAIL */}
        {activeProfile && (
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
              PARÂMETROS DA CREDENCIAL SELECIONADA:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-[9px] text-neutral-500 block">OPERADOR & NÚMERO DE CRACHÁ</span>
                <span className="text-white font-bold block">{activeProfile.fullName}</span>
                <span className="text-amber-400 text-[10px]">{activeProfile.badgeNumber}</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-[9px] text-neutral-500 block">ESCOPO ORGANIZACIONAL</span>
                <span className="text-amber-300 font-bold block truncate">{activeProfile.organizationName}</span>
                <span className="text-neutral-400 text-[10px]">{activeProfile.organization}</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-[9px] text-neutral-500 block">JURISDIÇÃO TERRITORIAL</span>
                <span className="text-emerald-400 font-bold block truncate">
                  {activeProfile.territories.join(', ')}
                </span>
                <span className="text-neutral-400 text-[10px]">Nível de Acesso {activeProfile.clearanceLevel}/5</span>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleApplyRole}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ATIVAR PERFIL ({selectedRole})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
