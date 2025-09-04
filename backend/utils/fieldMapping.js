/**
 * Field Mapping Utilities
 * Handles conversion between frontend camelCase and backend snake_case field naming
 */

/**
 * Convert camelCase to snake_case
 * @param {string} str - camelCase string
 * @returns {string} snake_case string
 */
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 * @param {string} str - snake_case string
 * @returns {string} camelCase string
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Convert object keys from camelCase to snake_case
 * @param {Object} obj - Object with camelCase keys
 * @returns {Object} Object with snake_case keys
 */
function convertKeysToSnakeCase(obj) {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  }
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    converted[snakeKey] = convertKeysToSnakeCase(value);
  }
  
  return converted;
}

/**
 * Convert object keys from snake_case to camelCase
 * @param {Object} obj - Object with snake_case keys
 * @returns {Object} Object with camelCase keys
 */
function convertKeysToCamelCase(obj) {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    converted[camelKey] = convertKeysToCamelCase(value);
  }
  
  return converted;
}

/**
 * Patient-specific field mappings
 */
const PATIENT_FIELD_MAPPINGS = {
  // Frontend (camelCase) -> Backend (snake_case)
  frontendToBackend: {
    firstName: 'first_name',
    lastName: 'last_name',
    dateOfBirth: 'date_of_birth',
    patientNumber: 'patient_number',
    zipCode: 'zip_code',
    emergencyContactName: 'emergency_contact_name',
    emergencyContactPhone: 'emergency_contact_phone',
    emergencyContactRelationship: 'emergency_contact_relationship',
    insuranceProvider: 'insurance_provider',
    insurancePolicyNumber: 'insurance_policy_number',
    insuranceGroupNumber: 'insurance_group_number',
    medicalHistory: 'medical_history',
    isActive: 'is_active',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    createdBy: 'created_by'
  },
  
  // Backend (snake_case) -> Frontend (camelCase)
  backendToFrontend: {
    first_name: 'firstName',
    last_name: 'lastName',
    date_of_birth: 'dateOfBirth',
    patient_number: 'patientNumber',
    zip_code: 'zipCode',
    emergency_contact_name: 'emergencyContactName',
    emergency_contact_phone: 'emergencyContactPhone',
    emergency_contact_relationship: 'emergencyContactRelationship',
    insurance_provider: 'insuranceProvider',
    insurance_policy_number: 'insurancePolicyNumber',
    insurance_group_number: 'insuranceGroupNumber',
    medical_history: 'medicalHistory',
    is_active: 'isActive',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    created_by: 'createdBy'
  }
};

/**
 * Convert patient data from frontend format to backend format
 * @param {Object} patientData - Patient data with camelCase keys
 * @returns {Object} Patient data with snake_case keys
 */
function convertPatientToBackend(patientData) {
  const converted = {};
  
  for (const [key, value] of Object.entries(patientData)) {
    const backendKey = PATIENT_FIELD_MAPPINGS.frontendToBackend[key] || camelToSnake(key);
    converted[backendKey] = value;
  }
  
  return converted;
}

/**
 * Convert patient data from backend format to frontend format
 * @param {Object} patientData - Patient data with snake_case keys
 * @returns {Object} Patient data with camelCase keys
 */
function convertPatientToFrontend(patientData) {
  const converted = {};
  
  for (const [key, value] of Object.entries(patientData)) {
    const frontendKey = PATIENT_FIELD_MAPPINGS.backendToFrontend[key] || snakeToCamel(key);
    converted[frontendKey] = value;
  }
  
  return converted;
}

/**
 * Appointment-specific field mappings
 */
