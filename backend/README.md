# SmileSync Backend API

The Node.js/Express backend API for SmileSync dental clinic management system. Built with modern authentication, role-based access control, and comprehensive RESTful endpoints.

## 🆕 Recent Updates (January 2025)

- **🔐 JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **👥 Role-Based Access Control**: Multi-level permissions for different user roles
- **🏥 Clinic Configuration**: Comprehensive clinic settings and configuration management
- **👨‍⚕️ Doctor Management**: Complete doctor and staff management system
- **💰 INR Currency**: Full conversion to Indian Rupee (₹) across all financial endpoints
- **📄 PDF Generation**: Enhanced PDF creation with authentication and preview support
- **🔒 Enhanced Security**: Improved authentication guards and session management
- **📊 Analytics API**: Advanced analytics endpoints with role-based data access
- **🛡️ Error Handling**: Comprehensive error handling and validation
- **📱 Mobile API**: Optimized endpoints for mobile and tablet interfaces

## 🏗️ Architecture

```
backend/
├── server.js              # Main server entry point
├── config/                # Configuration files
│   ├── database.js        # SQLite database configuration
│   └── auth.js           # Authentication configuration
├── controllers/           # Request handlers
│   ├── authController.js  # Authentication and authorization
│   ├── userController.js  # User management
│   ├── patientController.js
│   ├── appointmentController.js
│   ├── serviceController.js
│   ├── productController.js
│   ├── invoiceController.js
│   ├── analyticsController.js
│   └── clinicController.js
├── models/                # Database models
│   ├── User.js           # User model with roles
│   ├── Patient.js
│   ├── Appointment.js
│   ├── Service.js
│   ├── Product.js
│   ├── Invoice.js
│   └── Clinic.js
├── routes/                # API route definitions
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management routes
│   ├── patients.js
│   ├── appointments.js
│   ├── services.js
│   ├── products.js
│   ├── invoices.js
│   ├── analytics.js
│   └── clinic.js
├── middleware/            # Custom middleware
│   ├── auth.js           # JWT authentication middleware
│   ├── rbac.js           # Role-based access control
│   ├── validation.js     # Request validation
│   └── errorHandler.js   # Global error handling
├── utils/                 # Utility functions
│   ├── pdfGenerator.js   # PDF creation utilities
│   ├── dateUtils.js      # Date manipulation
│   ├── validation.js     # Validation helpers
│   └── constants.js      # Application constants
└── package.json          # Dependencies and scripts
```

## 🚀 Features

### Authentication & Authorization
- **JWT Token Authentication**: Secure token-based authentication system
- **Role-Based Access Control**: Administrator, Dentist, Assistant, Receptionist, Staff roles
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Token refresh and automatic logout
- **Protected Endpoints**: Route-level security based on user roles

### Core API Endpoints
- **User Management**: Registration, login, profile management, role assignment
- **Patient Management**: CRUD operations with search, filtering, and medical history
- **Appointment Scheduling**: Calendar management with conflict detection and notifications
- **Doctor/Staff Management**: Staff directory with role assignments and schedules
- **Service Catalog**: Dental services and products with INR pricing
- **Invoice Generation**: Billing system with PDF generation and preview
- **Analytics Dashboard**: Comprehensive reporting with role-based data access
- **Clinic Configuration**: Settings, preferences, and clinic information management

### Data Management
- **SQLite Database**: Lightweight, embedded database with full ACID compliance
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Logging**: Request logging and error tracking
- **Backup Support**: Database backup and restore functionality

## 🛠️ Technology Stack

- **Node.js 16+**: JavaScript runtime environment
- **Express.js**: Web application framework
- **SQLite3**: Embedded SQL database
- **JWT (jsonwebtoken)**: Authentication token management
- **bcrypt**: Password hashing and security
- **PDFKit**: PDF generation library
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware
- **Morgan**: HTTP request logger
- **Joi**: Data validation library

## 📋 Prerequisites

- Node.js 16+ and npm
- SQLite3 (included with Node.js)
- Frontend application running on port 3000

## 🚀 Development Setup

### Install Dependencies
```bash
cd backend
npm install
```

### Environment Configuration
Create a `.env` file in the backend directory:
```env
PORT=5001
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=12
DATABASE_PATH=./database/smilesync.db
NODE_ENV=development
```

### Database Setup
```bash
# Initialize database with schema
npm run db:init

# Seed database with sample data (optional)
npm run db:seed
```

### Development Server
```bash
# Start development server (port 5001)
npm start

# Start with specific port
PORT=5002 npm start

# Start with nodemon for auto-restart
npm run dev
```

### Production Setup
```bash
# Set production environment
export NODE_ENV=production

# Start production server
npm run start:prod
```

