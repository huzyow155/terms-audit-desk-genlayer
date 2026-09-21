import React from 'react';
import { History, RefreshCw, ArrowUpRight } from 'lucide-react';

interface ReviewHistoryProps {
  reviewIds: string[];
  currentReviewId: string;
  onSelectReview: (reviewId: string) => void;
  onRecheck?: (reviewId: string) => void;
  isRechecking?: boolean;
  hasWallet: boolean;
}

export const ReviewHistory: React.FC<ReviewHistoryProps> = ({
  reviewIds,
  currentReviewId,
  onSelectReview,
  onRecheck,
  isRechecking,
  hasWallet,
}) => {
  if (!reviewIds || reviewIds.length <= 1) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Revision History for this Document ({reviewIds.length})
          </h3>
        </div>

        {onRecheck && (
          <button
            type="button"
            onClick={() => onRecheck(currentReviewId)}
            disabled={!hasWallet || isRechecking}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            title={hasWallet ? 'Recheck document for content drift' : 'Connect wallet to recheck'}
          >
            <RefreshCw className={`h-3 w-3 ${isRechecking ? 'animate-spin' : ''}`} />
            <span>{isRechecking ? 'Rechecking...' : 'Recheck Drift'}</span>
          </button>
        )}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {reviewIds.map((revId, idx) => {
          const isSelected = revId === currentReviewId;
          return (
            <button
              key={revId}
              type="button"
              onClick={() => onSelectReview(revId)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? 'border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <span className="font-semibold">Rev #{idx + 1}</span>
              <span className="font-mono text-[10px] text-slate-400">({revId.slice(-8)})</span>
              <ArrowUpRight className="h-3 w-3 opacity-60" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
