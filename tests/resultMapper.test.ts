import { describe, it, expect } from 'vitest';
import {
  parseReviewRecord,
  formatCoverage,
  getOutcomeMetadata,
  generateHonestyNotes,
  type RawReviewRecord,
} from '../src/lib/resultMapper';

describe('resultMapper', () => {
  const sampleJson = JSON.stringify({
    schema_version: '1.0.0',
    review_id: '60932b48_34af5201_r1',
    checklist_id: '60932b48524e8f2a',
    doc_url: 'https://example.com/terms.md',
    revision: 1,
    max_chunks: 3,
    doc_sha256: '07319db20d11e985b14175a711e9a0f88bf1e7758f24aaabf21ff807c5f497a8',
    chunk_hashes: ['hash1', 'hash2', 'hash3'],
    coverage_bp: 10000,
    outcome: 'PASS',
    status_by_item: { auto_renew: 'CLEAR', refund: 'SATISFIED' },
    quotes: { refund: 'We provide a clear mandatory 30-day refund policy' },
    ungrounded_count: 0,
    drifted: false,
    previous_review_id: '',
  });

  it('parses raw JSON string into typed RawReviewRecord', () => {
    const record = parseReviewRecord(sampleJson);
    expect(record.review_id).toBe('60932b48_34af5201_r1');
    expect(record.outcome).toBe('PASS');
    expect(record.coverage_bp).toBe(10000);
    expect(record.chunk_hashes).toHaveLength(3);
  });

  it('formats coverage basis points accurately', () => {
    const full = formatCoverage(10000);
    expect(full.percentString).toBe('100.00%');
    expect(full.isFullCoverage).toBe(true);

    const partial = formatCoverage(6666);
    expect(partial.percentString).toBe('66.66%');
    expect(partial.isFullCoverage).toBe(false);
  });

  it('provides appropriate metadata for PASS, FAIL, and REVIEW', () => {
    const passMeta = getOutcomeMetadata('PASS');
    expect(passMeta.label).toBe('PASSED AUDIT');

    const failMeta = getOutcomeMetadata('FAIL');
    expect(failMeta.label).toBe('FAILED AUDIT');

    const reviewMeta = getOutcomeMetadata('REVIEW');
    expect(reviewMeta.label).toBe('REQUIRES REVIEW');
  });

  it('generates mandatory honesty notes for FAIL outcomes', () => {
    const failRecord: RawReviewRecord = {
      ...parseReviewRecord(sampleJson),
      outcome: 'FAIL',
      status_by_item: { auto_renew: 'VIOLATED', refund: 'UNRESOLVED' },
      ungrounded_count: 1,
    };

    const notes = generateHonestyNotes(failRecord);
    expect(notes.some(n => n.title.includes('Consensus Scope'))).toBe(true);
    expect(notes.some(n => n.title.includes('Meaning of UNRESOLVED'))).toBe(true);
    expect(notes.some(n => n.title.includes('Discarded Model Claims'))).toBe(true);
  });

  it('generates partial coverage warning note when coverage is below 10,000 bp', () => {
    const partialRecord: RawReviewRecord = {
      ...parseReviewRecord(sampleJson),
      coverage_bp: 7500,
    };

    const notes = generateHonestyNotes(partialRecord);
    expect(notes.some(n => n.title.includes('Partial Coverage'))).toBe(true);
  });
});
