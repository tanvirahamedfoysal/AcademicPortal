'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, Users, Building2, Briefcase, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Collaborator {
  uuid: string;
  name: string;
  role: string;
  institution: string;
  email: string;
}

export default function StudentCollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCollaborators = collaborators.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(query) ||
      (c.institution || '').toLowerCase().includes(query) ||
      (c.role || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            Collaborators
          </h1>
          <p className="text-sm text-slate-500 mt-1">View partner institutions and co-researchers associated with the portal.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, or institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : filteredCollaborators.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm shadow-sm">
          <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          No collaborators found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCollaborators.map((collaborator) => (
              <motion.div
                key={collaborator.uuid}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold text-xl">
                    {collaborator.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{collaborator.name}</h3>
                    <p className="text-sm text-purple-600 font-medium">{collaborator.role}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-slate-600 flex-grow mt-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{collaborator.institution}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <a href={`mailto:${collaborator.email}`} className="truncate hover:text-purple-600 transition-colors">
                      {collaborator.email}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}