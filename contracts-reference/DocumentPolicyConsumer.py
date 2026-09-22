# ==============================================================================
# READ-ONLY REFERENCE COPY
#
# This file is a read-only reference copy of the deployed DocumentPolicyConsumer contract.
# The canonical source of truth, deployment artifacts, and full test suite live in
# the separate repository:
#   https://github.com/huzyow155/fullread-genlayer
# where this contract was deployed and verified on GenLayer studionet.
#
# This repository (terms-audit-desk-genlayer) does not claim to have built or
# authored this contract; it is included solely to allow reviewers to inspect
# the cross-contract view calls and downstream approval gate behavior.
#
# Deployed Address (studionet): 0xE8424C568FCB418fBAD5D272470f9A9fD6452860
# Deploy Tx: 0x89ce9521ba7108bcaddd8ebfc47c153a87be211b57e06ec553328bac53008e82
# Deployed Code SHA-256: 2e4d268513f38ea2444ef3dd833554b08de54004d6cbb6a36a2c413a2d1ae129
# ==============================================================================

# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json

from genlayer import *


class DocumentPolicyConsumer(gl.Contract):
    full_read_address: Address
    approved_documents: TreeMap[str, str]

    def __init__(self, full_read_address_str: str):
        self.full_read_address = Address(full_read_address_str)

    @gl.public.write
    def approve_if_passed(self, review_id: str) -> None:
        full_read = gl.get_contract_at(self.full_read_address)
        review_json_str = full_read.view().get_review(review_id)
        data = json.loads(review_json_str)

        outcome = str(data.get("outcome", "")).upper()
        coverage = int(data.get("coverage_bp", 0))

        if outcome != "PASS" or coverage != 10000:
            raise gl.vm.UserError(
                f"approval rejected: outcome={outcome}, coverage_bp={coverage} (requires PASS and 10000 bp)"
            )

        doc_url = str(data.get("doc_url", ""))
        self.approved_documents[doc_url] = review_id

    @gl.public.view
    def is_document_approved(self, doc_url: str) -> bool:
        return doc_url in self.approved_documents

    @gl.public.view
    def get_approval_review_id(self, doc_url: str) -> str:
        return self.approved_documents.get(doc_url, "")
