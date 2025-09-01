const express = require('express');
const PatientController = require('../controllers/patientController');
const { validatePatient, validateId, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get all patients with optional filters
router.get('/', async (req, res) => {
  try {
    const result = await PatientController.getAllPatients(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search patients
router.get('/search', async (req, res) => {
  try {
    const result = await PatientController.searchPatients(req.query);
    res.json(result);
  } catch (error) {
    if (error.message === 'Search query is required') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get patient statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await PatientController.getPatientStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await PatientController.getPatientById(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Patient not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get patient by patient number
router.get('/number/:patientNumber', async (req, res) => {
  try {
    const result = await PatientController.getPatientByNumber(req.params.patientNumber);
    res.json(result);
  } catch (error) {
    if (error.message === 'Patient not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Create new patient
router.post('/', validatePatient, handleValidationErrors, async (req, res) => {
  try {
    const result = await PatientController.createPatient(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      res.status(422).json({ 
        error: error.message,
        code: error.code,
        details: error.details
      });
    } else if (error.code === 'PATIENT_DUPLICATE_EMAIL') {
      res.status(409).json({ 
        error: error.message,
        code: error.code,
        details: error.details
      });
    } else if (error.code === 'DATABASE_ERROR') {
      res.status(500).json({ 
        error: error.message,
        code: error.code,
        details: error.originalError ? { originalError: error.originalError } : undefined
      });
    } else {
      res.status(500).json({ 
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

// Update patient
router.put('/:id', validateId, validatePatient, handleValidationErrors, async (req, res) => {
  try {
    const result = await PatientController.updatePatient(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.code === 'PATIENT_NOT_FOUND') {
      res.status(404).json({ 
        error: error.message,
        code: error.code,
        details: error.details
      });
    } else if (error.code === 'PATIENT_DUPLICATE_EMAIL') {
      res.status(409).json({ 
        error: error.message,
        code: error.code,
        details: error.details
      });
    } else if (error.code === 'DATABASE_ERROR') {
      res.status(500).json({ 
        error: error.message,
        code: error.code,
        details: error.originalError ? { originalError: error.originalError } : undefined
      });
    } else {
      res.status(500).json({ 
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

// Delete patient (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const result = await PatientController.deletePatient(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Patient not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get patient appointments
router.get('/:id/appointments', async (req, res) => {
  try {
    const result = await PatientController.getPatientAppointments(req.params.id, req.query);
    res.json(result);
  } catch (error) {
    if (error.message === 'Patient not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get patient invoices
router.get('/:id/invoices', async (req, res) => {
  try {
    const result = await PatientController.getPatientInvoices(req.params.id, req.query);
    res.json(result);
  } catch (error) {
    if (error.message === 'Patient not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get patient treatment plans
router.get('/:id/treatment-plans', async (req, res) => {
  try {
    const result = await PatientController.getPatientTreatmentPlans(req.params.id, req.query);
    res.json(result);
  } catch (error) {
    if (error.message === 'Patient not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;