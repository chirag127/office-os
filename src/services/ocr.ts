/**
 * Office OS - OCR Service
 * OCR using Puter AI (primary) and Tesseract.js (fallback)
 */

import Tesseract from 'tesseract.js';

// Window.puter types are declared in services/ai.ts

export interface OCRResult {
  text: string;
  confidence?: number;
  source: 'puter' | 'tesseract';
  processingTime: number;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

/**
 * Perform OCR using Puter AI
 */
export async function ocrWithPuter(
  image: string | Blob
): Promise<string> {
  if (!window.puter) {
    throw new Error('Puter.js not loaded');
  }

  try {
    const text = await window.puter.ai.img2txt(image);
    return text;
  } catch (error) {
    console.error('Puter OCR error:', error);
    throw error;
  }
}

/**
 * Perform OCR using Tesseract.js
 */
export async function ocrWithTesseract(
  image: string | Blob | File,
  language: string = 'eng',
  onProgress?: (progress: OCRProgress) => void
): Promise<{ text: string; confidence: number }> {
  const worker = await Tesseract.createWorker(language, 1, {
    logger: (m) => {
      if (onProgress && m.status) {
        onProgress({
          status: m.status,
          progress: m.progress || 0,
        });
      }
    },
  });

  try {
    const { data } = await worker.recognize(image);
    return {
      text: data.text,
      confidence: data.confidence,
    };
  } finally {
    await worker.terminate();
  }
}

/**
 * Smart OCR - Try Puter first, fallback to Tesseract
 */
export async function performOCR(
  image: string | Blob | File,
  options: {
    preferPuter?: boolean;
    language?: string;
    onProgress?: (progress: OCRProgress) => void;
  } = {}
): Promise<OCRResult> {
  const { preferPuter = true, language = 'eng', onProgress } = options;
  const startTime = Date.now();

  // Convert File to Blob URL if needed
  let imageInput: string | Blob = image;
  if (image instanceof File) {
    imageInput = URL.createObjectURL(image);
  }

  if (preferPuter && window.puter) {
    try {
      onProgress?.({ status: 'Processing with Puter AI...', progress: 0.5 });
      const text = await ocrWithPuter(imageInput);
      return {
        text,
        source: 'puter',
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.warn('Puter OCR failed, falling back to Tesseract:', error);
    }
  }

  // Fallback to Tesseract
  onProgress?.({ status: 'Initializing Tesseract...', progress: 0.1 });
  const result = await ocrWithTesseract(imageInput, language, onProgress);

  // Cleanup blob URL
  if (image instanceof File) {
    URL.revokeObjectURL(imageInput as string);
  }

  return {
    text: result.text,
    confidence: result.confidence,
    source: 'tesseract',
    processingTime: Date.now() - startTime,
  };
}

/**
 * Get supported Tesseract languages
 */
export function getSupportedLanguages(): Array<{ code: string; name: string }> {
  return [
    { code: 'eng', name: 'English' },
    { code: 'spa', name: 'Spanish' },
    { code: 'fra', name: 'French' },
    { code: 'deu', name: 'German' },
    { code: 'ita', name: 'Italian' },
    { code: 'por', name: 'Portuguese' },
    { code: 'rus', name: 'Russian' },
    { code: 'jpn', name: 'Japanese' },
    { code: 'chi_sim', name: 'Chinese (Simplified)' },
    { code: 'chi_tra', name: 'Chinese (Traditional)' },
    { code: 'kor', name: 'Korean' },
    { code: 'ara', name: 'Arabic' },
    { code: 'hin', name: 'Hindi' },
  ];
}
