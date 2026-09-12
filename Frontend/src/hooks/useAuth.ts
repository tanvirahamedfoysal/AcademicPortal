import { useMutation } from '@tanstack/react-query';
import { authService, BackendUserProfile } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { LoginCredentials } from '../types/auth';
import { User } from '../types/user';

function normalizeUser(profile: BackendUserProfile): User {
  return {
    id: profile.uuid,
    username: profile.email?.split('@')[0] || 'member',
    email: profile.email,
    role: profile.user_role,
    status: profile.status,
    profileType: profile.profile_type,
    avatarUrl: profile.profile_image,
    studentBatch: profile.student_batch,
  };
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      return { token: response.access_token, user: normalizeUser(response.user) };
    },
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      localStorage.setItem('user_name', user.email || user.username);
      localStorage.setItem('user_role', user.role);
      document.cookie = `token=${token}; path=/; max-age=86400; samesite=lax`;
      document.cookie = `user_role=${user.role}; path=/; max-age=86400; samesite=lax`;
    },
  });
}
