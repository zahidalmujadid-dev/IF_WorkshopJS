const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type RequestOptions = RequestInit & { authenticated?: boolean };

function accessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('saku.accessToken');
}

function errorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== 'object' || payload === null || !('message' in payload)) {
    return fallback;
  }

  const message = (payload as { message?: unknown }).message;
  if (Array.isArray(message)) return message.filter(Boolean).join(' ');
  return typeof message === 'string' && message.trim() ? message : fallback;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authenticated = true, headers: inputHeaders, ...init } = options;
  const headers = new Headers(inputHeaders);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = authenticated ? accessToken() : null;
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : 'Network request failed.';
    throw new Error(`Tidak dapat menghubungi server. Periksa koneksi API lalu coba lagi. (${reason})`);
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    if (response.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('saku.accessToken');
      window.localStorage.removeItem('saku.user');
      window.dispatchEvent(new Event('saku:unauthorized'));
    }
    throw new Error(errorMessage(payload, `Permintaan gagal (${response.status}).`));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
