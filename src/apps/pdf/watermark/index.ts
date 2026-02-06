/**
 * Office OS - Watermark PDF Tool
 */
import { addTextWatermark } from '../../../services/pdf';
import { downloadFile, readFileAsArrayBuffer } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderWatermarkPDF(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Watermark PDF',
    description: 'Add text or image watermarks to PDF documents',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Upload PDF' })}
      <div id="watermark-options" class="options hidden">
        <label>Watermark Text<input type="text" id="watermark-text" class="input" placeholder="CONFIDENTIAL" value="CONFIDENTIAL"></label>
        <div class="options-row">
          <label>Opacity<input type="range" id="opacity" min="10" max="80" value="30"><span id="opacity-val">30%</span></label>
          <label>Font Size<input type="number" id="font-size" class="input" value="50" min="10" max="150"></label>
        </div>
        <div class="options-row">
          <label>Rotation<select id="rotation" class="input"><option value="-45">Diagonal (-45°)</option><option value="0">Horizontal</option><option value="45">Diagonal (45°)</option><option value="90">Vertical</option></select></label>
        </div>
      </div>
      ${renderActionButtons([{ id: 'watermark-btn', label: 'Add Watermark', icon: '💧', primary: true, disabled: true }])}
      <style>.options{margin:var(--space-lg) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);display:flex;flex-direction:column;gap:var(--space-lg);}.options label{display:flex;flex-direction:column;gap:var(--space-sm);}.options-row{display:flex;gap:var(--space-lg);}.options-row label{flex:1;}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Add Watermark to PDF Online</h2>
      <p>Protect your PDF documents with custom watermarks. Add text overlays like "CONFIDENTIAL", "DRAFT", or your company name across all pages. Our free tool works entirely in your browser.</p>
      <h3>Why Add Watermarks?</h3>
      <ul>
        <li><strong>Document Protection:</strong> Discourage unauthorized distribution and copying.</li>
        <li><strong>Branding:</strong> Add your logo or company name to documents.</li>
        <li><strong>Status Indication:</strong> Mark documents as DRAFT, CONFIDENTIAL, or APPROVED.</li>
        <li><strong>Copyright:</strong> Assert ownership of your intellectual property.</li>
      </ul>
      <h3>Customization Options</h3>
      <p><strong>Text:</strong> Enter any text for your watermark.</p>
      <p><strong>Opacity:</strong> Adjust transparency so the watermark is visible but doesn't obscure content.</p>
      <p><strong>Size:</strong> Scale the watermark to fit your document.</p>
      <p><strong>Rotation:</strong> Position diagonally, horizontally, or vertically.</p>
      <h3>Privacy First</h3>
      <p>All watermarking happens locally in your browser. Your documents are never uploaded to any server, ensuring complete privacy for sensitive materials.</p>
      <h3>Tips for Effective Watermarks</h3>
      <ul>
        <li>Use 20-40% opacity for readability while protecting content.</li>
        <li>Diagonal watermarks are harder to crop out.</li>
        <li>Consider using both text and your logo for maximum protection.</li>
      </ul>
    `,
  });
}

function init(): void {
  initFileUpload('pdf-upload', (files) => {
    selectedFile = files[0];
    document.getElementById('watermark-options')?.classList.remove('hidden');
    checkReady();
  });

  document.getElementById('opacity')?.addEventListener('input', (e) => {
    document.getElementById('opacity-val')!.textContent = `${(e.target as HTMLInputElement).value}%`;
  });

  document.getElementById('watermark-text')?.addEventListener('input', checkReady);
  document.getElementById('watermark-btn')?.addEventListener('click', handleWatermark);
}

function checkReady(): void {
  const text = (document.getElementById('watermark-text') as HTMLInputElement).value;
  (document.getElementById('watermark-btn') as HTMLButtonElement).disabled = !selectedFile || !text.trim();
}

async function handleWatermark(): Promise<void> {
  if (!selectedFile) return;
  showLoading('Adding watermark...');
  try {
    const text = (document.getElementById('watermark-text') as HTMLInputElement).value;
    const opacity = parseInt((document.getElementById('opacity') as HTMLInputElement).value) / 100;
    const fontSize = parseInt((document.getElementById('font-size') as HTMLInputElement).value);
    const rotation = parseInt((document.getElementById('rotation') as HTMLSelectElement).value);

    const buffer = await readFileAsArrayBuffer(selectedFile);
    const watermarked = await addTextWatermark(buffer, text, { opacity, fontSize, rotation });
    // Convert Uint8Array to ArrayBuffer for Blob compatibility
    const arrayBuffer = new ArrayBuffer(watermarked.length);
    new Uint8Array(arrayBuffer).set(watermarked);
    downloadFile(new Blob([arrayBuffer], { type: 'application/pdf' }), selectedFile.name.replace('.pdf', '_watermarked.pdf'));
    showToast('Watermark added!', 'success');
  } catch (e) {
    showToast('Failed to add watermark', 'error');
  } finally {
    hideLoading();
  }
}
