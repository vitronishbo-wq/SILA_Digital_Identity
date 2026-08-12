import React, { useState } from 'react';
import { Building2, Check, X, Search, ShieldCheck, MapPin } from 'lucide-react';
import { OrganizationalScope } from '../../../types/auth';

interface OrganizationSelectorModalProps {
  isOpen: boolean;
  currentOrg: OrganizationalScope;
  availableOrgs: { code: OrganizationalScope; name: string; jurisdiction: string }[];
  onClose: () => void;
  onSelectOrg: (org: OrganizationalScope, name: string) => void;
}

export const OrganizationSelectorModal: React.FC<OrganizationSelectorModalProps> = ({
  isOpen,
  currentOrg,
  availableOrgs,
  onClose,
  onSelectOrg
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filteredOrgs = availableOrgs.filter(
    (o) =>
      o.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      o.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
      o.jurisdiction.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9990] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-[#111217] border border-blue-500/40 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2 text-blue-400">
            <Building2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">
              ORG / SCOPE SELECTOR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white p-1 rounded-lg transition-colors"
            title="X"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SEARCH FILTER INPUT */}
        {availableOrgs.length > 3 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="SEARCH ORG / CODE / JUR..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredOrgs.map((o) => {
            const isSelected = currentOrg === o.code;
            return (
              <button
                key={o.code}
                onClick={() => {
                  onSelectOrg(o.code, o.name);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-500/50 shadow-lg ring-1 ring-blue-500/30'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80'
                }`}
                title={o.name}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-white group-hover:text-blue-300 transition-colors">
                      {o.name}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-300 font-bold">
                      {o.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      JUR: <strong className="text-neutral-300">{o.jurisdiction}</strong>
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-neutral-950 flex items-center justify-center font-bold shrink-0 ml-2 shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-neutral-950 border border-neutral-800 group-hover:border-blue-500/50 flex items-center justify-center text-neutral-600 group-hover:text-blue-400 shrink-0 ml-2 transition-colors">
                    <Check className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </div>
                )}
              </button>
            );
          })}

          {filteredOrgs.length === 0 && (
            <div className="p-4 text-center text-neutral-500 text-xs font-mono">
              NO_MATCH: &quot;{filterQuery}&quot;
            </div>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center gap-2 text-[10px] font-mono text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>ABAC / AUDIT LOG SYNC ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
