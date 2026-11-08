import React from 'react';
import { CATEGORIES, TOOLS } from '../../config/tools';
import {
  Braces,
  FileDiff,
  Binary,
  ShieldCheck,
  Globe,
  Palette,
  Clock,
  Wrench,
  Star,
  History,
  Trash2,
  ChevronDown,
  ChevronRight,
  Flame,
  X,
  FileText,
  Database,
} from 'lucide-react';
import { purgeAllData } from '../../lib/db';
import { useToast } from '../ui/Toast';
import { PWAInstallButton } from '../ui/PWAInstallButton';

interface SidebarProps {
  activeToolId?: string;
  activeCategoryId?: string;
  favoriteIds: string[];
  recentIds: string[];
  isOpen: boolean;
  onCloseMobile: () => void;
  onSelectTool: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onClearStorage: () => void;
  onOpenSnippets?: () => void;
  onOpenData?: () => void;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Braces,
  FileDiff,
  Binary,
  ShieldCheck,
  Globe,
  Palette,
  Clock,
  Wrench,
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeToolId,
  activeCategoryId,
  favoriteIds,
  recentIds,
  isOpen,
  onCloseMobile,
  onSelectTool,
  onSelectCategory,
  onClearStorage,
  onOpenSnippets,
  onOpenData,
}) => {
  const { showToast } = useToast();
  const isCollapsed = !isOpen;
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({
    'json-data': true,
    'text-diff': true,
    'web-dev': true,
  });

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handlePurge = async () => {
    if (confirm('Clear all favorites, recent tools, and local preferences from IndexedDB?')) {
      await purgeAllData();
      onClearStorage();
      showToast('Local IndexedDB storage purged');
    }
  };

  const favoriteTools = TOOLS.filter((t) => favoriteIds.includes(t.id));
  const recentTools = recentIds.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean) as typeof TOOLS;

  // Off-canvas drawer below `lg`, an in-flow sticky rail from `lg` up.
  // Every class is a literal string so Tailwind can statically detect it.
  const railClasses = [
    'group fixed lg:sticky top-14 bottom-0 lg:bottom-auto lg:h-[calc(100vh_-_3.5rem)]',
    'left-0 z-30 shrink-0 border-r border-neutral-200 dark:border-neutral-800',
    'bg-neutral-50 dark:bg-neutral-950 overflow-y-auto overscroll-contain flex flex-col',
    'transition-all duration-300 ease-in-out w-72',
    isOpen ? 'translate-x-0' : '-translate-x-full',
    'lg:translate-x-0',
    isOpen ? 'lg:w-72' : 'lg:w-16',
  ].join(' ');

  return (
    <>
      {/* Mobile Backdrop */}

      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-xs animate-overlay-in"
        />
      )}

      <aside data-collapsed={isCollapsed ? 'true' : 'false'} className={railClasses} aria-label="Utility navigation">
        {/* Mobile Header in Drawer (visible whenever the rail renders as a drawer) */}
        <div className="flex lg:hidden shrink-0 items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
            All Utilities (41)
          </span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-neutral-500 hover:text-neutral-950 dark:hover:text-white rounded-md"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-5 text-xs">
          {/* Quick Access Tools & Data */}
          <div className="group-data-[collapsed=true]:lg:hidden">
            <div className="px-2 mb-1.5 font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider text-[10px]">
              Workspace Tools
            </div>
            <div className="flex flex-col gap-0.5">
              {onOpenSnippets && (
                <button
                  onClick={() => {
                    onOpenSnippets();
                    onCloseMobile();
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-900 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="group-data-[collapsed=true]:lg:hidden">Saved Snippets</span>
                </button>
              )}
              {onOpenData && (
                <button
                  onClick={() => {
                    onOpenData();
                    onCloseMobile();
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-900 transition-colors"
                >
                  <Database className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="group-data-[collapsed=true]:lg:hidden">Data & Backups</span>
                </button>
              )}
            </div>
          </div>

          {/* Favorites (if any) */}
          <div className={`group-data-[collapsed=true]:lg:hidden ${favoriteTools.length === 0 ? 'hidden' : ''}`}>
            <div className="flex items-center gap-1.5 px-2 mb-2 font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider text-[10px]">
              <Star className="w-3 h-3 text-amber-500" />
              <span className="group-data-[collapsed=true]:lg:hidden">Favorites</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {favoriteTools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTool(t.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors truncate ${
                    activeToolId === t.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-900'
                  }`}
                >
                  <span className="truncate group-data-[collapsed=true]:lg:hidden">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recently Used (if any) */}
          <div className={`group-data-[collapsed=true]:lg:hidden ${recentTools.length === 0 ? 'hidden' : ''}`}>
            <div className="flex items-center gap-1.5 px-2 mb-2 font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider text-[10px]">
              <History className="w-3 h-3 text-neutral-400" />
              <span className="group-data-[collapsed=true]:lg:hidden">Recently Used</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {recentTools.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTool(t.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors truncate ${
                    activeToolId === t.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-900'
                  }`}
                >
                  <span className="truncate group-data-[collapsed=true]:lg:hidden">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Fast Access */}
          <div className="group-data-[collapsed=true]:lg:hidden">
            <div className="flex items-center gap-1.5 px-2 mb-2 font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider text-[10px]">
              <Flame className="w-3 h-3 text-neutral-500" />
              <span className="group-data-[collapsed=true]:lg:hidden">Popular Utilities</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {TOOLS.filter((t) => t.isPopular).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTool(t.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors truncate ${
                    activeToolId === t.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-900'
                  }`}
                >
                  <span className="truncate group-data-[collapsed=true]:lg:hidden">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categories and Tools List */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2 font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider text-[10px]">
              <span className="group-data-[collapsed=true]:lg:hidden">Categories ({CATEGORIES.length})</span>
            </div>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat.icon] || Wrench;
                const catTools = TOOLS.filter((t) => t.category === cat.id);
                const isExpanded = expandedCategories[cat.id] ?? false;
                const isCurrentCategory = activeCategoryId === cat.id;

                return (
                  <div key={cat.id} className="flex flex-col">
                    <div
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer group-data-[collapsed=true]:lg:justify-center group-data-[collapsed=true]:lg:px-1 ${
                        isCurrentCategory
                          ? 'bg-neutral-200 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-900'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectCategory(cat.id);
                          onCloseMobile();
                        }}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        <IconComponent className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate group-data-[collapsed=true]:lg:hidden">{cat.name}</span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-mono group-data-[collapsed=true]:lg:hidden">
                          {catTools.length}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategoryExpand(cat.id);
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 group-data-[collapsed=true]:lg:hidden" 
                        aria-label="Toggle category list"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Sub-tools (hidden when the rail is collapsed) */}
                    {isExpanded && !isCollapsed && (
                      <div className="ml-4 pl-2 border-l border-neutral-200 dark:border-neutral-800 flex flex-col gap-0.5 mt-0.5 mb-1">
                        {catTools.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              onSelectTool(t.id);
                              onCloseMobile();
                            }}
                            className={`px-2 py-1 text-left rounded text-[11px] truncate transition-colors ${
                              activeToolId === t.id
                                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-200'
                            }`}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* PWA & Privacy & Purge Footer in Sidebar */}
          <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2 group-data-[collapsed=true]:lg:hidden">
            <PWAInstallButton />
            <button
              onClick={handlePurge}
              className="flex items-center gap-2 px-2.5 py-1.5 w-full text-left text-neutral-500 hover:text-red-500 rounded-md transition-colors text-[11px]"
              title="Clear all IndexedDB storage data"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span className="group-data-[collapsed=true]:lg:hidden">Purge IndexedDB</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
