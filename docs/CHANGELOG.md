# SmileSync Changelog

## [Latest] - 2025-09-01

### 🚀 New Features

#### PDF Preview Functionality
- **Enhanced PDF Experience**: Replaced direct PDF downloads with an interactive preview system
- **Preview Dialog**: Added large modal dialogs (90% viewport height) for optimal PDF viewing
- **Embedded Viewer**: Implemented iframe-based PDF display for seamless in-app viewing
- **Download on Demand**: Users can now preview invoices before deciding to download
- **Consistent UX**: Applied preview functionality across both invoice detail view and billing list

#### Complete Currency Conversion (USD → INR)
- **Backend Models**: Updated all currency formatting methods in Invoice, Payment, Product, Service, and TreatmentPlan models
- **Frontend Components**: Converted all currency displays from $ to ₹ across the entire application
- **PDF Generation**: Updated invoice PDF generation to use INR currency symbol
- **Validation Messages**: Updated form validation messages to reference INR instead of USD
- **Analytics & Dashboard**: Converted revenue displays and chart tooltips to INR formatting

### 🔧 Technical Improvements

#### State Management
- Added `pdfPreviewDialog` and `pdfUrl` state variables for PDF preview functionality
- Implemented proper memory management with URL cleanup when dialogs close

#### Helper Functions
- `handleGeneratePdf()`: Creates PDF blob and opens preview dialog
- `handleDownloadPdf()`: Downloads the previewed PDF file
- `handleClosePdfPreview()`: Closes dialog and cleans up resources

### 📁 Files Modified

#### Backend
- `models/Invoice.js` - Currency symbol conversion
- `models/Payment.js` - Currency symbol conversion
- `models/Product.js` - Currency symbol conversion
- `models/Service.js` - Currency symbol conversion
- `models/TreatmentPlan.js` - Currency symbol conversion
- `controllers/invoiceController.js` - PDF generation currency updates

#### Frontend
- `views/Billing/InvoiceDetail.js` - PDF preview implementation + currency conversion
- `views/Billing/Billing.js` - PDF preview implementation + currency conversion
- `views/Billing/InvoiceForm.js` - Currency symbol updates
- `views/Dashboard/Dashboard.js` - Revenue display currency conversion
- `views/Analytics/Analytics.js` - Chart and metrics currency conversion
- `views/Patients/PatientDetail.js` - Invoice amount currency conversion
- `views/Appointments/AppointmentForm.js` - Service price currency conversion
- `views/Products/ProductForm.js` - Validation message currency update
- `views/Services/ServiceForm.js` - Validation message currency update

### 🎯 User Experience Enhancements

1. **Better PDF Workflow**: Users can now preview invoices before downloading, reducing unnecessary downloads
2. **Localized Currency**: All monetary values now display in Indian Rupees (₹) for better regional relevance
3. **Consistent Interface**: Unified currency display across all components and views
4. **Improved Accessibility**: Large preview dialogs with clear navigation options

### 🔍 Quality Assurance

- All currency references systematically converted from USD to INR
- PDF preview functionality tested across multiple components
- Memory management implemented to prevent resource leaks
- Consistent state management patterns applied

---

## Previous Releases

For information about previous releases and bug fixes, please refer to the git commit history.