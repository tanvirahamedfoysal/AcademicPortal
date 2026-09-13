'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { Camera, KeyRound, Loader2, Mail, Save, Shield, Upload, UserRound } from 'lucide-react';
import { apiFetch } from '../../lib/client-api';
import { buildPortfolioUpdatePayload, parsePortfolioMedia, withPortfolioMedia } from '../../lib/portfolio-media';
import type { PortfolioData } from '../../types/public';

type Profile = {
  uuid: string;
  email: string;
  status: string;
  user_role: string;
  profile_type: string;
  profile_image?: string;
  user_updated_at?: string | null;
  student_batch?: number | string | null;
};

export default function AccountProfileSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', bio: '', mobile_number: '', image_url: '', student_batch: '' });
  const [password, setPassword] = useState({ next: '', confirm: '' });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileResponse, portfolioResponse] = await Promise.all([
        apiFetch('/api/v1/profile/me'),
        apiFetch('/api/v1/portfolio'),
      ]);
      if (!profileResponse.ok) throw new Error('Unable to load account profile.');
      const profilePayload = await profileResponse.json();
      const data = profilePayload?.data as Profile;
      setProfile(data);

      let publicBio = '';
      if (data?.user_role === 'ADMIN' && portfolioResponse.ok) {
        const portfolioPayload = await portfolioResponse.json().catch(() => null);
        publicBio = portfolioPayload?.data?.public_bio || '';
      }

      setForm((current) => ({
        ...current,
        bio: data?.user_role === 'ADMIN' ? publicBio : current.bio,
        image_url: data?.profile_image || '',
        student_batch: data?.student_batch ? String(data.student_batch) : '',
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to load account profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadProfile(); }, []);

  const syncAdminPublicBio = async (bio: string, displayName: string, mobileNumber: string) => {
    const response = await apiFetch('/api/v1/portfolio');
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.data) throw new Error(payload?.detail || 'Profile saved, but public About Me could not be refreshed.');
    const current = payload.data as PortfolioData;
    const next: PortfolioData = {
      ...current,
      public_bio: bio,
      phone: mobileNumber.trim() || current.phone,
    };
    const media = parsePortfolioMedia(current.research_interests);
    const interestsWithOwner = withPortfolioMedia(current.research_interests, {
      ...media,
      ownerUuid: profile?.uuid || media.ownerUuid,
      researcherInfo: {
        ...media.researcherInfo,
        fullName: displayName.trim() || media.researcherInfo.fullName,
      },
    });
    const saveResponse = await apiFetch('/api/v1/portfolio', {
      method: 'PUT',
      body: JSON.stringify(buildPortfolioUpdatePayload(next, interestsWithOwner)),
    });
    const savePayload = await saveResponse.json().catch(() => null);
    if (!saveResponse.ok) throw new Error(savePayload?.detail || 'Profile saved, but public About Me could not be synchronized.');
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    const payload: Record<string, string> = {};
    if (form.name.trim()) payload.name = form.name.trim();
    if (profile?.user_role === 'ADMIN') payload.bio = form.bio.trim();
    else if (form.bio.trim()) payload.bio = form.bio.trim();
    if (form.mobile_number.trim()) payload.mobile_number = form.mobile_number.trim();
    if (form.image_url.trim()) payload.image_url = form.image_url.trim();
    if (profile?.user_role !== 'ADMIN' && form.student_batch.trim()) payload.student_batch = form.student_batch.trim();

    if (Object.keys(payload).length === 0) {
      setFeedback('Add at least one profile field before saving.');
      setSaving(false);
      return;
    }

    try {
      const response = await apiFetch('/api/v1/profile/me', { method: 'PATCH', body: JSON.stringify(payload) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.detail || 'Profile update failed.');

      if (profile?.user_role === 'ADMIN') {
        await syncAdminPublicBio(form.bio.trim(), form.name, form.mobile_number);
      }

      setFeedback(profile?.user_role === 'ADMIN'
        ? 'Profile updated. The About Me description was also synchronized to the public landing page.'
        : (data?.message || 'Profile updated successfully.'));
      await loadProfile();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  const uploadProfilePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setFeedback('Choose an image file for the profile photo.'); return; }
    if (file.size > 8 * 1024 * 1024) { setFeedback('Please use a profile image smaller than 8 MB.'); return; }

    setPhotoUploading(true);
    setFeedback('Uploading profile photo…');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await apiFetch('/api/v1/images', { method: 'POST', body: formData });
      const uploadPayload = await uploadResponse.json().catch(() => null);
      if (!uploadResponse.ok || !uploadPayload?.url) throw new Error(uploadPayload?.detail || 'Profile image upload failed.');

      const imageUrl = String(uploadPayload.url);
      const patchResponse = await apiFetch('/api/v1/profile/me', {
        method: 'PATCH',
        body: JSON.stringify({ image_url: imageUrl }),
      });
      const patchPayload = await patchResponse.json().catch(() => null);
      if (!patchResponse.ok) throw new Error(patchPayload?.detail || 'Unable to attach the uploaded image to your profile.');

      setForm((current) => ({ ...current, image_url: imageUrl }));
      setProfile((current) => current ? { ...current, profile_image: imageUrl } : current);
      setFeedback('Profile photo updated. This photo is separate from the landing-page Portfolio Photo.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Profile image upload failed.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.next.length < 8) { setFeedback('Use at least 8 characters for the new password.'); return; }
    if (password.next !== password.confirm) { setFeedback('The new passwords do not match.'); return; }
    setSaving(true);
    setFeedback(null);
    try {
      const response = await apiFetch('/api/v1/profile/me', { method: 'PATCH', body: JSON.stringify({ password: password.next }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.detail || 'Password update failed.');
      setPassword({ next: '', confirm: '' });
      setFeedback(data?.message || 'Password updated successfully.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Password update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(130deg,#fffdfb_0%,#edf6ff_52%,#dff7f6_100%)] px-6 py-8 text-slate-900 md:grid-cols-[auto_1fr_auto] md:items-center md:px-8">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/20 bg-white/10">
            {profile?.profile_image ? <img src={profile.profile_image} alt="Profile" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><UserRound className="h-8 w-8" /></div>}
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6fa8b4]">Academic account</div>
            <h1 className="mt-1 font-serif text-3xl font-semibold">Profile &amp; Security</h1>
            <p className="mt-2 text-sm text-slate-500">Keep your account identity, public About Me description, profile image, and security information current.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right">
            <div className="text-sm font-semibold">{profile?.user_role || 'USER'}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{profile?.status || 'Account'}</div>
          </div>
        </div>
      </section>

      {feedback && <div className="rounded-2xl border border-[#cde3ea] bg-[#edf6ff] px-5 py-3 text-sm text-slate-700">{feedback}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <form onSubmit={saveProfile} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="rounded-xl bg-[#dff7f6] p-2.5 text-[#5f91a0]"><UserRound className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Profile information</h2><p className="text-sm text-slate-500">The public portfolio photo is managed separately from Necessary Photos.</p></div></div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Display name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15" /></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Mobile number</span><input value={form.mobile_number} onChange={(e) => setForm({ ...form, mobile_number: e.target.value })} placeholder="Contact number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15" /></label>
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">{profile?.user_role === 'ADMIN' ? 'About me / public description' : 'Short bio'}</span><textarea rows={5} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Academic role, interests, current research focus…" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15" />{profile?.user_role === 'ADMIN' && <span className="mt-1.5 block text-xs text-slate-400">For the admin account this is synchronized with the About Me section on the public landing page.</span>}</label>

            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">{profile?.profile_image ? <img src={profile.profile_image} alt="Current profile" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Camera className="h-5 w-5 text-slate-300" /></div>}</div>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">Profile photo</p><p className="mt-1 text-xs leading-5 text-slate-500">Used for the account/profile identity. It is not the large rectangular Portfolio Photo on the public homepage.</p></div>
                <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#5f91a0] shadow-sm ring-1 ring-slate-200 transition hover:ring-[#78bac5]/30 ${photoUploading ? 'pointer-events-none opacity-60' : ''}`}>{photoUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload profile photo<input type="file" accept="image/*" className="hidden" onChange={uploadProfilePhoto} disabled={photoUploading} /></label>
              </div>
              <label className="mt-4 block"><span className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600"><Camera className="h-3.5 w-3.5" /> Profile image URL</span><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15" /></label>
            </div>

            {profile?.user_role !== 'ADMIN' && <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Student batch</span><input inputMode="numeric" value={form.student_batch} onChange={(e) => setForm({ ...form, student_batch: e.target.value.replace(/\D/g, '') })} placeholder="e.g. 2024" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15" /></label>}
          </div>
          <div className="mt-6 flex justify-end"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#5f91a0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f8294] disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile</button></div>
        </form>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-slate-900">Account record</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-[#5f91a0]" /><div><div className="text-xs uppercase tracking-[0.12em] text-slate-400">Email</div><div className="mt-1 break-all font-medium text-slate-800">{profile?.email}</div></div></div>
              <div className="flex items-start gap-3"><Shield className="mt-0.5 h-4 w-4 text-[#5f91a0]" /><div><div className="text-xs uppercase tracking-[0.12em] text-slate-400">Role</div><div className="mt-1 font-medium text-slate-800">{profile?.user_role}</div></div></div>
              <div className="text-xs leading-5 text-slate-400">Account ID: {profile?.uuid}</div>
            </div>
          </section>

          <form onSubmit={savePassword} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><div className="rounded-xl bg-[#edf6ff] p-2.5 text-[#527f8f]"><KeyRound className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Security</h2><p className="text-sm text-slate-500">Set a new account password.</p></div></div>
            <div className="mt-5 space-y-4"><input type="password" minLength={8} required value={password.next} onChange={(e) => setPassword({ ...password, next: e.target.value })} placeholder="New password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#78bac5]" /><input type="password" minLength={8} required value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} placeholder="Confirm new password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#78bac5]" /></div>
            <button type="submit" disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"><KeyRound className="h-4 w-4" /> Update password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
