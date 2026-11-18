import { apiFetch } from './client-api';
import { mapWithConcurrency, parseAlumniFlag } from './alumni-utils';

async function readErrorMessage(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null) as
    | { detail?: unknown; message?: unknown }
    | null;

  if (typeof payload?.detail === 'string') return payload.detail;
  if (typeof payload?.message === 'string') return payload.message;
  return `Alumni request failed (${response.status}).`;
}

/** Reads the persisted is_alumni value for one profile using the documented GET endpoint. */
export async function checkStudentIsAlumni(uuid: string): Promise<boolean> {
  const response = await apiFetch(`/api/v1/profile/is-alumni/${encodeURIComponent(uuid)}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(await readErrorMessage(response));

  const payload: unknown = await response.json().catch(() => null);
  const flag = parseAlumniFlag(payload);
  if (flag === null) {
    throw new Error('The alumni check endpoint returned an unexpected response.');
  }
  return flag;
}

/** Calls the exact POST operation exposed by FastAPI for making or removing an alumnus. */
export async function updateStudentAlumni(uuid: string, isAlumni: boolean): Promise<void> {
  const encodedUuid = encodeURIComponent(uuid);
  const endpoint = isAlumni
    ? `/api/v1/profile/make-alumni/${encodedUuid}`
    : `/api/v1/profile/remove-alumni/${encodedUuid}`;
  const response = await apiFetch(endpoint, { method: 'POST' });

  if (!response.ok) throw new Error(await readErrorMessage(response));
}

/**
 * Normalize statuses from /students. Some API responses may omit is_alumni;
 * in that case use the dedicated profile check endpoint. A failed check does
 * not prevent the rest of the student list from rendering.
 */
export async function addAlumniStatusToStudents<T extends { uuid: string; is_alumni?: unknown }>(
  students: T[],
): Promise<Array<T & { is_alumni: boolean }>> {
  return mapWithConcurrency(students, 8, async (student) => {
    try {
      // Prefer the dedicated GET endpoint so the Admin/Moderator action label
      // reflects the backend's persisted flag, not a potentially stale list value.
      const isAlumni = await checkStudentIsAlumni(student.uuid);
      return { ...student, is_alumni: isAlumni };
    } catch (error) {
      console.warn(`Could not check alumni status for profile ${student.uuid}:`, error);
      // Keep the list usable when the check endpoint is temporarily unavailable.
      return { ...student, is_alumni: parseAlumniFlag(student.is_alumni) ?? false };
    }
  });
}
