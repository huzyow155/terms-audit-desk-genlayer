import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OutcomeBanner } from './components/OutcomeBanner';
import { CoverageMeter } from './components/CoverageMeter';
import { ChecklistCards } from './components/ChecklistCards';
import { HonestyNotes } from './components/HonestyNotes';
import { ProofPanel } from './components/ProofPanel';
import { SampleReviews } from './components/SampleReviews';
import { ConsumerApproval } from './components/ConsumerApproval';
import { ReviewHistory } from './components/ReviewHistory';
import { AboutModal } from './components/AboutModal';
import {
  DEPLOYMENT_CONFIG,
  PRESET_CHECKLISTS,
  type ChecklistItemConfig,
} from './config/deployment';
import { validateDocumentUrl } from './lib/urlValidator';
import {
  fetchChecklist,
  fetchReview,
  fetchLatestReviewId,
  fetchReviewHistory,
  fetchConsumerApproval,
  type ConsumerApprovalState,
} from './lib/genlayer';
import { generateHonestyNotes, type RawReviewRecord } from './lib/resultMapper';
import { Search, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Modal states
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Audit Form State
  const [selectedChecklistId, setSelectedChecklistId] = useState(PRESET_CHECKLISTS[0].id);
  const [docUrlInput, setDocUrlInput] = useState('');
  const [maxChunks, setMaxChunks] = useState<number>(3);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Active Audit Data State
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [activeRecord, setActiveRecord] = useState<RawReviewRecord | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItemConfig[]>(PRESET_CHECKLISTS[0].items);
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [consumerState, setConsumerState] = useState<ConsumerApprovalState>({ isApproved: false, approvalReviewId: '' });

  // Loading and Error states
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Load sample on initial mount (Sample 1: Compliant Document)
  useEffect(() => {
    loadReviewById('60932b48_34af5201_r1');
  }, []);

  const handleUrlChange = (val: string) => {
    setDocUrlInput(val);
    if (val.trim()) {
      const v = validateDocumentUrl(val);
      setUrlError(v.valid ? null : (v.error || 'Invalid URL'));
    } else {
      setUrlError(null);
    }
  };

  const loadReviewById = async (reviewId: string, associatedDocUrl?: string) => {
    setIsLoadingReview(true);
    setGlobalError(null);
    try {
      const record = await fetchReview(reviewId);
      setActiveRecord(record);
      setActiveReviewId(reviewId);
      if (associatedDocUrl || record.doc_url) {
        setDocUrlInput(associatedDocUrl || record.doc_url);
      }

      // Load checklist definition
      try {
        const cl = await fetchChecklist(record.checklist_id);
        setChecklistItems(cl.items);
      } catch (err) {
        // Fallback to preset if matches
        const preset = PRESET_CHECKLISTS.find(p => p.id === record.checklist_id);
        if (preset) setChecklistItems(preset.items);
      }

      // Load consumer approval status
      const approval = await fetchConsumerApproval(record.doc_url);
      setConsumerState(approval);

      // Load history
      const history = await fetchReviewHistory(record.checklist_id, record.doc_url);
      setHistoryIds(history);
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to load review from GenLayer studionet');
    } finally {
      setIsLoadingReview(false);
    }
  };

  const handleLookupExisting = async () => {
    const v = validateDocumentUrl(docUrlInput);
    if (!v.valid) {
      setUrlError(v.error || 'Invalid URL');
      return;
    }

    setIsLoadingReview(true);
    setGlobalError(null);
    try {
      const latestId = await fetchLatestReviewId(selectedChecklistId, docUrlInput.trim());
      if (!latestId) {
        setGlobalError('No on-chain reviews found for this document and checklist yet. Connect a wallet to submit a new audit.');
        setActiveRecord(null);
        setActiveReviewId(null);
      } else {
        await loadReviewById(latestId, docUrlInput.trim());
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Error querying latest review');
    } finally {
      setIsLoadingReview(false);
    }
  };

  const honestyNotes = activeRecord ? generateHonestyNotes(activeRecord) : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header
        onOpenAbout={() => setIsAboutOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Global Error Banner */}
        {globalError && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <span className="font-bold">Notice: </span>
              <span>{globalError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGlobalError(null)}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 font-semibold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Form Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:border-sky-900 dark:bg-sky-950/80 dark:text-sky-300">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              <span>FullRead Contract: {DEPLOYMENT_CONFIG.fullReadAddress.slice(0, 10)}...</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Prove an AI audit read the whole document, not just its first page.
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Decentralized validator consensus deterministically partitions your legal agreement, verifies quotes with code, and registers immutable proof of coverage on GenLayer studionet.
            </p>
          </div>

          {/* Step 1 & 2 Inputs */}
          <div className="mt-8 grid gap-6 md:grid-cols-12 border-t border-slate-100 pt-6 dark:border-slate-800">
            {/* Step 1: Checklist Select */}
            <div className="md:col-span-4">
              <label htmlFor="checklist-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Step 1: Evaluation Checklist
              </label>
              <select
                id="checklist-select"
                value={selectedChecklistId}
                onChange={(e) => setSelectedChecklistId(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {PRESET_CHECKLISTS.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Preset ID: <span className="font-mono">{selectedChecklistId}</span>
              </p>
            </div>

            {/* Step 2: Document URL & Chunks */}
            <div className="md:col-span-8">
              <label htmlFor="doc-url-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Step 2: Public Document HTTPS URL
              </label>
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    id="doc-url-input"
                    type="url"
                    value={docUrlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/terms.md"
                    className={`block w-full rounded-lg border px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 dark:bg-slate-800 dark:text-white ${
                      urlError
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-800'
                        : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500 dark:border-slate-700'
                    }`}
                  />
                </div>

                {/* Max Chunks Select */}
                <div className="flex items-center gap-2">
                  <select
                    value={maxChunks}
                    onChange={(e) => setMaxChunks(Number(e.target.value))}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    aria-label="Max chunks to evaluate"
                  >
                    <option value={1}>1 Chunk (5k chars)</option>
                    <option value={2}>2 Chunks (10k chars)</option>
                    <option value={3}>3 Chunks (15k chars)</option>
                    <option value={4}>4 Chunks (20k chars)</option>
                  </select>

                  {/* Lookup Button */}
                  <button
                    type="button"
                    onClick={handleLookupExisting}
                    disabled={isLoadingReview || Boolean(urlError) || !docUrlInput}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500"
                  >
                    {isLoadingReview ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Search className="h-3.5 w-3.5" />
                    )}
                    <span>Inspect Record</span>
                  </button>
                </div>
              </div>

              {/* URL validation error or timing estimate */}
              {urlError ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {urlError}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Estimated consensus latency: <span className="font-semibold">about 20 to 110 seconds in our measurements</span> (3-4 chunks).
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Pre-Verified Samples (No Wallet Required) */}
        <section>
          <SampleReviews
            onSelectSample={(id, url) => loadReviewById(id, url)}
            activeReviewId={activeReviewId || undefined}
            isLoading={isLoadingReview}
          />
        </section>

        {/* Loading Spinner for Review Inspection */}
        {isLoadingReview && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600 dark:text-sky-400" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Querying verified audit records from GenLayer studionet...
            </p>
          </div>
        )}

        {/* Active Review View */}
        {activeRecord && !isLoadingReview && (
          <div className="space-y-6">
            {/* Outcome Banner */}
            <OutcomeBanner
              outcome={activeRecord.outcome}
              revision={activeRecord.revision}
              drifted={activeRecord.drifted}
            />

            {/* Coverage Meter */}
            <CoverageMeter
              coverageBp={activeRecord.coverage_bp}
              chunksCount={activeRecord.chunk_hashes.length}
              maxChunks={activeRecord.max_chunks}
            />

            {/* Evaluated Checklist Items */}
            <ChecklistCards
              items={checklistItems}
              statusByItem={activeRecord.status_by_item}
              quotes={activeRecord.quotes}
            />

            {/* Honesty Notes */}
            <HonestyNotes notes={honestyNotes} />

            {/* Downstream Consumer Approval Status */}
            <ConsumerApproval
              record={activeRecord}
              isApproved={consumerState.isApproved}
              approvalReviewId={consumerState.approvalReviewId}
              hasWallet={false}
            />

            {/* Cryptographic Proof Panel */}
            <ProofPanel record={activeRecord} />

            {/* Revision History */}
            <ReviewHistory
              reviewIds={historyIds}
              currentReviewId={activeRecord.review_id}
              onSelectReview={(id) => loadReviewById(id)}
              hasWallet={false}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Terms Audit Desk &bull; Powered by GenLayer Intelligent Contracts on studionet</span>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>FullRead: {DEPLOYMENT_CONFIG.fullReadAddress.slice(0, 8)}...</span>
            <span>Chain ID: 61999</span>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default App;
