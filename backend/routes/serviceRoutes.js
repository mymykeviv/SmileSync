const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Get all services with search, filter, and pagination
router.get('/', serviceController.getAllServices);

// Get service statistics
router.get('/stats', serviceController.getServiceStats);

// Get service categories
router.get('/categories', serviceController.getServiceCategories);

// Get service by ID
router.get('/:id', serviceController.getServiceById);

// Get service by service code
router.get('/code/:serviceCode', serviceController.getServiceByCode);

// Create new service
router.post('/', serviceController.createService);

// Update service
router.put('/:id', serviceController.updateService);

// Toggle service status (active/inactive)
router.patch('/:id/status', serviceController.toggleServiceStatus);

// Delete service
router.delete('/:id', serviceController.deleteService);

module.exports = router;