import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // CONFIGURAZIONE PROXY (Rif: Parte 3.pdf) 
  // Reindirizza tutte le chiamate che iniziano con '/api' verso il server effettivo [cite: 233, 247]
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Inserire qui la porta del vostro server effettivo [cite: 248]
        changeOrigin: true,
        secure: false,                    // Disattiva la verifica HTTPS (in locale lavoriamo in HTTP)
        cookieDomainRewrite: 'localhost'  // Riscrive il dominio del cookie così il browser lo accetta correttamente
      }
    }
  }
})