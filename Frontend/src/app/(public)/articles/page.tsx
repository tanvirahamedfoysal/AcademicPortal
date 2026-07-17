// src/app/(public)/articles/page.tsx
'use client';

import Link from 'next/link';
import { Calendar, User, BookOpen, AlertCircle } from 'lucide-react';
import { usePublicArticles } from '../../../hooks/useArticles';

export default function PublicArticlesPage() {
  const { data: articles, isLoading, isError, error } = usePublicArticles();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-100 rounded-xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-lg">Unable to load publications</h3>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 md:px-8">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
          <BookOpen className="text-blue-600" size={32} />
          Research Publications
        </h1>
        <p className="text-slate-600 mt-3 text-lg max-w-2xl">
          Explore the latest academic papers, journals, and research findings published by our students and faculty.
        </p>
      </div>

      {articles?.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No articles found</h3>
          <p className="text-slate-500 mt-1">Check back later for new publications.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {articles?.map((article) => (
            <article 
              key={article.id} 
              className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200"
            >
              <Link href={`/articles/${article.id}`} className="block focus:outline-none">
                <h2 className="text-xl font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {article.title}
                </h2>
                
                <p className="text-slate-600 mt-3 line-clamp-2">
                  {article.abstract || "No abstract available for this publication."}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User size={16} />
                    <span className="font-medium">{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    <span>
                      {new Date(article.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}