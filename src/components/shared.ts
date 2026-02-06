/**
 * Office OS - Shared Components
 * Reusable UI components for tool pages
 */

/**
 * File Upload Zone Component
 */
export function renderFileUpload(options: {
  id: string;
  accept: string;
  multiple?: boolean;
  maxSize?: string;
  title?: string;
  hint?: string;
}): string {
  const {
    id,
    accept,
    multiple = false,
    maxSize = '50MB',
    title = 'Drop files here or click to upload',
    hint = `Supports ${accept} • Max ${maxSize}`,
  } = options;

  return `
    <div class="file-upload-zone" id="${id}-zone" data-upload-id="${id}">
      <input type="file"
             id="${id}"
             accept="${accept}"
             ${multiple ? 'multiple' : ''}
             class="sr-only">
      <label for="${id}" class="file-upload-label">
        <div class="file-upload-icon">📁</div>
        <div class="file-upload-title">${title}</div>
        <div class="file-upload-hint">${hint}</div>
      </label>
    </div>
  `;
}

/**
 * File List Component
 */
export function renderFileList(files: Array<{
  name: string;
  size: string;
  type?: string;
}>): string {
  if (files.length === 0) return '';

  return `
    <div class="file-list">
      ${files.map((file, index) => `
        <div class="file-item" data-index="${index}">
          <div class="file-info">
            <span class="file-icon">📄</span>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${file.size}</span>
          </div>
          <button class="btn btn-icon file-remove" data-index="${index}" aria-label="Remove file">
            ✕
          </button>
        </div>
      `).join('')}
    </div>
    <style>
      .file-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        margin: var(--space-lg) 0;
      }
      .file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md);
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
      }
      .file-info {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex: 1;
        min-width: 0;
      }
      .file-name {
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .file-size {
        color: var(--color-text-tertiary);
        font-size: var(--font-size-sm);
      }
      .file-remove {
        opacity: 0.5;
        transition: opacity var(--transition-fast);
      }
      .file-remove:hover {
        opacity: 1;
        color: var(--color-error);
      }
    </style>
  `;
}

/**
 * Progress Bar Component
 */
export function renderProgressBar(progress: number, label?: string): string {
  return `
    <div class="progress-container">
      ${label ? `<div class="progress-label">${label}</div>` : ''}
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${progress}%"></div>
      </div>
      <div class="progress-value">${Math.round(progress)}%</div>
    </div>
    <style>
      .progress-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }
      .progress-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }
      .progress-value {
        font-size: var(--font-size-sm);
        color: var(--color-text-tertiary);
        text-align: right;
      }
    </style>
  `;
}

/**
 * Action Buttons Component
 */
export function renderActionButtons(buttons: Array<{
  id: string;
  label: string;
  icon?: string;
  primary?: boolean;
  disabled?: boolean;
}>): string {
  return `
    <div class="action-buttons">
      ${buttons.map(btn => `
        <button
          id="${btn.id}"
          class="btn ${btn.primary ? 'btn-primary' : 'btn-secondary'} btn-lg"
          ${btn.disabled ? 'disabled' : ''}>
          ${btn.icon ? `<span class="btn-icon-left">${btn.icon}</span>` : ''}
          ${btn.label}
        </button>
      `).join('')}
    </div>
    <style>
      .action-buttons {
        display: flex;
        gap: var(--space-md);
        flex-wrap: wrap;
        margin-top: var(--space-xl);
      }
      .btn-icon-left {
        margin-right: var(--space-xs);
      }
    </style>
  `;
}

/**
 * Tool Page Layout Component
 */
export function renderToolPage(options: {
  title: string;
  description: string;
  toolContent: string;
  seoContent: string;
}): string {
  return `
    <div class="tool-page">
      <header class="tool-header">
        <h1 class="tool-title">${options.title}</h1>
        <p class="tool-description">${options.description}</p>
      </header>

      <main class="tool-main glass-card">
        ${options.toolContent}
      </main>

      <article class="seo-content">
        ${options.seoContent}
      </article>
    </div>

    <style>
      .tool-page {
        max-width: 900px;
        margin: 0 auto;
      }
      .tool-header {
        margin-bottom: var(--space-xl);
      }
      .tool-title {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        margin-bottom: var(--space-sm);
      }
      .tool-description {
        color: var(--color-text-secondary);
        font-size: var(--font-size-lg);
      }
      .tool-main {
        padding: var(--space-2xl);
      }
    </style>
  `;
}

/**
 * Toast notification helper
 */
export function showToast(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
): void {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Loading overlay helper
 */
export function showLoading(message: string = 'Processing...'): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loading-overlay';
  overlay.innerHTML = `
    <div class="spinner"></div>
    <div class="loading-message">${message}</div>
  `;

  document.body.appendChild(overlay);
  return overlay;
}

export function hideLoading(): void {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Initialize file upload drag and drop
 */
export function initFileUpload(
  uploadId: string,
  onFilesSelected: (files: FileList) => void
): void {
  const zone = document.getElementById(`${uploadId}-zone`);
  const input = document.getElementById(uploadId) as HTMLInputElement;

  if (!zone || !input) return;

  // Handle file input change
  input.addEventListener('change', () => {
    if (input.files && input.files.length > 0) {
      onFilesSelected(input.files);
    }
  });

  // Drag and drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  });
}
