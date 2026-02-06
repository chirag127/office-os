/**
 * Office OS - Merge PDF Tool
 * Combine multiple PDF files into one document
 */

import { mergePDFs } from '../../../services/pdf';
import { downloadFile, formatFileSize, readFileAsArrayBuffer } from '../../../services/file';
import {
  renderToolPage,
  renderFileUpload,
  renderActionButtons,
  initFileUpload,
  showToast,
  showLoading,
  hideLoading
} from '../../../components/shared';

let selectedFiles: File[] = [];

export function renderMergePDF(): string {
  // Reset state
  selectedFiles = [];

  setTimeout(() => initializeMergePDF(), 0);

  return renderToolPage({
    title: 'Merge PDF Files',
    description: 'Combine multiple PDF documents into a single file. Drag to reorder.',
    toolContent: `
      ${renderFileUpload({
        id: 'pdf-upload',
        accept: '.pdf,application/pdf',
        multiple: true,
        maxSize: '100MB',
        title: 'Drop PDF files here or click to upload',
        hint: 'Select multiple PDF files to merge',
      })}

      <div id="file-list-container"></div>

      ${renderActionButtons([
        { id: 'merge-btn', label: 'Merge PDFs', icon: '📑', primary: true, disabled: true },
        { id: 'clear-btn', label: 'Clear All', icon: '🗑️' },
      ])}
    `,
    seoContent: getSEOContent(),
  });
}

function initializeMergePDF(): void {
  // Initialize file upload
  initFileUpload('pdf-upload', (files) => {
    addFiles(Array.from(files));
  });

  // Merge button
  document.getElementById('merge-btn')?.addEventListener('click', handleMerge);

  // Clear button
  document.getElementById('clear-btn')?.addEventListener('click', () => {
    selectedFiles = [];
    updateFileList();
  });
}

function addFiles(files: File[]): void {
  const pdfFiles = files.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));

  if (pdfFiles.length !== files.length) {
    showToast('Some files were skipped (not PDF format)', 'warning');
  }

  selectedFiles = [...selectedFiles, ...pdfFiles];
  updateFileList();
}

function updateFileList(): void {
  const container = document.getElementById('file-list-container');
  const mergeBtn = document.getElementById('merge-btn') as HTMLButtonElement;

  if (!container) return;

  if (selectedFiles.length === 0) {
    container.innerHTML = '';
    if (mergeBtn) mergeBtn.disabled = true;
    return;
  }

  if (mergeBtn) mergeBtn.disabled = false;

  container.innerHTML = `
    <div class="file-list sortable-list" id="sortable-files">
      ${selectedFiles.map((file, index) => `
        <div class="file-item" data-index="${index}" draggable="true">
          <div class="file-drag-handle">⋮⋮</div>
          <div class="file-info">
            <span class="file-icon">📄</span>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
          </div>
          <button class="btn btn-icon file-remove" data-index="${index}" aria-label="Remove file">
            ✕
          </button>
        </div>
      `).join('')}
    </div>
    <p class="file-hint">Drag files to reorder before merging</p>
    <style>
      .sortable-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        margin: var(--space-lg) 0;
      }
      .file-item {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md);
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        cursor: grab;
        transition: all var(--transition-fast);
      }
      .file-item:active {
        cursor: grabbing;
      }
      .file-item.dragging {
        opacity: 0.5;
        border-color: var(--color-accent-primary);
      }
      .file-drag-handle {
        color: var(--color-text-tertiary);
        font-size: 1.2em;
        cursor: grab;
      }
      .file-info {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex: 1;
        min-width: 0;
      }
      .file-name {
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .file-size {
        color: var(--color-text-tertiary);
        font-size: var(--font-size-sm);
      }
      .file-remove {
        opacity: 0.5;
      }
      .file-remove:hover {
        opacity: 1;
        color: var(--color-error);
      }
      .file-hint {
        font-size: var(--font-size-sm);
        color: var(--color-text-tertiary);
        text-align: center;
      }
    </style>
  `;

  // Add remove handlers
  container.querySelectorAll('.file-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt((btn as HTMLElement).dataset.index || '0');
      selectedFiles.splice(index, 1);
      updateFileList();
    });
  });

  // Simple drag and drop reordering
  const list = document.getElementById('sortable-files');
  if (list) {
    let draggedIndex: number | null = null;

    list.querySelectorAll('.file-item').forEach((item, index) => {
      item.addEventListener('dragstart', () => {
        draggedIndex = index;
        (item as HTMLElement).classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        (item as HTMLElement).classList.remove('dragging');
        draggedIndex = null;
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
          const draggedFile = selectedFiles[draggedIndex];
          selectedFiles.splice(draggedIndex, 1);
          selectedFiles.splice(index, 0, draggedFile);
          updateFileList();
        }
      });
    });
  }
}

