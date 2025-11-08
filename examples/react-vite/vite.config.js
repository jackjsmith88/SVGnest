import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@svgnest/core': path.resolve(__dirname, '../../src/index.js')
    }
  },
  server: {
    port: 3000
  }
})
