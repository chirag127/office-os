/**
 * Office OS - Repair PDF Tool
 * Attempt to fix corrupt PDFs by re-saving
 */
import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer, downloadFile } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderRepairPdf(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Repair PDF',
    description: 'Recover data from corrupt or damaged PDF files',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Drop corrupt PDF to repair' })}

      ${renderActionButtons([{ id: 'repair-btn', label: 'Repair PDF', icon: '🔧', primary: true, disabled: true }])}

      <div class="info-box">
        <p><strong>How it works:</strong> We attempt to rebuild the PDF structure. This can fix issues with missing cross-reference tables or metadata, but significantly damaged files might not be recoverable.</p>
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
      <h2>Repair Corrupt PDF Online</h2>
      <p>Fix damaged PDF files and recover your documents. Free online PDF repair tool.</p>
    `
  });
}

function init(): void {
  initFileUpload('pdf-upload', (files) => {
    if (files[0]) {
      selectedFile = files[0];
      (document.getElementById('repair-btn') as HTMLButtonElement).disabled = false;
    }
  });

  document.getElementById('repair-btn')?.addEventListener('click', repairPdf);
}

async function repairPdf(): Promise<void> {
    if (!selectedFile) return;
    showLoading('Attempting repair...');

    try {
        const buffer = await readFileAsArrayBuffer(selectedFile);

        // pdf-lib's load is somewhat tolerant.
        // If we can load it and save it, we essentially "repair" the XRef table.
        let pdfDoc;
        try {
             pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        } catch (e) {
             throw new Error('PDF is too damaged to be read.');
        }

        const pdfBytes = await pdfDoc.save();
        const baseName = selectedFile.name.replace('.pdf', '');

        // Convert to ArrayBuffer
        const outBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);

        downloadFile(new Blob([outBuffer as ArrayBuffer], { type: 'application/pdf' }), `${baseName}_repaired.pdf`);
        showToast('PDF Repaired successfully!', 'success');

    } catch (e: any) {
        console.error(e);
        showToast(e.message || 'Repair failed. File may be encrypted or too damaged.', 'error');
    } finally {
        hideLoading();
    }
}
