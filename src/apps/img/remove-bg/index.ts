/**
 * Office OS - Remove Background Tool
 */
import { removeBackground } from '../../../services/image';
import { downloadFile, readFileAsDataURL } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderRemoveBackground(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Remove Background',
    description: 'Create transparent backgrounds from images',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop an image here' })}
      <div id="preview-area" class="preview-area hidden">
        <div class="preview-box"><span class="preview-label">Original</span><img id="preview-original" class="preview-img" alt="Original"></div>
        <div class="preview-box"><span class="preview-label">Result</span><div id="preview-result" class="result-preview checkered"><img id="result-img" class="preview-img" alt="Result"></div></div>
      </div>
      ${renderActionButtons([{ id: 'remove-btn', label: 'Remove Background', icon: '🎭', primary: true, disabled: true }])}
      <style>.preview-area{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);margin:var(--space-lg) 0;}.preview-box{text-align:center;}.preview-label{display:block;margin-bottom:var(--space-sm);color:var(--color-text-tertiary);font-size:var(--font-size-sm);}.preview-img{max-width:100%;max-height:200px;border-radius:var(--radius-md);}.checkered{background:repeating-conic-gradient(#808080 0% 25%,#fff 0% 50%) 50% / 20px 20px;padding:var(--space-md);border-radius:var(--radius-md);}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Remove Image Background Online</h2>
      <p>Create transparent backgrounds for your images. Perfect for product photos, portraits, and graphics. Our tool uses AI-powered background detection for accurate results.</p>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>E-commerce:</strong> Clean product photos with transparent backgrounds</li>
        <li><strong>Portraits:</strong> Remove distracting backgrounds from photos</li>
        <li><strong>Graphics:</strong> Create assets for designs and presentations</li>
        <li><strong>Social Media:</strong> Professional-looking profile pictures</li>
      </ul>
      <h3>How It Works</h3>
      <p>Our tool uses advanced Puter AI to detect the main subject and separate it from the background. The result is saved as a PNG with transparency.</p>
      <h3>Tips for Best Results</h3>
      <ul>
        <li>Use high-contrast images for better edge detection</li>
        <li>Simple backgrounds work best</li>
        <li>Ensure the subject is well-lit</li>
      </ul>
      <h3>Privacy</h3>
      <p>Background removal uses AI processing. Your image is processed securely and not stored after use.</p>
    `,
  });
}

function init(): void {
  initFileUpload('img-upload', async (files) => {
    selectedFile = files[0];
    const dataUrl = await readFileAsDataURL(selectedFile!);
    (document.getElementById('preview-original') as HTMLImageElement).src = dataUrl;
    document.getElementById('preview-area')?.classList.remove('hidden');
    (document.getElementById('remove-btn') as HTMLButtonElement).disabled = false;
  });

  document.getElementById('remove-btn')?.addEventListener('click', handleRemove);
}

async function handleRemove(): Promise<void> {
  if (!selectedFile) return;
  showLoading('Removing background with AI...');
  try {
    const result = await removeBackground(selectedFile);
    const resultUrl = URL.createObjectURL(result);
    (document.getElementById('result-img') as HTMLImageElement).src = resultUrl;
    downloadFile(result, selectedFile.name.replace(/(\.\w+)$/, '_nobg.png'));
    showToast('Background removed!', 'success');
  } catch (e) {
    showToast('Background removal requires Puter AI. Please ensure Puter is available.', 'info');
  } finally {
    hideLoading();
  }
}
