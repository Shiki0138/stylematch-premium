'use client';

import * as Sentry from "@sentry/nextjs";
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをSentryに送信
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            エラーが発生しました
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            一時的な問題が発生しています。しばらく待ってからもう一度お試しください。
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-4 p-4 bg-red-50 rounded-md text-left">
              <p className="text-sm text-red-800 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full"
          >
            もう一度試す
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}