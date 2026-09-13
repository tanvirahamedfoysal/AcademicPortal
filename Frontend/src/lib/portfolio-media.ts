import type { PortfolioData } from '../types/public';

export const PORTFOLIO_MEDIA_PREFIX = '__PORTFOLIO_MEDIA_V1__:';
export const PORTFOLIO_GALLERY_LIMIT = 10;

export type PortfolioGalleryItem = {
  id: string;
  url: string;
  description: string;
  links: string[];
};

export type PortfolioMedia = {
  portfolioPhoto: string;
  gallery: PortfolioGalleryItem[];
  ownerUuid: string;
  researcherInfo: {
    fullName: string;
    occupation: string;
    designation: string;
    education: string;
  };
};

export const emptyPortfolioMedia: PortfolioMedia = {
  portfolioPhoto: '',
  gallery: [],
  ownerUuid: '',
  researcherInfo: { fullName: '', occupation: '', designation: '', education: '' },
};

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeLinks(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeString(item))
    .filter((item) => item.startsWith('http://') || item.startsWith('https://'))
    .slice(0, 8);
}

export function isPortfolioMediaEntry(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(PORTFOLIO_MEDIA_PREFIX);
}

export function getVisibleResearchInterests(interests?: string[] | null): string[] {
  return (Array.isArray(interests) ? interests : [])
    .filter((item) => typeof item === 'string' && item.trim() && !isPortfolioMediaEntry(item))
    .map((item) => item.trim());
}

export function parsePortfolioMedia(interests?: string[] | null): PortfolioMedia {
  const encoded = (Array.isArray(interests) ? interests : []).find(isPortfolioMediaEntry);
  if (!encoded) return { ...emptyPortfolioMedia, gallery: [] };

  try {
    const parsed = JSON.parse(encoded.slice(PORTFOLIO_MEDIA_PREFIX.length)) as Partial<PortfolioMedia>;
    const rawGallery = Array.isArray(parsed.gallery) ? parsed.gallery : [];
    const gallery = rawGallery
      .map((item, index) => {
        const candidate = item as Partial<PortfolioGalleryItem>;
        const url = normalizeString(candidate?.url);
        if (!url) return null;
        return {
          id: normalizeString(candidate?.id) || `gallery-${index}-${url}`,
          url,
          description: normalizeString(candidate?.description),
          links: normalizeLinks(candidate?.links),
        } satisfies PortfolioGalleryItem;
      })
      .filter((item): item is PortfolioGalleryItem => Boolean(item))
      .slice(0, PORTFOLIO_GALLERY_LIMIT);

    return {
      portfolioPhoto: normalizeString(parsed.portfolioPhoto),
      gallery,
      ownerUuid: normalizeString(parsed.ownerUuid),
      researcherInfo: {
        fullName: normalizeString(parsed.researcherInfo?.fullName),
        occupation: normalizeString(parsed.researcherInfo?.occupation),
        designation: normalizeString(parsed.researcherInfo?.designation),
        education: normalizeString(parsed.researcherInfo?.education),
      },
    };
  } catch {
    return { ...emptyPortfolioMedia, gallery: [] };
  }
}

export function withPortfolioMedia(interests: string[] | null | undefined, media: PortfolioMedia): string[] {
  const visible = getVisibleResearchInterests(interests);
  const normalized: PortfolioMedia = {
    portfolioPhoto: normalizeString(media.portfolioPhoto),
    ownerUuid: normalizeString(media.ownerUuid),
    researcherInfo: {
      fullName: normalizeString(media.researcherInfo?.fullName),
      occupation: normalizeString(media.researcherInfo?.occupation),
      designation: normalizeString(media.researcherInfo?.designation),
      education: normalizeString(media.researcherInfo?.education),
    },
    gallery: (Array.isArray(media.gallery) ? media.gallery : [])
      .filter((item) => Boolean(item?.url))
      .slice(0, PORTFOLIO_GALLERY_LIMIT)
      .map((item, index) => ({
        id: normalizeString(item.id) || `gallery-${index}-${item.url}`,
        url: normalizeString(item.url),
        description: normalizeString(item.description),
        links: normalizeLinks(item.links),
      })),
  };

  return [...visible, `${PORTFOLIO_MEDIA_PREFIX}${JSON.stringify(normalized)}`];
}

function optionalText(value?: string | null): string | null {
  const text = normalizeString(value);
  return text || null;
}

export function buildPortfolioUpdatePayload(
  portfolio: PortfolioData,
  researchInterests: string[] = Array.isArray(portfolio.research_interests) ? portfolio.research_interests : [],
) {
  return {
    school: optionalText(portfolio.school),
    college: optionalText(portfolio.college),
    public_bio: optionalText(portfolio.public_bio),
    research_description: optionalText(portfolio.research_description),
    research_interests: researchInterests,
    email: optionalText(portfolio.email),
    phone: optionalText(portfolio.phone),
    github_url: optionalText(portfolio.github_url),
    orcid_url: optionalText(portfolio.orcid_url),
    researchgate_url: optionalText(portfolio.researchgate_url),
    google_scholar_url: optionalText(portfolio.google_scholar_url),
    cv_url: optionalText(portfolio.cv_url),
    discord_url: optionalText(portfolio.discord_url),
    linkedin_url: optionalText(portfolio.linkedin_url),
    facebook_url: optionalText(portfolio.facebook_url),
    x_url: optionalText(portfolio.x_url),
    instagram_url: optionalText(portfolio.instagram_url),
  };
}
