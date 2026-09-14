import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginSeo from './vite-plugin-seo.js'

export default defineConfig(({ mode }) => {
  // '' as the prefix loads EVERY var from .env (SITE_URL as well as the
  // VITE_-prefixed GA / site-verification tokens) for the SEO plugin below.
  // Vite only auto-exposes VITE_* vars, so SITE_URL has to be read explicitly.
  // On Render there is no .env — the plugin then falls back to process.env.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vitePluginSeo(env), react()],
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
      // Mirror the dev proxy so `vite preview` (production bundle) can reach the
      // backend too — enables full-stack UI smoke tests against built assets.
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
