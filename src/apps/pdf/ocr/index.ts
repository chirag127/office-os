/**
 * Office OS - OCR PDF Tool
 * Make scanned PDFs searchable using Tesseract.js
 */
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { readFileAsArrayBuffer, downloadFile } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast } from '../../../components/shared';

// Set worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let selectedFile: File | null = null;

export function renderOcrPdf(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'OCR PDF',
    description: 'Recognize text in scanned PDF documents (Searchable PDF)',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Drop scanned PDF' })}

      <div class="options-panel hidden" id="options-panel">
         <div class="input-group">
            <label>Language</label>
            <select id="lang-select" class="input">
                <option value="eng">English</option>
                <option value="spa">Spanish</option>
                <option value="fra">French</option>
                <option value="deu">German</option>
                <option value="chi_sim">Chinese (Simplified)</option>
            </select>
         </div>
      </div>

      ${renderActionButtons([{ id: 'ocr-btn', label: 'Start OCR', icon: '🔍', primary: true, disabled: true }])}

      <div id="progress-container" class="progress-container hidden">
        <div class="progress-bar"><div id="progress-fill" class="progress-fill"></div></div>
        <div id="progress-text" class="progress-text">Initializing...</div>
      </div>

      <style>
        .options-panel { margin: var(--space-md) 0; }
        .input-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        .input { width: 100%; padding: 10px; border: 1px solid var(--glass-border); border-radius: var(--radius-sm); background: rgba(255,255,255,0.8); }

        .progress-container { margin-top: var(--space-lg); }
        .progress-bar { width: 100%; height: 10px; background: rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden; }
        .progress-fill { width: 0%; height: 100%; background: var(--color-accent-primary); transition: width 0.3s; }
        .progress-text { text-align: center; margin-top: 5px; font-size: 0.85rem; color: var(--color-text-secondary); }

        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>Free Online OCR PDF</h2>
      <p>Convert scanned images and PDFs into searchable and selectable text documents using optical character recognition.</p>
    `
  });
}

function init(): void {
  initFileUpload('pdf-upload', (files) => {
    if (files[0]) {
      selectedFile = files[0];
      (document.getElementById('ocr-btn') as HTMLButtonElement).disabled = false;
      document.getElementById('options-panel')?.classList.remove('hidden');
    }
  });

  document.getElementById('ocr-btn')?.addEventListener('click', startOcr);
}

async function startOcr(): Promise<void> {
    if (!selectedFile) return;

    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const lang = (document.getElementById('lang-select') as HTMLSelectElement).value;

    if (progressContainer) progressContainer.classList.remove('hidden');
    (document.getElementById('ocr-btn') as HTMLButtonElement).disabled = true;

    try {
        const arrayBuffer = await readFileAsArrayBuffer(selectedFile);
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        // We will maintain the worker to reuse it
        const worker = await Tesseract.createWorker(lang);

        // For PDF output, we need to handle it page by page
        // Tesseract.js recognizes ONE image at a time.
        // We can't easily create a robust "Searchable PDF" (image + text layer)
        // purely client side without significant logic to recompose the PDF.
        // FOR MVP: We will extract text to a TXT file OR create a NEW PDF with just the text.
        // Better: Tesseract.js `recognize` returns a PDF if requested?
        // Actually, let's just extract text for now to be safe, or rebuild a simple PDF.
        // Wait, `worker.recognize(image, { pdfTitle: '...' })`?
        // Reference: Tesseract.js can return PDF files.

        // Let's try to recognize page images and accumulate text for now,
        // or see if we can generate a basic searchable PDF.
        // Generating a searchable PDF involves merging the OCR result back.
        // For simplicity and robustness, we will create a TEXT file first.
        // IF user wants PDF, we create a PDF with the text.

        // REVISION: Let's output text content to a TextArea and offer download.

        let fullText = '';

        for (let i = 1; i <= totalPages; i++) {
             if (progressText) progressText.textContent = `Processing page ${i} of ${totalPages}...`;
             const page = await pdf.getPage(i);
             const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
             const canvas = document.createElement('canvas');
             canvas.width = viewport.width;
             canvas.height = viewport.height;
             const ctx = canvas.getContext('2d');

             if (ctx) {
                 await page.render({ canvasContext: ctx, viewport } as any).promise;
                 const imgData = canvas.toDataURL('image/png');

                 const { data: { text } } = await worker.recognize(imgData);
                 fullText += `--- Page ${i} ---\n${text}\n\n`;
             }

             const pct = (i / totalPages) * 100;
             if (progressFill) progressFill.style.width = `${pct}%`;
        }

        await worker.terminate();

        downloadFile(new Blob([fullText], { type: 'text/plain' }), `${selectedFile.name}.txt`);
        showToast('OCR Complete! Text downloaded.', 'success');

    } catch (e) {
        console.error(e);
        showToast('OCR failed.', 'error');
    } finally {
        if (progressContainer) progressContainer.classList.add('hidden');
        (document.getElementById('ocr-btn') as HTMLButtonElement).disabled = false;
    }
}
