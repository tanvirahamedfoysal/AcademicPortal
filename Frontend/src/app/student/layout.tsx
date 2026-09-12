'use client';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <div className="min-h-screen bg-[#f3f6f3] lg:flex"><Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role="student" /><div className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-slate-200 bg-[#fbfcfa]/90 px-5 backdrop-blur lg:hidden"><button onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white"><Menu className="h-5 w-5" /></button><span className="font-serif text-lg font-bold">Student workspace</span><span className="w-10" /></header><main className="mx-auto w-full max-w-[1500px] p-5 sm:p-7 lg:p-10">{children}</main></div></div>;
}
