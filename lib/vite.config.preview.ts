import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// @ts-ignore
const base = process.env.NODE_ENV === 'production' ? 'https://rongcloud.github.io/embed-console-sdk/' : '/'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    outDir: '../docs',
  }
})
