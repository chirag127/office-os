/**
 * Office OS - Split PDF Tool
 * Extract pages from a PDF document
 */

import { splitPDF, splitPDFToPages, getPDFInfo } from '../../../services/pdf';
import { downloadFile, downloadAsZip, readFileAsArrayBuffer } from '../../../services/file';
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

export function renderSplitPDF(): string {
  selectedFile = null;
  pageCount = 0;

  setTimeout(() => initializeSplitPDF(), 0);

  return renderToolPage({
    title: 'Split PDF',
    description: 'Extract specific pages or split into individual files',
    toolContent: `
      ${renderFileUpload({
        id: 'pdf-upload',
        accept: '.pdf,application/pdf',
        multiple: false,
        title: 'Drop a PDF file here',
        hint: 'Upload a PDF to extract pages',
      })}

      <div id="split-options" class="split-options hidden">
        <div class="pdf-info">
          <span id="pdf-name">document.pdf</span>
          <span id="pdf-pages">0 pages</span>
        </div>

        <div class="split-mode">
          <label class="radio-option">
            <input type="radio" name="split-mode" value="range" checked>
            <span>Extract Page Range</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="split-mode" value="all">
            <span>Split All Pages</span>
          </label>
        </div>

        <div id="range-input" class="range-input">
          <label>
            Page Range (e.g., 1-3, 5, 7-10)
            <input type="text" id="page-range" class="input" placeholder="1-3, 5, 7-10">
          </label>
        </div>
      </div>

      ${renderActionButtons([
        { id: 'split-btn', label: 'Split PDF', icon: '✂️', primary: true, disabled: true },
      ])}

      <style>
        .split-options {
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
        #pdf-name {
          font-weight: 600;
        }
        #pdf-pages {
          color: var(--color-accent-primary);
        }
        .split-mode {
          display: flex;
          gap: var(--space-lg);
          margin-bottom: var(--space-lg);
        }
        .radio-option {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          cursor: pointer;
        }
        .range-input {
          margin-top: var(--space-md);
        }
        .range-input label {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }
        .hidden {
          display: none !important;
        }
      </style>
    `,
    seoContent: getSEOContent(),
  });
}

function initializeSplitPDF(): void {
  initFileUpload('pdf-upload', async (files) => {
    if (files.length > 0) {
      selectedFile = files[0];
      await analyzeFile();
    }
  });

  document.getElementById('split-btn')?.addEventListener('click', handleSplit);

  document.querySelectorAll('input[name="split-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const rangeInput = document.getElementById('range-input');
      if ((e.target as HTMLInputElement).value === 'range') {
        rangeInput?.classList.remove('hidden');
      } else {
        rangeInput?.classList.add('hidden');
      }
    });
  });
}

async function analyzeFile(): Promise<void> {
  if (!selectedFile) return;

  try {
    const buffer = await readFileAsArrayBuffer(selectedFile);
    const info = await getPDFInfo(buffer);
    pageCount = info.pageCount;

    document.getElementById('pdf-name')!.textContent = selectedFile.name;
    document.getElementById('pdf-pages')!.textContent = `${pageCount} pages`;
    document.getElementById('split-options')?.classList.remove('hidden');
    (document.getElementById('split-btn') as HTMLButtonElement).disabled = false;
  } catch (error) {
    showToast('Failed to read PDF file', 'error');
  }
}

function parsePageRange(rangeStr: string, maxPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i - 1); // Convert to 0-indexed
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

async function handleSplit(): Promise<void> {
  if (!selectedFile) return;

  const mode = (document.querySelector('input[name="split-mode"]:checked') as HTMLInputElement).value;
  showLoading('Splitting PDF...');

  try {
    const buffer = await readFileAsArrayBuffer(selectedFile);

    if (mode === 'all') {
      // Split into individual pages
      const pages = await splitPDFToPages(buffer);
      const baseName = selectedFile.name.replace('.pdf', '');

      const files = pages.map((pageData, index) => {
        // Convert Uint8Array to ArrayBuffer for Blob compatibility
        const arrayBuffer = new ArrayBuffer(pageData.length);
        new Uint8Array(arrayBuffer).set(pageData);
        return {
          name: `${baseName}_page_${index + 1}.pdf`,
          content: new Blob([arrayBuffer], { type: 'application/pdf' }),
        };
      });

      await downloadAsZip(files, `${baseName}_split.zip`);
      showToast(`Split into ${pages.length} files!`, 'success');
    } else {
      // Extract specific pages
      const rangeInput = document.getElementById('page-range') as HTMLInputElement;
      const pageIndices = parsePageRange(rangeInput.value, pageCount);

      if (pageIndices.length === 0) {
        showToast('Please enter valid page numbers', 'warning');
        hideLoading();
        return;
      }

      const extracted = await splitPDF(buffer, pageIndices);
      const baseName = selectedFile.name.replace('.pdf', '');
      // Convert Uint8Array to ArrayBuffer for Blob compatibility
      const arrayBuffer = new ArrayBuffer(extracted.length);
      new Uint8Array(arrayBuffer).set(extracted);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      downloadFile(blob, `${baseName}_extracted.pdf`);
      showToast(`Extracted ${pageIndices.length} pages!`, 'success');
    }
  } catch (error) {
    console.error('Split error:', error);
    showToast('Failed to split PDF', 'error');
  } finally {
    hideLoading();
  }
}

