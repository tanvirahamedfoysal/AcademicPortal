'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Briefcase, 
  FileText, 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Inbox, 
  FolderArchive 
} from 'lucide-react';

const navigation = [
  { name: 'Portfolio', href: '/admin/portfolio', icon: Briefcase },
  { name: 'Articles', href: '/admin/articles', icon: FileText },
  { name: 'Collaborators', href: '/admin/collaborators', icon: Users },
  { name: 'Moderators', href: '/admin/moderators', icon: ShieldCheck },
  { name: 'Students', href: '/admin/students', icon: GraduationCap },
  { name: 'Repository', href: '/admin/repository', icon: FolderArchive },
  { name: 'Messages', href: '/admin/messages', icon: Inbox },
  { name: 'Profile Settings', href: '/admin/profile', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {}
      <div 
        className={`fixed inset-0 z-40 bg-slate-900/80 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      {}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-64 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <span className="text-xl font-bold text-slate-800">Admin Portal</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-colors font-medium text-sm text-red-600 hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-lg font-semibold text-slate-800">Dashboard</span>
          <div className="w-6" /> {}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}