import React, { useState } from 'react';
import { Citizen } from '../../types/identity';
import { ShieldCheck, Lock, Fingerprint, Delete, KeyRound, Phone, Mail, FileText, UserCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { SilaLogo } from './SilaLogo';
import {
  unlockCitizen,
  requestAdminAuthentication,
  getApplicationAuthState
} from '../../services/accessControlService';

interface AppPinLockProps {
  citizen: Citizen;
  onUnlockCitizen: () => void;
  onUnlockAdmin?: () => void;
}

export const AppPinLock: React.FC<AppPinLockProps> = ({
  citizen,
  onUnlockCitizen,
  onUnlockAdmin
}) => {
  const [phone, setPhone] = useState('+244 923 456 789');
  const [biNumber, setBiNumber] = useState(citizen.biNumber);
  const [nif, setNif] = useState('001234567LA032');
  const [email, setEmail] = useState('joao.silva@gov.ao');

  // Input buffer strictly for keypad recognition
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState<boolean>(false);
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successLabel, setSuccessLabel] = useState<string>('Autenticado com Sucesso');
  const [activeMode, setActiveMode] = useState<'PIN' | 'CREDENTIALS'>('PIN');

  // Maximum buffer limit for security
  const MAX_BUFFER_LENGTH = 8;

  /**
   * KEYPAD INPUT HANDLER:
   * Supports exclusively '0'-'9', '*', '#'
   * Pure input acquisition without embedded authorization logic
   */
  const handleKeypadPress = (key: string) => {
    if (inputBuffer.length >= MAX_BUFFER_LENGTH || isSuccess) return;
    setErrorMsg(null);

    const nextBuffer = inputBuffer + key;
    setInputBuffer(nextBuffer);

    // Forward sequence strictly to Access Control Service evaluation
    evaluateInputSequence(nextBuffer);
  };

  const handleBackspace = () => {
    if (inputBuffer.length > 0 && !isSuccess) {
      setErrorMsg(null);
      setInputBuffer(inputBuffer.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!isSuccess) {
      setErrorMsg(null);
      setInputBuffer('');
    }
  };

  /**
   * Delegates all authentication evaluation to the Access Control Service
   * The UI never grants ADMIN or elevation by itself.
   */
  const evaluateInputSequence = (sequence: string) => {
    // 1. Institutional sequence invocation check via Access Control Service
    if (sequence.startsWith('*') && sequence.endsWith('#') && sequence.length >= 6) {
      const authResult = requestAdminAuthentication({ secretSequence: sequence });
      if (authResult.success) {
        setIsSuccess(true);
        setSuccessLabel('Sessão Administrativa MJDH Iniciada');
        setTimeout(() => {
          setInputBuffer('');
          if (onUnlockAdmin) {
            onUnlockAdmin();
          } else {
            onUnlockCitizen();
          }
        }, 500);
        return;
      } else {
        triggerError('Código ou credencial institucional inválida.');
        return;
      }
    }

    // 2. Standard Citizen PIN length trigger (5 or 6 digits)
    if (sequence.length >= 5 && !sequence.includes('*') && !sequence.includes('#')) {
      const unlocked = unlockCitizen(sequence, citizen.biNumber);
      if (unlocked) {
        setIsSuccess(true);
        setSuccessLabel('Identidade do Cidadão Desbloqueada');
        setTimeout(() => {
          setInputBuffer('');
          onUnlockCitizen();
        }, 450);
      } else if (sequence.length >= 6) {
        triggerError('PIN incorreto. Tente novamente.');
      }
    }
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setInputBuffer('');
    }, 600);
  };

  const handleBiometricAuth = () => {
    setBiometricScanning(true);
    setTimeout(() => {
      setBiometricScanning(false);
      const unlocked = unlockCitizen('BIOMETRIC_OK', citizen.biNumber);
      if (unlocked) {
        setIsSuccess(true);
        setSuccessLabel('Biometria Validada');
        setTimeout(() => {
          setInputBuffer('');
          onUnlockCitizen();
        }, 450);
      }
    }, 600);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unlocked = unlockCitizen('BIOMETRIC_OK', citizen.biNumber);
    if (unlocked) {
      setIsSuccess(true);
      setSuccessLabel('Credenciais Cívicas Validadas');
      setTimeout(() => {
        onUnlockCitizen();
      }, 450);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-4 bg-[#07080a] text-white select-none overflow-y-auto animate-in fade-in duration-300 font-mono">
      
      {/* HEADER: Institutional Seal & Brand */}
      <div className="relative z-10 w-full max-w-xs flex items-center justify-between pt-1">
        <SilaLogo size="sm" showSubtitle={false} />
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] tracking-widest font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SILA GOV.AO</span>
        </div>
      </div>

      {/* CENTER CONTENT: Citizen Profile & Phone Keypad */}
      <div className="relative z-10 w-full max-w-xs my-auto py-2 flex flex-col items-center text-center space-y-4">
        
        {/* User Avatar */}
        <div className="flex flex-col items-center space-y-1.5">
          <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-amber-400/40 to-emerald-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <img
              src={citizen.photoUrl}
              alt={citizen.fullName}
              className="w-full h-full object-cover rounded-full bg-neutral-900 border border-neutral-800"
            />
            <div className="absolute bottom-0 right-0 p-1 bg-amber-500 text-neutral-950 rounded-full shadow">
              <Lock className="w-3 h-3" />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[240px]">
              {citizen.fullName}
            </h2>
            <p className="text-[10px] text-amber-400 font-bold tracking-wider">
              IDENTIDADE DIGITAL ANGOLANA
            </p>
          </div>
        </div>

        {/* Tab Switcher: PIN vs CREDENCIAIS */}
        <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800 w-full">
          <button
            onClick={() => setActiveMode('PIN')}
            className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'PIN' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            TECLADO PIN
          </button>
          <button
            onClick={() => setActiveMode('CREDENTIALS')}
            className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'CREDENTIALS' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            CREDENCIAIS
          </button>
        </div>

        {activeMode === 'CREDENTIALS' ? (
          /* FORM VIEW */
          <form onSubmit={handleCredentialsSubmit} className="w-full space-y-2.5 text-left text-xs">
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 uppercase font-bold flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-400" />
                Nº de Telemóvel
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase font-bold flex items-center gap-1">
                  <FileText className="w-3 h-3 text-amber-400" />
                  Nº BI
                </label>
                <input
                  type="text"
                  value={biNumber}
                  onChange={(e) => setBiNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 uppercase font-bold flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-amber-400" />
                  NIF
                </label>
                <input
                  type="text"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 uppercase font-bold flex items-center gap-1">
                <Mail className="w-3 h-3 text-amber-400" />
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>AUTENTICAR IDENTIDADE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* TELEPHONE KEYPAD MODE: 1 2 3 / 4 5 6 / 7 8 9 / * 0 # */
          <div className="w-full space-y-3 flex flex-col items-center">
            
            {/* Status Feedback */}
            <div className="min-h-[22px]">
              {isSuccess ? (
                <p className="text-xs text-emerald-400 font-bold tracking-tight">
                  ✓ {successLabel}
                </p>
              ) : errorMsg ? (
                <p className="text-xs text-rose-400 font-bold animate-pulse">
                  {errorMsg}
                </p>
              ) : (
                <p className="text-xs text-neutral-400">
                  Introduza o PIN de acesso
                </p>
              )}
            </div>

            {/* BUFFER DISPLAY SLOTS */}
            <div className={`flex items-center justify-center gap-2.5 py-1 ${shake ? 'animate-shake' : ''}`}>
              {Array.from({ length: 6 }).map((_, idx) => {
                const char = inputBuffer[idx];
                const isFilled = idx < inputBuffer.length;
                const isSymbol = char === '*' || char === '#';

                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
                      isSuccess
                        ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_10px_#10b981] scale-110'
                        : isFilled
                        ? isSymbol
                          ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_8px_#a855f7] scale-110'
                          : 'bg-amber-400 border-amber-400 shadow-[0_0_8px_#f59e0b] scale-110'
                        : 'bg-neutral-900 border-neutral-700/80'
                    }`}
                  >
                    {isSymbol ? char : ''}
                  </div>
                );
              })}
            </div>

            {/* CONTROLS BAR: BIOMETRICS, CLEAR, BACKSPACE */}
            <div className="w-full max-w-[260px] flex items-center justify-between px-2 pt-1">
              <button
                type="button"
                onClick={handleBiometricAuth}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-amber-400 font-bold transition-colors"
                title="Autenticação Biométrica"
              >
                <Fingerprint className={`w-3.5 h-3.5 ${biometricScanning ? 'animate-pulse text-emerald-400' : ''}`} />
                <span>BIOMETRIA</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={inputBuffer.length === 0}
                  className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-400 hover:text-white font-bold transition-colors disabled:opacity-30"
                  title="Limpar sequência"
                >
                  LIMPAR
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  disabled={inputBuffer.length === 0}
                  className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors disabled:opacity-30"
                  title="Apagar último dígito"
                >
                  <Delete className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* EXACT TELEPHONE KEYPAD:
                [ 1 ] [ 2 ] [ 3 ]
                [ 4 ] [ 5 ] [ 6 ]
                [ 7 ] [ 8 ] [ 9 ]
                [ * ] [ 0 ] [ # ]
             */}
            <div className="w-full max-w-[260px] grid grid-cols-3 gap-2.5 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeypadPress(key)}
                  className="w-16 h-12 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 border border-neutral-800/80 hover:border-amber-500/50 text-lg font-bold text-white transition-all shadow active:scale-95 flex items-center justify-center mx-auto"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: Security Enclave Indicator */}
      <div className="relative z-10 w-full max-w-xs flex items-center justify-between text-[10px] text-neutral-500 pt-2 border-t border-neutral-900">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span>SESSÃO PROTEGIDA GOV.AO</span>
        </div>
        <span>SILA ID v2.4</span>
      </div>
    </div>
  );
};
