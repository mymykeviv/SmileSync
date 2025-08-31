const database = require('../database/init');
const moment = require('moment');

class Appointment {
    constructor(data = {}) {
        this.id = data.id;
        this.appointment_number = data.appointment_number;
        this.patient_id = data.patient_id;
        this.dentist_id = data.dentist_id;
        this.appointment_date = data.appointment_date;
        this.appointment_time = data.appointment_time;
        this.duration_minutes = data.duration_minutes || 60;
        this.status = data.status || 'scheduled';
        this.appointment_type = data.appointment_type;
        this.chief_complaint = data.chief_complaint;
        this.treatment_notes = data.treatment_notes;
        this.next_appointment_recommended = data.next_appointment_recommended || false;
        this.next_appointment_notes = data.next_appointment_notes;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.created_by = data.created_by;
    }

    /**
     * Generate a unique appointment number
     */
    static async generateAppointmentNumber() {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const prefix = `A${year}${month}`;
        
        // Get the last appointment number for this month
        const lastAppointment = await database.get(
            'SELECT appointment_number FROM appointments WHERE appointment_number LIKE ? ORDER BY appointment_number DESC LIMIT 1',
            [`${prefix}%`]
        );
        
        let nextNumber = 1;
        if (lastAppointment) {
            const lastNumber = parseInt(lastAppointment.appointment_number.replace(prefix, ''));
            nextNumber = lastNumber + 1;
        }
        
        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Create a new appointment
     */
    async save() {
        try {
            if (!this.appointment_number) {
                this.appointment_number = await Appointment.generateAppointmentNumber();
            }

            const sql = `
                INSERT INTO appointments (
                    appointment_number, patient_id, dentist_id, appointment_date, appointment_time,
                    duration_minutes, status, appointment_type, chief_complaint, treatment_notes,
                    next_appointment_recommended, next_appointment_notes, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                this.appointment_number, this.patient_id, this.dentist_id, this.appointment_date, this.appointment_time,
                this.duration_minutes, this.status, this.appointment_type, this.chief_complaint, this.treatment_notes,
                this.next_appointment_recommended, this.next_appointment_notes, this.created_by
            ];

            const result = await database.run(sql, params);
            this.id = result.id;
            return this;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    /**
     * Update an existing appointment
     */
    async update() {
        try {
            const sql = `
                UPDATE appointments SET
                    patient_id = ?, dentist_id = ?, appointment_date = ?, appointment_time = ?,
                    duration_minutes = ?, status = ?, appointment_type = ?, chief_complaint = ?,
                    treatment_notes = ?, next_appointment_recommended = ?, next_appointment_notes = ?
                WHERE id = ?
            `;

            const params = [
                this.patient_id, this.dentist_id, this.appointment_date, this.appointment_time,
                this.duration_minutes, this.status, this.appointment_type, this.chief_complaint,
                this.treatment_notes, this.next_appointment_recommended, this.next_appointment_notes,
                this.id
            ];

            await database.run(sql, params);
            return this;
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    }

    /**
     * Find appointment by ID
     */
    static async findById(id) {
        try {
            const sql = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number,
                       u.first_name as dentist_first_name, u.last_name as dentist_last_name
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                LEFT JOIN users u ON a.dentist_id = u.id
                WHERE a.id = ?
            `;
            
            const row = await database.get(sql, [id]);
            return row ? new Appointment(row) : null;
        } catch (error) {
            console.error('Error finding appointment by ID:', error);
            throw error;
        }
    }

    /**
     * Find appointment by appointment number
     */
    static async findByAppointmentNumber(appointmentNumber) {
        try {
            const sql = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number,
                       u.first_name as dentist_first_name, u.last_name as dentist_last_name
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                LEFT JOIN users u ON a.dentist_id = u.id
                WHERE a.appointment_number = ?
            `;
            
            const row = await database.get(sql, [appointmentNumber]);
            return row ? new Appointment(row) : null;
        } catch (error) {
            console.error('Error finding appointment by appointment number:', error);
            throw error;
        }
    }

    /**
     * Get appointments for a specific date
     */
    static async findByDate(date, dentistId = null) {
        try {
            let sql = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number, p.phone,
                       u.first_name as dentist_first_name, u.last_name as dentist_last_name
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                LEFT JOIN users u ON a.dentist_id = u.id
                WHERE a.appointment_date = ?
            `;
            
            const params = [date];
            
            if (dentistId) {
                sql += ' AND a.dentist_id = ?';
                params.push(dentistId);
            }
            
            sql += ' ORDER BY a.appointment_time';
            
            const rows = await database.all(sql, params);
            return rows.map(row => new Appointment(row));
        } catch (error) {
            console.error('Error finding appointments by date:', error);
            throw error;
        }
    }

    /**
     * Get appointments for a date range
     */
    static async findByDateRange(startDate, endDate, dentistId = null, status = null) {
        try {
            let sql = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number, p.phone,
                       u.first_name as dentist_first_name, u.last_name as dentist_last_name
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                LEFT JOIN users u ON a.dentist_id = u.id
                WHERE a.appointment_date BETWEEN ? AND ?
            `;
            
            const params = [startDate, endDate];
            
            if (dentistId) {
                sql += ' AND a.dentist_id = ?';
                params.push(dentistId);
            }
            
            if (status) {
                sql += ' AND a.status = ?';
                params.push(status);
            }
            
            sql += ' ORDER BY a.appointment_date, a.appointment_time';
            
            const rows = await database.all(sql, params);
            return rows.map(row => new Appointment(row));
        } catch (error) {
            console.error('Error finding appointments by date range:', error);
            throw error;
        }
    }

    /**
     * Get appointments for a specific patient
     */
    static async findByPatient(patientId, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT a.*, 
                       u.first_name as dentist_first_name, u.last_name as dentist_last_name
                FROM appointments a
                LEFT JOIN users u ON a.dentist_id = u.id
                WHERE a.patient_id = ?
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [patientId, limit, offset]);
            return rows.map(row => new Appointment(row));
        } catch (error) {
            console.error('Error finding appointments by patient:', error);
            throw error;
        }
    }

    /**
     * Get appointments for a specific dentist
     */
    static async findByDentist(dentistId, limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number, p.phone
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                WHERE a.dentist_id = ?
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [dentistId, limit, offset]);
            return rows.map(row => new Appointment(row));
        } catch (error) {
            console.error('Error finding appointments by dentist:', error);
            throw error;
        }
    }

    /**
     * Check for appointment conflicts
     */
    static async checkConflicts(dentistId, appointmentDate, appointmentTime, durationMinutes, excludeId = null) {
        try {
            const startTime = moment(`${appointmentDate} ${appointmentTime}`);
            const endTime = startTime.clone().add(durationMinutes, 'minutes');
            
            let sql = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                WHERE a.dentist_id = ? 
                AND a.appointment_date = ?
                AND a.status NOT IN ('cancelled', 'no_show')
                AND (
                    (TIME(a.appointment_time) < TIME(?) AND 
                     TIME(a.appointment_time, '+' || a.duration_minutes || ' minutes') > TIME(?))
                    OR
                    (TIME(a.appointment_time) >= TIME(?) AND 
                     TIME(a.appointment_time) < TIME(?))
                )
            `;
            
            const params = [
                dentistId, 
                appointmentDate, 
                endTime.format('HH:mm:ss'), 
                appointmentTime,
                appointmentTime,
                endTime.format('HH:mm:ss')
            ];
            
            if (excludeId) {
                sql += ' AND a.id != ?';
                params.push(excludeId);
            }
            
            const conflicts = await database.all(sql, params);
            return conflicts;
        } catch (error) {
            console.error('Error checking appointment conflicts:', error);
            throw error;
        }
    }

    /**
     * Get upcoming appointments
     */
    static async getUpcoming(days = 7, limit = 50) {
        try {
            const today = moment().format('YYYY-MM-DD');
            const endDate = moment().add(days, 'days').format('YYYY-MM-DD');
            
            const sql = `
                SELECT a.*, 
                       p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number, p.phone,
                       u.first_name as dentist_first_name, u.last_name as dentist_last_name
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                LEFT JOIN users u ON a.dentist_id = u.id
                WHERE a.appointment_date BETWEEN ? AND ?
                AND a.status IN ('scheduled', 'confirmed')
                ORDER BY a.appointment_date, a.appointment_time
                LIMIT ?
            `;
            
            const rows = await database.all(sql, [today, endDate, limit]);
            return rows.map(row => new Appointment(row));
        } catch (error) {
            console.error('Error getting upcoming appointments:', error);
            throw error;
        }
    }

    /**
     * Cancel an appointment
     */
    async cancel(reason = null) {
        try {
            this.status = 'cancelled';
            if (reason) {
                this.treatment_notes = this.treatment_notes 
                    ? `${this.treatment_notes}\n\nCancellation reason: ${reason}`
                    : `Cancellation reason: ${reason}`;
            }
            await this.update();
            return this;
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            throw error;
        }
    }

    /**
     * Reschedule an appointment
     */
    async reschedule(newDate, newTime, newDentistId = null) {
        try {
            // Check for conflicts
            const conflicts = await Appointment.checkConflicts(
                newDentistId || this.dentist_id, 
                newDate, 
                newTime, 
                this.duration_minutes, 
                this.id
            );
            
            if (conflicts.length > 0) {
                throw new Error('Time slot conflicts with existing appointment');
            }
            
            const oldDateTime = `${this.appointment_date} ${this.appointment_time}`;
            const newDateTime = `${newDate} ${newTime}`;
            
            this.appointment_date = newDate;
            this.appointment_time = newTime;
            if (newDentistId) {
                this.dentist_id = newDentistId;
            }
            
            // Add rescheduling note
            const rescheduleNote = `Rescheduled from ${oldDateTime} to ${newDateTime}`;
            this.treatment_notes = this.treatment_notes 
                ? `${this.treatment_notes}\n\n${rescheduleNote}`
                : rescheduleNote;
            
            await this.update();
            return this;
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            throw error;
        }
    }

    /**
     * Mark appointment as completed
     */
    async complete(treatmentNotes = null) {
        try {
            this.status = 'completed';
            if (treatmentNotes) {
                this.treatment_notes = treatmentNotes;
            }
            await this.update();
            return this;
        } catch (error) {
            console.error('Error completing appointment:', error);
            throw error;
        }
    }

    /**
     * Get appointment statistics
     */
    static async getStats(startDate = null, endDate = null) {
        try {
            let whereClause = '';
            const params = [];
            
            if (startDate && endDate) {
                whereClause = 'WHERE appointment_date BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }
            
            const sql = `
                SELECT 
                    status,
                    COUNT(*) as count
                FROM appointments 
                ${whereClause}
                GROUP BY status
            `;
            
            const stats = await database.all(sql, params);
            
            // Convert to object format
            const result = {
                total: 0,
                scheduled: 0,
                confirmed: 0,
                completed: 0,
                cancelled: 0,
                no_show: 0,
                in_progress: 0
            };
            
            stats.forEach(stat => {
                result[stat.status] = stat.count;
                result.total += stat.count;
            });
            
            return result;
        } catch (error) {
            console.error('Error getting appointment stats:', error);
            throw error;
        }
    }

    /**
     * Get formatted date and time
     */
    getFormattedDateTime() {
        return moment(`${this.appointment_date} ${this.appointment_time}`).format('YYYY-MM-DD HH:mm');
    }

    /**
     * Get end time
     */
    getEndTime() {
        return moment(`${this.appointment_date} ${this.appointment_time}`)
            .add(this.duration_minutes, 'minutes')
            .format('HH:mm');
    }

    /**
     * Check if appointment is in the past
     */
    isPast() {
        const appointmentDateTime = moment(`${this.appointment_date} ${this.appointment_time}`);
        return appointmentDateTime.isBefore(moment());
    }

    /**
     * Check if appointment is today
     */
    isToday() {
        return moment(this.appointment_date).isSame(moment(), 'day');
    }

    /**
     * Convert to JSON (for API responses)
     */
    toJSON() {
        return {
            id: this.id,
            appointment_number: this.appointment_number,
            patient_id: this.patient_id,
            dentist_id: this.dentist_id,
            appointment_date: this.appointment_date,
            appointment_time: this.appointment_time,
            duration_minutes: this.duration_minutes,
            status: this.status,
            appointment_type: this.appointment_type,
            chief_complaint: this.chief_complaint,
            treatment_notes: this.treatment_notes,
            next_appointment_recommended: this.next_appointment_recommended,
            next_appointment_notes: this.next_appointment_notes,
            formatted_datetime: this.getFormattedDateTime(),
            end_time: this.getEndTime(),
            is_past: this.isPast(),
            is_today: this.isToday(),
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Appointment;