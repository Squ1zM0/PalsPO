const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profiles');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, profilesController.getProfile);
router.put('/', authMiddleware, profilesController.updateProfile);
router.put('/preferences', authMiddleware, profilesController.updatePreferences);

module.exports = router;
