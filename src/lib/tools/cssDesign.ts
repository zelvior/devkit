export function formatCss(css: string, indentSize = 2): string {
  if (!css.trim()) return '';
  const pad = ' '.repeat(indentSize);

  // Normalize
  let formatted = css
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m) // keep comments
    .replace(/\s*{\s*/g, ' {\n')
    .replace(/;\s*/g, ';\n')
    .replace(/\s*}\s*/g, '\n}\n\n');

  const lines = formatted.split('\n');
  let indent = 0;
  const result: string[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.includes('}')) {
      indent = Math.max(0, indent - 1);
    }

    result.push(pad.repeat(indent) + line);

    if (line.includes('{')) {
      indent++;
    }
  }

  return result.join('\n');
}

export function minifyCss(css: string): string {
  if (!css.trim()) return '';
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
    .replace(/\s+/g, ' ') // collapse whitespace
    .replace(/\s*([{:;,>+~])\s*/g, '$1') // remove space around tokens
    .replace(/;}/g, '}') // remove trailing semicolon
    .trim();
}

export interface ColorValues {
  hex: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
  r: number;
  g: number;
  b: number;
  a: number;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  let a = 1;
  if (c.length === 8) {
    a = Math.round((parseInt(c.substring(6, 8), 16) / 255) * 100) / 100;
    c = c.substring(0, 6);
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
    a,
  };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function parseAnyColorToValues(input: string): ColorValues {
  let r = 0, g = 0, b = 0, a = 1;
  const str = input.trim();

  if (str.startsWith('#')) {
    const res = hexToRgb(str);
    r = res.r; g = res.g; b = res.b; a = res.a;
  } else if (/^rgba?/i.test(str)) {
    const parts = str.replace(/rgba?\(|\)/gi, '').split(',').map((p) => parseFloat(p.trim()));
    r = Math.min(255, Math.max(0, parts[0] || 0));
    g = Math.min(255, Math.max(0, parts[1] || 0));
    b = Math.min(255, Math.max(0, parts[2] || 0));
    if (parts[3] !== undefined) a = Math.min(1, Math.max(0, parts[3]));
  } else {
    // Default fallback to hex parse
    const res = hexToRgb(str.startsWith('#') ? str : `#${str}`);
    r = res.r; g = res.g; b = res.b; a = res.a;
  }

  const { h, s, l } = rgbToHsl(r, g, b);
  const hex = `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}${a < 1 ? Math.round(a * 255).toString(16).padStart(2, '0') : ''}`.toUpperCase();

  return {
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    hsla: `hsla(${h}, ${s}%, ${l}%, ${a})`,
    r,
    g,
    b,
    a,
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export interface ContrastResult {
  ratio: number;
  normalTextAA: boolean;
  normalTextAAA: boolean;
  largeTextAA: boolean;
  largeTextAAA: boolean;
  uiComponentsAA: boolean;
}

export function calculateContrast(fgHex: string, bgHex: string): ContrastResult {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);

  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = Math.round(((brighter + 0.05) / (darker + 0.05)) * 100) / 100;

  return {
    ratio,
    normalTextAA: ratio >= 4.5,
    normalTextAAA: ratio >= 7.0,
    largeTextAA: ratio >= 3.0,
    largeTextAAA: ratio >= 4.5,
    uiComponentsAA: ratio >= 3.0,
  };
}
