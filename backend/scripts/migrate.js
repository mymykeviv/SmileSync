#!/usr/bin/env node

const MigrationRunner = require('../database/migrationRunner');
const database = require('../database/init');

/**
 * Migration CLI Script
 * Usage:
 *   node scripts/migrate.js up     - Run pending migrations
 *   node scripts/migrate.js down   - Rollback last migration
 *   node scripts/migrate.js status - Show migration status
 */

async function main() {
    const command = process.argv[2];
    const migrationRunner = new MigrationRunner();
    
    try {
        // Initialize database connection
        await database.init();
        
        switch (command) {
            case 'up':
                console.log('Running migrations...');
                await migrationRunner.runMigrations();
                break;
                
            case 'down':
                console.log('Rolling back last migration...');
                await migrationRunner.rollbackLastMigration();
                break;
                
            case 'status':
                await migrationRunner.getStatus();
                break;
                
            default:
                console.log('Usage:');
                console.log('  node scripts/migrate.js up     - Run pending migrations');
                console.log('  node scripts/migrate.js down   - Rollback last migration');
                console.log('  node scripts/migrate.js status - Show migration status');
                process.exit(1);
        }
        
        console.log('Migration command completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration command failed:', error);
        process.exit(1);
    } finally {
        // Close database connection
        if (database.db) {
            database.close();
        }
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

main();