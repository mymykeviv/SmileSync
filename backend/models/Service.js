const database = require('../database/init');

class Service {
    constructor(data = {}) {
        this.id = data.id;
        this.service_code = data.service_code;
        this.name = data.name;
        this.description = data.description;
        this.category = data.category;
        this.duration_minutes = data.duration_minutes || 60;
        this.base_price = data.base_price;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Generate a unique service code
     */
    static async generateServiceCode() {
        try {
            const result = await database.get(
                'SELECT COUNT(*) as count FROM services'
            );
            const count = result.count + 1;
            return `SRV-${count.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error('Error generating service code:', error);
            throw error;
        }
    }

    /**
     * Create a new service
     */
    async save() {
        try {
            const sql = `
                INSERT INTO services (
                    service_code, name, description, category, duration_minutes, base_price, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                this.service_code, this.name, this.description, this.category,
                this.duration_minutes, this.base_price, this.is_active
            ];

            const result = await database.run(sql, params);
            this.id = result.id;
            return this;
        } catch (error) {
            console.error('Error creating service:', error);
            throw error;
        }
    }

    /**
     * Update an existing service
     */
    async update() {
        try {
            const sql = `
                UPDATE services SET
                    service_code = ?, name = ?, description = ?, category = ?,
                    duration_minutes = ?, base_price = ?, is_active = ?
                WHERE id = ?
            `;

            const params = [
                this.service_code, this.name, this.description, this.category,
                this.duration_minutes, this.base_price, this.is_active, this.id
            ];

            await database.run(sql, params);
            return this;
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    }

    /**
     * Find service by ID
     */
    static async findById(id) {
        try {
            const row = await database.get('SELECT * FROM services WHERE id = ?', [id]);
            return row ? new Service(row) : null;
        } catch (error) {
            console.error('Error finding service by ID:', error);
            throw error;
        }
    }

    /**
     * Find service by service code
     */
    static async findByServiceCode(serviceCode) {
        try {
            const row = await database.get('SELECT * FROM services WHERE service_code = ?', [serviceCode]);
            return row ? new Service(row) : null;
        } catch (error) {
            console.error('Error finding service by service code:', error);
            throw error;
        }
    }

    /**
     * Search services by name or description
     */
    static async search(query, limit = 50, offset = 0) {
        try {
            const searchTerm = `%${query}%`;
            const sql = `
                SELECT * FROM services 
                WHERE (name LIKE ? OR description LIKE ? OR service_code LIKE ?)
                AND is_active = 1
                ORDER BY name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [searchTerm, searchTerm, searchTerm, limit, offset]);
            return rows.map(row => new Service(row));
        } catch (error) {
            console.error('Error searching services:', error);
            throw error;
        }
    }

    /**
     * Get all services with search, filter, and pagination
     */
    static async findAll(options = {}) {
        try {
            const {
                search,
                category,
                status,
                sortBy = 'name',
                sortOrder = 'asc',
                limit = 100,
                offset = 0
            } = options;

            let sql = 'SELECT * FROM services WHERE 1=1';
            const params = [];

            // Search filter
            if (search) {
                sql += ' AND (name LIKE ? OR description LIKE ? OR service_code LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            // Category filter
            if (category) {
                sql += ' AND category = ?';
                params.push(category);
            }

            // Status filter
            if (status !== undefined) {
                if (status === 'active') {
                    sql += ' AND is_active = 1';
                } else if (status === 'inactive') {
                    sql += ' AND is_active = 0';
                }
            }

            // Sorting
            const validSortFields = ['name', 'category', 'base_price', 'duration_minutes', 'created_at'];
            const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
            const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            sql += ` ORDER BY ${sortField} ${order}`;

            // Pagination
            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const rows = await database.all(sql, params);
            return rows.map(row => new Service(row));
        } catch (error) {
            console.error('Error finding services:', error);
            throw error;
        }
    }

    /**
     * Get services by category
     */
    static async findByCategory(category, limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT * FROM services 
                WHERE category = ? AND is_active = 1 
                ORDER BY name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [category, limit, offset]);
            return rows.map(row => new Service(row));
        } catch (error) {
            console.error('Error finding services by category:', error);
            throw error;
        }
    }

    /**
     * Get all service categories
     */
    static async getCategories() {
        try {
            const sql = `
                SELECT DISTINCT category 
                FROM services 
                WHERE is_active = 1 AND category IS NOT NULL
                ORDER BY category
            `;
            
            const rows = await database.all(sql);
            return rows.map(row => row.category);
        } catch (error) {
            console.error('Error getting service categories:', error);
            throw error;
        }
    }

    /**
     * Get service count with filters
     */
    static async getCount(options = {}) {
        try {
            const { search, category, status } = options;
            
            let sql = 'SELECT COUNT(*) as count FROM services WHERE 1=1';
            const params = [];

            // Search filter
            if (search) {
                sql += ' AND (name LIKE ? OR description LIKE ? OR service_code LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            // Category filter
            if (category) {
                sql += ' AND category = ?';
                params.push(category);
            }

            // Status filter
            if (status !== undefined) {
                if (status === 'active') {
                    sql += ' AND is_active = 1';
                } else if (status === 'inactive') {
                    sql += ' AND is_active = 0';
                }
            }

            const result = await database.get(sql, params);
            return result.count;
        } catch (error) {
            console.error('Error getting service count:', error);
            throw error;
        }
    }

    /**
     * Get service count (legacy method for backward compatibility)
     */
    static async getCountLegacy(activeOnly = true) {
        try {
            const sql = activeOnly 
                ? 'SELECT COUNT(*) as count FROM services WHERE is_active = 1'
                : 'SELECT COUNT(*) as count FROM services';
            
            const result = await database.get(sql);
            return result.count;
        } catch (error) {
            console.error('Error getting service count:', error);
            throw error;
        }
    }

    /**
     * Soft delete a service
     */
    async delete() {
        try {
            this.is_active = false;
            await this.update();
            return this;
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    }

    /**
     * Get services with price range
     */
    static async findByPriceRange(minPrice, maxPrice, limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT * FROM services 
                WHERE base_price BETWEEN ? AND ? AND is_active = 1 
                ORDER BY base_price
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [minPrice, maxPrice, limit, offset]);
            return rows.map(row => new Service(row));
        } catch (error) {
            console.error('Error finding services by price range:', error);
            throw error;
        }
    }

    /**
     * Get most popular services (based on usage in appointments/invoices)
     */
    static async getMostPopular(limit = 10) {
        try {
            const sql = `
                SELECT s.*, COUNT(ii.item_id) as usage_count
                FROM services s
                LEFT JOIN invoice_items ii ON s.id = ii.item_id AND ii.item_type = 'service'
                WHERE s.is_active = 1
                GROUP BY s.id
                ORDER BY usage_count DESC, s.name
                LIMIT ?
            `;
            
            const rows = await database.all(sql, [limit]);
            return rows.map(row => {
                const service = new Service(row);
                service.usage_count = row.usage_count;
                return service;
            });
        } catch (error) {
            console.error('Error getting most popular services:', error);
            throw error;
        }
    }

    /**
     * Get service statistics
     */
    static async getStats() {
        try {
            const totalServices = await database.get(
                'SELECT COUNT(*) as count FROM services WHERE is_active = 1'
            );
            
            const categoryStats = await database.all(`
                SELECT category, COUNT(*) as count, AVG(base_price) as avg_price
                FROM services 
                WHERE is_active = 1 AND category IS NOT NULL
                GROUP BY category
                ORDER BY count DESC
            `);
            
            const priceStats = await database.get(`
                SELECT 
                    MIN(base_price) as min_price,
                    MAX(base_price) as max_price,
                    AVG(base_price) as avg_price
                FROM services 
                WHERE is_active = 1
            `);
            
            return {
                total_services: totalServices.count,
                categories: categoryStats,
                price_range: {
                    min: priceStats.min_price,
                    max: priceStats.max_price,
                    average: Math.round(priceStats.avg_price * 100) / 100
                }
            };
        } catch (error) {
            console.error('Error getting service stats:', error);
            throw error;
        }
    }

    /**
     * Bulk create services
     */
    static async bulkCreate(services) {
        try {
            const statements = services.map(service => ({
                sql: `
                    INSERT INTO services (
                        service_code, name, description, category, duration_minutes, base_price, is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                params: [
                    service.service_code, service.name, service.description, service.category,
                    service.duration_minutes || 60, service.base_price, service.is_active !== undefined ? service.is_active : true
                ]
            }));
            
            const results = await database.transaction(statements);
            return results;
        } catch (error) {
            console.error('Error bulk creating services:', error);
            throw error;
        }
    }

    /**
     * Get formatted price
     */
    getFormattedPrice() {
        return `$${parseFloat(this.base_price).toFixed(2)}`;
    }

    /**
     * Get formatted duration
     */
    getFormattedDuration() {
        const hours = Math.floor(this.duration_minutes / 60);
        const minutes = this.duration_minutes % 60;
        
        if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${minutes}m`;
        }
    }

    /**
     * Convert to JSON (for API responses)
     */
    toJSON() {
        return {
            id: this.id,
            service_code: this.service_code,
            name: this.name,
            description: this.description,
            category: this.category,
            duration_minutes: this.duration_minutes,
            formatted_duration: this.getFormattedDuration(),
            base_price: this.base_price,
            formatted_price: this.getFormattedPrice(),
            is_active: this.is_active,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Service;