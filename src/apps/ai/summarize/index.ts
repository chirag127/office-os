/**
 * Office OS - AI Summarize Tool
 */
import { summarizeText } from '../../../services/ai';
import { docxToText, readFileAsText } from '../../../services/file';
import { renderToolPage, renderFileUpload, renderActionButtons, initFileUpload, showToast, showLoading, hideLoading } from '../../../components/shared';

let documentText = '';

export function renderSummarize(): string {
  documentText = '';
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'AI Summarize',
    description: 'Get AI-powered summaries of any document',
    toolContent: `
      <div class="input-mode">
        <div class="tabs">
          <button class="tab active" data-tab="paste">Paste Text</button>
          <button class="tab" data-tab="upload">Upload File</button>
        </div>
        <div id="paste-panel" class="tab-panel active"><textarea id="text-input" class="input text-area" placeholder="Paste your text here..."></textarea></div>
        <div id="upload-panel" class="tab-panel">${renderFileUpload({ id: 'doc-upload', accept: '.txt,.pdf,.docx,.doc', multiple: false, title: 'Upload a document', hint: 'TXT, DOCX supported' })}</div>
      </div>
      <div class="summary-options">
        <label>Summary Length<select id="length" class="input"><option value="short">Short (1-2 paragraphs)</option><option value="medium" selected>Medium (3-4 paragraphs)</option><option value="long">Long (detailed)</option></select></label>
      </div>
      <div id="result-area" class="result-area hidden"><h3>Summary</h3><div id="summary-result" class="result-content"></div><button id="copy-btn" class="btn btn-secondary">📋 Copy</button></div>
      ${renderActionButtons([{ id: 'summarize-btn', label: 'Summarize', icon: '📝', primary: true }])}
      <style>.tabs{display:flex;gap:var(--space-sm);margin-bottom:var(--space-lg);}.tab{padding:var(--space-sm) var(--space-lg);background:var(--glass-bg);border:none;border-radius:var(--radius-md);cursor:pointer;}.tab.active{background:var(--color-accent-gradient);color:white;}.tab-panel{display:none;}.tab-panel.active{display:block;}.text-area{width:100%;min-height:200px;}.summary-options{margin:var(--space-lg) 0;}.result-area{margin:var(--space-xl) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.result-content{line-height:1.8;margin:var(--space-md) 0;}.hidden{display:none!important;}</style>
    `,
    seoContent: `
      <h2>AI Document Summarizer</h2>
      <p>Get instant summaries of long documents using advanced AI. Perfect for research papers, articles, reports, and any lengthy text.</p>
      <h3>How It Works</h3>
      <p>Our AI analyzes your document and extracts the key points, main arguments, and essential information. You get a clear, concise summary in seconds.</p>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Research:</strong> Quickly understand academic papers</li>
        <li><strong>Business:</strong> Summarize reports and proposals</li>
        <li><strong>News:</strong> Get the gist of long articles</li>
        <li><strong>Study:</strong> Create summary notes from textbooks</li>
      </ul>
      <h3>Summary Lengths</h3>
      <ul>
        <li><strong>Short:</strong> 1-2 paragraphs for quick overview</li>
        <li><strong>Medium:</strong> 3-4 paragraphs with key details</li>
        <li><strong>Long:</strong> Comprehensive summary with all major points</li>
      </ul>
      <h3>Powered by Puter AI</h3>
      <p>We use advanced language models through Puter AI to generate accurate, coherent summaries that capture the essence of your documents.</p>
    `,
  });
}

function init(): void {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${(tab as HTMLElement).dataset.tab}-panel`)?.classList.add('active');
    });
  });

  initFileUpload('doc-upload', async (files) => {
    const file = files[0];
    if (file.name.endsWith('.txt')) {
      documentText = await readFileAsText(file);
    } else if (file.name.endsWith('.docx')) {
      documentText = await docxToText(file);
    }
    showToast('Document loaded!', 'success');
  });

  document.getElementById('copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('summary-result')!.textContent || '');
    showToast('Copied!', 'success');
  });

  document.getElementById('summarize-btn')?.addEventListener('click', handleSummarize);
}

async function handleSummarize(): Promise<void> {
  const textInput = (document.getElementById('text-input') as HTMLTextAreaElement).value;
  const text = textInput || documentText;

  if (!text.trim()) {
    showToast('Please enter or upload text to summarize', 'warning');
    return;
  }

  showLoading('AI is summarizing...');
  try {
    const length = (document.getElementById('length') as HTMLSelectElement).value as 'short' | 'medium' | 'long';
    const styleMap: Record<string, 'bullet' | 'paragraph' | 'brief'> = { short: 'brief', medium: 'bullet', long: 'paragraph' };
    const response = await summarizeText(text, { style: styleMap[length] });
    document.getElementById('summary-result')!.innerHTML = response.result.replace(/\n/g, '<br>');
    document.getElementById('result-area')?.classList.remove('hidden');
    showToast('Summary generated!', 'success');
  } catch (e) {
    showToast('Summarization failed. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}