const APPOINTMENT_FIELD_MAPPINGS = {
  frontendToBackend: {
    patientId: 'patient_id',
    dentistId: 'dentist_id',
    appointmentDate: 'appointment_date',
    appointmentTime: 'appointment_time',
    appointmentNumber: 'appointment_number',
    durationMinutes: 'duration_minutes',
    appointmentType: 'appointment_type',
    chiefComplaint: 'chief_complaint',
    treatmentNotes: 'treatment_notes',
    nextAppointmentRecommended: 'next_appointment_recommended',
    nextAppointmentNotes: 'next_appointment_notes',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    createdBy: 'created_by'
  },
  
  backendToFrontend: {
    patient_id: 'patientId',
    dentist_id: 'dentistId',
    appointment_date: 'appointmentDate',
    appointment_time: 'appointmentTime',
    appointment_number: 'appointmentNumber',
    duration_minutes: 'durationMinutes',
    appointment_type: 'appointmentType',
    chief_complaint: 'chiefComplaint',
    treatment_notes: 'treatmentNotes',
    next_appointment_recommended: 'nextAppointmentRecommended',
    next_appointment_notes: 'nextAppointmentNotes',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    created_by: 'createdBy',
    // Additional mappings for frontend display
    status: 'status'
  }
};

/**
 * Invoice-specific field mappings
 */
const INVOICE_FIELD_MAPPINGS = {
  frontendToBackend: {
    invoiceNumber: 'invoice_number',
    patientId: 'patient_id',
    appointmentId: 'appointment_id',
    treatmentPlanId: 'treatment_plan_id',
    invoiceDate: 'invoice_date',
    dueDate: 'due_date',
    taxRate: 'tax_rate',
    taxAmount: 'tax_amount',
    discountAmount: 'discount_amount',
    totalAmount: 'total_amount',
    amountPaid: 'amount_paid',
    balanceDue: 'balance_due',
    paymentTerms: 'payment_terms',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    createdBy: 'created_by'
  },
  
  backendToFrontend: {
    invoice_number: 'invoiceNumber',
    patient_id: 'patientId',
    appointment_id: 'appointmentId',
    treatment_plan_id: 'treatmentPlanId',
    invoice_date: 'invoiceDate',
    due_date: 'dueDate',
    tax_rate: 'taxRate',
    tax_amount: 'taxAmount',
    discount_amount: 'discountAmount',
    total_amount: 'totalAmount',
    amount_paid: 'amountPaid',
    balance_due: 'balanceDue',
    payment_terms: 'paymentTerms',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    created_by: 'createdBy',
    // Additional mappings for frontend display
    description: 'description',
    status: 'status'
  }
};

/**
 * Payment-specific field mappings
 */
const PAYMENT_FIELD_MAPPINGS = {
  frontendToBackend: {
    paymentNumber: 'payment_number',
    invoiceId: 'invoice_id',
    patientId: 'patient_id',
    paymentDate: 'payment_date',
    method: 'payment_method',
    paymentMethod: 'payment_method',
    paymentReference: 'payment_reference',
    transactionId: 'transaction_id',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    createdBy: 'created_by'
  },

  backendToFrontend: {
    payment_number: 'paymentNumber',
    invoice_id: 'invoiceId',
    patient_id: 'patientId',
    payment_date: 'paymentDate',
    payment_method: 'paymentMethod',
    payment_reference: 'paymentReference',
    transaction_id: 'transactionId',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    created_by: 'createdBy'
  }
};

/**
 * User field mappings
 */
const USER_FIELD_MAPPINGS = {
  frontendToBackend: {
    firstName: 'first_name',
    lastName: 'last_name',
    passwordHash: 'password_hash',
    licenseNumber: 'license_number',
    isActive: 'is_active',
    lastLogin: 'last_login',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    createdBy: 'created_by'
  },

  backendToFrontend: {
    first_name: 'firstName',
    last_name: 'lastName',
    password_hash: 'passwordHash',
    license_number: 'licenseNumber',
    is_active: 'isActive',
    last_login: 'lastLogin',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    created_by: 'createdBy'
  }
};

/**
 * Convert appointment data from frontend format to backend format
 */
function convertAppointmentToBackend(appointmentData) {
  const converted = {};
  
  for (const [key, value] of Object.entries(appointmentData)) {
    const backendKey = APPOINTMENT_FIELD_MAPPINGS.frontendToBackend[key] || camelToSnake(key);
    converted[backendKey] = value;
  }
  
  return converted;
}

/**
 * Convert appointment data from backend format to frontend format
 */
