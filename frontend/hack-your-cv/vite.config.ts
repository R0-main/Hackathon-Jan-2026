import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['localhost', 'hackathon-jan-2026-frontend.onrender.com', 'hackyourcv.fr']
  }
})
