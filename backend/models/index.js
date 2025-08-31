/**
 * Models Index
 * Exports all database models for easy importing
 */

const Patient = require('./Patient');
const Appointment = require('./Appointment');
const Service = require('./Service');
const Product = require('./Product');
const Invoice = require('./Invoice');
const Payment = require('./Payment');
const TreatmentPlan = require('./TreatmentPlan');
const User = require('./User');

module.exports = {
    Patient,
    Appointment,
    Service,
    Product,
    Invoice,
    Payment,
    TreatmentPlan,
    User
};