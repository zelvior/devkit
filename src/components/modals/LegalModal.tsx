import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  Database,
  Terminal,
  Scale,
  Copy,
  Check,
  Download,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

export type LegalTab = 'privacy' | 'terms' | 'security' | 'storage' | 'license' | 'shortcuts';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
  onSelectTab?: (tab: LegalTab) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose,
  onSelectTab,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleTabChange = (tab: LegalTab) => {
    setActiveTab(tab);
    if (onSelectTab) onSelectTab(tab);
    window.location.hash = `#/legal/${tab}`;
  };

  const tabs: { id: LegalTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'security', label: 'Security Model', icon: Lock },
    { id: 'storage', label: 'Storage & Cookies', icon: Database },
    { id: 'terms', label: 'Terms of Service', icon: Scale },
    { id: 'license', label: 'MIT License', icon: FileText },
    { id: 'shortcuts', label: 'Shortcuts (⌘K)', icon: Terminal },
  ];

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'privacy':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <strong className="block font-semibold">100% Client-Side Execution Guarantee</strong>
                <span>
                  Zelvior DevKit operates under a strict zero-telemetry, zero-remote-transmission policy. Your code, JSON payloads, tokens, and cryptographic keys never leave your browser.
                </span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
              1. Information We Never Collect
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-400">
              <li><strong>Zero User Inputs:</strong> We do not log, inspect, or transmit text typed into formatting or diffing utilities.</li>
              <li><strong>Zero Account Tracking:</strong> No registration, phone numbers, email addresses, or account credentials required.</li>
              <li><strong>Zero Analytics / Pixels:</strong> We do not use Google Analytics, Hotjar, Segment, or tracking pixels.</li>
              <li><strong>Zero Advertising SDKs:</strong> The application contains no ads, third-party sponsors, or data brokers.</li>
            </ul>

            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono pt-2">
              2. Browser-Isolated Processing
            </h3>
            <p>
              Every utility (including JSON parsing, code diffing, regular expression evaluation, and cryptographic hashing) runs inside your local browser JavaScript engine using native browser APIs like standard ECMAScript, Web Workers, and the W3C Web Cryptography API.
            </p>

            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono pt-2">
              3. Data Sovereignty & Portability
            </h3>
            <p>
              All bookmarks, snippets, and preferences are stored exclusively in your browser's origin-isolated IndexedDB (<code className="font-mono text-xs">zelvior_devkit_db</code>). You can export your data to JSON or wipe it entirely at any moment from the Data Manager.
            </p>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <div className="p-3.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 flex items-start gap-3">
              <Lock className="w-5 h-5 shrink-0 mt-0.5 text-neutral-800 dark:text-neutral-200" />
              <div>
                <strong className="block font-semibold text-neutral-900 dark:text-neutral-100">Cryptographic Standard & Memory Isolation</strong>
                <span>
                  Cryptographic utilities utilize native Web Cryptography (`window.crypto.subtle`) for SHA, HMAC, and RSA generation with zero third-party cloud reliance.
                </span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
              1. Sensitive Data Isolation
            </h3>
            <p>
              Sensitive data including passwords, HMAC secret keys, and JWT signatures are held strictly in transient component memory. They are explicitly excluded from persistent IndexedDB object stores and backup export files to protect you against physical disk inspection.
            </p>

            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono pt-2">
              2. Vulnerability Reporting
            </h3>
            <p>
              If you identify a security issue or unexpected network leakage, please do not open a public issue. Email our security team directly:
            </p>
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200">
              security@zelvior.com
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">
              We respond to vulnerability reports within 24 hours and commit to transparent remediation within 7 days.
            </p>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
              IndexedDB vs. Cookies Disclosure
            </h3>
            <p>
              In accordance with international privacy laws (GDPR, ePrivacy Directive, CCPA), Zelvior DevKit discloses its complete client storage footprint:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">HTTP Cookies: 0</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  We set zero tracking cookies, marketing cookies, or session cookies.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">IndexedDB: zelvior_devkit_db</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Versioned local storage for your theme, favorites, recent tools, and snippets.
                </p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono pt-2">
              Active Stores
            </h3>
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden font-mono text-xs">
              <li className="p-2.5 bg-neutral-50 dark:bg-neutral-900 flex justify-between">
                <span>settings</span>
                <span className="text-neutral-500">Theme mode (system/dark/light)</span>
              </li>
              <li className="p-2.5 bg-neutral-50 dark:bg-neutral-900 flex justify-between">
                <span>favorites</span>
                <span className="text-neutral-500">Bookmarked tool IDs</span>
              </li>
              <li className="p-2.5 bg-neutral-50 dark:bg-neutral-900 flex justify-between">
                <span>recentTools</span>
                <span className="text-neutral-500">Recently visited utility history</span>
              </li>
              <li className="p-2.5 bg-neutral-50 dark:bg-neutral-900 flex justify-between">
                <span>snippets</span>
                <span className="text-neutral-500">User saved code snippets</span>
              </li>
            </ul>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
              Terms of Service & Usage Agreement
            </h3>
            <p>
              By accessing or using <strong>Zelvior DevKit</strong>, you agree to comply with the terms set forth herein:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>
                <strong>Permissive Free Use:</strong> Zelvior DevKit is open-source software provided free of charge for personal, commercial, and educational use under the MIT License.
              </li>
              <li>
                <strong>No Warranty:</strong> The software is provided &quot;as is&quot;, without warranty of any kind, express or implied. Zelvior Labs does not warrant that utility calculations will be error-free or uninterrupted.
              </li>
              <li>
                <strong>User Responsibility:</strong> You are solely responsible for verifying the accuracy of any cryptographic hashes, SQL transformations, regex evaluations, or encoding outputs before using them in mission-critical environments.
              </li>
            </ul>
          </div>
        );

      case 'license':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                The MIT License (MIT)
              </h3>
              <button
                onClick={() => handleCopyText(`MIT License\n\nCopyright (c) 2026 Zelvior Labs\n\nPermission is hereby granted, free of charge...`)}
                className="text-xs flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy License'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-800 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
{`MIT License

Copyright (c) 2026 Zelvior Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
            </pre>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Accelerate your workflow with platform-wide keyboard navigation:
            </p>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
              {[
                { keys: ['⌘', 'K'], alt: 'Ctrl + K', action: 'Open Global Command Palette & Tool Search' },
                { keys: ['Esc'], alt: 'Escape', action: 'Close any active modal, dialog, or search drawer' },
                { keys: ['↑', '↓'], alt: 'Arrow Keys', action: 'Navigate search suggestions and list items' },
                { keys: ['↵'], alt: 'Enter', action: 'Execute active search result or tool route' },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs sm:text-sm">
                  <span className="text-neutral-900 dark:text-neutral-100 font-medium">{s.action}</span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {s.keys.map((k) => (
                      <kbd key={k} className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold">
                        {k}
                      </kbd>
                    ))}
                    {s.alt && <span className="text-neutral-400 text-[11px] ml-1">({s.alt})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-overlay-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-center-title"
    >
      <div
        className="w-full max-w-3xl shrink-0 my-auto bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-dialog-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <BrandLogo variant="symbol" size="sm" />
            <div>
              <h2 id="legal-center-title" className="text-base font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                Legal & Privacy Center
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Zelvior DevKit open-source standards and architectural compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 overflow-x-auto py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Zelvior Labs</span>
            <span>·</span>
            <a
              href="https://github.com/zelvior/devkit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1 text-neutral-700 dark:text-neutral-300"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleDownloadMarkdown(`${activeTab.toUpperCase()}.md`, `# Zelvior DevKit — ${activeTab.toUpperCase()}\n\nRefer to repository for full legal text.`)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold transition-colors text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
