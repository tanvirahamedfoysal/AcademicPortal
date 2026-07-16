import { useEffect, useState } from "react";
import { StudentsAPI, ApiError } from "../../lib/api";
import { setCached } from "../../lib/cache";
import { Badge, Button, Card, EmptyState, Spinner } from "../../components/ui";

export default function Students() {
  const [tab, setTab] = useState<"pending" | "active">("pending");
  const [pending, setPending] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([StudentsAPI.listPending(), StudentsAPI.list()]);
      setPending(p?.data ?? []);
      setActive(a?.data ?? []);
      await setCached("admin:students:pending", p);
      await setCached("admin:students:all", a);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function verify(uuid: string) {
    setBusy(uuid);
    try {
      await StudentsAPI.verifyPending(uuid);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verify failed.");
    } finally {
      setBusy(null);
    }
  }

  async function rejectPending(uuid: string) {
    setBusy(uuid);
    try {
      await StudentsAPI.deletePending(uuid);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  async function suspend(uuid: string) {
    setBusy(uuid);
    try {
      await StudentsAPI.update(uuid, { status: "SUSPENDED" });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Students Management</h2>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 text-sm">
          <button
            onClick={() => setTab("pending")}
            className={`px-3 py-1.5 rounded-md ${tab === "pending" ? "bg-white shadow-sm font-medium" : "text-slate-500"}`}
          >
            Pending ({pending.length})
          </button>
          <button
            onClick={() => setTab("active")}
            className={`px-3 py-1.5 rounded-md ${tab === "active" ? "bg-white shadow-sm font-medium" : "text-slate-500"}`}
          >
            Active ({active.length})
          </button>
        </div>
      </div>

      {error && <p className="px-5 pt-3 text-sm text-rose-600">{error}</p>}

      {loading ? (
        <div className="p-10 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(tab === "pending" ? pending : active).map((s) => (
              <tr key={s.uuid}>
                <td className="px-5 py-3 font-medium text-slate-700">{s.name}</td>
                <td className="px-5 py-3 text-slate-500">{s.email}</td>
                <td className="px-5 py-3">
                  <Badge tone={tab === "pending" ? "amber" : s.status === "SUSPENDED" ? "rose" : "green"}>
                    {s.status ?? (tab === "pending" ? "PENDING" : "ACTIVE")}
                  </Badge>
                </td>
                <td className="px-5 py-3 space-x-3">
                  {tab === "pending" ? (
                    <>
                      <Button variant="ghost" className="!px-0 !py-0" disabled={busy === s.uuid} onClick={() => verify(s.uuid)}>
                        Verify
                      </Button>
                      <Button variant="danger" className="!px-0 !py-0" disabled={busy === s.uuid} onClick={() => rejectPending(s.uuid)}>
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button variant="danger" className="!px-0 !py-0" disabled={busy === s.uuid} onClick={() => suspend(s.uuid)}>
                      Suspend
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && (tab === "pending" ? pending.length === 0 : active.length === 0) && (
        <EmptyState text={tab === "pending" ? "No pending registrations." : "No active students yet."} />
      )}
    </Card>
  );
}
