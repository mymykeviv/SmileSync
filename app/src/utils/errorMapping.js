/**
 * Error Message Mapping System
 * Provides user-friendly error messages for API responses
 */

// HTTP Status Code to User Message Mapping
export const HTTP_ERROR_MESSAGES = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'You are not authorized to perform this action.',
  403: 'Access denied. You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. Please check for existing data.',
  422: 'The data provided is invalid. Please correct the errors and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An internal server error occurred. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
  504: 'Request timeout. Please check your connection and try again.'
};

// Specific Error Code to User Message Mapping
export const ERROR_CODE_MESSAGES = {
  // Appointment Errors
  'APPOINTMENT_CONFLICT': 'This appointment time conflicts with an existing appointment. Please choose a different time.',
  'APPOINTMENT_PAST_DATE': 'Cannot schedule appointments in the past. Please select a future date.',
  'APPOINTMENT_INVALID_DURATION': 'Invalid appointment duration. Please select a valid time slot.',
  'APPOINTMENT_DENTIST_UNAVAILABLE': 'The selected dentist is not available at this time. Please choose a different time or dentist.',
  'APPOINTMENT_PATIENT_NOT_FOUND': 'Patient not found. Please verify the patient information.',
  'APPOINTMENT_OUTSIDE_HOURS': 'Appointments can only be scheduled during business hours.',
  
  // Patient Errors
  'PATIENT_DUPLICATE_EMAIL': 'A patient with this email address already exists. Please use a different email or update the existing patient.',
  'PATIENT_DUPLICATE_PHONE': 'A patient with this phone number already exists.',
  'PATIENT_INVALID_EMAIL': 'Please enter a valid email address.',
  'PATIENT_INVALID_PHONE': 'Please enter a valid phone number.',
  'PATIENT_REQUIRED_FIELDS': 'Please fill in all required fields: name, email, and phone.',
  'PATIENT_NOT_FOUND': 'Patient not found. The patient may have been deleted or the ID is incorrect.',
  
  // Service Errors
  'SERVICE_DUPLICATE_NAME': 'A service with this name already exists.',
  'SERVICE_INVALID_PRICE': 'Please enter a valid price for the service.',
  'SERVICE_INVALID_DURATION': 'Please enter a valid duration for the service.',
  'SERVICE_NOT_FOUND': 'Service not found. Please verify the service ID.',
  
  // User/Authentication Errors
  'USER_INVALID_CREDENTIALS': 'Invalid username or password. Please try again.',
  'USER_ACCOUNT_LOCKED': 'Your account has been locked. Please contact an administrator.',
  'USER_SESSION_EXPIRED': 'Your session has expired. Please log in again.',
  'USER_INSUFFICIENT_PERMISSIONS': 'You do not have permission to perform this action.',
  
  // Billing/Invoice Errors
  'INVOICE_ALREADY_PAID': 'This invoice has already been paid.',
  'INVOICE_INVALID_AMOUNT': 'Please enter a valid amount.',
  'INVOICE_NOT_FOUND': 'Invoice not found. Please verify the invoice ID.',
  'PAYMENT_FAILED': 'Payment processing failed. Please try again or use a different payment method.',
  
  // Validation Errors
  'VALIDATION_REQUIRED_FIELD': 'This field is required.',
  'VALIDATION_INVALID_FORMAT': 'Please enter data in the correct format.',
  'VALIDATION_MIN_LENGTH': 'This field must be at least {min} characters long.',
  'VALIDATION_MAX_LENGTH': 'This field cannot exceed {max} characters.',
  'VALIDATION_INVALID_DATE': 'Please enter a valid date.',
  'VALIDATION_INVALID_TIME': 'Please enter a valid time.',
  
  // Network/System Errors
  'NETWORK_ERROR': 'Network connection error. Please check your internet connection and try again.',
  'SERVER_UNAVAILABLE': 'The server is temporarily unavailable. Please try again later.',
  'DATABASE_ERROR': 'A database error occurred. Please try again later.',
  'FILE_UPLOAD_ERROR': 'File upload failed. Please try again with a different file.',
  'FILE_TOO_LARGE': 'The file is too large. Please select a smaller file.',
  'UNSUPPORTED_FILE_TYPE': 'This file type is not supported. Please select a different file.'
};

