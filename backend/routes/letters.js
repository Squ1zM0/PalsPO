const express = require('express');
const router = express.Router();
const lettersController = require('../controllers/letters');
const authMiddleware = require('../middleware/auth');

router.post('/:matchId', authMiddleware, lettersController.createLetterEvent);
router.get('/:matchId', authMiddleware, lettersController.getLetterEvents);
router.put('/:eventId', authMiddleware, lettersController.updateLetterEvent);

module.exports = router;
