'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, GraduationCap, Loader2, Mail, Search, Trash2, XCircle } from 'lucide-react';
import { apiFetch } from '../../../lib/client-api';

interface Student {
  uuid: string;
  name: string;
  username: string;
  email: string;
  created_at?: string;
  status?: string;
}

export default function ModeratorStudentsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const endpoint = activeTab === 'active' ? '/api/v1/students' : '/api/v1/students/pending';
      const res = await apiFetch(endpoint);
      if (!res.ok) throw new Error('Student records could not be loaded.');
      const data = await res.json();
      const rows = Array.isArray(data) ? data : (data.data || []);
      if (activeTab === 'active') setStudents(rows.filter((student: Student) => String(student.status || '').toUpperCase() === 'ACTIVE'));
      else setPendingStudents(rows);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Student records could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [activeTab]);

  const handleDelete = async (uuid: string, name: string) => {
    if (!confirm(`Permanently delete ${name}'s account?`)) return;
    setActionLoading(uuid);
    try {
      const res = await apiFetch(`/api/v1/students/${uuid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete this student.');
      setStudents((current) => current.filter((student) => student.uuid !== uuid));
      setFeedback('Student account deleted.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not delete this student.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (uuid: string, name: string) => {
    setActionLoading(uuid);
    try {
      const res = await apiFetch(`/api/v1/students/pending/${uuid}/verify`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Could not approve this student.');
      setPendingStudents((current) => current.filter((student) => student.uuid !== uuid));
      setFeedback(`${name} was approved.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not approve this student.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (uuid: string, name: string) => {
    if (!confirm(`Reject and remove ${name}'s application?`)) return;
    setActionLoading(uuid);
    try {
      const res = await apiFetch(`/api/v1/students/pending/${uuid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not reject this student.');
      setPendingStudents((current) => current.filter((student) => student.uuid !== uuid));
      setFeedback('Pending registration removed.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not reject this student.');
    } finally {
      setActionLoading(null);
    }
  };

  const displayData = activeTab === 'active' ? students : pendingStudents;
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return displayData;
    return displayData.filter((student) => `${student.name} ${student.username || ''} ${student.email}`.toLowerCase().includes(query));
  }, [displayData, searchQuery]);

  const actionButtons = (student: Student, fullWidth = false) => {
    const busy = actionLoading === student.uuid;
    if (activeTab === 'active') {
      return (
        <button onClick={() => handleDelete(student.uuid, student.name)} disabled={busy} className={`${fullWidth ? 'w-full' : ''} inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dce7ee] bg-[#fffdfb] px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#edf6ff] disabled:opacity-50`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
        </button>
      );
    }
    return (
      <div className={`flex items-center gap-2 ${fullWidth ? 'w-full' : ''}`}>
        <button onClick={() => handleApprove(student.uuid, student.name)} disabled={busy} className={`${fullWidth ? 'flex-1' : ''} inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#cde3ea] bg-[#dff7f6] px-3 py-2 text-sm font-semibold text-[#527f8f] transition hover:bg-[#cdeff0] disabled:opacity-50`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Approve
        </button>
        <button onClick={() => handleReject(student.uuid, student.name)} disabled={busy} className={`${fullWidth ? 'flex-1' : ''} inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dce7ee] bg-[#fffdfb] px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#edf6ff] disabled:opacity-50`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Reject
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
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Review registrations and manage student accounts.</p>
        </div>
        <div className="relative w-full"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search students" className="form-control min-h-11 pl-10" /></div>
      </header>

      <div className="grid max-w-md grid-cols-2 gap-1 rounded-2xl border border-[#dce7ee] bg-[#edf6ff] p-1">
        <button onClick={() => setActiveTab('active')} className={`min-h-11 rounded-xl px-3 text-sm font-semibold transition ${activeTab === 'active' ? 'bg-[#fffdfb] text-[#4f8294] shadow-sm' : 'text-slate-500'}`}>Active</button>
        <button onClick={() => setActiveTab('pending')} className={`min-h-11 rounded-xl px-3 text-sm font-semibold transition ${activeTab === 'pending' ? 'bg-[#fffdfb] text-[#4f8294] shadow-sm' : 'text-slate-500'}`}>Pending {pendingStudents.length > 0 && `(${pendingStudents.length})`}</button>
      </div>

      {feedback && <div className="rounded-2xl border border-[#cde3ea] bg-[#edf6ff] px-4 py-3 text-sm text-slate-700">{feedback}</div>}

      <section className="dashboard-card overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /></div>
        ) : filteredData.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><GraduationCap className="h-9 w-9 text-slate-300" /><h2 className="mt-4 font-serif text-xl font-semibold text-slate-800">No {activeTab} students found</h2></div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredData.map((student) => (
                <article key={student.uuid} className="p-5">
                  <div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#dff7f6] font-serif text-lg font-bold text-[#527f8f]">{(student.name || student.username || 'S').charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><h2 className="break-words font-semibold text-slate-900">{student.name || 'Student'}</h2><p className="mt-1 break-all text-sm text-slate-500">{student.email}</p>{student.username && <p className="mt-2 text-xs text-slate-400">@{student.username}</p>}</div></div>
                  <div className="mt-5">{actionButtons(student, true)}</div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[680px] border-collapse text-left"><thead><tr className="border-b border-slate-200 bg-[#f8fbfd] text-sm text-slate-600"><th className="px-6 py-4 font-semibold">Student</th><th className="px-6 py-4 font-semibold">Username</th><th className="px-6 py-4 text-right font-semibold">Actions</th></tr></thead><tbody>{filteredData.map((student) => <tr key={student.uuid} className="border-b border-slate-100 last:border-0 hover:bg-[#f8fbfd]"><td className="px-6 py-4"><div className="font-medium text-slate-900">{student.name || 'Student'}</div><div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><Mail className="h-3.5 w-3.5" />{student.email}</div></td><td className="px-6 py-4 text-sm text-slate-600">{student.username ? `@${student.username}` : '—'}</td><td className="px-6 py-4"><div className="flex justify-end">{actionButtons(student)}</div></td></tr>)}</tbody></table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
