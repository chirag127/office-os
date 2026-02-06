/**
 * Office OS - HTML to Image Tool
 * Convert HTML or URL to Image
 */
import html2canvas from 'html2canvas';
import { renderToolPage, renderActionButtons, showToast, showLoading, hideLoading } from '../../../components/shared';
import { downloadFile } from '../../../services/file';

export function renderHtmlToImage(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'HTML to Image',
    description: 'Convert web pages or HTML code to Image (PNG/JPG)',
    toolContent: `
      <div class="input-group">
        <label>Input Method</label>
        <div class="tabs">
            <button class="tab-btn active" data-tab="url">URL</button>
            <button class="tab-btn" data-tab="code">HTML Code</button>
        </div>
      </div>

      <div id="tab-url" class="tab-content">
        <div class="input-group">
            <label>Website URL</label>
            <input type="url" id="url-input" class="input" placeholder="https://example.com">
            <div class="note">Note: Due to browser security (CORS), some URLs may not load. Simple HTML is recommended.</div>
        </div>
      </div>

      <div id="tab-code" class="tab-content hidden">
        <div class="input-group">
            <label>HTML Code</label>
            <textarea id="html-input" class="input" rows="10" placeholder="<div style='background:red; padding:20px'>Hello World</div>"></textarea>
        </div>
      </div>

      ${renderActionButtons([{ id: 'convert-btn', label: 'Convert to Image', icon: '🖼️', primary: true }])}

      <!-- Hidden container for rendering -->
      <div id="render-target" style="position: absolute; left: -9999px; background: white; padding: 20px;"></div>

      <style>
        .tabs { display: flex; gap: var(--space-sm); margin-bottom: var(--space-md); }
        .tab-btn { padding: 8px 16px; border: 1px solid var(--glass-border); background: var(--glass-bg); cursor: pointer; border-radius: var(--radius-sm); }
        .tab-btn.active { background: var(--color-accent-primary); color: white; border-color: transparent; }

        .input-group { margin-bottom: var(--space-md); }
        .input-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        .input { width: 100%; padding: 10px; border: 1px solid var(--glass-border); border-radius: var(--radius-sm); background: rgba(255,255,255,0.8); }

        .note { font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 5px; }
        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>Convert HTML to Image Online</h2>
      <p>Save web pages as high-quality images (PNG, JPG). Render HTML code to image instantly.</p>
    `
  });
}

function init(): void {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const mode = (tab as HTMLElement).dataset.tab;
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        document.getElementById(`tab-${mode}`)?.classList.remove('hidden');
    });
  });

  document.getElementById('convert-btn')?.addEventListener('click', convertToImage);
}

async function convertToImage(): Promise<void> {
    const mode = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
    const target = document.getElementById('render-target');
    if (!target) return;

    showLoading('Rendering Image...');

    try {
        if (mode === 'code') {
            const html = (document.getElementById('html-input') as HTMLTextAreaElement).value;
            target.innerHTML = html;
        } else {
            const url = (document.getElementById('url-input') as HTMLInputElement).value;
             if (!url) {
                showToast('Please enter a URL', 'error');
                hideLoading();
                return;
            }
            try {
                const response = await fetch(url);
                const text = await response.text();
                target.innerHTML = text;
            } catch (e) {
                showToast('Could not load URL (CORS). Try pasting HTML code instead.', 'error');
                hideLoading();
                return;
            }
        }

        const canvas = await html2canvas(target, { scale: 2, useCORS: true });

        canvas.toBlob((blob) => {
            if (blob) {
                downloadFile(blob, 'capture.png');
                showToast('Image Saved!', 'success');
            } else {
                 showToast('Failed to generate image', 'error');
            }
            hideLoading();
            target.innerHTML = '';
        }, 'image/png');

    } catch (e) {
        console.error(e);
        showToast('Conversion failed', 'error');
        hideLoading();
        target.innerHTML = '';
    }
}
