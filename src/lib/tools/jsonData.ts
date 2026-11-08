export interface JsonValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
  type?: string;
  sizeBytes?: number;
  itemCount?: number;
}

export function formatJson(input: string, indent: number | string = 2): string {
  if (!input.trim()) return '';
  const parsed = JSON.parse(input);
  const space = typeof indent === 'string' ? indent : indent;
  return JSON.stringify(parsed, null, space);
}

export function minifyJson(input: string): string {
  if (!input.trim()) return '';
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

export function validateJson(input: string): JsonValidationResult {
  if (!input.trim()) {
    return { valid: false, error: 'Input is empty' };
  }
  try {
    const parsed = JSON.parse(input);
    const type = Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' && parsed !== null ? 'Object' : typeof parsed;
    const itemCount = Array.isArray(parsed) ? parsed.length : typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 1;
    const sizeBytes = new Blob([input]).size;

    return {
      valid: true,
      type,
      itemCount,
      sizeBytes,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    let line: number | undefined;
    let column: number | undefined;

    // Try to extract line and column from error message
    // e.g. "Unexpected token } in JSON at position 42" or "at line 2 column 5"
    const lineColMatch = message.match(/line (\d+) column (\d+)/i);
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    } else {
      const posMatch = message.match(/position (\d+)/i);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const lines = input.slice(0, pos).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
    }

    return {
      valid: false,
      error: message,
      line,
      column,
    };
  }
}

export function jsonToCsv(jsonString: string): string {
  if (!jsonString.trim()) return '';
  const data = JSON.parse(jsonString);
  const array = Array.isArray(data) ? data : [data];

  if (array.length === 0) return '';

  // Extract all unique headers (flattening 1 level of objects if needed)
  const headersSet = new Set<string>();
  const flatRows: Record<string, string>[] = [];

  for (const item of array) {
    const flatRow: Record<string, string> = {};
    if (typeof item !== 'object' || item === null) {
      flatRow['value'] = String(item);
      headersSet.add('value');
    } else {
      for (const [k, v] of Object.entries(item)) {
        if (typeof v === 'object' && v !== null) {
          flatRow[k] = JSON.stringify(v);
        } else {
          flatRow[k] = v === undefined || v === null ? '' : String(v);
        }
        headersSet.add(k);
      }
    }
    flatRows.push(flatRow);
  }

  const headers = Array.from(headersSet);
  const escapeCell = (val: string): string => {
    if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvLines = [headers.map(escapeCell).join(',')];

  for (const row of flatRows) {
    const rowValues = headers.map((h) => escapeCell(row[h] ?? ''));
    csvLines.push(rowValues.join(','));
  }

  return csvLines.join('\n');
}

export function csvToJson(csvString: string): string {
  if (!csvString.trim()) return '[]';

  // Parse CSV adhering to RFC 4180
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  const text = csvString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.some((field) => field.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((field) => field.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return '[]';

  const headers = rows[0].map((h) => h.trim());
  const result: Record<string, unknown>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j] || `column_${j + 1}`;
      const rawValue = row[j] !== undefined ? row[j] : '';
      
      // Auto-cast booleans and numbers where sensible
      const trimmed = rawValue.trim();
      if (trimmed === 'true') {
        obj[header] = true;
      } else if (trimmed === 'false') {
        obj[header] = false;
      } else if (trimmed === 'null') {
        obj[header] = null;
      } else if (!isNaN(Number(trimmed)) && trimmed !== '') {
        obj[header] = Number(trimmed);
      } else {
        obj[header] = rawValue;
      }
    }
    result.push(obj);
  }

  return JSON.stringify(result, null, 2);
}
