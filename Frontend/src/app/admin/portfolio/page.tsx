'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Link2,
  Loader2,
  Mail,
  Plus,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react';
import { apiFetch } from '../../../lib/client-api';
import {
  buildPortfolioUpdatePayload,
  createDefaultQuickInfo,
  getVisibleResearchInterests,
  parsePortfolioMedia,
  QUICK_INFO_SOURCE_LABELS,
  QUICK_INFO_SOURCES,
  withPortfolioMedia,
} from '../../../lib/portfolio-media';
import type { PortfolioQuickInfoItem, PortfolioQuickInfoSource } from '../../../lib/portfolio-media';
import type { PortfolioData } from '../../../types/public';

type PortfolioForm = {
  full_name: string;
  occupation: string;
  designation: string;
  education: string;
  school: string;
  college: string;
  public_bio: string;
  research_description: string;
  research_interests: string;
  email: string;
  phone: string;
  github_url: string;
  orcid_url: string;
  researchgate_url: string;
  google_scholar_url: string;
  cv_url: string;
  discord_url: string;
  linkedin_url: string;
  facebook_url: string;
  x_url: string;
  instagram_url: string;
};

const emptyForm: PortfolioForm = {
  full_name: 'Dr. Tania Islam',
  occupation: '',
  designation: '',
  education: '',
  school: '',
  college: '',
  public_bio: '',
  research_description: '',
  research_interests: '',
  email: '',
  phone: '',
  github_url: '',
  orcid_url: '',
  researchgate_url: '',
  google_scholar_url: '',
  cv_url: '',
  discord_url: '',
  linkedin_url: '',
  facebook_url: '',
  x_url: '',
  instagram_url: '',
};

const linkFields: Array<[keyof PortfolioForm, string]> = [
  ['google_scholar_url', 'Google Scholar'],
  ['orcid_url', 'ORCID'],
  ['researchgate_url', 'ResearchGate'],
  ['github_url', 'GitHub'],
  ['linkedin_url', 'LinkedIn'],
  ['cv_url', 'CV / Resume'],
  ['x_url', 'X / Twitter'],
  ['facebook_url', 'Facebook'],
  ['instagram_url', 'Instagram'],
  ['discord_url', 'Discord'],
];

