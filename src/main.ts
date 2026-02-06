/**
 * Office OS - Main Entry Point
 * Privacy-First Document & Productivity Operating System
 */

import './styles/index.css';
import { router } from './core/Router';
import { shell } from './core/Shell';
import { routes } from './core/routes';

// Services
import { monitoring } from './services/monitoring';
import { monetizationService } from './services/monetization';
// import { firebaseService } from './services/firebase'; // Lazy load if needed, or init here

// Initialize the application
async function init() {
  // Initialize Core Services (APEX Stack)
  monitoring.init();
  monetizationService.init();
  // firebaseService is auto-initialized on import if enabled

  // Render the shell
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = shell.render();

  // Initialize shell event listeners
  shell.init();

  // Register all routes
  router.registerAll(routes);

  // Navigate to current hash or home
  const currentPath = router.getCurrentPath();
  if (currentPath === '' || currentPath === '/') {
    router.navigate('/');
  }

  console.log('🏢 Office OS initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
