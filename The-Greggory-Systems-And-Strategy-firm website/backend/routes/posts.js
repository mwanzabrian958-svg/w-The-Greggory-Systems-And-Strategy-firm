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
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { verifyActiveAdminSession } = require('../utils/adminSessionState');
const { ADMIN_SESSION_COOKIE, getCookie } = require('../utils/sessionCookies');
const {
  MAX_PORTFOLIO_MEDIA_FILE_SIZE,
  MAX_PORTFOLIO_MEDIA_FILES,
  MAX_PORTFOLIO_MEDIA_TOTAL_SIZE,
  mediaTypeForMime,
  validatePortfolioFiles,
} = require('../utils/portfolioMedia');

const uploadPortfolioMedia = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_PORTFOLIO_MEDIA_FILES,
    fileSize: MAX_PORTFOLIO_MEDIA_FILE_SIZE,
  },
  fileFilter(req, file, callback) {
    if (!mediaTypeForMime(file.mimetype)) {
      return callback(new Error('Use JPG, PNG, GIF, WebP, AVIF, MP4, MOV, or WebM files.'));
    }
    callback(null, true);
  },
});

function parsePortfolioMedia(req, res, next) {
  uploadPortfolioMedia.array('media', MAX_PORTFOLIO_MEDIA_FILES)(req, res, (error) => {
    if (error) {
      const tooLarge = error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FILE_COUNT';
      return res.status(tooLarge ? 413 : 400).json({
        success: false,
        message: error.message || 'Could not read the uploaded media.',
      });
    }
    try {
      validatePortfolioFiles(req.files || []);
      next();
    } catch (validationError) {
      res.status(validationError.status || 400).json({
        success: false,
        message: validationError.message,
      });
    }
  });
}

async function loadPortfolioMedia(portfolioIds) {
  if (!portfolioIds.length) return new Map();
  const [mediaRows] = await db.promise().query(
    `SELECT id, portfolio_id, media_type, file_name, mime_type, file_size, sort_order
       FROM portfolio_media
      WHERE portfolio_id IN (?)
      ORDER BY sort_order ASC, id ASC`,
    [portfolioIds]
  );
  const mediaByPortfolio = new Map();
  for (const media of mediaRows) {
    const key = String(media.portfolio_id);
    const entries = mediaByPortfolio.get(key) || [];
    entries.push({
      ...media,
      url: `/api/posts/portfolio/media/${media.id}`,
    });
    mediaByPortfolio.set(key, entries);
  }
  return mediaByPortfolio;
}

function attachPortfolioMedia(rows, mediaByPortfolio) {
  return rows.map((row) => ({
    ...row,
    outcomes: decodeOutcomes(row.outcomes),
    media: mediaByPortfolio.get(String(row.id)) || [],
  }));
}

function parseRemovedMediaIds(value) {
  if (value === undefined || value === null || value === '') return [];
  let ids;
  try {
    ids = typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    throw Object.assign(new Error('Invalid media removal list.'), { status: 400 });
  }
  if (!Array.isArray(ids) || ids.some((id) => !/^\d+$/.test(String(id)) || Number(id) < 1)) {
    throw Object.assign(new Error('Invalid media removal list.'), { status: 400 });
  }
  return [...new Set(ids.map(Number))];
}

async function requireAdminSession(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = m ? m[1].trim() : getCookie(req, ADMIN_SESSION_COOKIE);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  try {
    const payload = await verifyActiveAdminSession(token);
    if (!payload) {
      return res.status(401).json({ success: false, message: 'Invalid or expired admin session' });
    }
    req.adminId = payload.uid;
    return next();
  } catch (error) {
    console.error('[POSTS] Admin session check failed:', error.message);
    return res.status(500).json({ success: false, message: 'Admin authentication check failed' });
  }
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
    const mediaByPortfolio = await loadPortfolioMedia(rows.map((row) => row.id));
    res.json({
      success: true,
      portfolio: attachPortfolioMedia(rows, mediaByPortfolio),
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
    const mediaByPortfolio = await loadPortfolioMedia(rows.map((row) => row.id));
    res.json({
      success: true,
      portfolio: attachPortfolioMedia(rows, mediaByPortfolio),
    });
  } catch (error) {
    console.error('[posts] admin list portfolio failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load portfolio' });
  }
});

