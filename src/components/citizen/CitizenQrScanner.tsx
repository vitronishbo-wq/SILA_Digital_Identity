import React, { useState } from 'react';
import { ShieldCheck, QrCode, CheckCircle2, AlertTriangle, RefreshCw, Search, Flashlight, Camera, Zap } from 'lucide-react';
import { validateQrToken, formatBiNumber } from '../../utils/cryptoUtils';

export const CitizenQrScanner: React.FC = () => {
  const [inputToken, setInputToken] = useState('001234567LA032');
  const [result, setResult] = useState(validateQrToken('001234567LA032'));
  const [isScanning, setIsScanning] = useState(false);
  const [flashlight, setFlashlight] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const handleValidate = (val: string) => {
    setInputToken(val);
    setResult(validateQrToken(val));
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      handleValidate('001234567LA032');
    }, 900);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4 pb-24">
      {/* Top minimal status */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>LEITOR OFICIAL QR SILA</span>
        </div>
        <button
          onClick={handleSimulateScan}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-mono transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
          <span>SIMULAR QR</span>
        </button>
      </div>

      {/* Ultra-Sophisticated Mobile Camera Scanner Viewfinder */}
      <div className={`relative rounded-3xl bg-[#090a0d] border-2 transition-all duration-300 p-6 flex flex-col items-center justify-center min-h-[250px] overflow-hidden group shadow-2xl ${
        flashlight ? 'ring-2 ring-amber-400/50 bg-[#121318]' : 'border-neutral-800/80'
      }`}>
        
        {/* Camera Feed Background Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

        {/* Viewfinder Corner Crosshairs */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br-lg" />

        {/* Camera Quick Controls Header (Flash & Switch Camera) */}
        <div className="absolute top-3 inset-x-4 flex items-center justify-between z-20">
          <button
            onClick={() => setFlashlight(!flashlight)}
            className={`p-2 rounded-full border transition-all ${
              flashlight
                ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-[0_0_12px_#f59e0b]'
                : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
            title="Lanterna / Flash"
          >
            <Flashlight className="w-3.5 h-3.5" />
          </button>

          <span className="text-[9px] font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase">
            CÂMARA 4K {facingMode === 'environment' ? 'TRASEIRA' : 'FRONTAL'}
          </span>

          <button
            onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
            className="p-2 rounded-full bg-neutral-900/80 text-neutral-400 border border-neutral-800 hover:text-white transition-all"
            title="Alternar Câmara"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Sweeping Laser Line on Active Scan */}
        {isScanning ? (
          <div className="absolute inset-x-6 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#f59e0b] animate-pulse" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center my-4 group-hover:scale-105 transition-transform">
            <QrCode className="w-10 h-10 text-amber-400" />
          </div>
        )}

        <span className="relative z-10 text-xs font-mono text-neutral-300 uppercase text-center max-w-[210px] mt-2 font-medium">
          {isScanning ? 'A LER ASSINATURA DIGITAL SILA...' : 'POSICIONE O QR CODE DO BI NO REQUADRO'}
        </span>
      </div>

      {/* Direct Input Validation Tester */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={inputToken}
            onChange={(e) => handleValidate(e.target.value)}
            placeholder="Nº do BI ou Token JSON QR..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <button
          onClick={() => handleValidate(inputToken)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl font-mono text-xs font-bold transition-all shrink-0"
        >
          VALIDAR
        </button>
      </div>

      {/* Quick sample chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-mono text-neutral-500 mr-1 uppercase">EXEMPLO CIDADÃO:</span>
        <button
          onClick={() => handleValidate('001234567LA032')}
          className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold"
        >
          João Manuel (BI: 001234567LA032)
        </button>
      </div>

      {/* Verification Result Card */}
      <div className={`rounded-2xl p-4 border transition-all ${
        result.valid
          ? 'bg-emerald-950/20 border-emerald-500/40'
          : 'bg-red-950/20 border-red-500/40'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            result.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {result.valid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-xs font-bold uppercase ${result.valid ? 'text-emerald-300' : 'text-red-300'}`}>
              {result.valid ? '✔ IDENTIDADE CONFIRMADA' : '✖ FALHA NA VALIDAÇÃO'}
            </span>
            <span className="text-[11px] font-mono text-neutral-300 font-semibold truncate mt-0.5">
              {result.name || 'Desconhecido'}
            </span>
          </div>
        </div>

        {result.valid && (
          <div className="mt-3 pt-3 border-t border-emerald-500/20 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-[9px] text-neutral-500 uppercase block">BI / DOCUMENTO</span>
              <span className="text-amber-400 font-bold">{formatBiNumber(result.biNumber || '')}</span>
            </div>
            <div>
              <span className="text-[9px] text-neutral-500 uppercase block">ESTADO</span>
              <span className="text-emerald-400 font-semibold">AUTENTICADO • GOV.AO</span>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] text-neutral-500 uppercase block">ASSINATURA RSA</span>
              <span className="text-neutral-300 font-mono text-[10px] truncate block">{result.signature}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

