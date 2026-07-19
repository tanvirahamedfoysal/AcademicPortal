'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Search, FolderArchive, Trash2, Upload, File, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RepositoryFile {
  uuid: string;
  filename: string;
  size: string; // e.g., "2.4 MB"
  uploaded_at: string;
  url: string;
}

export default function ModeratorRepositoryPage() {
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDelete = async (uuid: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    setActionLoading(uuid);
    try {
      const res = await fetch(`/api/v1/repository/${uuid}`, { method: 'DELETE' });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.uuid !== uuid));
      } else {
        alert("Failed to delete file.");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/v1/repository/upload', {
        method: 'POST',
        body: formData, // Notice we don't set Content-Type header; fetch does it automatically for FormData
      });

      if (res.ok) {
        await fetchFiles();
        closeModal();
      } else {
        alert("Failed to upload file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <p className="text-sm text-slate-500 mt-1">Upload and manage shared research documents and resources.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </button>
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
              No files in the repository.
            </li>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredFiles.map((file) => (
                <motion.li
                  key={file.uuid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
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

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={file.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(file.uuid, file.filename)}
                      disabled={actionLoading === file.uuid}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      title="Delete File"
                    >
                      {actionLoading === file.uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          )}
        </ul>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Upload to Repository</h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6">
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <Upload className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-medium text-slate-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatSize(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-slate-900">Click to select a file</p>
                      <p className="text-xs text-slate-500 mt-1">PDF, DOCX, ZIP, or images</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}