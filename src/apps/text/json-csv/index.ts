/**
 * Office OS - JSON/CSV Converter Tool
 */
import { parseCSVString, jsonToCSV, downloadFile } from '../../../services/file';
import { renderToolPage, renderActionButtons, showToast } from '../../../components/shared';

export function renderJSONCSV(): string {
  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'JSON ↔ CSV Converter',
    description: 'Convert between JSON and CSV formats',
    toolContent: `
      <div class="converter-tabs">
        <button class="conv-tab active" data-mode="json-to-csv">JSON → CSV</button>
        <button class="conv-tab" data-mode="csv-to-json">CSV → JSON</button>
      </div>
      <div id="json-panel" class="conv-panel active">
        <label>JSON Input</label>
        <textarea id="json-input" class="input code-area" placeholder='[{"name":"John","age":30},{"name":"Jane","age":25}]'></textarea>
      </div>
      <div id="csv-panel" class="conv-panel">
        <label>CSV Input</label>
        <textarea id="csv-input" class="input code-area" placeholder="name,age\nJohn,30\nJane,25"></textarea>
      </div>
      <div class="output-section">
        <label>Output</label>
        <textarea id="output" class="input code-area" readonly placeholder="Converted output will appear here..."></textarea>
        <div class="output-actions"><button id="copy-btn" class="btn btn-secondary">📋 Copy</button><button id="download-btn" class="btn btn-secondary">💾 Download</button></div>
      </div>
      ${renderActionButtons([{ id: 'convert-btn', label: 'Convert', icon: '🔄', primary: true }])}
      <style>.converter-tabs{display:flex;gap:var(--space-sm);margin-bottom:var(--space-lg);}.conv-tab{flex:1;padding:var(--space-md);background:var(--glass-bg);border:none;border-radius:var(--radius-md);cursor:pointer;}.conv-tab.active{background:var(--color-accent-gradient);color:white;}.conv-panel{display:none;margin-bottom:var(--space-lg);}.conv-panel.active{display:block;}.conv-panel label{display:block;margin-bottom:var(--space-sm);font-weight:500;}.code-area{width:100%;height:150px;font-family:monospace;resize:vertical;}.output-section{margin:var(--space-xl) 0;}.output-section label{display:block;margin-bottom:var(--space-sm);font-weight:500;}.output-actions{display:flex;gap:var(--space-md);margin-top:var(--space-md);}</style>
    `,
    seoContent: `
      <h2>JSON to CSV Converter & CSV to JSON</h2>
      <p>Convert between JSON and CSV formats instantly. Perfect for data processing, spreadsheet work, and API data handling.</p>
      <h3>JSON to CSV</h3>
      <p>Convert JSON arrays of objects to comma-separated values. Each object becomes a row, and keys become column headers.</p>
      <h3>CSV to JSON</h3>
      <p>Transform CSV data into JSON arrays. The first row is used as keys, and subsequent rows become objects.</p>
      <h3>Use Cases</h3>
      <ul>
        <li>Import/export data to spreadsheets</li>
        <li>Process API responses</li>
        <li>Data migration between systems</li>
        <li>Quick data transformation</li>
      </ul>
      <h3>Privacy</h3>
      <p>All conversion happens in your browser. No data is uploaded to any server.</p>
    `,
  });
}

let mode = 'json-to-csv';

function init(): void {
  document.querySelectorAll('.conv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.conv-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      mode = (tab as HTMLElement).dataset.mode!;
      document.getElementById('json-panel')?.classList.toggle('active', mode === 'json-to-csv');
      document.getElementById('csv-panel')?.classList.toggle('active', mode === 'csv-to-json');
    });
  });

  document.getElementById('convert-btn')?.addEventListener('click', handleConvert);

  document.getElementById('copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText((document.getElementById('output') as HTMLTextAreaElement).value);
    showToast('Copied!', 'success');
  });

  document.getElementById('download-btn')?.addEventListener('click', () => {
    const output = (document.getElementById('output') as HTMLTextAreaElement).value;
    const ext = mode === 'json-to-csv' ? 'csv' : 'json';
    downloadFile(new Blob([output], { type: 'text/plain' }), `converted.${ext}`);
    showToast('Downloaded!', 'success');
  });
}

function handleConvert(): void {
  try {
    if (mode === 'json-to-csv') {
      const json = JSON.parse((document.getElementById('json-input') as HTMLTextAreaElement).value);
      const csv = jsonToCSV(json);
      (document.getElementById('output') as HTMLTextAreaElement).value = csv;
    } else {
      const csv = (document.getElementById('csv-input') as HTMLTextAreaElement).value;
      const json = parseCSVString(csv);
      (document.getElementById('output') as HTMLTextAreaElement).value = JSON.stringify(json, null, 2);
    }
    showToast('Converted!', 'success');
  } catch (e) {
    showToast('Invalid input format', 'error');
  }
}
