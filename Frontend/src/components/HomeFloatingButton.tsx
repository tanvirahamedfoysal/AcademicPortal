'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomeFloatingButton() {
  const pathname = usePathname();

  const isVisible = 
    pathname === '/auth/login' || 
    pathname === '/auth/register' || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/moderator') || 
    pathname.startsWith('/student');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-16 right-6 z-50"
        >
          <div className="relative group">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Return to Homepage
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
            </div>

            <Link href="/" aria-label="Return to Homepage">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 transition-shadow"
              >
                <span className="absolute inset-0 rounded-full border-2 border-sky-400 opacity-75 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                
                <span className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-50 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
                
                <Home size={24} strokeWidth={2.5} className="relative z-10" />
              </motion.div>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}