'use client';

import { useState, ChangeEvent } from 'react';
import { FileText, Upload, HardDrive, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useDocuments, useUploadDocument } from '../../../hooks/useRepository';

// Helper utility to clean up bytes formatting
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function RepositoryPage() {
  const { data: documents, isLoading, isError, error } = useDocuments();
  const uploadMutation = useUploadDocument();
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 md:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <HardDrive className="text-blue-600" size={32} />
          Document Repository
        </h1>
        <p className="text-slate-500 mt-2">
          Centralized collection of academic articles, datasets, templates, and program files.
        </p>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Upload size={18} className="text-slate-500" />
          Upload Document Resource
        </h2>
        
        <label 
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              uploadMutation.mutate(e.dataTransfer.files[0]);
            }
          }}
        >
          {uploadMutation.isPending ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={28} />
              <p className="text-sm font-medium text-slate-600">Uploading file stream...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <Upload className="h-10 w-10 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700">
                Click to choose file or drop it right here
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, ZIP, or CSV up to 50MB</p>
            </div>
          )}
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            disabled={uploadMutation.isPending} 
          />
        </label>
        
        {uploadMutation.isError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
            <AlertCircle size={16} />
            <span>Upload failed: {uploadMutation.error.message}</span>
          </div>
        )}
      </div>

      {/* Files Display Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-900">Available Files</h3>
        </div>
        
        {isError && (
          <div className="p-6 text-red-600 flex items-center gap-2">
            <AlertCircle size={18} />
            <p>Failed to collect repository listings: {error.message}</p>
          </div>
        )}

        {!isError && documents?.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="text-sm">No files uploaded to the repository cluster yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {documents?.map((doc) => (
              <li key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.title || doc.filename}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{formatBytes(doc.file_size)}</span>
                      <span>•</span>
                      <span>Uploaded by {doc.uploaded_by}</span>
                    </div>
                  </div>
                </div>
                
                <a 
                  href={`https://academic-portal-16620c77.fastapicloud.dev/repository/documents/${doc.id}/download`}
                  download
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}