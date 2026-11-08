import React, { useState, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  generateHash,
  HashAlgorithm,
  generateUUIDs,
  decodeJwt,
  JwtDecoded,
  generatePassword,
  PasswordOptions,
  generateHmac,
  HmacAlgorithm,
} from '../../lib/tools/security';
import { CopyButton } from '../ui/CopyButton';
import {
  ShieldAlert,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Flame,
} from 'lucide-react';
import { useToast } from '../ui/Toast';

export const SecurityViews: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const { showToast } = useToast();
  const [input, setInput] = useState(tool.sampleInput || '');
  const [secondaryInput, setSecondaryInput] = useState(tool.sampleSecondaryInput || '');

  // Hash state
  const [activeHashAlgo, setActiveHashAlgo] = useState<HashAlgorithm>('SHA-256');
  const [hashUppercase, setHashUppercase] = useState(false);
  const [allHashes, setAllHashes] = useState<Record<string, string>>({});

  // UUID state
  const [uuidCount, setUuidCount] = useState(5);
  const [uuidHyphens, setUuidHyphens] = useState(true);
  const [uuidUpper, setUuidUpper] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);

  // JWT state
  const [jwtData, setJwtData] = useState<JwtDecoded | null>(null);
  const [jwtError, setJwtError] = useState<string | null>(null);

  // Password state
  const [pwOptions, setPwOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: true,
  });
  const [generatedPw, setGeneratedPw] = useState<{ password: string; entropyBits: number; strength: string }>({
    password: '',
    entropyBits: 0,
    strength: 'weak',
  });

  // HMAC state
  const [hmacAlgo, setHmacAlgo] = useState<HmacAlgorithm>('SHA-256');
  const [hmacResult, setHmacResult] = useState('');

  useEffect(() => {
    setInput(tool.sampleInput || '');
    setSecondaryInput(tool.sampleSecondaryInput || '');
  }, [tool.id]);

  // Compute Hashes
  useEffect(() => {
    if (tool.id === 'hash-generator') {
      if (!input) {
        setAllHashes({});
        return;
      }
      const computeAll = async () => {
        const [s1, s256, s384, s512] = await Promise.all([
          generateHash(input, 'SHA-1', hashUppercase),
          generateHash(input, 'SHA-256', hashUppercase),
          generateHash(input, 'SHA-384', hashUppercase),
          generateHash(input, 'SHA-512', hashUppercase),
        ]);
        setAllHashes({
          'SHA-1': s1,
          'SHA-256': s256,
          'SHA-384': s384,
          'SHA-512': s512,
        });
      };
      computeAll();
    }
  }, [input, tool.id, hashUppercase]);

  // Compute UUIDs
  useEffect(() => {
    if (tool.id === 'uuid-generator') {
      setUuids(generateUUIDs(uuidCount, uuidUpper, uuidHyphens));
    }
  }, [tool.id, uuidCount, uuidHyphens, uuidUpper]);

  // Compute JWT
  useEffect(() => {
    if (tool.id === 'jwt-decoder') {
      if (!input.trim()) {
        setJwtData(null);
        setJwtError(null);
        return;
      }
      try {
        setJwtError(null);
        setJwtData(decodeJwt(input));
      } catch (err: unknown) {
        setJwtError(err instanceof Error ? err.message : String(err));
        setJwtData(null);
      }
    }
  }, [input, tool.id]);

  // Compute Password
  useEffect(() => {
    if (tool.id === 'password-generator') {
      setGeneratedPw(generatePassword(pwOptions));
    }
  }, [tool.id, pwOptions]);

  // Compute HMAC
  useEffect(() => {
    if (tool.id === 'hmac-generator') {
      if (!input || !secondaryInput) {
        setHmacResult('');
        return;
      }
      generateHmac(input, secondaryInput, hmacAlgo).then(setHmacResult);
    }
  }, [input, secondaryInput, hmacAlgo, tool.id]);

  // 1. Hash Generator View
  if (tool.id === 'hash-generator') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
            <span>Input Text String</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hashUppercase}
                  onChange={(e) => setHashUppercase(e.target.checked)}
                  className="rounded"
                />
                <span>Uppercase Hex</span>
              </label>
              <button onClick={() => setInput('')} className="hover:text-red-500">
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            rows={4}
            className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
          />
        </div>

        {/* Calculated Digests */}
        <div className="space-y-3">
          {(['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1'] as HashAlgorithm[]).map((algo) => (
            <div
              key={algo}
              className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="min-w-32">
                <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {algo}
                </span>
                <span className="block text-[10px] text-neutral-400">
                  {algo === 'SHA-256' ? '256-bit digest' : algo === 'SHA-512' ? '512-bit digest' : algo === 'SHA-384' ? '384-bit digest' : '160-bit digest (legacy)'}
                </span>
              </div>
              <div className="flex-1 font-mono text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-100/70 dark:bg-neutral-950 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 break-all select-all">
                {allHashes[algo] || '—'}
              </div>
              <CopyButton textToCopy={allHashes[algo] || ''} label="Copy" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. UUID Generator View
  if (tool.id === 'uuid-generator') {
    const handleRegenerate = () => {
      setUuids(generateUUIDs(uuidCount, uuidUpper, uuidHyphens));
      showToast('Generated fresh UUIDs');
    };

    const handleDownloadUuids = () => {
      const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uuids-${uuids.length}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return (
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-medium">Quantity ({uuidCount}):</span>
              <input
                type="range"
                min="1"
                max="50"
                value={uuidCount}
                onChange={(e) => setUuidCount(Number(e.target.value))}
                className="w-28 accent-neutral-900 dark:accent-white"
              />
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={uuidHyphens}
                onChange={(e) => setUuidHyphens(e.target.checked)}
                className="rounded"
              />
              <span>Hyphens</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={uuidUpper}
                onChange={(e) => setUuidUpper(e.target.checked)}
                className="rounded"
              />
              <span>Uppercase</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-medium rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
            <CopyButton textToCopy={uuids.join('\n')} label="Copy All" />
            <button
              onClick={handleDownloadUuids}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-md text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .txt</span>
            </button>
          </div>
        </div>

        {/* UUID List */}
        <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {uuids.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors font-mono text-xs">
                <span className="text-neutral-400 select-none w-8 text-[11px]">{i + 1}.</span>
                <span className="flex-1 text-neutral-900 dark:text-neutral-100 select-all">{u}</span>
                <CopyButton textToCopy={u} label="" showToastNotification={false} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. JWT Decoder View
  if (tool.id === 'jwt-decoder') {
    return (
      <div className="space-y-6">
        {/* Token input */}
        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
            <span>Encoded JWT Token</span>
            <button onClick={() => setInput('')} className="hover:text-red-500">
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JWT (header.payload.signature)..."
            rows={5}
            className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
          />
        </div>

        {/* Security Disclosure */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Security Note:</span> JWT decoding is performed 100% locally in your browser. This tool inspects header and claims payload, but does <strong>not</strong> cryptographically verify signature authenticity. Do not treat unverified tokens as secure.
          </div>
        </div>

        {jwtError && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-mono">
            {jwtError}
          </div>
        )}

        {jwtData && (
          <div className="space-y-4">
            {/* Expiry Banner */}
            {jwtData.expiresAt && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                  jwtData.isExpired
                    ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {jwtData.isExpired ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{jwtData.timeRemaining}</span>
                </div>
                <span className="font-mono">{jwtData.expiresAt}</span>
              </div>
            )}

            {/* Header & Payload split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Header */}
              <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
                  <span>Header</span>
                  <CopyButton textToCopy={JSON.stringify(jwtData.header, null, 2)} label="Copy" />
                </div>
                <pre className="p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 overflow-x-auto">
                  {JSON.stringify(jwtData.header, null, 2)}
                </pre>
              </div>

              {/* Payload */}
              <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
                  <span>Payload Claims</span>
                  <CopyButton textToCopy={JSON.stringify(jwtData.payload, null, 2)} label="Copy" />
                </div>
                <pre className="p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 overflow-x-auto">
                  {JSON.stringify(jwtData.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. Password Generator View
  if (tool.id === 'password-generator') {
    const handleGeneratePw = () => {
      setGeneratedPw(generatePassword(pwOptions));
      showToast('Generated secure password');
    };

    return (
      <div className="space-y-6">
        {/* Output banner */}
        <div className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className="block text-[11px] text-neutral-400 uppercase tracking-wider font-semibold mb-1">
              Generated Password ({generatedPw.entropyBits} bits entropy)
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-neutral-900 dark:text-white select-all break-all">
              {generatedPw.password}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleGeneratePw}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-medium text-xs rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
            <CopyButton textToCopy={generatedPw.password} label="Copy Password" />
          </div>
        </div>

        {/* Configuration options */}
        <div className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Length: {pwOptions.length} characters
            </span>
            <input
              type="range"
              min="8"
              max="64"
              value={pwOptions.length}
              onChange={(e) => setPwOptions((prev) => ({ ...prev, length: Number(e.target.value) }))}
              className="w-48 accent-neutral-900 dark:accent-white"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={pwOptions.uppercase}
                onChange={(e) => setPwOptions((prev) => ({ ...prev, uppercase: e.target.checked }))}
                className="rounded"
              />
              <span>Uppercase (A-Z)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={pwOptions.lowercase}
                onChange={(e) => setPwOptions((prev) => ({ ...prev, lowercase: e.target.checked }))}
                className="rounded"
              />
              <span>Lowercase (a-z)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={pwOptions.numbers}
                onChange={(e) => setPwOptions((prev) => ({ ...prev, numbers: e.target.checked }))}
                className="rounded"
              />
              <span>Numbers (0-9)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={pwOptions.symbols}
                onChange={(e) => setPwOptions((prev) => ({ ...prev, symbols: e.target.checked }))}
                className="rounded"
              />
              <span>Symbols (!@#$)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={pwOptions.excludeAmbiguous}
                onChange={(e) => setPwOptions((prev) => ({ ...prev, excludeAmbiguous: e.target.checked }))}
                className="rounded"
              />
              <span>Exclude Ambiguous (0, O, l, 1)</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // 5. HMAC Generator View
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Message */}
        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
            Message Payload
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter message to authenticate..."
            rows={6}
            className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
          />
        </div>

        {/* Secret Key */}
        <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
            Secret Key (Kept strictly inside browser)
          </div>
          <textarea
            value={secondaryInput}
            onChange={(e) => setSecondaryInput(e.target.value)}
            placeholder="Enter private HMAC secret key..."
            rows={6}
            className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
          />
        </div>
      </div>

      {/* Algorithm selector and HMAC output */}
      <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Algorithm:</span>
            <select
              value={hmacAlgo}
              onChange={(e) => setHmacAlgo(e.target.value as HmacAlgorithm)}
              className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1 text-xs"
            >
              <option value="SHA-256">HMAC-SHA-256</option>
              <option value="SHA-512">HMAC-SHA-512</option>
            </select>
          </div>
          <CopyButton textToCopy={hmacResult} label="Copy Signature" />
        </div>

        <div className="font-mono text-xs text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-950 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 break-all select-all">
          {hmacResult || 'Provide message and secret key above to generate HMAC signature'}
        </div>
      </div>
    </div>
  );
};
