import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' lets the built site run from any sub-folder or static host.
// The app uses hash routing (#/shop), so no server rewrite rules are needed.
export default defineConfig({
  base: './',
  plugins: [react()],
})
