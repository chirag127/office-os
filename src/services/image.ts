/**
 * Office OS - Image Service
 * Image manipulation using browser-image-compression and Canvas API
 */

import imageCompression from 'browser-image-compression';

export interface ImageInfo {
  width: number;
  height: number;
  type: string;
  size: number;
  name: string;
}

export interface CompressOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  useWebWorker?: boolean;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  fit?: 'contain' | 'cover' | 'fill';
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ImageFilter =
  | 'grayscale'
  | 'sepia'
  | 'invert'
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'saturate'
  | 'hue-rotate';

/**
 * Get image information
 */
export async function getImageInfo(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        type: file.type,
        size: file.size,
        name: file.name,
      });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compress image
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    quality = 0.8,
    useWebWorker = true,
  } = options;

  const compressedFile = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker,
    initialQuality: quality,
  });

  return compressedFile;
}

/**
 * Resize image
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<Blob> {
  const { width, height, maintainAspectRatio = true, fit = 'contain' } = options;

  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  let targetWidth = width || img.width;
  let targetHeight = height || img.height;

  if (maintainAspectRatio && width && height) {
    const aspectRatio = img.width / img.height;
    const targetAspectRatio = width / height;

    if (fit === 'contain') {
      if (aspectRatio > targetAspectRatio) {
        targetHeight = width / aspectRatio;
      } else {
        targetWidth = height * aspectRatio;
      }
    } else if (fit === 'cover') {
      if (aspectRatio > targetAspectRatio) {
        targetWidth = height * aspectRatio;
      } else {
        targetHeight = width / aspectRatio;
      }
    }
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), file.type);
  });
}

/**
 * Crop image
 */
export async function cropImage(
  file: File,
  options: CropOptions
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = options.width;
  canvas.height = options.height;

  ctx.drawImage(
    img,
    options.x, options.y, options.width, options.height,
    0, 0, options.width, options.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), file.type);
  });
}

/**
 * Apply CSS filter to image
 */
export async function applyFilter(
  file: File,
  filter: ImageFilter,
  value: number = 100
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;

  let filterString: string;
  switch (filter) {
    case 'grayscale':
      filterString = `grayscale(${value}%)`;
      break;
    case 'sepia':
      filterString = `sepia(${value}%)`;
      break;
    case 'invert':
      filterString = `invert(${value}%)`;
      break;
    case 'blur':
      filterString = `blur(${value}px)`;
      break;
    case 'brightness':
      filterString = `brightness(${value}%)`;
      break;
    case 'contrast':
      filterString = `contrast(${value}%)`;
      break;
    case 'saturate':
      filterString = `saturate(${value}%)`;
      break;
    case 'hue-rotate':
      filterString = `hue-rotate(${value}deg)`;
      break;
  }

  ctx.filter = filterString;
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), file.type);
  });
}

/**
 * Convert image format
 */
export async function convertImage(
  file: File,
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp',
  quality: number = 0.92
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), targetFormat, quality);
  });
}

/**
 * Remove background (simple threshold-based)
 * Note: For better results, use Puter AI
 */
export async function removeBackground(
  file: File,
  threshold: number = 240
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Simple white background removal
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // If pixel is close to white, make it transparent
    if (r > threshold && g > threshold && b > threshold) {
      data[i + 3] = 0; // Set alpha to 0
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

/**
 * Add text to image (meme generator)
 */
export async function addTextToImage(
  file: File,
  texts: Array<{
    text: string;
    x: number;
    y: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
  }>
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  for (const t of texts) {
    const fontSize = t.fontSize || 48;
    const fontFamily = t.fontFamily || 'Impact, sans-serif';

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = t.color || 'white';

    if (t.strokeColor) {
      ctx.strokeStyle = t.strokeColor;
      ctx.lineWidth = t.strokeWidth || 3;
      ctx.strokeText(t.text, t.x, t.y);
    }

    ctx.fillText(t.text, t.x, t.y);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), file.type);
  });
}

/**
 * Get EXIF metadata (basic extraction)
 */
export async function getImageMetadata(file: File): Promise<Record<string, unknown>> {
  // Note: For full EXIF support, would need exif-js or similar library
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified),
  };
}

/**
 * Strip EXIF metadata
 */
export async function stripMetadata(file: File): Promise<Blob> {
  // Re-encode through canvas to strip metadata
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), file.type, 0.95);
  });
}

/**
 * Helper: Load image from file
 */
async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Create image from canvas data URL
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Alias for convertImage for backwards compatibility
 */
export const convertFormat = convertImage;

/**
 * Apply any CSS filter string to image
 */
export async function applyFilterCSS(
  file: File,
  filterString: string
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;

  if (filterString && filterString !== 'none') {
    ctx.filter = filterString;
  }
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), file.type);
  });
}

/**
 * Add meme-style text to image (top and bottom text)
 */
export async function addMemeText(
  file: File,
  topText: string,
  bottomText: string,
  fontSize: number = 48
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  ctx.font = `bold ${fontSize}px Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = fontSize / 15;

  if (topText) {
    ctx.strokeText(topText.toUpperCase(), canvas.width / 2, fontSize + 10);
    ctx.fillText(topText.toUpperCase(), canvas.width / 2, fontSize + 10);
  }
  if (bottomText) {
    ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
    ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}
