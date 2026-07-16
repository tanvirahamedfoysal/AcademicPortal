import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { ArticlesAPI } from "../lib/api";
import { cachedFetch } from "../lib/cache";
import { Card, EmptyState } from "../components/ui";

export default function Articles() {
  const [list, setList] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    cachedFetch("public:articles:all", () => ArticlesAPI.listPublic(), {
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
        <h1 className="text-2xl font-semibold text-slate-800">Published Articles</h1>
        <p className="text-sm text-slate-500 mt-1">Research papers, updates, and publications from the lab.</p>

        {loaded && list.length === 0 && <EmptyState text="No published articles yet." />}

        <div className="grid md:grid-cols-2 gap-5 mt-8">
          {list.map((a) => (
            <Link key={a.uuid ?? a.id} to={`/articles/${a.uuid ?? a.id}`}>
              <Card className="p-5 h-full hover:shadow-md transition-shadow">
                <p className="font-semibold text-slate-800">{a.title}</p>
                <p className="text-sm text-slate-500 mt-2 line-clamp-3">{a.summary ?? a.abstract ?? ""}</p>
                {a.published_at && <p className="text-xs text-slate-400 mt-3">{new Date(a.published_at).toLocaleDateString()}</p>}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
