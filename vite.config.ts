import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seoPlugin } from './scripts/seoPlugin.ts'

export default defineConfig({
  plugins: [react(), seoPlugin()],
})
