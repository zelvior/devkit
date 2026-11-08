export type SitemapChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SitemapEntry {
  id: string;
  loc: string;
  lastmod: string;
  changefreq: SitemapChangeFreq;
  priority: number;
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSitemapXml(entries: SitemapEntry[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const entry of entries) {
    if (!entry.loc.trim()) continue;

    let cleanUrl = entry.loc.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(cleanUrl)}</loc>`);
    if (entry.lastmod) {
      lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    }
    if (entry.changefreq) {
      lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    }
    if (typeof entry.priority === 'number') {
      const clamped = Math.max(0, Math.min(1, entry.priority));
      lines.push(`    <priority>${clamped.toFixed(1)}</priority>`);
    }
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

export function parseBulkUrls(
  text: string,
  defaultFreq: SitemapChangeFreq = 'monthly',
  defaultPriority = 0.8
): SitemapEntry[] {
  if (!text.trim()) return [];

  const rawLines = text.split(/[\r\n,]+/).map((l) => l.trim()).filter(Boolean);
  const todayIso = new Date().toISOString().split('T')[0];

  return rawLines.map((line, index) => {
    let url = line;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    // Determine smart priority: root/home gets 1.0, subpages get default
    let calculatedPriority = defaultPriority;
    try {
      const parsed = new URL(url);
      if (parsed.pathname === '/' || parsed.pathname === '') {
        calculatedPriority = 1.0;
      }
    } catch (e) {
      // ignore
    }

    return {
      id: `url-${Date.now()}-${index}`,
      loc: url,
      lastmod: todayIso,
      changefreq: calculatedPriority === 1.0 ? 'daily' : defaultFreq,
      priority: calculatedPriority,
    };
  });
}
