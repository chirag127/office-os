/**
 * Vite Configuration
 * Optimized for minimal bundle size and static deployment
 */
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
            if (id.includes('pdfjs-dist')) return 'pdfjs';
            if (id.includes('@tensorflow')) return 'tensorflow';
            if (id.includes('tesseract.js')) return 'tesseract';
            if (id.includes('components/shared')) return 'ui';
        }
      }
    }
  }
});
