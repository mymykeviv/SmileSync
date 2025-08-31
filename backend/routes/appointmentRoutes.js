const express = require('express');
const AppointmentController = require('../controllers/appointmentController');
const { validateAppointment, validateId, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get all appointments with optional filters
router.get('/', AppointmentController.getAppointments);

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await AppointmentController.getAppointmentById(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Appointment not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get appointment by appointment number
router.get('/number/:appointmentNumber', async (req, res) => {
  try {
    const result = await AppointmentController.getAppointmentByNumber(req.params.appointmentNumber);
    res.json(result);
  } catch (error) {
    if (error.message === 'Appointment not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Create new appointment
router.post('/', validateAppointment, AppointmentController.createAppointment);

// Update appointment
router.put('/:id', validateId, validateAppointment, handleValidationErrors, async (req, res) => {
  try {
    const result = await AppointmentController.updateAppointment(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'Appointment not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('conflict')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Cancel appointment
router.patch('/:id/cancel', async (req, res) => {
  try {
    const result = await AppointmentController.cancelAppointment(req.params.id, req.body.reason);
    res.json(result);
  } catch (error) {
    if (error.message === 'Appointment not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Reschedule appointment
router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { newDate, newTime, reason } = req.body;
    const result = await AppointmentController.rescheduleAppointment(req.params.id, newDate, newTime, reason);
    res.json(result);
  } catch (error) {
    if (error.message === 'Appointment not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('conflict')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Complete appointment
router.patch('/:id/complete', async (req, res) => {
  try {
    const result = await AppointmentController.completeAppointment(req.params.id, req.body.notes);
    res.json(result);
  } catch (error) {
    if (error.message === 'Appointment not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Mark appointment as no-show
router.patch('/:id/no-show', async (req, res) => {
  try {
    const result = await AppointmentController.markNoShow(req.params.id, req.body.notes);
    res.json(result);
  } catch (error) {
    if (error.message === 'Appointment not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get upcoming appointments
router.get('/upcoming/list', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const result = await AppointmentController.getUpcomingAppointments(parseInt(days));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's appointments
router.get('/today/list', async (req, res) => {
  try {
    const result = await AppointmentController.getTodaysAppointments();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointment statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const result = await AppointmentController.getAppointmentStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check availability
router.post('/availability/check', async (req, res) => {
  try {
    const { date, time, duration, dentistId } = req.body;
    const result = await AppointmentController.checkAvailability(date, time, duration, dentistId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;