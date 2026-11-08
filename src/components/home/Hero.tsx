import React from 'react';
import { Search, ShieldCheck, Zap, Lock } from 'lucide-react';
import { CATEGORIES } from '../../config/tools';
import { BrandLogo } from '../ui/BrandLogo';

interface HeroProps {
  onOpenSearch: () => void;
  onSelectCategory: (catId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenSearch, onSelectCategory }) => {
  return (
    <section className="relative pt-12 pb-16 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-4xl mx-auto text-center px-4">
        {/* Brand Kicker with vector symbol */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-6 tracking-wide">
          <BrandLogo variant="symbol" size="sm" className="w-3.5 h-3.5" />
          <span>Zelvior Labs</span>
          <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
          <span>Open Source</span>
          <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
          <span>IndexedDB-First</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.1] mb-6 text-balance">
          Everything developers need.
          <br />
          <span className="text-neutral-500 dark:text-neutral-400">Nothing they don't.</span>
        </h1>

        {/* Supporting text */}
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
          A collection of 41 fast, privacy-first developer utilities that execute 100% locally in your browser. No telemetry, no accounts, and no data leaks.
        </p>

        {/* Search Bar Action Button */}
        <div className="max-w-xl mx-auto mb-10">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 hover:border-neutral-400 dark:hover:border-neutral-700 shadow-xs hover:shadow-md transition-all group text-left"
          >
            <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-500 text-sm">
              <Search className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
              <span className="text-neutral-500 dark:text-neutral-400">Search by tool name, format, or task...</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="font-mono text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-700">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Quick Access Category Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800/80 bg-neutral-100/70 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Core Principles Strip */}
        <div className="mt-12 pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Zero Server Transmission</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Your code, JSON, and secrets never touch any backend server.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-neutral-400 dark:text-neutral-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Instant Execution</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Engineered with native Web APIs for instantaneous processing.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-neutral-400 dark:text-neutral-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Cryptographically Sound</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Utilizes W3C Web Crypto API with high-entropy RNG.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
