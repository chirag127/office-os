/**
 * Office OS - AI Rewrite Tool
 */
import { rewriteText } from '../../../services/ai';
import { renderToolPage, renderActionButtons, showToast, showLoading, hideLoading } from '../../../components/shared';

export function renderRewrite(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'AI Rewrite',
    description: 'Improve, simplify, or change the tone of your text',
    toolContent: `
      <div class="rewrite-layout">
        <div class="input-section">
          <label>Original Text</label>
          <textarea id="input-text" class="input text-area" placeholder="Enter text to rewrite..."></textarea>
        </div>
        <div class="style-options">
          <label>Rewrite Style</label>
          <div class="style-grid">
            <button class="style-btn active" data-style="improve">✨ Improve</button>
            <button class="style-btn" data-style="simplify">📖 Simplify</button>
            <button class="style-btn" data-style="formal">👔 Formal</button>
            <button class="style-btn" data-style="casual">😊 Casual</button>
            <button class="style-btn" data-style="concise">📝 Concise</button>
            <button class="style-btn" data-style="expand">📚 Expand</button>
          </div>
        </div>
        <div class="output-section">
          <label>Rewritten Text</label>
          <textarea id="output-text" class="input text-area" readonly placeholder="Rewritten text will appear here..."></textarea>
          <button id="copy-btn" class="btn btn-secondary">📋 Copy</button>
        </div>
      </div>
      ${renderActionButtons([{ id: 'rewrite-btn', label: 'Rewrite Text', icon: '✨', primary: true }])}
      <style>.rewrite-layout{display:flex;flex-direction:column;gap:var(--space-xl);}.input-section label,.output-section label{display:block;margin-bottom:var(--space-sm);font-weight:500;}.text-area{width:100%;min-height:150px;}.style-options label{display:block;margin-bottom:var(--space-md);font-weight:500;}.style-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-md);}.style-btn{padding:var(--space-md);background:var(--glass-bg);border:2px solid transparent;border-radius:var(--radius-md);cursor:pointer;transition:all var(--transition-fast);}.style-btn:hover{background:var(--color-bg-hover);}.style-btn.active{border-color:var(--color-accent-primary);background:rgba(99,102,241,0.1);}@media(max-width:768px){.style-grid{grid-template-columns:repeat(2,1fr);}}</style>
    `,
    seoContent: `
      <h2>AI Text Rewriter</h2>
      <p>Transform your writing with AI. Improve clarity, change tone, simplify complex text, or expand on your ideas.</p>
      <h3>Rewriting Styles</h3>
      <ul>
        <li><strong>Improve:</strong> Enhance clarity, flow, and grammar</li>
        <li><strong>Simplify:</strong> Make complex text easier to understand</li>
        <li><strong>Formal:</strong> Professional, business-appropriate tone</li>
        <li><strong>Casual:</strong> Friendly, conversational style</li>
        <li><strong>Concise:</strong> Trim unnecessary words</li>
        <li><strong>Expand:</strong> Add more detail and explanation</li>
      </ul>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Emails:</strong> Polish professional communications</li>
        <li><strong>Essays:</strong> Improve academic writing</li>
        <li><strong>Marketing:</strong> Optimize copy for impact</li>
        <li><strong>Social Media:</strong> Create engaging posts</li>
      </ul>
      <h3>AI-Powered Writing</h3>
      <p>Our AI understands context and meaning, producing natural rewrites that maintain your original intent while improving the presentation.</p>
    `,
  });
}

let selectedStyle = 'improve';

function init(): void {
  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedStyle = (btn as HTMLElement).dataset.style!;
    });
  });

  document.getElementById('copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText((document.getElementById('output-text') as HTMLTextAreaElement).value);
    showToast('Copied!', 'success');
  });

  document.getElementById('rewrite-btn')?.addEventListener('click', handleRewrite);
}

async function handleRewrite(): Promise<void> {
  const text = (document.getElementById('input-text') as HTMLTextAreaElement).value.trim();
  if (!text) {
    showToast('Please enter text to rewrite', 'warning');
    return;
  }

  showLoading('AI is rewriting...');
  try {
    const styleMap: Record<string, 'professional' | 'casual' | 'academic' | 'simple' | 'creative'> = {
      improve: 'professional', simplify: 'simple', formal: 'professional', casual: 'casual', concise: 'simple', expand: 'creative'
    };
    const response = await rewriteText(text, styleMap[selectedStyle]);
    (document.getElementById('output-text') as HTMLTextAreaElement).value = response.result;
    showToast('Text rewritten!', 'success');
  } catch (e) {
    showToast('Rewriting failed', 'error');
  } finally {
    hideLoading();
  }
}
