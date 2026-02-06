/**
 * Office OS - Route Definitions
 * All 40+ routes with metadata for SEO
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
    description: 'Office OS - Free online document tools. Edit PDFs, compress images, OCR, and more. All processing happens in your browser for complete privacy.',
    keywords: 'PDF editor, image compressor, OCR, document tools, online office, free PDF tools',
  },
};

// PDF Tools Routes
const pdfRoutes: Route[] = [
  {
    path: '/apps/pdf/merge',
    title: 'Merge PDF',
    component: async () => {
      const { renderMergePDF } = await import('../apps/pdf/merge/index');
      return renderMergePDF();
    },
    meta: {
      description: 'Merge multiple PDF files into one document online for free. Fast, secure, and works entirely in your browser. No file uploads to servers.',
      keywords: 'merge PDF, combine PDF, join PDF files, PDF merger online, free PDF combiner',
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
      description: 'Split PDF files into separate pages or extract specific pages. Free online tool with complete privacy.',
      keywords: 'split PDF, extract PDF pages, separate PDF, PDF splitter online',
    },
  },
  {
    path: '/apps/pdf/compress',
    title: 'Compress PDF',
    component: async () => {
      const { renderCompressPDF } = await import('../apps/pdf/compress/index');
      return renderCompressPDF();
    },
    meta: {
      description: 'Compress PDF files to reduce file size while maintaining quality. Free online PDF compression tool.',
      keywords: 'compress PDF, reduce PDF size, PDF compressor, shrink PDF online',
    },
  },
  {
    path: '/apps/pdf/to-jpg',
    title: 'PDF to JPG',
    component: async () => {
      const { renderPDFToJPG } = await import('../apps/pdf/to-jpg/index');
      return renderPDFToJPG();
    },
    meta: {
      description: 'Convert PDF pages to JPG images online. Free PDF to image converter with high quality output.',
      keywords: 'PDF to JPG, PDF to image, convert PDF to pictures, PDF converter',
    },
  },
  {
    path: '/apps/pdf/from-jpg',
    title: 'JPG to PDF',
    component: async () => {
      const { renderJPGToPDF } = await import('../apps/pdf/from-jpg/index');
      return renderJPGToPDF();
    },
    meta: {
      description: 'Convert images to PDF. Combine multiple JPG, PNG images into a single PDF document.',
      keywords: 'JPG to PDF, images to PDF, convert pictures to PDF, image to PDF converter',
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
      description: 'Add your signature to PDF documents online. Draw or type your signature and place it anywhere on the PDF.',
      keywords: 'sign PDF, add signature to PDF, electronic signature, PDF signature online',
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
      description: 'Add password protection to your PDF files. Secure your documents with encryption.',
      keywords: 'protect PDF, password PDF, encrypt PDF, secure PDF, lock PDF',
    },
  },
  {
    path: '/apps/pdf/unlock',
    title: 'Unlock PDF',
    component: async () => {
      const { renderUnlockPDF } = await import('../apps/pdf/unlock/index');
      return renderUnlockPDF();
    },
    meta: {
      description: 'Remove password from PDF files. Unlock password-protected PDFs when you know the password.',
      keywords: 'unlock PDF, remove PDF password, unprotect PDF, PDF password remover',
    },
  },
  {
    path: '/apps/pdf/watermark',
    title: 'Watermark PDF',
    component: async () => {
      const { renderWatermarkPDF } = await import('../apps/pdf/watermark/index');
      return renderWatermarkPDF();
    },
    meta: {
      description: 'Add text or image watermarks to PDF documents. Protect your PDFs with custom watermarks.',
      keywords: 'watermark PDF, add watermark, PDF stamp, logo on PDF',
    },
  },
  {
    path: '/apps/pdf/rotate',
    title: 'Rotate PDF',
    component: async () => {
      const { renderRotatePDF } = await import('../apps/pdf/rotate/index');
      return renderRotatePDF();
    },
    meta: {
      description: 'Rotate PDF pages 90, 180, or 270 degrees. Fix incorrectly oriented PDF documents.',
      keywords: 'rotate PDF, fix PDF orientation, turn PDF pages',
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
      description: 'Rearrange, rotate, and delete PDF pages. Organize your PDF documents easily.',
      keywords: 'organize PDF, rearrange PDF pages, delete PDF pages, reorder PDF',
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
      description: 'Scan documents using your camera and save as PDF. Free online document scanner.',
      keywords: 'scan to PDF, document scanner, camera to PDF, online scanner',
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
      description: 'Add page numbers to PDF documents. Customize position and format.',
      keywords: 'page numbers PDF, add page numbers, PDF pagination, number PDF pages',
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
      description: 'Visually compare two PDF documents side-by-side to find differences.',
      keywords: 'compare PDF, PDF diff, visual compare PDF, find PDF differences',
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
      description: 'Permanently remove sensitive information from PDF documents. Secure blackout tool.',
      keywords: 'redact PDF, blackout PDF, remove text PDF, secure PDF',
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
      description: 'Convert PDF files to editable Word documents (DOCX). Extract text and layout.',
      keywords: 'PDF to Word, convert PDF to DOCX, PDF to doc converter',
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
      description: 'Extract tables and data from PDF documents to Excel spreadsheets (XLSX).',
      keywords: 'PDF to Excel, convert PDF to XLSX, PDF table extractor',
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
      description: 'Convert PDF slides to editable PowerPoint presentations (PPTX).',
      keywords: 'PDF to PPT, convert PDF to PowerPoint, PDF to PPTX',
    },
  },
  {
    path: '/apps/text/html-to-pdf',
    title: 'HTML to PDF',
    component: async () => {
      const { renderHtmlToPdf } = await import('../apps/text/html-to-pdf/index');
      return renderHtmlToPdf();
    },
    meta: {
      description: 'Convert web pages or HTML code to PDF documents.',
      keywords: 'html to pdf, website to pdf, convert html',
    },
  },
  {
    path: '/apps/text/ppt-to-pdf',
    title: 'PPT to PDF',
    component: async () => {
      const { renderPptToPdf } = await import('../apps/text/ppt-to-pdf/index');
      return renderPptToPdf();
    },
    meta: {
      description: 'Convert PowerPoint presentations to PDF documents.',
      keywords: 'ppt to pdf, powerpoint to pdf, convert ppt',
    },
  },
  {
    path: '/apps/text/excel-to-pdf',
    title: 'Excel to PDF',
    component: async () => {
      const { renderExcelToPdf } = await import('../apps/text/excel-to-pdf/index');
      return renderExcelToPdf();
    },
    meta: {
      description: 'Convert Excel spreadsheets to PDF documents.',
      keywords: 'excel to pdf, xls to pdf, xlsx to pdf',
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
      description: 'Recover data from corrupt or damaged PDF files.',
      keywords: 'repair PDF, fix PDF, corrupt PDF recovery',
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
      description: 'Recognize text in scanned PDF documents (Searchable PDF).',
      keywords: 'OCR PDF, searchable PDF, scan to text',
    },
  },
  {
    path: '/apps/pdf/pdf-a',
    title: 'Convert to PDF/A',
    component: async () => {
      const { renderPdfA } = await import('../apps/pdf/pdf-a/index');
      return renderPdfA();
    },
    meta: {
      description: 'Convert PDF to PDF/A standard for long-term archiving.',
      keywords: 'PDF/A, archive PDF, PDF standard, ISO 19005',
    },
  },
];

// Image Tools Routes
const imageRoutes: Route[] = [
  {
    path: '/apps/img/rotate',
    title: 'Rotate Image',
    component: async () => {
      const { renderRotateImage } = await import('../apps/img/rotate/index');
      return renderRotateImage();
    },
    meta: {
      description: 'Rotate images by 90 degrees or custom angles online.',
      keywords: 'rotate image, flip image, turn photo',
    },
  },
  {
    path: '/apps/img/watermark',
    title: 'Watermark Image',
    component: async () => {
      const { renderWatermarkImage } = await import('../apps/img/watermark/index');
      return renderWatermarkImage();
    },
    meta: {
      description: 'Add text or logo watermarks to images. Protect your photos.',
      keywords: 'watermark image, add text to photo, copyright image',
    },
  },
  {
    path: '/apps/img/html-to-image',
    title: 'HTML to Image',
    component: async () => {
      const { renderHtmlToImage } = await import('../apps/img/html-to-image/index');
      return renderHtmlToImage();
    },
    meta: {
      description: 'Convert web pages or HTML code to Image (PNG/JPG).',
      keywords: 'html to image, website screenshot, convert html',
    },
  },
  {
    path: '/apps/img/blur-face',
    title: 'Blur Face',
    component: async () => {
      const { renderBlurFace } = await import('../apps/img/blur-face/index');
      return renderBlurFace();
    },
    meta: {
      description: 'Automatically detect and blur faces in photos. Protect privacy.',
      keywords: 'blur face, anonymize photo, hide face, privacy tool',
    },
  },
  {
    path: '/apps/img/upscale',
    title: 'Upscale Image',
    component: async () => {
      const { renderUpscaleImage } = await import('../apps/img/upscale/index');
      return renderUpscaleImage();
    },
    meta: {
      description: 'Enlarge images up to 4x with high quality. AI-powered upscaling.',
      keywords: 'upscale image, enlarge photo, ai upscaler, image resizer',
    },
  },
  {
    path: '/apps/img/editor',
    title: 'Photo Editor',
    component: async () => {
      const { renderImageEditor } = await import('../apps/img/editor/index');
      return renderImageEditor();
    },
    meta: {
      description: 'Edit photos with professional filters and adjustments. Brightness, contrast, filters.',
      keywords: 'photo editor, edit image, image filters, picture editor',
    },
  },
  {
    path: '/apps/img/compress',
    title: 'Compress Image',
    component: async () => {
      const { renderCompressImage } = await import('../apps/img/compress/index');
      return renderCompressImage();
    },
    meta: {
      description: 'Compress JPEG and PNG images to reduce file size. Optimize images for web while maintaining quality.',
      keywords: 'compress image, image compression, reduce image size, optimize images, compress JPG PNG',
    },
  },
  {
    path: '/apps/img/resize',
    title: 'Resize Image',
    component: async () => {
      const { renderResizeImage } = await import('../apps/img/resize/index');
      return renderResizeImage();
    },
    meta: {
      description: 'Resize images to any dimension. Scale images by pixels or percentage while maintaining aspect ratio.',
      keywords: 'resize image, scale image, change image size, image resizer online',
    },
  },
  {
    path: '/apps/img/convert',
    title: 'Convert Image',
    component: async () => {
      const { renderConvertImage } = await import('../apps/img/convert/index');
      return renderConvertImage();
    },
    meta: {
      description: 'Convert images between formats. Change HEIC, WebP, PNG to JPG and more.',
      keywords: 'convert image, HEIC to JPG, WebP to JPG, image format converter',
    },
  },
  {
    path: '/apps/img/crop',
    title: 'Crop Image',
    component: async () => {
      const { renderCropImage } = await import('../apps/img/crop/index');
      return renderCropImage();
    },
    meta: {
      description: 'Crop images to any aspect ratio. Free online image cropper with preset ratios for social media.',
      keywords: 'crop image, image cropper, cut image, trim photo online',
    },
  },
  {
    path: '/apps/img/remove-bg',
    title: 'Remove Background',
    component: async () => {
      const { renderRemoveBackground } = await import('../apps/img/remove-bg/index');
      return renderRemoveBackground();
    },
    meta: {
      description: 'Remove background from images automatically using AI. Get transparent PNG images instantly.',
      keywords: 'remove background, transparent background, background remover, cut out image',
    },
  },
  {
    path: '/apps/img/filter',
    title: 'Image Filters',
    component: async () => {
      const { renderFilterImage } = await import('../apps/img/filter/index');
      return renderFilterImage();
    },
    meta: {
      description: 'Apply filters to images. Add grayscale, sepia, blur, and other effects to your photos.',
      keywords: 'image filter, photo effects, grayscale image, sepia filter online',
    },
  },
  {
    path: '/apps/img/metadata',
    title: 'Image Metadata',
    component: async () => {
      const { renderMetadata } = await import('../apps/img/metadata/index');
      return renderMetadata();
    },
    meta: {
      description: 'View and remove EXIF metadata from images. Check photo information and strip location data.',
      keywords: 'EXIF data, image metadata, remove metadata, photo information',
    },
  },
  {
    path: '/apps/img/meme',
    title: 'Meme Generator',
    component: async () => {
      const { renderMemeGenerator } = await import('../apps/img/meme/index');
      return renderMemeGenerator();
    },
    meta: {
      description: 'Create memes with custom text. Add captions to images and make your own memes.',
      keywords: 'meme generator, create meme, add text to image, meme maker online',
    },
  },
];



// Text & Code Routes
const textRoutes: Route[] = [
  {
    path: '/apps/text/word-to-pdf',
    title: 'Word to PDF',
    component: async () => {
      const { renderWordToPDF } = await import('../apps/text/word-to-pdf/index');
      return renderWordToPDF();
    },
    meta: {
      description: 'Convert Word documents (.docx) to PDF online. Free DOCX to PDF converter.',
      keywords: 'Word to PDF, DOCX to PDF, convert Word, document converter',
    },
  },
  {
    path: '/apps/text/markdown',
    title: 'Markdown Editor',
    component: async () => {
      const { renderMarkdownEditor } = await import('../apps/text/markdown/index');
      return renderMarkdownEditor();
    },
    meta: {
      description: 'Write and preview Markdown online. Free Markdown editor with live preview.',
      keywords: 'Markdown editor, MD editor, Markdown preview, write Markdown',
    },
  },
  {
    path: '/apps/text/json-csv',
    title: 'JSON ↔ CSV Converter',
    component: async () => {
      const { renderJSONCSV } = await import('../apps/text/json-csv/index');
      return renderJSONCSV();
    },
    meta: {
      description: 'Convert between JSON and CSV formats. Free online data format converter.',
      keywords: 'JSON to CSV, CSV to JSON, data converter, format converter',
    },
  },
  {
    path: '/apps/text/diff',
    title: 'Text Diff',
    component: async () => {
      const { renderTextDiff } = await import('../apps/text/diff/index');
      return renderTextDiff();
    },
    meta: {
      description: 'Compare two texts and find differences. Free online text comparison tool.',
      keywords: 'text diff, compare texts, find differences, text comparison',
    },
  },
  {
    path: '/apps/text/count',
    title: 'Word Counter',
    component: async () => {
      const { renderWordCount } = await import('../apps/text/count/index');
      return renderWordCount();
    },
    meta: {
      description: 'Count words, characters, sentences, and paragraphs. Free online word counter tool.',
      keywords: 'word counter, character count, text statistics, word count online',
    },
  },
  {
    path: '/apps/text/lorem',
    title: 'Lorem Ipsum Generator',
    component: async () => {
      const { renderLoremIpsum } = await import('../apps/text/lorem/index');
      return renderLoremIpsum();
    },
    meta: {
      description: 'Generate Lorem Ipsum placeholder text. Create dummy text for design and development.',
      keywords: 'Lorem Ipsum, placeholder text, dummy text, filler text generator',
    },
  },
];

// Utility Routes
const utilityRoutes: Route[] = [
  {
    path: '/apps/util/zip',
    title: 'Create ZIP',
    component: async () => {
      const { renderZip } = await import('../apps/util/zip/index');
      return renderZip();
    },
    meta: {
      description: 'Create ZIP archives from multiple files online. Free online file compression tool.',
      keywords: 'create ZIP, compress files, ZIP archive, file compression',
    },
  },
  {
    path: '/apps/util/unzip',
    title: 'Extract ZIP',
    component: async () => {
      const { renderUnzip } = await import('../apps/util/unzip/index');
      return renderUnzip();
    },
    meta: {
      description: 'Extract files from ZIP archives online. Free online ZIP extractor.',
      keywords: 'extract ZIP, unzip files, open ZIP, ZIP extractor',
    },
  },
  {
    path: '/apps/util/password',
    title: 'Password Generator',
    component: async () => {
      const { renderPasswordGenerator } = await import('../apps/util/password/index');
      return renderPasswordGenerator();
    },
    meta: {
      description: 'Generate strong, secure passwords. Free online password generator with customization options.',
      keywords: 'password generator, secure password, random password, strong password',
    },
  },
  {
    path: '/apps/util/qrcode',
    title: 'QR Code Generator',
    component: async () => {
      const { renderQRCode } = await import('../apps/util/qrcode/index');
      return renderQRCode();
    },
    meta: {
      description: 'Generate QR codes for URLs, text, and more. Free online QR code generator.',
      keywords: 'QR code generator, create QR code, QR maker, barcode generator',
    },
  },
  {
    path: '/apps/util/barcode',
    title: 'Barcode Generator',
    component: async () => {
      const { renderBarcode } = await import('../apps/util/barcode/index');
      return renderBarcode();
    },
    meta: {
      description: 'Generate barcodes in various formats. Create CODE128, EAN, UPC barcodes online.',
      keywords: 'barcode generator, create barcode, CODE128, EAN barcode',
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
      description: 'About Office OS - The privacy-first online office suite. Learn about our mission and values.',
      keywords: 'about Office OS, privacy office, online tools, document suite',
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
      description: 'Privacy Policy - We do not store your files. All processing happens in your browser.',
      keywords: 'privacy policy, data privacy, file security, browser processing',
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
      description: 'Terms of Service for Office OS - Free online document tools.',
      keywords: 'terms of service, terms and conditions, usage terms',
    },
  },
];

// Export all routes
export const routes: Route[] = [
  dashboardRoute,
  ...pdfRoutes,
  ...imageRoutes,
  ...textRoutes,
  ...utilityRoutes,
  ...infoRoutes,
];

export default routes;
