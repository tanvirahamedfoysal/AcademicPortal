import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_name');
          localStorage.removeItem('user_role');
          localStorage.removeItem('auth-storage');
          document.cookie = 'token=; Max-Age=0; Path=/; SameSite=Lax';
          document.cookie = 'user_role=; Max-Age=0; Path=/; SameSite=Lax';
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', 
      partialize: (state) => ({ user: state.user }), 
    }
  )
);