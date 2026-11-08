import React, { useState, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  encodeBase64,
  decodeBase64,
  encodeUrl,
  decodeUrl,
  encodeHtmlEntities,
  decodeHtmlEntities,
  inspectUnicode,
  UnicodeCharInfo,
  textToHex,
  hexToText,
} from '../../lib/tools/encoding';
import { CopyButton } from '../ui/CopyButton';
import { Trash2, AlertCircle } from 'lucide-react';

export const EncodingViews: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [input, setInput] = useState(tool.sampleInput || '');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [urlSafe, setUrlSafe] = useState(false);
  const [hexDelimiter, setHexDelimiter] = useState<'space' | '0x' | 'comma' | 'none'>('space');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unicodeItems, setUnicodeItems] = useState<UnicodeCharInfo[]>([]);

  useEffect(() => {
    setInput(tool.sampleInput || '');
    setErrorMsg(null);
  }, [tool.id]);

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setErrorMsg(null);
      setUnicodeItems([]);
      return;
    }

    try {
      setErrorMsg(null);
      if (tool.id === 'base64') {
        setOutput(mode === 'encode' ? encodeBase64(input, urlSafe) : decodeBase64(input, urlSafe));
      } else if (tool.id === 'url-encoder') {
        setOutput(mode === 'encode' ? encodeUrl(input, 'component') : decodeUrl(input));
      } else if (tool.id === 'html-entity') {
        setOutput(mode === 'encode' ? encodeHtmlEntities(input) : decodeHtmlEntities(input));
      } else if (tool.id === 'unicode-inspector') {
        setUnicodeItems(inspectUnicode(input));
      } else if (tool.id === 'hex-converter') {
        setOutput(mode === 'encode' ? textToHex(input, hexDelimiter) : hexToText(input));
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setOutput('');
    }
  }, [input, tool.id, mode, urlSafe, hexDelimiter]);

  const handleClear = () => {
    setInput('');
    setOutput('');
    setErrorMsg(null);
    setUnicodeItems([]);
  };

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs">
        <div className="flex items-center gap-3">
          {tool.id !== 'unicode-inspector' && (
            <div className="flex items-center gap-1 p-0.5 bg-neutral-200 dark:bg-neutral-800 rounded-md">
              <button
                onClick={() => setMode('encode')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  mode === 'encode'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Encode
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  mode === 'decode'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Decode
              </button>
            </div>
          )}

          {tool.id === 'base64' && (
            <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => setUrlSafe(e.target.checked)}
                className="rounded"
              />
              <span>URL-Safe (RFC 4648)</span>
            </label>
          )}

          {tool.id === 'hex-converter' && mode === 'encode' && (
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Delimiter:</span>
              <select
                value={hexDelimiter}
                onChange={(e) => setHexDelimiter(e.target.value as any)}
                className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-xs"
              >
                <option value="space">Space (48 65 6C)</option>
                <option value="0x">Prefix (0x48 0x65)</option>
                <option value="comma">Comma (48, 65)</option>
                <option value="none">None (48656C)</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="text-neutral-500 hover:text-red-500 px-2 py-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {tool.id !== 'unicode-inspector' && <CopyButton textToCopy={output} label="Copy Output" />}
        </div>
      </div>

      {tool.id === 'unicode-inspector' ? (
        <div className="space-y-4">
          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 font-medium">
              Input String to Inspect
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste characters, emojis, or symbols..."
              className="w-full p-4 font-mono text-sm text-neutral-900 dark:text-neutral-100 bg-transparent focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 font-medium">
              Unicode Breakdown ({unicodeItems.length} characters)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-100 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Char</th>
                    <th className="py-2.5 px-4 font-semibold">Code Point</th>
                    <th className="py-2.5 px-4 font-semibold">Decimal</th>
                    <th className="py-2.5 px-4 font-semibold">UTF-8 Bytes</th>
                    <th className="py-2.5 px-4 font-semibold">UTF-16 Hex</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40">
                  {unicodeItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-400 font-sans">
                        Type any text or emoji above to inspect code points.
                      </td>
                    </tr>
                  ) : (
                    unicodeItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                        <td className="py-2.5 px-4 text-base font-sans font-bold text-neutral-900 dark:text-neutral-100">
                          {item.char}
                        </td>
                        <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                          {item.codePoint}
                        </td>
                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400 tabular-nums">
                          {item.decimal}
                        </td>
                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">
                          {item.utf8Bytes}
                        </td>
                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">
                          {item.utf16Hex}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 font-medium">
              Input Text
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste content here..."
              rows={14}
              className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
            />
          </div>

          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 font-medium">
              Output ({mode})
            </div>
            {errorMsg ? (
              <div className="p-6 text-red-500 text-xs font-mono space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Decoding Error</span>
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
                rows={14}
                className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-neutral-50/40 dark:bg-neutral-950/40 resize-y focus:outline-none"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
