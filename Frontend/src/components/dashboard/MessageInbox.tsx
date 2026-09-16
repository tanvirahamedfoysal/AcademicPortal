'use client';

import { useEffect, useMemo, useState } from 'react';
import { Inbox, Loader2, Mail, Reply, Search, Trash2, X } from 'lucide-react';
import { apiFetch } from '../../lib/client-api';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export default function MessageInbox({ title = 'Contact inbox' }: { title?: string }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiFetch('/api/v1/contact');
        const payload = await response.json().catch(() => ({}));
        if (response.ok) setMessages(Array.isArray(payload.data) ? payload.data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return messages;
    return messages.filter((item) => `${item.name} ${item.email} ${item.message}`.toLowerCase().includes(needle));
  }, [messages, query]);

  async function remove(id: number) {
    if (!confirm('Delete this contact message?')) return;
    setDeleting(id);
    try {
      const response = await apiFetch(`/api/v1/contact/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessages((items) => items.filter((item) => item.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="font-serif text-3xl font-bold tracking-[-0.03em] text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">Messages submitted through the public contact form.</p></div>
        <div className="relative w-full sm:w-80"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search messages..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#a9d7df]" /></div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        {loading ? <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /></div> : filtered.length === 0 ? <div className="py-20 text-center"><Inbox className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-4 font-semibold text-slate-700">No messages found</p></div> : <div className="divide-y divide-slate-100">{filtered.map((item) => <button key={item.id} onClick={() => setSelected(item)} className="grid w-full gap-4 p-5 text-left transition hover:bg-slate-50 sm:grid-cols-[44px_1fr_auto] sm:items-center"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#dff7f6] text-[#5f91a0]"><Mail className="h-4 w-4" /></span><span className="min-w-0"><span className="block font-semibold text-slate-900">{item.name}</span><span className="mt-1 block truncate text-sm text-slate-500">{item.message}</span></span><span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span></button>)}</div>}
      </div>

      {selected && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelected(null)}><div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl sm:rounded-[24px]" onClick={(e) => e.stopPropagation()}><div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6"><div><p className="font-serif text-xl font-bold">Message from {selected.name}</p><p className="mt-1 text-xs text-slate-500">{new Date(selected.created_at).toLocaleString()}</p></div><button onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"><p className="break-all text-sm font-semibold text-slate-700">{selected.email}</p><div className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{selected.message}</div></div><div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-[#f8fbfd] px-4 py-4 sm:flex-row sm:justify-end sm:px-6"><button onClick={() => remove(selected.id)} disabled={deleting === selected.id} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#cde3ea] bg-white px-4 py-2.5 text-sm font-semibold text-[#527f8f]"><Trash2 className="h-4 w-4" /> Delete</button><a href={`mailto:${selected.email}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f8294]"><Reply className="h-4 w-4" /> Reply via email</a></div></div></div>}
    </div>
  );
}
