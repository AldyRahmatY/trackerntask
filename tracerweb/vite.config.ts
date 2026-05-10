import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from 'vite-plugin-pwa'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(), 
    VitePWA({
      registerType: 'autoUpdate', // Otomatis update kalau ada versi baru
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // Aset yang di-cache
      manifest: {
        name: 'Rutinan - Habit & Tabungan Tracker',
        short_name: 'Rutinan',
        description: 'Aplikasi pencatat kebiasaan dan target tabungan harian.',
        theme_color: '#10b981', // Warna tema aplikasimu (misal: Emerald)
        background_color: '#ffffff',
        display: 'standalone', // Ini yang bikin tampilannya full screen kayak app asli
        icons: [
          {
            src: '192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
