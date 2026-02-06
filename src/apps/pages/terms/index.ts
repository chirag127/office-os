/**
 * Office OS - Terms of Service Page
 */
import { renderToolPage } from '../../../components/shared';

export function renderTerms(): string {
  return renderToolPage({
    title: 'Terms of Service',
    description: 'Terms and conditions for using Office OS',
    toolContent: `
      <div class="terms-content">
        <p class="last-updated">Last Updated: January 2025</p>

        <h2>Acceptance of Terms</h2>
        <p>By using Office OS, you agree to these terms. If you don't agree, please don't use our services.</p>

        <h2>Description of Service</h2>
        <p>Office OS provides free online document tools including PDF editing, image manipulation, AI-powered text analysis, and utilities. All tools are provided "as is" without warranty.</p>

        <h2>User Responsibilities</h2>
        <ul>
          <li>Use the service only for lawful purposes</li>
          <li>Don't upload illegal or harmful content</li>
          <li>Take responsibility for your own files and data</li>
          <li>Keep backups of important documents</li>
        </ul>

        <h2>Limitations</h2>
        <p>We strive for accuracy but cannot guarantee perfect results. For critical documents, always verify the output before use. We're not liable for any damages arising from the use of our tools.</p>

        <h2>Intellectual Property</h2>
        <p>You retain all rights to your content. We claim no ownership over any documents you process using our tools.</p>

        <h2>Changes to Terms</h2>
        <p>We may update these terms occasionally. Continued use after changes constitutes acceptance of new terms.</p>

        <h2>Contact</h2>
        <p>Questions about these terms? Contact us at legal@office-os.com</p>
      </div>
      <style>.terms-content{max-width:800px;margin:0 auto;}.last-updated{color:var(--color-text-tertiary);font-size:var(--font-size-sm);}.terms-content h2{margin:var(--space-xl) 0 var(--space-md);font-size:var(--font-size-lg);}.terms-content p,.terms-content ul{line-height:1.8;margin-bottom:var(--space-md);}.terms-content li{margin-left:var(--space-lg);}</style>
    `,
    seoContent: `
      <h2>Terms of Service</h2>
      <p>These terms govern your use of Office OS document tools. By using our services, you agree to these terms.</p>
      <h3>Key Terms</h3>
      <ul>
        <li>Free to use for personal and commercial purposes</li>
        <li>No warranty - use at your own risk</li>
        <li>You own your content</li>
        <li>Use responsibly and legally</li>
      </ul>
    `,
  });
}
