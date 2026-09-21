import React from 'react';
import { Award, CheckCircle, XCircle, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { DEPLOYMENT_CONFIG } from '../config/deployment';
import type { RawReviewRecord } from '../lib/resultMapper';

interface ConsumerApprovalProps {
  record: RawReviewRecord;
  isApproved: boolean;
  approvalReviewId: string;
  onApproveOnChain?: () => void;
  isApproving?: boolean;
  hasWallet: boolean;
}

export const ConsumerApproval: React.FC<ConsumerApprovalProps> = ({
  record,
  isApproved,
  approvalReviewId,
  onApproveOnChain,
  isApproving,
  hasWallet,
}) => {
  const isEligible = record.outcome === 'PASS' && record.coverage_bp === 10000;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Downstream Smart Contract Policy Consumer
          </h3>
        </div>
        <a
          href={`${DEPLOYMENT_CONFIG.explorerUrl}/address/${DEPLOYMENT_CONFIG.consumerAddress}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400"
        >
          <span>Consumer in Explorer</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950/50 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              On-Chain Document Policy Status:
            </span>
            {isApproved ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                <CheckCircle className="h-3.5 w-3.5" />
                APPROVED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <XCircle className="h-3.5 w-3.5" />
                NOT APPROVED
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isApproved
              ? `Approved on-chain by review record: ${approvalReviewId}`
              : 'The DocumentPolicyConsumer contract unlocks downstream execution only when an audit yields PASS with 100% coverage.'}
          </p>
        </div>

        {/* Action Button */}
        <div>
          {isApproved ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Policy Satisfied & Stored</span>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={onApproveOnChain}
                disabled={!isEligible || !hasWallet || isApproving}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !isEligible
                    ? 'Only audits with outcome PASS and 10,000 bp coverage are eligible for on-chain approval.'
                    : !hasWallet
                    ? 'Connect MetaMask to record approval.'
                    : 'Record approval on DocumentPolicyConsumer'
                }
              >
                {isApproving ? 'Submitting Tx...' : 'Record Approval on-chain'}
              </button>

              {!isEligible && (
                <span className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Requires PASS & 100.00% coverage
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
