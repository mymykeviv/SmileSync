const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database configuration
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/smilesync.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

class Database {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize the database connection and create tables if they don't exist
     */
    async init() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(DB_PATH);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
                console.log(`Created data directory: ${dataDir}`);
            }

            // Create database connection
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    throw err;
                }
                console.log(`Connected to SQLite database: ${DB_PATH}`);
            });

            // Enable foreign key constraints
            await this.run('PRAGMA foreign_keys = ON');
            
            // Run schema if tables don't exist
            await this.createTables();
            
            console.log('Database initialized successfully');
            return this.db;
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create tables from schema file
     */
    async createTables() {
        try {
            const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
            const statements = schema.split(';').filter(stmt => stmt.trim());
            
            for (const statement of statements) {
                if (statement.trim()) {
                    await this.run(statement);
                }
            }
            
            console.log('Database schema created/updated successfully');
        } catch (error) {
            console.error('Error creating tables:', error);
            throw error;
        }
    }

    /**
     * Run a SQL statement
     */
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('SQL Error:', err.message);
                    console.error('SQL Statement:', sql);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    /**
     * Get a single row
     */
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('SQL Error:', err.message);
                    console.error('SQL Statement:', sql);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Get all rows
     */
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('SQL Error:', err.message);
                    console.error('SQL Statement:', sql);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Execute multiple statements in a transaction
     */
    async transaction(statements) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                
                const results = [];
                let hasError = false;
                
                statements.forEach((stmt, index) => {
                    this.db.run(stmt.sql, stmt.params || [], function(err) {
                        if (err && !hasError) {
                            hasError = true;
                            this.db.run('ROLLBACK');
                            reject(err);
                        } else if (!hasError) {
                            results[index] = { id: this.lastID, changes: this.changes };
                            
                            if (results.length === statements.length) {
                                this.db.run('COMMIT', (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(results);
                                    }
                                });
                            }
                        }
                    });
                });
            });
        });
    }

    /**
     * Close database connection
     */
    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Reset database (drop all tables and recreate)
     */
    async reset() {
        try {
            console.log('Resetting database...');
            
            // Get all table names
            const tables = await this.all(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            );
            
            // Drop all tables
            for (const table of tables) {
                await this.run(`DROP TABLE IF EXISTS ${table.name}`);
            }
            
            // Recreate tables
            await this.createTables();
            
            console.log('Database reset completed');
        } catch (error) {
            console.error('Error resetting database:', error);
            throw error;
        }
    }

    /**
     * Get database statistics
     */
    async getStats() {
        try {
            const tables = await this.all(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            );
            
            const stats = {};
            
            for (const table of tables) {
                const result = await this.get(`SELECT COUNT(*) as count FROM ${table.name}`);
                stats[table.name] = result.count;
            }
            
            return stats;
        } catch (error) {
            console.error('Error getting database stats:', error);
            throw error;
        }
    }
}

// Create singleton instance
const database = new Database();

module.exports = database;