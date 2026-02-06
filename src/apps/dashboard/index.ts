/**
 * Office OS - Dashboard
 * Home page with tool grid and quick access
 */

interface ToolCategory {
  title: string;
  icon: string;
  description: string;
  tools: Array<{
    path: string;
    title: string;
    description: string;
    icon: string;
  }>;
}

const categories: ToolCategory[] = [
  {
    title: 'PDF Tools',
    icon: '📄',
    description: 'Edit, merge, split, and convert PDF files',
    tools: [
      { path: '/apps/pdf/merge', title: 'Merge PDF', description: 'Combine multiple PDFs', icon: '📑' },
      { path: '/apps/pdf/split', title: 'Split PDF', description: 'Extract pages from PDF', icon: '✂️' },
      { path: '/apps/pdf/compress', title: 'Compress PDF', description: 'Reduce file size', icon: '📦' },
      { path: '/apps/pdf/to-jpg', title: 'PDF to JPG', description: 'Convert pages to images', icon: '🖼️' },
      { path: '/apps/pdf/from-jpg', title: 'JPG to PDF', description: 'Images to PDF', icon: '📷' },
      { path: '/apps/pdf/sign', title: 'Sign PDF', description: 'Add signature', icon: '✍️' },
      { path: '/apps/pdf/protect', title: 'Protect PDF', description: 'Add password', icon: '🔒' },
      { path: '/apps/pdf/unlock', title: 'Unlock PDF', description: 'Remove password', icon: '🔓' },
      { path: '/apps/pdf/watermark', title: 'Watermark', description: 'Add watermark', icon: '💧' },
      { path: '/apps/pdf/rotate', title: 'Rotate PDF', description: 'Rotate pages', icon: '🔄' },
    ],
  },
  {
    title: 'Image Studio',
    icon: '🖼️',
    description: 'Compress, resize, convert, and edit images',
    tools: [
      { path: '/apps/img/compress', title: 'Compress', description: 'Reduce image size', icon: '📦' },
      { path: '/apps/img/resize', title: 'Resize', description: 'Change dimensions', icon: '📐' },
      { path: '/apps/img/convert', title: 'Convert', description: 'Change format', icon: '🔄' },
      { path: '/apps/img/crop', title: 'Crop', description: 'Trim images', icon: '✂️' },
      { path: '/apps/img/remove-bg', title: 'Remove BG', description: 'Transparent background', icon: '🎭' },
      { path: '/apps/img/filter', title: 'Filters', description: 'Apply effects', icon: '🎨' },
      { path: '/apps/img/metadata', title: 'Metadata', description: 'View/strip EXIF', icon: 'ℹ️' },
      { path: '/apps/img/meme', title: 'Meme', description: 'Add text to images', icon: '😂' },
    ],
  },
  {
    title: 'AI Tools',
    icon: '🤖',
    description: 'AI-powered document processing',
    tools: [
      { path: '/apps/ai/ocr', title: 'OCR', description: 'Extract text from images', icon: '👁️' },
      { path: '/apps/ai/summarize', title: 'Summarize', description: 'Get key points', icon: '📝' },
      { path: '/apps/ai/chat-doc', title: 'Chat with PDF', description: 'Ask questions', icon: '💬' },
      { path: '/apps/ai/translator', title: 'Translate', description: 'Multi-language', icon: '🌍' },
      { path: '/apps/ai/quiz', title: 'Quiz Gen', description: 'Create quizzes', icon: '❓' },
      { path: '/apps/ai/rewrite', title: 'Rewrite', description: 'Improve text', icon: '✨' },
    ],
  },
  {
    title: 'Text & Code',
    icon: '📝',
    description: 'Text editing and conversion tools',
    tools: [
      { path: '/apps/text/word-to-pdf', title: 'Word to PDF', description: 'DOCX converter', icon: '📄' },
      { path: '/apps/text/markdown', title: 'Markdown', description: 'Editor & preview', icon: '📝' },
      { path: '/apps/text/json-csv', title: 'JSON ↔ CSV', description: 'Data converter', icon: '📊' },
      { path: '/apps/text/diff', title: 'Text Diff', description: 'Compare texts', icon: '🔍' },
      { path: '/apps/text/count', title: 'Word Count', description: 'Text statistics', icon: '🔢' },
      { path: '/apps/text/lorem', title: 'Lorem Ipsum', description: 'Dummy text', icon: '📜' },
    ],
  },
  {
    title: 'Utilities',
    icon: '🔧',
    description: 'Essential utility tools',
    tools: [
      { path: '/apps/util/zip', title: 'Create ZIP', description: 'Compress files', icon: '📦' },
      { path: '/apps/util/unzip', title: 'Extract ZIP', description: 'Unpack archives', icon: '📂' },
      { path: '/apps/util/password', title: 'Password', description: 'Generate secure', icon: '🔐' },
      { path: '/apps/util/qrcode', title: 'QR Code', description: 'Generate QR', icon: '📱' },
      { path: '/apps/util/barcode', title: 'Barcode', description: 'Generate barcode', icon: '📊' },
    ],
  },
];

