import { mapWithConcurrency, parseAlumniFlag } from './alumni-utils';
import type {
  ApiEnvelope,
  ContactMeta,
  PortfolioData,
  PublicArticleDetail,
  PublicArticleSummary,
  PublicCollaborator,
  PublicStudent,
  PublicLabMember,
  RepositoryDocument,
} from '../types/public';

const API_ORIGIN = process.env.FASTAPI_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://academicportal.fastapicloud.dev';
const API_PREFIX = process.env.FASTAPI_API_PREFIX || '/api/v1';
const API_BASE = `${API_ORIGIN}${API_PREFIX}`;

async function getPublicJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}

export async function getPortfolio(): Promise<PortfolioData | null> {
  const payload = await getPublicJson<ApiEnvelope<PortfolioData>>('/portfolio');
  return payload?.data ?? null;
}

export async function getPublicArticles(): Promise<PublicArticleSummary[]> {
  const payload = await getPublicJson<ApiEnvelope<PublicArticleSummary[]>>('/articles/public');
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getPublicArticle(articleId: string): Promise<PublicArticleDetail | null> {
  const payload = await getPublicJson<ApiEnvelope<PublicArticleDetail>>(`/articles/public/${encodeURIComponent(articleId)}`);
  return payload?.data ?? null;
}

export async function getCollaborators(): Promise<PublicCollaborator[]> {
  const payload = await getPublicJson<ApiEnvelope<PublicCollaborator[]>>('/collaborators');
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getStudents(): Promise<PublicStudent[]> {
  const payload = await getPublicJson<unknown>('/students');
  const rows = unwrapArray<PublicStudent>(payload);
  return rows.filter((student) => !student.status || String(student.status).toUpperCase() === 'ACTIVE');
}

async function getAlumniFlagForPublicProfile(uuid: string): Promise<boolean> {
  const payload = await getPublicJson<unknown>(`/profile/is-alumni/${encodeURIComponent(uuid)}`);
  return parseAlumniFlag(payload) ?? false;
}

async function getActiveStudents(): Promise<PublicLabMember[]> {
  const payload = await getPublicJson<unknown>('/students');
  const rows = unwrapArray<PublicLabMember>(payload);
  const activeRows = rows.filter((student) => !student.status || String(student.status).toUpperCase() === 'ACTIVE');

  // Normalize booleans/strings/numbers consistently. If /students omits the
  // field, fall back to the documented profile check endpoint where public access permits it.
  return mapWithConcurrency(activeRows, 8, async (student) => {
    const fromList = parseAlumniFlag(student.is_alumni);
    if (fromList !== null) return { ...student, is_alumni: fromList };
    return { ...student, is_alumni: await getAlumniFlagForPublicProfile(student.uuid) };
  });
}

export async function getLabMemberDirectory(): Promise<{ members: PublicLabMember[]; alumni: PublicLabMember[] }> {
  const rows = await getActiveStudents();
  return {
    members: rows.filter((member) => member.is_alumni !== true),
    alumni: rows.filter((member) => member.is_alumni === true),
  };
}

export async function getRepositoryDocuments(): Promise<RepositoryDocument[]> {
  const payload = await getPublicJson<ApiEnvelope<RepositoryDocument[]>>('/repository/documents');
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getContactMeta(): Promise<ContactMeta | null> {
  const payload = await getPublicJson<ApiEnvelope<ContactMeta>>('/contact/meta');
  return payload?.data ?? null;
}
