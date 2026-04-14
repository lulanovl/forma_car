const express   = require('express');
const rateLimit = require('express-rate-limit');
const router    = express.Router();
const authController = require('../controllers/authController');

// Max 10 login attempts per IP per 15 minutes — brute force protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
});

// POST /api/auth/login
router.post('/login', loginLimiter, authController.login);

module.exports = router;
