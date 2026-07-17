import { useMutation } from '@tanstack/react-query';
import { profileService } from '../services/profile.service';
import { useAuthStore } from '../store/auth.store';
import { User } from '../types/user';

export function useUpdateProfile() {
  const { token, setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: Partial<User>) => profileService.updateMe(data),
    onSuccess: (updatedUser) => {
      if (token) {
        setAuth(updatedUser, token);
      }
    },
  });
}