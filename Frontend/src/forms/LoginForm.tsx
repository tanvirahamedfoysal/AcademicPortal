'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!username || !password) return;

    loginMutation.mutate({ username, password }, {
      onSuccess: ({ user }) => {
        if (user.role === 'ADMIN') router.push('/admin/portfolio');
        else if (user.role === 'MODERATOR') router.push('/moderator');
        else router.push('/student');
        router.refresh();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {loginMutation.isError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{loginMutation.error instanceof Error ? loginMutation.error.message : 'Unable to sign in.'}</p>
        </div>
      )}

      <label className="block text-sm font-semibold text-slate-700">
        Username or email
        <input id="username" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-800 focus:bg-white" placeholder="username or researcher@university.edu" required disabled={loginMutation.isPending} />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        Password
        <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-800 focus:bg-white" placeholder="••••••••" required disabled={loginMutation.isPending} />
      </label>

      <button type="submit" disabled={loginMutation.isPending || !username || !password} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3b34] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#092c27] disabled:opacity-60">
        {loginMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : <>Sign in to portal <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  );
}
