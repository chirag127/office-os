/**
 * Office OS - Word Count Tool
 */
import { getTextStats } from '../../../services/utility';
import { renderToolPage } from '../../../components/shared';

export function renderWordCount(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Word Counter',
    description: 'Count words, characters, sentences, and more',
    toolContent: `
      <div class="count-container">
        <textarea id="text-input" class="input count-textarea" placeholder="Start typing or paste your text here..."></textarea>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-value" id="words">0</div><div class="stat-label">Words</div></div>
          <div class="stat-card"><div class="stat-value" id="chars">0</div><div class="stat-label">Characters</div></div>
          <div class="stat-card"><div class="stat-value" id="chars-no-space">0</div><div class="stat-label">Characters (no spaces)</div></div>
          <div class="stat-card"><div class="stat-value" id="sentences">0</div><div class="stat-label">Sentences</div></div>
          <div class="stat-card"><div class="stat-value" id="paragraphs">0</div><div class="stat-label">Paragraphs</div></div>
          <div class="stat-card"><div class="stat-value" id="reading-time">0</div><div class="stat-label">Reading Time</div></div>
        </div>
      </div>
      <style>.count-container{margin:var(--space-lg) 0;}.count-textarea{width:100%;height:250px;resize:vertical;font-size:var(--font-size-lg);line-height:1.8;}.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-lg);margin-top:var(--space-xl);}.stat-card{background:var(--glass-bg);padding:var(--space-xl);border-radius:var(--radius-md);text-align:center;}.stat-value{font-size:var(--font-size-3xl);font-weight:700;color:var(--color-accent-primary);}.stat-label{font-size:var(--font-size-sm);color:var(--color-text-tertiary);margin-top:var(--space-sm);}@media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr);}}</style>
    `,
    seoContent: `
      <h2>Free Word Counter & Text Analyzer</h2>
      <p>Count words, characters, sentences, and paragraphs in real-time. Get reading time estimates and text statistics instantly.</p>
      <h3>Statistics Provided</h3>
      <ul>
        <li><strong>Word Count:</strong> Total words in your text</li>
        <li><strong>Character Count:</strong> With and without spaces</li>
        <li><strong>Sentence Count:</strong> Based on punctuation</li>
        <li><strong>Paragraph Count:</strong> Based on line breaks</li>
        <li><strong>Reading Time:</strong> Estimated at 200 words/minute</li>
      </ul>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Essays:</strong> Meet word count requirements</li>
        <li><strong>Social Media:</strong> Stay within character limits</li>
        <li><strong>SEO:</strong> Optimize content length</li>
        <li><strong>Writing:</strong> Track progress on documents</li>
      </ul>
      <h3>Privacy</h3>
      <p>All counting happens locally in your browser. Your text is never sent to any server.</p>
    `,
  });
}

function init(): void {
  const input = document.getElementById('text-input') as HTMLTextAreaElement;

  const updateStats = () => {
    const text = input.value;
    const stats = getTextStats(text);

    document.getElementById('words')!.textContent = String(stats.words);
    document.getElementById('chars')!.textContent = String(stats.characters);
    document.getElementById('chars-no-space')!.textContent = String(stats.charactersNoSpaces);
    document.getElementById('sentences')!.textContent = String(stats.sentences);
    document.getElementById('paragraphs')!.textContent = String(stats.paragraphs);
    document.getElementById('reading-time')!.textContent = stats.readingTime;
  };

  input.addEventListener('input', updateStats);
}
