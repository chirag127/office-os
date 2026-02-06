/**
 * Office OS - Unlock PDF Tool
 */
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderUnlockPDF(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Unlock PDF',
    description: 'Remove password protection from PDF files',
    toolContent: `
      ${renderFileUpload({ id: 'pdf-upload', accept: '.pdf', multiple: false, title: 'Upload protected PDF' })}
      <div id="unlock-options" class="unlock-options hidden">
        <label>Current Password<input type="password" id="pdf-password" class="input" placeholder="Enter current password"></label>
      </div>
      ${renderActionButtons([{ id: 'unlock-btn', label: 'Unlock PDF', icon: '🔓', primary: true, disabled: true }])}
      <style>.unlock-options{margin:var(--space-lg) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.unlock-options label{display:flex;flex-direction:column;gap:var(--space-sm);}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>Unlock PDF Files Online</h2>
      <p>Remove password protection from PDF documents. If you know the password, our free tool can unlock the PDF for unrestricted access. All processing happens locally in your browser.</p>
      <h3>Important Notice</h3>
      <p>This tool requires you to enter the correct password to unlock the PDF. We do not break or crack password protection - you must have authorized access to the document.</p>
      <h3>How It Works</h3>
      <ol>
        <li>Upload your password-protected PDF.</li>
        <li>Enter the correct password.</li>
        <li>Click "Unlock PDF" to remove the protection.</li>
        <li>Download the unlocked PDF.</li>
      </ol>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Personal Documents:</strong> Remove passwords from your own protected files when no longer needed.</li>
        <li><strong>Archive Access:</strong> Unlock old documents where you've forgotten to save an unprotected copy.</li>
        <li><strong>Document Sharing:</strong> Remove restrictions before sharing with authorized colleagues.</li>
      </ul>
      <h3>Privacy</h3>
      <p>Your PDF and password are never uploaded to any server. All unlocking happens locally in your browser, ensuring complete privacy and security.</p>
    `,
  });
}

function init(): void {
  initFileUpload('pdf-upload', (files) => {
    selectedFile = files[0];
    document.getElementById('unlock-options')?.classList.remove('hidden');
    checkReady();
  });
  document.getElementById('pdf-password')?.addEventListener('input', checkReady);
  document.getElementById('unlock-btn')?.addEventListener('click', handleUnlock);
}

function checkReady(): void {
  const pw = (document.getElementById('pdf-password') as HTMLInputElement).value;
  (document.getElementById('unlock-btn') as HTMLButtonElement).disabled = !selectedFile || pw.length === 0;
}

async function handleUnlock(): Promise<void> {
  if (!selectedFile) return;
  showLoading('Unlocking PDF...');
  try {
    showToast('PDF unlocking requires additional decryption library. Feature coming soon.', 'info');
  } finally {
    hideLoading();
  }
}
