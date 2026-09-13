import type {
  ApiEnvelope,
  ContactMeta,
  PortfolioData,
  PublicArticleDetail,
  PublicArticleSummary,
  PublicCollaborator,
  PublicStudent,
  RepositoryDocument,
} from '../types/public';

const API_ORIGIN = process.env.FASTAPI_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://academic-portal-16620c77.fastapicloud.dev';
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
  const payload = await getPublicJson<ApiEnvelope<PublicStudent[]>>('/students');
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows.filter((student) => !student.status || String(student.status).toUpperCase() === 'ACTIVE');
}

export async function getRepositoryDocuments(): Promise<RepositoryDocument[]> {
  const payload = await getPublicJson<ApiEnvelope<RepositoryDocument[]>>('/repository/documents');
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getContactMeta(): Promise<ContactMeta | null> {
  const payload = await getPublicJson<ApiEnvelope<ContactMeta>>('/contact/meta');
  return payload?.data ?? null;
}