function convertAppointmentToFrontend(appointmentData) {
  if (!appointmentData) return null;
  
  const converted = {};
  
  for (const [key, value] of Object.entries(appointmentData)) {
    const frontendKey = APPOINTMENT_FIELD_MAPPINGS.backendToFrontend[key] || snakeToCamel(key);
    converted[frontendKey] = value;
  }
  
  // Add computed fields for frontend display
  // Combine appointment_date and appointment_time into 'date'
  if (appointmentData.appointment_date) {
    // Convert timestamp to date string if needed
    let dateStr = appointmentData.appointment_date;
    if (typeof appointmentData.appointment_date === 'number') {
      dateStr = new Date(appointmentData.appointment_date).toISOString().split('T')[0];
    }
    
    if (appointmentData.appointment_time) {
      converted.date = `${dateStr}T${appointmentData.appointment_time}`;
    } else {
      converted.date = dateStr;
    }
  }
  
  // Map appointment_type to 'type'
  converted.type = appointmentData.appointment_type || 'General';
  
  // Create provider name from dentist info
  if (appointmentData.dentist_first_name && appointmentData.dentist_last_name) {
    converted.provider = `${appointmentData.dentist_first_name} ${appointmentData.dentist_last_name}`;
  } else {
    converted.provider = 'Unknown Provider';
  }
  
  // Map treatment_notes to 'notes'
  converted.notes = appointmentData.treatment_notes || appointmentData.chief_complaint || 'No notes';
  
  // Set default status if not provided
  converted.status = appointmentData.status || 'scheduled';
  
  return converted;
}

/**
 * Convert invoice data from frontend format to backend format
 */
function convertInvoiceToBackend(invoiceData) {
  const converted = {};
  
  for (const [key, value] of Object.entries(invoiceData)) {
    const backendKey = INVOICE_FIELD_MAPPINGS.frontendToBackend[key] || camelToSnake(key);
    converted[backendKey] = value;
  }
  
  return converted;
}

/**
 * Convert invoice data from backend format to frontend format
 */
function convertInvoiceToFrontend(invoiceData) {
  if (!invoiceData) return null;
  
  const converted = {};
  
  for (const [key, value] of Object.entries(invoiceData)) {
    const frontendKey = INVOICE_FIELD_MAPPINGS.backendToFrontend[key] || snakeToCamel(key);
    converted[frontendKey] = value;
  }
  
  // Add computed fields for frontend display
  // Map invoice_date to 'date'
  converted.date = invoiceData.invoice_date;
  
  // Map total_amount to 'amount'
  converted.amount = invoiceData.total_amount || 0;
  
  // Set default description if not provided
  converted.description = invoiceData.description || 'Dental Services';
  
  // Set default status if not provided
  converted.status = invoiceData.status || 'pending';
  
  return converted;
}

/**
 * Convert payment data from frontend format to backend format
 */
function convertPaymentToBackend(paymentData) {
  const converted = {};
  
  for (const [key, value] of Object.entries(paymentData)) {
    const backendKey = PAYMENT_FIELD_MAPPINGS.frontendToBackend[key] || camelToSnake(key);
    converted[backendKey] = value;
  }
  
  return converted;
}

/**
 * Convert payment data from backend format to frontend format
 */
function convertPaymentToFrontend(paymentData) {
  const converted = {};
  
  for (const [key, value] of Object.entries(paymentData)) {
    const frontendKey = PAYMENT_FIELD_MAPPINGS.backendToFrontend[key] || snakeToCamel(key);
    converted[frontendKey] = value;
  }
  
  return converted;
}

/**
 * Convert user data from frontend format to backend format
 */
function convertUserToBackend(userData) {
  const converted = {};
  
  for (const [key, value] of Object.entries(userData)) {
    const backendKey = USER_FIELD_MAPPINGS.frontendToBackend[key] || camelToSnake(key);
    converted[backendKey] = value;
  }
  
  return converted;
}

/**
 * Convert user data from backend format to frontend format
 */
function convertUserToFrontend(userData) {
  const converted = {};
  
  // List of sensitive fields to exclude from frontend responses
  const excludedFields = ['password_hash', 'passwordHash'];
  
  for (const [key, value] of Object.entries(userData)) {
    // Skip sensitive fields
    if (excludedFields.includes(key)) {
      continue;
    }
    
    const frontendKey = USER_FIELD_MAPPINGS.backendToFrontend[key] || snakeToCamel(key);
    
    // Double-check to exclude sensitive fields after mapping
    if (excludedFields.includes(frontendKey)) {
      continue;
    }
    
    converted[frontendKey] = value;
  }
  
  return converted;
}

