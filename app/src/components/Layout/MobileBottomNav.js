import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocalHospital as DashboardIcon,
  EventNote as CalendarIcon,
  PersonAdd as PeopleIcon,
  Payment as ReceiptIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileBottomNav = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const bottomNavItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      label: 'Appointments',
      icon: <CalendarIcon />,
      path: '/appointments',
    },
    {
      label: 'Patients',
      icon: <PeopleIcon />,
      path: '/patients',
    },
    {
      label: 'Billing',
      icon: <ReceiptIcon />,
      path: '/billing',
    },
    {
      label: 'Menu',
      icon: <MenuIcon />,
      action: 'menu',
    },
  ];

  const getCurrentValue = () => {
    const currentItem = bottomNavItems.find(item => 
      item.path && (location.pathname === item.path || 
      (item.path !== '/' && location.pathname.startsWith(item.path)))
    );
    return currentItem ? bottomNavItems.indexOf(currentItem) : 0;
  };

  const handleChange = (event, newValue) => {
    const selectedItem = bottomNavItems[newValue];
    
    if (selectedItem.action === 'menu') {
      onMenuClick();
    } else if (selectedItem.path) {
      navigate(selectedItem.path);
    }
  };

  if (!isMobile) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        showLabels
        sx={{
          backgroundColor: theme.palette.background.paper,
          '& .MuiBottomNavigationAction-root': {
            color: theme.palette.text.secondary,
            minWidth: 'auto',
            padding: '6px 12px 8px',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            '&.Mui-selected': {
              fontSize: '0.75rem',
            },
          },
        }}
      >
        {bottomNavItems.map((item, index) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;