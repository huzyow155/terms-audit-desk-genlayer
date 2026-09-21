import React from 'react';
import { Layers, AlertCircle, Check } from 'lucide-react';
import { formatCoverage } from '../lib/resultMapper';

interface CoverageMeterProps {
  coverageBp: number;
  chunksCount: number;
  maxChunks: number;
}

export const CoverageMeter: React.FC<CoverageMeterProps> = ({
  coverageBp,
  chunksCount,
  maxChunks,
}) => {
  const coverage = formatCoverage(coverageBp);
  const percentNum = Math.min(100, Math.max(0, coverageBp / 100));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Proof of Whole-Document Coverage
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {coverage.percentString}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              ({coverageBp} / 10,000 bp)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-slate-800/80">
          <Layers className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {chunksCount} evaluated chunk{chunksCount !== 1 ? 's' : ''} (max {maxChunks})
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              coverage.isFullCoverage
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${percentNum}%` }}
            role="progressbar"
            aria-valuenow={percentNum}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Document evaluation coverage percentage"
          />
        </div>
      </div>

      {/* Warning or Success Notice */}
      <div className="mt-3">
        {coverage.isFullCoverage ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>100% of document content was deterministically partitioned and examined by validators.</span>
          </div>
        ) : (
          <div className="flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50/80 p-2.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold">Partial coverage restriction: </span>
              The document length exceeded the processing limit. Documents evaluated with partial coverage can never achieve a PASS outcome regardless of individual chunk findings.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
