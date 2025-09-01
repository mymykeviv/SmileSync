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
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  LocalHospital as MedicalIcon,
  Schedule as ScheduleIcon,
  Payment as ReceiptIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assignment as TreatmentIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  Warning as OverdueIcon,
  Pause as PausedIcon,
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
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      const [patientResponse, appointmentsResponse, invoicesResponse, treatmentPlansResponse] = await Promise.all([
        api.getPatient(id),
        api.getPatientAppointments(id),
        api.getPatientInvoices(id),
        api.getPatientTreatmentPlans(id)
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
      
      if (treatmentPlansResponse.success) {
        setTreatmentPlans(treatmentPlansResponse.data);
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

  const formatDate = (dateString, formatStr = 'MMMM dd, yyyy') => {
    if (!dateString) return 'Not provided';
    try {
      return format(parseISO(dateString), formatStr);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
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

  const getTreatmentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'approved': return 'info';
      case 'draft': return 'default';
      case 'proposed': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTreatmentStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CompletedIcon />;
      case 'in_progress': return <InProgressIcon />;
      case 'approved': return <TreatmentIcon />;
      case 'draft': return <TreatmentIcon />;
      case 'proposed': return <TreatmentIcon />;
      case 'cancelled': return <PausedIcon />;
      default: return <TreatmentIcon />;
    }
  };

  const calculateProgress = (treatmentPlan) => {
    // Mock progress calculation - in real app this would come from backend
    if (treatmentPlan.status === 'completed') return 100;
    if (treatmentPlan.status === 'in_progress') return Math.floor(Math.random() * 80) + 20;
    if (treatmentPlan.status === 'approved') return Math.floor(Math.random() * 30) + 10;
    return 0;
  };

  const isOverdue = (treatmentPlan) => {
    if (!treatmentPlan.target_completion_date) return false;
    const today = new Date();
    const targetDate = new Date(treatmentPlan.target_completion_date);
    return today > targetDate && treatmentPlan.status !== 'completed';
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
          <Button
            variant="text"
            onClick={() => navigate('/patients')}
            sx={{ 
              textDecoration: 'none',
              minWidth: 'auto',
              padding: 0,
              fontSize: 'inherit',
              fontWeight: 'inherit',
              textTransform: 'none',
              color: 'inherit'
            }}
          >
            Patients
          </Button>
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
                  label={`${calculateAge(patient.dateOfBirth) || 'N/A'} years old`}
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
                  <strong>Date of Birth:</strong> {formatDate(patient.dateOfBirth)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Gender:</strong> {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Not specified'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Patient Since:</strong> {formatDate(patient.createdAt)}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Visit:</strong> {patient.lastVisit ? formatDate(patient.lastVisit) : 'Never'}
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
            <Tab label={`Treatment Plans (${treatmentPlans.length})`} />
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
        
        {/* Treatment Plans Tab */}
        {activeTab === 2 && (
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Treatment Plans
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/treatment-plans/new?patientId=${patient.id}`)}
              >
                Create Treatment Plan
              </Button>
            </Box>
            
            {treatmentPlans.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {treatmentPlans.map((plan) => (
                  <Card key={plan.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {getTreatmentStatusIcon(plan.status)}
                          <Typography variant="h6">
                            {plan.name || `Treatment Plan #${plan.id}`}
                          </Typography>
                          <Chip
                            label={plan.status}
                            color={getTreatmentStatusColor(plan.status)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {plan.description || 'No description provided'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Start Date:</strong> {formatDateShort(plan.start_date)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Target Completion:</strong> {formatDateShort(plan.target_completion_date)}
                          </Typography>
                          {plan.estimated_duration && (
                            <Typography variant="body2">
                              <strong>Duration:</strong> {plan.estimated_duration} days
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      {isOverdue(plan) && (
                        <Tooltip title="Treatment plan is overdue">
                          <OverdueIcon color="error" />
                        </Tooltip>
                      )}
                    </Box>
                    
                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {calculateProgress(plan)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={calculateProgress(plan)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: getTreatmentStatusColor(plan.status) === 'success' ? '#10B981' :
                                           getTreatmentStatusColor(plan.status) === 'error' ? '#EF4444' :
                                           getTreatmentStatusColor(plan.status) === 'warning' ? '#F59E0B' :
                                           '#2A7FAA'
                          }
                        }}
                      />
                    </Box>
                    
                    {/* Treatment Items */}
                    {plan.items && plan.items.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Treatment Items ({plan.items.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {plan.items.slice(0, 3).map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: item.completed ? '#10B981' : '#E5E7EB'
                                }}
                              />
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {item.description || `Treatment Item ${index + 1}`}
                              </Typography>
                              {item.completed && (
                                <CompletedIcon sx={{ fontSize: 16, color: '#10B981' }} />
                              )}
                            </Box>
                          ))}
                          {plan.items.length > 3 && (
                            <Typography variant="body2" color="text.secondary" sx={{ pl: 3 }}>
                              +{plan.items.length - 3} more items
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TreatmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No treatment plans created
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/treatment-plans/new?patientId=${patient.id}`)}
                >
                  Create First Treatment Plan
                </Button>
              </Box>
            )}
          </CardContent>
        )}
        
        {/* Invoices Tab */}
        {activeTab === 3 && (
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
                          {formatDateShort(invoice.date)}
                        </TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>₹{invoice.amount.toFixed(2)}</TableCell>
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