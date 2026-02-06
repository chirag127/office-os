/**
 * Office OS - QR Code Generator Tool
 */
import { generateQRCode, generateQRCodeSVG } from '../../../services/utility';
import { downloadFile } from '../../../services/file';
import { renderToolPage, renderActionButtons, showToast } from '../../../components/shared';

export function renderQRCode(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'QR Code Generator',
    description: 'Create QR codes for URLs, text, and more',
    toolContent: `
      <div class="qr-container">
        <div class="qr-input"><label>Content<textarea id="qr-content" class="input" placeholder="Enter URL or text..." rows="3"></textarea></label></div>
        <div class="qr-preview"><div id="qr-output" class="qr-box"></div></div>
      </div>
      <div class="qr-options">
        <label>Size<select id="qr-size" class="input"><option value="200">Small (200px)</option><option value="300" selected>Medium (300px)</option><option value="400">Large (400px)</option></select></label>
        <label>Format<select id="qr-format" class="input"><option value="png">PNG Image</option><option value="svg">SVG Vector</option></select></label>
      </div>
      ${renderActionButtons([{ id: 'generate-btn', label: 'Generate QR', icon: '📱', primary: true }, { id: 'download-btn', label: 'Download', icon: '💾' }])}
      <style>.qr-container{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);margin-bottom:var(--space-xl);align-items:start;}.qr-input label{display:flex;flex-direction:column;gap:var(--space-sm);}.qr-preview{display:flex;justify-content:center;}.qr-box{padding:var(--space-lg);background:white;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;min-height:200px;}.qr-box img,.qr-box svg{max-width:100%;}.qr-options{display:flex;gap:var(--space-lg);margin-bottom:var(--space-lg);}.qr-options label{flex:1;display:flex;flex-direction:column;gap:var(--space-sm);}@media(max-width:768px){.qr-container{grid-template-columns:1fr;}}</style>
    `,
    seoContent: `
      <h2>Free QR Code Generator</h2>
      <p>Create QR codes instantly for any URL, text, email, phone number, or WiFi credentials. High quality output in PNG or SVG format.</p>
      <h3>QR Code Uses</h3>
      <ul>
        <li><strong>Website URLs:</strong> Link to websites, social media profiles</li>
        <li><strong>Contact Info:</strong> Share phone numbers, email addresses</li>
        <li><strong>WiFi:</strong> Share network credentials (format: WIFI:T:WPA;S:network;P:password;;)</li>
        <li><strong>Business Cards:</strong> Digital contact information</li>
        <li><strong>Marketing:</strong> Promotional materials, posters</li>
      </ul>
      <h3>Output Formats</h3>
      <ul>
        <li><strong>PNG:</strong> Best for web and print, smaller file size</li>
        <li><strong>SVG:</strong> Vector format, scales to any size without quality loss</li>
      </ul>
      <h3>Privacy</h3>
      <p>QR codes are generated locally in your browser. Your content is never sent to any server.</p>
    `,
  });
}

let qrDataUrl: string = '';

function init(): void {
  document.getElementById('generate-btn')?.addEventListener('click', generate);
  document.getElementById('download-btn')?.addEventListener('click', download);
  document.getElementById('qr-content')?.addEventListener('input', generate);
}

async function generate(): Promise<void> {
  const content = (document.getElementById('qr-content') as HTMLTextAreaElement).value.trim();
  if (!content) return;

  const size = parseInt((document.getElementById('qr-size') as HTMLSelectElement).value);
  const format = (document.getElementById('qr-format') as HTMLSelectElement).value;
  const output = document.getElementById('qr-output')!;

  try {
    if (format === 'svg') {
      const svg = await generateQRCodeSVG(content, { width: size });
      output.innerHTML = svg;
      qrDataUrl = 'data:image/svg+xml,' + encodeURIComponent(svg);
    } else {
      qrDataUrl = await generateQRCode(content, { width: size });
      output.innerHTML = `<img src="${qrDataUrl}" alt="QR Code">`;
    }
  } catch (e) {
    showToast('Failed to generate QR code', 'error');
  }
}

function download(): void {
  if (!qrDataUrl) {
    showToast('Generate a QR code first', 'warning');
    return;
  }

  const format = (document.getElementById('qr-format') as HTMLSelectElement).value;

  if (format === 'svg') {
    const svg = document.getElementById('qr-output')!.innerHTML;
    downloadFile(new Blob([svg], { type: 'image/svg+xml' }), 'qrcode.svg');
  } else {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'qrcode.png';
    a.click();
  }
  showToast('Downloaded!', 'success');
}
