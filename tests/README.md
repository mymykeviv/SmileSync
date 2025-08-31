# SmileSync Testing Suite

Comprehensive testing framework for the SmileSync dental clinic management system, ensuring code quality, reliability, and maintainability across all application layers.

## 🧪 Testing Overview

The SmileSync testing suite provides complete coverage for:

- **Frontend Components**: React component testing with React Testing Library
- **Backend API**: Express.js route and controller testing
- **Database Operations**: Sequelize model and query testing
- **Integration Testing**: Full-stack workflow testing
- **End-to-End Testing**: Complete user journey validation
- **Performance Testing**: Load and stress testing
- **Security Testing**: Vulnerability and penetration testing

## 🏗️ Testing Architecture

```
tests/
├── package.json           # Testing dependencies and scripts
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Global test setup
├── .babelrc              # Babel configuration for JSX
├── __mocks__/            # Mock implementations
│   ├── fileMock.js       # File mock for assets
│   └── styleMock.js      # CSS mock for styles
├── frontend/             # Frontend component tests
│   ├── components/       # Component unit tests
│   ├── pages/           # Page integration tests
│   ├── hooks/           # Custom hook tests
│   └── utils/           # Utility function tests
├── backend/             # Backend API tests
│   ├── controllers/     # Controller unit tests
│   ├── models/          # Model unit tests
│   ├── routes/          # Route integration tests
│   └── utils/           # Backend utility tests
├── integration/         # Full-stack integration tests
│   ├── api/            # API integration tests
│   ├── database/       # Database integration tests
│   └── workflows/      # Complete workflow tests
├── e2e/                # End-to-end tests
│   ├── specs/          # E2E test specifications
│   ├── fixtures/       # Test data fixtures
│   └── support/        # E2E test utilities
└── performance/        # Performance and load tests
    ├── load/           # Load testing scenarios
    └── stress/         # Stress testing scenarios
```

## 🛠️ Technology Stack

### Core Testing Framework
- **Jest**: 29.x - JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **Supertest**: HTTP assertion library for API testing
- **Playwright**: End-to-end testing framework
- **MSW**: Mock Service Worker for API mocking

### Testing Utilities
- **@testing-library/jest-dom**: Custom Jest matchers
- **@testing-library/user-event**: User interaction simulation
- **jest-environment-jsdom**: DOM testing environment
- **identity-obj-proxy**: CSS module mocking
- **babel-jest**: JSX and ES6+ transpilation

### Database Testing
- **sqlite3**: In-memory database for testing
- **sequelize-test-helpers**: Sequelize testing utilities
- **factory-bot**: Test data generation

## 🚀 Quick Start

### Prerequisites
```bash
# Ensure Node.js 20+ is installed
node --version
npm --version

# Install testing dependencies
cd tests
npm install
```

### Running Tests

#### All Tests
```bash
# Run complete test suite
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

#### Frontend Tests
```bash
# Run all frontend tests
npm run test:frontend

# Run specific component tests
npm run test:frontend -- --testPathPattern=components/PatientForm

# Run frontend tests with coverage
npm run test:frontend:coverage
```

#### Backend Tests
```bash
# Run all backend tests
npm run test:backend

# Run API route tests
npm run test:backend -- --testPathPattern=routes

# Run model tests
npm run test:backend -- --testPathPattern=models
```

#### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run specific workflow tests
npm run test:integration -- --testPathPattern=workflows/appointment
```

#### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run specific E2E test
npm run test:e2e -- --grep="Patient Management"
```

## 🧩 Frontend Testing

### Component Testing

#### Example: PatientForm Component Test
```javascript
// tests/frontend/components/PatientForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientForm } from '../../../app/src/components/PatientForm';
import { PatientProvider } from '../../../app/src/contexts/PatientContext';

// Mock API calls
jest.mock('../../../app/src/services/api', () => ({
  createPatient: jest.fn(),
  updatePatient: jest.fn()
}));

