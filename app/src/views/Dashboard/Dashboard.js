import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// API service (placeholder - will be implemented later)
const api = {
  getTodaysAppointments: async () => {
    // Mock data for now
    return {
      success: true,
      data: [
        {
          id: 1,
          appointmentNumber: 'APT-001',
          patientName: 'John Doe',
          time: '09:00',
          service: 'Routine Checkup',
          status: 'scheduled'
        },
        {
          id: 2,
          appointmentNumber: 'APT-002',
          patientName: 'Jane Smith',
          time: '10:30',
          service: 'Teeth Cleaning',
          status: 'in_progress'
        },
        {
          id: 3,
          appointmentNumber: 'APT-003',
          patientName: 'Bob Johnson',
          time: '14:00',
          service: 'Filling',
          status: 'scheduled'
        }
      ]
    };
  },
  getDashboardStats: async () => {
    // Mock data for now
    return {
      success: true,
      data: {
        todaysAppointments: 8,
        totalPatients: 1247,
        monthlyRevenue: 45600,
        completionRate: 94
      }
    };
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
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
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
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Box>
          <IconButton onClick={loadDashboardData} disabled={loading}>
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
                  <Typography variant="h6" component="div">
                    {card.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Today's Appointments */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Today's Appointments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
            
            {todaysAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No appointments scheduled for today
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/appointments/new')}
                  sx={{ mt: 2 }}
                >
                  Schedule Appointment
                </Button>
              </Box>
            ) : (
              <List>
                {todaysAppointments.map((appointment) => (
                  <ListItem
                    key={appointment.id}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {appointment.patientName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {appointment.patientName}
                          </Typography>
                          <Chip
                            label={getStatusLabel(appointment.status)}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.time} - {appointment.service}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.appointmentNumber}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
            
            {todaysAppointments.length > 0 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/appointments')}
                >
                  View All Appointments
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => navigate('/appointments/new')}
              >
                New Appointment
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => navigate('/patients/new')}
              >
                New Patient
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/patients')}
              >
                Search Patients
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/appointments')}
              >
                View Calendar
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;