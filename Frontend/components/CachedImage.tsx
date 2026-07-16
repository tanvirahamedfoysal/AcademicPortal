import { useEffect, useState } from "react";
import { getCachedMediaUrl } from "../lib/cache";

// Renders an <img> whose bytes are pulled from IndexedDB whenever
// possible instead of the network. `updatedAt` should be whatever
// version marker the backend gives us (e.g. user_updated_at) — when it
// hasn't changed since the last visit, zero bytes are re-downloaded.
export default function CachedImage({
  src,
  updatedAt,
  alt,
  className,
}: {
  src: string;
  updatedAt?: string;
  alt: string;
  className?: string;
}) {
  const [resolved, setResolved] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!src) return;
    getCachedMediaUrl(src, updatedAt).then((url) => {
      if (!cancelled) setResolved(url);
    });
    return () => {
      cancelled = true;
    };
  }, [src, updatedAt]);

  if (!resolved) {
    return <div className={`animate-pulse bg-slate-200 ${className ?? ""}`} aria-label={alt} />;
  }
  return <img src={resolved} alt={alt} className={className} loading="lazy" decoding="async" />;
}
