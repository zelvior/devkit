import React, { useState, useEffect } from 'react';
import { getSnippets, saveSnippet, deleteSnippet, SnippetItem } from '../../lib/db';
import { CopyButton } from '../ui/CopyButton';
import { Search, Plus, Trash2, Tag, FileText, X, Check } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface SnippetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeToolId?: string;
  initialContentToSave?: string;
}

export const SnippetsModal: React.FC<SnippetsModalProps> = ({
  isOpen,
  onClose,
  activeToolId,
  initialContentToSave,
}) => {
  const { showToast } = useToast();
  const [snippets, setSnippets] = useState<SnippetItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState<SnippetItem | null>(null);

  // New snippet form state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  const loadSnippets = async () => {
    const list = await getSnippets();
    setSnippets(list);
    if (list.length > 0 && !selectedSnippet) {
      setSelectedSnippet(list[0]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSnippets();
      if (initialContentToSave) {
        setIsCreating(true);
        setNewContent(initialContentToSave);
        setNewTitle(`Snippet from ${activeToolId || 'DevKit'}`);
      }
    }
  }, [isOpen, initialContentToSave, activeToolId]);

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const tags = newTagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const saved = await saveSnippet({
      title: newTitle.trim() || 'Untitled Snippet',
      content: newContent,
      toolId: activeToolId || 'general',
      tags,
    });

    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
    setNewTagInput('');
    await loadSnippets();
    setSelectedSnippet(saved);
    showToast('Saved to IndexedDB snippets');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this saved snippet?')) {
      await deleteSnippet(id);
      await loadSnippets();
      if (selectedSnippet?.id === id) {
        setSelectedSnippet(null);
      }
      showToast('Deleted snippet');
    }
  };

  if (!isOpen) return null;

  const filteredSnippets = snippets.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-overlay-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl shrink-0 my-auto bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[750px] animate-dialog-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Saved Snippets & Workspaces
              </h2>
              <p className="text-[11px] text-neutral-500 font-mono">
                Stored 100% locally in IndexedDB · Zero network leaks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreating && (
              <button
                onClick={() => {
                  setIsCreating(true);
                  setNewTitle('');
                  setNewContent('');
                  setNewTagInput('');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Snippet</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Sidebar: Snippet List */}
          <div className="w-full h-56 sm:h-64 md:h-auto md:w-80 md:min-h-0 shrink-0 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-neutral-50/60 dark:bg-neutral-950/60">
            {/* Search filter */}
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search snippets or tags..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/40 p-2 space-y-1">
              {filteredSnippets.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400">
                  {snippets.length === 0 ? 'No snippets saved yet.' : 'No matching snippets found.'}
                </div>
              ) : (
                filteredSnippets.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedSnippet(s);
                      setIsCreating(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors text-left ${
                      selectedSnippet?.id === s.id && !isCreating
                        ? 'bg-white dark:bg-neutral-800 shadow-xs border border-neutral-200 dark:border-neutral-700'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                        {s.title}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {new Date(s.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 font-mono">
                      {s.content}
                    </p>
                    {s.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Area: Viewer or Form */}
          <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-neutral-900">
            {isCreating ? (
              <form onSubmit={handleSaveNew} className="flex-1 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Create New Snippet
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Production PostgreSQL Query"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-sans focus:outline-none"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Snippet Content</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Paste code snippet, query, regex, or configuration..."
                    rows={12}
                    required
                    className="w-full flex-1 p-3 font-mono text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="sql, auth, config, api"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 text-xs text-neutral-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950"
                  >
                    Save to IndexedDB
                  </button>
                </div>
              </form>
            ) : selectedSnippet ? (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedSnippet.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                      <span>Tool: {selectedSnippet.toolId}</span>
                      <span>·</span>
                      <span>Updated {new Date(selectedSnippet.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CopyButton textToCopy={selectedSnippet.content} label="Copy Snippet" />
                    <button
                      onClick={() => handleDelete(selectedSnippet.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 rounded-md border border-neutral-200 dark:border-neutral-800 transition-colors"
                      title="Delete snippet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {selectedSnippet.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag className="w-3 h-3 text-neutral-400" />
                    {selectedSnippet.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 p-4 font-mono text-xs overflow-auto text-neutral-900 dark:text-neutral-100 select-all whitespace-pre-wrap">
                  {selectedSnippet.content}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400 space-y-3">
                <FileText className="w-10 h-10 opacity-30" />
                <p className="text-xs">Select a saved snippet or create a new one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
