import seoConfig from './seo.config.json';

/**
 * vite-plugin-seo
 * Injects environment-driven SEO <head> tags into index.html during BOTH
 * `vite build` and `vite dev`.
 *
 * Always emitted (the SPA serves one HTML shell, so these describe the site
 * root): <link rel="canonical">, <meta property="og:url"> and the schema.org
 * JSON-LD block. The origin comes from SITE_URL, else the shared
 * `seo.config.json` `siteUrl` — so a build never ships a relative or
 * placeholder URL.
 *
 * Emitted only when the matching env var is present and non-empty, so an unset
 * variable never leaves a literal %VITE_…% token in the served HTML:
 *   VITE_GA_MEASUREMENT_ID        -> Google Analytics 4 (gtag.js)
 *   VITE_GOOGLE_SITE_VERIFICATION -> Google Search Console token
 *   VITE_BING_SITE_VERIFICATION   -> Bing Webmaster Tools token
 *
 * Env vars are read from vite's loadEnv() result first (see vite.config.js,
 * which loads ALL vars, not just VITE_*), then from process.env, so production
 * builds on Render (dashboard secrets, no committed .env) still work.
 */
// Static brand facts — kept in sync with src/constants/siteBrand.js and the
// <head> tags in index.html.
const SITE_NAME = 'The Greggory Systems And Strategy Firm';
const SITE_DESCRIPTION =
  'The Greggory Systems And Strategy Firm \u2014 strategic systems engineering and business consultancy across every industry. Develop, maintain, upgrade, and stand behind the projects and platforms clients depend on.';
const SITE_TAGLINE = 'Strategic Systems \u00b7 Practical Strategy \u00b7 Lasting Confidence';
const LOGO_PATH = '/favicon-256.png';
// NOTE: public/hero-phoenix.png is a byte-identical copy of a JPEG (magic
// FFD8, 1324x783) — scrapers sniff MIME, so an og:image ending in .png that
// serves JPEG bytes (as image/png via extension sniffing) can fail to unfurl.
// Point social tags at the real .jpg and advertise its true dimensions.
const HERO_IMAGE = '/hero-phoenix.jpg';
const HERO_IMAGE_TYPE = 'image/jpeg';
const HERO_IMAGE_WIDTH = '1324';
const HERO_IMAGE_HEIGHT = '783';
const HERO_IMAGE_ALT = 'The Greggory Systems And Strategy Firm — phoenix rising';
const PHONE = '+254115525854';
const EMAIL = 'thegreggorysystemsandstrategyf@gmail.com';
const SAME_AS = [
  'https://www.facebook.com/profile.php?id=61592873906248',
  'https://www.instagram.com/thegfltd',
  'https://vm.tiktok.com/ZS9hSNrJ1jrSP-RtR7u/',
];

// Fallback origin when SITE_URL is unset, so canonical / og:url / JSON-LD are
// always absolute. Change `siteUrl` in seo.config.json (or set SITE_URL) when
// the deployed host changes — scripts/generate-sitemap.js reads the same value.
const DEFAULT_SITE_URL = String(seoConfig.siteUrl || '').replace(/\/+$/, '');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Resolve a value from the loadEnv() result, falling back to process.env so
// production builds on Render (dashboard secrets, no committed .env) still work.
function envOf(env, key) {
  const v = env && env[key] != null ? env[key] : process.env[key];
  if (v == null) return '';
  return String(v).trim();
}

function ga4Script(measurementId) {
  // Only a well-formed GA4 id (G-XXXXXXXXXX) is trusted. This guards against an
  // empty value or a stray %VITE_GA_MEASUREMENT_ID% literal leftover.
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return '';
  const id = escapeHtml(measurementId);
  return [
    '  <!-- Google Analytics 4 (env: VITE_GA_MEASUREMENT_ID) -->',
    '  <script>',
    '    window.dataLayer = window.dataLayer || [];',
    '    function gtag(){ window.dataLayer.push(arguments); }',
    '    window.gtag = gtag;',
    "    gtag('js', new Date());",
    "    gtag('config', '" + id + "', { 'send_page_view': true, 'cookie_domain': 'auto', 'cookie_expires': 63072000 });",
    "    (function(){ var s=document.createElement('script'); s.src='https://www.googletagmanager.com/gtag/js?id=" + id + "'; s.async=true; s.onload=function(){ if(window.gtag) window.gtag('config','" + id + "'); }; document.head.appendChild(s); })();",
    '  </script>',
  ].join('\n');
}

