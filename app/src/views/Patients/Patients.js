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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInYears } from 'date-fns';
import ApiService from '../../services/ApiService';

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

      {/* Search */}
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
              <Button
                variant="outlined"
                onClick={() => setSearchTerm('')}
                disabled={!searchTerm}
              >
                Clear Search
              </Button>
            </Grid>
          </Grid>
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
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getInitials(patient.firstName, patient.lastName)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          sx={{ cursor: 'pointer', color: 'primary.main' }}
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          {patient.firstName} {patient.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {patient.patientNumber}
                        </Typography>
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
                      {calculateAge(patient.dateOfBirth)} years
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