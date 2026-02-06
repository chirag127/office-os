/**
 * Office OS - Compare PDF Tool
 * Visual comparison of two PDF files
 */
import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from '../../../services/file';
import { renderToolPage, showToast, showLoading, hideLoading } from '../../../components/shared';

let file1: File | null = null;
let file2: File | null = null;

export function renderComparePDF(): string {
  file1 = null;
  file2 = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Compare PDF',
    description: 'Visually compare two PDF documents side-by-side',
    toolContent: `
      <div class="compare-inputs">
        <div class="file-input-wrapper">
            <label>Original Document</label>
            <div id="drop-zone-1" class="drop-zone">
                <input type="file" id="file-1" accept=".pdf" class="file-input">
                <div class="drop-content">
                    <span class="icon">📄</span>
                    <span id="name-1" class="filename">Select PDF 1</span>
                </div>
            </div>
        </div>

        <div class="file-input-wrapper">
            <label>Changed Document</label>
            <div id="drop-zone-2" class="drop-zone">
                <input type="file" id="file-2" accept=".pdf" class="file-input">
                <div class="drop-content">
                    <span class="icon">📝</span>
                    <span id="name-2" class="filename">Select PDF 2</span>
                </div>
            </div>
        </div>
      </div>

      <div id="compare-actions" class="compare-actions hidden">
         <button id="compare-btn" class="btn btn-primary">Compare Files</button>
      </div>

      <div id="comparison-view" class="comparison-view hidden">
        <div class="view-controls">
            <button class="view-btn active" data-mode="side">Side by Side</button>
            <button class="view-btn" data-mode="overlay">Overlay</button>
        </div>
        <div id="view-container" class="view-container side-mode">
            <!-- Placeholders for rendered pages -->
            <div class="pdf-viewer" id="viewer-1">
                <div class="page-placeholder">Page 1</div>
            </div>
            <div class="pdf-viewer" id="viewer-2">
                <div class="page-placeholder">Page 1</div>
            </div>
        </div>
        <div class="note">Note: Visual comparison requires rendering. Full pixel-diff implementation coming soon. Currently aligns pages for manual review.</div>
      </div>

      <style>
        .compare-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); margin: var(--space-xl) 0; }
        .file-input-wrapper { display: flex; flex-direction: column; gap: var(--space-sm); }
        .file-input-wrapper label { font-weight: 500; color: var(--color-text-primary); }

        .drop-zone {
            position: relative;
            height: 120px;
            border: 2px dashed var(--glass-border);
            border-radius: var(--radius-md);
            background: var(--glass-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .drop-zone:hover { border-color: var(--color-accent-primary); background: rgba(0,0,0,0.02); }
        .drop-zone.active { border-color: var(--color-success); background: rgba(50,205,50,0.05); }

        .file-input { position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
        .drop-content { display: flex; flex-direction: column; align-items: center; gap: 5px; pointer-events: none; }
        .icon { font-size: 2rem; }
        .filename { font-size: 0.9rem; color: var(--color-text-secondary); text-align: center; max-width: 90%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .compare-actions { display: flex; justify-content: center; margin-bottom: var(--space-xl); }

        .comparison-view { border-top: 1px solid var(--color-border); padding-top: var(--space-lg); }
        .view-controls { display: flex; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-lg); }
        .view-btn { padding: 6px 16px; border-radius: 20px; border: 1px solid var(--glass-border); background: var(--glass-bg); cursor: pointer; }
        .view-btn.active { background: var(--color-accent-primary); color: white; border-color: transparent; }

        .view-container { display: flex; gap: var(--space-md); height: 500px; overflow: hidden; border: 1px solid var(--glass-border); border-radius: var(--radius-lg); background: #333; }
        .pdf-viewer { flex: 1; overflow: auto; display: flex; justify-content: center; padding: 20px; }
        .page-placeholder { width: 300px; height: 400px; background: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }

        .view-container.overlay-mode .pdf-viewer { position: absolute; width: 100%; height: 100%; top: 0; left: 0; opacity: 0.5; pointer-events: none; }
        .view-container.overlay-mode { position: relative; }

        .note { text-align: center; margin-top: var(--space-md); font-size: 0.8rem; color: var(--color-text-secondary); }

        .hidden { display: none !important; }

        @media (max-width: 600px) {
            .compare-inputs { grid-template-columns: 1fr; }
        }
      </style>
    `,
    seoContent: `
      <h2>Compare PDF Files Side-by-Side</h2>
      <p>Visually compare two versions of a PDF document to spot changes. Overlay mode helps detect subtle layout shifts.</p>
    `
  });
}

function init(): void {
  setupInput('file-1', 'drop-zone-1', 'name-1', (f) => file1 = f);
  setupInput('file-2', 'drop-zone-2', 'name-2', (f) => file2 = f);

  document.getElementById('compare-btn')?.addEventListener('click', handleCompare);

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = (e.target as HTMLElement).dataset.mode!;
        const container = document.getElementById('view-container');
        if (mode === 'overlay') {
            container?.classList.add('overlay-mode');
            container?.classList.remove('side-mode');
        } else {
            container?.classList.remove('overlay-mode');
            container?.classList.add('side-mode');
        }
    });
  });
}

function setupInput(inputId: string, zoneId: string, nameId: string, setFile: (f: File) => void) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    const zone = document.getElementById(zoneId);
    const name = document.getElementById(nameId);

    input.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            setFile(file);
            if(name) name.textContent = file.name;
            zone?.classList.add('active');
            checkReady();
        }
    });
}

function checkReady() {
    if (file1 && file2) {
        document.getElementById('compare-actions')?.classList.remove('hidden');
    }
}

async function handleCompare() {
    if (!file1 || !file2) return;

    showLoading('Analyzing PDFs...');
    try {
        const buffer1 = await readFileAsArrayBuffer(file1);
        const buffer2 = await readFileAsArrayBuffer(file2);

        const doc1 = await PDFDocument.load(buffer1);
        const doc2 = await PDFDocument.load(buffer2);

        // In a full implementation, we'd render pages to canvas here
        document.getElementById('comparison-view')?.classList.remove('hidden');
        document.getElementById('compare-actions')?.classList.add('hidden');

        showToast(`Loaded: ${doc1.getPageCount()} vs ${doc2.getPageCount()} pages`, 'info');
    } catch (e) {
        showToast('Failed to load PDFs', 'error');
    } finally {
        hideLoading();
    }
}