describe('PatientForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPatientForm = (props = {}) => {
    return render(
      <PatientProvider>
        <PatientForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          {...props}
        />
      </PatientProvider>
    );
  };

  it('renders all form fields', () => {
    renderPatientForm();
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderPatientForm();
    
    const submitButton = screen.getByRole('button', { name: /save patient/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    renderPatientForm();
    
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john.doe@email.com');
    await user.type(screen.getByLabelText(/phone/i), '+1234567890');
    
    const submitButton = screen.getByRole('button', { name: /save patient/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1234567890'
      });
    });
  });

  it('handles edit mode correctly', () => {
    const existingPatient = {
      id: 1,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '+0987654321'
    };
    
    renderPatientForm({ patient: existingPatient, mode: 'edit' });
    
    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane.smith@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update patient/i })).toBeInTheDocument();
  });
});
```

### Hook Testing

#### Example: usePatients Hook Test
```javascript
// tests/frontend/hooks/usePatients.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { usePatients } from '../../../app/src/hooks/usePatients';
import { PatientProvider } from '../../../app/src/contexts/PatientContext';
import * as api from '../../../app/src/services/api';

jest.mock('../../../app/src/services/api');

describe('usePatients Hook', () => {
  const wrapper = ({ children }) => (
    <PatientProvider>{children}</PatientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches patients on mount', async () => {
    const mockPatients = [
      { id: 1, firstName: 'John', lastName: 'Doe' },
      { id: 2, firstName: 'Jane', lastName: 'Smith' }
    ];
    
    api.getPatients.mockResolvedValue({ data: mockPatients });
    
    const { result } = renderHook(() => usePatients(), { wrapper });
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.patients).toEqual(mockPatients);
    });
  });

  it('handles create patient', async () => {
    const newPatient = { firstName: 'Bob', lastName: 'Johnson' };
    const createdPatient = { id: 3, ...newPatient };
    
    api.createPatient.mockResolvedValue({ data: createdPatient });
    
    const { result } = renderHook(() => usePatients(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await result.current.createPatient(newPatient);
    
    expect(api.createPatient).toHaveBeenCalledWith(newPatient);
  });
});
```

## 🔧 Backend Testing

### Controller Testing

#### Example: Patient Controller Test
```javascript
// tests/backend/controllers/patientController.test.js
const request = require('supertest');
const app = require('../../../backend/app');
const { Patient } = require('../../../backend/models');
const { setupTestDB, cleanupTestDB } = require('../../utils/testDB');

