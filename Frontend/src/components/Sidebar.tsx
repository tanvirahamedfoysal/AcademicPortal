'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Briefcase, 
  FileText, 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Settings, 
  LogOut, 
  X, 
  Inbox, 
  FolderArchive 
} from 'lucide-react';

export type UserRole = 'admin' | 'moderator' | 'student';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  role: UserRole;
}

const navigationConfig = [
  { name: 'Portfolio', pathSegment: '/portfolio', icon: Briefcase, allowedRoles: ['admin'] },
  { name: 'Articles', pathSegment: '/articles', icon: FileText, allowedRoles: ['admin', 'moderator', 'student'] },
  { name: 'Collaborators', pathSegment: '/collaborators', icon: Users, allowedRoles: ['admin', 'moderator'] },
  { name: 'Moderators', pathSegment: '/moderators', icon: ShieldCheck, allowedRoles: ['admin'] },
  { name: 'Students', pathSegment: '/students', icon: GraduationCap, allowedRoles: ['admin', 'moderator'] },
  { name: 'Repository', pathSegment: '/repository', icon: FolderArchive, allowedRoles: ['admin', 'moderator', 'student'] },
  { name: 'Messages', pathSegment: '/messages', icon: Inbox, allowedRoles: ['admin', 'moderator', 'student'] },
  { name: 'Profile Settings', pathSegment: '/profile', icon: Settings, allowedRoles: ['admin', 'moderator', 'student'] },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const allowedNavigation = navigationConfig.filter(item => 
    item.allowedRoles.includes(role)
  );

  const handleSignOut = async () => {
    try {
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      localStorage.clear();
      sessionStorage.clear();

      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <>
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
          <span className="text-xl font-bold text-slate-800 capitalize">{role} Portal</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {allowedNavigation.map((item) => {
            const href = `/${role}${item.pathSegment}`;
            const isActive = pathname.startsWith(href);
            
            return (
              <Link
                key={item.name}
                href={href}
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
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-colors font-medium text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}