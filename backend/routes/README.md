# SmileSync API Routes

This directory contains all API route definitions for the SmileSync dental clinic management system, providing RESTful endpoints for frontend and external integrations.

## 🏗️ Route Architecture

```
routes/
├── index.js           # Main router configuration
├── patients.js        # Patient management endpoints
├── appointments.js    # Appointment scheduling endpoints
├── services.js        # Service catalog endpoints
├── products.js        # Product inventory endpoints
├── invoices.js        # Invoice and billing endpoints
├── analytics.js       # Analytics and reporting endpoints
└── auth.js            # Authentication endpoints (future)
```

## 🌐 API Technology Stack

### Express.js Framework
- **Version**: 4.x
- **Middleware**: CORS, body-parser, helmet, morgan
- **Validation**: express-validator
- **Error Handling**: Centralized error middleware
- **Rate Limiting**: express-rate-limit

### API Features
- **RESTful Design**: Standard HTTP methods and status codes
- **JSON API**: Consistent request/response format
- **Error Handling**: Structured error responses
- **Validation**: Input validation and sanitization
- **CORS**: Cross-origin resource sharing support
- **Logging**: Request/response logging

## 📋 API Endpoints Overview

### Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

### Authentication
```
Authorization: Bearer <token>  # Future implementation
Content-Type: application/json
```

## 👥 Patient Routes

### GET /api/patients
Retrieve all patients with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search by name, email, or phone
- `sortBy` (string): Sort field (firstName, lastName, createdAt)
- `sortOrder` (string): Sort direction (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@email.com",
        "phone": "+1234567890",
        "dateOfBirth": "1985-06-15",
        "gender": "male",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### GET /api/patients/:id
Retrieve a specific patient by ID with related data.

**Path Parameters:**
- `id` (number): Patient ID

**Query Parameters:**
- `include` (string): Related data to include (appointments, invoices, treatmentPlans)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "phone": "+1234567890",
    "dateOfBirth": "1985-06-15",
    "gender": "male",
    "address": "123 Main St, City, State 12345",
    "medicalHistory": "No known allergies",
    "emergencyContact": "Jane Doe - +1234567891",
    "insuranceInfo": "Blue Cross Blue Shield",
    "appointments": [],
    "invoices": [],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### POST /api/patients
Create a new patient record.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "phone": "+1234567890",
  "dateOfBirth": "1985-06-15",
  "gender": "male",
  "address": "123 Main St, City, State 12345",
  "medicalHistory": "No known allergies",
  "emergencyContact": "Jane Doe - +1234567891",
  "insuranceInfo": "Blue Cross Blue Shield"
}
```

### PUT /api/patients/:id
Update an existing patient record.

### DELETE /api/patients/:id
Soft delete a patient record.

## 📅 Appointment Routes

### GET /api/appointments
Retrieve appointments with filtering options.

**Query Parameters:**
- `date` (string): Filter by specific date (YYYY-MM-DD)
- `startDate` (string): Filter from date (YYYY-MM-DD)
- `endDate` (string): Filter to date (YYYY-MM-DD)
- `patientId` (number): Filter by patient ID
- `status` (string): Filter by status (scheduled, completed, cancelled, no-show)
- `page` (number): Page number for pagination
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": 1,
        "patientId": 1,
        "serviceId": 1,
        "appointmentDate": "2024-02-15T10:00:00Z",
        "duration": 60,
        "status": "scheduled",
        "notes": "Regular checkup",
        "patient": {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+1234567890"
        },
        "service": {
          "id": 1,
          "name": "Dental Cleaning",
          "price": 120.00,
          "duration": 60
        },
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

### POST /api/appointments
Schedule a new appointment.

**Request Body:**
```json
{
  "patientId": 1,
  "serviceId": 1,
  "appointmentDate": "2024-02-15T10:00:00Z",
  "duration": 60,
  "notes": "Regular checkup"
}
```

### PUT /api/appointments/:id
Update an existing appointment.

### DELETE /api/appointments/:id
Cancel an appointment.

### POST /api/appointments/:id/complete
Mark an appointment as completed.

## 🦷 Service Routes

### GET /api/services
Retrieve all dental services.

**Query Parameters:**
- `category` (string): Filter by service category
- `active` (boolean): Filter by active status
- `search` (string): Search by service name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dental Cleaning",
      "description": "Professional dental cleaning and examination",
      "price": 120.00,
      "duration": 60,
      "category": "Preventive",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/services
Create a new service.

### PUT /api/services/:id
Update an existing service.

### DELETE /api/services/:id
Deactivate a service.

## 📦 Product Routes

### GET /api/products
Retrieve product inventory.

**Query Parameters:**
- `category` (string): Filter by product category
- `lowStock` (boolean): Filter products with low stock
- `active` (boolean): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dental Floss",
      "description": "High-quality dental floss for daily use",
      "price": 3.99,
      "cost": 1.50,
      "stockQuantity": 100,
      "minStockLevel": 20,
      "supplier": "Dental Supply Co.",
      "category": "Oral Care",
      "isActive": true,
      "isLowStock": false,
      "margin": "166.00",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/products
Add a new product to inventory.

### PUT /api/products/:id
Update product information.

### PUT /api/products/:id/stock
Update product stock quantity.

## 💰 Invoice Routes

### GET /api/invoices
Retrieve invoices with filtering options.

**Query Parameters:**
- `patientId` (number): Filter by patient ID
- `status` (string): Filter by invoice status
- `startDate` (string): Filter from date
- `endDate` (string): Filter to date
- `overdue` (boolean): Filter overdue invoices

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": 1,
        "patientId": 1,
        "appointmentId": 1,
        "invoiceNumber": "INV-000001",
        "issueDate": "2024-02-15",
        "dueDate": "2024-03-15",
        "subtotal": 120.00,
        "taxAmount": 9.60,
        "totalAmount": 129.60,
        "status": "sent",
        "notes": "Payment due within 30 days",
        "patient": {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@email.com"
        },
        "items": [
          {
            "id": 1,
            "serviceId": 1,
            "description": "Dental Cleaning",
            "quantity": 1,
            "unitPrice": 120.00,
            "totalPrice": 120.00
          }
        ],
        "payments": [],
        "isOverdue": false,
        "createdAt": "2024-02-15T10:00:00Z",
        "updatedAt": "2024-02-15T10:00:00Z"
      }
    ]
  }
}
```

