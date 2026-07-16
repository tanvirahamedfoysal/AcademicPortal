import { FormEvent, useEffect, useState } from "react";
import { ArticlesAPI, ApiError } from "../../lib/api";
import { Badge, Button, Card, EmptyState, Input, Spinner, Textarea } from "../../components/ui";

const empty = { title: "", body: "" };

export default function AdminArticles() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await ArticlesAPI.list();
      setList(res?.data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load articles.");
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
      if (editingId) {
        await ArticlesAPI.update(editingId, form);
      } else {
        await ArticlesAPI.create(form);
      }
      setForm(empty);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  function edit(a: any) {
    setEditingId(a.uuid ?? a.id);
    setForm({ title: a.title ?? "", body: a.body ?? a.content ?? "" });
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await ArticlesAPI.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: string) {
    setBusy(true);
    try {
      await ArticlesAPI.updateStatus(id, { status });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Status update failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="p-5 lg:col-span-1 h-fit">
        <h2 className="font-semibold text-slate-800 mb-3">{editingId ? "Edit article" : "New article"}</h2>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea placeholder="Body" rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {editingId ? "Update" : "Create"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(empty);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="lg:col-span-2 space-y-3">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <EmptyState text="No articles yet." />
        ) : (
          list.map((a) => (
            <Card key={a.uuid ?? a.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800">{a.title}</p>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{a.body ?? a.content}</p>
                </div>
                <Badge tone={a.status === "PUBLISHED" ? "green" : "amber"}>{a.status ?? "DRAFT"}</Badge>
              </div>
              <div className="flex gap-3 text-sm mt-3">
                <Button variant="ghost" className="!px-0 !py-0" onClick={() => edit(a)}>
                  Edit
                </Button>
                {a.status !== "PUBLISHED" ? (
                  <Button variant="ghost" className="!px-0 !py-0" disabled={busy} onClick={() => setStatus(a.uuid ?? a.id, "PUBLISHED")}>
                    Publish
                  </Button>
                ) : (
                  <Button variant="ghost" className="!px-0 !py-0" disabled={busy} onClick={() => setStatus(a.uuid ?? a.id, "DRAFT")}>
                    Unpublish
                  </Button>
                )}
                <Button variant="danger" className="!px-0 !py-0" disabled={busy} onClick={() => remove(a.uuid ?? a.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
