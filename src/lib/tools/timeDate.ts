export interface TimestampDetails {
  seconds: number;
  milliseconds: number;
  iso: string;
  utc: string;
  local: string;
  relative: string;
  dayOfWeek: string;
}

export function parseTimestamp(input: string | number): TimestampDetails {
  let ms: number;

  if (typeof input === 'number') {
    ms = input < 10000000000 ? input * 1000 : input;
  } else {
    const trimmed = input.trim();
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      ms = trimmed.length <= 10 ? num * 1000 : num;
    } else {
      const parsed = Date.parse(trimmed);
      if (isNaN(parsed)) {
        throw new Error('Invalid date or timestamp format. Enter unix seconds (10 digits), milliseconds (13 digits), or ISO date.');
      }
      ms = parsed;
    }
  }

  const date = new Date(ms);
  const now = Date.now();
  const diffSec = Math.round((now - ms) / 1000);

  let relative = '';
  if (Math.abs(diffSec) < 60) {
    relative = diffSec >= 0 ? 'just now' : 'in a few seconds';
  } else if (Math.abs(diffSec) < 3600) {
    const mins = Math.round(Math.abs(diffSec) / 60);
    relative = diffSec > 0 ? `${mins} min${mins > 1 ? 's' : ''} ago` : `in ${mins} min${mins > 1 ? 's' : ''}`;
  } else if (Math.abs(diffSec) < 86400) {
    const hours = Math.round(Math.abs(diffSec) / 3600);
    relative = diffSec > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ago` : `in ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.round(Math.abs(diffSec) / 86400);
    relative = diffSec > 0 ? `${days} day${days > 1 ? 's' : ''} ago` : `in ${days} day${days > 1 ? 's' : ''}`;
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    relative,
    dayOfWeek: daysOfWeek[date.getDay()],
  };
}

export interface TimezoneEntry {
  tz: string;
  city: string;
  formattedTime: string;
  formattedDate: string;
  offset: string;
}

export const COMMON_TIMEZONES = [
  { tz: 'UTC', city: 'UTC (Coordinated Universal Time)' },
  { tz: 'America/New_York', city: 'New York (EDT/EST)' },
  { tz: 'America/Los_Angeles', city: 'San Francisco / LA (PDT/PST)' },
  { tz: 'America/Chicago', city: 'Chicago (CDT/CST)' },
  { tz: 'Europe/London', city: 'London (BST/GMT)' },
  { tz: 'Europe/Paris', city: 'Paris / Berlin (CEST/CET)' },
  { tz: 'Asia/Tokyo', city: 'Tokyo (JST)' },
  { tz: 'Asia/Singapore', city: 'Singapore (SGT)' },
  { tz: 'Asia/Dubai', city: 'Dubai (GST)' },
  { tz: 'Asia/Kolkata', city: 'India (IST)' },
  { tz: 'Australia/Sydney', city: 'Sydney (AEST/AEDT)' },
];

export function convertTimezone(date: Date, targetTimezone: string): TimezoneEntry {
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTimezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTimezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });

  const tzNameFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTimezone,
    timeZoneName: 'shortOffset',
  });

  const parts = tzNameFormatter.formatToParts(date);
  const offset = parts.find((p) => p.type === 'timeZoneName')?.value || '';

  return {
    tz: targetTimezone,
    city: targetTimezone.replace('_', ' ').split('/').pop() || targetTimezone,
    formattedTime: timeFormatter.format(date),
    formattedDate: dateFormatter.format(date),
    offset,
  };
}

export interface CronExplanation {
  valid: boolean;
  summary: string;
  fields: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
  error?: string;
}

export function explainCron(expression: string): CronExplanation {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      valid: false,
      summary: 'Invalid cron format. A standard cron expression must have exactly 5 fields.',
      fields: { minute: '', hour: '', dayOfMonth: '', month: '', dayOfWeek: '' },
      error: 'Expected 5 fields: minute (0-59), hour (0-23), day of month (1-31), month (1-12), day of week (0-7).',
    };
  }

  const [min, hour, dom, mon, dow] = parts;

  const explainField = (val: string, name: string): string => {
    if (val === '*') return `Every ${name}`;
    if (val.startsWith('*/')) return `Every ${val.slice(2)} ${name}s`;
    if (val.includes(',')) return `At ${name}s ${val}`;
    if (val.includes('-')) return `From ${name} ${val.replace('-', ' through ')}`;
    return `At ${name} ${val}`;
  };

  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  let summary = '';
  if (min === '*' && hour === '*') {
    summary = 'Runs every minute of every hour';
  } else if (min.startsWith('*/') && hour === '*') {
    summary = `Runs every ${min.slice(2)} minutes`;
  } else if (min === '0' && hour.startsWith('*/')) {
    summary = `Runs every ${hour.slice(2)} hours at minute 0`;
  } else if (min === '0' && hour === '0') {
    summary = 'Runs at midnight (00:00) every day';
  } else if (min === '0' && hour !== '*') {
    summary = `Runs at ${hour.padStart(2, '0')}:00 every day`;
  } else {
    summary = `Runs at ${hour}:${min} on ${dom === '*' ? 'every day of month' : `day ${dom}`} in ${mon === '*' ? 'every month' : months[parseInt(mon, 10)] || mon}, on ${dow === '*' ? 'every day of week' : days[parseInt(dow, 10)] || dow}`;
  }

  return {
    valid: true,
    summary,
    fields: {
      minute: explainField(min, 'minute'),
      hour: explainField(hour, 'hour'),
      dayOfMonth: explainField(dom, 'day of month'),
      month: mon === '*' ? 'Every month' : months[parseInt(mon, 10)] ? `In ${months[parseInt(mon, 10)]}` : explainField(mon, 'month'),
      dayOfWeek: dow === '*' ? 'Every day of the week' : days[parseInt(dow, 10)] ? `On ${days[parseInt(dow, 10)]}` : explainField(dow, 'day of week'),
    },
  };
}

export interface DateDiffResult {
  days: number;
  weeks: number;
  hours: number;
  minutes: number;
  formattedDiff: string;
}

export function calculateDateDiff(startDate: Date, endDate: Date): DateDiffResult {
  const diffMs = endDate.getTime() - startDate.getTime();
  const absDiff = Math.abs(diffMs);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor(absDiff / (1000 * 60));

  const prefix = diffMs < 0 ? 'Negative (' : '';
  const suffix = diffMs < 0 ? ' in the past)' : '';

  return {
    days,
    weeks,
    hours,
    minutes,
    formattedDiff: `${prefix}${days} days (${weeks} weeks, ${days % 7} days)${suffix}`,
  };
}

export function addSubtractDate(
  baseDate: Date,
  amount: number,
  unit: 'days' | 'weeks' | 'months' | 'years'
): Date {
  const result = new Date(baseDate.getTime());
  if (unit === 'days') {
    result.setDate(result.getDate() + amount);
  } else if (unit === 'weeks') {
    result.setDate(result.getDate() + amount * 7);
  } else if (unit === 'months') {
    result.setMonth(result.getMonth() + amount);
  } else if (unit === 'years') {
    result.setFullYear(result.getFullYear() + amount);
  }
  return result;
}