describe('Patient Controller', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await Patient.destroy({ where: {}, force: true });
  });

  describe('GET /api/patients', () => {
    it('should return all patients', async () => {
      // Create test patients
      await Patient.bulkCreate([
        { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' }
      ]);

      const response = await request(app)
        .get('/api/patients')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.patients).toHaveLength(2);
      expect(response.body.data.patients[0]).toHaveProperty('firstName', 'John');
    });

    it('should support pagination', async () => {
      // Create 15 test patients
      const patients = Array.from({ length: 15 }, (_, i) => ({
        firstName: `Patient${i}`,
        lastName: 'Test',
        email: `patient${i}@test.com`
      }));
      await Patient.bulkCreate(patients);

      const response = await request(app)
        .get('/api/patients?page=2&limit=5')
        .expect(200);

      expect(response.body.data.patients).toHaveLength(5);
      expect(response.body.data.pagination.currentPage).toBe(2);
      expect(response.body.data.pagination.totalPages).toBe(3);
    });

    it('should support search', async () => {
      await Patient.bulkCreate([
        { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' },
        { firstName: 'Bob', lastName: 'Johnson', email: 'bob@test.com' }
      ]);

      const response = await request(app)
        .get('/api/patients?search=john')
        .expect(200);

      expect(response.body.data.patients).toHaveLength(2); // John Doe and Bob Johnson
    });
  });

  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        dateOfBirth: '1985-06-15'
      };

      const response = await request(app)
        .post('/api/patients')
        .send(patientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('John');
      expect(response.body.data.email).toBe('john.doe@test.com');

      // Verify patient was created in database
      const patient = await Patient.findByPk(response.body.data.id);
      expect(patient).toBeTruthy();
      expect(patient.firstName).toBe('John');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/patients')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(err => err.field === 'firstName')).toBe(true);
    });

    it('should validate email format', async () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/patients')
        .send(patientData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.some(err => 
        err.field === 'email' && err.message.includes('valid email')
      )).toBe(true);
    });
  });

  describe('PUT /api/patients/:id', () => {
    it('should update an existing patient', async () => {
      const patient = await Patient.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com'
      });

      const updateData = {
        firstName: 'Johnny',
        lastName: 'Doe',
        email: 'johnny@test.com'
      };

      const response = await request(app)
        .put(`/api/patients/${patient.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Johnny');
      expect(response.body.data.email).toBe('johnny@test.com');
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await request(app)
        .put('/api/patients/999')
        .send({ firstName: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });
});
```

### Model Testing

#### Example: Patient Model Test
```javascript
// tests/backend/models/Patient.test.js
const { Patient } = require('../../../backend/models');
const { setupTestDB, cleanupTestDB } = require('../../utils/testDB');

describe('Patient Model', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await Patient.destroy({ where: {}, force: true });
  });

  describe('Validations', () => {
    it('should create a valid patient', async () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        dateOfBirth: '1985-06-15'
      };

      const patient = await Patient.create(patientData);
      expect(patient.id).toBeDefined();
      expect(patient.firstName).toBe('John');
      expect(patient.fullName).toBe('John Doe');
    });

    it('should require firstName', async () => {
      const patientData = {
        lastName: 'Doe',
        email: 'john.doe@test.com'
      };

      await expect(Patient.create(patientData))
        .rejects
        .toThrow(/firstName cannot be null/);
    });

    it('should require lastName', async () => {
      const patientData = {
        firstName: 'John',
        email: 'john.doe@test.com'
      };

      await expect(Patient.create(patientData))
        .rejects
        .toThrow(/lastName cannot be null/);
    });

    it('should validate email format', async () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      };

      await expect(Patient.create(patientData))
        .rejects
        .toThrow(/Validation isEmail on email failed/);
    });

    it('should enforce unique email', async () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      };

      await Patient.create(patientData);

      await expect(Patient.create(patientData))
        .rejects
        .toThrow(/email must be unique/);
    });
  });

  describe('Instance Methods', () => {
    it('should return full name', async () => {
      const patient = await Patient.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      });

      expect(patient.fullName).toBe('John Doe');
    });

    it('should calculate age correctly', async () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);

      const patient = await Patient.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        dateOfBirth: birthDate
      });

      expect(patient.age).toBe(30);
    });
  });

  describe('Associations', () => {
    it('should have appointments association', async () => {
      const patient = await Patient.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      });

      const appointments = await patient.getAppointments();
      expect(Array.isArray(appointments)).toBe(true);
    });
  });
});
```

## 🔗 Integration Testing

### API Integration Test
```javascript
// tests/integration/api/patientWorkflow.test.js
const request = require('supertest');
const app = require('../../../backend/app');
const { setupTestDB, cleanupTestDB } = require('../../utils/testDB');

describe('Patient Management Workflow', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  it('should complete full patient lifecycle', async () => {
    // 1. Create a new patient
    const patientData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      phone: '+1234567890',
      dateOfBirth: '1985-06-15'
    };

    const createResponse = await request(app)
      .post('/api/patients')
      .send(patientData)
      .expect(201);

    const patientId = createResponse.body.data.id;
    expect(patientId).toBeDefined();

    // 2. Retrieve the patient
    const getResponse = await request(app)
      .get(`/api/patients/${patientId}`)
      .expect(200);

    expect(getResponse.body.data.firstName).toBe('John');
    expect(getResponse.body.data.email).toBe('john.doe@test.com');

    // 3. Update the patient
    const updateData = {
      firstName: 'Johnny',
      phone: '+0987654321'
    };

    const updateResponse = await request(app)
      .put(`/api/patients/${patientId}`)
      .send(updateData)
      .expect(200);

    expect(updateResponse.body.data.firstName).toBe('Johnny');
    expect(updateResponse.body.data.phone).toBe('+0987654321');

    // 4. Schedule an appointment
    const appointmentData = {
      patientId: patientId,
      serviceId: 1, // Assuming service exists
      appointmentDate: '2024-03-15T10:00:00Z',
      duration: 60,
      notes: 'Regular checkup'
    };

    const appointmentResponse = await request(app)
      .post('/api/appointments')
      .send(appointmentData)
      .expect(201);

    expect(appointmentResponse.body.data.patientId).toBe(patientId);

    // 5. Create an invoice
    const invoiceData = {
      patientId: patientId,
      appointmentId: appointmentResponse.body.data.id,
      items: [
        {
          serviceId: 1,
          description: 'Dental Cleaning',
          quantity: 1,
          unitPrice: 120.00
        }
      ]
    };

    const invoiceResponse = await request(app)
      .post('/api/invoices')
      .send(invoiceData)
      .expect(201);

    expect(invoiceResponse.body.data.totalAmount).toBe(120.00);

    // 6. Verify patient has appointments and invoices
    const finalResponse = await request(app)
      .get(`/api/patients/${patientId}?include=appointments,invoices`)
      .expect(200);

    expect(finalResponse.body.data.appointments).toHaveLength(1);
    expect(finalResponse.body.data.invoices).toHaveLength(1);
  });
});
```

## 🎭 End-to-End Testing

### E2E Test Example
```javascript
// tests/e2e/specs/patientManagement.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Patient Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the application to load
    await page.waitForSelector('[data-testid="app-header"]');
  });

  test('should create a new patient', async ({ page }) => {
    // Navigate to patients page
    await page.click('[data-testid="nav-patients"]');
    await page.waitForSelector('[data-testid="patients-list"]');

    // Click add patient button
    await page.click('[data-testid="add-patient-btn"]');
    await page.waitForSelector('[data-testid="patient-form"]');

    // Fill out the form
    await page.fill('[data-testid="firstName-input"]', 'John');
    await page.fill('[data-testid="lastName-input"]', 'Doe');
    await page.fill('[data-testid="email-input"]', 'john.doe@test.com');
    await page.fill('[data-testid="phone-input"]', '+1234567890');
    await page.fill('[data-testid="dateOfBirth-input"]', '1985-06-15');

    // Submit the form
    await page.click('[data-testid="save-patient-btn"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Patient created successfully');

    // Verify patient appears in list
    await page.waitForSelector('[data-testid="patients-list"]');
    await expect(page.locator('[data-testid="patient-row"]').first())
      .toContainText('John Doe');
  });

  test('should schedule an appointment', async ({ page }) => {
    // Assuming patient exists, navigate to appointments
    await page.click('[data-testid="nav-appointments"]');
    await page.waitForSelector('[data-testid="appointments-calendar"]');

    // Click add appointment
    await page.click('[data-testid="add-appointment-btn"]');
    await page.waitForSelector('[data-testid="appointment-form"]');

    // Select patient
    await page.click('[data-testid="patient-select"]');
    await page.click('[data-testid="patient-option-1"]');

    // Select service
    await page.click('[data-testid="service-select"]');
    await page.click('[data-testid="service-option-1"]');

    // Set date and time
    await page.fill('[data-testid="appointment-date"]', '2024-03-15');
    await page.fill('[data-testid="appointment-time"]', '10:00');

    // Add notes
    await page.fill('[data-testid="appointment-notes"]', 'Regular checkup');

    // Submit
    await page.click('[data-testid="save-appointment-btn"]');

    // Verify appointment appears in calendar
    await expect(page.locator('[data-testid="appointment-event"]'))
      .toBeVisible();
  });

  test('should generate and view invoice', async ({ page }) => {
    // Navigate to invoices
    await page.click('[data-testid="nav-invoices"]');
    await page.waitForSelector('[data-testid="invoices-list"]');

    // Click create invoice
    await page.click('[data-testid="create-invoice-btn"]');
    await page.waitForSelector('[data-testid="invoice-form"]');

    // Select patient and appointment
    await page.click('[data-testid="invoice-patient-select"]');
    await page.click('[data-testid="patient-option-1"]');
    
    await page.click('[data-testid="invoice-appointment-select"]');
    await page.click('[data-testid="appointment-option-1"]');

    // Add service items
    await page.click('[data-testid="add-service-item"]');
    await page.click('[data-testid="service-item-select"]');
    await page.click('[data-testid="service-option-1"]');

    // Submit invoice
    await page.click('[data-testid="create-invoice-btn"]');

    // Verify invoice created
    await expect(page.locator('[data-testid="invoice-success"]'))
      .toContainText('Invoice created successfully');

    // View invoice PDF
    await page.click('[data-testid="view-invoice-pdf"]');
    
    // Verify PDF opens (new tab)
    const [pdfPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="view-invoice-pdf"]')
    ]);
    
    expect(pdfPage.url()).toContain('.pdf');
  });
});
```

## 📊 Test Coverage

### Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'app/src/**/*.{js,jsx}',
    'backend/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/dist/**'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    },
    './app/src/components/': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './backend/controllers/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html

# View coverage summary
npm run test:coverage:summary
```

## 🚀 Performance Testing

### Load Testing Example
```javascript
// tests/performance/load/apiLoad.test.js
const autocannon = require('autocannon');
const { setupTestDB, cleanupTestDB } = require('../../utils/testDB');

describe('API Load Testing', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  test('should handle concurrent patient requests', async () => {
    const result = await autocannon({
      url: 'http://localhost:3001/api/patients',
      connections: 10,
      duration: 30, // 30 seconds
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(result.errors).toBe(0);
    expect(result.non2xx).toBe(0);
    expect(result.requests.average).toBeGreaterThan(100); // At least 100 req/sec
    expect(result.latency.p99).toBeLessThan(1000); // 99th percentile < 1s
  }, 60000);

  test('should handle patient creation load', async () => {
    const result = await autocannon({
      url: 'http://localhost:3001/api/patients',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'Load',
        lastName: 'Test',
        email: 'load.test@example.com'
      }),
      connections: 5,
      duration: 10
    });

    expect(result.errors).toBe(0);
    expect(result.non2xx).toBe(0);
  }, 30000);
});
```

## 🔧 Test Utilities

### Database Test Utilities
```javascript
// tests/utils/testDB.js
const { Sequelize } = require('sequelize');
const config = require('../../backend/config/database');

let sequelize;

const setupTestDB = async () => {
  // Use in-memory SQLite for testing
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
    define: {
      timestamps: true
    }
  });

  // Import models
  const models = require('../../backend/models');
  
  // Sync database
  await sequelize.sync({ force: true });
  
  // Seed test data if needed
  await seedTestData();
};

