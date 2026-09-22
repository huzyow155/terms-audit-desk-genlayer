import React, { useState } from 'react';
import { Copy, Check, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { SAMPLE_REVIEWS } from '../config/deployment';

interface SampleReviewsProps {
  onSelectSample: (reviewId: string, docUrl: string) => void;
  activeReviewId?: string;
  isLoading?: boolean;
}

export const SampleReviews: React.FC<SampleReviewsProps> = ({
  onSelectSample,
  activeReviewId,
  isLoading,
}) => {
  const [copiedUrlIndex, setCopiedUrlIndex] = useState<number | null>(null);

  const handleCopy = (idx: number, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrlIndex(idx);
    setTimeout(() => setCopiedUrlIndex(null), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Verify On-Chain Audit Records (No Wallet Required)
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Explore three real audit records accepted by GenLayer studionet validator consensus. Click any sample to inspect the on-chain verdict, verbatim quotes, and coverage verification. Accepted results can still be appealed until finalization.
        </p>
      </div>

      <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
        {SAMPLE_REVIEWS.map((sample, idx) => {
          const isActive = activeReviewId === sample.id;
          const isPass = sample.expectedOutcome === 'PASS';

          return (
            <div
              key={sample.id}
              onClick={() => !isLoading && onSelectSample(sample.id, sample.docUrl)}
              className={`group flex flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20 dark:border-sky-400 dark:bg-sky-950/30'
                  : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700'
              } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold ${
                      isPass
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                    }`}
                  >
                    {isPass ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                    {sample.expectedOutcome}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    100.00% coverage
                  </span>
                </div>

                <h4 className="mt-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                  {sample.title}
                </h4>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {sample.subtitle}
                </p>

                <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-200/60 pt-2 dark:border-slate-800">
                  {sample.explanation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handleCopy(idx, sample.docUrl, e)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  aria-label="Copy sample document URL"
                >
                  {copiedUrlIndex === idx ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">URL Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                  Load Record
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