## 🔌 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/refresh        # Token refresh
POST /api/auth/logout         # User logout
GET  /api/auth/profile        # Get user profile
```

### User Management
```
GET    /api/users             # Get all users (Admin only)
GET    /api/users/:id         # Get user by ID
PUT    /api/users/:id         # Update user
DELETE /api/users/:id         # Delete user (Admin only)
PUT    /api/users/:id/role    # Update user role (Admin only)
```

### Patient Management
```
GET    /api/patients          # Get all patients
GET    /api/patients/:id      # Get patient by ID
POST   /api/patients          # Create new patient
PUT    /api/patients/:id      # Update patient
DELETE /api/patients/:id      # Delete patient
GET    /api/patients/search   # Search patients
```

### Appointment Management
```
GET    /api/appointments      # Get appointments (with filters)
GET    /api/appointments/:id  # Get appointment by ID
POST   /api/appointments      # Create new appointment
PUT    /api/appointments/:id  # Update appointment
DELETE /api/appointments/:id  # Delete appointment
GET    /api/appointments/calendar # Get calendar view
```

### Service & Product Management
```
GET    /api/services          # Get all services
POST   /api/services          # Create new service
PUT    /api/services/:id      # Update service
DELETE /api/services/:id      # Delete service

GET    /api/products          # Get all products
POST   /api/products          # Create new product
PUT    /api/products/:id      # Update product
DELETE /api/products/:id      # Delete product
```

### Invoice Management
```
GET    /api/invoices          # Get all invoices
GET    /api/invoices/:id      # Get invoice by ID
POST   /api/invoices          # Create new invoice
PUT    /api/invoices/:id      # Update invoice
GET    /api/invoices/:id/pdf  # Generate PDF
GET    /api/invoices/:id/preview # PDF preview
```

### Analytics
```
GET    /api/analytics/dashboard    # Dashboard metrics
GET    /api/analytics/revenue      # Revenue analytics
GET    /api/analytics/appointments # Appointment analytics
GET    /api/analytics/patients     # Patient analytics
```

### Clinic Configuration
```
GET    /api/clinic/settings   # Get clinic settings
PUT    /api/clinic/settings   # Update clinic settings
GET    /api/clinic/info       # Get clinic information
PUT    /api/clinic/info       # Update clinic information
```

## 🔒 Security Features

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable salt rounds
- **Token Expiration**: Automatic token expiration and refresh
- **Secure Headers**: Helmet.js for security headers

### Authorization Levels
- **Administrator**: Full system access and user management
- **Dentist**: Patient management, appointments, and clinical data
- **Dental Assistant**: Limited patient and appointment access
- **Receptionist**: Appointment scheduling and basic patient info
- **Staff**: Read-only access to assigned areas

### Data Protection
- **Input Validation**: Joi schema validation for all endpoints
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CORS Configuration**: Controlled cross-origin access
- **Rate Limiting**: API rate limiting for abuse prevention

## 🧪 Testing

### API Testing
```bash
# Run API tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

### Manual Testing
```bash
# Test authentication endpoints
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"password"}'

# Test protected endpoint
curl -X GET http://localhost:5001/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Development Scripts

```bash
# Development
npm start              # Start production server
npm run dev            # Start with nodemon
npm run debug          # Start with debugging

# Database
npm run db:init        # Initialize database
npm run db:seed        # Seed sample data
npm run db:backup      # Backup database
npm run db:restore     # Restore database

# Testing
npm test               # Run test suite
npm run test:watch     # Watch mode testing
npm run test:coverage  # Coverage report

# Utilities
npm run lint           # ESLint code checking
npm run lint:fix       # Auto-fix linting issues
npm run clean          # Clean temporary files
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Staff',
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Patients Table
```sql
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  medical_history TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER,
  service_id INTEGER,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration INTEGER DEFAULT 30,
  status TEXT DEFAULT 'Scheduled',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);
```

## 🚀 Performance Optimizations

- **Database Indexing**: Optimized indexes for frequent queries
- **Connection Pooling**: Efficient database connection management
- **Caching**: In-memory caching for frequently accessed data
- **Compression**: Gzip compression for API responses
- **Pagination**: Efficient data pagination for large datasets

## 🤝 Contributing

### Code Style
- Follow Node.js best practices
- Use async/await for asynchronous operations
- Implement proper error handling
- Write descriptive function and variable names
- Add JSDoc comments for complex functions

### API Guidelines
- Follow RESTful conventions
- Use appropriate HTTP status codes
- Implement consistent error response format
- Add request validation for all endpoints
- Include proper authentication checks

---

**Backend API** - Secure Node.js/Express backend for SmileSync dental clinic management. 🦷🔧