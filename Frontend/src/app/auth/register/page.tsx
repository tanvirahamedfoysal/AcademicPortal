import Link from 'next/link';
import { Users } from 'lucide-react';
import RegisterForm from '../../../forms/RegisterForm'; // Make sure this path is correct!

export const metadata = {
  title: 'Create Account - Academic Research Portal',
  description: 'Join the portal to publish, discover, and collaborate on research.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 mb-4">
            <Users size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
          <p className="text-sm text-slate-500 mt-2">
            Join the community to start publishing and collaborating
          </p>
        </div>

        <div className="p-8">
          {}
          <RegisterForm />
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}