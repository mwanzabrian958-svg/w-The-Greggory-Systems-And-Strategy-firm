import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('@supabase')) return 'supabase';
          return 'vendor';
        }
      }
    }
  },
  server: {
    port: 5173,
    open: false,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        // IPv4 explicit: the backend binds 0.0.0.0 only, and Node >=17 can
        // resolve 'localhost' to ::1 first, causing random ECONNREFUSED.
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 4173,
    open: false,
    host: true,
  }
})
