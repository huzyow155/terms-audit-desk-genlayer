import React, { useState } from 'react';
import { Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { DEPLOYMENT_CONFIG } from '../config/deployment';
import type { RawReviewRecord } from '../lib/resultMapper';

interface ProofPanelProps {
  record: RawReviewRecord;
}

export const ProofPanel: React.FC<ProofPanelProps> = ({ record }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            On-Chain Consensus & Proof of Coverage Panel
          </h3>
        </div>
        <a
          href={`${DEPLOYMENT_CONFIG.explorerUrl}/address/${DEPLOYMENT_CONFIG.fullReadAddress}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400"
        >
          <span>Contract in Explorer</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
        {/* Review ID */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Review ID</span>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="font-mono text-slate-800 dark:text-slate-200 truncate">{record.review_id}</span>
            <button
              type="button"
              onClick={() => handleCopy('review_id', record.review_id)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Copy Review ID"
            >
              {copiedKey === 'review_id' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Document SHA-256 */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Normalized Doc SHA-256</span>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="font-mono text-slate-800 dark:text-slate-200 truncate">{record.doc_sha256}</span>
            <button
              type="button"
              onClick={() => handleCopy('doc_sha256', record.doc_sha256)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Copy Document SHA-256"
            >
              {copiedKey === 'doc_sha256' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Chunk Hashes */}
      <div className="mt-3.5 rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800/80 dark:bg-slate-950/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Deterministic Chunk Hashes ({record.chunk_hashes.length} chunks)
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            5,000 chars per partition
          </span>
        </div>
        <div className="space-y-1.5">
          {record.chunk_hashes.map((chHash, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 rounded bg-white px-2.5 py-1 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate">
                  {chHash}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(`chunk_${idx}`, chHash)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={`Copy Chunk ${idx + 1} hash`}
              >
                {copiedKey === `chunk_${idx}` ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Contract & Network Meta */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span>FullRead Contract:</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">{DEPLOYMENT_CONFIG.fullReadAddress}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Revision: #{record.revision}</span>
          <span>Max Chunks: {record.max_chunks}</span>
          <span>Ungrounded Discarded: {record.ungrounded_count}</span>
        </div>
      </div>
    </div>
  );
};
