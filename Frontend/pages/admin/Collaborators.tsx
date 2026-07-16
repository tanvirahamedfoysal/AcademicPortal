import { FormEvent, useEffect, useState } from "react";
import { CollaboratorsAPI, ImagesAPI, ApiError } from "../../lib/api";
import { Button, Card, EmptyState, Input, Spinner, Textarea } from "../../components/ui";
import CachedImage from "../../components/CachedImage";

const empty = { name: "", bio: "", organization: "", website_url: "", image_url: "" };

export default function Collaborators() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await ImagesAPI.upload(file);
      const url = res?.data?.url ?? res?.url ?? res?.data?.image_url;
      if (url) setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const res = await CollaboratorsAPI.list();
      setList(res?.data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load collaborators.");
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
      if (editingUuid) {
        await CollaboratorsAPI.update(editingUuid, form);
      } else {
        await CollaboratorsAPI.create(form);
      }
      setForm(empty);
      setEditingUuid(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  function edit(c: any) {
    setEditingUuid(c.uuid);
    setForm({
      name: c.name ?? "",
      bio: c.bio ?? "",
      organization: c.organization ?? "",
      website_url: c.website_url ?? "",
      image_url: c.image_url ?? "",
    });
  }

  async function remove(uuid: string) {
    setBusy(true);
    try {
      await CollaboratorsAPI.remove(uuid);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="p-5 lg:col-span-1 h-fit">
        <h2 className="font-semibold text-slate-800 mb-3">{editingUuid ? "Edit collaborator" : "Add collaborator"}</h2>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea placeholder="Bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} required />
          <Input placeholder="Organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
          <Input placeholder="Website URL" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
          <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <div>
            <label className="text-xs font-medium text-slate-600">Or upload a photo</label>
            <input type="file" accept="image/*" onChange={onFileChange} disabled={uploading} className="mt-1 block text-sm" />
            {uploading && <p className="text-xs text-slate-400 mt-1">Uploading...</p>}
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {editingUuid ? "Update" : "Add"}
            </Button>
            {editingUuid && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingUuid(null);
                  setForm(empty);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="lg:col-span-2 space-y-4">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <EmptyState text="No collaborators yet." />
        ) : (
          list.map((c) => (
            <Card key={c.uuid} className="p-4 flex gap-4 items-start">
              <CachedImage src={c.image_url} updatedAt={c.updated_at} alt={c.name} className="h-12 w-12 rounded-full object-cover shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-400">{c.organization}</p>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.bio}</p>
              </div>
              <div className="flex gap-3 text-sm shrink-0">
                <Button variant="ghost" className="!px-0 !py-0" onClick={() => edit(c)}>
                  Edit
                </Button>
                <Button variant="danger" className="!px-0 !py-0" onClick={() => remove(c.uuid)}>
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
