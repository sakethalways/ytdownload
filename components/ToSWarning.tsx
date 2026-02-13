'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ToSWarning() {
  return (
    <Alert className="border-red-500/50 bg-red-50 dark:bg-red-950/30 dark:border-red-600">
      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-500 flex-shrink-0" />
      <AlertTitle className="text-red-900 dark:text-red-200 text-sm sm:text-base">
        Legal Disclaimer
      </AlertTitle>
      <AlertDescription className="text-red-800 dark:text-red-300 text-xs sm:text-sm mt-2">
        Users are solely responsible for ensuring their use of downloaded content complies with
        YouTube's Terms of Service and all applicable copyright laws. The developers of this
        application disclaim all liability for unauthorized use, copyright infringement, or
        violations of YouTube's policies.
      </AlertDescription>
    </Alert>
  );
}
