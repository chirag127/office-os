/**
 * Office OS - Sign PDF Tool
 */

import { addSignature } from '../../../services/pdf';
import { downloadFile, readFileAsArrayBuffer, readFileAsDataURL } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let pdfFile: File | null = null;
let signatureDataUrl: string | null = null;

export function renderSignPDF(): string {
  pdfFile = null;
  signatureDataUrl = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Sign PDF',
    description: 'Add your signature to PDF documents',
    toolContent: `
      <div class="sign-steps">
        <div class="step"><span class="step-num">1</span>${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Upload PDF' })}</div>
        <div class="step"><span class="step-num">2</span>
          <div class="signature-area">
            <canvas id="sig-canvas" width="400" height="150"></canvas>
            <div class="sig-actions">
              <button class="btn btn-secondary" id="clear-sig">Clear</button>
              <button class="btn btn-secondary" id="upload-sig">Upload Image</button>
              <input type="file" id="sig-upload" accept="image/*" class="sr-only">
            </div>
          </div>
        </div>
      </div>
      ${renderActionButtons([{ id: 'sign-btn', label: 'Add Signature', icon: '✍️', primary: true, disabled: true }])}
      <style>
        .sign-steps{display:flex;flex-direction:column;gap:var(--space-xl);}
        .step{position:relative;padding-left:var(--space-3xl);}
        .step-num{position:absolute;left:0;top:0;width:32px;height:32px;background:var(--color-accent-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;color:white;}
        .signature-area{background:var(--color-bg-tertiary);border-radius:var(--radius-md);padding:var(--space-lg);}
        #sig-canvas{background:white;border-radius:var(--radius-md);cursor:crosshair;display:block;margin:0 auto;}
        .sig-actions{display:flex;gap:var(--space-md);justify-content:center;margin-top:var(--space-md);}
      </style>
    `,
    seoContent: `
      <h2>Add Signature to PDF Online - Free Digital Signing</h2>
      <p>Sign PDF documents digitally without printing. Draw your signature or upload an image, then place it anywhere on your document. Our free online PDF signer works entirely in your browser for complete privacy.</p>
      <h3>Why Digital Signatures?</h3>
      <ul>
        <li><strong>Go Paperless:</strong> Sign documents without printing, signing, and scanning.</li>
        <li><strong>Save Time:</strong> Complete document workflows faster.</li>
        <li><strong>Environmentally Friendly:</strong> Reduce paper usage.</li?
        <li><strong>Work Remotely:</strong> Sign documents from anywhere.</li>
      </ul>
      <h3>How to Sign a PDF</h3>
      <ol>
        <li>Upload your PDF document.</li>
        <li>Draw your signature on the canvas or upload a signature image.</li>
        <li>Click "Add Signature" to place it on the document.</li>
        <li>Download your signed PDF.</li>
      </ol>
      <h3>Types of Signatures</h3>
      <p><strong>Drawn Signature:</strong> Use your mouse, trackpad, or touchscreen to create a handwritten-style signature directly in your browser.</p>
      <p><strong>Image Signature:</strong> Upload a scanned image of your handwritten signature or a pre-made signature graphic.</p>
      <h3>Privacy & Security</h3>
      <p>Your PDF never leaves your device. All processing happens locally in your browser, ensuring your documents and signature remain private. We don't store, access, or transmit any of your data.</p>
      <h3>Legal Validity</h3>
      <p>Electronic signatures are legally binding in most countries under laws like the ESIGN Act (USA), eIDAS (EU), and similar regulations worldwide. However, for highly sensitive legal documents, consider using certified digital signature services.</p>
      <h3>Tips for Best Results</h3>
      <ul>
        <li>Use a stylus or touch device for smoother signatures.</li>
        <li>Sign on a white background for cleaner results.</li>
        <li>If uploading, use a PNG with transparent background.</li>
      </ul>
    `,
  });
}

function init(): void {
  const canvas = document.getElementById('sig-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  let drawing = false;

  canvas.addEventListener('mousedown', () => { drawing = true; ctx.beginPath(); });
  canvas.addEventListener('mouseup', () => { drawing = false; updateSignature(); });
  canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  });

  document.getElementById('clear-sig')?.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    signatureDataUrl = null;
    checkReady();
  });

  document.getElementById('upload-sig')?.addEventListener('click', () => {
    document.getElementById('sig-upload')?.click();
  });

  document.getElementById('sig-upload')?.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      signatureDataUrl = await readFileAsDataURL(file);
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        checkReady();
      };
      img.src = signatureDataUrl;
    }
  });

  initFileUpload('pdf-upload', (files) => {
    pdfFile = files[0];
    checkReady();
  });

  document.getElementById('sign-btn')?.addEventListener('click', handleSign);
}

function updateSignature(): void {
  const canvas = document.getElementById('sig-canvas') as HTMLCanvasElement;
  signatureDataUrl = canvas.toDataURL('image/png');
  checkReady();
}

function checkReady(): void {
  (document.getElementById('sign-btn') as HTMLButtonElement).disabled = !pdfFile || !signatureDataUrl;
}

async function handleSign(): Promise<void> {
  if (!pdfFile || !signatureDataUrl) return;
  showLoading('Adding signature...');
  try {
    // Convert data URL to ArrayBuffer
    const base64 = signatureDataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const pdfBuffer = await readFileAsArrayBuffer(pdfFile);
    const signed = await addSignature(pdfBuffer, bytes.buffer, 'png', { pageIndex: 0, x: 50, y: 50, width: 150, height: 50 });
    // Convert Uint8Array to ArrayBuffer for Blob compatibility
    const arrayBuffer = new ArrayBuffer(signed.length);
    new Uint8Array(arrayBuffer).set(signed);
    downloadFile(new Blob([arrayBuffer], { type: 'application/pdf' }), pdfFile.name.replace('.pdf', '_signed.pdf'));
    showToast('PDF signed!', 'success');
  } catch (e) {
    showToast('Signing failed', 'error');
  } finally {
    hideLoading();
  }
}
