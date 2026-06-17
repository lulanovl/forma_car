const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header.
 * Expects: Authorization: Bearer <token>
 */
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];

  // EventSource (SSE) cannot send headers — accept token as query param too
  let token = req.query.token || null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = true;
    req.adminData = decoded;
    req.userId = decoded.userId;
    req.role = decoded.role;

    // Tenant context is AUTHORITATIVE from the token for admin requests, overriding
    // whatever resolveTenant derived from the subdomain.
    if (decoded.role === 'platform_owner') {
      // Platform owner isn't bound to one carwash — let it target a carwash
      // explicitly (full cross-tenant UI lands in Phase 4).
      const target = req.headers['x-carwash-id'] || (req.query && req.query.carwash_id);
      req.carwashId = target ? parseInt(target, 10) : (req.carwashId || null);
    } else {
      req.carwashId = decoded.carwash_id;
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный или истёкший токен' });
  }
}

module.exports = auth;
