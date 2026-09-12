export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('access_token');
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(input, { ...init, headers });
}
