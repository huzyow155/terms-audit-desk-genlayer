import React from 'react';
import { ShieldCheck, ExternalLink, HelpCircle, Sun, Moon } from 'lucide-react';
import { DEPLOYMENT_CONFIG } from '../config/deployment';

interface HeaderProps {
  onOpenAbout: () => void;
  walletAddress?: string | null;
  isConnecting?: boolean;
  onConnectWallet?: () => void;
  onDisconnectWallet?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAbout,
  walletAddress,
  isConnecting,
  onConnectWallet,
  onDisconnectWallet,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm ring-1 ring-sky-700/20">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Terms Audit Desk
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                studionet
              </span>
            </div>
            <p className="hidden text-xs text-slate-600 sm:block dark:text-slate-400">
              Whole-document compliance verified by GenLayer Intelligent Contract consensus
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenAbout}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="About Terms Audit Desk and methodology"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">How It Works</span>
          </button>

          <a
            href={`${DEPLOYMENT_CONFIG.explorerUrl}/address/${DEPLOYMENT_CONFIG.fullReadAddress}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="View FullRead contract on GenLayer Studio Explorer"
          >
            <span className="hidden md:inline">Contract</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Wallet Button */}
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              {onDisconnectWallet && (
                <button
                  type="button"
                  onClick={onDisconnectWallet}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Disconnect
                </button>
              )}
            </div>
          ) : (
            onConnectWallet && (
              <button
                type="button"
                onClick={onConnectWallet}
                disabled={isConnecting}
                className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-60"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
