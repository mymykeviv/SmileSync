const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getAppointmentAnalytics,
  getRevenueAnalytics,
  getPatientAnalytics,
  getBillingAnalytics,
  getPaymentAnalytics,
  exportAnalytics
} = require('../controllers/analyticsController');

/**
 * @route GET /api/analytics/dashboard
 * @desc Get dashboard overview metrics
 * @access Public
 * @query startDate - Start date for analytics (YYYY-MM-DD)
 * @query endDate - End date for analytics (YYYY-MM-DD)
 */
router.get('/dashboard', getDashboardOverview);

/**
 * @route GET /api/analytics/appointments
 * @desc Get appointment analytics data
 * @access Public
 * @query startDate - Start date for analytics (YYYY-MM-DD)
 * @query endDate - End date for analytics (YYYY-MM-DD)
 */
router.get('/appointments', getAppointmentAnalytics);

/**
 * @route GET /api/analytics/revenue
 * @desc Get revenue analytics data
 * @access Public
 * @query startDate - Start date for analytics (YYYY-MM-DD)
 * @query endDate - End date for analytics (YYYY-MM-DD)
 */
router.get('/revenue', getRevenueAnalytics);

/**
 * @route GET /api/analytics/patients
 * @desc Get patient analytics data
 * @access Public
 * @query startDate - Start date for analytics (YYYY-MM-DD)
 * @query endDate - End date for analytics (YYYY-MM-DD)
 */
router.get('/patients', getPatientAnalytics);

/**
 * @route GET /api/analytics/billing
 * @desc Get billing analytics data
 * @access Public
 * @query startDate - Start date for analytics (YYYY-MM-DD)
 * @query endDate - End date for analytics (YYYY-MM-DD)
 */
router.get('/billing', getBillingAnalytics);

/**
 * @route GET /api/analytics/payments
 * @desc Get payment analytics data
 * @access Public
 * @query startDate - Start date for analytics (YYYY-MM-DD)
 * @query endDate - End date for analytics (YYYY-MM-DD)
 */
router.get('/payments', getPaymentAnalytics);

/**
 * @route GET /api/analytics/export
 * @desc Export analytics data as CSV
 * @access Public
 * @query type - Type of data to export (appointments, revenue, patients, billing, payments)
 * @query startDate - Start date for export (YYYY-MM-DD)
 * @query endDate - End date for export (YYYY-MM-DD)
 */
router.get('/export', exportAnalytics);

module.exports = router;