function formFromPortfolio(data: PortfolioData): PortfolioForm {
  const media = parsePortfolioMedia(data.research_interests);
  return {
    full_name: media.researcherInfo.fullName || 'Dr. Tania Islam',
    occupation: media.researcherInfo.occupation || '',
    designation: media.researcherInfo.designation || '',
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

function quickInfoValueFromForm(source: PortfolioQuickInfoSource, form: PortfolioForm): string {
  switch (source) {
    case 'full_name': return form.full_name;
    case 'occupation': return form.occupation;
    case 'designation': return form.designation;
    case 'education': return form.education;
    case 'school': return form.school;
    case 'college': return form.college;
    case 'phone': return form.phone;
    case 'email': return form.email;
    case 'research_interests': return form.research_interests;
    default: return '';
  }
}

export default function AdminPortfolioPage() {
  const [form, setForm] = useState<PortfolioForm>(emptyForm);
  const [quickInfo, setQuickInfo] = useState<PortfolioQuickInfoItem[]>(createDefaultQuickInfo());
  const [sourceToAdd, setSourceToAdd] = useState<PortfolioQuickInfoSource | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/v1/portfolio')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load portfolio metadata.');
        const payload = await response.json();
        const data = (payload?.data || {}) as PortfolioData;
        const media = parsePortfolioMedia(data.research_interests);
        setForm(formFromPortfolio(data));
        setQuickInfo(media.quickInfo === null ? createDefaultQuickInfo() : media.quickInfo);
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load portfolio metadata.'))
      .finally(() => setLoading(false));
  }, []);

  const availableSources = useMemo(
    () => QUICK_INFO_SOURCES.filter((source) => !quickInfo.some((item) => item.source === source)),
    [quickInfo],
  );

  const update = (field: keyof PortfolioForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const updateQuickInfo = (id: string, patch: Partial<PortfolioQuickInfoItem>) => {
    setQuickInfo((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const removeQuickInfo = (id: string) => {
    setQuickInfo((current) => current.filter((item) => item.id !== id));
  };

  const moveQuickInfo = (index: number, direction: -1 | 1) => {
    setQuickInfo((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addStandardQuickInfo = () => {
    if (!sourceToAdd) return;
    setQuickInfo((current) => [
      ...current,
      {
        id: `quick-${sourceToAdd}-${Date.now()}`,
        label: QUICK_INFO_SOURCE_LABELS[sourceToAdd],
        value: '',
        source: sourceToAdd,
      },
    ]);
    setSourceToAdd('');
  };

  const addCustomQuickInfo = () => {
    setQuickInfo((current) => [
      ...current,
      { id: `quick-custom-${Date.now()}`, label: '', value: '', source: null },
    ]);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
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
        quickInfo: quickInfo.map((item) => ({
          ...item,
          label: item.label.trim(),
          value: item.source ? '' : item.value.trim(),
        })),
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

      const response = await apiFetch('/api/v1/portfolio', {
        method: 'PUT',
        body: JSON.stringify(buildPortfolioUpdatePayload(edited, researchInterests)),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.detail || 'Portfolio update failed.');
      setFeedback('Portfolio updated.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Portfolio update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /></div>;

  const fieldClass = 'w-full rounded-xl border border-[#d6e7ef] bg-[#fffdfb] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15';

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-[#d6e7ef] bg-[linear-gradient(130deg,#fffdfb_0%,#edf6ff_52%,#dff7f6_100%)] p-7 text-slate-900 shadow-sm md:p-9">
        <div className="max-w-3xl">
          <h1 className="font-serif text-3xl font-semibold md:text-4xl">Portfolio Editor</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Edit the public biography, academic details, quick information, contact details, and researcher links.</p>
        </div>
      </section>

      {feedback && <div className="rounded-2xl border border-[#cde3ea] bg-[#edf6ff] px-5 py-3 text-sm text-slate-700">{feedback}</div>}

      <form onSubmit={save} className="space-y-6">
        <section className="rounded-[1.75rem] border border-[#dce7ee] bg-[#fffdfb] p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-[#e1eaf0] pb-5">
            <div className="rounded-xl bg-[#dff7f6] p-2.5 text-[#5f91a0]"><UserRound className="h-5 w-5" /></div>
            <div><h2 className="font-serif text-xl font-semibold text-slate-900">About &amp; contact</h2><p className="text-sm text-slate-500">The biography is shown in the About me panel on the landing page.</p></div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">About me</span><textarea rows={6} value={form.public_bio} onChange={(e) => update('public_bio', e.target.value)} className={fieldClass} /></label>
            <label><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Mail className="h-4 w-4" /> Email</span><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={fieldClass} /></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Phone</span><input value={form.phone} onChange={(e) => update('phone', e.target.value)} className={fieldClass} /></label>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#dce7ee] bg-[#fffdfb] p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-[#e1eaf0] pb-5">
            <div className="rounded-xl bg-[#edf6ff] p-2.5 text-[#5f91a0]"><Building2 className="h-5 w-5" /></div>
            <div><h2 className="font-serif text-xl font-semibold text-slate-900">Academic details</h2><p className="text-sm text-slate-500">Leave any field empty if it should not be shown publicly.</p></div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Full name</span><input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className={fieldClass} /></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Occupation</span><input value={form.occupation} onChange={(e) => update('occupation', e.target.value)} className={fieldClass} /></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Designation</span><input value={form.designation} onChange={(e) => update('designation', e.target.value)} className={fieldClass} /></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Education / qualification</span><input value={form.education} onChange={(e) => update('education', e.target.value)} className={fieldClass} /></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">Department / School</span><input value={form.school} onChange={(e) => update('school', e.target.value)} className={fieldClass} /></label>
            <label><span className="mb-2 block text-sm font-semibold text-slate-700">University / Institution</span><input value={form.college} onChange={(e) => update('college', e.target.value)} className={fieldClass} /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Research description</span><textarea rows={6} value={form.research_description} onChange={(e) => update('research_description', e.target.value)} className={fieldClass} /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Research interests <span className="font-normal text-slate-400">(comma separated)</span></span><input value={form.research_interests} onChange={(e) => update('research_interests', e.target.value)} className={fieldClass} /></label>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#dce7ee] bg-[#fffdfb] p-6 shadow-sm md:p-8">
          <div className="border-b border-[#e1eaf0] pb-5">
            <h2 className="font-serif text-xl font-semibold text-slate-900">Quick info</h2>
            <p className="mt-1 text-sm text-slate-500">Choose what appears in the landing-page quick info card. Change the label, add custom fields, remove rows, and set the display order.</p>
          </div>

          <div className="mt-6 space-y-3">
            {quickInfo.map((item, index) => {
              const boundValue = item.source ? quickInfoValueFromForm(item.source, form) : item.value;
              return (
                <div key={item.id} className="grid gap-3 rounded-2xl border border-[#dce7ee] bg-[#edf6ff]/40 p-4 lg:grid-cols-[minmax(150px,.75fr)_minmax(220px,1.25fr)_auto] lg:items-center">
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-slate-500">Field name</span>
                    <input value={item.label} onChange={(e) => updateQuickInfo(item.id, { label: e.target.value })} className={fieldClass} placeholder="Field name" />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-slate-500">Value</span>
                    {item.source ? (
                      <input value={boundValue} readOnly className={`${fieldClass} bg-[#f7fbff] text-slate-500`} title={`Edit this value in the ${QUICK_INFO_SOURCE_LABELS[item.source]} field above.`} />
                    ) : (
                      <input value={item.value} onChange={(e) => updateQuickInfo(item.id, { value: e.target.value })} className={fieldClass} placeholder="Field value" />
                    )}
                  </label>
                  <div className="flex items-center gap-2 lg:self-end lg:pb-0.5">
                    <button type="button" onClick={() => moveQuickInfo(index, -1)} disabled={index === 0} className="grid h-10 w-10 place-items-center rounded-xl border border-[#cde3ea] bg-[#fffdfb] text-slate-600 disabled:opacity-35" aria-label="Move field up"><ChevronUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => moveQuickInfo(index, 1)} disabled={index === quickInfo.length - 1} className="grid h-10 w-10 place-items-center rounded-xl border border-[#cde3ea] bg-[#fffdfb] text-slate-600 disabled:opacity-35" aria-label="Move field down"><ChevronDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => removeQuickInfo(item.id)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#cde3ea] bg-white text-[#527f8f] hover:bg-[#edf6ff]" aria-label="Remove field"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}

            {quickInfo.length === 0 && <div className="rounded-2xl border border-dashed border-[#cde3ea] bg-[#edf6ff]/40 p-6 text-sm text-slate-500">No quick-info fields are currently enabled.</div>}
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="min-w-0 flex-1">
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">Add an existing portfolio field</span>
              <select value={sourceToAdd} onChange={(e) => setSourceToAdd(e.target.value as PortfolioQuickInfoSource | '')} className={fieldClass}>
                <option value="">Choose a field</option>
                {availableSources.map((source) => <option key={source} value={source}>{QUICK_INFO_SOURCE_LABELS[source]}</option>)}
              </select>
            </label>
            <button type="button" onClick={addStandardQuickInfo} disabled={!sourceToAdd} className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-5 text-sm font-semibold text-white transition hover:bg-[#4f8294] disabled:opacity-45"><Plus className="h-4 w-4" /> Add field</button>
            <button type="button" onClick={addCustomQuickInfo} className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl border border-[#b8dce3] bg-[#edf6ff] px-5 text-sm font-semibold text-[#4f8294] transition hover:bg-[#dff7f6]"><Plus className="h-4 w-4" /> Add custom field</button>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#dce7ee] bg-[#fffdfb] p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-[#e1eaf0] pb-5">
            <div className="rounded-xl bg-[#dff7f6] p-2.5 text-[#5f91a0]"><Link2 className="h-5 w-5" /></div>
            <div><h2 className="font-serif text-xl font-semibold text-slate-900">Researcher &amp; social links</h2><p className="text-sm text-slate-500">These links are used by the social rail on the landing page.</p></div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {linkFields.map(([field, label]) => <label key={field}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input type="url" value={form[field]} onChange={(e) => update(field, e.target.value)} className={fieldClass} placeholder="https://" /></label>)}
          </div>
        </section>

        <div className="sticky bottom-4 flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#5f91a0] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/20 transition hover:bg-[#4f8294] disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save portfolio
          </button>
        </div>
      </form>
    </div>
  );
}
