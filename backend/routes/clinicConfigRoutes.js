const express = require('express');
const router = express.Router();
const { getClinicConfig, updateClinicConfig } = require('../controllers/clinicConfigController');
const { authenticateToken } = require('../middleware/auth');

// Get clinic configuration (public endpoint for header display)
router.get('/config', getClinicConfig);

// Update clinic configuration (protected endpoint - requires authentication)
router.put('/config', authenticateToken, updateClinicConfig);

module.exports = router;