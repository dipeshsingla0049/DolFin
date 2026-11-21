import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const backend = process.env.BACKEND_URL || 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': backend,
      '/dashboard': backend,
      '/stocks': backend,
    },
  },
})
