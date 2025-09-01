import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Button,
  Chip,
  Avatar,
  Stack
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Clear as ClearIcon,
  MarkEmailRead as MarkReadIcon
} from '@mui/icons-material';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

const NotificationCenter = ({ onNotificationClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications data - in real app, this would come from API
  const mockNotifications = [
    {
      id: 1,
      type: 'appointment',
      title: 'Upcoming Appointment',
      message: 'John Doe has an appointment in 30 minutes',
      timestamp: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      actionUrl: '/appointments/123'
    },
    {
      id: 2,
      type: 'reminder',
      title: 'Follow-up Reminder',
      message: 'Schedule follow-up for Sarah Wilson\'s root canal treatment',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      actionUrl: '/patients/456'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of ₹2,500 received from Michael Brown',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low',
      actionUrl: '/billing/789'
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update',
      message: 'SmileSync has been updated to version 2.1.0',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low'
    },
    {
      id: 5,
      type: 'appointment',
      title: 'Appointment Cancelled',
      message: 'Emma Davis cancelled her appointment for tomorrow',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      actionUrl: '/appointments/321'
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (notification.actionUrl && onNotificationClick) {
      onNotificationClick(notification.actionUrl);
    }
    markAsRead(notification.id);
    handleClose();
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (notificationId, event) => {
    event.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconProps = {
      fontSize: 'small',
      sx: {
        color: priority === 'high' ? '#EF4444' :
               priority === 'medium' ? '#F59E0B' : '#6B7280'
      }
    };

    switch (type) {
      case 'appointment':
        return <EventIcon {...iconProps} />;
      case 'reminder':
        return <ScheduleIcon {...iconProps} />;
      case 'payment':
        return <PaymentIcon {...iconProps} />;
      case 'system':
        return <InfoIcon {...iconProps} />;
      default:
        return <NotificationsIcon {...iconProps} />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = parseISO(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#FEE2E2';
      case 'medium':
        return '#FEF3C7';
      case 'low':
        return '#F3F4F6';
      default:
        return '#F3F4F6';
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontWeight: 600
            }
          }}
        >
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid #E5E7EB'
          }
        }}
      >
        <Paper>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #E5E7EB' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
                Notifications
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`${unreadCount} new`}
                  size="small"
                  sx={{
                    backgroundColor: unreadCount > 0 ? '#FEE2E2' : '#F3F4F6',
                    color: unreadCount > 0 ? '#DC2626' : '#6B7280',
                    fontWeight: 500
                  }}
                />
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    startIcon={<MarkReadIcon />}
                    onClick={markAllAsRead}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Mark all read
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>

          {/* Notifications List */}
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <ListItem sx={{ textAlign: 'center', py: 4 }}>
                <ListItemText
                  primary="No notifications"
                  secondary="You're all caught up!"
                  primaryTypographyProps={{
                    sx: { color: '#6B7280', fontWeight: 500 }
                  }}
                  secondaryTypographyProps={{
                    sx: { color: '#9CA3AF' }
                  }}
                />
              </ListItem>
            ) : (
              notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      backgroundColor: !notification.read ? getPriorityColor(notification.priority) : 'transparent',
                      '&:hover': {
                        backgroundColor: !notification.read ? 
                          getPriorityColor(notification.priority) : 
                          'rgba(42, 127, 170, 0.05)'
                      },
                      borderLeft: !notification.read ? `3px solid ${
                        notification.priority === 'high' ? '#EF4444' :
                        notification.priority === 'medium' ? '#F59E0B' : '#6B7280'
                      }` : 'none'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: 'transparent',
                          border: '1px solid #E5E7EB'
                        }}
                      >
                        {getNotificationIcon(notification.type, notification.priority)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: !notification.read ? 600 : 500,
                              color: '#1F2937',
                              lineHeight: 1.3
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: '#6B7280', whiteSpace: 'nowrap' }}
                            >
                              {formatTimestamp(notification.timestamp)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => clearNotification(notification.id, e)}
                              sx={{
                                opacity: 0.6,
                                '&:hover': { opacity: 1 },
                                p: 0.25
                              }}
                            >
                              <ClearIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#6B7280',
                            mt: 0.5,
                            lineHeight: 1.4
                          }}
                        >
                          {notification.message}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                  {index < notifications.length - 1 && (
                    <Divider sx={{ mx: 2 }} />
                  )}
                </React.Fragment>
              ))
            )}
          </List>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
              <Button
                variant="text"
                size="small"
                onClick={handleClose}
                sx={{ color: '#6B7280' }}
              >
                View All Notifications
              </Button>
            </Box>
          )}
        </Paper>
      </Popover>
    </>
  );
};

export default NotificationCenter;