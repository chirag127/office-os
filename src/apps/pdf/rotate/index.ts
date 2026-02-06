/**
 * Office OS - Rotate PDF Tool
 */
import { rotatePDF } from '../../../services/pdf';
import { downloadFile, readFileAsArrayBuffer } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderRotatePDF(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Rotate PDF',
    description: 'Rotate PDF pages 90°, 180°, or 270°',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Upload PDF' })}
      <div id="rotate-options" class="options hidden">
        <label>Rotation<div class="rotation-buttons">
          <button class="btn btn-secondary rotate-btn active" data-rotation="90">90° ↻</button>
          <button class="btn btn-secondary rotate-btn" data-rotation="180">180°</button>
          <button class="btn btn-secondary rotate-btn" data-rotation="270">270° ↺</button>
        </div></label>
      </div>
      ${renderActionButtons([{ id: 'rotate-btn', label: 'Rotate PDF', icon: '🔄', primary: true, disabled: true }])}
      <style>.options{margin:var(--space-lg) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.rotation-buttons{display:flex;gap:var(--space-md);margin-top:var(--space-sm);}.rotate-btn{flex:1;}.rotate-btn.active{background:var(--color-accent-gradient);color:white;}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Rotate PDF Pages Online</h2>
      <p>Fix incorrectly oriented PDF pages with our free online rotation tool. Rotate all pages 90°, 180°, or 270° to correct scanning errors or viewing orientation.</p>
      <h3>Common Rotation Needs</h3>
      <ul>
        <li><strong>Scanned Documents:</strong> Fix pages that were scanned upside-down or sideways.</li>
        <li><strong>Mixed Orientation:</strong> Correct documents with landscape pages in portrait documents.</li>
        <li><strong>Mobile Scans:</strong> Fix orientation issues from phone camera scans.</li>
        <li><strong>Presentation Prep:</strong> Align all pages for consistent viewing.</li>
      </ul>
      <h3>Rotation Options</h3>
      <p><strong>90° Clockwise:</strong> Rotate right - common for landscape pages.</p>
      <p><strong>180°:</strong> Flip upside-down pages.</p>
      <p><strong>270° Counter-clockwise:</strong> Rotate left - alternative for landscape fix.</p>
      <h3>Privacy</h3>
      <p>All rotation happens locally in your browser. Your PDF is never uploaded to any server.</p>
      <h3>Tips</h3>
      <ul>
        <li>Preview your PDF first to determine the correct rotation angle.</li>
        <li>For documents with mixed orientations, use our Split tool first to separate pages.</li>
        <li>Remember that rotation affects all pages in the document.</li>
      </ul>
    `,
  });
}

function init(): void {
  let rotation: 90 | 180 | 270 = 90;

  initFileUpload('pdf-upload', (files) => {
    selectedFile = files[0];
    document.getElementById('rotate-options')?.classList.remove('hidden');
    (document.getElementById('rotate-btn') as HTMLButtonElement).disabled = false;
  });

  document.querySelectorAll('.rotate-btn[data-rotation]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rotate-btn[data-rotation]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      rotation = parseInt((btn as HTMLElement).dataset.rotation!) as 90 | 180 | 270;
    });
  });

  document.getElementById('rotate-btn')?.addEventListener('click', async () => {
    if (!selectedFile) return;
    showLoading('Rotating PDF...');
    try {
      const buffer = await readFileAsArrayBuffer(selectedFile);
      const rotated = await rotatePDF(buffer, rotation);
      // Convert Uint8Array to ArrayBuffer for Blob compatibility
      const arrayBuffer = new ArrayBuffer(rotated.length);
      new Uint8Array(arrayBuffer).set(rotated);
      downloadFile(new Blob([arrayBuffer], { type: 'application/pdf' }), selectedFile.name.replace('.pdf', '_rotated.pdf'));
      showToast('PDF rotated!', 'success');
    } catch (e) {
      showToast('Rotation failed', 'error');
    } finally {
      hideLoading();
    }
  });
}
