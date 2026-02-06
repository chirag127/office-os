/**
 * Office OS - Shell Interface
 * The main OS interface with sidebar navigation and responsive layout
 */

import { router } from './Router';
import type { Route } from './Router';

// Icons as SVG strings
const icons = {
  home: '🏠',
  pdf: '📄',
  image: '🖼️',
  ai: '🤖',
  text: '📝',
  utility: '🔧',
  info: 'ℹ️',
  menu: '☰',
  close: '✕',
  sun: '☀️',
  moon: '🌙',
  search: '🔍',
};

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// Navigation structure
// Navigation structure
export const navigation: NavSection[] = [
  {
    title: 'Home',
    items: [
      { path: '/', label: 'Dashboard', icon: icons.home },
    ],
  },
  {
    title: 'PDF Actions',
    items: [
      { path: '/apps/pdf/merge', label: 'Merge PDF', icon: icons.pdf },
      { path: '/apps/pdf/split', label: 'Split PDF', icon: icons.pdf },
      { path: '/apps/pdf/organize', label: 'Organize Pages', icon: icons.pdf },
      { path: '/apps/pdf/compress', label: 'Compress PDF', icon: icons.pdf },
      { path: '/apps/pdf/scan', label: 'Scan to PDF', icon: icons.pdf },
      { path: '/apps/pdf/repair', label: 'Repair PDF', icon: icons.pdf },
      { path: '/apps/pdf/ocr', label: 'OCR PDF', icon: icons.pdf },
    ],
  },
  {
    title: 'PDF Conversions',
    items: [
      { path: '/apps/pdf/to-word', label: 'PDF to Word', icon: icons.pdf },
      { path: '/apps/pdf/to-excel', label: 'PDF to Excel', icon: icons.pdf },
      { path: '/apps/pdf/to-ppt', label: 'PDF to PPT', icon: icons.pdf },
      { path: '/apps/pdf/to-jpg', label: 'PDF to JPG', icon: icons.pdf },
      { path: '/apps/pdf/from-jpg', label: 'JPG to PDF', icon: icons.pdf },
      { path: '/apps/text/ppt-to-pdf', label: 'PPT to PDF', icon: icons.pdf },
      { path: '/apps/text/excel-to-pdf', label: 'Excel to PDF', icon: icons.pdf },
      { path: '/apps/text/html-to-pdf', label: 'HTML to PDF', icon: icons.pdf },
      { path: '/apps/pdf/pdf-a', label: 'Convert to PDF/A', icon: icons.pdf },
    ],
  },
  {
    title: 'PDF Edit & Secure',
    items: [
      { path: '/apps/pdf/rotate', label: 'Rotate PDF', icon: icons.pdf },
      { path: '/apps/pdf/watermark', label: 'Watermark PDF', icon: icons.pdf },
      { path: '/apps/pdf/page-numbers', label: 'Page Numbers', icon: icons.pdf },
      { path: '/apps/pdf/redact', label: 'Redact PDF', icon: icons.pdf },
      { path: '/apps/pdf/sign', label: 'Sign PDF', icon: icons.pdf },
      { path: '/apps/pdf/protect', label: 'Protect PDF', icon: icons.pdf },
      { path: '/apps/pdf/unlock', label: 'Unlock PDF', icon: icons.pdf },
    ],
  },
  {
    title: 'Image Studio',
    items: [
      { path: '/apps/img/editor', label: 'Photo Editor', icon: icons.image },
      { path: '/apps/img/compress', label: 'Compress Image', icon: icons.image },
      { path: '/apps/img/rotate', label: 'Rotate Image', icon: icons.image },
      { path: '/apps/img/watermark', label: 'Watermark Image', icon: icons.image },
      { path: '/apps/img/upscale', label: 'Upscale (AI)', icon: icons.image },
      { path: '/apps/img/blur-face', label: 'Blur Face', icon: icons.image },
      { path: '/apps/img/html-to-image', label: 'HTML to Image', icon: icons.image },
    ],
  },
  {
    title: 'Text & Code',
    items: [
      { path: '/apps/text/markdown', label: 'Markdown Editor', icon: icons.text },
      { path: '/apps/text/json-csv', label: 'JSON ↔ CSV', icon: icons.text },
      { path: '/apps/text/diff', label: 'Text Diff', icon: icons.text },
      { path: '/apps/text/count', label: 'Word Counter', icon: icons.text },
      { path: '/apps/text/lorem', label: 'Lorem Ipsum', icon: icons.text },
    ],
  },
  {
    title: 'Utilities',
    items: [
      { path: '/apps/util/zip', label: 'Create ZIP', icon: icons.utility },
      { path: '/apps/util/unzip', label: 'Extract ZIP', icon: icons.utility },
      { path: '/apps/util/password', label: 'Password Gen', icon: icons.utility },
      { path: '/apps/util/qrcode', label: 'QR Code', icon: icons.utility },
      { path: '/apps/util/barcode', label: 'Barcode', icon: icons.utility },
    ],
  },
  {
    title: 'Info',
    items: [
      { path: '/pages/about', label: 'About', icon: icons.info },
      { path: '/pages/privacy', label: 'Privacy Policy', icon: icons.info },
      { path: '/pages/terms', label: 'Terms of Service', icon: icons.info },
    ],
  },
];

