'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface DownloadProgressProps {
  isLoading: boolean;
  progress: number;
  error: string | null;
}

export function DownloadProgress({ isLoading, progress, error }: DownloadProgressProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && progress >= 99 && !error) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, progress, error]);

  // Show loading if currently downloading OR if there's progress, OR if showing success
  if (!isLoading && progress === 0 && !error && !showSuccess) {
    return null;
  }

  return (
    <Card className="p-3 sm:p-4 space-y-3">
      {error && (
        <div className="flex gap-2 sm:gap-3 items-start">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-destructive text-sm sm:text-base">Download Failed</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex gap-2 sm:gap-3 items-center">
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs sm:text-sm mb-1.5">Downloading...</p>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}%</p>
          </div>
        </div>
      )}

      {showSuccess && !isLoading && !error && (
        <div className="flex gap-2 sm:gap-3 items-center text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <p className="font-semibold text-xs sm:text-sm">Download complete! Check your downloads folder.</p>
        </div>
      )}
    </Card>
  );
}
