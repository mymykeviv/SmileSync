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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  MedicalServices as ServicesIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';

// API service using correct ApiService methods
const api = {
  getServices: (params = {}) => ApiService.getServices(params),
  getServiceCategories: () => ApiService.request('/services/categories'),
  deleteService: (id) => ApiService.deleteService(id),
  toggleServiceStatus: (id) => ApiService.request(`/services/${id}/status`, { method: 'PATCH' }),
  createService: (data) => ApiService.createService(data),
  updateService: (id, data) => ApiService.updateService(id, data),
  getServiceById: (id) => ApiService.getService(id)
};

function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, service: null });
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const loadServices = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        limit: 10
      };
      
      const response = await api.getServices(params);
      if (response.success) {
        setServices(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.getServiceCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadServices();
  }, [searchTerm, categoryFilter, statusFilter]);

  const handlePageChange = (event, page) => {
    loadServices(page);
  };

  const handleMenuOpen = (event, service) => {
    setAnchorEl(event.currentTarget);
    setSelectedService(service);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedService(null);
  };

  const handleDeleteService = async () => {
    try {
      const response = await api.deleteService(deleteDialog.service.id);
      if (response.success) {
        setDeleteDialog({ open: false, service: null });
        loadServices(pagination.currentPage);
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      const response = await api.toggleServiceStatus(service.id);
      if (response.success) {
        loadServices(pagination.currentPage);
      }
    } catch (error) {
      console.error('Failed to update service status:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Services
        </Typography>
        <Box>
          <IconButton onClick={() => loadServices(pagination.currentPage)}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/services/new')}
            sx={{ ml: 1 }}
          >
            New Service
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search services..."
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
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                disabled={!searchTerm && !categoryFilter && !statusFilter}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} hover>
                  <TableCell>
                    <Box>
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        sx={{ cursor: 'pointer', color: 'primary.main' }}
                        onClick={() => navigate(`/services/${service.id}`)}
                      >
                        {service.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {service.serviceCode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {service.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.category}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {formatPrice(service.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDuration(service.duration)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={service.isActive ? 'success' : 'default'}
                      variant={service.isActive ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/services/${service.id}`)}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/services/${service.id}/edit`)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, service)}
                        title="More Actions"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
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
        {services.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ServicesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No services found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || categoryFilter || statusFilter ? 'Try adjusting your search or filters' : 'Get started by adding your first service'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/services/new')}
            >
              Add Service
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
            handleToggleStatus(selectedService);
            handleMenuClose();
          }}
        >
          {selectedService?.isActive ? 'Deactivate' : 'Activate'} Service
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/services/${selectedService?.id}/duplicate`);
            handleMenuClose();
          }}
        >
          Duplicate Service
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialog({ open: true, service: selectedService });
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          Delete Service
        </MenuItem>
      </Menu>

      {/* Delete Service Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, service: null })}>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete "{deleteDialog.service?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. This service will be removed from all treatment plans and invoices.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, service: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteService}
            color="error"
            variant="contained"
          >
            Delete Service
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add service"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/services/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default Services;