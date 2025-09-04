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

      // Convert invoices to JSON and add patient information
      const invoicesData = invoices.map(invoice => {
        const invoiceData = invoice.toJSON();
        
        // Add patient information if available
        if (invoice.patient_first_name || invoice.patient_last_name) {
          invoiceData.patient = {
            firstName: invoice.patient_first_name,
            lastName: invoice.patient_last_name,
            patientNumber: invoice.patient_number
          };
        }
        
        return invoiceData;
      });

      res.json({
        success: true,
        data: invoicesData,
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
      
      // Add patient information if available
      if (invoice.patient_first_name || invoice.patient_last_name) {
        invoiceData.patient = {
          firstName: invoice.patient_first_name,
          lastName: invoice.patient_last_name,
          patientNumber: invoice.patient_number,
          phone: invoice.phone,
          email: invoice.email,
          address: invoice.address,
          city: invoice.city,
          state: invoice.state,
          zipCode: invoice.zip_code
        };
      }

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

      // Add items to the invoice
      if (invoiceData.items && invoiceData.items.length > 0) {
        for (const item of invoiceData.items) {
          await savedInvoice.addItem(
            item.type || 'service',
            item.itemId || item.serviceId || item.productId || item.id,
            item.description || item.itemName || '',
            item.quantity || 1,
            item.unitPrice || 0,
            item.toothNumber || null
          );
        }
      }

      // Get the complete invoice with items for response
      const completeInvoice = await Invoice.findById(savedInvoice.id);
      const invoiceItems = await completeInvoice.getItems();
      const responseData = completeInvoice.toJSON();
      responseData.items = invoiceItems.map(item => ({
        id: item.id,
        type: item.item_type,
        itemId: item.item_id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        totalPrice: parseFloat(item.total_price),
        toothNumber: item.tooth_number
      }));

      res.status(201).json({
        success: true,
        data: responseData,
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
      
      // Create PDF document with proper font encoding
      const doc = new PDFDocument({
        bufferPages: true
      });
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
      
      // Pipe PDF to response
      doc.pipe(res);
      
      // Add clinic header to PDF - centered
      const pageWidth = doc.page.width;
      doc.fontSize(20).text(clinicConfig.clinic_name || 'SmileSync Dental Clinic', 0, 50, {
        width: pageWidth,
        align: 'center'
      });
      
      // Add clinic contact information - centered
      let yPos = 75;
      if (clinicConfig.clinic_address) {
        doc.fontSize(10).text(clinicConfig.clinic_address, 0, yPos, {
          width: pageWidth,
          align: 'center'
        });
        yPos += 15;
      }
      if (clinicConfig.contact_phone) {
        doc.fontSize(10).text(`Phone: ${clinicConfig.contact_phone}`, 0, yPos, {
          width: pageWidth,
          align: 'center'
        });
        yPos += 15;
      }
      if (clinicConfig.email) {
        doc.fontSize(10).text(`Email: ${clinicConfig.email}`, 0, yPos, {
          width: pageWidth,
          align: 'center'
        });
        yPos += 15;
      }
      
      // Two-column header layout
      const leftColumnX = 50;
      const rightColumnX = 300;
      const headerStartY = yPos + 10;
      
      // Left column - Bill To details
      const patientName = invoice.patient_first_name && invoice.patient_last_name 
        ? `${invoice.patient_first_name} ${invoice.patient_last_name}` 
        : 'Unknown Patient';
      
      doc.fontSize(14).text('Bill To:', leftColumnX, headerStartY);
      let leftYPos = headerStartY + 20;
      doc.fontSize(12)
         .text(patientName, leftColumnX, leftYPos)
         .text(`Patient ID: ${invoice.patient_number || invoice.patient_id || 'N/A'}`, leftColumnX, leftYPos + 15);
      leftYPos += 30;
      
      if (invoice.phone) {
        doc.text(`Phone: ${invoice.phone}`, leftColumnX, leftYPos);
        leftYPos += 15;
      }
      if (invoice.email) {
        doc.text(`Email: ${invoice.email}`, leftColumnX, leftYPos);
        leftYPos += 15;
      }
      if (invoice.address) {
        doc.text(`Address: ${invoice.address}`, leftColumnX, leftYPos);
        leftYPos += 15;
      }
      
      // Right column - Invoice details with right-aligned title
      doc.fontSize(16).text('INVOICE', rightColumnX, headerStartY, { width: 250, align: 'right' });
      let rightYPos = headerStartY + 30;
      doc.fontSize(12)
         .text(`Invoice Number: ${invoice.invoice_number || 'N/A'}`, rightColumnX, rightYPos, { width: 250, align: 'right' })
         .text(`Date: ${invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}`, rightColumnX, rightYPos + 20, { width: 250, align: 'right' })
         .text(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}`, rightColumnX, rightYPos + 40, { width: 250, align: 'right' });
      
      // Set yPos to the maximum of both columns with reduced spacing
       yPos = Math.max(leftYPos, rightYPos + 60) + 10;
       
       // Items table header with reduced spacing
       let yPosition = yPos + 20;
      doc.fontSize(12)
         .text('Description', 50, yPosition)
         .text('Qty', 250, yPosition, { width: 40, align: 'center' })
         .text('Unit Price', 300, yPosition, { width: 80, align: 'right' })
         .text('Total', 440, yPosition, { width: 80, align: 'right' });
      
      // Draw line under header
      doc.moveTo(50, yPosition + 15)
         .lineTo(520, yPosition + 15)
         .stroke();
      
      yPosition += 30;
      
      // Add items
      if (items && items.length > 0) {
        items.forEach(item => {
          const unitPrice = parseFloat(item.unit_price) || 0;
          const totalPrice = parseFloat(item.total_price) || 0;
          const quantity = parseInt(item.quantity) || 0;
          
          // Item name and description in one column with proper wrapping
          let itemText = item.item_name || 'N/A';
          if (item.description && item.description !== item.item_name) {
            itemText += `\n${item.description}`;
          }
          
          doc.fontSize(10)
             .text(itemText, 50, yPosition, { width: 190, lineGap: 2 })
             .text(quantity.toString(), 250, yPosition, { width: 40, align: 'center' })
             .text(`Rs.${unitPrice.toFixed(2)}`, 300, yPosition, { width: 80, align: 'right' })
             .text(`Rs.${totalPrice.toFixed(2)}`, 440, yPosition, { width: 80, align: 'right' });
          
          // Calculate height based on text content
          const textHeight = Math.max(25, doc.heightOfString(itemText, { width: 190 }) + 10);
          yPosition += textHeight;
        });
      }
      
      // Totals
      yPosition += 20;
      doc.moveTo(320, yPosition)
         .lineTo(520, yPosition)
         .stroke();
      
      yPosition += 10;
      const subtotal = parseFloat(invoice.subtotal) || 0;
      const taxAmount = parseFloat(invoice.tax_amount) || 0;
      const totalAmount = parseFloat(invoice.total_amount) || 0;
      const amountPaid = parseFloat(invoice.amount_paid) || 0;
      const balanceDue = parseFloat(invoice.balance_due) || 0;
      
      doc.fontSize(12).text(`Subtotal: Rs.${subtotal.toFixed(2)}`, 370, yPosition, { width: 150, align: 'right' });
      yPosition += 20;
      doc.text(`Tax: Rs.${taxAmount.toFixed(2)}`, 370, yPosition, { width: 150, align: 'right' });
      yPosition += 20;
      doc.fontSize(14).text(`Total: Rs.${totalAmount.toFixed(2)}`, 370, yPosition, { width: 150, align: 'right' });
      yPosition += 30;
      doc.fontSize(12).text(`Amount Paid: Rs.${amountPaid.toFixed(2)}`, 370, yPosition, { width: 150, align: 'right' });
      yPosition += 20;
      doc.text(`Balance Due: Rs.${balanceDue.toFixed(2)}`, 370, yPosition, { width: 150, align: 'right' });
      
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