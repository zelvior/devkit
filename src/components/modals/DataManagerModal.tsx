import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Check,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  FileText,
  Star,
  Clock,
  Settings as SettingsIcon,
} from 'lucide-react';
import {
  exportAllData,
  importAllData,
  purgeAllData,
  clearStore,
  getFavorites,
  getRecentTools,
  getSnippets,
  getAllSettings,
} from '../../lib/db';

interface DataManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset?: () => void;
}

interface StorageStats {
  settingsCount: number;
  favoritesCount: number;
  recentCount: number;
  snippetsCount: number;
  estimatedBytes: number;
}

export const DataManagerModal: React.FC<DataManagerModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const [stats, setStats] = useState<StorageStats>({
    settingsCount: 0,
    favoritesCount: 0,
    recentCount: 0,
    snippetsCount: 0,
    estimatedBytes: 0,
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmPurge, setConfirmPurge] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [settings, favs, recent, snippets] = await Promise.all([
        getAllSettings(),
        getFavorites(),
        getRecentTools(),
        getSnippets(),
      ]);

      const serialized = JSON.stringify({ settings, favs, recent, snippets });
      const bytes = new Blob([serialized]).size;

      setStats({
        settingsCount: Object.keys(settings).length,
        favoritesCount: favs.length,
        recentCount: recent.length,
        snippetsCount: snippets.length,
        estimatedBytes: bytes,
      });
    } catch (err) {
      console.error('Failed to load storage statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
      setFeedback(null);
      setConfirmPurge(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setLoading(true);
      const jsonData = await exportAllData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `zelvior-devkit-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setFeedback({ message: 'Backup successfully exported to JSON.', type: 'success' });
    } catch (err) {
      setFeedback({ message: 'Failed to export backup: ' + (err instanceof Error ? err.message : String(err)), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      await importAllData(text);
      await loadStats();
      setFeedback({ message: 'Backup imported successfully! Your data has been restored.', type: 'success' });
      if (onDataReset) onDataReset();
    } catch (err) {
      setFeedback({
        message: 'Import failed: ' + (err instanceof Error ? err.message : 'Invalid backup JSON file.'),
        type: 'error',
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearStore = async (storeName: 'favorites' | 'recentTools' | 'snippets') => {
    try {
      setLoading(true);
      await clearStore(storeName);
      await loadStats();
      setFeedback({ message: `Cleared ${storeName} store.`, type: 'success' });
      if (onDataReset) onDataReset();
    } catch (err) {
      setFeedback({ message: 'Failed to clear store: ' + (err instanceof Error ? err.message : String(err)), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeAll = async () => {
    try {
      setLoading(true);
      await purgeAllData();
      await loadStats();
      setConfirmPurge(false);
      setFeedback({ message: 'All local IndexedDB data has been completely erased.', type: 'success' });
      if (onDataReset) onDataReset();
    } catch (err) {
      setFeedback({ message: 'Failed to purge data: ' + (err instanceof Error ? err.message : String(err)), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-manager-title"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 id="data-manager-title" className="text-base font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                Data & Storage Management
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                100% client-side IndexedDB persistence (<code className="font-mono text-[11px]">zelvior_devkit_db</code>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-5 py-3 text-xs font-mono flex items-center justify-between border-b ${
              feedback.type === 'success'
                ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'
            }`}
          >
            <span className="flex items-center gap-2">
              {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
              {feedback.message}
            </span>
            <button
              onClick={() => setFeedback(null)}
              className="hover:underline text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Privacy & Architecture Notice */}
          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-neutral-900 dark:text-neutral-100 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-1">
              <p className="font-semibold text-neutral-900 dark:text-neutral-200">
                Zero Cloud Tracking & Strict Memory Isolation
              </p>
              <p>
                All settings, favorites, and snippets are stored directly in your browser's native IndexedDB instance. No servers, telemetry, or remote backends receive your data. Cryptographic keys and sensitive inputs are never persisted to disk.
              </p>
            </div>
          </div>

          {/* Storage Stats Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                IndexedDB Object Stores
              </h3>
              <button
                onClick={loadStats}
                disabled={loading}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center gap-1 font-mono transition-colors"
                title="Refresh counts"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 mb-1">
                  <span className="text-[11px] font-mono">Preferences</span>
                  <SettingsIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100">
                  {stats.settingsCount}
                </div>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400">Theme, UI toggles</span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 mb-1">
                  <span className="text-[11px] font-mono">Favorites</span>
                  <Star className="w-3.5 h-3.5" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100">
                  {stats.favoritesCount}
                </div>
                <button
                  onClick={() => handleClearStore('favorites')}
                  disabled={stats.favoritesCount === 0 || loading}
                  className="text-[10px] text-red-600 dark:text-red-400 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  Clear store
                </button>
              </div>

              <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 mb-1">
                  <span className="text-[11px] font-mono">Recent Tools</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100">
                  {stats.recentCount}
                </div>
                <button
                  onClick={() => handleClearStore('recentTools')}
                  disabled={stats.recentCount === 0 || loading}
                  className="text-[10px] text-red-600 dark:text-red-400 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  Clear store
                </button>
              </div>

              <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 mb-1">
                  <span className="text-[11px] font-mono">Snippets</span>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100">
                  {stats.snippetsCount}
                </div>
                <button
                  onClick={() => handleClearStore('snippets')}
                  disabled={stats.snippetsCount === 0 || loading}
                  className="text-[10px] text-red-600 dark:text-red-400 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  Clear store
                </button>
              </div>
            </div>

            <div className="mt-2 text-right">
              <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                Estimated payload size: <strong className="text-neutral-800 dark:text-neutral-200">{formatBytes(stats.estimatedBytes)}</strong>
              </span>
            </div>
          </div>

          {/* Backup & Restore Actions */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-3">
              Backup & Portability
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Backup</span>
              </button>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restore from JSON</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-2">
              Exports a verified JSON bundle of your bookmarks, custom snippets, and platform preferences for safekeeping or cross-browser transfer.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="pt-3 border-t border-red-200 dark:border-red-950/60">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Danger Zone
            </h3>

            {!confirmPurge ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Purge All IndexedDB Stores
                  </div>
                  <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Permanently wipe all snippets, favorites, search history, and settings from this browser.
                  </div>
                </div>
                <button
                  onClick={() => setConfirmPurge(true)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ml-4"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Erase All
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 space-y-2.5">
                <p className="text-xs font-bold text-red-800 dark:text-red-200">
                  Are you absolutely certain? This operation cannot be undone.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePurgeAll}
                    disabled={loading}
                    className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
                  >
                    Yes, Purge Everything
                  </button>
                  <button
                    onClick={() => setConfirmPurge(false)}
                    className="px-3 py-1.5 rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-mono text-[11px]">Database: zelvior_devkit_db (v1)</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
