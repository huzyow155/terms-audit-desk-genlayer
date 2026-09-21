export interface ChecklistItemConfig {
  id: string;
  question: string;
  severity: 'BLOCKER' | 'MAJOR' | 'MINOR';
  polarity: 'MUST_HAVE' | 'MUST_NOT_HAVE';
}

export interface PresetChecklist {
  id: string;
  name: string;
  description: string;
  items: ChecklistItemConfig[];
}

export interface SampleReviewConfig {
  id: string;
  title: string;
  subtitle: string;
  docUrl: string;
  expectedOutcome: 'PASS' | 'FAIL' | 'REVIEW';
  expectedCoverageBp: number;
  explanation: string;
}

export const DEPLOYMENT_CONFIG = {
  networkName: 'GenLayer studionet',
  chainId: 61999,
  chainIdHex: '0xF22F',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://studio.genlayer.com/api',
  explorerUrl: import.meta.env.VITE_EXPLORER_URL || 'https://explorer-studio.genlayer.com',
  fullReadAddress: import.meta.env.VITE_FULL_READ_ADDRESS || '0xfC2d4d29b46f44A6f4d09496451ff662dA8b4d33',
  consumerAddress: import.meta.env.VITE_CONSUMER_ADDRESS || '0xE8424C568FCB418fBAD5D272470f9A9fD6452860',
  currencySymbol: 'GEN',
  currencyDecimals: 18,
};

export const PRESET_CHECKLISTS: PresetChecklist[] = [
  {
    id: '60932b48524e8f2a',
    name: 'Terms Compliance (Preset)',
    description: 'Verifies mandatory customer refund policy and guards against deceptive auto-renewal clauses.',
    items: [
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
    ],
  },
];

export const SAMPLE_REVIEWS: SampleReviewConfig[] = [
  {
    id: '60932b48_34af5201_r1',
    title: 'Compliant Document',
    subtitle: 'Clear refund policy, no auto-renewal trap',
    docUrl: 'https://raw.githubusercontent.com/huzyow155/fullread-genlayer/1089f03d16472bf324510b52b3f73715d310ad7f/tests/fixtures/compliant.md',
    expectedOutcome: 'PASS',
    expectedCoverageBp: 10000,
    explanation: 'The contract partitioned the document across 3 chunks, verified the grounded refund quote, and reached consensus across validator nodes.',
  },
  {
    id: '60932b48_d101aeae_r1',
    title: 'Immediate Violation',
    subtitle: 'Auto-renewal violation present in opening section',
    docUrl: 'https://raw.githubusercontent.com/huzyow155/fullread-genlayer/1089f03d16472bf324510b52b3f73715d310ad7f/tests/fixtures/violation_in_first_chunk.md',
    expectedOutcome: 'FAIL',
    expectedCoverageBp: 10000,
    explanation: 'Fixture fact: Contains an automatic perpetual renewal trap in the opening sections. Even naive prefix-only tools catch this, but FullRead provides on-chain verifiable quotes and consensus verification.',
  },
  {
    id: '60932b48_abac5b2d_r1',
    title: 'Buried Trap Clause',
    subtitle: 'Fixture built with clause in final chunk',
    docUrl: 'https://raw.githubusercontent.com/huzyow155/fullread-genlayer/1089f03d16472bf324510b52b3f73715d310ad7f/tests/fixtures/violation_in_last_chunk.md',
    expectedOutcome: 'FAIL',
    expectedCoverageBp: 10000,
    explanation: 'Fixture fact: This document is constructed with its auto-renewal clause placed in the final chunk. While the contract returns overall outcome and grounded quotes without recording chunk coordinates on-chain, 10,000 bp coverage ensures that clauses outside the opening prefix are read and evaluated.',
  },
];
