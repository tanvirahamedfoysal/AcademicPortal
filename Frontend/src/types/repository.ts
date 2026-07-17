// src/types/repository.ts
export interface DocumentRecord {
  id: string;
  title: string;
  filename: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
}