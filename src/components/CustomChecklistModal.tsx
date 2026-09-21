import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { ChecklistItemConfig } from '../config/deployment';
import { deriveChecklistId } from '../lib/checklistId';

interface CustomChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, items: ChecklistItemConfig[]) => void;
  hasWallet: boolean;
  onConnectWallet?: () => void;
  isRegistering?: boolean;
}

const ITEM_ID_REGEX = /^[a-z0-9_]{1,24}$/;

interface DraftItem {
  id: string;
  question: string;
  severity: 'BLOCKER' | 'MAJOR' | 'MINOR';
  polarity: 'MUST_HAVE' | 'MUST_NOT_HAVE';
}

const TEMPLATES: Array<{
  name: string;
  items: DraftItem[];
}> = [
  {
    name: 'SaaS SLA & Support Guarantee',
    items: [
      {
        id: 'uptime_commitment',
        question: 'Explicit monthly uptime guarantee of 99.9% or higher',
        severity: 'BLOCKER',
        polarity: 'MUST_HAVE',
      },
      {
        id: 'unilateral_price_hike',
        question: 'Vendor reserves right to increase prices during active contract term',
        severity: 'BLOCKER',
        polarity: 'MUST_NOT_HAVE',
      },
      {
        id: 'downtime_credit',
        question: 'Service credits provided automatically for SLA breaches',
        severity: 'MAJOR',
        polarity: 'MUST_HAVE',
      },
    ],
  },
  {
    name: 'Data Privacy & Security Addendum',
    items: [
      {
        id: 'data_breach_notice',
        question: 'Notice of security incident within 72 hours of discovery',
        severity: 'BLOCKER',
        polarity: 'MUST_HAVE',
      },
      {
        id: 'sell_customer_data',
        question: 'Permission to sell or license customer data to third parties',
        severity: 'BLOCKER',
        polarity: 'MUST_NOT_HAVE',
      },
      {
        id: 'encryption_at_rest',
        question: 'AES-256 encryption at rest and TLS 1.3 in transit',
        severity: 'MAJOR',
        polarity: 'MUST_HAVE',
      },
    ],
  },
];

