/**
 * Office OS - Utility Service
 * QR Code, Barcode, Password Generator, Text utilities
 */

import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

/**
 * Generate QR Code as Data URL
 */
export async function generateQRCode(
  text: string,
  options: {
    width?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
): Promise<string> {
  const {
    width = 256,
    margin = 2,
    color = { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel = 'M',
  } = options;

  return QRCode.toDataURL(text, {
    width,
    margin,
    color,
    errorCorrectionLevel,
  });
}

/**
 * Generate QR Code as SVG string
 */
export async function generateQRCodeSVG(
  text: string,
  options: {
    width?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
  } = {}
): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    width: options.width || 256,
    margin: options.margin || 2,
    color: options.color,
  });
}

/**
 * Generate Barcode as Data URL
 */
export function generateBarcode(
  text: string,
  options: {
    format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF14';
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontSize?: number;
    lineColor?: string;
    background?: string;
  } = {}
): string {
  const {
    format = 'CODE128',
    width = 2,
    height = 100,
    displayValue = true,
    fontSize = 16,
    lineColor = '#000000',
    background = '#ffffff',
  } = options;

  const canvas = document.createElement('canvas');

  JsBarcode(canvas, text, {
    format,
    width,
    height,
    displayValue,
    fontSize,
    lineColor,
    background,
  });

  return canvas.toDataURL('image/png');
}

/**
 * Generate secure password
 */
export function generatePassword(
  length: number = 16,
  options: {
    uppercase?: boolean;
    lowercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
    excludeSimilar?: boolean;
    excludeAmbiguous?: boolean;
  } = {}
): string {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    excludeSimilar = false,
    excludeAmbiguous = false,
  } = options;

  let chars = '';

  const uppercaseChars = excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = excludeSimilar ? '23456789' : '0123456789';
  const symbolChars = excludeAmbiguous ? '!@#$%^&*' : '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (uppercase) chars += uppercaseChars;
  if (lowercase) chars += lowercaseChars;
  if (numbers) chars += numberChars;
  if (symbols) chars += symbolChars;

  if (!chars) chars = lowercaseChars + numberChars;

  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }

  return password;
}

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  label: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length < 8) feedback.push('Use at least 8 characters');

  // Character type checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  // Diversity check
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 1;

  let label: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  if (score <= 2) label = 'weak';
  else if (score <= 4) label = 'fair';
  else if (score <= 6) label = 'good';
  else if (score <= 7) label = 'strong';
  else label = 'very-strong';

  return { score, label, feedback };
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count characters in text
 */
export function countCharacters(text: string, includeSpaces: boolean = true): number {
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
}

/**
 * Count sentences in text
 */
export function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

/**
 * Count paragraphs in text
 */
export function countParagraphs(text: string): number {
  return text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
}

/**
 * Text statistics
 */
export function getTextStats(text: string): {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
} {
  const words = countWords(text);
  const readingTimeMinutes = Math.ceil(words / 200); // Average reading speed

  return {
    characters: countCharacters(text, true),
    charactersNoSpaces: countCharacters(text, false),
    words,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readingTime: readingTimeMinutes === 1 ? '1 min' : `${readingTimeMinutes} mins`,
  };
}

/**
 * Generate Lorem Ipsum
 */
export function generateLoremIpsum(
  count: number = 5,
  type: 'paragraphs' | 'sentences' | 'words' = 'paragraphs'
): string {
  const words = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
  ];

  const getRandomWord = () => words[Math.floor(Math.random() * words.length)];

  const generateSentence = (wordCount: number = 12) => {
    const sentence = Array.from({ length: wordCount }, getRandomWord).join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const generateParagraph = () => {
    const sentenceCount = 4 + Math.floor(Math.random() * 4);
    return Array.from({ length: sentenceCount }, () =>
      generateSentence(8 + Math.floor(Math.random() * 8))
    ).join(' ');
  };

  switch (type) {
    case 'words':
      return Array.from({ length: count }, getRandomWord).join(' ');
    case 'sentences':
      return Array.from({ length: count }, () => generateSentence()).join(' ');
    case 'paragraphs':
      return Array.from({ length: count }, generateParagraph).join('\n\n');
  }
}

/**
 * Compare two texts (simple diff)
 */
export function compareTexts(text1: string, text2: string): {
  added: string[];
  removed: string[];
  unchanged: string[];
} {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const set1 = new Set(lines1);
  const set2 = new Set(lines2);

  return {
    added: lines2.filter(line => !set1.has(line)),
    removed: lines1.filter(line => !set2.has(line)),
    unchanged: lines1.filter(line => set2.has(line)),
  };
}
