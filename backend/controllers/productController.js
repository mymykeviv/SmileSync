const Product = require('../models/Product');
const { convertProductToBackend, convertProductToFrontend } = require('../utils/fieldMapping');

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

        // Convert products to JSON
        const productsData = products.map(product => product.toJSON());

        res.json({
            success: true,
            data: productsData,
            pagination: {
                currentPage: page,
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
            message: 'Failed to retrieve products due to database error',
            error: {
                code: 'DATABASE_ERROR',
                details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
            },
            timestamp: new Date().toISOString()
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
                message: 'Product not found',
                error: {
                    code: 'PRODUCT_NOT_FOUND',
                    details: {
                        productId: id,
                        message: 'The requested product does not exist'
                    }
                },
                timestamp: new Date().toISOString()
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
            message: 'Failed to retrieve product due to database error',
            error: {
                code: 'DATABASE_ERROR',
                details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
            },
            timestamp: new Date().toISOString()
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
                message: 'Product not found',
                error: {
                    code: 'PRODUCT_NOT_FOUND',
                    details: {
                        productCode: productCode,
                        message: 'The requested product does not exist'
                    }
                },
                timestamp: new Date().toISOString()
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
            message: 'Failed to retrieve product due to database error',
            error: {
                code: 'DATABASE_ERROR',
                details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};

// Create new product
exports.createProduct = async (req, res) => {
    try {
        console.log('Raw request body:', JSON.stringify(req.body, null, 2));
        
        // Convert frontend camelCase to backend snake_case
        const productData = convertProductToBackend(req.body);
        console.log('Converted product data:', JSON.stringify(productData, null, 2));
        
        // Validate required fields
        const requiredFields = ['name', 'unit_price'];
        for (const field of requiredFields) {
            if (!productData[field] && productData[field] !== 0) {
                console.log(`Validation failed: ${field} is missing or empty`);
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }
        
        // Validate unit_price is a valid number
        if (isNaN(parseFloat(productData.unit_price))) {
            console.log('Validation failed: unit_price is not a valid number');
            return res.status(400).json({
                success: false,
                message: 'Unit price must be a valid number'
            });
        }
        
        // Ensure unit_price is a number
        productData.unit_price = parseFloat(productData.unit_price);
        
        // Validate category and supplier (allow N/A or empty)
        if (!productData.category || productData.category.trim() === '') {
            productData.category = 'N/A';
        }
        
        if (!productData.supplier || productData.supplier.trim() === '') {
            productData.supplier = 'N/A';
        }

        // Generate product code if not provided
        if (!productData.product_code) {
            productData.product_code = await Product.generateProductCode();
        }

        const product = new Product(productData);
        console.log('About to save product:', JSON.stringify(product, null, 2));
        
        await product.save();
        console.log('Product saved successfully:', product.id);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        console.error('Error stack:', error.stack);
        
        // Check for specific database errors
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({
                success: false,
                message: 'Product code already exists. Please try again.',
                error: 'DUPLICATE_PRODUCT_CODE'
            });
        }
        
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
        // Convert frontend camelCase to backend snake_case
        const updateData = convertProductToBackend(req.body);
        
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