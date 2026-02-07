/**
 * Office OS - Remove PDF Pages Tool
 * Remove specific pages from a PDF document
 */

import { splitPDF, getPDFInfo } from '../../../services/pdf';
import { downloadFile, readFileAsArrayBuffer } from '../../../services/file';
import {
  renderToolPage,
  renderFileUpload,
  renderActionButtons,
  initFileUpload,
  showToast,
  showLoading,
  hideLoading
} from '../../../components/shared';

let selectedFile: File | null = null;
let pageCount = 0;

export function renderRemovePages(): string {
  selectedFile = null;
  pageCount = 0;

  setTimeout(() => initializeRemovePages(), 0);

  return renderToolPage({
    title: 'Remove PDF Pages',
    description: 'Delete specific pages from your PDF document',
    toolContent: `
      ${renderFileUpload({
        id: 'pdf-upload',
        accept: '.pdf,application/pdf',
        multiple: false,
        title: 'Drop a PDF file here',
        hint: 'Upload a PDF to remove pages',
      })}

      <div id="remove-options" class="options-panel hidden">
        <div class="pdf-info">
          <span id="pdf-name">document.pdf</span>
          <span id="pdf-pages">0 pages</span>
        </div>

        <div class="input-group">
          <label>
            Pages to Remove (e.g., 1, 3, 5-7)
            <input type="text" id="pages-to-remove" class="input" placeholder="1, 3, 5-7">
          </label>
          <p class="hint">Enter page numbers separated by commas. Use ranges like 5-7 for consecutive pages.</p>
        </div>
      </div>

      ${renderActionButtons([
        { id: 'remove-btn', label: 'Remove Pages', icon: '🗑️', primary: true, disabled: true },
      ])}

      <style>
        .options-panel {
          margin: var(--space-xl) 0;
          padding: var(--space-lg);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
        }
        .pdf-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-md);
          border-bottom: 1px solid var(--glass-border);
        }
        #pdf-name { font-weight: 600; }
        #pdf-pages { color: var(--color-accent-primary); }
        .input-group { margin-top: var(--space-md); }
        .input-group label {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }
        .hint {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
          margin-top: var(--space-xs);
        }
        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>Remove Pages from PDF Online</h2>
      <p>Quickly delete unwanted pages from your PDF documents. Upload your file, specify which pages to remove, and download the result. All processing happens in your browser for complete privacy.</p>
      <h3>How to Remove PDF Pages</h3>
      <ol>
        <li>Upload your PDF file</li>
        <li>Enter the page numbers you want to remove</li>
        <li>Click "Remove Pages" to process</li>
        <li>Download your modified PDF</li>
      </ol>
    `,
  });
}

function initializeRemovePages(): void {
  initFileUpload('pdf-upload', async (files) => {
    if (files.length > 0) {
      selectedFile = files[0];
      await analyzeFile();
    }
  });

  document.getElementById('remove-btn')?.addEventListener('click', handleRemove);
}

async function analyzeFile(): Promise<void> {
  if (!selectedFile) return;

  try {
    const buffer = await readFileAsArrayBuffer(selectedFile);
    const info = await getPDFInfo(buffer);
    pageCount = info.pageCount;

    document.getElementById('pdf-name')!.textContent = selectedFile.name;
    document.getElementById('pdf-pages')!.textContent = `${pageCount} pages`;
    document.getElementById('remove-options')?.classList.remove('hidden');
    (document.getElementById('remove-btn') as HTMLButtonElement).disabled = false;
  } catch (error) {
    showToast('Failed to read PDF file', 'error');
  }
}

function parsePageNumbers(input: string, maxPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = input.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i - 1);
        }
      }
    } else {
      const pageNum = parseInt(trimmed);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        pages.add(pageNum - 1);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

async function handleRemove(): Promise<void> {
  if (!selectedFile) return;

  const input = document.getElementById('pages-to-remove') as HTMLInputElement;
  const pagesToRemove = parsePageNumbers(input.value, pageCount);

  if (pagesToRemove.length === 0) {
    showToast('Please enter valid page numbers to remove', 'warning');
    return;
  }

  if (pagesToRemove.length >= pageCount) {
    showToast('Cannot remove all pages from PDF', 'error');
    return;
  }

  showLoading('Removing pages...');

  try {
    const buffer = await readFileAsArrayBuffer(selectedFile);

    // Get pages to KEEP (inverse of pages to remove)
    const pagesToKeep: number[] = [];
    for (let i = 0; i < pageCount; i++) {
      if (!pagesToRemove.includes(i)) {
        pagesToKeep.push(i);
      }
    }

    const result = await splitPDF(buffer, pagesToKeep);
    const baseName = selectedFile.name.replace('.pdf', '');
    const arrayBuffer = new ArrayBuffer(result.length);
    new Uint8Array(arrayBuffer).set(result);
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    downloadFile(blob, `${baseName}_modified.pdf`);
    showToast(`Removed ${pagesToRemove.length} pages!`, 'success');
  } catch (error) {
    console.error('Remove error:', error);
    showToast('Failed to remove pages', 'error');
  } finally {
    hideLoading();
  }
}
