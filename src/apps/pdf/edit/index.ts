/**
 * Office OS - Edit PDF Tool
 * Basic PDF editor - add text, annotations, and images
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
let pdfDoc: PDFDocument | null = null;
let annotations: Array<{ type: string; page: number; x: number; y: number; text?: string; color?: string }> = [];

export function renderEditPDF(): string {
  selectedFile = null;
  pdfDoc = null;
  annotations = [];

  setTimeout(() => initializeEditPDF(), 0);

  return renderToolPage({
    title: 'Edit PDF',
    description: 'Add text, annotations, and basic edits to your PDF',
    toolContent: `
      ${renderFileUpload({
        id: 'pdf-upload',
        accept: '.pdf,application/pdf',
        multiple: false,
        title: 'Drop a PDF file here',
        hint: 'Upload a PDF to edit',
      })}

      <div id="edit-options" class="options-panel hidden">
        <div class="pdf-info">
          <span id="pdf-name">document.pdf</span>
          <span id="pdf-pages">0 pages</span>
        </div>

        <div class="edit-tools">
          <h3>Add Text Annotation</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-page">Page Number</label>
              <input type="number" id="edit-page" class="input" value="1" min="1">
            </div>
            <div class="form-group">
              <label for="text-color">Color</label>
              <select id="text-color" class="input">
                <option value="black">Black</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="text-x">X Position</label>
              <input type="number" id="text-x" class="input" value="50" min="0">
            </div>
            <div class="form-group">
              <label for="text-y">Y Position</label>
              <input type="number" id="text-y" class="input" value="700" min="0">
            </div>
            <div class="form-group">
              <label for="text-size">Font Size</label>
              <input type="number" id="text-size" class="input" value="12" min="6" max="72">
            </div>
          </div>

          <div class="form-group full-width">
            <label for="edit-text">Text to Add</label>
            <textarea id="edit-text" class="input textarea" rows="2" placeholder="Enter text to add to the PDF"></textarea>
          </div>

          <button id="add-text-btn" class="btn btn-secondary">Add Text</button>

          <div id="annotations-list" class="annotations-list"></div>
        </div>
      </div>

      ${renderActionButtons([
        { id: 'save-btn', label: 'Save PDF', icon: '💾', primary: true, disabled: true },
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
        .edit-tools h3 {
          font-size: var(--font-size-md);
          margin-bottom: var(--space-md);
        }
        .form-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        .form-group label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
        .textarea {
          resize: vertical;
          min-height: 60px;
        }
        #add-text-btn {
          margin-top: var(--space-md);
        }
        .annotations-list {
          margin-top: var(--space-lg);
        }
        .annotation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-sm);
          background: var(--color-surface);
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-xs);
        }
        .hidden { display: none !important; }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }
      </style>
    `,
    seoContent: `
      <h2>Edit PDF Online</h2>
      <p>Add text annotations, notes, and basic edits to your PDF documents. Perfect for adding comments, filling in forms, or making quick corrections.</p>
      <h3>How to Edit PDF</h3>
      <ol>
        <li>Upload your PDF file</li>
        <li>Add text annotations with position and styling</li>
        <li>Click "Save PDF" to download your edited document</li>
      </ol>
    `,
  });
}

function initializeEditPDF(): void {
  initFileUpload('pdf-upload', async (files) => {
    if (files.length > 0) {
      selectedFile = files[0];
      await loadPDF();
    }
  });

  document.getElementById('add-text-btn')?.addEventListener('click', addTextAnnotation);
  document.getElementById('save-btn')?.addEventListener('click', handleSave);
}

async function loadPDF(): Promise<void> {
  if (!selectedFile) return;

  try {
    const buffer = await readFileAsArrayBuffer(selectedFile);
    pdfDoc = await PDFDocument.load(buffer);
    const pageCount = pdfDoc.getPageCount();

    document.getElementById('pdf-name')!.textContent = selectedFile.name;
    document.getElementById('pdf-pages')!.textContent = `${pageCount} pages`;
    document.getElementById('edit-options')?.classList.remove('hidden');
    (document.getElementById('save-btn') as HTMLButtonElement).disabled = false;

    // Set max page number
    (document.getElementById('edit-page') as HTMLInputElement).max = String(pageCount);
  } catch (error) {
    showToast('Failed to load PDF', 'error');
  }
}

function addTextAnnotation(): void {
  const page = parseInt((document.getElementById('edit-page') as HTMLInputElement).value);
  const x = parseInt((document.getElementById('text-x') as HTMLInputElement).value);
  const y = parseInt((document.getElementById('text-y') as HTMLInputElement).value);
  const text = (document.getElementById('edit-text') as HTMLTextAreaElement).value;
  const color = (document.getElementById('text-color') as HTMLSelectElement).value;

  if (!text.trim()) {
    showToast('Please enter some text', 'warning');
    return;
  }

  annotations.push({ type: 'text', page, x, y, text, color });
  updateAnnotationsList();
  (document.getElementById('edit-text') as HTMLTextAreaElement).value = '';
  showToast('Text annotation added', 'success');
}

function updateAnnotationsList(): void {
  const list = document.getElementById('annotations-list')!;
  list.innerHTML = annotations.length > 0
    ? `<h4>Annotations (${annotations.length})</h4>` + annotations.map((a, i) => `
        <div class="annotation-item">
          <span>Page ${a.page}: "${a.text?.substring(0, 30)}${(a.text?.length || 0) > 30 ? '...' : ''}"</span>
          <button class="btn btn-icon" onclick="window.removeAnnotation(${i})">✕</button>
        </div>
      `).join('')
    : '';

  // Expose remove function globally
  (window as any).removeAnnotation = (index: number) => {
    annotations.splice(index, 1);
    updateAnnotationsList();
  };
}

function getColorRGB(colorName: string): [number, number, number] {
  const colors: Record<string, [number, number, number]> = {
    black: [0, 0, 0],
    red: [1, 0, 0],
    blue: [0, 0, 1],
    green: [0, 0.5, 0],
  };
  return colors[colorName] || colors.black;
}

async function handleSave(): Promise<void> {
  if (!pdfDoc || !selectedFile) return;

  showLoading('Saving PDF...');

  try {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = parseInt((document.getElementById('text-size') as HTMLInputElement).value) || 12;

    for (const annotation of annotations) {
      if (annotation.type === 'text' && annotation.text) {
        const pageIndex = annotation.page - 1;
        if (pageIndex >= 0 && pageIndex < pdfDoc.getPageCount()) {
          const page = pdfDoc.getPage(pageIndex);
          const [r, g, b] = getColorRGB(annotation.color || 'black');

          page.drawText(annotation.text, {
            x: annotation.x,
            y: annotation.y,
            size: fontSize,
            font,
            color: rgb(r, g, b),
          });
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    const baseName = selectedFile.name.replace('.pdf', '');
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    downloadFile(blob, `${baseName}_edited.pdf`);
    showToast('PDF saved successfully!', 'success');
  } catch (error) {
    console.error('Save error:', error);
    showToast('Failed to save PDF', 'error');
  } finally {
    hideLoading();
  }
}
