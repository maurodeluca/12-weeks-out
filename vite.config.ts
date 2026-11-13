import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '12 Weeks Out',
        short_name: '12 Weeks Out',
        description: 'Track your progress through the Flutter Gym 12 Weeks Out challenge.',
        theme_color: '#ffd83a',
        background_color: '#0a0a0a',
        display: 'standalone',
        start_url: './',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,woff,woff2}'] },
    }),
  ],
  test: { environment: 'node' },
});
