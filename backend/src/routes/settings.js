const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/settingsController');

router.get('/',   auth, ctrl.getSettings);
router.patch('/', auth, ctrl.updateSettings);

module.exports = router;
