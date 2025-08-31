const database = require('../database/init');
const moment = require('moment');

class Payment {
    constructor(data = {}) {
        this.id = data.id;
        this.payment_number = data.payment_number;
        this.invoice_id = data.invoice_id;
        this.patient_id = data.patient_id;
        this.payment_date = data.payment_date;
        this.amount = data.amount || 0;
        this.payment_method = data.payment_method;
        this.payment_reference = data.payment_reference;
        this.transaction_id = data.transaction_id;
        this.status = data.status || 'completed';
        this.notes = data.notes;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.created_by = data.created_by;
    }

    /**
     * Generate a unique payment number
     */
    static async generatePaymentNumber() {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const prefix = `PAY${year}${month}`;
        
        // Get the last payment number for this month
        const lastPayment = await database.get(
            'SELECT payment_number FROM payments WHERE payment_number LIKE ? ORDER BY payment_number DESC LIMIT 1',
            [`${prefix}%`]
        );
        
        let nextNumber = 1;
        if (lastPayment) {
            const lastNumber = parseInt(lastPayment.payment_number.replace(prefix, ''));
            nextNumber = lastNumber + 1;
        }
        
        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Create a new payment
     */
    async save() {
        try {
            if (!this.payment_number) {
                this.payment_number = await Payment.generatePaymentNumber();
            }

            if (!this.payment_date) {
                this.payment_date = moment().format('YYYY-MM-DD');
            }

            const sql = `
                INSERT INTO payments (
                    payment_number, invoice_id, patient_id, payment_date, amount,
                    payment_method, payment_reference, transaction_id, status, notes, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                this.payment_number, this.invoice_id, this.patient_id, this.payment_date,
                this.amount, this.payment_method, this.payment_reference, this.transaction_id,
                this.status, this.notes, this.created_by
            ];

            const result = await database.run(sql, params);
            this.id = result.id;
            return this;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    /**
     * Update an existing payment
     */
    async update() {
        try {
            const sql = `
                UPDATE payments SET
                    invoice_id = ?, patient_id = ?, payment_date = ?, amount = ?,
                    payment_method = ?, payment_reference = ?, transaction_id = ?,
                    status = ?, notes = ?
                WHERE id = ?
            `;

            const params = [
                this.invoice_id, this.patient_id, this.payment_date, this.amount,
                this.payment_method, this.payment_reference, this.transaction_id,
                this.status, this.notes, this.id
            ];

            await database.run(sql, params);
            return this;
        } catch (error) {
            console.error('Error updating payment:', error);
            throw error;
        }
    }

    /**
     * Find payment by ID
     */
    static async findById(id) {
        try {
            const sql = `
                SELECT p.*, 
                       i.invoice_number, i.total_amount as invoice_total,
                       pt.first_name as patient_first_name, pt.last_name as patient_last_name, 
                       pt.patient_number
                FROM payments p
                LEFT JOIN invoices i ON p.invoice_id = i.id
                LEFT JOIN patients pt ON p.patient_id = pt.id
                WHERE p.id = ?
            `;
            
            const row = await database.get(sql, [id]);
            return row ? new Payment(row) : null;
        } catch (error) {
            console.error('Error finding payment by ID:', error);
            throw error;
        }
    }

    /**
     * Find payment by payment number
     */
    static async findByPaymentNumber(paymentNumber) {
        try {
            const sql = `
                SELECT p.*, 
                       i.invoice_number, i.total_amount as invoice_total,
                       pt.first_name as patient_first_name, pt.last_name as patient_last_name, 
                       pt.patient_number
                FROM payments p
                LEFT JOIN invoices i ON p.invoice_id = i.id
                LEFT JOIN patients pt ON p.patient_id = pt.id
                WHERE p.payment_number = ?
            `;
            
            const row = await database.get(sql, [paymentNumber]);
            return row ? new Payment(row) : null;
        } catch (error) {
            console.error('Error finding payment by payment number:', error);
            throw error;
        }
    }

    /**
     * Get payments for a specific invoice
     */
    static async findByInvoice(invoiceId, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT p.*, 
                       i.invoice_number, i.total_amount as invoice_total,
                       pt.first_name as patient_first_name, pt.last_name as patient_last_name, 
                       pt.patient_number
                FROM payments p
                LEFT JOIN invoices i ON p.invoice_id = i.id
                LEFT JOIN patients pt ON p.patient_id = pt.id
                WHERE p.invoice_id = ?
                ORDER BY p.payment_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [invoiceId, limit, offset]);
            return rows.map(row => new Payment(row));
        } catch (error) {
            console.error('Error finding payments by invoice:', error);
            throw error;
        }
    }

    /**
     * Get payments for a specific patient
     */
    static async findByPatient(patientId, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT p.*, 
                       i.invoice_number, i.total_amount as invoice_total,
                       pt.first_name as patient_first_name, pt.last_name as patient_last_name, 
                       pt.patient_number
                FROM payments p
                LEFT JOIN invoices i ON p.invoice_id = i.id
                LEFT JOIN patients pt ON p.patient_id = pt.id
                WHERE p.patient_id = ?
                ORDER BY p.payment_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [patientId, limit, offset]);
            return rows.map(row => new Payment(row));
        } catch (error) {
            console.error('Error finding payments by patient:', error);
            throw error;
        }
    }

    /**
     * Get payments by date range
     */
    static async findByDateRange(startDate, endDate, limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT p.*, 
                       i.invoice_number, i.total_amount as invoice_total,
                       pt.first_name as patient_first_name, pt.last_name as patient_last_name, 
                       pt.patient_number
                FROM payments p
                LEFT JOIN invoices i ON p.invoice_id = i.id
                LEFT JOIN patients pt ON p.patient_id = pt.id
                WHERE p.payment_date BETWEEN ? AND ?
                ORDER BY p.payment_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [startDate, endDate, limit, offset]);
            return rows.map(row => new Payment(row));
        } catch (error) {
            console.error('Error finding payments by date range:', error);
            throw error;
        }
    }

    /**
     * Get payments by payment method
     */
    static async findByPaymentMethod(paymentMethod, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT p.*, 
                       i.invoice_number, i.total_amount as invoice_total,
                       pt.first_name as patient_first_name, pt.last_name as patient_last_name, 
                       pt.patient_number
                FROM payments p
                LEFT JOIN invoices i ON p.invoice_id = i.id
                LEFT JOIN patients pt ON p.patient_id = pt.id
                WHERE p.payment_method = ?
                ORDER BY p.payment_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [paymentMethod, limit, offset]);
            return rows.map(row => new Payment(row));
        } catch (error) {
            console.error('Error finding payments by payment method:', error);
            throw error;
        }
    }

    /**
     * Get payments by status
     */
    static async findByStatus(status, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT p.*, 
                       i.invoice_number, i.total_amount as invoice_total,
                       pt.first_name as patient_first_name, pt.last_name as patient_last_name, 
                       pt.patient_number
                FROM payments p
                LEFT JOIN invoices i ON p.invoice_id = i.id
                LEFT JOIN patients pt ON p.patient_id = pt.id
                WHERE p.status = ?
                ORDER BY p.payment_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [status, limit, offset]);
            return rows.map(row => new Payment(row));
        } catch (error) {
            console.error('Error finding payments by status:', error);
            throw error;
        }
    }

    /**
     * Get all payments
     */
    static async findAll(limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT p.*, 
                       i.invoice_number, i.total_amount as invoice_total,
                       pt.first_name as patient_first_name, pt.last_name as patient_last_name, 
                       pt.patient_number
                FROM payments p
                LEFT JOIN invoices i ON p.invoice_id = i.id
                LEFT JOIN patients pt ON p.patient_id = pt.id
                ORDER BY p.payment_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [limit, offset]);
            return rows.map(row => new Payment(row));
        } catch (error) {
            console.error('Error finding all payments:', error);
            throw error;
        }
    }

    /**
     * Search payments
     */
    static async search(searchTerm, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT p.*, 
                       i.invoice_number, i.total_amount as invoice_total,
                       pt.first_name as patient_first_name, pt.last_name as patient_last_name, 
                       pt.patient_number
                FROM payments p
                LEFT JOIN invoices i ON p.invoice_id = i.id
                LEFT JOIN patients pt ON p.patient_id = pt.id
                WHERE p.payment_number LIKE ? 
                   OR i.invoice_number LIKE ?
                   OR pt.first_name LIKE ? 
                   OR pt.last_name LIKE ?
                   OR pt.patient_number LIKE ?
                   OR p.payment_reference LIKE ?
                   OR p.transaction_id LIKE ?
                ORDER BY p.payment_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const searchPattern = `%${searchTerm}%`;
            const params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, limit, offset];
            
            const rows = await database.all(sql, params);
            return rows.map(row => new Payment(row));
        } catch (error) {
            console.error('Error searching payments:', error);
            throw error;
        }
    }

    /**
     * Void/cancel a payment
     */
    async void(reason = null) {
        try {
            this.status = 'voided';
            if (reason) {
                this.notes = this.notes 
                    ? `${this.notes}\n\nVoid reason: ${reason}`
                    : `Void reason: ${reason}`;
            }
            await this.update();
            return this;
        } catch (error) {
            console.error('Error voiding payment:', error);
            throw error;
        }
    }

    /**
     * Refund a payment
     */
    async refund(refundAmount = null, reason = null) {
        try {
            const amount = refundAmount || this.amount;
            
            // Create refund payment record
            const refundPayment = new Payment({
                invoice_id: this.invoice_id,
                patient_id: this.patient_id,
                amount: -amount, // Negative amount for refund
                payment_method: this.payment_method,
                payment_reference: `REFUND-${this.payment_number}`,
                status: 'completed',
                notes: reason ? `Refund for ${this.payment_number}: ${reason}` : `Refund for ${this.payment_number}`,
                created_by: this.created_by
            });
            
            await refundPayment.save();
            
            // Update original payment status
            this.status = 'refunded';
            if (reason) {
                this.notes = this.notes 
                    ? `${this.notes}\n\nRefund reason: ${reason}`
                    : `Refund reason: ${reason}`;
            }
            await this.update();
            
            return refundPayment;
        } catch (error) {
            console.error('Error refunding payment:', error);
            throw error;
        }
    }

    /**
     * Get payment statistics
     */
    static async getStats(startDate = null, endDate = null) {
        try {
            let whereClause = '';
            const params = [];
            
            if (startDate && endDate) {
                whereClause = 'WHERE payment_date BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }
            
            const methodStats = await database.all(`
                SELECT payment_method, COUNT(*) as count, SUM(amount) as total_amount
                FROM payments 
                ${whereClause} AND status = 'completed'
                GROUP BY payment_method
            `, params);
            
            const statusStats = await database.all(`
                SELECT status, COUNT(*) as count, SUM(amount) as total_amount
                FROM payments 
                ${whereClause}
                GROUP BY status
            `, params);
            
            const totalStats = await database.get(`
                SELECT 
                    COUNT(*) as total_payments,
                    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_received,
                    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_refunded,
                    AVG(CASE WHEN amount > 0 THEN amount ELSE NULL END) as average_payment
                FROM payments 
                ${whereClause} AND status = 'completed'
            `, params);
            
            const dailyStats = await database.all(`
                SELECT 
                    payment_date,
                    COUNT(*) as payment_count,
                    SUM(amount) as daily_total
                FROM payments 
                ${whereClause} AND status = 'completed'
                GROUP BY payment_date
                ORDER BY payment_date DESC
                LIMIT 30
            `, params);
            
            return {
                total_payments: totalStats.total_payments || 0,
                total_received: totalStats.total_received || 0,
                total_refunded: totalStats.total_refunded || 0,
                average_payment: totalStats.average_payment || 0,
                by_method: methodStats,
                by_status: statusStats,
                daily_stats: dailyStats
            };
        } catch (error) {
            console.error('Error getting payment stats:', error);
            throw error;
        }
    }

    /**
     * Get count of payments
     */
    static async getCount(filters = {}) {
        try {
            let whereClause = 'WHERE 1=1';
            const params = [];
            
            if (filters.patient_id) {
                whereClause += ' AND patient_id = ?';
                params.push(filters.patient_id);
            }
            
            if (filters.invoice_id) {
                whereClause += ' AND invoice_id = ?';
                params.push(filters.invoice_id);
            }
            
            if (filters.status) {
                whereClause += ' AND status = ?';
                params.push(filters.status);
            }
            
            if (filters.payment_method) {
                whereClause += ' AND payment_method = ?';
                params.push(filters.payment_method);
            }
            
            if (filters.start_date && filters.end_date) {
                whereClause += ' AND payment_date BETWEEN ? AND ?';
                params.push(filters.start_date, filters.end_date);
            }
            
            const result = await database.get(`SELECT COUNT(*) as count FROM payments ${whereClause}`, params);
            return result.count;
        } catch (error) {
            console.error('Error getting payment count:', error);
            throw error;
        }
    }

    /**
     * Get formatted amount
     */
    getFormattedAmount() {
        return `$${Math.abs(parseFloat(this.amount)).toFixed(2)}`;
    }

    /**
     * Check if payment is a refund
     */
    isRefund() {
        return this.amount < 0;
    }

    /**
     * Get payment type (payment or refund)
     */
    getType() {
        return this.amount < 0 ? 'refund' : 'payment';
    }

    /**
     * Get formatted payment date
     */
    getFormattedDate() {
        return moment(this.payment_date).format('MMM DD, YYYY');
    }

    /**
     * Convert to JSON (for API responses)
     */
    toJSON() {
        return {
            id: this.id,
            payment_number: this.payment_number,
            invoice_id: this.invoice_id,
            patient_id: this.patient_id,
            payment_date: this.payment_date,
            formatted_date: this.getFormattedDate(),
            amount: this.amount,
            formatted_amount: this.getFormattedAmount(),
            payment_method: this.payment_method,
            payment_reference: this.payment_reference,
            transaction_id: this.transaction_id,
            status: this.status,
            notes: this.notes,
            is_refund: this.isRefund(),
            type: this.getType(),
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Payment;