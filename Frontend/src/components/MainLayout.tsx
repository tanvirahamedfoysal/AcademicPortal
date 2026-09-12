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
  { href: '/contributors', label: 'Community', icon: GraduationCap },
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
    <div className="min-h-screen bg-[#f5f7f4] text-slate-950">
      <div className="border-b border-emerald-950/10 bg-[#0b2823] text-emerald-50">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-5 py-2 text-xs sm:px-8 lg:px-12">
          <p className="flex items-center gap-2 text-emerald-100/80">
            <FlaskConical className="h-3.5 w-3.5" />
            Research portfolio · publications · open learning resources
          </p>
          <Link href="/contact" className="hidden items-center gap-1 font-semibold text-[#e6c27a] hover:text-white sm:flex">
            Open to research collaboration <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#fbfcfa]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0f3b34] text-white shadow-[0_8px_24px_rgba(15,59,52,.18)]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-serif text-lg font-bold tracking-[-0.02em] text-slate-950">Researcher&apos;s Eden</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:block">Academic knowledge portal</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {navItems.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? 'bg-[#e7efe9] text-[#0f3b34]' : 'text-slate-600 hover:bg-white hover:text-slate-950'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link href={dashboardHref} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-900/20 hover:text-[#0f3b34]">
                  Dashboard
                </Link>
                <button onClick={signOut} className="grid h-10 w-10 place-items-center rounded-full bg-[#0f3b34] text-white transition hover:bg-[#092c27]" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:text-[#0f3b34]">
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
                <Link href="/auth/register" className="rounded-full bg-[#0f3b34] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#092c27]">
                  Join the portal
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 xl:hidden" aria-label="Toggle navigation">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-[#fbfcfa] px-5 py-5 xl:hidden">
            <div className="mx-auto grid max-w-[1480px] gap-2 sm:grid-cols-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-[#e7efe9] hover:text-[#0f3b34]">
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2 border-t border-slate-200 pt-4 sm:col-span-2">
                {user ? (
                  <>
                    <Link href={dashboardHref} className="flex-1 rounded-xl bg-[#0f3b34] px-4 py-3 text-center text-sm font-semibold text-white">Dashboard</Link>
                    <button onClick={signOut} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700">Sign in</Link>
                    <Link href="/auth/register" className="flex-1 rounded-xl bg-[#0f3b34] px-4 py-3 text-center text-sm font-semibold text-white">Join portal</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-emerald-950/10 bg-[#0b2823] text-emerald-50">
        <div className="mx-auto grid max-w-[1480px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-12">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><ShieldCheck className="h-5 w-5" /></span>
              <div>
                <p className="font-serif text-xl font-bold">Researcher&apos;s Eden</p>
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/55">Scholarship in one place</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-6 text-emerald-50/65">A focused academic environment for communicating research, publishing scholarly writing, sharing resources, and building a learning community around evidence and collaboration.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#e6c27a]">Explore</p>
            <div className="grid gap-2 text-sm text-emerald-50/70">
              <Link href="/articles" className="hover:text-white">Publications</Link>
              <Link href="/repositories" className="hover:text-white">Research resources</Link>
              <Link href="/collaborators" className="hover:text-white">Collaborations</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#e6c27a]">Portal</p>
            <div className="grid gap-2 text-sm text-emerald-50/70">
              <Link href="/contributors" className="hover:text-white">Learning community</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
              <Link href="/auth/login" className="hover:text-white">Member sign in</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-emerald-50/45">
          © {new Date().getFullYear()} Researcher&apos;s Eden · Academic Research Portal
        </div>
      </footer>
    </div>
  );
}