async function handleMerge(): Promise<void> {
  if (selectedFiles.length < 2) {
    showToast('Please select at least 2 PDF files to merge', 'warning');
    return;
  }

  showLoading('Merging PDF files...');

  try {
    // Read all files as ArrayBuffer
    const buffers: ArrayBuffer[] = [];
    for (const file of selectedFiles) {
      const buffer = await readFileAsArrayBuffer(file);
      buffers.push(buffer);
    }

    // Merge PDFs
    const mergedPdf = await mergePDFs(buffers);

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `merged-${timestamp}.pdf`;

    // Convert Uint8Array to ArrayBuffer for Blob compatibility
    const arrayBuffer = new ArrayBuffer(mergedPdf.length);
    new Uint8Array(arrayBuffer).set(mergedPdf);

    // Download
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    downloadFile(blob, filename);

    showToast('PDFs merged successfully!', 'success');
  } catch (error) {
    console.error('Merge error:', error);
    showToast('Failed to merge PDFs. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

function getSEOContent(): string {
  return `
    <h2>How to Merge PDF Files Online - Complete Guide</h2>

    <p>Merging PDF files is one of the most common document management tasks in both personal and professional settings. Whether you're combining reports, consolidating invoices, or creating comprehensive documentation from multiple sources, our free online PDF merger makes the process simple, fast, and completely private. This guide will walk you through everything you need to know about combining PDF documents effectively.</p>

    <h3>Why Merge PDF Files?</h3>

    <p>There are numerous situations where combining multiple PDF documents into a single file becomes essential:</p>

    <ul>
      <li><strong>Business Documentation:</strong> Combine contracts, proposals, and supporting documents into a single professional package for clients or stakeholders.</li>
      <li><strong>Academic Work:</strong> Merge research papers, citations, appendices, and cover pages into a complete thesis or dissertation.</li>
      <li><strong>Legal Proceedings:</strong> Consolidate evidence, statements, and case files into organized legal bundles.</li>
      <li><strong>Financial Records:</strong> Combine monthly statements, receipts, and invoices for tax preparation or auditing purposes.</li>
      <li><strong>Project Management:</strong> Create comprehensive project documentation by merging status reports, meeting notes, and deliverables.</li>
    </ul>

    <h3>Step-by-Step Guide to Merging PDFs</h3>

    <p>Using our online PDF merger is straightforward and requires no technical expertise:</p>

    <ol>
      <li><strong>Upload Your Files:</strong> Click the upload area or drag and drop your PDF files directly onto the page. You can select multiple files at once from your file browser.</li>
      <li><strong>Arrange the Order:</strong> Your files appear in a list that you can easily reorder by dragging and dropping. The final merged document will follow this sequence from top to bottom.</li>
      <li><strong>Click Merge:</strong> Once satisfied with the arrangement, click the "Merge PDFs" button. Our tool processes everything locally in your browser.</li>
      <li><strong>Download:</strong> Your merged PDF is automatically prepared for download. The resulting file maintains all the formatting, images, and text quality of the original documents.</li>
    </ol>

    <h3>Privacy and Security Advantages</h3>

    <p>Unlike most online PDF tools that upload your files to external servers, Office OS processes all documents entirely within your web browser. This approach offers significant advantages:</p>

    <ul>
      <li><strong>Complete Privacy:</strong> Your files never leave your device. No data is transmitted to any server, ensuring your sensitive documents remain confidential.</li>
      <li><strong>No Storage Concerns:</strong> Since we don't upload files, there's no risk of your documents being stored, cached, or accessed by unauthorized parties.</li>
      <li><strong>GDPR Compliance:</strong> Our local processing model inherently complies with data protection regulations since no personal data is collected or processed remotely.</li>
      <li><strong>Works Offline:</strong> Once the page loads, you can merge PDFs even without an internet connection (refresh may be required initially).</li>
    </ul>

    <h3>Supported PDF Features</h3>

    <p>Our PDF merger preserves all important document elements:</p>

    <ul>
      <li>Text content and formatting</li>
      <li>Embedded images and graphics</li>
      <li>Hyperlinks and internal references</li>
      <li>Bookmarks and table of contents</li>
      <li>Form fields (though some interactive elements may vary)</li>
      <li>Page orientations (portrait and landscape mix)</li>
      <li>Different page sizes within the same document</li>
    </ul>

    <h3>Tips for Best Results</h3>

    <p>To ensure optimal merging results, consider these recommendations:</p>

    <ul>
      <li><strong>Check File Compatibility:</strong> Ensure all your PDFs are not password-protected before merging. If they are, use our Unlock PDF tool first.</li>
      <li><strong>Organize Before Uploading:</strong> Plan your document order beforehand to minimize rearrangement after upload.</li>
      <li><strong>Preview Original Files:</strong> Verify that each source PDF is complete and displays correctly before combining them.</li>
      <li><strong>Consider File Size:</strong> Very large combined files may take longer to process. For best performance, try merging in batches if dealing with many large documents.</li>
    </ul>

    <h3>Frequently Asked Questions</h3>

    <p><strong>Is there a limit to how many PDFs I can merge?</strong><br>
    There's no strict file count limit. However, browser memory constraints may affect performance with very large numbers of files or extremely large documents. For typical use cases (up to 50 files or 200MB total), performance is excellent.</p>

    <p><strong>Will merging affect the quality of my documents?</strong><br>
    No, our tool preserves the original quality. We don't recompress images or alter document content during the merge process.</p>

    <p><strong>Can I merge PDFs with different page sizes?</strong><br>
    Yes, documents with varying page dimensions (letter, A4, legal, custom sizes) can be merged. Each page retains its original size in the combined document.</p>

    <p><strong>Do I need to create an account?</strong><br>
    No account is required. All our tools are free to use without registration or login.</p>

    <h3>Alternative PDF Operations</h3>

    <p>After merging your PDFs, you might want to explore other document operations available in Office OS:</p>

    <ul>
      <li><strong>Split PDF:</strong> Extract specific pages or divide a document into separate files.</li>
      <li><strong>Compress PDF:</strong> Reduce file size while maintaining quality for easier sharing.</li>
      <li><strong>Add Watermark:</strong> Protect your merged document with text or image watermarks.</li>
      <li><strong>Rotate Pages:</strong> Fix orientation issues in your combined document.</li>
      <li><strong>Sign PDF:</strong> Add your signature to the finished document for official use.</li>
    </ul>

    <p>Our comprehensive suite of PDF tools ensures you have everything needed for complete document management, all while maintaining the highest standards of privacy and security.</p>
  `;
}
