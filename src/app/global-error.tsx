'use client';

import * as Sentry from "@sentry/nextjs";
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
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
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                申し訳ございません
              </h1>
              <h2 className="mt-2 text-center text-xl text-gray-600">
                予期せぬエラーが発生しました
              </h2>
              <p className="mt-2 text-center text-sm text-gray-500">
                エラーは自動的に報告されました。ご不便をおかけして申し訳ございません。
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-red-50 rounded-md">
                  <p className="text-sm text-red-800 font-mono">
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
            <div className="mt-8 space-y-6">
              <Button
                onClick={reset}
                className="w-full flex justify-center py-2 px-4"
              >
                もう一度試す
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full flex justify-center py-2 px-4"
              >
                ホームに戻る
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}