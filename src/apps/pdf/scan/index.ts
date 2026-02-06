/**
 * Office OS - Scan to PDF Tool
 * Capture images from camera and convert to PDF
 */
import { PDFDocument } from 'pdf-lib';
import { downloadFile } from '../../../services/file';
import { renderToolPage, renderActionButtons, showToast, showLoading, hideLoading } from '../../../components/shared';

let videoStream: MediaStream | null = null;
let capturedImages: string[] = []; // Base64 data URLs

export function renderScanPDF(): string {
  videoStream = null;
  capturedImages = [];

  setTimeout(() => init(), 0);

  return renderToolPage({
    title: 'Scan to PDF',
    description: 'Use your camera to scan documents',
    toolContent: `
      <div class="scan-workspace">
        <div id="camera-container" class="camera-container">
            <div id="camera-placeholder" class="camera-placeholder">
                <button id="start-camera-btn" class="btn btn-primary">📸 Start Camera</button>
            </div>
            <video id="camera-feed" class="hidden" autoplay playsinline></video>
            <canvas id="capture-canvas" class="hidden"></canvas>

            <div id="camera-controls" class="camera-controls hidden">
                <button id="capture-btn" class="btn btn-circle capture-btn" aria-label="Capture"></button>
                <div class="camera-actions">
                     <button id="stop-camera-btn" class="btn btn-sm btn-secondary">Stop</button>
                </div>
            </div>
        </div>

        <div id="gallery" class="gallery hidden">
            <h3>Scanned Pages (<span id="page-count">0</span>)</h3>
            <div id="scans-list" class="scans-list"></div>
        </div>
      </div>

      ${renderActionButtons([{ id: 'save-pdf-btn', label: 'Save as PDF', icon: '💾', primary: true, disabled: true }])}

      <style>
        .scan-workspace { display: flex; flex-direction: column; gap: var(--space-lg); margin: var(--space-xl) 0; }

        .camera-container {
            position: relative;
            width: 100%;
            max-width: 640px;
            aspect-ratio: 4/3;
            background: #000;
            border-radius: var(--radius-lg);
            overflow: hidden;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-md);
        }

        .camera-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--glass-bg); }

        video { width: 100%; height: 100%; object-fit: cover; }

        .camera-controls {
            position: absolute;
            bottom: 20px;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
        }

        .capture-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 4px solid white;
            background: rgba(255,255,255,0.3);
            transition: transform 0.1s;
        }
        .capture-btn:active { transform: scale(0.9); background: white; }

        .camera-actions { position: absolute; right: 20px; bottom: 0; height: 100%; display: flex; align-items: center; }

        .gallery { padding: var(--space-md); background: var(--glass-bg); border-radius: var(--radius-lg); border: 1px solid var(--glass-border); }
        .scans-list {
            display: flex;
            gap: var(--space-md);
            overflow-x: auto;
            padding: var(--space-sm) 0;
            scrollbar-width: thin;
        }

        .scan-thumb {
            position: relative;
            height: 120px;
            min-width: 90px;
            border-radius: var(--radius-md);
            overflow: hidden;
            border: 2px solid transparent;
            box-shadow: var(--shadow-sm);
        }
        .scan-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .scan-thumb .delete-btn {
            position: absolute;
            top: 2px;
            right: 2px;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
        }

        .hidden { display: none !important; }
      </style>
    `,
    seoContent: `
      <h2>Free Online Document Scanner</h2>
      <p>Turn your device into a powerful document scanner. works directly in your browser with no uploads needed for privacy.</p>
    `
  });
}

function init(): void {
  document.getElementById('start-camera-btn')?.addEventListener('click', startCamera);
  document.getElementById('stop-camera-btn')?.addEventListener('click', stopCamera);
  document.getElementById('capture-btn')?.addEventListener('click', captureImage);
  document.getElementById('save-pdf-btn')?.addEventListener('click', savePDF);

  // Cleanup on navigate away
  window.addEventListener('hashchange', stopCamera, { once: true });
}

async function startCamera(): Promise<void> {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });

        const video = document.getElementById('camera-feed') as HTMLVideoElement;
        video.srcObject = videoStream;
        video.classList.remove('hidden');
        document.getElementById('camera-placeholder')?.classList.add('hidden');
        document.getElementById('camera-controls')?.classList.remove('hidden');
    } catch (e) {
        showToast('Could not access camera. Please allow permissions.', 'error');
    }
}

function stopCamera(): void {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    document.getElementById('camera-feed')?.classList.add('hidden');
    document.getElementById('camera-controls')?.classList.add('hidden');
    document.getElementById('camera-placeholder')?.classList.remove('hidden');
}

function captureImage(): void {
    const video = document.getElementById('camera-feed') as HTMLVideoElement;
    const canvas = document.getElementById('capture-canvas') as HTMLCanvasElement;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    capturedImages.push(dataUrl);

    updateGallery();
    showToast('Page captured', 'success');
}

function updateGallery(): void {
    const gallery = document.getElementById('gallery');
    const list = document.getElementById('scans-list');
    const count = document.getElementById('page-count');
    const saveBtn = document.getElementById('save-pdf-btn') as HTMLButtonElement;

    if (!gallery || !list || !count) return;

    if (capturedImages.length > 0) {
        gallery.classList.remove('hidden');
        saveBtn.disabled = false;
    } else {
        gallery.classList.add('hidden');
        saveBtn.disabled = true;
    }

    count.textContent = capturedImages.length.toString();
    list.innerHTML = '';

    capturedImages.forEach((imgSrc, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'scan-thumb';
        thumb.innerHTML = `
            <img src="${imgSrc}">
            <button class="delete-btn" onclick="window.deleteScan(${index})">✕</button>
        `;
        list.appendChild(thumb);
    });

    (window as any).deleteScan = (index: number) => {
        capturedImages.splice(index, 1);
        updateGallery();
    };

    // Scroll to new
    list.scrollLeft = list.scrollWidth;
}

async function savePDF(): Promise<void> {
    if (capturedImages.length === 0) return;
    showLoading('Generating PDF...');

    try {
        const pdfDoc = await PDFDocument.create();

        for (const imgData of capturedImages) {
            const jpgImage = await pdfDoc.embedJpg(imgData);
            const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
            page.drawImage(jpgImage, {
                x: 0,
                y: 0,
                width: jpgImage.width,
                height: jpgImage.height,
            });
        }

        const pdfBytes = await pdfDoc.save();
        const buffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);
        downloadFile(new Blob([buffer as ArrayBuffer], { type: 'application/pdf' }), 'scanned_document.pdf');
        showToast('PDF Saved!', 'success');
    } catch (e) {
        console.error(e);
        showToast('Failed to create PDF', 'error');
    } finally {
        hideLoading();
    }
}
