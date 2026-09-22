# Terms Audit Desk &mdash; Interactive Demo Script

This script provides an end-to-end walkthrough of **Terms Audit Desk**, an Intelligent Contract dApp powered by GenLayer on **studionet**.

---

## 1. Prerequisites
- Modern web browser (Chrome, Brave, Edge, Firefox).
- [MetaMask](https://metamask.io) browser extension installed (required only for write operations; read-only verification requires no wallet).
- GenLayer studionet network (Chain ID: `61999` / `0xF22F`, RPC: `https://studio.genlayer.com/api`).
- Studio test tokens (`GEN`) from [GenLayer Studio](https://studio.genlayer.com).

---

## 2. Walkthrough 1: Read-Only Audit & Verified Quote Coverage (Zero Gas / No Wallet)

1. Open the dApp in your browser.
2. Observe that **Sample 1: Compliant Document** is loaded automatically on initial mount:
   - **Outcome Banner**: `PASSED AUDIT` (Revision #1).
   - **Coverage Verification**: `100.00%` (3/3 chunks analyzed deterministically, `10,000 bp`).
   - **Checklist**:
     - `refund`: `SATISFIED` with verbatim quote grounded on-chain (`"30-day money-back guarantee with full refund"`).
     - `auto_renew`: `CLEAR` (no auto-renewal trap found across any chunk).
   - **Downstream Consumer**: Displays `APPROVED` because the document passed with 10,000 bp coverage.
   - **On-Chain Consensus & Coverage Panel**: Displays the normalized document SHA-256 (`07319db20d11...`) and individual chunk hashes.
3. Click **Sample 3: Buried Trap Clause**:
   - **Fixture Fact**: This fixture was constructed with the auto-renewal clause located in the final chunk. While the contract returns overall outcome and quotes without storing chunk locations on-chain, 10,000 bp coverage ensures clauses outside the opening prefix are read.
   - **Outcome Banner**: `FAILED AUDIT`.
   - **Coverage**: `100.00%` (10,000 bp).
   - **Clause**: `auto_renew` is flagged `VIOLATED` with verbatim quote: `"All subscriptions will auto-renew without notice and cannot be cancelled"`.
   - **Honesty Notes**: Highlights that a conventional prefix-only AI contract examining only the first chunk would have issued a false `PASS`. FullRead proved the violation by evaluating all chunks.

---

## 3. Walkthrough 2: Connect MetaMask & Switch Chain

1. In the header, click **Connect Wallet**.
2. MetaMask will prompt you to connect your account.
3. If your MetaMask is not yet configured for **GenLayer studionet**, the dApp automatically requests adding and switching to:
   - Network Name: `GenLayer studionet`
   - Chain ID: `61999` (`0xF22F`)
   - RPC URL: `https://studio.genlayer.com/api`
   - Currency Symbol: `GEN`
   - Explorer: `https://explorer-studio.genlayer.com`
4. Confirm in MetaMask.
5. Your truncated address (`0x...`) will appear in the top-right corner.

---

## 4. Walkthrough 3: Submit a Live Whole-Document Audit (Write Path)

1. Select **Terms Compliance (Preset)** in Step 1.
2. In Step 2, enter a public HTTPS document URL, for example:
   ```
   https://raw.githubusercontent.com/huzyow155/fullread-genlayer/1089f03d16472bf324510b52b3f73715d310ad7f/tests/fixtures/compliant.md
   ```
3. Set **Max Chunks** to `1 Chunk (5k chars)` or `3 Chunks (15k chars)`.
4. Click **Audit on Studionet**.
5. MetaMask opens asking you to sign and submit the transaction to the `FullRead` contract (`0xfC2d4d29b46f44A6f4d09496451ff662dA8b4d33`).
6. Confirm the transaction.
7. **Staged Waiting Modal** opens immediately:
   - Stage 1: Wallet Confirmation &rarr; Completed.
   - Stage 2: Submitted to Studionet (Transaction hash is clickable to the GenLayer Studio Explorer).
   - Stage 3: Validators Reading (Nodes fetch document from the web, tokenize, and evaluate clauses).
   - Stage 4: Consensus Agreement (Validators reach consensus on chunk hashes and grounded quotes).
   - Stage 5: Result Finalized!
8. Click **View Updated Audit**:
   - The UI automatically queries the new audit record.
   - The revision counter increments (e.g. `Rev #2` or `Rev #3`).

---

## 5. Walkthrough 4: Author and Register a Custom Checklist (Milestone 4)

1. Next to **Step 1: Evaluation Checklist**, click **+ Custom**.
2. The **Create Custom Evaluation Checklist** modal appears.
3. Either click a starter template (e.g. `SaaS SLA & Support Guarantee`) or build your own:
   - Give the checklist a name (e.g. `Enterprise Vendor Security`).
   - For each criterion:
     - ID: e.g. `data_breach_72h` (validated against regex `^[a-z0-9_]{1,24}$`).
     - Severity: `BLOCKER`, `MAJOR`, or `MINOR`.
     - Polarity: `MUST_HAVE` (must exist) or `MUST_NOT_HAVE` (forbidden).
     - Question: Description of what validators should look for.
4. Watch the **Derived Checklist ID (SHA-256)** calculate in real time.
5. Click **Register Checklist on Studionet**.
6. Confirm in MetaMask. The modal tracks validator consensus and registers your checklist on-chain.
7. Once registered, the new checklist is automatically selected in the checklist dropdown.

---

## 6. Walkthrough 5: Trigger Downstream Contract Approval

1. Load any audit with `outcome: PASS` and `coverage_bp: 10000`.
2. Scroll to the **Downstream Smart Contract Policy Consumer** card.
3. Click **Record Approval on-chain**.
4. Confirm the transaction calling `approve_if_passed(review_id)` on `DocumentPolicyConsumer` (`0xE8424C568FCB418fBAD5D272470f9A9fD6452860`).
5. DocumentPolicyConsumer performs an internal cross-contract call to FullRead, verifies the audit outcome and coverage, and marks the document as `APPROVED`.
6. Once finalized, the badge updates to `APPROVED` with the stored review record ID.

---

## 7. Walkthrough 6: Recheck Content Drift

1. When viewing a document with revision history, click **Recheck Drift** in the **Revision History** card.
2. Confirm in MetaMask.
3. Validators re-fetch the live URL, compute its document hash, and compare it to the stored `doc_sha256`.
4. If unchanged, `drifted: false` is recorded. If changed, `drifted: true` is permanently stored on-chain.
