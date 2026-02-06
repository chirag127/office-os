/**
 * Office OS - Compress PDF Tool
 */

import { compressPDF } from '../../../services/pdf';
import { downloadFile, formatFileSize, readFileAsArrayBuffer } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderCompressPDF(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Drop a PDF file here' })}
      <div id="file-info" class="file-info hidden"></div>
      ${renderActionButtons([{ id: 'compress-btn', label: 'Compress PDF', icon: '📦', primary: true, disabled: true }])}
      <style>.file-info{margin:var(--space-lg) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);display:flex;justify-content:space-between;}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Compress PDF Files Online - Reduce File Size</h2>
      <p>PDF compression reduces file size by optimizing internal structure and removing unnecessary data. Our online PDF compressor works entirely in your browser for complete privacy. Smaller PDFs are easier to email, upload, and store while maintaining visual quality.</p>
      <h3>How PDF Compression Works</h3>
      <p>PDF files contain various elements including text, images, fonts, and metadata. Compression optimizes these elements by removing duplicate data, using object streams, and consolidating resources. Unlike image compression which may reduce quality, structural PDF compression preserves visual fidelity.</p>
      <h3>When to Compress PDFs</h3>
      <ul>
        <li><strong>Email Attachments:</strong> Most email services limit attachment sizes. Compression helps PDFs stay under limits.</li>
        <li><strong>Web Uploads:</strong> Faster upload times and reduced bandwidth usage for websites and cloud storage.</li>
        <li><strong>Storage Optimization:</strong> Save disk space when archiving large document collections.</li>
        <li><strong>Mobile Sharing:</strong> Smaller files transfer faster over mobile networks.</li>
      </ul>
      <h3>Privacy First Compression</h3>
      <p>Your documents never leave your device. All compression happens locally in your web browser, ensuring sensitive information remains private. No server uploads mean no data retention risks.</p>
      <h3>Tips for Maximum Compression</h3>
      <ul>
        <li>PDFs with many images benefit most from compression.</li>
        <li>Already compressed PDFs may show minimal size reduction.</li>
        <li>For maximum reduction, consider our Image Compress tool on embedded images separately.</li>
      </ul>
      <h3>Frequently Asked Questions</h3>
      <p><strong>Will compression affect quality?</strong> Our structural compression maintains visual quality. Text and vector graphics remain sharp.</p>
      <p><strong>How much smaller will my PDF be?</strong> Results vary based on content. PDFs with unoptimized elements may reduce 30-60%, while already optimized files may see 5-15% reduction.</p>
      <p><strong>Can I compress password-protected PDFs?</strong> Protected PDFs need to be unlocked first using our Unlock PDF tool.</p>
    `,
  });
}

function init(): void {
  initFileUpload('pdf-upload', async (files) => {
    if (files[0]) {
      selectedFile = files[0];
      const info = document.getElementById('file-info')!;
      info.innerHTML = `<span>${selectedFile.name}</span><span>${formatFileSize(selectedFile.size)}</span>`;
      info.classList.remove('hidden');
      (document.getElementById('compress-btn') as HTMLButtonElement).disabled = false;
    }
  });

  document.getElementById('compress-btn')?.addEventListener('click', async () => {
    if (!selectedFile) return;
    showLoading('Compressing PDF...');
    try {
      const buffer = await readFileAsArrayBuffer(selectedFile);
      const compressed = await compressPDF(buffer);
      // Convert Uint8Array to ArrayBuffer for Blob compatibility
      const arrayBuffer = new ArrayBuffer(compressed.length);
      new Uint8Array(arrayBuffer).set(compressed);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const reduction = ((1 - blob.size / selectedFile!.size) * 100).toFixed(1);
      downloadFile(blob, selectedFile.name.replace('.pdf', '_compressed.pdf'));
      showToast(`Compressed! Reduced by ${reduction}%`, 'success');
    } catch (e) {
      showToast('Compression failed', 'error');
    } finally {
      hideLoading();
    }
  });
}
