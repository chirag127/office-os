/**
 * Office OS - Monetization Service
 * Manages Ad Networks and Revenue Generation
 */

import { APEX_CONFIG } from '../config/apex';

const { monetization } = APEX_CONFIG;

export class MonetizationService {
  private static instance: MonetizationService;

  private constructor() {}

  static getInstance(): MonetizationService {
    if (!MonetizationService.instance) {
      MonetizationService.instance = new MonetizationService();
    }
    return MonetizationService.instance;
  }

  init(): void {
    console.log('Initializing Monetization Stack...');

    // AdSense
    if (monetization.adsense.enabled && monetization.adsense.publisherId) {
       this.initAdSense();
    }

    // Adsterra
    if (monetization.adsterra.enabled && monetization.adsterra.popunderScript) {
        this.loadScript(monetization.adsterra.popunderScript);
    }

    // Monetag
    if (monetization.monetag.enabled) {
        // Monetag usually requires a specific sw.js or script tag provided in dashboard
        // We'll assume a generic zone injector here if URL provided, or placeholder
        // Note: Real implementation depends on the exact snippet code from Monetag
    }

    // Ko-Fi Widget (Optional overlay)
    // We can inject a floating button
    if (monetization.kofi.enabled && monetization.kofi.username) {
        this.initKofi();
    }
  }

  private initAdSense(): void {
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${monetization.adsense.publisherId}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }

  private initKofi(): void {
     // Optional: Insert a "Support Me" button
  }

  private loadScript(src: string): void {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  }
}

export const monetizationService = MonetizationService.getInstance();
