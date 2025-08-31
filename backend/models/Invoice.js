const database = require('../database/init');
const moment = require('moment');

class Invoice {
    constructor(data = {}) {
        this.id = data.id;
        this.invoice_number = data.invoice_number;
        this.patient_id = data.patient_id;
        this.appointment_id = data.appointment_id;
        this.treatment_plan_id = data.treatment_plan_id;
        this.invoice_date = data.invoice_date;
        this.due_date = data.due_date;
        this.subtotal = data.subtotal || 0;
        this.tax_rate = data.tax_rate || 0;
        this.tax_amount = data.tax_amount || 0;
        this.discount_amount = data.discount_amount || 0;
        this.total_amount = data.total_amount || 0;
        this.amount_paid = data.amount_paid || 0;
        this.balance_due = data.balance_due || 0;
        this.status = data.status || 'draft';
        this.payment_terms = data.payment_terms || 'Net 30';
        this.notes = data.notes;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.created_by = data.created_by;
    }

    /**
     * Generate a unique invoice number
     */
    static async generateInvoiceNumber() {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const prefix = `INV${year}${month}`;
        
        // Get the last invoice number for this month
        const lastInvoice = await database.get(
            'SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY invoice_number DESC LIMIT 1',
            [`${prefix}%`]
        );
        
        let nextNumber = 1;
        if (lastInvoice) {
            const lastNumber = parseInt(lastInvoice.invoice_number.replace(prefix, ''));
            nextNumber = lastNumber + 1;
        }
        
        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Create a new invoice
     */
    async save() {
        try {
            if (!this.invoice_number) {
                this.invoice_number = await Invoice.generateInvoiceNumber();
            }

            if (!this.invoice_date) {
                this.invoice_date = moment().format('YYYY-MM-DD');
            }

            if (!this.due_date) {
                this.due_date = moment().add(30, 'days').format('YYYY-MM-DD');
            }

            const sql = `
                INSERT INTO invoices (
                    invoice_number, patient_id, appointment_id, treatment_plan_id, invoice_date, due_date,
                    subtotal, tax_rate, tax_amount, discount_amount, total_amount, amount_paid, balance_due,
                    status, payment_terms, notes, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                this.invoice_number, this.patient_id, this.appointment_id, this.treatment_plan_id,
                this.invoice_date, this.due_date, this.subtotal, this.tax_rate, this.tax_amount,
                this.discount_amount, this.total_amount, this.amount_paid, this.balance_due,
                this.status, this.payment_terms, this.notes, this.created_by
            ];

            const result = await database.run(sql, params);
            this.id = result.id;
            return this;
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    }

    /**
     * Update an existing invoice
     */
    async update() {
        try {
            const sql = `
                UPDATE invoices SET
                    patient_id = ?, appointment_id = ?, treatment_plan_id = ?, invoice_date = ?, due_date = ?,
                    subtotal = ?, tax_rate = ?, tax_amount = ?, discount_amount = ?, total_amount = ?,
                    amount_paid = ?, balance_due = ?, status = ?, payment_terms = ?, notes = ?
                WHERE id = ?
            `;

            const params = [
                this.patient_id, this.appointment_id, this.treatment_plan_id, this.invoice_date, this.due_date,
                this.subtotal, this.tax_rate, this.tax_amount, this.discount_amount, this.total_amount,
                this.amount_paid, this.balance_due, this.status, this.payment_terms, this.notes, this.id
            ];

            await database.run(sql, params);
            return this;
        } catch (error) {
            console.error('Error updating invoice:', error);
            throw error;
        }
    }

    /**
     * Find invoice by ID
     */
    static async findById(id) {
        try {
            const sql = `
                SELECT i.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number, p.phone, p.email, p.address, p.city, p.state, p.zip_code
                FROM invoices i
                LEFT JOIN patients p ON i.patient_id = p.id
                WHERE i.id = ?
            `;
            
            const row = await database.get(sql, [id]);
            return row ? new Invoice(row) : null;
        } catch (error) {
            console.error('Error finding invoice by ID:', error);
            throw error;
        }
    }

    /**
     * Find invoice by invoice number
     */
    static async findByInvoiceNumber(invoiceNumber) {
        try {
            const sql = `
                SELECT i.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number, p.phone, p.email, p.address, p.city, p.state, p.zip_code
                FROM invoices i
                LEFT JOIN patients p ON i.patient_id = p.id
                WHERE i.invoice_number = ?
            `;
            
            const row = await database.get(sql, [invoiceNumber]);
            return row ? new Invoice(row) : null;
        } catch (error) {
            console.error('Error finding invoice by invoice number:', error);
            throw error;
        }
    }

    /**
     * Get invoices for a specific patient
     */
    static async findByPatient(patientId, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT i.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number
                FROM invoices i
                LEFT JOIN patients p ON i.patient_id = p.id
                WHERE i.patient_id = ?
                ORDER BY i.invoice_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [patientId, limit, offset]);
            return rows.map(row => new Invoice(row));
        } catch (error) {
            console.error('Error finding invoices by patient:', error);
            throw error;
        }
    }

    /**
     * Get invoices by status
     */
    static async findByStatus(status, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT i.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number
                FROM invoices i
                LEFT JOIN patients p ON i.patient_id = p.id
                WHERE i.status = ?
                ORDER BY i.invoice_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [status, limit, offset]);
            return rows.map(row => new Invoice(row));
        } catch (error) {
            console.error('Error finding invoices by status:', error);
            throw error;
        }
    }

    /**
     * Get invoices by date range
     */
    static async findByDateRange(startDate, endDate, limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT i.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number
                FROM invoices i
                LEFT JOIN patients p ON i.patient_id = p.id
                WHERE i.invoice_date BETWEEN ? AND ?
                ORDER BY i.invoice_date DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [startDate, endDate, limit, offset]);
            return rows.map(row => new Invoice(row));
        } catch (error) {
            console.error('Error finding invoices by date range:', error);
            throw error;
        }
    }

    /**
     * Get overdue invoices
     */
    static async getOverdue(limit = 50, offset = 0) {
        try {
            const today = moment().format('YYYY-MM-DD');
            const sql = `
                SELECT i.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number, p.phone, p.email
                FROM invoices i
                LEFT JOIN patients p ON i.patient_id = p.id
                WHERE i.due_date < ? AND i.balance_due > 0 AND i.status != 'cancelled'
                ORDER BY i.due_date
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [today, limit, offset]);
            return rows.map(row => new Invoice(row));
        } catch (error) {
            console.error('Error getting overdue invoices:', error);
            throw error;
        }
    }

