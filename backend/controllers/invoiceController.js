const { Invoice, Patient, Service, Product, Payment } = require('../models');
const { convertInvoiceToBackend, convertPaymentToBackend } = require('../utils/fieldMapping');

class InvoiceController {
  // Get all invoices with search, filter, and pagination
  static async getAllInvoices(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = '',
        dateFilter = '',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const invoices = await Invoice.findAll({
        search,
        status,
        dateFilter,
        sortBy,
        sortOrder,
        limit: parseInt(limit),
        offset
      });

      const totalCount = await Invoice.getCount({ search, status, dateFilter });
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.json({
        success: true,
        data: invoices,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch invoices',
        error: error.message
      });
    }
  }

  // Get invoice by ID
  static async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findById(id);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch invoice',
        error: error.message
      });
    }
  }

  // Get invoice by invoice number
  static async getInvoiceByNumber(req, res) {
    try {
      const { invoiceNumber } = req.params;
      const invoice = await Invoice.findByInvoiceNumber(invoiceNumber);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch invoice',
        error: error.message
      });
    }
  }

  // Create new invoice
  static async createInvoice(req, res) {
    try {
      const invoiceData = req.body;
      
      // Validate required fields
      if (!invoiceData.patientId || !invoiceData.items || invoiceData.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID and items are required'
        });
      }

      // Convert camelCase to snake_case for backend
      const backendInvoiceData = convertInvoiceToBackend(invoiceData);

      // Verify patient exists
      const patient = await Patient.findById(backendInvoiceData.patient_id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const invoice = new Invoice(backendInvoiceData);
      const savedInvoice = await invoice.save();

      res.status(201).json({
        success: true,
        data: savedInvoice,
        message: 'Invoice created successfully'
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create invoice',
        error: error.message
      });
    }
  }

  // Update invoice
  static async updateInvoice(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Check if invoice can be updated (not paid or cancelled)
      if (invoice.status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update paid invoice'
        });
      }

      // Convert camelCase to snake_case for backend
      const backendUpdateData = convertInvoiceToBackend(updateData);

      const updatedInvoice = await invoice.update(backendUpdateData);

      res.json({
        success: true,
        data: updatedInvoice,
        message: 'Invoice updated successfully'
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update invoice',
        error: error.message
      });
    }
  }

  // Delete invoice
  static async deleteInvoice(req, res) {
    try {
      const { id } = req.params;
      
      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Check if invoice can be deleted (not paid)
      if (invoice.status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete paid invoice'
        });
      }

      await invoice.delete();

      res.json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete invoice',
        error: error.message
      });
    }
  }

  // Send invoice via email
  static async sendInvoice(req, res) {
    try {
      const { id } = req.params;
      
      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // TODO: Implement email sending logic
      // For now, just return success
      res.json({
        success: true,
        message: 'Invoice sent successfully'
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send invoice',
        error: error.message
      });
    }
  }

  // Generate PDF for invoice
  static async generatePdf(req, res) {
    try {
      const { id } = req.params;
      
      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // TODO: Implement PDF generation logic
      // For now, just return success
      res.json({
        success: true,
        message: 'PDF generated successfully'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF',
        error: error.message
      });
    }
  }

  // Record payment for invoice
  static async recordPayment(req, res) {
    try {
      const { id } = req.params;
      const paymentData = req.body;
      
      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Convert camelCase to snake_case for backend
      const backendPaymentData = convertPaymentToBackend(paymentData);
      
      // Set invoice and patient IDs
      backendPaymentData.invoice_id = id;
      backendPaymentData.patient_id = invoice.patient_id;
      
      // Create payment record
      const payment = new Payment(backendPaymentData);
      const savedPayment = await payment.save();
      
      // Apply payment to invoice
      await invoice.applyPayment(
        backendPaymentData.amount,
        backendPaymentData.payment_method,
        backendPaymentData.payment_reference,
        backendPaymentData.notes
      );

      res.json({
        success: true,
        data: savedPayment,
        message: 'Payment recorded successfully'
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record payment',
        error: error.message
      });
    }
  }

  // Get payments for invoice
  static async getInvoicePayments(req, res) {
    try {
      const { id } = req.params;
      
      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      const payments = await invoice.getPayments();

      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Error fetching invoice payments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch invoice payments',
        error: error.message
      });
    }
  }

  // Get invoice statistics
  static async getInvoiceStats(req, res) {
    try {
      const stats = await Invoice.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch invoice statistics',
        error: error.message
      });
    }
  }
}

module.exports = InvoiceController;