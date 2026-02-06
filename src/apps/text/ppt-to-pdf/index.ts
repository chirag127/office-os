/**
 * Office OS - PPT to PDF Tool
 * Helper guide for converting PPT to PDF (Client-side limitation)
 */
import { renderToolPage } from '../../../components/shared';

export function renderPptToPdf(): string {
  return renderToolPage({
    title: 'PPT to PDF',
    description: 'Convert PowerPoint presentations to PDF',
    toolContent: `
      <div class="guide-content">
        <div class="feature-icon">💡</div>
        <h3>Client-Side Conversion Limitation</h3>
        <p>Directly converting PowerPoint files to PDF entirely in the browser is currently technically limited due to the complexity of the .pptx format.</p>

        <div class="steps-card">
            <h4>Recommended Workaround (Best Quality):</h4>
            <ol>
                <li>Open your PowerPoint presentation</li>
                <li>Go to <strong>File > Save As</strong> or <strong>Export</strong></li>
                <li>Select <strong>PDF (*.pdf)</strong> as the file format</li>
                <li>Click <strong>Save</strong></li>
            </ol>
            <p>This ensures 100% fidelity of your fonts, animations, and layout.</p>
        </div>

        <div class="dev-note">
            We are working on a cloud-based solution for this feature.
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
        .dev-note { color: var(--color-text-secondary); font-size: 0.9rem; font-style: italic; }
      </style>
    `,
    seoContent: `
      <h2>Convert PowerPoint to PDF</h2>
      <p>Learn how to save your PPT and PPTX presentations as PDF documents with high quality.</p>
    `
  });
}
