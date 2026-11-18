import { apiFetch, clearAuthSession, getAccessToken } from './client-api';
import { mapWithConcurrency, parseAlumniFlag } from './alumni-utils';

interface JwtClaims {
  exp?: number;
  user_role?: string;
  role?: string;
}

function decodeJwtClaims(token: string): JwtClaims | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtClaims;
  } catch {
    return null;
  }
}

function requireModeratorSession(): void {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Your login session is missing. Please sign in again as an Admin or Moderator.');
  }

  const claims = decodeJwtClaims(token);
  if (!claims) {
    clearAuthSession();
    if (typeof window !== 'undefined') window.location.replace('/auth/login?reason=session-expired');
    throw new Error('Your login token is invalid. Please sign in again.');
  }

  if (typeof claims.exp === 'number' && claims.exp <= Math.floor(Date.now() / 1000)) {
    clearAuthSession();
    if (typeof window !== 'undefined') window.location.replace('/auth/login?reason=session-expired');
    throw new Error('Your login session has expired. Please sign in again.');
  }

  const role = String(claims.user_role || claims.role || '').toUpperCase();
  if (role && role !== 'ADMIN' && role !== 'MODERATOR') {
    throw new Error('Only an Admin or Moderator account can change alumni status.');
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null) as
    | { detail?: unknown; message?: unknown }
    | null;

  if (typeof payload?.detail === 'string') return payload.detail;
  if (typeof payload?.message === 'string') return payload.message;
  if (response.status === 401) {
    return 'The backend rejected your login token. Please sign in again as an Admin or Moderator.';
  }
  if (response.status === 403) {
    return 'Your account is not allowed to manage alumni status. Sign in with an Admin or Moderator account.';
  }
  return `Alumni request failed (${response.status}).`;
}

/** Reads the persisted is_alumni value from the protected FastAPI GET endpoint. */
export async function checkStudentIsAlumni(uuid: string): Promise<boolean> {
  requireModeratorSession();
  const response = await apiFetch(`/api/v1/profile/is-alumni/${encodeURIComponent(uuid)}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error(await readErrorMessage(response));

  const payload: unknown = await response.json().catch(() => null);
  const flag = parseAlumniFlag(payload);
  if (flag === null) {
    throw new Error('The alumni check endpoint returned an unexpected response.');
  }
  return flag;
}

/** Calls the POST endpoint matching the requested status and verifies its returned flag. */
export async function updateStudentAlumni(uuid: string, isAlumni: boolean): Promise<void> {
  requireModeratorSession();

  const endpoint = isAlumni
    ? `/api/v1/profile/make-alumni/${encodeURIComponent(uuid)}`
    : `/api/v1/profile/remove-alumni/${encodeURIComponent(uuid)}`;
  const response = await apiFetch(endpoint, { method: 'POST' });

  if (!response.ok) throw new Error(await readErrorMessage(response));

  const payload: unknown = await response.json().catch(() => null);
  const returnedFlag = parseAlumniFlag(payload);
  if (returnedFlag !== null && returnedFlag !== isAlumni) {
    throw new Error('The server response did not confirm the requested alumni status. Refresh and try again.');
  }
}

/**
 * The /students endpoint currently omits is_alumni in the provided backend source.
 * Read each flag from the protected check endpoint so Admin/Moderator dashboards
 * show the persisted value rather than assuming every student is not an alumnus.
 */
export async function addAlumniStatusToStudents<T extends { uuid: string; is_alumni?: unknown }>(
  students: T[],
): Promise<Array<T & { is_alumni: boolean }>> {
  return mapWithConcurrency(students, 6, async (student) => {
    const suppliedFlag = parseAlumniFlag(student.is_alumni);
    if (suppliedFlag !== null) return { ...student, is_alumni: suppliedFlag };

    try {
      const isAlumni = await checkStudentIsAlumni(student.uuid);
      return { ...student, is_alumni: isAlumni };
    } catch (error) {
      console.warn(`Could not check alumni status for profile ${student.uuid}:`, error);
      return { ...student, is_alumni: false };
    }
  });
}
