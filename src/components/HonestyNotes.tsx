import React from 'react';
import { Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { HonestyNote } from '../lib/resultMapper';

interface HonestyNotesProps {
  notes: HonestyNote[];
}

export const HonestyNotes: React.FC<HonestyNotesProps> = ({ notes }) => {
  if (!notes || notes.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <Info className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          On-Chain Consensus & Methodology Notes
        </h3>
      </div>

      <div className="mt-3.5 space-y-3">
        {notes.map((note, idx) => {
          const isCaution = note.type === 'caution';
          const isWarning = note.type === 'warning';

          return (
            <div
              key={idx}
              className={`rounded-lg border p-3.5 text-xs leading-relaxed ${
                isCaution
                  ? 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
                  : isWarning
                  ? 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {isCaution ? (
                  <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                ) : isWarning ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                ) : (
                  <Info className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold">{note.title}</h4>
                  <p className="mt-0.5">{note.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