    /**
     * Get all invoices
     */
    static async findAll(options = {}) {
        try {
            const {
                search = '',
                status = '',
                dateFilter = '',
                sortBy = 'invoice_date',
                sortOrder = 'desc',
                limit = 100,
                offset = 0
            } = options;

            let sql = `
                SELECT i.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number
                FROM invoices i
                LEFT JOIN patients p ON i.patient_id = p.id
                WHERE 1=1
            `;
            
            const params = [];
            
            // Add search filter
            if (search) {
                sql += ` AND (i.invoice_number LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ?)`;
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }
            
            // Add status filter
            if (status) {
                sql += ` AND i.status = ?`;
                params.push(status);
            }
            
            // Add date filter
            if (dateFilter) {
                const today = moment().format('YYYY-MM-DD');
                switch (dateFilter) {
                    case 'today':
                        sql += ` AND DATE(i.invoice_date) = ?`;
                        params.push(today);
                        break;
                    case 'week':
                        const weekStart = moment().startOf('week').format('YYYY-MM-DD');
                        const weekEnd = moment().endOf('week').format('YYYY-MM-DD');
                        sql += ` AND DATE(i.invoice_date) BETWEEN ? AND ?`;
                        params.push(weekStart, weekEnd);
                        break;
                    case 'month':
                        const monthStart = moment().startOf('month').format('YYYY-MM-DD');
                        const monthEnd = moment().endOf('month').format('YYYY-MM-DD');
                        sql += ` AND DATE(i.invoice_date) BETWEEN ? AND ?`;
                        params.push(monthStart, monthEnd);
                        break;
                }
            }
            
            // Add sorting
            const validSortColumns = ['invoice_date', 'invoice_number', 'total_amount', 'status', 'due_date'];
            const validSortOrders = ['asc', 'desc'];
            
            if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder.toLowerCase())) {
                sql += ` ORDER BY i.${sortBy} ${sortOrder.toUpperCase()}`;
            } else {
                sql += ` ORDER BY i.invoice_date DESC`;
            }
            
