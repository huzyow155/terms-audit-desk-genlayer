import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { DEPLOYMENT_CONFIG } from '../config/deployment';
import { parseReviewRecord, type RawReviewRecord } from './resultMapper';

export interface ChecklistData {
  id: string;
  name: string;
  items: Array<{
    id: string;
    question: string;
    severity: 'BLOCKER' | 'MAJOR' | 'MINOR';
    polarity: 'MUST_HAVE' | 'MUST_NOT_HAVE';
  }>;
  creator: string;
}

export interface ConsumerApprovalState {
  isApproved: boolean;
  approvalReviewId: string;
}

// Singleton read-only client
let readClientInstance: any = null;

export function getReadClient() {
  if (!readClientInstance) {
    readClientInstance = createClient({
      chain: studionet,
    });
  }
  return readClientInstance;
}

function handleContractReadError(err: any): never {
  const msg = (err && (err.message || String(err))) || '';
  if (msg.includes('contract not found') || msg.includes('does not exist') || msg.includes('account not found')) {
    throw new Error(
      'The demo contract was not found on GenLayer studionet. The network may have been reset. See the README for current deployment status.'
    );
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
    throw new Error(
      'Unable to connect to GenLayer studionet RPC (https://studio.genlayer.com/api). Please verify your internet connection or try again shortly.'
    );
  }
  throw err;
}

export async function fetchChecklist(checklistId: string): Promise<ChecklistData> {
  const client = getReadClient();
  try {
    const rawJson = await client.readContract({
      address: DEPLOYMENT_CONFIG.fullReadAddress,
      functionName: 'get_checklist',
      args: [checklistId],
    });
    return JSON.parse(rawJson);
  } catch (err) {
    return handleContractReadError(err);
  }
}

export async function fetchReview(reviewId: string): Promise<RawReviewRecord> {
  const client = getReadClient();
  try {
    const rawJson = await client.readContract({
      address: DEPLOYMENT_CONFIG.fullReadAddress,
      functionName: 'get_review',
      args: [reviewId],
    });
    return parseReviewRecord(rawJson);
  } catch (err) {
    return handleContractReadError(err);
  }
}

export async function fetchLatestReviewId(checklistId: string, docUrl: string): Promise<string | null> {
  const client = getReadClient();
  try {
    const revId = await client.readContract({
      address: DEPLOYMENT_CONFIG.fullReadAddress,
      functionName: 'latest_review_id',
      args: [checklistId, docUrl],
    });
    return revId || null;
  } catch (err) {
    // If no reviews found, latest_review_id raises UserError
    const msg = String(err);
    if (msg.includes('no reviews found')) {
      return null;
    }
    return handleContractReadError(err);
  }
}

export async function fetchReviewHistory(checklistId: string, docUrl: string): Promise<string[]> {
  const client = getReadClient();
  try {
    const rawJson = await client.readContract({
      address: DEPLOYMENT_CONFIG.fullReadAddress,
      functionName: 'list_reviews',
      args: [checklistId, docUrl],
    });
    return JSON.parse(rawJson || '[]');
  } catch (err) {
    return handleContractReadError(err);
  }
}

export async function fetchConsumerApproval(docUrl: string): Promise<ConsumerApprovalState> {
  const client = getReadClient();
  try {
    const isApproved = await client.readContract({
      address: DEPLOYMENT_CONFIG.consumerAddress,
      functionName: 'is_document_approved',
      args: [docUrl],
    });

    let approvalReviewId = '';
    if (isApproved) {
      approvalReviewId = await client.readContract({
        address: DEPLOYMENT_CONFIG.consumerAddress,
        functionName: 'get_approval_review_id',
        args: [docUrl],
      });
    }

    return {
      isApproved: Boolean(isApproved),
      approvalReviewId: approvalReviewId || '',
    };
  } catch {
    // If consumer read fails gracefully return unapproved
    return {
      isApproved: false,
      approvalReviewId: '',
    };
  }
}
