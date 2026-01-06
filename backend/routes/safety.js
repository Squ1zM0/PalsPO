const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safety');
const authMiddleware = require('../middleware/auth');

router.post('/block/:userId', authMiddleware, safetyController.blockUser);
router.delete('/block/:userId', authMiddleware, safetyController.unblockUser);
router.get('/blocked', authMiddleware, safetyController.getBlockedUsers);
router.post('/report/:userId', authMiddleware, safetyController.reportUser);

module.exports = router;
