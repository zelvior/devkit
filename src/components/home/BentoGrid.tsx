import React from 'react';
import { TOOLS } from '../../config/tools';
import {
  Braces,
  Binary,
  ShieldCheck,
  Fingerprint,
  Regex,
  KeyRound,
  History,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface BentoGridProps {
  recentToolIds: string[];
  onSelectTool: (id: string) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ recentToolIds, onSelectTool }) => {
  const recentTools = recentToolIds
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean) as typeof TOOLS;

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Featured Utilities
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Core developer workflows optimized for zero-latency browser productivity.
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 md:grid-flow-row-dense gap-4">
        {/* Large Bento Card: JSON Formatter */}
        <div
          onClick={() => onSelectTool('json-formatter')}
          className="md:col-span-2 p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white group-hover:scale-105 transition-transform">
                <Braces className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              JSON Formatter & Validator
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
              Beautify, indent, validate, and identify RFC 8259 syntax errors with line/column pointers and structural counters.
            </p>
          </div>
          <div className="p-3 bg-neutral-100/70 dark:bg-neutral-950 rounded-lg font-mono text-[11px] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800/80 overflow-hidden">
            <span className="text-neutral-400 dark:text-neutral-600">{'{'}</span>
            <br />
            <span className="pl-4 text-neutral-800 dark:text-neutral-300">&quot;status&quot;</span>: <span className="text-emerald-600 dark:text-emerald-400">&quot;valid&quot;</span>,
            <br />
            <span className="pl-4 text-neutral-800 dark:text-neutral-300">&quot;execution&quot;</span>: <span className="text-blue-600 dark:text-blue-400">&quot;client-side&quot;</span>
            <br />
            <span className="text-neutral-400 dark:text-neutral-600">{'}'}</span>
          </div>
        </div>

        {/* Bento Card: JWT Decoder */}
        <div
          onClick={() => onSelectTool('jwt-decoder')}
          className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              JWT Decoder
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
              Decode header and payload claims with live expiration calculations without sharing tokens.
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Claims & Expiry analysis</span>
          </div>
        </div>

        {/* Bento Card: UUID Generator */}
        <div
          onClick={() => onSelectTool('uuid-generator')}
          className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white group-hover:scale-105 transition-transform">
                <Fingerprint className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              UUID Generator
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
              Bulk cryptographically random UUID v4 identifiers with custom hyphens and case formatting.
            </p>
          </div>
          <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate bg-neutral-100 dark:bg-neutral-950 p-2 rounded border border-neutral-200 dark:border-neutral-800">
            c9bf9e57-1685-4c89-bafb-ff5af830be8a
          </div>
        </div>

        {/* Bento Card: Base64 Encoder/Decoder */}
        <div
          onClick={() => onSelectTool('base64')}
          className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white group-hover:scale-105 transition-transform">
                <Binary className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Base64 Encoder / Decoder
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
              UTF-8 compliant text and binary safe Base64 transformation with URL-safe RFC 4648 option.
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            Text ⇄ Base64 ⇄ URL-safe
          </div>
        </div>

        {/* Large Bento Card: Regex Tester */}
        <div
          onClick={() => onSelectTool('regex-tester')}
          className="md:col-span-2 p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white group-hover:scale-105 transition-transform">
                <Regex className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Regex Tester & Capture Groups
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
              Real-time regular expression evaluation with live syntax highlighting, group capture details, and built-in ReDoS execution guardrails.
            </p>
          </div>
          <div className="p-3 bg-neutral-100/70 dark:bg-neutral-950 rounded-lg font-mono text-[11px] border border-neutral-200 dark:border-neutral-800/80 flex items-center gap-2">
            <span className="text-neutral-500">/([a-z]+)@([a-z]+\.[a-z]{'{2,}'})/gi</span>
            <span className="ml-auto text-[10px] text-amber-500 font-sans">Interactive Matching</span>
          </div>
        </div>

        {/* Bento Card: Hash Generator */}
        <div
          onClick={() => onSelectTool('hash-generator')}
          className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Hash Generator
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
              Compute SHA-1, SHA-256, SHA-384, and SHA-512 digests via high-speed Web Crypto API.
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            SHA-256 / SHA-512 / SHA-1
          </div>
        </div>
      </div>

      {/* Recently Used Shelf (if user has history) */}
      {recentTools.length > 0 && (
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <History className="w-3.5 h-3.5" />
            <span>Recently Used on This Device</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="p-3 text-left rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                  {tool.name}
                </div>
                <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                  {tool.category}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
