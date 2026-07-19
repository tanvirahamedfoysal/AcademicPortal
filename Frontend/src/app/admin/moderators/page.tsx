'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, Plus, Shield, Trash2, X, UserCheck, Mail, ArrowUpCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Moderator {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminModeratorsPage() {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });

  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/moderators');
      if (res.ok) {
        const data = await res.json();
        setModerators(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Failed to fetch moderators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke moderator privileges for this user?")) return;
    
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/moderators/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setModerators(prev => prev.filter(mod => mod.id !== id));
      }
    } catch (error) {
      console.error("Failed to revoke moderator:", error);
    } finally {
      setActionLoading(null);
    }
  };

 const handleAddModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/v1/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const responseData = await res.json();
        const newMod = responseData.data || responseData; 
        
        setModerators(prev => [newMod, ...prev]);
        setIsModalOpen(false);
        setFormData({ email: '', username: '', password: '' });
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Failed to add moderator");
      }
    } catch (error) {
      console.error("Failed to add moderator:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredModerators = moderators.filter(mod => 
    mod.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    mod.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPromoteModal = async () => {
    setIsPromoteModalOpen(true);
    setIsStudentsLoading(true);
    try {
      const res = await fetch('/api/v1/students');
      if (res.ok) {
        const data = await res.json();
        setActiveStudents(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Failed to fetch students for promotion:", error);
    } finally {
      setIsStudentsLoading(false);
    }
  };

  const handlePromoteFromModal = async (uuid: string, name: string) => {
    if (!confirm(`Promote ${name} to Moderator?`)) return;
    
    setIsStudentsLoading(true); 
    try {
      const res = await fetch(`/api/v1/students/${uuid}/promote`, { method: 'POST' });
      
      if (res.ok) {
        alert(`${name} promoted successfully.`);
        setIsPromoteModalOpen(false);
        fetchModerators(); 
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Failed to promote student.");
      }
    } catch (error) {
      console.error("Failed to promote student:", error);
    } finally {
      setIsStudentsLoading(false);
    }
  };

  const filteredStudents = activeStudents.filter(s => 
    s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      {}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            Moderators
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage users with elevated platform privileges.</p>
        </div>
        
        {}
        <div className="flex gap-3 items-start">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm whitespace-nowrap shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Moderator
            </button>
            <button 
              onClick={openPromoteModal}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-sm whitespace-nowrap shadow-sm"
            >
              <ArrowUpCircle className="h-4 w-4" />
              Make Moderator
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredModerators.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                    <Shield className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    No moderators found.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredModerators.map((mod) => (
                    <motion.tr 
                      key={mod.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {mod.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{mod.username}</div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {mod.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          mod.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${mod.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {mod.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(mod.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRevoke(mod.id)}
                          disabled={actionLoading === mod.id}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 font-medium"
                        >
                          {actionLoading === mod.id ? <Loader2 className="h-4 w-4 animate-spin inline" /> : 'Revoke Access'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-600" />
                  Add New Moderator
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddModerator} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" required placeholder="moderator@example.com"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input 
                    type="text" required placeholder="johndoe_mod"
                    value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                  <input 
                    type="password" required placeholder="••••••••"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">They will be prompted to change this upon first login.</p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-2">
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSaving ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPromoteModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm"
              onClick={() => setIsPromoteModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl z-50 p-6 max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Select Student to Promote
                </h3>
                <button onClick={() => setIsPromoteModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                />
              </div>

              <div className="overflow-y-auto flex-1 border border-slate-100 rounded-lg p-2">
                {isStudentsLoading && activeStudents.length === 0 ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500">
                    No students found.
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {filteredStudents.map(student => (
                      <li key={student.uuid} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                        <button
                          onClick={() => handlePromoteFromModal(student.uuid, student.name)}
                          disabled={isStudentsLoading}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          Promote
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}