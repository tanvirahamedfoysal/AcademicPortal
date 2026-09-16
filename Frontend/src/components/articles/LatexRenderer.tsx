'use client';

import { useEffect, useMemo, useRef } from 'react';
import { articleBodyToHtml, sanitizeArticleHtml } from '../../lib/article-content';
import { typesetMath } from '../../lib/mathjax';

export default function LatexRenderer({ content, className = '' }: { content: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(() => sanitizeArticleHtml(articleBodyToHtml(content)), [content]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    void typesetMath(root);
  }, [html]);

  return (
    <div
      ref={ref}
      className={`rich-article latex-preview ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
