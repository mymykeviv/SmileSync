const database = require('./init');
const fs = require('fs');
const path = require('path');

/**
 * Database Migration Runner
 * Handles running and tracking database migrations
 */
class MigrationRunner {
    constructor() {
        this.migrationsPath = path.join(__dirname, 'migrations');
    }
    
    /**
     * Initialize migrations table to track applied migrations
     */
    async initMigrationsTable() {
        try {
            await database.run(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    version VARCHAR(10) UNIQUE NOT NULL,
                    description TEXT,
                    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Migrations table initialized');
        } catch (error) {
            console.error('Failed to initialize migrations table:', error);
            throw error;
        }
    }
    
    /**
     * Get list of applied migrations
     */
    async getAppliedMigrations() {
        try {
            const migrations = await database.all('SELECT version FROM migrations ORDER BY version');
            return migrations.map(m => m.version);
        } catch (error) {
            console.error('Failed to get applied migrations:', error);
            return [];
        }
    }
    
    /**
     * Get list of available migration files
     */
    getAvailableMigrations() {
        try {
            if (!fs.existsSync(this.migrationsPath)) {
                console.log('Migrations directory does not exist');
                return [];
            }
            
            const files = fs.readdirSync(this.migrationsPath)
                .filter(file => file.endsWith('.js'))
                .sort();
            
            return files.map(file => {
                const migrationPath = path.join(this.migrationsPath, file);
                const Migration = require(migrationPath);
                return {
                    file,
                    version: Migration.getVersion(),
                    description: Migration.getDescription(),
                    Migration
                };
            });
        } catch (error) {
            console.error('Failed to get available migrations:', error);
            return [];
        }
    }
    
    /**
     * Run pending migrations
     */
    async runMigrations() {
        try {
            await this.initMigrationsTable();
            
            const appliedMigrations = await this.getAppliedMigrations();
            const availableMigrations = this.getAvailableMigrations();
            
            const pendingMigrations = availableMigrations.filter(
                migration => !appliedMigrations.includes(migration.version)
            );
            
            if (pendingMigrations.length === 0) {
                console.log('No pending migrations');
                return;
            }
            
            console.log(`Found ${pendingMigrations.length} pending migration(s)`);
            
            for (const migration of pendingMigrations) {
                console.log(`Running migration ${migration.version}: ${migration.description}`);
                
                try {
                    await migration.Migration.up();
                    
                    // Record migration as applied
                    await database.run(
                        'INSERT INTO migrations (version, description) VALUES (?, ?)',
                        [migration.version, migration.description]
                    );
                    
                    console.log(`Migration ${migration.version} completed successfully`);
                } catch (error) {
                    console.error(`Migration ${migration.version} failed:`, error);
                    throw error;
                }
            }
            
            console.log('All migrations completed successfully');
        } catch (error) {
            console.error('Migration runner failed:', error);
            throw error;
        }
    }
    
    /**
     * Rollback last migration
     */
    async rollbackLastMigration() {
        try {
            const appliedMigrations = await database.all(
                'SELECT * FROM migrations ORDER BY applied_at DESC LIMIT 1'
            );
            
            if (appliedMigrations.length === 0) {
                console.log('No migrations to rollback');
                return;
            }
            
            const lastMigration = appliedMigrations[0];
            const availableMigrations = this.getAvailableMigrations();
            const migrationToRollback = availableMigrations.find(
                m => m.version === lastMigration.version
            );
            
            if (!migrationToRollback) {
                console.error(`Migration file for version ${lastMigration.version} not found`);
                return;
            }
            
            console.log(`Rolling back migration ${lastMigration.version}: ${lastMigration.description}`);
            
            await migrationToRollback.Migration.down();
            
            // Remove migration record
            await database.run(
                'DELETE FROM migrations WHERE version = ?',
                [lastMigration.version]
            );
            
            console.log(`Migration ${lastMigration.version} rolled back successfully`);
        } catch (error) {
            console.error('Migration rollback failed:', error);
            throw error;
        }
    }
    
    /**
     * Get migration status
     */
    async getStatus() {
        try {
            await this.initMigrationsTable();
            
            const appliedMigrations = await this.getAppliedMigrations();
            const availableMigrations = this.getAvailableMigrations();
            
            console.log('\n=== Migration Status ===');
            console.log(`Applied migrations: ${appliedMigrations.length}`);
            console.log(`Available migrations: ${availableMigrations.length}`);
            
            if (appliedMigrations.length > 0) {
                console.log('\nApplied:');
                for (const version of appliedMigrations) {
                    const migration = availableMigrations.find(m => m.version === version);
                    const description = migration ? migration.description : 'Unknown';
                    console.log(`  ✓ ${version}: ${description}`);
                }
            }
            
            const pendingMigrations = availableMigrations.filter(
                migration => !appliedMigrations.includes(migration.version)
            );
            
            if (pendingMigrations.length > 0) {
                console.log('\nPending:');
                for (const migration of pendingMigrations) {
                    console.log(`  ○ ${migration.version}: ${migration.description}`);
                }
            }
            
            console.log('========================\n');
        } catch (error) {
            console.error('Failed to get migration status:', error);
            throw error;
        }
    }
}

module.exports = MigrationRunner;