export function renderDashboard(): string {
  return `
    <div class="dashboard">
      <!-- Hero Section -->
      <section class="dashboard-hero glass-card mb-xl">
        <div class="hero-content">
          <h1 class="hero-title">Welcome to <span class="gradient-text">Office OS</span></h1>
          <p class="hero-subtitle">
            Free online document tools. Edit PDFs, compress images, OCR, and more.
            All processing happens in your browser for <strong>complete privacy</strong>.
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value">40+</span>
              <span class="stat-label">Tools</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">100%</span>
              <span class="stat-label">Private</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">Free</span>
              <span class="stat-label">Forever</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Tool Categories -->
      ${categories.map(category => `
        <section class="category-section mb-xl">
          <div class="category-header mb-md">
            <h2 class="category-title">
              <span class="category-icon">${category.icon}</span>
              ${category.title}
            </h2>
            <p class="category-description">${category.description}</p>
          </div>
          <div class="tool-grid">
            ${category.tools.map(tool => `
              <a href="#${tool.path}" class="tool-card">
                <div class="tool-card-icon">${tool.icon}</div>
                <h3 class="tool-card-title">${tool.title}</h3>
                <p class="tool-card-description">${tool.description}</p>
              </a>
            `).join('')}
          </div>
        </section>
      `).join('')}

      <!-- Privacy Section -->
      <section class="privacy-section glass-card">
        <div class="privacy-content">
          <h2>🔒 Your Privacy Matters</h2>
          <p>
            Unlike other online tools, Office OS processes all your files <strong>locally in your browser</strong>.
            Your documents never leave your device. We don't upload, store, or have access to any of your files.
          </p>
          <div class="privacy-features">
            <div class="privacy-feature">
              <span class="privacy-icon">🖥️</span>
              <span>Local Processing</span>
            </div>
            <div class="privacy-feature">
              <span class="privacy-icon">🚫</span>
              <span>No Server Uploads</span>
            </div>
            <div class="privacy-feature">
              <span class="privacy-icon">🔐</span>
              <span>End-to-End Security</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <style>
      .dashboard {
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-hero {
        padding: var(--space-3xl);
        text-align: center;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
      }

      .hero-title {
        font-size: var(--font-size-4xl);
        font-weight: 700;
        margin-bottom: var(--space-md);
      }

      .gradient-text {
        background: var(--color-accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .hero-subtitle {
        font-size: var(--font-size-lg);
        color: var(--color-text-secondary);
        max-width: 600px;
        margin: 0 auto var(--space-xl);
        line-height: 1.7;
      }

      .hero-stats {
        display: flex;
        justify-content: center;
        gap: var(--space-3xl);
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .stat-value {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--color-accent-primary);
      }

      .stat-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .category-header {
        padding: 0 var(--space-xs);
      }

      .category-title {
        font-size: var(--font-size-xl);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: var(--space-xs);
      }

      .category-icon {
        font-size: 1.5em;
      }

      .category-description {
        color: var(--color-text-tertiary);
        font-size: var(--font-size-sm);
      }

      .privacy-section {
        padding: var(--space-2xl);
        text-align: center;
      }

      .privacy-content h2 {
        font-size: var(--font-size-2xl);
        margin-bottom: var(--space-md);
      }

      .privacy-content p {
        color: var(--color-text-secondary);
        max-width: 600px;
        margin: 0 auto var(--space-xl);
        line-height: 1.7;
      }

      .privacy-features {
        display: flex;
        justify-content: center;
        gap: var(--space-2xl);
        flex-wrap: wrap;
      }

      .privacy-feature {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-weight: 500;
      }

      .privacy-icon {
        font-size: 1.5em;
      }

      @media (max-width: 768px) {
        .dashboard-hero {
          padding: var(--space-xl);
        }

        .hero-title {
          font-size: var(--font-size-2xl);
        }

        .hero-stats {
          gap: var(--space-xl);
        }

        .stat-value {
          font-size: var(--font-size-2xl);
        }

        .privacy-features {
          flex-direction: column;
          gap: var(--space-md);
        }
      }
    </style>
  `;
}
