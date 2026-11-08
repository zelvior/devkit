import React, { useState, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  testRegex,
  RegexTestResult,
  REGEX_LIBRARY,
  RegexPatternItem,
  renderMarkdownToSafeHtml,
  formatSql,
  parseUrl,
  ParsedUrlDetails,
  generateHtmlMetaTags,
  MetaTagOptions,
} from '../../lib/tools/devUtils';
import { CopyButton } from '../ui/CopyButton';
import { Download, AlertCircle, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface DevUtilsProps {
  tool: ToolDefinition;
  onNavigateTool?: (toolId: string) => void;
}

export const DevUtilsViews: React.FC<DevUtilsProps> = ({ tool, onNavigateTool }) => {
  const { showToast } = useToast();
  const [input, setInput] = useState(tool.sampleInput || '');
  const [secondaryInput, setSecondaryInput] = useState(tool.sampleSecondaryInput || '');
  const [output, setOutput] = useState('');

  // Regex Tester state
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexResult, setRegexResult] = useState<RegexTestResult | null>(null);

  // Markdown state
  const [markdownHtml, setMarkdownHtml] = useState('');

  // URL Parser state
  const [parsedUrl, setParsedUrl] = useState<ParsedUrlDetails | null>(null);

  // Meta Tag Generator state
  const [metaOptions, setMetaOptions] = useState<MetaTagOptions>({
    title: 'Zelvior DevKit – Privacy-First Developer Utilities Platform',
    description: 'Fast, privacy-first developer utilities that run 100% locally in your browser with zero telemetry.',
    canonicalUrl: 'https://zdevkit.vercel.app',
    ogImage: 'https://zdevkit.vercel.app/og-banner.png',
    twitterHandle: '@zelviorlabs',
    siteName: 'Zelvior DevKit',
  });

  useEffect(() => {
    setInput(tool.sampleInput || '');
    setSecondaryInput(tool.sampleSecondaryInput || '');
  }, [tool.id]);

  // Compute Regex
  useEffect(() => {
    if (tool.id === 'regex-tester') {
      setRegexResult(testRegex(input, regexFlags, secondaryInput));
    }
  }, [input, secondaryInput, regexFlags, tool.id]);

  // Compute Markdown
  useEffect(() => {
    if (tool.id === 'markdown-previewer') {
      setMarkdownHtml(renderMarkdownToSafeHtml(input));
    }
  }, [input, tool.id]);

  // Compute SQL
  useEffect(() => {
    if (tool.id === 'sql-formatter') {
      setOutput(formatSql(input, 2));
    }
  }, [input, tool.id]);

  // Compute URL Parser
  useEffect(() => {
    if (tool.id === 'url-parser') {
      setParsedUrl(parseUrl(input));
    }
  }, [input, tool.id]);

  // Compute Meta Tags
  useEffect(() => {
    if (tool.id === 'meta-tag-generator') {
      setOutput(generateHtmlMetaTags(metaOptions));
    }
  }, [metaOptions, tool.id]);

  // 1. Regex Tester View
  if (tool.id === 'regex-tester') {
    return (
      <div className="space-y-6">
        {/* Pattern input and flags */}
        <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Regular Expression Pattern
            </span>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Flags:</span>
              {(['g', 'i', 'm', 's', 'u'] as const).map((flag) => (
                <button
                  key={flag}
                  onClick={() =>
                    setRegexFlags((prev) =>
                      prev.includes(flag) ? prev.replace(flag, '') : prev + flag
                    )
                  }
                  className={`px-2 py-0.5 rounded font-mono text-xs font-semibold ${
                    regexFlags.includes(flag)
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center font-mono text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950">
            <span className="text-neutral-400 select-none mr-1.5">/</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter regex pattern (e.g. ([a-z]+)@([a-z]+))"
              className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
            <span className="text-neutral-400 select-none ml-1.5">/{regexFlags}</span>
          </div>

          {regexResult?.error && (
            <div className="text-xs text-red-500 font-mono flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{regexResult.error}</span>
            </div>
          )}
        </div>

        {/* Test String Input & Highlighted Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
              Test String
            </div>
            <textarea
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value)}
              placeholder="Paste test string here to match..."
              rows={10}
              className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
            />
          </div>

          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
              <span>Interactive Match Highlighting</span>
              <span className="font-mono">{regexResult?.count || 0} matches</span>
            </div>
            <div
              className="p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed text-neutral-800 dark:text-neutral-200 bg-neutral-50/50 dark:bg-neutral-950/40 min-h-[220px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: regexResult?.highlightedHtml || 'No matches found.' }}
            />
          </div>
        </div>

        {/* Capture Groups Breakdown */}
        {regexResult && regexResult.matches.length > 0 && (
          <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden text-xs">
            <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 font-medium text-neutral-500">
              Capture Group Breakdown ({regexResult.matches.length} match items)
            </div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-left font-mono">
                <thead className="bg-neutral-100 dark:bg-neutral-950 text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 text-[11px]">
                  <tr>
                    <th className="py-2 px-4">#</th>
                    <th className="py-2 px-4">Index</th>
                    <th className="py-2 px-4">Full Match</th>
                    <th className="py-2 px-4">Capture Groups</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40">
                  {regexResult.matches.map((m, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                      <td className="py-2 px-4 text-neutral-400">{idx + 1}</td>
                      <td className="py-2 px-4 text-neutral-500">{m.index}</td>
                      <td className="py-2 px-4 text-neutral-900 dark:text-neutral-100 font-semibold">{m.match}</td>
                      <td className="py-2 px-4 text-neutral-600 dark:text-neutral-400">
                        {m.groups.length > 0
                          ? m.groups.map((g, i) => `Group ${i + 1}: "${g}"`).join(' · ')
                          : 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Regex Library View
  if (tool.id === 'regex-library') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REGEX_LIBRARY.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                  {item.description}
                </p>

                <div className="p-2.5 rounded bg-neutral-100 dark:bg-neutral-950 font-mono text-xs text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800/80 break-all select-all mb-3">
                  /{item.pattern}/
                </div>

                <div className="text-[11px] text-neutral-500 space-y-1">
                  <div>
                    <span className="font-medium text-neutral-600 dark:text-neutral-300">Limitation: </span>
                    {item.limitation}
                  </div>
                  <div>
                    <span className="font-medium text-neutral-600 dark:text-neutral-300">Example Match: </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{item.exampleMatch}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
                {onNavigateTool ? (
                  <button
                    onClick={() => onNavigateTool('regex-tester')}
                    className="text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1 font-medium"
                  >
                    <span>Test in Regex Tester</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ) : (
                  <span />
                )}
                <CopyButton textToCopy={item.pattern} label="Copy Pattern" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Markdown Previewer View
  if (tool.id === 'markdown-previewer') {
    const handleDownloadMd = () => {
      const blob = new Blob([input], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded document.md');
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs">
          <div className="flex items-center gap-2 text-neutral-500">
            <span>Markdown Live Editor with XSS Sanitization</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setInput('')} className="text-neutral-500 hover:text-red-500 px-2 py-1">
              Clear
            </button>
            <CopyButton textToCopy={input} label="Copy Raw Markdown" />
            <button
              onClick={handleDownloadMd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-md text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .md</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
              Markdown Editor
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type markdown content..."
              rows={18}
              className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
            />
          </div>

          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
              Sanitized Live Preview
            </div>
            <div
              className="p-4 sm:p-6 max-w-none text-xs leading-relaxed overflow-y-auto min-h-[300px] [overflow-wrap:anywhere]"
              dangerouslySetInnerHTML={{ __html: markdownHtml }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 4. SQL Formatter View
  if (tool.id === 'sql-formatter') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs">
          <span className="text-neutral-500">ANSI SQL Beautifier & Keyword Capitalization</span>
          <div className="flex items-center gap-2">
            <button onClick={() => { setInput(''); setOutput(''); }} className="text-neutral-500 hover:text-red-500 px-2 py-1">
              Clear
            </button>
            <CopyButton textToCopy={output} label="Copy Formatted SQL" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
              Raw SQL Query
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste SQL statements here..."
              rows={16}
              className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
            />
          </div>

          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
              Formatted SQL
            </div>
            <textarea
              readOnly
              value={output}
              rows={16}
              className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-neutral-50/40 dark:bg-neutral-950/40 resize-y focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  // 5. URL Parser View
  if (tool.id === 'url-parser') {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Target URL to Deconstruct
            </span>
            <button onClick={() => setInput('')} className="text-xs text-neutral-500 hover:text-red-500">
              Clear
            </button>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/path?key=value#hash"
            className="w-full px-4 py-2.5 font-mono text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />
        </div>

        {parsedUrl?.valid && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Protocol', val: parsedUrl.protocol },
                { label: 'Host', val: parsedUrl.host },
                { label: 'Hostname', val: parsedUrl.hostname },
                { label: 'Port', val: parsedUrl.port || 'Default' },
                { label: 'Pathname', val: parsedUrl.pathname },
                { label: 'Hash Fragment', val: parsedUrl.hash || 'None' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                >
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    {item.label}
                  </span>
                  <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate block">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>

            {/* Query parameters table */}
            <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden text-xs">
              <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 font-medium text-neutral-500">
                Search Query Parameters ({parsedUrl.params.length})
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead className="bg-neutral-100 dark:bg-neutral-950 text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 text-[11px]">
                  <tr>
                    <th className="py-2 px-4">Param Key</th>
                    <th className="py-2 px-4">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40">
                  {parsedUrl.params.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-neutral-400 font-sans">
                        No query parameters detected in URL.
                      </td>
                    </tr>
                  ) : (
                    parsedUrl.params.map((p, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                        <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-neutral-100">
                          {p.key}
                        </td>
                        <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 select-all">
                          {p.value}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 6. Meta Tag Generator View
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <div className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4 text-xs">
          <div>
            <label className="block text-neutral-500 font-medium mb-1">Page Title</label>
            <input
              type="text"
              value={metaOptions.title}
              onChange={(e) => setMetaOptions({ ...metaOptions, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-sans text-xs"
            />
          </div>

          <div>
            <label className="block text-neutral-500 font-medium mb-1">Meta Description</label>
            <textarea
              value={metaOptions.description}
              onChange={(e) => setMetaOptions({ ...metaOptions, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-sans text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-500 font-medium mb-1">Canonical URL</label>
              <input
                type="text"
                value={metaOptions.canonicalUrl}
                onChange={(e) => setMetaOptions({ ...metaOptions, canonicalUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-neutral-500 font-medium mb-1">Site Name</label>
              <input
                type="text"
                value={metaOptions.siteName}
                onChange={(e) => setMetaOptions({ ...metaOptions, siteName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-sans text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-500 font-medium mb-1">OG Social Image URL</label>
              <input
                type="text"
                value={metaOptions.ogImage}
                onChange={(e) => setMetaOptions({ ...metaOptions, ogImage: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-neutral-500 font-medium mb-1">Twitter Handle</label>
              <input
                type="text"
                value={metaOptions.twitterHandle}
                onChange={(e) => setMetaOptions({ ...metaOptions, twitterHandle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Generated HTML Markup */}
        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
            <span>Generated HTML & OpenGraph Markup</span>
            <CopyButton textToCopy={output} label="Copy Markup" />
          </div>
          <textarea
            readOnly
            value={output}
            rows={16}
            className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-neutral-50/40 dark:bg-neutral-950/40 resize-y focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
