const BLOCK_TAG_PATTERN = /<\/?(?:p|div|h[1-6]|ul|ol|li|blockquote|figure|table|thead|tbody|tr|th|td|pre|hr|img|span|strong|em|u|a)\b/i;

export function sanitizeArticleHtml(input: string): string {
  return input
    .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*\/?\s*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"');
}

export function isRichArticleHtml(value: string): boolean {
  return BLOCK_TAG_PATTERN.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


function mathNode(latex: string, display: boolean): string {
  const safe = escapeHtml(latex.trim());
  const attr = safe.replaceAll('"', '&quot;');
  const source = display ? `\\[${safe}\\]` : `\\(${safe}\\)`;
  const tag = display ? 'div' : 'span';
  const cls = display ? 'article-latex article-latex-display' : 'article-latex article-latex-inline';
  return `<${tag} class="${cls}" data-latex="${attr}" data-display="${display ? 'block' : 'inline'}" contenteditable="false">${source}</${tag}>`;
}

function renderLegacyInlineText(value: string): string {
  const pattern = /\\\(([\s\S]*?)\\\)|\$([^$\n]+?)\$/g;
  let output = '';
  let cursor = 0;
  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    output += escapeHtml(value.slice(cursor, index));
    output += mathNode(match[1] ?? match[2] ?? '', false);
    cursor = index + match[0].length;
  }
  output += escapeHtml(value.slice(cursor));
  return output.replaceAll('\n', '<br>');
}

function legacyBlockToHtml(block: string): string {
  const trimmed = block.trim();
  if (!trimmed) return '';

  const section = trimmed.match(/^\\section\*?\{([\s\S]+)\}$/);
  if (section) return `<h2>${escapeHtml(section[1])}</h2>`;

  const subsection = trimmed.match(/^\\subsection\*?\{([\s\S]+)\}$/);
  if (subsection) return `<h3>${escapeHtml(subsection[1])}</h3>`;

  const markdownHeading = trimmed.match(/^(#{1,3})\s+([\s\S]+)$/);
  if (markdownHeading) {
    const level = markdownHeading[1].length === 1 ? 2 : 3;
    return `<h${level}>${escapeHtml(markdownHeading[2])}</h${level}>`;
  }

  const bracketDisplay = trimmed.match(/^\\\[([\s\S]*)\\\]$/);
  if (bracketDisplay) return mathNode(bracketDisplay[1], true);

  const dollarDisplay = trimmed.match(/^\$\$([\s\S]*)\$\$$/);
  if (dollarDisplay) return mathNode(dollarDisplay[1], true);

  const lines = trimmed.split('\n');
  if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
    return `<ul>${lines.map((line) => `<li>${escapeHtml(line.trim().replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`;
  }
  if (lines.every((line) => /^\d+[.)]\s+/.test(line.trim()))) {
    return `<ol>${lines.map((line) => `<li>${escapeHtml(line.trim().replace(/^\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
  }

  return `<p>${renderLegacyInlineText(trimmed)}</p>`;
}

export function articleBodyToHtml(value: string): string {
  const body = value?.trim() ?? '';
  if (!body) return '';
  if (isRichArticleHtml(body)) return sanitizeArticleHtml(body);
  return body.replace(/\r\n/g, '\n').split(/\n{2,}/).map(legacyBlockToHtml).join('');
}

export function articlePlainText(value: string): string {
  if (!value) return '';
  if (!isRichArticleHtml(value)) {
    return value
      .replace(/\\(?:section|subsection)\*?\{([^}]*)\}/g, '$1 ')
      .replace(/\\\[[\s\S]*?\\\]/g, ' equation ')
      .replace(/\\\([\s\S]*?\\\)/g, ' equation ')
      .replace(/\$\$[\s\S]*?\$\$/g, ' equation ')
      .replace(/\$[^$]+\$/g, ' equation ');
  }
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function hasMeaningfulArticleBody(value: string): boolean {
  if (!value?.trim()) return false;
  if (/data-latex=|<img\b|<table\b|<hr\b/i.test(value)) return true;
  return articlePlainText(value).trim().length > 0;
}
