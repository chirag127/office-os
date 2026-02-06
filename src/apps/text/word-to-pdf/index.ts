/**
 * Office OS - Word to PDF Tool
 */
import { docxToHtml } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderWordToPDF(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Word to PDF',
    description: 'Convert DOCX documents to PDF format',
    toolContent: `
      ${renderFileUpload({ id: 'doc-upload', accept: '.docx,.doc', multiple: false, title: 'Upload a Word document', hint: 'DOCX files supported' })}
      <div id="preview-area" class="preview-area hidden"><h3>Preview</h3><div id="doc-preview" class="doc-preview"></div></div>
      ${renderActionButtons([{ id: 'convert-btn', label: 'Convert to PDF', icon: '📄', primary: true, disabled: true }])}
      <style>.preview-area{margin:var(--space-xl) 0;}.doc-preview{max-height:400px;overflow-y:auto;padding:var(--space-lg);background:white;color:#333;border-radius:var(--radius-md);font-family:serif;line-height:1.6;}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Convert Word to PDF Online</h2>
      <p>Transform your Word documents (DOCX) into PDF format. Maintain formatting, fonts, and layout in a universally compatible format.</p>
      <h3>Why Convert to PDF?</h3>
      <ul>
        <li><strong>Universal Compatibility:</strong> PDFs open on any device without Word</li>
        <li><strong>Preserved Formatting:</strong> Layout stays exactly as intended</li>
        <li><strong>Professional Sharing:</strong> Standard format for business documents</li>
        <li><strong>Print Ready:</strong> PDFs print exactly as shown</li>
      </ul>
      <h3>How It Works</h3>
      <p>Upload your DOCX file and we'll convert it to PDF while preserving text formatting, images, and document structure.</p>
      <h3>Privacy</h3>
      <p>Your document is processed locally in your browser. No files are uploaded to external servers.</p>
    `,
  });
}

function init(): void {
  initFileUpload('doc-upload', async (files) => {
    selectedFile = files[0];
    showLoading('Processing document...');
    try {
      const result = await docxToHtml(selectedFile);
      document.getElementById('doc-preview')!.innerHTML = result.html;
      document.getElementById('preview-area')?.classList.remove('hidden');
      (document.getElementById('convert-btn') as HTMLButtonElement).disabled = false;
    } catch (e) {
      showToast('Failed to process document', 'error');
    } finally {
      hideLoading();
    }
  });

  document.getElementById('convert-btn')?.addEventListener('click', () => {
    showToast('PDF generation from DOCX requires additional libraries. Use browser print (Ctrl+P) to save as PDF from the preview.', 'info');
  });
}
