const express = require('express');
const router = express.Router();
const addressesController = require('../controllers/addresses');
const authMiddleware = require('../middleware/auth');

router.put('/', authMiddleware, addressesController.saveAddress);
router.get('/me', authMiddleware, addressesController.getMyAddress);
router.post('/reveal/:matchId/request', authMiddleware, addressesController.requestAddressReveal);
router.post('/reveal/:matchId/confirm', authMiddleware, addressesController.confirmAddressReveal);
router.get('/partner/:matchId', authMiddleware, addressesController.getPartnerAddress);

module.exports = router;
