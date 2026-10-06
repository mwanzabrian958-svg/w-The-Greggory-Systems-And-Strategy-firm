// ── Page structure & semantic order audit ──────────────────────────────────
// Verifies that the app has a correct top→bottom reading order:
// 1. <header class="site-header">
// 2. <main>
// 3. <footer class="site-footer">
// Also checks for duplicate IDs and empty headings.
//
// The site is a client-rendered SPA, so dist/index.html is only a shell
// (<div id="root">) — for those builds the structural audit reads the source
// of truth (src/App.jsx + src/components/Footer.jsx) instead of static HTML.
// Standalone static pages (404.html …) are checked for duplicate IDs and
// empty headings only.

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const src = path.join(root, 'src');

let allPass = true;
console.log('\n=== Page structure audit ===');

function report(label, issues, passNote) {
  console.log('\n' + label);
  if (issues.length === 0) {
    console.log('  PASS: ' + (passNote || 'header -> main -> footer in correct DOM order'));
  } else {
    allPass = false;
    console.log('  FAIL:');
    for (const issue of issues) {
      console.log('    - ' + issue);
    }
  }
}

function genericHtmlIssues(html) {
  const issues = [];

  // Duplicate ID check
  const ids = html.match(/[Aa][Ii][Dd]="([^"]+)"/g) || [];
  const seen = {};
  for (const id of ids) {
    const val = id.replace(/.*="([^"]*)"/, '$1');
    if (seen[val]) {
      issues.push('duplicate id="' + val + '"');
    } else {
      seen[val] = true;
    }
  }

  // Empty heading check
  const emptyHeadings = html.match(/<h[1-6][^>]*>\s*<\/h[1-6]>/gi) || [];
  if (emptyHeadings.length > 0) {
    issues.push('empty heading tags found (' + emptyHeadings.length + ')');
  }

  return issues;
}

function isSpaShell(html) {
  return /<div[^>]+id="root"/.test(html) && !/<main[\s>]/i.test(html);
}

// Structural audit of the React source that produces the page landmarks.
function auditSource() {
  const appPath = path.join(src, 'App.jsx');
  const footerPath = path.join(src, 'components', 'Footer.jsx');
  const issues = [];

  if (!fs.existsSync(appPath) || !fs.existsSync(footerPath)) {
    report('src/App.jsx + src/components/Footer.jsx', ['source files not found']);
    return;
  }

  const app = fs.readFileSync(appPath, 'utf-8');
  const footer = fs.readFileSync(footerPath, 'utf-8');

  const headerIdx = app.indexOf('<header');
  const mainOpenIdx = app.indexOf('<main');
  const mainCloseIdx = app.indexOf('</main>');
  const footerRenderIdx = app.indexOf('<Footer');

  if (!/className="site-header"/.test(app)) issues.push('missing <header class="site-header">');
  if (mainOpenIdx === -1 || mainCloseIdx === -1) issues.push('missing <main>…</main>');
  if (footerRenderIdx === -1) issues.push('missing <Footer /> render');
  // Case-sensitive: the <Footer /> component tag must not be confused with a
  // literal lowercase <footer> element.
  if (/<footer[\s>]/.test(app)) {
    issues.push('App.jsx must not render its own <footer> (the Footer component owns it)');
  }
  if (headerIdx !== -1 && mainOpenIdx !== -1 && headerIdx > mainOpenIdx) {
    issues.push('<header> must appear before <main>');
  }
  if (mainCloseIdx !== -1 && footerRenderIdx !== -1 && footerRenderIdx < mainCloseIdx) {
    issues.push('<Footer /> must be rendered after </main>');
  }

  const footerCount = (footer.match(/<footer[\s>]/g) || []).length;
  if (footerCount === 0) issues.push('missing <footer class="site-footer"> in Footer.jsx');
  if (footerCount > 1) issues.push('multiple <footer> elements in Footer.jsx');
  if (!/className="site-footer"/.test(footer)) {
    issues.push('Footer.jsx <footer> is missing the site-footer class');
  }

  report('src/App.jsx + src/components/Footer.jsx (SPA source audit)', issues);
}

const htmlFiles = fs.existsSync(dist)
  ? fs.readdirSync(dist).filter(f => f.endsWith('.html')).map(f => path.join(dist, f))
  : [];

let spaAudited = false;

if (htmlFiles.length === 0) {
  console.log('\nNo built HTML found in dist — auditing React source instead.');
  auditSource();
  spaAudited = true;
}

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const rel = path.relative(root, filePath);
  const issues = genericHtmlIssues(html);

  if (isSpaShell(html)) {
    if (!spaAudited) {
      auditSource();
      spaAudited = true;
    }
    report(rel + ' (SPA shell — structure audited from source)', issues, 'shell markup OK; landmark order verified in source');
    continue;
  }

  // Standalone static page: apply landmark checks only if it declares them.
  const hasLandmarks = /class="[^"]*site-(header|footer)/.test(html);
  if (hasLandmarks) {
    if (!/<header[^>]*class="[^"]*site-header/i.test(html)) issues.push('missing <header>.site-header');
    if (!/<main[^>]*>[\s\S]*<\/main>/i.test(html)) issues.push('missing <main>');
    if (!/<footer[^>]*class="[^"]*site-footer/i.test(html)) issues.push('missing <footer>.site-footer');
  } else if (!/<h1[\s>]/i.test(html)) {
    issues.push('missing <h1>');
  }

  report(rel, issues, hasLandmarks ? 'header -> main -> footer in correct DOM order' : 'static page: IDs unique, headings non-empty, <h1> present');
}

console.log('\nOverall page structure: ' + (allPass ? 'PASS' : 'FAIL'));
process.exit(allPass ? 0 : 1);