const database = require('../database/init');
const bcrypt = require('bcryptjs');
const moment = require('moment');

class User {
    constructor(data = {}) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.password_hash = data.password_hash;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.role = data.role || 'staff';
        this.phone = data.phone;
        this.license_number = data.license_number;
        this.specialization = data.specialization;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        this.last_login = data.last_login;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.created_by = data.created_by;
    }

    /**
     * Hash password
     */
    static async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Verify password
     */
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.password_hash);
    }

    /**
     * Create a new user
     */
    async save() {
        try {
            const sql = `
                INSERT INTO users (
                    username, email, password_hash, first_name, last_name, role,
                    phone, license_number, specialization, is_active, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                this.username, this.email, this.password_hash, this.first_name, this.last_name,
                this.role, this.phone, this.license_number, this.specialization, this.is_active,
                this.created_by
            ];

            const result = await database.run(sql, params);
            this.id = result.id;
            return this;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Update an existing user
     */
    async update() {
        try {
            const sql = `
                UPDATE users SET
                    username = ?, email = ?, first_name = ?, last_name = ?, role = ?,
                    phone = ?, license_number = ?, specialization = ?, is_active = ?
                WHERE id = ?
            `;

            const params = [
                this.username, this.email, this.first_name, this.last_name, this.role,
                this.phone, this.license_number, this.specialization, this.is_active, this.id
            ];

            await database.run(sql, params);
            return this;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Update password
     */
    async updatePassword(newPassword) {
        try {
            this.password_hash = await User.hashPassword(newPassword);
            await database.run('UPDATE users SET password_hash = ? WHERE id = ?', [this.password_hash, this.id]);
            return this;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    /**
     * Update last login timestamp
     */
    async updateLastLogin() {
        try {
            this.last_login = moment().format('YYYY-MM-DD HH:mm:ss');
            await database.run('UPDATE users SET last_login = ? WHERE id = ?', [this.last_login, this.id]);
            return this;
        } catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        try {
            const sql = 'SELECT * FROM users WHERE id = ?';
            const row = await database.get(sql, [id]);
            return row ? new User(row) : null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    /**
     * Find user by username
     */
    static async findByUsername(username) {
        try {
            const sql = 'SELECT * FROM users WHERE username = ?';
            const row = await database.get(sql, [username]);
            return row ? new User(row) : null;
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        try {
            const sql = 'SELECT * FROM users WHERE email = ?';
            const row = await database.get(sql, [email]);
            return row ? new User(row) : null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    /**
     * Find users by role
     */
    static async findByRole(role, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT * FROM users 
                WHERE role = ? AND is_active = 1
                ORDER BY first_name, last_name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [role, limit, offset]);
            return rows.map(row => new User(row));
        } catch (error) {
            console.error('Error finding users by role:', error);
            throw error;
        }
    }

    /**
     * Get all active users
     */
    static async findAllActive(limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT * FROM users 
                WHERE is_active = 1
                ORDER BY first_name, last_name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [limit, offset]);
            return rows.map(row => new User(row));
        } catch (error) {
            console.error('Error finding all active users:', error);
            throw error;
        }
    }

    /**
     * Get all users
     */
    static async findAll(limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT * FROM users 
                ORDER BY first_name, last_name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [limit, offset]);
            return rows.map(row => new User(row));
        } catch (error) {
            console.error('Error finding all users:', error);
            throw error;
        }
    }

    /**
     * Search users
     */
    static async search(searchTerm, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT * FROM users 
                WHERE (first_name LIKE ? OR last_name LIKE ? OR username LIKE ? OR email LIKE ? OR license_number LIKE ?)
                  AND is_active = 1
                ORDER BY first_name, last_name
                LIMIT ? OFFSET ?
            `;
            
            const searchPattern = `%${searchTerm}%`;
            const params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, limit, offset];
            
            const rows = await database.all(sql, params);
            return rows.map(row => new User(row));
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }

    /**
     * Get dentists only
     */
    static async getDentists(limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT * FROM users 
                WHERE role = 'dentist' AND is_active = 1
                ORDER BY first_name, last_name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [limit, offset]);
            return rows.map(row => new User(row));
        } catch (error) {
            console.error('Error getting dentists:', error);
            throw error;
        }
    }

    /**
     * Authenticate user
     */
    static async authenticate(username, password) {
        try {
            const user = await User.findByUsername(username) || await User.findByEmail(username);
            
            if (!user) {
                return null;
            }
            
            if (!user.is_active) {
                throw new Error('User account is deactivated');
            }
            
            const isValidPassword = await user.verifyPassword(password);
            if (!isValidPassword) {
                return null;
            }
            
            // Update last login
            await user.updateLastLogin();
            
            return user;
        } catch (error) {
            console.error('Error authenticating user:', error);
            throw error;
        }
    }

    /**
     * Check if username exists
     */
    static async usernameExists(username, excludeId = null) {
        try {
            let sql = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
            const params = [username];
            
            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }
            
            const result = await database.get(sql, params);
            return result.count > 0;
        } catch (error) {
            console.error('Error checking username existence:', error);
            throw error;
        }
    }

    /**
     * Check if email exists
     */
    static async emailExists(email, excludeId = null) {
        try {
            let sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
            const params = [email];
            
            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }
            
            const result = await database.get(sql, params);
            return result.count > 0;
        } catch (error) {
            console.error('Error checking email existence:', error);
            throw error;
        }
    }

    /**
     * Deactivate user
     */
    async deactivate() {
        try {
            this.is_active = false;
            await database.run('UPDATE users SET is_active = 0 WHERE id = ?', [this.id]);
            return this;
        } catch (error) {
            console.error('Error deactivating user:', error);
            throw error;
        }
    }

    /**
     * Activate user
     */
    async activate() {
        try {
            this.is_active = true;
            await database.run('UPDATE users SET is_active = 1 WHERE id = ?', [this.id]);
            return this;
        } catch (error) {
            console.error('Error activating user:', error);
            throw error;
        }
    }

    /**
     * Get user's appointments
     */
    async getAppointments(startDate = null, endDate = null, limit = 50, offset = 0) {
        try {
            let sql = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number, p.phone
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                WHERE a.dentist_id = ?
            `;
            
            const params = [this.id];
            
            if (startDate && endDate) {
                sql += ' AND a.appointment_date BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }
            
            sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);
            
            return await database.all(sql, params);
        } catch (error) {
            console.error('Error getting user appointments:', error);
            throw error;
        }
    }

    /**
     * Get user's treatment plans
     */
    async getTreatmentPlans(status = null, limit = 50, offset = 0) {
        try {
            let sql = `
                SELECT tp.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number
                FROM treatment_plans tp
                LEFT JOIN patients p ON tp.patient_id = p.id
                WHERE tp.dentist_id = ?
            `;
            
            const params = [this.id];
            
            if (status) {
                sql += ' AND tp.status = ?';
                params.push(status);
            }
            
            sql += ' ORDER BY tp.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);
            
            return await database.all(sql, params);
        } catch (error) {
            console.error('Error getting user treatment plans:', error);
            throw error;
        }
    }

    /**
     * Get user statistics
     */
    async getStats(startDate = null, endDate = null) {
        try {
            let whereClause = 'WHERE dentist_id = ?';
            const params = [this.id];
            
            if (startDate && endDate) {
                whereClause += ' AND appointment_date BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }
            
            const appointmentStats = await database.get(`
                SELECT 
                    COUNT(*) as total_appointments,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_appointments,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_appointments,
                    SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_show_appointments
                FROM appointments 
                ${whereClause}
            `, params);
            
            const treatmentPlanStats = await database.get(`
                SELECT 
                    COUNT(*) as total_treatment_plans,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_plans,
                    SUM(estimated_cost) as total_estimated_value
                FROM treatment_plans 
                WHERE dentist_id = ?
                ${startDate && endDate ? 'AND created_at BETWEEN ? AND ?' : ''}
            `, startDate && endDate ? [this.id, startDate, endDate] : [this.id]);
            
            return {
                appointments: appointmentStats,
                treatment_plans: treatmentPlanStats
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    /**
     * Get user count by role
     */
    static async getCountByRole() {
        try {
            const sql = `
                SELECT role, COUNT(*) as count
                FROM users 
                WHERE is_active = 1
                GROUP BY role
            `;
            
            return await database.all(sql);
        } catch (error) {
            console.error('Error getting user count by role:', error);
            throw error;
        }
    }

    /**
     * Get total user count
     */
    static async getCount(filters = {}) {
        try {
            let whereClause = 'WHERE 1=1';
            const params = [];
            
            if (filters.role) {
                whereClause += ' AND role = ?';
                params.push(filters.role);
            }
            
            if (filters.is_active !== undefined) {
                whereClause += ' AND is_active = ?';
                params.push(filters.is_active ? 1 : 0);
            }
            
            const result = await database.get(`SELECT COUNT(*) as count FROM users ${whereClause}`, params);
            return result.count;
        } catch (error) {
            console.error('Error getting user count:', error);
            throw error;
        }
    }

    /**
     * Get full name
     */
    getFullName() {
        return `${this.first_name} ${this.last_name}`.trim();
    }

    /**
     * Get display name (with title for dentists)
     */
    getDisplayName() {
        const fullName = this.getFullName();
        return this.role === 'dentist' ? `Dr. ${fullName}` : fullName;
    }

    /**
     * Check if user has permission
     */
    hasPermission(permission) {
        const rolePermissions = {
            'admin': ['all'],
            'dentist': ['patients', 'appointments', 'treatment_plans', 'invoices', 'reports'],
            'hygienist': ['patients', 'appointments', 'basic_reports'],
            'receptionist': ['patients', 'appointments', 'invoices'],
            'staff': ['patients', 'appointments']
        };
        
        const userPermissions = rolePermissions[this.role] || [];
        return userPermissions.includes('all') || userPermissions.includes(permission);
    }

    /**
     * Get formatted last login
     */
    getFormattedLastLogin() {
        return this.last_login ? moment(this.last_login).format('MMM DD, YYYY HH:mm') : 'Never';
    }

    /**
     * Convert to JSON (for API responses) - excludes sensitive data
     */
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            first_name: this.first_name,
            last_name: this.last_name,
            full_name: this.getFullName(),
            display_name: this.getDisplayName(),
            role: this.role,
            phone: this.phone,
            license_number: this.license_number,
            specialization: this.specialization,
            is_active: this.is_active,
            last_login: this.last_login,
            formatted_last_login: this.getFormattedLastLogin(),
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    /**
     * Convert to safe JSON (for public API responses) - excludes more sensitive data
     */
    toSafeJSON() {
        return {
            id: this.id,
            first_name: this.first_name,
            last_name: this.last_name,
            full_name: this.getFullName(),
            display_name: this.getDisplayName(),
            role: this.role,
            specialization: this.specialization
        };
    }
}

module.exports = User;