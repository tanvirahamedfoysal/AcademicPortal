'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Users, Shield, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      {/* Navbar Placeholder */}
      <nav className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Researcher's Eden
        </div>
        <div className="gap-4 hidden sm:flex">
          <Link href="/auth/login" className="px-5 py-2.5 text-slate-600 font-medium hover:text-blue-600 transition-colors">
            Sign In
          </Link>
          <Link href="/auth/register" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Create Account
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1.5 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm">
            v5 Beta Now Live
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            Elevate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Academic Research</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            A centralized, high-performance platform designed for publishing, discovering, and collaborating on peer-reviewed academic documents.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/register" className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5">
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/public/articles" className="flex items-center justify-center px-8 py-4 bg-white text-slate-700 text-lg font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm border border-slate-200">
              Browse Articles
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="mt-32 grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Seamless Publishing</h3>
            <p className="text-slate-600 leading-relaxed">Upload, format, and publish your research papers with our advanced document management system.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Global Collaboration</h3>
            <p className="text-slate-600 leading-relaxed">Connect with peers, review submissions, and build academic networks across the world.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Integrity</h3>
            <p className="text-slate-600 leading-relaxed">Built-in peer review tools and strict access controls ensure the highest standard of academic integrity.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}