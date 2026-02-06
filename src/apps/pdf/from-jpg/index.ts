/**
 * Office OS - JPG to PDF Tool
 */

import { createPDFFromImages } from '../../../services/pdf';
import { downloadFile, readFileAsArrayBuffer } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFiles: File[] = [];

export function renderJPGToPDF(): string {
  selectedFiles = [];
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Images to PDF',
    description: 'Convert JPG, PNG images to a PDF document',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp', multiple: true, title: 'Drop images here' })}
      <div id="preview" class="preview"></div>
      ${renderActionButtons([{ id: 'convert-btn', label: 'Create PDF', icon: '📄', primary: true, disabled: true }])}
      <style>.preview{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:var(--space-md);margin:var(--space-lg) 0;}.preview-img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--radius-md);border:1px solid var(--glass-border);}</style>
    `,
    seoContent: `
      <h2>Convert Images to PDF Online</h2>
      <p>Combine multiple images into a single PDF document. Perfect for creating photo albums, document scans, or portfolios. Our online converter supports JPG, PNG, and WebP formats.</p>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Scan Compilation:</strong> Combine scanned pages into one document.</li>
        <li><strong>Photo Albums:</strong> Create PDF albums from photos.</li>
        <li><strong>Portfolios:</strong> Compile artwork or designs into a shareable PDF.</li>
        <li><strong>Documentation:</strong> Convert screenshots or diagrams to PDF for reports.</li>
      </ul>
      <h3>How It Works</h3>
      <p>Upload your images, reorder them as needed, and click convert. Each image becomes a page in the PDF, sized to match the original image dimensions. The tool maintains full image quality in the output.</p>
      <h3>Supported Formats</h3>
      <ul><li>JPEG/JPG - Most common photo format</li><li>PNG - Supports transparency</li><li>WebP - Modern web format</li></ul>
      <h3>Privacy Guaranteed</h3>
      <p>All processing happens locally in your browser. Your images are never uploaded to any server, ensuring complete privacy for personal photos and sensitive documents.</p>
      <h3>Tips for Best Results</h3>
      <ul>
        <li>Use consistent image orientations for a uniform PDF.</li>
        <li>Higher resolution images create higher quality PDFs.</li>
        <li>Arrange images in the desired order before converting.</li>
      </ul>
    `,
  });
}

function init(): void {
  initFileUpload('img-upload', (files) => {
    selectedFiles = [...selectedFiles, ...Array.from(files).filter(f => f.type.startsWith('image/'))];
    updatePreview();
    (document.getElementById('convert-btn') as HTMLButtonElement).disabled = selectedFiles.length === 0;
  });

  document.getElementById('convert-btn')?.addEventListener('click', handleConvert);
}

function updatePreview(): void {
  const preview = document.getElementById('preview')!;
  preview.innerHTML = selectedFiles.map(f => `<img src="${URL.createObjectURL(f)}" class="preview-img" alt="${f.name}">`).join('');
}

async function handleConvert(): Promise<void> {
  if (selectedFiles.length === 0) return;
  showLoading('Creating PDF...');
  try {
    const images = await Promise.all(selectedFiles.map(async (file) => ({
      buffer: await readFileAsArrayBuffer(file),
      type: file.type.includes('png') ? 'png' as const : 'jpg' as const,
    })));
    const pdf = await createPDFFromImages(images);
    // Convert Uint8Array to ArrayBuffer for Blob compatibility
    const arrayBuffer = new ArrayBuffer(pdf.length);
    new Uint8Array(arrayBuffer).set(pdf);
    downloadFile(new Blob([arrayBuffer], { type: 'application/pdf' }), 'images.pdf');
    showToast('PDF created!', 'success');
  } catch (e) {
    showToast('Conversion failed', 'error');
  } finally {
    hideLoading();
  }
}
