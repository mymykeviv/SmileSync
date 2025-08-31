const database = require('../database/init');
const { v4: uuidv4 } = require('uuid');

class Patient {
    constructor(data = {}) {
        this.id = data.id;
        this.patient_number = data.patient_number;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.date_of_birth = data.date_of_birth;
        this.gender = data.gender;
        this.phone = data.phone;
        this.email = data.email;
        this.address = data.address;
        this.city = data.city;
        this.state = data.state;
        this.zip_code = data.zip_code;
        this.country = data.country || 'USA';
        this.emergency_contact_name = data.emergency_contact_name;
        this.emergency_contact_phone = data.emergency_contact_phone;
        this.emergency_contact_relationship = data.emergency_contact_relationship;
        this.insurance_provider = data.insurance_provider;
        this.insurance_policy_number = data.insurance_policy_number;
        this.insurance_group_number = data.insurance_group_number;
        this.medical_history = data.medical_history;
        this.allergies = data.allergies;
        this.medications = data.medications;
        this.notes = data.notes;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.created_by = data.created_by;
    }

    /**
     * Generate a unique patient number
     */
    static async generatePatientNumber() {
        const year = new Date().getFullYear();
        const prefix = `P${year}`;
        
        // Get the last patient number for this year
        const lastPatient = await database.get(
            'SELECT patient_number FROM patients WHERE patient_number LIKE ? ORDER BY patient_number DESC LIMIT 1',
            [`${prefix}%`]
        );
        
        let nextNumber = 1;
        if (lastPatient) {
            const lastNumber = parseInt(lastPatient.patient_number.replace(prefix, ''));
            nextNumber = lastNumber + 1;
        }
        
        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Create a new patient
     */
    async save() {
        try {
            if (!this.patient_number) {
                this.patient_number = await Patient.generatePatientNumber();
            }

            const sql = `
                INSERT INTO patients (
                    patient_number, first_name, last_name, date_of_birth, gender,
                    phone, email, address, city, state, zip_code, country,
                    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                    insurance_provider, insurance_policy_number, insurance_group_number,
                    medical_history, allergies, medications, notes, is_active, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                this.patient_number, this.first_name, this.last_name, this.date_of_birth, this.gender,
                this.phone, this.email, this.address, this.city, this.state, this.zip_code, this.country,
                this.emergency_contact_name, this.emergency_contact_phone, this.emergency_contact_relationship,
                this.insurance_provider, this.insurance_policy_number, this.insurance_group_number,
                this.medical_history, this.allergies, this.medications, this.notes, this.is_active, this.created_by
            ];

            const result = await database.run(sql, params);
            this.id = result.id;
            return this;
        } catch (error) {
            console.error('Error creating patient:', error);
            throw error;
        }
    }

    /**
     * Update an existing patient
     */
    async update() {
        try {
            const sql = `
                UPDATE patients SET
                    first_name = ?, last_name = ?, date_of_birth = ?, gender = ?,
                    phone = ?, email = ?, address = ?, city = ?, state = ?, zip_code = ?, country = ?,
                    emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relationship = ?,
                    insurance_provider = ?, insurance_policy_number = ?, insurance_group_number = ?,
                    medical_history = ?, allergies = ?, medications = ?, notes = ?, is_active = ?
                WHERE id = ?
            `;

            const params = [
                this.first_name, this.last_name, this.date_of_birth, this.gender,
                this.phone, this.email, this.address, this.city, this.state, this.zip_code, this.country,
                this.emergency_contact_name, this.emergency_contact_phone, this.emergency_contact_relationship,
                this.insurance_provider, this.insurance_policy_number, this.insurance_group_number,
                this.medical_history, this.allergies, this.medications, this.notes, this.is_active,
                this.id
            ];

            await database.run(sql, params);
            return this;
        } catch (error) {
            console.error('Error updating patient:', error);
            throw error;
        }
    }

    /**
     * Find patient by ID
     */
    static async findById(id) {
        try {
            const row = await database.get('SELECT * FROM patients WHERE id = ?', [id]);
            return row ? new Patient(row) : null;
        } catch (error) {
            console.error('Error finding patient by ID:', error);
            throw error;
        }
    }

    /**
     * Find patient by patient number
     */
    static async findByPatientNumber(patientNumber) {
        try {
            const row = await database.get('SELECT * FROM patients WHERE patient_number = ?', [patientNumber]);
            return row ? new Patient(row) : null;
        } catch (error) {
            console.error('Error finding patient by patient number:', error);
            throw error;
        }
    }

    /**
     * Search patients by name, phone, or email
     */
    static async search(query, limit = 50, offset = 0) {
        try {
            const searchTerm = `%${query}%`;
            const sql = `
                SELECT * FROM patients 
                WHERE (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ? OR patient_number LIKE ?)
                AND is_active = 1
                ORDER BY last_name, first_name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset]);
            return rows.map(row => new Patient(row));
        } catch (error) {
            console.error('Error searching patients:', error);
            throw error;
        }
    }

    /**
     * Get all active patients
     */
    static async findAll(limit = 100, offset = 0) {
        try {
            const sql = `
                SELECT * FROM patients 
                WHERE is_active = 1 
                ORDER BY last_name, first_name
                LIMIT ? OFFSET ?
            `;
            
            const rows = await database.all(sql, [limit, offset]);
            return rows.map(row => new Patient(row));
        } catch (error) {
            console.error('Error finding all patients:', error);
            throw error;
        }
    }

    /**
     * Get patient count
     */
    static async getCount(activeOnly = true) {
        try {
            const sql = activeOnly 
                ? 'SELECT COUNT(*) as count FROM patients WHERE is_active = 1'
                : 'SELECT COUNT(*) as count FROM patients';
            
            const result = await database.get(sql);
            return result.count;
        } catch (error) {
            console.error('Error getting patient count:', error);
            throw error;
        }
    }

    /**
     * Soft delete a patient
     */
    async delete() {
        try {
            this.is_active = false;
            await this.update();
            return this;
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    }

    /**
     * Get patient's appointments
     */
    async getAppointments(limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT a.*, u.first_name as dentist_first_name, u.last_name as dentist_last_name
                FROM appointments a
                LEFT JOIN users u ON a.dentist_id = u.id
                WHERE a.patient_id = ?
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
                LIMIT ? OFFSET ?
            `;
            
            return await database.all(sql, [this.id, limit, offset]);
        } catch (error) {
            console.error('Error getting patient appointments:', error);
            throw error;
        }
    }

    /**
     * Get patient's invoices
     */
    async getInvoices(limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT * FROM invoices 
                WHERE patient_id = ?
                ORDER BY invoice_date DESC
                LIMIT ? OFFSET ?
            `;
            
            return await database.all(sql, [this.id, limit, offset]);
        } catch (error) {
            console.error('Error getting patient invoices:', error);
            throw error;
        }
    }

    /**
     * Get patient's treatment plans
     */
    async getTreatmentPlans(limit = 50, offset = 0) {
        try {
            const sql = `
                SELECT tp.*, u.first_name as dentist_first_name, u.last_name as dentist_last_name
                FROM treatment_plans tp
                LEFT JOIN users u ON tp.dentist_id = u.id
                WHERE tp.patient_id = ?
                ORDER BY tp.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            return await database.all(sql, [this.id, limit, offset]);
        } catch (error) {
            console.error('Error getting patient treatment plans:', error);
            throw error;
        }
    }

    /**
     * Get full name
     */
    getFullName() {
        return `${this.first_name} ${this.last_name}`;
    }

    /**
     * Get age from date of birth
     */
    getAge() {
        if (!this.date_of_birth) return null;
        
        const today = new Date();
        const birthDate = new Date(this.date_of_birth);
        
        // Check if the birth date is valid
        if (isNaN(birthDate.getTime())) {
            return null;
        }
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    /**
     * Convert to JSON (for API responses)
     * Returns camelCase fields for frontend compatibility
     */
    toJSON() {
        return {
            id: this.id,
            patientNumber: this.patient_number,
            firstName: this.first_name,
            lastName: this.last_name,
            fullName: this.getFullName(),
            dateOfBirth: this.date_of_birth,
            age: this.getAge(),
            gender: this.gender,
            phone: this.phone,
            email: this.email,
            address: this.address,
            city: this.city,
            state: this.state,
            zipCode: this.zip_code,
            country: this.country,
            emergencyContactName: this.emergency_contact_name,
            emergencyContactPhone: this.emergency_contact_phone,
            emergencyContactRelationship: this.emergency_contact_relationship,
            insuranceProvider: this.insurance_provider,
            insurancePolicyNumber: this.insurance_policy_number,
            insuranceGroupNumber: this.insurance_group_number,
            medicalHistory: this.medical_history,
            allergies: this.allergies,
            medications: this.medications,
            notes: this.notes,
            isActive: this.is_active,
            createdAt: this.created_at,
            updatedAt: this.updated_at
        };
    }
}

module.exports = Patient;