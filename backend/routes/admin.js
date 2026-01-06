const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const adminMiddleware = require('../middleware/admin');

router.post('/login', adminController.adminLogin);
router.get('/reports', adminMiddleware, adminController.getReports);
router.get('/reports/:reportId', adminMiddleware, adminController.getReportDetails);
router.post('/action/:userId', adminMiddleware, adminController.takeAction);
router.get('/audit-logs', adminMiddleware, adminController.getAuditLogs);

module.exports = router;
