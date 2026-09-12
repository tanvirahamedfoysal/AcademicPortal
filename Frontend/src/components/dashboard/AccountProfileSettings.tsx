'use client';

import { useEffect, useState } from 'react';
import { Camera, KeyRound, Loader2, Mail, Save, Shield, UserRound } from 'lucide-react';
import { apiFetch } from '../../lib/client-api';

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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', bio: '', mobile_number: '', image_url: '', student_batch: '' });
  const [password, setPassword] = useState({ next: '', confirm: '' });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/v1/profile/me');
      if (!response.ok) throw new Error('Unable to load account profile.');
      const payload = await response.json();
      const data = payload?.data as Profile;
      setProfile(data);
      setForm((current) => ({
        ...current,
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

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    const payload: Record<string, string> = {};
    if (form.name.trim()) payload.name = form.name.trim();
    if (form.bio.trim()) payload.bio = form.bio.trim();
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
      setFeedback(data?.message || 'Profile updated successfully.');
      await loadProfile();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Profile update failed.');
    } finally {
      setSaving(false);
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

  if (loading) return <div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#0f3b34]" /></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(130deg,#0b2823_0%,#0f3b34_62%,#174b3f_100%)] px-6 py-8 text-white md:grid-cols-[auto_1fr_auto] md:items-center md:px-8">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/20 bg-white/10">
            {profile?.profile_image ? <img src={profile.profile_image} alt="Profile" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><UserRound className="h-8 w-8" /></div>}
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">Academic account</div>
            <h1 className="mt-1 font-serif text-3xl font-semibold">Profile & Security</h1>
            <p className="mt-2 text-sm text-emerald-50/75">Keep your portal identity, contact details, and security information current.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right">
            <div className="text-sm font-semibold">{profile?.user_role || 'USER'}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-emerald-50/60">{profile?.status || 'Account'}</div>
          </div>
        </div>
      </section>

      {feedback && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">{feedback}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <form onSubmit={saveProfile} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="rounded-xl bg-emerald-50 p-2.5 text-[#0f3b34]"><UserRound className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Profile information</h2><p className="text-sm text-slate-500">Fields left blank will remain unchanged.</p></div></div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Display name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" /></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Mobile number</span><input value={form.mobile_number} onChange={(e) => setForm({ ...form, mobile_number: e.target.value })} placeholder="Contact number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" /></label>
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Short bio</span><textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Academic role, interests, current research focus…" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" /></label>
            <label className="block md:col-span-2"><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Camera className="h-4 w-4" /> Profile image URL</span><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" /></label>
            {profile?.user_role !== 'ADMIN' && <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Student batch</span><input inputMode="numeric" value={form.student_batch} onChange={(e) => setForm({ ...form, student_batch: e.target.value.replace(/\D/g, '') })} placeholder="e.g. 2024" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" /></label>}
          </div>
          <div className="mt-6 flex justify-end"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#0f3b34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b2823] disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile</button></div>
        </form>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-slate-900">Account record</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-[#0f3b34]" /><div><div className="text-xs uppercase tracking-[0.12em] text-slate-400">Email</div><div className="mt-1 break-all font-medium text-slate-800">{profile?.email}</div></div></div>
              <div className="flex items-start gap-3"><Shield className="mt-0.5 h-4 w-4 text-[#0f3b34]" /><div><div className="text-xs uppercase tracking-[0.12em] text-slate-400">Role</div><div className="mt-1 font-medium text-slate-800">{profile?.user_role}</div></div></div>
              <div className="text-xs leading-5 text-slate-400">Account ID: {profile?.uuid}</div>
            </div>
          </section>

          <form onSubmit={savePassword} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><KeyRound className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold text-slate-900">Security</h2><p className="text-sm text-slate-500">Set a new account password.</p></div></div>
            <div className="mt-5 space-y-4"><input type="password" minLength={8} required value={password.next} onChange={(e) => setPassword({ ...password, next: e.target.value })} placeholder="New password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700" /><input type="password" minLength={8} required value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} placeholder="Confirm new password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700" /></div>
            <button type="submit" disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"><KeyRound className="h-4 w-4" /> Update password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
