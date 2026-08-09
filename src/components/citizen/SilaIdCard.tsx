import React, { useState, useRef } from 'react';
import { Citizen } from '../../types/identity';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, CheckCircle2, RotateCcw, Lock, Share2, Wallet, Download, Sparkles } from 'lucide-react';
import { formatBiNumber } from '../../utils/cryptoUtils';

interface SilaIdCardProps {
  citizen: Citizen;
  onSelectCard?: () => void;
  onRevealDetails?: () => void;
  onShare?: () => void;
  compact?: boolean;
}

export const SilaIdCard: React.FC<SilaIdCardProps> = ({
  citizen,
  onSelectCard,
  onRevealDetails,
  onShare,
  compact = false
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [addedToWallet, setAddedToWallet] = useState(false);
  const [showWalletPassModal, setShowWalletPassModal] = useState(false);
  
  // Holographic 3D Tilt state
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const primaryDoc = citizen.documents.find(d => d.type === 'BI') || citizen.documents[0];

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt calculations (-10deg to 10deg)
    const rx = ((y - centerY) / centerY) * -12;
    const ry = ((x - centerX) / centerX) * 12;
    
    setRotateX(rx);
    setRotateY(ry);
    
    // Glare position percentage
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  const handleAddToWallet = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWalletPassModal(true);
  };

  const confirmAddPass = () => {
    setAddedToWallet(true);
    setShowWalletPassModal(false);
    setTimeout(() => setAddedToWallet(false), 4000);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto select-none group">
      {/* 3D Holographic Tilt Card Wrapper */}
      <div
        ref={cardRef}
        onClick={onSelectCard}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: rotateX === 0 ? 'all 0.5s ease-out' : 'none'
        }}
        className="cursor-pointer transition-transform duration-200 active:scale-[0.98] transform-gpu"
      >
        {/* Outer gold glow gradient border wrapper matching Imagem 1 */}
        <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-br from-amber-500/60 via-neutral-800 to-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.18)]">
          
          {/* Holographic Iridescent Light Reflection Overlay */}
          <div
            className="absolute inset-0 rounded-[28px] pointer-events-none z-30 transition-opacity duration-300 opacity-30 group-hover:opacity-60"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.3) 0%, rgba(245,158,11,0.15) 25%, transparent 60%)`
            }}
          />

          {/* Card Canvas */}
          <div className="relative overflow-hidden rounded-[26.5px] bg-gradient-to-b from-[#14151a] via-[#0d0e12] to-[#0a0a0c] p-6 text-white min-h-[415px] flex flex-col justify-between">
            
            {/* Hexagon background grid pattern & Republic watermark */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 80% 20%, rgba(245,158,11,0.3) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(16,185,129,0.2) 0%, transparent 60%)`
              }}
            />

            {/* FRONT VIEW - Centered layout matching exact user wireframe */}
            {!isFlipped ? (
              <div className="relative z-10 flex flex-col items-center justify-between text-center min-h-[380px] space-y-3">
                {/* Top Header */}
                <div className="w-full flex items-center justify-between border-b border-neutral-800/80 pb-2">
                  <div className="w-6" /> {/* spacer */}
                  <span className="text-[11px] font-mono tracking-[0.2em] text-amber-400 uppercase font-extrabold">
                    REPÚBLICA DE ANGOLA
                  </span>
                  <button
                    onClick={handleFlip}
                    className="p-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors z-20"
                    title="Virar cartão BI"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Centered Photo with Verified Checkmark */}
                <div className="relative my-1">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500 shadow-xl bg-neutral-800">
                    <img
                      src={citizen.photoUrl}
                      alt={citizen.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-neutral-900 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Centered Citizen Name */}
                <div className="flex flex-col space-y-1">
                  <h3 className="text-lg font-black tracking-tight uppercase text-white leading-tight">
                    {citizen.fullName}
                  </h3>
                  
                  {/* Centered BI Number */}
                  <div className="text-sm font-mono text-amber-300 font-extrabold tracking-wider pt-0.5">
                    {formatBiNumber(citizen.biNumber)}
                  </div>

                  {/* Centered Validity */}
                  <div className="text-[11px] font-mono text-neutral-300 font-semibold tracking-wide">
                    VÁLIDO ATÉ {primaryDoc?.expiryDate?.includes('/') ? primaryDoc.expiryDate : '31/08/2031'}
                  </div>
                </div>

                {/* Centered QR Code */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="p-2 bg-white rounded-2xl shadow-xl border border-amber-500/30">
                    <QRCodeSVG
                      value={primaryDoc?.qrPayload || citizen.biNumber}
                      size={compact ? 95 : 110}
                      level="Q"
                      includeMargin={false}
                      imageSettings={{
                        src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f59e0b"><circle cx="12" cy="12" r="10"/></svg>',
                        x: undefined,
                        y: undefined,
                        height: 18,
                        width: 18,
                        excavate: true
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-neutral-400 mt-1.5">
                    SCAN TO VERIFY
                  </span>
                </div>
              </div>
            ) : (
              /* BACK VIEW - Institutional Attributes */
              <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-mono tracking-widest uppercase text-amber-400 font-bold">
                    VERSO / DADOS DO BI
                  </span>
                  <button
                    onClick={handleFlip}
                    className="p-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white z-20"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800 min-w-0">
                    <div className="text-[9px] text-neutral-500">DATA NASCIMENTO</div>
                    <div className="text-neutral-200 font-semibold truncate">{citizen.birthDate}</div>
                  </div>
                  <div className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800 min-w-0">
                    <div className="text-[9px] text-neutral-500">GÉNERO</div>
                    <div className="text-neutral-200 font-semibold truncate">{citizen.gender}</div>
                  </div>
                  <div className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800 col-span-2 min-w-0">
                    <div className="text-[9px] text-neutral-500">NACIONALIDADE</div>
                    <div className="text-neutral-200 font-semibold truncate">{citizen.nationality}</div>
                  </div>
                  <div className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800 col-span-2 min-w-0">
                    <div className="text-[9px] text-neutral-500">MORADA OFICIAL</div>
                    <div className="text-neutral-200 truncate">{citizen.address}</div>
                  </div>
                  {primaryDoc?.metadata && Object.entries(primaryDoc.metadata).map(([k, v]) => (
                    <div key={k} className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800 min-w-0">
                      <div className="text-[9px] text-neutral-500 uppercase truncate">{k}</div>
                      <div className="text-neutral-200 font-semibold truncate">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-500/80" />
                    DOCUMENTO AUTENTICADO
                  </span>
                  <span className="text-emerald-400 font-bold">REGISTO NACIONAL</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Wallet Pass Export Indicator Notification */}
      {addedToWallet && (
        <div className="mt-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Pass adicionado à Apple / Google Wallet!</span>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>
      )}

      {/* Wallet Action Button below ID card */}
      {!compact && (
        <div className="mt-4">
          <button
            onClick={handleAddToWallet}
            className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-neutral-900 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold hover:border-amber-500/60 transition-all shadow-lg active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span className="tracking-widest uppercase">ADICIONAR À CARTEIRA DIGITAL</span>
            </div>
            <Download className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      )}

      {/* APPLE WALLET PASS MODAL */}
      {showWalletPassModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
          <div className="relative w-full max-w-sm bg-[#121319] border border-amber-500/40 rounded-3xl shadow-2xl p-6 flex flex-col space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span>CARTEIRA DIGITAL GOV.AO</span>
              </div>
              <button
                onClick={() => setShowWalletPassModal(false)}
                className="text-neutral-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/60 rounded-2xl p-4 border border-neutral-800 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase">{citizen.fullName}</h4>
                <p className="text-xs font-mono text-amber-400 mt-0.5">
                  BI NO: {formatBiNumber(citizen.biNumber)}
                </p>
              </div>
              <p className="text-[11px] font-mono text-neutral-400">
                Gere um passe oficial criptografado compatível com Apple Wallet (iOS) e Google Wallet (Android).
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={confirmAddPass}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono font-bold text-xs rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>CONFIRMAR E GERAR PASSE WALLET</span>
              </button>
              <button
                onClick={() => setShowWalletPassModal(false)}
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-mono text-xs rounded-xl transition-all text-center"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

