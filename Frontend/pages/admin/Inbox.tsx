import { useEffect, useState } from "react";
import { ContactAPI, ApiError } from "../../lib/api";
import { Button, Card, EmptyState, Spinner } from "../../components/ui";

export default function Inbox() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await ContactAPI.list();
      setList(res?.data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load inbox.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    setBusy(id);
    try {
      await ContactAPI.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Inbox</h2>
      </div>
      {error && <p className="px-5 pt-3 text-sm text-rose-600">{error}</p>}
      {loading ? (
        <div className="p-10 flex justify-center">
          <Spinner />
        </div>
      ) : list.length === 0 ? (
        <EmptyState text="No messages yet." />
      ) : (
        <div className="divide-y divide-slate-100">
          {list.map((m: any, i: number) => (
            <div key={m.id ?? i} className="p-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-700">
                  {m.name} <span className="text-slate-400 font-normal">· {m.email}</span>
                </p>
                <p className="text-sm text-slate-500 mt-1">{m.message}</p>
              </div>
              <Button variant="danger" className="!px-0 !py-0 shrink-0" disabled={busy === m.id} onClick={() => remove(m.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
