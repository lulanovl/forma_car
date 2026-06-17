const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/publicController');

// Public booking-site config (branding, contacts). No auth.
router.get('/config', ctrl.getConfig);

module.exports = router;
