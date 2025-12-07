import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    base: './', // Caminho relativo para funcionar no GitHub Pages
    define: {
      // Garante que o process.env.API_KEY usado no código funcione no build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})