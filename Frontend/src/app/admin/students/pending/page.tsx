'use client';

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { usePendingStudents, useVerifyStudent, useRejectStudent } from '../../../../hooks/useStudents';

export default function PendingStudentsPage() {
  const { data: students, isLoading, isError, error } = usePendingStudents();
  const verifyMutation = useVerifyStudent();
  const rejectMutation = useRejectStudent();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
        <AlertCircle size={20} />
        <p>Failed to load pending students: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pending Approvals</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review and verify new student registrations.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {students?.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No pending students to review.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Department</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {students?.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{student.name}</td>
                    <td className="p-4 text-slate-600">{student.email}</td>
                    <td className="p-4 text-slate-600">{student.department || 'N/A'}</td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => rejectMutation.mutate(student.id)}
                        disabled={rejectMutation.isPending || verifyMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        title="Reject Student"
                      >
                        <XCircle size={18} />
                      </button>
                      
                      <button
                        onClick={() => verifyMutation.mutate(student.id)}
                        disabled={verifyMutation.isPending || rejectMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={16} />
                        <span>Verify</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}