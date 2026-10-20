/**
 * End-to-end check for the Project Portfolio flow.
 *
 * Exercises the exact API contract the admin Portfolio Manager and the public
 * home page rely on:
 *   GET    /api/posts/portfolio           (public — published + active only)
 *   GET    /api/posts/admin/portfolio     (admin list)
 *   POST   /api/posts/admin/portfolio     (create)
 *   PUT    /api/posts/admin/portfolio/:id (update / feature / publish)
 *   DELETE /api/posts/admin/portfolio/:id (soft delete)
 *
 * The rows it creates are removed again at the end, so the table is left as it
 * was found.
 */
// dotenv MUST be loaded before sessionToken is required — that module captures
// the signing secret at require time, exactly like server.js does.
require('dotenv').config();
const { signSessionToken } = require('../backend/utils/sessionToken');

const BASE = process.env.API_BASE || 'http://localhost:3000/api';
const TOKEN = signSessionToken(1, 'super_admin');
const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

const call = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: HEADERS,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
};

const assert = (label, condition, extra) => {
  const ok = !!condition;
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${label}${extra ? ` -> ${extra}` : ''}`);
  if (!ok) process.exitCode = 1;
  return ok;
};


(async () => {
  console.log('\n=== Project Portfolio API round-trip ===\n');

  // 1. Public endpoint responds and is an array.
  const pub0 = await call('GET', '/posts/portfolio');
  assert('GET /posts/portfolio returns 200', pub0.status === 200, `status=${pub0.status}`);
  assert('GET /posts/portfolio returns a portfolio array', Array.isArray(pub0.data?.portfolio));
  const publicBefore = pub0.data.portfolio.length;

  // 2. Admin list responds.
  const admin0 = await call('GET', '/posts/admin/portfolio');
  assert('GET /posts/admin/portfolio returns 200', admin0.status === 200, `status=${admin0.status}`);
  assert(
    'GET /posts/admin/portfolio returns a portfolio array',
    Array.isArray(admin0.data?.portfolio)
  );

  // 3. Create a DRAFT entry — it must NOT reach the public site.
  const created = await call('POST', '/posts/admin/portfolio', {
    title: 'TEST ENTRY — automated round-trip',
    client_name: 'Test Client',
    sector: 'Testing',
    summary: 'Temporary entry created by the portfolio API test.',
    body: 'Created by scripts/test-portfolio-flow.js. Deleted at the end of the run.',
    outcomes: '35% | Faster delivery\n12 wks | To go live',
    status: 'draft',
    sort_order: 9999,
    is_featured: false,
    is_active: true,
  });
  assert('POST /posts/admin/portfolio returns 201', created.status === 201, `status=${created.status} ${JSON.stringify(created.data)}`);
  const id = created.data?.id;
  if (!id) {
    console.error('  ABORT  no id returned — cannot continue');
    process.exit(1);
  }

  // 4. A draft must be invisible publicly.
  const pub1 = await call('GET', '/posts/portfolio');
  assert(
    'draft entry does NOT appear on the public endpoint',
    !pub1.data.portfolio.some((p) => p.id === id),
    `publicCount=${pub1.data.portfolio.length}`
  );

  // 5. The admin list sees it, with outcomes decoded into objects.
  const admin1 = await call('GET', '/posts/admin/portfolio');
  const row = admin1.data.portfolio.find((p) => p.id === id);
  assert('draft entry appears in the admin list', !!row);
  assert(
    'outcomes are decoded into {metric,label} objects',
    Array.isArray(row?.outcomes) &&
      row.outcomes.length === 2 &&
      row.outcomes[0].metric === '35%' &&
      row.outcomes[0].label === 'Faster delivery',
    JSON.stringify(row?.outcomes)
  );

  // 6. Publish it — now it must be publicly visible.
  const published = await call('PUT', `/posts/admin/portfolio/${id}`, {
    status: 'published',
  });
  assert('PUT publish returns 200', published.status === 200, `status=${published.status}`);

  const pub2 = await call('GET', '/posts/portfolio');
  const live = pub2.data.portfolio.find((p) => p.id === id);
  assert('published entry appears on the public endpoint', !!live);
  assert(
    'public entry carries the title, client and sector',
    live?.title === 'TEST ENTRY — automated round-trip' &&
      live?.client_name === 'Test Client' &&
      live?.sector === 'Testing'
  );
  assert(
    'public entry carries decoded outcomes',
    Array.isArray(live?.outcomes) && live.outcomes.length === 2,
    JSON.stringify(live?.outcomes)
  );

  // 7. Feature toggle (a partial PUT must not wipe the other columns).
  const featured = await call('PUT', `/posts/admin/portfolio/${id}`, {
    is_featured: true,
  });
  assert('PUT feature toggle returns 200', featured.status === 200);

  const admin2 = await call('GET', '/posts/admin/portfolio');
  const row2 = admin2.data.portfolio.find((p) => p.id === id);
  assert('is_featured is now true', row2?.is_featured === 1 || row2?.is_featured === true, `value=${row2?.is_featured}`);
  assert(
    'partial PUT preserved the other columns',
    row2?.title === 'TEST ENTRY — automated round-trip' &&
      row2?.client_name === 'Test Client' &&
      row2?.summary === 'Temporary entry created by the portfolio API test.'
  );

  // 8. Unpublish -> hidden from the public endpoint again.
  const unpublished = await call('PUT', `/posts/admin/portfolio/${id}`, {
    status: 'draft',
  });
  assert('PUT unpublish returns 200', unpublished.status === 200);

  const pub3 = await call('GET', '/posts/portfolio');
  assert(
    'unpublished entry disappears from the public endpoint',
    !pub3.data.portfolio.some((p) => p.id === id)
  );

  // 9. Soft delete — gone from the admin list AND the public endpoint.
  const deleted = await call('DELETE', `/posts/admin/portfolio/${id}`);
  assert('DELETE returns 200', deleted.status === 200, `status=${deleted.status}`);

  const admin3 = await call('GET', '/posts/admin/portfolio');
  assert(
    'deleted entry is gone from the admin list',
    !admin3.data.portfolio.some((p) => p.id === id)
  );

  const pub4 = await call('GET', '/posts/portfolio');
  assert(
    'deleted entry is gone from the public endpoint',
    !pub4.data.portfolio.some((p) => p.id === id)
  );
  assert(
    'public endpoint is back to its starting size',
    pub4.data.portfolio.length === publicBefore,
    `before=${publicBefore} after=${pub4.data.portfolio.length}`
  );

  console.log('\n=== done ===\n');
})().catch((e) => {
  console.error('TEST ERROR:', e);
  process.exit(1);
});
