export interface Student {
  uuid: string;
  name: string;
  username?: string;
  email: string;
  image_url?: string;
  status: string;
  student_batch?: number | string;
  created_at?: string;
}
