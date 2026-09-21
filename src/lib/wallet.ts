import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { DEPLOYMENT_CONFIG } from '../config/deployment';
import { getReadClient } from './genlayer';

export interface PendingTransaction {
  hash: string;
  type: 'review' | 'recheck' | 'approve' | 'register_checklist';
  checklistId?: string;
  docUrl?: string;
  reviewId?: string;
  name?: string;
  startedAt: number;
}

const STORAGE_KEY_PENDING_TX = 'terms_audit_pending_tx_v1';

export function getPendingTransaction(): PendingTransaction | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_TX);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePendingTransaction(tx: PendingTransaction): void {
  try {
    localStorage.setItem(STORAGE_KEY_PENDING_TX, JSON.stringify(tx));
  } catch {
    // ignore
  }
}

export function clearPendingTransaction(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PENDING_TX);
  } catch {
    // ignore
  }
}

export function isMetaMaskAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).ethereum);
}

export async function ensureStudionetNetwork(): Promise<void> {
  if (!isMetaMaskAvailable()) {
    throw new Error('No Ethereum wallet detected. Please install MetaMask to perform on-chain writes.');
  }
  const ethereum = (window as any).ethereum;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: DEPLOYMENT_CONFIG.chainIdHex }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: DEPLOYMENT_CONFIG.chainIdHex,
            chainName: DEPLOYMENT_CONFIG.networkName,
            nativeCurrency: {
              name: DEPLOYMENT_CONFIG.currencySymbol,
              symbol: DEPLOYMENT_CONFIG.currencySymbol,
              decimals: DEPLOYMENT_CONFIG.currencyDecimals,
            },
            rpcUrls: [DEPLOYMENT_CONFIG.rpcUrl],
            blockExplorerUrls: [DEPLOYMENT_CONFIG.explorerUrl],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

export async function requestWalletConnection(): Promise<string> {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to interact with GenLayer studionet.');
  }
  const ethereum = (window as any).ethereum;
  await ensureStudionetNetwork();

  const accounts: string[] = await ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected in wallet.');
  }

  return accounts[0];
}

export function getWriteClient(accountAddress: string) {
  const ethereum = (window as any).ethereum;
  return createClient({
    chain: studionet,
    account: accountAddress as `0x${string}`,
    provider: ethereum,
  });
}

export interface TxProgressUpdate {
  stage: 'WALLET_CONFIRM' | 'SUBMITTED' | 'VALIDATING' | 'CONSENSUS' | 'FINALIZED' | 'ERROR';
  hash?: string;
  elapsedSeconds: number;
  message: string;
}

export function verifyTransactionSuccess(receipt: any): void {
  if (!receipt) {
    throw new Error('No transaction receipt returned');
  }

  const isAccepted = receipt.status_name === 'ACCEPTED' || receipt.status === 5;
  const isMajorityAgree =
    receipt.result_name === 'MAJORITY_AGREE' ||
    receipt.result_name === 'SUCCESS' ||
    receipt.result === 6;

  // Check leader execution result inside consensus_data
  const leaderReceipt = receipt.consensus_data?.leader_receipt?.[0];
  const leaderExecutionResult = leaderReceipt?.execution_result;
  const isLeaderSuccess = !leaderExecutionResult || leaderExecutionResult === 'SUCCESS';

  if (!isAccepted || !isMajorityAgree || !isLeaderSuccess) {
    const errorPayload =
      leaderReceipt?.result?.payload ||
      leaderReceipt?.eq_outputs?.['0']?.payload ||
      leaderReceipt?.genvm_result?.error_description ||
      receipt.result_name ||
      receipt.status_name ||
      'Transaction failed execution';

    throw new Error(`Transaction completed with non-success state: ${errorPayload}`);
  }
}

export async function waitForReceiptWithProgress(
  hash: string,
  onProgress?: (update: TxProgressUpdate) => void
): Promise<any> {
  const client = getReadClient();
  const startTime = Date.now();

  const timer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    let stage: TxProgressUpdate['stage'] = 'VALIDATING';
    let message = 'Validators reading chunks and running AI prompts...';

    if (elapsed > 18) {
      stage = 'CONSENSUS';
      message = 'Validators reaching consensus agreement...';
    }

    onProgress?.({
      stage,
      hash,
      elapsedSeconds: elapsed,
      message,
    });
  }, 1000);

  try {
    const receipt = await client.waitForTransactionReceipt({
      hash,
      status: 'ACCEPTED',
      retries: 120,
      interval: 3000,
    });

    clearInterval(timer);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    verifyTransactionSuccess(receipt);

    onProgress?.({
      stage: 'FINALIZED',
      hash,
      elapsedSeconds: elapsed,
      message: 'Consensus verified! Transaction accepted by validators on GenLayer studionet. Accepted results can still be appealed until finalization.',
    });

    return receipt;
  } catch (err: any) {
    clearInterval(timer);
    throw err;
  }
}

