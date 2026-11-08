import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development Vite serves the React app on :5173 and forwards /api to the Node server on :3000.
// In production the Node server serves the built files from dist/ itself.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3000' } },
})
