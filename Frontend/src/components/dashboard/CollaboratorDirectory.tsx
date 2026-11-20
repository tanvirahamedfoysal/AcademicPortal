'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Edit3, ExternalLink, ImagePlus, Loader2, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { apiFetch } from '../../lib/client-api';
import {
  buildPortfolioUpdatePayload,
  getVisibleResearchInterests,
  parsePortfolioMedia,
  withPortfolioMedia,
} from '../../lib/portfolio-media';
import type { PortfolioCollaboratorProfile } from '../../lib/portfolio-media';
import type { PortfolioData } from '../../types/public';

type Collaborator = {
  uuid: string;
  name: string;
  image_url?: string | null;
  bio?: string | null;
  organization?: string | null;
  website_url?: string | null;
};

type FormState = {
  name: string;
  bio: string;
  organization: string;
  website_url: string;
  image_url: string;
};

const emptyForm: FormState = {
  name: '',
  bio: '',
  organization: '',
  website_url: '',
  image_url: '',
};

function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(candidate);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Please enter a valid HTTP or HTTPS website URL.');
  }
  return parsed.toString();
}

async function readPortfolio(): Promise<PortfolioData> {
  const response = await apiFetch('/api/v1/portfolio');
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data) {
    throw new Error(payload?.detail || 'Unable to read the portfolio metadata needed to save collaborator details.');
  }
  return payload.data as PortfolioData;
}

async function writeCollaboratorMetadata(
  update: (current: PortfolioCollaboratorProfile[]) => PortfolioCollaboratorProfile[],
): Promise<void> {
  const latest = await readPortfolio();
  const currentMedia = parsePortfolioMedia(latest.research_interests);
  const nextMedia = {
    ...currentMedia,
    collaborators: update(currentMedia.collaborators),
  };
  const nextInterests = withPortfolioMedia(
    getVisibleResearchInterests(latest.research_interests),
    nextMedia,
  );

  const response = await apiFetch('/api/v1/portfolio', {
    method: 'PUT',
    body: JSON.stringify(buildPortfolioUpdatePayload(latest, nextInterests)),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || 'The collaborator was saved, but its public bio and website could not be synchronized.');
  }
}

