import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Generate .gz and .br assets automatically
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Generate a bundle analysis chart at dist/stats.html (dev-only compile)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
    })
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild', // Faster & highly optimized minification
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Code-splitting vendor packages (React, Lucide) from app components
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('lucide')) {
              return 'vendor-icons';
            }
            return 'vendor-others';
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/api-resend': {
        target: 'https://api.resend.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-resend/, '')
      }
    }
  }
})
