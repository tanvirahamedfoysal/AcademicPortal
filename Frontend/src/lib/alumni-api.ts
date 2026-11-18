import { apiFetch } from './client-api';

export async function updateStudentAlumni(uuid: string, isAlumni: boolean): Promise<void> {
  const response = await apiFetch(`/api/v1/students/${encodeURIComponent(uuid)}/alumni`, {
    method: 'PATCH',
    body: JSON.stringify({ is_alumni: isAlumni }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (response.status === 404 || response.status === 405) {
      throw new Error(
        'তানভির এখনো আপডেট কর নায়, খালি আলুমনি আছে কিনা দেখা যায়'
      );
    }
    throw new Error(payload.detail || payload.message || 'Could not update this student’s alumni status.');
  }
}
