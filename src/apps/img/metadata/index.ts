/**
 * Office OS - Image Metadata Tool
 */
import { stripMetadata } from '../../../services/image';
import { downloadFile, formatFileSize, readFileAsDataURL } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderMetadata(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Image Metadata',
    description: 'View and remove EXIF data from images',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop an image here' })}
      <div id="metadata-display" class="metadata-display hidden">
        <div class="preview-section"><img id="preview" class="preview-img" alt="Preview"></div>
        <div class="info-section">
          <h3>File Information</h3>
          <dl id="file-info" class="info-list"></dl>
          <div class="warning-box">⚠️ Images often contain hidden metadata including camera info, GPS location, date/time, and camera settings. Removing metadata protects your privacy.</div>
        </div>
      </div>
      ${renderActionButtons([{ id: 'strip-btn', label: 'Remove All Metadata', icon: '🗑️', primary: true, disabled: true }])}
      <style>.metadata-display{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);margin:var(--space-lg) 0;}.preview-section{text-align:center;}.preview-img{max-width:100%;max-height:250px;border-radius:var(--radius-md);}.info-section h3{margin-bottom:var(--space-md);}.info-list{display:grid;grid-template-columns:auto 1fr;gap:var(--space-sm);background:var(--glass-bg);padding:var(--space-lg);border-radius:var(--radius-md);}.info-list dt{color:var(--color-text-tertiary);}.info-list dd{font-weight:500;}.warning-box{margin-top:var(--space-lg);padding:var(--space-md);background:rgba(245,158,11,0.1);border-left:3px solid var(--color-warning);border-radius:var(--radius-sm);font-size:var(--font-size-sm);}.hidden{display:none!important;}@media(max-width:768px){.metadata-display{grid-template-columns:1fr;}}</style>
    `,
    seoContent: `
      <h2>View and Remove Image Metadata</h2>
      <p>Images contain hidden data that can reveal your location, camera, and personal information. Our tool lets you view and remove this metadata to protect your privacy.</p>
      <h3>What is Image Metadata?</h3>
      <p>EXIF (Exchangeable Image File Format) data is embedded in photos by cameras and phones. It can include:</p>
      <ul>
        <li><strong>GPS Location:</strong> Exact coordinates where the photo was taken</li>
        <li><strong>Date/Time:</strong> When the photo was captured</li>
        <li><strong>Camera Info:</strong> Device model, lens, settings</li>
        <li><strong>Software:</strong> Editing software used</li>
        <li><strong>Author:</strong> Photographer information</li>
      </ul>
      <h3>Why Remove Metadata?</h3>
      <ul>
        <li><strong>Privacy:</strong> Prevent sharing your location with strangers</li>
        <li><strong>Security:</strong> Protect personal information online</li>
        <li><strong>File Size:</strong> Smaller files without embedded data</li>
        <li><strong>Professional:</strong> Clean images for web publishing</li>
      </ul>
      <h3>Privacy</h3>
      <p>All metadata removal happens locally in your browser. Your images are never uploaded to any server.</p>
    `,
  });
}

function init(): void {
  initFileUpload('img-upload', async (files) => {
    selectedFile = files[0];
    const dataUrl = await readFileAsDataURL(selectedFile!);
    (document.getElementById('preview') as HTMLImageElement).src = dataUrl;

    document.getElementById('file-info')!.innerHTML = `
      <dt>Name</dt><dd>${selectedFile.name}</dd>
      <dt>Size</dt><dd>${formatFileSize(selectedFile.size)}</dd>
      <dt>Type</dt><dd>${selectedFile.type}</dd>
      <dt>Modified</dt><dd>${new Date(selectedFile.lastModified).toLocaleString()}</dd>
    `;

    document.getElementById('metadata-display')?.classList.remove('hidden');
    (document.getElementById('strip-btn') as HTMLButtonElement).disabled = false;
  });

  document.getElementById('strip-btn')?.addEventListener('click', handleStrip);
}

async function handleStrip(): Promise<void> {
  if (!selectedFile) return;
  showLoading('Removing metadata...');
  try {
    const stripped = await stripMetadata(selectedFile);
    const savings = selectedFile.size - stripped.size;
    downloadFile(stripped, selectedFile.name.replace(/(\.\w+)$/, '_clean$1'));
    showToast(`Metadata removed! Saved ${formatFileSize(savings)}`, 'success');
  } catch (e) {
    showToast('Failed to remove metadata', 'error');
  } finally {
    hideLoading();
  }
}
