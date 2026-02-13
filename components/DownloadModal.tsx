'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DownloadProgress } from './DownloadProgress';
import { X } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  isLoading: boolean;
  progress: number;
  error: string | null;
  onCancel: () => void;
  formatInfo?: {
    quality: string;
    codec: string;
    type: string;
  };
}

export function DownloadModal({
  isOpen,
  isLoading,
  progress,
  error,
  onCancel,
  formatInfo,
}: DownloadModalProps) {
  return (
    <Dialog open={isOpen && isLoading} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-full max-w-md mx-auto p-3 sm:p-6 gap-3 sm:gap-4" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-base sm:text-lg md:text-xl">
            {error ? 'Download Failed' : 'Downloading...'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {error ? error : `Progress: ${Math.round(progress)}%`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Format Info */}
          {!error && formatInfo && (
            <div className="bg-secondary/50 rounded-lg p-2 sm:p-3 space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground flex-shrink-0">Quality:</span>
                <span className="font-medium text-right">{formatInfo.quality}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground flex-shrink-0">Type:</span>
                <span className="font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs w-fit">
                  {formatInfo.type}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground flex-shrink-0">Codec:</span>
                <span className="font-medium text-xs text-right">{formatInfo.codec}</span>
              </div>
            </div>
          )}

          {/* Download Progress */}
          <DownloadProgress
            isLoading={isLoading}
            progress={progress}
            error={error}
          />

          {/* Cancel Button */}
          <Button
            onClick={onCancel}
            variant={error ? 'default' : 'outline'}
            className="w-full gap-2 text-xs sm:text-sm h-10 sm:h-auto py-2 sm:py-1"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
            {error ? 'Close' : 'Cancel Download'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
