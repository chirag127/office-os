/**
 * APEX MASTER CONFIGURATION (MAXIMUM COVERAGE)
 * ==========================================================
 * Strategy: "Zero-Server" Architecture
 * Hosting: Static (Cloudflare Pages / GitHub Pages / Vercel)
 * Backend: Firebase + Client-Side APIs
 * Monetization: AdSense (Primary) + 5 Backup Layers
 * Analytics: 8-Layer Redundancy
 * ==========================================================
 */

export const APEX_CONFIG = {
  // ========================================================================
  // 1. MONETIZATION STACK (The Revenue Engine)
  // Strategy: If AdSense fails, 5 other networks are already active.
  // ========================================================================
  monetization: {
    // [PRIMARY] Google AdSense
    // TYPE: Domain Specific (Must add site in Dashboard)
    // GLOBAL KEY: Yes (Same Publisher ID)
    adsense: {
      publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // REPLACE with your ID from Dashboard
      autoAds: true,
      lazyLoad: true,
      enabled: true,
    },

    // [BACKUP 1] Adsterra (High CPM)
    // TYPE: Global (One script works everywhere)
    // STRATEGY: Use for Popunders and "Direct Link" buttons
    adsterra: {
      popunderScript: 'https://pl28614694.effectivegatecpm.com/87/f5/4e/87f54e4fd25208c387bbd464ee1c6769.js',
      enabled: false, // DISABLED: Popunders too aggressive
    },

    // [BACKUP 2] Monetag (PropellerAds)
    // TYPE: Global (Zone ID works everywhere)
    // STRATEGY: Aggressive Popunders / Interstitials
    monetag: {
      zoneId: '10545951',
      enabled: false, // DISABLED: Smart links/popunders too aggressive
    },

    // [BACKUP 3] HilltopAds
    // TYPE: Global (Zone IDs work everywhere)
    // STRATEGY: Social Bar (High CTR) and Video Ads
    hilltopads: {
      socialBarZoneId: '6761813',
      videoVastZoneId: '6761811',
      popunderZoneId: '6761807',
      enabled: false, // DISABLED: Popunders too aggressive
    },

    // [BACKUP 4] A-ADS (Anonymous Ads)
    // TYPE: Global (Truly anonymous, no approval needed)
    // STRATEGY: Crypto Banners (Clean, lightweight)
    aads: {
      unitId: '2425642',
      size: 'Adaptive',
      enabled: true,
    },

    // [PREMIUM] Coinzilla
    // TYPE: Domain Specific (Requires individual approval)
    // STRATEGY: Use only on high-quality, aged domains
    coinzilla: {
      zoneId: '04f0bcb8c5793e809c1b6d64b32b5772',
      enabled: false, // Enable only after approval
    },

    // [DONATIONS] Ko-Fi
    // TYPE: Global
    // STRATEGY: 0% Fees (Better than BuyMeACoffee)
    kofi: {
      username: 'chirag127',
      label: 'Support Me',
      enabled: true,
    },

    // [AFFILIATE] Amazon Associates
    // TYPE: Global
    // STRATEGY: Passive income from gear/book links
    amazon: {
      trackingId: 'chirag127-20', // Verify in your Amazon Dashboard
      marketplace: 'US',
      enabled: true,
    },
  },

  // ========================================================================
  // 2. ANALYTICS STACK (The "Spy" Engine)
  // Strategy: Capture 100% of data. Redundant tools bypass AdBlockers.
  // ========================================================================
  tracking: {
    // [STANDARD] Google Analytics 4
    // TYPE: Global Key (Filter by Hostname in GA4 Dashboard)
    ga4: {
      measurementId: 'G-BPSZ007KGR',
      enabled: true,
    },

    // [HEATMAPS] Microsoft Clarity
    // TYPE: Global Key (Mixes data, but Free Forever)
    // STRATEGY: Session Recordings & Heatmaps
    clarity: {
      projectId: 'v9yyfdb222',
      enabled: true,
    },

    // [BACKUP RECORDINGS] Yandex Metrica
    // TYPE: Global Key
    // STRATEGY: Webvisor (Session Replay) + Clickmaps
    yandex: {
      tagId: 106547626,
      webvisor: true,
      clickmap: true,
      enabled: true,
    },

    // [PRODUCT DATA] Mixpanel
    // TYPE: Global Key
    // STRATEGY: 20M Events/Month Free. Track specific feature usage.
    mixpanel: {
      token: '54c23accec03549caca40b0a7efab7d6',
      enabled: true,
    },

    // [SERVER SIDE] Cloudflare Web Analytics
    // TYPE: Global Key
    // STRATEGY: Cannot be blocked by AdBlock. True traffic count.
    cloudflare: {
      token: '333c0705152b4949b3eb0538cd4c2296',
      enabled: true,
    },

    // [PRIVACY] GoatCounter
    // TYPE: Global Key
    // STRATEGY: Simple, public-facing stats (optional)
    goatcounter: {
      code: 'chirag127',
      enabled: true,
    },

    // [JOURNEYS] Amplitude
    // TYPE: Global Key
    // STRATEGY: User path analysis (100k MTU Free)
    amplitude: {
      apiKey: 'd1733215e7a8236a73912adf86ac450b',
      enabled: true,
    },

    // [AUTO-CAPTURE] Heap
    // TYPE: Global Key
    // STRATEGY: Tracks every click automatically
    heap: {
      appId: '3491046690',
      enabled: true,
    },
  },

  // ========================================================================
  // 3. RELIABILITY STACK (The Bug Catchers)
  // Strategy: Detect JS errors on client-side since we have no server logs.
  // ========================================================================
  reliability: {
    // [PRIMARY] Sentry
    // TYPE: Global Key
    // STRATEGY: Full stack trace of crashes
    sentry: {
      dsn: 'https://45890ca96ce164182a3c74cca6018e3e@o4509333332164608.ingest.de.sentry.io/4509333334458448',
      enabled: true,
    },

    // [BACKUP] Honeybadger
    // TYPE: Global Key
    honeybadger: {
      apiKey: 'hbp_d5yADoevD4dyItN7Bu5bqNevwqgjaJ3ns2lE',
      enabled: true,
    },

    // [REAL-TIME] Rollbar
    // TYPE: Global Key
    rollbar: {
      accessToken: 'f06dfc71b1c840e6a101d8dd317146f2',
      enabled: true,
    },

    // [STABILITY] Bugsnag
    // TYPE: Global Key
    bugsnag: {
      apiKey: '84afb61cb3bf458037f4f15eeab394c4',
      enabled: true,
    },

    // [UPTIME] Cronitor RUM
    // TYPE: Global Key
    cronitor: {
      rumKey: '205a4c0b70da8fb459aac415c1407b4d',
      enabled: true,
    },
  },

  // ========================================================================
  // 4. BAAS & ENGAGEMENT STACK (The "Serverless" Backend)
  // Strategy: Add dynamic features (Auth, DB, Chat) without hosting.
  // ========================================================================
  baas: {
    // [CORE] Firebase (Auth + DB)
    // TYPE: Global Config (But requires Domain Whitelist in Console)
    // STRATEGY: Use for everything dynamic.
    firebase: {
      config: {
        apiKey: 'AIzaSyCx--SPWCNaIY5EJpuJ_Hk28VtrVhBo0Ng',
        authDomain: 'fifth-medley-408209.firebaseapp.com',
        projectId: 'fifth-medley-408209',
        storageBucket: 'fifth-medley-408209.firebasestorage.app',
        messagingSenderId: '1017538017299',
        appId: '1:1017538017299:web:bd8ccb096868a6f394e7e6',
      },
      enabled: true,
    },

    // [SUPPORT] Tawk.to
    // TYPE: Global Key
    // STRATEGY: 100% Free Live Chat (Unlimited Agents)
    tawkto: {
      sourceUrl: 'https://embed.tawk.to/6968e3ea8783b31983eb190b/1jf0rkjhp',
      enabled: true,
    },

    // [COMMENTS] Giscus
    // TYPE: Global Key
    // STRATEGY: Zero-cost comments via GitHub Discussions
    giscus: {
      repo: 'chirag127/office-os', // Assuming this repo
      repoId: 'R_kgDOQ6Jz_Q',
      categoryId: 'DIC_kwDOQ6Jz_c4C1VQo',
      enabled: true,
    },

    // [EMAIL] MailerLite
    // TYPE: Global Key
    // STRATEGY: 12k Free Emails/Mo. Newsletter collection.
    mailerlite: {
      apiKey: 'mlsn.6bc1e1ae5ce788bf939db506b25d8b3e020e53b761b55cf515353882dfd71f51',
      enabled: true,
    },

    // [FORMS] EmailJS
    // TYPE: Global Key
    // STRATEGY: Contact forms without server
    emailjs: {
      serviceId: 'whyiswhen',
      templateId: 'YOUR_TEMPLATE_ID', // Generate in Dashboard
      publicKey: 'YOUR_PUBLIC_KEY', // Generate in Dashboard
      enabled: true,
    },

    // [EXPERIMENTS] GrowthBook
    // TYPE: Global Key
    // STRATEGY: A/B Testing features
    growthbook: {
      clientKey: 'sdk-BamkgvyjaSFKa0m6',
      enabled: true,
    },

    // [CAPTCHA] Cloudflare Turnstile
    // TYPE: Domain Specific (Requires Site Key generation)
    // STRATEGY: Replace reCAPTCHA (User friendly & Free)
    turnstile: {
      siteKey: '', // Generate new key per domain
      enabled: true,
    },
  },

  // ========================================================================
  // 5. UTILITY STACK (Frontend Assets)
  // Strategy: High quality assets, zero bandwidth cost (CDN).
  // ========================================================================
  utility: {
    // [FONTS] Google Fonts
    // TYPE: Global
    fonts: {
      families: ['Inter:wght@400;600', 'JetBrains+Mono:wght@400;500'],
      display: 'swap',
      enabled: true,
    },

    // [ICONS] FontAwesome
    // TYPE: Global
    icons: {
      provider: 'cdnjs', // Free CDN
      enabled: true,
    },

    // [TRANSLATE] Google Translate
    // TYPE: Global
    // STRATEGY: Instant multi-language support
    translate: {
      defaultLang: 'en',
      enabled: true,
    },
  },
};
