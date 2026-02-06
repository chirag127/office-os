/**
 * Office OS - Puter.js Service
 * Integration for Serverless Cloud & AI
 * LAZY LOADED to prevent blocking app initialization with auth calls
 */

// Puter instance - loaded on demand
let puterInstance: any = null;

async function getPuter() {
    if (!puterInstance) {
        try {
            const module = await import('@heyputer/puter.js');
            puterInstance = module.default || module;
        } catch (e) {
            console.warn('Puter.js could not be loaded:', e);
            return null;
        }
    }
    return puterInstance;
}

class PuterService {
  private initialized: boolean = false;

  init() {
    if (this.initialized) return;
    // Puter is now lazy-loaded, so init just marks service as ready
    console.log('Puter.js Service Ready (Lazy Load Mode)');
    this.initialized = true;
  }

  /**
   * Use Puter AI for text generation
   * @param prompt User prompt
   */
  async chat(prompt: string): Promise<string> {
    const puter = await getPuter();
    if (!puter) throw new Error('AI Service Unavailable');

    try {
        const response = await puter.ai.chat(prompt);
        const content = response?.message?.content;

        if (typeof content === 'string') return content;
        if (Array.isArray(content)) return content.map((p: any) => typeof p === 'string' ? p : JSON.stringify(p)).join('');
        return String(content || '');
    } catch (e) {
        console.error('Puter AI Chat Error:', e);
        throw new Error('AI Service Unavailable');
    }
  }

  /**
   * Check if user is signed in to Puter.com (for storage/sync)
   */
  async isSignedIn(): Promise<boolean> {
      const puter = await getPuter();
      if (!puter) return false;

      try {
          return await puter.auth.isSignedIn();
      } catch (e) {
          return false;
      }
  }

  async signIn(): Promise<void> {
      const puter = await getPuter();
      if (!puter) throw new Error('Puter not available');
      await puter.auth.signIn();
  }
}

export const puterService = new PuterService();