const cleanupTestDB = async () => {
  if (sequelize) {
    await sequelize.close();
  }
};

const seedTestData = async () => {
  const { Service, Product } = require('../../backend/models');
  
  // Create test services
  await Service.bulkCreate([
    {
      name: 'Dental Cleaning',
      description: 'Professional dental cleaning',
      price: 120.00,
      duration: 60,
      category: 'Preventive'
    },
    {
      name: 'Dental Filling',
      description: 'Tooth filling procedure',
      price: 200.00,
      duration: 90,
      category: 'Restorative'
    }
  ]);
  
  // Create test products
  await Product.bulkCreate([
    {
      name: 'Dental Floss',
      description: 'High-quality dental floss',
      price: 3.99,
      cost: 1.50,
      stockQuantity: 100,
      category: 'Oral Care'
    }
  ]);
};

module.exports = {
  setupTestDB,
  cleanupTestDB,
  seedTestData
};
```

### Test Data Factories
```javascript
// tests/utils/factories.js
const { faker } = require('@faker-js/faker');

const createPatientData = (overrides = {}) => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
  gender: faker.helpers.arrayElement(['male', 'female', 'other']),
  address: faker.location.streetAddress(),
  ...overrides
});

const createAppointmentData = (overrides = {}) => ({
  patientId: 1,
  serviceId: 1,
  appointmentDate: faker.date.future(),
  duration: faker.helpers.arrayElement([30, 60, 90, 120]),
  status: 'scheduled',
  notes: faker.lorem.sentence(),
  ...overrides
});

