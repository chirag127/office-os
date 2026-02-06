/**
 * Office OS - OCR Tool
 */
import { performOCR } from '../../../services/ocr';
import type { OCRProgress } from '../../../services/ocr';
import { readFileAsDataURL } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast } from '../../../components/shared';

let selectedFile: File | null = null;

export function renderOCR(): string {
  selectedFile = null;
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'OCR - Extract Text',
    description: 'Extract text from images and scanned documents using AI',
    toolContent: `
      ${renderFileUpload({ id: 'img-upload', accept: 'image/*,.pdf', multiple: false, title: 'Drop an image or scanned PDF' })}
      <div id="ocr-options" class="options hidden">
        <div class="preview-section"><img id="preview" class="preview-img" alt="Preview"></div>
        <label>Language<select id="language" class="input"><option value="eng">English</option><option value="spa">Spanish</option><option value="fra">French</option><option value="deu">German</option><option value="chi_sim">Chinese (Simplified)</option><option value="jpn">Japanese</option><option value="hin">Hindi</option></select></label>
        <div id="progress-bar" class="progress-container hidden"><div class="progress-bar"><div id="progress-fill" class="progress-bar-fill" style="width:0%"></div></div><span id="progress-text">0%</span></div>
      </div>
      <div id="result-area" class="result-area hidden"><h3>Extracted Text</h3><textarea id="ocr-result" class="input result-text" readonly></textarea><button id="copy-btn" class="btn btn-secondary">📋 Copy Text</button></div>
      ${renderActionButtons([{ id: 'ocr-btn', label: 'Extract Text', icon: '👁️', primary: true, disabled: true }])}
      <style>.options{margin:var(--space-lg) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);display:flex;flex-direction:column;gap:var(--space-lg);}.preview-section{text-align:center;}.preview-img{max-width:100%;max-height:200px;border-radius:var(--radius-md);}.progress-container{display:flex;align-items:center;gap:var(--space-md);}.result-area{margin:var(--space-xl) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.result-text{width:100%;min-height:200px;margin:var(--space-md) 0;font-family:monospace;}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>OCR - Optical Character Recognition Online</h2>
      <p>Extract text from images, screenshots, and scanned documents. Our AI-powered OCR tool recognizes text in multiple languages with high accuracy.</p>
      <h3>What is OCR?</h3>
      <p>OCR (Optical Character Recognition) is technology that converts images of text into machine-readable text. It can extract text from photos, scanned documents, PDFs, and screenshots.</p>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Scanned Documents:</strong> Convert paper documents to editable text</li>
        <li><strong>Screenshots:</strong> Extract text from images of websites or apps</li>
        <li><strong>Photos:</strong> Capture text from signs, books, or receipts</li>
        <li><strong>PDFs:</strong> Extract text from image-based PDFs</li>
      </ul>
      <h3>Supported Languages</h3>
      <p>Our OCR supports multiple languages including English, Spanish, French, German, Chinese, Japanese, and Hindi. Select your language for best accuracy.</p>
      <h3>AI-Powered Accuracy</h3>
      <p>We use Puter AI as our primary OCR engine for superior accuracy, with Tesseract.js as a fallback. This dual-engine approach ensures reliable results.</p>
      <h3>Tips for Best Results</h3>
      <ul>
        <li>Use high-resolution, well-lit images</li>
        <li>Ensure text is clear and not blurry</li>
        <li>Straighten skewed documents before scanning</li>
        <li>Crop to include only the text area</li>
      </ul>
      <h3>Privacy</h3>
      <p>Your images are processed securely. When using Puter AI, data is processed according to their privacy policy. Tesseract fallback runs entirely in your browser.</p>
    `,
  });
}

function init(): void {
  initFileUpload('img-upload', async (files) => {
    selectedFile = files[0];
    if (selectedFile.type.startsWith('image/')) {
      const dataUrl = await readFileAsDataURL(selectedFile);
      (document.getElementById('preview') as HTMLImageElement).src = dataUrl;
    }
    document.getElementById('ocr-options')?.classList.remove('hidden');
    (document.getElementById('ocr-btn') as HTMLButtonElement).disabled = false;
  });

  document.getElementById('copy-btn')?.addEventListener('click', () => {
    const text = (document.getElementById('ocr-result') as HTMLTextAreaElement).value;
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  });

  document.getElementById('ocr-btn')?.addEventListener('click', handleOCR);
}

async function handleOCR(): Promise<void> {
  if (!selectedFile) return;
  const progressBar = document.getElementById('progress-bar')!;
  const progressFill = document.getElementById('progress-fill')!;
  const progressText = document.getElementById('progress-text')!;

  progressBar.classList.remove('hidden');
  (document.getElementById('ocr-btn') as HTMLButtonElement).disabled = true;

  try {
    const language = (document.getElementById('language') as HTMLSelectElement).value;
    const result = await performOCR(selectedFile, {
      language,
      onProgress: (p: OCRProgress) => {
        progressFill.style.width = `${p.progress * 100}%`;
        progressText.textContent = `${Math.round(p.progress * 100)}%`;
      }
    });

    (document.getElementById('ocr-result') as HTMLTextAreaElement).value = result.text;
    document.getElementById('result-area')?.classList.remove('hidden');
    showToast(`Text extracted!${result.confidence ? ` Confidence: ${Math.round(result.confidence)}%` : ''}`, 'success');
  } catch (e) {
    showToast('OCR failed. Please try again.', 'error');
  } finally {
    progressBar.classList.add('hidden');
    (document.getElementById('ocr-btn') as HTMLButtonElement).disabled = false;
  }
}
