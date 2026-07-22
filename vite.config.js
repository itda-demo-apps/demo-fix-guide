import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // PWA: 이슈 맵 전체 프리캐시 — AS 현장(지하·기계실 등 통신 불량)에서도 동작하는 것이 핵심
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png", "favicon.svg"],
      manifest: {
        name: "고장 길잡이",
        short_name: "고장 길잡이",
        description: "현장 AS 이슈 대응 가이드 — 증상 검색, 원인·조치, 해결 기록",
        lang: "ko",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        background_color: "#1E2126",
        theme_color: "#1E2126",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        globIgnores: ["splash/**", "og.png"], // iOS 설치용·공유 크롤러용 — 오프라인 캐시 불필요
        navigateFallbackDenylist: [/\.[a-z0-9]+$/i],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-css" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-woff",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: { host: true },
});
