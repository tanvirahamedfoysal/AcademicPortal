import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { LoginCredentials } from '../types/auth';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { access_token } = await authService.login(credentials);
      
      localStorage.setItem('token', access_token);
      
      const user = await authService.getMe();
      
      return { token: access_token, user };
    },
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      
      document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=strict`;
      document.cookie = `user_role=${user.role}; path=/; max-age=86400; secure; samesite=strict`;
    }
  });
}