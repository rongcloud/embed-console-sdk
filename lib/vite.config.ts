import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../package',
    lib: {
      entry: ['src/embed.ts'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      name: 'RC',
    }
  }
})
