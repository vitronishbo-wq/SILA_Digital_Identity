import React, { useState, useRef } from 'react';
import { Upload, FileUp, CheckCircle2, X, ShieldCheck, Fingerprint, RefreshCw, FileCheck, UserPlus, QrCode, MapPin } from 'lucide-react';
import { PROVINCE_CODES, INITIAL_PROVINCES } from '../../data/territory';

interface BiRequestModalProps {
  onClose: () => void;
}

export const BiRequestModal: React.FC<BiRequestModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'FIRST_TIME' | 'RENEWAL'>('FIRST_TIME');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nif, setNif] = useState('');
  const [parentsName, setParentsName] = useState('');
  
  // Territorial Hierarchy state
  const [selectedProvCode, setSelectedProvCode] = useState<string>('LUA');
  const [selectedMuniName, setSelectedMuniName] = useState<string>('Talatona');
  const [selectedCommuneName, setSelectedCommuneName] = useState<string>('Talatona');
  const [bairroRua, setBairroRua] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [protocolNum, setProtocolNum] = useState('');

  const currentProvTerritory = INITIAL_PROVINCES.find(p => p.code === selectedProvCode) || INITIAL_PROVINCES[0];
  const currentMunis = currentProvTerritory.municipalities;
  const currentMuniObj = currentMunis.find(m => m.name === selectedMuniName) || currentMunis[0];
  const currentCommunes = currentMuniObj ? currentMuniObj.communes : [];

  const [isDragging, setIsDragging] = useState(false);

  // Swipe-down gesture state
  const [translateY, setTranslateY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartY.current;
    
    // Only drag downwards
    if (diffY > 0) {
      setTranslateY(diffY);
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 110) {
      // Threshold passed -> close modal
      onClose();
    } else {
      // Reset position
      setTranslateY(0);
    }
    touchStartY.current = null;
    setIsSwiping(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type.includes('pdf') ||
        droppedFile.type.includes('image')
      ) {
        setFile(droppedFile);
        setFileName(droppedFile.name);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    setProtocolNum(`SILA-REQ-2026-${randomHex}`);
    setSubmitted(true);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
        className="BiRequestModal relative w-full max-w-md bg-[#13151c] border-t sm:border border-amber-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden p-6 pt-3 flex flex-col space-y-4 touch-pan-y"
      >
        {/* Mobile Drag Down Indicator Handle Bar */}
        <div className="w-12 h-1.5 bg-neutral-700 hover:bg-amber-500 rounded-full mx-auto cursor-grab active:cursor-grabbing transition-colors" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Minimalist Top Badge */}
        <div className="flex items-center justify-between pr-8 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono tracking-wider font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SOLICITAÇÃO & UPLOAD DIGITAL</span>
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Minimalist Icon-based Switcher (1ª Vez / Renovação) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setMode('FIRST_TIME')}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all ${
                  mode === 'FIRST_TIME'
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Pedido de Emissão pela 1ª Vez"
              >
                <UserPlus className="w-4 h-4" />
                <span>1ª VEZ</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('RENEWAL')}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all ${
                  mode === 'RENEWAL'
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Pedido de Renovação de BI"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RENOVAÇÃO</span>
              </button>
            </div>

            {/* Minimalist Professional Drag-and-Drop Zone */}
            <div className="relative">
              <label
                htmlFor="bi-file-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-150 ${
                  file
                    ? 'border-emerald-500/70 bg-emerald-500/10'
                    : isDragging
                    ? 'border-amber-400 bg-amber-500/15 scale-[1.01]'
                    : 'border-amber-500/30 bg-neutral-900/40 hover:bg-neutral-900 hover:border-amber-500/70'
                }`}
              >
                <input
                  id="bi-file-upload"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {file ? (
                  <div className="flex items-center gap-3 text-emerald-400">
                    <FileCheck className="w-8 h-8 flex-shrink-0" />
                    <div className="text-left">
                      <span className="text-xs font-mono font-bold block truncate max-w-[210px] text-white">
                        {fileName}
                      </span>
                      <span className="text-[10px] text-emerald-400 uppercase font-mono font-semibold">
                        PDF/IMG VERIFICADO • SILA GOV.AO
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-11 h-11 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-neutral-200 font-semibold tracking-tight">
                      PDF / IMAGEM • SILA GOV.AO
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Arraste o documento ou toque para selecionar
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* Minimalist ultra-compact inputs with smart placeholders */}
            <div className="space-y-2 font-mono text-xs">
              {/* Nome Completo */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nome Completo (como no Registo Civil)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Data de Nascimento & NIF */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    required
                    placeholder="Data de Nascimento"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 transition-colors text-[11px]"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="NIF / Nº BI (000000000LA000)"
                    value={nif}
                    onChange={(e) => setNif(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white uppercase placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors text-[11px]"
                  />
                </div>
              </div>

              {/* Nome dos Pais */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nome dos Pais (Filiação: Pai & Mãe)"
                  value={parentsName}
                  onChange={(e) => setParentsName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Hierarquia Territorial (Província - 21 Códigos & Município & Comuna) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select
                    value={selectedProvCode}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setSelectedProvCode(newCode);
                      const provObj = INITIAL_PROVINCES.find(p => p.code === newCode);
                      if (provObj && provObj.municipalities.length > 0) {
                        setSelectedMuniName(provObj.municipalities[0].name);
                        setSelectedCommuneName(provObj.municipalities[0].communes[0]?.name || '');
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 transition-colors text-[11px]"
                  >
                    {INITIAL_PROVINCES.map(p => (
                      <option key={p.code} value={p.code} className="bg-neutral-900 text-white">
                        {p.name} [{p.code}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedMuniName}
                    onChange={(e) => {
                      const newMuniName = e.target.value;
                      setSelectedMuniName(newMuniName);
                      const mObj = currentMunis.find(m => m.name === newMuniName);
                      if (mObj && mObj.communes.length > 0) {
                        setSelectedCommuneName(mObj.communes[0].name);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 transition-colors text-[11px]"
                  >
                    {currentMunis.map(m => (
                      <option key={m.id} value={m.name} className="bg-neutral-900 text-white">
                        Mun. {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comuna & Bairro / Rua / Casa */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select
                    value={selectedCommuneName}
                    onChange={(e) => setSelectedCommuneName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 transition-colors text-[11px]"
                  >
                    {currentCommunes.map(c => (
                      <option key={c.id} value={c.name} className="bg-neutral-900 text-white">
                        Com. {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Telefone (+244)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors text-[11px]"
                  />
                </div>
              </div>

              {/* Endereço Detalhado pelo Utente: Bairro, Rua, Casa */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="Bairro, Rua/Avenida e Nº da Casa (Utente)"
                  value={bairroRua}
                  onChange={(e) => setBairroRua(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Institutional Footnote highlighted exactly as requested */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-300">
              <Fingerprint className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-mono leading-tight">
                <strong>A presença física serve apenas para recolha de dados biométricos.</strong> A instrução e verificação documental são 100% digitais.
              </p>
            </div>

            {/* Minimalist Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-bold tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>SUBMETER PEDIDO DIGITAL</span>
            </button>
          </form>
        ) : (
          /* Success Screen */
          <div className="py-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                PEDIDO DE {mode === 'FIRST_TIME' ? '1ª EMISSÃO' : 'RENOVAÇÃO'} SUBMETIDO
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                O seu processo foi registado na plataforma SILA GOV.AO.
              </p>
            </div>

            {/* Protocol Badge */}
            <div className="w-full p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between font-mono">
              <div className="text-left">
                <span className="text-[9px] text-neutral-500 uppercase block">PROTOCOLO DIGITAL</span>
                <span className="text-amber-400 text-sm font-bold">{protocolNum}</span>
              </div>
              <QrCode className="w-8 h-8 text-neutral-400" />
            </div>

            {/* Highlight reminder */}
            <div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
              Apresente este protocolo em qualquer balcão apenas para recolha rápida das impressões digitais e foto (Biometria).
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-semibold transition-colors"
            >
              CONCLUÍR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
