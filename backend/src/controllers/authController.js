const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db     = require('../db/knex');

const JWT_SECRET     = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// POST /api/auth/login  { login, password }
exports.login = async (req, res, next) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Укажите логин и пароль' });
    }

    // login is unique only within a carwash, so disambiguate by tenant context
    // (resolveTenant set req.carwashId from the subdomain), then platform_owner.
    const candidates = await db('users').where({ login });
    const user =
      candidates.find((u) => u.carwash_id === req.carwashId) ||
      candidates.find((u) => u.role === 'platform_owner') ||
      candidates[0];

    // Same generic error for unknown login and wrong password (no user enumeration)
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, carwash_id: user.carwash_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      user: { id: user.id, login: user.login, role: user.role, carwash_id: user.carwash_id },
    });
  } catch (err) {
    next(err);
  }
};
