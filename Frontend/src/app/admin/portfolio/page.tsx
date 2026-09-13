'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Building2, Link2, Loader2, Mail, Save, UserRound } from 'lucide-react';
import { apiFetch } from '../../../lib/client-api';
import {
  buildPortfolioUpdatePayload,
  getVisibleResearchInterests,
  parsePortfolioMedia,
  withPortfolioMedia,
} from '../../../lib/portfolio-media';
import type { PortfolioData } from '../../../types/public';

type PortfolioForm = {
  full_name: string; occupation: string; designation: string; education: string;
  school: string; college: string; public_bio: string; research_description: string; research_interests: string;
  email: string; phone: string; github_url: string; orcid_url: string; researchgate_url: string; google_scholar_url: string;
  cv_url: string; discord_url: string; linkedin_url: string; facebook_url: string; x_url: string; instagram_url: string;
};

const emptyForm: PortfolioForm = {
  full_name: 'Dr. Tania Islam', occupation: 'Academic Researcher & Educator', designation: 'Assistant Professor', education: '',
  school: '', college: '', public_bio: '', research_description: '', research_interests: '', email: '', phone: '', github_url: '', orcid_url: '', researchgate_url: '', google_scholar_url: '', cv_url: '', discord_url: '', linkedin_url: '', facebook_url: '', x_url: '', instagram_url: '',
};

const linkFields: Array<[keyof PortfolioForm, string]> = [
  ['google_scholar_url', 'Google Scholar'], ['orcid_url', 'ORCID'], ['researchgate_url', 'ResearchGate'], ['github_url', 'GitHub'], ['linkedin_url', 'LinkedIn'], ['cv_url', 'CV / Resume'], ['x_url', 'X / Twitter'], ['facebook_url', 'Facebook'], ['instagram_url', 'Instagram'], ['discord_url', 'Discord'],
];

