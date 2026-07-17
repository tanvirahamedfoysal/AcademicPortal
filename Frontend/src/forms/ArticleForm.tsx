// src/forms/ArticleForm.tsx
'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useCreateArticle } from '../hooks/useArticles';

export default function ArticleForm() {
  const createMutation = useCreateArticle();
  
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !abstract || !content) return;

    createMutation.mutate(
      { title, abstract, content },
      {
        onSuccess: () => {
          setTitle('');
          setAbstract('');
          setContent('');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {createMutation.isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
          <CheckCircle size={20} className="shrink-0" />
          <div>
            <h4 className="font-medium">Publication Successful</h4>
            <p className="text-sm mt-0.5">Your article has been published and is now live on the research portal.</p>
          </div>
        </div>
      )}

      {createMutation.isError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium">Failed to publish article</h4>
            <p className="text-sm mt-0.5">{createMutation.error.message}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="title">
          Research Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a descriptive title for your research..."
          className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          required
          disabled={createMutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="abstract">
          Abstract (Summary)
        </label>
        <textarea
          id="abstract"
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          placeholder="Provide a brief summary of your research methodology and findings..."
          rows={3}
          className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
          required
          disabled={createMutation.isPending}
        />
        <p className="text-xs text-slate-500 text-right">
          {abstract.length} characters
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="content">
          Full Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write or paste your full research paper content here..."
          rows={12}
          className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          required
          disabled={createMutation.isPending}
        />
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setTitle('');
            setAbstract('');
            setContent('');
            createMutation.reset();
          }}
          disabled={createMutation.isPending}
          className="px-5 py-2 text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Clear Form
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending || !title || !abstract || !content}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <FileText size={18} />
              Publish Article
            </>
          )}
        </button>
      </div>
    </form>
  );
}