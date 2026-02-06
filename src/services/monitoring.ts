/**
 * Office OS - Monitoring Service
 * Initializes Analytics, Error Tracking, and Reliability tools dynamically
 */

import { APEX_CONFIG } from '../config/apex';

const { tracking, reliability } = APEX_CONFIG;

export class MonitoringService {
  private static instance: MonitoringService;

  private constructor() {}

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Initialize all enabled monitoring tools
   */
  init(): void {
    console.log('Initializing Monitoring Stack...');
    this.initAnalytics();
    this.initReliability();
  }

  private initAnalytics(): void {
    // Google Analytics 4
    if (tracking.ga4.enabled && tracking.ga4.measurementId) {
      this.loadScript(`https://www.googletagmanager.com/gtag/js?id=${tracking.ga4.measurementId}`);
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) { (window.dataLayer as any).push(args); }
      gtag('js', new Date());
      gtag('config', tracking.ga4.measurementId);
    }

    // Microsoft Clarity
    if (tracking.clarity.enabled && tracking.clarity.projectId) {
      (function(c: any, l: Document, a: string, r: string, i: string, t?: any, y?: any){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", tracking.clarity.projectId);
    }

    // Yandex Metrica
    if (tracking.yandex.enabled && tracking.yandex.tagId) {
      (function(m: any, e: Document, t: string, r: string, i: string, k?: any, a?: any){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date().getTime();
        k=e.createElement(t),a=e.getElementsByTagName(t)[0];
        k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
      })
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

      (window as any).ym(tracking.yandex.tagId, "init", {
        clickmap:tracking.yandex.clickmap,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:tracking.yandex.webvisor
      });
    }

    // Cloudflare Web Analytics
    if (tracking.cloudflare.enabled && tracking.cloudflare.token) {
        const script = document.createElement('script');
        script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
        script.setAttribute('data-cf-beacon', `{"token": "${tracking.cloudflare.token}"}`);
        script.defer = true;
        document.body.appendChild(script);
    }

    // GoatCounter
    if (tracking.goatcounter.enabled && tracking.goatcounter.code) {
        const script = document.createElement('script');
        script.dataset.goatcounter = `https://${tracking.goatcounter.code}.goatcounter.com/count`;
        script.async = true;
        script.src = '//gc.zgo.at/count.js';
        document.body.appendChild(script);
    }
  }

  private initReliability(): void {
    // Sentry (via CDN for client-side)
    if (reliability.sentry.enabled && reliability.sentry.dsn) {
        // We'll lazy load Sentry to not block the main thread
        // For production, you'd typically npm install @sentry/browser
        // But for "Zero-Server/No-Build-Step" vibe we inject via CDN
        // However, since we have a build step, we can also use the package if installed.
        // For now, let's use the script injection method for simplicity with the config
        const script = document.createElement('script');
        script.src = "https://js.sentry-cdn.com/" + reliability.sentry.dsn.split('@')[0].split('//')[1] + ".min.js";
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
    }

    // Honeybadger
    if (reliability.honeybadger.enabled && reliability.honeybadger.apiKey) {
        const script = document.createElement('script');
        script.src = "//js.honeybadger.io/v5.7/honeybadger.min.js";
        script.type = "text/javascript";
        script.onload = () => {
             (window as any).Honeybadger.configure({
                apiKey: reliability.honeybadger.apiKey,
                environment: 'production'
            });
        };
        document.head.appendChild(script);
    }
  }

  private loadScript(src: string): void {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
  }
}

// Global Types for window
declare global {
  interface Window {
    dataLayer: any[];
    clarity: any;
  }
}

export const monitoring = MonitoringService.getInstance();
