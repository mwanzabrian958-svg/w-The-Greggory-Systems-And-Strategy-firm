const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { normalizeRoutePath, outputPathForRoute, renderSeoHtml } = require('../../scripts/prerender-seo');

const template = [
  '<html><head>',
  '<meta name="description" content="Home description">',
  '<title>Home title</title>',
  '<meta property="og:title" content="Home title">',
  '<meta property="og:description" content="Home description">',
  '<meta property="og:url" content="https://example.com/">',
  '<meta name="twitter:title" content="Home title">',
  '<meta name="twitter:description" content="Home description">',
  '<link rel="canonical" href="https://example.com/">',
  '</head><body><div id="root"></div></body></html>',
].join('\n');

test('route SEO snapshot uses page-specific titles, descriptions, and canonical URLs', () => {
  const html = renderSeoHtml(
    template,
    {
      path: '/case-studies',
      title: 'Case Studies — Delivery Results',
      description: 'Results & measurable impact.',
    },
    'https://example.com'
  );

  assert.match(html, /<title>Case Studies — Delivery Results \| The Greggory Systems And Strategy Firm<\/title>/);
  assert.match(html, /name="description" content="Results &amp; measurable impact\."/);
  assert.match(html, /property="og:title" content="Case Studies — Delivery Results \| The Greggory Systems And Strategy Firm"/);
  assert.match(html, /property="og:description" content="Results &amp; measurable impact\."/);
  assert.match(html, /property="og:url" content="https:\/\/example\.com\/case-studies"/);
  assert.match(html, /name="twitter:title" content="Case Studies — Delivery Results \| The Greggory Systems And Strategy Firm"/);
  assert.match(html, /name="twitter:description" content="Results &amp; measurable impact\."/);
  assert.match(html, /rel="canonical" href="https:\/\/example\.com\/case-studies"/);
  assert.match(html, /<div id="root"><\/div>/);
});

test('SEO snapshot routes cannot escape the built output directory', () => {
  assert.equal(normalizeRoutePath('/about/'), '/about');
  assert.throws(() => normalizeRoutePath('/../secret'), /Invalid SEO route path/);
  assert.equal(
    outputPathForRoute('/about'),
    path.join(__dirname, '..', '..', 'dist', 'about', 'index.html')
  );
});
