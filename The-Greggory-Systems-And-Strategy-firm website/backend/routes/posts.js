/**
 * Content Posts — admin-managed Testimonials + Work Portfolio.
 *
 * Mounted at /api/posts (see the modularRoutes list in server.js).
 *
 * Two halves:
 *   - PUBLIC  GET /testimonials, GET /portfolio  -> published + active rows only
 *   - ADMIN   /admin/*                          -> guarded by requireAdminSession
 *
 * The admin half is deliberately NOT covered by the blanket guard that
 * backend/routes/admin.js installs on its own router: the public half of this
 * router must stay reachable without a session so the marketing pages can read
 * it. Each admin route therefore carries requireAdminSession explicitly, which
 * verifies the same signed session token (see backend/utils/sessionToken.js).
 *
 * Deletes are SOFT (deleted_at = NOW()) so a post can never vanish by accident;
 * every public query filters deleted_at IS NULL.
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifySessionToken } = require('../utils/sessionToken');

function requireAdminSession(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const payload = verifySessionToken(m[1].trim());
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session' });
  }
  req.adminId = payload.uid;
  next();
}

/** Normalise an outcomes payload into a JSON string. Accepts an array, a raw
 *  JSON array string, or "metric | label" lines (one per line). */
function encodeOutcomes(input) {
  if (input === undefined || input === null || input === '') return null;
  if (typeof input === 'string') {
    const s = input.trim();
    if (!s) return null;
    if (s.startsWith('[')) {
      try {
        return JSON.stringify(JSON.parse(s));
      } catch {
        /* not valid JSON — fall through to line parsing */
      }
    }
    const parsed = s
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [metric, ...rest] = line.split('|');
        return { metric: String(metric || '').trim(), label: rest.join('|').trim() };
      })
      .filter((o) => o.metric);
    return parsed.length ? JSON.stringify(parsed) : null;
  }
  if (Array.isArray(input)) {
    const clean = input
      .map((o) => ({
        metric: String((o && o.metric) ?? '').trim(),
        label: String((o && o.label) ?? '').trim(),
      }))
      .filter((o) => o.metric);
    return clean.length ? JSON.stringify(clean) : null;
  }
  return null;
}

/** Parse the stored outcomes JSON back into an array. Never throws. */
function decodeOutcomes(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toBool(v) {
  return v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0;
}

// =============================================================
// PUBLIC — no session required
// =============================================================
router.get('/testimonials', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT id, quote, author_name, author_role, author_company, rating, sort_order
         FROM testimonials
        WHERE status = 'published' AND is_active = TRUE AND deleted_at IS NULL
        ORDER BY sort_order ASC, id ASC`
    );
    res.json({ success: true, testimonials: rows });
  } catch (error) {
    console.error('[posts] GET /testimonials failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load testimonials' });
  }
});

router.get('/portfolio', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT id, title, client_name, sector, summary, body, image_url, outcomes,
              is_featured, sort_order, created_at, updated_at
         FROM portfolio_items
        WHERE status = 'published' AND is_active = TRUE AND deleted_at IS NULL
        ORDER BY sort_order ASC, id ASC`
    );
    res.json({
      success: true,
      portfolio: rows.map((r) => ({ ...r, outcomes: decodeOutcomes(r.outcomes) })),
    });
  } catch (error) {
    console.error('[posts] GET /portfolio failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load portfolio' });
  }
});

// =============================================================
// ADMIN — TESTIMONIALS
// =============================================================
router.get('/admin/testimonials', requireAdminSession, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM testimonials WHERE deleted_at IS NULL ORDER BY sort_order ASC, id ASC'
    );
    res.json({ success: true, testimonials: rows });
  } catch (error) {
    console.error('[posts] admin list testimonials failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load testimonials' });
  }
});

