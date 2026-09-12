'use client';

import { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Loader2, Mail, Search } from 'lucide-react';
import { apiFetch } from '../../../lib/client-api';

type Student = { uuid: string; name: string; username?: string; email: string; image_url?: string; status: string; student_batch?: number | string };

export default function StudentDirectoryPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/students')
      .then(async (response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load student directory')))
      .then((payload) => setStudents((Array.isArray(payload?.data) ? payload.data : []).filter((student: Student) => String(student.status).toUpperCase() === 'ACTIVE')))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return students.filter((student) => !term || `${student.name} ${student.username || ''} ${student.student_batch || ''}`.toLowerCase().includes(term));
  }, [students, query]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(130deg,#0b2823_0%,#0f3b34_62%,#174b3f_100%)] px-6 py-8 text-white md:px-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50"><GraduationCap className="h-3.5 w-3.5" /> Academic community</div>
          <h1 className="font-serif text-3xl font-semibold md:text-4xl">Student Directory</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">Discover active students in the research community and identify potential peers for study, review, and collaboration.</p>
        </div>
        <div className="border-b border-slate-200 bg-slate-50/70 p-4 md:px-6"><div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students or batches" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-700" /></div></div>
        {loading ? <div className="flex min-h-60 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#0f3b34]" /></div> : filtered.length === 0 ? <div className="px-6 py-16 text-center text-sm text-slate-500">No active students match your search.</div> : <div className="grid gap-px bg-slate-100 md:grid-cols-2 xl:grid-cols-3">{filtered.map((student) => <article key={student.uuid} className="bg-white p-6"><div className="flex items-center gap-4">{student.image_url ? <img src={student.image_url} alt="" className="h-14 w-14 rounded-2xl object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 font-serif text-xl text-[#0f3b34]">{student.name?.charAt(0) || 'S'}</div>}<div className="min-w-0"><h2 className="truncate font-serif text-lg font-semibold text-slate-900">{student.name || student.username || 'Student'}</h2><p className="truncate text-sm text-slate-500">{student.username ? `@${student.username}` : 'Research community member'}</p></div></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{student.student_batch ? `Batch ${student.student_batch}` : 'Active student'}</span><a href={`mailto:${student.email}`} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:text-[#0f3b34]" aria-label={`Email ${student.name}`}><Mail className="h-4 w-4" /></a></div></article>)}</div>}
      </section>
    </div>
  );
}
