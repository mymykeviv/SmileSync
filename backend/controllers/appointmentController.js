const { Appointment, Patient, User } = require('../models');
const { validationResult } = require('express-validator');
const moment = require('moment');
const { convertAppointmentToBackend } = require('../utils/fieldMapping');

class AppointmentController {
    /**
     * Get all appointments with optional filters
     */
    static async getAppointments(req, res) {
        try {
            const {
                page = 1,
                limit = 50,
                patient_id,
                dentist_id,
                status,
                start_date,
                end_date,
                date,
                search
            } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            let appointments;
            let totalCount;

            if (search) {
                appointments = await Appointment.search(search, parseInt(limit), offset);
            } else if (date) {
                // Handle single date filtering with pagination
                appointments = await Appointment.findByDate(date, dentist_id);
                // Apply manual pagination for date filtering since the model method doesn't support it
                const totalAppointments = appointments.length;
                appointments = appointments.slice(offset, offset + parseInt(limit));
                // Override totalCount for pagination calculation
                totalCount = totalAppointments;
            } else if (start_date && end_date) {
                appointments = await Appointment.findByDateRange(start_date, end_date, parseInt(limit), offset);
            } else if (patient_id) {
                appointments = await Appointment.findByPatient(patient_id, parseInt(limit), offset);
            } else if (dentist_id) {
                appointments = await Appointment.findByDentist(dentist_id, parseInt(limit), offset);
            } else if (status) {
                appointments = await Appointment.findByStatus(status, parseInt(limit), offset);
            } else {
                appointments = await Appointment.findAll(parseInt(limit), offset);
            }

            // Get total count for pagination if not already set (for date filtering)
            if (totalCount === undefined) {
                totalCount = await Appointment.getCount({
                    patient_id,
                    dentist_id,
                    status,
                    start_date,
                    end_date
                });
            }

            res.json({
                success: true,
                data: appointments.map(appointment => appointment.toJSON()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    pages: Math.ceil(totalCount / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Error getting appointments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve appointments due to database error',
                error: {
                    code: 'DATABASE_ERROR',
                    details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
                },
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get appointment by ID
     */
    static async getAppointmentById(req, res) {
        try {
            const { id } = req.params;
            const appointment = await Appointment.findById(id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found',
                    error: {
                        code: 'APPOINTMENT_NOT_FOUND',
                        details: {
                            appointmentId: id,
                            message: 'The requested appointment does not exist'
                        }
                    },
                    timestamp: new Date().toISOString()
                });
            }

            res.json({
                success: true,
                data: appointment.toJSON()
            });
        } catch (error) {
            console.error('Error getting appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve appointment due to database error',
                error: {
                    code: 'DATABASE_ERROR',
                    details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
                },
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get appointment by appointment number
     */
    static async getAppointmentByNumber(req, res) {
        try {
            const { appointmentNumber } = req.params;
            const appointment = await Appointment.findByAppointmentNumber(appointmentNumber);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            res.json({
                success: true,
                data: appointment.toJSON()
            });
        } catch (error) {
            console.error('Error getting appointment by number:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve appointment',
                error: error.message
            });
        }
    }

    /**
     * Create new appointment
     */
    static async createAppointment(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    success: false,
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    error: 'The data provided is invalid. Please correct the errors and try again.',
                    errors: errors.array().map(err => ({
                        field: err.path || err.param,
                        message: err.msg,
                        value: err.value
                    }))
                });
            }

            // Extract fields from request body and handle frontend format
            const {
                patient_id,
                service_id,
                dentist_id,
                dentist, // Frontend sends dentist as string name
                appointment_date,
                appointment_time,
                duration,
                appointment_type,
                chief_complaint,
                treatment_notes,
                priority,
                status,
                notes
            } = req.body;

            // Use dentist_id if provided, otherwise default to 1 for now
            // TODO: Implement proper dentist lookup by name
            const finalDentistId = dentist_id || 1;

            // Verify patient exists first
            const patient = await Patient.findById(patient_id);
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    code: 'APPOINTMENT_PATIENT_NOT_FOUND',
                    message: 'Patient not found',
                    error: 'Patient not found. Please verify the patient information.'
                });
            }

            // Validate appointment date is not in the past
            const appointmentDateTime = moment(`${appointment_date} ${appointment_time}`);
            if (appointmentDateTime.isBefore(moment())) {
                return res.status(400).json({
                    success: false,
                    code: 'APPOINTMENT_PAST_DATE',
                    message: 'Cannot schedule appointments in the past',
                    error: 'Cannot schedule appointments in the past. Please select a future date.'
                });
            }

            // Check for conflicts
            const conflicts = await Appointment.checkConflicts(
                finalDentistId,
                appointment_date,
                appointment_time,
                duration
            );
            const hasConflict = conflicts.length > 0;

            if (hasConflict) {
                const conflictingAppointment = conflicts[0];
                return res.status(409).json({
                    success: false,
                    code: 'APPOINTMENT_CONFLICT',
                    message: 'Appointment time conflicts with existing appointment',
                    error: 'This appointment time conflicts with an existing appointment. Please choose a different time.',
                    details: {
                        conflictingAppointment: {
                            id: conflictingAppointment.id,
                            appointmentDate: conflictingAppointment.appointment_date,
                            appointmentTime: conflictingAppointment.appointment_time,
                            duration: conflictingAppointment.duration_minutes
                        }
                    }
                });
            }

            // Skip dentist verification for now - using default dentist_id = 1

            const appointment = new Appointment({
                patient_id,
                service_id,
                dentist_id: finalDentistId,
                appointment_date,
                appointment_time,
                duration_minutes: duration || 30,
                appointment_type: appointment_type || 'consultation',
                chief_complaint,
                treatment_notes,
                priority: priority || 'medium',
                status: status || 'scheduled',
                notes,
                created_by: req.user?.id
            });

            await appointment.save();

            res.status(201).json({
                success: true,
                message: 'Appointment created successfully',
                data: appointment.toJSON()
            });
        } catch (error) {
            console.error('Error creating appointment:', error);
            res.status(500).json({
                success: false,
                code: 'DATABASE_ERROR',
                message: 'Failed to create appointment',
                error: 'A database error occurred. Please try again later.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Update appointment
     */
    static async updateAppointment(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const appointment = await Appointment.findById(id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Convert frontend camelCase fields to backend snake_case
            const backendUpdateData = convertAppointmentToBackend(req.body);
            
            const {
                patient_id,
                dentist_id,
                appointment_date,
                appointment_time,
                duration_minutes,
                appointment_type,
                chief_complaint,
                treatment_notes,
                priority,
                status
            } = backendUpdateData;

            // Check for conflicts if date/time is being changed
            if ((appointment_date && appointment_date !== appointment.appointment_date) ||
                (appointment_time && appointment_time !== appointment.appointment_time) ||
                (duration_minutes && duration_minutes !== appointment.duration_minutes) ||
                (dentist_id && dentist_id !== appointment.dentist_id)) {
                
                const conflicts = await Appointment.checkConflicts(
                    dentist_id || appointment.dentist_id,
                    appointment_date || appointment.appointment_date,
                    appointment_time || appointment.appointment_time,
                    duration_minutes || appointment.duration_minutes,
                    id // Exclude current appointment from conflict check
                );
                const hasConflict = conflicts.length > 0;

                if (hasConflict) {
                    return res.status(409).json({
                        success: false,
                        message: 'Appointment time conflicts with existing appointment'
                    });
                }
            }

            // Update appointment properties
            if (patient_id) appointment.patient_id = patient_id;
            if (dentist_id) appointment.dentist_id = dentist_id;
            if (appointment_date) appointment.appointment_date = appointment_date;
            if (appointment_time) appointment.appointment_time = appointment_time;
            if (duration_minutes) appointment.duration_minutes = duration_minutes;
            if (appointment_type) appointment.appointment_type = appointment_type;
            if (chief_complaint) appointment.chief_complaint = chief_complaint;
            if (treatment_notes !== undefined) appointment.treatment_notes = treatment_notes;
            if (priority) appointment.priority = priority;
            if (status) appointment.status = status;

            await appointment.update();

            res.json({
                success: true,
                message: 'Appointment updated successfully',
                data: appointment.toJSON()
            });
        } catch (error) {
            console.error('Error updating appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update appointment',
                error: error.message
            });
        }
    }

    /**
     * Update appointment status only
     */
    static async updateAppointmentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const appointment = await Appointment.findById(id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found',
                    error: {
                        code: 'APPOINTMENT_NOT_FOUND',
                        details: {
                            appointmentId: id,
                            message: 'The requested appointment does not exist'
                        }
                    },
                    timestamp: new Date().toISOString()
                });
            }

