import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  Payment as PaymentIcon,
  FileCopy as DuplicateIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  ReportProblem as WarningIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import ApiService from '../../services/api';

function InvoiceDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const [pdfPreviewDialog, setPdfPreviewDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getInvoice(id);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error loading invoice:', error);
      setError('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: { label: 'Draft', color: 'default', icon: <ScheduleIcon /> },
      sent: { label: 'Sent', color: 'info', icon: <CheckIcon /> },
      pending: { label: 'Pending', color: 'warning', icon: <ScheduleIcon /> },
      paid: { label: 'Paid', color: 'success', icon: <CheckIcon /> },
      overdue: { label: 'Overdue', color: 'error', icon: <WarningIcon /> },
      cancelled: { label: 'Cancelled', color: 'default', icon: <CancelIcon /> },
    };
    return configs[status] || configs.draft;
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₹0.00';
    }
    return `₹${Number(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleBackNavigation = () => {
    // Check if we came from a patient details page
    const fromPatient = location.state?.fromPatient;
    const patientId = location.state?.patientId || invoice?.patientId;
    
    if (fromPatient && patientId) {
      navigate(`/patients/${patientId}`);
    } else {
      navigate('/billing');
    }
  };

  const getDaysOverdue = (dueDate, status) => {
    if (status !== 'overdue') return 0;
    try {
      return differenceInDays(new Date(), new Date(dueDate));
    } catch (error) {
      return 0;
    }
  };

  const handleGeneratePdf = async () => {
    try {
      const response = await ApiService.generatePdf(invoice.id);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfPreviewDialog(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClosePdfPreview = () => {
    setPdfPreviewDialog(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };



  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading invoice details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={handleBackNavigation}
        >
          Back
        </Button>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Invoice not found</Typography>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={handleBackNavigation}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </Box>
    );
  }

  const statusConfig = getStatusConfig(invoice.status);
  const daysOverdue = getDaysOverdue(invoice.dueDate, invoice.status);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBackNavigation} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {invoice.invoiceNumber}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Chip
                icon={statusConfig.icon}
                label={statusConfig.label}
                color={statusConfig.color}
                variant="outlined"
              />
              {invoice.status === 'overdue' && daysOverdue > 0 && (
                <Typography variant="body2" color="error">
                  {daysOverdue} days overdue
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/billing/invoices/${invoice.id}/edit`)}
            disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={handleGeneratePdf}
          >
            Download PDF
          </Button>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Invoice Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Patient
                  </Typography>
                  <Typography variant="body1">
                    {invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : 'Unknown Patient'}
                  </Typography>
                  {invoice.patient && (
                    <Typography variant="body2" color="text.secondary">
                      {invoice.patient.email}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Issue Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(invoice.invoiceDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(invoice.dueDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Terms
                  </Typography>
                  <Typography variant="body1">
                    {invoice.paymentTerms || 'Net 30'}
                  </Typography>
                </Grid>
                {invoice.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {invoice.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Items
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items && invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.itemName}
                          </Typography>
                          <Chip 
                            label={item.type} 
                            size="small" 
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {item.quantity}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{formatCurrency(invoice.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax ({invoice.taxRate}%):</Typography>
                  <Typography>{formatCurrency(invoice.taxAmount)}</Typography>
                </Box>
                {invoice.discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Discount:</Typography>
                    <Typography>-{formatCurrency(invoice.discountAmount)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">{formatCurrency(invoice.totalAmount)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Amount Paid:</Typography>
                  <Typography>{formatCurrency(invoice.amountPaid)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" color={invoice.balanceDue > 0 ? 'error.main' : 'success.main'}>
                    Balance Due:
                  </Typography>
                  <Typography variant="h6" color={invoice.balanceDue > 0 ? 'error.main' : 'success.main'}>
                    {formatCurrency(invoice.balanceDue)}
                  </Typography>
                </Box>
              </Box>
              
              {invoice.balanceDue > 0 && invoice.status !== 'cancelled' && (
                <Button
                  variant="contained"
                  startIcon={<PaymentIcon />}
                  onClick={() => navigate(`/billing/${invoice.id}/payment`)}
                  fullWidth
                >
                  Record Payment
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {/* Send Invoice option removed */}
        <MenuItem onClick={() => {
          // Handle duplicate invoice
          handleMenuClose();
        }}>
          <DuplicateIcon sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={() => {
          // Handle delete invoice
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>




      
      {/* PDF Preview Dialog */}
      <Dialog
        open={pdfPreviewDialog}
        onClose={handleClosePdfPreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Invoice Preview - {invoice?.invoiceNumber}
            </Typography>
            <Box>
              <Button
                startIcon={<PdfIcon />}
                onClick={handleDownloadPdf}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Download
              </Button>
              <IconButton onClick={handleClosePdfPreview}>
                <CancelIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Invoice PDF Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default InvoiceDetail;