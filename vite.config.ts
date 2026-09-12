import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages project site: https://newreld.github.io/piano/
// (change this — and nothing else needs to change — if you ever move to a
// custom domain or a user/org root page, where base should be '/'). Keyed
// off `mode` rather than `command`: both `vite build` and `vite preview`
// default to mode "production" (preview serves the already-built dist,
// which has this base baked in), while plain `vite` dev serving defaults to
// mode "development" and should stay at root for local convenience.
const BASE = '/piano/';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? BASE : '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-source.svg'],
      // Lets the service worker be exercised against the dev server too,
      // not just a production build — this app is verified live via a
      // browser preview rather than a separate build+serve step.
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'Little Piano',
        short_name: 'Little Piano',
        description: 'Learn simple melodies on a friendly on-screen piano.',
        theme_color: '#ff8c42',
        background_color: '#fff6e9',
        display: 'standalone',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell + song data + icons.
        globPatterns: ['**/*.{js,css,html,svg,png,xml,webmanifest}'],
        runtimeCaching: [
          {
            // Salamander Grand Piano samples, fetched at runtime from
            // Tone.js's hosted mirror — cache them the first time each is
            // played so the active song's notes work offline afterwards.
            urlPattern: /^https:\/\/tonejs\.github\.io\/audio\/salamander\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'piano-samples',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
}));
