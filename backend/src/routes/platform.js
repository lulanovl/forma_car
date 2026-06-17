const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const requirePlatformOwner = require('../middleware/requirePlatformOwner');
const ctrl    = require('../controllers/platformController');

// All platform routes require an authenticated platform_owner.
router.use(auth, requirePlatformOwner);

router.get('/carwashes',       ctrl.listCarwashes);
router.post('/carwashes',      ctrl.createCarwash);
router.patch('/carwashes/:id', ctrl.updateCarwash);

module.exports = router;
