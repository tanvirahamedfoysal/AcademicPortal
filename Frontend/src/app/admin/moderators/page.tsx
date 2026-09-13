'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpCircle, Loader2, Search, Shield, Trash2, Users, X } from 'lucide-react';
import { apiFetch } from '../../../lib/client-api';

type Moderator = { uuid: string; name?: string; email: string; mobile_number?: string | null; status: string };
type Student = { uuid: string; name: string; username?: string; email: string; status?: string; student_batch?: number | string };

export default function AdminModeratorsPage() {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadModerators = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/v1/moderators');
      if (!response.ok) throw new Error('Unable to load moderators.');
      const payload = await response.json();
      setModerators(Array.isArray(payload?.data) ? payload.data : []);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to load moderators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadModerators(); }, []);

  const openPromotion = async () => {
    setModalOpen(true);
    setStudents([]);
    setStudentQuery('');
    try {
      const response = await apiFetch('/api/v1/students');
      if (!response.ok) throw new Error('Unable to load students.');
      const payload = await response.json();
      setStudents((Array.isArray(payload?.data) ? payload.data : []).filter((student: Student) => String(student.status || '').toUpperCase() !== 'PENDING'));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to load students.');
    }
  };

  const promote = async (student: Student) => {
    if (!window.confirm(`Promote ${student.name || student.email} to moderator?`)) return;
    setWorkingId(student.uuid);
    try {
      const response = await apiFetch(`/api/v1/moderators/${student.uuid}`, { method: 'POST' });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.detail || 'Promotion failed.');
      setFeedback(payload?.message || 'User promoted to moderator.');
      setModalOpen(false);
      await loadModerators();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Promotion failed.');
    } finally {
      setWorkingId(null);
    }
  };

  const demote = async (moderator: Moderator) => {
    if (!window.confirm(`Remove moderator privileges from ${moderator.name || moderator.email}?`)) return;
    setWorkingId(moderator.uuid);
    try {
      const response = await apiFetch(`/api/v1/moderators/${moderator.uuid}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.detail || 'Demotion failed.');
      setModerators((current) => current.filter((item) => item.uuid !== moderator.uuid));
      setFeedback(payload?.message || 'Moderator privileges removed.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Demotion failed.');
    } finally {
      setWorkingId(null);
    }
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return moderators;
    return moderators.filter((moderator) => `${moderator.name || ''} ${moderator.email}`.toLowerCase().includes(term));
  }, [moderators, query]);

  const candidateStudents = useMemo(() => {
    const term = studentQuery.trim().toLowerCase();
    return students.filter((student) => !moderators.some((moderator) => moderator.uuid === student.uuid)).filter((student) => !term || `${student.name || ''} ${student.username || ''} ${student.email}`.toLowerCase().includes(term));
  }, [students, moderators, studentQuery]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(130deg,#fffdfb_0%,#f8dce7_52%,#dff7f6_100%)] px-6 py-8 text-slate-900 md:grid-cols-[1fr_auto] md:items-end md:px-8">
          <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700"><Shield className="h-3.5 w-3.5" /> Governance</div><h1 className="font-serif text-3xl font-semibold md:text-4xl">Moderator Team</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Promote existing verified users into moderation and manage the portal&apos;s academic operations team.</p></div>
          <button onClick={openPromotion} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b96586] px-4 py-3 text-sm font-semibold text-[#60778d] transition hover:bg-[#e8b5c8]"><ArrowUpCircle className="h-4 w-4" /> Promote user</button>
        </div>
        <div className="border-b border-slate-200 bg-slate-50/70 p-4 md:px-6"><div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search moderators" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#78bac5]" /></div></div>
        {feedback && <div className="border-b border-slate-200 bg-amber-50 px-6 py-3 text-sm text-amber-900">{feedback}</div>}
        {loading ? <div className="flex min-h-60 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /></div> : filtered.length === 0 ? <div className="px-6 py-16 text-center text-sm text-slate-500"><Users className="mx-auto mb-3 h-9 w-9 text-slate-300" />No moderators found.</div> : <div className="divide-y divide-slate-100">{filtered.map((moderator) => <article key={moderator.uuid} className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_auto] md:items-center"><div><h2 className="font-serif text-lg font-semibold text-slate-900">{moderator.name || 'Portal Moderator'}</h2><p className="mt-1 text-sm text-slate-500">{moderator.email}{moderator.mobile_number ? ` · ${moderator.mobile_number}` : ''}</p><span className="mt-2 inline-flex rounded-full bg-[#dff7f6] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#689aa6]">{moderator.status}</span></div><button onClick={() => demote(moderator)} disabled={workingId === moderator.uuid} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">{workingId === moderator.uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Remove role</button></article>)}</div>}
      </section>

      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"><div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f91a0]">Existing verified users</div><h2 className="font-serif text-2xl font-semibold text-slate-900">Promote to moderator</h2></div><button onClick={() => setModalOpen(false)} className="rounded-full border border-slate-200 p-2 text-slate-500"><X className="h-4 w-4" /></button></div><div className="p-5"><div className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} placeholder="Search students" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#78bac5]" /></div></div><div className="max-h-[56vh] divide-y divide-slate-100 overflow-y-auto">{candidateStudents.length === 0 ? <div className="px-6 py-12 text-center text-sm text-slate-500">No eligible users found.</div> : candidateStudents.map((student) => <div key={student.uuid} className="flex items-center justify-between gap-4 px-6 py-4"><div className="min-w-0"><div className="truncate font-medium text-slate-900">{student.name || student.username || 'Student'}</div><div className="truncate text-sm text-slate-500">{student.email}{student.student_batch ? ` · Batch ${student.student_batch}` : ''}</div></div><button onClick={() => promote(student)} disabled={workingId === student.uuid} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#5f91a0] px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50">{workingId === student.uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpCircle className="h-4 w-4" />} Promote</button></div>)}</div></div></div>}
    </div>
  );
}
