export interface Student {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'verified' | 'rejected';
  department?: string;
  studentId?: string;
  created_at: string;
}