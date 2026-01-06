const express = require('express');
const router = express.Router();
const scansController = require('../controllers/scans');
const authMiddleware = require('../middleware/auth');

router.post('/upload', authMiddleware, scansController.upload.single('scan'), scansController.uploadScan);
router.get('/:matchId', authMiddleware, scansController.getScans);
router.get('/url/:scanId', authMiddleware, scansController.getScanUrl);

module.exports = router;
