import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { getOutcomeMetadata, type ReviewOutcome } from '../lib/resultMapper';

interface OutcomeBannerProps {
  outcome: ReviewOutcome;
  revision: number;
  drifted?: boolean;
}

export const OutcomeBanner: React.FC<OutcomeBannerProps> = ({ outcome, revision, drifted }) => {
  const meta = getOutcomeMetadata(outcome);

  const renderIcon = () => {
    switch (outcome) {
      case 'PASS':
        return <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />;
      case 'FAIL':
        return <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />;
      case 'REVIEW':
      default:
        return <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${meta.bgClass}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          {renderIcon()}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${meta.badgeClass}`}>
                {meta.label}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Revision #{revision}
              </span>
              {drifted && (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:border-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                  <AlertOctagon className="h-3.5 w-3.5" />
                  Content Drifted
                </span>
              )}
            </div>
            <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              {meta.headline}
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
              {meta.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
