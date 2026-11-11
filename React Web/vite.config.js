import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Two pages: index.html is the marketing landing page (plain HTML and CSS) and store/index.html is the React store.
// In development Vite serves them on :5173 and forwards /api to the Node server on :3000.
// In production the Node server serves the built files from dist/ itself.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { landing: resolve(import.meta.dirname, 'index.html'), store: resolve(import.meta.dirname, 'store/index.html') },
    },
  },
  server: { proxy: { '/api': 'http://localhost:3000' } },
})
