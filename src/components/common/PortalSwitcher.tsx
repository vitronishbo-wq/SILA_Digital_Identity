import React, { useState } from 'react';
import { PortalMode, Citizen } from '../../types/identity';
import { Smartphone, Monitor, QrCode, User, ChevronDown, ChevronUp, Layers, Lock } from 'lucide-react';

interface PortalSwitcherProps {
  currentPortal: PortalMode;
  onSelectPortal: (mode: PortalMode) => void;
  activeCitizen: Citizen;
  citizens: Citizen[];
  onSelectCitizen: (citizen: Citizen) => void;
  onLockApp?: () => void;
}

export const PortalSwitcher: React.FC<PortalSwitcherProps> = ({
  currentPortal,
  onSelectPortal,
  activeCitizen,
  citizens,
  onSelectCitizen,
  onLockApp
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showCitizenMenu, setShowCitizenMenu] = useState(false);

  const portals: { id: PortalMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'CITIZEN_PWA',
      label: 'Cidadão PWA',
      icon: <Smartphone className="w-3.5 h-3.5" />,
      desc: 'Imagem 1 • BI Eletrónico & Wallet'
    },
    {
      id: 'ADMIN_PORTAL',
      label: 'Portal Admin',
      icon: <Monitor className="w-3.5 h-3.5" />,
      desc: 'Imagem 2 • GovOS Dashboard'
    },
    {
      id: 'PUBLIC_VERIFIER',
      label: 'Verificador QR',
      icon: <QrCode className="w-3.5 h-3.5" />,
      desc: 'Validação Rápida Oficial'
    }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex justify-center p-2">
      <div className="pointer-events-auto bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-full shadow-2xl transition-all duration-200">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs">
          {/* Portal Toggle Pills */}
          {!collapsed && (
            <div className="flex items-center gap-1">
              {portals.map(p => {
                const isActive = currentPortal === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPortal(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all duration-150 cursor-pointer select-none ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 border border-transparent'
                    }`}
                    title={p.desc}
                  >
                    {p.icon}
                    <span>{p.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-[1px] bg-neutral-800 mx-1" />

              {/* Citizen selector dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCitizenMenu(!showCitizenMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 transition-all text-[11px]"
                >
                  <User className="w-3 h-3 text-amber-400" />
                  <span className="max-w-[100px] truncate">{activeCitizen.preferredName}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {showCitizenMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1 z-50">
                    <div className="px-2 py-1 text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
                      Selecionar Perfil Demo
                    </div>
                    {citizens.map(c => {
                      const selected = c.id === activeCitizen.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            onSelectCitizen(c);
                            setShowCitizenMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                            selected
                              ? 'bg-amber-500/15 text-amber-300 font-medium'
                              : 'text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>{c.fullName}</span>
                            <span className="text-[10px] font-mono text-neutral-500">BI: {c.biNumber}</span>
                          </div>
                          {selected && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {onLockApp && (
                <>
                  <div className="h-4 w-[1px] bg-neutral-800 mx-0.5" />
                  <button
                    onClick={onLockApp}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all text-[11px] font-mono"
                    title="Bloquear aplicativo com PIN (Modo Banco)"
                  >
                    <Lock className="w-3 h-3 text-rose-400" />
                    <span>PIN Lock</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title={collapsed ? 'Expandir seletor de portal' : 'Recolher seletor'}
          >
            {collapsed ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 text-amber-400 text-xs font-mono">
                <Layers className="w-3.5 h-3.5" />
                <span>{currentPortal === 'CITIZEN_PWA' ? 'PWA' : currentPortal === 'ADMIN_PORTAL' ? 'ADMIN' : 'QR VERIFIER'}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              </div>
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

