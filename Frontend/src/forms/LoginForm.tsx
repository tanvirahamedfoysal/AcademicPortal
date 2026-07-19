'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';
import { authService } from '../services/auth.service'; 

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileError, setProfileError] = useState(false); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setProfileError(false);

    loginMutation.mutate(
      { username, password },
      {
        onSuccess: async () => {
          try {
            const response = (await authService.getMe()) as any;
            
            const userData = response.data ? response.data : response; 
            
            const displayName = userData.email || userData.username || 'Admin';
            const userRole = userData.user_role || userData.role; 

            localStorage.setItem('user_name', displayName);
            localStorage.setItem('user_role', userRole);
            
            const role = userRole?.toUpperCase();

            if (role === 'ADMIN') {
              router.push('/admin/portfolio');
            } else if (role === 'MODERATOR') {
              router.push('/admin/articles');
            } else {
              router.push('/student/dashboard');
            }
          } catch (error) {
            console.error("Failed to fetch user profile", error);
            setProfileError(true);
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      {(loginMutation.isError || profileError) && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>
            {profileError 
              ? "Login successful, but failed to load user profile."
              : loginMutation.error instanceof Error 
                ? "Invalid username or password. Please try again." 
                : "An unexpected error occurred."}
          </p>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Enter your username"
          required
          disabled={loginMutation.isPending}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="••••••••"
          required
          disabled={loginMutation.isPending}
        />
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending || !username || !password}
        className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}