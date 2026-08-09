import React, { useState, useEffect } from 'react';
import { Citizen, CitizenNavTab } from '../../types/identity';
import { SilaLogo } from '../common/SilaLogo';
import { SilaIdCard } from './SilaIdCard';
import { BiDetailModal } from './BiDetailModal';
import { BiometricAuthModal } from './BiometricAuthModal';
import { CitizenWallet } from './CitizenWallet';
import { CitizenQrScanner } from './CitizenQrScanner';
import { CitizenProfile } from './CitizenProfile';
import { CivilRegistryProcessModal } from './CivilRegistryProcessModal';
import { subscribeProcesses } from '../../services/processService';
import { ProcessItem } from '../admin/AdminPortalApp';
import { Home, Wallet, QrCode, Settings, Share2, ShieldCheck, Copy, Check, Wifi, BatteryCharging, Lock, ChevronRight, FileText, Building2, Clock } from 'lucide-react';

interface CitizenPwaAppProps {
  citizen: Citizen;
  onOpenAdminPortal?: () => void;
  onOpenPublicVerifier?: () => void;
}

export const CitizenPwaApp: React.FC<CitizenPwaAppProps> = ({
  citizen,
  onOpenAdminPortal,
  onOpenPublicVerifier
}) => {
  const [activeTab, setActiveTab] = useState<CitizenNavTab>('HOME');
  const [showBiDetailModal, setShowBiDetailModal] = useState(false);
  const [showCivilRegistryModal, setShowCivilRegistryModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [realtimeProcesses, setRealtimeProcesses] = useState<ProcessItem[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Real-time process updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeProcesses((procs) => {
      setRealtimeProcesses(procs);
    });
    return () => unsubscribe();
  }, []);

  // Find active process for current citizen
  const citizenProcess = realtimeProcesses.find(p => 
    p.cidadao.toLowerCase().includes(citizen.fullName.toLowerCase()) || 
    citizen.fullName.toLowerCase().includes(p.cidadao.toLowerCase())
  ) || realtimeProcesses[0];

  const handleRequestBiDetail = () => {
    if (biometricEnabled) {
      setShowBiometricModal(true);
    } else {
      setShowBiDetailModal(true);
    }
  };

  const navItems: { id: CitizenNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'HOME', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'WALLET', label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
    { id: 'SCANNER', label: 'Verificar', icon: <QrCode className="w-5 h-5" /> },
    { id: 'PROFILE', label: 'Perfil', icon: <Settings className="w-5 h-5" /> }
  ];

  const handleCopyShare = () => {
    navigator.clipboard.writeText(`https://sila-gov.ao/verify?bi=${citizen.biNumber}`);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#07080a] text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* Top Mobile Status Bar (Banking Phone Style) */}
      <div className="sticky top-0 z-40 bg-[#07080a]/90 backdrop-blur-xl border-b border-neutral-900/80 px-4 pt-3 pb-3">
        <div className="max-w-sm mx-auto flex flex-col space-y-2">
          
          {/* iOS / Android Native Header Clock & Status Icons */}
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-400 px-1">
            <span className="text-white tracking-tight">{currentTime || '09:41'}</span>

            <div className="flex items-center gap-2 text-neutral-300">
              <Wifi className="w-3.5 h-3.5" />
              <span className="text-[10px]">5G</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px]">98%</span>
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* App Bar Brand Header matching exact demo layout */}
          <div className="flex items-center justify-between pt-1 font-mono">
            <div className="flex items-center gap-2">
              <SilaLogo size="sm" showSubtitle={false} />
            </div>
            
            {/* Green Online Active Status Indicator Dot */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] tracking-widest uppercase">ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 py-3 max-w-sm mx-auto w-full">
        {activeTab === 'HOME' && (
          <div className="space-y-3.5 animate-in fade-in duration-200 text-center">
            
            {/* Section Title: BI ELETRÓNICO */}
            <div className="pt-1 pb-0.5">
              <h2 className="text-sm font-extrabold font-mono text-amber-400 uppercase tracking-[0.25em]">
                BI ELETRÓNICO
              </h2>
            </div>

            {/* The primary dark luxury ID card */}
            <SilaIdCard
              citizen={citizen}
              onSelectCard={handleRequestBiDetail}
            />

            {/* ● IDENTIDADE VÁLIDA status pill */}
            <div className="flex items-center justify-center my-2 pt-0.5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="tracking-widest uppercase">IDENTIDADE VÁLIDA</span>
              </div>
            </div>

            {/* LIVE FIRESTORE PROCESS STATUS TRACKER */}
            {citizenProcess && (
              <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 text-left font-mono space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase">
                    <Clock className="w-3.5 h-3.5" />
                    <span>PROCESSO {citizenProcess.id}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${
                    citizenProcess.estado === 'Aprovado' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                    citizenProcess.estado === 'Em análise' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                    citizenProcess.estado === 'Rejeitado' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                    'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  }`}>
                    {citizenProcess.estado}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-neutral-400 text-[11px]">{citizenProcess.tipo} • Sincronizado</span>
                  <span className="text-white font-bold">{citizenProcess.estado}</span>
                </div>
              </div>
            )}

            {/* DETALHES › Action Button */}
            <div className="w-full pt-1">
              <button
                onClick={handleRequestBiDetail}
                className="w-full py-3 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 flex items-center justify-center gap-2 text-xs font-mono font-bold text-amber-300 hover:text-amber-200 uppercase tracking-widest transition-all active:scale-98 shadow-lg"
              >
                <span>DETALHES</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'WALLET' && (
          <div className="animate-in fade-in duration-200">
            <CitizenWallet
              citizen={citizen}
              onSelectDocument={handleRequestBiDetail}
            />
          </div>
        )}

        {activeTab === 'SCANNER' && (
          <div className="animate-in fade-in duration-200">
            <CitizenQrScanner />
          </div>
        )}

        {activeTab === 'PROFILE' && (
          <div className="animate-in fade-in duration-200">
            <CitizenProfile
              citizen={citizen}
              biometricEnabled={biometricEnabled}
              onToggleBiometric={() => setBiometricEnabled(!biometricEnabled)}
              onTestBiometric={() => setShowBiometricModal(true)}
            />
          </div>
        )}
      </div>

      {/* Bottom Mobile Banking Dock Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#07080a]/95 backdrop-blur-2xl border-t border-neutral-900/90 py-2.5 px-6 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 transition-all px-3 py-1.5 rounded-2xl ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)] scale-105'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-mono font-semibold tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* iOS style home indicator handle bar */}
        <div className="w-32 h-1 bg-neutral-800 rounded-full mx-auto mt-2.5" />
      </div>

      {/* BI DETAIL MODAL */}
      {showBiDetailModal && (
        <BiDetailModal
          citizen={citizen}
          onClose={() => setShowBiDetailModal(false)}
          onOpenScanner={() => {
            setShowBiDetailModal(false);
            setActiveTab('SCANNER');
          }}
        />
      )}

      {/* CIVIL REGISTRY & RENEWAL PROCESS MODAL */}
      {showCivilRegistryModal && (
        <CivilRegistryProcessModal
          citizen={citizen}
          onClose={() => setShowCivilRegistryModal(false)}
          onCompleteProcess={() => setShowCivilRegistryModal(false)}
        />
      )}

      {/* SHARE PROFILE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                PARTILHAR PERFIL SILA
              </h3>
              <p className="text-xs font-mono text-neutral-400 mt-1">
                Token e link seguro de leitura rápida institucional
              </p>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 truncate">
              https://sila-gov.ao/verify?bi={citizen.biNumber}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyShare}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                {copiedShareLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedShareLink ? 'LINK COPIADO' : 'COPIAR LINK'}</span>
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs font-bold transition-all"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
