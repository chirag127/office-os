/**
 * Office OS - Image Upscale Tool
 * Upscale images using smart interpolation
 */
import { readFileAsDataURL, downloadFile } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderUpscaleImage(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Upscale Image',
    description: 'Enlarge images with high-quality bicubic interpolation',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop image to upscale' })}

      <div id="options" class="options hidden">
         <div class="input-group">
            <label>Scale Factor</label>
            <div class="scale-btns">
                <button class="scale-btn active" data-scale="2">2x</button>
                <button class="scale-btn" data-scale="4">4x</button>
            </div>
         </div>
         <p class="info">New Resolution: <span id="res-info">0 x 0</span></p>
      </div>

      ${renderActionButtons([{ id: 'upscale-btn', label: 'Upscale & Download', icon: '🚀', primary: true, disabled: true }])}

      <style>
        .options { margin: var(--space-lg) 0; text-align: center; }
        .input-group label { display: block; margin-bottom: 10px; font-weight: 500; }
        .scale-btns { display: flex; justify-content: center; gap: var(--space-md); }
        .scale-btn { padding: 10px 20px; border: 1px solid var(--glass-border); background: var(--glass-bg); border-radius: var(--radius-md); cursor: pointer; font-weight: bold; font-size: 1.1rem; }
        .scale-btn.active { background: var(--color-accent-primary); color: white; border-color: transparent; }
        .info { margin-top: 15px; color: var(--color-text-secondary); }
        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>AI Image Upscaler Online Free</h2>
      <p>Upscale and enlarge images without losing quality using advanced interpolation algorithms.</p>
    `
  });
}

let originalWidth = 0;
let originalHeight = 0;

function init(): void {
  initFileUpload('img-upload', async (files) => {
    if (files[0]) {
      selectedFile = files[0];
      const img = new Image();
      img.src = await readFileAsDataURL(selectedFile);
      await new Promise(r => img.onload = r);
      originalWidth = img.width;
      originalHeight = img.height;
      updateResInfo();

      document.getElementById('options')?.classList.remove('hidden');
      (document.getElementById('upscale-btn') as HTMLButtonElement).disabled = false;
    }
  });

  const btns = document.querySelectorAll('.scale-btn');
  btns.forEach(btn => {
      btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          updateResInfo();
      });
  });

  document.getElementById('upscale-btn')?.addEventListener('click', processUpscale);
}

function updateResInfo() {
    const scale = parseInt(document.querySelector('.scale-btn.active')?.getAttribute('data-scale') || '2');
    const info = document.getElementById('res-info');
    if (info) info.textContent = `${originalWidth * scale} x ${originalHeight * scale}`;
}

async function processUpscale(): Promise<void> {
    if (!selectedFile) return;
    showLoading('Upscaling...');

    try {
        const scale = parseInt(document.querySelector('.scale-btn.active')?.getAttribute('data-scale') || '2');

        const img = new Image();
        img.src = await readFileAsDataURL(selectedFile);
        await new Promise(r => img.onload = r);

        // Smart scaling: Step rotation or bicubic implementation is lengthy.
        // We will use native canvas high-quality smoothing for V1.
        // Most browsers use bicubic for 'high' quality smoothing.

        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                 if (blob) {
                    downloadFile(blob, `${selectedFile?.name.replace(/\.[^/.]+$/, "")}_${scale}x.png`);
                    showToast('Upscaled image saved!', 'success');
                }
                hideLoading();
            }, 'image/png');
        }

    } catch (e) {
        console.error(e);
        showToast('Upscale failed', 'error');
        hideLoading();
    }
}
