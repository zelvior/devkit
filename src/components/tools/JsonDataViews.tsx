import React, { useState, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import { formatJson, validateJson, minifyJson, jsonToCsv, csvToJson, JsonValidationResult } from '../../lib/tools/jsonData';
import { CopyButton } from '../ui/CopyButton';
import { Download, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface ToolViewProps {
  tool: ToolDefinition;
  onNavigateTool?: (toolId: string) => void;
}

export const JsonDataViews: React.FC<ToolViewProps> = ({ tool }) => {
  const { showToast } = useToast();
  const [input, setInput] = useState(tool.sampleInput || '');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<number>(2);
  const [validation, setValidation] = useState<JsonValidationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync sample input when tool changes
  useEffect(() => {
    setInput(tool.sampleInput || '');
    setErrorMsg(null);
  }, [tool.id]);

  // Compute on input / tool / indent change
  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setValidation(null);
      setErrorMsg(null);
      return;
    }

    try {
      setErrorMsg(null);
      if (tool.id === 'json-formatter') {
        setOutput(formatJson(input, indent));
        setValidation(validateJson(input));
      } else if (tool.id === 'json-validator') {
        const val = validateJson(input);
        setValidation(val);
        if (val.valid) {
          setOutput(formatJson(input, 2));
        } else {
          setOutput('');
          setErrorMsg(val.error || 'Invalid JSON');
        }
      } else if (tool.id === 'json-minifier') {
        setOutput(minifyJson(input));
      } else if (tool.id === 'json-to-csv') {
        setOutput(jsonToCsv(input));
      } else if (tool.id === 'csv-to-json') {
        setOutput(csvToJson(input));
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setOutput('');
    }
  }, [input, tool.id, indent]);

  const handleDownload = (format: 'json' | 'csv') => {
    if (!output) return;
    const blob = new Blob([output], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zelvior-${tool.id}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded as zelvior-${tool.id}.${format}`);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setValidation(null);
    setErrorMsg(null);
  };

  const isCsvTool = tool.id === 'json-to-csv' || tool.id === 'csv-to-json';

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs">
        <div className="flex items-center gap-3">
          {tool.id === 'json-formatter' && (
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-medium">Indentation:</span>
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-xs text-neutral-800 dark:text-neutral-200"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
                <option value={8}>8 Spaces</option>
              </select>
            </div>
          )}

          {validation && (
            <div className="flex items-center gap-2 font-mono">
              {validation.valid ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Valid JSON ({validation.type}, {validation.itemCount} items)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Invalid JSON {validation.line ? `(Line ${validation.line}, Col ${validation.column})` : ''}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-red-500 transition-colors"
            title="Clear inputs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <CopyButton textToCopy={output} label="Copy Output" />
          {output && (
            <button
              onClick={() => handleDownload(tool.id === 'json-to-csv' ? 'csv' : 'json')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-md text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor & Viewer Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <span>Input {tool.id === 'csv-to-json' ? 'CSV' : 'JSON'}</span>
            <span className="font-mono text-[11px]">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tool.id === 'csv-to-json' ? 'Paste CSV here...' : 'Paste raw JSON here...'}
            rows={18}
            className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Output Panel */}
        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <span>Formatted Output {tool.id === 'json-to-csv' ? '(CSV)' : '(JSON)'}</span>
            <span className="font-mono text-[11px]">{output.length} chars</span>
          </div>

          {errorMsg ? (
            <div className="p-6 text-red-500 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Syntax Parsing Error</span>
              </div>
              <p className="bg-red-500/10 p-3 rounded border border-red-500/20 text-red-400 break-words">
                {errorMsg}
              </p>
            </div>
          ) : (
            <textarea
              readOnly
              value={output}
              placeholder="Result will appear here..."
              rows={18}
              className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-neutral-50/50 dark:bg-neutral-950/40 resize-y focus:outline-none"
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};
