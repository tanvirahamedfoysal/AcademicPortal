'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  BookOpenText,
  FileArchive,
  FlaskConical,
  GraduationCap,
  LogIn,
  LogOut,
  Menu,
  MessageSquareText,
  Network,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';

interface StoredUser {
  name: string;
  role: string;
}

const navItems = [
  { href: '/', label: 'Portfolio', icon: UserRound },
  { href: '/articles', label: 'Publications', icon: BookOpenText },
  { href: '/repositories', label: 'Resources', icon: FileArchive },
  { href: '/collaborators', label: 'Collaborations', icon: Network },
  { href: '/lab-members', label: 'Lab Members', icon: GraduationCap },
  { href: '/contact', label: 'Contact', icon: MessageSquareText },
] as const;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('user_name');
    const role = localStorage.getItem('user_role');
    if (role) setUser({ name: name || role, role });
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  // Publications and Resources are member-only destinations. Keep them out of
  // every navigation variant until a signed-in account has been detected.
  const visibleNavItems = useMemo(
    () => user ? navItems : navItems.filter(({ href }) => href !== '/articles' && href !== '/repositories'),
    [user],
  );

  const dashboardHref = useMemo(() => {
    const role = user?.role?.toUpperCase();
    if (role === 'ADMIN') return '/admin/portfolio';
    if (role === 'MODERATOR') return '/moderator';
    return '/student';
  }, [user]);

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth-storage');
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'user_role=; Max-Age=0; path=/';
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#fffaf7] text-slate-900">
      <div className="border-b border-[#cde8ec] bg-[#dff7f6] text-slate-700">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-2 text-xs sm:px-8 lg:px-12">
          <p className="flex min-w-0 items-center gap-2 text-slate-600">
            <FlaskConical className="h-3.5 w-3.5 shrink-0 text-[#5f91a0]" />
            <span className="truncate sm:whitespace-normal">Research portfolio · publications · open learning resources</span>
          </p>
          <Link href="/contact" className="hidden items-center gap-1 font-semibold text-[#527f8f] hover:text-[#3f7081] sm:flex">
            Open to research collaboration <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[#dce7ee] bg-[#fffdfb]/94 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between gap-3 px-4 sm:h-[68px] sm:px-5 md:px-6 xl:h-[76px] xl:gap-4 xl:px-12">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf6ff] text-[#527f8f] shadow-[0_8px_24px_rgba(95,145,160,.14)]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-serif text-lg font-bold tracking-[-0.02em] text-slate-900">ICAI Lab</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:block">Intelligent Computing and AI Research Lab</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {visibleNavItems.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? 'bg-[#edf6ff] text-[#4f7e8c]' : 'text-slate-600 hover:bg-[#edf6ff]/55 hover:text-slate-900'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <nav aria-label="Quick navigation" className={`${mobileOpen ? 'hidden' : 'hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex xl:hidden'}`}>
            {visibleNavItems.filter(({ href }) => ['/', '/articles', '/repositories', '/lab-members'].includes(href)).map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`whitespace-nowrap rounded-full px-2 py-2 text-[11px] font-semibold transition ${active ? 'bg-[#edf6ff] text-[#4f7e8c]' : 'text-slate-600 hover:bg-[#edf6ff]/70 hover:text-slate-900'}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
            <div className={mobileOpen ? 'hidden' : 'hidden items-center gap-2 md:flex'}>
              {user ? (
                <>
                  <Link href={dashboardHref} className="rounded-full border border-[#dce7ee] bg-[#fffaf7] px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#b8dce3] hover:text-[#4f7e8c]">
                    Dashboard
                  </Link>
                  <button onClick={signOut} className="grid h-10 w-10 place-items-center rounded-full bg-[#5f91a0] text-white transition hover:bg-[#4f8294]" aria-label="Sign out">
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:text-[#527f8f]">
                    <LogIn className="h-4 w-4" /> Sign in
                  </Link>
                  <Link href="/auth/register" className="rounded-full bg-[#5f91a0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4f8294]">
                    Join the portal
                  </Link>
                </>
              )}
            </div>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#dce7ee] bg-[#edf6ff] text-slate-700 transition hover:border-[#b8dce3] hover:bg-[#dff7f6] xl:hidden"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
              aria-controls="portfolio-mobile-navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div id="portfolio-mobile-navigation" className="max-h-[min(72vh,620px)] overflow-y-auto border-t border-[#dce7ee] bg-[#fffdfb] px-4 py-4 sm:px-5 md:px-6 xl:hidden">
            <div className="mx-auto grid max-w-[1480px] gap-2 sm:grid-cols-2 md:grid-cols-3">
              {visibleNavItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${active ? 'border-[#c6e3e8] bg-[#edf6ff] text-[#4f7e8c]' : 'border-transparent bg-[#f7fbfc] text-slate-700 hover:border-[#d4e8eb] hover:bg-[#dff7f6] hover:text-[#4f7e8c]'}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" /> {label}
                  </Link>
                );
              })}
              <div className="mt-2 flex flex-col gap-2 border-t border-[#dce7ee] pt-4 min-[420px]:flex-row sm:col-span-2 md:col-span-3">
                {user ? (
                  <>
                    <Link href={dashboardHref} className="flex-1 rounded-xl bg-[#5f91a0] px-4 py-3 text-center text-sm font-semibold text-white">Dashboard</Link>
                    <button onClick={signOut} className="rounded-xl border border-[#dce7ee] bg-[#fffaf7] px-4 py-3 text-sm font-semibold text-slate-700">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="flex-1 rounded-xl border border-[#dce7ee] bg-[#fffaf7] px-4 py-3 text-center text-sm font-semibold text-slate-700">Sign in</Link>
                    <Link href="/auth/register" className="flex-1 rounded-xl bg-[#5f91a0] px-4 py-3 text-center text-sm font-semibold text-white">Join portal</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="min-w-0">{children}</main>

      <footer className="border-t border-[#cfe6ee] bg-[linear-gradient(135deg,#fffaf7_0%,#edf6ff_50%,#edf6ff_100%)] text-slate-700">
        <div className="mx-auto grid max-w-[1480px] gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-12">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#dff7f6] text-[#4f7e8c]"><ShieldCheck className="h-5 w-5" /></span>
              <div>
                <p className="font-serif text-xl font-bold text-slate-900">Dr. Tania Islam</p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Academic research portfolio</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">A focused academic environment for communicating research, publishing scholarly writing, sharing resources, and supporting the lab, research collaboration, and scholarly learning.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#527f8f]">Explore</p>
            <div className="grid gap-2 text-sm text-slate-600">
              {user && <Link href="/articles" className="hover:text-slate-900">Publications</Link>}
              {user && <Link href="/repositories" className="hover:text-slate-900">Research resources</Link>}
              <Link href="/collaborators" className="hover:text-slate-900">Collaborations</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#527f8f]">Portal</p>
            <div className="grid gap-2 text-sm text-slate-600">
              <Link href="/lab-members" className="hover:text-slate-900">Lab members</Link>
              <Link href="/contact" className="hover:text-slate-900">Contact</Link>
              <Link href="/auth/login" className="hover:text-slate-900">Member sign in</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[#cfe6ee] px-4 py-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Dr. Tania Islam · Academic Research Portfolio
        </div>
      </footer>
    </div>
  );
}
