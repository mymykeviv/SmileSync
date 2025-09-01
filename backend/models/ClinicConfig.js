const database = require('../database/init');

class ClinicConfig {
    constructor(data = {}) {
        this.id = data.id || null;
        this.clinic_name = data.clinic_name || 'Dental Practice Management';
        this.clinic_subtitle = data.clinic_subtitle || 'SmileSync Professional Dental Practice Management Suite';
        this.contact_phone = data.contact_phone || '(555) 123-SMILE';
        this.clinic_address = data.clinic_address || 'Downtown Dental Center';
        this.practice_name = data.practice_name || 'Dr. Smith\'s Practice';
        this.email = data.email || 'info@smilesync.com';
        this.website = data.website || 'www.smilesync.com';
        this.logo_url = data.logo_url || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    /**
     * Get clinic configuration (singleton pattern - only one config record)
     */
    static async getConfig() {
        try {
            const row = await database.get(
                'SELECT * FROM clinic_config ORDER BY id DESC LIMIT 1'
            );
            
            if (row) {
                return new ClinicConfig(row);
            }
            
            // Return default config if none exists
            return new ClinicConfig();
        } catch (error) {
            console.error('Error fetching clinic config:', error);
            throw error;
        }
    }

    /**
     * Update clinic configuration
     */
    static async updateConfig(configData) {
        try {
            const timestamp = new Date().toISOString();
            
            // Check if config exists
            const existingConfig = await database.get(
                'SELECT id FROM clinic_config ORDER BY id DESC LIMIT 1'
            );
            
            if (existingConfig) {
                // Update existing config
                await database.run(
                    `UPDATE clinic_config SET 
                        clinic_name = ?, 
                        clinic_subtitle = ?, 
                        contact_phone = ?, 
                        clinic_address = ?, 
                        practice_name = ?, 
                        email = ?, 
                        website = ?, 
                        logo_url = ?, 
                        updated_at = ?
                    WHERE id = ?`,
                    [
                        configData.clinic_name || 'Dental Practice Management',
                        configData.clinic_subtitle || 'SmileSync Professional Dental Practice Management Suite',
                        configData.contact_phone || '(555) 123-SMILE',
                        configData.clinic_address || 'Downtown Dental Center',
                        configData.practice_name || 'Dr. Smith\'s Practice',
                        configData.email || 'info@smilesync.com',
                        configData.website || 'www.smilesync.com',
                        configData.logo_url || null,
                        timestamp,
                        existingConfig.id
                    ]
                );
                
                return await ClinicConfig.getConfig();
            } else {
                // Create new config
                const result = await database.run(
                    `INSERT INTO clinic_config (
                        clinic_name, clinic_subtitle, contact_phone, clinic_address, 
                        practice_name, email, website, logo_url, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        configData.clinic_name || 'Dental Practice Management',
                        configData.clinic_subtitle || 'SmileSync Professional Dental Practice Management Suite',
                        configData.contact_phone || '(555) 123-SMILE',
                        configData.clinic_address || 'Downtown Dental Center',
                        configData.practice_name || 'Dr. Smith\'s Practice',
                        configData.email || 'info@smilesync.com',
                        configData.website || 'www.smilesync.com',
                        configData.logo_url || null,
                        timestamp,
                        timestamp
                    ]
                );
                
                return await ClinicConfig.getConfig();
            }
        } catch (error) {
            console.error('Error updating clinic config:', error);
            throw error;
        }
    }

    /**
     * Initialize clinic config table
     */
    static async initializeTable() {
        try {
            await database.run(`
                CREATE TABLE IF NOT EXISTS clinic_config (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    clinic_name TEXT NOT NULL DEFAULT 'Dental Practice Management',
                    clinic_subtitle TEXT NOT NULL DEFAULT 'SmileSync Professional Dental Practice Management Suite',
                    contact_phone TEXT NOT NULL DEFAULT '(555) 123-SMILE',
                    clinic_address TEXT NOT NULL DEFAULT 'Downtown Dental Center',
                    practice_name TEXT NOT NULL DEFAULT 'Dr. Smith''s Practice',
                    email TEXT DEFAULT 'info@smilesync.com',
                    website TEXT DEFAULT 'www.smilesync.com',
                    logo_url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            console.log('Clinic config table initialized successfully');
        } catch (error) {
            console.error('Error initializing clinic config table:', error);
            throw error;
        }
    }

    /**
     * Convert to JSON (for API responses)
     */
    toJSON() {
        return {
            id: this.id,
            clinicName: this.clinic_name,
            clinicSubtitle: this.clinic_subtitle,
            contactPhone: this.contact_phone,
            clinicAddress: this.clinic_address,
            practiceName: this.practice_name,
            email: this.email,
            website: this.website,
            logoUrl: this.logo_url,
            createdAt: this.created_at,
            updatedAt: this.updated_at
        };
    }
}

module.exports = ClinicConfig;