import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  InputAdornment,
  Fab,
  Avatar,
  CardActions,
  Divider,
  Stack,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonIcon,
  AccessTime as AccessTimeIcon,
  MedicalServices as MedicalServicesIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import ApiService from '../../services/api';

function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const formatAppointmentDate = (date) => {
    if (!date) return 'Invalid Date';
    try {
      return format(parseISO(date), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return 'Invalid Date';
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await ApiService.getAppointments(params);
      if (response.success) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [page, rowsPerPage, searchTerm, selectedDate, statusFilter]);

  const handleMenuOpen = (event, appointment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleEdit = () => {
    navigate(`/appointments/${selectedAppointment.id}/edit`);
    handleMenuClose();
  };

  const handleCancel = () => {
    setCancelDialog(true);
    // Don't close menu yet - keep selectedAppointment for cancel confirmation
  };

  const handleComplete = async () => {
    try {
      await ApiService.completeAppointment(selectedAppointment.id, 'Completed from appointments list');
      loadAppointments();
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
    handleMenuClose();
  };

  const handleCancelDialogClose = () => {
    setCancelDialog(false);
    setCancelReason('');
    handleMenuClose();
  };

  const handleCancelConfirm = async () => {
    try {
      await ApiService.cancelAppointment(selectedAppointment.id, cancelReason);
      setCancelDialog(false);
      setCancelReason('');
      handleMenuClose(); // Close menu after successful cancellation
      loadAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no_show':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'no_show':
        return 'No Show';
      default:
        return status;
    }
  };

  // Note: Date and status filtering is already handled by the API in loadAppointments
  // Only apply client-side search filtering here to avoid double filtering
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchTerm || 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Appointments
        </Typography>
        <Box>
          <IconButton onClick={loadAppointments} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appointments/new')}
            sx={{ ml: 1 }}
          >
            New Appointment
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search appointments..."
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
              <DatePicker
                label="Filter by Date"
                value={selectedDate}
                onChange={setSelectedDate}
                slots={{
                  textField: TextField
                }}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="no_show">No Show</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDate(null);
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Appointments Cards */}
      <Grid container spacing={3}>
        {filteredAppointments
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((appointment) => (
            <Grid item xs={12} md={6} lg={4} key={appointment.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  {/* Header with appointment number and status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      #{appointment.appointmentNumber}
                    </Typography>
                    <Chip
                      label={getStatusLabel(appointment.status)}
                      color={getStatusColor(appointment.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>

                  {/* Patient Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 40, height: 40 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600,
                          cursor: 'pointer', 
                          color: 'text.primary',
                          '&:hover': { color: 'primary.main' }
                        }}
                        onClick={() => navigate(`/patients/${appointment.patientId}`)}
                      >
                        {appointment.patientName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Patient ID: {appointment.patientId}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Date & Time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatAppointmentDate(appointment.date)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.time} ({appointment.duration} min)
                      </Typography>
                    </Box>
                  </Box>

                  {/* Service & Dentist */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MedicalServicesIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {appointment.service}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Dr. {appointment.dentist}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, appointment)}
                    size="small"
                    sx={{ 
                      bgcolor: 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        }
      </Grid>

      {/* Pagination */}
      {filteredAppointments.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredAppointments.length / rowsPerPage)}
            page={page + 1}
            onChange={(e, newPage) => setPage(newPage - 1)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Empty State */}
      {filteredAppointments.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 3 }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No appointments found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || statusFilter !== 'all' || selectedDate 
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by scheduling your first appointment.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appointments/new')}
          >
            Schedule Appointment
          </Button>
        </Paper>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        {selectedAppointment?.status === 'scheduled' && (
          <MenuItem onClick={handleComplete}>
            <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
            Mark Complete
          </MenuItem>
        )}
        {selectedAppointment?.status !== 'cancelled' && selectedAppointment?.status !== 'completed' && (
          <MenuItem onClick={handleCancel}>
            <CancelIcon sx={{ mr: 1 }} fontSize="small" />
            Cancel
          </MenuItem>
        )}
      </Menu>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onClose={handleCancelDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to cancel this appointment?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCancelConfirm} 
            variant="contained" 
            color="error"
            disabled={!cancelReason.trim()}
          >
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add appointment"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/appointments/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default Appointments;