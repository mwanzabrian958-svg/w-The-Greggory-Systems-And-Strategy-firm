import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginSeo from './vite-plugin-seo.js'

export default defineConfig(({ mode }) => {
  // '' as the prefix loads EVERY var from .env (SITE_URL as well as the
  // VITE_-prefixed GA / site-verification tokens) for the SEO plugin below.
  // Vite only auto-exposes VITE_* vars, so SITE_URL has to be read explicitly.
  // On Render there is no .env — the plugin then falls back to process.env.
  const env = loadEnv(mode, process.cwd(), '')

  // Build-time variables are BAKED INTO THE BUNDLE here, so a missing value ships
  // a silently broken production build: with no client id the Google Sign-In
  // button hides itself (measured: absent from all 30 deployed assets) and no
  // dashboard restart can fix it — only a rebuild can. Warn loudly and early.
  const buildTimeGaps = [
    ['VITE_GOOGLE_CLIENT_ID', 'Google Sign-In button stays hidden'],
    ['SITE_URL', 'sitemap / robots / canonical tags fall back to a placeholder'],
  ].filter(([key]) => !env[key]);
  if (buildTimeGaps.length) {
    console.warn('\n[build] Missing build-time variables — this bundle ships without them:');
    for (const [key, effect] of buildTimeGaps) {
      console.warn(`[build]   ${key} — ${effect}`);
    }
    console.warn('[build] Set them in the deploy platform environment, then REDEPLOY');
    console.warn('[build] (restarting the service will NOT pick them up).\n');
  }

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
