export type ReviewOutcome = 'PASS' | 'FAIL' | 'REVIEW';

export type ItemStatus = 'SATISFIED' | 'MISSING' | 'VIOLATED' | 'CLEAR' | 'UNRESOLVED';

export interface RawReviewRecord {
  schema_version: string;
  review_id: string;
  checklist_id: string;
  doc_url: string;
  revision: number;
  max_chunks: number;
  doc_sha256: string;
  chunk_hashes: string[];
  coverage_bp: number;
  outcome: ReviewOutcome;
  status_by_item: Record<string, ItemStatus>;
  quotes: Record<string, string>;
  ungrounded_count: number;
  drifted: boolean;
  previous_review_id: string;
}

export interface HonestyNote {
  type: 'warning' | 'info' | 'caution';
  title: string;
  message: string;
}

export function parseReviewRecord(rawJson: string): RawReviewRecord {
  try {
    const data = JSON.parse(rawJson);
    return {
      schema_version: data.schema_version || '1.0.0',
      review_id: data.review_id || '',
      checklist_id: data.checklist_id || '',
      doc_url: data.doc_url || '',
      revision: Number(data.revision) || 1,
      max_chunks: Number(data.max_chunks) || 3,
      doc_sha256: data.doc_sha256 || '',
      chunk_hashes: Array.isArray(data.chunk_hashes) ? data.chunk_hashes : [],
      coverage_bp: Number(data.coverage_bp) || 0,
      outcome: (data.outcome as ReviewOutcome) || 'REVIEW',
      status_by_item: data.status_by_item || {},
      quotes: data.quotes || {},
      ungrounded_count: Number(data.ungrounded_count) || 0,
      drifted: Boolean(data.drifted),
      previous_review_id: data.previous_review_id || '',
    };
  } catch {
    throw new Error('Invalid review record format: failed to parse JSON');
  }
}

export function formatCoverage(coverageBp: number) {
  const percentage = (coverageBp / 100).toFixed(2);
  const isFullCoverage = coverageBp >= 10000;
  return {
    percentage,
    percentString: `${percentage}%`,
    isFullCoverage,
    label: isFullCoverage ? 'Full Coverage (100.00%)' : `Partial Coverage (${percentage}%)`,
  };
}

export function getOutcomeMetadata(outcome: ReviewOutcome) {
  switch (outcome) {
    case 'PASS':
      return {
        label: 'PASSED AUDIT',
        headline: 'Document satisfies all mandatory requirements with verified quotes.',
        explanation: 'All blocker and major checklist items were grounded with verbatim quotes and confirmed through multi-validator consensus across all chunks.',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
        bgClass: 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/60',
        iconType: 'check-circle' as const,
      };
    case 'FAIL':
      return {
        label: 'FAILED AUDIT',
        headline: 'Violations or missing mandatory terms detected.',
        explanation: 'One or more blocker requirements were violated or absent. Validators reached consensus on the failing outcome and verified the specific violation quotes.',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
        bgClass: 'bg-rose-50/80 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/60',
        iconType: 'x-circle' as const,
      };
    case 'REVIEW':
    default:
      return {
        label: 'REQUIRES REVIEW',
        headline: 'Inconclusive findings or partial coverage.',
        explanation: 'The document could not achieve a definitive PASS either due to unresolved checklist items, ungrounded model claims, or partial coverage truncation.',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
        bgClass: 'bg-amber-50/80 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/60',
        iconType: 'alert-triangle' as const,
      };
  }
}

export function getItemStatusBadge(status: ItemStatus) {
  switch (status) {
    case 'SATISFIED':
      return {
        label: 'SATISFIED',
        description: 'Mandatory term is present with verified verbatim citation.',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700',
      };
    case 'CLEAR':
      return {
        label: 'CLEAR',
        description: 'Restricted term (must not have) is absent across all evaluated chunks.',
        badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/60 dark:text-sky-200 dark:border-sky-700',
      };
    case 'VIOLATED':
      return {
        label: 'VIOLATED',
        description: 'Forbidden clause detected and grounded with verbatim quote.',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700',
      };
    case 'MISSING':
      return {
        label: 'MISSING',
        description: 'Required clause was not found in any evaluated chunk.',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700',
      };
    case 'UNRESOLVED':
    default:
      return {
        label: 'UNRESOLVED',
        description: 'Insufficient or ambiguous evidence to establish presence or absence.',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700',
      };
  }
}

export function generateHonestyNotes(record: RawReviewRecord): HonestyNote[] {
  const notes: HonestyNote[] = [];

  // Mandatory note: FAIL consensus scope
  if (record.outcome === 'FAIL') {
    notes.push({
      type: 'info',
      title: 'Consensus Scope on Failure Verdicts',
      message: 'When an audit fails, validators agree strictly on the overall FAIL outcome and the exact set of failing items. The reported statuses of non-failing items reflect the leader validator\'s extraction and are not independently consensus-verified.',
    });
  }

  // Mandatory note: UNRESOLVED definition
  const hasUnresolved = Object.values(record.status_by_item).some(st => st === 'UNRESOLVED');
  if (hasUnresolved) {
    notes.push({
      type: 'warning',
      title: 'Meaning of UNRESOLVED Status',
      message: 'UNRESOLVED means "insufficient grounded evidence was found in the text," NOT that the document is safe or compliant. Manual review of these sections is recommended.',
    });
  }

  // Mandatory note: Ungrounded count
  if (record.ungrounded_count > 0) {
    notes.push({
      type: 'caution',
      title: 'Discarded Model Claims',
      message: `${record.ungrounded_count} model claim${record.ungrounded_count > 1 ? 's were' : ' was'} discarded by deterministic code verification because the supporting quotation could not be grounded verbatim (minimum 12 characters) in the source document.`,
    });
  }

  // Mandatory note: Partial coverage warning
  if (record.coverage_bp < 10000) {
    notes.push({
      type: 'warning',
      title: 'Partial Coverage Limitation',
      message: `Only ${(record.coverage_bp / 100).toFixed(2)}% of the document was evaluated (clamped to ${record.max_chunks} chunks). Documents evaluated with partial coverage can never receive a PASS outcome.`,
    });
  }

  return notes;
}
