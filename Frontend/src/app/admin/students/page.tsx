'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpCircle,
  Check,
  Clock,
  GraduationCap,
  Loader2,
  Mail,
  Search,
  ShieldAlert,
  Tag,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { apiFetch } from '../../../lib/client-api';

interface Student {
  uuid: string;
  name: string;
  username?: string;
  status?: string;
  email: string;
  student_batch?: string;
  created_at?: string;
  is_lab_member?: boolean;
}

export default function AdminStudentsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [activeStudents, setActiveStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [pendingRes, activeRes] = await Promise.all([
        apiFetch('/api/v1/students/pending'),
        apiFetch('/api/v1/students'),
      ]);

      if (!pendingRes.ok || !activeRes.ok) throw new Error('Student records could not be loaded.');

      const pendingData = await pendingRes.json();
      const activeData = await activeRes.json();
      const pendingRows = Array.isArray(pendingData) ? pendingData : (pendingData.data || []);
      const activeRows = Array.isArray(activeData) ? activeData : (activeData.data || []);
      setPendingStudents(pendingRows);
      setActiveStudents(activeRows.filter((student: Student) => String(student.status || '').toUpperCase() === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to fetch students data:', error);
      setFeedback(error instanceof Error ? error.message : 'Student records could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleLabMemberLabel = async (student: Student) => {
    const nextValue = !student.is_lab_member;
    setActionLoading(student.uuid);
    try {
      const res = await apiFetch(`/api/v1/students/${student.uuid}/lab-member`, {
        method: 'PATCH',
        body: JSON.stringify({ is_lab_member: nextValue }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.detail || 'Could not update the lab member label.');
      }
      setActiveStudents((current) => current.map((row) => row.uuid === student.uuid ? { ...row, is_lab_member: nextValue } : row));
      setFeedback(nextValue ? `${student.name} is now labelled as a lab member.` : `${student.name} was removed from the Lab Members page.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not update the lab member label.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromoteToModerator = async (uuid: string, name: string) => {
    if (!confirm(`Promote ${name} to moderator?`)) return;
    setActionLoading(uuid);
    try {
      const res = await apiFetch(`/api/v1/moderators/${uuid}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.detail || 'Could not promote this student.');
      }
      setActiveStudents((current) => current.filter((student) => student.uuid !== uuid));
      setFeedback(`${name} was promoted to moderator.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not promote this student.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async (uuid: string) => {
    setActionLoading(uuid);
    try {
      const res = await apiFetch(`/api/v1/students/pending/${uuid}/verify`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Could not approve this registration.');
      setPendingStudents((current) => current.filter((student) => student.uuid !== uuid));
      await fetchData();
      setFeedback('Student registration approved.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not approve this registration.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPending = async (uuid: string) => {
    if (!confirm('Reject and delete this pending registration?')) return;
    setActionLoading(uuid);
    try {
      const res = await apiFetch(`/api/v1/students/pending/${uuid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not reject this registration.');
      setPendingStudents((current) => current.filter((student) => student.uuid !== uuid));
      setFeedback('Pending registration removed.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not reject this registration.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteActive = async (uuid: string) => {
    if (!confirm('Permanently delete this student account?')) return;
    setActionLoading(uuid);
    try {
      const res = await apiFetch(`/api/v1/students/${uuid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete this student account.');
      setActiveStudents((current) => current.filter((student) => student.uuid !== uuid));
      setFeedback('Student account deleted.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not delete this student account.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredData = useMemo(() => {
    const rows = activeTab === 'pending' ? pendingStudents : activeStudents;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((student) =>
      `${student.name} ${student.email} ${student.username || ''} ${student.student_batch || ''}`.toLowerCase().includes(query)
    );
  }, [activeStudents, activeTab, pendingStudents, searchQuery]);

  const renderActions = (student: Student, compact = false) => {
    const busy = actionLoading === student.uuid;
    if (activeTab === 'pending') {
      return (
        <div className={`flex ${compact ? 'w-full' : ''} items-center gap-2`}>
          <button onClick={() => handleVerify(student.uuid)} disabled={busy} className={`${compact ? 'flex-1' : ''} inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#cde3ea] bg-[#dff7f6] px-3 py-2 text-sm font-semibold text-[#527f8f] transition hover:bg-[#cdeff0] disabled:opacity-50`}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
          </button>
          <button onClick={() => handleRejectPending(student.uuid)} disabled={busy} className={`${compact ? 'flex-1' : ''} inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dce7ee] bg-[#fffdfb] px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#edf6ff] disabled:opacity-50`}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Reject
          </button>
        </div>
      );
    }

    return (
      <div className={`flex ${compact ? 'w-full flex-wrap' : 'flex-wrap justify-end'} items-center gap-2`}>
        <button onClick={() => handlePromoteToModerator(student.uuid, student.name)} disabled={busy} className={`${compact ? 'min-w-[120px] flex-1' : ''} inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#cde3ea] bg-[#dff7f6] px-3 py-2 text-sm font-semibold text-[#527f8f] transition hover:bg-[#cdeff0] disabled:opacity-50`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpCircle className="h-4 w-4" />} Promote
        </button>
        <button onClick={() => handleLabMemberLabel(student)} disabled={busy} className={`${compact ? 'min-w-[120px] flex-1' : ''} inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${student.is_lab_member ? 'border-[#bcdbe4] bg-[#edf6ff] text-[#3f7081] hover:bg-[#dff7f6]' : 'border-[#cde3ea] bg-[#fffdfb] text-[#527f8f] hover:bg-[#edf6ff]'}`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />} {student.is_lab_member ? 'Unlabel' : 'Label'}
        </button>
        <button onClick={() => handleDeleteActive(student.uuid)} disabled={busy} className={`${compact ? 'w-full' : ''} inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dce7ee] bg-[#fffdfb] px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#edf6ff] disabled:opacity-50`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
        </button>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <header className="grid gap-5 lg:grid-cols-[1fr_minmax(260px,340px)] lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#527f8f]"><GraduationCap className="h-5 w-5" /> Students</div>
          <h1 className="font-serif text-3xl font-bold tracking-[-0.03em] text-slate-900 sm:text-4xl">Student Management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Review registrations and manage active student accounts.</p>
        </div>
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" placeholder="Search name, email or batch" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-control min-h-11 pl-10" />
        </div>
      </header>

      <div className="grid max-w-md grid-cols-2 gap-1 rounded-2xl border border-[#dce7ee] bg-[#edf6ff] p-1">
        <button onClick={() => setActiveTab('pending')} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${activeTab === 'pending' ? 'bg-[#fffdfb] text-[#4f8294] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Clock className="h-4 w-4" /> Pending
          {pendingStudents.length > 0 && <span className="rounded-full bg-[#dff7f6] px-2 py-0.5 text-[11px] text-[#527f8f]">{pendingStudents.length}</span>}
        </button>
        <button onClick={() => setActiveTab('active')} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${activeTab === 'active' ? 'bg-[#fffdfb] text-[#4f8294] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <UserCheck className="h-4 w-4" /> Active
        </button>
      </div>

      {feedback && <div className="rounded-2xl border border-[#cde3ea] bg-[#edf6ff] px-4 py-3 text-sm text-slate-700">{feedback}</div>}

      <section className="dashboard-card overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /><p className="mt-3 text-sm text-slate-500">Loading students…</p></div>
        ) : filteredData.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center"><ShieldAlert className="h-9 w-9 text-slate-300" /><h2 className="mt-4 font-serif text-xl font-semibold text-slate-800">No {activeTab} students found</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">There are no matching records for this view.</p></div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 md:hidden">
              <AnimatePresence initial={false}>
                {filteredData.map((student) => (
                  <motion.article key={student.uuid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#dff7f6] font-serif text-lg font-bold text-[#527f8f]">{(student.name || student.username || 'S').charAt(0).toUpperCase()}</div>
                      <div className="min-w-0 flex-1">
                        <h2 className="break-words font-semibold text-slate-900">{student.name || 'Student'}</h2>
                        <p className="mt-1 break-all text-sm text-slate-500">{student.email}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                          {student.username && <span className="rounded-full bg-[#edf6ff] px-2.5 py-1">@{student.username}</span>}
                          <span className="rounded-full bg-[#edf6ff] px-2.5 py-1">{student.student_batch ? `Batch ${student.student_batch}` : 'Batch not set'}</span>
                          {student.is_lab_member && <span className="rounded-full bg-[#dff7f6] px-2.5 py-1 font-semibold text-[#527f8f]">Lab member</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5">{renderActions(student, true)}</div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#f8fbfd] text-sm text-slate-600">
                    <th className="px-6 py-4 font-semibold">Student</th>
                    <th className="px-6 py-4 font-semibold">Username</th>
                    <th className="px-6 py-4 font-semibold">Batch</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {filteredData.map((student) => (
                      <motion.tr key={student.uuid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-slate-100 last:border-0 hover:bg-[#f8fbfd]">
                        <td className="px-6 py-4"><div className="flex flex-wrap items-center gap-2"><div className="font-medium text-slate-900">{student.name}</div>{student.is_lab_member && <span className="rounded-full bg-[#dff7f6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#527f8f]">Lab member</span>}</div><div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><Mail className="h-3.5 w-3.5" />{student.email}</div></td>
                        <td className="px-6 py-4 text-sm text-slate-600">{student.username ? `@${student.username}` : '—'}</td>
                        <td className="px-6 py-4"><span className="inline-flex rounded-full bg-[#edf6ff] px-2.5 py-1 text-xs font-medium text-slate-700">{student.student_batch || 'Not set'}</span></td>
                        <td className="px-6 py-4"><div className="flex justify-end">{renderActions(student)}</div></td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
