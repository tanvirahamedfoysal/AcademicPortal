'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  BookOpen, 
  FolderArchive, 
  Users, 
  UsersRound, 
  Mail,
  LayoutDashboard,
  Settings,
  LogOut,
  ArrowRight,
  Shield,
  FileText,
  Github
} from 'lucide-react';

type Section = 'AUTHOR' | 'ARTICLES' | 'REPOSITORIES' | 'COLLABORATORS' | 'CONTRIBUTORS' | 'CONTACT';

interface UserData {
  name: string;
  role: string;
}

export default function Homepage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>('AUTHOR');
  
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
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
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

  const getSettingsLink = () => {
    const rolePath = (user?.role || 'student').toLowerCase();
    return `/${rolePath}/profile`;
  };

  const navItems = [
    { id: 'AUTHOR', label: 'Author Portfolio', icon: User },
    { id: 'ARTICLES', label: 'Articles', icon: BookOpen },
    { id: 'REPOSITORIES', label: 'Repositories', icon: FolderArchive },
    { id: 'COLLABORATORS', label: 'Collaborators', icon: Users },
    { id: 'CONTRIBUTORS', label: 'Contributors', icon: UsersRound },
    { id: 'CONTACT', label: 'Contact Me', icon: Mail },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex selection:bg-blue-100">
      
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col z-40 hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>Researcher<span className="text-blue-600">'s Eden</span></span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as Section)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          &copy; {new Date().getFullYear()} Researcher's Eden.
        </div>
      </aside>

      <main className="flex-1 md:ml-64 relative">
        
        <header className="fixed top-0 right-0 left-0 md:left-64 h-20 bg-slate-50/80 backdrop-blur-md z-30 px-8 flex items-center justify-end border-b border-slate-200/50">
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
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                    
                    <Link href={getDashboardLink()} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link href={getSettingsLink()} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === 'AUTHOR' && <AuthorSection />}
              {activeSection === 'ARTICLES' && <PlaceholderSection title="Articles & Publications" icon={BookOpen} />}
              {activeSection === 'REPOSITORIES' && <PlaceholderSection title="Research Repositories" icon={FolderArchive} />}
              {activeSection === 'COLLABORATORS' && <PlaceholderSection title="Academic Collaborators" icon={Users} />}
              {activeSection === 'CONTRIBUTORS' && <PlaceholderSection title="Project Contributors" icon={UsersRound} />}
              {activeSection === 'CONTACT' && <ContactSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function AuthorSection() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0 shadow-lg" />
        <div>
          <div className="inline-block mb-3 px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full text-xs tracking-wide">
            Principal Researcher
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Advancing the frontiers of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Computer Science</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
            A centralized portfolio dedicated to publishing peer-reviewed academic documents, open-source software architectures and collaborative data science projects.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <FileText className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">40+ Publications</h3>
          <p className="text-sm text-slate-500">Peer-reviewed journals and conference proceedings.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <Github className="w-8 h-8 text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Open Source</h3>
          <p className="text-sm text-slate-500">Active maintainer of robust research toolings.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <Users className="w-8 h-8 text-teal-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Global Network</h3>
          <p className="text-sm text-slate-500">Collaborating with top institutions worldwide.</p>
        </div>
      </div>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Get in Touch</h2>
      <p className="text-slate-600 mb-8">Have a question about my research or want to collaborate? Send a message.</p>
      
      <form className="space-y-5 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
          <textarea rows={5} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Send Message
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function PlaceholderSection({ title, icon: Icon }: { title: string, icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-3">{title}</h2>
      <p className="text-slate-500 max-w-md mx-auto">
        Section under construction......waiting for api updates {title.toLowerCase()}.
      </p>
    </div>
  );
}