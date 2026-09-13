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
      <div className={`fixed inset-0 z-40 bg-[#061713]/70 backdrop-blur-sm transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col border-r border-white/8 bg-[#0b2823] text-white shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[84px] items-center justify-between border-b border-white/10 px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><ShieldCheck className="h-5 w-5 text-[#e6c27a]" /></span>
            <span><span className="block font-serif text-lg font-bold">Researcher&apos;s Eden</span><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-50/45">{role} workspace</span></span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><X className="h-5 w-5 text-emerald-50/60" /></button>
        </div>

        <div className="px-5 pt-6"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c27a]">Workspace</p></div>
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1.5">
            {allowedNavigation.map((item) => {
              const href = item.pathSegment ? `/${role}${item.pathSegment}` : `/${role}`;
              const exactOverview = item.pathSegment === '';
              const active = exactOverview ? pathname === href : pathname.startsWith(href);
              const Icon = item.icon;
              return (
                <Link key={`${role}-${item.name}`} href={href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${active ? 'bg-[#f4efdc] text-[#163b34]' : 'text-emerald-50/68 hover:bg-white/[.07] hover:text-white'}`}>
                  <Icon className={`h-4.5 w-4.5 ${active ? 'text-[#9b7835]' : 'text-emerald-100/45'}`} /> {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <Link href="/" className="mb-2 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-emerald-50/60 transition hover:bg-white/[.07] hover:text-white"><Home className="h-4 w-4" /> Public portfolio</Link>
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10 hover:text-rose-100"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
    </>
  );
}
