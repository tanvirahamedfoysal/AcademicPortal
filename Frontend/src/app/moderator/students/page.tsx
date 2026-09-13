'use client';
import { apiFetch } from '../../../lib/client-api';

import { useState, useEffect } from 'react';
import { Loader2, Search, GraduationCap, Trash2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
  uuid: string;
  name: string;
  username: string;
  email: string;
  created_at?: string;
  status?: string;
}

export default function ModeratorStudentsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'active' 
        ? '/api/v1/students' 
        : '/api/v1/students/pending'; 
        
      const res = await apiFetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const formattedData = Array.isArray(data) ? data : (data.data || []);
        
        if (activeTab === 'active') {
          setStudents(formattedData.filter((student: Student) => String(student.status || '').toUpperCase() === 'ACTIVE'));
        } else {
          setPendingStudents(formattedData);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${activeTab} students:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (uuid: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${name}'s account?`)) return;
    
    setActionLoading(uuid);
    try {
      const res = await apiFetch(`/api/v1/students/${uuid}`, { method: 'DELETE' });
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.uuid !== uuid));
      } else {
        alert("Failed to delete student account.");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (uuid: string, name: string) => {
    setActionLoading(uuid);
    try {
      const res = await apiFetch(`/api/v1/students/pending/${uuid}/verify`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setPendingStudents(prev => prev.filter(s => s.uuid !== uuid));
        alert(`${name} has been approved.`);
      } else {
        alert("Failed to approve student.");
      }
    } catch (error) {
      console.error("Error approving student:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (uuid: string, name: string) => {
    if (!confirm(`Are you sure you want to reject and remove ${name}'s application?`)) return;
    
    setActionLoading(uuid);
    try {
      const res = await apiFetch(`/api/v1/students/pending/${uuid}`, { method: 'DELETE' });
      if (res.ok) {
        setPendingStudents(prev => prev.filter(s => s.uuid !== uuid));
      } else {
        alert("Failed to reject student.");
      }
    } catch (error) {
      console.error("Error rejecting student:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const displayData = activeTab === 'active' ? students : pendingStudents;
  const filteredData = displayData.filter(s => {
    const query = searchQuery.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(query) ||
      (s.username || '').toLowerCase().includes(query) ||
      (s.email || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#6fa8b4]" />
            Student Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review registrations and manage existing student accounts.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#78bac5] focus:border-transparent text-sm outline-none"
          />
        </div>
      </div>

      {}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'active' 
              ? 'border-[#78bac5] text-[#6fa8b4]' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Active Students
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pending' 
              ? 'border-[#78bac5] text-[#6fa8b4]' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Pending Approvals
          {pendingStudents.length > 0 && activeTab !== 'pending' && (
            <span className="bg-[#dff7f6] text-[#527f8f] text-[10px] font-bold px-2 py-0.5 rounded-full">
              {pendingStudents.length}
            </span>
          )}
        </button>
      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="px-6 py-4 font-medium">Student Info</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#6fa8b4] mx-auto" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-sm">
                    <GraduationCap className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    No {activeTab} students found.
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredData.map((student) => (
                    <motion.tr 
                      key={student.uuid}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#cdeff0] flex items-center justify-center text-[#689aa6] font-bold text-sm">
                            {(student.name || student.username || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{student.name || 'Unknown'}</div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        @{student.username}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {activeTab === 'active' ? (
                          <button
                            onClick={() => handleDelete(student.uuid, student.name)}
                            disabled={actionLoading === student.uuid}
                            className="p-2 text-[#527f8f] hover:bg-[#edf6ff] rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Student"
                          >
                            {actionLoading === student.uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleApprove(student.uuid, student.name)}
                              disabled={actionLoading === student.uuid}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#689aa6] bg-[#dff7f6] hover:bg-[#cdeff0] rounded-lg transition-colors disabled:opacity-50"
                            >
                              {actionLoading === student.uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(student.uuid, student.name)}
                              disabled={actionLoading === student.uuid}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#4f8294] bg-[#edf6ff] hover:bg-[#dff7f6] rounded-lg transition-colors disabled:opacity-50"
                            >
                              {actionLoading === student.uuid ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                              Reject
                            </button>
                          </div>
                        )}
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