function jsonLd(siteUrl) {
  const fullUrl = (siteUrl || '').replace(/\/+$/, '') || '';
  const logo = fullUrl ? fullUrl + LOGO_PATH : LOGO_PATH;
  const json = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE_NAME,
    url: fullUrl ? fullUrl + '/' : '',
    description: SITE_DESCRIPTION,
    logo: logo,
    image: fullUrl ? fullUrl + HERO_IMAGE : HERO_IMAGE,
    slogan: SITE_TAGLINE,
    telephone: PHONE,
    email: EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'RAFIKI KABARAK',
      addressLocality: 'KABARAK',
      addressRegion: 'KABARAK',
      addressCountry: 'KE',
    },
    sameAs: SAME_AS,
    contactPoints: [
      {
        '@type': 'ContactPoint',
        telephone: PHONE,
        email: EMAIL,
        contactType: 'customer service',
        areaServed: 'KE',
        availableLanguage: ['English', 'Swahili'],
      },
    ],
  };
    // </ sequences inside the JSON would close the <script> block; escape them.
  return (
    '  <!-- Organization structured data (schema.org) -->\n' +
    '  <script type="application/ld+json">\n' +
    JSON.stringify(json, null, 2).replace(/</g, '\\u003c') +
    '\n  </script>'
  );
}

/**
 * @param {Record<string, string>} [env]  result of vite's loadEnv(); each tag
 *     is looked up on this object first, then on process.env.
 */
export default function vitePluginSeo(env = {}) {
  return {
    name: 'vite-plugin-seo',
    enforce: 'pre',
    transformIndexHtml(html) {
      const tags = [];

      // SITE_URL wins; otherwise the shared seo.config.json default keeps
      // canonical / og:url / JSON-LD absolute in every build.
      const configured = envOf(env, 'SITE_URL') || envOf(env, 'VITE_SITE_URL');
      const cleanUrl = (configured || DEFAULT_SITE_URL).replace(/\/+$/, '');

      // Canonical + og:url. The SPA renders one HTML shell for every route, so
      // both point at the site root: crawlers still learn the canonical origin
      // instead of indexing nothing (or a relative, per-route duplicate).
      if (cleanUrl) {
        tags.push('  <link rel="canonical" href="' + escapeHtml(cleanUrl) + '/">');
        tags.push('  <meta property="og:url" content="' + escapeHtml(cleanUrl) + '/">');
      }

      // Social-share image: absolute when the origin is known, relative only as
      // a last resort. Scrapers (Facebook, LinkedIn, WhatsApp, X) ignore
      // relative image URLs — a link to the site would unfurl with no image.
      const heroImage = cleanUrl ? cleanUrl + HERO_IMAGE : HERO_IMAGE;
      tags.push('  <meta property="og:image" content="' + escapeHtml(heroImage) + '">');
      tags.push('  <meta property="og:image:secure_url" content="' + escapeHtml(heroImage) + '">');
      tags.push('  <meta property="og:image:type" content="' + HERO_IMAGE_TYPE + '">');
      tags.push('  <meta property="og:image:width" content="' + HERO_IMAGE_WIDTH + '">');
      tags.push('  <meta property="og:image:height" content="' + HERO_IMAGE_HEIGHT + '">');
      tags.push('  <meta property="og:image:alt" content="' + escapeHtml(HERO_IMAGE_ALT) + '">');
      tags.push('  <meta name="twitter:image" content="' + escapeHtml(heroImage) + '">');
      tags.push('  <meta name="twitter:image:alt" content="' + escapeHtml(HERO_IMAGE_ALT) + '">');

      // Google Search Console ownership verification.
      const gsc =
        envOf(env, 'VITE_GOOGLE_SITE_VERIFICATION') ||
        envOf(env, 'GOOGLE_SITE_VERIFICATION');
      if (gsc) {
        tags.push('  <meta name="google-site-verification" content="' + escapeHtml(gsc) + '">');
      }

      // Bing Webmaster Tools ownership verification.
      const bing =
        envOf(env, 'VITE_BING_SITE_VERIFICATION') ||
        envOf(env, 'BING_SITE_VERIFICATION');
      if (bing) {
        tags.push('  <meta name="msvalidate.1" content="' + escapeHtml(bing) + '">');
      }

      // Google Analytics 4.
      const ga = envOf(env, 'VITE_GA_MEASUREMENT_ID') || envOf(env, 'GA_MEASUREMENT_ID');
      const gaBlock = ga4Script(ga);
      if (gaBlock) tags.push(gaBlock);

      // JSON-LD structured data (always emitted; static facts + dynamic URL).
      tags.push(jsonLd(cleanUrl));

      if (tags.length === 0) return html;

      const block = [
        '',
        '<!-- SEO: injected by vite-plugin-seo (clean when env vars unset) -->',
        ...tags,
        '<!-- /SEO -->',
        '',
      ].join('\n');

      const marker = '</head>';
      const idx = html.lastIndexOf(marker);
      if (idx === -1) return html + block;
      return html.slice(0, idx) + block + '\n' + html.slice(idx);
    },
  };
}
