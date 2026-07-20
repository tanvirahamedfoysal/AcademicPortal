'use client';

import { BookOpen, FolderArchive, Users, GraduationCap, Send, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function StudentDashboardHome() {
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    const storedName = localStorage.getItem('displayName');
    if (storedName) setUserName(storedName);
  }, []);

  const portalLinks = [
    { name: 'Research Articles', href: '/student/articles', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Browse published research and academic papers.' },
    { name: 'File Repository', href: '/student/repository', icon: FolderArchive, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Access shared datasets and documentation.' },
    { name: 'Collaborators', href: '/student/collaborators', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'View partner institutions and co-researchers.' },
    { name: 'Fellow Students', href: '/student/students', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Connect with other students in the portal.' },
    { name: 'Send Message', href: '/student/messages', icon: Send, color: 'text-sky-500', bg: 'bg-sky-50', desc: 'Contact administrators or moderators.' },
    { name: 'My Profile', href: '/student/profile', icon: User, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'Update your personal details and password.' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {userName}!</h1>
        <p className="text-slate-500 mt-2">Access research materials, collaborate, and manage your academic profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portalLinks.map((link, index) => (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={link.href} className="block group h-full">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all h-full flex flex-col">
                <div className={`h-12 w-12 rounded-lg ${link.bg} ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <link.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{link.name}</h3>
                <p className="text-sm text-slate-500 flex-grow mb-4">{link.desc}</p>
                <div className="flex items-center text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  Explore <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}