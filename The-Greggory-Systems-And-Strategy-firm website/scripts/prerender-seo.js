const fs = require('node:fs');
const path = require('node:path');
const seoConfig = require('../seo.config.json');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SITE_NAME = 'The Greggory Systems And Strategy Firm';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replaceRequired(html, pattern, replacement, description) {
  if (!pattern.test(html)) {
    throw new Error(`Cannot generate route SEO HTML: missing ${description}.`);
  }
  return html.replace(pattern, replacement);
}

function replaceMeta(html, attribute, key, content) {
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${escapedAttribute}\\s*=\\s*["']${escapedKey}["'])[^>]*>`,
    'i'
  );
  const replacement = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`;
  return replaceRequired(html, pattern, replacement, `${attribute}=${key}`);
}

function normalizeRoutePath(routePath) {
  if (routePath === '/') return '/';
  if (typeof routePath !== 'string' || !routePath.startsWith('/')) {
    throw new Error(`Invalid SEO route path: ${routePath}`);
  }
  const segments = routePath.split('/').filter(Boolean);
  if (!segments.length || segments.some((segment) => !/^[A-Za-z0-9._~-]+$/.test(segment) || segment === '.' || segment === '..')) {
    throw new Error(`Invalid SEO route path: ${routePath}`);
  }
  return `/${segments.join('/')}`;
}

function renderSeoHtml(template, route, siteOrigin) {
  const routePath = normalizeRoutePath(route.path);
  if (!route.title || !route.description) {
    throw new Error(`SEO route ${routePath} must define a title and description.`);
  }

  const title = `${route.title} | ${SITE_NAME}`;
  const canonical = `${siteOrigin}${routePath === '/' ? '/' : routePath}`;
  let html = replaceRequired(
    template,
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(title)}</title>`,
    'title'
  );
  html = replaceMeta(html, 'name', 'description', route.description);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', route.description);
  html = replaceMeta(html, 'property', 'og:url', canonical);
  html = replaceMeta(html, 'name', 'twitter:title', title);
  html = replaceMeta(html, 'name', 'twitter:description', route.description);
  html = replaceRequired(
    html,
    /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    'canonical link'
  );
  return html;
}

function outputPathForRoute(routePath) {
  const normalizedPath = normalizeRoutePath(routePath);
  if (normalizedPath === '/') return path.join(DIST_DIR, 'index.html');

  const outputPath = path.resolve(DIST_DIR, ...normalizedPath.slice(1).split('/'), 'index.html');
  const distPrefix = `${path.resolve(DIST_DIR)}${path.sep}`;
  if (!outputPath.startsWith(distPrefix)) {
    throw new Error(`SEO route resolves outside the build directory: ${routePath}`);
  }
  return outputPath;
}

function main() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Production index.html is missing; run the Vite build before prerendering SEO metadata.');
  }

  const template = fs.readFileSync(indexPath, 'utf8');
  const canonical = template.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/i);
  if (!canonical) throw new Error('The production index.html is missing its canonical link.');
  const siteOrigin = new URL(canonical[1]).origin;

  for (const route of seoConfig.routes) {
    const outputPath = outputPathForRoute(route.path);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, renderSeoHtml(template, route, siteOrigin), 'utf8');
    console.log(`[seo] prerendered metadata for ${route.path}`);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('[seo] prerender failed:', error.message);
    process.exitCode = 1;
  }
}

module.exports = { normalizeRoutePath, outputPathForRoute, renderSeoHtml };
