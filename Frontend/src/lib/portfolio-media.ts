import type { PortfolioData } from '../types/public';

export const PORTFOLIO_MEDIA_PREFIX = '__PORTFOLIO_MEDIA_V1__:';
export const PORTFOLIO_GALLERY_LIMIT = 10;
export const PORTFOLIO_CUSTOM_SECTION_LIMIT = 20;

export type PortfolioGalleryItem = {
  id: string;
  url: string;
  description: string;
  links: string[];
};

export type PortfolioQuickInfoSource =
  | 'full_name'
  | 'occupation'
  | 'designation'
  | 'education'
  | 'school'
  | 'college'
  | 'phone'
  | 'email'
  | 'research_interests';

export type PortfolioQuickInfoItem = {
  id: string;
  label: string;
  value: string;
  source?: PortfolioQuickInfoSource | null;
};

export type PortfolioCustomSectionItem = {
  id: string;
  name: string;
  description: string;
  link: string;
};

export type PortfolioCustomSection = {
  header: string;
  items: PortfolioCustomSectionItem[];
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
  // null means an older portfolio that has never configured quick info.
  // [] means the owner intentionally removed every quick-info row.
  quickInfo: PortfolioQuickInfoItem[] | null;
  customSection: PortfolioCustomSection;
};

export const emptyPortfolioMedia: PortfolioMedia = {
  portfolioPhoto: '',
  gallery: [],
  ownerUuid: '',
  researcherInfo: { fullName: '', occupation: '', designation: '', education: '' },
  quickInfo: null,
  customSection: { header: '', items: [] },
};

export const QUICK_INFO_SOURCE_LABELS: Record<PortfolioQuickInfoSource, string> = {
  full_name: 'Name',
  occupation: 'Occupation',
  designation: 'Designation',
  education: 'Education',
  school: 'Department / School',
  college: 'University / Institution',
  phone: 'Phone',
  email: 'Email',
  research_interests: 'Research interests',
};

export const QUICK_INFO_SOURCES = Object.keys(QUICK_INFO_SOURCE_LABELS) as PortfolioQuickInfoSource[];

export function createDefaultQuickInfo(): PortfolioQuickInfoItem[] {
  const defaultSources: PortfolioQuickInfoSource[] = [
    'occupation',
    'designation',
    'education',
    'school',
    'college',
    'phone',
    'email',
    'research_interests',
  ];

  return defaultSources.map((source) => ({
    id: `quick-${source}`,
    label: QUICK_INFO_SOURCE_LABELS[source],
    value: '',
    source,
  }));
}

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

function normalizeQuickInfo(value: unknown): PortfolioQuickInfoItem[] | null {
  if (!Array.isArray(value)) return null;

  return value
    .map((item, index) => {
      const candidate = item as Partial<PortfolioQuickInfoItem>;
      const rawSource = normalizeString(candidate?.source);
      const source = QUICK_INFO_SOURCES.includes(rawSource as PortfolioQuickInfoSource)
        ? (rawSource as PortfolioQuickInfoSource)
        : null;
      const label = normalizeString(candidate?.label) || (source ? QUICK_INFO_SOURCE_LABELS[source] : '');

      return {
        id: normalizeString(candidate?.id) || `quick-${index}`,
        label,
        value: normalizeString(candidate?.value),
        source,
      } satisfies PortfolioQuickInfoItem;
    })
    .filter((item) => Boolean(item.label || item.value || item.source))
    .slice(0, 30);
}

function normalizeCustomSection(value: unknown): PortfolioCustomSection {
  const candidate = value && typeof value === 'object' ? value as Partial<PortfolioCustomSection> : {};
  const rawItems = Array.isArray(candidate.items) ? candidate.items : [];

  const items = rawItems
    .map((item, index) => {
      const entry = item as Partial<PortfolioCustomSectionItem>;
      const name = normalizeString(entry?.name);
      if (!name) return null;

      const rawLink = normalizeString(entry?.link);
      const link = rawLink.startsWith('http://') || rawLink.startsWith('https://') ? rawLink : '';

      return {
        id: normalizeString(entry?.id) || `custom-${index}`,
        name,
        description: normalizeString(entry?.description),
        link,
      } satisfies PortfolioCustomSectionItem;
    })
    .filter((item): item is PortfolioCustomSectionItem => Boolean(item))
    .slice(0, PORTFOLIO_CUSTOM_SECTION_LIMIT);

  return {
    header: normalizeString(candidate.header),
    items,
  };
}

