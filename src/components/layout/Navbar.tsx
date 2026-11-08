import React from 'react';
import { Search, Sun, Moon, Laptop, Github, Shield, Menu, FileText, Database } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { PWAInstallButton } from '../ui/PWAInstallButton';
import { ThemeMode } from '../../lib/db';

interface NavbarProps {
  currentView: string;
  themeMode: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  onCycleTheme: () => void;
  onOpenSearch: () => void;
  onNavigateHome: () => void;
  onNavigateAllTools: () => void;
  onNavigateCategories: () => void;
  onOpenAbout: () => void;
  onOpenSnippets?: () => void;
  onOpenData?: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  themeMode,
  resolvedTheme,
  onCycleTheme,
  onOpenSearch,
  onNavigateHome,
  onNavigateAllTools,
  onNavigateCategories,
  onOpenAbout,
  onOpenSnippets,
  onOpenData,
  onToggleSidebar,
}) => {
  const getThemeIcon = () => {
    if (themeMode === 'system') {
      return <Laptop className="w-3.5 h-3.5" />;
    }
    return resolvedTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />;
  };

  const getThemeTitle = () => {
    if (themeMode === 'system') return 'Theme: System auto-detect (click to switch to Dark)';
    if (themeMode === 'dark') return 'Theme: Dark mode (click to switch to Light)';
    return 'Theme: Light mode (click to switch to System)';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 h-14">
        {/* Zone 1: Brand Wordmark + Mobile menu trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 -ml-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left group transition-transform focus-visible:outline-none"
          >
            <BrandLogo variant="symbol" size="sm" />
            <div className="flex flex-col leading-none">
              <span className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                Zelvior DevKit
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Labs Utility Suite
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Primary nav links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <button
            onClick={onNavigateHome}
            className={`transition-colors whitespace-nowrap hover:text-neutral-900 dark:hover:text-white ${
              currentView === 'home' ? 'text-neutral-950 dark:text-white font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={onNavigateAllTools}
            className={`transition-colors whitespace-nowrap hover:text-neutral-900 dark:hover:text-white ${
              currentView === 'all-tools' ? 'text-neutral-950 dark:text-white font-semibold' : ''
            }`}
          >
            All Tools (41)
          </button>
          <button
            onClick={onNavigateCategories}
            className={`transition-colors whitespace-nowrap hover:text-neutral-900 dark:hover:text-white ${
              currentView === 'categories' ? 'text-neutral-950 dark:text-white font-semibold' : ''
            }`}
          >
            Categories
          </button>
          {onOpenSnippets && (
            <button
              onClick={onOpenSnippets}
              className="transition-colors whitespace-nowrap hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Snippets</span>
            </button>
          )}
          {onOpenData && (
            <button
              onClick={onOpenData}
              className="transition-colors whitespace-nowrap hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Storage</span>
            </button>
          )}
          <button
            onClick={onOpenAbout}
            className="transition-colors whitespace-nowrap hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Privacy</span>
          </button>
        </nav>

        {/* Zone 3: Search + PWA + Theme Toggle + GitHub */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-800 rounded-md transition-colors"
            title="Search utilities (Ctrl+K or Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search tools...</span>
            <kbd className="hidden md:inline-block font-mono text-[10px] px-1 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-300 dark:border-neutral-700">
              ⌘K
            </kbd>
          </button>

          {/* In-App PWA Install Trigger */}
          <PWAInstallButton compact={true} />

          {/* 3-State Theme Toggle */}
          <button
            onClick={onCycleTheme}
            className="p-1.5 sm:px-2 sm:py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors flex items-center gap-1.5"
            aria-label="Toggle theme mode"
            title={getThemeTitle()}
          >
            {getThemeIcon()}
            <span className="hidden xl:inline text-[10px] font-mono capitalize text-neutral-500 dark:text-neutral-400">
              {themeMode}
            </span>
          </button>

          <a
            href="https://github.com/zelvior/devkit"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors"
            aria-label="GitHub Repository"
            title="Zelvior DevKit GitHub repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
