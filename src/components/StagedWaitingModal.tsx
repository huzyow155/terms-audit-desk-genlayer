import React from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSearch,
  Users,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { DEPLOYMENT_CONFIG } from '../config/deployment';
import type { TxProgressUpdate } from '../lib/wallet';

interface StagedWaitingModalProps {
  isOpen: boolean;
  onClose: () => void;
  update: TxProgressUpdate | null;
  error?: string | null;
  title?: string;
  onSuccessDismiss?: () => void;
}

const STAGES = [
  { id: 'WALLET_CONFIRM', label: 'Wallet Confirmation', icon: Send, desc: 'Sign transaction in MetaMask' },
  { id: 'SUBMITTED', label: 'Submitted to Studionet', icon: Clock, desc: 'Broadcasted to GenLayer mempool' },
  { id: 'VALIDATING', label: 'Validators Reading', icon: FileSearch, desc: 'Validators fetch URL & evaluate clauses' },
  { id: 'CONSENSUS', label: 'Consensus Agreement', icon: Users, desc: 'Validators compare outputs & reach agreement' },
  { id: 'FINALIZED', label: 'Accepted by Validators', icon: ShieldCheck, desc: 'Audit accepted by validators on-chain. Accepted results can still be appealed until finalization.' },
];

function getStageIndex(stageId?: string): number {
  switch (stageId) {
    case 'WALLET_CONFIRM':
      return 0;
    case 'SUBMITTED':
      return 1;
    case 'VALIDATING':
      return 2;
    case 'CONSENSUS':
      return 3;
    case 'FINALIZED':
      return 4;
    default:
      return 0;
  }
}

export const StagedWaitingModal: React.FC<StagedWaitingModalProps> = ({
  isOpen,
  onClose,
  update,
  error,
  title = 'On-Chain Execution in Progress',
  onSuccessDismiss,
}) => {
  if (!isOpen) return null;

  const currentIdx = getStageIndex(update?.stage);
  const isFinalized = update?.stage === 'FINALIZED';
  const hasError = Boolean(error);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="staged-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 id="staged-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              GenLayer studionet &bull; Decentralized Intelligent Contract Execution
            </p>
          </div>
          {(isFinalized || hasError) && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6">
          {/* Status Message & Timer */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950/60 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {hasError ? 'Execution Encountered an Error' : update?.message || 'Processing...'}
              </p>
              {update?.hash && (
                <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                  <span>Tx:</span>
                  <a
                    href={`${DEPLOYMENT_CONFIG.explorerUrl}/tx/${update.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-400"
                  >
                    <span>{update.hash.slice(0, 10)}...{update.hash.slice(-8)}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                {update?.elapsedSeconds || 0}s
              </span>
              <p className="text-[10px] text-slate-400">elapsed</p>
            </div>
          </div>

          {/* Error Banner */}
          {hasError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div>
                <span className="font-bold">Transaction failed: </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Stepper Progression */}
          {!hasError && (
            <div className="space-y-3">
              {STAGES.map((s, idx) => {
                const Icon = s.icon;
                const isPassed = currentIdx > idx || isFinalized;
                const isCurrent = currentIdx === idx && !isFinalized;

                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3.5 rounded-lg p-2.5 transition-colors ${
                      isCurrent
                        ? 'border border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40'
                        : isPassed
                        ? 'border border-transparent bg-slate-50 dark:bg-slate-950/30'
                        : 'border border-transparent opacity-40'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-sky-600 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-sky-900 dark:text-sky-200'
                              : isPassed
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-500'
                          }`}
                        >
                          {s.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 animate-pulse">
                            In progress...
                          </span>
                        )}
                        {isPassed && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Latency Note */}
          <div className="rounded-lg bg-amber-50 p-3 text-[11px] text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
            <span className="font-semibold">Honest Latency Note: </span>
            GenLayer Intelligent Contracts perform real web fetches, multi-chunk deterministic evaluations, and consensus voting.
            Transactions typically reach acceptance by validators within <span className="font-bold">20 to 110 seconds</span> (1 chunk about <span className="font-bold">18 to 25 s</span> in our measurements). Accepted results can still be appealed until finalization. Please keep this tab open. If you refresh, the pending transaction will automatically resume tracking.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          {hasError ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Dismiss
            </button>
          ) : isFinalized ? (
            <button
              type="button"
              onClick={onSuccessDismiss || onClose}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>View Updated Audit</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
