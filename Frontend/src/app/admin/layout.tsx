'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#fffaf7] text-slate-900 lg:flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role="admin" />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[66px] items-center justify-between border-b border-[#dce7ee] bg-[#fffdfb]/95 px-4 backdrop-blur sm:px-5 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dce7ee] bg-[#fffdfb] text-slate-600" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-serif text-base font-bold sm:text-lg">Admin workspace</span>
          <span className="w-10" />
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 md:p-7 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
