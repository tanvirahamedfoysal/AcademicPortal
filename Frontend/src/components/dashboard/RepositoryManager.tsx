'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, ExternalLink, FileText, FolderArchive, Loader2, Search, Trash2, UploadCloud } from 'lucide-react';
import { apiFetch } from '../../lib/client-api';

type RepositoryDocument = {
  id: string | number;
  name: string;
  url: string;
};

type RepositoryManagerProps = {
  canManage?: boolean;
  title?: string;
  description?: string;
};

export default function RepositoryManager({
  canManage = false,
  title = 'Research Repository',
  description = 'Browse shared papers, datasets, supporting documents, and research resources.',
}: RepositoryManagerProps) {
  const [documents, setDocuments] = useState<RepositoryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const response = await apiFetch('/api/v1/repository/documents');
      if (!response.ok) throw new Error('Unable to load repository documents.');
      const payload = await response.json();
      setDocuments(Array.isArray(payload?.data) ? payload.data : []);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to load repository documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return documents;
    return documents.filter((document) => document.name.toLowerCase().includes(term));
  }, [documents, query]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFeedback(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await apiFetch('/api/v1/repository/documents', { method: 'POST', body });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || payload?.message || 'Upload failed.');
      }
      await loadDocuments();
      setFeedback(`${file.name} was added to the repository.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (document: RepositoryDocument) => {
    if (!window.confirm(`Delete “${document.name}” from the repository?`)) return;
    setDeletingUrl(document.url);
    setFeedback(null);
    try {
      const response = await apiFetch('/api/v1/repository/documents', {
        method: 'DELETE',
        body: JSON.stringify({ urls: [document.url] }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || payload?.message || 'Delete failed.');
      }
      setDocuments((current) => current.filter((item) => item.url !== document.url));
      setFeedback(`${document.name} was removed.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Delete failed.');
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(130deg,#0b2823_0%,#0f3b34_58%,#173f36_100%)] px-6 py-8 text-white md:grid-cols-[1fr_auto] md:items-end md:px-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50">
              <FolderArchive className="h-3.5 w-3.5" /> Knowledge archive
            </div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">{description}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
            <div className="text-3xl font-semibold">{documents.length}</div>
            <div className="text-xs uppercase tracking-[0.16em] text-emerald-50/65">Available resources</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the repository"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
            />
          </div>
          {canManage && (
            <>
              <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f3b34] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2823] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {isUploading ? 'Uploading…' : 'Upload resource'}
              </button>
            </>
          )}
        </div>

        {feedback && (
          <div className="border-b border-slate-200 bg-amber-50 px-6 py-3 text-sm text-amber-900">{feedback}</div>
        )}

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#0f3b34]" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FolderArchive className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-4 font-serif text-xl font-semibold text-slate-800">No matching resources</h2>
              <p className="mt-2 text-sm text-slate-500">Try a different search term{canManage ? ' or upload the first resource.' : '.'}</p>
            </div>
          ) : (
            filteredDocuments.map((document, index) => (
              <article key={`${document.id}-${document.url}`} className="grid gap-4 px-5 py-5 transition hover:bg-slate-50/70 md:grid-cols-[auto_1fr_auto] md:items-center md:px-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#0f3b34]">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Resource {String(index + 1).padStart(2, '0')}</div>
                  <h3 className="mt-1 truncate font-medium text-slate-900">{document.name}</h3>
                  <p className="mt-1 truncate text-xs text-slate-500">{document.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-[#0f3b34]"
                  >
                    <ExternalLink className="h-4 w-4" /> View
                  </a>
                  <a
                    href={document.url}
                    download
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:text-[#0f3b34]"
                    aria-label={`Download ${document.name}`}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleDelete(document)}
                      disabled={deletingUrl === document.url}
                      className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label={`Delete ${document.name}`}
                    >
                      {deletingUrl === document.url ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
