/**
 * Office OS - Route Definitions
 * PDF-only toolset with all routes
 */

import type { Route } from '../core/Router';

// Dashboard/Home
const dashboardRoute: Route = {
  path: '/',
  title: 'Dashboard',
  component: async () => {
    const { renderDashboard } = await import('../apps/dashboard/index');
    return renderDashboard();
  },
  meta: {
    description: 'Office OS - Free online PDF tools. Edit, convert, compress, and secure PDFs. All processing happens in your browser for complete privacy.',
    keywords: 'PDF editor, PDF tools, compress PDF, convert PDF, online PDF tools',
  },
};

// PDF Organize Routes
const pdfOrganizeRoutes: Route[] = [
  {
    path: '/apps/pdf/merge',
    title: 'Merge PDF',
    component: async () => {
      const { renderMergePDF } = await import('../apps/pdf/merge/index');
      return renderMergePDF();
    },
    meta: {
      description: 'Merge multiple PDF files into one document online for free.',
      keywords: 'merge PDF, combine PDF, join PDF files',
    },
  },
  {
    path: '/apps/pdf/split',
    title: 'Split PDF',
    component: async () => {
      const { renderSplitPDF } = await import('../apps/pdf/split/index');
      return renderSplitPDF();
    },
    meta: {
      description: 'Split PDF files into separate pages or extract specific pages.',
      keywords: 'split PDF, extract PDF pages, separate PDF',
    },
  },
  {
    path: '/apps/pdf/remove-pages',
    title: 'Remove Pages',
    component: async () => {
      const { renderRemovePages } = await import('../apps/pdf/remove-pages/index');
      return renderRemovePages();
    },
    meta: {
      description: 'Remove specific pages from PDF documents.',
      keywords: 'remove PDF pages, delete pages, PDF page remover',
    },
  },
  {
    path: '/apps/pdf/extract-pages',
    title: 'Extract Pages',
    component: async () => {
      const { renderExtractPages } = await import('../apps/pdf/extract-pages/index');
      return renderExtractPages();
    },
    meta: {
      description: 'Extract specific pages to create a new PDF.',
      keywords: 'extract PDF pages, copy pages, new PDF from pages',
    },
  },
  {
    path: '/apps/pdf/organize',
    title: 'Organize PDF',
    component: async () => {
      const { renderOrganizePDF } = await import('../apps/pdf/organize/index');
      return renderOrganizePDF();
    },
    meta: {
      description: 'Organize, reorder, and rotate PDF pages.',
      keywords: 'organize PDF, reorder pages, arrange PDF',
    },
  },
  {
    path: '/apps/pdf/scan',
    title: 'Scan to PDF',
    component: async () => {
      const { renderScanPDF } = await import('../apps/pdf/scan/index');
      return renderScanPDF();
    },
    meta: {
      description: 'Scan documents using your camera and convert to PDF.',
      keywords: 'scan to PDF, camera to PDF, document scanner',
    },
  },
];

// PDF Optimize Routes
const pdfOptimizeRoutes: Route[] = [
  {
    path: '/apps/pdf/compress',
    title: 'Compress PDF',
    component: async () => {
      const { renderCompressPDF } = await import('../apps/pdf/compress/index');
      return renderCompressPDF();
    },
    meta: {
      description: 'Compress PDF files to reduce file size.',
      keywords: 'compress PDF, reduce PDF size, PDF compressor',
    },
  },
  {
    path: '/apps/pdf/repair',
    title: 'Repair PDF',
    component: async () => {
      const { renderRepairPdf } = await import('../apps/pdf/repair/index');
      return renderRepairPdf();
    },
    meta: {
      description: 'Repair corrupted or damaged PDF files.',
      keywords: 'repair PDF, fix PDF, recover PDF',
    },
  },
  {
    path: '/apps/pdf/ocr',
    title: 'OCR PDF',
    component: async () => {
      const { renderOcrPdf } = await import('../apps/pdf/ocr/index');
      return renderOcrPdf();
    },
    meta: {
      description: 'Make scanned PDFs searchable with OCR.',
      keywords: 'OCR PDF, text recognition, searchable PDF',
    },
  },
];

