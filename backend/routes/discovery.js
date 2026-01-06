const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discovery');
const authMiddleware = require('../middleware/auth');

router.get('/feed', authMiddleware, discoveryController.getDiscoveryFeed);
router.get('/requests', authMiddleware, discoveryController.getPendingRequests);
router.post('/connect/:toUserId', authMiddleware, discoveryController.sendConnectionRequest);
router.put('/requests/:requestId', authMiddleware, discoveryController.respondToConnectionRequest);

module.exports = router;
