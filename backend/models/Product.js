const database = require('../database/init');

class Product {
    constructor(data = {}) {
        this.id = data.id;
        this.product_code = data.product_code;
        this.name = data.name;
        this.description = data.description;
        this.category = data.category;
        this.unit_price = data.unit_price;
        this.unit_of_measure = data.unit_of_measure || 'each';
        this.current_stock = data.current_stock || 0;
        this.minimum_stock = data.minimum_stock || 0;
        this.supplier = data.supplier;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Generate a unique product code
     */
    static async generateProductCode() {
        try {
            const result = await database.get('SELECT COUNT(*) as count FROM products');
            const count = result.count + 1;
            return `PROD${count.toString().padStart(4, '0')}`;
        } catch (error) {
            console.error('Error generating product code:', error);
            throw error;
        }
    }

    /**
     * Create a new product
     */
    async save() {
        try {
            const sql = `
                INSERT INTO products (
                    product_code, name, description, category, unit_price, unit_of_measure,
                    current_stock, minimum_stock, supplier, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                this.product_code, this.name, this.description, this.category, this.unit_price,
                this.unit_of_measure, this.current_stock, this.minimum_stock, this.supplier, this.is_active
            ];

            const result = await database.run(sql, params);
            this.id = result.id;
            return this;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    /**
     * Update an existing product
     */
    async update() {
        try {
            const sql = `
                UPDATE products SET
                    product_code = ?, name = ?, description = ?, category = ?, unit_price = ?,
                    unit_of_measure = ?, current_stock = ?, minimum_stock = ?, supplier = ?, is_active = ?
                WHERE id = ?
            `;

            const params = [
                this.product_code, this.name, this.description, this.category, this.unit_price,
                this.unit_of_measure, this.current_stock, this.minimum_stock, this.supplier, this.is_active,
                this.id
            ];

            await database.run(sql, params);
            return this;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    /**
     * Find product by ID
     */
    static async findById(id) {
        try {
            const row = await database.get('SELECT * FROM products WHERE id = ?', [id]);
            return row ? new Product(row) : null;
        } catch (error) {
            console.error('Error finding product by ID:', error);
            throw error;
        }
    }

    /**
     * Find product by product code
     */
    static async findByProductCode(productCode) {
        try {
            const row = await database.get('SELECT * FROM products WHERE product_code = ?', [productCode]);
            return row ? new Product(row) : null;
        } catch (error) {
            console.error('Error finding product by product code:', error);
            throw error;
        }
    }

    /**
     * Search products by name or description
     */
    static async search(query, limit = 50, offset = 0) {
        try {
            const searchTerm = `%${query}%`;
            const sql = `
                SELECT * FROM products 
                WHERE (name LIKE ? OR description LIKE ? OR product_code LIKE ?)
                AND is_active = 1
                ORDER BY name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [searchTerm, searchTerm, searchTerm, limit, offset]);
            return rows.map(row => new Product(row));
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    /**
     * Get all active products
     */
    static async findAll(options = {}) {
        try {
            const {
                search,
                category,
                supplier,
                status,
                lowStock = false,
                sortBy = 'name',
                sortOrder = 'asc',
                limit = 100,
                offset = 0
            } = options;

            let sql = 'SELECT * FROM products WHERE 1=1';
            const params = [];

            // Apply filters
            if (search) {
                sql += ' AND (name LIKE ? OR description LIKE ? OR product_code LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            if (category) {
                sql += ' AND category = ?';
                params.push(category);
            }

            if (supplier) {
                sql += ' AND supplier = ?';
                params.push(supplier);
            }

            if (status !== undefined) {
                sql += ' AND is_active = ?';
                params.push(status === 'active' ? 1 : 0);
            }

            if (lowStock) {
                sql += ' AND current_stock <= minimum_stock';
            }

            // Apply sorting
            const validSortFields = ['name', 'category', 'unit_price', 'current_stock', 'created_at'];
            const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
            const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            sql += ` ORDER BY ${sortField} ${order}`;

            // Apply pagination
            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);
            
            const rows = await database.all(sql, params);
            return rows.map(row => new Product(row));
        } catch (error) {
            console.error('Error finding all products:', error);
            throw error;
        }
    }

    /**
     * Get products by category
     */
    static async findByCategory(category, limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT * FROM products 
                WHERE category = ? AND is_active = 1 
                ORDER BY name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [category, limit, offset]);
            return rows.map(row => new Product(row));
        } catch (error) {
            console.error('Error finding products by category:', error);
            throw error;
        }
    }

    /**
     * Get all product categories
     */
    static async getCategories() {
        try {
            const sql = `
                SELECT DISTINCT category 
                FROM products 
                WHERE is_active = 1 AND category IS NOT NULL
                ORDER BY category
            `;
            
            const rows = await database.all(sql);
            return rows.map(row => row.category);
        } catch (error) {
            console.error('Error getting product categories:', error);
            throw error;
        }
    }

    /**
     * Get products with low stock
     */
    static async getLowStock(limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT * FROM products 
                WHERE current_stock <= minimum_stock AND is_active = 1
                ORDER BY (current_stock - minimum_stock), name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [limit, offset]);
            return rows.map(row => new Product(row));
        } catch (error) {
            console.error('Error finding low stock products:', error);
            throw error;
        }
    }

    /**
     * Get products by supplier
     */
    static async findBySupplier(supplier, limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT * FROM products 
                WHERE supplier = ? AND is_active = 1 
                ORDER BY name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [supplier, limit, offset]);
            return rows.map(row => new Product(row));
        } catch (error) {
            console.error('Error finding products by supplier:', error);
            throw error;
        }
    }

    /**
     * Get all suppliers
     */
    static async getSuppliers() {
        try {
            const sql = `
                SELECT DISTINCT supplier 
                FROM products 
                WHERE is_active = 1 AND supplier IS NOT NULL
                ORDER BY supplier
            `;
            
            const rows = await database.all(sql);
            return rows.map(row => row.supplier);
        } catch (error) {
            console.error('Error getting suppliers:', error);
            throw error;
        }
    }

    /**
     * Get product count
     */
    static async getCount(options = {}) {
        try {
            const {
                search,
                category,
                supplier,
                status,
                lowStock = false
            } = options;

            let sql = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
            const params = [];

            // Apply same filters as findAll
            if (search) {
                sql += ' AND (name LIKE ? OR description LIKE ? OR product_code LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            if (category) {
                sql += ' AND category = ?';
                params.push(category);
            }

            if (supplier) {
                sql += ' AND supplier = ?';
                params.push(supplier);
            }

            if (status !== undefined) {
                sql += ' AND is_active = ?';
                params.push(status === 'active' ? 1 : 0);
            }

            if (lowStock) {
                sql += ' AND current_stock <= minimum_stock';
            }
            
            const result = await database.get(sql, params);
            return result.count;
        } catch (error) {
            console.error('Error getting product count:', error);
            throw error;
        }
    }

    // Legacy method for backward compatibility
    static async getCountLegacy(activeOnly = true) {
        try {
            const sql = activeOnly 
                ? 'SELECT COUNT(*) as count FROM products WHERE is_active = 1'
                : 'SELECT COUNT(*) as count FROM products';
            
            const result = await database.get(sql);
            return result.count;
        } catch (error) {
            console.error('Error getting product count:', error);
            throw error;
        }
    }

    /**
     * Soft delete a product
     */
    async delete() {
        try {
            this.is_active = false;
            await this.update();
            return this;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    /**
     * Update stock quantity
     */
    async updateStock(quantity, operation = 'set') {
        try {
            switch (operation) {
                case 'add':
                    this.current_stock += quantity;
                    break;
                case 'subtract':
                    this.current_stock -= quantity;
                    if (this.current_stock < 0) {
                        throw new Error('Insufficient stock');
                    }
                    break;
                case 'set':
                default:
                    this.current_stock = quantity;
                    break;
            }
            
            await this.update();
            return this;
        } catch (error) {
            console.error('Error updating product stock:', error);
            throw error;
        }
    }

    /**
     * Get products with price range
     */
    static async findByPriceRange(minPrice, maxPrice, limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT * FROM products 
                WHERE unit_price BETWEEN ? AND ? AND is_active = 1 
                ORDER BY unit_price
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [minPrice, maxPrice, limit, offset]);
            return rows.map(row => new Product(row));
        } catch (error) {
            console.error('Error finding products by price range:', error);
            throw error;
        }
    }

    /**
     * Get most used products (based on usage in invoices)
     */
    static async getMostUsed(limit = 10) {
        try {
            const sql = `
                SELECT p.*, COUNT(ii.item_id) as usage_count
                FROM products p
                LEFT JOIN invoice_items ii ON p.id = ii.item_id AND ii.item_type = 'product'
                WHERE p.is_active = 1
                GROUP BY p.id
                ORDER BY usage_count DESC, p.name
                LIMIT ?
            `;
            
            const rows = await database.all(sql, [limit]);
            return rows.map(row => {
                const product = new Product(row);
                product.usage_count = row.usage_count;
                return product;
            });
        } catch (error) {
            console.error('Error getting most used products:', error);
            throw error;
        }
    }

    /**
     * Get product statistics
     */
    static async getStats() {
        try {
            const totalProducts = await database.get(
                'SELECT COUNT(*) as count FROM products WHERE is_active = 1'
            );
            
            const lowStockCount = await database.get(
                'SELECT COUNT(*) as count FROM products WHERE current_stock <= minimum_stock AND is_active = 1'
            );
            
            const categoryStats = await database.all(`
                SELECT category, COUNT(*) as count, AVG(unit_price) as avg_price
                FROM products 
                WHERE is_active = 1 AND category IS NOT NULL
                GROUP BY category
                ORDER BY count DESC
            `);
            
            const stockValue = await database.get(`
                SELECT SUM(current_stock * unit_price) as total_value
                FROM products 
                WHERE is_active = 1
            `);
            
            const priceStats = await database.get(`
                SELECT 
                    MIN(unit_price) as min_price,
                    MAX(unit_price) as max_price,
                    AVG(unit_price) as avg_price
                FROM products 
                WHERE is_active = 1
            `);
            
            return {
                total_products: totalProducts.count,
                low_stock_count: lowStockCount.count,
                total_stock_value: Math.round((stockValue.total_value || 0) * 100) / 100,
                categories: categoryStats,
                price_range: {
                    min: priceStats.min_price,
                    max: priceStats.max_price,
                    average: Math.round(priceStats.avg_price * 100) / 100
                }
            };
        } catch (error) {
            console.error('Error getting product stats:', error);
            throw error;
        }
    }

    /**
     * Bulk create products
     */
    static async bulkCreate(products) {
        try {
            const statements = products.map(product => ({
                sql: `
                    INSERT INTO products (
                        product_code, name, description, category, unit_price, unit_of_measure,
                        current_stock, minimum_stock, supplier, is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                params: [
                    product.product_code, product.name, product.description, product.category, product.unit_price,
                    product.unit_of_measure || 'each', product.current_stock || 0, product.minimum_stock || 0,
                    product.supplier, product.is_active !== undefined ? product.is_active : true
                ]
            }));
            
            const results = await database.transaction(statements);
            return results;
        } catch (error) {
            console.error('Error bulk creating products:', error);
            throw error;
        }
    }

    /**
     * Check if product is low stock
     */
    isLowStock() {
        return this.current_stock <= this.minimum_stock;
    }

    /**
     * Check if product is out of stock
     */
    isOutOfStock() {
        return this.current_stock <= 0;
    }

    /**
     * Get stock status
     */
    getStockStatus() {
        if (this.isOutOfStock()) {
            return 'out_of_stock';
        } else if (this.isLowStock()) {
            return 'low_stock';
        } else {
            return 'in_stock';
        }
    }

    /**
     * Get formatted price
     */
    getFormattedPrice() {
        return `₹${parseFloat(this.unit_price).toFixed(2)}`;
    }

    /**
     * Get stock value
     */
    getStockValue() {
        return this.current_stock * this.unit_price;
    }

    /**
     * Get formatted stock value
     */
    getFormattedStockValue() {
        return `₹${this.getStockValue().toFixed(2)}`;
    }

    /**
     * Convert to JSON (for API responses)
     */
    toJSON() {
        return {
            id: this.id,
            productCode: this.product_code,
            name: this.name,
            description: this.description,
            category: this.category,
            unitPrice: this.unit_price,
            formattedPrice: this.getFormattedPrice(),
            unitOfMeasure: this.unit_of_measure,
            currentStock: this.current_stock,
            minimumStock: this.minimum_stock,
            stockStatus: this.getStockStatus(),
            isLowStock: this.isLowStock(),
            isOutOfStock: this.isOutOfStock(),
            stockValue: this.getStockValue(),
            formattedStockValue: this.getFormattedStockValue(),
            supplier: this.supplier,
            isActive: this.is_active,
            createdAt: this.created_at,
            updatedAt: this.updated_at
        };
    }
}

module.exports = Product;