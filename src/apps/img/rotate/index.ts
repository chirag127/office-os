/**
 * Office OS - Rotate Image Tool
 * Rotate images by 90-degree increments or arbitrary angles
 */
import { readFileAsDataURL, downloadFile } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;
let currentRotation = 0;

export function renderRotateImage(): string {
  selectedFile = null;
  currentRotation = 0;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Rotate Image',
    description: 'Rotate images online. Fix orientation or rotate 90 degrees.',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop image to rotate' })}

      <div id="workspace" class="workspace hidden">
         <div class="toolbar">
            <button class="btn btn-sm" onclick="window.setRotation(-90)">↺ -90°</button>
            <button class="btn btn-sm" onclick="window.setRotation(90)">↻ +90°</button>
            <button class="btn btn-sm" onclick="window.setRotation(-180)">180°</button>
         </div>
         <div class="preview-container">
            <img id="image-preview" src="" alt="Preview">
         </div>
         <div class="rotation-display">Current Rotation: <span id="rot-value">0</span>°</div>
      </div>

      ${renderActionButtons([{ id: 'save-btn', label: 'Save Image', icon: '💾', primary: true, disabled: true }])}

      <style>
        .workspace { margin: var(--space-xl) 0; text-align: center; }
        .toolbar { display: flex; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-md); }

        .preview-container {
            max-width: 100%;
            height: 400px;
            background: var(--glass-bg); // Chequered pattern would be better
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        #image-preview {
            max-width: 100%;
            max-height: 100%;
            transition: transform 0.3s ease;
        }

        .rotation-display { margin-top: var(--space-md); color: var(--color-text-secondary); }
        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>Rotate Images Online Free</h2>
      <p>Easily rotate photos and images. Supports JPG, PNG, WEBP, and more. secure client-side processing.</p>
    `
  });
}

function init(): void {
  initFileUpload('img-upload', async (files) => {
    if (files[0]) {
      selectedFile = files[0];
      const dataUrl = await readFileAsDataURL(selectedFile);
      const img = document.getElementById('image-preview') as HTMLImageElement;
      img.src = dataUrl;

      document.getElementById('workspace')?.classList.remove('hidden');
      (document.getElementById('save-btn') as HTMLButtonElement).disabled = false;
    }
  });

  (window as any).setRotation = (deg: number) => {
     if (Math.abs(deg) === 180) currentRotation += 180;
     else currentRotation += deg;

     const img = document.getElementById('image-preview');
     if (img) img.style.transform = `rotate(${currentRotation}deg)`;

     const label = document.getElementById('rot-value');
     if (label) label.textContent = currentRotation.toString();
  };

  document.getElementById('save-btn')?.addEventListener('click', saveImage);
}

async function saveImage(): Promise<void> {
    if (!selectedFile) return;
    showLoading('Saving image...');

    try {
        const img = document.getElementById('image-preview') as HTMLImageElement;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const image = new Image();
        image.src = img.src;
        await new Promise(r => image.onload = r);

        // Calculate bounding box
        const angle = (currentRotation * Math.PI) / 180;
        const absCos = Math.abs(Math.cos(angle));
        const absSin = Math.abs(Math.sin(angle));

        canvas.width = image.width * absCos + image.height * absSin;
        canvas.height = image.width * absSin + image.height * absCos;

        if (ctx) {
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(angle);
            ctx.drawImage(image, -image.width/2, -image.height/2);

            canvas.toBlob((blob) => {
                if (blob) {
                    downloadFile(blob, `${selectedFile?.name.replace(/\.[^/.]+$/, "")}_rotated.png`); // Always PNG to preserve transparency
                    showToast('Image saved!', 'success');
                } else {
                    showToast('Failed to create image blob', 'error');
                }
                hideLoading();
            }, 'image/png');
        }
    } catch (e) {
        console.error(e);
        showToast('Failed to save image', 'error');
        hideLoading();
    }
}
