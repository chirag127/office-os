/**
 * Office OS - Organize PDF Tool
 * Reorder, Rotate, Delete pages
 */
import { PDFDocument, degrees } from 'pdf-lib';
import { readFileAsArrayBuffer, downloadFile } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;
let pdfDoc: PDFDocument | null = null;
let pageOrder: number[] = [];
let pageRotations: number[] = []; // Store rotation for each page (0, 90, 180, 270)

export function renderOrganizePDF(): string {
  selectedFile = null;
  pdfDoc = null;
  pageOrder = [];
  pageRotations = [];

  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Organize PDF',
    description: 'Rearrange, rotate, or remove pages',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Drop PDF to organize' })}

      <div id="workspace" class="workspace hidden">
        <div class="toolbar">
           <button class="btn btn-sm" id="reset-btn">Undo All</button>
           <span class="info-text">Drag to reorder • Click icons to edit</span>
        </div>
        <div id="pages-grid" class="pages-grid"></div>
      </div>

      ${renderActionButtons([{ id: 'save-btn', label: 'Save Organized PDF', icon: '💾', primary: true, disabled: true }])}

      <style>
        .workspace { margin: var(--space-xl) 0; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); }
        .info-text { color: var(--color-text-secondary); font-size: 0.9rem; }

        .pages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--glass-bg);
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border);
          min-height: 200px;
        }

        .page-card {
          position: relative;
          background: white;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: grab;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .page-card:active { cursor: grabbing; transform: scale(1.02); }
        .page-card.dragging { opacity: 0.5; border: 2px dashed var(--color-accent-primary); }

        .page-preview {
          height: 180px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          overflow: hidden;
        }

        .page-actions {
          display: flex;
          justify-content: center;
          gap: var(--space-sm);
          padding: 5px;
          background: #f9f9f9;
          border-top: 1px solid #eee;
        }
        .action-icon {
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          font-size: 1.2rem;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .action-icon:hover { opacity: 1; background: rgba(0,0,0,0.05); }
        .delete-icon:hover { color: var(--color-error); }

        .page-number {
          position: absolute;
          top: 5px;
          left: 5px;
          background: rgba(0,0,0,0.5);
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.75rem;
          pointer-events: none;
        }

        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>Organize PDF Pages Online</h2>
      <p>Rearrange, rotate, and delete PDF pages easily with our drag-and-drop tool.</p>
    `
  });
}

function init(): void {
  initFileUpload('pdf-upload', async (files) => {
    if (files[0]) {
      selectedFile = files[0];
      await loadPDF(selectedFile);
    }
  });

  document.getElementById('save-btn')?.addEventListener('click', savePDF);
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if(selectedFile) loadPDF(selectedFile);
  });
}

async function loadPDF(file: File): Promise<void> {
  showLoading('Loading PDF...');
  try {
    const buffer = await readFileAsArrayBuffer(file);
    pdfDoc = await PDFDocument.load(buffer);

    const pageCount = pdfDoc.getPageCount();
    pageOrder = Array.from({ length: pageCount }, (_, i) => i);
    pageRotations = new Array(pageCount).fill(0);

    await renderGrid();

    document.getElementById('workspace')?.classList.remove('hidden');
    (document.getElementById('save-btn') as HTMLButtonElement).disabled = false;
  } catch (e) {
    showToast('Failed to load PDF', 'error');
  } finally {
    hideLoading();
  }
}

async function renderGrid(): Promise<void> {
  const grid = document.getElementById('pages-grid');
  if(!grid) return;
  grid.innerHTML = '';

  pageOrder.forEach((originalIndex, displayIndex) => {
    const card = document.createElement('div');
    card.className = 'page-card';
    card.draggable = true;
    card.dataset.index = displayIndex.toString();

    const rotation = pageRotations[originalIndex];

    card.innerHTML = `
      <div class="page-number">${originalIndex + 1}</div>
      <div class="page-preview">
        <div style="font-size: 3rem; color: #ccc; transform: rotate(${rotation}deg);">📄</div>
      </div>
      <div class="page-actions">
        <span class="action-icon" onclick="window.rotatePage(${displayIndex}, -90)">↺</span>
        <span class="action-icon" onclick="window.rotatePage(${displayIndex}, 90)">↻</span>
        <span class="action-icon delete-icon" onclick="window.deletePage(${displayIndex})">🗑️</span>
      </div>
    `;

    addDragListeners(card);
    grid.appendChild(card);
  });

  (window as any).rotatePage = (displayIndex: number, deg: number) => {
    const originalIndex = pageOrder[displayIndex];
    pageRotations[originalIndex] = (pageRotations[originalIndex] + deg) % 360;
    renderGrid();
  };

  (window as any).deletePage = (displayIndex: number) => {
    pageOrder.splice(displayIndex, 1);
    renderGrid();
  };
}

function addDragListeners(item: HTMLElement) {
    item.addEventListener('dragstart', (e) => {
        item.classList.add('dragging');
        e.dataTransfer?.setData('text/plain', item.dataset.index!);
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
    });

    item.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    item.addEventListener('drop', (e) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer?.getData('text/plain')!);
        const toIndex = parseInt(item.dataset.index!);

        if (fromIndex !== toIndex) {
            const movedItem = pageOrder.splice(fromIndex, 1)[0];
            pageOrder.splice(toIndex, 0, movedItem);
            renderGrid();
        }
    });
}

async function savePDF(): Promise<void> {
    if (!pdfDoc || !selectedFile) return;
    showLoading('Saving organized PDF...');

    try {
        const newPdf = await PDFDocument.create();

        const copiedPages = await newPdf.copyPages(pdfDoc, pageOrder);

        copiedPages.forEach((page, i) => {
            const originalIndex = pageOrder[i];
            const rotation = pageRotations[originalIndex];
            page.setRotation(degrees(page.getRotation().angle + rotation));
            newPdf.addPage(page);
        });

        const pdfBytes = await newPdf.save();
        const baseName = selectedFile.name.replace('.pdf', '');
        const buffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);
        downloadFile(new Blob([buffer as ArrayBuffer], { type: 'application/pdf' }), `${baseName}_organized.pdf`);
        showToast('PDF Saved!', 'success');
    } catch (e) {
        console.error(e);
        showToast('Failed to save PDF', 'error');
    } finally {
        hideLoading();
    }
}
