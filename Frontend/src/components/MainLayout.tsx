'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, BookOpen, FolderArchive, Users, UsersRound, Mail,
  LayoutDashboard, Settings, LogOut, Shield
} from 'lucide-react';

interface UserData {
  name: string;
  role: string;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); 
  
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedName = localStorage.getItem('user_name');
    const storedRole = localStorage.getItem('user_role');
    
    if (storedName && storedRole) {
      setUser({ name: storedName, role: storedRole });
    }
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 200);
  };

  const handleSignOut = () => {
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('access_token');
    setUser(null);
    setIsDropdownOpen(false);
    router.push('/auth/login');
  };

  const getInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name.substring(0, 2).toUpperCase();
  };

  const getDashboardLink = () => {
    const role = user?.role?.toUpperCase();
    if (role === 'ADMIN') return '/admin/portfolio';
    if (role === 'MODERATOR') return '/moderator/profile';
    return '/student/profile';
  };

  const navItems = [
    { href: '/', label: 'Author Portfolio', icon: User },
    { href: '/articles', label: 'Articles', icon: BookOpen },
    { href: '/repositories', label: 'Repositories', icon: FolderArchive },
    { href: '/collaborators', label: 'Collaborators', icon: Users },
    { href: '/contributors', label: 'Contributors', icon: UsersRound },
    { href: '/contact', label: 'Contact Me', icon: Mail },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex selection:bg-blue-100">
      
      <aside className="group fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 shadow-sm transition-[width] duration-300 ease-in-out w-20 hover:w-64 flex flex-col hidden md:flex overflow-hidden hover:shadow-2xl">
        
        <div className="h-20 flex items-center px-6 border-b border-slate-100 shrink-0">
          <Shield className="w-8 h-8 text-blue-600 shrink-0" />
          <span className="ml-4 text-xl font-bold text-slate-900 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Researcher<span className="text-blue-600">'s Eden</span>
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Reseacher's Eden</span>
        </div>
      </aside>

      <main className="flex-1 md:ml-20 relative">
        
        <header className="fixed top-0 right-0 left-0 md:left-20 h-20 bg-slate-50/80 backdrop-blur-md z-30 px-8 flex items-center justify-end border-b border-slate-200/50 transition-all duration-300">
          {!isMounted ? (
            <div className="w-11 h-11 rounded-full bg-slate-200 animate-pulse border-2 border-white shadow-sm" />
          ) : user ? (
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center justify-center w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-bold border-2 border-white shadow-sm hover:ring-2 hover:ring-blue-100 transition-all overflow-hidden tracking-wider">
                {getInitials()}
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                    
                    <Link href={getDashboardLink()} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link href={`/${(user.role || 'student').toLowerCase()}/profile`} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="h-px bg-slate-100 my-1" />
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link href="/auth/register" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Register
              </Link>
            </div>
          )}
        </header>

        <div className="pt-28 pb-20 px-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}