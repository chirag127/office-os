/**
 * Office OS - Add Page Numbers Tool
 * Add customizable page numbers to PDF
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { readFileAsArrayBuffer, downloadFile } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderPageNumbersPDF(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Add Page Numbers',
    description: 'Insert page numbers into your PDF document',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Drop a PDF file here' })}

      <div id="options" class="options hidden">
        <div class="option-group">
            <label>Position</label>
            <div class="position-grid">
                <button class="pos-btn" data-pos="tl">↖</button>
                <button class="pos-btn" data-pos="tc">↑</button>
                <button class="pos-btn" data-pos="tr">↗</button>
                <button class="pos-btn" data-pos="bl">↙</button>
                <button class="pos-btn active" data-pos="bc">↓</button>
                <button class="pos-btn" data-pos="br">↘</button>
            </div>
        </div>

        <div class="option-group">
            <label>Format</label>
            <select id="format-select" class="input">
                <option value="n">1, 2, 3...</option>
                <option value="p_n">Page 1, Page 2...</option>
                <option value="n_of_t">1 of 10, 2 of 10...</option>
                <option value="p_n_of_t">Page 1 of 10...</option>
            </select>
        </div>

        <div class="option-group">
            <label>Start From Page</label>
            <input type="number" id="start-page" class="input" value="1" min="1">
        </div>
      </div>

      ${renderActionButtons([{ id: 'add-btn', label: 'Add Page Numbers', icon: '🔢', primary: true, disabled: true }])}

      <style>
        .options { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-lg); margin: var(--space-xl) 0; }
        .option-group { display: flex; flex-direction: column; gap: var(--space-sm); }

        .position-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; width: 120px; }
        .pos-btn { aspect-ratio: 1; border: 1px solid var(--glass-border); background: var(--glass-bg); border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .pos-btn:hover { background: rgba(0,0,0,0.05); }
        .pos-btn.active { background: var(--color-accent-primary); color: white; border-color: transparent; }

        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>Add Page Numbers to PDF Online</h2>
      <p>Easily insert page numbers into your PDF documents. Customize position, formatting, and starting page.</p>
    `
  });
}

function init(): void {
  initFileUpload('pdf-upload', (files) => {
    if (files[0]) {
      selectedFile = files[0];
      document.getElementById('options')?.classList.remove('hidden');
      (document.getElementById('add-btn') as HTMLButtonElement).disabled = false;
    }
  });

  const posBtns = document.querySelectorAll('.pos-btn');
  posBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        posBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
  });

  document.getElementById('add-btn')?.addEventListener('click', handleAddNumbers);
}

async function handleAddNumbers(): Promise<void> {
    if (!selectedFile) return;
    showLoading('Adding page numbers...');

    try {
        const buffer = await readFileAsArrayBuffer(selectedFile);
        const pdfDoc = await PDFDocument.load(buffer);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const pages = pdfDoc.getPages();
        const totalPages = pages.length;
        const startPage = parseInt((document.getElementById('start-page') as HTMLInputElement).value) || 1;
        const format = (document.getElementById('format-select') as HTMLSelectElement).value;
        const position = document.querySelector('.pos-btn.active')?.getAttribute('data-pos') || 'bc';

        // Skip pages before startPage (1-based index)
        for (let i = startPage - 1; i < totalPages; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();
            const pageNum = i + 1;

            let text = '';
            switch(format) {
                case 'n': text = `${pageNum}`; break;
                case 'p_n': text = `Page ${pageNum}`; break;
                case 'n_of_t': text = `${pageNum} of ${totalPages}`; break;
                case 'p_n_of_t': text = `Page ${pageNum} of ${totalPages}`; break;
            }

            const fontSize = 12;
            const textWidth = helvetica.widthOfTextAtSize(text, fontSize);
            const margin = 20;

            let x = 0, y = 0;

            // X Position
            if (position.includes('l')) x = margin;
            else if (position.includes('r')) x = width - textWidth - margin;
            else x = (width - textWidth) / 2; // Center

            // Y Position
            if (position.includes('t')) y = height - margin - fontSize;
            else y = margin; // Bottom

            page.drawText(text, {
                x,
                y,
                size: fontSize,
                font: helvetica,
                color: rgb(0, 0, 0),
            });
        }

        const pdfBytes = await pdfDoc.save();
        const baseName = selectedFile.name.replace('.pdf', '');

        // Convert to ArrayBuffer for compatibility
        const outBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);

        downloadFile(new Blob([outBuffer as ArrayBuffer], { type: 'application/pdf' }), `${baseName}_numbered.pdf`);
        showToast('Page numbers added!', 'success');
    } catch (e) {
        console.error(e);
        showToast('Failed to add page numbers', 'error');
    } finally {
        hideLoading();
    }
}
