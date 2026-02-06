/**
 * Office OS - Lorem Ipsum Generator
 */
import { generateLoremIpsum } from '../../../services/utility';
import { renderToolPage, renderActionButtons, showToast } from '../../../components/shared';

export function renderLoremIpsum(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for designs and mockups',
    toolContent: `
      <div class="lorem-options">
        <label>Amount<input type="number" id="amount" class="input" value="5" min="1" max="100"></label>
        <label>Type<select id="type" class="input"><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></label>
      </div>
      <div class="output-section">
        <div id="lorem-output" class="lorem-output"></div>
        <button id="copy-btn" class="btn btn-secondary">📋 Copy</button>
      </div>
      ${renderActionButtons([{ id: 'generate-btn', label: 'Generate', icon: '📜', primary: true }])}
      <style>.lorem-options{display:flex;gap:var(--space-lg);margin-bottom:var(--space-xl);}.lorem-options label{flex:1;display:flex;flex-direction:column;gap:var(--space-sm);}.output-section{margin:var(--space-lg) 0;}.lorem-output{padding:var(--space-xl);background:var(--glass-bg);border-radius:var(--radius-md);line-height:1.8;min-height:200px;max-height:400px;overflow-y:auto;margin-bottom:var(--space-md);}</style>
    `,
    seoContent: `
      <h2>Lorem Ipsum Generator</h2>
      <p>Generate placeholder text for your designs, mockups, and prototypes. Lorem Ipsum is standard dummy text used in the printing and typesetting industry.</p>
      <h3>What is Lorem Ipsum?</h3>
      <p>Lorem Ipsum is scrambled Latin text that has been the industry standard for placeholder text since the 1500s. It looks like readable text but is meaningless, making it perfect for design mockups.</p>
      <h3>Generation Options</h3>
      <ul>
        <li><strong>Paragraphs:</strong> Generate full paragraphs of text</li>
        <li><strong>Sentences:</strong> Generate individual sentences</li>
        <li><strong>Words:</strong> Generate a specific word count</li>
      </ul>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Web Design:</strong> Fill layouts with realistic text</li>
        <li><strong>Print Design:</strong> Mock up materials before final copy</li>
        <li><strong>Development:</strong> Test text rendering and layouts</li>
        <li><strong>Presentations:</strong> Create placeholder content</li>
      </ul>
    `,
  });
}

function init(): void {
  document.getElementById('generate-btn')?.addEventListener('click', handleGenerate);

  document.getElementById('copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('lorem-output')!.textContent || '');
    showToast('Copied!', 'success');
  });

  // Generate initial text
  handleGenerate();
}

function handleGenerate(): void {
  const amount = parseInt((document.getElementById('amount') as HTMLInputElement).value);
  const type = (document.getElementById('type') as HTMLSelectElement).value as 'paragraphs' | 'sentences' | 'words';

  const text = generateLoremIpsum(amount, type);
  document.getElementById('lorem-output')!.innerHTML = text.split('\n\n').map(p => `<p>${p}</p>`).join('');
}
