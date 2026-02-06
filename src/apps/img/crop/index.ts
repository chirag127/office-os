/**
 * Office OS - Crop Image Tool
 */
import { cropImage } from '../../../services/image';
import { downloadFile, readFileAsDataURL } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;
let originalWidth = 0;
let originalHeight = 0;

export function renderCropImage(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Crop Image',
    description: 'Trim images to specific dimensions or aspect ratios',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop an image here' })}
      <div id="options" class="options hidden">
        <div class="preview-container"><img id="preview" class="preview-img" alt="Preview"></div>
        <div class="aspect-presets">
          <button class="btn btn-secondary preset" data-ratio="free">Free</button>
          <button class="btn btn-secondary preset" data-ratio="1:1">1:1</button>
          <button class="btn btn-secondary preset" data-ratio="4:3">4:3</button>
          <button class="btn btn-secondary preset" data-ratio="16:9">16:9</button>
          <button class="btn btn-secondary preset" data-ratio="9:16">9:16</button>
        </div>
        <div class="crop-inputs">
          <label>X<input type="number" id="crop-x" class="input" value="0" min="0"></label>
          <label>Y<input type="number" id="crop-y" class="input" value="0" min="0"></label>
          <label>Width<input type="number" id="crop-w" class="input" min="1"></label>
          <label>Height<input type="number" id="crop-h" class="input" min="1"></label>
        </div>
      </div>
      ${renderActionButtons([{ id: 'crop-btn', label: 'Crop Image', icon: '✂️', primary: true, disabled: true }])}
      <style>.options{margin:var(--space-lg) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.preview-container{text-align:center;margin-bottom:var(--space-lg);}.preview-img{max-width:100%;max-height:200px;border-radius:var(--radius-md);}.aspect-presets{display:flex;gap:var(--space-sm);margin-bottom:var(--space-lg);flex-wrap:wrap;}.preset.active{background:var(--color-accent-gradient);color:white;}.crop-inputs{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-md);}.crop-inputs label{display:flex;flex-direction:column;gap:var(--space-xs);font-size:var(--font-size-sm);}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Crop Images Online - Free Image Cropper</h2>
      <p>Crop images to exact dimensions or popular aspect ratios. Our free online tool works entirely in your browser.</p>
      <h3>Aspect Ratio Presets</h3>
      <ul>
        <li><strong>1:1:</strong> Square - perfect for profile pictures, Instagram posts</li>
        <li><strong>4:3:</strong> Classic photo ratio</li>
        <li><strong>16:9:</strong> Widescreen - ideal for YouTube thumbnails, presentations</li>
        <li><strong>9:16:</strong> Vertical - Stories, Reels, TikTok</li>
        <li><strong>Free:</strong> Custom dimensions</li>
      </ul>
      <h3>How to Crop</h3>
      <ol>
        <li>Upload your image</li>
        <li>Select an aspect ratio or use free mode</li>
        <li>Adjust X, Y position and dimensions</li>
        <li>Click "Crop Image" to download</li>
      </ol>
      <h3>Privacy</h3>
      <p>All cropping happens locally in your browser. Your images never leave your device.</p>
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
      (document.getElementById('crop-w') as HTMLInputElement).value = String(originalWidth);
      (document.getElementById('crop-h') as HTMLInputElement).value = String(originalHeight);
      (document.getElementById('preview') as HTMLImageElement).src = dataUrl;
      document.getElementById('options')?.classList.remove('hidden');
      (document.getElementById('crop-btn') as HTMLButtonElement).disabled = false;
    };
    img.src = dataUrl;
  });

  document.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const ratio = (btn as HTMLElement).dataset.ratio!;
      if (ratio !== 'free') {
        const [w, h] = ratio.split(':').map(Number);
        const newWidth = Math.min(originalWidth, Math.round(originalHeight * (w / h)));
        const newHeight = Math.round(newWidth * (h / w));
        (document.getElementById('crop-w') as HTMLInputElement).value = String(newWidth);
        (document.getElementById('crop-h') as HTMLInputElement).value = String(newHeight);
      }
    });
  });

  document.getElementById('crop-btn')?.addEventListener('click', handleCrop);
}

async function handleCrop(): Promise<void> {
  if (!selectedFile) return;
  showLoading('Cropping image...');
  try {
    const x = parseInt((document.getElementById('crop-x') as HTMLInputElement).value);
    const y = parseInt((document.getElementById('crop-y') as HTMLInputElement).value);
    const width = parseInt((document.getElementById('crop-w') as HTMLInputElement).value);
    const height = parseInt((document.getElementById('crop-h') as HTMLInputElement).value);
    const cropped = await cropImage(selectedFile, { x, y, width, height });
    downloadFile(cropped, selectedFile.name.replace(/(\.\w+)$/, '_cropped$1'));
    showToast('Image cropped!', 'success');
  } catch (e) {
    showToast('Cropping failed', 'error');
  } finally {
    hideLoading();
  }
}
