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
  // CONFIGURAZIONE PROXY 
  // Reindirizza tutte le chiamate che iniziano con '/api' verso il server effettivo 
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Inserire qui la porta del vostro server effettivo 
        changeOrigin: true,
        secure: false,                    // Disattiva la verifica HTTPS 
        cookieDomainRewrite: 'localhost'  // Riscrive il dominio del cookie così il browser lo accetta correttamente
      }
    }
  }
})