// Convert to PDF Routes
const convertToPDFRoutes: Route[] = [
  {
    path: '/apps/pdf/from-jpg',
    title: 'JPG to PDF',
    component: async () => {
      const { renderJPGToPDF } = await import('../apps/pdf/from-jpg/index');
      return renderJPGToPDF();
    },
    meta: {
      description: 'Convert images to PDF documents.',
      keywords: 'JPG to PDF, images to PDF, convert pictures to PDF',
    },
  },
  {
    path: '/apps/pdf/word-to-pdf',
    title: 'Word to PDF',
    component: async () => {
      const { renderWordToPDF } = await import('../apps/pdf/word-to-pdf/index');
      return renderWordToPDF();
    },
    meta: {
      description: 'Convert Word documents to PDF.',
      keywords: 'Word to PDF, DOCX to PDF, convert Word',
    },
  },
  {
    path: '/apps/pdf/ppt-to-pdf',
    title: 'PowerPoint to PDF',
    component: async () => {
      const { renderPptToPdf } = await import('../apps/pdf/ppt-to-pdf/index');
      return renderPptToPdf();
    },
    meta: {
      description: 'Convert PowerPoint presentations to PDF.',
      keywords: 'PPT to PDF, PowerPoint to PDF, convert slides',
    },
  },
  {
    path: '/apps/pdf/excel-to-pdf',
    title: 'Excel to PDF',
    component: async () => {
      const { renderExcelToPdf } = await import('../apps/pdf/excel-to-pdf/index');
      return renderExcelToPdf();
    },
    meta: {
      description: 'Convert Excel spreadsheets to PDF.',
      keywords: 'Excel to PDF, spreadsheet to PDF, XLSX to PDF',
    },
  },
  {
    path: '/apps/pdf/html-to-pdf',
    title: 'HTML to PDF',
    component: async () => {
      const { renderHtmlToPdf } = await import('../apps/pdf/html-to-pdf/index');
      return renderHtmlToPdf();
    },
    meta: {
      description: 'Convert HTML pages to PDF documents.',
      keywords: 'HTML to PDF, webpage to PDF, convert HTML',
    },
  },
];

// Convert from PDF Routes
const convertFromPDFRoutes: Route[] = [
  {
    path: '/apps/pdf/to-jpg',
    title: 'PDF to JPG',
    component: async () => {
      const { renderPDFToJPG } = await import('../apps/pdf/to-jpg/index');
      return renderPDFToJPG();
    },
    meta: {
      description: 'Convert PDF pages to JPG images.',
      keywords: 'PDF to JPG, PDF to image, convert PDF to pictures',
    },
  },
  {
    path: '/apps/pdf/to-word',
    title: 'PDF to Word',
    component: async () => {
      const { renderPdfToWord } = await import('../apps/pdf/to-word/index');
      return renderPdfToWord();
    },
    meta: {
      description: 'Convert PDF to editable Word documents.',
      keywords: 'PDF to Word, PDF to DOCX, convert PDF to Word',
    },
  },
  {
    path: '/apps/pdf/to-ppt',
    title: 'PDF to PowerPoint',
    component: async () => {
      const { renderPdfToPpt } = await import('../apps/pdf/to-ppt/index');
      return renderPdfToPpt();
    },
    meta: {
      description: 'Convert PDF to PowerPoint presentations.',
      keywords: 'PDF to PPT, PDF to PowerPoint, convert PDF to slides',
    },
  },
  {
    path: '/apps/pdf/to-excel',
    title: 'PDF to Excel',
    component: async () => {
      const { renderPdfToExcel } = await import('../apps/pdf/to-excel/index');
      return renderPdfToExcel();
    },
    meta: {
      description: 'Convert PDF tables to Excel spreadsheets.',
      keywords: 'PDF to Excel, PDF to XLSX, extract tables from PDF',
    },
  },
  {
    path: '/apps/pdf/pdf-a',
    title: 'PDF to PDF/A',
    component: async () => {
      const { renderPdfA } = await import('../apps/pdf/pdf-a/index');
      return renderPdfA();
    },
    meta: {
      description: 'Convert PDF to PDF/A for long-term archiving.',
      keywords: 'PDF to PDF/A, archive PDF, PDF/A converter',
    },
  },
];

