/**
 * Office OS - Convert Image Tool
 */
import { convertFormat } from '../../../services/image';
import { downloadFile, readFileAsDataURL } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderConvertImage(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Convert Image Format',
    description: 'Convert between JPG, PNG, and WebP formats',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop an image here' })}
      <div id="options" class="options hidden">
        <div class="preview-container"><img id="preview" class="preview-img" alt="Preview"></div>
        <label>Convert To<select id="format" class="input">
          <option value="image/jpeg">JPG</option>
          <option value="image/png">PNG</option>
          <option value="image/webp">WebP</option>
        </select></label>
        <label>Quality (for JPG/WebP)<input type="range" id="quality" min="10" max="100" value="85"><span id="quality-val">85%</span></label>
      </div>
      ${renderActionButtons([{ id: 'convert-btn', label: 'Convert Image', icon: '🔄', primary: true, disabled: true }])}
      <style>.options{margin:var(--space-lg) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);display:flex;flex-direction:column;gap:var(--space-lg);}.preview-container{text-align:center;}.preview-img{max-width:100%;max-height:200px;border-radius:var(--radius-md);}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Convert Image Format Online</h2>
      <p>Convert images between JPG, PNG, and WebP formats. Our free converter works in your browser for complete privacy.</p>
      <h3>Format Comparison</h3>
      <ul>
        <li><strong>JPG:</strong> Best for photos. Smaller file size with lossy compression. No transparency support.</li>
        <li><strong>PNG:</strong> Best for graphics, logos, screenshots. Lossless compression. Supports transparency.</li>
        <li><strong>WebP:</strong> Modern format with superior compression. Supports both lossy and lossless. Great for web use.</li>
      </ul>
      <h3>When to Convert</h3>
      <ul>
        <li><strong>To JPG:</strong> When you need smaller files and don't need transparency.</li>
        <li><strong>To PNG:</strong> For logos, graphics, or when transparency is needed.</li>
        <li><strong>To WebP:</strong> For modern websites that need optimal file size and quality.</li>
      </ul>
      <h3>Quality Setting</h3>
      <p>Applies to JPG and WebP conversions. Higher quality means larger files. 85% is a good balance for most uses.</p>
      <h3>Privacy</h3>
      <p>All conversion happens locally in your browser. Your images are never uploaded to any server.</p>
    `,
  });
}

function init(): void {
  initFileUpload('img-upload', async (files) => {
    selectedFile = files[0];
    const dataUrl = await readFileAsDataURL(selectedFile!);
    (document.getElementById('preview') as HTMLImageElement).src = dataUrl;
    document.getElementById('options')?.classList.remove('hidden');
    (document.getElementById('convert-btn') as HTMLButtonElement).disabled = false;
  });

  document.getElementById('quality')?.addEventListener('input', (e) => {
    document.getElementById('quality-val')!.textContent = `${(e.target as HTMLInputElement).value}%`;
  });

  document.getElementById('convert-btn')?.addEventListener('click', handleConvert);
}

async function handleConvert(): Promise<void> {
  if (!selectedFile) return;
  showLoading('Converting image...');
  try {
    const format = (document.getElementById('format') as HTMLSelectElement).value as 'image/jpeg' | 'image/png' | 'image/webp';
    const quality = parseInt((document.getElementById('quality') as HTMLInputElement).value) / 100;
    const converted = await convertFormat(selectedFile, format, quality);
    const ext = format.split('/')[1];
    downloadFile(converted, selectedFile.name.replace(/\.\w+$/, `.${ext}`));
    showToast('Image converted!', 'success');
  } catch (e) {
    showToast('Conversion failed', 'error');
  } finally {
    hideLoading();
  }
}
