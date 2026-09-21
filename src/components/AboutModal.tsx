import React from 'react';
import { X, ExternalLink, AlertTriangle, Cpu, Layers, Scale } from 'lucide-react';
import { DEPLOYMENT_CONFIG } from '../config/deployment';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                How Terms Audit Desk Works
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verifiable Whole-Document Intelligence on GenLayer studionet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="mt-5 space-y-5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1: The Buried-Clause Problem */}
          <section className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-950/60 dark:bg-rose-950/20">
            <h3 className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              The Buried-Clause Vulnerability
            </h3>
            <p className="mt-1.5 text-rose-950/90 dark:text-rose-200">
              Most AI-enabled smart contracts analyze external legal texts by reading only a head prefix (e.g. the first 4,000 characters). An adverse counterparty can easily bury predatory auto-renewals, unilateral dispute clauses, or liability disclaimers on page 10. The AI evaluates only the opening pages and issues a fraudulent positive verdict.
            </p>
          </section>

          {/* Section 2: Why GenLayer is Required */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              Why GenLayer is Required
            </h3>
            <p className="mt-1">
              GenLayer runs Intelligent Contracts where multiple independent validator nodes reach consensus on non-deterministic web fetches and LLM evaluations. Without GenLayer, an audit is just a server you have to trust. With GenLayer:
            </p>
            <ol className="mt-2.5 space-y-2 list-decimal list-inside pl-1">
              <li><strong>Independent Fetch:</strong> Each validator independently fetches the public document over HTTPS.</li>
              <li><strong>Deterministic Chunking:</strong> The contract normalizes text and splits it into deterministic 5,000-character blocks.</li>
              <li><strong>Per-Chunk LLM Evaluation:</strong> The LLM reads each chunk within strict prompt-injection guardrails (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">&lt;UNTRUSTED_DOCUMENT&gt;</code>).</li>
              <li><strong>Code-Verified Quote Grounding:</strong> Deterministic Python code tests that every finding is backed by an exact verbatim quote of at least 12 characters. Hallucinations are discarded.</li>
              <li><strong>Deterministic Verdict Synthesis:</strong> Final outcome (<code className="font-bold">PASS / FAIL / REVIEW</code>) is computed by immutable contract code, not free-form LLM text.</li>
            </ol>
          </section>

          {/* Section 3: What Validators Compare */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              What Validators Compare in Consensus
            </h3>
            <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2 border-b border-slate-200 dark:border-slate-800">Signal</th>
                    <th className="p-2 border-b border-slate-200 dark:border-slate-800">Compared?</th>
                    <th className="p-2 border-b border-slate-200 dark:border-slate-800">Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2 font-mono">doc_sha256</td>
                    <td className="p-2 text-emerald-600 font-semibold">Strict</td>
                    <td className="p-2">Ensures all validators read the exact identical document revision.</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">chunk_hashes</td>
                    <td className="p-2 text-emerald-600 font-semibold">Strict</td>
                    <td className="p-2">Guarantees deterministic chunk boundaries.</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">coverage_bp</td>
                    <td className="p-2 text-emerald-600 font-semibold">Strict</td>
                    <td className="p-2">Proves whole-document coverage was evaluated.</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">outcome & failing items</td>
                    <td className="p-2 text-emerald-600 font-semibold">Strict</td>
                    <td className="p-2">Validators agree on the final verdict and reasons for failure.</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">Quote wording</td>
                    <td className="p-2 text-amber-600 font-semibold">Semantic Grounding</td>
                    <td className="p-2">Leader quotes must exist verbatim in validator's chunk, avoiding spurious disagreement over whitespace bounds.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Known Limits */}
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Known System Boundaries & Limitations
            </h3>
            <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400 text-[11px]">
              <li><strong>Document size limit:</strong> Documents exceeding 40,000 characters or 4 chunks cannot PASS (receive partial coverage capped at REVIEW).</li>
              <li><strong>Static content only:</strong> Only raw text, markdown, or static HTML over HTTPS is supported (dynamic JavaScript client-rendered pages are not supported).</li>
              <li><strong>Execution latency:</strong> Multi-validator consensus with LLM reasoning takes roughly 20 to 110 seconds for 3 chunks on studionet.</li>
              <li><strong>Consensus on failure:</strong> When outcome is FAIL, non-failing item statuses are leader-reported; validators agree on outcome and failing items.</li>
              <li><strong>Ephemeral studionet:</strong> The contract runs on GenLayer studionet and is subject to periodic developer network resets.</li>
            </ul>
          </section>

          {/* Section 5: Contract & Code Links */}
          <section className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <a
              href="https://github.com/huzyow155/fullread-genlayer"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400"
            >
              <span>FullRead Contract Source (GitHub)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <div className="flex items-center gap-3">
              <a
                href={`${DEPLOYMENT_CONFIG.explorerUrl}/address/${DEPLOYMENT_CONFIG.fullReadAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <span>FullRead Explorer</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={`${DEPLOYMENT_CONFIG.explorerUrl}/address/${DEPLOYMENT_CONFIG.consumerAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <span>Consumer Explorer</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
