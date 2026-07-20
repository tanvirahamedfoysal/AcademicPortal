'use client';
import MainLayout from '@/components/MainLayout';
import { ArrowRight } from 'lucide-react';

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
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
    </MainLayout>
  );
}