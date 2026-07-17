import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import LoginForm from '../../../forms/LoginForm';

export const metadata = {
  title: 'Sign In - Academic Research Portal',
  description: 'Sign in to access your dashboard and research tools.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 text-blue-600 mb-4">
            <BookOpen size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-2">
            Sign in to access the Academic Research Portal
          </p>
        </div>

        <div className="p-8">
          <LoginForm />
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col space-y-3 text-center">
          <p className="text-sm text-slate-600">
            Forgot your password?{' '}
            <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Reset it here
            </Link>
          </p>
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register here
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}