export function isPortfolioMediaEntry(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith(PORTFOLIO_MEDIA_PREFIX);
}

export function getVisibleResearchInterests(interests?: string[] | null): string[] {
  return (Array.isArray(interests) ? interests : [])
    .filter((item) => typeof item === 'string' && item.trim() && !isPortfolioMediaEntry(item))
    .map((item) => item.trim());
}

export function parsePortfolioMedia(interests?: string[] | null): PortfolioMedia {
  const encoded = (Array.isArray(interests) ? interests : []).find(isPortfolioMediaEntry);
  if (!encoded) return { ...emptyPortfolioMedia, gallery: [], quickInfo: null };

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
      quickInfo: normalizeQuickInfo(parsed.quickInfo),
      customSection: normalizeCustomSection(parsed.customSection),
    };
  } catch {
    return { ...emptyPortfolioMedia, gallery: [], quickInfo: null };
  }
}

export function getQuickInfoSourceValue(
  source: PortfolioQuickInfoSource,
  portfolio: PortfolioData | null | undefined,
  media: PortfolioMedia,
): string {
  switch (source) {
    case 'full_name':
      return media.researcherInfo.fullName;
    case 'occupation':
      return media.researcherInfo.occupation;
    case 'designation':
      return media.researcherInfo.designation;
    case 'education':
      return media.researcherInfo.education;
    case 'school':
      return normalizeString(portfolio?.school);
    case 'college':
      return normalizeString(portfolio?.college);
    case 'phone':
      return normalizeString(portfolio?.phone);
    case 'email':
      return normalizeString(portfolio?.email);
    case 'research_interests':
      return getVisibleResearchInterests(portfolio?.research_interests).join(', ');
    default:
      return '';
  }
}

export function resolvePortfolioQuickInfo(
  portfolio: PortfolioData | null | undefined,
  media: PortfolioMedia,
): PortfolioQuickInfoItem[] {
  const configured = media.quickInfo === null ? createDefaultQuickInfo() : media.quickInfo;

  return configured
    .map((item, index) => {
      const value = item.source ? getQuickInfoSourceValue(item.source, portfolio, media) : normalizeString(item.value);
      const label = normalizeString(item.label) || (item.source ? QUICK_INFO_SOURCE_LABELS[item.source] : '');
      return {
        id: normalizeString(item.id) || `quick-display-${index}`,
        label,
        value,
        source: item.source || null,
      } satisfies PortfolioQuickInfoItem;
    })
    .filter((item) => Boolean(item.label && item.value));
}

export function withPortfolioMedia(interests: string[] | null | undefined, media: PortfolioMedia): string[] {
  const visible = getVisibleResearchInterests(interests);
  const normalizedQuickInfo = media.quickInfo === null
    ? null
    : media.quickInfo
        .slice(0, 30)
        .map((item, index) => ({
          id: normalizeString(item.id) || `quick-${index}`,
          label: normalizeString(item.label),
          value: normalizeString(item.value),
          source: item.source && QUICK_INFO_SOURCES.includes(item.source) ? item.source : null,
        }))
        .filter((item) => Boolean(item.label || item.value || item.source));

  const normalizedCustomSection = normalizeCustomSection(media.customSection);

  const normalized: PortfolioMedia = {
    portfolioPhoto: normalizeString(media.portfolioPhoto),
    ownerUuid: normalizeString(media.ownerUuid),
    researcherInfo: {
      fullName: normalizeString(media.researcherInfo?.fullName),
      occupation: normalizeString(media.researcherInfo?.occupation),
      designation: normalizeString(media.researcherInfo?.designation),
      education: normalizeString(media.researcherInfo?.education),
    },
    quickInfo: normalizedQuickInfo,
    customSection: normalizedCustomSection,
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
