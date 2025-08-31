const { Patient } = require('../models');
const { convertPatientToBackend } = require('../utils/fieldMapping');

class PatientController {
  // Get all patients with optional filters
  static async getAllPatients(query = {}) {
    try {
      const { search, page = 1, limit = 50, sortBy = 'lastName', sortOrder = 'ASC' } = query;
      
      let patients;
      if (search) {
        patients = await Patient.search(search, parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
      } else {
        patients = await Patient.findAll(parseInt(limit), (parseInt(page) - 1) * parseInt(limit), sortBy, sortOrder);
      }
      
      const totalCount = await Patient.getCount();
      const totalPages = Math.ceil(totalCount / parseInt(limit));
      
      return {
        success: true,
        data: patients.map(patient => patient.toJSON()),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get patients: ${error.message}`);
    }
  }

  // Get patient by ID
  static async getPatientById(id) {
    try {
      const patient = await Patient.findById(id);
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      return {
        success: true,
        data: patient.toJSON()
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get patient by patient number
  static async getPatientByNumber(patientNumber) {
    try {
      const patient = await Patient.findByPatientNumber(patientNumber);
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      return {
        success: true,
        data: patient.toJSON()
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Create new patient
  static async createPatient(patientData) {
    try {
      // Validate required fields
      const { firstName, lastName, dateOfBirth, phone, email } = patientData;
      
      if (!firstName || !lastName || !dateOfBirth || !phone) {
        throw new Error('Missing required fields: firstName, lastName, dateOfBirth, phone');
      }
      
      // Check if email already exists (if provided)
      if (email) {
        const existingPatient = await Patient.search(email);
        if (existingPatient.length > 0) {
          const emailExists = existingPatient.some(p => p.email === email);
          if (emailExists) {
            throw new Error('A patient with this email already exists');
          }
        }
      }
      
      // Convert frontend camelCase fields to backend snake_case
      const backendPatientData = convertPatientToBackend(patientData);
      
      // Create new patient instance
      const patient = new Patient(backendPatientData);
      const savedPatient = await patient.save();
      
      return {
        success: true,
        message: 'Patient created successfully',
        data: savedPatient.toJSON()
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Update patient
  static async updatePatient(id, updateData) {
    try {
      const patient = await Patient.findById(id);
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      // Convert frontend camelCase fields to backend snake_case
      const backendUpdateData = convertPatientToBackend(updateData);
      
      // Check if email is being updated and already exists
      if (backendUpdateData.email && backendUpdateData.email !== patient.email) {
        const existingPatient = await Patient.search(backendUpdateData.email);
        if (existingPatient.length > 0) {
          const emailExists = existingPatient.some(p => p.email === backendUpdateData.email && p.id !== id);
          if (emailExists) {
            throw new Error('A patient with this email already exists');
          }
        }
      }
      
      const updatedPatient = await patient.update(backendUpdateData);
      
      return {
        success: true,
        message: 'Patient updated successfully',
        data: updatedPatient.toJSON()
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Soft delete patient
  static async deletePatient(id) {
    try {
      const patient = await Patient.findById(id);
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      await patient.delete();
      
      return {
        success: true,
        message: 'Patient deleted successfully'
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get patient appointments
  static async getPatientAppointments(id, query = {}) {
    try {
      const patient = await Patient.findById(id);
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      const { limit = 20, offset = 0 } = query;
      const appointments = await patient.getAppointments(parseInt(limit), parseInt(offset));
      
      return {
        success: true,
        data: appointments
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get patient invoices
  static async getPatientInvoices(id, query = {}) {
    try {
      const patient = await Patient.findById(id);
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      const { limit = 20, offset = 0 } = query;
      const invoices = await patient.getInvoices(parseInt(limit), parseInt(offset));
      
      return {
        success: true,
        data: invoices
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get patient treatment plans
  static async getPatientTreatmentPlans(id, query = {}) {
    try {
      const patient = await Patient.findById(id);
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      const { limit = 20, offset = 0 } = query;
      const treatmentPlans = await patient.getTreatmentPlans(parseInt(limit), parseInt(offset));
      
      return {
        success: true,
        data: treatmentPlans
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Search patients
  static async searchPatients(query = {}) {
    try {
      const { q, limit = 20, offset = 0 } = query;
      
      if (!q) {
        throw new Error('Search query is required');
      }
      
      const patients = await Patient.search(q, parseInt(limit), parseInt(offset));
      
      return {
        success: true,
        data: patients.map(patient => patient.toJSON()),
        query: q
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get patient statistics
  static async getPatientStats() {
    try {
      const totalPatients = await Patient.getCount();
      
      // Get recent patients (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentPatients = await Patient.search('', 1000, 0);
      const newPatientsThisMonth = recentPatients.filter(p => 
        new Date(p.createdAt) >= thirtyDaysAgo
      ).length;
      
      return {
        success: true,
        data: {
          totalPatients,
          newPatientsThisMonth,
          averageAge: null // Would need to calculate from dateOfBirth
        }
      };
    } catch (error) {
      throw new Error(`Failed to get patient statistics: ${error.message}`);
    }
  }
}

module.exports = PatientController;