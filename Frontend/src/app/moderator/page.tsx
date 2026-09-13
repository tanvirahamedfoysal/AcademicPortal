'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, FolderArchive, GraduationCap, Loader2, Shield, Users } from 'lucide-react';
import { apiFetch } from '../../lib/client-api';

type Counts = { articles: number; students: number; pending: number; collaborators: number; resources: number };

export default function ModeratorDashboard() {
  const [counts, setCounts] = useState<Counts>({ articles: 0, students: 0, pending: 0, collaborators: 0, resources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/articles'),
      apiFetch('/api/v1/students'),
      apiFetch('/api/v1/students/pending'),
      apiFetch('/api/v1/collaborators'),
      apiFetch('/api/v1/repository/documents'),
    ]).then(async (responses) => Promise.all(responses.map(async (response) => response.ok ? response.json() : { data: [] })))
      .then(([articles, students, pending, collaborators, resources]) => setCounts({
        articles: articles?.data?.length || 0,
        students: students?.data?.filter((student: { status?: string }) => String(student.status).toUpperCase() === 'ACTIVE').length || 0,
        pending: pending?.data?.length || 0,
        collaborators: collaborators?.data?.length || 0,
        resources: resources?.data?.length || 0,
      }))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Your articles', value: counts.articles, icon: BookOpen },
    { label: 'Active students', value: counts.students, icon: GraduationCap },
    { label: 'Pending reviews', value: counts.pending, icon: Shield },
    { label: 'Collaborators', value: counts.collaborators, icon: Users },
    { label: 'Resources', value: counts.resources, icon: FolderArchive },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(130deg,#fffdfb_0%,#edf6ff_52%,#dff7f6_100%)] p-7 text-slate-900 shadow-sm md:p-9">
        <div className="max-w-3xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700"><Shield className="h-3.5 w-3.5" /> Moderator workspace</div><h1 className="font-serif text-3xl font-semibold md:text-4xl">Academic Operations Overview</h1><p className="mt-3 text-sm leading-6 text-slate-500">Review the live state of the research community, maintain shared knowledge, and keep contribution workflows moving.</p></div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><stat.icon className="h-5 w-5 text-[#5f91a0]" /><div className="mt-5 text-3xl font-semibold text-slate-900">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}</div><div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{stat.label}</div></div>)}</section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[
        ['/moderator/articles', 'Publishing desk', 'Create, edit, publish, and archive your research writing.', BookOpen],
        ['/moderator/students', 'Student review', 'Review pending registrations and maintain the student community.', GraduationCap],
        ['/moderator/repository', 'Knowledge archive', 'Curate research documents, datasets, and shared materials.', FolderArchive],
        ['/moderator/collaborators', 'Collaboration network', 'Maintain external collaborators and research partners.', Users],
      ].map(([href, title, description, Icon]) => {
        const ActionIcon = Icon as typeof BookOpen;
        return <Link key={String(href)} href={String(href)} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><div className="rounded-xl bg-[#dff7f6] p-2.5 text-[#5f91a0]"><ActionIcon className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#5f91a0]" /></div><h2 className="mt-5 font-serif text-xl font-semibold text-slate-900">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{String(description)}</p></Link>;
      })}</section>
    </div>
  );
}
