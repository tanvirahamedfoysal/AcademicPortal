'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BookOpen, Calendar, Loader2, Search } from 'lucide-react';
import { apiFetch } from '../../lib/client-api';

type PublicArticle = { article_uuid: string; article_title: string; published_at: string | null; updated_at: string; author_uuid: string | null };

export default function PublicArticleLibrary() {
  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/articles/public')
      .then(async (response) => response.ok ? response.json() : Promise.reject(new Error('Failed to load articles')))
      .then((payload) => setArticles(Array.isArray(payload?.data) ? payload.data : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? articles.filter((article) => article.article_title.toLowerCase().includes(term)) : articles;
  }, [articles, query]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(130deg,#fffdfb_0%,#f8dce7_52%,#dff7f6_100%)] px-6 py-8 text-slate-900 md:px-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700"><BookOpen className="h-3.5 w-3.5" /> Learning library</div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">Published Research</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Read the public article collection from the researcher and portal community.</p>
        </div>
        <div className="border-b border-slate-200 bg-slate-50/70 p-4 md:px-6"><div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search published research" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#78bac5] focus:ring-2 focus:ring-[#78bac5]/15" /></div></div>
        {loading ? <div className="flex min-h-60 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#5f91a0]" /></div> : filtered.length === 0 ? <div className="px-6 py-16 text-center text-sm text-slate-500">No published articles match your search.</div> : <div className="grid gap-px bg-slate-100 md:grid-cols-2">{filtered.map((article) => <Link key={article.article_uuid} href={`/articles/${article.article_uuid}`} className="group bg-white p-6 transition hover:bg-[#fffdfb]"><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"><Calendar className="h-3.5 w-3.5" /> {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Published research'}</div><h2 className="mt-3 font-serif text-xl font-semibold leading-snug text-slate-900 group-hover:text-[#5f91a0]">{article.article_title}</h2><div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#5f91a0]">Read article <ArrowUpRight className="h-4 w-4" /></div></Link>)}</div>}
      </section>
    </div>
  );
}
