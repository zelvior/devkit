import React from 'react';
import { ToolDefinition } from '../../types';
import { CATEGORIES } from '../../config/tools';
import { PrivacyBadge } from './PrivacyBadge';
import { Star, RotateCcw, FileText, ChevronRight } from 'lucide-react';

interface ToolHeaderProps {
  tool: ToolDefinition;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onReset?: () => void;
  onLoadSample?: () => void;
  onNavigateHome: () => void;
  onNavigateCategory: (catId: string) => void;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  tool,
  isFavorite,
  onToggleFavorite,
  onReset,
  onLoadSample,
  onNavigateHome,
  onNavigateCategory,
}) => {
  const category = CATEGORIES.find((c) => c.id === tool.category);

  return (
    <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
      {/* Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-3 font-medium">
        <button
          onClick={onNavigateHome}
          className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          DevKit
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600" />
        <button
          onClick={() => onNavigateCategory(tool.category)}
          className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          {category?.name || tool.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600" />
        <span className="text-neutral-900 dark:text-neutral-200 truncate">{tool.name}</span>
      </nav>

      {/* Main Title Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {tool.name}
            </h1>
            <button
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-md transition-colors border ${
                isFavorite
                  ? 'border-amber-400/40 text-amber-500 bg-amber-400/10'
                  : 'border-neutral-300 dark:border-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Toggle favorite"
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
          <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            {tool.description}
          </p>
          <div className="mt-2.5">
            <PrivacyBadge />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {tool.sampleInput && onLoadSample && (
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
              title="Fill inputs with sample developer payload"
            >
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              <span>Load Sample</span>
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
              title="Clear input and reset options"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