/**
 * Service-specific field mappings
 */
const SERVICE_FIELD_MAPPINGS = {
  // Frontend (camelCase) -> Backend (snake_case)
  frontendToBackend: {
    serviceCode: 'service_code',
    durationMinutes: 'duration_minutes',
    basePrice: 'base_price',
    isActive: 'is_active',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    createdBy: 'created_by'
  },
  
  // Backend (snake_case) -> Frontend (camelCase)
  backendToFrontend: {
    service_code: 'serviceCode',
    duration_minutes: 'durationMinutes',
    base_price: 'basePrice',
    is_active: 'isActive',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    created_by: 'createdBy'
  }
};

/**
 * Convert service data from frontend format to backend format
 */
function convertServiceToBackend(serviceData) {
  const converted = {};
  
  for (const [key, value] of Object.entries(serviceData)) {
    const backendKey = SERVICE_FIELD_MAPPINGS.frontendToBackend[key] || camelToSnake(key);
    converted[backendKey] = value;
  }
  
  return converted;
}

/**
 * Convert service data from backend format to frontend format
 */
function convertServiceToFrontend(serviceData) {
  const converted = {};
  
  for (const [key, value] of Object.entries(serviceData)) {
    const frontendKey = SERVICE_FIELD_MAPPINGS.backendToFrontend[key] || snakeToCamel(key);
    converted[frontendKey] = value;
  }
  
  return converted;
}

/**
 * Product-specific field mappings
 */
const PRODUCT_FIELD_MAPPINGS = {
  // Frontend (camelCase) -> Backend (snake_case)
  frontendToBackend: {
    productCode: 'product_code',
    unitPrice: 'unit_price',
    unitOfMeasure: 'unit_of_measure',
    currentStock: 'current_stock',
    minimumStock: 'minimum_stock',
    isActive: 'is_active',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    createdBy: 'created_by'
  },
  
  // Backend (snake_case) -> Frontend (camelCase)
  backendToFrontend: {
    product_code: 'productCode',
    unit_price: 'unitPrice',
    unit_of_measure: 'unitOfMeasure',
    current_stock: 'currentStock',
    minimum_stock: 'minimumStock',
    is_active: 'isActive',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    created_by: 'createdBy'
  }
};

/**
 * Convert product data from frontend format to backend format
 */
function convertProductToBackend(productData) {
  const converted = {};
  
  for (const [key, value] of Object.entries(productData)) {
    const backendKey = PRODUCT_FIELD_MAPPINGS.frontendToBackend[key] || camelToSnake(key);
    converted[backendKey] = value;
  }
  
  return converted;
}

/**
 * Convert product data from backend format to frontend format
 */
function convertProductToFrontend(productData) {
  const converted = {};
  
  for (const [key, value] of Object.entries(productData)) {
    const frontendKey = PRODUCT_FIELD_MAPPINGS.backendToFrontend[key] || snakeToCamel(key);
    converted[frontendKey] = value;
  }
  
  return converted;
}

module.exports = {
  camelToSnake,
  snakeToCamel,
  convertKeysToSnakeCase,
  convertKeysToCamelCase,
  convertPatientToBackend,
  convertPatientToFrontend,
  convertAppointmentToBackend,
  convertAppointmentToFrontend,
  convertInvoiceToBackend,
  convertInvoiceToFrontend,
  convertPaymentToBackend,
  convertPaymentToFrontend,
  convertUserToBackend,
  convertUserToFrontend,
  convertServiceToBackend,
  convertServiceToFrontend,
  convertProductToBackend,
  convertProductToFrontend,
  PATIENT_FIELD_MAPPINGS,
  APPOINTMENT_FIELD_MAPPINGS,
  INVOICE_FIELD_MAPPINGS,
  PAYMENT_FIELD_MAPPINGS,
  USER_FIELD_MAPPINGS,
  SERVICE_FIELD_MAPPINGS,
  PRODUCT_FIELD_MAPPINGS
};