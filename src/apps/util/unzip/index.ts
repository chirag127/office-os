/**
 * Office OS - Extract ZIP Tool
 */
import { extractZip, downloadFile, formatFileSize } from '../../../services/file';
import { renderToolPage, renderFileUpload, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

export function renderUnzip(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Extract ZIP Archive',
    description: 'Extract files from a ZIP archive',
    toolContent: `
      ${renderFileUpload({ id: 'zip-upload', accept: '.zip,application/zip', multiple: false, title: 'Drop a ZIP file here' })}
      <div id="file-list" class="file-list hidden"><h3>Files in Archive</h3><div id="files"></div></div>
      <style>.file-list{margin:var(--space-xl) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.file-list h3{margin-bottom:var(--space-lg);}#files{display:flex;flex-direction:column;gap:var(--space-sm);}.file-row{display:flex;justify-content:space-between;align-items:center;padding:var(--space-md);background:var(--color-bg-tertiary);border-radius:var(--radius-md);}.file-info{display:flex;align-items:center;gap:var(--space-sm);}.file-size{color:var(--color-text-tertiary);}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Extract ZIP Files Online</h2>
      <p>Open and extract files from ZIP archives directly in your browser. Download individual files or browse contents.</p>
      <h3>How It Works</h3>
      <ol>
        <li>Upload your ZIP file</li>
        <li>See all files in the archive</li>
        <li>Download individual files</li>
      </ol>
      <h3>Supported Formats</h3>
      <p>Standard ZIP files (.zip extension). Password-protected archives are not currently supported.</p>
      <h3>Privacy</h3>
      <p>All extraction happens locally in your browser. Your files are never uploaded to any server.</p>
    `,
  });
}

function init(): void {
  initFileUpload('zip-upload', async (files) => {
    const file = files[0];
    showLoading('Extracting ZIP...');
    try {
      const extracted = await extractZip(file);
      displayFiles(extracted);
      showToast(`${extracted.length} files extracted!`, 'success');
    } catch (e) {
      showToast('Failed to extract ZIP', 'error');
    } finally {
      hideLoading();
    }
  });
}

function displayFiles(files: { name: string; content: Blob }[]): void {
  const container = document.getElementById('files')!;
  container.innerHTML = files.map((f, i) => `
    <div class="file-row">
      <div class="file-info"><span>📄</span><span>${f.name}</span><span class="file-size">${formatFileSize(f.content.size)}</span></div>
      <button class="btn btn-secondary btn-sm" data-index="${i}">Download</button>
    </div>
  `).join('');

  container.querySelectorAll('button').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      downloadFile(files[i].content, files[i].name);
      showToast('Downloaded!', 'success');
    });
  });

  document.getElementById('file-list')?.classList.remove('hidden');
}
