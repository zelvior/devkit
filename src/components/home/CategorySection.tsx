import React, { useEffect, useState } from 'react';
import { CATEGORIES, TOOLS } from '../../config/tools';
import { ToolCategory, ToolDefinition } from '../../types';
import { Search, ArrowRight, Star } from 'lucide-react';

interface CategorySectionProps {
  onSelectTool: (id: string) => void;
  selectedCategoryFilter?: string;
  onFilterCategoryChange?: (catId: string) => void;
  favoriteIds: string[];
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  onSelectTool,
  selectedCategoryFilter = 'all',
  onFilterCategoryChange,
  favoriteIds,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategoryFilter);

  // Keep the tab strip in sync when the category is changed from outside this
  // component (sidebar navigation or a #/category/<id> deep link).
  useEffect(() => {
    setActiveCategory(selectedCategoryFilter);
  }, [selectedCategoryFilter]);
  const [searchFilter, setSearchFilter] = useState('');

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    if (onFilterCategoryChange) {
      onFilterCategoryChange(catId);
    }
  };

  const displayedTools: ToolDefinition[] = TOOLS.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    if (!matchesCategory) return false;

    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <section className="py-12 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            All Utilities Directory ({TOOLS.length})
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Browse the complete {TOOLS.length}-tool developer utility catalog.
          </p>
        </div>

        {/* Live Directory Search Filter */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter list..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900/80 rounded-lg border border-neutral-200 dark:border-neutral-800 mb-8 overflow-x-auto">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeCategory === 'all'
              ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
          }`}
        >
          All ({TOOLS.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = TOOLS.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              {cat.shortName} ({count})
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      {displayedTools.length === 0 ? (
        <div className="text-center py-12 text-sm text-neutral-500 dark:text-neutral-400">
          No utilities match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTools.map((tool) => {
            const isFav = favoriteIds.includes(tool.id);
            const cat = CATEGORIES.find((c) => c.id === tool.category);

            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="p-5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-white transition-colors">
                      {tool.name}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isFav && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />}
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 font-mono">
                  <span>{cat?.shortName || tool.category}</span>
                  {tool.isPopular ? (
                    <span className="text-neutral-700 dark:text-neutral-300 font-sans font-medium">Popular</span>
                  ) : (
                    <span>Client-Side</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
