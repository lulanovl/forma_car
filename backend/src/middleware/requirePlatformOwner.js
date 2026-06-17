// Gate for platform-level routes (managing all carwashes). Must run AFTER `auth`,
// which sets req.role from the JWT.
module.exports = function requirePlatformOwner(req, res, next) {
  if (req.role !== 'platform_owner') {
    return res.status(403).json({ error: 'Доступ только для владельца платформы' });
  }
  next();
};