router.get('/portfolio/media/:id', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT media.file_data, media.mime_type, item.status, item.is_active, item.deleted_at
         FROM portfolio_media AS media
         JOIN portfolio_items AS item ON item.id = media.portfolio_id
        WHERE media.id = ?
        LIMIT 1`,
      [req.params.id]
    );
    const media = rows[0];
    if (!media) {
      return res.status(404).json({ success: false, message: 'Portfolio media not found' });
    }

    const isPublic = media.status === 'published' && Boolean(media.is_active) && !media.deleted_at;
    if (!isPublic) {
      const authHeader = req.headers.authorization || req.headers.Authorization || '';
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      const token = match ? match[1].trim() : getCookie(req, ADMIN_SESSION_COOKIE);
      if (!token || !(await verifyActiveAdminSession(token))) {
        return res.status(404).json({ success: false, message: 'Portfolio media not found' });
      }
    }

    res.set({
      'Cache-Control': isPublic ? 'public, max-age=3600' : 'private, no-store',
      'Content-Length': media.file_data.length,
      'Content-Type': media.mime_type,
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(media.file_data);
  } catch (error) {
    console.error('[posts] portfolio media fetch failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load portfolio media' });
  }
});

router.post('/admin/portfolio', requireAdminSession, parsePortfolioMedia, async (req, res) => {
  let connection;
  try {
    const {
      title, client_name, sector, summary, body, image_url,
      outcomes, status, sort_order, is_featured, is_active,
    } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    const files = req.files || [];
    connection = await db.promise().getConnection();
    const transaction = connection.promise();
    await transaction.beginTransaction();
    const [result] = await transaction.query(
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
    let firstImageId = null;
    for (const [index, file] of files.entries()) {
      const [mediaResult] = await transaction.query(
        `INSERT INTO portfolio_media
           (portfolio_id, media_type, file_name, mime_type, file_size, file_data, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          result.insertId,
          mediaTypeForMime(file.mimetype),
          path.basename(String(file.originalname || 'upload').replace(/\\/g, '/')).slice(0, 255),
          file.mimetype,
          file.size,
          file.buffer,
          index,
        ]
      );
      if (firstImageId === null && mediaTypeForMime(file.mimetype) === 'image') {
        firstImageId = mediaResult.insertId;
      }
    }
    if (!(image_url && String(image_url).trim()) && firstImageId !== null) {
      await transaction.query(
        'UPDATE portfolio_items SET image_url = ? WHERE id = ?',
        [`/api/posts/portfolio/media/${firstImageId}`, result.insertId]
      );
    }
    await transaction.commit();
    res.status(201).json({ success: true, message: 'Portfolio item created', id: result.insertId });
  } catch (error) {
    if (connection) {
      try {
        await connection.promise().rollback();
      } catch (rollbackError) {
        console.error('[posts] create portfolio rollback failed:', rollbackError.message);
      }
    }
    console.error('[posts] create portfolio item failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create portfolio item' });
  } finally {
    if (connection) connection.release();
  }
});

