export function encodeBase64(input: string, urlSafe = false): string {
  if (!input) return '';
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64 = btoa(binary);
  if (urlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return base64;
}

export function decodeBase64(input: string, urlSafe = false): string {
  if (!input.trim()) return '';
  let normalized = input.trim();
  if (urlSafe || normalized.includes('-') || normalized.includes('_')) {
    normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4 !== 0) {
      normalized += '=';
    }
  }

  try {
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (err: unknown) {
    throw new Error('Invalid Base64 sequence: Unable to decode payload. Ensure input contains only valid Base64 characters.');
  }
}

export function encodeUrl(input: string, mode: 'component' | 'full' = 'component'): string {
  if (!input) return '';
  return mode === 'component' ? encodeURIComponent(input) : encodeURI(input);
}

export function decodeUrl(input: string): string {
  if (!input) return '';
  try {
    return decodeURIComponent(input);
  } catch (err: unknown) {
    throw new Error('Malformed URL encoding: Unable to decode URI component.');
  }
}

export function encodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
  };

  return text
    .replace(/&(?:amp|lt|gt|quot|#039|apos|nbsp|copy|reg|euro|pound|yen);/g, (match) => entities[match] || match)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export interface UnicodeCharInfo {
  char: string;
  codePoint: string;
  decimal: number;
  utf8Bytes: string;
  utf16Hex: string;
}

export function inspectUnicode(text: string): UnicodeCharInfo[] {
  if (!text) return [];

  const result: UnicodeCharInfo[] = [];
  // Correct iteration over unicode code points (handles surrogate pairs)
  for (const char of text) {
    const codePointNum = char.codePointAt(0) ?? 0;
    const hexCodePoint = codePointNum.toString(16).toUpperCase().padStart(4, '0');
    
    // UTF-8 bytes
    const utf8Bytes = Array.from(new TextEncoder().encode(char))
      .map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');

    // UTF-16
    const utf16Hex = Array.from(char)
      .map((c) => '0x' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'))
      .join(' ');

    result.push({
      char: char === '\n' ? '↵ (Newline)' : char === '\t' ? '⇥ (Tab)' : char === ' ' ? '␣ (Space)' : char,
      codePoint: `U+${hexCodePoint}`,
      decimal: codePointNum,
      utf8Bytes,
      utf16Hex,
    });
  }

  return result;
}

export function textToHex(text: string, delimiter: 'space' | '0x' | 'comma' | 'none' = 'space'): string {
  if (!text) return '';
  const bytes = new TextEncoder().encode(text);
  const hexParts: string[] = [];

  for (let i = 0; i < bytes.length; i++) {
    const hex = bytes[i].toString(16).padStart(2, '0').toUpperCase();
    if (delimiter === '0x') {
      hexParts.push(`0x${hex}`);
    } else {
      hexParts.push(hex);
    }
  }

  if (delimiter === 'none') return hexParts.join('');
  if (delimiter === 'comma') return hexParts.join(', ');
  return hexParts.join(' ');
}

export function hexToText(hex: string): string {
  if (!hex.trim()) return '';
  const cleanHex = hex.replace(/0x/g, '').replace(/[^0-9a-fA-F]/g, '');

  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid Hex string: Length must be an even number of characters.');
  }

  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }

  return new TextDecoder().decode(bytes);
}
