/**
 * Office OS - PDF to Word Tool
 * Convert PDF to editable Word document
 */
import * as pdfjsLib from 'pdfjs-dist';
// import { Document, Packer, Paragraph, TextRun } from 'docx'; // Lazy loaded now
import type { Paragraph } from 'docx'; // Type-only import for build
import { readFileAsArrayBuffer, downloadFile } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let selectedFile: File | null = null;

export function renderPdfToWord(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'PDF to Word',
    description: 'Convert PDF files to editable Word documents (DOCX)',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Drop PDF to convert' })}

      ${renderActionButtons([{ id: 'convert-btn', label: 'Convert to Word', icon: '📝', primary: true, disabled: true }])}

      <div class="info-box">
        <p><strong>Note:</strong> This tool extracts text and basic layout. Complex formatting, images, and tables might need adjustment in Word.</p>
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
      <h2>Convert PDF to Word Online Free</h2>
      <p>Transform your PDF documents into editable Word files (DOCX) instantly. accurate text extraction.</p>
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

  document.getElementById('convert-btn')?.addEventListener('click', convertToWord);
}

async function convertToWord(): Promise<void> {
    if (!selectedFile) return;
    showLoading('Converting to Word...');

    try {
        const { Document, Packer, Paragraph, TextRun } = await import('docx');

        const arrayBuffer = await readFileAsArrayBuffer(selectedFile);
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        const docChildren: Paragraph[] = [];

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Simple text extraction - consolidating lines based on Y position would be better
            // matching visual layout is hard in browser without heavy libs
            // This is a "Best Effort" conversion

            let lastY = -1;
            let currentLineText: string[] = [];

            for (const item of textContent.items as any[]) {
                // Check if new line (simple heuristic)
                if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
                    docChildren.push(new Paragraph({
                        children: [new TextRun(currentLineText.join(' '))]
                    }));
                    currentLineText = [];
                }
                currentLineText.push(item.str);
                lastY = item.transform[5];
            }
             // Flush last line
            if (currentLineText.length > 0) {
                 docChildren.push(new Paragraph({
                    children: [new TextRun(currentLineText.join(' '))]
                }));
            }

            // Add page break if not last page
            if (i < totalPages) {
                // docx JS page break
                // For MVP we just add spacing or standard break
                 docChildren.push(new Paragraph({ children: [new TextRun({ break: 1 })] }));
            }
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: docChildren,
            }],
        });

        const blob = await Packer.toBlob(doc);
        const baseName = selectedFile.name.replace('.pdf', '');
        downloadFile(blob, `${baseName}.docx`);

        showToast('Converted successfully!', 'success');
    } catch (e) {
        console.error(e);
        showToast('Conversion failed', 'error');
    } finally {
        hideLoading();
    }
}
