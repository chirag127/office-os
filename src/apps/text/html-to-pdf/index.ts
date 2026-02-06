/**
 * Office OS - HTML to PDF Tool
 * Convert HTML or URL to PDF
 */
// import html2pdf from 'html2pdf.js'; // Lazy loaded
import { renderToolPage, renderActionButtons, showToast, showLoading, hideLoading } from '../../../components/shared';

export function renderHtmlToPdf(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'HTML to PDF',
    description: 'Convert web pages or HTML code to PDF',
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
            <div class="note">Note: Due to browser security (CORS), some URLs may not load. Using a proxy or simple HTML is recommended.</div>
        </div>
      </div>

      <div id="tab-code" class="tab-content hidden">
        <div class="input-group">
            <label>HTML Code</label>
            <textarea id="html-input" class="input" rows="10" placeholder="<h1>Hello World</h1><p>Type your HTML here...</p>"></textarea>
        </div>
      </div>

      ${renderActionButtons([{ id: 'convert-btn', label: 'Convert to PDF', icon: '📄', primary: true }])}

      <!-- Hidden container for rendering -->
      <div id="render-target" style="position: absolute; left: -9999px; width: 800px; background: white; padding: 20px;"></div>

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
      <h2>Convert HTML to PDF Online</h2>
      <p>Save web pages or raw HTML code as PDF documents. Supports basic styling and layout.</p>
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

  document.getElementById('convert-btn')?.addEventListener('click', convertToPdf);
}

async function convertToPdf(): Promise<void> {
    const mode = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
    const target = document.getElementById('render-target');
    if (!target) return;

    showLoading('Rendering PDF...');

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
            // Simple CORS proxy or iframe fetch is complex in client-side only.
            // For MVP, we'll try to fetch text if possible, or warn user.
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
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default || html2pdfModule;

        const opt = {
          margin:       10,
          filename:     'document.pdf',
          image:        { type: 'jpeg' as const, quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        await html2pdf().set(opt).from(target).save();
        showToast('PDF Saved!', 'success');

    } catch (e) {
        console.error(e);
        showToast('Conversion failed', 'error');
    } finally {
        hideLoading();
        // Clean up
        target.innerHTML = '';
    }
}
