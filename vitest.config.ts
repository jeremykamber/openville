import { defineConfig } from 'vitest/config';
import path from 'path';

// Note: removed @vitejs/plugin-react to avoid test startup failures when the
// plugin isn't installed in some environments. Tests don't require the plugin.
export default defineConfig({
  test: {
    // Use 'node' environment to avoid requiring jsdom in CI/dev environments
    // Tests in this repo do not depend on a browser DOM for the added files.
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