### POST /api/invoices
Create a new invoice.

### PUT /api/invoices/:id
Update an existing invoice.

### POST /api/invoices/:id/send
Send an invoice to the patient.

### POST /api/invoices/:id/payments
Record a payment for an invoice.

### GET /api/invoices/:id/pdf
Generate and download invoice PDF.

## 📊 Analytics Routes

### GET /api/analytics/dashboard
Retrieve dashboard overview data.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalPatients": 150,
      "totalAppointments": 45,
      "totalRevenue": 12500.00,
      "pendingInvoices": 8
    },
    "recentAppointments": [],
    "revenueChart": {
      "labels": ["Jan", "Feb", "Mar"],
      "data": [8500, 9200, 12500]
    },
    "appointmentStats": {
      "scheduled": 25,
      "completed": 15,
      "cancelled": 3,
      "noShow": 2
    }
  }
}
```

### GET /api/analytics/revenue
Retrieve revenue analytics.

**Query Parameters:**
- `period` (string): Time period (week, month, quarter, year)
- `startDate` (string): Custom start date
- `endDate` (string): Custom end date

### GET /api/analytics/appointments
Retrieve appointment analytics.

### GET /api/analytics/patients
Retrieve patient analytics.

### GET /api/analytics/services
Retrieve service performance analytics.

## 🔧 Route Configuration

### Main Router Setup
```javascript
// routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const patientRoutes = require('./patients');
const appointmentRoutes = require('./appointments');
const serviceRoutes = require('./services');
const productRoutes = require('./products');
const invoiceRoutes = require('./invoices');
const analyticsRoutes = require('./analytics');

// Mount routes
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/services', serviceRoutes);
router.use('/products', productRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/analytics', analyticsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SmileSync API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
```

### Middleware Configuration
```javascript
// Middleware stack
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json({ limit: '10mb' })); // JSON parsing
app.use(express.urlencoded({ extended: true })); // URL encoding
app.use(morgan('combined')); // Request logging
app.use(rateLimit({ // Rate limiting
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## ✅ Input Validation

### Validation Middleware
```javascript
const { body, param, query, validationResult } = require('express-validator');

// Patient validation rules
const validatePatient = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Must be a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Must be a valid date')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
```

## 🚨 Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Global Error Handler
```javascript
// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  
  // Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
  
  // Sequelize unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      error: {
        code: 'DUPLICATE_ENTRY',
        field: error.errors[0].path
      }
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: {
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    },
    timestamp: new Date().toISOString()
  });
});
```

## 🧪 Route Testing

### API Testing
```javascript
// Test patient creation
describe('POST /api/patients', () => {
  it('should create a new patient', async () => {
    const patientData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    };
    
    const response = await request(app)
      .post('/api/patients')
      .send(patientData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.firstName).toBe('John');
  });
  
  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/patients')
      .send({})
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });
});
```

## 📚 API Documentation

### Swagger/OpenAPI
API documentation is available at `/api/docs` when running in development mode.

### Postman Collection
A Postman collection is available in the `docs/` directory for easy API testing.

## 🚀 Performance Optimization

### Caching Strategy
- Response caching for static data (services, products)
- Database query result caching
- ETags for conditional requests

### Pagination
- Consistent pagination across all list endpoints
- Configurable page sizes with reasonable limits
- Total count and page information in responses

### Rate Limiting
- IP-based rate limiting
- Different limits for different endpoint types
- Graceful degradation under high load

## 🔮 Future Enhancements

- **Authentication**: JWT-based authentication system
- **Authorization**: Role-based access control
- **WebSockets**: Real-time updates for appointments
- **File Upload**: Patient document and image upload
- **Webhooks**: External system integration
- **API Versioning**: Backward compatibility support

---

**API Routes** - RESTful endpoints powering SmileSync's functionality. 🦷🌐