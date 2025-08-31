const request = require('supertest');
const express = require('express');
const analyticsRoutes = require('../../backend/routes/analyticsRoutes');
const { sequelize } = require('../../backend/models');

// Mock the models
jest.mock('../../backend/models');

const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsRoutes);

describe('Analytics API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/analytics/dashboard', () => {
    test('should return dashboard overview', async () => {
      const mockData = {
        totalPatients: 150,
        totalAppointments: 300,
        totalRevenue: 45000,
        completionRate: 85
      };

      // Mock database queries
      const mockPatient = {
        count: jest.fn().mockResolvedValue(150)
      };
      const mockAppointment = {
        count: jest.fn().mockResolvedValue(300),
        findAll: jest.fn().mockResolvedValue([
          { status: 'completed' },
          { status: 'completed' },
          { status: 'pending' }
        ])
      };
      const mockInvoice = {
        sum: jest.fn().mockResolvedValue(45000)
      };

      require('../../backend/models').Patient = mockPatient;
      require('../../backend/models').Appointment = mockAppointment;
      require('../../backend/models').Invoice = mockInvoice;

      const response = await request(app)
        .get('/api/analytics/dashboard')
        .expect(200);

      expect(response.body).toHaveProperty('totalPatients');
      expect(response.body).toHaveProperty('totalAppointments');
      expect(response.body).toHaveProperty('totalRevenue');
    });

    test('should handle errors gracefully', async () => {
      const mockPatient = {
        count: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      require('../../backend/models').Patient = mockPatient;

      const response = await request(app)
        .get('/api/analytics/dashboard')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/analytics/appointments', () => {
    test('should return appointment analytics', async () => {
      const mockAppointment = {
        findAll: jest.fn().mockResolvedValue([
          { status: 'completed', appointment_date: '2024-01-15' },
          { status: 'pending', appointment_date: '2024-01-16' }
        ])
      };

      require('../../backend/models').Appointment = mockAppointment;

      const response = await request(app)
        .get('/api/analytics/appointments')
        .query({ startDate: '2024-01-01', endDate: '2024-01-31' })
        .expect(200);

      expect(response.body).toHaveProperty('statusBreakdown');
      expect(response.body).toHaveProperty('appointmentsByDay');
    });
  });

  describe('GET /api/analytics/revenue', () => {
    test('should return revenue analytics', async () => {
      const mockInvoice = {
        findAll: jest.fn().mockResolvedValue([
          { total_amount: 500, created_at: '2024-01-15' },
          { total_amount: 750, created_at: '2024-01-16' }
        ])
      };

      require('../../backend/models').Invoice = mockInvoice;

      const response = await request(app)
        .get('/api/analytics/revenue')
        .query({ startDate: '2024-01-01', endDate: '2024-01-31' })
        .expect(200);

      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('revenueByDay');
    });
  });

  describe('GET /api/analytics/patients', () => {
    test('should return patient analytics', async () => {
      const mockPatient = {
        findAll: jest.fn().mockResolvedValue([
          { gender: 'male', date_of_birth: '1990-01-01' },
          { gender: 'female', date_of_birth: '1985-05-15' }
        ])
      };

      require('../../backend/models').Patient = mockPatient;

      const response = await request(app)
        .get('/api/analytics/patients')
        .expect(200);

      expect(response.body).toHaveProperty('genderDistribution');
      expect(response.body).toHaveProperty('ageDistribution');
    });
  });

  describe('POST /api/analytics/export', () => {
    test('should export analytics data', async () => {
      const mockData = {
        appointments: [{ id: 1, patient_name: 'John Doe' }],
        patients: [{ id: 1, name: 'John Doe' }],
        invoices: [{ id: 1, total_amount: 500 }]
      };

      const mockAppointment = {
        findAll: jest.fn().mockResolvedValue(mockData.appointments)
      };
      const mockPatient = {
        findAll: jest.fn().mockResolvedValue(mockData.patients)
      };
      const mockInvoice = {
        findAll: jest.fn().mockResolvedValue(mockData.invoices)
      };

      require('../../backend/models').Appointment = mockAppointment;
      require('../../backend/models').Patient = mockPatient;
      require('../../backend/models').Invoice = mockInvoice;

      const response = await request(app)
        .post('/api/analytics/export')
        .send({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          format: 'json'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });
});