// Field-specific validation messages
export const FIELD_ERROR_MESSAGES = {
  email: 'Please enter a valid email address.',
  phone: 'Please enter a valid phone number.',
  date: 'Please enter a valid date.',
  time: 'Please enter a valid time.',
  name: 'Name is required and must be at least 2 characters long.',
  password: 'Password must be at least 8 characters long.',
  price: 'Please enter a valid price (numbers only).',
  duration: 'Please enter a valid duration in minutes.'
};

/**
 * Get user-friendly error message from API response
 * @param {Object} error - Error object from API response
 * @param {number} statusCode - HTTP status code
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error, statusCode = null) {
  // If error has a specific error code, use that mapping
  if (error?.code && ERROR_CODE_MESSAGES[error.code]) {
    let message = ERROR_CODE_MESSAGES[error.code];
    
    // Replace placeholders with actual values
    if (error.details) {
      Object.keys(error.details).forEach(key => {
        message = message.replace(`{${key}}`, error.details[key]);
      });
    }
    
    return message;
  }
  
  // If error has a message field, use it if it's user-friendly
  if (error?.message && isUserFriendlyMessage(error.message)) {
    return error.message;
  }
  
  // If error has validation errors, format them nicely
  if (error?.errors && Array.isArray(error.errors)) {
    return formatValidationErrors(error.errors);
  }
  
  // Fall back to HTTP status code mapping
  if (statusCode && HTTP_ERROR_MESSAGES[statusCode]) {
    return HTTP_ERROR_MESSAGES[statusCode];
  }
  
  // Default fallback message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if a message is user-friendly (not a technical error)
 * @param {string} message - Error message to check
 * @returns {boolean} True if message is user-friendly
 */
function isUserFriendlyMessage(message) {
  const technicalPatterns = [
    /^Error:/,
    /^TypeError:/,
    /^ReferenceError:/,
    /^SyntaxError:/,
    /stack trace/i,
    /at Object\./,
    /\w+\.js:\d+/,
    /HTTP error! status:/
  ];
  
  return !technicalPatterns.some(pattern => pattern.test(message));
}

/**
 * Format validation errors into a readable message
 * @param {Array} errors - Array of validation errors
 * @returns {string} Formatted error message
 */
function formatValidationErrors(errors) {
  if (errors.length === 1) {
    const error = errors[0];
    return getFieldErrorMessage(error.field, error.message) || error.message;
  }
  
  const errorMessages = errors.map(error => {
    const fieldMessage = getFieldErrorMessage(error.field, error.message);
    return fieldMessage || `${error.field}: ${error.message}`;
  });
  
  return `Please correct the following errors:\n• ${errorMessages.join('\n• ')}`;
}

/**
 * Get field-specific error message
 * @param {string} field - Field name
 * @param {string} originalMessage - Original error message
 * @returns {string|null} Field-specific message or null
 */
function getFieldErrorMessage(field, originalMessage) {
  if (FIELD_ERROR_MESSAGES[field]) {
    return FIELD_ERROR_MESSAGES[field];
  }
  
  // Check for common validation patterns
  if (originalMessage.includes('required')) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
  }
  
  if (originalMessage.includes('invalid') || originalMessage.includes('format')) {
    return `Please enter a valid ${field}.`;
  }
  
  return null;
}

/**
 * Get error message for appointment conflicts with specific details
 * @param {Object} conflictDetails - Details about the conflict
 * @returns {string} Detailed conflict message
 */
export function getAppointmentConflictMessage(conflictDetails) {
  if (!conflictDetails) {
    return ERROR_CODE_MESSAGES.APPOINTMENT_CONFLICT;
  }
  
  const { existingAppointment, requestedTime } = conflictDetails;
  
  if (existingAppointment) {
    const existingTime = new Date(existingAppointment.appointmentDate).toLocaleString();
    return `This time slot conflicts with an existing appointment at ${existingTime}. Please choose a different time.`;
  }
  
  return ERROR_CODE_MESSAGES.APPOINTMENT_CONFLICT;
}

/**
 * Get retry-friendly error message for network errors
 * @param {Object} error - Network error object
 * @returns {Object} Error message with retry information
 */
export function getNetworkErrorMessage(error) {
  const isRetryable = error?.code !== 'ENOTFOUND' && error?.code !== 'ECONNREFUSED';
  
  return {
    message: isRetryable 
      ? 'Network connection error. Please try again.' 
      : 'Unable to connect to the server. Please check your connection.',
    canRetry: isRetryable,
    retryDelay: isRetryable ? 3000 : null // 3 seconds
  };
}