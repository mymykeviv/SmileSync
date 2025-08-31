# SmileSync Data Models

This directory contains all Sequelize model definitions for the SmileSync dental clinic management system, defining the data structure, relationships, and business logic for the application.

## 🏗️ Model Architecture

```
models/
├── index.js           # Model initialization and associations
├── Patient.js         # Patient model and medical records
├── Appointment.js     # Appointment scheduling model
├── Service.js         # Dental services catalog model
├── Product.js         # Product inventory model
├── Invoice.js         # Invoice and billing model
├── InvoiceItem.js     # Invoice line items model
├── Payment.js         # Payment tracking model
├── TreatmentPlan.js   # Treatment planning model
└── User.js            # System users model (future)
```

## 🗄️ Model Technology Stack

### Sequelize ORM
- **Version**: 6.x
- **Database**: SQLite3 (development), PostgreSQL (production ready)
- **Features**: Migrations, validations, associations, hooks
- **TypeScript**: Ready for TypeScript integration

### Model Features
- **Timestamps**: Automatic createdAt/updatedAt tracking
- **Validation**: Built-in and custom field validation
- **Hooks**: Lifecycle event handling
- **Associations**: Complex relationship management
- **Scopes**: Predefined query filters
- **Virtual Fields**: Computed properties

## 📊 Core Models

### Patient Model
Central model for patient information and medical records.

```javascript
// models/Patient.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Patient = sequelize.define('Patient', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      validate: {
        is: /^[\+]?[1-9][\d]{0,15}$/
      }
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString()
      }
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    address: DataTypes.TEXT,
    medicalHistory: DataTypes.TEXT,
    emergencyContact: DataTypes.STRING(255),
    insuranceInfo: DataTypes.TEXT
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['lastName', 'firstName']
      },
      {
        fields: ['email']
      }
    ]
  });

  // Virtual fields
  Patient.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  Patient.prototype.getAge = function() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return Patient;
};
```

### Appointment Model
Manages appointment scheduling and status tracking.

```javascript
// models/Appointment.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'id'
      }
    },
    serviceId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Services',
        key: 'id'
      }
    },
    appointmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter: new Date().toISOString()
      }
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
      validate: {
        min: 15,
        max: 480
      }
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'no-show'),
      defaultValue: 'scheduled'
    },
    notes: DataTypes.TEXT
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['patientId']
      },
      {
        fields: ['appointmentDate']
      },
      {
        fields: ['status']
      }
    ]
  });

  // Instance methods
  Appointment.prototype.getEndTime = function() {
    const endTime = new Date(this.appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + this.duration);
    return endTime;
  };

  Appointment.prototype.isUpcoming = function() {
    return new Date(this.appointmentDate) > new Date();
  };

  return Appointment;
};
```

### Service Model
Catalog of dental services and procedures.

```javascript
// models/Service.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
      validate: {
        min: 15
      }
    },
    category: {
      type: DataTypes.STRING(100),
      validate: {
        isIn: [['Preventive', 'Restorative', 'Cosmetic', 'Orthodontic', 'Endodontic', 'Periodontic', 'Oral Surgery']]
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    scopes: {
      active: {
        where: {
          isActive: true
        }
      },
      byCategory: (category) => ({
        where: {
          category: category,
          isActive: true
        }
      })
    }
  });

  return Service;
};
```

### Product Model
Inventory management for dental supplies.

```javascript
// models/Product.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0
      }
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    minStockLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    supplier: DataTypes.STRING(255),
    category: DataTypes.STRING(100),
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

  // Instance methods
  Product.prototype.isLowStock = function() {
    return this.stockQuantity <= this.minStockLevel;
  };

  Product.prototype.getMargin = function() {
    if (!this.cost || this.cost === 0) return null;
    return ((this.price - this.cost) / this.cost * 100).toFixed(2);
  };

  return Product;
};
```

### Invoice Model
Billing and invoice management.

```javascript
// models/Invoice.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'id'
      }
    },
    appointmentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Appointments',
        key: 'id'
      }
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dueDate: DataTypes.DATEONLY,
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'draft'
    },
    notes: DataTypes.TEXT
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (invoice) => {
        if (!invoice.invoiceNumber) {
          const count = await Invoice.count();
          invoice.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
        }
      }
    }
  });

  // Instance methods
  Invoice.prototype.isOverdue = function() {
    if (!this.dueDate || this.status === 'paid') return false;
    return new Date(this.dueDate) < new Date();
  };

  Invoice.prototype.calculateTotal = function() {
    return parseFloat(this.subtotal) + parseFloat(this.taxAmount || 0);
  };

  return Invoice;
};
```

## 🔗 Model Associations

### Relationship Definitions
The `models/index.js` file defines all model relationships:

```javascript
// models/index.js
const { Sequelize } = require('sequelize');
const sequelize = require('../database/init').sequelize;

// Import models
const Patient = require('./Patient')(sequelize);
const Appointment = require('./Appointment')(sequelize);
const Service = require('./Service')(sequelize);
const Product = require('./Product')(sequelize);
const Invoice = require('./Invoice')(sequelize);
const InvoiceItem = require('./InvoiceItem')(sequelize);
const Payment = require('./Payment')(sequelize);
const TreatmentPlan = require('./TreatmentPlan')(sequelize);

// Define associations

// Patient associations
Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Patient.hasMany(Invoice, { foreignKey: 'patientId', as: 'invoices' });
Patient.hasMany(TreatmentPlan, { foreignKey: 'patientId', as: 'treatmentPlans' });

// Appointment associations
Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Appointment.hasOne(Invoice, { foreignKey: 'appointmentId', as: 'invoice' });

// Service associations
Service.hasMany(Appointment, { foreignKey: 'serviceId', as: 'appointments' });
Service.hasMany(InvoiceItem, { foreignKey: 'serviceId', as: 'invoiceItems' });

// Invoice associations
Invoice.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Invoice.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
Invoice.hasMany(Payment, { foreignKey: 'invoiceId', as: 'payments' });

// InvoiceItem associations
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
InvoiceItem.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
InvoiceItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Payment associations
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

// Product associations
Product.hasMany(InvoiceItem, { foreignKey: 'productId', as: 'invoiceItems' });

// TreatmentPlan associations
TreatmentPlan.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

module.exports = {
  sequelize,
  Patient,
  Appointment,
  Service,
  Product,
  Invoice,
  InvoiceItem,
  Payment,
  TreatmentPlan
};
```

