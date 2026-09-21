import { describe, it, expect } from 'vitest';
import { deriveChecklistId } from '../src/lib/checklistId';
import type { ChecklistItemConfig } from '../src/config/deployment';

const ITEM_ID_REGEX = /^[a-z0-9_]{1,24}$/;

describe('Checklist Builder & Derivation tests', () => {
  it('validates item ID against strict regex ^[a-z0-9_]{1,24}$', () => {
    // Valid IDs
    expect(ITEM_ID_REGEX.test('refund')).toBe(true);
    expect(ITEM_ID_REGEX.test('auto_renewal_v2')).toBe(true);
    expect(ITEM_ID_REGEX.test('clause_123_456')).toBe(true);
    expect(ITEM_ID_REGEX.test('sla_99_9')).toBe(true);

    // Invalid IDs
    expect(ITEM_ID_REGEX.test('')).toBe(false); // empty
    expect(ITEM_ID_REGEX.test('Refund')).toBe(false); // uppercase
    expect(ITEM_ID_REGEX.test('refund-clause')).toBe(false); // hyphen
    expect(ITEM_ID_REGEX.test('refund clause')).toBe(false); // space
    expect(ITEM_ID_REGEX.test('a'.repeat(25))).toBe(false); // > 24 chars
  });

  it('computes deterministic checklist ID for custom checklist items', () => {
    const customItems: ChecklistItemConfig[] = [
      {
        id: 'uptime',
        question: '99.9% uptime guaranteed',
        severity: 'BLOCKER',
        polarity: 'MUST_HAVE',
      },
      {
        id: 'data_lock_in',
        question: 'Customer data export blocked',
        severity: 'BLOCKER',
        polarity: 'MUST_NOT_HAVE',
      },
    ];

    const cid1 = deriveChecklistId(customItems);
    const cid2 = deriveChecklistId(customItems);

    expect(cid1).toHaveLength(16);
    expect(cid1).toMatch(/^[a-f0-9]{16}$/);
    expect(cid1).toBe('eacf4d7b808ae544');
    expect(cid1).toBe(cid2);
  });
});
