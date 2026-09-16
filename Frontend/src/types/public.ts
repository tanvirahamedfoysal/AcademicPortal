export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface PortfolioData {
  school?: string | null;
  college?: string | null;
  public_bio?: string | null;
  research_description?: string | null;
  research_interests?: string[] | null;
  email?: string | null;
  phone?: string | null;
  github_url?: string | null;
  orcid_url?: string | null;
  researchgate_url?: string | null;
  google_scholar_url?: string | null;
  cv_url?: string | null;
  discord_url?: string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  x_url?: string | null;
  instagram_url?: string | null;
  updated_at?: string | null;
}

export interface PublicArticleSummary {
  article_uuid: string;
  article_title: string;
  published_at?: string | null;
  updated_at?: string | null;
  author_uuid?: string | null;
}

export interface PublicArticleDetail extends PublicArticleSummary {
  article_body: string;
}

export interface PublicCollaborator {
  uuid: string | number;
  name: string;
  image_url?: string | null;
  bio?: string | null;
  organization?: string | null;
  website_url?: string | null;
}

export interface PublicStudent {
  uuid: string;
  name: string;
  username: string;
  email: string;
  image_url?: string | null;
  status?: string | null;
  student_batch?: string | number | null;
}

export interface PublicLabMember extends PublicStudent {
  bio?: string | null;
  mobile_number?: string | null;
  address?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RepositoryDocument {
  id: string | number;
  name: string;
  url: string;
}

export interface ContactMeta {
  email?: string | null;
  phone?: string | null;
  github_url?: string | null;
  orcid_url?: string | null;
  researchgate_url?: string | null;
  google_scholar_url?: string | null;
  cv_url?: string | null;
  discord_url?: string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  x_url?: string | null;
  instagram_url?: string | null;
}
