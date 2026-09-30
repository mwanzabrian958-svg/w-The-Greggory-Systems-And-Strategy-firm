/**
 * generate-sitemap.js
 * -------------------
 * Builds the crawler files at BUILD time from one source of truth —
 * `seo.config.json` (the same file vite-plugin-seo.js reads) plus the origin
 * resolved from, in order, SITE_URL -> VITE_SITE_URL -> RENDER_EXTERNAL_URL
 * (set automatically by Render, so a blank SITE_URL still publishes the real
 * host) -> seo.config.json `siteUrl`:
 *     public/sitemap.xml — every public route, so Google/Bing/Ahrefs/
 *                          Screaming Frog/Moz discover the content
 *     public/robots.txt  — Allow: / for public pages, Disallow: for the
 *                          authenticated areas, and the `Sitemap:` pointer
 *
 * Wired into `package.json` as the first step of `build`, so every production
 * deploy publishes files whose URLs point at the real domain (both the Render
 * blueprint and the Dockerfile run `npm run build`):
 *     "build": "node scripts/generate-sitemap.js && vite build"
 *
 * That build step OVERWRITES the committed public/ files — which is why the
 * fallback chain has to end at a real origin. It used to end at
 * http://localhost:5173, so a deploy with SITE_URL unset shipped a sitemap full
 * of localhost <loc> entries and a localhost canonical: valid-looking files
 * describing a host no crawler can reach. `npm run generate-sitemap` prints the
 * origin it chose and warns on a dev origin or a Render-host mismatch.
 *
 * Customisation: add/remove routes in seo.config.json (or extend this script to
 * fetch dynamic routes, e.g. published blog slugs via the API).
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Shared with vite-plugin-seo.js so canonical/og:url/JSON-LD and the sitemap
// can never drift apart.
const SEO_CONFIG = require('../seo.config.json');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Authenticated / private areas: never listed in the sitemap and explicitly
// disallowed in robots.txt — crawling a login screen only wastes crawl budget.
const DISALLOWED_PREFIXES = ['/admin', '/portal', '/dashboard', '/api/'];

// The origin Render gives every service for free (no dashboard entry needed).
// Absent on local dev, where seo.config.json's `siteUrl` takes over.
function renderExternalUrl() {
  const direct = String(process.env.RENDER_EXTERNAL_URL || '').trim();
  if (direct) return direct;
  const host = String(process.env.RENDER_EXTERNAL_HOSTNAME || '').trim();
  return host ? 'https://' + host : '';
}

// Precedence — identical in vite-plugin-seo.js so the sitemap and the
// canonical/og:url tags can never disagree:
//   SITE_URL -> VITE_SITE_URL -> RENDER_EXTERNAL_URL -> seo.config.json
// SITE_URL first: an explicit value always wins over a platform default.
function resolveSiteUrl() {
  const candidates = [
    ['SITE_URL', String(process.env.SITE_URL || '').trim()],
    ['VITE_SITE_URL', String(process.env.VITE_SITE_URL || '').trim()],
    ['RENDER_EXTERNAL_URL/HOSTNAME', renderExternalUrl()],
    ['seo.config.json', String(SEO_CONFIG.siteUrl || '').trim()],
  ];
  const chosen = candidates.find(([, value]) => value) || ['', ''];
  return { url: normalizeOrigin(chosen[1]), source: chosen[0] };
}

// A bare hostname (RENDER_EXTERNAL_HOSTNAME, or a SITE_URL pasted without a
// scheme) still has to produce absolute crawler URLs.
function normalizeOrigin(raw) {
  let value = String(raw || '').trim();
  if (!value) return '';
  if (!/^https?:\/\//i.test(value)) value = 'https://' + value.replace(/^\/+/, '');
  return value.replace(/\/+$/, '');
}

// Localhost/127.0.0.1 can never be a crawlable origin.
function isDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?($|\/)/i.test(origin);
}

function publicRoutes() {
  return Array.isArray(SEO_CONFIG.routes) ? SEO_CONFIG.routes : [];
}

// '/' keeps its trailing slash; every other route is appended as-is. An
// absolute value in seo.config.json is used verbatim.
function url(siteUrl, routePath) {
  if (/^https?:\/\//i.test(routePath)) return routePath;
  const suffix = routePath.startsWith('/') ? routePath : '/' + routePath;
  return siteUrl + suffix;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSitemap(siteUrl) {
  const now = new Date().toISOString().slice(0, 10);
  const locs = publicRoutes().map((route) => {
    const loc = url(siteUrl, route.path);
    return [
      '  <url>',
      '    <loc>' + escapeXml(loc) + '</loc>',
      '    <lastmod>' + now + '</lastmod>',
      '    <changefreq>' + escapeXml(route.changefreq || 'monthly') + '</changefreq>',
      '    <priority>' + escapeXml(route.priority || '0.8') + '</priority>',
      '  </url>',
    ].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...locs,
    '</urlset>',
    '',
  ].join('\n');
}

function buildRobots(siteUrl) {
  const host = siteUrl.replace(/^https?:\/\//, '');
  return [
    '# ==============================================================',
    '# robots.txt — The Greggory Systems And Strategy Firm',
    '# Instructs crawlers (Google, Bing, Ahrefs, Screaming Frog, Moz, etc.)',
    '# on which URLs to index and where to find the sitemap.',
    '# GENERATED by scripts/generate-sitemap.js — edit seo.config.json instead.',
    '# Served from /robots.txt by Express (public/ -> dist/).',
    '# ==============================================================',
    'User-agent: *',
    '# Allow all public pages to be crawled and indexed.',
    '# The private/admin areas below sit behind auth (they return a login page or',
    '# 401) and are deliberately kept out of the sitemap as well.',
    'Allow: /',
    ...DISALLOWED_PREFIXES.map((prefix) => 'Disallow: ' + prefix),
    '',
    '# Sitemap — lists every public route so crawlers discover content.',
    'Sitemap: ' + siteUrl + '/sitemap.xml',
    '',
    '# Host directive (Bing respects this; informs crawlers of the preferred host).',
    'Host: ' + host,
    '',
  ].join('\n');
}

function write(fileName, content) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const outPath = path.join(PUBLIC_DIR, fileName);
  fs.writeFileSync(outPath, content, 'utf8');
  console.log('[seo] wrote', outPath);
}

function main() {
  const { url: siteUrl, source } = resolveSiteUrl();
  if (!siteUrl) {
    console.error('[seo] no site URL — set SITE_URL or seo.config.json "siteUrl"');
    process.exit(1);
  }
  console.log('[seo] siteUrl = ' + siteUrl + '  (from ' + source + ')');
  if (isDevOrigin(siteUrl)) {
    // Loud, because it is silent to Google: a localhost <loc> list and a
    // localhost canonical are both valid-looking files that just describe
    // nobody. This is exactly how the live sitemap shipped localhost URLs.
    console.warn('[seo] WARNING: "' + siteUrl + '" is a dev origin — the published sitemap/robots will not be crawlable. Set SITE_URL (or fix seo.config.json "siteUrl").');
  }
  const renderUrl = normalizeOrigin(renderExternalUrl());
  if (renderUrl && renderUrl !== siteUrl) {
    console.warn('[seo] WARNING: this build is running on Render at ' + renderUrl + ' but publishing ' + siteUrl + ' — an explicit SITE_URL is overriding the real host. Fix it or delete it.');
  }
  write('sitemap.xml', buildSitemap(siteUrl));
  write('robots.txt', buildRobots(siteUrl));
  console.log('[seo] ' + publicRoutes().length + ' public URLs, siteUrl=' + siteUrl);
}

main();
