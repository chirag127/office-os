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
    title: 'Organize PDF',
    icon: '📑',
    description: 'Merge, split, and organize PDF pages',
    tools: [
      { path: '/apps/pdf/merge', title: 'Merge PDF', description: 'Combine multiple PDFs', icon: '📑' },
      { path: '/apps/pdf/split', title: 'Split PDF', description: 'Extract pages from PDF', icon: '✂️' },
      { path: '/apps/pdf/remove-pages', title: 'Remove Pages', description: 'Delete specific pages', icon: '🗑️' },
      { path: '/apps/pdf/extract-pages', title: 'Extract Pages', description: 'Copy pages to new PDF', icon: '📄' },
      { path: '/apps/pdf/organize', title: 'Organize PDF', description: 'Reorder and rotate', icon: '🔀' },
      { path: '/apps/pdf/scan', title: 'Scan to PDF', description: 'Camera to PDF', icon: '📷' },
    ],
  },
  {
    title: 'Optimize PDF',
    icon: '⚡',
    description: 'Compress, repair, and optimize PDFs',
    tools: [
      { path: '/apps/pdf/compress', title: 'Compress PDF', description: 'Reduce file size', icon: '📦' },
      { path: '/apps/pdf/repair', title: 'Repair PDF', description: 'Fix corrupted files', icon: '🔧' },
      { path: '/apps/pdf/ocr', title: 'OCR PDF', description: 'Make searchable', icon: '👁️' },
    ],
  },
  {
    title: 'Convert to PDF',
    icon: '📥',
    description: 'Convert files to PDF format',
    tools: [
      { path: '/apps/pdf/from-jpg', title: 'JPG to PDF', description: 'Images to PDF', icon: '🖼️' },
      { path: '/apps/pdf/word-to-pdf', title: 'Word to PDF', description: 'DOCX to PDF', icon: '📝' },
      { path: '/apps/pdf/ppt-to-pdf', title: 'PPT to PDF', description: 'Slides to PDF', icon: '📊' },
      { path: '/apps/pdf/excel-to-pdf', title: 'Excel to PDF', description: 'Spreadsheets to PDF', icon: '📈' },
      { path: '/apps/pdf/html-to-pdf', title: 'HTML to PDF', description: 'Web pages to PDF', icon: '🌐' },
    ],
  },
  {
    title: 'Convert from PDF',
    icon: '📤',
    description: 'Convert PDF to other formats',
    tools: [
      { path: '/apps/pdf/to-jpg', title: 'PDF to JPG', description: 'Pages to images', icon: '🖼️' },
      { path: '/apps/pdf/to-word', title: 'PDF to Word', description: 'PDF to DOCX', icon: '📝' },
      { path: '/apps/pdf/to-ppt', title: 'PDF to PPT', description: 'PDF to slides', icon: '📊' },
      { path: '/apps/pdf/to-excel', title: 'PDF to Excel', description: 'Tables to XLSX', icon: '📈' },
      { path: '/apps/pdf/pdf-a', title: 'PDF to PDF/A', description: 'Archive format', icon: '📁' },
    ],
  },
  {
    title: 'Edit PDF',
    icon: '✏️',
    description: 'Edit and annotate PDF documents',
    tools: [
      { path: '/apps/pdf/rotate', title: 'Rotate PDF', description: 'Rotate pages', icon: '🔄' },
      { path: '/apps/pdf/page-numbers', title: 'Page Numbers', description: 'Add numbering', icon: '🔢' },
      { path: '/apps/pdf/watermark', title: 'Watermark', description: 'Add watermark', icon: '💧' },
      { path: '/apps/pdf/crop', title: 'Crop PDF', description: 'Trim margins', icon: '✂️' },
      { path: '/apps/pdf/edit', title: 'Edit PDF', description: 'Add text & notes', icon: '✏️' },
    ],
  },
  {
    title: 'PDF Security',
    icon: '🔒',
    description: 'Protect and secure PDF documents',
    tools: [
      { path: '/apps/pdf/unlock', title: 'Unlock PDF', description: 'Remove password', icon: '🔓' },
      { path: '/apps/pdf/protect', title: 'Protect PDF', description: 'Add password', icon: '🔒' },
      { path: '/apps/pdf/sign', title: 'Sign PDF', description: 'Add signature', icon: '✍️' },
      { path: '/apps/pdf/redact', title: 'Redact PDF', description: 'Black out text', icon: '◼️' },
      { path: '/apps/pdf/compare', title: 'Compare PDF', description: 'Find differences', icon: '🔍' },
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
            Free online PDF tools. Merge, split, compress, convert, and edit PDFs.
            All processing happens in your browser for <strong>complete privacy</strong>.
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value">30+</span>
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
