'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, FolderArchive, GraduationCap, Loader2, MessageSquare, UserRound, Users } from 'lucide-react';
import { apiFetch } from '../../lib/client-api';

type Counts = { articles: number; resources: number; collaborators: number; students: number };

export default function StudentDashboardHome() {
  const [counts, setCounts] = useState<Counts>({ articles: 0, resources: 0, collaborators: 0, students: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([apiFetch('/api/v1/articles/public'), apiFetch('/api/v1/repository/documents'), apiFetch('/api/v1/collaborators'), apiFetch('/api/v1/students')])
      .then(async (responses) => Promise.all(responses.map(async (response) => response.ok ? response.json() : { data: [] })))
      .then(([articles, resources, collaborators, students]) => setCounts({ articles: articles?.data?.length || 0, resources: resources?.data?.length || 0, collaborators: collaborators?.data?.length || 0, students: students?.data?.filter((student: { status?: string }) => String(student.status).toUpperCase() === 'ACTIVE').length || 0 }))
      .finally(() => setLoading(false));
  }, []);

  const links = [
    ['/student/articles', 'Published research', 'Read the portal’s active publication collection.', BookOpen],
    ['/student/repository', 'Research repository', 'Open shared documents, datasets, and reference material.', FolderArchive],
    ['/student/collaborators', 'Research network', 'Explore collaborators and partner organizations.', Users],
    ['/student/students', 'Student directory', 'Discover peers across active academic batches.', GraduationCap],
    ['/student/messages', 'Contact desk', 'Send a message to the academic portal team.', MessageSquare],
    ['/student/profile', 'Profile & security', 'Maintain your account details and password.', UserRound],
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(130deg,#fffdfb_0%,#edf6ff_52%,#dff7f6_100%)] p-7 text-slate-900 shadow-sm md:p-9"><div className="absolute -right-14 -top-14 h-56 w-56 rounded-full border border-white/10" /><div className="relative max-w-3xl"><h1 className="font-serif text-3xl font-semibold md:text-4xl">Research Learning Hub</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Move from reading to participation: discover published work, use shared resources, find peers, and stay connected to the research community.</p></div></section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
        ['Published articles', counts.articles, BookOpen], ['Repository resources', counts.resources, FolderArchive], ['Collaborators', counts.collaborators, Users], ['Active students', counts.students, GraduationCap],
      ].map(([label, value, Icon]) => { const StatIcon = Icon as typeof BookOpen; return <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><StatIcon className="h-5 w-5 text-[#5f91a0]" /><div className="mt-5 text-3xl font-semibold text-slate-900">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : String(value)}</div><div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{String(label)}</div></div>; })}</section>
      <section><div className="mb-4"><h2 className="font-serif text-2xl font-semibold text-slate-900">Your academic toolkit</h2></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{links.map(([href, title, description, Icon]) => { const LinkIcon = Icon as typeof BookOpen; return <Link key={String(href)} href={String(href)} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><div className="rounded-xl bg-[#dff7f6] p-2.5 text-[#5f91a0]"><LinkIcon className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#5f91a0]" /></div><h3 className="mt-5 font-serif text-xl font-semibold text-slate-900">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{String(description)}</p></Link>; })}</div></section>
    </div>
  );
}