// Edit PDF Routes
const pdfEditRoutes: Route[] = [
  {
    path: '/apps/pdf/rotate',
    title: 'Rotate PDF',
    component: async () => {
      const { renderRotatePDF } = await import('../apps/pdf/rotate/index');
      return renderRotatePDF();
    },
    meta: {
      description: 'Rotate PDF pages in any direction.',
      keywords: 'rotate PDF, turn PDF pages, flip PDF',
    },
  },
  {
    path: '/apps/pdf/page-numbers',
    title: 'Add Page Numbers',
    component: async () => {
      const { renderPageNumbersPDF } = await import('../apps/pdf/page-numbers/index');
      return renderPageNumbersPDF();
    },
    meta: {
      description: 'Add page numbers to PDF documents.',
      keywords: 'add page numbers, PDF page numbers, number PDF pages',
    },
  },
  {
    path: '/apps/pdf/watermark',
    title: 'Add Watermark',
    component: async () => {
      const { renderWatermarkPDF } = await import('../apps/pdf/watermark/index');
      return renderWatermarkPDF();
    },
    meta: {
      description: 'Add text or image watermarks to PDF.',
      keywords: 'watermark PDF, add watermark, PDF watermark',
    },
  },
  {
    path: '/apps/pdf/crop',
    title: 'Crop PDF',
    component: async () => {
      const { renderCropPDF } = await import('../apps/pdf/crop/index');
      return renderCropPDF();
    },
    meta: {
      description: 'Crop margins and whitespace from PDF pages.',
      keywords: 'crop PDF, trim PDF margins, PDF cropper',
    },
  },
  {
    path: '/apps/pdf/edit',
    title: 'Edit PDF',
    component: async () => {
      const { renderEditPDF } = await import('../apps/pdf/edit/index');
      return renderEditPDF();
    },
    meta: {
      description: 'Add text and annotations to PDF documents.',
      keywords: 'edit PDF, PDF editor, add text to PDF',
    },
  },
];

// PDF Security Routes
const pdfSecurityRoutes: Route[] = [
  {
    path: '/apps/pdf/unlock',
    title: 'Unlock PDF',
    component: async () => {
      const { renderUnlockPDF } = await import('../apps/pdf/unlock/index');
      return renderUnlockPDF();
    },
    meta: {
      description: 'Remove password protection from PDF files.',
      keywords: 'unlock PDF, remove PDF password, PDF unlocker',
    },
  },
  {
    path: '/apps/pdf/protect',
    title: 'Protect PDF',
    component: async () => {
      const { renderProtectPDF } = await import('../apps/pdf/protect/index');
      return renderProtectPDF();
    },
    meta: {
      description: 'Add password protection to PDF documents.',
      keywords: 'protect PDF, password PDF, secure PDF',
    },
  },
  {
    path: '/apps/pdf/sign',
    title: 'Sign PDF',
    component: async () => {
      const { renderSignPDF } = await import('../apps/pdf/sign/index');
      return renderSignPDF();
    },
    meta: {
      description: 'Add your signature to PDF documents.',
      keywords: 'sign PDF, add signature, electronic signature',
    },
  },
  {
    path: '/apps/pdf/redact',
    title: 'Redact PDF',
    component: async () => {
      const { renderRedactPDF } = await import('../apps/pdf/redact/index');
      return renderRedactPDF();
    },
    meta: {
      description: 'Permanently redact sensitive information from PDFs.',
      keywords: 'redact PDF, blackout PDF, remove sensitive data',
    },
  },
  {
    path: '/apps/pdf/compare',
    title: 'Compare PDF',
    component: async () => {
      const { renderComparePDF } = await import('../apps/pdf/compare/index');
      return renderComparePDF();
    },
    meta: {
      description: 'Compare two PDF documents side by side.',
      keywords: 'compare PDF, PDF diff, compare documents',
    },
  },
];

// Info Pages Routes
const infoRoutes: Route[] = [
  {
    path: '/pages/about',
    title: 'About',
    component: async () => {
      const { renderAbout } = await import('../apps/pages/about/index');
      return renderAbout();
    },
    meta: {
      description: 'About Office OS - The privacy-first online PDF tools.',
      keywords: 'about Office OS, privacy PDF tools, online PDF suite',
    },
  },
  {
    path: '/pages/privacy',
    title: 'Privacy Policy',
    component: async () => {
      const { renderPrivacy } = await import('../apps/pages/privacy/index');
      return renderPrivacy();
    },
    meta: {
      description: 'Privacy Policy - All processing happens in your browser.',
      keywords: 'privacy policy, data privacy, file security',
    },
  },
  {
    path: '/pages/terms',
    title: 'Terms of Service',
    component: async () => {
      const { renderTerms } = await import('../apps/pages/terms/index');
      return renderTerms();
    },
    meta: {
      description: 'Terms of Service for Office OS.',
      keywords: 'terms of service, terms and conditions',
    },
  },
];

// Export all routes
export const routes: Route[] = [
  dashboardRoute,
  ...pdfOrganizeRoutes,
  ...pdfOptimizeRoutes,
  ...convertToPDFRoutes,
  ...convertFromPDFRoutes,
  ...pdfEditRoutes,
  ...pdfSecurityRoutes,
  ...infoRoutes,
];

export default routes;
