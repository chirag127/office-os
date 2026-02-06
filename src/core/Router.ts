/**
 * Office OS - Hash-Based SPA Router
 * Handles navigation for 40+ tool pages
 */

export interface Route {
  path: string;
  title: string;
  component: () => Promise<string>;
  meta?: {
    description?: string;
    keywords?: string;
  };
}

export interface RouteMatch {
  route: Route;
  params: Record<string, string>;
}

class Router {
  private routes: Map<string, Route> = new Map();
  private currentRoute: Route | null = null;
  private onNavigateCallbacks: Array<(route: Route) => void> = [];

  constructor() {
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());
  }

  /**
   * Register a route
   */
  register(route: Route): void {
    this.routes.set(route.path, route);
  }

  /**
   * Register multiple routes
   */
  registerAll(routes: Route[]): void {
    routes.forEach(route => this.register(route));
  }

  /**
   * Navigate to a path
   */
  navigate(path: string): void {
    window.location.hash = path;
  }

  /**
   * Get current path from hash
   */
  getCurrentPath(): string {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
  }

  /**
   * Match current path to a route
   */
  private matchRoute(path: string): RouteMatch | null {
    // Exact match first
    if (this.routes.has(path)) {
      return { route: this.routes.get(path)!, params: {} };
    }

    // Pattern matching for dynamic routes (e.g., /apps/pdf/:tool)
    for (const [pattern, route] of this.routes) {
      const patternParts = pattern.split('/');
      const pathParts = path.split('/');

      if (patternParts.length !== pathParts.length) continue;

      const params: Record<string, string> = {};
      let matches = true;

      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          params[patternParts[i].slice(1)] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        return { route, params };
      }
    }

    return null;
  }

  /**
   * Handle route changes
   */
  private async handleRouteChange(): Promise<void> {
    const path = this.getCurrentPath();
    const match = this.matchRoute(path);

    if (match) {
      this.currentRoute = match.route;

      // Update page title and meta
      document.title = `${match.route.title} | Office OS`;
      this.updateMeta(match.route);

      // Notify listeners
      this.onNavigateCallbacks.forEach(cb => cb(match.route));

      // Render component
      try {
        const content = await match.route.component();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.innerHTML = content;
          // Scroll to top on navigation
          window.scrollTo(0, 0);
        }
      } catch (error) {
        console.error('Error rendering route:', error);
      }
    } else {
      // 404 - Navigate to home
      this.navigate('/');
    }
  }

  /**
   * Update meta tags for SEO
   */
  private updateMeta(route: Route): void {
    // Update description
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && route.meta?.description) {
      descMeta.setAttribute('content', route.meta.description);
    }

    // Update keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta && route.meta?.keywords) {
      keywordsMeta.setAttribute('content', route.meta.keywords);
    }

    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', `${route.title} | Office OS`);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && route.meta?.description) {
      ogDesc.setAttribute('content', route.meta.description);
    }
  }

  /**
   * Subscribe to navigation events
   */
  onNavigate(callback: (route: Route) => void): void {
    this.onNavigateCallbacks.push(callback);
  }

  /**
   * Get current route
   */
  getCurrentRoute(): Route | null {
    return this.currentRoute;
  }

  /**
   * Check if path is active
   */
  isActive(path: string): boolean {
    return this.getCurrentPath() === path;
  }
}

// Export singleton instance
export const router = new Router();
export default router;
