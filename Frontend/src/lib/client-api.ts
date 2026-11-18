const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || 'https://academicportal.fastapicloud.dev'
).replace(/\/+$/, '');

function normalizeToken(value: string | null | undefined): string | null {
  if (!value) return null;
  const token = value.trim().replace(/^Bearer\s+/i, '');
  if (!token || token.toLowerCase() === 'null' || token.toLowerCase() === 'undefined') {
    return null;
  }
  return token;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const primary = normalizeToken(localStorage.getItem('token'));
  if (primary) return primary;

  const legacy = normalizeToken(localStorage.getItem('access_token'));
  if (legacy) return legacy;

  // Recover tokens saved by older versions that persisted the whole Zustand state.
  try {
    const rawStore = localStorage.getItem('auth-storage');
    if (rawStore) {
      const parsed = JSON.parse(rawStore) as {
        state?: { token?: string; access_token?: string };
        token?: string;
        access_token?: string;
      };
      return normalizeToken(
        parsed.state?.token || parsed.state?.access_token || parsed.token || parsed.access_token,
      );
    }
  } catch {
    // Ignore malformed legacy state and let the caller handle a missing session.
  }

  return null;
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_role');
  document.cookie = 'token=; Max-Age=0; Path=/; SameSite=Lax';
  document.cookie = 'user_role=; Max-Age=0; Path=/; SameSite=Lax';
}

function resolveApiUrl(input: string): string {
  if (/^https?:\/\//i.test(input)) return input;
  const path = input.startsWith('/') ? input : `/${input}`;

  // Call FastAPI directly instead of relying on a Next.js rewrite to forward
  // the Authorization header. All API calls in this project use /api/v1.
  return `${API_ORIGIN}${path}`;
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});
  headers.set('Accept', headers.get('Accept') || 'application/json');

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(resolveApiUrl(input), {
    ...init,
    headers,
    // FastAPI authenticates these requests with Bearer tokens, not cookies.
    // Omitting cookies also keeps cross-origin CORS behavior predictable.
    credentials: init.credentials ?? 'omit',
    cache: init.cache ?? 'no-store',
  });

  if (response.status === 401 && token && typeof window !== 'undefined') {
    clearAuthSession();
    if (!window.location.pathname.startsWith('/auth/login')) {
      window.location.replace('/auth/login?reason=session-expired');
    }
  }

  return response;
}
