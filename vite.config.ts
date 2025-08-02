import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: 3000
  },
  base: process.env.NODE_ENV === 'production' ? '/nyanko-sushi-catch/' : './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}) 