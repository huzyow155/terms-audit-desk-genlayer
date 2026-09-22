import React, { useState, useEffect, useCallback } from 'react';
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
import { StagedWaitingModal } from './components/StagedWaitingModal';
import { CustomChecklistModal } from './components/CustomChecklistModal';
import {
  DEPLOYMENT_CONFIG,
  PRESET_CHECKLISTS,
  type ChecklistItemConfig,
  type PresetChecklist,
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
import {
  requestWalletConnection,
  submitAuditReview,
  submitRecheckDrift,
  submitConsumerApproval,
  submitRegisterChecklist,
  getPendingTransaction,
  waitForReceiptWithProgress,
  clearPendingTransaction,
  type TxProgressUpdate,
} from './lib/wallet';
import { deriveChecklistId } from './lib/checklistId';
import { Search, Loader2, AlertCircle, Sparkles, PlusCircle } from 'lucide-react';

const STORAGE_KEY_CUSTOM_CHECKLISTS = 'terms_audit_custom_checklists_v1';

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

  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false);

  // Modal states
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCustomChecklistOpen, setIsCustomChecklistOpen] = useState(false);

  // Staged Waiting Modal State
  const [isStagedModalOpen, setIsStagedModalOpen] = useState(false);
  const [stagedProgress, setStagedProgress] = useState<TxProgressUpdate | null>(null);
  const [stagedError, setStagedError] = useState<string | null>(null);
  const [stagedTitle, setStagedTitle] = useState('On-Chain Execution in Progress');
  const [pendingSuccessAction, setPendingSuccessAction] = useState<(() => Promise<void>) | null>(null);

  // Available Checklists (Presets + Custom created)
  const [availableChecklists, setAvailableChecklists] = useState<PresetChecklist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_CHECKLISTS);
      if (saved) {
        const custom: PresetChecklist[] = JSON.parse(saved);
        return [...PRESET_CHECKLISTS, ...custom];
      }
    } catch {
      // fallback
    }
    return PRESET_CHECKLISTS;
  });

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
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const loadReviewById = useCallback(async (reviewId: string, associatedDocUrl?: string) => {
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
      } catch {
        // Fallback to presets or available checklists
        const found = availableChecklists.find(p => p.id === record.checklist_id);
        if (found) setChecklistItems(found.items);
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
  }, [availableChecklists]);

  // Load sample on initial mount
  useEffect(() => {
    loadReviewById('60932b48_34af5201_r1');
  }, [loadReviewById]);

  // Resume pending transaction on page load (Resilience requirement)
  useEffect(() => {
    const pending = getPendingTransaction();
    if (pending && pending.hash) {
      setIsStagedModalOpen(true);
      setStagedTitle('Resuming Pending On-Chain Execution');
      setStagedProgress({
        stage: 'VALIDATING',
        hash: pending.hash,
        elapsedSeconds: Math.floor((Date.now() - pending.startedAt) / 1000),
        message: 'Resuming tracking of transaction on GenLayer studionet...',
      });

      waitForReceiptWithProgress(pending.hash, (u) => setStagedProgress(u))
        .then(async () => {
          clearPendingTransaction();
          if (pending.type === 'review' && pending.checklistId && pending.docUrl) {
            const latest = await fetchLatestReviewId(pending.checklistId, pending.docUrl);
            if (latest) await loadReviewById(latest, pending.docUrl);
          } else if (pending.reviewId) {
            await loadReviewById(pending.reviewId);
          }
        })
        .catch((err) => {
          setStagedError(err.message || 'Pending transaction failed or timed out.');
          clearPendingTransaction();
        });
    }
  }, [loadReviewById]);

  // Ethereum Wallet event listeners
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletAddress(null);
      } else {
        setWalletAddress(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      // Reload on chain change to re-initialize contracts cleanly
      window.location.reload();
    };

    ethereum.on?.('accountsChanged', handleAccountsChanged);
    ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  const handleConnectWallet = async () => {
    setIsConnectingWallet(true);
    setGlobalError(null);
    try {
      const addr = await requestWalletConnection();
      setWalletAddress(addr);
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
  };

  const handleUrlChange = (val: string) => {
    setDocUrlInput(val);
    if (val.trim()) {
      const v = validateDocumentUrl(val);
      setUrlError(v.valid ? null : (v.error || 'Invalid URL'));
    } else {
      setUrlError(null);
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

  // Submit Audit (Write Path)
  const handleSubmitAudit = async () => {
    if (!walletAddress) {
      await handleConnectWallet();
      return;
    }

    const v = validateDocumentUrl(docUrlInput);
    if (!v.valid) {
      setUrlError(v.error || 'Invalid URL');
      return;
    }

    setIsExecutingAction(true);
    setStagedError(null);
    setStagedTitle('Document Compliance Audit in Progress');
    setIsStagedModalOpen(true);

    try {
      await submitAuditReview(
        walletAddress,
        selectedChecklistId,
        docUrlInput.trim(),
        maxChunks,
        (u) => setStagedProgress(u)
      );

      setPendingSuccessAction(() => async () => {
        setIsStagedModalOpen(false);
        const latestId = await fetchLatestReviewId(selectedChecklistId, docUrlInput.trim());
        if (latestId) {
          await loadReviewById(latestId, docUrlInput.trim());
        }
      });
    } catch (err: any) {
      setStagedError(err.message || 'Audit transaction failed on GenLayer studionet');
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Recheck Content Drift (Write Path)
  const handleRecheck = async (reviewId: string) => {
    if (!walletAddress) {
      await handleConnectWallet();
      return;
    }

    setIsExecutingAction(true);
    setStagedError(null);
    setStagedTitle('Rechecking Document Content Drift');
    setIsStagedModalOpen(true);

    try {
      await submitRecheckDrift(walletAddress, reviewId, (u) => setStagedProgress(u));

      setPendingSuccessAction(() => async () => {
        setIsStagedModalOpen(false);
        if (activeRecord) {
          const latestId = await fetchLatestReviewId(activeRecord.checklist_id, activeRecord.doc_url);
          if (latestId) await loadReviewById(latestId);
        }
      });
    } catch (err: any) {
      setStagedError(err.message || 'Recheck transaction failed on GenLayer studionet');
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Record Downstream Policy Approval (Write Path)
  const handleApproveConsumer = async (reviewId: string) => {
    if (!walletAddress) {
      await handleConnectWallet();
      return;
    }

    setIsExecutingAction(true);
    setStagedError(null);
    setStagedTitle('Recording Downstream Contract Approval');
    setIsStagedModalOpen(true);

    try {
      await submitConsumerApproval(walletAddress, reviewId, (u) => setStagedProgress(u));

      setPendingSuccessAction(() => async () => {
        setIsStagedModalOpen(false);
        if (activeRecord) {
          const approval = await fetchConsumerApproval(activeRecord.doc_url);
          setConsumerState(approval);
        }
      });
    } catch (err: any) {
      setStagedError(err.message || 'Consumer approval failed on GenLayer studionet');
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Register Custom Checklist (Write Path)
  const handleRegisterChecklist = async (name: string, items: ChecklistItemConfig[]) => {
    if (!walletAddress) {
      await handleConnectWallet();
      return;
    }

    setIsExecutingAction(true);
    setStagedError(null);
    setStagedTitle('Registering Custom Evaluation Checklist');
    setIsStagedModalOpen(true);

    try {
      await submitRegisterChecklist(walletAddress, name, items, (u) => setStagedProgress(u));

      const cid = deriveChecklistId(items);
      const newChecklist: PresetChecklist = {
        id: cid,
        name: `${name} (Custom)`,
        description: `Custom checklist registered on-chain with ${items.length} criteria.`,
        items,
      };

      const updated = [...availableChecklists, newChecklist];
      setAvailableChecklists(updated);
      setSelectedChecklistId(cid);

      // Save custom checklist to localStorage
      try {
        const customOnly = updated.filter(c => !PRESET_CHECKLISTS.some(p => p.id === c.id));
        localStorage.setItem(STORAGE_KEY_CUSTOM_CHECKLISTS, JSON.stringify(customOnly));
      } catch {
        // ignore
      }

      setIsCustomChecklistOpen(false);

      setPendingSuccessAction(() => async () => {
        setIsStagedModalOpen(false);
      });
    } catch (err: any) {
      setStagedError(err.message || 'Checklist registration failed on GenLayer studionet');
    } finally {
      setIsExecutingAction(false);
    }
  };

  const honestyNotes = activeRecord ? generateHonestyNotes(activeRecord) : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header
        onOpenAbout={() => setIsAboutOpen(true)}
        walletAddress={walletAddress}
        isConnecting={isConnectingWallet}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
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
              Decentralized validator consensus deterministically partitions your legal agreement, verifies quotes with code, and registers hash-verified coverage on GenLayer studionet.
            </p>
          </div>

          {/* Step 1 & 2 Inputs */}
          <div className="mt-8 grid gap-6 md:grid-cols-12 border-t border-slate-100 pt-6 dark:border-slate-800">
            {/* Step 1: Checklist Select */}
            <div className="md:col-span-4">
              <div className="flex items-center justify-between">
                <label htmlFor="checklist-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Step 1: Evaluation Checklist
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomChecklistOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400"
                >
                  <PlusCircle className="h-3 w-3" />
                  <span>+ Custom</span>
                </button>
              </div>
              <select
                id="checklist-select"
                value={selectedChecklistId}
                onChange={(e) => setSelectedChecklistId(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {availableChecklists.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Checklist ID: <span className="font-mono">{selectedChecklistId}</span>
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

                  {/* Inspect Button */}
                  <button
                    type="button"
                    onClick={handleLookupExisting}
                    disabled={isLoadingReview || Boolean(urlError) || !docUrlInput}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {isLoadingReview ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Search className="h-3.5 w-3.5" />
                    )}
                    <span>Inspect</span>
                  </button>

                  {/* Submit Audit Write Button */}
                  <button
                    type="button"
                    onClick={handleSubmitAudit}
                    disabled={isExecutingAction || Boolean(urlError) || !docUrlInput}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50"
                  >
                    {isExecutingAction ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    <span>{walletAddress ? 'Audit on Studionet' : 'Connect to Audit'}</span>
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
                  Estimated consensus latency: typically <span className="font-semibold">20 to 110 seconds</span> (1 chunk about <span className="font-semibold">18 to 25 s</span> in our measurements).
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
              onApproveOnChain={() => handleApproveConsumer(activeRecord.review_id)}
              isApproving={isExecutingAction}
              hasWallet={Boolean(walletAddress)}
            />

            {/* On-Chain Verification & Coverage Panel */}
            <ProofPanel record={activeRecord} />

            {/* Revision History */}
            <ReviewHistory
              reviewIds={historyIds}
              currentReviewId={activeRecord.review_id}
              onSelectReview={(id) => loadReviewById(id)}
              onRecheck={(id) => handleRecheck(id)}
              isRechecking={isExecutingAction}
              hasWallet={Boolean(walletAddress)}
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

      {/* Custom Checklist Builder Modal */}
      <CustomChecklistModal
        isOpen={isCustomChecklistOpen}
        onClose={() => setIsCustomChecklistOpen(false)}
        onRegister={handleRegisterChecklist}
        hasWallet={Boolean(walletAddress)}
        onConnectWallet={handleConnectWallet}
        isRegistering={isExecutingAction}
      />

      {/* Staged Waiting Progress Modal */}
      <StagedWaitingModal
        isOpen={isStagedModalOpen}
        onClose={() => setIsStagedModalOpen(false)}
        update={stagedProgress}
        error={stagedError}
        title={stagedTitle}
        onSuccessDismiss={async () => {
          if (pendingSuccessAction) {
            await pendingSuccessAction();
            setPendingSuccessAction(null);
          } else {
            setIsStagedModalOpen(false);
          }
        }}
      />
    </div>
  );
};

export default App;
