import React from 'react';
import { ShieldCheck, Github, Terminal, Database, FileText, Lock, Scale } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenSecurity?: () => void;
  onOpenStorage?: () => void;
  onOpenLicense?: () => void;
  onOpenShortcuts: () => void;
  onOpenData?: () => void;
  onOpenSnippets?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenSecurity,
  onOpenStorage,
  onOpenLicense,
  onOpenShortcuts,
  onOpenData,
  onOpenSnippets,
}) => {
  return (
    <footer className="mt-20 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-500 dark:text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BrandLogo variant="symbol" size="sm" />
            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Zelvior DevKit
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
              v3.0 PWA
            </span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
            Everything developers need. Nothing they don't. 41 browser utilities engineered with privacy-first standards by Zelvior Labs.
          </p>
          <div className="flex items-center gap-2 mt-3 text-[11px] text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Zero network transmission · IndexedDB Local Persistence</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 font-medium">
          {onOpenSnippets && (
            <button
              onClick={onOpenSnippets}
              className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Snippets</span>
            </button>
          )}
          {onOpenData && (
            <button
              onClick={onOpenData}
              className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Storage & Backup</span>
            </button>
          )}
          <button
            onClick={onOpenPrivacy}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Privacy Policy
          </button>
          {onOpenSecurity && (
            <button
              onClick={onOpenSecurity}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Security</span>
            </button>
          )}
          {onOpenStorage && (
            <button
              onClick={onOpenStorage}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Cookie / Storage Notice
            </button>
          )}
          <button
            onClick={onOpenTerms}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Terms of Service
          </button>
          {onOpenLicense && (
            <button
              onClick={onOpenLicense}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              MIT License
            </button>
          )}
          <button
            onClick={onOpenShortcuts}
            className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Shortcuts (⌘K)</span>
          </button>
          <a
            href="https://github.com/zelvior/devkit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      <div className="border-t border-neutral-100 dark:border-neutral-900 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
          <div>
            &copy; {new Date().getFullYear()} Zelvior Labs. Distributed under the permissive MIT License.
          </div>
          <div className="flex items-center gap-2">
            <span>Client-side only</span>
            <span>·</span>
            <span>Installable Offline PWA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
