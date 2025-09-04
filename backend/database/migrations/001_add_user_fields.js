const database = require('../init');

/**
 * Migration: Add license_number and specialization fields to users table
 * This migration safely adds new fields while preserving existing data
 */
class Migration001AddUserFields {
    static async up() {
        try {
            console.log('Running migration: Add license_number and specialization fields to users table');
            
            // Check if columns already exist to avoid errors
            const tableInfo = await database.all("PRAGMA table_info(users)");
            const existingColumns = tableInfo.map(col => col.name);
            
            // Add license_number column if it doesn't exist
            if (!existingColumns.includes('license_number')) {
                await database.run('ALTER TABLE users ADD COLUMN license_number VARCHAR(50)');
                console.log('Added license_number column to users table');
            } else {
                console.log('license_number column already exists, skipping');
            }
            
            // Add specialization column if it doesn't exist
            if (!existingColumns.includes('specialization')) {
                await database.run('ALTER TABLE users ADD COLUMN specialization VARCHAR(100)');
                console.log('Added specialization column to users table');
            } else {
                console.log('specialization column already exists, skipping');
            }
            
            console.log('Migration completed successfully');
            return true;
        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }
    
    static async down() {
        try {
            console.log('Rolling back migration: Remove license_number and specialization fields from users table');
            
            // Note: SQLite doesn't support DROP COLUMN directly
            // This would require recreating the table, which is risky for production
            // For now, we'll just log a warning
            console.warn('SQLite does not support DROP COLUMN. Manual intervention required for rollback.');
            console.warn('To rollback, you would need to:');
            console.warn('1. Create a new table without these columns');
            console.warn('2. Copy data from old table to new table');
            console.warn('3. Drop old table and rename new table');
            
            return true;
        } catch (error) {
            console.error('Migration rollback failed:', error);
            throw error;
        }
    }
    
    static getVersion() {
        return '001';
    }
    
    static getDescription() {
        return 'Add license_number and specialization fields to users table';
    }
}

module.exports = Migration001AddUserFields;