router.post('/admin/testimonials', requireAdminSession, async (req, res) => {
  try {
    const { quote, author_name, author_role, author_company, rating, status, sort_order, is_active } =
      req.body || {};
    if (!quote || !String(quote).trim()) {
      return res.status(400).json({ success: false, message: 'Quote is required' });
    }
    if (!author_name || !String(author_name).trim()) {
      return res.status(400).json({ success: false, message: 'Author name is required' });
    }
    const [result] = await db.promise().query(
      `INSERT INTO testimonials
         (quote, author_name, author_role, author_company, rating, status, sort_order, is_active, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(quote).trim(),
        String(author_name).trim(),
        author_role ? String(author_role).trim() : null,
        author_company ? String(author_company).trim() : null,
        Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
        status === 'published' ? 'published' : 'draft',
        parseInt(sort_order, 10) || 0,
        is_active === undefined ? 1 : toBool(is_active),
        req.adminId == null ? null : req.adminId,
        req.adminId == null ? null : req.adminId,
      ]
    );
    res.status(201).json({ success: true, message: 'Testimonial created', id: result.insertId });
  } catch (error) {
    console.error('[posts] create testimonial failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create testimonial' });
  }
});

router.put('/admin/testimonials/:id', requireAdminSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { quote, author_name, author_role, author_company, rating, status, sort_order, is_active } =
      req.body || {};
    if (quote !== undefined && !String(quote).trim()) {
      return res.status(400).json({ success: false, message: 'Quote cannot be empty' });
    }
    if (author_name !== undefined && !String(author_name).trim()) {
      return res.status(400).json({ success: false, message: 'Author name cannot be empty' });
    }
    // The SET clause is built from ONLY the keys actually present in the body.
    // A fixed `col = COALESCE(?, col)` template cannot express "clear this
    // field": mysql2 renders an absent (undefined) bind as a literal NULL, so a
    // partial update — exactly what the admin UI's show/hide and feature
    // toggles send, e.g. { is_active: false } — would set every other bare
    // column to NULL and silently wipe the author role, company, client, body
    // and image URL. Absent key -> column left untouched; explicit null or
    // empty string -> column cleared.
    const sets = [];
    const params = [];
    const set = (column, value) => {
      sets.push(`${column} = ?`);
      params.push(value);
    };

    if (quote !== undefined) set('quote', String(quote).trim());
    if (author_name !== undefined) set('author_name', String(author_name).trim());
    if (author_role !== undefined) set('author_role', author_role ? String(author_role).trim() : null);
    if (author_company !== undefined) set('author_company', author_company ? String(author_company).trim() : null);
    if (rating !== undefined) set('rating', Math.min(5, Math.max(1, parseInt(rating, 10) || 5)));
    if (status !== undefined) set('status', status === 'published' ? 'published' : 'draft');
    if (sort_order !== undefined) set('sort_order', parseInt(sort_order, 10) || 0);
    if (is_active !== undefined) set('is_active', toBool(is_active));
    set('updated_by', req.adminId == null ? null : req.adminId);

    const [result] = await db.promise().query(
      `UPDATE testimonials SET ${sets.join(', ')}
        WHERE id = ? AND deleted_at IS NULL`,
      [...params, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, message: 'Testimonial updated' });
  } catch (error) {
    console.error('[posts] update testimonial failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update testimonial' });
  }
});

router.delete('/admin/testimonials/:id', requireAdminSession, async (req, res) => {
  try {
    const [result] = await db.promise().query(
      'UPDATE testimonials SET deleted_at = NOW(), is_active = FALSE WHERE id = ? AND deleted_at IS NULL',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error('[posts] delete testimonial failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete testimonial' });
  }
});

// =============================================================
// ADMIN — WORK PORTFOLIO
// =============================================================
router.get('/admin/portfolio', requireAdminSession, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM portfolio_items WHERE deleted_at IS NULL ORDER BY sort_order ASC, id ASC'
    );
    res.json({
      success: true,
      portfolio: rows.map((r) => ({ ...r, outcomes: decodeOutcomes(r.outcomes) })),
    });
  } catch (error) {
    console.error('[posts] admin list portfolio failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load portfolio' });
  }
});

router.post('/admin/portfolio', requireAdminSession, async (req, res) => {
  try {
    const {
      title, client_name, sector, summary, body, image_url,
      outcomes, status, sort_order, is_featured, is_active,
    } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    const [result] = await db.promise().query(
      `INSERT INTO portfolio_items
         (title, client_name, sector, summary, body, image_url, outcomes,
          status, sort_order, is_featured, is_active, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(title).trim(),
        client_name ? String(client_name).trim() : null,
        sector ? String(sector).trim() : null,
        summary ? String(summary).trim() : null,
        body ? String(body) : null,
        image_url ? String(image_url).trim() : null,
        encodeOutcomes(outcomes),
        status === 'published' ? 'published' : 'draft',
        parseInt(sort_order, 10) || 0,
        toBool(is_featured),
        is_active === undefined ? 1 : toBool(is_active),
        req.adminId == null ? null : req.adminId,
        req.adminId == null ? null : req.adminId,
      ]
    );
    res.status(201).json({ success: true, message: 'Portfolio item created', id: result.insertId });
  } catch (error) {
    console.error('[posts] create portfolio item failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create portfolio item' });
  }
});

router.put('/admin/portfolio/:id', requireAdminSession, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, client_name, sector, summary, body, image_url,
      outcomes, status, sort_order, is_featured, is_active,
    } = req.body || {};
    if (title !== undefined && !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Title cannot be empty' });
    }
    // Built from only the keys present in the body — see the note on the
    // testimonial PUT above for why a fixed COALESCE template is not safe here.
    // This matters most for the feature toggle, which sends only
    // { is_featured: true } and would otherwise null out the client, sector,
    // summary, body and image URL.
    const sets = [];
    const params = [];
    const set = (column, value) => {
      sets.push(`${column} = ?`);
      params.push(value);
    };

    if (title !== undefined) set('title', String(title).trim());
    if (client_name !== undefined) set('client_name', client_name ? String(client_name).trim() : null);
    if (sector !== undefined) set('sector', sector ? String(sector).trim() : null);
    if (summary !== undefined) set('summary', summary ? String(summary).trim() : null);
    if (body !== undefined) set('body', body ? String(body) : null);
    if (image_url !== undefined) set('image_url', image_url ? String(image_url).trim() : null);
    if (outcomes !== undefined) set('outcomes', encodeOutcomes(outcomes));
    if (status !== undefined) set('status', status === 'published' ? 'published' : 'draft');
    if (sort_order !== undefined) set('sort_order', parseInt(sort_order, 10) || 0);
    if (is_featured !== undefined) set('is_featured', toBool(is_featured));
    if (is_active !== undefined) set('is_active', toBool(is_active));
    set('updated_by', req.adminId == null ? null : req.adminId);

    const [result] = await db.promise().query(
      `UPDATE portfolio_items SET ${sets.join(', ')}
        WHERE id = ? AND deleted_at IS NULL`,
      [...params, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Portfolio item not found' });
    }
    res.json({ success: true, message: 'Portfolio item updated' });
  } catch (error) {
    console.error('[posts] update portfolio item failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update portfolio item' });
  }
});

router.delete('/admin/portfolio/:id', requireAdminSession, async (req, res) => {
  try {
    const [result] = await db.promise().query(
      'UPDATE portfolio_items SET deleted_at = NOW(), is_active = FALSE WHERE id = ? AND deleted_at IS NULL',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Portfolio item not found' });
    }
    res.json({ success: true, message: 'Portfolio item deleted' });
  } catch (error) {
    console.error('[posts] delete portfolio item failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete portfolio item' });
  }
});

module.exports = router;