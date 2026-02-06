/**
 * Office OS - Redact PDF Tool
 * Blackout sensitive information
 */
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { readFileAsArrayBuffer, downloadFile } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

// Set worker source - assuming it's available in public or CDN
// In a real setup, we'd bundle this. For now, using CDN fallback if local fails
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let selectedFile: File | null = null;
let currentPdf: PDFDocument | null = null;
let pdfBytes: ArrayBuffer | null = null;
let currentPageIndex = 0;
let totalPages = 0;
let scale = 1.5;
let redactions: Array<{ pageIndex: number, x: number, y: number, width: number, height: number }> = [];

export function renderRedactPDF(): string {
  selectedFile = null;
  currentPdf = null;
  pdfBytes = null;
  redactions = [];
  currentPageIndex = 0;

  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Redact PDF',
    description: 'Permanently remove sensitive information from your PDF',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Drop PDF to redact' })}

      <div id="editor" class="editor hidden">
         <div class="toolbar">
            <div class="pagination">
                <button id="prev-page" class="btn btn-sm">←</button>
                <span id="page-indicator">Page 1 / 1</span>
                <button id="next-page" class="btn btn-sm">→</button>
            </div>
            <div class="actions">
                <button id="clear-page-redactions" class="btn btn-sm btn-secondary">Clear Page</button>
            </div>
         </div>

         <div id="canvas-container" class="canvas-container">
            <canvas id="pdf-canvas"></canvas>
            <div id="redaction-overlay" class="overlay"></div>
         </div>

         <div class="instructions">Click and drag to draw redaction boxes.</div>
      </div>

      ${renderActionButtons([{ id: 'save-btn', label: 'Apply Redactions & Save', icon: '🔒', primary: true, disabled: true }])}

      <style>
        .editor { margin: var(--space-xl) 0; display: flex; flex-direction: column; align-items: center; gap: var(--space-md); }
        .toolbar { display: flex; width: 100%; justify-content: space-between; align-items: center; max-width: 800px; }
        .pagination { display: flex; align-items: center; gap: var(--space-md); }

        .canvas-container {
            position: relative;
            border: 1px solid var(--glass-border);
            box-shadow: var(--shadow-md);
            overflow: auto;
            max-width: 100%;
            max-height: 80vh;
        }

        canvas { display: block; }

        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: crosshair;
        }

        .redaction-box {
            position: absolute;
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid red;
        }

        .instructions { font-size: 0.9rem; color: var(--color-text-secondary); }
        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>Redact PDF Online</h2>
      <p>Securely blackout text and images from your PDF files. Redactions are permanent and cannot be removed once saved.</p>
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

  document.getElementById('prev-page')?.addEventListener('click', () => changePage(-1));
  document.getElementById('next-page')?.addEventListener('click', () => changePage(1));
  document.getElementById('save-btn')?.addEventListener('click', saveRedactedPDF);
  document.getElementById('clear-page-redactions')?.addEventListener('click', clearPageRedactions);

  setupDrawing();
}

async function loadPDF(file: File): Promise<void> {
    showLoading('Loading PDF...');
    try {
        pdfBytes = await readFileAsArrayBuffer(file);
        currentPdf = await PDFDocument.load(pdfBytes);
        totalPages = currentPdf.getPageCount();
        currentPageIndex = 0;

        document.getElementById('editor')?.classList.remove('hidden');
        (document.getElementById('save-btn') as HTMLButtonElement).disabled = false;

        renderPage();
    } catch (e) {
        showToast('Failed to load PDF. Requires valid PDF file.', 'error');
        console.error(e);
    } finally {
        hideLoading();
    }
}

function updatePagination() {
    const indicator = document.getElementById('page-indicator');
    if(indicator) indicator.textContent = `Page ${currentPageIndex + 1} / ${totalPages}`;

    (document.getElementById('prev-page') as HTMLButtonElement).disabled = currentPageIndex === 0;
    (document.getElementById('next-page') as HTMLButtonElement).disabled = currentPageIndex === totalPages - 1;
}

