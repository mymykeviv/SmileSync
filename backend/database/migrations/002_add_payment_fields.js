const database = require('../init');

/**
 * Migration: Add transaction_id and status fields to payments table
 * This migration adds missing fields required by the Payment model
 */
class Migration002AddPaymentFields {
    static async up() {
        try {
            console.log('Running migration: Add transaction_id and status fields to payments table');
            
            // Check if columns already exist to avoid errors
            const tableInfo = await database.all("PRAGMA table_info(payments)");
            const existingColumns = tableInfo.map(col => col.name);
            
            // Add transaction_id column if it doesn't exist
            if (!existingColumns.includes('transaction_id')) {
                await database.run('ALTER TABLE payments ADD COLUMN transaction_id VARCHAR(100)');
                console.log('Added transaction_id column to payments table');
            } else {
                console.log('transaction_id column already exists, skipping');
            }
            
            // Add status column if it doesn't exist
            if (!existingColumns.includes('status')) {
                await database.run('ALTER TABLE payments ADD COLUMN status VARCHAR(20) DEFAULT "completed"');
                console.log('Added status column to payments table');
            } else {
                console.log('status column already exists, skipping');
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
            console.log('Rolling back migration: Remove transaction_id and status fields from payments table');
            
            // Note: SQLite doesn't support DROP COLUMN directly
            // In a production environment, you might need to recreate the table
            // For now, we'll just log the rollback attempt
            console.log('Warning: SQLite does not support DROP COLUMN. Manual intervention may be required.');
            
            return true;
        } catch (error) {
            console.error('Migration rollback failed:', error);
            throw error;
        }
    }
    
    static getVersion() {
        return '002';
    }
    
    static getDescription() {
        return 'Add transaction_id and status fields to payments table';
    }
}

module.exports = Migration002AddPaymentFields;