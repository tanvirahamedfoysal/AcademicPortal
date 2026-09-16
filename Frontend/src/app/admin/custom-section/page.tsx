'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { apiFetch } from '../../../lib/client-api';
import {
  buildPortfolioUpdatePayload,
  parsePortfolioMedia,
  PORTFOLIO_CUSTOM_SECTION_LIMIT,
  withPortfolioMedia,
} from '../../../lib/portfolio-media';
import type { PortfolioCustomSectionItem } from '../../../lib/portfolio-media';
import type { PortfolioData } from '../../../types/public';

const fieldClass = 'w-full rounded-xl border border-[#cfe1ea] bg-[#fffdfb] px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#8fc3cf] focus:ring-4 focus:ring-[#dff7f6]';

function normalizeLink(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function AdminCustomSectionPage() {
  const [header, setHeader] = useState('');
  const [items, setItems] = useState<PortfolioCustomSectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/v1/portfolio')
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.data) throw new Error(payload?.detail || 'Unable to load the custom section.');
        const portfolio = payload.data as PortfolioData;
        const media = parsePortfolioMedia(portfolio.research_interests);
        setHeader(media.customSection.header);
        setItems(media.customSection.items);
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load the custom section.'))
      .finally(() => setLoading(false));
  }, []);

  const addItem = () => {
    if (items.length >= PORTFOLIO_CUSTOM_SECTION_LIMIT) {
      setFeedback(`You can add up to ${PORTFOLIO_CUSTOM_SECTION_LIMIT} items.`);
      return;
    }
    setItems((current) => [
      ...current,
      { id: `custom-${Date.now()}`, name: '', description: '', link: '' },
    ]);
  };

  const updateItem = (id: string, patch: Partial<PortfolioCustomSectionItem>) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setItems((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    const cleanedHeader = header.trim();
    const cleanedItems = items.map((item) => ({
      ...item,
      name: item.name.trim(),
      description: item.description.trim(),
      link: normalizeLink(item.link),
    }));

    if (cleanedItems.length > 0 && !cleanedHeader) {
      setFeedback('Add a section header before saving content.');
      return;
    }

    for (const item of cleanedItems) {
      if (!item.name) {
        setFeedback('Every content item needs a name.');
        return;
      }
      if (!item.description && !item.link) {
        setFeedback(`Add a description or link for “${item.name}”.`);
        return;
      }
      if (item.link) {
        try {
          const url = new URL(item.link);
          if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid');
        } catch {
          setFeedback(`The link for “${item.name}” is not a valid web address.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const latestResponse = await apiFetch('/api/v1/portfolio');
      const latestPayload = await latestResponse.json().catch(() => null);
      if (!latestResponse.ok || !latestPayload?.data) throw new Error(latestPayload?.detail || 'Unable to refresh portfolio data.');

      const latest = latestPayload.data as PortfolioData;
      const media = parsePortfolioMedia(latest.research_interests);
      const researchInterests = withPortfolioMedia(latest.research_interests, {
        ...media,
        customSection: {
          header: cleanedHeader,
          items: cleanedItems,
        },
      });

      const response = await apiFetch('/api/v1/portfolio', {
        method: 'PUT',
        body: JSON.stringify(buildPortfolioUpdatePayload(latest, researchInterests)),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.detail || 'Unable to save the custom section.');

      setHeader(cleanedHeader);
      setItems(cleanedItems);
      setFeedback('Custom section saved.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save the custom section.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#5f91a0]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-[-0.03em] text-slate-900 sm:text-4xl">Custom Section</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">Configure the lower card beside the landing-page portfolio. The section title and item order appear exactly as they are saved here.</p>
      </div>

      {feedback && <div className="rounded-2xl border border-[#cde3ea] bg-[#edf6ff] px-5 py-3 text-sm text-slate-700">{feedback}</div>}

      <form onSubmit={save} className="space-y-6">
        <section className="rounded-[1.75rem] border border-[#dce7ee] bg-[#fffdfb] p-6 shadow-sm md:p-8">
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Section header</span>
            <input value={header} onChange={(event) => setHeader(event.target.value)} className={fieldClass} placeholder="Recent Courses" maxLength={80} />
          </label>
        </section>

        <section className="rounded-[1.75rem] border border-[#dce7ee] bg-[#fffdfb] p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 border-b border-[#e1eaf0] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-slate-900">Contents</h2>
              <p className="mt-1 text-sm text-slate-500">Use a description, a link, or both. Link-only items open the destination directly.</p>
            </div>
            <button type="button" onClick={addItem} disabled={items.length >= PORTFOLIO_CUSTOM_SECTION_LIMIT} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f8294] disabled:opacity-45"><Plus className="h-4 w-4" /> Add content</button>
          </div>

          <div className="mt-6 space-y-4">
            {items.map((item, index) => (
              <article key={item.id} className="rounded-2xl border border-[#d8e7ee] bg-[#edf6ff]/45 p-4 sm:p-5">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,.8fr)_minmax(0,1.4fr)]">
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-slate-500">Content name</span>
                    <input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} className={fieldClass} placeholder="Course title, event, resource..." maxLength={120} />
                  </label>
                  <label>
                    <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500">Link <span className="font-normal text-slate-400">optional</span></span>
                    <div className="relative">
                      <ExternalLink className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input value={item.link} onChange={(event) => updateItem(item.id, { link: event.target.value })} className={`${fieldClass} pl-10`} placeholder="https://example.com" />
                    </div>
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500">Description <span className="font-normal text-slate-400">optional</span></span>
                  <textarea rows={4} value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} className={fieldClass} placeholder="Add the details that should appear in the floating panel." maxLength={3000} />
                </label>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                  <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#cde3ea] bg-[#fffdfb] px-3 text-xs font-semibold text-slate-600 disabled:opacity-35"><ArrowUp className="h-4 w-4" /> Up</button>
                  <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#cde3ea] bg-[#fffdfb] px-3 text-xs font-semibold text-slate-600 disabled:opacity-35"><ArrowDown className="h-4 w-4" /> Down</button>
                  <button type="button" onClick={() => removeItem(item.id)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#cde3ea] bg-[#fffdfb] px-3 text-xs font-semibold text-[#4f8294] hover:bg-[#edf6ff]"><Trash2 className="h-4 w-4" /> Remove</button>
                </div>
              </article>
            ))}

            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#cde3ea] bg-[#edf6ff]/35 p-8 text-center text-sm text-slate-500">No custom content has been added.</div>
            )}
          </div>
        </section>

        <div className="sticky bottom-4 flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#5f91a0] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/20 transition hover:bg-[#4f8294] disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save custom section
          </button>
        </div>
      </form>
    </div>
  );
}
