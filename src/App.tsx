import React, { useState, useEffect, useCallback } from 'react';
import { TOOLS } from './config/tools';
import { ToolDefinition } from './types';
import {
  getStoredThemeMode,
  setStoredThemeMode,
  ThemeMode,
  getRecentTools,
  addRecentTool,
  getFavorites,
  toggleFavorite,
} from './lib/db';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { CommandPalette } from './components/search/CommandPalette';
import { Hero } from './components/home/Hero';
import { BentoGrid } from './components/home/BentoGrid';
import { CategorySection } from './components/home/CategorySection';
import { ToolHeader } from './components/ui/ToolHeader';
import { JsonDataViews } from './components/tools/JsonDataViews';
import { TextDiffViews } from './components/tools/TextDiffViews';
import { EncodingViews } from './components/tools/EncodingViews';
import { SecurityViews } from './components/tools/SecurityViews';
import { WebDevViews } from './components/tools/WebDevViews';
import { CssDesignViews } from './components/tools/CssDesignViews';
import { TimeDateViews } from './components/tools/TimeDateViews';
import { DevUtilsViews } from './components/tools/DevUtilsViews';
import { SnippetsModal } from './components/modals/SnippetsModal';
import { DataManagerModal } from './components/modals/DataManagerModal';
import { LegalModal, LegalTab } from './components/modals/LegalModal';
import { Menu, ArrowLeft } from 'lucide-react';

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'home' | 'all-tools' | 'categories' | 'tool' | 'not-found'>('home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [snippetsOpen, setSnippetsOpen] = useState(false);
  const [dataManagerOpen, setDataManagerOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalActiveTab, setLegalActiveTab] = useState<LegalTab>('privacy');
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Resolve actual theme based on themeMode & OS preferences
  const updateDocumentTheme = useCallback((mode: ThemeMode) => {
    let active: 'dark' | 'light' = 'dark';
    if (mode === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      active = prefersDark ? 'dark' : 'light';
    } else {
      active = mode;
    }

    setResolvedTheme(active);
    const root = document.documentElement;
    if (active === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Hydrate preferences from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;

    async function initStorage() {
      try {
        const [savedMode, favs, recent] = await Promise.all([
          getStoredThemeMode(),
          getFavorites(),
          getRecentTools(),
        ]);

        if (isMounted) {
          setThemeMode(savedMode);
          updateDocumentTheme(savedMode);
          setFavoriteIds(favs);
          setRecentToolIds(recent);
        }
      } catch (err) {
        console.error('IndexedDB initialization notice:', err);
        if (isMounted) updateDocumentTheme('system');
      }
    }

    initStorage();

    // OS color scheme change listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      setStoredThemeMode(themeMode).then(() => {
        if (themeMode === 'system') updateDocumentTheme('system');
      });
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      isMounted = false;
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, [themeMode, updateDocumentTheme]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHash = async () => {
      const hash = window.location.hash;

      // Legal & Compliance deep-links
      if (
        hash.startsWith('#/legal') ||
        hash === '#/privacy' ||
        hash === '#/terms' ||
        hash === '#/security' ||
        hash === '#/license' ||
        hash === '#/storage'
      ) {
        let tab: LegalTab = 'privacy';
        if (hash.includes('terms')) tab = 'terms';
        else if (hash.includes('security')) tab = 'security';
        else if (hash.includes('storage')) tab = 'storage';
        else if (hash.includes('license')) tab = 'license';
        else if (hash.includes('shortcuts')) tab = 'shortcuts';

        setLegalActiveTab(tab);
        setLegalModalOpen(true);
        return;
      }

      if (hash.startsWith('#/tools/')) {
        const id = hash.replace('#/tools/', '');
        const exists = TOOLS.some((t) => t.id === id);
        if (exists) {
          setActiveToolId(id);
          setCurrentView('tool');
          const updatedRecent = await addRecentTool(id);
          setRecentToolIds(updatedRecent);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        } else {
          setActiveToolId(id);
          setCurrentView('not-found');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } else if (hash.startsWith('#/category/')) {
        const catId = hash.replace('#/category/', '');
        setActiveCategoryId(catId);
        setCurrentView('categories');
        setActiveToolId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else if (hash === '#/all-tools') {
        setCurrentView('all-tools');
        setActiveCategoryId('all');
        setActiveToolId(null);
        return;
      }

      // Default: home view
      setActiveToolId(null);
      setCurrentView('home');
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    // Global Cmd+K / Ctrl+K keyboard shortcut listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCycleTheme = async () => {
    let next: ThemeMode = 'dark';
    if (themeMode === 'system') next = 'dark';
    else if (themeMode === 'dark') next = 'light';
    else if (themeMode === 'light') next = 'system';

    setThemeMode(next);
    updateDocumentTheme(next);
    await setStoredThemeMode(next);
  };

  const handleSelectTool = async (toolId: string) => {
    window.location.hash = `#/tools/${toolId}`;
    setActiveToolId(toolId);
    setCurrentView('tool');
    const updated = await addRecentTool(toolId);
    setRecentToolIds(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catId: string) => {
    window.location.hash = `#/category/${catId}`;
    setActiveCategoryId(catId);
    setCurrentView('categories');
    setActiveToolId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    window.location.hash = '#/';
    setActiveToolId(null);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAllTools = () => {
    window.location.hash = '#/all-tools';
    setActiveToolId(null);
    setActiveCategoryId('all');
    setCurrentView('all-tools');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (id: string) => {
    const updated = await toggleFavorite(id);
    setFavoriteIds(updated);
  };

  const reloadPersistentState = async () => {
    const [favs, recent] = await Promise.all([getFavorites(), getRecentTools()]);
    setFavoriteIds(favs);
    setRecentToolIds(recent);
  };

  const openLegalModal = (tab: LegalTab) => {
    setLegalActiveTab(tab);
    setLegalModalOpen(true);
    window.location.hash = `#/legal/${tab}`;
  };

  const closeLegalModal = () => {
    setLegalModalOpen(false);
    if (window.location.hash.startsWith('#/legal') || window.location.hash === '#/privacy') {
      window.location.hash = activeToolId ? `#/tools/${activeToolId}` : '#/';
    }
  };

  const currentTool = TOOLS.find((t) => t.id === activeToolId);

  // Render appropriate tool view
  const renderToolComponent = (tool: ToolDefinition) => {
    switch (tool.category) {
      case 'json-data':
        return <JsonDataViews tool={tool} onNavigateTool={handleSelectTool} />;
      case 'text-diff':
        return <TextDiffViews tool={tool} />;
      case 'encoding':
        return <EncodingViews tool={tool} />;
      case 'security':
        return <SecurityViews tool={tool} />;
      case 'web-dev':
        return <WebDevViews tool={tool} />;
      case 'css-design':
        return <CssDesignViews tool={tool} />;
      case 'time-date':
        return <TimeDateViews tool={tool} />;
      case 'dev-utilities':
        return <DevUtilsViews tool={tool} onNavigateTool={handleSelectTool} />;
      default:
        return <div className="p-4 text-xs">Tool view unavailable.</div>;
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-150">
        {/* Navigation Top Bar */}
        <Navbar
          currentView={currentView}
          themeMode={themeMode}
          resolvedTheme={resolvedTheme}
          onCycleTheme={handleCycleTheme}
          onOpenSearch={() => setSearchOpen(true)}
          onNavigateHome={handleNavigateHome}
          onNavigateAllTools={handleNavigateAllTools}
          onNavigateCategories={() => {
            setActiveCategoryId('all');
            setCurrentView('categories');
          }}
          onOpenSnippets={() => setSnippetsOpen(true)}
          onOpenData={() => setDataManagerOpen(true)}
          onOpenAbout={() => openLegalModal('privacy')}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Mobile Header Sub-bar for Sidebar Drawer */}
        <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 font-semibold py-1.5 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800"
          >
            <Menu className="w-4 h-4" />
            <span>All Utilities (41)</span>
          </button>
          {activeToolId && (
            <button
              onClick={handleNavigateHome}
              className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white py-1.5 px-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Directory</span>
            </button>
          )}
        </div>

        {/* Main Workspace Layout */}
        <div className="flex-1 flex w-full max-w-7xl mx-auto">
          {/* Collapsible Sidebar */}
          <Sidebar
            activeToolId={activeToolId || undefined}
            activeCategoryId={activeCategoryId}
            favoriteIds={favoriteIds}
            recentIds={recentToolIds}
            isOpen={sidebarOpen}
            onCloseMobile={() => setSidebarOpen(false)}
            onSelectTool={handleSelectTool}
            onSelectCategory={handleSelectCategory}
            onClearStorage={reloadPersistentState}
            onOpenSnippets={() => setSnippetsOpen(true)}
            onOpenData={() => setDataManagerOpen(true)}
          />

          {/* Main Viewport Content */}
          <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-6 w-full max-w-full overflow-x-hidden">
            {currentView === 'not-found' ? (
              <div className="py-16 text-center max-w-md mx-auto space-y-4">
                <div className="text-4xl font-extrabold font-mono text-neutral-400 dark:text-neutral-600">
                  404
                </div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Utility Not Found
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  The requested utility route &quot;{activeToolId}&quot; could not be found or has been relocated.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    Search 41 Utilities (⌘K)
                  </button>
                  <button
                    onClick={handleNavigateHome}
                    className="w-full sm:w-auto px-4 py-2 border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Browse Directory
                  </button>
                </div>
              </div>
            ) : currentView === 'tool' && currentTool ? (
              <div>
                <ToolHeader
                  tool={currentTool}
                  isFavorite={favoriteIds.includes(currentTool.id)}
                  onToggleFavorite={() => handleToggleFavorite(currentTool.id)}
                  onNavigateHome={handleNavigateHome}
                  onNavigateCategory={handleSelectCategory}
                />
                {renderToolComponent(currentTool)}
              </div>
            ) : currentView === 'categories' || currentView === 'all-tools' ? (
              <div>
                <CategorySection
                  onSelectTool={handleSelectTool}
                  selectedCategoryFilter={activeCategoryId}
                  onFilterCategoryChange={(cat) => setActiveCategoryId(cat)}
                  favoriteIds={favoriteIds}
                />
              </div>
            ) : (
              <div>
                <Hero
                  onOpenSearch={() => setSearchOpen(true)}
                  onSelectCategory={handleSelectCategory}
                />
                <BentoGrid
                  recentToolIds={recentToolIds}
                  onSelectTool={handleSelectTool}
                />
                <CategorySection
                  onSelectTool={handleSelectTool}
                  selectedCategoryFilter="all"
                  favoriteIds={favoriteIds}
                />
              </div>
            )}
          </main>
        </div>

        {/* Global Footer */}
        <Footer
          onOpenPrivacy={() => openLegalModal('privacy')}
          onOpenTerms={() => openLegalModal('terms')}
          onOpenSecurity={() => openLegalModal('security')}
          onOpenStorage={() => openLegalModal('storage')}
          onOpenLicense={() => openLegalModal('license')}
          onOpenShortcuts={() => openLegalModal('shortcuts')}
          onOpenSnippets={() => setSnippetsOpen(true)}
          onOpenData={() => setDataManagerOpen(true)}
        />

        {/* Command Palette Modal */}
        <CommandPalette
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelectTool={handleSelectTool}
        />

        {/* Snippets Manager Modal */}
        <SnippetsModal
          isOpen={snippetsOpen}
          onClose={() => setSnippetsOpen(false)}
        />

        {/* Data & IndexedDB Backup Manager Modal */}
        <DataManagerModal
          isOpen={dataManagerOpen}
          onClose={() => setDataManagerOpen(false)}
          onDataReset={reloadPersistentState}
        />

        {/* Unified Legal & Compliance Center Modal */}
        <LegalModal
          isOpen={legalModalOpen}
          initialTab={legalActiveTab}
          onClose={closeLegalModal}
          onSelectTab={(tab) => setLegalActiveTab(tab)}
        />
      </div>
    </ToastProvider>
  );
}
