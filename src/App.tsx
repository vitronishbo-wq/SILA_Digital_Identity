/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PortalMode, Citizen } from './types/identity';
import { DEMO_CITIZENS } from './data/demoData';
import { CitizenPwaApp } from './components/citizen/CitizenPwaApp';
import { AdminPortalApp } from './components/admin/AdminPortalApp';
import { PublicVerifierApp } from './components/verifier/PublicVerifierApp';
import { AppPinLock } from './components/common/AppPinLock';
import { Settings, ShieldCheck, Lock, Smartphone, QrCode } from 'lucide-react';

export default function App() {
  // PIN lock enabled by default when app launches (banking app behavior)
  const [isAppLocked, setIsAppLocked] = useState<boolean>(true);
  const [currentPortal, setCurrentPortal] = useState<PortalMode>('CITIZEN_PWA');
  const [citizens] = useState<Citizen[]>(DEMO_CITIZENS);
  const [activeCitizen, setActiveCitizen] = useState<Citizen>(DEMO_CITIZENS[0]);
  const [showDevMenu, setShowDevMenu] = useState<boolean>(false);

  const handleSelectCitizen = (citizen: Citizen) => {
    setActiveCitizen(citizen);
  };

  return (
    <div className="relative min-h-screen bg-[#0c0d10] text-white selection:bg-amber-500 selection:text-neutral-950 font-sans">
      {/* Banking-Grade Access PIN Screen when opening app */}
      {isAppLocked && (
        <AppPinLock
          citizen={activeCitizen}
          onUnlock={() => setIsAppLocked(false)}
        />
      )}

      {/* PORTAL 1: CITIZEN PWA (Unique ID Card, Wallet, QR, Details) */}
      {currentPortal === 'CITIZEN_PWA' && (
        <CitizenPwaApp
          citizen={activeCitizen}
          onOpenAdminPortal={() => setCurrentPortal('ADMIN_PORTAL')}
          onOpenPublicVerifier={() => setCurrentPortal('PUBLIC_VERIFIER')}
        />
      )}

      {/* PORTAL 2: ADMIN PORTAL GOVOS (Dashboard, KPIs, Audits) */}
      {currentPortal === 'ADMIN_PORTAL' && (
        <AdminPortalApp
          citizens={citizens}
          onSelectCitizen={handleSelectCitizen}
          onOpenCitizenPwa={() => setCurrentPortal('CITIZEN_PWA')}
          onOpenPublicVerifier={() => setCurrentPortal('PUBLIC_VERIFIER')}
        />
      )}

      {/* PORTAL 3: PUBLIC VERIFIER (Terminal de Verificação QR Oficial) */}
      {currentPortal === 'PUBLIC_VERIFIER' && (
        <PublicVerifierApp
          citizens={citizens}
          onOpenCitizenPwa={() => setCurrentPortal('CITIZEN_PWA')}
          onOpenAdminPortal={() => setCurrentPortal('ADMIN_PORTAL')}
        />
      )}

      {/* DISCRETE DEV ACCESS CONTROL (For development testing only - not part of public portal UI) */}
      <div className="fixed bottom-16 right-3 z-50 pointer-events-auto">
        {showDevMenu ? (
          <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl p-2 flex flex-col space-y-1.5 animate-in fade-in duration-150">
            <div className="px-2 py-1 text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
              Painel Dev (Desenvolvimento)
            </div>
            <button
              onClick={() => {
                setCurrentPortal('CITIZEN_PWA');
                setShowDevMenu(false);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                currentPortal === 'CITIZEN_PWA'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Cidadão PWA</span>
            </button>

            <button
              onClick={() => {
                setCurrentPortal('ADMIN_PORTAL');
                setShowDevMenu(false);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                currentPortal === 'ADMIN_PORTAL'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Portal Admin</span>
            </button>

            <button
              onClick={() => {
                setCurrentPortal('PUBLIC_VERIFIER');
                setShowDevMenu(false);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                currentPortal === 'PUBLIC_VERIFIER'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Terminal Verificador</span>
            </button>

            <button
              onClick={() => {
                setIsAppLocked(true);
                setShowDevMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Bloquear App (PIN)</span>
            </button>

            <button
              onClick={() => setShowDevMenu(false)}
              className="pt-1 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 text-center uppercase"
            >
              [Fechar]
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDevMenu(true)}
            className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-500 hover:text-amber-400 transition-all shadow-lg active:scale-95 flex items-center justify-center opacity-40 hover:opacity-100"
            title="Acesso Dev Admin (Oculto em Produção)"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}


