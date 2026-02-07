/**
 * Office OS - Crop PDF Tool
 * Crop margins and whitespace from PDF pages
 */

import { PDFDocument } from 'pdf-lib';
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

export function renderCropPDF(): string {
  selectedFile = null;

  setTimeout(() => initializeCropPDF(), 0);

  return renderToolPage({
    title: 'Crop PDF',
    description: 'Crop margins and whitespace from PDF pages',
    toolContent: `
      ${renderFileUpload({
        id: 'pdf-upload',
        accept: '.pdf,application/pdf',
        multiple: false,
        title: 'Drop a PDF file here',
        hint: 'Upload a PDF to crop',
      })}

      <div id="crop-options" class="options-panel hidden">
        <div class="pdf-info">
          <span id="pdf-name">document.pdf</span>
        </div>

        <div class="crop-settings">
          <h3>Crop Margins (in points)</h3>
          <div class="margin-inputs">
            <div class="margin-input">
              <label for="margin-top">Top</label>
              <input type="number" id="margin-top" class="input" value="0" min="0">
            </div>
            <div class="margin-input">
              <label for="margin-right">Right</label>
              <input type="number" id="margin-right" class="input" value="0" min="0">
            </div>
            <div class="margin-input">
              <label for="margin-bottom">Bottom</label>
              <input type="number" id="margin-bottom" class="input" value="0" min="0">
            </div>
            <div class="margin-input">
              <label for="margin-left">Left</label>
              <input type="number" id="margin-left" class="input" value="0" min="0">
            </div>
          </div>
          <p class="hint">72 points = 1 inch. Enter values to crop from each edge.</p>
        </div>
      </div>

      ${renderActionButtons([
        { id: 'crop-btn', label: 'Crop PDF', icon: '✂️', primary: true, disabled: true },
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
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-md);
          border-bottom: 1px solid var(--glass-border);
          font-weight: 600;
        }
        .crop-settings h3 {
          font-size: var(--font-size-md);
          margin-bottom: var(--space-md);
        }
        .margin-inputs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-md);
        }
        .margin-input {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        .margin-input label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
        .margin-input input {
          text-align: center;
        }
        .hint {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
          margin-top: var(--space-md);
        }
        .hidden { display: none !important; }

        @media (max-width: 480px) {
          .margin-inputs {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
    `,
    seoContent: `
      <h2>Crop PDF Pages Online</h2>
      <p>Remove unwanted margins and whitespace from your PDF documents. Perfect for cleaning up scanned documents or adjusting page layouts.</p>
      <h3>How to Crop PDF</h3>
      <ol>
        <li>Upload your PDF file</li>
        <li>Enter the margin values to crop from each edge</li>
        <li>Click "Crop PDF" to process</li>
        <li>Download your cropped PDF</li>
      </ol>
    `,
  });
}

function initializeCropPDF(): void {
  initFileUpload('pdf-upload', async (files) => {
    if (files.length > 0) {
      selectedFile = files[0];
      document.getElementById('pdf-name')!.textContent = selectedFile.name;
      document.getElementById('crop-options')?.classList.remove('hidden');
      (document.getElementById('crop-btn') as HTMLButtonElement).disabled = false;
    }
  });

  document.getElementById('crop-btn')?.addEventListener('click', handleCrop);
}

async function handleCrop(): Promise<void> {
  if (!selectedFile) return;

  const marginTop = parseInt((document.getElementById('margin-top') as HTMLInputElement).value) || 0;
  const marginRight = parseInt((document.getElementById('margin-right') as HTMLInputElement).value) || 0;
  const marginBottom = parseInt((document.getElementById('margin-bottom') as HTMLInputElement).value) || 0;
  const marginLeft = parseInt((document.getElementById('margin-left') as HTMLInputElement).value) || 0;

  if (marginTop === 0 && marginRight === 0 && marginBottom === 0 && marginLeft === 0) {
    showToast('Please enter at least one margin value', 'warning');
    return;
  }

  showLoading('Cropping PDF...');

  try {
    const buffer = await readFileAsArrayBuffer(selectedFile);
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();

      // Set crop box (MediaBox minus margins)
      page.setCropBox(
        marginLeft,
        marginBottom,
        width - marginLeft - marginRight,
        height - marginTop - marginBottom
      );
    }

    const pdfBytes = await pdfDoc.save();
    const baseName = selectedFile.name.replace('.pdf', '');
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    downloadFile(blob, `${baseName}_cropped.pdf`);
    showToast('PDF cropped successfully!', 'success');
  } catch (error) {
    console.error('Crop error:', error);
    showToast('Failed to crop PDF', 'error');
  } finally {
    hideLoading();
  }
}
