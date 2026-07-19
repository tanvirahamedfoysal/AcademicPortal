'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import ProfileForm from '../../../forms/ProfileForm';
import { BookOpen, FileText, UserCircle } from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !user) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
        <div className="h-64 bg-slate-100 rounded-xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user.firstName || user.username}!
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your research profile and track your academic publications.
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">My Publications</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Reviews</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <UserCircle className="text-slate-500" size={20} />
          <h2 className="font-semibold text-slate-900">Personal Information</h2>
        </div>
        <div className="p-6 md:p-8">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}