'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, FolderArchive, File, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RepositoryFile {
  uuid: string;
  filename: string;
  size: string;
  uploaded_at: string;
  url: string;
}

export default function StudentRepositoryPage() {
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/repository');
      if (res.ok) {
        const data = await res.json();
        setFiles(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Failed to fetch repository files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFiles = files.filter(f => 
    (f.filename || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderArchive className="h-6 w-6 text-amber-500" />
            File Repository
          </h1>
          <p className="text-sm text-slate-500 mt-1">Access and download shared datasets and research documents.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {isLoading ? (
            <li className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </li>
          ) : filteredFiles.length === 0 ? (
            <li className="py-12 text-center text-slate-500 text-sm">
              <FolderArchive className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              No files available in the repository.
            </li>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredFiles.map((file) => (
                <motion.li
                  key={file.uuid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="h-10 w-10 shrink-0 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                      <File className="h-5 w-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-900 truncate">{file.filename}</p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{file.size}</span>
                        <span>&bull;</span>
                        <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <a
                    href={file.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 hover:text-amber-600 transition-colors text-sm font-medium shrink-0 shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                </motion.li>
              ))}
            </AnimatePresence>
          )}
        </ul>
      </div>
    </div>
  );
}