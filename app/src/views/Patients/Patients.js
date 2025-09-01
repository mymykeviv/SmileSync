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
  Avatar,
  Pagination,
  Fab,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Collapse,
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
  PersonAdd as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  MedicalServices as MedicalIcon,
  LocalPharmacy as PharmacyIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInYears } from 'date-fns';
import ApiService from '../../services/api';

function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    ageRange: '',
    gender: '',
    insuranceProvider: '',
    hasAllergies: '',
    hasMedications: '',
    isActive: '',
    lastVisitFrom: '',
    lastVisitTo: ''
  });
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, patient: null });
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const loadPatients = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        search: searchTerm,
        limit: 10
      };
      
      const response = await ApiService.getPatients(params);
      if (response.success) {
        setPatients(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [searchTerm]);

  const handlePageChange = (event, page) => {
    loadPatients(page);
  };

  const handleMenuOpen = (event, patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
  };

  const handleDeletePatient = async () => {
    try {
      const response = await ApiService.deletePatient(deleteDialog.patient.id);
      if (response.success) {
        setDeleteDialog({ open: false, patient: null });
        loadPatients(pagination.currentPage);
      }
    } catch (error) {
      console.error('Failed to delete patient:', error);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    try {
      return differenceInYears(new Date(), parseISO(dateOfBirth));
    } catch (error) {
      return 'N/A';
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return '??';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const formatLastVisit = (lastVisit) => {
    if (!lastVisit) return 'Never';
    try {
      return format(parseISO(lastVisit), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) return 'Not provided';
    try {
      return format(parseISO(dateOfBirth), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getMedicalStatusIndicators = (patient) => {
    const indicators = [];
    
    // Check for allergies
    if (patient.allergies && patient.allergies.trim() !== '') {
      indicators.push({
        label: 'Allergies',
        color: 'warning',
        icon: <WarningIcon sx={{ fontSize: 14 }} />
      });
    }
    
    // Check for medications
    if (patient.medications && patient.medications.trim() !== '') {
      indicators.push({
        label: 'Medications',
        color: 'info',
        icon: <PharmacyIcon sx={{ fontSize: 14 }} />
      });
    }
    
    // Check for medical history
    if (patient.medicalHistory && patient.medicalHistory.trim() !== '') {
      indicators.push({
        label: 'Medical History',
        color: 'secondary',
        icon: <MedicalIcon sx={{ fontSize: 14 }} />
      });
    }
    
    // Active status
    if (patient.isActive) {
      indicators.push({
        label: 'Active',
        color: 'success',
        icon: <CheckCircleIcon sx={{ fontSize: 14 }} />
      });
    }
    
    return indicators;
  };

  const getPatientStatusColor = (patient) => {
    if (!patient.isActive) return 'error';
    if (patient.allergies && patient.allergies.trim() !== '') return 'warning';
    return 'success';
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      ageRange: '',
      gender: '',
      insuranceProvider: '',
      hasAllergies: '',
      hasMedications: '',
      isActive: '',
      lastVisitFrom: '',
      lastVisitTo: ''
    });
  };

  const hasActiveFilters = () => {
    return searchTerm || Object.values(filters).some(value => value !== '');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Patients
        </Typography>
        <Box>
          <IconButton onClick={() => loadPatients(pagination.currentPage)}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/patients/new')}
            sx={{ ml: 1 }}
          >
            New Patient
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search patients by name, email, or phone..."
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
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  endIcon={<FilterIcon />}
                >
                  Advanced Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters()}
                >
                  Clear All
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          <Collapse in={showAdvancedFilters}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Age Range</InputLabel>
                  <Select
                    value={filters.ageRange}
                    label="Age Range"
                    onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                  >
                    <MenuItem value="">All Ages</MenuItem>
                    <MenuItem value="0-17">0-17 years</MenuItem>
                    <MenuItem value="18-30">18-30 years</MenuItem>
                    <MenuItem value="31-50">31-50 years</MenuItem>
                    <MenuItem value="51-70">51-70 years</MenuItem>
                    <MenuItem value="70+">70+ years</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={filters.gender}
                    label="Gender"
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                  >
                    <MenuItem value="">All Genders</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Medical Status</InputLabel>
                  <Select
                    value={filters.hasAllergies}
                    label="Medical Status"
                    onChange={(e) => handleFilterChange('hasAllergies', e.target.value)}
                  >
                    <MenuItem value="">All Patients</MenuItem>
                    <MenuItem value="true">Has Allergies</MenuItem>
                    <MenuItem value="false">No Allergies</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Patient Status</InputLabel>
                  <Select
                    value={filters.isActive}
                    label="Patient Status"
                    onChange={(e) => handleFilterChange('isActive', e.target.value)}
                  >
                    <MenuItem value="">All Patients</MenuItem>
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Last Visit From"
                  type="date"
                  value={filters.lastVisitFrom}
                  onChange={(e) => handleFilterChange('lastVisitFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Last Visit To"
                  type="date"
                  value={filters.lastVisitTo}
                  onChange={(e) => handleFilterChange('lastVisitTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Insurance Provider</InputLabel>
                  <Select
                    value={filters.insuranceProvider}
                    label="Insurance Provider"
                    onChange={(e) => handleFilterChange('insuranceProvider', e.target.value)}
                  >
                    <MenuItem value="">All Providers</MenuItem>
                    <MenuItem value="Blue Cross">Blue Cross</MenuItem>
                    <MenuItem value="Aetna">Aetna</MenuItem>
                    <MenuItem value="Cigna">Cigna</MenuItem>
                    <MenuItem value="UnitedHealth">UnitedHealth</MenuItem>
                    <MenuItem value="Humana">Humana</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Medications</InputLabel>
                  <Select
                    value={filters.hasMedications}
                    label="Medications"
                    onChange={(e) => handleFilterChange('hasMedications', e.target.value)}
                  >
                    <MenuItem value="">All Patients</MenuItem>
                    <MenuItem value="true">Has Medications</MenuItem>
                    <MenuItem value="false">No Medications</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Insurance</TableCell>
                <TableCell>Last Visit</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: `${getPatientStatusColor(patient)}.main`,
                        border: patient.allergies ? '2px solid' : 'none',
                        borderColor: 'warning.main'
                      }}>
                        {getInitials(patient.firstName, patient.lastName)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          sx={{ cursor: 'pointer', color: 'primary.main' }}
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          {patient.firstName} {patient.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {patient.patientNumber}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {getMedicalStatusIndicators(patient).map((indicator, index) => (
                            <Chip
                              key={index}
                              label={indicator.label}
                              color={indicator.color}
                              size="small"
                              icon={indicator.icon}
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.7rem',
                                height: 20,
                                '& .MuiChip-label': { px: 0.5 },
                                '& .MuiChip-icon': { fontSize: 12 }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {patient.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {patient.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {calculateAge(patient.dateOfBirth) || 'N/A'} years
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      DOB: {formatDateOfBirth(patient.dateOfBirth)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {patient.insuranceProvider}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {patient.insurancePolicyNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatLastVisit(patient.lastVisit)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/patients/${patient.id}/edit`)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, patient)}
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
        {patients.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No patients found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first patient'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/patients/new')}
            >
              Add Patient
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
            navigate(`/patients/${selectedPatient?.id}`);
            handleMenuClose();
          }}
        >
          View Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/patients/${selectedPatient?.id}/edit`);
            handleMenuClose();
          }}
        >
          Edit Patient
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/appointments/new?patientId=${selectedPatient?.id}`);
            handleMenuClose();
          }}
        >
          Schedule Appointment
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/patients/${selectedPatient?.id}/appointments`);
            handleMenuClose();
          }}
        >
          View Appointments
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/patients/${selectedPatient?.id}/invoices`);
            handleMenuClose();
          }}
        >
          View Invoices
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialog({ open: true, patient: selectedPatient });
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          Delete Patient
        </MenuItem>
      </Menu>

      {/* Delete Patient Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, patient: null })}>
        <DialogTitle>Delete Patient</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete {deleteDialog.patient?.firstName} {deleteDialog.patient?.lastName}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All associated appointments, invoices, and treatment plans will also be affected.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, patient: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleDeletePatient}
            color="error"
            variant="contained"
          >
            Delete Patient
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add patient"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/patients/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default Patients;