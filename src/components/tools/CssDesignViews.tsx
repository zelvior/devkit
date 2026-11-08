import React, { useState, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  formatCss,
  minifyCss,
  parseAnyColorToValues,
  ColorValues,
  calculateContrast,
  ContrastResult,
} from '../../lib/tools/cssDesign';
import { CopyButton } from '../ui/CopyButton';
import { CheckCircle2, XCircle } from 'lucide-react';

export const CssDesignViews: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [input, setInput] = useState(tool.sampleInput || '');
  const [secondaryInput, setSecondaryInput] = useState(tool.sampleSecondaryInput || '');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);

  // Color Converter State
  const [colorValues, setColorValues] = useState<ColorValues>(parseAnyColorToValues('#3B82F6'));

  // Color Contrast State
  const [fgColor, setFgColor] = useState('#FFFFFF');
  const [bgColor, setBgColor] = useState('#09090B');
  const [contrast, setContrast] = useState<ContrastResult>(calculateContrast('#FFFFFF', '#09090B'));

  // Box Shadow State
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(10);
  const [shadowBlur, setShadowBlur] = useState(25);
  const [shadowSpread, setShadowSpread] = useState(-5);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowOpacity, setShadowOpacity] = useState(0.3);
  const [shadowInset, setShadowInset] = useState(false);

  useEffect(() => {
    setInput(tool.sampleInput || '');
    setSecondaryInput(tool.sampleSecondaryInput || '');
  }, [tool.id]);

  useEffect(() => {
    if (tool.id === 'css-formatter') {
      setOutput(formatCss(input, indent));
    } else if (tool.id === 'css-minifier') {
      setOutput(minifyCss(input));
    } else if (tool.id === 'color-converter') {
      setColorValues(parseAnyColorToValues(input || '#000000'));
    } else if (tool.id === 'color-contrast-checker') {
      setContrast(calculateContrast(fgColor, bgColor));
    }
  }, [input, tool.id, indent, fgColor, bgColor]);

  // 1 & 2. CSS Formatter & Minifier View
  if (tool.id === 'css-formatter' || tool.id === 'css-minifier') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg text-xs">
          <div className="flex items-center gap-3">
            {tool.id === 'css-formatter' && (
              <div className="flex items-center gap-2">
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
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => { setInput(''); setOutput(''); }} className="text-neutral-500 hover:text-red-500 px-2 py-1">
              Clear
            </button>
            <CopyButton textToCopy={output} label="Copy Output" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
              Raw CSS Input
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste CSS rules here..."
              rows={14}
              className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-y focus:outline-none"
            />
          </div>

          <div className="flex flex-col rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500">
              {tool.id === 'css-minifier' ? 'Minified CSS' : 'Formatted CSS'}
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Output will appear here..."
              rows={14}
              className="w-full p-4 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-neutral-50/40 dark:bg-neutral-950/40 resize-y focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  // 3. Color Converter View
  if (tool.id === 'color-converter') {
    return (
      <div className="space-y-6">
        {/* Interactive Swatch & Picker */}
        <div className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col md:flex-row items-center gap-6">
          <div
            className="w-24 h-24 rounded-xl border border-neutral-400 dark:border-neutral-700 shadow-inner shrink-0 relative overflow-hidden"
            style={{ backgroundColor: colorValues.rgba }}
          >
            <input
              type="color"
              value={colorValues.hex.substring(0, 7)}
              onChange={(e) => setInput(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <div className="flex-1 w-full space-y-2">
            <label className="block text-xs font-medium text-neutral-500">
              Input Color (HEX, RGB, HSL)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. #3b82f6 or rgb(59, 130, 246)"
                className="w-full max-w-sm px-4 py-2 font-mono text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
              <span className="text-xs text-neutral-400">Click swatch to pick</span>
            </div>
          </div>
        </div>

        {/* Color Formats Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'HEX', val: colorValues.hex },
            { label: 'RGB', val: colorValues.rgb },
            { label: 'RGBA', val: colorValues.rgba },
            { label: 'HSL', val: colorValues.hsl },
            { label: 'HSLA', val: colorValues.hsla },
            { label: 'Raw Channels', val: `R: ${colorValues.r}, G: ${colorValues.g}, B: ${colorValues.b}, A: ${colorValues.a}` },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between"
            >
              <div>
                <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  {item.label}
                </span>
                <span className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100 select-all">
                  {item.val}
                </span>
              </div>
              <CopyButton textToCopy={item.val} label="Copy" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. Color Contrast Checker View
  if (tool.id === 'color-contrast-checker') {
    return (
      <div className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
            <span className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Foreground Color (Text)
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={fgColor.substring(0, 7)}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-10 h-10 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="font-mono text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 flex-1"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
            <span className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Background Color
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor.substring(0, 7)}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="font-mono text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 flex-1"
              />
            </div>
          </div>
        </div>

        {/* Live Contrast Preview Box */}
        <div
          className="p-8 rounded-xl border transition-colors flex flex-col justify-between"
          style={{ backgroundColor: bgColor, color: fgColor, borderColor: fgColor + '33' }}
        >
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Zelvior DevKit Typography</h3>
            <p className="text-sm max-w-xl leading-relaxed">
              This preview text demonstrates visual legibility according to the W3C Web Content Accessibility Guidelines (WCAG 2.2).
            </p>
          </div>
          <div className="mt-8 flex items-baseline gap-2 font-mono">
            <span className="text-4xl font-extrabold">{contrast.ratio}:1</span>
            <span className="text-xs uppercase tracking-wider font-sans font-semibold">Contrast Ratio</span>
          </div>
        </div>

        {/* WCAG Compliance Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Normal Text (&lt; 18pt)
            </span>
            <div className="flex items-center justify-between text-xs">
              <span>Level AA (4.5:1)</span>
              {contrast.normalTextAA ? (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Pass</span>
              ) : (
                <span className="flex items-center gap-1 text-rose-500 font-semibold"><XCircle className="w-3.5 h-3.5" /> Fail</span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Level AAA (7.0:1)</span>
              {contrast.normalTextAAA ? (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Pass</span>
              ) : (
                <span className="flex items-center gap-1 text-rose-500 font-semibold"><XCircle className="w-3.5 h-3.5" /> Fail</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Large Text (&ge; 18pt)
            </span>
            <div className="flex items-center justify-between text-xs">
              <span>Level AA (3.0:1)</span>
              {contrast.largeTextAA ? (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Pass</span>
              ) : (
                <span className="flex items-center gap-1 text-rose-500 font-semibold"><XCircle className="w-3.5 h-3.5" /> Fail</span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Level AAA (4.5:1)</span>
              {contrast.largeTextAAA ? (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Pass</span>
              ) : (
                <span className="flex items-center gap-1 text-rose-500 font-semibold"><XCircle className="w-3.5 h-3.5" /> Fail</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              UI Components & Icons
            </span>
            <div className="flex items-center justify-between text-xs">
              <span>Level AA (3.0:1)</span>
              {contrast.uiComponentsAA ? (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Pass</span>
              ) : (
                <span className="flex items-center gap-1 text-rose-500 font-semibold"><XCircle className="w-3.5 h-3.5" /> Fail</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Box Shadow Generator View
  const rgbaShadow = `rgba(${parseInt(shadowColor.slice(1, 3), 16) || 0}, ${parseInt(shadowColor.slice(3, 5), 16) || 0}, ${parseInt(shadowColor.slice(5, 7), 16) || 0}, ${shadowOpacity})`;
  const boxShadowCss = `${shadowInset ? 'inset ' : ''}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${rgbaShadow}`;
  const fullDeclaration = `box-shadow: ${boxShadowCss};`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4 text-xs">
          <div>
            <div className="flex justify-between font-medium mb-1">
              <span>Horizontal Offset: {shadowX}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={shadowX}
              onChange={(e) => setShadowX(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span>Vertical Offset: {shadowY}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={shadowY}
              onChange={(e) => setShadowY(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span>Blur Radius: {shadowBlur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={shadowBlur}
              onChange={(e) => setShadowBlur(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span>Spread Radius: {shadowSpread}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={shadowSpread}
              onChange={(e) => setShadowSpread(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span>Opacity: {Math.round(shadowOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={shadowOpacity}
              onChange={(e) => setShadowOpacity(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => setShadowColor(e.target.value)}
                className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
              />
              <span className="font-mono">{shadowColor}</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={shadowInset}
                onChange={(e) => setShadowInset(e.target.checked)}
                className="rounded"
              />
              <span>Inset Shadow</span>
            </label>
          </div>
        </div>

        {/* Visual Preview Box */}
        <div className="p-8 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950 flex flex-col items-center justify-center min-h-[300px]">
          <div
            className="w-48 h-48 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-500 transition-all duration-75"
            style={{ boxShadow: boxShadowCss }}
          >
            Preview Element
          </div>
        </div>
      </div>

      {/* Generated CSS code bar */}
      <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-4">
        <code className="font-mono text-xs text-neutral-800 dark:text-neutral-200 select-all">
          {fullDeclaration}
        </code>
        <CopyButton textToCopy={fullDeclaration} label="Copy CSS" />
      </div>
    </div>
  );
};
