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
        theme_color: '#e8834a',
        background_color: '#f7f4ee',
        // fullscreen requests the whole physical screen with no reserved
        // OS chrome at all; display_override lets us ask for that first
        // and gracefully fall back to standalone (the base `display`
        // below) wherever fullscreen isn't supported — an experiment for
        // a reported iPad-only gap at the bottom of the installed app
        // that's persisted through every CSS/JS viewport-height fix tried
        // so far, which points at how iOS sizes the app's own frame for
        // "standalone" launches specifically, not anything visible to the
        // page itself.
        display_override: ['fullscreen', 'standalone'],
        display: 'standalone',
        start_url: BASE,
        scope: BASE,
        // A distinct source from icon-192/512.png (used for the favicon and
        // in-app icon references, in main.ts's appIconUrl) — this one's a
        // full-bleed square (no baked-in rounding/transparency) meant
        // specifically for the OS to mask for the home screen/install
        // prompt, per the user's separate "Piano Icon - APP" design asset.
        icons: [
          { src: 'pwa-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
          {
            // Google Fonts stylesheet (Playfair Display + Lato) — small and
            // occasionally revalidated, in case font-serving URLs inside it
            // change.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            // The actual font files the stylesheet above points to — these
            // are immutable per-URL, so cache them long-term once fetched.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
}));
