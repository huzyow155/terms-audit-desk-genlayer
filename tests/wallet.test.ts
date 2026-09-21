import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPendingTransaction,
  savePendingTransaction,
  clearPendingTransaction,
  isMetaMaskAvailable,
  type PendingTransaction,
} from '../src/lib/wallet';

// Mock localStorage in Node/Vitest environment
const storage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in storage ? storage[k] : null),
    setItem: (k: string, v: string) => {
      storage[k] = String(v);
    },
    removeItem: (k: string) => {
      delete storage[k];
    },
    clear: () => {
      Object.keys(storage).forEach((k) => delete storage[k]);
    },
    key: (i: number) => Object.keys(storage)[i] || null,
    length: 0,
  };
}

describe('wallet lib tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves, retrieves, and clears pending transactions from localStorage', () => {
    expect(getPendingTransaction()).toBeNull();

    const sampleTx: PendingTransaction = {
      hash: '0xdc50ceee88f16f28f58f40736d56d8c6a594f28cec5fb96866e87b9420c57086',
      type: 'review',
      checklistId: '60932b48524e8f2a',
      docUrl: 'https://example.com/terms.md',
      startedAt: 1726910000000,
    };

    savePendingTransaction(sampleTx);
    const retrieved = getPendingTransaction();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.hash).toBe(sampleTx.hash);
    expect(retrieved?.type).toBe('review');
    expect(retrieved?.checklistId).toBe('60932b48524e8f2a');

    clearPendingTransaction();
    expect(getPendingTransaction()).toBeNull();
  });

  it('detects if window.ethereum is available in environment', () => {
    expect(typeof isMetaMaskAvailable()).toBe('boolean');
  });
});
