const Product = require('../models/Product');

// Get all products with search, filter, and pagination
exports.getAllProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            supplier,
            status,
            lowStock,
            sortBy = 'name',
            sortOrder = 'asc',
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;
        const options = {
            search,
            category,
            supplier,
            status,
            lowStock: lowStock === 'true',
            sortBy,
            sortOrder,
            limit: parseInt(limit),
            offset
        };

        const products = await Product.findAll(options);
        const totalCount = await Product.getCount(options);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCount,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve products',
            error: error.message
        });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve product',
            error: error.message
        });
    }
};

// Get product by product code
exports.getProductByCode = async (req, res) => {
    try {
        const { productCode } = req.params;
        const product = await Product.findByProductCode(productCode);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error getting product by code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve product',
            error: error.message
        });
    }
};

// Create new product
exports.createProduct = async (req, res) => {
    try {
        const productData = req.body;
        
        // Validate required fields
        const requiredFields = ['name', 'category', 'unit_price', 'supplier'];
        for (const field of requiredFields) {
            if (!productData[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        // Generate product code if not provided
        if (!productData.product_code) {
            productData.product_code = await Product.generateProductCode();
        }

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Update product properties
        Object.assign(product, updateData);
        await product.update();

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};

// Update product stock
exports.updateProductStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let newQuantity;
        switch (operation) {
            case 'add':
                newQuantity = product.current_stock + quantity;
                break;
            case 'subtract':
                newQuantity = product.current_stock - quantity;
                break;
            case 'set':
            default:
                newQuantity = quantity;
                break;
        }

        if (newQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock quantity cannot be negative'
            });
        }

        product.current_stock = newQuantity;
        await product.update();

        res.json({
            success: true,
            message: 'Product stock updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Error updating product stock:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product stock',
            error: error.message
        });
    }
};

// Toggle product status
exports.toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.is_active = !product.is_active;
        await product.update();

        res.json({
            success: true,
            message: `Product ${product.is_active ? 'activated' : 'deactivated'} successfully`,
            data: product
        });
    } catch (error) {
        console.error('Error toggling product status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product status',
            error: error.message
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await product.delete();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

// Get product categories
exports.getProductCategories = async (req, res) => {
    try {
        const categories = await Product.getCategories();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error getting product categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve product categories',
            error: error.message
        });
    }
};

// Get suppliers
exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Product.getSuppliers();
        
        res.json({
            success: true,
            data: suppliers
        });
    } catch (error) {
        console.error('Error getting suppliers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve suppliers',
            error: error.message
        });
    }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
    try {
        const { threshold = 10 } = req.query;
        const products = await Product.getLowStock(parseInt(threshold));
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error getting low stock products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve low stock products',
            error: error.message
        });
    }
};

// Get product statistics
exports.getProductStats = async (req, res) => {
    try {
        const stats = await Product.getStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting product statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve product statistics',
            error: error.message
        });
    }
};