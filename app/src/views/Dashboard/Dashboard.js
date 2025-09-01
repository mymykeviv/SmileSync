import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Paper,
  Divider,
  Stack,
  Menu,
  MenuItem,
  ButtonGroup,
} from '@mui/material';
import MedicalPageHeader from '../../components/Common/MedicalPageHeader';
import MedicalStatusIndicator from '../../components/Common/MedicalStatusIndicator';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  EventNote as CalendarIcon,
  PersonAdd as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  AccessTime as TimeIcon,
  MedicalServices as MedicalIcon,
  Event as EventIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ApiService from '../../services/api';

// API service using real backend endpoints
const api = {
  getTodaysAppointments: async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await ApiService.getAppointments({
        date: today,
        limit: 10
      });
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Failed to load today\'s appointments:', error);
      return { success: false, data: [] };
    }
  },
  getDashboardStats: async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      
      // Use ApiService.request to ensure proper authentication
      const response = await ApiService.request(`/analytics/dashboard?startDate=${startOfMonth}&endDate=${today}`);
      return {
        success: true,
        data: {
          todaysAppointments: response.overview?.totalAppointments || 0,
          totalPatients: response.overview?.totalPatients || 0,
          monthlyRevenue: response.overview?.totalRevenue || 0,
          completionRate: response.overview?.appointmentCompletionRate || 0
        }
      };
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      return {
        success: false,
        data: {
          todaysAppointments: 0,
          totalPatients: 0,
          monthlyRevenue: 0,
          completionRate: 0
        }
      };
    }
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    totalPatients: 0,
    monthlyRevenue: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleDropdownClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleDropdownClose();
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsResponse, statsResponse] = await Promise.all([
        api.getTodaysAppointments(),
        api.getDashboardStats()
      ]);
      
      if (appointmentsResponse.success) {
        setTodaysAppointments(appointmentsResponse.data);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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
      default:
        return status;
    }
  };

  const statCards = [
    {
      title: "Today's Appointments",
      value: stats.todaysAppointments,
      icon: <CalendarIcon />,
      color: '#1976d2',
      action: () => navigate('/appointments')
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients.toLocaleString(),
      icon: <PeopleIcon />,
      color: '#388e3c',
      action: () => navigate('/patients')
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: <MoneyIcon />,
      color: '#f57c00',
      action: () => navigate('/billing')
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: <TrendingUpIcon />,
      color: '#7b1fa2',
      action: () => navigate('/analytics')
    }
  ];

  return (
    <Box>
      {/* Medical Page Header */}
      <MedicalPageHeader
        title="Clinical Dashboard"
        subtitle="Real-time overview of your dental practice operations and patient care metrics"
        icon={DashboardIcon}
        status="Live"
        showRefresh={true}
        onRefresh={loadDashboardData}
        gradient={false}
        actions={[
          <ButtonGroup key="quick-actions" variant="contained" sx={{ ml: 1 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={() => navigate('/appointments/new')}
            >
              New Appointment
            </Button>
            <Button
              size="small"
              onClick={handleDropdownClick}
              sx={{ px: 1 }}
            >
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>,
          <Menu
            key="quick-actions-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleDropdownClose}
            MenuListProps={{
              'aria-labelledby': 'split-button',
            }}
          >
            <MenuItem onClick={() => handleMenuItemClick('/patients/new')}>
              <PeopleIcon sx={{ mr: 1 }} />
              New Patient
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('/patients')}>
              <SearchIcon sx={{ mr: 1 }} />
              Search Patients
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('/appointments')}>
              <CalendarIcon sx={{ mr: 1 }} />
              View Calendar
            </MenuItem>
          </Menu>
        ]}
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
              onClick={card.action}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: card.color, mr: 2 }}>
                    {card.icon}
                  </Avatar>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#1F2937' }}>
                    {card.value}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500 }}>
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Widget and Appointment Timeline */}
      <Grid container spacing={3}>
        {/* Calendar Widget */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                Calendar
              </Typography>
              <Box>
                <IconButton size="small" onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}>
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton size="small" onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}>
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center', fontWeight: 600, color: '#1F2937' }}>
              {format(selectedDate, 'MMMM yyyy')}
            </Typography>
            
            {/* Mini Calendar Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 2 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Typography key={day} variant="caption" sx={{ textAlign: 'center', fontWeight: 600, color: '#374151', fontSize: '0.75rem' }}>
                  {day}
                </Typography>
              ))}
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {Array.from({ length: 35 }, (_, i) => {
                const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                const startOfCalendar = new Date(startOfMonth);
                startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay());
                const currentDate = new Date(startOfCalendar);
                currentDate.setDate(currentDate.getDate() + i);
                
                const isCurrentMonth = currentDate.getMonth() === selectedDate.getMonth();
                const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const hasAppointments = Math.random() > 0.7; // Mock data for demonstration
                
                return (
                  <Box
                    key={i}
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 1,
                      position: 'relative',
                      backgroundColor: isToday ? 'primary.main' : 'transparent',
                      color: isToday ? 'white' : isCurrentMonth ? 'text.primary' : 'text.disabled',
                      '&:hover': {
                        backgroundColor: isToday ? 'primary.dark' : 'action.hover'
                      }
                    }}
                    onClick={() => setSelectedDate(currentDate)}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                      {currentDate.getDate()}
                    </Typography>
                    {hasAppointments && isCurrentMonth && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 2,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: isToday ? 'white' : 'primary.main'
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<EventIcon />}
              onClick={() => navigate('/appointments')}
            >
              View Full Calendar
            </Button>
          </Paper>
        </Grid>
        
        {/* Appointment Timeline */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                Today's Schedule
              </Typography>
              <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500 }}>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
            
            {todaysAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Avatar sx={{ bgcolor: 'primary.light', mx: 'auto', mb: 2, width: 64, height: 64 }}>
                  <CalendarIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No appointments today
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Your schedule is clear for today
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/appointments/new')}
                >
                  Schedule Appointment
                </Button>
              </Box>
            ) : (
              <Timeline position="left">
                {todaysAppointments.map((appointment, index) => (
                  <TimelineItem key={appointment.id}>
                    <TimelineOppositeContent sx={{ m: 'auto 0', minWidth: 80 }}>
                      <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500 }}>
                        {appointment.time || '10:00 AM'}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot 
                        sx={{ 
                          bgcolor: getStatusColor(appointment.status) === 'success' ? 'success.main' :
                                  getStatusColor(appointment.status) === 'warning' ? 'warning.main' :
                                  getStatusColor(appointment.status) === 'error' ? 'error.main' : 'primary.main'
                        }}
                      >
                        <MedicalIcon sx={{ fontSize: 16 }} />
                      </TimelineDot>
                      {index < todaysAppointments.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Card 
                        sx={{ 
                          mb: 2, 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            boxShadow: 2
                          }
                        }}
                        onClick={() => navigate(`/appointments/${appointment.id}`)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                              {appointment.patientName || 'Unknown Patient'}
                            </Typography>
                            <MedicalStatusIndicator
                              type="appointment"
                              status={appointment.status}
                              size="small"
                              variant="chip"
                            />
                          </Box>
                          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MedicalIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                              <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500 }}>
                                {appointment.service || 'General Checkup'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TimeIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                              <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500 }}>
                                30 min
                              </Typography>
                            </Box>
                          </Stack>
                          {appointment.appointmentNumber && (
                            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
                              #{appointment.appointmentNumber}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            )}
            
            {todaysAppointments.length > 0 && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/appointments')}
                  startIcon={<CalendarIcon />}
                >
                  View All Appointments
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        

      </Grid>
    </Box>
  );
}

export default Dashboard;