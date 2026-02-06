/**
 * Office OS - Watermark Image Tool
 * Add text or image watermark to photos
 */
import { readFileAsDataURL, downloadFile } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderWatermarkImage(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Watermark Image',
    description: 'Protect your images with text or logo watermarks',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop base image' })}

      <div id="workspace" class="workspace hidden">
         <div class="sidebar">
            <div class="option-group">
                <label>Watermark Text</label>
                <input type="text" id="wm-text" class="input" value="CONFIDENTIAL">
            </div>

            <div class="option-group">
                <label>Color</label>
                <input type="color" id="wm-color" value="#ffffff">
            </div>

            <div class="option-group">
                <label>Opacity</label>
                <input type="range" id="wm-opacity" min="0" max="1" step="0.1" value="0.5">
            </div>

            <div class="option-group">
                <label>Size</label>
                <input type="range" id="wm-size" min="10" max="100" value="40">
            </div>

             <div class="option-group">
                <label>Position</label>
                <div class="position-grid">
                    <button class="pos-btn" data-pos="tl">↖</button>
                    <button class="pos-btn" data-pos="tc">↑</button>
                    <button class="pos-btn" data-pos="tr">↗</button>
                    <button class="pos-btn" data-pos="bl">↙</button>
                    <button class="pos-btn active" data-pos="bc">↓</button>
                    <button class="pos-btn" data-pos="br">↘</button>
                    <button class="pos-btn" data-pos="c">●</button>
                </div>
            </div>
         </div>

         <div class="preview-area">
            <canvas id="canvas-preview"></canvas>
         </div>
      </div>

      ${renderActionButtons([{ id: 'save-btn', label: 'Save Image', icon: '💾', primary: true, disabled: true }])}

      <style>
        .workspace { margin: var(--space-xl) 0; display: grid; grid-template-columns: 250px 1fr; gap: var(--space-lg); }
        @media (max-width: 768px) { .workspace { grid-template-columns: 1fr; } }

        .sidebar { background: var(--glass-bg); padding: var(--space-md); border-radius: var(--radius-lg); border: 1px solid var(--glass-border); }
        .option-group { margin-bottom: var(--space-md); }
        .option-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9rem; }
        .input { width: 100%; padding: 8px; border: 1px solid var(--glass-border); border-radius: var(--radius-sm); }

        .position-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; width: 120px; }
        .pos-btn { aspect-ratio: 1; border: 1px solid var(--glass-border); background: var(--glass-bg); border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
        .pos-btn:hover { background: rgba(0,0,0,0.05); }
        .pos-btn.active { background: var(--color-accent-primary); color: white; border-color: transparent; }

        .preview-area {
            background: #eee;
            border-radius: var(--radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            min-height: 400px;
        }

        #canvas-preview { max-width: 100%; max-height: 500px; box-shadow: var(--shadow-md); }
        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>Add Watermark to Image Online</h2>
      <p>Protect your photos with customizable text watermarks. Adjust transparency, position, and font size easily.</p>
    `
  });
}

function init(): void {
  initFileUpload('img-upload', async (files) => {
    if (files[0]) {
      selectedFile = files[0];
      await updatePreview();

      document.getElementById('workspace')?.classList.remove('hidden');
      (document.getElementById('save-btn') as HTMLButtonElement).disabled = false;
    }
  });

  // Listeners
  ['wm-text', 'wm-color', 'wm-opacity', 'wm-size'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updatePreview);
  });

  const posBtns = document.querySelectorAll('.pos-btn');
  posBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        posBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updatePreview();
    });
  });

  document.getElementById('save-btn')?.addEventListener('click', saveImage);
}

async function updatePreview(): Promise<void> {
    if (!selectedFile) return;

    const canvas = document.getElementById('canvas-preview') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = await readFileAsDataURL(selectedFile);
    await new Promise(r => img.onload = r);

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw Base Image
    ctx.drawImage(img, 0, 0);

    // Draw Watermark
    const text = (document.getElementById('wm-text') as HTMLInputElement).value || 'Watermark';
    const color = (document.getElementById('wm-color') as HTMLInputElement).value;
    const opacity = parseFloat((document.getElementById('wm-opacity') as HTMLInputElement).value);
    const size = parseInt((document.getElementById('wm-size') as HTMLInputElement).value);
    const position = document.querySelector('.pos-btn.active')?.getAttribute('data-pos') || 'bc';

    // Scale font relative to image width to make "size" input meaningful across resolutions
    const fontSize = (canvas.width * size) / 1000 * 2; // rough styling

    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textBaseline = 'middle';

    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize; // Approx

    const margin = canvas.width * 0.05;

    let x = 0, y = 0;

    if (position === 'c') { x = (canvas.width - textWidth)/2; y = canvas.height/2; }
    else if (position.includes('l')) x = margin;
    else if (position.includes('r')) x = canvas.width - textWidth - margin;
    else x = (canvas.width - textWidth)/2;

    if (position !== 'c') {
        if (position.includes('t')) y = margin + textHeight/2;
        else y = canvas.height - margin - textHeight/2;
    }

    ctx.fillText(text, x, y);
}

async function saveImage(): Promise<void> {
    const canvas = document.getElementById('canvas-preview') as HTMLCanvasElement;

    canvas.toBlob((blob) => {
        if (blob && selectedFile) {
            downloadFile(blob, `${selectedFile.name.replace(/\.[^/.]+$/, "")}_watermarked.jpg`);
            showToast('Image saved!', 'success');
        } else {
            showToast('Failed to save', 'error');
        }
    }, 'image/jpeg', 0.9);
}
