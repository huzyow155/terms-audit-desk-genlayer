# Contracts Reference (Read-Only)

> **Notice**: The canonical source of truth, deployment history, and test suites live in the dedicated repository:  
> **[https://github.com/huzyow155/fullread-genlayer](https://github.com/huzyow155/fullread-genlayer)**.  
> The files in this folder are **unmodified read-only reference copies** provided solely so that evaluators and auditors can verify the on-chain validator logic, document fetching, quote grounding, coverage enforcement, and downstream approval behavior directly within this repository.

---

## 1. FullRead Intelligent Contract (`FullRead.py`)
- **File**: [`FullRead.py`](FullRead.py)
- **Canonical Repo Path**: [`contracts/full_read.py`](https://github.com/huzyow155/fullread-genlayer/blob/main/contracts/full_read.py)
- **Deployed Address (studionet)**: [`0xfC2d4d29b46f44A6f4d09496451ff662dA8b4d33`](https://explorer-studio.genlayer.com/address/0xfC2d4d29b46f44A6f4d09496451ff662dA8b4d33)
- **Deploy Transaction**: [`0x78d9b6be8e9bf32bc6cec8ecb9252268ee420f4bb2bba545cfaa7f45db2801d8`](https://explorer-studio.genlayer.com/tx/0x78d9b6be8e9bf32bc6cec8ecb9252268ee420f4bb2bba545cfaa7f45db2801d8)
- **Deployed Python Source SHA-256 (from deployment tx via `eth_getTransactionByHash`)**: `4c1d8f329fd74d9eb128993553a3c0df3f37eede5f1b9e43bf73c86b2903576c`
- **Purpose**: Autonomous Intelligent Contract running decentralized validator LLMs to fetch public legal documents via `gl.nondet.web.get`, partition text into deterministic 5,000-character chunks, enforce verbatim quote grounding (min 12 characters substring match), compute basis-point coverage (`coverage_bp`), and vote through GenLayer validator consensus.

---

## 2. DocumentPolicyConsumer Contract (`DocumentPolicyConsumer.py`)
- **File**: [`DocumentPolicyConsumer.py`](DocumentPolicyConsumer.py)
- **Canonical Repo Path**: [`examples/consumer/consumer.py`](https://github.com/huzyow155/fullread-genlayer/blob/main/examples/consumer/consumer.py)
- **Deployed Address (studionet)**: [`0xE8424C568FCB418fBAD5D272470f9A9fD6452860`](https://explorer-studio.genlayer.com/address/0xE8424C568FCB418fBAD5D272470f9A9fD6452860)
- **Deploy Transaction**: [`0x89ce9521ba7108bcaddd8ebfc47c153a87be211b57e06ec553328bac53008e82`](https://explorer-studio.genlayer.com/tx/0x89ce9521ba7108bcaddd8ebfc47c153a87be211b57e06ec553328bac53008e82)
- **Deployed Python Source SHA-256 (from deployment tx via `eth_getTransactionByHash`)**: `2e4d268513f38ea2444ef3dd833554b08de54004d6cbb6a36a2c413a2d1ae129`
- **Purpose**: Downstream consumer smart contract performing cross-contract view queries to FullRead via `gl.get_contract_at(full_read_address).view().get_review(review_id)` and gating document approvals strictly on `outcome == "PASS"` and `coverage_bp == 10000`.
