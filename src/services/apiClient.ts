const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3003';

if (__DEV__) {
  console.log('[apiClient] Using API base URL:', API_BASE_URL);
}

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

function linkAbortSignals(source: AbortSignal, target: AbortController) {
  if (source.aborted) {
    target.abort();
    return () => {};
  }

  const handler = () => target.abort();
  source.addEventListener('abort', handler);
  return () => source.removeEventListener('abort', handler);
}

export async function postJson<T>(
  path: string,
  body: unknown,
  { headers = {}, signal, timeoutMs = 20000 }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const detachLinkedSignal = signal ? linkAbortSignals(signal, controller) : undefined;

  const timeoutEnabled = Number.isFinite(timeoutMs) && timeoutMs > 0;
  const timeoutId = timeoutEnabled ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const errorBody = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;
      const baseMessage = `API request failed (${response.status} ${response.statusText})`;
      const message = errorBody?.message ?? baseMessage;
      const error = new Error(message) as Error & { code?: string };
      if (errorBody?.error) {
        error.code = errorBody.error;
      }
      throw error;
    }

    const detail = await response.text().catch(() => '');
    throw new Error(
      `API request failed (${response.status} ${response.statusText})${detail ? `\n${detail}` : ''}`,
    );
  }

  return (await response.json()) as T;
  } catch (error) {
    if (controller.signal.aborted) {
      const abortError = error instanceof Error ? error : new Error(String(error));
      if (abortError.name === 'AbortError') {
        abortError.message = 'Network request timed out';
      }
      throw abortError;
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (detachLinkedSignal) {
      detachLinkedSignal();
    }
  }
}

export { API_BASE_URL };
