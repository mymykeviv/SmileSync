# SmileSync Backend Controllers

This directory contains all API controllers for the SmileSync dental clinic management system. Each controller handles specific business logic and API endpoints for different modules of the application.

## 🏗️ Controller Architecture

```
controllers/
├── patientController.js      # Patient management operations
├── appointmentController.js  # Appointment scheduling and management
├── serviceController.js      # Dental services catalog management
├── productController.js      # Product inventory management
├── invoiceController.js      # Billing and invoice generation
└── analyticsController.js    # Analytics and reporting
```

## 📋 Controller Overview

### Patient Controller (`patientController.js`)
Manages all patient-related operations including CRUD operations, search, and patient history.

**Endpoints:**
- `GET /api/patients` - Get all patients with optional filtering
- `GET /api/patients/:id` - Get specific patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update existing patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/search` - Search patients by criteria

**Features:**
- Patient profile management
- Medical history tracking
- Contact information management
- Search and filtering capabilities
- Data validation and sanitization

### Appointment Controller (`appointmentController.js`)
Handles appointment scheduling, rescheduling, cancellation, and calendar management.

**Endpoints:**
- `GET /api/appointments` - Get all appointments with filtering
- `GET /api/appointments/:id` - Get specific appointment
- `POST /api/appointments` - Book new appointment
- `PUT /api/appointments/:id` - Update/reschedule appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/calendar` - Get calendar view data
- `GET /api/appointments/conflicts` - Check for scheduling conflicts

**Features:**
- Appointment booking and management
- Conflict detection and prevention
- Calendar integration
- Status tracking (scheduled, completed, cancelled)
- Patient and service association

### Service Controller (`serviceController.js`)
Manages dental services catalog including procedures, pricing, and service categories.

**Endpoints:**
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get specific service
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/services/categories` - Get service categories

**Features:**
- Service catalog management
- Pricing and duration tracking
- Category organization
- Service descriptions and details
- Active/inactive status management

### Product Controller (`productController.js`)
Handles product inventory management including dental supplies and materials.

**Endpoints:**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/inventory` - Get inventory status

**Features:**
- Product catalog management
- Inventory tracking
- Pricing and supplier information
- Stock level monitoring
- Product categorization

### Invoice Controller (`invoiceController.js`)
Manages billing, invoice generation, payment tracking, and financial operations.

**Endpoints:**
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get specific invoice
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/:id/pdf` - Generate PDF invoice
- `POST /api/invoices/:id/payment` - Record payment

**Features:**
- Invoice generation and management
- PDF export functionality
- Payment tracking and history
- Tax calculations
- Service and product line items
- Payment status management

### Analytics Controller (`analyticsController.js`)
Provides business intelligence, reporting, and analytics for clinic performance.

**Endpoints:**
- `GET /api/analytics/dashboard` - Get dashboard overview metrics
- `GET /api/analytics/appointments` - Get appointment analytics
- `GET /api/analytics/revenue` - Get revenue analytics
- `GET /api/analytics/patients` - Get patient analytics
- `GET /api/analytics/export` - Export analytics data

**Features:**
- Dashboard metrics and KPIs
- Revenue and financial analytics
- Appointment statistics and trends
- Patient demographics and analytics
- Data export capabilities
- Date range filtering

## 🔧 Controller Patterns

### Standard Controller Structure
Each controller follows a consistent pattern:

```javascript
const { Model } = require('../models');

const controller = {
  // Get all records
  getAll: async (req, res) => {
    try {
      const records = await Model.findAll({
        // Query options
      });
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single record
  getById: async (req, res) => {
    try {
      const record = await Model.findByPk(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new record
  create: async (req, res) => {
    try {
      const record = await Model.create(req.body);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update record
  update: async (req, res) => {
    try {
      const [updated] = await Model.update(req.body, {
        where: { id: req.params.id }
      });
      if (!updated) {
        return res.status(404).json({ error: 'Record not found' });
      }
      const record = await Model.findByPk(req.params.id);
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete record
  delete: async (req, res) => {
    try {
      const deleted = await Model.destroy({
        where: { id: req.params.id }
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Record not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = controller;
```

### Error Handling
All controllers implement consistent error handling:
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors
- **201 Created**: Successful resource creation
- **204 No Content**: Successful deletion

### Data Validation
Controllers include input validation for:
- Required fields
- Data type validation
- Format validation (email, phone, etc.)
- Business rule validation
- Sanitization of user inputs

## 🔌 Database Integration

### Sequelize ORM
All controllers use Sequelize ORM for database operations:
- Model associations and relationships
- Query optimization with includes
- Transaction support for complex operations
- Data validation at the model level

### Query Optimization
- Efficient database queries with proper indexing
- Pagination for large datasets
- Selective field loading
- Eager loading for related data

## 🧪 Testing

Each controller should be tested with:
- Unit tests for individual methods
- Integration tests for database operations
- API endpoint testing
- Error scenario testing
- Performance testing for large datasets

### Example Test Structure
```javascript
describe('PatientController', () => {
  describe('getAll', () => {
    it('should return all patients', async () => {
      // Test implementation
    });
    
    it('should handle empty results', async () => {
      // Test implementation
    });
  });
  
  describe('create', () => {
    it('should create a new patient', async () => {
      // Test implementation
    });
    
    it('should validate required fields', async () => {
      // Test implementation
    });
  });
});
```

## 🔒 Security Considerations

### Input Sanitization
- All user inputs are validated and sanitized
- SQL injection prevention through parameterized queries
- XSS prevention through proper data escaping

### Authentication & Authorization
- JWT token validation (when implemented)
- Role-based access control
- Resource ownership validation

### Data Protection
- Sensitive data encryption
- HIPAA compliance for patient data
- Audit logging for data access

## 📊 Performance Optimization

### Database Optimization
- Efficient query patterns
- Proper indexing strategies
- Connection pooling
- Query result caching

### Response Optimization
- Pagination for large datasets
- Selective field loading
- Compression for large responses
- Response caching where appropriate

## 🚀 Future Enhancements

- **Authentication**: JWT-based authentication system
- **Authorization**: Role-based access control
- **Caching**: Redis integration for performance
- **Logging**: Comprehensive audit logging
- **Validation**: Enhanced input validation middleware
- **Rate Limiting**: API rate limiting implementation

---

**Backend Controllers** - Robust API layer for SmileSync dental clinic management. 🦷🔧