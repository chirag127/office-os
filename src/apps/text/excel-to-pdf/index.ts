/**
 * Office OS - Excel to PDF Tool
 * Helper guide for converting Excel to PDF (Client-side limitation)
 */
import { renderToolPage } from '../../../components/shared';

export function renderExcelToPdf(): string {
  return renderToolPage({
    title: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF',
    toolContent: `
      <div class="guide-content">
        <div class="feature-icon">📊</div>
        <h3>Client-Side Conversion Limitation</h3>
        <p>Converting complex Excel spreadsheets to PDF in the browser is limited. For the best results, we recommend using Excel's built-in export.</p>

        <div class="steps-card">
            <h4>Recommended Workaround (Best Quality):</h4>
            <ol>
                <li>Open your Excel workbook</li>
                <li>Go to <strong>File > Save As</strong> or <strong>Export</strong></li>
                <li>Select <strong>PDF (*.pdf)</strong> as the file format</li>
                <li>Adjust "Page Setup" options if needed to fit columns</li>
                <li>Click <strong>Save</strong></li>
            </ol>
            <p>This preserves your print areas, formulas, and formatting exactly as intended.</p>
        </div>
      </div>

      <style>
        .guide-content { text-align: center; max-width: 600px; margin: 0 auto; padding: var(--space-xl) 0; }
        .feature-icon { font-size: 3rem; margin-bottom: var(--space-md); }
        .steps-card {
            background: white;
            padding: var(--space-lg);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            text-align: left;
            margin: var(--space-lg) 0;
        }
        .steps-card h4 { color: var(--color-accent-primary); margin-bottom: var(--space-md); }
        .steps-card ol { padding-left: 20px; line-height: 1.6; }
        .steps-card li { margin-bottom: 10px; }
      </style>
    `,
    seoContent: `
      <h2>Convert Excel to PDF Online</h2>
      <p>Guide to converting XLSX and XLS spreadsheets to PDF format effectively.</p>
    `
  });
}
