import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPendingTransaction,
  savePendingTransaction,
  clearPendingTransaction,
  isMetaMaskAvailable,
  verifyTransactionSuccess,
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

  describe('verifyTransactionSuccess', () => {
    it('passes for a valid accepted receipt with leader SUCCESS', () => {
      const validReceipt = {
        status: 5,
        status_name: 'ACCEPTED',
        result: 6,
        result_name: 'MAJORITY_AGREE',
        consensus_data: {
          leader_receipt: [
            {
              execution_result: 'SUCCESS',
            },
          ],
        },
      };

      expect(() => verifyTransactionSuccess(validReceipt)).not.toThrow();
    });

    it('throws with clear error for a failing write (e.g. 404 document URL)', () => {
      const failing404Receipt = {
        status_name: 'UNDETERMINED',
        result_name: 'MAJORITY_DISAGREE',
        consensus_data: {
          leader_receipt: [
            {
              execution_result: 'ERROR',
              result: {
                status: 'rollback',
                payload: 'fetch failed with status 404',
              },
            },
          ],
        },
      };

      expect(() => verifyTransactionSuccess(failing404Receipt)).toThrowError(
        /fetch failed with status 404/
      );
    });

    it('throws for rejected status or empty receipt', () => {
      expect(() => verifyTransactionSuccess(null)).toThrowError(
        /No transaction receipt returned/
      );

      const rejectedReceipt = {
        status_name: 'REJECTED',
        result_name: 'MAJORITY_DISAGREE',
      };
      expect(() => verifyTransactionSuccess(rejectedReceipt)).toThrow();
    });
  });
});
