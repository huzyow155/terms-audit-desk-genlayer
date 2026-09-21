import { createClient, createAccount } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import crypto from 'crypto';

const FULL_READ_ADDRESS = '0xfC2d4d29b46f44A6f4d09496451ff662dA8b4d33';
const CONSUMER_ADDRESS = '0xE8424C568FCB418fBAD5D272470f9A9fD6452860';
const CHECKLIST_ID = '60932b48524e8f2a';

const SAMPLE_REVIEWS = [
  { id: '60932b48_34af5201_r1', expectedOutcome: 'PASS', expectedCoverage: 10000 },
  { id: '60932b48_d101aeae_r1', expectedOutcome: 'FAIL', expectedCoverage: 10000 },
  { id: '60932b48_abac5b2d_r1', expectedOutcome: 'FAIL', expectedCoverage: 10000 }
];

async function main() {
  console.log('=== Milestone 1: Read-Only Smoke Test on GenLayer Studionet ===\n');

  // Test client without account first
  let client;
  try {
    client = createClient({
      chain: studionet,
    });
    console.log('Client created without account.');
  } catch (err) {
    console.log('Client without account failed, using read-only zero account:', err.message);
    const roAccount = createAccount();
    client = createClient({
      chain: studionet,
      account: roAccount,
    });
  }

  // 1. Read Checklist
  console.log(`\n1. Reading checklist ${CHECKLIST_ID} from FullRead...`);
  let checklistJson;
  try {
    checklistJson = await client.readContract({
      address: FULL_READ_ADDRESS,
      functionName: 'get_checklist',
      args: [CHECKLIST_ID],
    });
    console.log('✓ get_checklist returned raw JSON string.');
  } catch (err) {
    // If client without account errored on readContract, try with a read-only account
    console.log('Read without account failed:', err.message, 'Trying with read-only account...');
    const roAccount = createAccount();
    client = createClient({
      chain: studionet,
      account: roAccount,
    });
    checklistJson = await client.readContract({
      address: FULL_READ_ADDRESS,
      functionName: 'get_checklist',
      args: [CHECKLIST_ID],
    });
    console.log('✓ get_checklist succeeded with read-only account.');
  }

  const checklist = JSON.parse(checklistJson);
  console.log('Checklist name:', checklist.name);
  console.log('Checklist items count:', checklist.items.length);
  if (checklist.id !== CHECKLIST_ID) {
    throw new Error(`Checklist ID mismatch: expected ${CHECKLIST_ID}, got ${checklist.id}`);
  }
  console.log('✓ Checklist ID matched:', checklist.id);

  // 2. Derive Checklist ID from items
  console.log('\n2. Deriving Checklist ID from on-chain items...');
  const sortedItems = checklist.items.map(it => ({
    id: it.id,
    polarity: it.polarity,
    question: it.question,
    severity: it.severity,
  }));
  const canonicalJson = JSON.stringify(sortedItems);
  const derivedId = crypto.createHash('sha256').update(canonicalJson).digest('hex').slice(0, 16);
  console.log('Derived ID:', derivedId);
  if (derivedId !== CHECKLIST_ID) {
    throw new Error(`Derivation mismatch: expected ${CHECKLIST_ID}, got ${derivedId}`);
  }
  console.log('✓ Checklist ID derivation exactly matches on-chain ID!');

  // 3. Read 3 Sample Reviews and assert outcomes & coverage
  console.log('\n3. Reading 3 sample reviews from FullRead...');
  for (const sample of SAMPLE_REVIEWS) {
    console.log(`Reading review ${sample.id}...`);
    const revJson = await client.readContract({
      address: FULL_READ_ADDRESS,
      functionName: 'get_review',
      args: [sample.id],
    });
    const rev = JSON.parse(revJson);
    console.log(`  Outcome: ${rev.outcome} (expected: ${sample.expectedOutcome})`);
    console.log(`  Coverage: ${rev.coverage_bp} bp (expected: ${sample.expectedCoverage})`);
    console.log(`  Ungrounded count: ${rev.ungrounded_count}`);
    console.log(`  Status by item:`, rev.status_by_item);

    if (rev.outcome !== sample.expectedOutcome) {
      throw new Error(`Outcome mismatch for ${sample.id}: expected ${sample.expectedOutcome}, got ${rev.outcome}`);
    }
    if (rev.coverage_bp !== sample.expectedCoverage) {
      throw new Error(`Coverage mismatch for ${sample.id}: expected ${sample.expectedCoverage}, got ${rev.coverage_bp}`);
    }
    console.log(`✓ Review ${sample.id} verified.`);
  }

  // 4. Verify Consumer Contract views
  console.log('\n4. Reading Consumer Contract status...');
  const compliantDocUrl = JSON.parse(await client.readContract({
    address: FULL_READ_ADDRESS,
    functionName: 'get_review',
    args: ['60932b48_34af5201_r1'],
  })).doc_url;

  const isApproved = await client.readContract({
    address: CONSUMER_ADDRESS,
    functionName: 'is_document_approved',
    args: [compliantDocUrl],
  });
  console.log(`Consumer is_document_approved for compliant doc:`, isApproved);
  if (isApproved !== true) {
    throw new Error(`Expected is_document_approved to be true, got ${isApproved}`);
  }
  console.log('✓ Consumer approval verified on-chain.');

  console.log('\n=== ALL SMOKE READ CHECKS PASSED ===\n');
}

main().catch(err => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
