import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { activityApi } from './server/activity.mjs';

// Vite injects JS-imported CSS after the module graph loads in development.
// Make the same global styles render-blocking in preview so a cold page cannot
// briefly paint the unstyled HTML. Production already emits stylesheet links.
function developmentFirstPaintStyles() {
  const styles = [
    'fonts', 'side-quest', 'styles', 'reactdrops', 'motion-regions',
    'activity', 'site-header', 'magic-sections', 'product-story',
    'agent-install', 'feedback', 'theme', 'night-hero', 'hero-actions', 'footer-night',
  ];
  return {
    name: 'development-first-paint-styles',
    apply: 'serve',
    transformIndexHtml: {
      order: 'pre',
      handler: () => styles.map(name => ({
        tag: 'link', attrs: { rel: 'stylesheet', href: `/src/${name}.css` }, injectTo: 'head',
      })),
    },
  };
}

export default defineConfig({
  plugins: [developmentFirstPaintStyles(), react(), activityApi()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: { sourcemap: false },
});
