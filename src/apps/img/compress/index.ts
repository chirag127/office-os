/**
 * Office OS - Compress Image Tool
 */
import { compressImage } from '../../../services/image';
import { downloadFile, formatFileSize } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFiles: File[] = [];

export function renderCompressImage(): string {
  selectedFiles = [];
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Compress Images',
    description: 'Reduce image file size while maintaining quality',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: true, title: 'Drop images here' })}
      <div id="options" class="options hidden">
        <div id="file-list"></div>
        <label>Target Quality<select id="quality" class="input"><option value="0.9">High (90%)</option><option value="0.8" selected>Medium (80%)</option><option value="0.6">Low (60%)</option></select></label>
        <label>Max Width (px)<input type="number" id="max-width" class="input" value="1920" min="100" max="4096"></label>
      </div>
      ${renderActionButtons([{ id: 'compress-btn', label: 'Compress Images', icon: '📦', primary: true, disabled: true }])}
      <style>.options{margin:var(--space-lg) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);display:flex;flex-direction:column;gap:var(--space-lg);}.hidden{display:none!important;}#file-list{display:flex;flex-direction:column;gap:var(--space-sm);}.file-row{display:flex;justify-content:space-between;padding:var(--space-sm);background:var(--color-bg-tertiary);border-radius:var(--radius-sm);}</style>
    `,
    seoContent: `
      <h2>Compress Images Online - Reduce File Size</h2>
      <p>Reduce image file sizes without losing visible quality. Our free online compressor supports JPG, PNG, and WebP formats. All processing happens in your browser for complete privacy.</p>
      <h3>Why Compress Images?</h3>
      <ul>
        <li><strong>Faster Loading:</strong> Smaller images load faster on websites and apps.</li>
        <li><strong>Save Storage:</strong> Reduce disk space and cloud storage usage.</li>
        <li><strong>Email Attachments:</strong> Send more images without hitting size limits.</li>
        <li><strong>Social Media:</strong> Optimize for platform upload limits.</li>
      </ul>
      <h3>Compression Settings</h3>
      <p><strong>Quality:</strong> Higher quality preserves more detail but creates larger files. 80% is ideal for most uses.</p>
      <p><strong>Max Width:</strong> Resize large images to fit within this width. Original aspect ratio is maintained.</p>
      <h3>Privacy First</h3>
      <p>All compression happens locally in your browser. Your images never leave your device - no server uploads, no data collection.</p>
      <h3>Tips for Best Results</h3>
      <ul>
        <li>Start with medium quality and adjust if needed.</li>
        <li>Use 1920px width for web, 4096px for print.</li>
        <li>PNG files may convert to JPG for better compression.</li>
      </ul>
    `,
  });
}

function init(): void {
  initFileUpload('img-upload', (files) => {
    selectedFiles = [...selectedFiles, ...Array.from(files).filter(f => f.type.startsWith('image/'))];
    updateFileList();
  });
  document.getElementById('compress-btn')?.addEventListener('click', handleCompress);
}

function updateFileList(): void {
  const list = document.getElementById('file-list')!;
  list.innerHTML = selectedFiles.map(f => `<div class="file-row"><span>${f.name}</span><span>${formatFileSize(f.size)}</span></div>`).join('');
  document.getElementById('options')?.classList.remove('hidden');
  (document.getElementById('compress-btn') as HTMLButtonElement).disabled = selectedFiles.length === 0;
}

async function handleCompress(): Promise<void> {
  if (selectedFiles.length === 0) return;
  showLoading('Compressing images...');
  try {
    const quality = parseFloat((document.getElementById('quality') as HTMLSelectElement).value);
    const maxWidth = parseInt((document.getElementById('max-width') as HTMLInputElement).value);

    for (const file of selectedFiles) {
      const compressed = await compressImage(file, { quality, maxWidthOrHeight: maxWidth });
      const savings = ((1 - compressed.size / file.size) * 100).toFixed(0);
      downloadFile(compressed, file.name.replace(/(\.\w+)$/, '_compressed$1'));
      showToast(`${file.name}: Reduced ${savings}%`, 'success');
    }
  } catch (e) {
    showToast('Compression failed', 'error');
  } finally {
    hideLoading();
  }
}
