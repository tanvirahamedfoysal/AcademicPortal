import { useEffect, useState } from "react";
import { SystemAPI, ApiError } from "../../lib/api";
import { Card, EmptyState, Spinner } from "../../components/ui";

export default function AuditLogs() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    SystemAPI.auditLogs()
      .then((res) => setList(res?.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load audit logs."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Audit Logs</h2>
      </div>
      {error && <p className="px-5 pt-3 text-sm text-rose-600">{error}</p>}
      {loading ? (
        <div className="p-10 flex justify-center">
          <Spinner />
        </div>
      ) : list.length === 0 ? (
        <EmptyState text="No audit log entries yet." />
      ) : (
        <div className="divide-y divide-slate-100">
          {list.map((l: any, i: number) => (
            <div key={l.id ?? i} className="p-4 text-sm flex items-center justify-between">
              <span className="text-slate-700">{l.action ?? l.message}</span>
              <span className="text-xs text-slate-400">{l.created_at ? new Date(l.created_at).toLocaleString() : ""}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
