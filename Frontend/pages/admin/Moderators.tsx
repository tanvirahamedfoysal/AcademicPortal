import { useEffect, useState } from "react";
import { ModeratorsAPI, ApiError } from "../../lib/api";
import { Badge, Button, Card, EmptyState, Input, Spinner } from "../../components/ui";

export default function Moderators() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUuid, setNewUuid] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await ModeratorsAPI.list();
      setList(res?.data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load moderators.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function promote(e: React.FormEvent) {
    e.preventDefault();
    if (!newUuid) return;
    setBusy(true);
    try {
      await ModeratorsAPI.create(newUuid, {});
      setNewUuid("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not promote user.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(uuid: string) {
    setBusy(true);
    try {
      await ModeratorsAPI.remove(uuid);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove moderator.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="font-semibold text-slate-800 mb-3">Promote user to moderator</h2>
        <form onSubmit={promote} className="flex gap-3">
          <Input placeholder="User UUID" value={newUuid} onChange={(e) => setNewUuid(e.target.value)} />
          <Button type="submit" disabled={busy}>
            Promote
          </Button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Moderators</h2>
        </div>
        {error && <p className="px-5 pt-3 text-sm text-rose-600">{error}</p>}
        {loading ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <EmptyState text="No moderators yet." />
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
              {list.map((m) => (
                <tr key={m.uuid}>
                  <td className="px-5 py-3 font-medium text-slate-700">{m.name}</td>
                  <td className="px-5 py-3 text-slate-500">{m.email}</td>
                  <td className="px-5 py-3">
                    <Badge tone="blue">{m.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Button variant="danger" className="!px-0 !py-0" disabled={busy} onClick={() => remove(m.uuid)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