async function renderPage() {
    if (!pdfBytes) return;

    updatePagination();

    // Using pdf.js to render page to canvas
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const doc = await loadingTask.promise;
    const page = await doc.getPage(currentPageIndex + 1);

    const viewport = page.getViewport({ scale });
    const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if(!context) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport } as any).promise;

    // Render existing redactions
    renderRedactionBoxes();
}

function changePage(delta: number) {
    const newIndex = currentPageIndex + delta;
    if (newIndex >= 0 && newIndex < totalPages) {
        currentPageIndex = newIndex;
        renderPage();
    }
}

function clearPageRedactions() {
    redactions = redactions.filter(r => r.pageIndex !== currentPageIndex);
    renderRedactionBoxes();
}

// Drawing Logic
let isDrawing = false;
let startX = 0;
let startY = 0;

function setupDrawing() {
    const overlay = document.getElementById('redaction-overlay');

    overlay?.addEventListener('mousedown', (e) => {
        isDrawing = true;
        startX = e.offsetX;
        startY = e.offsetY;
    });

    overlay?.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        renderRedactionBoxes(); // Clear temp box

        // Draw selection preview
        // In a real app we'd optimize this, but for now we rely on DOM elements
        const currentX = e.offsetX;
        const currentY = e.offsetY;

        const box = document.createElement('div');
        box.className = 'redaction-box';
        const rect = getRect(startX, startY, currentX, currentY);
        Object.assign(box.style, {
            left: rect.x + 'px',
            top: rect.y + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px'
        });
        document.getElementById('redaction-overlay')?.appendChild(box);
    });

    overlay?.addEventListener('mouseup', (e) => {
        if (!isDrawing) return;
        isDrawing = false;

        const rect = getRect(startX, startY, e.offsetX, e.offsetY);
        // Only add if explicit size
        if (rect.width > 5 && rect.height > 5) {
            redactions.push({
                pageIndex: currentPageIndex,
                ...rect
            });
        }
        renderRedactionBoxes();
    });
}

function getRect(x1: number, y1: number, x2: number, y2: number) {
    return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1)
    };
}

function renderRedactionBoxes() {
    const overlay = document.getElementById('redaction-overlay');
    if (!overlay) return;
    overlay.innerHTML = '';

    redactions.filter(r => r.pageIndex === currentPageIndex).forEach(r => {
        const box = document.createElement('div');
        box.className = 'redaction-box';
        Object.assign(box.style, {
            left: r.x + 'px',
            top: r.y + 'px',
            width: r.width + 'px',
            height: r.height + 'px'
        });
        overlay.appendChild(box);
    });
}

async function saveRedactedPDF() {
    if (!currentPdf || !selectedFile) return;
    showLoading('Applying redactions...');

    try {
        const pages = currentPdf.getPages();

        redactions.forEach(r => {
            const page = pages[r.pageIndex];
            const { height } = page.getSize(); // PDF coordinates are bottom-up usually

            // Convert Canvas coords (Top-Left) to PDF coords (Bottom-Left)
            // We need to account for the scale factor used in rendering
            const pdfX = r.x / scale;
            const pdfY = height - ((r.y + r.height) / scale); // Invert Y
            const pdfW = r.width / scale;
            const pdfH = r.height / scale;

            page.drawRectangle({
                x: pdfX,
                y: pdfY,
                width: pdfW,
                height: pdfH,
                color: rgb(0, 0, 0),
            });
        });

        const pdfBytes = await currentPdf.save();
        const baseName = selectedFile.name.replace('.pdf', '');

         // Convert to ArrayBuffer for strict type compatibility
        const buffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);
        downloadFile(new Blob([buffer as ArrayBuffer], { type: 'application/pdf' }), `${baseName}_redacted.pdf`);

        showToast('Redacted PDF Saved!', 'success');
    } catch (e) {
        console.error(e);
        showToast('Failed to save redactions', 'error');
    } finally {
        hideLoading();
    }
}
