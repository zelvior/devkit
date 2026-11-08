export interface RegexMatchItem {
  index: number;
  match: string;
  groups: string[];
}

export interface RegexTestResult {
  valid: boolean;
  error?: string;
  matches: RegexMatchItem[];
  highlightedHtml: string;
  count: number;
}

export function testRegex(pattern: string, flags: string, testString: string): RegexTestResult {
  if (!pattern) {
    return { valid: true, matches: [], highlightedHtml: escapeHtml(testString), count: 0 };
  }

  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatchItem[] = [];

    // Avoid catastrophic ReDoS on huge text by limiting execution
    const safeString = testString.slice(0, 50000);

    if (flags.includes('g')) {
      let m: RegExpExecArray | null;
      let iterations = 0;
      while ((m = regex.exec(safeString)) !== null && iterations < 500) {
        matches.push({
          index: m.index,
          match: m[0],
          groups: m.slice(1),
        });
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        iterations++;
      }
    } else {
      const m = regex.exec(safeString);
      if (m) {
        matches.push({
          index: m.index,
          match: m[0],
          groups: m.slice(1),
        });
      }
    }

    // Build highlighted HTML safely
    let highlightedHtml = '';
    let lastIndex = 0;

    for (const match of matches) {
      if (match.index > lastIndex) {
        highlightedHtml += escapeHtml(safeString.substring(lastIndex, match.index));
      }
      highlightedHtml += `<mark class="bg-amber-400/30 text-amber-900 dark:text-amber-200 border-b-2 border-amber-500 rounded px-0.5">${escapeHtml(match.match)}</mark>`;
      lastIndex = match.index + match.match.length;
    }

    if (lastIndex < safeString.length) {
      highlightedHtml += escapeHtml(safeString.substring(lastIndex));
    }

    return {
      valid: true,
      matches,
      highlightedHtml,
      count: matches.length,
    };
  } catch (err: unknown) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : String(err),
      matches: [],
      highlightedHtml: escapeHtml(testString),
      count: 0,
    };
  }
}

export interface RegexPatternItem {
  id: string;
  name: string;
  category: string;
  pattern: string;
  flags: string;
  description: string;
  limitation: string;
  exampleMatch: string;
}

export const REGEX_LIBRARY: RegexPatternItem[] = [
  {
    id: 'email',
    name: 'Email Address',
    category: 'Validation',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: '',
    description: 'Standard pragmatic email pattern suitable for web forms.',
    limitation: 'Does not support rare RFC 5322 mailbox formats with quoted strings or IP domain literals.',
    exampleMatch: 'developer@zelvior.com',
  },
  {
    id: 'url',
    name: 'HTTP / HTTPS URL',
    category: 'Web',
    pattern: '^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$',
    flags: 'i',
    description: 'Matches web URLs beginning with http:// or https://.',
    limitation: 'Requires explicit protocol scheme; does not match raw domains like google.com.',
    exampleMatch: 'https://github.com/zelvior/devkit',
  },
  {
    id: 'ipv4',
    name: 'IPv4 Address',
    category: 'Network',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    flags: '',
    description: 'Validates dotted decimal octets between 0 and 255.',
    limitation: 'Does not check for private/reserved CIDR block exclusions.',
    exampleMatch: '192.168.1.1',
  },
  {
    id: 'semver',
    name: 'Semantic Versioning (SemVer)',
    category: 'Software',
    pattern: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
    flags: '',
    description: 'Matches SemVer 2.0.0 specs including pre-release and build metadata.',
    limitation: 'Does not support leading "v" prefix unless prefixed with v?.',
    exampleMatch: '2.1.0-beta.1+build.2026',
  },
  {
    id: 'slug',
    name: 'URL Slug',
    category: 'Web',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    flags: '',
    description: 'Matches lowercase alphanumeric hyphenated slug strings.',
    limitation: 'Disallows uppercase letters, underscores, and consecutive hyphens.',
    exampleMatch: 'json-formatter-pro',
  },
  {
    id: 'hex-color',
    name: 'HEX Color Code',
    category: 'Design',
    pattern: '^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$',
    flags: '',
    description: 'Validates 3, 4, 6, and 8 digit hexadecimal CSS colors.',
    limitation: 'Does not match named colors or rgb/hsl function formats.',
    exampleMatch: '#3b82f6',
  },
  {
    id: 'date-iso',
    name: 'Date (YYYY-MM-DD)',
    category: 'Time',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    flags: '',
    description: 'Validates ISO 8601 calendar dates format.',
    limitation: 'Does not validate leap year constraints on February 29th.',
    exampleMatch: '2026-11-08',
  },
  {
    id: 'password-strong',
    name: 'Strong Password Policy',
    category: 'Security',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: '',
    description: 'At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.',
    limitation: 'Special character set restricted to @$!%*?&.',
    exampleMatch: 'Str0ngP@ssw0rd!',
  },
];

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderMarkdownToSafeHtml(markdown: string): string {
  if (!markdown) return '';

  let html = escapeHtml(markdown);

  // Code blocks: ```lang\ncode\n```
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-neutral-900 border border-neutral-800 rounded p-3 my-3 text-xs font-mono overflow-x-auto text-neutral-200"><code>${code.trim()}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 font-mono text-xs border border-neutral-700">$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-neutral-100 mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-neutral-100 mt-5 mb-2 pb-1 border-b border-neutral-800">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-neutral-100 mt-6 mb-3 pb-2 border-b border-neutral-800">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-neutral-100">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-neutral-300">$1</em>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-neutral-600 pl-3 my-2 text-neutral-400 italic">$1</blockquote>');

  // Unordered list items
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-neutral-300 text-sm my-0.5">$1</li>');

  // Links: [text](url) - sanitized protocols only
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300">$1</a>');

  // Paragraph breaks
  html = html.replace(/\n\n+/g, '<br/><br/>');

  return html;
}

