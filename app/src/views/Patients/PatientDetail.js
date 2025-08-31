import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  IconButton,
  Breadcrumbs,
  Link,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tab,
  Tabs,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  LocalHospital as MedicalIcon,
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO, differenceInYears } from 'date-fns';
import ApiService from '../../services/api';

const api = ApiService;

function PatientDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      const [patientResponse, appointmentsResponse, invoicesResponse] = await Promise.all([
        api.getPatient(id),
        api.getPatientAppointments(id),
        api.getPatientInvoices(id)
      ]);
      
      if (patientResponse.success) {
        setPatient(patientResponse.data);
      } else {
        setError('Patient not found');
      }
      
      if (appointmentsResponse.success) {
        setAppointments(appointmentsResponse.data);
      }
      
      if (invoicesResponse.success) {
        setInvoices(invoicesResponse.data);
      }
    } catch (error) {
      setError('Failed to load patient data');
      console.error('Error loading patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    try {
      const response = await api.deletePatient(id);
      if (response.success) {
        navigate('/patients');
      } else {
        setError('Failed to delete patient');
      }
    } catch (error) {
      setError('Failed to delete patient');
      console.error('Error deleting patient:', error);
    }
    setDeleteDialog(false);
  };

  const calculateAge = (dateOfBirth) => {
    return differenceInYears(new Date(), parseISO(dateOfBirth));
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'scheduled': return 'primary';
      case 'cancelled': return 'error';
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Loading patient data...</Typography>
      </Box>
    );
  }

  if (error || !patient) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error || 'Patient not found'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/patients')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Patients
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate('/patients')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              Patient Details
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}
            >
              Schedule Appointment
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/patients/${patient.id}/edit`)}
            >
              Edit Patient
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialog(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>
        
        <Breadcrumbs>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/patients')}
            sx={{ textDecoration: 'none' }}
          >
            Patients
          </Link>
          <Typography color="text.primary">
            {patient.firstName} {patient.lastName}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Patient Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
            >
              {getInitials(patient.firstName, patient.lastName)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" gutterBottom>
                {patient.firstName} {patient.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Patient ID: {patient.patientNumber}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<PersonIcon />}
                  label={`${calculateAge(patient.dateOfBirth)} years old`}
                  variant="outlined"
                />
                <Chip
                  icon={<EmailIcon />}
                  label={patient.email}
                  variant="outlined"
                />
                <Chip
                  icon={<PhoneIcon />}
                  label={patient.phone}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Personal Information
              </Typography>
              <Box sx={{ ml: 4 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Date of Birth:</strong> {format(parseISO(patient.dateOfBirth), 'MMMM dd, yyyy')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Gender:</strong> {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Not specified'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Patient Since:</strong> {format(parseISO(patient.createdAt), 'MMMM dd, yyyy')}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Visit:</strong> {patient.lastVisit ? format(parseISO(patient.lastVisit), 'MMMM dd, yyyy') : 'Never'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HomeIcon />
                Contact Information
              </Typography>
              <Box sx={{ ml: 4 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Address:</strong> {patient.address || 'Not provided'}
                </Typography>
                {(patient.city || patient.state || patient.zipCode) && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {[patient.city, patient.state, patient.zipCode].filter(Boolean).join(', ')}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Emergency Contact:</strong> {patient.emergencyContactName || 'Not provided'}
                </Typography>
                {patient.emergencyContactPhone && (
                  <Typography variant="body2">
                    <strong>Emergency Phone:</strong> {patient.emergencyContactPhone}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Medical Information" />
            <Tab label={`Appointments (${appointments.length})`} />
            <Tab label={`Invoices (${invoices.length})`} />
          </Tabs>
        </Box>
        
        {/* Medical Information Tab */}
        {activeTab === 0 && (
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MedicalIcon />
                  Insurance Information
                </Typography>
                <Box sx={{ ml: 4 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Provider:</strong> {patient.insuranceProvider || 'Not provided'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Policy Number:</strong> {patient.insurancePolicyNumber || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Group Number:</strong> {patient.insuranceGroupNumber || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Medical History
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  {patient.medicalHistory || 'No medical history recorded.'}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Current Medications
                    </Typography>
                    <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      {patient.medications || 'No current medications.'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Allergies
                    </Typography>
                    <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      {patient.allergies || 'No known allergies.'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        )}
        
        {/* Appointments Tab */}
        {activeTab === 1 && (
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Appointment History
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}
              >
                Schedule Appointment
              </Button>
            </Box>
            
            {appointments.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Provider</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {format(parseISO(appointment.date), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>{appointment.type}</TableCell>
                        <TableCell>{appointment.provider}</TableCell>
                        <TableCell>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{appointment.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No appointments scheduled
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}
                >
                  Schedule First Appointment
                </Button>
              </Box>
            )}
          </CardContent>
        )}
        
        {/* Invoices Tab */}
        {activeTab === 2 && (
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Billing History
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/invoices/new?patientId=${patient.id}`)}
              >
                Create Invoice
              </Button>
            </Box>
            
            {invoices.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          {format(parseISO(invoice.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            color={getStatusColor(invoice.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No invoices created
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/invoices/new?patientId=${patient.id}`)}
                >
                  Create First Invoice
                </Button>
              </Box>
            )}
          </CardContent>
        )}
      </Card>

      {/* Delete Patient Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Patient</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete {patient.firstName} {patient.lastName}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All associated appointments, invoices, and treatment plans will also be affected.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
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
    </Box>
  );
}

export default PatientDetail;