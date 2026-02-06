/**
 * Office OS - PDF to Excel Tool
 * Convert PDF tables to Excel spreadsheet
 */
import * as pdfjsLib from 'pdfjs-dist';
// import * as XLSX from 'xlsx'; // Lazy loaded
import { readFileAsArrayBuffer } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let selectedFile: File | null = null;

export function renderPdfToExcel(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'PDF to Excel',
    description: 'Extract tables from PDF to Excel (XLSX)',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Drop PDF with tables' })}

      ${renderActionButtons([{ id: 'convert-btn', label: 'Convert to Excel', icon: '📊', primary: true, disabled: true }])}

      <div class="info-box">
        <p><strong>Note:</strong> Attempt to auto-detect tabular data. Results may vary depending on PDF structure.</p>
      </div>

      <style>
        .info-box {
            margin-top: var(--space-lg);
            padding: var(--space-md);
            background: rgba(var(--color-info-rgb), 0.1);
            border-left: 4px solid var(--color-info);
            border-radius: var(--radius-sm);
            font-size: 0.9rem;
        }
      </style>
    `,
    seoContent: `
      <h2>Convert PDF to Excel Online</h2>
      <p>Extract data tables from PDF documents and save them as Excel spreadsheets (XLSX). Free and secure.</p>
    `
  });
}

function init(): void {
  initFileUpload('pdf-upload', (files) => {
    if (files[0]) {
      selectedFile = files[0];
      (document.getElementById('convert-btn') as HTMLButtonElement).disabled = false;
    }
  });

  document.getElementById('convert-btn')?.addEventListener('click', convertToExcel);
}

async function convertToExcel(): Promise<void> {
    if (!selectedFile) return;
    showLoading('Converting to Excel...');

    try {
        const XLSX = await import('xlsx');

        const arrayBuffer = await readFileAsArrayBuffer(selectedFile);
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        const workbook = XLSX.utils.book_new();
        let hasData = false;

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Basic extraction: Group text by Y coordinate to form rows
            // This is a naive implementation; robust table extraction is very complex
            const rows: Record<number, { text: string, x: number }[]> = {};

            for (const item of textContent.items as any[]) {
                const y = Math.round(item.transform[5]); // Round to nearest int to group roughly aligned items
                if (!rows[y]) rows[y] = [];
                rows[y].push({ text: item.str, x: item.transform[4] });
            }

            // Sort rows by Y (PDF usually has 0 at bottom, but pdf.js gives coordinates)
            // Sort items in row by X
            const sortedY = Object.keys(rows).map(Number).sort((a, b) => b - a); // Top to bottom

            const sheetData: string[][] = [];

            sortedY.forEach(y => {
                const rowItems = rows[y].sort((a, b) => a.x - b.x);
                // Simple: just put them in columns sequentially
                // A better algo would analyze X gaps to align columns across rows
                sheetData.push(rowItems.map(item => item.text));
            });

            if (sheetData.length > 0) {
                 const sheet = XLSX.utils.aoa_to_sheet(sheetData);
                 XLSX.utils.book_append_sheet(workbook, sheet, `Page ${i}`);
                 hasData = true;
            }
        }

        if (hasData) {
            const baseName = selectedFile.name.replace('.pdf', '');
            XLSX.writeFile(workbook, `${baseName}.xlsx`);
            showToast('Converted successfully!', 'success');
        } else {
             showToast('No text data found to convert', 'warning');
        }

    } catch (e) {
        console.error(e);
        showToast('Conversion failed', 'error');
    } finally {
        hideLoading();
    }
}
