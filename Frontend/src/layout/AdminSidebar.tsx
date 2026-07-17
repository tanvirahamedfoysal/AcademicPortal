// src/layout/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BookOpen, 
  Database, 
  ShieldAlert, 
  Settings,
  LogOut
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Pending Students', href: '/admin/students/pending', icon: Users },
  { label: 'Articles', href: '/admin/articles', icon: FileText },
  { label: 'Researchers', href: '/admin/researchers', icon: BookOpen },
  { label: 'Repository', href: '/admin/repository', icon: Database },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  // Hydration state to prevent SSR mismatch with persisted Zustand store
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-slate-800">Academic Portal</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-700' : 'text-slate-400'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout - Only render after client mounting */}
      {isMounted && user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
              <Image 
                src={user.avatarUrl || '/images/placeholders/profile.webp'} 
                alt={`${user.username}'s avatar`}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.role}</p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}