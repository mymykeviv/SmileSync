-- SmileSync Database Schema
-- SQLite database schema for dental clinic management

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff', -- 'admin', 'dentist', 'assistant', 'receptionist', 'staff'
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_number VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated patient ID
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10), -- 'male', 'female', 'other'
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'USA',
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(50),
    insurance_group_number VARCHAR(50),
    medical_history TEXT,
    allergies TEXT,
    medications TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Services table (dental procedures and treatments)
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_code VARCHAR(20) UNIQUE NOT NULL, -- ADA codes or custom codes
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- 'preventive', 'restorative', 'cosmetic', 'surgical', 'orthodontic'
    duration_minutes INTEGER DEFAULT 60,
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table (dental supplies, materials, etc.)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- 'supplies', 'materials', 'equipment', 'medication'
    unit_price DECIMAL(10,2) NOT NULL,
    unit_of_measure VARCHAR(20) DEFAULT 'each', -- 'each', 'box', 'bottle', 'tube'
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    supplier VARCHAR(100),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_number VARCHAR(20) UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL,
    dentist_id INTEGER, -- User with role 'dentist'
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
    appointment_type VARCHAR(50), -- 'consultation', 'cleaning', 'treatment', 'follow_up', 'emergency'
    chief_complaint TEXT,
    treatment_notes TEXT,
    next_appointment_recommended BOOLEAN DEFAULT 0,
    next_appointment_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (dentist_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Treatment plans table
CREATE TABLE IF NOT EXISTS treatment_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    dentist_id INTEGER NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    description TEXT,
    total_estimated_cost DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'proposed', 'approved', 'in_progress', 'completed', 'cancelled'
    start_date DATE,
    estimated_completion_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (dentist_id) REFERENCES users(id)
);

-- Treatment plan items (services included in a treatment plan)
CREATE TABLE IF NOT EXISTS treatment_plan_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treatment_plan_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    tooth_number VARCHAR(10), -- Specific tooth if applicable
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'cancelled'
    scheduled_date DATE,
    completed_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0, -- Tax rate as decimal (e.g., 0.0875 for 8.75%)
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'
    payment_terms VARCHAR(50) DEFAULT 'Net 30',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Invoice items (services and products billed)
CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    item_type VARCHAR(20) NOT NULL, -- 'service' or 'product'
    item_id INTEGER NOT NULL, -- References services.id or products.id
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    tooth_number VARCHAR(10), -- For dental services
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_number VARCHAR(20) UNIQUE NOT NULL,
    invoice_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- 'cash', 'check', 'credit_card', 'debit_card', 'insurance', 'bank_transfer'
    payment_reference VARCHAR(50), -- Check number, transaction ID, etc.
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Audit log for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values TEXT, -- JSON string of old values
    new_values TEXT, -- JSON string of new values
    changed_by INTEGER,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dentist ON appointments(dentist_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Triggers for updating timestamps
CREATE TRIGGER IF NOT EXISTS update_patients_timestamp 
    AFTER UPDATE ON patients
    BEGIN
        UPDATE patients SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_appointments_timestamp 
    AFTER UPDATE ON appointments
    BEGIN
        UPDATE appointments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_invoices_timestamp 
    AFTER UPDATE ON invoices
    BEGIN
        UPDATE invoices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_services_timestamp 
    AFTER UPDATE ON services
    BEGIN
        UPDATE services SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_products_timestamp 
    AFTER UPDATE ON products
    BEGIN
        UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Trigger to update invoice totals when items are added/updated
CREATE TRIGGER IF NOT EXISTS update_invoice_totals_after_item_insert
    AFTER INSERT ON invoice_items
    BEGIN
        UPDATE invoices 
        SET subtotal = (
            SELECT COALESCE(SUM(total_price), 0) 
            FROM invoice_items 
            WHERE invoice_id = NEW.invoice_id
        ),
        tax_amount = (
            SELECT COALESCE(SUM(total_price), 0) * tax_rate
            FROM invoice_items 
            WHERE invoice_id = NEW.invoice_id
        )
        WHERE id = NEW.invoice_id;
        
        UPDATE invoices 
        SET total_amount = subtotal + tax_amount - discount_amount,
            balance_due = subtotal + tax_amount - discount_amount - amount_paid
        WHERE id = NEW.invoice_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_invoice_totals_after_item_update
    AFTER UPDATE ON invoice_items
    BEGIN
        UPDATE invoices 
        SET subtotal = (
            SELECT COALESCE(SUM(total_price), 0) 
            FROM invoice_items 
            WHERE invoice_id = NEW.invoice_id
        ),
        tax_amount = (
            SELECT COALESCE(SUM(total_price), 0) * tax_rate
            FROM invoice_items 
            WHERE invoice_id = NEW.invoice_id
        )
        WHERE id = NEW.invoice_id;
        
        UPDATE invoices 
        SET total_amount = subtotal + tax_amount - discount_amount,
            balance_due = subtotal + tax_amount - discount_amount - amount_paid
        WHERE id = NEW.invoice_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_invoice_totals_after_item_delete
    AFTER DELETE ON invoice_items
    BEGIN
        UPDATE invoices 
        SET subtotal = (
            SELECT COALESCE(SUM(total_price), 0) 
            FROM invoice_items 
            WHERE invoice_id = OLD.invoice_id
        ),
        tax_amount = (
            SELECT COALESCE(SUM(total_price), 0) * tax_rate
            FROM invoice_items 
            WHERE invoice_id = OLD.invoice_id
        )
        WHERE id = OLD.invoice_id;
        
        UPDATE invoices 
        SET total_amount = subtotal + tax_amount - discount_amount,
            balance_due = subtotal + tax_amount - discount_amount - amount_paid
        WHERE id = OLD.invoice_id;
    END;