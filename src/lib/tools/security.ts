export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export async function generateHash(text: string, algorithm: HashAlgorithm, uppercase = false): Promise<string> {
  if (!text) return '';
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return uppercase ? hex.toUpperCase() : hex.toLowerCase();
}

export function generateUUIDs(count = 1, uppercase = false, hyphens = true): string[] {
  const result: string[] = [];
  const safeCount = Math.min(Math.max(1, count), 500);

  for (let i = 0; i < safeCount; i++) {
    let uuid = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    if (!hyphens) {
      uuid = uuid.replace(/-/g, '');
    }
    if (uppercase) {
      uuid = uuid.toUpperCase();
    }
    result.push(uuid);
  }

  return result;
}

export interface JwtDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired?: boolean;
  expiresAt?: string;
  issuedAt?: string;
  timeRemaining?: string;
}

export function decodeJwt(token: string): JwtDecoded {
  if (!token.trim()) {
    throw new Error('Please enter a JWT token');
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: A valid JSON Web Token must have exactly three parts separated by dots.');
  }

  const base64UrlDecode = (str: string) => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  };

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    header = JSON.parse(base64UrlDecode(parts[0]));
  } catch (e) {
    throw new Error('Invalid JWT Header: Unable to parse Base64URL header as JSON.');
  }

  try {
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch (e) {
    throw new Error('Invalid JWT Payload: Unable to parse Base64URL payload as JSON.');
  }

  const signature = parts[2];

  let isExpired: boolean | undefined;
  let expiresAt: string | undefined;
  let issuedAt: string | undefined;
  let timeRemaining: string | undefined;

  if (typeof payload.exp === 'number') {
    const expDate = new Date(payload.exp * 1000);
    expiresAt = expDate.toISOString();
    const now = Date.now();
    const diffMs = expDate.getTime() - now;

    if (diffMs <= 0) {
      isExpired = true;
      const ago = Math.abs(diffMs);
      const days = Math.floor(ago / (1000 * 60 * 60 * 24));
      const hours = Math.floor((ago % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      timeRemaining = `Expired ${days > 0 ? `${days}d ` : ''}${hours}h ago`;
    } else {
      isExpired = false;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      timeRemaining = `Expires in ${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m`;
    }
  }

  if (typeof payload.iat === 'number') {
    issuedAt = new Date(payload.iat * 1000).toISOString();
  }

  return {
    header,
    payload,
    signature,
    isExpired,
    expiresAt,
    issuedAt,
    timeRemaining,
  };
}

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export function generatePassword(options: PasswordOptions): { password: string; entropyBits: number; strength: 'weak' | 'fair' | 'good' | 'strong' } {
  let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  let numberChars = '0123456789';
  let symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (options.excludeAmbiguous) {
    upperChars = upperChars.replace(/[OIl]/g, '');
    lowerChars = lowerChars.replace(/[oIl]/g, '');
    numberChars = numberChars.replace(/[01]/g, '');
    symbolChars = symbolChars.replace(/[|;:,.<>]/g, '');
  }

  let charset = '';
  const guaranteed: string[] = [];

  if (options.uppercase && upperChars.length) {
    charset += upperChars;
    guaranteed.push(upperChars[getRandomInt(upperChars.length)]);
  }
  if (options.lowercase && lowerChars.length) {
    charset += lowerChars;
    guaranteed.push(lowerChars[getRandomInt(lowerChars.length)]);
  }
  if (options.numbers && numberChars.length) {
    charset += numberChars;
    guaranteed.push(numberChars[getRandomInt(numberChars.length)]);
  }
  if (options.symbols && symbolChars.length) {
    charset += symbolChars;
    guaranteed.push(symbolChars[getRandomInt(symbolChars.length)]);
  }

  if (charset.length === 0) {
    return { password: '', entropyBits: 0, strength: 'weak' };
  }

  const length = Math.max(4, Math.min(128, options.length));
  const passwordChars: string[] = [...guaranteed];

  while (passwordChars.length < length) {
    passwordChars.push(charset[getRandomInt(charset.length)]);
  }

  // Shuffle array using Fisher-Yates with crypto
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  const password = passwordChars.join('');
  const poolSize = charset.length;
  const entropyBits = Math.round(length * Math.log2(poolSize));

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (entropyBits >= 80) strength = 'strong';
  else if (entropyBits >= 60) strength = 'good';
  else if (entropyBits >= 40) strength = 'fair';

  return { password, entropyBits, strength };
}

function getRandomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

export type HmacAlgorithm = 'SHA-256' | 'SHA-512';

export async function generateHmac(
  message: string,
  secretKey: string,
  algorithm: HmacAlgorithm,
  uppercase = false
): Promise<string> {
  if (!message || !secretKey) return '';

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretKey),
    { name: 'HMAC', hash: { name: algorithm } },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return uppercase ? hex.toUpperCase() : hex.toLowerCase();
}
