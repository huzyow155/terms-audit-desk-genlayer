# Terms Audit Desk &bull; GenLayer Intelligent Contract dApp

> **Prove an AI audit read the whole document, not just its first page.**
>
> Live decentralized document intelligence on **GenLayer studionet**.

[![Deployment](https://img.shields.io/badge/Network-GenLayer%20studionet%20(61999)-0284c7)](https://explorer-studio.genlayer.com)
[![Contract](https://img.shields.io/badge/FullRead%20Contract-0xfC2d...4d33-10b981)](https://explorer-studio.genlayer.com/address/0xfC2d4d29b46f44A6f4d09496451ff662dA8b4d33)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. Overview

**Terms Audit Desk** is a production dApp built on the deployed **FullRead** Intelligent Contract on **GenLayer studionet**. It evaluates complex, multi-page public legal agreements (Terms of Service, SaaS contracts, Privacy Policies) against customizable compliance checklists, cryptographically proving validator consensus coverage across the **entire document**.

- **Live Application URL**: [terms-audit-desk-genlayer.vercel.app](https://terms-audit-desk-genlayer.vercel.app) *(or your Vercel deployment URL)*
- **Underlying Intelligent Contract Repository**: [huzyow155/fullread-genlayer](https://github.com/huzyow155/fullread-genlayer)

---

## 2. Why GenLayer? The "Buried-Clause" Vulnerability

Conventional AI-oracle integrations only pass a small prefix of a document (often under 4,000 characters) to an LLM due to context limits and single-shot execution. In legal agreements, this creates an enormous exploit surface: an adversary can make the first two pages appear completely benign and compliant, while burying predatory clauses (such as perpetual auto-renewal traps, unilateral modification rights, or waiver of liability) on page 3 or 4.

**FullRead on GenLayer solves this:**
1. **Deterministic Partitioning**: Partitions the normalized text into fixed-size chunks (e.g. 5,000 characters each).
2. **Multi-Round Decentralized Evaluation**: GenLayer validators read every chunk and verify clauses against deterministic criteria.
3. **Verbatim Grounded Quotes**: Validators must ground every positive finding in an exact substring quote from the document chunks.
4. **On-Chain Proof of Coverage**: The contract records `coverage_bp` (basis points, where 10,000 bp = 100.00% complete coverage) alongside individual chunk SHA-256 hashes.
5. **Decentralized Consensus**: Validators vote on outcomes, chunk hashes, and grounded quotes using GenLayer's non-deterministic consensus principles.

---

## 3. Deployed Smart Contracts (GenLayer studionet)

| Contract | Address | Explorer Link |
| :--- | :--- | :--- |
| **FullRead Intelligent Contract** | `0xfC2d4d29b46f44A6f4d09496451ff662dA8b4d33` | [View on Explorer](https://explorer-studio.genlayer.com/address/0xfC2d4d29b46f44A6f4d09496451ff662dA8b4d33) |
| **DocumentPolicyConsumer** | `0xE8424C568FCB418fBAD5D272470f9A9fD6452860` | [View on Explorer](https://explorer-studio.genlayer.com/address/0xE8424C568FCB418fBAD5D272470f9A9fD6452860) |

- **Network Name**: `GenLayer studionet`
- **Chain ID**: `61999` (`0xF22F`)
- **RPC URL**: `https://studio.genlayer.com/api`
- **Explorer URL**: `https://explorer-studio.genlayer.com`
- **Preset Checklist ID**: `60932b48524e8f2a` (Terms Compliance: Mandatory Refund Policy + Prohibited Auto-Renewal)

---

## 4. Key Features

- **Pre-Verified Samples (No Wallet Required)**: Instant inspection of 3 on-chain audits:
  - *Sample 1 (Compliant)*: 100.00% coverage, `PASS` outcome.
  - *Sample 2 (Immediate Violation)*: Trap clause in chunk 1, `FAIL` outcome.
  - *Sample 3 (Buried Trap Clause)*: Compliant in chunks 1 & 2, trap buried in chunk 3, `FAIL` outcome (demonstrating why whole-document coverage is required).
- **Custom Checklist Builder (Milestone 4)**:
  - Author checklists with up to 8 criteria.
  - Real-time client-side calculation of the deterministic 16-hex checklist ID (`deriveChecklistId`) matching the contract's canonical JSON SHA-256 algorithm.
  - On-chain registration via `register_checklist(name, items_json)`.
- **MetaMask Web3 Write Path (Milestone 3)**:
  - Seamless connection via `genlayer-js` using standard `window.ethereum` provider.
  - Automatic chain addition / switching to GenLayer studionet (`0xF22F`).
  - No burner wallets or private keys bundled in code.
- **Staged Waiting Modal & Resumption**:
  - Live 5-stage progress indicator: Wallet Confirmation &rarr; Submitted to Studionet &rarr; Validators Reading &rarr; Consensus Agreement &rarr; Finalized.
  - Tracks elapsed seconds.
  - Transaction resilience: pending transactions are persisted in `localStorage` and automatically resume tracking upon page reload.
- **Downstream Consumer Execution**:
  - Cross-contract policy verification via `DocumentPolicyConsumer.is_document_approved` and `approve_document`.
- **Accessible & Ethical UI**:
  - Built with Tailwind CSS following WCAG AA standards.
  - High-contrast states, complete keyboard navigation, dark mode support, and screen-reader accessible ARIA roles.

---

## 5. Realistic Latency Disclosure

GenLayer Intelligent Contracts perform live HTTP fetches from decentralized validator nodes, multi-chunk LLM prompt executions, and consensus voting across validators.

In our empirical on-chain measurements on studionet:
- **1-chunk review**: ~18 to 25 seconds.
- **3-chunk full audit**: ~50 to 110 seconds.

The dApp prominently displays this latency disclosure in the UI so users understand decentralized consensus timing.

---

## 6. Local Setup and Testing

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Installation
```bash
git clone https://github.com/huzyow155/terms-audit-desk-genlayer.git
cd terms-audit-desk-genlayer
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Running Unit Tests (Vitest)
```bash
npm test
```
Runs 19 automated unit tests verifying URL validation, deterministic checklist ID calculation, result parsing, and wallet state persistence.

### Running End-to-End Tests (Playwright)
```bash
npx playwright test
```
Executes headless browser tests validating the read-only audit flow, live sample loading, responsive 360px mobile viewports, and interactive modals.

### Local Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 7. Security & Secret Hygiene

This repository contains **zero private keys**, mnemonics, or sensitive credentials. User write operations are signed exclusively via the user's own MetaMask wallet extension.

Run the built-in secret scanner to verify:
```bash
python scripts/secret-scan.py
```

---

## 8. License

MIT License &copy; 2026 Terms Audit Desk Contributors.
