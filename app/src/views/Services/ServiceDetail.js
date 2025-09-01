import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  MedicalServices as ServicesIcon,
  Schedule as ScheduleIcon,
  AttachMoney as PriceIcon,
  Category as CategoryIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import ApiService from '../../services/api';

function ServiceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getService(id);
      if (response.success && response.data) {
        setService(response.data);
      } else {
        setError('Failed to load service details.');
      }
    } catch (error) {
      console.error('Failed to load service:', error);
      setError('Failed to load service details.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/services/${id}/edit`);
    handleMenuClose();
  };

  const handleDuplicate = () => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate service:', service);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await ApiService.deleteService(id);
        if (response.success) {
          navigate('/services');
        } else {
          setError('Failed to delete service.');
        }
      } catch (error) {
        console.error('Failed to delete service:', error);
        setError('Failed to delete service.');
      }
    }
    handleMenuClose();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/services')}
        >
          Back to Services
        </Button>
      </Box>
    );
  }

  if (!service) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Service not found.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/services')}
        >
          Back to Services
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/services" color="inherit">
          Services
        </Link>
        <Typography color="text.primary">
          {service.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/services')}
            sx={{ mr: 2 }}
          >
            <BackIcon />
          </IconButton>
          <ServicesIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              {service.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Service Code: {service.serviceCode || 'N/A'}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Service Details */}
      <Grid container spacing={3}>
        {/* Main Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ServicesIcon />
                Service Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Category</Typography>
                    <Chip
                      label={service.category}
                      size="small"
                      variant="outlined"
                      color="primary"
                      icon={<CategoryIcon />}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip
                      label={service.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={service.isActive ? 'success' : 'default'}
                      variant={service.isActive ? 'filled' : 'outlined'}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Base Price</Typography>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriceIcon color="primary" />
                      {formatPrice(service.price)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Duration</Typography>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon color="primary" />
                      {formatDuration(service.duration)}
                    </Typography>
                  </Box>
                </Grid>
                
                {service.description && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {service.description}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  fullWidth
                >
                  Edit Service
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={() => navigate(`/appointments/new?service_id=${service.id}`)}
                  fullWidth
                >
                  Book Appointment
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<DuplicateIcon />}
                  onClick={handleDuplicate}
                  fullWidth
                >
                  Duplicate Service
                </Button>
              </Box>
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
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Service
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <DuplicateIcon sx={{ mr: 1 }} />
          Duplicate Service
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Service
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default ServiceDetail;