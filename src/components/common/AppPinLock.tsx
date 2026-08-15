import React, { useState } from 'react';
import { Citizen } from '../../types/identity';
import { ShieldCheck, Lock, Fingerprint, Delete, KeyRound, Phone, Mail, FileText, UserCheck, ArrowRight } from 'lucide-react';
import { SilaLogo } from './SilaLogo';
import { formatBiNumber } from '../../utils/cryptoUtils';

interface AppPinLockProps {
  citizen: Citizen;
  onUnlock: () => void;
}

export const AppPinLock: React.FC<AppPinLockProps> = ({ citizen, onUnlock }) => {
  const [phone, setPhone] = useState('+244 923 456 789');
  const [biNumber, setBiNumber] = useState(citizen.biNumber);
  const [nif, setNif] = useState('001234567LA032');
  const [email, setEmail] = useState('joao.silva@gov.ao');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'CREDENTIALS' | 'PIN'>('PIN');

  const PIN_LENGTH = 6;

  const handleKeyPress = (digit: string) => {
    if (pin.length < PIN_LENGTH && !isSuccess) {
      setError(false);
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === PIN_LENGTH) {
        verifyAndUnlock();
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !isSuccess) {
      setError(false);
      setPin(pin.slice(0, -1));
    }
  };

  const verifyAndUnlock = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onUnlock();
    }, 450);
  };

  const handleBiometricAuth = () => {
    setBiometricScanning(true);
    setTimeout(() => {
      setBiometricScanning(false);
      verifyAndUnlock();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-5 bg-[#07080a] text-white select-none overflow-y-auto animate-in fade-in duration-300">
      
      {/* HEADER: Institutional Seal & Brand */}
      <div className="relative z-10 w-full max-w-sm flex items-center justify-between pt-2">
        <SilaLogo size="sm" showSubtitle={false} />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono tracking-widest font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SILA GOV.AO</span>
        </div>
      </div>

      {/* CENTER CONTENT: Single Unique Identity Auth */}
      <div className="relative z-10 w-full max-w-sm my-auto py-4 flex flex-col items-center text-center space-y-5">
        
        {/* User Avatar & Unique Identity Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-400/40 to-emerald-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
            <img
              src={citizen.photoUrl}
              alt={citizen.fullName}
              className="w-full h-full object-cover rounded-full bg-neutral-900 border border-neutral-800"
            />
            <div className="absolute bottom-0 right-0 p-1 bg-amber-500 text-neutral-950 rounded-full shadow-md">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white uppercase tracking-tight">
              {citizen.fullName}
            </h2>
            <p className="text-xs font-mono text-amber-400 font-semibold">
              IDENTIDADE ÚNICA DIGITAL
            </p>
          </div>
        </div>

        {/* Tab switcher: Quick PIN vs Full Credentials view */}
        <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800 w-full">
          <button
            onClick={() => setActiveMode('PIN')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeMode === 'PIN' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            BIOMETRIA
          </button>
          <button
            onClick={() => setActiveMode('CREDENTIALS')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeMode === 'CREDENTIALS' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            CREDENCIAIS
          </button>
        </div>

        {activeMode === 'CREDENTIALS' ? (
          /* CREDENTIALS FORM VIEW (Tel, BI, NIF, Email) */
          <div className="w-full space-y-3 text-left animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-400" />
                Nº de Telemóvel
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1">
                  <FileText className="w-3 h-3 text-amber-400" />
                  Nº de BI
                </label>
                <input
                  type="text"
                  value={biNumber}
                  onChange={(e) => setBiNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-amber-400" />
                  NIF
                </label>
                <input
                  type="text"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1">
                <Mail className="w-3 h-3 text-amber-400" />
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={verifyAndUnlock}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>AUTENTICAR IDENTIDADE</span>
              <ArrowRight className="w-4 h-4 text-neutral-950" />
            </button>
          </div>
        ) : (
          /* PIN MODE VIEW */
          <div className="w-full space-y-4 flex flex-col items-center">
            {/* PIN Title / Status */}
            <div className="space-y-1">
              <p className="text-xs font-mono text-neutral-400">
                {isSuccess ? 'PIN Autenticado com Sucesso!' : 'Introduza o seu PIN de 6 dígitos'}
              </p>
              {error && (
                <p className="text-xs font-mono font-semibold text-rose-400 animate-bounce">
                  PIN Incorreto. Tente novamente.
                </p>
              )}
            </div>

            {/* PIN DOTS DISPLAY (6 Slots) */}
            <div className={`flex items-center justify-center gap-3 py-1 ${shake ? 'animate-shake' : ''}`}>
              {Array.from({ length: PIN_LENGTH }).map((_, idx) => {
                const isFilled = idx < pin.length;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                      isSuccess
                        ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_12px_#10b981] scale-110'
                        : isFilled
                        ? 'bg-amber-400 border-amber-400 shadow-[0_0_10px_#f59e0b] scale-110'
                        : 'bg-neutral-900 border-neutral-700/80'
                    }`}
                  />
                );
              })}
            </div>

            {/* BANKING NUMPAD (1 - 9, Biometric, 0, Delete) */}
            <div className="w-full max-w-[280px] grid grid-cols-3 gap-3 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                <button
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  className="w-14 h-14 rounded-full bg-neutral-900/90 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 border border-neutral-800/80 hover:border-amber-500/50 text-xl font-mono font-semibold text-white transition-all shadow-md active:scale-95 flex items-center justify-center mx-auto"
                >
                  {digit}
                </button>
              ))}

              {/* Biometric Button */}
              <button
                onClick={handleBiometricAuth}
                className="w-14 h-14 rounded-full bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500 border border-amber-500/40 text-amber-400 hover:text-amber-300 transition-all shadow-md active:scale-95 flex items-center justify-center mx-auto"
                title="Acesso Rápido por Biometria"
              >
                <Fingerprint className={`w-6 h-6 ${biometricScanning ? 'animate-pulse text-emerald-400' : ''}`} />
              </button>

              {/* Key "0" */}
              <button
                onClick={() => handleKeyPress('0')}
                className="w-14 h-14 rounded-full bg-neutral-900/90 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 border border-neutral-800/80 hover:border-amber-500/50 text-xl font-mono font-semibold text-white transition-all shadow-md active:scale-95 flex items-center justify-center mx-auto"
              >
                0
              </button>

              {/* Delete Key */}
              <button
                onClick={handleDelete}
                className="w-14 h-14 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800/80 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all shadow-md active:scale-95 flex items-center justify-center mx-auto"
                title="Apagar dígito"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: Security Enclave Indicator */}
      <div className="relative z-10 w-full max-w-sm flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-2 border-t border-neutral-800/60">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span>AUTENTICAÇÃO SEGURA GOV.AO</span>
        </div>
        <span>SILA ID v2.4</span>
      </div>
    </div>
  );
};

