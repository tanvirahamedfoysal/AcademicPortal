'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Briefcase,
  FileText,
  FolderArchive,
  GraduationCap,
  Home,
  Images,
  Inbox,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

export type UserRole = 'admin' | 'moderator' | 'student';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  role: UserRole;
}

const navigationConfig = [
  { name: 'Portfolio', pathSegment: '/portfolio', icon: Briefcase, allowedRoles: ['admin'] },
  { name: 'Necessary Photos', pathSegment: '/photos', icon: Images, allowedRoles: ['admin'] },
  { name: 'Overview', pathSegment: '', icon: Home, allowedRoles: ['moderator', 'student'] },
  { name: 'Articles', pathSegment: '/articles', icon: FileText, allowedRoles: ['admin', 'moderator', 'student'] },
  { name: 'Collaborators', pathSegment: '/collaborators', icon: Users, allowedRoles: ['admin', 'moderator', 'student'] },
  { name: 'Moderators', pathSegment: '/moderators', icon: ShieldCheck, allowedRoles: ['admin'] },
  { name: 'Students', pathSegment: '/students', icon: GraduationCap, allowedRoles: ['admin', 'moderator', 'student'] },
  { name: 'Repository', pathSegment: '/repository', icon: FolderArchive, allowedRoles: ['admin', 'moderator', 'student'] },
  { name: 'Messages', pathSegment: '/messages', icon: Inbox, allowedRoles: ['admin', 'moderator', 'student'] },
  { name: 'Profile Settings', pathSegment: '/profile', icon: Settings, allowedRoles: ['admin', 'moderator', 'student'] },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const allowedNavigation = navigationConfig.filter((item) => item.allowedRoles.includes(role));

  const handleSignOut = () => {
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'user_role=; Max-Age=0; path=/';
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth-storage');
    sessionStorage.clear();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-sm transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(286px,88vw)] flex-col border-r border-[#cfe1ea] bg-[linear-gradient(180deg,#fffaf7_0%,#edf6ff_46%,#f8dce7_100%)] text-slate-700 shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-[286px] lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[84px] items-center justify-between border-b border-[#d7e6ed] px-5 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dff7f6] text-[#5b8796] shadow-sm"><ShieldCheck className="h-5 w-5" /></span>
            <span className="min-w-0"><span className="block truncate font-serif text-lg font-bold text-slate-900">Dr. Tania Islam</span><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{role} workspace</span></span>
          </Link>
          <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#fffdfb] lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><X className="h-5 w-5 text-slate-500" /></button>
        </div>

        <div className="px-5 pt-6"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9f5f7a]">Workspace</p></div>
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1.5">
            {allowedNavigation.map((item) => {
              const href = item.pathSegment ? `/${role}${item.pathSegment}` : `/${role}`;
              const exactOverview = item.pathSegment === '';
              const active = exactOverview ? pathname === href : pathname.startsWith(href);
              const Icon = item.icon;
              return (
                <Link key={`${role}-${item.name}`} href={href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${active ? 'bg-[#fffdfb] text-[#8e526c] shadow-sm ring-1 ring-[#e9c4d3]' : 'text-slate-600 hover:bg-[#dff7f6]/70 hover:text-slate-900'}`}>
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-[#b96586]' : 'text-[#6fa8b4]'}`} /> {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[#d7e6ed] p-4">
          <Link href="/" className="mb-2 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-[#fffdfb] hover:text-slate-900"><Home className="h-4 w-4" /> Public portfolio</Link>
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-[#f8dce7] hover:text-rose-800"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
    </>
  );
}
