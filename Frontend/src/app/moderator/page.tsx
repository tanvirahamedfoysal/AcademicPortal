'use client';

import { Shield, FileText, GraduationCap, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ModeratorDashboard() {
  const stats = [
    { label: 'Pending Articles', value: '12', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Students', value: '148', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Collaborators', value: '24', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-600" />
          Moderator Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back. Here is what is happening in the research portal today.
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4"
          >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            href="/moderator/articles" 
            className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span className="font-medium text-slate-700 group-hover:text-indigo-700">Review Articles</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link 
            href="/moderator/students" 
            className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-slate-700 group-hover:text-emerald-700">Manage Students</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}