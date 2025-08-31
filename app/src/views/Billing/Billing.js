import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Fab,
  Menu,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Receipt as BillingIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  CheckCircle as PaidIcon,
  Schedule as PendingIcon,
  Cancel as CancelledIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import ApiService from '../../services/ApiService';

function Billing() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, invoice: null });
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        search: searchTerm,
        status: statusFilter,
        dateRange: dateFilter,
        limit: 10
      };
      
      const response = await ApiService.getInvoices(params);
      if (response.success) {
        setInvoices(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [searchTerm, statusFilter, dateFilter]);

  const handlePageChange = (event, page) => {
    loadInvoices(page);
  };

  const handleMenuOpen = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleDeleteInvoice = async () => {
    try {
      const response = await ApiService.deleteInvoice(deleteDialog.invoice.id);
      if (response.success) {
        setDeleteDialog({ open: false, invoice: null });
        loadInvoices(pagination.currentPage);
      }
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  };

  const handleSendInvoice = async (invoice) => {
    try {
      const response = await ApiService.sendInvoice(invoice.id);
      if (response.success) {
        // Show success message
        console.log('Invoice sent successfully');
      }
    } catch (error) {
      console.error('Failed to send invoice:', error);
    }
  };

  const handleGeneratePdf = async (invoice) => {
    try {
      const response = await ApiService.generatePdf(invoice.id);
      if (response.success) {
        // Show success message or download PDF
        console.log('PDF generated successfully');
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusConfig = (status) => {
    const configs = {
      paid: { label: 'Paid', color: 'success', icon: <PaidIcon fontSize="small" /> },
      pending: { label: 'Pending', color: 'warning', icon: <PendingIcon fontSize="small" /> },
      overdue: { label: 'Overdue', color: 'error', icon: <WarningIcon fontSize="small" /> },
      partial: { label: 'Partial', color: 'info', icon: <PaymentIcon fontSize="small" /> },
      cancelled: { label: 'Cancelled', color: 'default', icon: <CancelledIcon fontSize="small" /> }
    };
    return configs[status] || configs.pending;
  };

  const getDaysOverdue = (dueDate, status) => {
    if (status !== 'overdue') return 0;
    return differenceInDays(new Date(), parseISO(dueDate));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
  };

  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const totalOutstanding = invoices.reduce((sum, inv) => {
    if (inv.status !== 'paid' && inv.status !== 'cancelled') {
      return sum + inv.balanceAmount;
    }
    return sum;
  }, 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Billing & Invoices
        </Typography>
        <Box>
          <IconButton onClick={() => loadInvoices(pagination.currentPage)}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/billing/invoices/new')}
            sx={{ ml: 1 }}
          >
            New Invoice
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Outstanding
              </Typography>
              <Typography variant="h4" color="error.main">
                {formatCurrency(totalOutstanding)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Overdue Invoices
              </Typography>
              <Typography variant="h4" color="error.main">
                {overdueInvoices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Pending Invoices
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingInvoices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Invoices
              </Typography>
              <Typography variant="h4" color="primary.main">
                {invoices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {overdueInvoices.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{overdueInvoices.length}</strong> invoice(s) are overdue. Total overdue amount: <strong>{formatCurrency(overdueInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0))}</strong>
          </Typography>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by invoice number or patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date Range"
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="">All Dates</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="this_week">This Week</MenuItem>
                  <MenuItem value="this_month">This Month</MenuItem>
                  <MenuItem value="last_month">Last Month</MenuItem>
                  <MenuItem value="this_year">This Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                disabled={!searchTerm && !statusFilter && !dateFilter}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => {
                const statusConfig = getStatusConfig(invoice.status);
                const daysOverdue = getDaysOverdue(invoice.dueDate, invoice.status);
                
                return (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        sx={{ cursor: 'pointer', color: 'primary.main' }}
                        onClick={() => navigate(`/billing/${invoice.id}`)}
                      >
                        {invoice.invoiceNumber}
                      </Typography>
                      {invoice.items.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {invoice.items.length} item(s)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ cursor: 'pointer', color: 'primary.main' }}
                        onClick={() => navigate(`/patients/${invoice.patientId}`)}
                      >
                        {invoice.patientName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(parseISO(invoice.issueDate), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(parseISO(invoice.dueDate), 'MMM dd, yyyy')}
                      </Typography>
                      {daysOverdue > 0 && (
                        <Typography variant="caption" color="error.main">
                          {daysOverdue} days overdue
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(invoice.total)}
                      </Typography>
                      {invoice.balanceAmount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Balance: {formatCurrency(invoice.balanceAmount)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        size="small"
                        color={statusConfig.color}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/billing/${invoice.id}`)}
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/billing/${invoice.id}/edit`)}
                          title="Edit"
                          disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, invoice)}
                          title="More Actions"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
        
        {/* Empty State */}
        {invoices.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BillingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No invoices found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || statusFilter || dateFilter ? 'Try adjusting your search or filters' : 'Get started by creating your first invoice'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/billing/invoices/new')}
            >
              Create Invoice
            </Button>
          </Box>
        )}
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleGeneratePdf(selectedInvoice);
            handleMenuClose();
          }}
        >
          <PdfIcon sx={{ mr: 1 }} />
          Download PDF
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/billing/invoices/${selectedInvoice?.id}/edit`);
            handleMenuClose();
          }}
          disabled={selectedInvoice?.status === 'paid' || selectedInvoice?.status === 'cancelled'}
        >
          <EditIcon sx={{ mr: 1 }} />
          Edit Invoice
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleSendInvoice(selectedInvoice);
            handleMenuClose();
          }}
          disabled={selectedInvoice?.status === 'cancelled'}
        >
          <EmailIcon sx={{ mr: 1 }} />
          Send Invoice
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/billing/${selectedInvoice?.id}/payment`);
            handleMenuClose();
          }}
          disabled={selectedInvoice?.status === 'paid' || selectedInvoice?.status === 'cancelled'}
        >
          <PaymentIcon sx={{ mr: 1 }} />
          Record Payment
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            navigate(`/billing/${selectedInvoice?.id}/duplicate`);
            handleMenuClose();
          }}
        >
          Duplicate Invoice
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialog({ open: true, invoice: selectedInvoice });
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
          disabled={selectedInvoice?.status === 'paid'}
        >
          Delete Invoice
        </MenuItem>
      </Menu>

      {/* Delete Invoice Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, invoice: null })}>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete invoice "{deleteDialog.invoice?.invoiceNumber}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All associated payment records will also be affected.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, invoice: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteInvoice}
            color="error"
            variant="contained"
          >
            Delete Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="create invoice"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/billing/invoices/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default Billing;