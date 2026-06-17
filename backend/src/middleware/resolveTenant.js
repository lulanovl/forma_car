const db = require('../db/knex');

// Hostnames whose first label is NOT a carwash slug.
const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'admin', 'localhost']);

// Until Phase 2 ships per-tenant subdomains in production, an unresolved request
// falls back to this slug so the existing single-tenant deployment keeps working.
const DEFAULT_SLUG = process.env.DEFAULT_CARWASH_SLUG || 'formacar';

/**
 * Derive a carwash slug from the request, in priority order:
 *   1. x-carwash-slug header   (explicit; handy for local dev / API clients)
 *   2. ?carwash=<slug> query    (explicit)
 *   3. subdomain of the Host    (<slug>.formacar.app)
 * Returns { slug, explicit } — explicit=true means the caller named a tenant, so
 * a miss should 404 rather than silently fall back.
 */
function deriveSlug(req) {
  const header = req.headers['x-carwash-slug'];
  if (header) return { slug: String(header).trim().toLowerCase(), explicit: true };

  if (req.query && req.query.carwash) {
    return { slug: String(req.query.carwash).trim().toLowerCase(), explicit: true };
  }

  const host = (req.headers.host || '').split(':')[0]; // strip port
  const labels = host.split('.');
  if (labels.length >= 2) {
    const first = labels[0].toLowerCase();
    if (first && !RESERVED_SUBDOMAINS.has(first)) {
      return { slug: first, explicit: false };
    }
  }

  return { slug: DEFAULT_SLUG, explicit: false };
}

/**
 * Resolves the active carwash for PUBLIC routes and sets req.carwashId / req.carwash.
 * Admin routes get carwash context from the JWT instead (see auth middleware), which
 * runs after this and overrides req.carwashId.
 */
module.exports = async function resolveTenant(req, res, next) {
  try {
    const { slug, explicit } = deriveSlug(req);

    const carwash = await db('carwashes')
      .where({ slug, is_active: true })
      .first();

    if (!carwash) {
      // Named a specific tenant that doesn't exist (or is disabled) → hard 404.
      if (explicit) {
        return res.status(404).json({ error: 'Автомойка не найдена' });
      }
      // Fallback slug missing — leave context empty; scoped routes will 400.
      req.carwashId = null;
      req.carwash = null;
      return next();
    }

    req.carwashId = carwash.id;
    req.carwash = carwash;
    next();
  } catch (err) {
    next(err);
  }
};
