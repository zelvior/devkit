import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string; compact?: boolean }> = ({
  className = '',
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}`}
          title="Install Zelvior DevKit as a standalone desktop/mobile app"
        >
          <Download className="w-3.5 h-3.5 text-neutral-500" />
          <span>{compact ? 'Install' : 'Install App'}</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium text-xs transition-colors border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}`}
            title="Install on iPhone / iPad"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Install on iOS</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
              <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Install on iPhone / iPad
                  </h3>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-2.5 leading-relaxed">
                  <p>
                    1. Tap the <strong>Share</strong> icon (square with arrow pointing up) in Safari.
                  </p>
                  <p>
                    2. Scroll down in the action sheet and select <strong>&quot;Add to Home Screen&quot;</strong>.
                  </p>
                  <p>
                    3. Tap <strong>Add</strong> in the top-right corner to launch DevKit directly from your home screen with zero browser chrome.
                  </p>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold rounded-lg text-xs"
                >
                  Got It
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
