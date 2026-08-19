import tailwindcss from '@tailwindcss/vite';

import react from '@vitejs/plugin-react';

import path from 'path';

import { defineConfig } from 'vite';

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),

      tailwindcss(),

      VitePWA({
        registerType: 'autoUpdate',

        injectRegister: 'inline',

        devOptions: {
          enabled: true
        },

        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,

          skipWaiting: true,

          clientsClaim: true
        },

        manifest: {
          name: 'SILA Digital Identity',

          short_name: 'SILA ID',

          description:
            'Carteira de Identidade Digital da República de Angola',

          theme_color: '#0D0F12',

          background_color: '#0D0F12',

          display: 'standalone',

          orientation: 'portrait',

          start_url: '/',

          icons: [
            {
              src: '/pwa-192x192.png',

              sizes: '192x192',

              type: 'image/png',

              purpose: 'any maskable'
            },

            {
              src: '/pwa-512x512.png',

              sizes: '512x512',

              type: 'image/png',

              purpose: 'any maskable'
            }
          ]
        }
      })
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    },

    server: {
      host: true,

      allowedHosts: true,

      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',

      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {}
    },

    preview: {
      host: true,

      allowedHosts: true,

      port: 3000
    }
  };
});