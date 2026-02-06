/**
 * Office OS - Image Filter Tool
 */
import { applyFilterCSS } from '../../../services/image';
import { downloadFile, readFileAsDataURL } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

const filters: { name: string; value: string }[] = [
  { name: 'Original', value: 'none' },
  { name: 'Grayscale', value: 'grayscale(100%)' },
  { name: 'Sepia', value: 'sepia(100%)' },
  { name: 'Invert', value: 'invert(100%)' },
  { name: 'Saturate', value: 'saturate(200%)' },
  { name: 'Contrast', value: 'contrast(150%)' },
  { name: 'Brightness', value: 'brightness(120%)' },
  { name: 'Blur', value: 'blur(3px)' },
  { name: 'Vintage', value: 'sepia(40%) saturate(80%)' },
  { name: 'Cool', value: 'hue-rotate(180deg)' },
  { name: 'Warm', value: 'hue-rotate(30deg) saturate(120%)' },
  { name: 'Dramatic', value: 'contrast(130%) saturate(130%)' },
];

export function renderFilterImage(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Image Filters',
    description: 'Apply beautiful filters and effects to your images',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*', multiple: false, title: 'Drop an image here' })}
      <div id="options" class="options hidden">
        <div class="preview-container"><img id="preview" class="preview-img" alt="Preview"></div>
        <div class="filter-grid">
          ${filters.map((f, i) => `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-filter="${f.value}"><span class="filter-preview" style="filter:${f.value}"></span><span class="filter-name">${f.name}</span></button>`).join('')}
        </div>
      </div>
      ${renderActionButtons([{ id: 'apply-btn', label: 'Apply Filter', icon: '🎨', primary: true, disabled: true }])}
      <style>.options{margin:var(--space-lg) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.preview-container{text-align:center;margin-bottom:var(--space-lg);}.preview-img{max-width:100%;max-height:300px;border-radius:var(--radius-md);transition:filter 0.3s;}.filter-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:var(--space-md);}.filter-btn{display:flex;flex-direction:column;align-items:center;padding:var(--space-sm);background:var(--glass-bg);border:2px solid transparent;border-radius:var(--radius-md);cursor:pointer;}.filter-btn.active{border-color:var(--color-accent-primary);}.filter-preview{width:60px;height:60px;background:linear-gradient(135deg,#ff6b6b,#4ecdc4,#45b7d1);border-radius:var(--radius-sm);}.filter-name{font-size:var(--font-size-xs);margin-top:var(--space-xs);}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Apply Filters to Images Online</h2>
      <p>Add beautiful filters and effects to your images. Choose from vintage, grayscale, sepia, and more. All processing happens in your browser.</p>
      <h3>Available Filters</h3>
      <ul>
        <li><strong>Grayscale:</strong> Classic black and white effect</li>
        <li><strong>Sepia:</strong> Warm, vintage brown tones</li>
        <li><strong>Saturate:</strong> Boost color intensity</li>
        <li><strong>Contrast:</strong> Enhance light/dark differences</li>
        <li><strong>Vintage:</strong> Retro photo look</li>
        <li><strong>Cool/Warm:</strong> Color temperature adjustments</li>
        <li><strong>Dramatic:</strong> Bold, high-impact style</li>
      </ul>
      <h3>How It Works</h3>
      <p>Upload your image, click on filters to preview, then apply to download. The preview updates instantly to help you choose.</p>
      <h3>Privacy</h3>
      <p>All filters are applied locally in your browser. Your images are never uploaded to any server.</p>
    `,
  });
}

let currentFilter = 'none';

function init(): void {
  initFileUpload('img-upload', async (files) => {
    selectedFile = files[0];
    const dataUrl = await readFileAsDataURL(selectedFile!);
    (document.getElementById('preview') as HTMLImageElement).src = dataUrl;
    document.getElementById('options')?.classList.remove('hidden');
    (document.getElementById('apply-btn') as HTMLButtonElement).disabled = false;
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = (btn as HTMLElement).dataset.filter!;
      (document.getElementById('preview') as HTMLImageElement).style.filter = currentFilter;
    });
  });

  document.getElementById('apply-btn')?.addEventListener('click', handleApply);
}

async function handleApply(): Promise<void> {
  if (!selectedFile) return;
  showLoading('Applying filter...');
  try {
    const filtered = await applyFilterCSS(selectedFile, currentFilter);
    downloadFile(filtered, selectedFile.name.replace(/(\.\w+)$/, '_filtered$1'));
    showToast('Filter applied!', 'success');
  } catch (e) {
    showToast('Failed to apply filter', 'error');
  } finally {
    hideLoading();
  }
}
