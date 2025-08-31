const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct, validateId, handleValidationErrors } = require('../middleware/validation');

// Get all products with search, filter, and pagination
router.get('/', productController.getAllProducts);

// Get product statistics
router.get('/stats', productController.getProductStats);

// Get product categories
router.get('/categories', productController.getProductCategories);

// Get suppliers
router.get('/suppliers', productController.getSuppliers);

// Get low stock products
router.get('/low-stock', productController.getLowStockProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Get product by product code
router.get('/code/:productCode', productController.getProductByCode);

// Create new product
router.post('/', validateProduct, handleValidationErrors, productController.createProduct);

// Update product
router.put('/:id', validateId, validateProduct, handleValidationErrors, productController.updateProduct);

// Update product stock
router.patch('/:id/stock', productController.updateProductStock);

// Toggle product status (active/inactive)
router.patch('/:id/status', productController.toggleProductStatus);

// Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;