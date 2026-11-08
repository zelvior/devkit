import React, { useState, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  HTTP_STATUS_CODES,
  HttpStatusInfo,
  MIME_TYPES,
  MimeTypeInfo,
  parseUserAgent,
  ParsedUserAgent,
  formatHtml,
  formatXml,
} from '../../lib/tools/webDev';
import {
  SitemapEntry,
  SitemapChangeFreq,
  generateSitemapXml,
  parseBulkUrls,
} from '../../lib/tools/sitemap';
import { CopyButton } from '../ui/CopyButton';
import {
  Search,
  Globe,
  Monitor,
  Smartphone,
  AlertCircle,
  Laptop,
  Plus,
  Trash2,
  Download,
  FileCode,
  ListPlus,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../ui/Toast';

export const WebDevViews: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const { showToast } = useToast();
  const [input, setInput] = useState(tool.sampleInput || '');
  const [output, setOutput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [indent, setIndent] = useState(2);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedUa, setParsedUa] = useState<ParsedUserAgent | null>(null);

  // Sitemap generator state
  const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>(() => {
    return parseBulkUrls(tool.sampleInput || 'https://example.com');
  });
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [sitemapXml, setSitemapXml] = useState('');

  useEffect(() => {
    setInput(tool.sampleInput || '');
    setErrorMsg(null);
    if (tool.id === 'sitemap-generator') {
      const initial = parseBulkUrls(tool.sampleInput || 'https://example.com');
      setSitemapEntries(initial);
      setSitemapXml(generateSitemapXml(initial));
    }
  }, [tool.id]);

  useEffect(() => {
    if (tool.id === 'sitemap-generator') {
      setSitemapXml(generateSitemapXml(sitemapEntries));
    } else if (tool.id === 'user-agent-parser') {
      setParsedUa(parseUserAgent(input));
    } else if (tool.id === 'html-formatter') {
      try {
        setErrorMsg(null);
        setOutput(formatHtml(input, indent));
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : String(err));
      }
    } else if (tool.id === 'xml-formatter') {
      try {
        setErrorMsg(null);
        setOutput(formatXml(input, indent));
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : String(err));
      }
    }
  }, [input, tool.id, indent, sitemapEntries]);

  // 0. Sitemap.xml Generator View
  if (tool.id === 'sitemap-generator') {
    const handleAddEntry = () => {
      const newEntry: SitemapEntry = {
        id: `url-${Date.now()}`,
        loc: 'https://example.com/new-page',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8,
      };
      setSitemapEntries((prev) => [...prev, newEntry]);
      showToast('Added new URL entry');
    };

    const handleUpdateEntry = (id: string, updates: Partial<SitemapEntry>) => {
      setSitemapEntries((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
      );
    };

    const handleDeleteEntry = (id: string) => {
      setSitemapEntries((prev) => prev.filter((entry) => entry.id !== id));
      showToast('Removed URL entry');
    };

    const handleBulkImport = () => {
      if (!bulkInput.trim()) return;
      const parsed = parseBulkUrls(bulkInput);
      setSitemapEntries(parsed);
      setShowBulkModal(false);
      setBulkInput('');
      showToast(`Imported ${parsed.length} URLs`);
    };

    const handleDownloadXml = () => {
      if (!sitemapXml) return;
      const blob = new Blob([sitemapXml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded sitemap.xml');
    };

    const handleClearAll = () => {
      setSitemapEntries([]);
    };

    return (
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAddEntry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add URL</span>
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>Bulk Import URLs</span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-2.5 py-1.5 text-neutral-500 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-500 dark:text-neutral-400 mr-2">
              {sitemapEntries.length} {sitemapEntries.length === 1 ? 'URL' : 'URLs'}
            </span>
            <CopyButton textToCopy={sitemapXml} label="Copy XML" />
            <button
              onClick={handleDownloadXml}
              disabled={sitemapEntries.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download sitemap.xml</span>
            </button>
          </div>
        </div>

        {/* Bulk Import Modal / Drawer */}
        {showBulkModal && (
          <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 animate-dialog-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Bulk Paste URLs (One per line or comma-separated)
              </span>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                Cancel
              </button>
            </div>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="https://example.com&#10;https://example.com/about&#10;https://example.com/pricing&#10;https://example.com/blog"
              rows={5}
              className="w-full p-3 font-mono text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Close
              </button>
              <button
                onClick={handleBulkImport}
                className="px-4 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-md"
              >
                Import & Generate
              </button>
            </div>
          </div>
        )}

        {/* URL List: Responsive Mobile Cards + Desktop Table */}
        <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500 flex items-center justify-between">
            <span>Sitemap Entries Builder</span>
            <span className="text-[11px] font-mono">Standard Sitemaps.org 0.9 Protocol</span>
          </div>

          {sitemapEntries.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
              No URLs added yet. Click &quot;Add URL&quot; or &quot;Bulk Import URLs&quot; to begin.
            </div>
          ) : (
            <>
              {/* Desktop View Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-100/70 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Location URL (&lt;loc&gt;)</th>
                      <th className="py-2.5 px-3 font-semibold w-36">Change Frequency</th>
                      <th className="py-2.5 px-3 font-semibold w-28">Priority</th>
                      <th className="py-2.5 px-3 font-semibold w-36">Last Modified</th>
                      <th className="py-2.5 px-4 font-semibold w-16 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40">
                    {sitemapEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={entry.loc}
                            onChange={(e) => handleUpdateEntry(entry.id, { loc: e.target.value })}
                            placeholder="https://example.com/page"
                            className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={entry.changefreq}
                            onChange={(e) =>
                              handleUpdateEntry(entry.id, {
                                changefreq: e.target.value as SitemapChangeFreq,
                              })
                            }
                            className="w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
                          >
                            <option value="always">always</option>
                            <option value="hourly">hourly</option>
                            <option value="daily">daily</option>
                            <option value="weekly">weekly</option>
                            <option value="monthly">monthly</option>
                            <option value="yearly">yearly</option>
                            <option value="never">never</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={entry.priority.toFixed(1)}
                            onChange={(e) =>
                              handleUpdateEntry(entry.id, { priority: parseFloat(e.target.value) })
                            }
                            className="w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs font-semibold"
                          >
                            <option value="1.0">1.0 (Home)</option>
                            <option value="0.8">0.8 (Core)</option>
                            <option value="0.6">0.6 (Standard)</option>
                            <option value="0.4">0.4 (Subpage)</option>
                            <option value="0.2">0.2 (Low)</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={entry.lastmod}
                            onChange={(e) => handleUpdateEntry(entry.id, { lastmod: e.target.value })}
                            className="w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
                          />
                        </td>
                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Responsive Cards */}
              <div className="md:hidden divide-y divide-neutral-200 dark:divide-neutral-800 p-2 space-y-3">
                {sitemapEntries.map((entry, idx) => (
                  <div key={entry.id} className="pt-3 pb-2 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-neutral-400 text-[10px]">#{idx + 1}</span>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-neutral-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-0.5">Location URL</label>
                      <input
                        type="text"
                        value={entry.loc}
                        onChange={(e) => handleUpdateEntry(entry.id, { loc: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-0.5">Frequency</label>
                        <select
                          value={entry.changefreq}
                          onChange={(e) =>
                            handleUpdateEntry(entry.id, {
                              changefreq: e.target.value as SitemapChangeFreq,
                            })
                          }
                          className="w-full px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
                        >
                          <option value="always">always</option>
                          <option value="hourly">hourly</option>
                          <option value="daily">daily</option>
                          <option value="weekly">weekly</option>
                          <option value="monthly">monthly</option>
                          <option value="yearly">yearly</option>
                          <option value="never">never</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-0.5">Priority</label>
                        <select
                          value={entry.priority.toFixed(1)}
                          onChange={(e) =>
                            handleUpdateEntry(entry.id, { priority: parseFloat(e.target.value) })
                          }
                          className="w-full px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs font-semibold"
                        >
                          <option value="1.0">1.0 (Home)</option>
                          <option value="0.8">0.8 (Core)</option>
                          <option value="0.6">0.6 (Standard)</option>
                          <option value="0.4">0.4 (Subpage)</option>
                          <option value="0.2">0.2 (Low)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-0.5">Lastmod Date</label>
                      <input
                        type="date"
                        value={entry.lastmod}
                        onChange={(e) => handleUpdateEntry(entry.id, { lastmod: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Live XML Code Output Panel */}
        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-neutral-400" />
              <span>Generated sitemap.xml Preview</span>
            </div>
            <CopyButton textToCopy={sitemapXml} label="Copy XML" />
          </div>
          <textarea
            readOnly
            value={sitemapXml}
            rows={12}
            className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-neutral-50/40 dark:bg-neutral-950/40 resize-y focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  // 1. HTTP Status Code Lookup View
  if (tool.id === 'http-status-lookup') {
    const filteredCodes = HTTP_STATUS_CODES.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        String(item.code).includes(q) ||
        item.text.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });

    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code (e.g. 404, 500) or description (e.g. timeout, redirect)..."
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredCodes.map((c) => {
            const is1xx = c.code >= 100 && c.code < 200;
            const is2xx = c.code >= 200 && c.code < 300;
            const is3xx = c.code >= 300 && c.code < 400;
            const is4xx = c.code >= 400 && c.code < 500;
            const is5xx = c.code >= 500;

            const badgeColor = is2xx
              ? 'text-emerald-600 dark:text-emerald-400'
              : is3xx
              ? 'text-blue-600 dark:text-blue-400'
              : is4xx
              ? 'text-amber-600 dark:text-amber-400'
              : is5xx
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-neutral-500';

            return (
              <div
                key={c.code}
                className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-bold font-mono ${badgeColor}`}>{c.code}</span>
                      <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                        {c.text}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">{c.spec}</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                    {c.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-[11px] text-neutral-500">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-400">Common: </span>
                  {c.useCase}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. MIME Type Lookup View
  if (tool.id === 'mime-type-lookup') {
    const filteredMime = MIME_TYPES.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.extension.toLowerCase().includes(q) ||
        item.mimeType.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });

    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by extension (e.g. json, png, pdf) or MIME type (e.g. application/json)..."
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
          />
        </div>

        <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Extension</th>
                <th className="py-2.5 px-4 font-semibold">MIME Type</th>
                <th className="py-2.5 px-4 font-semibold font-sans">Category</th>
                <th className="py-2.5 px-4 font-semibold font-sans">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40">
              {filteredMime.map((m) => (
                <tr key={m.extension} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                  <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-neutral-100">
                    .{m.extension}
                  </td>
                  <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold select-all">
                    {m.mimeType}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-500 font-sans">{m.category}</td>
                  <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400 font-sans">
                    {m.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. User-Agent Parser View
  if (tool.id === 'user-agent-parser') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
            <span>User-Agent String</span>
            <button
              onClick={() => setInput(navigator?.userAgent || '')}
              className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
            >
              Load Current Browser UA
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste User-Agent header..."
            rows={4}
            className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
          />
        </div>

        {parsedUa && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
                Browser
              </span>
              <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {parsedUa.browser.name}
              </div>
              <span className="text-xs text-neutral-500 font-mono">{parsedUa.browser.version || 'Version detected'}</span>
            </div>

            <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
                Operating System
              </span>
              <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {parsedUa.os.name}
              </div>
              <span className="text-xs text-neutral-500 font-mono">{parsedUa.os.version || 'OS platform'}</span>
            </div>

            <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
                Engine
              </span>
              <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {parsedUa.engine.name}
              </div>
              <span className="text-xs text-neutral-500 font-mono">{parsedUa.engine.version || 'Layout engine'}</span>
            </div>

            <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
                Device Form Factor
              </span>
              <div className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                {parsedUa.device.type === 'Mobile' ? (
                  <Smartphone className="w-4 h-4 text-neutral-500" />
                ) : (
                  <Laptop className="w-4 h-4 text-neutral-500" />
                )}
                <span>{parsedUa.device.type}</span>
              </div>
              <span className="text-xs text-neutral-500 font-mono">Architecture</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4 & 5. HTML & XML Formatter Views
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs">
        <div className="flex items-center gap-3">
          <span className="text-neutral-500 font-medium">Indentation:</span>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-xs"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { setInput(''); setOutput(''); setErrorMsg(null); }} className="text-neutral-500 hover:text-red-500 px-2 py-1">
            Clear
          </button>
          <CopyButton textToCopy={output} label="Copy Output" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
            Raw Markup Input ({tool.id === 'html-formatter' ? 'HTML' : 'XML'})
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw markup here..."
            rows={14}
            className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
          />
        </div>

        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
            Formatted Markup
          </div>
          {errorMsg ? (
            <div className="p-6 text-red-500 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>XML Parsing Error</span>
              </div>
              <p className="bg-red-500/10 p-3 rounded border border-red-500/20 text-red-400 break-words">
                {errorMsg}
              </p>
            </div>
          ) : (
            <textarea
              readOnly
              value={output}
              placeholder="Formatted output will appear here..."
              rows={14}
              className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-neutral-50/40 dark:bg-neutral-950/40 resize-y focus:outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};
