export type UserRole = 'ADMIN' | 'STUDENT' | 'MODERATOR' | 'COLLABORATOR' | 'VISITOR';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}
