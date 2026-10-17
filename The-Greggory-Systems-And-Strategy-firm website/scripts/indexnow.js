/**
 * indexnow.js
 * -----------
 * Pings the IndexNow API (https://www.indexnow.org) so supporting search
 * engines re-crawl the site right after a deploy. IndexNow is consumed by
 * **Bing, Yandex, Seznam, Naver** and other participating engines — it is NOT
 * used by Google (Google is covered separately via Search Console + the
 * google094331f0615c2ec2.html verification file).
 *
 * How IndexNow works (all three parts must line up):
 *   1. A KEY FILE is published at the site root:
 *        https://<origin>/<key>.txt   ->  the key string, nothing else
 *      (public/<key>.txt is served by Express; committed so it is stable
 *       across deploys — the key MUST stay the same, or engines reject it.
 *       The file MUST be named exactly <key>.txt — never indexnow-key.txt.)
 *   2. This script POSTs a JSON payload to https://api.indexnow.org/indexnow:
 *        { host, key, keyLocation, urlList }
 *   3. Each engine fetches keyLocation to confirm we own the host, then
 *      schedules the submitted URLs for re-crawl.
 *
 * Usage:
 *   node scripts/indexnow.js              # submit every public route from the sitemap
 *   node scripts/indexnow.js <url> <url>  # submit only the given URL(s)
 *
 * NEVER hard-fails the build: a ping that fails (offline, rate-limited) only
 * slows discovery down; it must not redden a deploy. Exit 0 always.
 *
 * The origin is resolved EXACTLY like scripts/generate-sitemap.js so the
 * submitted host can never disagree with the sitemap/canonical:
 *   SITE_URL -> VITE_SITE_URL -> RENDER_EXTERNAL_URL/HOSTNAME -> seo.config.json
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SEO_CONFIG = require('../seo.config.json');

// The key is a plain 32-char hex string. It lives in public/<key>.txt (the
// SAME file that is published to the site root), so the submitted key and the
// hosted key can never drift apart. The filename MUST equal <key>.txt.
const INDEXNOW_KEY = '32c66ce0bcd6419297c8841e944d4875';
const KEY_FILE = path.join(__dirname, '..', 'public', INDEXNOW_KEY + '.txt');
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

function renderExternalUrl() {
  const direct = String(process.env.RENDER_EXTERNAL_URL || '').trim();
  if (direct) return direct;
  const host = String(process.env.RENDER_EXTERNAL_HOSTNAME || '').trim();
  return host ? 'https://' + host : '';
}

function normalizeOrigin(raw) {
  let value = String(raw || '').trim();
  if (!value) return '';
  if (!/^https?:\/\//i.test(value)) value = 'https://' + value.replace(/^\/+/, '');
  return value.replace(/\/+$/, '');
}

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

function isDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?($|\/)/i.test(origin);
}

// The key is a plain 32-char hex string. Read from the SAME file that is
// published to the site root, so the submitted key and the hosted key can
// never drift apart. Falls back to the constant so local runs without the
// file still submit the correct, stable key.
function readKey() {
  if (!fs.existsSync(KEY_FILE)) {
    console.warn('[indexnow] key file missing at public/' + INDEXNOW_KEY + '.txt — using built-in key.');
    return INDEXNOW_KEY;
  }
  return fs.readFileSync(KEY_FILE, 'utf8').trim();
}

// URLs to submit: CLI args if given, otherwise every route in the published
// sitemap.xml (the authoritative list of crawlable pages).
function collectUrls(siteUrl, cliArgs) {
  if (cliArgs.length) {
    return cliArgs.map((u) => String(u).trim()).filter(Boolean);
  }
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    // Fall back to the config routes directly if the sitemap isn't generated yet.
    const routes = Array.isArray(SEO_CONFIG.routes) ? SEO_CONFIG.routes : [];
    return routes.map((r) => {
      const p = r.path.startsWith('/') ? r.path : '/' + r.path;
      return siteUrl + p;
    });
  }
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  return matches
    .map((m) => m.replace(/<\/?loc>/g, '').trim())
    .filter(Boolean);
}

async function submit(siteUrl, key, urls) {
  const payload = {
    host: siteUrl.replace(/^https?:\/\//, ''),
    key,
    keyLocation: siteUrl + '/' + key + '.txt',
    urlList: urls,
  };
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  // 200/202 = accepted. Anything else is worth surfacing but not fatal.
  if (res.ok || res.status === 202) {
    console.log(`[indexnow] submitted ${urls.length} URL(s) — HTTP ${res.status}`);
  } else {
    console.warn(`[indexnow] engines rejected the ping — HTTP ${res.status} ${res.statusText}`);
  }
}

async function main(cliArgs) {
  const key = readKey();
  if (!key) return;
  const { url: siteUrl, source } = resolveSiteUrl();
  if (!siteUrl) {
    console.warn('[indexnow] no site URL resolved — skipping.');
    return;
  }
  if (isDevOrigin(siteUrl)) {
    console.warn(`[indexnow] "${siteUrl}" is a dev origin — skipping ping (engines can't reach localhost).`);
    return;
  }
  const urls = collectUrls(siteUrl, cliArgs);
  if (!urls.length) {
    console.warn('[indexnow] no URLs to submit — skipping.');
    return;
  }
  console.log(`[indexnow] siteUrl=${siteUrl} (from ${source}), key=${key.slice(0, 8)}…, ${urls.length} URL(s)`);
  try {
    await submit(siteUrl, key, urls);
  } catch (err) {
    // Offline / DNS / timeout — informational only, never fails the build.
    console.warn('[indexnow] ping failed (non-fatal):', err.message);
  }
}

main(process.argv.slice(2));
