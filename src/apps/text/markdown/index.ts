/**
 * Office OS - Markdown Editor Tool
 */
import { downloadFile } from '../../../services/file';
import { renderToolPage, renderActionButtons, showToast } from '../../../components/shared';

export function renderMarkdownEditor(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Markdown Editor',
    description: 'Write and preview Markdown with live rendering',
    toolContent: `
      <div class="md-toolbar">
        <button class="tb-btn" data-action="bold" title="Bold">B</button>
        <button class="tb-btn" data-action="italic" title="Italic"><i>I</i></button>
        <button class="tb-btn" data-action="heading" title="Heading">H</button>
        <button class="tb-btn" data-action="link" title="Link">🔗</button>
        <button class="tb-btn" data-action="code" title="Code">{ }</button>
        <button class="tb-btn" data-action="list" title="List">•</button>
      </div>
      <div class="md-container">
        <div class="md-pane"><label>Markdown</label><textarea id="md-input" class="md-textarea" placeholder="# Hello World\n\nStart writing Markdown..."></textarea></div>
        <div class="md-pane"><label>Preview</label><div id="md-preview" class="md-preview"></div></div>
      </div>
      ${renderActionButtons([{ id: 'download-md', label: 'Download .md', icon: '💾' }, { id: 'download-html', label: 'Download HTML', icon: '📄', primary: true }])}
      <style>.md-toolbar{display:flex;gap:var(--space-sm);margin-bottom:var(--space-md);padding:var(--space-sm);background:var(--glass-bg);border-radius:var(--radius-md);}.tb-btn{width:36px;height:36px;background:var(--color-bg-tertiary);border:none;border-radius:var(--radius-sm);cursor:pointer;font-weight:bold;}.tb-btn:hover{background:var(--color-bg-hover);}.md-container{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);}.md-pane label{display:block;margin-bottom:var(--space-sm);font-weight:500;color:var(--color-text-tertiary);font-size:var(--font-size-sm);}.md-textarea{width:100%;height:400px;font-family:monospace;resize:vertical;}.md-preview{height:400px;overflow-y:auto;padding:var(--space-lg);background:var(--glass-bg);border-radius:var(--radius-md);}.md-preview h1,.md-preview h2,.md-preview h3{margin:1em 0 0.5em;}.md-preview p{margin:0.5em 0;line-height:1.7;}.md-preview code{background:var(--color-bg-tertiary);padding:0.2em 0.4em;border-radius:3px;font-family:monospace;}.md-preview pre{background:var(--color-bg-tertiary);padding:1em;border-radius:var(--radius-sm);overflow-x:auto;}.md-preview blockquote{border-left:3px solid var(--color-accent-primary);padding-left:1em;margin:1em 0;color:var(--color-text-secondary);}@media(max-width:768px){.md-container{grid-template-columns:1fr;}.md-textarea,.md-preview{height:250px;}}</style>
    `,
    seoContent: `
      <h2>Online Markdown Editor with Live Preview</h2>
      <p>Write Markdown with instant preview. Our editor supports GitHub-flavored Markdown syntax and renders in real-time.</p>
      <h3>Markdown Syntax</h3>
      <ul>
        <li><strong>Headers:</strong> # H1, ## H2, ### H3</li>
        <li><strong>Bold:</strong> **bold text**</li>
        <li><strong>Italic:</strong> *italic text*</li>
        <li><strong>Links:</strong> [text](url)</li>
        <li><strong>Images:</strong> ![alt](url)</li>
        <li><strong>Code:</strong> \`inline\` or \`\`\`block\`\`\`</li>
        <li><strong>Lists:</strong> - or * for bullets, 1. for numbers</li>
        <li><strong>Blockquote:</strong> > quote text</li>
      </ul>
      <h3>Features</h3>
      <ul>
        <li>Real-time preview</li>
        <li>Toolbar for quick formatting</li>
        <li>Export to .md or HTML</li>
        <li>Works offline</li>
      </ul>
      <h3>Use Cases</h3>
      <ul>
        <li><strong>Documentation:</strong> Write README files</li>
        <li><strong>Blogging:</strong> Draft blog posts</li>
        <li><strong>Notes:</strong> Quick formatted notes</li>
        <li><strong>GitHub:</strong> Prepare repository docs</li>
      </ul>
    `,
  });
}

function init(): void {
  const input = document.getElementById('md-input') as HTMLTextAreaElement;
  const preview = document.getElementById('md-preview')!;

  const renderMarkdown = () => {
    let md = input.value;
    // Simple Markdown parser
    md = md.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    md = md.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    md = md.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    md = md.replace(/\*(.+?)\*/g, '<em>$1</em>');
    md = md.replace(/`(.+?)`/g, '<code>$1</code>');
    md = md.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
    md = md.replace(/^> (.+$)/gim, '<blockquote>$1</blockquote>');
    md = md.replace(/^- (.+$)/gim, '<li>$1</li>');
    md = md.replace(/\n/g, '<br>');
    preview.innerHTML = md;
  };

  input.addEventListener('input', renderMarkdown);

  document.querySelectorAll('.tb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.action;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const text = input.value;
      const selected = text.substring(start, end) || 'text';
      let insert = '';

      switch (action) {
        case 'bold': insert = `**${selected}**`; break;
        case 'italic': insert = `*${selected}*`; break;
        case 'heading': insert = `# ${selected}`; break;
        case 'link': insert = `[${selected}](url)`; break;
        case 'code': insert = `\`${selected}\``; break;
        case 'list': insert = `- ${selected}`; break;
      }

      input.value = text.substring(0, start) + insert + text.substring(end);
      renderMarkdown();
    });
  });

  document.getElementById('download-md')?.addEventListener('click', () => {
    downloadFile(new Blob([input.value], { type: 'text/markdown' }), 'document.md');
    showToast('Downloaded!', 'success');
  });

  document.getElementById('download-html')?.addEventListener('click', () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Document</title></head><body>${preview.innerHTML}</body></html>`;
    downloadFile(new Blob([html], { type: 'text/html' }), 'document.html');
    showToast('Downloaded!', 'success');
  });
}