            // Update only the status
            appointment.status = status;
            await appointment.update();

            res.json({
                success: true,
                message: 'Appointment status updated successfully',
                data: appointment.toJSON()
            });
        } catch (error) {
            console.error('Error updating appointment status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update appointment status',
                error: {
                    code: 'DATABASE_ERROR',
                    details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
                },
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Cancel appointment
     */
    static async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const appointment = await Appointment.findById(id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            if (appointment.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment is already cancelled'
                });
            }

            await appointment.cancel(reason);

            res.json({
                success: true,
                message: 'Appointment cancelled successfully',
                data: appointment.toJSON()
            });
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel appointment',
                error: error.message
            });
        }
    }

    /**
     * Reschedule appointment
     */
    static async rescheduleAppointment(req, res) {
        try {
            const { id } = req.params;
            const { new_date, new_time, reason } = req.body;

            if (!new_date || !new_time) {
                return res.status(400).json({
                    success: false,
                    message: 'New date and time are required'
                });
            }

            const appointment = await Appointment.findById(id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            if (appointment.status === 'cancelled' || appointment.status === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot reschedule cancelled or completed appointment'
                });
            }

            await appointment.reschedule(new_date, new_time, reason);

            res.json({
                success: true,
                message: 'Appointment rescheduled successfully',
                data: appointment.toJSON()
            });
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reschedule appointment',
                error: error.message
            });
        }
    }

    /**
     * Complete appointment
     */
    static async completeAppointment(req, res) {
        try {
            const { id } = req.params;
            const { notes, treatment_provided } = req.body;

            const appointment = await Appointment.findById(id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            if (appointment.status === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment is already completed'
                });
            }

            await appointment.complete(notes, treatment_provided);

            res.json({
                success: true,
                message: 'Appointment completed successfully',
                data: appointment.toJSON()
            });
        } catch (error) {
            console.error('Error completing appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to complete appointment',
                error: error.message
            });
        }
    }

    /**
     * Mark appointment as no-show
     */
    static async markNoShow(req, res) {
        try {
            const { id } = req.params;
            const { notes } = req.body;

            const appointment = await Appointment.findById(id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            appointment.status = 'no_show';
            if (notes) {
                appointment.notes = appointment.notes 
                    ? `${appointment.notes}\n\nNo-show notes: ${notes}`
                    : `No-show notes: ${notes}`;
            }

            await appointment.update();

            res.json({
                success: true,
                message: 'Appointment marked as no-show',
                data: appointment.toJSON()
            });
        } catch (error) {
            console.error('Error marking appointment as no-show:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark appointment as no-show',
                error: error.message
            });
        }
    }

    /**
     * Get upcoming appointments
     */
    static async getUpcomingAppointments(req, res) {
        try {
            const { dentist_id, days = 7, limit = 50 } = req.query;
            
            const appointments = await Appointment.getUpcoming(
                dentist_id,
                parseInt(days),
                parseInt(limit)
            );

            res.json({
                success: true,
                data: appointments.map(appointment => appointment.toJSON())
            });
        } catch (error) {
            console.error('Error getting upcoming appointments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve upcoming appointments',
                error: error.message
            });
        }
    }

    /**
     * Get appointments for today
     */
    static async getTodayAppointments(req, res) {
        try {
            const { dentist_id } = req.query;
            const today = moment().format('YYYY-MM-DD');
            
            const appointments = await Appointment.findByDate(today, dentist_id);

            res.json({
                success: true,
                data: appointments.map(appointment => appointment.toJSON())
            });
        } catch (error) {
            console.error('Error getting today appointments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve today appointments',
                error: error.message
            });
        }
    }

    /**
     * Get appointment statistics
     */
    static async getAppointmentStats(req, res) {
        try {
            const { start_date, end_date, dentist_id } = req.query;
            
            const stats = await Appointment.getStats(start_date, end_date, dentist_id);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting appointment stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve appointment statistics',
                error: error.message
            });
        }
    }

    /**
     * Check appointment availability
     */
    static async checkAvailability(req, res) {
        try {
            const { dentist_id, date, time, duration = 30 } = req.query;

            if (!dentist_id || !date || !time) {
                return res.status(400).json({
                    success: false,
                    message: 'Dentist ID, date, and time are required'
                });
            }

            const conflicts = await Appointment.checkConflicts(
                dentist_id,
                date,
                time,
                parseInt(duration)
            );
            const hasConflict = conflicts.length > 0;

            res.json({
                success: true,
                data: {
                    available: !hasConflict,
                    dentist_id,
                    date,
                    time,
                    duration: parseInt(duration)
                }
            });
        } catch (error) {
            console.error('Error checking availability:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check availability',
                error: error.message
            });
        }
    }
}

module.exports = AppointmentController;