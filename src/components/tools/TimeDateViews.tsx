import React, { useState, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  parseTimestamp,
  TimestampDetails,
  COMMON_TIMEZONES,
  convertTimezone,
  TimezoneEntry,
  explainCron,
  CronExplanation,
  calculateDateDiff,
  DateDiffResult,
  addSubtractDate,
} from '../../lib/tools/timeDate';
import { CopyButton } from '../ui/CopyButton';
import { Clock, Calendar, ArrowRight, RotateCcw } from 'lucide-react';

export const TimeDateViews: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [input, setInput] = useState(tool.sampleInput || '');

  // Timestamp state
  const [tsDetails, setTsDetails] = useState<TimestampDetails | null>(null);
  const [tsError, setTsError] = useState<string | null>(null);

  // Timezone state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tzEntries, setTzEntries] = useState<TimezoneEntry[]>([]);

  // Cron state
  const [cronExplanation, setCronExplanation] = useState<CronExplanation | null>(null);

  // Date diff state
  const [date1, setDate1] = useState(new Date().toISOString().split('T')[0]);
  const [date2, setDate2] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]
  );
  const [dateDiff, setDateDiff] = useState<DateDiffResult | null>(null);

  // Add/Subtract state
  const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [calcAmount, setCalcAmount] = useState(14);
  const [calcUnit, setCalcUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const [calcOperation, setCalcOperation] = useState<'add' | 'subtract'>('add');
  const [calcResultDate, setCalcResultDate] = useState<Date>(new Date());

  useEffect(() => {
    setInput(tool.sampleInput || '');
  }, [tool.id]);

  // Compute timestamp
  useEffect(() => {
    if (tool.id === 'unix-timestamp') {
      if (!input.trim()) {
        setTsDetails(null);
        setTsError(null);
        return;
      }
      try {
        setTsError(null);
        setTsDetails(parseTimestamp(input));
      } catch (err: unknown) {
        setTsError(err instanceof Error ? err.message : String(err));
        setTsDetails(null);
      }
    }
  }, [input, tool.id]);

  // Compute timezone
  useEffect(() => {
    if (tool.id === 'timezone-converter') {
      const list = COMMON_TIMEZONES.map((item) => convertTimezone(selectedDate, item.tz));
      setTzEntries(list);
    }
  }, [selectedDate, tool.id]);

  // Compute cron
  useEffect(() => {
    if (tool.id === 'cron-explainer') {
      if (!input.trim()) {
        setCronExplanation(null);
        return;
      }
      setCronExplanation(explainCron(input));
    }
  }, [input, tool.id]);

  // Compute date diff
  useEffect(() => {
    if (tool.id === 'date-calculator') {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
        setDateDiff(calculateDateDiff(d1, d2));
      }

      const base = new Date(baseDate);
      if (!isNaN(base.getTime())) {
        const factor = calcOperation === 'add' ? calcAmount : -calcAmount;
        setCalcResultDate(addSubtractDate(base, factor, calcUnit));
      }
    }
  }, [date1, date2, baseDate, calcAmount, calcUnit, calcOperation, tool.id]);

  // 1. Unix Timestamp Converter View
  if (tool.id === 'unix-timestamp') {
    const handleSetNow = () => {
      setInput(String(Math.floor(Date.now() / 1000)));
    };

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Unix Epoch or ISO 8601 Date
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSetNow}
                className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-medium rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Now ({Math.floor(Date.now() / 1000)})
              </button>
              <button onClick={() => setInput('')} className="text-xs text-neutral-500 hover:text-red-500 px-2 py-1">
                Clear
              </button>
            </div>
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 1772971200 or 2026-11-08T12:00:00Z"
            className="w-full px-4 py-3 font-mono text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />

          {tsError && (
            <div className="p-3 text-red-500 bg-red-500/10 rounded border border-red-500/20 text-xs font-mono">
              {tsError}
            </div>
          )}
        </div>

        {tsDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Seconds (Epoch)', val: String(tsDetails.seconds) },
              { label: 'Milliseconds', val: String(tsDetails.milliseconds) },
              { label: 'ISO 8601 (UTC)', val: tsDetails.iso },
              { label: 'UTC String', val: tsDetails.utc },
              { label: 'Local Browser Time', val: tsDetails.local },
              { label: 'Relative Age', val: `${tsDetails.relative} (${tsDetails.dayOfWeek})` },
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
        )}
      </div>
    );
  }

  // 2. Timezone Converter View
  if (tool.id === 'timezone-converter') {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Reference Time:
            </span>
            <input
              type="datetime-local"
              value={new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs"
            />
          </div>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-md font-medium text-xs self-start sm:self-auto"
          >
            Reset to Current Time
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tzEntries.map((item) => (
            <div
              key={item.tz}
              className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                    {item.city}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">{item.offset}</span>
                </div>
                <div className="font-mono text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1">
                  {item.formattedTime}
                </div>
                <div className="text-xs text-neutral-500 font-medium">{item.formattedDate}</div>
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex justify-end">
                <CopyButton textToCopy={`${item.formattedDate} ${item.formattedTime} (${item.offset})`} label="Copy" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Cron Expression Explainer View
  if (tool.id === 'cron-explainer') {
    const presets = [
      { label: 'Every minute', cron: '* * * * *' },
      { label: 'Every 15 mins', cron: '*/15 * * * *' },
      { label: 'Every hour', cron: '0 * * * *' },
      { label: 'Daily at midnight', cron: '0 0 * * *' },
      { label: 'Mon-Fri at 9 AM', cron: '0 9 * * 1-5' },
      { label: 'Weekly on Sunday', cron: '0 0 * * 0' },
    ];

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Standard 5-Part Cron Expression
            </span>
            <button onClick={() => setInput('')} className="text-xs text-neutral-500 hover:text-red-500">
              Clear
            </button>
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="* * * * *"
            className="w-full px-4 py-3 font-mono text-base font-bold tracking-widest text-center rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[11px] text-neutral-400 mr-1">Presets:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setInput(p.cron)}
                className="px-2.5 py-1 text-[11px] rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {cronExplanation && (
          <div className="space-y-4">
            {/* Natural language summary */}
            <div
              className={`p-6 rounded-xl border text-sm ${
                cronExplanation.valid
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-medium'
                  : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 font-mono text-xs'
              }`}
            >
              {cronExplanation.summary}
            </div>

            {/* Field-by-field breakdown */}
            {cronExplanation.valid && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {[
                  { field: 'Minute', val: cronExplanation.fields.minute },
                  { field: 'Hour', val: cronExplanation.fields.hour },
                  { field: 'Day of Month', val: cronExplanation.fields.dayOfMonth },
                  { field: 'Month', val: cronExplanation.fields.month },
                  { field: 'Day of Week', val: cronExplanation.fields.dayOfWeek },
                ].map((f) => (
                  <div
                    key={f.field}
                    className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                  >
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      {f.field}
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {f.val}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 4. Date Calculator View
  return (
    <div className="space-y-8">
      {/* Date Difference Module */}
      <div className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-5">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          Calculate Difference Between Two Dates
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-500 mb-1">Start Date</label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-neutral-500 mb-1">End Date</label>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs"
            />
          </div>
        </div>

        {dateDiff && (
          <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                {dateDiff.days} Days
              </span>
              <span className="text-xs text-neutral-500 block mt-0.5">
                {dateDiff.weeks} weeks, or {dateDiff.hours} hours
              </span>
            </div>
            <CopyButton textToCopy={`${dateDiff.days} days`} label="Copy Diff" />
          </div>
        )}
      </div>

      {/* Add / Subtract Duration Module */}
      <div className="p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-5">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          Add or Subtract Date Offset
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-neutral-500 mb-1">Base Date</label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-neutral-500 mb-1">Operation</label>
            <select
              value={calcOperation}
              onChange={(e) => setCalcOperation(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs"
            >
              <option value="add">+ Add</option>
              <option value="subtract">- Subtract</option>
            </select>
          </div>
          <div>
            <label className="block text-neutral-500 mb-1">Amount</label>
            <input
              type="number"
              min="1"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-neutral-500 mb-1">Unit</label>
            <select
              value={calcUnit}
              onChange={(e) => setCalcUnit(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block font-semibold uppercase tracking-wider mb-1">
              Resulting Date
            </span>
            <span className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {calcResultDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <CopyButton textToCopy={calcResultDate.toISOString().split('T')[0]} label="Copy Date" />
        </div>
      </div>
    </div>
  );
};
