/**
 * Office OS - File Service
 * File handling utilities: ZIP, download, conversion
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import Papa from 'papaparse';

/**
 * Create a ZIP file from multiple files
 */
export async function createZip(
  files: Array<{ name: string; content: Blob | ArrayBuffer | string }>,
  _zipName: string = 'archive.zip'
): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file.content);
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/**
 * Extract files from a ZIP
 */
export async function extractZip(
  zipFile: File
): Promise<Array<{ name: string; content: Blob }>> {
  const zip = await JSZip.loadAsync(zipFile);
  const files: Array<{ name: string; content: Blob }> = [];

  for (const [name, zipEntry] of Object.entries(zip.files)) {
    if (!zipEntry.dir) {
      const content = await zipEntry.async('blob');
      files.push({ name, content });
    }
  }

  return files;
}

/**
 * Download file
 */
export function downloadFile(
  content: Blob | string,
  filename: string,
  mimeType?: string
): void {
  if (typeof content === 'string') {
    const blob = new Blob([content], { type: mimeType || 'text/plain' });
    saveAs(blob, filename);
  } else {
    saveAs(content, filename);
  }
}

/**
 * Download multiple files as ZIP
 */
export async function downloadAsZip(
  files: Array<{ name: string; content: Blob | ArrayBuffer | string }>,
  zipName: string = 'files.zip'
): Promise<void> {
  const zipBlob = await createZip(files, zipName);
  saveAs(zipBlob, zipName);
}

/**
 * Convert DOCX to HTML
 */
export async function docxToHtml(file: File): Promise<{ html: string; messages: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return {
    html: result.value,
    messages: result.messages.map(m => m.message),
  };
}

/**
 * Convert DOCX to plain text
 */
export async function docxToText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Parse CSV file
 */
export async function parseCSV<T = unknown>(
  file: File,
  options: {
    header?: boolean;
    delimiter?: string;
    skipEmptyLines?: boolean;
  } = {}
): Promise<{ data: T[]; errors: Papa.ParseError[]; meta: Papa.ParseMeta }> {
  return new Promise((resolve) => {
    Papa.parse<T>(file, {
      header: options.header ?? true,
      delimiter: options.delimiter,
      skipEmptyLines: options.skipEmptyLines ?? true,
      complete: (results) => {
        resolve({
          data: results.data,
          errors: results.errors,
          meta: results.meta,
        });
      },
    });
  });
}

/**
 * Convert array to CSV string
 */
export function arrayToCSV(
  data: Record<string, unknown>[],
  options: { delimiter?: string } = {}
): string {
  return Papa.unparse(data, {
    delimiter: options.delimiter,
  });
}

/**
 * Convert JSON to CSV
 */
export function jsonToCSV(json: string): string {
  const data = JSON.parse(json);
  if (Array.isArray(data)) {
    return arrayToCSV(data);
  }
  return arrayToCSV([data]);
}

/**
 * Parse CSV string to JSON object array
 */
export function parseCSVString<T = Record<string, unknown>>(
  csvString: string,
  options: { header?: boolean; delimiter?: string; skipEmptyLines?: boolean } = {}
): T[] {
  const result = Papa.parse<T>(csvString, {
    header: options.header ?? true,
    delimiter: options.delimiter,
    skipEmptyLines: options.skipEmptyLines ?? true,
  });
  return result.data;
}

/**
 * Convert CSV to JSON
 */
export async function csvToJSON(file: File): Promise<string> {
  const result = await parseCSV(file);
  return JSON.stringify(result.data, null, 2);
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Read file as ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read file as Data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  const ext = getFileExtension(file.name);
  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return ext === type.slice(1).toLowerCase();
    }
    return file.type === type || file.type.startsWith(type.replace('*', ''));
  });
}
