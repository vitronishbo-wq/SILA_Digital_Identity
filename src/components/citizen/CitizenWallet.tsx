import React, { useState } from 'react';
import { Citizen, CitizenDocument } from '../../types/identity';
import { ShieldCheck, ChevronDown, ChevronUp, FileCheck, Copy, Check, Plus, ExternalLink, Key, PenTool } from 'lucide-react';
import { DocumentSigningModal } from './DocumentSigningModal';

interface CitizenWalletProps {
  citizen: Citizen;
  onSelectDocument?: (doc: CitizenDocument) => void;
  onAddDocument?: (doc: CitizenDocument) => void;
}

export const CitizenWallet: React.FC<CitizenWalletProps> = ({ citizen, onSelectDocument, onAddDocument }) => {
  const [expandedDocId, setExpandedDocId] = useState<string | null>(citizen.documents[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSigningModal, setShowSigningModal] = useState<boolean>(false);
  const [localDocs, setLocalDocs] = useState<CitizenDocument[]>(citizen.documents);

  const toggleExpand = (id: string) => {
    setExpandedDocId(expandedDocId === id ? null : id);
  };

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddNewDocument = (newDoc: CitizenDocument) => {
    setLocalDocs(prev => [newDoc, ...prev]);
    if (onAddDocument) {
      onAddDocument(newDoc);
    }
  };

  const docIconColor = (type: string) => {
    switch (type) {
      case 'BI': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'REGISTO_CIVIL': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'NIF': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default: return 'text-neutral-400 bg-neutral-800 border-neutral-700';
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-3 pb-24">
      {/* Wallet Top Minimal Summary */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">
            DOCUMENTOS OFICIAIS ({localDocs.length})
          </span>
        </div>
        <button
          onClick={() => setShowSigningModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono font-bold text-xs transition-all shadow-md active:scale-95 border border-amber-400"
          title="Assinar e adicionar novo documento à Wallet"
        >
          <PenTool className="w-3.5 h-3.5 text-neutral-950" />
          <span>+ ASSINAR DOC</span>
        </button>
      </div>

      {/* Documents List */}
      <div className="space-y-2.5">
        {localDocs.map(doc => {
          const isExpanded = expandedDocId === doc.id;
          return (
            <div
              key={doc.id}
              onClick={() => toggleExpand(doc.id)}
              className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden transition-all duration-200 cursor-pointer hover:border-neutral-700 shadow-md"
            >
              {/* Document Summary Bar */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${docIconColor(doc.type)}`}>
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white uppercase truncate">
                      {doc.title}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      Nº: {doc.documentNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-semibold">
                    ATIVO
                  </span>
                  <div className="p-1 rounded-full text-neutral-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Operational Drawer */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-neutral-800/80 bg-neutral-950/60 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                      <span className="text-[9px] text-neutral-500 uppercase block">VAL. / EXPIRA</span>
                      <span className="text-amber-400 font-semibold">{doc.expiryDate}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                      <span className="text-[9px] text-neutral-500 uppercase block">EMISSOR</span>
                      <span className="text-neutral-200 font-semibold truncate">{doc.issuingAuthority}</span>
                    </div>
                  </div>

                  {doc.metadata && (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {Object.entries(doc.metadata).map(([k, v]) => (
                        <div key={k} className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                          <span className="text-[9px] text-neutral-500 uppercase block">{k}</span>
                          <span className="text-neutral-300 font-medium truncate">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/60">
                    <button
                      onClick={(e) => handleCopy(e, doc.documentNumber, doc.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono font-semibold transition-colors"
                    >
                      {copiedId === doc.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">COPIADO</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPIAR Nº</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectDocument) onSelectDocument(doc);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold transition-colors"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>GERAR QR TOKEN</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DOCUMENT SIGNING MODAL */}
      {showSigningModal && (
        <DocumentSigningModal
          citizen={citizen}
          onClose={() => setShowSigningModal(false)}
          onAddDocument={handleAddNewDocument}
        />
      )}
    </div>
  );
};
