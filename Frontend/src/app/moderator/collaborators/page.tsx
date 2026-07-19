'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, Users, Trash2, Plus, Edit, X, Globe, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Collaborator {
  uuid: string;
  name: string;
  institution: string;
  website?: string;
}

export default function ModeratorCollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [formData, setFormData] = useState({ name: '', institution: '', website: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/collaborators');
      if (res.ok) {
        const data = await res.json();
        setCollaborators(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Failed to fetch collaborators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (uuid: string, name: string) => {
    if (!confirm(`Remove "${name}" from your collaborators?`)) return;

    setActionLoading(uuid);
    try {
      const res = await fetch(`/api/v1/collaborators/${uuid}`, { method: 'DELETE' });
      if (res.ok) {
        setCollaborators(prev => prev.filter(c => c.uuid !== uuid));
      } else {
        alert("Failed to delete collaborator.");
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const openModal = (collaborator?: Collaborator) => {
    if (collaborator) {
      setEditingCollaborator(collaborator);
      setFormData({
        name: collaborator.name,
        institution: collaborator.institution,
        website: collaborator.website || '',
      });
    } else {
      setEditingCollaborator(null);
      setFormData({ name: '', institution: '', website: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = editingCollaborator 
        ? `/api/v1/collaborators/${editingCollaborator.uuid}` 
        : '/api/v1/collaborators';
      const method = editingCollaborator ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchCollaborators();
        setIsModalOpen(false);
      } else {
        alert("Failed to save collaborator profile.");
      }
    } catch (error) {
      console.error("Error saving collaborator:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCollaborators = collaborators.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(query) ||
      (c.institution || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            Collaborators Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage institutional partners, academic affiliates, and co-researchers.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search partners or institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm outline-none"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium unique-action-btn"
          >
            <Plus className="h-4 w-4" />
            Add Partner
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : filteredCollaborators.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm shadow-sm">
          <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          No collaborators cataloged yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCollaborators.map((partner) => (
              <motion.div
                key={partner.uuid}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-purple-200 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="h-10 w-10 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center font-bold">
                      {partner.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal(partner)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                        title="Edit Details"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(partner.uuid, partner.name)}
                        disabled={actionLoading === partner.uuid}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        title="Remove Partner"
                      >
                        {actionLoading === partner.uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 leading-tight">{partner.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {partner.institution}
                  </p>
                </div>

                {partner.website && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <a
                      href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:underline"
                    >
                      <Globe className="h-3 w-3" />
                      Visit Website
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

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
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingCollaborator ? 'Edit Collaborator Profile' : 'Add New Collaborator'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Collaborator / Contact Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm outline-none"
                    placeholder="e.g., Dr. Sarah Jenkins"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Affiliated Institution / Org</label>
                  <input
                    type="text"
                    required
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm outline-none"
                    placeholder="e.g., MIT Robotics Lab"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website URL (Optional)</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm outline-none"
                    placeholder="e.g., www.labwebsite.org"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingCollaborator ? 'Save Changes' : 'Add Partner')}
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