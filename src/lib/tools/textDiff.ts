export type CaseType =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant';

export function convertCase(text: string, type: CaseType): string {
  if (!text) return '';

  const words = text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/);

  switch (type) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    case 'camel':
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join('');
    case 'pascal':
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
    case 'snake':
      return words.map((w) => w.toLowerCase()).join('_');
    case 'kebab':
      return words.map((w) => w.toLowerCase()).join('-');
    case 'constant':
      return words.map((w) => w.toUpperCase()).join('_');
    default:
      return text;
  }
}

export interface TextStatistics {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

export function countText(text: string): TextStatistics {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim() ? (text.trim().match(/\S+/g) || []).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;
  const readingTimeMinutes = Math.ceil(words / 200);

  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    paragraphs,
    readingTimeMinutes,
  };
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  oldLineNumber?: number;
  newLineNumber?: number;
  value: string;
}

export function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  // Longest Common Subsequence (LCS) matrix
  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const diff: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diff.unshift({
        type: 'unchanged',
        oldLineNumber: i,
        newLineNumber: j,
        value: oldLines[i - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        type: 'added',
        newLineNumber: j,
        value: newLines[j - 1],
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({
        type: 'removed',
        oldLineNumber: i,
        value: oldLines[i - 1],
      });
      i--;
    }
  }

  return diff;
}

export function removeDuplicateLines(
  text: string,
  caseSensitive = true,
  trimSpaces = false
): { output: string; removedCount: number } {
  if (!text) return { output: '', removedCount: 0 };

  const lines = text.split('\n');
  const seen = new Set<string>();
  const uniqueLines: string[] = [];
  let removedCount = 0;

  for (const line of lines) {
    const key = trimSpaces ? line.trim() : line;
    const compareKey = caseSensitive ? key : key.toLowerCase();

    if (seen.has(compareKey)) {
      removedCount++;
    } else {
      seen.add(compareKey);
      uniqueLines.push(line);
    }
  }

  return {
    output: uniqueLines.join('\n'),
    removedCount,
  };
}

export type SortMode = 'alpha' | 'numeric' | 'natural' | 'length';
export type SortOrder = 'asc' | 'desc';

export function sortTextLines(
  text: string,
  mode: SortMode = 'alpha',
  order: SortOrder = 'asc',
  removeEmpty = false
): string {
  if (!text) return '';

  let lines = text.split('\n');
  if (removeEmpty) {
    lines = lines.filter((l) => l.trim().length > 0);
  }

  lines.sort((a, b) => {
    let comparison = 0;
    if (mode === 'numeric') {
      const numA = parseFloat(a.replace(/[^0-9.-]+/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^0-9.-]+/g, '')) || 0;
      comparison = numA - numB;
    } else if (mode === 'natural') {
      comparison = a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    } else if (mode === 'length') {
      comparison = a.length - b.length;
    } else {
      // standard alphabetical
      comparison = a.localeCompare(b);
    }
    return order === 'asc' ? comparison : -comparison;
  });

  return lines.join('\n');
}
