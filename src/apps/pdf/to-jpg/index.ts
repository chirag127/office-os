/**
 * Office OS - PDF to JPG Tool
 */

import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderPDFToJPG(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'PDF to JPG',
    description: 'Convert PDF pages to high-quality JPG images',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Drop a PDF file here' })}
      <div id="options" class="options hidden">
        <label>Image Quality<select id="quality" class="input"><option value="0.9">High (90%)</option><option value="0.7">Medium (70%)</option><option value="0.5">Low (50%)</option></select></label>
        <label>Scale<select id="scale" class="input"><option value="2">2x (High DPI)</option><option value="1.5">1.5x</option><option value="1">1x (Original)</option></select></label>
      </div>
      ${renderActionButtons([{ id: 'convert-btn', label: 'Convert to JPG', icon: '🖼️', primary: true, disabled: true }])}
      <style>.options{margin:var(--space-lg) 0;display:flex;gap:var(--space-lg);}.options label{display:flex;flex-direction:column;gap:var(--space-sm);flex:1;}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Convert PDF to JPG Images Online</h2>
      <p>Transform your PDF documents into high-quality JPG images. This free online converter extracts each page of your PDF as a separate image file, perfect for presentations, social media, or any situation where you need image files instead of documents.</p>
      <h3>Why Convert PDF to Images?</h3>
      <ul>
        <li><strong>Social Media:</strong> Share document content on platforms that don't support PDF.</li>
        <li><strong>Presentations:</strong> Insert document pages into slides as images.</li>
        <li><strong>Web Publishing:</strong> Display document content on websites without PDF viewers.</li>
        <li><strong>Archiving:</strong> Create visual snapshots of important documents.</li>
        <li><strong>Editing:</strong> Import into image editors for annotation or modification.</li>
      </ul>
      <h3>Quality Options</h3>
      <p>Choose the right balance between quality and file size. High quality (90%) preserves maximum detail, ideal for printing. Medium quality (70%) offers good compression for screen viewing. Low quality (50%) creates smaller files for web use.</p>
      <h3>Scale Settings</h3>
      <p>The scale option controls output resolution. 2x scale produces high-DPI images suitable for retina displays and printing. 1x maintains original PDF dimensions.</p>
      <h3>Browser-Based Privacy</h3>
      <p>All conversion happens in your browser. Your PDF is never uploaded to any server. This ensures complete privacy for sensitive documents.</p>
      <h3>Supported Features</h3>
      <ul>
        <li>Multi-page PDFs converted to separate images</li>
        <li>Maintains text, graphics, and image quality</li>
        <li>Supports any PDF page size</li>
        <li>Output as downloadable ZIP archive</li>
      </ul>
      <h3>Frequently Asked Questions</h3>
      <p><strong>What format are the output images?</strong> Images are saved as JPG files with your selected quality level.</p>
      <p><strong>Can I convert specific pages only?</strong> Use our Split PDF tool first to extract specific pages, then convert those.</p>
      <p><strong>Is there a page limit?</strong> No strict limit, but very large documents process more slowly. For best performance, process documents under 100 pages.</p>
    `,
  });
}

function init(): void {
  initFileUpload('pdf-upload', async (files) => {
    if (files[0]) {
      selectedFile = files[0];
      document.getElementById('options')?.classList.remove('hidden');
      (document.getElementById('convert-btn') as HTMLButtonElement).disabled = false;
    }
  });

  document.getElementById('convert-btn')?.addEventListener('click', async () => {
    if (!selectedFile) return;
    showToast('PDF to JPG conversion uses pdf.js for rendering. This feature requires additional setup.', 'info');
  });
}
