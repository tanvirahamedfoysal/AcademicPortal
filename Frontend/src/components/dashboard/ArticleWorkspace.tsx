'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { apiFetch } from '../../lib/client-api';
import { hasMeaningfulArticleBody } from '../../lib/article-content';
import PremiumArticleEditor from './PremiumArticleEditor';

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

function formatDate(value?: string) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

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

  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [modalOpen]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? articles.filter((article) => article.article_title.toLowerCase().includes(term)) : articles;
  }, [articles, query]);

  const canSave = form.title.trim().length > 0 && hasMeaningfulArticleBody(form.body);

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
      setForm({
        title: article?.title || '',
        body: article?.body || '',
        status: String(article?.status || 'DRAFT').toUpperCase(),
      });
      setModalOpen(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not load the article.');
    } finally {
      setWorkingId(null);
    }
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      let id = editingId;
      const body = form.body.trim();

      if (editingId) {
        const update = await apiFetch(`/api/v1/articles/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ title: form.title.trim(), body }),
        });
        if (!update.ok) {
          const payload = await update.json().catch(() => null);
          throw new Error(payload?.detail || 'Article update failed.');
        }
      } else {
        const create = await apiFetch('/api/v1/articles', {
          method: 'POST',
          body: JSON.stringify({ title: form.title.trim(), body }),
        });
        if (!create.ok) {
          const payload = await create.json().catch(() => null);
          throw new Error(payload?.detail || 'Article creation failed.');
        }
        const payload = await create.json();
        id = payload?.data?.id;
      }

      if (id) {
        const currentStatus = editingId
          ? articles.find((article) => article.article_uuid === id)?.article_status?.toUpperCase()
          : 'DRAFT';

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

      const message = editingId ? 'Article updated successfully.' : 'Article created successfully.';
      closeModal();
      setFeedback(message);
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
      <section className="overflow-hidden rounded-[2rem] border border-[#dce7ee] bg-[#fffdfb] shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(130deg,#fffdfb_0%,#edf6ff_58%,#dff7f6_100%)] px-5 py-7 text-slate-900 sm:px-7 md:grid-cols-[1fr_auto] md:items-end md:px-8 md:py-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-[#527f8f]"><BookOpen className="h-4 w-4" /> {roleLabel} articles</div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">Research Articles</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Create, format and publish scholarly articles with media, tables and mathematical notation.</p>
          </div>
          <button onClick={openCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4f8294]"><Plus className="h-4 w-4" /> New article</button>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-200 bg-[#f8fbfd] p-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="relative w-full sm:max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles" className="form-control py-2.5 pl-10" /></div>
          <div className="text-xs font-semibold text-slate-400">{articles.length} {articles.length === 1 ? 'article' : 'articles'}</div>
        </div>

        {feedback && <div className="border-b border-[#dce7ee] bg-[#edf6ff] px-6 py-3 text-sm text-slate-700">{feedback}</div>}

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /></div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center"><FileText className="mx-auto h-9 w-9 text-slate-300" /><h2 className="mt-4 font-serif text-xl font-semibold text-slate-800">No articles found</h2><p className="mt-2 text-sm text-slate-500">Create a new article or change the search term.</p></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((article, index) => {
              const published = article.article_status?.toUpperCase() === 'PUBLISHED';
              return (
                <article key={article.article_uuid} className="grid gap-4 px-5 py-5 transition hover:bg-[#f8fbfd] md:grid-cols-[1fr_auto] md:items-center md:px-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400"><span>Article {String(index + 1).padStart(2, '0')}</span><span aria-hidden>·</span><span>{formatDate(article.updated_at || article.created_at)}</span></div>
                    <h2 className="mt-1.5 break-words font-serif text-xl font-semibold text-slate-900">{article.article_title}</h2>
                    <div className="mt-2 flex items-center gap-2 text-xs"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${published ? 'bg-[#dff7f6] text-[#527f8f]' : 'bg-[#edf6ff] text-[#527f8f]'}`}>{published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{article.article_status || 'DRAFT'}</span></div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => toggleStatus(article)} disabled={workingId === article.article_uuid} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-[#fffdfb] text-slate-500 transition hover:border-[#b8dce3] hover:text-[#5f91a0] disabled:opacity-50" title={published ? 'Move to draft' : 'Publish'} aria-label={published ? 'Move to draft' : 'Publish'}>{workingId === article.article_uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    <button onClick={() => openEdit(article.article_uuid)} disabled={workingId === article.article_uuid} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-[#fffdfb] text-slate-500 transition hover:border-[#b8dce3] hover:text-[#5f91a0]" title="Edit article" aria-label="Edit article"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => removeArticle(article)} disabled={workingId === article.article_uuid} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-[#fffdfb] text-slate-500 transition hover:border-[#b8dce3] hover:bg-[#edf6ff] hover:text-[#527f8f]" title="Delete article" aria-label="Delete article"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[1.5rem] border border-[#dce7ee] bg-[#fffdfb] shadow-2xl sm:max-h-[96dvh] sm:rounded-[1.75rem]">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#dce7ee] bg-[#fffdfb] px-4 py-4 sm:px-6">
              <div className="min-w-0"><p className="text-xs font-semibold text-[#527f8f]">{editingId ? 'Editing article' : 'New article'}</p><h2 className="truncate font-serif text-xl font-semibold text-slate-900 sm:text-2xl">{form.title.trim() || (editingId ? 'Edit article' : 'Untitled article')}</h2></div>
              <button onClick={closeModal} disabled={isSaving} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-[#fffdfb] text-slate-500 hover:bg-[#edf6ff]" aria-label="Close editor"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={saveArticle} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="grid gap-4 border-b border-[#dce7ee] bg-[#f8fbfd] p-4 sm:p-5 lg:grid-cols-[1fr_220px]">
                  <div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="article-title">Title</label><input id="article-title" required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="form-control" placeholder="Article title" /></div>
                  <div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="article-status">Status</label><select id="article-status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="form-control bg-[#fffdfb]"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></div>
                </div>

                <div className="p-4 sm:p-5 lg:p-6">
                  <PremiumArticleEditor value={form.body} disabled={isSaving} onChange={(body) => setForm((current) => ({ ...current, body }))} />
                </div>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#dce7ee] bg-[#fffdfb] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-xs leading-5 text-slate-500">Equations are rendered in the editor and stored as LaTeX source, so the published article remains editable.</p>
                <button type="submit" disabled={isSaving || !canSave} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5f91a0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f8294] disabled:cursor-not-allowed disabled:opacity-60">{isSaving && <Loader2 className="h-4 w-4 animate-spin" />}{editingId ? 'Save changes' : 'Create article'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
