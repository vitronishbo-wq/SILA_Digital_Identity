import React, { useState, useEffect } from 'react';
import { Citizen } from '../../types/identity';
import { Shield, Fingerprint, WifiOff, Bell, Key, LogOut, Check, ChevronRight, Download, Lock } from 'lucide-react';
import { formatBiNumber } from '../../utils/cryptoUtils';

interface CitizenProfileProps {
  citizen: Citizen;
  biometricEnabled?: boolean;
  onToggleBiometric?: () => void;
  onTestBiometric?: () => void;
  onLockWallet?: () => void;
}

export const CitizenProfile: React.FC<CitizenProfileProps> = ({
  citizen,
  biometricEnabled: propBiometricEnabled = true,
  onToggleBiometric,
  onTestBiometric,
  onLockWallet
}) => {
  const [internalBiometric, setInternalBiometric] = useState(propBiometricEnabled);
  const [offlineToken, setOfflineToken] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar o SILA ID: Toque no menu do navegador (⋮) e selecione "Adicionar ao ecrã principal" / "Instalar SILA ID".');
    }
  };

  const isBiometric = onToggleBiometric ? propBiometricEnabled : internalBiometric;

  const handleToggleBiometric = () => {
    if (onToggleBiometric) {
      onToggleBiometric();
    } else {
      setInternalBiometric(!internalBiometric);
    }
  };

  const handleCopyBi = () => {
    navigator.clipboard.writeText(citizen.biNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4 pb-24 font-mono">
      {/* Citizen minimal profile header */}
      <div className="flex items-center gap-4 p-4 rounded-3xl bg-neutral-900 border border-neutral-800">
        <img
          src={citizen.photoUrl}
          alt={citizen.fullName}
          className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/60"
        />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-base font-bold text-white truncate">{citizen.fullName}</span>
          <span className="text-xs font-mono text-amber-400 font-semibold">{formatBiNumber(citizen.biNumber)}</span>
          <span className="text-[10px] font-mono text-neutral-400 mt-0.5 truncate">{citizen.address}</span>
        </div>
      </div>

      {/* PIN & BIOMETRIA | CREDENCIAIS */}
      <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800/90 p-2.5 space-y-2">
        <div className="flex items-center justify-between px-1 pb-1 border-b border-neutral-800/80">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            PIN & BIOMETRIA
          </span>
          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold">
            RSA-4096
          </span>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
          
          {/* Biometria (Face/Touch ID) */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 min-w-0">
              <Fingerprint className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white truncate text-[10px]">BIOMETRIA</span>
                <span className="text-[8px] text-neutral-400 truncate">Face/Touch</span>
              </div>
            </div>
            <button
              onClick={handleToggleBiometric}
              className={`w-7 h-4 rounded-full transition-colors relative p-0.5 shrink-0 ${
                isBiometric ? 'bg-amber-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-neutral-950 transition-transform ${
                  isBiometric ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* PIN de Acesso */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 min-w-0">
              <Key className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white truncate text-[10px]">PIN PADRÃO</span>
                <span className="text-[8px] text-neutral-400 truncate">12345</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30">
              12345
            </span>
          </div>

          {/* Token Offline RSA */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 min-w-0">
              <WifiOff className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white truncate text-[10px]">TOKEN OFFLINE</span>
                <span className="text-[8px] text-neutral-400 truncate">QR RSA</span>
              </div>
            </div>
            <button
              onClick={() => setOfflineToken(!offlineToken)}
              className={`w-7 h-4 rounded-full transition-colors relative p-0.5 shrink-0 ${
                offlineToken ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-neutral-950 transition-transform ${
                  offlineToken ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Alert Push */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 min-w-0">
              <Bell className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white truncate text-[10px]">ALERTAS QR</span>
                <span className="text-[8px] text-neutral-400 truncate">Real-time</span>
              </div>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`w-7 h-4 rounded-full transition-colors relative p-0.5 shrink-0 ${
                pushNotifications ? 'bg-blue-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-neutral-950 transition-transform ${
                  pushNotifications ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* BOTÃO: BLOQUEAR CARTEIRA (PURGE SENSITIVE VISUAL DATA) */}
        {onLockWallet && (
          <button
            onClick={onLockWallet}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 text-xs font-mono font-bold transition-all shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>BLOQUEAR CARTEIRA</span>
            </div>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full uppercase">
              ISOLAR DADOS
            </span>
          </button>
        )}

        <button
          onClick={handleInstallPWA}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-emerald-500/10 hover:from-amber-500/30 hover:to-emerald-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold transition-all shadow-sm"
          title="Instalar SILA ID no dispositivo do avaliador para demonstração offline"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>INSTALAR SILA ID (PWA OFFLINE)</span>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full uppercase">
            {isInstalled ? 'INSTALADO' : '1-CLIQUE'}
          </span>
        </button>

        {onTestBiometric && (
          <button
            onClick={onTestBiometric}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-amber-400" />
              <span>TESTAR AUTENTICAÇÃO BIOMÉTRICA</span>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        )}

        <button
          onClick={handleCopyBi}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-mono font-semibold transition-colors"
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>COPIAR IDENTIFICADOR BI</span>
          </div>
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4 text-neutral-500" />}
        </button>
      </div>

      {/* Minimal Footer */}
      <div className="text-center pt-2">
        <span className="text-[10px] font-mono text-neutral-600 uppercase">
          SILA IDENTITY PWA v2.4 • CA RAÍZ GOV.AO
        </span>
      </div>
    </div>
  );
};
