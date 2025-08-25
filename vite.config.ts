import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ✅ Deixe APENAS este export default no arquivo
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 8080,
  },
  preview: {
    port: 8080,
  },
  // Para deploy padrão (Vercel/Netlify), mantenha "/"
  base: '/',
})
