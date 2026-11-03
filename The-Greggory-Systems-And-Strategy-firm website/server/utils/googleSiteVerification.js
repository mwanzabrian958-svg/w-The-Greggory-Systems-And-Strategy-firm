function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function injectGoogleSiteVerification(html, token) {
  const value = String(token || '').trim();
  if (!value) return html;

  const tag = `<meta name="google-site-verification" content="${escapeHtml(value)}">`;
  const withoutExistingTags = html.replace(
    /<meta\b(?=[^>]*\bname=["']google-site-verification["'])[^>]*>\s*/gi,
    ''
  );
  const headEnd = /<\/head>/i;
  if (!headEnd.test(withoutExistingTags)) {
    throw new Error('Cannot add Google Search Console verification: HTML head is missing.');
  }
  return withoutExistingTags.replace(headEnd, `${tag}\n</head>`);
}

module.exports = { injectGoogleSiteVerification };