export async function submitAuditReview(
  accountAddress: string,
  checklistId: string,
  docUrl: string,
  maxChunks: number,
  onProgress?: (update: TxProgressUpdate) => void
): Promise<{ hash: string; receipt: any }> {
  onProgress?.({
    stage: 'WALLET_CONFIRM',
    elapsedSeconds: 0,
    message: 'Please confirm the audit transaction in MetaMask...',
  });

  const writeClient = getWriteClient(accountAddress);
  const hash = await writeClient.writeContract({
    address: DEPLOYMENT_CONFIG.fullReadAddress,
    functionName: 'review',
    args: [checklistId, docUrl, maxChunks],
    value: 0n,
  });

  savePendingTransaction({
    hash,
    type: 'review',
    checklistId,
    docUrl,
    startedAt: Date.now(),
  });

  onProgress?.({
    stage: 'SUBMITTED',
    hash,
    elapsedSeconds: 1,
    message: 'Transaction submitted to GenLayer studionet. Awaiting validator execution...',
  });

  const receipt = await waitForReceiptWithProgress(hash, onProgress);
  clearPendingTransaction();
  return { hash, receipt };
}

export async function submitRecheckDrift(
  accountAddress: string,
  reviewId: string,
  onProgress?: (update: TxProgressUpdate) => void
): Promise<{ hash: string; receipt: any }> {
  onProgress?.({
    stage: 'WALLET_CONFIRM',
    elapsedSeconds: 0,
    message: 'Please confirm the recheck transaction in MetaMask...',
  });

  const writeClient = getWriteClient(accountAddress);
  const hash = await writeClient.writeContract({
    address: DEPLOYMENT_CONFIG.fullReadAddress,
    functionName: 'recheck',
    args: [reviewId],
    value: 0n,
  });

  savePendingTransaction({
    hash,
    type: 'recheck',
    reviewId,
    startedAt: Date.now(),
  });

  onProgress?.({
    stage: 'SUBMITTED',
    hash,
    elapsedSeconds: 1,
    message: 'Recheck submitted to GenLayer studionet. Comparing hashes...',
  });

  const receipt = await waitForReceiptWithProgress(hash, onProgress);
  clearPendingTransaction();
  return { hash, receipt };
}

export async function submitConsumerApproval(
  accountAddress: string,
  reviewId: string,
  onProgress?: (update: TxProgressUpdate) => void
): Promise<{ hash: string; receipt: any }> {
  onProgress?.({
    stage: 'WALLET_CONFIRM',
    elapsedSeconds: 0,
    message: 'Please confirm the policy approval in MetaMask...',
  });

  const writeClient = getWriteClient(accountAddress);
  const hash = await writeClient.writeContract({
    address: DEPLOYMENT_CONFIG.consumerAddress,
    functionName: 'approve_if_passed',
    args: [reviewId],
    value: 0n,
  });

  savePendingTransaction({
    hash,
    type: 'approve',
    reviewId,
    startedAt: Date.now(),
  });

  onProgress?.({
    stage: 'SUBMITTED',
    hash,
    elapsedSeconds: 1,
    message: 'Approval submitted to DocumentPolicyConsumer. Cross-contract checking FullRead...',
  });

  const receipt = await waitForReceiptWithProgress(hash, onProgress);
  clearPendingTransaction();
  return { hash, receipt };
}

export async function submitRegisterChecklist(
  accountAddress: string,
  name: string,
  items: Array<{
    id: string;
    question: string;
    severity: string;
    polarity: string;
  }>,
  onProgress?: (update: TxProgressUpdate) => void
): Promise<{ hash: string; receipt: any }> {
  onProgress?.({
    stage: 'WALLET_CONFIRM',
    elapsedSeconds: 0,
    message: 'Please confirm the checklist registration in MetaMask...',
  });

  const writeClient = getWriteClient(accountAddress);
  const itemsJson = JSON.stringify(items);

  const hash = await writeClient.writeContract({
    address: DEPLOYMENT_CONFIG.fullReadAddress,
    functionName: 'register_checklist',
    args: [name, itemsJson],
    value: 0n,
  });

  savePendingTransaction({
    hash,
    type: 'register_checklist',
    name,
    startedAt: Date.now(),
  });

  onProgress?.({
    stage: 'SUBMITTED',
    hash,
    elapsedSeconds: 1,
    message: 'Checklist registration submitted. Validators verifying format...',
  });

  const receipt = await waitForReceiptWithProgress(hash, onProgress);
  clearPendingTransaction();
  return { hash, receipt };
}
