/**
 * Office OS - Create ZIP Tool
 */
import { createZip, formatFileSize } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFiles: File[] = [];

export function renderZip(): string {
  selectedFiles = [];
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Create ZIP Archive',
    description: 'Compress multiple files into a single ZIP file',
    toolContent: `
      ${renderFileUpload({ id: 'file-upload', accept: '*/*', multiple: true, title: 'Drop files to compress' })}
      <div id="file-list" class="file-list"></div>
      <div class="zip-options"><label>Archive Name<input type="text" id="zip-name" class="input" value="archive" placeholder="archive"></label></div>
      ${renderActionButtons([{ id: 'zip-btn', label: 'Create ZIP', icon: '📦', primary: true, disabled: true }])}
      <style>.file-list{margin:var(--space-lg) 0;display:flex;flex-direction:column;gap:var(--space-sm);}.file-item{display:flex;justify-content:space-between;align-items:center;padding:var(--space-md);background:var(--glass-bg);border-radius:var(--radius-md);}.file-info{display:flex;align-items:center;gap:var(--space-sm);}.file-size{color:var(--color-text-tertiary);font-size:var(--font-size-sm);}.zip-options{margin:var(--space-lg) 0;}.zip-options label{display:flex;flex-direction:column;gap:var(--space-sm);max-width:300px;}</style>
    `,
    seoContent: `
      <h2>Create ZIP Files Online</h2>
      <p>Compress multiple files into a single ZIP archive. Makes files easier to share and reduces storage space.</p>
      <h3>How It Works</h3>
      <ol>
        <li>Upload the files you want to compress</li>
        <li>Name your archive</li>
        <li>Click "Create ZIP" to download</li>
      </ol>
      <h3>Benefits of ZIP Files</h3>
      <ul>
        <li><strong>Smaller Size:</strong> Compressed files take less space</li>
        <li><strong>Single File:</strong> Share multiple files as one</li>
        <li><strong>Organization:</strong> Keep related files together</li>
        <li><strong>Universal:</strong> Opens on any operating system</li>
      </ul>
      <h3>Privacy</h3>
      <p>All compression happens locally in your browser. Your files are never uploaded to any server.</p>
    `,
  });
}

function init(): void {
  initFileUpload('file-upload', (files) => {
    selectedFiles = [...selectedFiles, ...Array.from(files)];
    updateFileList();
  });

  document.getElementById('zip-btn')?.addEventListener('click', handleZip);
}

function updateFileList(): void {
  const list = document.getElementById('file-list')!;
  list.innerHTML = selectedFiles.map((f, i) => `
    <div class="file-item">
      <div class="file-info"><span>📄</span><span>${f.name}</span><span class="file-size">${formatFileSize(f.size)}</span></div>
      <button class="btn btn-icon" data-index="${i}">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedFiles.splice(parseInt((btn as HTMLElement).dataset.index!), 1);
      updateFileList();
    });
  });

  (document.getElementById('zip-btn') as HTMLButtonElement).disabled = selectedFiles.length === 0;
}

async function handleZip(): Promise<void> {
  if (selectedFiles.length === 0) return;
  showLoading('Creating ZIP...');
  try {
    const name = (document.getElementById('zip-name') as HTMLInputElement).value || 'archive';
    // Convert File[] to the expected format
    const filesForZip = await Promise.all(selectedFiles.map(async (file) => ({
      name: file.name,
      content: await file.arrayBuffer()
    })));
    await createZip(filesForZip, `${name}.zip`);
    showToast('ZIP created!', 'success');
  } catch (e) {
    showToast('Failed to create ZIP', 'error');
  } finally {
    hideLoading();
  }
}
