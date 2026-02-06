/**
 * Office OS - Barcode Generator Tool
 */
import { generateBarcode } from '../../../services/utility';
import { renderToolPage, renderActionButtons, showToast } from '../../../components/shared';

export function renderBarcode(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Barcode Generator',
    description: 'Create barcodes in various formats',
    toolContent: `
      <div class="barcode-container">
        <div class="barcode-input">
          <label>Barcode Value<input type="text" id="barcode-value" class="input" placeholder="Enter value..."></label>
          <label>Format<select id="barcode-format" class="input"><option value="CODE128">CODE128 (any text)</option><option value="EAN13">EAN-13 (13 digits)</option><option value="UPC">UPC (12 digits)</option><option value="CODE39">CODE39</option><option value="ITF14">ITF-14</option></select></label>
        </div>
        <div class="barcode-preview"><div id="barcode-output" class="barcode-box"></div></div>
      </div>
      ${renderActionButtons([{ id: 'generate-btn', label: 'Generate Barcode', icon: '📊', primary: true }, { id: 'download-btn', label: 'Download PNG', icon: '💾' }])}
      <style>.barcode-container{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);align-items:start;margin-bottom:var(--space-xl);}.barcode-input{display:flex;flex-direction:column;gap:var(--space-lg);}.barcode-input label{display:flex;flex-direction:column;gap:var(--space-sm);}.barcode-preview{display:flex;justify-content:center;}.barcode-box{padding:var(--space-xl);background:white;border-radius:var(--radius-md);min-height:150px;display:flex;align-items:center;justify-content:center;}.barcode-box img{max-width:100%;}@media(max-width:768px){.barcode-container{grid-template-columns:1fr;}}</style>
    `,
    seoContent: `
      <h2>Free Barcode Generator</h2>
      <p>Generate barcodes for products, inventory, and more. Supports popular formats including CODE128, EAN-13, UPC, and CODE39.</p>
      <h3>Barcode Formats</h3>
      <ul>
        <li><strong>CODE128:</strong> Most versatile, supports any text and numbers</li>
        <li><strong>EAN-13:</strong> European Article Number, 13 digits for retail products</li>
        <li><strong>UPC:</strong> Universal Product Code, 12 digits for North American retail</li>
        <li><strong>CODE39:</strong> Alphanumeric, used in logistics and automotive</li>
        <li><strong>ITF-14:</strong> 14 digits for shipping containers</li>
      </ul>
      <h3>Use Cases</h3>
      <ul>
        <li>Product labeling</li>
        <li>Inventory management</li>
        <li>Library books</li>
        <li>Asset tracking</li>
        <li>Shipping labels</li>
      </ul>
      <h3>Privacy</h3>
      <p>Barcodes are generated locally in your browser. Nothing is uploaded to any server.</p>
    `,
  });
}

let barcodeDataUrl: string = '';

function init(): void {
  document.getElementById('generate-btn')?.addEventListener('click', generate);
  document.getElementById('download-btn')?.addEventListener('click', download);
}

function generate(): void {
  const value = (document.getElementById('barcode-value') as HTMLInputElement).value.trim();
  const format = (document.getElementById('barcode-format') as HTMLSelectElement).value as 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF14';

  if (!value) {
    showToast('Please enter a barcode value', 'warning');
    return;
  }

  try {
    barcodeDataUrl = generateBarcode(value, { format });
    document.getElementById('barcode-output')!.innerHTML = `<img src="${barcodeDataUrl}" alt="Barcode">`;
    showToast('Barcode generated!', 'success');
  } catch (e) {
    showToast('Invalid format for selected barcode type', 'error');
  }
}

function download(): void {
  if (!barcodeDataUrl) {
    showToast('Generate a barcode first', 'warning');
    return;
  }

  const a = document.createElement('a');
  a.href = barcodeDataUrl;
  a.download = 'barcode.png';
  a.click();
  showToast('Downloaded!', 'success');
}
