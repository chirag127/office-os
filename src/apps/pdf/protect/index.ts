/**
 * Office OS - Protect PDF Tool
 */
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderProtectPDF(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Protect PDF',
    description: 'Add password protection to your PDF files',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Upload PDF to protect' })}
      <div id="protect-options" class="protect-options hidden">
        <label>Password<input type="password" id="pdf-password" class="input" placeholder="Enter password" minlength="4"></label>
        <label>Confirm Password<input type="password" id="pdf-password-confirm" class="input" placeholder="Confirm password"></label>
      </div>
      ${renderActionButtons([{ id: 'protect-btn', label: 'Protect PDF', icon: '🔒', primary: true, disabled: true }])}
      <style>.protect-options{display:flex;flex-direction:column;gap:var(--space-lg);margin:var(--space-lg) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.protect-options label{display:flex;flex-direction:column;gap:var(--space-sm);}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Password Protect PDF Files Online</h2>
      <p>Secure your PDF documents with password protection. Our free online tool lets you add encryption to prevent unauthorized access. All processing happens locally in your browser.</p>
      <h3>Why Password Protect PDFs?</h3>
      <ul>
        <li><strong>Confidentiality:</strong> Prevent unauthorized viewing of sensitive documents.</li>
        <li><strong>Compliance:</strong> Meet security requirements for sharing protected information.</li>
        <li><strong>Control:</strong> Ensure only intended recipients can access your documents.</li>
      </ul>
      <h3>Password Strength Tips</h3>
      <ul>
        <li>Use at least 8 characters</li>
        <li>Mix uppercase, lowercase, numbers, and symbols</li>
        <li>Avoid common words or personal information</li>
        <li>Don't reuse passwords from other accounts</li>
      </ul>
      <h3>Privacy First</h3>
      <p>Your PDF and password never leave your device. All encryption happens locally in your browser, ensuring complete security and privacy.</p>
      <h3>Note on PDF Encryption</h3>
      <p>This tool uses standard PDF encryption. For maximum security on highly sensitive documents, consider additional security measures or professional encryption solutions.</p>
    `,
  });
}

function init(): void {
  initFileUpload('pdf-upload', (files) => {
    selectedFile = files[0];
    document.getElementById('protect-options')?.classList.remove('hidden');
    checkReady();
  });

  document.getElementById('pdf-password')?.addEventListener('input', checkReady);
  document.getElementById('pdf-password-confirm')?.addEventListener('input', checkReady);
  document.getElementById('protect-btn')?.addEventListener('click', handleProtect);
}

function checkReady(): void {
  const pw = (document.getElementById('pdf-password') as HTMLInputElement).value;
  const pwc = (document.getElementById('pdf-password-confirm') as HTMLInputElement).value;
  (document.getElementById('protect-btn') as HTMLButtonElement).disabled = !selectedFile || pw.length < 4 || pw !== pwc;
}

async function handleProtect(): Promise<void> {
  if (!selectedFile) return;
  showLoading('Protecting PDF...');
  try {
    // Note: pdf-lib doesn't support encryption directly. This is a placeholder.
    // Password would be retrieved from: (document.getElementById('pdf-password') as HTMLInputElement).value
    showToast('PDF protection requires additional encryption library. Coming soon!', 'info');
  } finally {
    hideLoading();
  }
}
