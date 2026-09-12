'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

type Status = { type: 'success' | 'error'; message: string } | null;

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = new FormData(event.currentTarget);
    const payload = { name: String(form.get('name') || ''), email: String(form.get('email') || ''), message: String(form.get('message') || '') };

    try {
      const response = await fetch('/api/v1/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || String(data.message || '').startsWith('Error')) throw new Error(data.detail || data.message || 'Unable to send message');
      setStatus({ type: 'success', message: 'Message sent successfully. Thank you for reaching out.' });
      event.currentTarget.reset();
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Unable to send message right now.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="academic-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Name<input name="name" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-800 focus:bg-white" placeholder="Your name" /></label>
        <label className="text-sm font-semibold text-slate-700">Email<input name="email" type="email" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-800 focus:bg-white" placeholder="you@example.com" /></label>
      </div>
      <label className="mt-5 block text-sm font-semibold text-slate-700">Message<textarea name="message" required rows={7} className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-800 focus:bg-white" placeholder="Tell me about your research question, collaboration idea, or academic opportunity..." /></label>
      {status && <div className={`mt-5 rounded-xl px-4 py-3 text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{status.type === 'success' && <CheckCircle2 className="mr-2 inline h-4 w-4" />}{status.message}</div>}
      <button disabled={loading} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0f3b34] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#092c27] disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send message <ArrowRight className="h-4 w-4" /></>}</button>
    </form>
  );
}
