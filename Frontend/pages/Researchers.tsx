import { useEffect, useState } from "react";
import PublicNavbar from "../components/PublicNavbar";
import { CollaboratorsAPI } from "../lib/api";
import { cachedFetch } from "../lib/cache";
import CachedImage from "../components/CachedImage";
import { Card, EmptyState } from "../components/ui";

export default function Researchers() {
  const [list, setList] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    cachedFetch("public:collaborators:all", () => CollaboratorsAPI.list(), {
      onCache: (d: any) => {
        setList(d?.data ?? []);
        setLoaded(true);
      },
    }).then((d: any) => {
      setList(d?.data ?? []);
      setLoaded(true);
    });
  }, []);

  return (
    <div>
      <PublicNavbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-800">Researchers &amp; Collaborators</h1>
        <p className="text-sm text-slate-500 mt-1">People contributing to the lab's research.</p>

        {loaded && list.length === 0 && <EmptyState text="No researchers listed yet." />}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mt-8">
          {list.map((c) => (
            <Card key={c.uuid} className="p-5 flex gap-4 items-start">
              <CachedImage
                src={c.image_url}
                updatedAt={c.updated_at}
                alt={c.name}
                className="h-14 w-14 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="font-medium text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-400">{c.designation ?? c.role ?? ""}</p>
                {c.bio && <p className="text-sm text-slate-500 mt-2 line-clamp-3">{c.bio}</p>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
