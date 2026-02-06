/**
 * Office OS - Blur Face Tool
 * Auto-detect and blur faces, or manual blur
 */
import * as blazeface from '@tensorflow-models/blazeface';
import { readFileAsDataURL, downloadFile } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;
let model: blazeface.BlazeFaceModel | null = null;

export function renderBlurFace(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Blur Face',
    description: 'Automatically detect and blur faces for privacy.',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop photo to anonymize' })}

      <div id="workspace" class="workspace hidden">
         <div class="toolbar">
            <button class="btn btn-sm" id="auto-detect-btn">✨ Detect & Blur Faces</button>
            <button class="btn btn-sm" id="reset-btn">Reset</button>
         </div>
         <div class="canvas-container">
            <canvas id="img-canvas"></canvas>
         </div>
         <div class="info-text">Click and drag to manually blur areas.</div>
      </div>

      ${renderActionButtons([{ id: 'save-btn', label: 'Save Image', icon: '💾', primary: true, disabled: true }])}

      <style>
        .workspace { margin: var(--space-xl) 0; }
        .toolbar { display: flex; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-md); }
        .canvas-container {
            display: flex;
            justify-content: center;
            overflow: auto;
            max-height: 500px;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
        }
        #img-canvas { max-width: 100%; cursor: crosshair; }
        .info-text { text-align: center; margin-top: 10px; color: var(--color-text-secondary); font-size: 0.9rem; }
        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>Blur Faces in Photos</h2>
      <p>Protect privacy by automatically detecting and blurring faces in your images using AI. Secure client-side processing.</p>
    `
  });
}

async function init(): Promise<void> {
  initFileUpload('img-upload', async (files) => {
    if (files[0]) {
      selectedFile = files[0];
      await loadImage(selectedFile);

      document.getElementById('workspace')?.classList.remove('hidden');
      (document.getElementById('save-btn') as HTMLButtonElement).disabled = false;

      // Pre-load model
      if (!model) {
         try {
             model = await blazeface.load();
         } catch (e) {
             console.error('Failed to load model', e);
         }
      }
    }
  });

  document.getElementById('auto-detect-btn')?.addEventListener('click', detectAndBlur);
  document.getElementById('reset-btn')?.addEventListener('click', () => { if(selectedFile) loadImage(selectedFile); });
  document.getElementById('save-btn')?.addEventListener('click', saveImage);

  setupManualBlur();
}

async function loadImage(file: File): Promise<void> {
    const dataUrl = await readFileAsDataURL(file);
    const img = new Image();
    img.src = dataUrl;
    await new Promise(r => img.onload = r);

    const canvas = document.getElementById('img-canvas') as HTMLCanvasElement;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);
}

function setupManualBlur() {
    const canvas = document.getElementById('img-canvas') as HTMLCanvasElement;
    let isDrawing = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        startX = (e.clientX - rect.left) * scaleX;
        startY = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!isDrawing) return;
        isDrawing = false;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const endX = (e.clientX - rect.left) * scaleX;
        const endY = (e.clientY - rect.top) * scaleY;

        const width = endX - startX;
        const height = endY - startY;

        applyBlur(startX, startY, width, height);
    });
}

function applyBlur(x: number, y: number, w: number, h: number) {
    const canvas = document.getElementById('img-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Normalize negatives (dragging backwards)
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }

    if (w < 5 || h < 5) return; // Too small

    // Pixelate Blur (Simpler and faster than Gaussian for client side JS in this context)
    // Upscaling a small version is a cheap blur trick

    // Create a temp canvas to downscale and upscale
    const tempCanvas = document.createElement('canvas');
    const factor = 0.1; // Amount of pixelation
    tempCanvas.width = Math.max(1, w * factor);
    tempCanvas.height = Math.max(1, h * factor);
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
        tempCtx.drawImage(canvas, x, y, w, h, 0, 0, tempCanvas.width, tempCanvas.height);

        // Draw back scaled up
        ctx.imageSmoothingEnabled = false; // Pixelate effect
        ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, x, y, w, h);
    }
}

async function detectAndBlur() {
    if (!model) {
        showLoading('Loading AI Model...');
        try {
            model = await blazeface.load();
        } catch (e) {
            showToast('Could not load AI model.', 'error');
            hideLoading();
            return;
        }
        hideLoading();
    }

    const canvas = document.getElementById('img-canvas') as HTMLCanvasElement;
    showLoading('Detecting faces...');

    try {
        const returnTensors = false;
        const predictions = await model.estimateFaces(canvas, returnTensors);

        if (predictions.length > 0) {
            predictions.forEach((prediction: any) => {
                const start = prediction.topLeft as [number, number];
                const end = prediction.bottomRight as [number, number];
                const size = [end[0] - start[0], end[1] - start[1]];

                // Expand blur area slightly
                const padding = size[0] * 0.2;
                applyBlur(start[0] - padding, start[1] - padding, size[0] + padding*2, size[1] + padding*2);
            });
            showToast(`Blurred ${predictions.length} faces.`, 'success');
        } else {
            showToast('No faces detected.', 'info');
        }
    } catch (e) {
        console.error(e);
        showToast('Detection failed.', 'error');
    } finally {
        hideLoading();
    }
}

async function saveImage(): Promise<void> {
    const canvas = document.getElementById('img-canvas') as HTMLCanvasElement;

    canvas.toBlob((blob) => {
        if (blob && selectedFile) {
            downloadFile(blob, `${selectedFile.name.replace(/\.[^/.]+$/, "")}_blurred.jpg`);
            showToast('Image saved!', 'success');
        } else {
            showToast('Failed to save', 'error');
        }
    }, 'image/jpeg', 0.9);
}
