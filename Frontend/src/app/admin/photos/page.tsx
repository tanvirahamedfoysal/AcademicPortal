'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Camera,
  ExternalLink,
  ImagePlus,
  Images,
  Loader2,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { apiFetch } from '../../../lib/client-api';
import {
  buildPortfolioUpdatePayload,
  emptyPortfolioMedia,
  parsePortfolioMedia,
  PORTFOLIO_GALLERY_LIMIT,
  type PortfolioGalleryItem,
  type PortfolioMedia,
  withPortfolioMedia,
} from '../../../lib/portfolio-media';
import type { PortfolioData } from '../../../types/public';

type Feedback = { type: 'success' | 'error' | 'info'; message: string } | null;

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15';

function parseLinks(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter((item) => item.startsWith('http://') || item.startsWith('https://'))
    .slice(0, 8);
}

function validateImage(file?: File | null) {
  if (!file) return 'Choose an image first.';
  if (!file.type.startsWith('image/')) return 'Only image files are supported.';
  if (file.size > 8 * 1024 * 1024) return 'Please use an image smaller than 8 MB.';
  return null;
}

export default function NecessaryPhotosPage() {
  const [media, setMedia] = useState<PortfolioMedia>({ ...emptyPortfolioMedia, gallery: [] });
  const [adminUuid, setAdminUuid] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [newLinks, setNewLinks] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [response, profileResponse] = await Promise.all([
        apiFetch('/api/v1/portfolio'),
        apiFetch('/api/v1/profile/me'),
      ]);
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.data) throw new Error(payload?.detail || 'Unable to load portfolio media.');
      const data = payload.data as PortfolioData;
      const profilePayload = profileResponse.ok ? await profileResponse.json().catch(() => null) : null;
      const uuid = String(profilePayload?.data?.uuid || '');
      setAdminUuid(uuid);
      const parsedMedia = parsePortfolioMedia(data.research_interests);
      setMedia(uuid ? { ...parsedMedia, ownerUuid: uuid } : parsedMedia);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to load portfolio media.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const uploadAsset = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiFetch('/api/v1/images', { method: 'POST', body: formData });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.url) throw new Error(payload?.detail || 'Image upload failed.');
    return String(payload.url);
  };

  const deleteAsset = async (url: string) => {
    const response = await apiFetch('/api/v1/images', {
      method: 'DELETE',
      body: JSON.stringify({ urls: [url] }),
    });
    if (!response.ok && response.status !== 404 && response.status !== 400) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.detail || 'The old image could not be removed from storage.');
    }
  };

  const persistMedia = async (nextMedia: PortfolioMedia) => {
    const mediaWithOwner = adminUuid ? { ...nextMedia, ownerUuid: adminUuid } : nextMedia;
    const latestResponse = await apiFetch('/api/v1/portfolio');
    const latestPayload = await latestResponse.json().catch(() => null);
    if (!latestResponse.ok || !latestPayload?.data) throw new Error(latestPayload?.detail || 'Unable to refresh portfolio data.');

    const latestPortfolio = latestPayload.data as PortfolioData;
    const interestsWithMedia = withPortfolioMedia(latestPortfolio.research_interests, mediaWithOwner);
    const response = await apiFetch('/api/v1/portfolio', {
      method: 'PUT',
      body: JSON.stringify(buildPortfolioUpdatePayload(latestPortfolio, interestsWithMedia)),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.detail || 'Unable to save portfolio media.');

    setMedia(mediaWithOwner);
  };

  const handlePortfolioPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const error = validateImage(file);
    event.target.value = '';
    if (error) { setFeedback({ type: 'error', message: error }); return; }

    setPortfolioUploading(true);
    setFeedback({ type: 'info', message: 'Uploading portfolio photo…' });
    let uploadedUrl = '';
    try {
      uploadedUrl = await uploadAsset(file!);
      const previousUrl = media.portfolioPhoto;
      const nextMedia = { ...media, portfolioPhoto: uploadedUrl };
      await persistMedia(nextMedia);
      if (previousUrl && previousUrl !== uploadedUrl) {
        try { await deleteAsset(previousUrl); } catch { /* the new photo is already safely persisted */ }
      }
      setFeedback({ type: 'success', message: 'Portfolio photo updated. This is separate from the account profile photo.' });
    } catch (cause) {
      if (uploadedUrl) { try { await deleteAsset(uploadedUrl); } catch { /* cleanup best effort */ } }
      setFeedback({ type: 'error', message: cause instanceof Error ? cause.message : 'Portfolio photo update failed.' });
    } finally {
      setPortfolioUploading(false);
    }
  };

  const removePortfolioPhoto = async () => {
    if (!media.portfolioPhoto || !window.confirm('Remove the landing-page portfolio photo?')) return;
    setPortfolioUploading(true);
    const previousUrl = media.portfolioPhoto;
    try {
      await persistMedia({ ...media, portfolioPhoto: '' });
      try { await deleteAsset(previousUrl); } catch { /* metadata removal succeeded */ }
      setFeedback({ type: 'success', message: 'Portfolio photo removed.' });
    } catch (cause) {
      setFeedback({ type: 'error', message: cause instanceof Error ? cause.message : 'Unable to remove portfolio photo.' });
    } finally {
      setPortfolioUploading(false);
    }
  };

  const addGalleryPhoto = async (event: FormEvent) => {
    event.preventDefault();
    if (media.gallery.length >= PORTFOLIO_GALLERY_LIMIT) {
      setFeedback({ type: 'error', message: `The slideshow is limited to ${PORTFOLIO_GALLERY_LIMIT} photos.` });
      return;
    }
    const error = validateImage(galleryFile);
    if (error) { setFeedback({ type: 'error', message: error }); return; }

    setGalleryUploading(true);
    setFeedback({ type: 'info', message: 'Uploading gallery photo…' });
    let uploadedUrl = '';
    try {
      uploadedUrl = await uploadAsset(galleryFile!);
      const item: PortfolioGalleryItem = {
        id: `gallery-${Date.now()}`,
        url: uploadedUrl,
        description: newDescription.trim(),
        links: parseLinks(newLinks),
      };
      await persistMedia({ ...media, gallery: [...media.gallery, item] });
      setGalleryFile(null);
      setNewDescription('');
      setNewLinks('');
      const input = document.getElementById('gallery-file') as HTMLInputElement | null;
      if (input) input.value = '';
      setFeedback({ type: 'success', message: 'Photo added to the achievement slideshow.' });
    } catch (cause) {
      if (uploadedUrl) { try { await deleteAsset(uploadedUrl); } catch { /* cleanup best effort */ } }
      setFeedback({ type: 'error', message: cause instanceof Error ? cause.message : 'Gallery upload failed.' });
    } finally {
      setGalleryUploading(false);
    }
  };

  const saveGalleryDetails = async () => {
    setSaving(true);
    setFeedback({ type: 'info', message: 'Saving gallery descriptions and links…' });
    try {
      await persistMedia(media);
      setFeedback({ type: 'success', message: 'Gallery details saved.' });
    } catch (cause) {
      setFeedback({ type: 'error', message: cause instanceof Error ? cause.message : 'Unable to save gallery details.' });
    } finally {
      setSaving(false);
    }
  };

  const removeGalleryPhoto = async (item: PortfolioGalleryItem) => {
    if (!window.confirm('Remove this photo from the slideshow?')) return;
    setSaving(true);
    try {
      const nextMedia = { ...media, gallery: media.gallery.filter((photo) => photo.id !== item.id) };
      await persistMedia(nextMedia);
      try { await deleteAsset(item.url); } catch { /* metadata removal succeeded; storage cleanup is secondary */ }
      setFeedback({ type: 'success', message: 'Gallery photo removed.' });
    } catch (cause) {
      setFeedback({ type: 'error', message: cause instanceof Error ? cause.message : 'Unable to remove gallery photo.' });
    } finally {
      setSaving(false);
    }
  };

  const movePhoto = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= media.gallery.length) return;
    const gallery = [...media.gallery];
    [gallery[index], gallery[target]] = [gallery[target], gallery[index]];
    setMedia((current) => ({ ...current, gallery }));
  };

  const updateGalleryItem = (id: string, patch: Partial<PortfolioGalleryItem>) => {
    setMedia((current) => ({
      ...current,
      gallery: current.gallery.map((item) => item.id === id ? { ...item, ...patch } : item),
    }));
  };

  if (loading) return <div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(130deg,#fffdfb_0%,#edf6ff_52%,#dff7f6_100%)] p-7 text-slate-900 shadow-sm md:p-9">
        <div className="max-w-4xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700"><Images className="h-3.5 w-3.5" /> Public portfolio media</div>
          <h1 className="font-serif text-3xl font-semibold md:text-4xl">Necessary Photos</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Manage the dedicated portfolio portrait and the achievement/photo-gallery slideshow. The account profile photo remains separate and is updated from Profile Settings.</p>
        </div>
      </section>

      {feedback && <div className={`rounded-2xl border px-5 py-3 text-sm ${feedback.type === 'error' ? 'border-[#cde3ea] bg-[#edf6ff] text-[#3f7081]' : feedback.type === 'success' ? 'border-[#cde3ea] bg-[#dff7f6] text-[#5f91a0]' : 'border-[#cde3ea] bg-[#edf6ff] text-slate-700'}`}>{feedback.message}</div>}

      <section className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="rounded-xl bg-[#dff7f6] p-2.5 text-[#5f91a0]"><Camera className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Portfolio photo</h2><p className="text-sm text-slate-500">The rectangular photo used only on the public landing page.</p></div></div>
          <div className="mt-6 aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 bg-[#edf6ff]">
            {media.portfolioPhoto ? <img src={media.portfolioPhoto} alt="Current portfolio" className="h-full w-full object-contain p-2" /> : <div className="flex h-full flex-col items-center justify-center px-8 text-center"><Camera className="h-9 w-9 text-slate-300" /><p className="mt-4 text-sm font-semibold text-slate-600">No portfolio photo yet</p><p className="mt-1 text-xs leading-5 text-slate-400">Upload a dedicated portrait or professional academic photograph.</p></div>}
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4f8294] ${portfolioUploading ? 'pointer-events-none opacity-60' : ''}`}>
              {portfolioUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {media.portfolioPhoto ? 'Replace photo' : 'Upload photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePortfolioPhoto} disabled={portfolioUploading} />
            </label>
            {media.portfolioPhoto && <button type="button" onClick={removePortfolioPhoto} disabled={portfolioUploading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cde3ea] bg-[#edf6ff] px-4 py-3 text-sm font-semibold text-[#4f8294] transition hover:bg-[#dff7f6] disabled:opacity-50"><Trash2 className="h-4 w-4" /> Remove</button>}
          </div>
        </div>

        <form onSubmit={addGalleryPhoto} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3"><div className="rounded-xl bg-[#edf6ff] p-2.5 text-[#527f8f]"><ImagePlus className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Add slideshow photo</h2><p className="text-sm text-slate-500">Achievement, event, award, conference, teaching, or research moment.</p></div></div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{media.gallery.length}/{PORTFOLIO_GALLERY_LIMIT}</span>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Photo</span><input id="gallery-file" type="file" accept="image/*" onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#dff7f6] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#5f91a0]" /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Photo description</span><textarea rows={5} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className={fieldClass} placeholder="Explain the achievement, event, milestone, place, or research context shown in this photo…" /></label>
            <label className="md:col-span-2"><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><ExternalLink className="h-4 w-4" /> Related links <span className="font-normal text-slate-400">(optional)</span></span><textarea rows={3} value={newLinks} onChange={(e) => setNewLinks(e.target.value)} className={fieldClass} placeholder={'https://conference.org/event\nhttps://journal.org/paper'} /><span className="mt-1.5 block text-xs text-slate-400">Add one URL per line or separate them with commas.</span></label>
          </div>
          <div className="mt-6 flex justify-end"><button type="submit" disabled={galleryUploading || media.gallery.length >= PORTFOLIO_GALLERY_LIMIT} className="inline-flex items-center gap-2 rounded-xl bg-[#5f91a0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f8294] disabled:cursor-not-allowed disabled:opacity-50">{galleryUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Add to slideshow</button></div>
        </form>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div><h2 className="font-serif text-xl font-semibold text-slate-900">Achievement &amp; gallery photos</h2><p className="mt-1 text-sm text-slate-500">Edit descriptions, links, and slideshow order. The public page automatically rotates through these photos.</p></div>
          <button type="button" onClick={saveGalleryDetails} disabled={saving || media.gallery.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save gallery details</button>
        </div>

        {media.gallery.length ? (
          <div className="mt-6 space-y-5">
            {media.gallery.map((item, index) => (
              <article key={item.id} className="grid gap-5 rounded-2xl border border-slate-200 bg-[#fffdfb] p-4 md:grid-cols-[190px_1fr_auto] md:p-5">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100"><img src={item.url} alt={item.description || `Gallery ${index + 1}`} className="h-full w-full object-contain p-2" /></div>
                <div className="grid gap-4">
                  <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Description</span><textarea rows={3} value={item.description} onChange={(e) => updateGalleryItem(item.id, { description: e.target.value })} className={fieldClass} /></label>
                  <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Related links</span><textarea rows={2} value={item.links.join('\n')} onChange={(e) => updateGalleryItem(item.id, { links: parseLinks(e.target.value) })} className={fieldClass} placeholder="One URL per line" /></label>
                </div>
                <div className="flex gap-2 md:flex-col">
                  <button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30" title="Move earlier"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" onClick={() => movePhoto(index, 1)} disabled={index === media.gallery.length - 1} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30" title="Move later"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => removeGalleryPhoto(item)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#cde3ea] bg-[#edf6ff] text-[#527f8f] transition hover:bg-[#dff7f6]" title="Remove photo"><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"><Images className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">No gallery photos yet</p><p className="mt-1 text-xs text-slate-400">Add up to 10 photos using the form above.</p></div>
        )}
      </section>

      <p className="text-xs leading-5 text-slate-400">Media is uploaded through the existing FastAPI <code>/images</code> endpoint. The portfolio-photo URL and slideshow metadata are persisted through the existing <code>/portfolio</code> data contract so no backend route or database migration is required.</p>
    </div>
  );
}