router.put('/admin/portfolio/:id', requireAdminSession, parsePortfolioMedia, async (req, res) => {
  let connection;
  let transaction;
  try {
    const { id } = req.params;
    const {
      title, client_name, sector, summary, body, image_url,
      outcomes, status, sort_order, is_featured, is_active,
    } = req.body || {};
    const files = req.files || [];
    const removedMediaIds = parseRemovedMediaIds(req.body?.remove_media_ids);
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

    let result;
    if (files.length || removedMediaIds.length) {
      connection = await db.promise().getConnection();
      transaction = connection.promise();
      await transaction.beginTransaction();

      const [items] = await transaction.query(
        'SELECT image_url FROM portfolio_items WHERE id = ? AND deleted_at IS NULL FOR UPDATE',
        [id]
      );
      if (!items.length) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Portfolio item not found' });
      }

      const [currentMedia] = await transaction.query(
        'SELECT id, file_size FROM portfolio_media WHERE portfolio_id = ? FOR UPDATE',
        [id]
      );
      const currentMediaIds = new Set(currentMedia.map((media) => Number(media.id)));
      if (removedMediaIds.some((mediaId) => !currentMediaIds.has(mediaId))) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'One or more selected media files do not belong to this portfolio item' });
      }
      const retainedMedia = currentMedia.filter((media) => !removedMediaIds.includes(Number(media.id)));
      const combinedFileSize = retainedMedia.reduce((total, media) => total + Number(media.file_size || 0), 0)
        + files.reduce((total, file) => total + file.size, 0);
      if (retainedMedia.length + files.length > MAX_PORTFOLIO_MEDIA_FILES) {
        throw Object.assign(new Error(`A portfolio album cannot contain more than ${MAX_PORTFOLIO_MEDIA_FILES} files.`), { status: 413 });
      }
      if (combinedFileSize > MAX_PORTFOLIO_MEDIA_TOTAL_SIZE) {
        throw Object.assign(new Error('The combined portfolio album must be 25 MB or smaller.'), { status: 413 });
      }

      if (removedMediaIds.length) {
        await transaction.query(
          'DELETE FROM portfolio_media WHERE portfolio_id = ? AND id IN (?)',
          [id, removedMediaIds]
        );
      }

      let nextMediaOrder = 0;
      if (files.length) {
        const [orderRows] = await transaction.query(
          'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM portfolio_media WHERE portfolio_id = ?',
          [id]
        );
        nextMediaOrder = Number(orderRows[0]?.next_order) || 0;
        for (const [index, file] of files.entries()) {
          await transaction.query(
            `INSERT INTO portfolio_media
               (portfolio_id, media_type, file_name, mime_type, file_size, file_data, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              mediaTypeForMime(file.mimetype),
              path.basename(String(file.originalname || 'upload').replace(/\\/g, '/')).slice(0, 255),
              file.mimetype,
              file.size,
              file.buffer,
              nextMediaOrder + index,
            ]
          );
        }
      }

      const [remainingMedia] = await transaction.query(
        `SELECT id, media_type FROM portfolio_media
          WHERE portfolio_id = ? ORDER BY sort_order ASC, id ASC`,
        [id]
      );
      const oldCoverId = /^\/api\/posts\/portfolio\/media\/(\d+)$/.exec(items[0].image_url || '')?.[1];
      const oldCoverWasRemoved = oldCoverId && removedMediaIds.includes(Number(oldCoverId));
      const submittedCoverIsBlank = image_url !== undefined && !String(image_url).trim();
      if (oldCoverWasRemoved || submittedCoverIsBlank) {
        const firstImage = remainingMedia.find((media) => media.media_type === 'image');
        const coverUrl = firstImage ? `/api/posts/portfolio/media/${firstImage.id}` : null;
        const imageUrlIndex = sets.findIndex((column) => column.startsWith('image_url ='));
        if (imageUrlIndex === -1) {
          sets.push('image_url = ?');
          params.push(coverUrl);
        } else {
          params[imageUrlIndex] = coverUrl;
        }
      } else if (image_url === undefined && !items[0].image_url) {
        const firstImage = remainingMedia.find((media) => media.media_type === 'image');
        if (firstImage) {
          sets.push('image_url = ?');
          params.push(`/api/posts/portfolio/media/${firstImage.id}`);
        }
      }

      [result] = await transaction.query(
        `UPDATE portfolio_items SET ${sets.join(', ')}
          WHERE id = ? AND deleted_at IS NULL`,
        [...params, id]
      );
      await transaction.commit();
    } else {
      [result] = await db.promise().query(
        `UPDATE portfolio_items SET ${sets.join(', ')}
          WHERE id = ? AND deleted_at IS NULL`,
        [...params, id]
      );
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Portfolio item not found' });
    }
    res.json({ success: true, message: 'Portfolio item updated' });
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('[posts] portfolio update rollback failed:', rollbackError.message);
      }
    }
    console.error('[posts] update portfolio item failed:', error.message);
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : 'Failed to update portfolio item',
    });
  } finally {
    if (connection) connection.release();
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