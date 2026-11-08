import React from 'react';

interface BrandLogoProps {
  variant?: 'symbol' | 'full' | 'compact' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: { symbol: 'w-5 h-5', full: 'h-6', text: 'text-sm' },
    md: { symbol: 'w-6 h-6', full: 'h-7', text: 'text-base' },
    lg: { symbol: 'w-8 h-8', full: 'h-9', text: 'text-xl' },
    xl: { symbol: 'w-12 h-12', full: 'h-14', text: 'text-3xl' },
  };

  const currentSize = sizeMap[size];

  if (variant === 'wordmark') {
    return (
      <div className={`flex flex-col text-left ${className}`}>
        <span
          className={`font-extrabold tracking-tight text-neutral-950 dark:text-white leading-none ${currentSize.text}`}
        >
          ZELVIOR
        </span>
        <span className="font-mono text-[9px] tracking-widest text-neutral-500 dark:text-neutral-400 font-bold uppercase leading-tight mt-0.5">
          DevKit
        </span>
      </div>
    );
  }

  if (variant === 'symbol' || variant === 'compact') {
    return (
      <svg
        className={`${currentSize.symbol} shrink-0 text-neutral-900 dark:text-white ${className}`}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon
          points="64,6 118,34 118,94 64,122 10,94 10,34"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
          fill="none"
          opacity="0.2"
        />
        <path
          d="M64 12 L112 37 V91 L64 116 L16 91 V37 Z"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M38 38 H90 L46 90 H90"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />
        <polygon points="46,38 34,44 46,50" fill="currentColor" />
        <polygon points="82,78 94,84 82,90" fill="currentColor" />
        <circle cx="68" cy="64" r="5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        className={`${currentSize.symbol} shrink-0 text-neutral-900 dark:text-white`}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon
          points="64,6 118,34 118,94 64,122 10,94 10,34"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
          fill="none"
          opacity="0.2"
        />
        <path
          d="M64 12 L112 37 V91 L64 116 L16 91 V37 Z"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M38 38 H90 L46 90 H90"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />
        <polygon points="46,38 34,44 46,50" fill="currentColor" />
        <polygon points="82,78 94,84 82,90" fill="currentColor" />
        <circle cx="68" cy="64" r="5" fill="currentColor" />
      </svg>
      <div className="flex flex-col text-left">
        <span
          className={`font-extrabold tracking-tight text-neutral-950 dark:text-white leading-none ${currentSize.text}`}
        >
          ZELVIOR
        </span>
        <span className="font-mono text-[9px] tracking-widest text-neutral-500 dark:text-neutral-400 font-bold uppercase leading-tight mt-0.5">
          DevKit
        </span>
      </div>
    </div>
  );
};
