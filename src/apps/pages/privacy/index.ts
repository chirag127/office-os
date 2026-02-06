/**
 * Office OS - Privacy Policy Page
 */
import { renderToolPage } from '../../../components/shared';

export function renderPrivacy(): string {
  return renderToolPage({
    title: 'Privacy Policy',
    description: 'How we protect your data',
    toolContent: `
      <div class="policy-content">
        <p class="last-updated">Last Updated: January 2025</p>

        <h2>Summary</h2>
        <p><strong>We don't collect your files or personal data.</strong> All document processing happens locally in your browser.</p>

        <h2>Local Processing</h2>
        <p>Office OS is designed to process all documents entirely within your web browser. When you use our PDF, image, or text tools, your files never leave your device. The processing happens using JavaScript libraries running locally on your machine.</p>

        <h2>AI Features</h2>
        <p>Some features (OCR, summarization, translation, chat) use Puter.js AI services. When you use these features, your text is sent to Puter's secure servers for processing. Puter does not store your data beyond the time needed to complete the request. For maximum privacy, you can use local-only tools that don't require AI.</p>

        <h2>No Accounts</h2>
        <p>Office OS doesn't require user registration. We don't track individual users or maintain user profiles.</p>

        <h2>Analytics</h2>
        <p>We may use anonymous analytics to understand how our tools are used. This data is aggregated and contains no personal information.</p>

        <h2>Cookies</h2>
        <p>We use essential cookies only for basic functionality like remembering your theme preference. We don't use tracking cookies.</p>

        <h2>Contact</h2>
        <p>Questions about privacy? Contact us at privacy@office-os.com</p>
      </div>
      <style>.policy-content{max-width:800px;margin:0 auto;}.last-updated{color:var(--color-text-tertiary);font-size:var(--font-size-sm);}.policy-content h2{margin:var(--space-xl) 0 var(--space-md);font-size:var(--font-size-lg);}.policy-content p{line-height:1.8;margin-bottom:var(--space-md);}</style>
    `,
    seoContent: `
      <h2>Privacy Policy</h2>
      <p>Office OS is committed to protecting your privacy. This policy explains how we handle your data when you use our document tools.</p>
      <h3>Key Points</h3>
      <ul>
        <li>Files are processed locally in your browser</li>
        <li>We don't upload your documents to our servers</li>
        <li>No user accounts or personal data collection</li>
        <li>AI features use secure third-party processing</li>
      </ul>
    `,
  });
}