const createServiceData = (overrides = {}) => ({
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: parseFloat(faker.commerce.price({ min: 50, max: 500 })),
  duration: faker.helpers.arrayElement([30, 60, 90, 120]),
  category: faker.helpers.arrayElement(['Preventive', 'Restorative', 'Cosmetic']),
  ...overrides
});

module.exports = {
  createPatientData,
  createAppointmentData,
  createServiceData
};
```

## 🔍 Debugging Tests

### Debug Configuration
```bash
# Run tests in debug mode
npm run test:debug

# Run specific test in debug mode
npm run test:debug -- --testNamePattern="should create patient"

# Run with verbose output
npm run test -- --verbose

# Run with watch mode for development
npm run test:watch
```

### VS Code Debug Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/tests/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "cwd": "${workspaceFolder}/tests",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 📈 Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd tests && npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./tests/coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
```

## 🔮 Future Enhancements

- **Visual Regression Testing**: Screenshot comparison testing
- **Accessibility Testing**: WCAG compliance validation
- **Security Testing**: Automated vulnerability scanning
- **Mobile Testing**: React Native app testing
- **API Contract Testing**: OpenAPI specification validation
- **Chaos Engineering**: Fault injection testing
- **Mutation Testing**: Code quality validation

---

**Testing Suite** - Comprehensive quality assurance for SmileSync. 🧪✅