'use client';

import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Pilcrow,
  Quote,
  Redo2,
  Sigma,
  Table2,
  Underline,
  Undo2,
  X,
} from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { apiFetch } from '../../lib/client-api';
import { articleBodyToHtml } from '../../lib/article-content';
import { serializeEditorHtml, typesetMath } from '../../lib/mathjax';

type EquationMode = 'inline' | 'display';
type Notice = { tone: 'info' | 'error'; message: string } | null;

export default function PremiumArticleEditor({
  value,
  disabled = false,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const insertionMarkerRef = useRef<HTMLSpanElement | null>(null);
  const lastSyncedHtmlRef = useRef('');

  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState('3');
  const [tableColumns, setTableColumns] = useState('3');

  const [equationDialogOpen, setEquationDialogOpen] = useState(false);
  const [equationSource, setEquationSource] = useState('E = mc^2');
  const [equationMode, setEquationMode] = useState<EquationMode>('display');
  const equationPreviewRef = useRef<HTMLDivElement>(null);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('https://');

  useEffect(() => {
    return () => insertionMarkerRef.current?.remove();
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const normalized = articleBodyToHtml(value);
    if (normalized === lastSyncedHtmlRef.current) return;
    editor.innerHTML = normalized;
    lastSyncedHtmlRef.current = normalized;
    void typesetMath(editor);
  }, [value]);

  useEffect(() => {
    const preview = equationPreviewRef.current;
    if (!preview || !equationDialogOpen) return;

    preview.replaceChildren();
    const formula = document.createElement(equationMode === 'display' ? 'div' : 'span');
    formula.className = `article-latex article-latex-${equationMode}`;
    formula.dataset.latex = equationSource || 'E = mc^2';
    formula.dataset.display = equationMode === 'display' ? 'block' : 'inline';
    formula.textContent = equationMode === 'display'
      ? `\\[${formula.dataset.latex}\\]`
      : `\\(${formula.dataset.latex}\\)`;
    preview.append(formula);
    void typesetMath(preview);
  }, [equationDialogOpen, equationMode, equationSource]);

  function syncContent(): void {
    const editor = editorRef.current;
    if (!editor) return;
    const html = serializeEditorHtml(editor);
    lastSyncedHtmlRef.current = html;
    onChange(html);
  }

  function saveSelection(): void {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) savedSelectionRef.current = range.cloneRange();
  }

  function restoreSelection(): void {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;

    editor.focus();
    selection.removeAllRanges();
    if (savedSelectionRef.current && editor.contains(savedSelectionRef.current.commonAncestorContainer)) {
      selection.addRange(savedSelectionRef.current);
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.addRange(range);
  }

  function execute(command: string, value?: string): void {
    if (disabled) return;
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    syncContent();
  }

  function preventToolbarBlur(event: MouseEvent<HTMLButtonElement>): void {
    saveSelection();
    event.preventDefault();
  }

  function createInsertionMarker(): void {
    const editor = editorRef.current;
    if (!editor) return;
    insertionMarkerRef.current?.remove();

    const marker = document.createElement('span');
    marker.dataset.editorInsertionMarker = 'true';
    marker.setAttribute('aria-hidden', 'true');
    marker.style.display = 'inline-block';
    marker.style.width = '0';
    marker.style.height = '1em';
    marker.style.overflow = 'hidden';
    marker.textContent = '\u200B';

    const range = document.createRange();
    const savedRange = savedSelectionRef.current;
    if (savedRange && editor.contains(savedRange.commonAncestorContainer)) {
      range.setStart(savedRange.startContainer, savedRange.startOffset);
      range.collapse(true);
    } else {
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    range.insertNode(marker);
    insertionMarkerRef.current = marker;
  }

  function removeInsertionMarker(restoreCaret: boolean): void {
    const marker = insertionMarkerRef.current;
    const editor = editorRef.current;
    insertionMarkerRef.current = null;

    if (!marker?.isConnected) {
      if (restoreCaret) requestAnimationFrame(restoreSelection);
      return;
    }

    if (restoreCaret && editor) {
      const range = document.createRange();
      range.setStartBefore(marker);
      range.collapse(true);
      marker.remove();
      requestAnimationFrame(() => {
        const selection = window.getSelection();
        editor.focus();
        selection?.removeAllRanges();
        selection?.addRange(range);
        savedSelectionRef.current = range.cloneRange();
      });
      return;
    }
    marker.remove();
  }

  function getInsertionRange(editor: HTMLElement): Range {
    const marker = insertionMarkerRef.current ?? editor.querySelector<HTMLSpanElement>('[data-editor-insertion-marker="true"]');
    const range = document.createRange();
    if (marker?.isConnected) {
      range.selectNode(marker);
      return range;
    }
    if (savedSelectionRef.current && editor.contains(savedSelectionRef.current.commonAncestorContainer)) {
      range.setStart(savedSelectionRef.current.startContainer, savedSelectionRef.current.startOffset);
      range.collapse(true);
      return range;
    }
    range.selectNodeContents(editor);
    range.collapse(false);
    return range;
  }

  function insertHtmlAtSelection(html: string, typeset = false): void {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const selection = window.getSelection();
    const range = getInsertionRange(editor);
    selection?.removeAllRanges();
    selection?.addRange(range);

    const inserted = document.execCommand('insertHTML', false, html);
    if (!inserted) {
      const template = document.createElement('template');
      template.innerHTML = html;
      range.deleteContents();
      range.insertNode(template.content.cloneNode(true));
    }

    insertionMarkerRef.current = null;
    editor.querySelectorAll('[data-editor-insertion-marker="true"]').forEach((node) => node.remove());
    syncContent();
    saveSelection();
    if (typeset) void typesetMath(editor);
  }

  function insertMediaItem(itemHtml: string): void {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    const range = getInsertionRange(editor);
    const nearbyGrid = findNearbyMediaGrid(editor, range);

    if (nearbyGrid) {
      const template = document.createElement('template');
      template.innerHTML = itemHtml;
      nearbyGrid.append(template.content.cloneNode(true));
      insertionMarkerRef.current?.remove();
      insertionMarkerRef.current = null;
      placeCaretAfterMediaGrid(editor, nearbyGrid);
      syncContent();
      return;
    }

    selection?.removeAllRanges();
    selection?.addRange(range);
    const gridHtml = `<div class="article-media-grid" data-media-grid="true">${itemHtml}</div><p><br></p>`;
    const inserted = document.execCommand('insertHTML', false, gridHtml);
    if (!inserted) {
      const template = document.createElement('template');
      template.innerHTML = gridHtml;
      range.deleteContents();
      range.insertNode(template.content.cloneNode(true));
    }

    insertionMarkerRef.current = null;
    editor.querySelectorAll('[data-editor-insertion-marker="true"]').forEach((node) => node.remove());
    const grid = Array.from(editor.querySelectorAll<HTMLElement>('.article-media-grid')).at(-1);
    if (grid) placeCaretAfterMediaGrid(editor, grid);
    syncContent();
    saveSelection();
  }

  function openTableDialog(): void {
    if (disabled) return;
    saveSelection();
    createInsertionMarker();
    setTableRows('3');
    setTableColumns('3');
    setTableDialogOpen(true);
  }

  function closeTableDialog(): void {
    setTableDialogOpen(false);
    removeInsertionMarker(true);
  }

  function insertTable(): void {
    const rows = Number.parseInt(tableRows, 10);
    const columns = Number.parseInt(tableColumns, 10);
    if (!Number.isInteger(rows) || rows < 1 || rows > 20) {
      setNotice({ tone: 'error', message: 'Choose between 1 and 20 rows.' });
      return;
    }
    if (!Number.isInteger(columns) || columns < 1 || columns > 10) {
      setNotice({ tone: 'error', message: 'Choose between 1 and 10 columns.' });
      return;
    }

    const headingCells = Array.from({ length: columns }, (_, index) => `<th scope="col">Heading ${index + 1}</th>`).join('');
    const bodyRows = Array.from({ length: Math.max(0, rows - 1) }, () => `<tr>${Array.from({ length: columns }, () => '<td>Text</td>').join('')}</tr>`).join('');
    const itemHtml = `<div class="article-media-item article-media-table"><div class="article-table-wrap"><table><thead><tr>${headingCells}</tr></thead><tbody>${bodyRows}</tbody></table></div></div>`;

    setTableDialogOpen(false);
    requestAnimationFrame(() => {
      insertMediaItem(itemHtml);
      setNotice({ tone: 'info', message: `${rows} × ${columns} table inserted.` });
    });
  }

  function openEquationDialog(): void {
    if (disabled) return;
    saveSelection();
    createInsertionMarker();
    setEquationSource('E = mc^2');
    setEquationMode('display');
    setEquationDialogOpen(true);
  }

  function closeEquationDialog(): void {
    setEquationDialogOpen(false);
    removeInsertionMarker(true);
  }

  function insertEquation(): void {
    const latex = equationSource.trim();
    if (!latex) {
      setNotice({ tone: 'error', message: 'Enter a LaTeX expression first.' });
      return;
    }

    const safeAttribute = escapeHtml(latex);
    const safeText = escapeHtml(latex);
    const display = equationMode === 'display';
    const html = display
      ? `<div class="article-latex article-latex-display" data-latex="${safeAttribute}" data-display="block" contenteditable="false">\\[${safeText}\\]</div><p><br></p>`
      : `<span class="article-latex article-latex-inline" data-latex="${safeAttribute}" data-display="inline" contenteditable="false">\\(${safeText}\\)</span>&nbsp;`;

    setEquationDialogOpen(false);
    requestAnimationFrame(() => {
      insertHtmlAtSelection(html, true);
      setNotice({ tone: 'info', message: `${display ? 'Display' : 'Inline'} equation inserted.` });
    });
  }

  function openLinkDialog(): void {
    if (disabled) return;
    saveSelection();
    const selection = window.getSelection()?.toString().trim() || '';
    createInsertionMarker();
    setLinkText(selection || 'Related source');
    setLinkUrl('https://');
    setLinkDialogOpen(true);
  }

  function closeLinkDialog(): void {
    setLinkDialogOpen(false);
    removeInsertionMarker(true);
  }

  function insertLink(): void {
    const url = linkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      setNotice({ tone: 'error', message: 'Use a complete http:// or https:// URL.' });
      return;
    }
    const label = linkText.trim() || url;
    setLinkDialogOpen(false);
    requestAnimationFrame(() => {
      insertHtmlAtSelection(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`);
      setNotice({ tone: 'info', message: 'Link inserted.' });
    });
  }

  async function uploadAndInsertImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || disabled) return;
    if (!file.type.startsWith('image/')) {
      setNotice({ tone: 'error', message: 'Choose an image file.' });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setNotice({ tone: 'error', message: 'Please use an image smaller than 8 MB.' });
      return;
    }

    saveSelection();
    setUploading(true);
    setNotice({ tone: 'info', message: 'Uploading image…' });
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await apiFetch('/api/v1/images', { method: 'POST', body: form });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.url) throw new Error(payload?.detail || 'Image upload failed.');

      const name = file.name.replace(/\.[^.]+$/, '').replaceAll(/[-_]+/g, ' ').trim() || 'Article image';
      const itemHtml = `<figure class="article-media-item article-media-image"><img src="${escapeHtml(String(payload.url))}" alt="${escapeHtml(name)}" /><figcaption>${escapeHtml(name)}</figcaption></figure>`;
      insertMediaItem(itemHtml);
      setNotice({ tone: 'info', message: 'Image inserted into the article.' });
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Image upload failed.' });
    } finally {
      setUploading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === 'b') {
      event.preventDefault();
      execute('bold');
    } else if (key === 'i') {
      event.preventDefault();
      execute('italic');
    } else if (key === 'u') {
      event.preventDefault();
      execute('underline');
    }
  }

  return (
    <div className="premium-editor-shell">
      <div className="premium-editor-topline">
        <div>
          <p className="text-sm font-semibold text-slate-800">Article content</p>
          <p className="mt-1 text-xs text-slate-500">Rich text, images, tables and rendered LaTeX can live in the same article.</p>
        </div>
        <span className="rounded-full bg-[#edf6ff] px-3 py-1.5 text-[11px] font-semibold text-[#527f8f]">Rich editor</span>
      </div>

      <div className="premium-editor-toolbar" role="toolbar" aria-label="Article formatting">
        <ToolButton label="Undo" onMouseDown={preventToolbarBlur} onClick={() => execute('undo')} disabled={disabled}><Undo2 className="h-4 w-4" /></ToolButton>
        <ToolButton label="Redo" onMouseDown={preventToolbarBlur} onClick={() => execute('redo')} disabled={disabled}><Redo2 className="h-4 w-4" /></ToolButton>
        <span className="premium-editor-divider" />
        <ToolButton label="Paragraph" onMouseDown={preventToolbarBlur} onClick={() => execute('formatBlock', 'p')} disabled={disabled}><Pilcrow className="h-4 w-4" /></ToolButton>
        <ToolButton label="Heading 2" onMouseDown={preventToolbarBlur} onClick={() => execute('formatBlock', 'h2')} disabled={disabled}><Heading2 className="h-4 w-4" /></ToolButton>
        <ToolButton label="Heading 3" onMouseDown={preventToolbarBlur} onClick={() => execute('formatBlock', 'h3')} disabled={disabled}><Heading3 className="h-4 w-4" /></ToolButton>
        <span className="premium-editor-divider" />
        <ToolButton label="Bold" onMouseDown={preventToolbarBlur} onClick={() => execute('bold')} disabled={disabled}><Bold className="h-4 w-4" /></ToolButton>
        <ToolButton label="Italic" onMouseDown={preventToolbarBlur} onClick={() => execute('italic')} disabled={disabled}><Italic className="h-4 w-4" /></ToolButton>
        <ToolButton label="Underline" onMouseDown={preventToolbarBlur} onClick={() => execute('underline')} disabled={disabled}><Underline className="h-4 w-4" /></ToolButton>
        <ToolButton label="Quote" onMouseDown={preventToolbarBlur} onClick={() => execute('formatBlock', 'blockquote')} disabled={disabled}><Quote className="h-4 w-4" /></ToolButton>
        <span className="premium-editor-divider" />
        <ToolButton label="Bulleted list" onMouseDown={preventToolbarBlur} onClick={() => execute('insertUnorderedList')} disabled={disabled}><List className="h-4 w-4" /></ToolButton>
        <ToolButton label="Numbered list" onMouseDown={preventToolbarBlur} onClick={() => execute('insertOrderedList')} disabled={disabled}><ListOrdered className="h-4 w-4" /></ToolButton>
        <ToolButton label="Insert link" onMouseDown={preventToolbarBlur} onClick={openLinkDialog} disabled={disabled}><Link2 className="h-4 w-4" /></ToolButton>
        <ToolButton label="Insert table" onMouseDown={preventToolbarBlur} onClick={openTableDialog} disabled={disabled}><Table2 className="h-4 w-4" /></ToolButton>
        <ToolButton label="Insert image" onMouseDown={preventToolbarBlur} onClick={() => imageInputRef.current?.click()} disabled={disabled || uploading}>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}</ToolButton>
        <ToolButton label="Insert LaTeX equation" onMouseDown={preventToolbarBlur} onClick={openEquationDialog} disabled={disabled}><Sigma className="h-4 w-4" /></ToolButton>
        <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={(event) => void uploadAndInsertImage(event)} />
      </div>

      <div
        ref={editorRef}
        className="premium-rich-editor"
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder="Start writing the article. Use the toolbar for structure, media and equations."
        onInput={() => { saveSelection(); syncContent(); }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onKeyDown={handleKeyDown}
        onFocus={saveSelection}
        onBlur={() => { syncContent(); if (editorRef.current) void typesetMath(editorRef.current); }}
      />

      <div className="premium-editor-footer">
        <span>Shortcuts: Ctrl/⌘ + B, I, U</span>
        <span>LaTeX is stored as source and rendered with MathJax.</span>
      </div>

      {notice ? (
        <div className={`premium-editor-notice ${notice.tone === 'error' ? 'is-error' : ''}`} role="status">
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message"><X className="h-3.5 w-3.5" /></button>
        </div>
      ) : null}

      {tableDialogOpen ? (
        <DialogShell title="Insert table" onClose={closeTableDialog} onKeyDown={(event) => {
          if (event.key === 'Escape') closeTableDialog();
          if (event.key === 'Enter') { event.preventDefault(); insertTable(); }
        }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Rows<input className="form-control mt-2" type="number" min="1" max="20" value={tableRows} onChange={(event) => setTableRows(event.target.value)} autoFocus /></label>
            <label className="text-sm font-semibold text-slate-700">Columns<input className="form-control mt-2" type="number" min="1" max="10" value={tableColumns} onChange={(event) => setTableColumns(event.target.value)} /></label>
          </div>
          <p className="text-xs leading-5 text-slate-500">The first row is created as the table heading. Tables remain horizontally scrollable on narrow screens.</p>
          <div className="flex justify-end gap-2"><button type="button" className="premium-secondary-button" onClick={closeTableDialog}>Cancel</button><button type="button" className="premium-primary-button" onClick={insertTable}><Table2 className="h-4 w-4" /> Insert table</button></div>
        </DialogShell>
      ) : null}

      {equationDialogOpen ? (
        <DialogShell title="Insert LaTeX equation" onClose={closeEquationDialog} wide onKeyDown={(event) => { if (event.key === 'Escape') closeEquationDialog(); }}>
          <label className="text-sm font-semibold text-slate-700">LaTeX source<textarea className="form-control mt-2 min-h-28 resize-y font-mono text-[13px] leading-6" value={equationSource} onChange={(event) => setEquationSource(event.target.value)} placeholder="\\frac{a}{b} = \\sqrt{x^2+y^2}" autoFocus spellCheck={false} /></label>
          <div className="equation-mode-switch" role="group" aria-label="Equation style"><button type="button" className={equationMode === 'inline' ? 'active' : ''} onClick={() => setEquationMode('inline')}>Inline</button><button type="button" className={equationMode === 'display' ? 'active' : ''} onClick={() => setEquationMode('display')}>Display</button></div>
          <div className="equation-preview-card"><span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Live preview</span><div ref={equationPreviewRef} className="equation-live-preview" /></div>
          <div className="latex-example-grid">
            <button type="button" onClick={() => setEquationSource('E = mc^2')}>E = mc²</button>
            <button type="button" onClick={() => setEquationSource('\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}')}>Quadratic formula</button>
            <button type="button" onClick={() => setEquationSource('\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}')}>Summation</button>
            <button type="button" onClick={() => setEquationSource('\\int_a^b f(x)\\,dx')}>Integral</button>
            <button type="button" onClick={() => setEquationSource('\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}')}>Matrix</button>
            <button type="button" onClick={() => setEquationSource('P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)}')}>Bayes theorem</button>
          </div>
          <div className="flex justify-end gap-2"><button type="button" className="premium-secondary-button" onClick={closeEquationDialog}>Cancel</button><button type="button" className="premium-primary-button" onClick={insertEquation}><Sigma className="h-4 w-4" /> Insert equation</button></div>
        </DialogShell>
      ) : null}

      {linkDialogOpen ? (
        <DialogShell title="Insert link" onClose={closeLinkDialog} onKeyDown={(event) => { if (event.key === 'Escape') closeLinkDialog(); }}>
          <label className="text-sm font-semibold text-slate-700">Link text<input className="form-control mt-2" value={linkText} onChange={(event) => setLinkText(event.target.value)} autoFocus /></label>
          <label className="text-sm font-semibold text-slate-700">URL<input className="form-control mt-2" type="url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://example.com" /></label>
          <div className="flex justify-end gap-2"><button type="button" className="premium-secondary-button" onClick={closeLinkDialog}>Cancel</button><button type="button" className="premium-primary-button" onClick={insertLink}><Link2 className="h-4 w-4" /> Insert link</button></div>
        </DialogShell>
      ) : null}
    </div>
  );
}

function findNearbyMediaGrid(editor: HTMLElement, range: Range): HTMLElement | null {
  const start = range.startContainer.nodeType === Node.ELEMENT_NODE
    ? (range.startContainer as HTMLElement)
    : range.startContainer.parentElement;
  if (!start || !editor.contains(start)) return null;

  let topLevel: HTMLElement = start;
  while (topLevel.parentElement && topLevel.parentElement !== editor) topLevel = topLevel.parentElement;
  if (topLevel.matches('.article-media-grid')) return topLevel;

  const visuallyEmpty = topLevel.matches('p, div')
    && (topLevel.textContent ?? '').replace(/[\s\u200B]/g, '').length === 0;
  if (visuallyEmpty) {
    const previous = topLevel.previousElementSibling;
    if (previous instanceof HTMLElement && previous.matches('.article-media-grid')) return previous;
  }
  return null;
}

function placeCaretAfterMediaGrid(editor: HTMLElement, grid: HTMLElement): void {
  let target = grid.nextElementSibling;
  if (!(target instanceof HTMLParagraphElement)) {
    target = document.createElement('p');
    target.append(document.createElement('br'));
    grid.after(target);
  }

  const range = document.createRange();
  range.selectNodeContents(target);
  range.collapse(false);
  const selection = window.getSelection();
  editor.focus();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function ToolButton({
  label,
  children,
  disabled,
  onClick,
  onMouseDown,
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return <button type="button" className="premium-editor-tool" title={label} aria-label={label} disabled={disabled} onMouseDown={onMouseDown} onClick={onClick}>{children}</button>;
}

function DialogShell({
  title,
  children,
  onClose,
  onKeyDown,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  wide?: boolean;
}) {
  return (
    <div className="premium-editor-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <div className={`premium-editor-dialog ${wide ? 'is-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onKeyDown={onKeyDown}>
        <div className="flex items-center justify-between gap-4 border-b border-[#dce7ee] px-5 py-4 sm:px-6"><h3 className="font-serif text-xl font-semibold text-slate-900">{title}</h3><button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500" onClick={onClose} aria-label="Close dialog"><X className="h-4 w-4" /></button></div>
        <div className="grid gap-5 p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
