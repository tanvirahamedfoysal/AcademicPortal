'use client';

import { useEffect, useState } from 'react';
import { Download, FileText, FolderOpen } from 'lucide-react';

function getUser() {
  try {
    const raw = localStorage.getItem('auth-storage');
    return raw ? JSON.parse(raw)?.state?.user || JSON.parse(raw)?.user : null;
  } catch { return null; }
}

function getExtension(name: string) {
  const value = name.split('.').pop();
  return value && value !== name ? value.toUpperCase() : 'FILE';
}

export default function RepositoryClient() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = getUser();
    const role = String(user?.role || '').toUpperCase();
    const status = String(user?.status || '').toUpperCase();
    const ok = ['ADMIN','MODERATOR','STUDENT'].includes(role) && (role !== 'STUDENT' || status === 'ACTIVE');

    setAllowed(ok);
    setChecking(false);

    if (ok) {
      const token = localStorage.getItem('token') || '';
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://academic-portal-16620c77.fastapicloud.dev'}/api/v1/repository/documents`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(r => r.json())
        .then(r => setDocuments(Array.isArray(r?.data) ? r.data : []))
        .catch(() => setDocuments([]));
    }
  }, []);

  if (checking) return null;

  if (!allowed) {
    return <div className="academic-card px-6 py-16 text-center"><h2 className="font-serif text-2xl font-bold">Resource access pending approval</h2><p className="mt-3 text-slate-500">Please register and wait for admin/moderator approval before accessing shared resources.</p></div>;
  }

  return documents.length ? (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {documents.map((document) => (
        <a key={String(document.id)} href={document.url} target="_blank" rel="noreferrer" className="group academic-card flex min-h-[220px] flex-col justify-between p-6">
          <div><FileText className="h-11 w-11 rounded-2xl bg-[#dff7f6] p-3 text-[#5f91a0]" /><h3 className="mt-7 font-serif text-xl font-bold">{document.name}</h3></div>
          <div className="mt-7 flex items-center gap-2 text-sm font-bold text-[#5f91a0]">Open resource <Download className="h-4 w-4" /></div>
        </a>
      ))}
    </div>
  ) : <div className="academic-card px-6 py-16 text-center"><FolderOpen className="mx-auto h-14 w-14 rounded-2xl bg-[#dff7f6] p-3 text-[#5f91a0]"/><h2 className="mt-6 font-serif text-2xl font-bold">No resources have been shared yet</h2><p className="mt-3 text-slate-500">Approved resources from the dashboard repository will appear here.</p></div>;
}