### Association Types

#### One-to-Many Relationships
- **Patient → Appointments**: One patient can have many appointments
- **Patient → Invoices**: One patient can have many invoices
- **Service → Appointments**: One service can be used in many appointments
- **Invoice → InvoiceItems**: One invoice can have many line items

#### Many-to-One Relationships
- **Appointment → Patient**: Many appointments belong to one patient
- **Invoice → Patient**: Many invoices belong to one patient
- **InvoiceItem → Service/Product**: Many items can reference one service/product

#### One-to-One Relationships
- **Appointment → Invoice**: One appointment can have one invoice

## 🔍 Model Usage Examples

### Creating Records
```javascript
// Create a new patient
const patient = await Patient.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@email.com',
  phone: '+1234567890',
  dateOfBirth: '1985-06-15'
});

// Create appointment with associations
const appointment = await Appointment.create({
  patientId: patient.id,
  serviceId: 1,
  appointmentDate: '2024-02-15 10:00:00',
  duration: 60,
  notes: 'Regular checkup'
});
```

### Querying with Associations
```javascript
// Get patient with all appointments
const patientWithAppointments = await Patient.findByPk(1, {
  include: [{
    model: Appointment,
    as: 'appointments',
    include: [{
      model: Service,
      as: 'service'
    }]
  }]
});

// Get upcoming appointments
const upcomingAppointments = await Appointment.findAll({
  where: {
    appointmentDate: {
      [Op.gte]: new Date()
    },
    status: 'scheduled'
  },
  include: [
    { model: Patient, as: 'patient' },
    { model: Service, as: 'service' }
  ],
  order: [['appointmentDate', 'ASC']]
});
```

### Complex Queries
```javascript
// Get patient revenue summary
const patientRevenue = await Patient.findAll({
  include: [{
    model: Invoice,
    as: 'invoices',
    where: {
      status: 'paid'
    },
    required: false
  }],
  attributes: {
    include: [
      [sequelize.fn('SUM', sequelize.col('invoices.totalAmount')), 'totalRevenue'],
      [sequelize.fn('COUNT', sequelize.col('invoices.id')), 'invoiceCount']
    ]
  },
  group: ['Patient.id']
});
```

## ✅ Model Validation

### Built-in Validations
```javascript
// Email validation
email: {
  type: DataTypes.STRING,
  validate: {
    isEmail: true,
    notEmpty: true
  }
},

// Price validation
price: {
  type: DataTypes.DECIMAL(10, 2),
  validate: {
    min: 0,
    isDecimal: true
  }
},

// Phone validation
phone: {
  type: DataTypes.STRING,
  validate: {
    is: /^[\+]?[1-9][\d]{0,15}$/
  }
}
```

### Custom Validations
```javascript
// Custom date validation
appointmentDate: {
  type: DataTypes.DATE,
  validate: {
    isAfterNow(value) {
      if (new Date(value) <= new Date()) {
        throw new Error('Appointment date must be in the future');
      }
    },
    isBusinessHours(value) {
      const hour = new Date(value).getHours();
      if (hour < 8 || hour > 18) {
        throw new Error('Appointments must be during business hours (8 AM - 6 PM)');
      }
    }
  }
}
```

## 🔄 Model Hooks

### Lifecycle Hooks
```javascript
// Before create hook
hooks: {
  beforeCreate: async (instance, options) => {
    // Auto-generate invoice number
    if (!instance.invoiceNumber) {
      const count = await Invoice.count();
      instance.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
    }
  },
  
  afterUpdate: async (instance, options) => {
    // Log status changes
    if (instance.changed('status')) {
      console.log(`Invoice ${instance.invoiceNumber} status changed to ${instance.status}`);
    }
  }
}
```

## 🧪 Model Testing

### Unit Tests
```javascript
// Test model creation
describe('Patient Model', () => {
  it('should create a patient with valid data', async () => {
    const patientData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };
    
    const patient = await Patient.create(patientData);
    expect(patient.firstName).toBe('John');
    expect(patient.getFullName()).toBe('John Doe');
  });
  
  it('should validate email format', async () => {
    const invalidData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email'
    };
    
    await expect(Patient.create(invalidData))
      .rejects
      .toThrow('Validation isEmail on email failed');
  });
});
```

## 🚀 Performance Optimization

### Indexing
- Primary keys (automatic)
- Foreign keys for associations
- Search fields (name, email)
- Date fields for range queries

### Query Optimization
- Use `attributes` to limit selected fields
- Implement pagination for large datasets
- Use `include` strategically to avoid N+1 queries
- Add database indexes for frequently queried fields

## 🔮 Future Enhancements

- **Soft Deletes**: Implement paranoid models for data retention
- **Audit Trail**: Track all model changes with timestamps
- **Multi-tenancy**: Add clinic/organization isolation
- **Caching**: Implement Redis caching for frequently accessed data
- **Real-time Updates**: WebSocket integration for live data updates

---

**Data Models** - The foundation of SmileSync's data architecture. 🦷📊