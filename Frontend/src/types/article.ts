export interface Article {
  id: string;
  title: string;
  body?: string;
  abstract?: string;
  content?: string;
  author?: string;
  author_uuid?: string | null;
  status?: string;
  created_at: string;
  updated_at?: string;
  published_at?: string | null;
}
