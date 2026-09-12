'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Building2, Link2, Loader2, Mail, Save, UserRound } from 'lucide-react';
import { apiFetch } from '../../../lib/client-api';

type PortfolioForm = {
  school: string; college: string; public_bio: string; research_description: string; research_interests: string;
  email: string; phone: string; github_url: string; orcid_url: string; researchgate_url: string; google_scholar_url: string;
  cv_url: string; discord_url: string; linkedin_url: string; facebook_url: string; x_url: string; instagram_url: string;
};

const emptyForm: PortfolioForm = {
  school: '', college: '', public_bio: '', research_description: '', research_interests: '', email: '', phone: '', github_url: '', orcid_url: '', researchgate_url: '', google_scholar_url: '', cv_url: '', discord_url: '', linkedin_url: '', facebook_url: '', x_url: '', instagram_url: '',
};

const linkFields: Array<[keyof PortfolioForm, string]> = [
  ['google_scholar_url', 'Google Scholar'], ['orcid_url', 'ORCID'], ['researchgate_url', 'ResearchGate'], ['github_url', 'GitHub'], ['linkedin_url', 'LinkedIn'], ['cv_url', 'CV / Resume'], ['x_url', 'X / Twitter'], ['facebook_url', 'Facebook'], ['instagram_url', 'Instagram'], ['discord_url', 'Discord'],
];

export default function AdminPortfolioPage() {
  const [form, setForm] = useState<PortfolioForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/v1/portfolio')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load portfolio metadata.');
        const payload = await response.json();
        const data = payload?.data || {};
        setForm({
          ...emptyForm,
          ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value == null ? '' : value])),
          research_interests: Array.isArray(data.research_interests) ? data.research_interests.join(', ') : (data.research_interests || ''),
        });
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load portfolio metadata.'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof PortfolioForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    const payload = {
      ...form,
      research_interests: form.research_interests.split(',').map((item) => item.trim()).filter(Boolean),
    };
    try {
      const response = await apiFetch('/api/v1/portfolio', { method: 'PUT', body: JSON.stringify(payload) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.detail || 'Portfolio update failed.');
      setFeedback('Public research portfolio updated successfully.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Portfolio update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#0f3b34]" /></div>;

  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10';

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(130deg,#0b2823_0%,#0f3b34_62%,#174b3f_100%)] p-7 text-white shadow-sm md:p-9">
        <div className="max-w-3xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50"><UserRound className="h-3.5 w-3.5" /> Public researcher identity</div><h1 className="font-serif text-3xl font-semibold md:text-4xl">Portfolio Editor</h1><p className="mt-3 text-sm leading-6 text-emerald-50/80">Control the academic profile, research narrative, institutional background, and scholarly links that power the public landing experience.</p></div>
      </section>

      {feedback && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">{feedback}</div>}

      <form onSubmit={save} className="space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="rounded-xl bg-emerald-50 p-2.5 text-[#0f3b34]"><UserRound className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Public narrative</h2><p className="text-sm text-slate-500">The core identity and contact information shown across the public site.</p></div></div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Public bio</span><textarea rows={5} value={form.public_bio} onChange={(e) => update('public_bio', e.target.value)} className={fieldClass} placeholder="A concise professional biography for visitors…" /></label>
            <label><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Mail className="h-4 w-4" /> Contact email</span><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={fieldClass} /></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Phone</span><input value={form.phone} onChange={(e) => update('phone', e.target.value)} className={fieldClass} /></label>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="rounded-xl bg-amber-50 p-2.5 text-[#9b7835]"><BookOpen className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Academic & research profile</h2><p className="text-sm text-slate-500">Institutional background, research direction, and searchable areas of interest.</p></div></div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Building2 className="h-4 w-4" /> School</span><input value={form.school} onChange={(e) => update('school', e.target.value)} className={fieldClass} /></label>
            <label><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Building2 className="h-4 w-4" /> College / University</span><input value={form.college} onChange={(e) => update('college', e.target.value)} className={fieldClass} /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Research description</span><textarea rows={6} value={form.research_description} onChange={(e) => update('research_description', e.target.value)} className={fieldClass} placeholder="Describe the research agenda, methods, questions, or current work…" /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Research interests <span className="font-normal text-slate-400">(comma separated)</span></span><input value={form.research_interests} onChange={(e) => update('research_interests', e.target.value)} className={fieldClass} placeholder="Public health, machine learning, bioinformatics…" /></label>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="rounded-xl bg-slate-100 p-2.5 text-slate-700"><Link2 className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Scholarly & professional links</h2><p className="text-sm text-slate-500">Connect visitors to verified research identities and external profiles.</p></div></div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{linkFields.map(([field, label]) => <label key={field}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input type="url" value={form[field]} onChange={(e) => update(field, e.target.value)} className={fieldClass} placeholder="https://…" /></label>)}</div>
        </section>

        <div className="sticky bottom-4 flex justify-end"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#0f3b34] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#0b2823] disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save portfolio</button></div>
      </form>
    </div>
  );
}
