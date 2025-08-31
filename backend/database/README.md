# SmileSync Database Layer

This directory contains all database-related files for the SmileSync dental clinic management system, including schema definitions, initialization scripts, and database configuration.

## 🏗️ Database Architecture

```
database/
├── init.js        # Database initialization and setup
└── schema.sql     # SQL schema definitions and table structures
```

## 🗄️ Database Technology

### SQLite3
SmileSync uses SQLite3 as the embedded database solution:
- **Lightweight**: No separate database server required
- **Portable**: Single file database for easy deployment
- **ACID Compliant**: Full transaction support
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Zero Configuration**: No setup or administration required

### Sequelize ORM
Database operations are managed through Sequelize ORM:
- **Model-Based**: Object-relational mapping for JavaScript
- **Migration Support**: Schema versioning and updates
- **Validation**: Built-in data validation and constraints
- **Associations**: Relationship management between models
- **Query Builder**: Powerful query construction and optimization

## 📊 Database Schema

### Core Tables

#### Patients Table
Stores patient information and medical records.

```sql
CREATE TABLE Patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  dateOfBirth DATE,
  gender ENUM('male', 'female', 'other'),
  address TEXT,
  medicalHistory TEXT,
  emergencyContact VARCHAR(255),
  insuranceInfo TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Appointments Table
Manages appointment scheduling and tracking.

```sql
CREATE TABLE Appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER NOT NULL,
  serviceId INTEGER,
  appointmentDate DATETIME NOT NULL,
  duration INTEGER DEFAULT 60,
  status ENUM('scheduled', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES Patients(id),
  FOREIGN KEY (serviceId) REFERENCES Services(id)
);
```

#### Services Table
Catalog of dental services and procedures.

```sql
CREATE TABLE Services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER DEFAULT 60,
  category VARCHAR(100),
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Products Table
Inventory management for dental supplies and materials.

```sql
CREATE TABLE Products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  stockQuantity INTEGER DEFAULT 0,
  minStockLevel INTEGER DEFAULT 0,
  supplier VARCHAR(255),
  category VARCHAR(100),
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Invoices Table
Billing and invoice management.

```sql
CREATE TABLE Invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER NOT NULL,
  appointmentId INTEGER,
  invoiceNumber VARCHAR(50) UNIQUE NOT NULL,
  issueDate DATE NOT NULL,
  dueDate DATE,
  subtotal DECIMAL(10,2) NOT NULL,
  taxAmount DECIMAL(10,2) DEFAULT 0,
  totalAmount DECIMAL(10,2) NOT NULL,
  status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES Patients(id),
  FOREIGN KEY (appointmentId) REFERENCES Appointments(id)
);
```

## 🔧 Database Initialization

### Initialization Process
The `init.js` file handles database setup and initialization:

```javascript
const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/smilesync.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false
  }
});

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');
    
    await seedInitialData();
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = { sequelize, initDatabase };
```

### Database Location
- **Development**: `data/smilesync.db` (relative to project root)
- **Production**: Configurable via environment variables
- **Testing**: In-memory database for test isolation

## 🌱 Data Seeding

### Initial Data
The system includes seed data for:
- Default dental services and procedures
- Sample product catalog
- System configuration settings
- Demo patient data (development only)

## 🔍 Database Queries

### Common Query Patterns

#### Patient Queries
```javascript
// Get patient with appointments
const patient = await Patient.findByPk(id, {
  include: [{
    model: Appointment,
    include: [Service]
  }]
});

// Search patients
const patients = await Patient.findAll({
  where: {
    [Op.or]: [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ]
  }
});
```

#### Appointment Queries
```javascript
// Get appointments for date range
const appointments = await Appointment.findAll({
  where: {
    appointmentDate: {
      [Op.between]: [startDate, endDate]
    }
  },
  include: [Patient, Service],
  order: [['appointmentDate', 'ASC']]
});
```

## 🔒 Security & Compliance

### Data Protection
- **Encryption**: Sensitive data encrypted at rest
- **Access Control**: Role-based database access
- **Audit Logging**: All data changes tracked
- **Backup**: Regular automated backups

### HIPAA Compliance
- Patient data encryption
- Access logging and monitoring
- Data retention policies
- Secure data transmission

## 🚀 Performance Optimization

### Indexing Strategy
```sql
-- Primary indexes (automatic)
-- Foreign key indexes
CREATE INDEX idx_appointments_patient_id ON Appointments(patientId);
CREATE INDEX idx_appointments_date ON Appointments(appointmentDate);
CREATE INDEX idx_invoices_patient_id ON Invoices(patientId);

-- Search indexes
CREATE INDEX idx_patients_name ON Patients(lastName, firstName);
CREATE INDEX idx_patients_email ON Patients(email);
```

## 🧪 Testing

### Database Testing
```javascript
// Test database setup
beforeEach(async () => {
  await sequelize.sync({ force: true });
  await seedTestData();
});

// Test data integrity
it('should maintain referential integrity', async () => {
  const patient = await Patient.create(testPatientData);
  const appointment = await Appointment.create({
    ...testAppointmentData,
    patientId: patient.id
  });
  
  expect(appointment.patientId).toBe(patient.id);
});
```

## 🔧 Maintenance

### Backup Strategy
- **Automated Backups**: Daily SQLite file backups
- **Export Functionality**: CSV/JSON data export
- **Restore Procedures**: Database restoration from backups

## 🚀 Future Enhancements

- **Multi-Clinic Support**: Tenant-based data isolation
- **Advanced Analytics**: Data warehouse integration
- **Real-time Sync**: Multi-device synchronization
- **Cloud Backup**: Automated cloud backup integration
- **Data Archiving**: Historical data archiving system

---

**Database Layer** - Robust data foundation for SmileSync dental clinic management. 🦷🗄️