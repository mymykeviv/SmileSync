const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Initialize database and create tables
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database.');
    });

    // Create tables
    const createTables = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        role TEXT CHECK(role IN ('admin', 'dentist', 'hygienist', 'receptionist')) DEFAULT 'receptionist',
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Patients table
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_number VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        date_of_birth DATE,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        insurance_provider VARCHAR(100),
        insurance_policy_number VARCHAR(50),
        medical_history TEXT,
        allergies TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Services table
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        duration_minutes INTEGER DEFAULT 30,
        price DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        supplier VARCHAR(100),
        unit_price DECIMAL(10,2) NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        minimum_stock_level INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Appointments table
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_number VARCHAR(20) UNIQUE NOT NULL,
        patient_id INTEGER NOT NULL,
        dentist_id INTEGER,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        status TEXT CHECK(status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
        service_id INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (dentist_id) REFERENCES users(id),
        FOREIGN KEY (service_id) REFERENCES services(id)
      );

      -- Treatment Plans table
      CREATE TABLE IF NOT EXISTS treatment_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        dentist_id INTEGER NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        estimated_cost DECIMAL(10,2),
        status TEXT CHECK(status IN ('draft', 'proposed', 'approved', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
        start_date DATE,
        end_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (dentist_id) REFERENCES users(id)
      );

      -- Treatment Plan Items table
      CREATE TABLE IF NOT EXISTS treatment_plan_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        treatment_plan_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status TEXT CHECK(status IN ('pending', 'completed')) DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id),
        FOREIGN KEY (service_id) REFERENCES services(id)
      );

      -- Invoices table
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number VARCHAR(20) UNIQUE NOT NULL,
        patient_id INTEGER NOT NULL,
        appointment_id INTEGER,
        treatment_plan_id INTEGER,
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        status TEXT CHECK(status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (appointment_id) REFERENCES appointments(id),
        FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id)
      );

      -- Invoice Items table
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        service_id INTEGER,
        product_id INTEGER,
        description VARCHAR(200) NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (service_id) REFERENCES services(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      -- Payments table
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_number VARCHAR(20) UNIQUE NOT NULL,
        invoice_id INTEGER NOT NULL,
        patient_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT CHECK(payment_method IN ('cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'insurance')) NOT NULL,
        payment_date DATE NOT NULL,
        reference_number VARCHAR(100),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      );
    `;

    db.exec(createTables, (err) => {
      if (err) {
        console.error('Error creating tables:', err.message);
        reject(err);
        return;
      }
      console.log('Database tables created successfully.');
      
      // Insert sample data
      insertSampleData(db)
        .then(() => {
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
              reject(err);
            } else {
              console.log('Database initialization completed.');
              resolve();
            }
          });
        })
        .catch(reject);
    });
  });
}

// Insert sample data
function insertSampleData(db) {
  return new Promise((resolve, reject) => {
    const sampleData = `
      -- Insert sample services
      INSERT OR IGNORE INTO services (service_code, name, description, category, duration_minutes, price) VALUES
      ('CLEAN-001', 'Regular Cleaning', 'Routine dental cleaning and examination', 'Preventive', 60, 120.00),
      ('FILL-001', 'Composite Filling', 'Tooth-colored filling for cavities', 'Restorative', 45, 180.00),
      ('CROWN-001', 'Dental Crown', 'Full coverage crown restoration', 'Restorative', 90, 800.00),
      ('XRAY-001', 'Digital X-Ray', 'Digital radiographic examination', 'Diagnostic', 15, 45.00),
      ('EXTRACT-001', 'Tooth Extraction', 'Simple tooth extraction', 'Surgical', 30, 200.00);

      -- Insert sample products
      INSERT OR IGNORE INTO products (product_code, name, description, category, supplier, unit_price, stock_quantity) VALUES
      ('BRUSH-001', 'Electric Toothbrush', 'Professional electric toothbrush', 'Oral Care', 'OralB', 89.99, 25),
      ('PASTE-001', 'Fluoride Toothpaste', 'Professional strength fluoride toothpaste', 'Oral Care', 'Colgate', 12.99, 50),
      ('FLOSS-001', 'Dental Floss', 'Waxed dental floss', 'Oral Care', 'Johnson & Johnson', 4.99, 100),
      ('RINSE-001', 'Antibacterial Mouthwash', 'Therapeutic mouthwash', 'Oral Care', 'Listerine', 8.99, 30);

      -- Insert sample patients
      INSERT OR IGNORE INTO patients (patient_number, first_name, last_name, date_of_birth, gender, phone, email, address, insurance_provider) VALUES
      ('P001', 'John', 'Smith', '1985-03-15', 'male', '555-0101', 'john.smith@email.com', '123 Main St, Anytown, ST 12345', 'Blue Cross'),
      ('P002', 'Sarah', 'Johnson', '1990-07-22', 'female', '555-0102', 'sarah.johnson@email.com', '456 Oak Ave, Anytown, ST 12345', 'Aetna'),
      ('P003', 'Michael', 'Brown', '1978-11-08', 'male', '555-0103', 'michael.brown@email.com', '789 Pine Rd, Anytown, ST 12345', 'Cigna');

      -- Insert sample user (dentist)
      INSERT OR IGNORE INTO users (username, email, password_hash, first_name, last_name, role, phone) VALUES
      ('dr.wilson', 'dr.wilson@smilesync.com', '$2b$10$example_hash', 'Dr. Emily', 'Wilson', 'dentist', '555-0200');
    `;

    db.exec(sampleData, (err) => {
      if (err) {
        console.error('Error inserting sample data:', err.message);
        reject(err);
      } else {
        console.log('Sample data inserted successfully.');
        resolve();
      }
    });
  });
}

module.exports = {
  initializeDatabase,
  DB_PATH
};