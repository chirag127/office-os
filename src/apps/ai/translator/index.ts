/**
 * Office OS - AI Translator Tool
 */
import { translateText } from '../../../services/ai';
import { renderToolPage, renderActionButtons, showToast, showLoading, hideLoading } from '../../../components/shared';

export function renderTranslator(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'AI Translator',
    description: 'Translate text between languages using AI',
    toolContent: `
      <div class="translator-layout">
        <div class="translate-box">
          <div class="lang-header"><select id="source-lang" class="input"><option value="auto">Auto-detect</option><option value="English">English</option><option value="Spanish">Spanish</option><option value="French">French</option><option value="German">German</option><option value="Chinese">Chinese</option><option value="Japanese">Japanese</option><option value="Hindi">Hindi</option><option value="Arabic">Arabic</option><option value="Portuguese">Portuguese</option><option value="Russian">Russian</option></select></div>
          <textarea id="source-text" class="input translate-text" placeholder="Enter text to translate..."></textarea>
          <div class="char-count"><span id="char-count">0</span> characters</div>
        </div>
        <button id="swap-btn" class="btn btn-icon swap-btn">⇄</button>
        <div class="translate-box">
          <div class="lang-header"><select id="target-lang" class="input"><option value="Spanish">Spanish</option><option value="English">English</option><option value="French">French</option><option value="German">German</option><option value="Chinese">Chinese</option><option value="Japanese">Japanese</option><option value="Hindi">Hindi</option><option value="Arabic">Arabic</option><option value="Portuguese">Portuguese</option><option value="Russian">Russian</option></select></div>
          <textarea id="target-text" class="input translate-text" placeholder="Translation will appear here..." readonly></textarea>
          <button id="copy-btn" class="btn btn-secondary btn-sm">📋 Copy</button>
        </div>
      </div>
      ${renderActionButtons([{ id: 'translate-btn', label: 'Translate', icon: '🌍', primary: true }])}
      <style>.translator-layout{display:grid;grid-template-columns:1fr auto 1fr;gap:var(--space-lg);align-items:start;margin:var(--space-lg) 0;}.translate-box{background:var(--glass-bg);border-radius:var(--radius-md);padding:var(--space-lg);}.lang-header{margin-bottom:var(--space-md);}.translate-text{width:100%;min-height:200px;resize:vertical;}.char-count{font-size:var(--font-size-sm);color:var(--color-text-tertiary);margin-top:var(--space-sm);}.swap-btn{align-self:center;font-size:1.5em;}@media(max-width:768px){.translator-layout{grid-template-columns:1fr;}.swap-btn{justify-self:center;transform:rotate(90deg);}}</style>
    `,
    seoContent: `
      <h2>AI-Powered Translation</h2>
      <p>Translate text between languages using advanced AI. Get natural, context-aware translations that sound fluent and accurate.</p>
      <h3>Supported Languages</h3>
      <p>Translate between English, Spanish, French, German, Chinese, Japanese, Hindi, Arabic, Portuguese, Russian, and more.</p>
      <h3>AI Advantage</h3>
      <p>Unlike traditional translators, our AI understands context, idioms, and nuance. This results in translations that sound natural rather than mechanical.</p>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Communication:</strong> Translate messages and emails</li>
        <li><strong>Business:</strong> Translate documents and content</li>
        <li><strong>Travel:</strong> Quick translations on the go</li>
        <li><strong>Learning:</strong> Understand foreign language content</li>
      </ul>
      <h3>Tips for Best Results</h3>
      <ul>
        <li>Use proper punctuation and grammar</li>
        <li>Keep sentences clear and concise</li>
        <li>For technical content, specify context</li>
      </ul>
    `,
  });
}

function init(): void {
  document.getElementById('source-text')?.addEventListener('input', (e) => {
    document.getElementById('char-count')!.textContent = String((e.target as HTMLTextAreaElement).value.length);
  });

  document.getElementById('swap-btn')?.addEventListener('click', () => {
    const source = document.getElementById('source-lang') as HTMLSelectElement;
    const target = document.getElementById('target-lang') as HTMLSelectElement;
    const sourceText = document.getElementById('source-text') as HTMLTextAreaElement;
    const targetText = document.getElementById('target-text') as HTMLTextAreaElement;

    if (source.value !== 'auto') {
      const temp = source.value;
      source.value = target.value;
      target.value = temp;
    }
    sourceText.value = targetText.value;
    targetText.value = '';
    document.getElementById('char-count')!.textContent = String(sourceText.value.length);
  });

  document.getElementById('copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText((document.getElementById('target-text') as HTMLTextAreaElement).value);
    showToast('Copied!', 'success');
  });

  document.getElementById('translate-btn')?.addEventListener('click', handleTranslate);
}

async function handleTranslate(): Promise<void> {
  const text = (document.getElementById('source-text') as HTMLTextAreaElement).value.trim();
  const targetLang = (document.getElementById('target-lang') as HTMLSelectElement).value;

  if (!text) {
    showToast('Please enter text to translate', 'warning');
    return;
  }

  showLoading('Translating...');
  try {
    const response = await translateText(text, targetLang);
    (document.getElementById('target-text') as HTMLTextAreaElement).value = response.result;
    showToast('Translation complete!', 'success');
  } catch (e) {
    showToast('Translation failed', 'error');
  } finally {
    hideLoading();
  }
}
