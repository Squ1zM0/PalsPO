const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matches');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, matchesController.getMatches);
router.post('/:matchId/request-penpal', authMiddleware, matchesController.requestPenPal);
router.post('/:matchId/confirm-penpal', authMiddleware, matchesController.confirmPenPal);
router.post('/:matchId/end', authMiddleware, matchesController.endMatch);

module.exports = router;
