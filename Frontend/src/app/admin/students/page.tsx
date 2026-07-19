'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, X, Trash2, Search, UserCheck, Clock, ShieldAlert, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
  uuid: string;
  name: string;
  username: string;
  email: string;
  student_batch?: string;
  created_at?: string;
}

export default function AdminStudentsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [activeStudents, setActiveStudents] = useState<Student[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); 
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pendingRes, activeRes] = await Promise.all([
        fetch('/api/v1/students/pending'),
        fetch('/api/v1/students')
      ]);

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingStudents(Array.isArray(pendingData) ? pendingData : (pendingData.data || []));
      }
      if (activeRes.ok) {
        const activeData = await activeRes.json();
        setActiveStudents(Array.isArray(activeData) ? activeData : (activeData.data || []));
      }
    } catch (error) {
      console.error("Failed to fetch students data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteToModerator = async (uuid: string, name: string) => {
    if (!confirm(`Are you sure you want to promote ${name} to a Moderator? They will be notified upon their next login.`)) return;
    
    setActionLoading(uuid);
    try {
      const res = await fetch(`/api/v1/students/${uuid}/promote`, { 
        method: 'POST' 
      });
      
      if (res.ok) {
        alert(`${name} has been successfully promoted to Moderator.`);
        setActiveStudents(prev => prev.filter(s => s.uuid !== uuid));
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Failed to promote student.");
      }
    } catch (error) {
      console.error("Failed to promote student:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async (uuid: string) => {
    setActionLoading(uuid);
    try {
      const res = await fetch(`/api/v1/students/pending/${uuid}/verify`, { method: 'PATCH' });
      if (res.ok) {
        const approvedStudent = pendingStudents.find(s => s.uuid === uuid);
        setPendingStudents(prev => prev.filter(s => s.uuid !== uuid));
        if (approvedStudent) setActiveStudents(prev => [approvedStudent, ...prev]);
      }
    } catch (error) {
      console.error("Failed to verify student:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPending = async (uuid: string) => {
    if (!confirm("Are you sure you want to reject and delete this pending registration?")) return;
    setActionLoading(uuid);
    try {
      const res = await fetch(`/api/v1/students/pending/${uuid}`, { method: 'DELETE' });
      if (res.ok) setPendingStudents(prev => prev.filter(s => s.uuid !== uuid));
    } catch (error) {
      console.error("Failed to reject student:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteActive = async (uuid: string) => {
    if (!confirm("Are you sure you want to permanently delete this student account?")) return;
    setActionLoading(uuid);
    try {
      const res = await fetch(`/api/v1/students/${uuid}`, { method: 'DELETE' });
      if (res.ok) setActiveStudents(prev => prev.filter(s => s.uuid !== uuid));
    } catch (error) {
      console.error("Failed to delete active student:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredData = (activeTab === 'pending' ? pendingStudents : activeStudents).filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
          <p className="text-sm text-slate-500 mt-1">Verify new registrations and manage active student accounts.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {}
      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-6 max-w-sm">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'pending' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="h-4 w-4" />
          Pending
          {pendingStudents.length > 0 && (
            <span className="bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
              {pendingStudents.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'active' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Active
        </button>
      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="px-6 py-4 font-medium">Student Name</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Batch</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-slate-500 mt-2 text-sm">Loading students...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                    <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    No {activeTab} students found.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredData.map((student) => (
                    <motion.tr 
                      key={student.uuid}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, backgroundColor: '#fee2e2' }}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{student.name}</div>
                        <div className="text-sm text-slate-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        @{student.username}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {student.student_batch || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleVerify(student.uuid)}
                                disabled={actionLoading === student.uuid}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve Student"
                              >
                                {actionLoading === student.uuid ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                              </button>
                              <button
                                onClick={() => handleRejectPending(student.uuid)}
                                disabled={actionLoading === student.uuid}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject Student"
                              >
                                {actionLoading === student.uuid ? <Loader2 className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handlePromoteToModerator(student.uuid, student.name)}
                                disabled={actionLoading === student.uuid}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Promote to Moderator"
                              >
                                {actionLoading === student.uuid ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUpCircle className="h-5 w-5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteActive(student.uuid)}
                                disabled={actionLoading === student.uuid}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete Account"
                              >
                                {actionLoading === student.uuid ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}