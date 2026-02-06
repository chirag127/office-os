/**
 * Office OS - Text Diff Tool
 */
import { renderToolPage, renderActionButtons, showToast } from '../../../components/shared';

export function renderTextDiff(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Text Diff',
    description: 'Compare two texts and highlight differences',
    toolContent: `
      <div class="diff-inputs">
        <div class="diff-pane"><label>Original Text</label><textarea id="text1" class="input diff-text" placeholder="Paste original text here..."></textarea></div>
        <div class="diff-pane"><label>Modified Text</label><textarea id="text2" class="input diff-text" placeholder="Paste modified text here..."></textarea></div>
      </div>
      <div id="diff-result" class="diff-result hidden">
        <h3>Differences</h3>
        <div id="diff-output" class="diff-output"></div>
        <div class="diff-stats"><span id="additions" class="stat-add"></span><span id="deletions" class="stat-del"></span></div>
      </div>
      ${renderActionButtons([{ id: 'compare-btn', label: 'Compare', icon: '🔍', primary: true }])}
      <style>.diff-inputs{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);margin-bottom:var(--space-lg);}.diff-pane label{display:block;margin-bottom:var(--space-sm);font-weight:500;}.diff-text{width:100%;height:200px;font-family:monospace;}.diff-result{margin:var(--space-xl) 0;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.diff-output{font-family:monospace;white-space:pre-wrap;line-height:1.8;max-height:400px;overflow-y:auto;}.diff-line{padding:2px 8px;margin:2px 0;border-radius:3px;}.diff-add{background:rgba(34,197,94,0.2);border-left:3px solid var(--color-success);}.diff-del{background:rgba(239,68,68,0.2);border-left:3px solid var(--color-error);}.diff-same{opacity:0.7;}.diff-stats{margin-top:var(--space-lg);display:flex;gap:var(--space-lg);}.stat-add{color:var(--color-success);}.stat-del{color:var(--color-error);}.hidden{display:none!important;}@media(max-width:768px){.diff-inputs{grid-template-columns:1fr;}}</style>
    `,
    seoContent: `
      <h2>Text Comparison Tool - Find Differences</h2>
      <p>Compare two texts side by side and see exactly what changed. Additions, deletions, and modifications are highlighted for easy review.</p>
      <h3>How It Works</h3>
      <p>Paste your original text and modified text, then click Compare. The tool analyzes both texts line by line and highlights:</p>
      <ul>
        <li><strong>Green:</strong> Added lines</li>
        <li><strong>Red:</strong> Deleted lines</li>
        <li><strong>Gray:</strong> Unchanged lines</li>
      </ul>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Code Review:</strong> Compare code versions</li>
        <li><strong>Document Editing:</strong> Track changes between drafts</li>
        <li><strong>Text Verification:</strong> Ensure correct copies</li>
        <li><strong>Translation:</strong> Compare original and translated text</li>
      </ul>
      <h3>Privacy</h3>
      <p>All comparison happens locally in your browser. Your texts are never uploaded.</p>
    `,
  });
}

function init(): void {
  document.getElementById('compare-btn')?.addEventListener('click', handleCompare);
}

function handleCompare(): void {
  const text1 = (document.getElementById('text1') as HTMLTextAreaElement).value;
  const text2 = (document.getElementById('text2') as HTMLTextAreaElement).value;

  if (!text1 || !text2) {
    showToast('Please enter both texts', 'warning');
    return;
  }

  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  let output = '';
  let additions = 0;
  let deletions = 0;

  const maxLen = Math.max(lines1.length, lines2.length);
  for (let i = 0; i < maxLen; i++) {
    const l1 = lines1[i] || '';
    const l2 = lines2[i] || '';

    if (l1 === l2) {
      output += `<div class="diff-line diff-same">${escapeHtml(l1) || '&nbsp;'}</div>`;
    } else {
      if (l1 && (!l2 || l1 !== l2)) {
        output += `<div class="diff-line diff-del">- ${escapeHtml(l1)}</div>`;
        deletions++;
      }
      if (l2 && (!l1 || l1 !== l2)) {
        output += `<div class="diff-line diff-add">+ ${escapeHtml(l2)}</div>`;
        additions++;
      }
    }
  }

  document.getElementById('diff-output')!.innerHTML = output;
  document.getElementById('additions')!.textContent = `+${additions} additions`;
  document.getElementById('deletions')!.textContent = `-${deletions} deletions`;
  document.getElementById('diff-result')?.classList.remove('hidden');
  showToast('Comparison complete!', 'success');
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
