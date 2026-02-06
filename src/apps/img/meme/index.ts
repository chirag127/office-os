/**
 * Office OS - Meme Generator Tool
 */
import { addMemeText } from '../../../services/image';
import { downloadFile, readFileAsDataURL } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderMemeGenerator(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Meme Generator',
    description: 'Add text to images - create memes easily',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop an image to meme' })}
      <div id="meme-editor" class="meme-editor hidden">
        <div class="preview-container"><canvas id="preview-canvas"></canvas></div>
        <div class="text-controls">
          <label>Top Text<input type="text" id="top-text" class="input" placeholder="TOP TEXT" maxlength="100"></label>
          <label>Bottom Text<input type="text" id="bottom-text" class="input" placeholder="BOTTOM TEXT" maxlength="100"></label>
          <label>Font Size<input type="range" id="font-size" min="20" max="100" value="48"><span id="font-size-val">48px</span></label>
        </div>
      </div>
      ${renderActionButtons([{ id: 'generate-btn', label: 'Create Meme', icon: '😂', primary: true, disabled: true }])}
      <style>.meme-editor{margin:var(--space-lg) 0;}.preview-container{text-align:center;margin-bottom:var(--space-lg);background:#222;padding:var(--space-lg);border-radius:var(--radius-md);}#preview-canvas{max-width:100%;border-radius:var(--radius-sm);}.text-controls{display:flex;flex-direction:column;gap:var(--space-lg);padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.text-controls label{display:flex;flex-direction:column;gap:var(--space-sm);}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Free Meme Generator Online</h2>
      <p>Create memes quickly with our easy-to-use meme generator. Add top and bottom text to any image. No watermarks, no signup required.</p>
      <h3>How to Create Memes</h3>
      <ol>
        <li>Upload your image</li>
        <li>Add top and bottom text</li>
        <li>Adjust font size as needed</li>
        <li>Click "Create Meme" to download</li>
      </ol>
      <h3>Meme Text Style</h3>
      <p>Our generator uses the classic meme style: bold white text with a black outline. This ensures your text is readable on any background.</p>
      <h3>Tips for Great Memes</h3>
      <ul>
        <li>Keep text short and punchy</li>
        <li>Use popular meme templates</li>
        <li>Timing is everything - reference current events</li>
        <li>The best memes are relatable</li>
      </ul>
      <h3>Privacy</h3>
      <p>All meme creation happens locally in your browser. Your images are never uploaded to any server. Create memes with complete privacy.</p>
    `,
  });
}

let img: HTMLImageElement | null = null;

function init(): void {
  const canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  initFileUpload('img-upload', async (files) => {
    selectedFile = files[0];
    const dataUrl = await readFileAsDataURL(selectedFile!);
    img = new Image();
    img.onload = () => {
      canvas.width = img!.naturalWidth;
      canvas.height = img!.naturalHeight;
      renderPreview();
      document.getElementById('meme-editor')?.classList.remove('hidden');
      (document.getElementById('generate-btn') as HTMLButtonElement).disabled = false;
    };
    img.src = dataUrl;
  });

  ['top-text', 'bottom-text', 'font-size'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', (e) => {
      if (id === 'font-size') {
        document.getElementById('font-size-val')!.textContent = `${(e.target as HTMLInputElement).value}px`;
      }
      renderPreview();
    });
  });

  document.getElementById('generate-btn')?.addEventListener('click', handleGenerate);

  function renderPreview() {
    if (!img) return;
    ctx.drawImage(img, 0, 0);
    const fontSize = parseInt((document.getElementById('font-size') as HTMLInputElement).value);
    const topText = (document.getElementById('top-text') as HTMLInputElement).value.toUpperCase();
    const bottomText = (document.getElementById('bottom-text') as HTMLInputElement).value.toUpperCase();

    ctx.font = `bold ${fontSize}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = fontSize / 15;

    if (topText) {
      ctx.strokeText(topText, canvas.width / 2, fontSize + 10);
      ctx.fillText(topText, canvas.width / 2, fontSize + 10);
    }
    if (bottomText) {
      ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);
      ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);
    }
  }
}

async function handleGenerate(): Promise<void> {
  if (!selectedFile) return;
  showLoading('Creating meme...');
  try {
    const topText = (document.getElementById('top-text') as HTMLInputElement).value;
    const bottomText = (document.getElementById('bottom-text') as HTMLInputElement).value;
    const fontSize = parseInt((document.getElementById('font-size') as HTMLInputElement).value);

    const meme = await addMemeText(selectedFile, topText, bottomText, fontSize);
    downloadFile(meme, 'meme.png');
    showToast('Meme created!', 'success');
  } catch (e) {
    showToast('Failed to create meme', 'error');
  } finally {
    hideLoading();
  }
}