export const CustomChecklistModal: React.FC<CustomChecklistModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  hasWallet,
  onConnectWallet,
  isRegistering,
}) => {
  const [name, setName] = useState('Custom Policy Evaluation');
  const [items, setItems] = useState<DraftItem[]>([
    {
      id: 'refund_clause',
      question: 'Clear statement on consumer refund or cancellation policy',
      severity: 'BLOCKER',
      polarity: 'MUST_HAVE',
    },
    {
      id: 'unilateral_amendments',
      question: 'Company can modify terms without prior notice or consent',
      severity: 'BLOCKER',
      polarity: 'MUST_NOT_HAVE',
    },
  ]);

  // Validation logic
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!name.trim()) {
      errors.push('Checklist name cannot be empty.');
    }
    if (items.length === 0) {
      errors.push('Add at least 1 evaluation item.');
    }
    if (items.length > 8) {
      errors.push('Maximum 8 items allowed on-chain.');
    }

    const seenIds = new Set<string>();
    items.forEach((item, idx) => {
      const trimmedId = item.id.trim();
      if (!trimmedId) {
        errors.push(`Item #${idx + 1}: ID cannot be empty.`);
      } else if (!ITEM_ID_REGEX.test(trimmedId)) {
        errors.push(
          `Item #${idx + 1} ("${trimmedId}"): ID must match ^[a-z0-9_]{1,24}$ (lowercase, digits, underscores only).`
        );
      } else if (seenIds.has(trimmedId)) {
        errors.push(`Duplicate item ID: "${trimmedId}". Each ID must be unique.`);
      }
      seenIds.add(trimmedId);

      const trimmedQ = item.question.trim();
      if (!trimmedQ) {
        errors.push(`Item #${idx + 1}: Question text cannot be empty.`);
      } else if (trimmedQ.length > 200) {
        errors.push(`Item #${idx + 1}: Question must be 200 chars or less.`);
      }
    });

    return errors;
  }, [name, items]);

  const isValid = validationErrors.length === 0;

  // Real-time derived checklist ID
  const previewChecklistId = useMemo(() => {
    if (!isValid) return null;
    try {
      return deriveChecklistId(items);
    } catch {
      return null;
    }
  }, [items, isValid]);

  const handleAddItem = () => {
    if (items.length >= 8) return;
    const newIdx = items.length + 1;
    setItems([
      ...items,
      {
        id: `criterion_${newIdx}`,
        question: 'Describe required policy condition',
        severity: 'MAJOR',
        polarity: 'MUST_HAVE',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleUpdateItem = (index: number, field: keyof DraftItem, val: string) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setItems(updated);
  };

  const handleApplyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setName(tmpl.name);
    setItems(tmpl.items);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checklist-builder-title"
    >
      <div className="relative w-full max-w-2xl my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:border-sky-900 dark:bg-sky-950/80 dark:text-sky-300">
              <Sparkles className="h-3 w-3" />
              <span>Intelligent Contract Authoring</span>
            </div>
            <h2 id="checklist-builder-title" className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Create Custom Evaluation Checklist
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="mt-4 space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Quick Template Starters */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Or load a starter template:
            </label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {tmpl.name} ({tmpl.items.length} items)
                </button>
              ))}
            </div>
          </div>

          {/* Checklist Name */}
          <div>
            <label htmlFor="custom-checklist-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Checklist Name
            </label>
            <input
              id="custom-checklist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Terms & Privacy Standard 2026"
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Items Header */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Checklist Criteria ({items.length}/8)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Item ID must be 1-24 chars: lowercase letters, digits, and underscores only.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={items.length >= 8}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            {items.map((item, idx) => {
              const isIdValid = ITEM_ID_REGEX.test(item.id.trim());
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Item #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                        aria-label={`Remove item ${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-12">
                    {/* Item ID */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        ID (slug)
                      </label>
                      <input
                        type="text"
                        value={item.id}
                        onChange={(e) => handleUpdateItem(idx, 'id', e.target.value.toLowerCase())}
                        placeholder="e.g. refund_notice"
                        className={`mt-1 block w-full rounded-md border px-2.5 py-1.5 text-xs font-mono dark:bg-slate-900 dark:text-white ${
                          !isIdValid && item.id.trim()
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-300 dark:border-slate-700 focus:border-sky-500'
                        }`}
                      />
                    </div>

                    {/* Severity */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Severity
                      </label>
                      <select
                        value={item.severity}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'severity', e.target.value as DraftItem['severity'])
                        }
                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="BLOCKER">BLOCKER (Mandatory)</option>
                        <option value="MAJOR">MAJOR</option>
                        <option value="MINOR">MINOR</option>
                      </select>
                    </div>

                    {/* Polarity */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Polarity
                      </label>
                      <select
                        value={item.polarity}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'polarity', e.target.value as DraftItem['polarity'])
                        }
                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="MUST_HAVE">MUST_HAVE (Required)</option>
                        <option value="MUST_NOT_HAVE">MUST_NOT_HAVE (Prohibited)</option>
                      </select>
                    </div>
                  </div>

                  {/* Question / Condition Statement */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Evaluation Prompt / Verification Question (Max 200 chars)
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={item.question}
                      onChange={(e) => handleUpdateItem(idx, 'question', e.target.value)}
                      placeholder="e.g. Terms include explicit 14-day cancellation window without penalty"
                      className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Derived ID Preview */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/40 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-sky-900 dark:text-sky-200">
                  Derived Checklist ID (SHA-256):
                </span>
                <HelpCircle className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              <p className="text-[11px] text-sky-700 dark:text-sky-300">
                Generated deterministically on-chain from sorted items.
              </p>
            </div>
            <div className="font-mono text-sm font-extrabold text-sky-900 dark:text-sky-100 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800">
              {previewChecklistId || '---- invalid items ----'}
            </div>
          </div>

          {/* Validation Warnings */}
          {validationErrors.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300 space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>Please correct the following:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Writes to FullRead Intelligent Contract on GenLayer studionet.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            {!hasWallet ? (
              <button
                type="button"
                onClick={onConnectWallet}
                className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500"
              >
                Connect Wallet to Register
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onRegister(name, items)}
                disabled={!isValid || isRegistering}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isRegistering ? 'Registering on-chain...' : 'Register Checklist on Studionet'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
