import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import ApiService from '../../services/api';

function InvoiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    items: [],
    notes: '',
    taxRate: 8.0, // Default tax rate
  });
  const [errors, setErrors] = useState({});
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'service', // 'service' or 'product'
    itemId: '',
    itemName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
  });

  useEffect(() => {
    loadInitialData();
    if (isEditing) {
      loadInvoice();
    }
  }, [id, isEditing]);

  const loadInitialData = async () => {
    try {
      const [patientsResponse, servicesResponse, productsResponse] = await Promise.all([
        ApiService.getPatients({ limit: 1000 }),
        ApiService.getServices({ limit: 1000, status: 'active' }),
        ApiService.getProducts({ limit: 1000 })
      ]);

      if (patientsResponse.success) setPatients(patientsResponse.data);
      if (servicesResponse.success) setServices(servicesResponse.data);
      if (productsResponse.success) setProducts(productsResponse.data);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getInvoice(id);
      if (response.success) {
        const invoice = response.data;
        setFormData({
          patientId: invoice.patientId || '',
          issueDate: invoice.issueDate ? format(new Date(invoice.issueDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          dueDate: invoice.dueDate ? format(new Date(invoice.dueDate), 'yyyy-MM-dd') : format(addDays(new Date(), 30), 'yyyy-MM-dd'),
          items: invoice.items || [],
          notes: invoice.notes || '',
          taxRate: invoice.taxRate || 8.0,
        });
      }
    } catch (error) {
      console.error('Failed to load invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Ensure value is never undefined to prevent controlled/uncontrolled input warnings
    const safeValue = value === undefined ? '' : value;
    setFormData(prev => ({ ...prev, [field]: safeValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAddItem = () => {
    const selectedItem = newItem.type === 'service' 
      ? services.find(s => s.id === newItem.itemId)
      : products.find(p => p.id === newItem.itemId);

    if (!selectedItem) return;

    const item = {
      id: Date.now(), // Temporary ID for frontend
      type: newItem.type,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      description: newItem.description || selectedItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice || selectedItem.price,
      total: newItem.quantity * (newItem.unitPrice || selectedItem.price)
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({
      type: 'service',
      itemId: '',
      itemName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
    });
    setShowAddItemDialog(false);
  };

  const handleRemoveItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleItemQuantityChange = (itemId, quantity) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, quantity, total: quantity * item.unitPrice }
          : item
      )
    }));
  };

  const handleItemPriceChange = (itemId, unitPrice) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, unitPrice, total: item.quantity * unitPrice }
          : item
      )
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (formData.taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }
    
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    } else {
      const issueDate = new Date(formData.issueDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Allow until end of today
      if (issueDate > today) {
        newErrors.issueDate = 'Issue date cannot be in the future';
      }
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const dueDate = new Date(formData.dueDate);
      const issueDate = new Date(formData.issueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      } else if (formData.issueDate && dueDate < issueDate) {
        newErrors.dueDate = 'Due date cannot be before issue date';
      }
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      // Validate each item
      const itemErrors = [];
      formData.items.forEach((item, index) => {
        const itemError = {};
        
        if (!item.description || !item.description.trim()) {
          itemError.description = 'Item description is required';
        } else if (item.description.length > 500) {
          itemError.description = 'Item description must be less than 500 characters';
        }
        
        if (!item.quantity || item.quantity <= 0) {
          itemError.quantity = 'Quantity must be greater than 0';
        } else if (item.quantity > 9999) {
          itemError.quantity = 'Quantity cannot exceed 9,999';
        }
        
        if (!item.unitPrice || item.unitPrice <= 0) {
          itemError.unitPrice = 'Unit price must be greater than 0';
        } else if (item.unitPrice > 999999.99) {
          itemError.unitPrice = 'Unit price cannot exceed ₹999,999.99';
        }
        
        if (Object.keys(itemError).length > 0) {
          itemErrors[index] = itemError;
        }
      });
      
      if (itemErrors.length > 0) {
        newErrors.itemErrors = itemErrors;
      }
    }
    
    // Tax rate validation
    if (formData.taxRate < 0 || formData.taxRate > 100) {
      newErrors.taxRate = 'Tax rate must be between 0% and 100%';
    }
    
    // Optional field validations
    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { subtotal, tax, total } = calculateTotals();
      
      const invoiceData = {
        ...formData,
        subtotal,
        tax,
        total,
        status: 'pending'
      };

      const response = isEditing 
        ? await ApiService.updateInvoice(id, invoiceData)
        : await ApiService.createInvoice(invoiceData);

      if (response.success) {
        navigate('/billing');
      }
    } catch (error) {
      console.error('Failed to save invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();
  const availableItems = newItem.type === 'service' ? services : products;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/billing')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Invoice Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Invoice Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.patientId}>
                      <Autocomplete
                        options={patients}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.patientNumber})`}
                        value={patients.find(p => p.id === formData.patientId) || null}
                        onChange={(event, newValue) => {
                          handleInputChange('patientId', newValue ? newValue.id : '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Patient"
                            error={!!errors.patientId}
                            helperText={errors.patientId}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Issue Date"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => handleInputChange('issueDate', e.target.value)}
                      error={!!errors.issueDate}
                      helperText={errors.issueDate}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Due Date"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      error={!!errors.dueDate}
                      helperText={errors.dueDate}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tax Rate (%)"
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                    />
                  </Grid>
                </Grid>
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
                    <Typography>₹{subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tax ({formData.taxRate}%):</Typography>
                    <Typography>₹{tax.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6">₹{total.toFixed(2)}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Invoice Items */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Invoice Items
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddItemDialog(true)}
                  >
                    Add Item
                  </Button>
                </Box>

                {errors.items && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.items}
                  </Alert>
                )}

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {item.itemName}
                              </Typography>
                              <Chip 
                                label={item.type} 
                                size="small" 
                                color={item.type === 'service' ? 'primary' : 'secondary'}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemQuantityChange(item.id, parseInt(e.target.value) || 1)}
                              size="small"
                              inputProps={{ min: 1 }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleItemPriceChange(item.id, parseFloat(e.target.value) || 0)}
                              size="small"
                              inputProps={{ min: 0, step: 0.01 }}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="medium">
                              ₹{item.total.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveItem(item.id)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {formData.items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="text.secondary">
                              No items added yet. Click "Add Item" to get started.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Form Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/billing')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Invoice' : 'Create Invoice')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onClose={() => setShowAddItemDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Invoice Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Item Type</InputLabel>
                <Select
                  value={newItem.type}
                  onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value, itemId: '' }))}
                >
                  <MenuItem value="service">Service</MenuItem>
                  <MenuItem value="product">Product</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  options={availableItems}
                  getOptionLabel={(option) => option.name}
                  value={availableItems.find(item => item.id === newItem.itemId) || null}
                  onChange={(event, newValue) => {
                    setNewItem(prev => ({
                      ...prev,
                      itemId: newValue ? newValue.id : '',
                      itemName: newValue ? newValue.name : '',
                      unitPrice: newValue ? (newValue.price || 0) : 0
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`Select ${newItem.type}`}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddItemDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddItem} 
            variant="contained"
            disabled={!newItem.itemId}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InvoiceForm;