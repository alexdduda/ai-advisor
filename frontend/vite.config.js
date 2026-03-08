import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Never emit source maps in production builds
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Strip all console.log/debug/info in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown': ['react-markdown', 'remark-gfm'],
        }
      }
    }
  }
})
