import React, { useState } from 'react';
import { ProvinceTerritory, Municipality, Commune, INITIAL_PROVINCES, PROVINCE_CODES } from '../../data/territory';
import { MapPin, Plus, Trash2, Building, ShieldCheck, Crown, ChevronRight, Layers, Sparkles, Check } from 'lucide-react';

export const TerritoryManagement: React.FC = () => {
  const [provinces, setProvinces] = useState<ProvinceTerritory[]>(INITIAL_PROVINCES);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('LUA');
  const [selectedMuniId, setSelectedMuniId] = useState<string | null>('LUA-muni-1');

  // Input states for adding new municipality / commune
  const [newMuniName, setNewMuniName] = useState('');
  const [newCommuneName, setNewCommuneName] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const selectedProvince = provinces.find(p => p.code === selectedProvinceCode) || provinces[0];
  const selectedMuni = selectedProvince.municipalities.find(m => m.id === selectedMuniId) || selectedProvince.municipalities[0];

  const handleAddMunicipality = () => {
    if (!newMuniName.trim()) return;
    const newMuni: Municipality = {
      id: `${selectedProvinceCode}-muni-${Date.now()}`,
      name: newMuniName.trim(),
      communes: [
        { id: `${selectedProvinceCode}-com-${Date.now()}-1`, name: `${newMuniName.trim()} Sede` }
      ]
    };

    setProvinces(prev =>
      prev.map(p => {
        if (p.code === selectedProvinceCode) {
          return {
            ...p,
            municipalities: [...p.municipalities, newMuni]
          };
        }
        return p;
      })
    );

    setNewMuniName('');
    setSelectedMuniId(newMuni.id);
    showToast(`Município "${newMuni.name}" adicionado à Província de ${selectedProvince.name}!`);
  };

  const handleDeleteMunicipality = (muniId: string, muniName: string) => {
    setProvinces(prev =>
      prev.map(p => {
        if (p.code === selectedProvinceCode) {
          return {
            ...p,
            municipalities: p.municipalities.filter(m => m.id !== muniId)
          };
        }
        return p;
      })
    );

    if (selectedMuniId === muniId) {
      setSelectedMuniId(null);
    }
    showToast(`Município "${muniName}" removido.`);
  };

  const handleAddCommune = () => {
    if (!newCommuneName.trim() || !selectedMuni) return;

    const newCom: Commune = {
      id: `${selectedMuni.id}-com-${Date.now()}`,
      name: newCommuneName.trim()
    };

    setProvinces(prev =>
      prev.map(p => {
        if (p.code === selectedProvinceCode) {
          return {
            ...p,
            municipalities: p.municipalities.map(m => {
              if (m.id === selectedMuni.id) {
                return {
                  ...m,
                  communes: [...m.communes, newCom]
                };
              }
              return m;
            })
          };
        }
        return p;
      })
    );

    setNewCommuneName('');
    showToast(`Comuna "${newCom.name}" adicionada ao Município de ${selectedMuni.name}!`);
  };

  const handleDeleteCommune = (communeId: string, communeName: string) => {
    if (!selectedMuni) return;

    setProvinces(prev =>
      prev.map(p => {
        if (p.code === selectedProvinceCode) {
          return {
            ...p,
            municipalities: p.municipalities.map(m => {
              if (m.id === selectedMuni.id) {
                return {
                  ...m,
                  communes: m.communes.filter(c => c.id !== communeId)
                };
              }
              return m;
            })
          };
        }
        return p;
      })
    );

    showToast(`Comuna "${communeName}" removida.`);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-neutral-950 text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SUPERADMIN CROWN BADGE HEADER */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                SUPERADMIN: DEUSFUNDADOR
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded">
                21 PROVÍNCIAS ATIVAS
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white uppercase tracking-tight mt-1">
              GESTAÇÃO DE HIERARQUIA TERRITORIAL
            </h2>
            <p className="text-xs text-neutral-400 font-sans">
              Configuração oficial das Províncias, Municípios e Comunas do Registo Civil
            </p>
          </div>
        </div>

        {/* LOGIC CLARITY BOX */}
        <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-[11px] space-y-1 max-w-md">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>DIVISÃO E HIERARQUIA DE RESPONSABILIDADE</span>
          </div>
          <p className="text-neutral-400 leading-tight text-[10px] font-sans">
            • <strong>Províncias, Municípios & Comunas:</strong> Geridos pelo SuperAdmin Deusfundador.<br />
            • <strong>Bairros, Ruas & Nºs de Casa:</strong> Preenchidos diretamente pelo Utente/Cidadão.
          </p>
        </div>
      </div>

      {/* 21 PROVINCES SELECTION GRID */}
      <div className="p-5 rounded-3xl bg-[#111318] border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>SELECIONAR PROVÍNCIA (21 CÓDIGOS OFICIAIS)</span>
          </span>
          <span className="text-[10px] text-neutral-500">Clique para expandir municípios</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {provinces.map(prov => {
            const isSelected = prov.code === selectedProvinceCode;
            return (
              <button
                key={prov.code}
                onClick={() => {
                  setSelectedProvinceCode(prov.code);
                  setSelectedMuniId(prov.municipalities[0]?.id || null);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase">{prov.code}</span>
                  <span className="text-[9px] px-1 rounded bg-neutral-800 text-neutral-400">
                    {prov.municipalities.length}m
                  </span>
                </div>
                <span className="text-[10px] font-sans font-medium text-neutral-300 block truncate mt-0.5">
                  {prov.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MUNICIPALITIES AND COMMUNES DYNAMIC MANAGEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* COLUMN 1: MUNICIPALITIES MANAGEMENT */}
        <div className="p-5 rounded-3xl bg-[#111318] border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase">
                MUNICÍPIOS DE {selectedProvince.name.toUpperCase()} [{selectedProvince.code}]
              </span>
              <p className="text-[10px] text-neutral-500 font-sans">
                Adicionar ou remover municípios dinamicamente
              </p>
            </div>
            <span className="text-xs font-bold text-white bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
              {selectedProvince.municipalities.length} MUNICÍPIOS
            </span>
          </div>

          {/* Add new Municipality Form */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Novo Nome do Município..."
              value={newMuniName}
              onChange={(e) => setNewMuniName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleAddMunicipality}
              disabled={!newMuniName.trim()}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-bold text-xs uppercase flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>CRIAR</span>
            </button>
          </div>

          {/* Municipality List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {selectedProvince.municipalities.map(muni => {
              const isSelected = muni.id === selectedMuniId;
              return (
                <div
                  key={muni.id}
                  onClick={() => setSelectedMuniId(muni.id)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-white'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Building className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-xs font-bold font-sans block truncate">{muni.name}</span>
                      <span className="text-[10px] text-neutral-500 block">
                        {muni.communes.length} comuna(s) associada(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMunicipality(muni.id, muni.name);
                      }}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Excluir município"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: COMMUNES MANAGEMENT */}
        <div className="p-5 rounded-3xl bg-[#111318] border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase">
                COMUNAS DO MUNICÍPIO: {selectedMuni ? selectedMuni.name.toUpperCase() : 'NENHUM SELECIONADO'}
              </span>
              <p className="text-[10px] text-neutral-500 font-sans">
                Adicionar comunas oficiais sob jurisdição municipal
              </p>
            </div>
            {selectedMuni && (
              <span className="text-xs font-bold text-white bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                {selectedMuni.communes.length} COMUNAS
              </span>
            )}
          </div>

          {selectedMuni ? (
            <>
              {/* Add new Commune Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nova Comuna..."
                  value={newCommuneName}
                  onChange={(e) => setNewCommuneName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleAddCommune}
                  disabled={!newCommuneName.trim()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-neutral-950 font-bold text-xs uppercase flex items-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>CRIAR</span>
                </button>
              </div>

              {/* Commune List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedMuni.communes.map(commune => (
                  <div
                    key={commune.id}
                    className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-sans font-bold text-white truncate">
                        {commune.name}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteCommune(commune.id, commune.name)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Excluir comuna"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-neutral-500">
              Selecione um município ao lado para gerir as suas comunas.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