function toForm(data: PortfolioData): PortfolioForm {
  const media = parsePortfolioMedia(data.research_interests);
  return {
    full_name: media.researcherInfo.fullName || 'Dr. Tania Islam',
    occupation: media.researcherInfo.occupation || 'Academic Researcher & Educator',
    designation: media.researcherInfo.designation || 'Assistant Professor',
    education: media.researcherInfo.education || '',
    school: data.school || '',
    college: data.college || '',
    public_bio: data.public_bio || '',
    research_description: data.research_description || '',
    research_interests: getVisibleResearchInterests(data.research_interests).join(', '),
    email: data.email || '',
    phone: data.phone || '',
    github_url: data.github_url || '',
    orcid_url: data.orcid_url || '',
    researchgate_url: data.researchgate_url || '',
    google_scholar_url: data.google_scholar_url || '',
    cv_url: data.cv_url || '',
    discord_url: data.discord_url || '',
    linkedin_url: data.linkedin_url || '',
    facebook_url: data.facebook_url || '',
    x_url: data.x_url || '',
    instagram_url: data.instagram_url || '',
  };
}

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
        setForm(toForm((payload?.data || {}) as PortfolioData));
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load portfolio metadata.'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof PortfolioForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      // Refresh first so saving text fields never overwrites newer photo/gallery metadata.
      const [latestResponse, profileResponse] = await Promise.all([
        apiFetch('/api/v1/portfolio'),
        apiFetch('/api/v1/profile/me'),
      ]);
      const latestPayload = await latestResponse.json().catch(() => null);
      if (!latestResponse.ok || !latestPayload?.data) throw new Error(latestPayload?.detail || 'Unable to refresh portfolio data.');
      const latest = latestPayload.data as PortfolioData;
      const profilePayload = profileResponse.ok ? await profileResponse.json().catch(() => null) : null;
      const currentMedia = parsePortfolioMedia(latest.research_interests);
      const media = {
        ...currentMedia,
        ownerUuid: String(profilePayload?.data?.uuid || currentMedia.ownerUuid || ''),
        researcherInfo: {
          fullName: form.full_name.trim(),
          occupation: form.occupation.trim(),
          designation: form.designation.trim(),
          education: form.education.trim(),
        },
      };
      const visibleInterests = form.research_interests.split(',').map((item) => item.trim()).filter(Boolean);
      const researchInterests = withPortfolioMedia(visibleInterests, media);

      const edited: PortfolioData = {
        ...latest,
        school: form.school,
        college: form.college,
        public_bio: form.public_bio,
        research_description: form.research_description,
        email: form.email,
        phone: form.phone,
        github_url: form.github_url,
        orcid_url: form.orcid_url,
        researchgate_url: form.researchgate_url,
        google_scholar_url: form.google_scholar_url,
        cv_url: form.cv_url,
        discord_url: form.discord_url,
        linkedin_url: form.linkedin_url,
        facebook_url: form.facebook_url,
        x_url: form.x_url,
        instagram_url: form.instagram_url,
      };

      const response = await apiFetch('/api/v1/portfolio', { method: 'PUT', body: JSON.stringify(buildPortfolioUpdatePayload(edited, researchInterests)) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.detail || 'Portfolio update failed.');
      setFeedback('Public research portfolio updated successfully.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Portfolio update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /></div>;

  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15';

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(130deg,#fffdfb_0%,#f8dce7_52%,#dff7f6_100%)] p-7 text-slate-900 shadow-sm md:p-9">
        <div className="max-w-3xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700"><UserRound className="h-3.5 w-3.5" /> Public researcher identity</div><h1 className="font-serif text-3xl font-semibold md:text-4xl">Portfolio Editor</h1><p className="mt-3 text-sm leading-6 text-slate-500">Control Dr. Tania Islam&apos;s academic profile, about-me narrative, research direction, institutional information, and public researcher links.</p></div>
      </section>

      {feedback && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">{feedback}</div>}

      <form onSubmit={save} className="space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="rounded-xl bg-[#dff7f6] p-2.5 text-[#5f91a0]"><UserRound className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Public narrative</h2><p className="text-sm text-slate-500">This About Me text is shown prominently beside the portfolio photo on the public landing page.</p></div></div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">About me / public bio</span><textarea rows={6} value={form.public_bio} onChange={(e) => update('public_bio', e.target.value)} className={fieldClass} placeholder="A concise first-person or third-person academic biography for the landing page…" /></label>
            <label><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Mail className="h-4 w-4" /> Contact email</span><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={fieldClass} /></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Phone</span><input value={form.phone} onChange={(e) => update('phone', e.target.value)} className={fieldClass} /></label>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="rounded-xl bg-amber-50 p-2.5 text-[#9f5f7a]"><BookOpen className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Academic &amp; research profile</h2><p className="text-sm text-slate-500">Institutional background, research agenda, and areas of interest used across the public portfolio.</p></div></div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Full name</span><input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className={fieldClass} placeholder="Dr. Tania Islam" /></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Occupation</span><input value={form.occupation} onChange={(e) => update('occupation', e.target.value)} className={fieldClass} placeholder="Academic Researcher & Educator" /></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Designation</span><input value={form.designation} onChange={(e) => update('designation', e.target.value)} className={fieldClass} placeholder="Assistant Professor" /></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Education / qualification</span><input value={form.education} onChange={(e) => update('education', e.target.value)} className={fieldClass} placeholder="PhD / MSc / academic qualification" /></label>
            <label><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Building2 className="h-4 w-4" /> School / department</span><input value={form.school} onChange={(e) => update('school', e.target.value)} className={fieldClass} /></label>
            <label><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Building2 className="h-4 w-4" /> College / University</span><input value={form.college} onChange={(e) => update('college', e.target.value)} className={fieldClass} /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Research description</span><textarea rows={6} value={form.research_description} onChange={(e) => update('research_description', e.target.value)} className={fieldClass} placeholder="Describe the research agenda, methods, questions, or current work…" /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Research interests <span className="font-normal text-slate-400">(comma separated)</span></span><input value={form.research_interests} onChange={(e) => update('research_interests', e.target.value)} className={fieldClass} placeholder="Public health, machine learning, bioinformatics…" /></label>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="rounded-xl bg-slate-100 p-2.5 text-slate-700"><Link2 className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Scholarly &amp; social links</h2><p className="text-sm text-slate-500">These links power the new vertical social/researcher rail on the landing page.</p></div></div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{linkFields.map(([field, label]) => <label key={field}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input type="url" value={form[field]} onChange={(e) => update(field, e.target.value)} className={fieldClass} placeholder="https://…" /></label>)}</div>
        </section>

        <div className="sticky bottom-4 flex justify-end"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#5f91a0] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/20 transition hover:bg-[#a65376] disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save portfolio</button></div>
      </form>
    </div>
  );
}
