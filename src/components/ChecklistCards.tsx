import React from 'react';
import { Quote, CheckCircle, AlertCircle } from 'lucide-react';
import { getItemStatusBadge, type ItemStatus } from '../lib/resultMapper';
import type { ChecklistItemConfig } from '../config/deployment';

interface ChecklistCardsProps {
  items: ChecklistItemConfig[];
  statusByItem: Record<string, ItemStatus>;
  quotes: Record<string, string>;
}

export const ChecklistCards: React.FC<ChecklistCardsProps> = ({
  items,
  statusByItem,
  quotes,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Evaluated Checklist Items ({items.length})
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          All findings backed by deterministic quote grounding
        </span>
      </div>

      <div className="grid gap-4">
        {items.map(item => {
          const status = statusByItem[item.id] || 'UNRESOLVED';
          const badge = getItemStatusBadge(status);
          const quote = quotes[item.id];

          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Top Row: Meta Tags & Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">
                    {item.id}
                  </span>
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${
                    item.severity === 'BLOCKER'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {item.severity}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {item.polarity === 'MUST_HAVE' ? 'Mandatory Term' : 'Restricted Term'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold tracking-wider ${badge.badgeClass}`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Question */}
              <div className="mt-3">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {item.question}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {badge.description}
                </p>
              </div>

              {/* Verbatim Quote Box */}
              {quote ? (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    <Quote className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Verbatim Grounded Citation:</span>
                  </div>
                  <blockquote className="border-l-2 border-sky-500 pl-3 italic text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-mono break-words whitespace-pre-wrap">
                    "{quote}"
                  </blockquote>
                </div>
              ) : (
                status === 'CLEAR' ? (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CheckCircle className="h-3.5 w-3.5 text-sky-500" />
                    <span>No matching restricted clause detected in any evaluated chunk.</span>
                  </div>
                ) : status === 'MISSING' ? (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Required clause was absent across all evaluated chunks.</span>
                  </div>
                ) : null
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
