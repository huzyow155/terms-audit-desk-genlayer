import { describe, it, expect } from 'vitest';
import { deriveChecklistId, canonicalizeItems } from '../src/lib/checklistId';
import { ChecklistItemConfig } from '../src/config/deployment';

describe('checklistId derivation', () => {
  const presetItems: ChecklistItemConfig[] = [
    {
      id: 'refund',
      question: 'Clear refund policy present',
      severity: 'BLOCKER',
      polarity: 'MUST_HAVE',
    },
    {
      id: 'auto_renew',
      question: 'Auto renewal without prior notice',
      severity: 'BLOCKER',
      polarity: 'MUST_NOT_HAVE',
    },
  ];

  it('reproduces the on-chain checklist ID 60932b48524e8f2a byte-for-byte', () => {
    const derived = deriveChecklistId(presetItems);
    expect(derived).toBe('60932b48524e8f2a');
  });

  it('produces canonical JSON with sorted keys per item object', () => {
    const canonical = canonicalizeItems(presetItems);
    expect(canonical).toBe(
      '[{"id":"refund","polarity":"MUST_HAVE","question":"Clear refund policy present","severity":"BLOCKER"},{"id":"auto_renew","polarity":"MUST_NOT_HAVE","question":"Auto renewal without prior notice","severity":"BLOCKER"}]'
    );
  });

  it('changes hash when any item property is altered', () => {
    const modifiedItems: ChecklistItemConfig[] = [
      {
        ...presetItems[0],
        question: 'Different question',
      },
      presetItems[1],
    ];
    const derived = deriveChecklistId(modifiedItems);
    expect(derived).not.toBe('60932b48524e8f2a');
    expect(derived.length).toBe(16);
  });
});
