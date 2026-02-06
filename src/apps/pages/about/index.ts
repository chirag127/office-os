/**
 * Office OS - About Page
 */
import { renderToolPage } from '../../../components/shared';

export function renderAbout(): string {
  return renderToolPage({
    title: 'About Office OS',
    description: 'Learn about our privacy-first document tools',
    toolContent: `
      <div class="about-content">
        <h2>🛡️ Privacy First</h2>
        <p>Office OS processes all your files locally in your browser. Your documents never leave your device, ensuring complete privacy and security.</p>

        <h2>🚀 Powerful Tools</h2>
        <p>Access 35+ professional document tools including PDF editing, image manipulation, AI-powered text analysis, and more - all for free.</p>

        <h2>⚡ No Installation</h2>
        <p>Everything runs in your browser. No downloads, no installations, no account required. Just open and start using.</p>

        <h2>🤖 AI-Powered</h2>
        <p>Leverage advanced AI through Puter.js for OCR, text summarization, translation, and document chat - all with privacy in mind.</p>

        <h2>💻 Open Source</h2>
        <p>Office OS is built with transparency. All processing is done client-side using open-source libraries you can trust.</p>
      </div>
      <style>.about-content{max-width:800px;margin:0 auto;}.about-content h2{margin:var(--space-xl) 0 var(--space-md);font-size:var(--font-size-xl);}.about-content p{line-height:1.8;color:var(--color-text-secondary);margin-bottom:var(--space-lg);}</style>
    `,
    seoContent: `
      <h2>About Office OS</h2>
      <p>Office OS is a comprehensive suite of online document tools designed with privacy as the core principle. Unlike traditional cloud-based tools that upload your files to external servers, Office OS processes everything locally in your browser.</p>
      <h3>Our Mission</h3>
      <p>To provide professional-grade document tools that respect user privacy. We believe you shouldn't have to sacrifice your data security to edit a PDF or compress an image.</p>
      <h3>Technology</h3>
      <p>Built with modern web technologies including TypeScript, Vite, and a suite of powerful open-source libraries. AI features are powered by Puter.js, providing advanced capabilities while maintaining privacy.</p>
    `,
  });
}