export default function CollaboratorDirectory({ canManage = false }: { canManage?: boolean }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collaborator | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [collaboratorResponse, portfolioResponse] = await Promise.all([
        apiFetch('/api/v1/collaborators'),
        apiFetch('/api/v1/portfolio'),
      ]);
      const collaboratorPayload = await collaboratorResponse.json().catch(() => null);
      if (!collaboratorResponse.ok) {
        throw new Error(collaboratorPayload?.detail || collaboratorPayload?.message || 'Unable to load collaborators.');
      }

      const rows: Collaborator[] = Array.isArray(collaboratorPayload?.data)
        ? collaboratorPayload.data.map((item: Collaborator) => ({ ...item, uuid: String(item.uuid) }))
        : [];

      let details: PortfolioCollaboratorProfile[] = [];
      if (portfolioResponse.ok) {
        const portfolioPayload = await portfolioResponse.json().catch(() => null);
        details = parsePortfolioMedia(portfolioPayload?.data?.research_interests).collaborators;
      }
      const detailsById = new Map(details.map((item) => [item.uuid, item]));

      setCollaborators(rows.map((item) => {
        const savedDetails = detailsById.get(item.uuid);
        return {
          ...item,
          bio: savedDetails?.bio ?? item.bio ?? '',
          organization: savedDetails?.organization ?? item.organization ?? '',
          website_url: savedDetails?.website_url ?? item.website_url ?? '',
        };
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to load collaborators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(form.image_url);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, form.image_url]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? collaborators.filter((collaborator) => collaborator.name.toLowerCase().includes(term))
      : collaborators;
  }, [collaborators, query]);

  const closeModal = () => {
    setModalOpen(false);
    setImageFile(null);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setFeedback(null);
    setModalOpen(true);
  };

  const openEdit = (collaborator: Collaborator) => {
    setEditing(collaborator);
    setForm({
      name: collaborator.name,
      bio: collaborator.bio || '',
      organization: collaborator.organization || '',
      website_url: collaborator.website_url || '',
      image_url: collaborator.image_url || '',
    });
    setImageFile(null);
    setFeedback(null);
    setModalOpen(true);
  };

  const chooseImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFeedback('Please choose a valid image file.');
      return;
    }
    setFeedback(null);
    setImageFile(file);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.bio.trim()) {
      setFeedback('Name and bio are required.');
      return;
    }
    setSaving(true);
    setFeedback(null);

    let uploadedImageUrl = '';
    let collaboratorSaved = false;
    try {
      const websiteUrl = normalizeWebsiteUrl(form.website_url);
      let imageUrl = form.image_url.trim();

      if (imageFile) {
        const uploadBody = new FormData();
        uploadBody.append('file', imageFile);
        const uploadResponse = await apiFetch('/api/v1/images', {
          method: 'POST',
          body: uploadBody,
        });
        const uploadPayload = await uploadResponse.json().catch(() => null);
        if (!uploadResponse.ok || !uploadPayload?.url) {
          throw new Error(uploadPayload?.detail || uploadPayload?.message || 'Image upload failed. Please try another image.');
        }
        uploadedImageUrl = String(uploadPayload.url);
        imageUrl = uploadedImageUrl;
      }

      const payload: Record<string, string> = {
        name: form.name.trim(),
        bio: form.bio.trim(),
      };
      if (form.organization.trim() || editing) payload.organization = form.organization.trim();
      if (websiteUrl || editing) payload.website_url = websiteUrl;
      if (imageUrl) payload.image_url = imageUrl;

      const response = await apiFetch(
        editing ? `/api/v1/collaborators/${editing.uuid}` : '/api/v1/collaborators',
        {
          method: editing ? 'PATCH' : 'POST',
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.detail || data?.message || 'Unable to save collaborator.');
      }
      collaboratorSaved = true;

      const uuid = String(data?.data?.uuid || editing?.uuid || '');
      if (!uuid) {
        setFeedback('Collaborator saved, but the API did not return its ID. Reload the directory before editing this record.');
      } else {
        const profile: PortfolioCollaboratorProfile = {
          uuid,
          name: form.name.trim(),
          bio: form.bio.trim(),
          organization: form.organization.trim(),
          website_url: websiteUrl,
        };
        try {
          await writeCollaboratorMetadata((current) => [
            ...current.filter((item) => item.uuid !== uuid),
            profile,
          ]);
          setFeedback(editing ? 'Collaborator updated.' : 'Collaborator added.');
        } catch (metadataError) {
          setFeedback(metadataError instanceof Error
            ? metadataError.message
            : 'Collaborator saved, but public profile details could not be synchronized.');
        }
      }

      closeModal();
      await load();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save collaborator.');
      // Avoid leaving an unused uploaded asset behind when the collaborator
      // request itself failed after a successful image upload.
      if (uploadedImageUrl && !collaboratorSaved) {
        try {
          await apiFetch('/api/v1/images', {
            method: 'DELETE',
            body: JSON.stringify({ urls: [uploadedImageUrl] }),
          });
        } catch {
          // The main save error is more useful than a cleanup error.
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (collaborator: Collaborator) => {
    if (!window.confirm(`Remove ${collaborator.name} from the collaboration network?`)) return;
    setWorkingId(collaborator.uuid);
    setFeedback(null);
    try {
      const response = await apiFetch(`/api/v1/collaborators/${collaborator.uuid}`, { method: 'DELETE' });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || payload?.message || 'Unable to remove collaborator.');
      }
      setCollaborators((current) => current.filter((item) => item.uuid !== collaborator.uuid));
      try {
        await writeCollaboratorMetadata((current) => current.filter((item) => item.uuid !== collaborator.uuid));
        setFeedback('Collaborator removed.');
      } catch (metadataError) {
        setFeedback(metadataError instanceof Error
          ? `Collaborator removed, but its saved public details could not be cleaned up: ${metadataError.message}`
          : 'Collaborator removed, but its saved public details could not be cleaned up.');
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to remove collaborator.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(130deg,#fffdfb_0%,#edf6ff_52%,#dff7f6_100%)] px-6 py-8 text-slate-900 md:grid-cols-[1fr_auto] md:items-end md:px-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700"><Users className="h-3.5 w-3.5" /> Research network</div>
            <h1 className="font-serif text-3xl font-semibold md:text-4xl">Collaborators</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">A concise directory of research collaborators connected to the academic portal.</p>
          </div>
          {canManage && <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4f8294]"><Plus className="h-4 w-4" /> Add collaborator</button>}
        </div>

        <div className="border-b border-slate-200 bg-slate-50/70 p-4 md:px-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search collaborators" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#78bac5]" />
          </div>
        </div>

        {feedback && <div className="border-b border-slate-200 bg-[#edf6ff] px-6 py-3 text-sm text-slate-700">{feedback}</div>}

        {loading ? (
          <div className="flex min-h-60 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /></div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">No collaborators match your search.</div>
        ) : (
          <div className="grid gap-px bg-slate-100 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((collaborator) => (
              <article key={collaborator.uuid} className="bg-white p-6">
                <div className="flex items-start gap-4">
                  {collaborator.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={collaborator.image_url} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dff7f6] font-serif text-xl text-[#5f91a0]">{collaborator.name.charAt(0)}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#527f8f]">Research collaborator</div>
                    <h2 className="mt-1 truncate font-serif text-xl font-semibold text-slate-900">{collaborator.name}</h2>
                    {collaborator.organization && <p className="mt-1 text-xs font-semibold text-slate-500">{collaborator.organization}</p>}
                  </div>
                </div>
                {collaborator.bio && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">{collaborator.bio}</p>}
                {canManage && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <button onClick={() => openEdit(collaborator)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#5f91a0]"><Edit3 className="h-4 w-4" /> Edit</button>
                    {collaborator.website_url && <a href={collaborator.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#5f91a0]">Website <ExternalLink className="h-4 w-4" /></a>}
                    <button onClick={() => remove(collaborator)} disabled={workingId === collaborator.uuid} className="inline-flex items-center gap-2 rounded-xl border border-[#cde3ea] px-3 py-2 text-sm font-medium text-[#527f8f] hover:bg-[#edf6ff] disabled:opacity-50">{workingId === collaborator.uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Remove</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[1.75rem] bg-white shadow-2xl sm:rounded-[1.75rem]">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f91a0]">Collaboration record</div>
                <h2 className="font-serif text-2xl font-semibold text-slate-900">{editing ? 'Update collaborator' : 'Add collaborator'}</h2>
              </div>
              <button type="button" onClick={closeModal} className="rounded-full border border-slate-200 p-2 text-slate-500" aria-label="Close dialog"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={save} className="grid gap-5 p-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Name</span>
                <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#78bac5]" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Organization</span>
                <input value={form.organization} onChange={(event) => setForm({ ...form, organization: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#78bac5]" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Bio</span>
                <textarea required rows={4} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#78bac5]" placeholder="Write a short academic or professional biography…" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Website URL</span>
                <input type="text" inputMode="url" value={form.website_url} onChange={(event) => setForm({ ...form, website_url: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#78bac5]" placeholder="https://example.com" />
              </label>
              <div className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Profile image upload</span>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#b8dce3] bg-[#f7fbfc] px-4 py-3 text-sm text-slate-600 transition hover:border-[#78bac5] hover:bg-[#edf6ff]">
                  <ImagePlus className="h-5 w-5 shrink-0 text-[#5f91a0]" />
                  <span className="min-w-0 flex-1 truncate">{imageFile?.name || (form.image_url ? 'Choose a new image to replace the current one' : 'Choose an image from your device')}</span>
                  <input type="file" accept="image/*" onChange={chooseImage} className="sr-only" />
                </label>
                {imagePreview && (
                  <div className="mt-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Selected collaborator profile preview" className="h-14 w-14 rounded-xl border border-slate-200 object-cover" />
                    <span className="text-xs text-slate-400">Image preview</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex justify-stretch sm:justify-end">
                <button disabled={saving} type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f8294] disabled:opacity-60 sm:w-auto">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? (imageFile ? 'Uploading & saving…' : 'Saving…') : (editing ? 'Save changes' : 'Add collaborator')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
