'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit3, Loader2, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { apiFetch } from '../../lib/client-api';

type Collaborator = { uuid: string; name: string; image_url?: string };
type FormState = { name: string; bio: string; organization: string; website_url: string; image_url: string };
const emptyForm: FormState = { name: '', bio: '', organization: '', website_url: '', image_url: '' };

export default function CollaboratorDirectory({ canManage = false }: { canManage?: boolean }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collaborator | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/v1/collaborators');
      if (!response.ok) throw new Error('Unable to load collaborators.');
      const payload = await response.json();
      setCollaborators(Array.isArray(payload?.data) ? payload.data : []);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to load collaborators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? collaborators.filter((collaborator) => collaborator.name.toLowerCase().includes(term)) : collaborators;
  }, [collaborators, query]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (collaborator: Collaborator) => {
    setEditing(collaborator);
    setForm({ ...emptyForm, name: collaborator.name, image_url: collaborator.image_url || '' });
    setModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload: Record<string, string> = { name: form.name.trim() };
      if (!editing || form.bio.trim()) payload.bio = form.bio.trim();
      if (form.organization.trim()) payload.organization = form.organization.trim();
      if (form.website_url.trim()) payload.website_url = form.website_url.trim();
      if (form.image_url.trim()) payload.image_url = form.image_url.trim();
      const response = await apiFetch(editing ? `/api/v1/collaborators/${editing.uuid}` : '/api/v1/collaborators', {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.detail || data?.message || 'Unable to save collaborator.');
      setModalOpen(false);
      setFeedback(editing ? 'Collaborator updated.' : 'Collaborator added.');
      await load();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save collaborator.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (collaborator: Collaborator) => {
    if (!window.confirm(`Remove ${collaborator.name} from the collaboration network?`)) return;
    setWorkingId(collaborator.uuid);
    try {
      const response = await apiFetch(`/api/v1/collaborators/${collaborator.uuid}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to remove collaborator.');
      setCollaborators((current) => current.filter((item) => item.uuid !== collaborator.uuid));
      setFeedback('Collaborator removed.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to remove collaborator.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(130deg,#0b2823_0%,#0f3b34_62%,#174b3f_100%)] px-6 py-8 text-white md:grid-cols-[1fr_auto] md:items-end md:px-8">
          <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50"><Users className="h-3.5 w-3.5" /> Research network</div><h1 className="font-serif text-3xl font-semibold md:text-4xl">Collaborators</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">A concise directory of research collaborators connected to the academic portal.</p></div>
          {canManage && <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c7a35c] px-4 py-3 text-sm font-semibold text-[#102b26] transition hover:bg-[#d7bb80]"><Plus className="h-4 w-4" /> Add collaborator</button>}
        </div>
        <div className="border-b border-slate-200 bg-slate-50/70 p-4 md:px-6"><div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search collaborators" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-700" /></div></div>
        {feedback && <div className="border-b border-slate-200 bg-amber-50 px-6 py-3 text-sm text-amber-900">{feedback}</div>}
        {loading ? <div className="flex min-h-60 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#0f3b34]" /></div> : filtered.length === 0 ? <div className="px-6 py-16 text-center text-sm text-slate-500">No collaborators match your search.</div> : <div className="grid gap-px bg-slate-100 md:grid-cols-2 xl:grid-cols-3">{filtered.map((collaborator) => <article key={collaborator.uuid} className="bg-white p-6"><div className="flex items-start gap-4">{collaborator.image_url ? <img src={collaborator.image_url} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 font-serif text-xl text-[#0f3b34]">{collaborator.name.charAt(0)}</div>}<div className="min-w-0 flex-1"><div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b7835]">Research collaborator</div><h2 className="mt-1 truncate font-serif text-xl font-semibold text-slate-900">{collaborator.name}</h2></div></div>{canManage && <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4"><button onClick={() => openEdit(collaborator)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#0f3b34]"><Edit3 className="h-4 w-4" /> Edit</button><button onClick={() => remove(collaborator)} disabled={workingId === collaborator.uuid} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">{workingId === collaborator.uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Remove</button></div>}</article>)}</div>}
      </section>

      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f3b34]">Collaboration record</div><h2 className="font-serif text-2xl font-semibold text-slate-900">{editing ? 'Update collaborator' : 'Add collaborator'}</h2></div><button onClick={() => setModalOpen(false)} className="rounded-full border border-slate-200 p-2 text-slate-500"><X className="h-4 w-4" /></button></div><form onSubmit={save} className="grid gap-5 p-6 md:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Name</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700" /></label><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Organization</span><input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700" /></label><label className="block md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Bio {editing && <span className="font-normal text-slate-400">(leave blank to keep existing)</span>}</span><textarea required={!editing} rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700" /></label><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Website URL</span><input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700" /></label><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Image URL</span><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700" /></label><div className="md:col-span-2 flex justify-end"><button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#0f3b34] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editing ? 'Save changes' : 'Add collaborator'}</button></div></form></div></div>}
    </div>
  );
}
