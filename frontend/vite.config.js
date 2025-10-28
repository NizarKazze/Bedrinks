import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/backend': {
        target: 'http://localhost/Bedrinks', // tu backend remoto real
        changeOrigin: true,
        secure: false, // opcional, útil si el backend usa HTTPS con certificado no válido
        rewrite: (path) => path.replace(/^\/backend/, '/backend'),
      },
    },
  },
})

