'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, BookOpen, ExternalLink, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Article {
  uuid: string;
  title: string;
  authors: string;
  abstract: string;
  published_date: string;
  link?: string;
}

export default function StudentArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = articles.filter(a => {
    const query = searchQuery.toLowerCase();
    return (
      (a.title || '').toLowerCase().includes(query) ||
      (a.authors || '').toLowerCase().includes(query) ||
      (a.abstract || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Research Articles
          </h1>
          <p className="text-sm text-slate-500 mt-1">Browse and read published academic papers and research.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search titles, authors, or abstracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm outline-none"
          />
        </div>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm shadow-sm">
          <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          No articles found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article) => (
              <motion.div
                key={article.uuid}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedArticle(article)}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-tight">
                  {article.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {article.authors}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(article.published_date).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow">
                  {article.abstract}
                </p>

                <div className="text-sm font-medium text-blue-600 flex items-center gap-1 mt-auto">
                  Read Abstract <ExternalLink className="h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reading Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedArticle(null)}>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedArticle.title}</h2>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6 pb-6 border-b border-slate-100">
                  <span className="font-medium">By {selectedArticle.authors}</span>
                  <span>&bull;</span>
                  <span>Published: {new Date(selectedArticle.published_date).toLocaleDateString()}</span>
                </div>

                <div className="prose prose-sm sm:prose-base max-w-none text-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Abstract</h3>
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedArticle.abstract}</p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
                >
                  Close
                </button>
                {selectedArticle.link && (
                  <a
                    href={selectedArticle.link.startsWith('http') ? selectedArticle.link : `https://${selectedArticle.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Full Paper <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}