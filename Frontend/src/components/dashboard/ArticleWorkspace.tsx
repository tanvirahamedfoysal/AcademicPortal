'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Edit3, Eye, EyeOff, FileText, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { apiFetch } from '../../lib/client-api';

type ArticleSummary = {
  article_uuid: string;
  article_title: string;
  article_status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
  created_at: string;
  updated_at: string;
};

type ArticleDetail = {
  id: string;
  title: string;
  body: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

type FormState = { title: string; body: string; status: string };
const emptyForm: FormState = { title: '', body: '', status: 'DRAFT' };

export default function ArticleWorkspace({ roleLabel = 'Researcher' }: { roleLabel?: string }) {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/api/v1/articles');
      if (!response.ok) throw new Error('Could not load your articles.');
      const payload = await response.json();
      setArticles(Array.isArray(payload?.data) ? payload.data : []);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not load your articles.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadArticles();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? articles.filter((article) => article.article_title.toLowerCase().includes(term)) : articles;
  }, [articles, query]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = async (id: string) => {
    setWorkingId(id);
    setFeedback(null);
    try {
      const response = await apiFetch(`/api/v1/articles/${id}`);
      if (!response.ok) throw new Error('Could not load the article.');
      const payload = await response.json();
      const article = payload?.data as ArticleDetail;
      setEditingId(id);
      setForm({ title: article?.title || '', body: article?.body || '', status: String(article?.status || 'DRAFT').toUpperCase() });
      setModalOpen(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not load the article.');
    } finally {
      setWorkingId(null);
    }
  };

  const saveArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      let id = editingId;
      if (editingId) {
        const update = await apiFetch(`/api/v1/articles/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ title: form.title.trim(), body: form.body.trim() }),
        });
        if (!update.ok) {
          const payload = await update.json().catch(() => null);
          throw new Error(payload?.detail || 'Article update failed.');
        }
      } else {
        const create = await apiFetch('/api/v1/articles', {
          method: 'POST',
          body: JSON.stringify({ title: form.title.trim(), body: form.body.trim() }),
        });
        if (!create.ok) {
          const payload = await create.json().catch(() => null);
          throw new Error(payload?.detail || 'Article creation failed.');
        }
        const payload = await create.json();
        id = payload?.data?.id;
      }

      if (id) {
        const currentStatus = articles.find((article) => article.article_uuid === id)?.article_status?.toUpperCase();
        if (form.status !== currentStatus) {
          const statusResponse = await apiFetch(`/api/v1/articles/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: form.status }),
          });
          if (!statusResponse.ok) {
            const payload = await statusResponse.json().catch(() => null);
            throw new Error(payload?.detail || 'Article saved, but status update failed.');
          }
        }
      }

      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      setFeedback(editingId ? 'Article updated successfully.' : 'Article created successfully.');
      await loadArticles();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not save the article.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (article: ArticleSummary) => {
    const id = article.article_uuid;
    const nextStatus = article.article_status?.toUpperCase() === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setWorkingId(id);
    setFeedback(null);
    try {
      const response = await apiFetch(`/api/v1/articles/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || 'Status update failed.');
      }
      setArticles((current) => current.map((item) => item.article_uuid === id ? { ...item, article_status: nextStatus } : item));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Status update failed.');
    } finally {
      setWorkingId(null);
    }
  };

  const removeArticle = async (article: ArticleSummary) => {
    if (!window.confirm(`Delete “${article.article_title}”? This cannot be undone.`)) return;
    setWorkingId(article.article_uuid);
    setFeedback(null);
    try {
      const response = await apiFetch(`/api/v1/articles/${article.article_uuid}`, { method: 'DELETE' });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || 'Delete failed.');
      }
      setArticles((current) => current.filter((item) => item.article_uuid !== article.article_uuid));
      setFeedback('Article deleted.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Delete failed.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(130deg,#fffdfb_0%,#edf6ff_52%,#dff7f6_100%)] px-6 py-8 text-slate-900 md:grid-cols-[1fr_auto] md:items-end md:px-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
              <BookOpen className="h-3.5 w-3.5" /> {roleLabel} publishing desk
            </div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">Research Articles</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Draft, refine, publish, and maintain long-form academic writing through the portal&apos;s existing article workflow.</p>
          </div>
          <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-4 py-3 text-sm font-semibold text-[#ffffff] shadow-sm transition hover:bg-[#cde8ec]">
            <Plus className="h-4 w-4" /> New article
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your article library" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{articles.length} authored records</div>
        </div>

        {feedback && <div className="border-b border-slate-200 bg-[#edf6ff] px-6 py-3 text-sm text-slate-700">{feedback}</div>}

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /></div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center"><FileText className="mx-auto h-9 w-9 text-slate-300" /><h2 className="mt-4 font-serif text-xl font-semibold text-slate-800">No articles found</h2><p className="mt-2 text-sm text-slate-500">Create a draft or adjust your search.</p></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((article, index) => {
              const published = article.article_status?.toUpperCase() === 'PUBLISHED';
              return (
                <article key={article.article_uuid} className="grid gap-4 px-5 py-5 transition hover:bg-slate-50/70 md:grid-cols-[1fr_auto] md:items-center md:px-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      <span>Article {String(index + 1).padStart(2, '0')}</span><span>·</span><span>{new Date(article.updated_at || article.created_at).toLocaleDateString()}</span>
                    </div>
                    <h2 className="mt-1.5 truncate font-serif text-xl font-semibold text-slate-900">{article.article_title}</h2>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${published ? 'bg-[#dff7f6] text-[#689aa6]' : 'bg-[#edf6ff] text-[#527f8f]'}`}>
                        {published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{article.article_status || 'DRAFT'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleStatus(article)} disabled={workingId === article.article_uuid} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:text-[#5f91a0] disabled:opacity-50" title={published ? 'Move to draft' : 'Publish'}>{workingId === article.article_uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    <button onClick={() => openEdit(article.article_uuid)} disabled={workingId === article.article_uuid} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:text-[#5f91a0]" title="Edit article"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => removeArticle(article)} disabled={workingId === article.article_uuid} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-[#cde3ea] hover:bg-[#edf6ff] hover:text-[#527f8f]" title="Delete article"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-white/20 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
              <div><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f91a0]">Publishing desk</div><h2 className="font-serif text-2xl font-semibold text-slate-900">{editingId ? 'Edit article' : 'Create article'}</h2></div>
              <button onClick={() => setModalOpen(false)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={saveArticle} className="space-y-5 p-6">
              <div><label className="mb-2 block text-sm font-semibold text-slate-700">Title</label><input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15" placeholder="A clear, research-oriented title" /></div>
              <div><label className="mb-2 block text-sm font-semibold text-slate-700">Article body</label><textarea required rows={14} value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 font-serif text-[15px] leading-7 outline-none focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15" placeholder="Write the article body…" /></div>
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div><label className="mb-2 block text-sm font-semibold text-slate-700">Publication status</label><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#78bac5]"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></div>
                <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f8294] disabled:opacity-60">{isSaving && <Loader2 className="h-4 w-4 animate-spin" />}{editingId ? 'Save changes' : 'Create article'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
