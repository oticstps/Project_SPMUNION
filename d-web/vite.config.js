import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // target: 'https://trial.pasbatron.net',
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false, // abaikan jika sertifikat SSL tidak valid
      }
    }
  }
})