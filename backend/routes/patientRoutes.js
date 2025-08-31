const express = require('express');
const PatientController = require('../controllers/patientController');

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
router.post('/', async (req, res) => {
  try {
    const result = await PatientController.createPatient(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('Missing required fields') || 
        error.message.includes('already exists')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const result = await PatientController.updatePatient(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'Patient not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('already exists')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
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