            // Add pagination
            sql += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset);
            
            const rows = await database.all(sql, params);
            return rows.map(row => {
                const invoice = new Invoice(row);
                invoice.patientName = `${row.patient_first_name} ${row.patient_last_name}`;
                return invoice;
            });
        } catch (error) {
            console.error('Error finding all invoices:', error);
            throw error;
        }
    }

    /**
     * Get count of invoices with filters
     */
    static async getCount(options = {}) {
        try {
            const {
                search = '',
                status = '',
                dateFilter = ''
            } = options;

            let sql = `
                SELECT COUNT(*) as count
                FROM invoices i
                LEFT JOIN patients p ON i.patient_id = p.id
                WHERE 1=1
            `;
            
            const params = [];
            
            // Add search filter
            if (search) {
                sql += ` AND (i.invoice_number LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ?)`;
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }
            
            // Add status filter
            if (status) {
                sql += ` AND i.status = ?`;
                params.push(status);
            }
            
            // Add date filter
            if (dateFilter) {
                const today = moment().format('YYYY-MM-DD');
                switch (dateFilter) {
                    case 'today':
                        sql += ` AND DATE(i.invoice_date) = ?`;
                        params.push(today);
                        break;
                    case 'week':
                        const weekStart = moment().startOf('week').format('YYYY-MM-DD');
                        const weekEnd = moment().endOf('week').format('YYYY-MM-DD');
                        sql += ` AND DATE(i.invoice_date) BETWEEN ? AND ?`;
                        params.push(weekStart, weekEnd);
                        break;
                    case 'month':
                        const monthStart = moment().startOf('month').format('YYYY-MM-DD');
                        const monthEnd = moment().endOf('month').format('YYYY-MM-DD');
                        sql += ` AND DATE(i.invoice_date) BETWEEN ? AND ?`;
                        params.push(monthStart, monthEnd);
                        break;
                }
            }
            
            const result = await database.get(sql, params);
            return result.count;
        } catch (error) {
            console.error('Error getting invoice count:', error);
            throw error;
        }
    }

    /**
     * Add item to invoice
     */
    async addItem(itemType, itemId, description, quantity, unitPrice, toothNumber = null) {
        try {
            const totalPrice = quantity * unitPrice;
            
            const sql = `
                INSERT INTO invoice_items (
                    invoice_id, item_type, item_id, description, quantity, unit_price, total_price, tooth_number
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [this.id, itemType, itemId, description, quantity, unitPrice, totalPrice, toothNumber];
            
            await database.run(sql, params);
            
            // Recalculate totals (triggers will handle this automatically)
            await this.recalculateTotals();
            
            return this;
        } catch (error) {
            console.error('Error adding item to invoice:', error);
            throw error;
        }
    }

    /**
     * Remove item from invoice
     */
    async removeItem(itemId) {
        try {
            await database.run('DELETE FROM invoice_items WHERE id = ? AND invoice_id = ?', [itemId, this.id]);
            
            // Recalculate totals
            await this.recalculateTotals();
            
            return this;
        } catch (error) {
            console.error('Error removing item from invoice:', error);
            throw error;
        }
    }

    /**
     * Get invoice items
     */
    async getItems() {
        try {
            const sql = `
                SELECT ii.*, 
                       CASE 
                           WHEN ii.item_type = 'service' THEN s.name
                           WHEN ii.item_type = 'product' THEN p.name
                           ELSE ii.description
                       END as item_name
                FROM invoice_items ii
                LEFT JOIN services s ON ii.item_type = 'service' AND ii.item_id = s.id
                LEFT JOIN products p ON ii.item_type = 'product' AND ii.item_id = p.id
                WHERE ii.invoice_id = ?
                ORDER BY ii.created_at
            `;
            
            return await database.all(sql, [this.id]);
        } catch (error) {
            console.error('Error getting invoice items:', error);
            throw error;
        }
    }

    /**
     * Recalculate invoice totals
     */
    async recalculateTotals() {
        try {
            // Get current subtotal from items
            const result = await database.get(
                'SELECT COALESCE(SUM(total_price), 0) as subtotal FROM invoice_items WHERE invoice_id = ?',
                [this.id]
            );
            
            this.subtotal = result.subtotal;
            this.tax_amount = this.subtotal * this.tax_rate;
            this.total_amount = this.subtotal + this.tax_amount - this.discount_amount;
            this.balance_due = this.total_amount - this.amount_paid;
            
            await this.update();
            return this;
        } catch (error) {
            console.error('Error recalculating invoice totals:', error);
            throw error;
        }
    }

    /**
     * Apply payment to invoice
     */
    async applyPayment(amount, paymentMethod, paymentReference = null, notes = null) {
        try {
            // Create payment record
            const paymentNumber = await this.generatePaymentNumber();
            
            const paymentSql = `
                INSERT INTO payments (
                    payment_number, invoice_id, patient_id, payment_date, amount, 
                    payment_method, payment_reference, notes, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const paymentParams = [
                paymentNumber, this.id, this.patient_id, moment().format('YYYY-MM-DD'),
                amount, paymentMethod, paymentReference, notes, this.created_by
            ];
            
            await database.run(paymentSql, paymentParams);
            
            // Update invoice amounts
            this.amount_paid += amount;
            this.balance_due = this.total_amount - this.amount_paid;
            
            // Update status based on balance
            if (this.balance_due <= 0) {
                this.status = 'paid';
            } else if (this.amount_paid > 0) {
                this.status = 'partial';
            }
            
            await this.update();
            return this;
        } catch (error) {
            console.error('Error applying payment to invoice:', error);
            throw error;
        }
    }

    /**
     * Generate payment number
     */
    async generatePaymentNumber() {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const prefix = `PAY${year}${month}`;
        
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
     * Get invoice payments
     */
    async getPayments() {
        try {
            const sql = `
                SELECT * FROM payments 
                WHERE invoice_id = ?
                ORDER BY payment_date DESC
            `;
            
            return await database.all(sql, [this.id]);
        } catch (error) {
            console.error('Error getting invoice payments:', error);
            throw error;
        }
    }

    /**
     * Cancel invoice
     */
    async cancel(reason = null) {
        try {
            this.status = 'cancelled';
            if (reason) {
                this.notes = this.notes 
                    ? `${this.notes}\n\nCancellation reason: ${reason}`
                    : `Cancellation reason: ${reason}`;
            }
            await this.update();
            return this;
        } catch (error) {
            console.error('Error cancelling invoice:', error);
            throw error;
        }
    }

    /**
     * Mark invoice as sent
     */
    async markAsSent() {
        try {
            this.status = 'sent';
            await this.update();
            return this;
        } catch (error) {
            console.error('Error marking invoice as sent:', error);
            throw error;
        }
    }

    /**
     * Delete invoice
     */
    async delete() {
        try {
            // First delete all invoice items
            await database.run('DELETE FROM invoice_items WHERE invoice_id = ?', [this.id]);
            
            // Then delete the invoice
            await database.run('DELETE FROM invoices WHERE id = ?', [this.id]);
            
            return true;
        } catch (error) {
            console.error('Error deleting invoice:', error);
            throw error;
        }
    }

    /**
     * Get invoice statistics
     */
    static async getStats(startDate = null, endDate = null) {
        try {
            let whereClause = '';
            const params = [];
            
            if (startDate && endDate) {
                whereClause = 'WHERE invoice_date BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }
            
            const statusStats = await database.all(`
                SELECT status, COUNT(*) as count, SUM(total_amount) as total_amount
                FROM invoices 
                ${whereClause}
                GROUP BY status
            `, params);
            
            const totalStats = await database.get(`
                SELECT 
                    COUNT(*) as total_invoices,
                    SUM(total_amount) as total_billed,
                    SUM(amount_paid) as total_paid,
                    SUM(balance_due) as total_outstanding
                FROM invoices 
                ${whereClause}
            `, params);
            
            const overdueStats = await database.get(`
                SELECT 
                    COUNT(*) as overdue_count,
                    SUM(balance_due) as overdue_amount
                FROM invoices 
                WHERE due_date < date('now') AND balance_due > 0 AND status != 'cancelled'
                ${startDate && endDate ? 'AND invoice_date BETWEEN ? AND ?' : ''}
            `, startDate && endDate ? params : []);
            
            return {
                total_invoices: totalStats.total_invoices || 0,
                total_billed: totalStats.total_billed || 0,
                total_paid: totalStats.total_paid || 0,
                total_outstanding: totalStats.total_outstanding || 0,
                overdue_count: overdueStats.overdue_count || 0,
                overdue_amount: overdueStats.overdue_amount || 0,
                by_status: statusStats
            };
        } catch (error) {
            console.error('Error getting invoice stats:', error);
            throw error;
        }
    }

    /**
     * Check if invoice is overdue
     */
    isOverdue() {
        return moment().isAfter(moment(this.due_date)) && this.balance_due > 0 && this.status !== 'cancelled';
    }

    /**
     * Get days overdue
     */
    getDaysOverdue() {
        if (!this.isOverdue()) return 0;
        return moment().diff(moment(this.due_date), 'days');
    }

    /**
     * Get formatted amounts
     */
    getFormattedSubtotal() {
        return `$${parseFloat(this.subtotal).toFixed(2)}`;
    }

    getFormattedTaxAmount() {
        return `$${parseFloat(this.tax_amount).toFixed(2)}`;
    }

    getFormattedDiscountAmount() {
        return `$${parseFloat(this.discount_amount).toFixed(2)}`;
    }

    getFormattedTotalAmount() {
        return `$${parseFloat(this.total_amount).toFixed(2)}`;
    }

    getFormattedAmountPaid() {
        return `$${parseFloat(this.amount_paid).toFixed(2)}`;
    }

    getFormattedBalanceDue() {
        return `$${parseFloat(this.balance_due).toFixed(2)}`;
    }

    /**
     * Convert to JSON (for API responses)
     */
    toJSON() {
        return {
            id: this.id,
            invoiceNumber: this.invoice_number,
            patientId: this.patient_id,
            appointmentId: this.appointment_id,
            treatmentPlanId: this.treatment_plan_id,
            invoiceDate: this.invoice_date,
            dueDate: this.due_date,
            subtotal: this.subtotal,
            formattedSubtotal: this.getFormattedSubtotal(),
            taxRate: this.tax_rate,
            taxAmount: this.tax_amount,
            formattedTaxAmount: this.getFormattedTaxAmount(),
            discountAmount: this.discount_amount,
            formattedDiscountAmount: this.getFormattedDiscountAmount(),
            totalAmount: this.total_amount,
            formattedTotalAmount: this.getFormattedTotalAmount(),
            amountPaid: this.amount_paid,
            formattedAmountPaid: this.getFormattedAmountPaid(),
            balanceDue: this.balance_due,
            formattedBalanceDue: this.getFormattedBalanceDue(),
            status: this.status,
            paymentTerms: this.payment_terms,
            notes: this.notes,
            isOverdue: this.isOverdue(),
            daysOverdue: this.getDaysOverdue(),
            createdAt: this.created_at,
            updatedAt: this.updated_at
        };
    }
}

module.exports = Invoice;