import { FormEvent, useEffect, useState } from "react";
import { RepositoryAPI, ApiError } from "../../lib/api";
import { Button, Card, EmptyState, Input, Spinner } from "../../components/ui";

const empty = { title: "", url: "", description: "" };

export default function Repository() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await RepositoryAPI.list();
      setList(res?.data ?? res ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load repository.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await RepositoryAPI.create(form);
      setForm(empty);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await RepositoryAPI.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="p-5 h-fit">
        <h2 className="font-semibold text-slate-800 mb-3">Add document</h2>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input placeholder="File URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" disabled={busy}>
            Add
          </Button>
        </form>
      </Card>

      <div className="lg:col-span-2 space-y-3">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <EmptyState text="No repository documents yet." />
        ) : (
          list.map((d: any) => (
            <Card key={d.id ?? d.uuid} className="p-4 flex items-center justify-between">
              <div>
                <a href={d.url} target="_blank" rel="noreferrer" className="font-medium text-brand-700 hover:underline">
                  {d.title}
                </a>
                <p className="text-sm text-slate-500 mt-1">{d.description}</p>
              </div>
              <Button variant="danger" className="!px-0 !py-0" disabled={busy} onClick={() => remove(d.id ?? d.uuid)}>
                Delete
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
