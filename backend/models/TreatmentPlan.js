const database = require('../database/init');
const moment = require('moment');

class TreatmentPlan {
    constructor(data = {}) {
        this.id = data.id;
        this.plan_number = data.plan_number;
        this.patient_id = data.patient_id;
        this.dentist_id = data.dentist_id;
        this.title = data.title;
        this.description = data.description;
        this.diagnosis = data.diagnosis;
        this.treatment_goals = data.treatment_goals;
        this.estimated_cost = data.estimated_cost || 0;
        this.estimated_duration = data.estimated_duration; // in weeks
        this.priority = data.priority || 'medium';
        this.status = data.status || 'draft';
        this.start_date = data.start_date;
        this.target_completion_date = data.target_completion_date;
        this.actual_completion_date = data.actual_completion_date;
        this.notes = data.notes;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.created_by = data.created_by;
    }

    /**
     * Generate a unique treatment plan number
     */
    static async generatePlanNumber() {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const prefix = `TP${year}${month}`;
        
        // Get the last plan number for this month
        const lastPlan = await database.get(
            'SELECT plan_number FROM treatment_plans WHERE plan_number LIKE ? ORDER BY plan_number DESC LIMIT 1',
            [`${prefix}%`]
        );
        
        let nextNumber = 1;
        if (lastPlan) {
            const lastNumber = parseInt(lastPlan.plan_number.replace(prefix, ''));
            nextNumber = lastNumber + 1;
        }
        
        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Create a new treatment plan
     */
    async save() {
        try {
            if (!this.plan_number) {
                this.plan_number = await TreatmentPlan.generatePlanNumber();
            }

            const sql = `
                INSERT INTO treatment_plans (
                    plan_number, patient_id, dentist_id, title, description, diagnosis,
                    treatment_goals, estimated_cost, estimated_duration, priority, status,
                    start_date, target_completion_date, notes, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                this.plan_number, this.patient_id, this.dentist_id, this.title, this.description,
                this.diagnosis, this.treatment_goals, this.estimated_cost, this.estimated_duration,
                this.priority, this.status, this.start_date, this.target_completion_date,
                this.notes, this.created_by
            ];

            const result = await database.run(sql, params);
            this.id = result.id;
            return this;
        } catch (error) {
            console.error('Error creating treatment plan:', error);
            throw error;
        }
    }

    /**
     * Update an existing treatment plan
     */
    async update() {
        try {
            const sql = `
                UPDATE treatment_plans SET
                    patient_id = ?, dentist_id = ?, title = ?, description = ?, diagnosis = ?,
                    treatment_goals = ?, estimated_cost = ?, estimated_duration = ?, priority = ?,
                    status = ?, start_date = ?, target_completion_date = ?, actual_completion_date = ?,
                    notes = ?
                WHERE id = ?
            `;

            const params = [
                this.patient_id, this.dentist_id, this.title, this.description, this.diagnosis,
                this.treatment_goals, this.estimated_cost, this.estimated_duration, this.priority,
                this.status, this.start_date, this.target_completion_date, this.actual_completion_date,
                this.notes, this.id
            ];

            await database.run(sql, params);
            return this;
        } catch (error) {
            console.error('Error updating treatment plan:', error);
            throw error;
        }
    }

    /**
     * Find treatment plan by ID
     */
    static async findById(id) {
        try {
            const sql = `
                SELECT tp.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number, p.phone, p.email,
                       d.first_name as dentist_first_name, d.last_name as dentist_last_name
                FROM treatment_plans tp
                LEFT JOIN patients p ON tp.patient_id = p.id
                LEFT JOIN users d ON tp.dentist_id = d.id
                WHERE tp.id = ?
            `;
            
            const row = await database.get(sql, [id]);
            return row ? new TreatmentPlan(row) : null;
        } catch (error) {
            console.error('Error finding treatment plan by ID:', error);
            throw error;
        }
    }

    /**
     * Find treatment plan by plan number
     */
    static async findByPlanNumber(planNumber) {
        try {
            const sql = `
                SELECT tp.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number, p.phone, p.email,
                       d.first_name as dentist_first_name, d.last_name as dentist_last_name
                FROM treatment_plans tp
                LEFT JOIN patients p ON tp.patient_id = p.id
                LEFT JOIN users d ON tp.dentist_id = d.id
                WHERE tp.plan_number = ?
            `;
            
            const row = await database.get(sql, [planNumber]);
            return row ? new TreatmentPlan(row) : null;
        } catch (error) {
            console.error('Error finding treatment plan by plan number:', error);
            throw error;
        }
    }

    /**
     * Get treatment plans for a specific patient
     */
    static async findByPatient(patientId, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT tp.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number,
                       d.first_name as dentist_first_name, d.last_name as dentist_last_name
                FROM treatment_plans tp
                LEFT JOIN patients p ON tp.patient_id = p.id
                LEFT JOIN users d ON tp.dentist_id = d.id
                WHERE tp.patient_id = ?
                ORDER BY tp.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [patientId, limit, offset]);
            return rows.map(row => new TreatmentPlan(row));
        } catch (error) {
            console.error('Error finding treatment plans by patient:', error);
            throw error;
        }
    }

    /**
     * Get treatment plans by dentist
     */
    static async findByDentist(dentistId, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT tp.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number,
                       d.first_name as dentist_first_name, d.last_name as dentist_last_name
                FROM treatment_plans tp
                LEFT JOIN patients p ON tp.patient_id = p.id
                LEFT JOIN users d ON tp.dentist_id = d.id
                WHERE tp.dentist_id = ?
                ORDER BY tp.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [dentistId, limit, offset]);
            return rows.map(row => new TreatmentPlan(row));
        } catch (error) {
            console.error('Error finding treatment plans by dentist:', error);
            throw error;
        }
    }

    /**
     * Get treatment plans by status
     */
    static async findByStatus(status, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT tp.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number,
                       d.first_name as dentist_first_name, d.last_name as dentist_last_name
                FROM treatment_plans tp
                LEFT JOIN patients p ON tp.patient_id = p.id
                LEFT JOIN users d ON tp.dentist_id = d.id
                WHERE tp.status = ?
                ORDER BY tp.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [status, limit, offset]);
            return rows.map(row => new TreatmentPlan(row));
        } catch (error) {
            console.error('Error finding treatment plans by status:', error);
            throw error;
        }
    }

    /**
     * Get treatment plans by priority
     */
    static async findByPriority(priority, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT tp.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number,
                       d.first_name as dentist_first_name, d.last_name as dentist_last_name
                FROM treatment_plans tp
                LEFT JOIN patients p ON tp.patient_id = p.id
                LEFT JOIN users d ON tp.dentist_id = d.id
                WHERE tp.priority = ?
                ORDER BY tp.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [priority, limit, offset]);
            return rows.map(row => new TreatmentPlan(row));
        } catch (error) {
            console.error('Error finding treatment plans by priority:', error);
            throw error;
        }
    }

    /**
     * Get overdue treatment plans
     */
    static async getOverdue(limit = 50, offset = 0) {
        try {
            const today = moment().format('YYYY-MM-DD');
            const sql = `
                SELECT tp.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number, p.phone, p.email,
                       d.first_name as dentist_first_name, d.last_name as dentist_last_name
                FROM treatment_plans tp
                LEFT JOIN patients p ON tp.patient_id = p.id
                LEFT JOIN users d ON tp.dentist_id = d.id
                WHERE tp.target_completion_date < ? AND tp.status IN ('active', 'in_progress')
                ORDER BY tp.target_completion_date
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [today, limit, offset]);
            return rows.map(row => new TreatmentPlan(row));
        } catch (error) {
            console.error('Error getting overdue treatment plans:', error);
            throw error;
        }
    }

