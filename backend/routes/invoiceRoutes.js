const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { validateInvoice, validatePayment, validateId, handleValidationErrors } = require('../middleware/validation');

// Get all invoices with search, filter, and pagination
router.get('/', invoiceController.getAllInvoices);

// Get invoice statistics
router.get('/stats', invoiceController.getInvoiceStats);

// Get invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// Get invoice by invoice number
router.get('/number/:invoiceNumber', invoiceController.getInvoiceByNumber);

// Create new invoice
router.post('/', validateInvoice, handleValidationErrors, invoiceController.createInvoice);

// Update invoice
router.put('/:id', validateId, validateInvoice, handleValidationErrors, invoiceController.updateInvoice);

// Delete invoice
router.delete('/:id', invoiceController.deleteInvoice);

// Send invoice via email
router.post('/:id/send', invoiceController.sendInvoice);

// Generate PDF for invoice
router.post('/:id/pdf', invoiceController.generatePdf);

// Record payment for invoice
router.post('/:id/payment', validateId, validatePayment, handleValidationErrors, invoiceController.recordPayment);

// Get payments for invoice
router.get('/:id/payments', invoiceController.getInvoicePayments);

module.exports = router;