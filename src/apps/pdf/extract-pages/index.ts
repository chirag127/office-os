/**
 * Office OS - Extract PDF Pages Tool
 * Extract specific pages to a new PDF document
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

export function renderExtractPages(): string {
  selectedFile = null;
  pageCount = 0;

  setTimeout(() => initializeExtractPages(), 0);

  return renderToolPage({
    title: 'Extract PDF Pages',
    description: 'Extract specific pages to create a new PDF',
    toolContent: `
      ${renderFileUpload({
        id: 'pdf-upload',
        accept: '.pdf,application/pdf',
        multiple: false,
        title: 'Drop a PDF file here',
        hint: 'Upload a PDF to extract pages',
      })}

      <div id="extract-options" class="options-panel hidden">
        <div class="pdf-info">
          <span id="pdf-name">document.pdf</span>
          <span id="pdf-pages">0 pages</span>
        </div>

        <div class="input-group">
          <label>
            Pages to Extract (e.g., 1-3, 5, 8-10)
            <input type="text" id="pages-to-extract" class="input" placeholder="1-3, 5, 8-10">
          </label>
          <p class="hint">Enter page numbers to include in the new PDF. Use ranges like 1-3 for consecutive pages.</p>
        </div>
      </div>

      ${renderActionButtons([
        { id: 'extract-btn', label: 'Extract Pages', icon: '📄', primary: true, disabled: true },
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
      <h2>Extract PDF Pages Online</h2>
      <p>Create a new PDF containing only the pages you need. Perfect for extracting chapters, specific sections, or individual pages from large documents.</p>
      <h3>How to Extract PDF Pages</h3>
      <ol>
        <li>Upload your PDF file</li>
        <li>Enter the page numbers you want to extract</li>
        <li>Click "Extract Pages" to create new PDF</li>
        <li>Download your extracted pages</li>
      </ol>
    `,
  });
}

function initializeExtractPages(): void {
  initFileUpload('pdf-upload', async (files) => {
    if (files.length > 0) {
      selectedFile = files[0];
      await analyzeFile();
    }
  });

  document.getElementById('extract-btn')?.addEventListener('click', handleExtract);
}

async function analyzeFile(): Promise<void> {
  if (!selectedFile) return;

  try {
    const buffer = await readFileAsArrayBuffer(selectedFile);
    const info = await getPDFInfo(buffer);
    pageCount = info.pageCount;

    document.getElementById('pdf-name')!.textContent = selectedFile.name;
    document.getElementById('pdf-pages')!.textContent = `${pageCount} pages`;
    document.getElementById('extract-options')?.classList.remove('hidden');
    (document.getElementById('extract-btn') as HTMLButtonElement).disabled = false;
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

async function handleExtract(): Promise<void> {
  if (!selectedFile) return;

  const input = document.getElementById('pages-to-extract') as HTMLInputElement;
  const pagesToExtract = parsePageNumbers(input.value, pageCount);

  if (pagesToExtract.length === 0) {
    showToast('Please enter valid page numbers to extract', 'warning');
    return;
  }

  showLoading('Extracting pages...');

  try {
    const buffer = await readFileAsArrayBuffer(selectedFile);
    const result = await splitPDF(buffer, pagesToExtract);
    const baseName = selectedFile.name.replace('.pdf', '');
    const arrayBuffer = new ArrayBuffer(result.length);
    new Uint8Array(arrayBuffer).set(result);
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    downloadFile(blob, `${baseName}_extracted.pdf`);
    showToast(`Extracted ${pagesToExtract.length} pages!`, 'success');
  } catch (error) {
    console.error('Extract error:', error);
    showToast('Failed to extract pages', 'error');
  } finally {
    hideLoading();
  }
}