export function formatSql(sql: string, indentSize = 2): string {
  if (!sql.trim()) return '';

  const pad = ' '.repeat(indentSize);
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
    'FULL JOIN', 'JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
    'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE',
    'ALTER TABLE', 'UNION ALL', 'UNION', 'AS', 'IN', 'NOT IN', 'BETWEEN', 'LIKE', 'EXISTS'
  ];

  let result = sql.replace(/\s+/g, ' ').trim();

  // Highlight clauses to new lines
  const majorClauses = [
    'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN',
    'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'INSERT INTO', 'VALUES',
    'UPDATE', 'SET', 'DELETE FROM', 'UNION ALL', 'UNION'
  ];

  for (const clause of majorClauses) {
    const regex = new RegExp(`\\b${clause}\\b`, 'gi');
    result = result.replace(regex, `\n${clause.toUpperCase()}`);
  }

  // Indent secondary lines
  const lines = result.split('\n');
  const formatted: string[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Capitalize SQL keywords
    for (const kw of keywords) {
      const reg = new RegExp(`\\b${kw}\\b`, 'gi');
      line = line.replace(reg, kw.toUpperCase());
    }

    if (line.startsWith('SELECT') || line.startsWith('FROM') || line.startsWith('WHERE') || line.startsWith('INSERT') || line.startsWith('UPDATE') || line.startsWith('DELETE')) {
      formatted.push(line);
    } else {
      formatted.push(pad + line);
    }
  }

  return formatted.join('\n').trim();
}

export interface ParsedUrlDetails {
  valid: boolean;
  href: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  params: { key: string; value: string }[];
  error?: string;
}

export function parseUrl(urlStr: string): ParsedUrlDetails {
  if (!urlStr.trim()) {
    return {
      valid: false,
      href: '',
      protocol: '',
      host: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
      params: [],
      error: 'Enter a valid URL to parse',
    };
  }

  try {
    let toParse = urlStr.trim();
    if (!toParse.includes('://')) {
      toParse = `https://${toParse}`;
    }

    const url = new URL(toParse);
    const params: { key: string; value: string }[] = [];

    url.searchParams.forEach((val, key) => {
      params.push({ key, value: val });
    });

    return {
      valid: true,
      href: url.href,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? '443' : url.protocol === 'http:' ? '80' : ''),
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      params,
    };
  } catch (err: unknown) {
    return {
      valid: false,
      href: urlStr,
      protocol: '',
      host: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
      params: [],
      error: 'Invalid URL format.',
    };
  }
}

export interface MetaTagOptions {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  twitterHandle: string;
  siteName: string;
}

export function generateHtmlMetaTags(opts: MetaTagOptions): string {
  const lines: string[] = [
    `<!-- HTML Primary Meta Tags -->`,
    `<title>${escapeHtml(opts.title || 'Page Title')}</title>`,
    `<meta name="title" content="${escapeHtml(opts.title || '')}" />`,
    `<meta name="description" content="${escapeHtml(opts.description || '')}" />`,
    opts.canonicalUrl ? `<link rel="canonical" href="${escapeHtml(opts.canonicalUrl)}" />` : '',
    ``,
    `<!-- Open Graph / Facebook -->`,
    `<meta property="og:type" content="website" />`,
    opts.canonicalUrl ? `<meta property="og:url" content="${escapeHtml(opts.canonicalUrl)}" />` : '',
    `<meta property="og:title" content="${escapeHtml(opts.title || '')}" />`,
    `<meta property="og:description" content="${escapeHtml(opts.description || '')}" />`,
    opts.ogImage ? `<meta property="og:image" content="${escapeHtml(opts.ogImage)}" />` : '',
    opts.siteName ? `<meta property="og:site_name" content="${escapeHtml(opts.siteName)}" />` : '',
    ``,
    `<!-- Twitter -->`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    opts.canonicalUrl ? `<meta name="twitter:url" content="${escapeHtml(opts.canonicalUrl)}" />` : '',
    `<meta name="twitter:title" content="${escapeHtml(opts.title || '')}" />`,
    `<meta name="twitter:description" content="${escapeHtml(opts.description || '')}" />`,
    opts.ogImage ? `<meta name="twitter:image" content="${escapeHtml(opts.ogImage)}" />` : '',
    opts.twitterHandle ? `<meta name="twitter:site" content="${escapeHtml(opts.twitterHandle)}" />` : '',
  ];

  return lines.filter(Boolean).join('\n');
}
