/**
 * Office OS - Image Editor Tool
 * All-in-one photo editor (Filters, Adjustments)
 */
import { readFileAsDataURL, downloadFile } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

// Filters state
const filters = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0
};

export function renderImageEditor(): string {
  selectedFile = null;
  resetFilters();
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Photo Editor',
    description: 'Edit photos with professional filters and adjustments.',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop photo to edit' })}

      <div id="workspace" class="workspace hidden">
         <div class="editor-panels">
            <div class="panel controls">
                <h3>Adjustments</h3>

                <div class="control-group">
                    <label>Brightness</label>
                    <input type="range" id="f-brightness" min="0" max="200" value="100">
                </div>
                <div class="control-group">
                    <label>Contrast</label>
                    <input type="range" id="f-contrast" min="0" max="200" value="100">
                </div>
                <div class="control-group">
                    <label>Saturation</label>
                    <input type="range" id="f-saturation" min="0" max="200" value="100">
                </div>
                <div class="control-group">
                    <label>Blur</label>
                    <input type="range" id="f-blur" min="0" max="10" value="0" step="0.5">
                </div>

                <h3>Filters</h3>
                <div class="filter-buttons">
                    <button class="filter-btn" onclick="window.applyPreset('grayscale')">B&W</button>
                    <button class="filter-btn" onclick="window.applyPreset('sepia')">Sepia</button>
                    <button class="filter-btn" onclick="window.applyPreset('invert')">Invert</button>
                    <button class="filter-btn" onclick="window.applyPreset('reset')">Reset</button>
                </div>
            </div>

            <div class="panel preview">
                <img id="edit-preview" src="" alt="Edit Preview">
            </div>
         </div>
      </div>

      ${renderActionButtons([{ id: 'save-btn', label: 'Save Image', icon: '💾', primary: true, disabled: true }])}

      <style>
        .workspace { margin: var(--space-xl) 0; }

        .editor-panels {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: var(--space-lg);
            height: 500px;
        }
        @media (max-width: 768px) { .editor-panels { grid-template-columns: 1fr; height: auto; } }

        .panel { background: var(--glass-bg); padding: var(--space-md); border-radius: var(--radius-lg); border: 1px solid var(--glass-border); }
        .controls { overflow-y: auto; }

        .preview { display: flex; align-items: center; justify-content: center; overflow: hidden; background: #222; }
        #edit-preview { max-width: 100%; max-height: 100%; object-fit: contain; }

        h3 { font-size: 1rem; margin-bottom: 15px; color: var(--color-text-primary); border-bottom: 1px solid var(--glass-border); padding-bottom: 5px; }

        .control-group { margin-bottom: 15px; }
        .control-group label { display: block; margin-bottom: 5px; font-size: 0.9rem; color: var(--color-text-secondary); }
        input[type=range] { width: 100%; }

        .filter-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .filter-btn { padding: 8px; border: 1px solid var(--glass-border); background: var(--glass-bg); border-radius: var(--radius-sm); cursor: pointer; }
        .filter-btn:hover { background: rgba(0,0,0,0.05); }

        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>Free Online Photo Editor</h2>
      <p>Edit images in your browser. Adjust brightness, contrast, and apply filters instantly.</p>
    `
  });
}

function resetFilters() {
    filters.brightness = 100;
    filters.contrast = 100;
    filters.saturation = 100;
    filters.blur = 0;
    filters.grayscale = 0;
    filters.sepia = 0;
    filters.invert = 0;
}

function init(): void {
  initFileUpload('img-upload', async (files) => {
    if (files[0]) {
      selectedFile = files[0];
      const dataUrl = await readFileAsDataURL(selectedFile);
      const img = document.getElementById('edit-preview') as HTMLImageElement;
      img.src = dataUrl;

      document.getElementById('workspace')?.classList.remove('hidden');
      (document.getElementById('save-btn') as HTMLButtonElement).disabled = false;

      resetFilters();
      updateInputs();
    }
  });

  // Inputs
  ['brightness', 'contrast', 'saturation', 'blur'].forEach(key => {
      document.getElementById(`f-${key}`)?.addEventListener('input', (e) => {
          (filters as any)[key] = parseFloat((e.target as HTMLInputElement).value);
          updatePreview();
      });
  });

  // Preset Handler
  (window as any).applyPreset = (preset: string) => {
      if (preset === 'reset') {
          resetFilters();
      } else if (preset === 'grayscale') {
          filters.grayscale = filters.grayscale ? 0 : 100;
      } else if (preset === 'sepia') {
          filters.sepia = filters.sepia ? 0 : 100;
      } else if (preset === 'invert') {
          filters.invert = filters.invert ? 0 : 100;
      }
      updateInputs();
      updatePreview();
  };

  document.getElementById('save-btn')?.addEventListener('click', saveImage);
}

function updateInputs() {
    ['brightness', 'contrast', 'saturation', 'blur'].forEach(key => {
        const input = document.getElementById(`f-${key}`) as HTMLInputElement;
        if (input) input.value = (filters as any)[key];
    });
}

function updatePreview() {
    const img = document.getElementById('edit-preview');
    if (img) {
        img.style.filter = getFilterString();
    }
}

function getFilterString(): string {
    return `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        blur(${filters.blur}px)
        grayscale(${filters.grayscale}%)
        sepia(${filters.sepia}%)
        invert(${filters.invert}%)
    `;
}

async function saveImage(): Promise<void> {
    if (!selectedFile) return;
    showLoading('Saving image...');

    try {
        const img = document.getElementById('edit-preview') as HTMLImageElement;

        // Use Canvas to bake the CSS filters
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const image = new Image();
        image.src = img.src;
        await new Promise(r => image.onload = r);

        canvas.width = image.width;
        canvas.height = image.height;

        if (ctx) {
            // Apply filters to context
            ctx.filter = getFilterString();
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) {
                    downloadFile(blob, `${selectedFile?.name.replace(/\.[^/.]+$/, "")}_edited.png`);
                    showToast('Image saved!', 'success');
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
