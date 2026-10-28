import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'The Big 3 | הטופ 3',
          short_name: 'הטופ 3',
          description: 'אפליקציית ניהול משימות ומיקוד יומי מבוססת עקרון 3 המשימות, מעבדת פירוק משימות חכמה וטקס תכנון ערב.',
          theme_color: '#fcfbf9',
          background_color: '#fcfbf9',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        },
      }),
    ],
    resolve: {
      alias: {
        '@/core': path.resolve(import.meta.dirname, 'src/core'),
        '@/services': path.resolve(import.meta.dirname, 'src/services'),
        '@/modules': path.resolve(import.meta.dirname, 'src/modols'),
        '@/modols': path.resolve(import.meta.dirname, 'src/modols'),
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
