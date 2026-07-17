'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BookOpen, UserCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Researchers', href: '/researchers' },
  { name: 'Articles', href: '/articles' },
  { name: 'Repository', href: '/repository' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const dashboardHref = user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <BookOpen size={22} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Academic Portal
            </span>
          </Link>

          {}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {}
          <div className="hidden md:flex items-center">
            {!isMounted ? (
              <div className="w-24 h-9 bg-slate-100 animate-pulse rounded-md"></div>
            ) : isAuthenticated ? (
              <Link
                href={dashboardHref}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-md transition-colors"
              >
                <UserCircle size={18} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <div className="pt-4 mt-2 border-t border-slate-100">
              {isMounted && isAuthenticated ? (
                <Link
                  href={dashboardHref}
                  className="flex items-center justify-center gap-2 w-full text-base font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-md transition-colors"
                >
                  <UserCircle size={20} />
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="block w-full text-center text-base font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-md transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}