function getSEOContent(): string {
  return `
    <h2>How to Split PDF Files Online - Complete Guide</h2>

    <p>Splitting PDF documents is an essential skill for anyone who works with digital documents regularly. Whether you need to extract specific pages for a presentation, separate chapters from a book, or divide a large report into manageable sections, our free online PDF splitter provides a fast, secure, and private solution.</p>

    <h3>What is PDF Splitting?</h3>

    <p>PDF splitting refers to the process of dividing a PDF document into smaller parts. This can mean extracting individual pages, separating sections, or creating multiple files from a single source document. Unlike printing or copying, splitting maintains the full quality and formatting of the original PDF.</p>

    <h3>Common Use Cases for Splitting PDFs</h3>

    <ul>
      <li><strong>Extract Cover Pages:</strong> Remove title pages or covers for separate use or filing.</li>
      <li><strong>Share Specific Sections:</strong> Send only relevant pages to colleagues without sharing the entire document.</li>
      <li><strong>Reduce File Size:</strong> Large PDFs can be unwieldy; splitting makes files more manageable for email or upload.</li>
      <li><strong>Archive Organization:</strong> Divide documents by chapter, date, or category for better file management.</li>
      <li><strong>Remove Unwanted Pages:</strong> Eliminate blank pages, advertisements, or irrelevant content from documents.</li>
    </ul>

    <h3>How to Use Our PDF Splitter</h3>

    <p>Our tool offers two splitting modes to accommodate different needs:</p>

    <h4>Extract Page Range</h4>
    <p>Use this mode when you know exactly which pages you need. Enter page numbers in the format:</p>
    <ul>
      <li><strong>Single pages:</strong> 1, 5, 12</li>
      <li><strong>Page ranges:</strong> 1-5, 10-15</li>
      <li><strong>Combined:</strong> 1-3, 5, 7-10, 15</li>
    </ul>

    <h4>Split All Pages</h4>
    <p>This mode creates a separate PDF file for each page in your document. The resulting files are automatically bundled into a ZIP archive for easy download.</p>

    <h3>Privacy and Browser-Based Processing</h3>

    <p>All PDF processing happens entirely in your web browser. Your documents are never uploaded to any server, ensuring complete privacy and security. This approach is particularly important for sensitive documents like financial records, legal papers, or confidential business materials.</p>

    <h3>Tips for Efficient PDF Splitting</h3>

    <ul>
      <li><strong>Preview First:</strong> Open your PDF in a viewer to identify exact page numbers before splitting.</li>
      <li><strong>Use Page Ranges:</strong> Ranges like "1-10" are faster to type than listing individual pages.</li>
      <li><strong>Check Results:</strong> Always verify extracted pages contain all the content you need.</li>
      <li><strong>Batch Processing:</strong> For very large documents, consider splitting in stages for better performance.</li>
    </ul>

    <h3>Frequently Asked Questions</h3>

    <p><strong>Can I split password-protected PDFs?</strong><br>
    You'll need to unlock the PDF first using our Unlock PDF tool, then proceed with splitting.</p>

    <p><strong>What happens to links and bookmarks?</strong><br>
    Internal links may break if their target pages are not included in the split. Bookmarks pointing to included pages are preserved.</p>

    <p><strong>Is there a page limit?</strong><br>
    There's no strict limit, but very large documents (1000+ pages) may process more slowly depending on your device.</p>

    <p><strong>Can I split a PDF into chapters?</strong><br>
    Yes, if your PDF has bookmarks, use them to identify chapter boundaries, then use the page range feature to extract each chapter.</p>

    <h3>Related Tools</h3>

    <p>After splitting your PDF, you might find these tools helpful:</p>
    <ul>
      <li><strong>Merge PDF:</strong> Combine split sections back together or with other documents.</li>
      <li><strong>Rotate PDF:</strong> Fix page orientation in extracted pages.</li>
      <li><strong>Compress PDF:</strong> Reduce file size of extracted sections for easier sharing.</li>
    </ul>
  `;
}
