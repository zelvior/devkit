import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-mono ${className}`}
      title="This tool executes 100% locally in your browser. No code, keys, or data are transmitted over the network."
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      <span>100% Client-Side · Zero Telemetry</span>
    </div>
  );
};
