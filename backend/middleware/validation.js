const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Patient validation rules
const validatePatient = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^[\+]?[1-9][\d\s\-\(\)]{7,15}$/)
    .withMessage('Must be a valid phone number'),
  body('dateOfBirth')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .toDate()
    .custom((value) => {
      const today = new Date();
      const birthDate = new Date(value);
      if (birthDate > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age > 150) {
        throw new Error('Date of birth seems unrealistic');
      }
      return true;
    }),
  body('gender')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters'),
  body('medicalHistory')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 2000 })
    .withMessage('Medical history must be less than 2000 characters'),
  body('emergencyContact')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage('Emergency contact must be less than 200 characters'),
  body('insuranceInfo')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage('Insurance info must be less than 200 characters')
];

// Appointment validation rules
const validateAppointment = [
  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),
  body('service_id')
    .isInt({ min: 1 })
    .withMessage('Valid service ID is required'),
  body('appointment_date')
    .isISO8601()
    .toDate()
    .custom((value) => {
      const appointmentDate = new Date(value);
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      
      // Set time to start of day for date-only comparison
      const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
      const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (appointmentDateOnly < todayOnly) {
        throw new Error('Appointment date cannot be in the past');
      }
      if (appointmentDate > oneYearFromNow) {
        throw new Error('Appointment date cannot be more than one year in the future');
      }
      return true;
    }),
  body('appointment_time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Appointment time must be in HH:mm format'),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('dentist')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 1, max: 100 })
    .withMessage('Dentist name must be less than 100 characters'),
  body('dentist_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Valid dentist ID is required'),
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
    .withMessage('Invalid appointment status'),
  body('appointment_type')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['checkup', 'cleaning', 'consultation', 'treatment', 'emergency', 'follow_up'])
    .withMessage('Invalid appointment type'),
  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

// Service validation rules
const validateService = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Service name is required and must be less than 200 characters'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category is required and must be less than 100 characters'),
  body('duration_minutes')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('base_price')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

// Product validation rules
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name is required and must be less than 200 characters'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category is required and must be less than 100 characters'),
  body('supplier')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Supplier is required and must be less than 200 characters'),
  body('unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('currentStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current stock must be a non-negative integer'),
  body('minimumStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Invoice validation rules
const validateInvoice = [
  body('patientId')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),
  body('appointmentId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Appointment ID must be a valid integer'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one invoice item is required'),
  body('items.*.serviceId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Service ID must be a valid integer'),
  body('items.*.productId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),
  body('items.*.description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Item description is required and must be less than 500 characters'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .custom((value) => {
      const dueDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    }),
  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

// Payment validation rules
const validatePayment = [
  body('invoiceId')
    .isInt({ min: 1 })
    .withMessage('Valid invoice ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  body('paymentMethod')
    .isIn(['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'insurance'])
    .withMessage('Invalid payment method'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      const paymentDate = new Date(value);
      const today = new Date();
      if (paymentDate > today) {
        throw new Error('Payment date cannot be in the future');
      }
      return true;
    }),
  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

// Query parameter validation for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  handleValidationErrors,
  validatePatient,
  validateAppointment,
  validateService,
  validateProduct,
  validateInvoice,
  validatePayment,
  validateId,
  validatePagination
};