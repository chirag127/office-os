/**
 * Office OS - Resize Image Tool
 */
import { resizeImage } from '../../../services/image';
import { downloadFile, readFileAsDataURL } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;
let originalWidth = 0;
let originalHeight = 0;

export function renderResizeImage(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Resize Image',
    description: 'Change image dimensions while maintaining quality',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop an image here' })}
      <div id="options" class="options hidden">
        <div class="preview-container"><img id="preview" class="preview-img" alt="Preview"></div>
        <div class="dimensions">
          <label>Width<input type="number" id="width" class="input" min="1" max="8000"></label>
          <label class="lock-label"><input type="checkbox" id="lock-ratio" checked> 🔗 Lock Ratio</label>
          <label>Height<input type="number" id="height" class="input" min="1" max="8000"></label>
        </div>
        <div class="original-size">Original: <span id="original-dims"></span></div>
      </div>
      ${renderActionButtons([{ id: 'resize-btn', label: 'Resize Image', icon: '📐', primary: true, disabled: true }])}
      <style>.options{margin:var(--space-lg) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.preview-container{text-align:center;margin-bottom:var(--space-lg);}.preview-img{max-width:100%;max-height:200px;border-radius:var(--radius-md);}.dimensions{display:flex;gap:var(--space-md);align-items:center;}.dimensions label{flex:1;display:flex;flex-direction:column;gap:var(--space-xs);}.lock-label{flex:0;align-items:center;}.original-size{margin-top:var(--space-md);color:var(--color-text-tertiary);font-size:var(--font-size-sm);}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Resize Images Online - Change Dimensions</h2>
      <p>Resize your images to exact dimensions. Our free tool maintains aspect ratio by default and works entirely in your browser for privacy.</p>
      <h3>Common Resize Uses</h3>
      <ul>
        <li><strong>Social Media:</strong> Fit images to platform requirements (Instagram, Facebook, Twitter).</li>
        <li><strong>Websites:</strong> Optimize images for faster loading.</li>
        <li><strong>Email:</strong> Reduce dimensions for smaller file sizes.</li>
        <li><strong>Printing:</strong> Scale to exact print dimensions.</li>
      </ul>
      <h3>Lock Aspect Ratio</h3>
      <p>When locked, changing width automatically adjusts height proportionally (and vice versa). Unlock to set custom dimensions, which may stretch or distort the image.</p>
      <h3>Quality Preservation</h3>
      <p>Our resizer uses high-quality bicubic interpolation to maintain image sharpness. Results are best when reducing size; enlarging may introduce softness.</p>
      <h3>Privacy</h3>
      <p>All processing happens locally in your browser. Your images are never uploaded to any server.</p>
    `,
  });
}

function init(): void {
  initFileUpload('img-upload', async (files) => {
    selectedFile = files[0];
    const dataUrl = await readFileAsDataURL(selectedFile!);
    const img = new Image();
    img.onload = () => {
      originalWidth = img.naturalWidth;
      originalHeight = img.naturalHeight;
      (document.getElementById('width') as HTMLInputElement).value = String(originalWidth);
      (document.getElementById('height') as HTMLInputElement).value = String(originalHeight);
      document.getElementById('original-dims')!.textContent = `${originalWidth} × ${originalHeight}`;
      (document.getElementById('preview') as HTMLImageElement).src = dataUrl;
      document.getElementById('options')?.classList.remove('hidden');
      (document.getElementById('resize-btn') as HTMLButtonElement).disabled = false;
    };
    img.src = dataUrl;
  });

  document.getElementById('width')?.addEventListener('input', (e) => {
    if ((document.getElementById('lock-ratio') as HTMLInputElement).checked) {
      const ratio = originalHeight / originalWidth;
      const newWidth = parseInt((e.target as HTMLInputElement).value) || 1;
      (document.getElementById('height') as HTMLInputElement).value = String(Math.round(newWidth * ratio));
    }
  });

  document.getElementById('height')?.addEventListener('input', (e) => {
    if ((document.getElementById('lock-ratio') as HTMLInputElement).checked) {
      const ratio = originalWidth / originalHeight;
      const newHeight = parseInt((e.target as HTMLInputElement).value) || 1;
      (document.getElementById('width') as HTMLInputElement).value = String(Math.round(newHeight * ratio));
    }
  });

  document.getElementById('resize-btn')?.addEventListener('click', handleResize);
}

async function handleResize(): Promise<void> {
  if (!selectedFile) return;
  showLoading('Resizing image...');
  try {
    const width = parseInt((document.getElementById('width') as HTMLInputElement).value);
    const height = parseInt((document.getElementById('height') as HTMLInputElement).value);
    const resized = await resizeImage(selectedFile, { width, height });
    downloadFile(resized, selectedFile.name.replace(/(\.\w+)$/, `_${width}x${height}$1`));
    showToast('Image resized!', 'success');
  } catch (e) {
    showToast('Resize failed', 'error');
  } finally {
    hideLoading();
  }
}
