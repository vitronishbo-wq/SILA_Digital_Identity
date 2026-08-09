import React, { useState } from 'react';
import { Citizen } from '../../types/identity';
import { SilaLogo } from '../common/SilaLogo';
import { validateQrToken, formatBiNumber } from '../../utils/cryptoUtils';
import { QrCode, ShieldCheck, AlertTriangle, Search, CheckCircle2, RefreshCw, Camera, Lock, ArrowLeft, FileUp, Sun, Contrast, SlidersHorizontal, Hand } from 'lucide-react';
import { BiRequestModal } from './BiRequestModal';

interface PublicVerifierAppProps {
  citizens: Citizen[];
  onOpenCitizenPwa?: () => void;
  onOpenAdminPortal?: () => void;
}

type ValidationMode = 'SCANNER' | 'MANUAL' | 'CITIZENS';

export const PublicVerifierApp: React.FC<PublicVerifierAppProps> = ({
  citizens,
  onOpenCitizenPwa,
  onOpenAdminPortal
}) => {
  const [inputToken, setInputToken] = useState('001234567LA032');
  const [result, setResult] = useState(validateQrToken('001234567LA032'));
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>('citizen-2'); // João Manuel by default
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  
  // Swipe & Validation Modes State
  const [activeMode, setActiveMode] = useState<ValidationMode>('SCANNER');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [swipeFeedback, setSwipeFeedback] = useState<string | null>(null);

  const MODES: { id: ValidationMode; label: string; icon: React.ReactNode }[] = [
    { id: 'SCANNER', label: 'LEITOR QR', icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: 'MANUAL', label: 'PESQUISA BI', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'CITIZENS', label: 'PERFIS DEMO', icon: <ShieldCheck className="w-3.5 h-3.5" /> }
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45;

    const modeIds: ValidationMode[] = ['SCANNER', 'MANUAL', 'CITIZENS'];
    const currentIndex = modeIds.indexOf(activeMode);

    if (distance > minSwipeDistance) {
      // Swipe left -> next mode
      const nextIndex = (currentIndex + 1) % modeIds.length;
      setActiveMode(modeIds[nextIndex]);
      triggerSwipeFeedback(`◄ Modo: ${modeIds[nextIndex]}`);
    } else if (distance < -minSwipeDistance) {
      // Swipe right -> prev mode
      const prevIndex = (currentIndex - 1 + modeIds.length) % modeIds.length;
      setActiveMode(modeIds[prevIndex]);
      triggerSwipeFeedback(`Modo: ${modeIds[prevIndex]} ►`);
    }
  };

  const triggerSwipeFeedback = (msg: string) => {
    setSwipeFeedback(msg);
    setTimeout(() => setSwipeFeedback(null), 1200);
  };

  const handleValidate = (val: string) => {
    setInputToken(val);
    setResult(validateQrToken(val));
  };

  const handleSimulateScan = (biNumber: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      handleValidate(biNumber);
    }, 600);
  };

  const currentCitizen = citizens.find(c => c.biNumber === result.biNumber || c.id === selectedCitizenId) || citizens[0];

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`PublicVerifierApp min-h-screen transition-colors duration-300 flex flex-col justify-between p-4 md:p-8 pt-12 font-sans select-none relative touch-pan-y ${
        highContrast ? 'bg-white text-black' : 'bg-[#0c0d10] text-neutral-200'
      }`}
    >
      
      {/* SWIPE TOAST FEEDBACK */}
      {swipeFeedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-500 text-neutral-950 font-mono text-xs font-bold shadow-2xl animate-in fade-in zoom-in-90 duration-150">
          {swipeFeedback}
        </div>
      )}

      {/* HEADER WITH ACCESSIBILITY TOGGLE */}
      <div className={`max-w-xl mx-auto w-full flex items-center justify-between pb-4 border-b ${
        highContrast ? 'border-black' : 'border-neutral-800'
      }`}>
        <SilaLogo size="md" showSubtitle={true} />
        
        <div className="flex items-center gap-2">
          {/* Discrete Accessibility / High Contrast Toggle Button */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              highContrast
                ? 'bg-black text-amber-300 border-black ring-2 ring-black'
                : 'bg-neutral-900/90 text-neutral-300 border-neutral-700 hover:text-white hover:border-amber-500'
            }`}
            title="Modo de Acessibilidade / Alto Contraste (Para leitura sob luz forte)"
          >
            <Sun className={`w-3.5 h-3.5 ${highContrast ? 'text-amber-300' : 'text-amber-400'}`} />
            <span className="text-[11px] uppercase tracking-wider">
              {highContrast ? 'MODO SOL / CONTRASTE' : 'ALTO CONTRASTE'}
            </span>
          </button>

          <button
            onClick={() => setShowRequestModal(true)}
            className="p-2.5 rounded-full bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 transition-all shadow-sm active:scale-95"
            title="Solicitação 1ª Vez ou Renovação de BI (Upload & Dados Digital)"
          >
            <FileUp className="w-4 h-4" />
          </button>
          
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold ${
            highContrast
              ? 'bg-black text-white border-black'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            <span>TERMINAL DE VERIFICAÇÃO</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-xl mx-auto w-full my-auto py-6 space-y-5">
        
        {/* Title & Minimalist Icon Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <h1 className={`text-2xl font-extrabold uppercase tracking-tight ${
              highContrast ? 'text-black font-black' : 'text-white'
            }`}>
              LEITOR PÚBLICO & OFICIAL DE BI ELETRÓNICO
            </h1>
            <p className={`text-xs font-mono ${
              highContrast ? 'text-neutral-800 font-bold' : 'text-neutral-400'
            }`}>
              Sistema Institucional de Validação Criptográfica GOV.AO CA • RSA-4096
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-lg active:scale-95 flex-shrink-0"
            title="Submeter Pedido Digital (1ª Vez ou Renovação + Upload PDF/Imagem)"
          >
            <FileUp className="w-5 h-5" />
          </button>
        </div>

        {/* HIGH-END VALIDATION MODE SELECTOR & SWIPE INDICATOR */}
        <div className="space-y-2">
          <div className={`flex items-center justify-between p-1 rounded-2xl border font-mono text-xs ${
            highContrast ? 'bg-neutral-100 border-black' : 'bg-neutral-950 border-neutral-800'
          }`}>
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all ${
                  activeMode === m.id
                    ? highContrast
                      ? 'bg-black text-white shadow-md'
                      : 'bg-amber-500 text-neutral-950 shadow-lg'
                    : highContrast
                      ? 'text-neutral-700 hover:text-black'
                      : 'text-neutral-400 hover:text-white'
                }`}
              >
                {m.icon}
                <span className="text-[10px] uppercase tracking-wider">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-neutral-500 uppercase tracking-widest pt-0.5">
            <Hand className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>DESLIZE (SWIPE ◄ ►) PARA ALTERNAR MODO</span>
          </div>
        </div>

        {/* MODE 1: SCANNER CANVAS */}
        {(activeMode === 'SCANNER' || activeMode === 'MANUAL') && (
          <div className={`relative rounded-3xl p-6 flex flex-col items-center justify-center min-h-[220px] shadow-2xl overflow-hidden group border-2 ${
            highContrast
              ? 'bg-white border-black text-black'
              : 'bg-[#13151c] border-dashed border-amber-500/40'
          }`}>
            {!highContrast && (
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent pointer-events-none" />
            )}

            {isScanning ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center animate-pulse">
                  <Camera className="w-8 h-8 text-amber-500" />
                </div>
                <span className={`text-xs font-mono uppercase tracking-widest font-bold animate-pulse ${
                  highContrast ? 'text-black' : 'text-amber-400'
                }`}>
                  DECODIFICANDO TOKEN QR GOV.AO...
                </span>
              </div>
            ) : (
              <>
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-3 ${
                  highContrast ? 'bg-amber-100 border-black' : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <QrCode className="w-8 h-8 text-amber-600" />
                </div>
                <span className={`text-xs font-mono uppercase font-extrabold text-center ${
                  highContrast ? 'text-black' : 'text-neutral-300'
                }`}>
                  POSICIONE O QR CODE DO BI OU INSIRA O NÚMERO
                </span>
                <span className={`text-[10px] font-mono mt-1 ${
                  highContrast ? 'text-neutral-700 font-semibold' : 'text-neutral-500'
                }`}>
                  Validação instantânea offline/online • Assinatura RSA-4096
                </span>
              </>
            )}

            {/* Laser animation */}
            {isScanning && (
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-amber-500 shadow-[0_0_20px_#f59e0b] animate-ping" />
            )}
          </div>
        )}

        {/* MODE 3 OR DEMO SELECTOR: QUICK DEMO SCAN BUTTONS */}
        {(activeMode === 'CITIZENS' || activeMode === 'SCANNER') && (
          <div className="space-y-2">
            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold block text-center ${
              highContrast ? 'text-black' : 'text-neutral-500'
            }`}>
              TESTE INSTANTÂNEO DE LEITURA (CLIQUE PARA VALIDAR)
            </span>

            <div className="grid grid-cols-3 gap-2">
              {citizens.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCitizenId(c.id);
                    handleSimulateScan(c.biNumber);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                    c.biNumber === result.biNumber
                      ? highContrast
                        ? 'bg-amber-200 border-2 border-black text-black font-extrabold shadow-md'
                        : 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-lg'
                      : highContrast
                        ? 'bg-neutral-100 border-neutral-400 text-black hover:border-black'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <img
                    src={c.photoUrl}
                    alt={c.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-amber-500/60"
                  />
                  <span className="text-xs font-bold uppercase truncate max-w-full">
                    {c.preferredName}
                  </span>
                  <span className={`text-[10px] font-mono ${highContrast ? 'text-black font-semibold' : 'text-neutral-500'}`}>
                    {c.biNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MANUAL INPUT BAR */}
        {(activeMode === 'MANUAL' || activeMode === 'SCANNER') && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${highContrast ? 'text-black' : 'text-neutral-500'}`} />
              <input
                type="text"
                value={inputToken}
                onChange={(e) => handleValidate(e.target.value)}
                placeholder="Digite o Número do BI ou Token QR Criptografado..."
                className={`w-full rounded-2xl pl-10 pr-4 py-3 text-xs font-mono font-semibold focus:outline-none ${
                  highContrast
                    ? 'bg-white border-2 border-black text-black placeholder-neutral-600 focus:border-amber-500'
                    : 'bg-[#13151c] border border-neutral-800 text-white placeholder-neutral-500 focus:border-amber-500/50'
                }`}
              />
            </div>
            <button
              onClick={() => handleValidate(inputToken)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-2xl font-mono text-xs font-bold transition-all shrink-0 shadow-lg"
            >
              VALIDAR
            </button>
          </div>
        )}

        {/* OFFICIAL INSTITUTIONAL CERTIFICATE RESULT */}
        <div className={`rounded-3xl p-6 border transition-all shadow-2xl relative overflow-hidden ${
          result.valid ? 'animate-pulse' : ''
        } ${
          highContrast
            ? result.valid
              ? 'bg-emerald-100 border-4 border-emerald-700 text-black'
              : 'bg-red-100 border-4 border-red-700 text-black'
            : result.valid
              ? 'bg-gradient-to-br from-emerald-950/40 via-[#11161b] to-emerald-950/30 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
              : 'bg-gradient-to-br from-red-950/40 via-[#161113] to-red-950/30 border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.15)]'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                result.valid
                  ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-600 border-red-500/40'
              }`}>
                {result.valid ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>
              <div className="flex flex-col">
                <span className={`text-base font-extrabold uppercase tracking-tight ${
                  highContrast
                    ? 'text-black font-black'
                    : result.valid ? 'text-emerald-300' : 'text-red-300'
                }`}>
                  {result.valid ? '✔ IDENTIDADE OFICIAL CONFIRMADA' : '✖ FALHA NA AUTENTICAÇÃO'}
                </span>
                <span className={`text-xs font-mono font-semibold mt-0.5 ${
                  highContrast ? 'text-neutral-900 font-bold' : 'text-neutral-300'
                }`}>
                  {result.statusText}
                </span>
              </div>
            </div>

            {result.valid && (
              <span className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold ${
                highContrast
                  ? 'bg-emerald-800 text-white border-black'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}>
                VÁLIDO
              </span>
            )}
          </div>

          {result.valid && currentCitizen && (
            <div className={`mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-4 items-center ${
              highContrast ? 'border-black' : 'border-emerald-500/20'
            }`}>
              {/* Photo */}
              <div className="flex items-center gap-3">
                <img
                  src={currentCitizen.photoUrl}
                  alt={currentCitizen.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600"
                />
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${highContrast ? 'text-black' : 'text-white'}`}>
                    {currentCitizen.fullName}
                  </span>
                  <span className={`text-xs font-mono font-bold ${highContrast ? 'text-amber-800' : 'text-amber-400'}`}>
                    {formatBiNumber(result.biNumber || '')}
                  </span>
                </div>
              </div>

              {/* Attributes */}
              <div className="sm:col-span-2 grid grid-cols-2 gap-3 text-xs font-mono">
                <div className={`p-2.5 rounded-xl border ${
                  highContrast ? 'bg-white border-black text-black' : 'bg-neutral-900/80 border-neutral-800'
                }`}>
                  <span className={`text-[9px] uppercase block ${highContrast ? 'text-neutral-700 font-bold' : 'text-neutral-500'}`}>
                    DATA DE NASCIMENTO
                  </span>
                  <span className="font-semibold">{currentCitizen.birthDate}</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  highContrast ? 'bg-white border-black text-black' : 'bg-neutral-900/80 border-neutral-800'
                }`}>
                  <span className={`text-[9px] uppercase block ${highContrast ? 'text-neutral-700 font-bold' : 'text-neutral-500'}`}>
                    NACIONALIDADE
                  </span>
                  <span className="font-semibold">{currentCitizen.nationality}</span>
                </div>
                <div className={`p-2.5 rounded-xl border col-span-2 ${
                  highContrast ? 'bg-white border-black text-black' : 'bg-neutral-900/80 border-neutral-800'
                }`}>
                  <span className={`text-[9px] uppercase block ${highContrast ? 'text-neutral-700 font-bold' : 'text-neutral-500'}`}>
                    MORADA REGISTADA / EMISSOR
                  </span>
                  <span className="font-semibold truncate block">{currentCitizen.address}</span>
                </div>
              </div>
            </div>
          )}

          {/* Cryptographic Signature Footer */}
          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[10px] font-mono ${
            highContrast ? 'border-black text-black font-bold' : 'border-neutral-800/80 text-neutral-500'
          }`}>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>ASSINATURA DIGITAL RSA-4096</span>
            </span>
            <span className={highContrast ? 'text-black font-extrabold' : 'text-amber-400/80 font-bold'}>
              {result.signature}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER & PORTAL SWITCHER HELPER */}
      <div className={`max-w-xl mx-auto w-full flex items-center justify-between pt-6 border-t text-xs font-mono ${
        highContrast ? 'border-black text-black font-bold' : 'border-neutral-800 text-neutral-500'
      }`}>
        <span>
          REPÚBLICA DE ANGOLA • SILA DIGITAL IDENTITY
        </span>

        <div className="flex items-center gap-3">
          {onOpenCitizenPwa && (
            <button
              onClick={onOpenCitizenPwa}
              className={`underline font-semibold ${highContrast ? 'text-black' : 'text-amber-400 hover:text-amber-300'}`}
            >
              Cidadão PWA &gt;
            </button>
          )}
          {onOpenAdminPortal && (
            <button
              onClick={onOpenAdminPortal}
              className={`underline font-semibold ${highContrast ? 'text-black' : 'text-neutral-400 hover:text-white'}`}
            >
              Admin Portal &gt;
            </button>
          )}
        </div>
      </div>

      {showRequestModal && (
        <BiRequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </div>
  );
};

