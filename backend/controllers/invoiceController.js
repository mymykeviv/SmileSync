const { Invoice, Patient, Service, Product, Payment } = require('../models');
const ClinicConfig = require('../models/ClinicConfig');
const { convertInvoiceToBackend, convertPaymentToBackend } = require('../utils/fieldMapping');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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
          message: 'Invoice not found',
          code: 'INVOICE_NOT_FOUND',
          details: { invoiceId: id }
        });
      }

      // Fetch invoice items
      const items = await invoice.getItems();
      
      // Convert invoice to JSON and add items
      const invoiceData = invoice.toJSON();
      invoiceData.items = items.map(item => ({
        id: item.id,
        itemName: item.item_name,
        description: item.description,
        type: item.item_type,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        toothNumber: item.tooth_number
      }));

      res.json({
        success: true,
        data: invoiceData
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch invoice due to database error',
        code: 'DATABASE_ERROR',
        details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
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

      // Fetch invoice items
      const items = await invoice.getItems();
      
      // Convert invoice to JSON and add items
      const invoiceData = invoice.toJSON();
      invoiceData.items = items.map(item => ({
        id: item.id,
        itemName: item.item_name,
        description: item.description,
        type: item.item_type,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        toothNumber: item.tooth_number
      }));

      res.json({
        success: true,
        data: invoiceData
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
        return res.status(422).json({
          success: false,
          message: 'Missing required fields for invoice creation',
          code: 'VALIDATION_ERROR',
          details: {
            missingFields: [
              !invoiceData.patientId && 'patientId',
              (!invoiceData.items || invoiceData.items.length === 0) && 'items'
            ].filter(Boolean)
          }
        });
      }

      // Convert camelCase to snake_case for backend
      const backendInvoiceData = convertInvoiceToBackend(invoiceData);

      // Verify patient exists
      const patient = await Patient.findById(backendInvoiceData.patient_id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
          code: 'PATIENT_NOT_FOUND',
          details: { patientId: backendInvoiceData.patient_id }
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
        message: 'Failed to create invoice due to database error',
        code: 'DATABASE_ERROR',
        details: process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
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

  // Send invoice functionality removed

  // Generate PDF for invoice
  static async generatePdf(req, res) {
    try {
      const { id } = req.params;
      
      // Get invoice data
      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({ 
          success: false, 
          error: 'Invoice not found' 
        });
      }

      // Get clinic configuration
      const clinicConfig = await ClinicConfig.getConfig();
      
      // Get invoice items
      const items = await invoice.getItems();
      
      // Create PDF document
      const doc = new PDFDocument();
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      
      // Pipe PDF to response
      doc.pipe(res);
      
      // Add clinic header to PDF
      doc.fontSize(20).text(clinicConfig.clinic_name || 'SmileSync Dental Clinic', 50, 50);
      
      // Add clinic contact information
      let yPos = 75;
      if (clinicConfig.clinic_address) {
        doc.fontSize(10).text(clinicConfig.clinic_address, 50, yPos);
        yPos += 15;
      }
      if (clinicConfig.contact_phone) {
        doc.fontSize(10).text(`Phone: ${clinicConfig.contact_phone}`, 50, yPos);
        yPos += 15;
      }
      if (clinicConfig.email) {
        doc.fontSize(10).text(`Email: ${clinicConfig.email}`, 50, yPos);
        yPos += 15;
      }
      
      // Invoice title
      doc.fontSize(16).text('Invoice', 50, yPos + 10);
      yPos += 40;
      
      // Invoice details
      doc.fontSize(12)
         .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, yPos)
         .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 50, yPos + 20)
         .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, yPos + 40)
         .text(`Patient ID: ${invoice.patientId}`, 50, yPos + 60);
      
      // Items table header
      let yPosition = yPos + 100;
      doc.text('Description', 50, yPosition)
         .text('Quantity', 200, yPosition)
         .text('Unit Price', 300, yPosition)
         .text('Total', 400, yPosition);
      
      // Draw line under header
      doc.moveTo(50, yPosition + 15)
         .lineTo(500, yPosition + 15)
         .stroke();
      
      yPosition += 30;
      
      // Add items
      if (items && items.length > 0) {
        items.forEach(item => {
          doc.text(item.description || 'N/A', 50, yPosition)
             .text(item.quantity?.toString() || '0', 200, yPosition)
             .text(`₹${(item.unitPrice || 0).toFixed(2)}`, 300, yPosition)
                .text(`₹${(item.totalPrice || 0).toFixed(2)}`, 400, yPosition);
          yPosition += 20;
        });
      }
      
      // Totals
      yPosition += 20;
      doc.moveTo(300, yPosition)
         .lineTo(500, yPosition)
         .stroke();
      
      yPosition += 10;
      doc.text(`Subtotal: ₹${(invoice.subtotal || 0).toFixed(2)}`, 300, yPosition);
        yPosition += 20;
        doc.text(`Tax: ₹${(invoice.taxAmount || 0).toFixed(2)}`, 300, yPosition);
        yPosition += 20;
        doc.fontSize(14).text(`Total: ₹${(invoice.totalAmount || 0).toFixed(2)}`, 300, yPosition);
        yPosition += 30;
        doc.text(`Amount Paid: ₹${(invoice.amountPaid || 0).toFixed(2)}`, 300, yPosition);
        yPosition += 20;
        doc.text(`Balance Due: ₹${(invoice.balanceDue || 0).toFixed(2)}`, 300, yPosition);
      
      // Finalize PDF
      doc.end();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to generate PDF' 
        });
      }
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