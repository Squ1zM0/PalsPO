const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages');
const authMiddleware = require('../middleware/auth');

router.get('/:matchId', authMiddleware, messagesController.getMessages);
router.post('/:matchId', authMiddleware, messagesController.sendMessage);

module.exports = router;
