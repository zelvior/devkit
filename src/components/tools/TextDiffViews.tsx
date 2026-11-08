import React, { useState, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  convertCase,
  CaseType,
  countText,
  TextStatistics,
  computeDiff,
  DiffLine,
  removeDuplicateLines,
  sortTextLines,
  SortMode,
  SortOrder,
} from '../../lib/tools/textDiff';
import { CopyButton } from '../ui/CopyButton';
import { Trash2, Columns, AlignJustify, ArrowUpDown } from 'lucide-react';

type DiffRow = { left: DiffLine | null; right: DiffLine | null };

/**
 * Pair consecutive removed/added runs into aligned left/right rows so the
 * side-by-side view keeps both columns in sync line-for-line.
 */
function toSideBySideRows(lines: DiffLine[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let removed: DiffLine[] = [];
  let added: DiffLine[] = [];

  const flush = () => {
    const count = Math.max(removed.length, added.length);
    for (let i = 0; i < count; i++) {
      rows.push({ left: removed[i] ?? null, right: added[i] ?? null });
    }
    removed = [];
    added = [];
  };

  lines.forEach((line) => {
    if (line.type === 'removed') {
      removed.push(line);
    } else if (line.type === 'added') {
      added.push(line);
    } else {
      flush();
      rows.push({ left: line, right: line });
    }
  });
  flush();

  return rows;
}

export const TextDiffViews: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [input, setInput] = useState(tool.sampleInput || '');
  const [secondaryInput, setSecondaryInput] = useState(tool.sampleSecondaryInput || '');
  const [output, setOutput] = useState('');

  // Case converter states
  const [activeCase, setActiveCase] = useState<CaseType>('camel');

  // Diff checker states
  const [diffViewMode, setDiffViewMode] = useState<'split' | 'unified'>('split');
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);

  // Duplicate lines state
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(false);
  const [removedCount, setRemovedCount] = useState(0);

  // Sorter state
  const [sortMode, setSortMode] = useState<SortMode>('alpha');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [removeEmpty, setRemoveEmpty] = useState(false);

  // Word counter stats
  const [stats, setStats] = useState<TextStatistics>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    lines: 0,
    paragraphs: 0,
    readingTimeMinutes: 0,
  });

  useEffect(() => {
    setInput(tool.sampleInput || '');
    setSecondaryInput(tool.sampleSecondaryInput || '');
  }, [tool.id]);

  useEffect(() => {
    if (tool.id === 'text-case-converter') {
      setOutput(convertCase(input, activeCase));
    } else if (tool.id === 'word-counter') {
      setStats(countText(input));
    } else if (tool.id === 'text-diff-checker') {
      setDiffLines(computeDiff(input, secondaryInput));
    } else if (tool.id === 'duplicate-line-remover') {
      const res = removeDuplicateLines(input, caseSensitive, trimLines);
      setOutput(res.output);
      setRemovedCount(res.removedCount);
    } else if (tool.id === 'text-sorter') {
      setOutput(sortTextLines(input, sortMode, sortOrder, removeEmpty));
    }
  }, [
    input,
    secondaryInput,
    tool.id,
    activeCase,
    caseSensitive,
    trimLines,
    sortMode,
    sortOrder,
    removeEmpty,
  ]);

  const handleClear = () => {
    setInput('');
    setSecondaryInput('');
    setOutput('');
  };

  // Case converter view
  if (tool.id === 'text-case-converter') {
    const cases: { type: CaseType; label: string }[] = [
      { type: 'upper', label: 'UPPERCASE' },
      { type: 'lower', label: 'lowercase' },
      { type: 'title', label: 'Title Case' },
      { type: 'sentence', label: 'Sentence case' },
      { type: 'camel', label: 'camelCase' },
      { type: 'pascal', label: 'PascalCase' },
      { type: 'snake', label: 'snake_case' },
      { type: 'kebab', label: 'kebab-case' },
      { type: 'constant', label: 'CONSTANT_CASE' },
    ];

    return (
      <div className="space-y-4">
        {/* Case selector buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg">
          {cases.map((c) => (
            <button
              key={c.type}
              onClick={() => setActiveCase(c.type)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
                activeCase === c.type
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {c.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleClear} className="text-xs text-neutral-500 hover:text-red-500">
              Clear
            </button>
            <CopyButton textToCopy={output} label="Copy Output" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 font-medium">
              Source Text
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to convert..."
              rows={12}
              className="w-full p-4 font-sans text-sm text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
            />
          </div>

          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 font-medium">
              Transformed Text ({activeCase})
            </div>
            <textarea
              readOnly
              value={output}
              rows={12}
              className="w-full p-4 font-mono text-sm text-neutral-900 dark:text-neutral-100 bg-neutral-50/40 dark:bg-neutral-950/40 resize-y focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  // Word counter view
  if (tool.id === 'word-counter') {
    return (
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Words', value: stats.words },
            { label: 'Characters', value: stats.characters },
            { label: 'No Spaces', value: stats.charactersNoSpaces },
            { label: 'Lines', value: stats.lines },
            { label: 'Paragraphs', value: stats.paragraphs },
            { label: 'Reading Time', value: `~${stats.readingTimeMinutes} min` },
          ].map((m) => (
            <div
              key={m.label}
              className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center"
            >
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
                {m.value}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 uppercase font-medium tracking-wide">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 font-medium">
            <span>Text Content for Analysis</span>
            <div className="flex items-center gap-3">
              <button onClick={handleClear} className="hover:text-red-500">
                Clear
              </button>
              <CopyButton textToCopy={input} label="Copy Text" />
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to inspect words, character count, and reading metrics..."
            rows={14}
            className="w-full p-4 font-sans text-sm text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // Text diff checker view
  if (tool.id === 'text-diff-checker') {
    return (
      <div className="space-y-4">
        {/* Diff view switch */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setDiffViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                diffViewMode === 'split'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setDiffViewMode('unified')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                diffViewMode === 'unified'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span>Unified Diff</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
              + {diffLines.filter((l) => l.type === 'added').length} additions
            </span>
            <span className="flex items-center gap-1 font-mono text-rose-600 dark:text-rose-400">
              - {diffLines.filter((l) => l.type === 'removed').length} deletions
            </span>
            <button onClick={handleClear} className="text-neutral-500 hover:text-red-500 ml-2">
              Clear
            </button>
          </div>
        </div>

        {/* Input Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Original Text (Old)
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste original text..."
              rows={8}
              className="w-full p-3 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
            />
          </div>

          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Modified Text (New)
            </div>
            <textarea
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value)}
              placeholder="Paste updated text..."
              rows={8}
              className="w-full p-3 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
            />
          </div>
        </div>

        {/* Diff Result Visualizer */}
        <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <span>Visual Diff Output ({diffViewMode === 'split' ? 'Side-by-Side' : 'Unified'})</span>
            <CopyButton
              textToCopy={diffLines.map((l) => (l.type === 'added' ? `+ ${l.value}` : l.type === 'removed' ? `- ${l.value}` : `  ${l.value}`)).join('\n')}
              label="Copy Diff Patch"
            />
          </div>

          <div className="p-3 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
            {diffLines.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">Enter text above to compute diff</div>
            ) : diffViewMode === 'split' ? (
              <div className="min-w-[560px] space-y-0.5">
                <div className="grid grid-cols-2 gap-3 pb-1.5 mb-1.5 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                  <span>Original</span>
                  <span>Modified</span>
                </div>
                {toSideBySideRows(diffLines).map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3 items-stretch">
                    {[
                      { line: row.left, numKey: 'oldLineNumber' as const, tint: 'bg-rose-500/10 text-rose-800 dark:text-rose-300' },
                      { line: row.right, numKey: 'newLineNumber' as const, tint: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' },
                    ].map(({ line, numKey, tint }, cellIdx) => (
                      <div
                        key={cellIdx}
                        className={`flex items-start gap-2 px-2 py-0.5 rounded min-w-0 ${
                          line === null
                            ? 'bg-neutral-100/70 dark:bg-neutral-800/40'
                            : line.type === 'unchanged'
                            ? 'text-neutral-700 dark:text-neutral-400'
                            : tint
                        }`}
                      >
                        <span className="w-8 shrink-0 text-right text-neutral-400 select-none text-[10px] tabular-nums">
                          {line ? line[numKey] || '' : ''}
                        </span>
                        <span className="min-w-0 flex-1 whitespace-pre-wrap break-all">{line ? line.value : '\u00a0'}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/40">
                {diffLines.map((line, idx) => {
                  const isAdded = line.type === 'added';
                  const isRemoved = line.type === 'removed';

                  return (
                    <div
                      key={idx}
                      className={`flex items-start py-0.5 px-2 rounded ${
                        isAdded
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                          : isRemoved
                          ? 'bg-rose-500/10 text-rose-800 dark:text-rose-300'
                          : 'text-neutral-700 dark:text-neutral-400'
                      }`}
                    >
                      <span className="w-10 shrink-0 text-neutral-400 select-none text-[10px]">
                        {line.oldLineNumber || ''}
                      </span>
                      <span className="w-10 shrink-0 text-neutral-400 select-none text-[10px]">
                        {line.newLineNumber || ''}
                      </span>
                      <span className="w-6 shrink-0 font-bold select-none">
                        {isAdded ? '+' : isRemoved ? '-' : ' '}
                      </span>
                      <span className="whitespace-pre-wrap break-all flex-1">{line.value || ' '}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Duplicate line remover & Text Sorter
  return (
    <div className="space-y-4">
      {/* Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs">
        {tool.id === 'duplicate-line-remover' ? (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded"
              />
              <span>Case Sensitive</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trimLines}
                onChange={(e) => setTrimLines(e.target.checked)}
                className="rounded"
              />
              <span>Trim Whitespace</span>
            </label>
            <span className="text-neutral-500 font-mono">Removed: {removedCount} duplicate lines</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Mode:</span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-xs"
              >
                <option value="alpha">Alphabetical</option>
                <option value="natural">Natural Sort</option>
                <option value="numeric">Numeric</option>
                <option value="length">Line Length</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Order:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-xs"
              >
                <option value="asc">Ascending (A-Z / 0-9)</option>
                <option value="desc">Descending (Z-A / 9-0)</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={removeEmpty}
                onChange={(e) => setRemoveEmpty(e.target.checked)}
                className="rounded"
              />
              <span>Remove Empty Lines</span>
            </label>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="text-neutral-500 hover:text-red-500 px-2 py-1">
            Clear
          </button>
          <CopyButton textToCopy={output} label="Copy Output" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
            Input Lines
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste text lines here..."
            rows={14}
            className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
          />
        </div>

        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
            Output
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Processed output will appear here..."
            rows={14}
            className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-neutral-50/40 dark:bg-neutral-950/40 resize-y focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