class Shell {
  private sidebarOpen: boolean = false;
  private darkMode: boolean = true;

  constructor() {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      this.darkMode = false;
    }

    // Check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.darkMode = savedTheme === 'dark';
    }
  }

  /**
   * Render the shell interface
   */
  render(): string {
    return `
      <div class="shell" data-theme="${this.darkMode ? 'dark' : 'light'}">
        ${this.renderSidebar()}
        <div class="main-content">
          ${this.renderHeader()}
          <div id="main-content" class="page-container">
            <!-- Page content will be injected here -->
          </div>
        </div>
        ${this.renderMobileNav()}
        <div id="toast-container" class="toast-container"></div>
      </div>
    `;
  }

  /**
   * Render the sidebar
   */
  private renderSidebar(): string {
    const navSections = navigation.map(section => `
      <div class="nav-section">
        <div class="nav-section-title">${section.title}</div>
        ${section.items.map(item => `
          <a href="#${item.path}"
             class="nav-item ${router.isActive(item.path) ? 'active' : ''}"
             data-path="${item.path}">
            <span class="nav-item-icon">${item.icon}</span>
            <span class="nav-item-label">${item.label}</span>
          </a>
        `).join('')}
      </div>
    `).join('');

    return `
      <aside class="sidebar ${this.sidebarOpen ? 'open' : ''}" id="sidebar">
        <div class="sidebar-header">
          <span class="sidebar-logo">Office OS</span>
          <button class="btn btn-icon sidebar-close" id="sidebar-close" aria-label="Close sidebar">
            ${icons.close}
          </button>
        </div>
        <nav class="sidebar-nav">
          ${navSections}
        </nav>
      </aside>
    `;
  }

  /**
   * Render the header
   */
  private renderHeader(): string {
    return `
      <header class="header">
        <div class="flex items-center gap-md">
          <button class="btn btn-icon mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle menu">
            ${icons.menu}
          </button>
          <h1 class="header-title" id="page-title">Dashboard</h1>
        </div>
        <div class="flex items-center gap-md">
          <button class="btn btn-icon" id="theme-toggle" aria-label="Toggle theme">
            ${this.darkMode ? icons.sun : icons.moon}
          </button>
        </div>
      </header>
    `;
  }

  /**
   * Render mobile bottom navigation
   */
  private renderMobileNav(): string {
    const mainSections = [
      { path: '/', label: 'Home', icon: icons.home },
      { path: '/apps/pdf/merge', label: 'PDF', icon: icons.pdf },
      { path: '/apps/img/compress', label: 'Image', icon: icons.image },
      { path: '/apps/text/markdown', label: 'Text', icon: icons.text },
      { path: '/apps/util/qrcode', label: 'Utils', icon: icons.utility },
    ];

    return `
      <nav class="mobile-nav" id="mobile-nav">
        ${mainSections.map(item => `
          <a href="#${item.path}"
             class="mobile-nav-item ${router.isActive(item.path) ? 'active' : ''}"
             data-path="${item.path}">
            <span class="mobile-nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>
    `;
  }

  /**
   * Initialize shell event listeners
   */
  init(): void {
    // Apply theme
    document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');

    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebar-close');

    menuToggle?.addEventListener('click', () => {
      this.sidebarOpen = !this.sidebarOpen;
      sidebar?.classList.toggle('open', this.sidebarOpen);
    });

    sidebarClose?.addEventListener('click', () => {
      this.sidebarOpen = false;
      sidebar?.classList.remove('open');
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle?.addEventListener('click', () => {
      this.darkMode = !this.darkMode;
      document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
      localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
      themeToggle.innerHTML = this.darkMode ? icons.sun : icons.moon;
    });

    // Update active nav item on route change
    router.onNavigate((route: Route) => {
      // Update page title in header
      const pageTitle = document.getElementById('page-title');
      if (pageTitle) {
        pageTitle.textContent = route.title;
      }

      // Update active state in sidebar
      document.querySelectorAll('.nav-item').forEach(item => {
        const path = item.getAttribute('data-path');
        item.classList.toggle('active', path === router.getCurrentPath());
      });

      // Update active state in mobile nav
      document.querySelectorAll('.mobile-nav-item').forEach(item => {
        const path = item.getAttribute('data-path');
        item.classList.toggle('active', path === router.getCurrentPath());
      });

      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 768) {
        this.sidebarOpen = false;
        sidebar?.classList.remove('open');
      }
    });
  }
}

export const shell = new Shell();
export default shell;