    /**
     * Get all treatment plans
     */
    static async findAll(limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT tp.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number,
                       d.first_name as dentist_first_name, d.last_name as dentist_last_name
                FROM treatment_plans tp
                LEFT JOIN patients p ON tp.patient_id = p.id
                LEFT JOIN users d ON tp.dentist_id = d.id
                ORDER BY tp.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [limit, offset]);
            return rows.map(row => new TreatmentPlan(row));
        } catch (error) {
            console.error('Error finding all treatment plans:', error);
            throw error;
        }
    }

    /**
     * Search treatment plans
     */
    static async search(searchTerm, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT tp.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, 
                       p.patient_number,
                       d.first_name as dentist_first_name, d.last_name as dentist_last_name
                FROM treatment_plans tp
                LEFT JOIN patients p ON tp.patient_id = p.id
                LEFT JOIN users d ON tp.dentist_id = d.id
                WHERE tp.plan_number LIKE ? 
                   OR tp.title LIKE ?
                   OR tp.description LIKE ?
                   OR tp.diagnosis LIKE ?
                   OR p.first_name LIKE ? 
                   OR p.last_name LIKE ?
                   OR p.patient_number LIKE ?
                ORDER BY tp.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const searchPattern = `%${searchTerm}%`;
            const params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, limit, offset];
            
            const rows = await database.all(sql, params);
            return rows.map(row => new TreatmentPlan(row));
        } catch (error) {
            console.error('Error searching treatment plans:', error);
            throw error;
        }
    }

    /**
     * Add procedure to treatment plan
     */
    async addProcedure(serviceId, toothNumber = null, surface = null, notes = null, estimatedCost = 0, sequence = null) {
        try {
            // Get next sequence number if not provided
            if (!sequence) {
                const result = await database.get(
                    'SELECT COALESCE(MAX(sequence), 0) + 1 as next_sequence FROM treatment_plan_procedures WHERE treatment_plan_id = ?',
                    [this.id]
                );
                sequence = result.next_sequence;
            }
            
            const sql = `
                INSERT INTO treatment_plan_procedures (
                    treatment_plan_id, service_id, tooth_number, surface, notes, 
                    estimated_cost, sequence, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'planned')
            `;
            
            const params = [this.id, serviceId, toothNumber, surface, notes, estimatedCost, sequence];
            
            await database.run(sql, params);
            
            // Recalculate estimated cost
            await this.recalculateEstimatedCost();
            
            return this;
        } catch (error) {
            console.error('Error adding procedure to treatment plan:', error);
            throw error;
        }
    }

    /**
     * Remove procedure from treatment plan
     */
    async removeProcedure(procedureId) {
        try {
            await database.run(
                'DELETE FROM treatment_plan_procedures WHERE id = ? AND treatment_plan_id = ?',
                [procedureId, this.id]
            );
            
            // Recalculate estimated cost
            await this.recalculateEstimatedCost();
            
            return this;
        } catch (error) {
            console.error('Error removing procedure from treatment plan:', error);
            throw error;
        }
    }

    /**
     * Get treatment plan procedures
     */
    async getProcedures() {
        try {
            const sql = `
                SELECT tpp.*, s.name as service_name, s.code as service_code, 
                       s.category as service_category, s.default_price
                FROM treatment_plan_procedures tpp
                LEFT JOIN services s ON tpp.service_id = s.id
                WHERE tpp.treatment_plan_id = ?
                ORDER BY tpp.sequence
            `;
            
            return await database.all(sql, [this.id]);
        } catch (error) {
            console.error('Error getting treatment plan procedures:', error);
            throw error;
        }
    }

    /**
     * Update procedure status
     */
    async updateProcedureStatus(procedureId, status, completedDate = null, actualCost = null, notes = null) {
        try {
            let sql = 'UPDATE treatment_plan_procedures SET status = ?';
            const params = [status, procedureId, this.id];
            
            if (completedDate) {
                sql += ', completed_date = ?';
                params.splice(-2, 0, completedDate);
            }
            
            if (actualCost !== null) {
                sql += ', actual_cost = ?';
                params.splice(-2, 0, actualCost);
            }
            
            if (notes) {
                sql += ', notes = ?';
                params.splice(-2, 0, notes);
            }
            
            sql += ' WHERE id = ? AND treatment_plan_id = ?';
            
            await database.run(sql, params);
            
            // Check if all procedures are completed
            await this.checkCompletion();
            
            return this;
        } catch (error) {
            console.error('Error updating procedure status:', error);
            throw error;
        }
    }

    /**
     * Recalculate estimated cost
     */
    async recalculateEstimatedCost() {
        try {
            const result = await database.get(
                'SELECT COALESCE(SUM(estimated_cost), 0) as total_cost FROM treatment_plan_procedures WHERE treatment_plan_id = ?',
                [this.id]
            );
            
            this.estimated_cost = result.total_cost;
            await this.update();
            return this;
        } catch (error) {
            console.error('Error recalculating estimated cost:', error);
            throw error;
        }
    }

    /**
     * Check if treatment plan is completed
     */
    async checkCompletion() {
        try {
            const result = await database.get(`
                SELECT 
                    COUNT(*) as total_procedures,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_procedures
                FROM treatment_plan_procedures 
                WHERE treatment_plan_id = ?
            `, [this.id]);
            
            if (result.total_procedures > 0 && result.completed_procedures === result.total_procedures) {
                this.status = 'completed';
                this.actual_completion_date = moment().format('YYYY-MM-DD');
                await this.update();
            }
            
            return this;
        } catch (error) {
            console.error('Error checking treatment plan completion:', error);
            throw error;
        }
    }

    /**
     * Activate treatment plan
     */
    async activate(startDate = null) {
        try {
            this.status = 'active';
            this.start_date = startDate || moment().format('YYYY-MM-DD');
            
            // Set target completion date if not set
            if (!this.target_completion_date && this.estimated_duration) {
                this.target_completion_date = moment(this.start_date)
                    .add(this.estimated_duration, 'weeks')
                    .format('YYYY-MM-DD');
            }
            
            await this.update();
            return this;
        } catch (error) {
            console.error('Error activating treatment plan:', error);
            throw error;
        }
    }

    /**
     * Cancel treatment plan
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
            console.error('Error cancelling treatment plan:', error);
            throw error;
        }
    }

    /**
     * Get treatment plan statistics
     */
    static async getStats(startDate = null, endDate = null) {
        try {
            let whereClause = '';
            const params = [];
            
            if (startDate && endDate) {
                whereClause = 'WHERE created_at BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }
            
            const statusStats = await database.all(`
                SELECT status, COUNT(*) as count, AVG(estimated_cost) as avg_cost
                FROM treatment_plans 
                ${whereClause}
                GROUP BY status
            `, params);
            
            const priorityStats = await database.all(`
                SELECT priority, COUNT(*) as count
                FROM treatment_plans 
                ${whereClause}
                GROUP BY priority
            `, params);
            
            const totalStats = await database.get(`
                SELECT 
                    COUNT(*) as total_plans,
                    AVG(estimated_cost) as avg_estimated_cost,
                    AVG(estimated_duration) as avg_duration,
                    SUM(estimated_cost) as total_estimated_value
                FROM treatment_plans 
                ${whereClause}
            `, params);
            
            const completionStats = await database.get(`
                SELECT 
                    COUNT(*) as completed_plans,
                    AVG(julianday(actual_completion_date) - julianday(start_date)) as avg_completion_days
                FROM treatment_plans 
                WHERE status = 'completed' AND start_date IS NOT NULL AND actual_completion_date IS NOT NULL
                ${startDate && endDate ? 'AND created_at BETWEEN ? AND ?' : ''}
            `, startDate && endDate ? params : []);
            
            return {
                total_plans: totalStats.total_plans || 0,
                avg_estimated_cost: totalStats.avg_estimated_cost || 0,
                avg_duration: totalStats.avg_duration || 0,
                total_estimated_value: totalStats.total_estimated_value || 0,
                completed_plans: completionStats.completed_plans || 0,
                avg_completion_days: completionStats.avg_completion_days || 0,
                by_status: statusStats,
                by_priority: priorityStats
            };
        } catch (error) {
            console.error('Error getting treatment plan stats:', error);
            throw error;
        }
    }

    /**
     * Check if treatment plan is overdue
     */
    isOverdue() {
        return this.target_completion_date && 
               moment().isAfter(moment(this.target_completion_date)) && 
               this.status === 'active';
    }

    /**
     * Get days overdue
     */
    getDaysOverdue() {
        if (!this.isOverdue()) return 0;
        return moment().diff(moment(this.target_completion_date), 'days');
    }

    /**
     * Get progress percentage
     */
    async getProgress() {
        try {
            const result = await database.get(`
                SELECT 
                    COUNT(*) as total_procedures,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_procedures
                FROM treatment_plan_procedures 
                WHERE treatment_plan_id = ?
            `, [this.id]);
            
            if (result.total_procedures === 0) return 0;
            return Math.round((result.completed_procedures / result.total_procedures) * 100);
        } catch (error) {
            console.error('Error getting treatment plan progress:', error);
            return 0;
        }
    }

    /**
     * Get formatted estimated cost
     */
    getFormattedEstimatedCost() {
        return `₹${parseFloat(this.estimated_cost).toFixed(2)}`;
    }

    /**
     * Get formatted dates
     */
    getFormattedStartDate() {
        return this.start_date ? moment(this.start_date).format('MMM DD, YYYY') : null;
    }

    getFormattedTargetDate() {
        return this.target_completion_date ? moment(this.target_completion_date).format('MMM DD, YYYY') : null;
    }

    getFormattedCompletionDate() {
        return this.actual_completion_date ? moment(this.actual_completion_date).format('MMM DD, YYYY') : null;
    }

    /**
     * Convert to JSON (for API responses)
     */
    toJSON() {
        return {
            id: this.id,
            plan_number: this.plan_number,
            patient_id: this.patient_id,
            dentist_id: this.dentist_id,
            title: this.title,
            description: this.description,
            diagnosis: this.diagnosis,
            treatment_goals: this.treatment_goals,
            estimated_cost: this.estimated_cost,
            formatted_estimated_cost: this.getFormattedEstimatedCost(),
            estimated_duration: this.estimated_duration,
            priority: this.priority,
            status: this.status,
            start_date: this.start_date,
            formatted_start_date: this.getFormattedStartDate(),
            target_completion_date: this.target_completion_date,
            formatted_target_date: this.getFormattedTargetDate(),
            actual_completion_date: this.actual_completion_date,
            formatted_completion_date: this.getFormattedCompletionDate(),
            notes: this.notes,
            is_overdue: this.isOverdue(),
            days_overdue: this.getDaysOverdue(),
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = TreatmentPlan;