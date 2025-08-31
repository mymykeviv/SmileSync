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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  InputAdornment,
  Fab,
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
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

// Mock API service
const api = {
  getAppointments: async (params = {}) => {
    // Mock data
    const mockAppointments = [
      {
        id: 1,
        appointmentNumber: 'APT-001',
        patientName: 'John Doe',
        patientId: 1,
        date: '2024-01-15',
        time: '09:00',
        service: 'Routine Checkup',
        dentist: 'Dr. Smith',
        status: 'scheduled',
        duration: 30,
        notes: 'Regular checkup'
      },
      {
        id: 2,
        appointmentNumber: 'APT-002',
        patientName: 'Jane Smith',
        patientId: 2,
        date: '2024-01-15',
        time: '10:30',
        service: 'Teeth Cleaning',
        dentist: 'Dr. Johnson',
        status: 'completed',
        duration: 45,
        notes: 'Deep cleaning completed'
      },
      {
        id: 3,
        appointmentNumber: 'APT-003',
        patientName: 'Bob Johnson',
        patientId: 3,
        date: '2024-01-16',
        time: '14:00',
        service: 'Filling',
        dentist: 'Dr. Smith',
        status: 'scheduled',
        duration: 60,
        notes: 'Cavity filling'
      }
    ];
    
    return {
      success: true,
      data: mockAppointments,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: mockAppointments.length
      }
    };
  },
  
  cancelAppointment: async (id, reason) => {
    return { success: true, message: 'Appointment cancelled successfully' };
  },
  
  completeAppointment: async (id, notes) => {
    return { success: true, message: 'Appointment completed successfully' };
  }
};

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
      
      const response = await api.getAppointments(params);
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
    handleMenuClose();
  };

  const handleComplete = async () => {
    try {
      await api.completeAppointment(selectedAppointment.id, 'Completed from appointments list');
      loadAppointments();
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
    handleMenuClose();
  };

  const handleCancelConfirm = async () => {
    try {
      await api.cancelAppointment(selectedAppointment.id, cancelReason);
      setCancelDialog(false);
      setCancelReason('');
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

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchTerm || 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
                renderInput={(params) => <TextField {...params} fullWidth />}
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

      {/* Appointments Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Appointment #</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Dentist</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((appointment) => (
                <TableRow key={appointment.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {appointment.appointmentNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ cursor: 'pointer', color: 'primary.main' }}
                      onClick={() => navigate(`/patients/${appointment.patientId}`)}
                    >
                      {appointment.patientName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(parseISO(appointment.date), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {appointment.time}
                    </Typography>
                  </TableCell>
                  <TableCell>{appointment.service}</TableCell>
                  <TableCell>{appointment.dentist}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(appointment.status)}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{appointment.duration} min</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, appointment)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAppointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

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
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setCancelDialog(false)}>Cancel</Button>
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