import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LocalHospital as DashboardIcon,
  EventNote as CalendarIcon,
  PersonAdd as PeopleIcon,
  Payment as ReceiptIcon,
  MedicalServices as InventoryIcon,
  Assessment as AnalyticsIcon,
  Badge as StaffIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import NotificationCenter from '../Common/NotificationCenter';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import SmileSyncLogo from './SmileSyncLogo';
import MedicalFooter from './MedicalFooter';
import MobileBottomNav from './MobileBottomNav';

const drawerWidth = 240;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
  },
  {
    text: 'Appointments',
    icon: <CalendarIcon />,
    path: '/appointments',
  },
  {
    text: 'Patients',
    icon: <PeopleIcon />,
    path: '/patients',
  },
  {
    text: 'Billing',
    icon: <ReceiptIcon />,
    path: '/billing',
  },
  {
    text: 'Catalog',
    icon: <InventoryIcon />,
    path: '/catalog',
  },
  {
    text: 'Staff',
    icon: <StaffIcon />,
    path: '/staff',
  },
  {
    text: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    adminOnly: true,
  },
];

function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [clinicConfig, setClinicConfig] = useState({
    clinicName: 'Dental Practice Management',
    clinicSubtitle: 'SmileSync Professional Suite',
    contactPhone: '(555) 123-SMILE',
    clinicAddress: 'Downtown Dental Center',
    practiceName: 'Dr. Smith\'s Practice'
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchClinicConfig = async () => {
      try {
        const response = await ApiService.getClinicConfig();
        if (response.success && response.data) {
          setClinicConfig(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch clinic configuration:', error);
        // Keep default values if fetch fails
      }
    };

    fetchClinicConfig();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleMenuClose();
  };

  const drawer = (
    <div>
      <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
        <SmileSyncLogo variant="full" color="white" size="medium" />
        <Box sx={{ mt: 1, width: '100%' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '0.75rem',
              display: 'block'
            }}
          >
            Professional Dental Care
          </Typography>
          <Chip 
            label="Online" 
            size="small" 
            sx={{ 
              mt: 0.5,
              backgroundColor: '#4AA98B', 
              color: 'white',
              fontSize: '0.7rem',
              height: 20
            }} 
          />
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
      <List sx={{ pt: 1 }}>
        {menuItems
          .filter(item => !item.adminOnly || user?.role === 'admin')
          .map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: '#FFFFFF',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: '#FFFFFF',
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: '#FFFFFF',
          color: '#1F2937',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #E5E7EB'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#1F2937',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {clinicConfig?.clinicName || 'Dental Practice Management'}
              </Typography>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#1F2937',
                  fontSize: '1rem',
                  display: { xs: 'block', sm: 'none' }
                }}
              >
                {clinicConfig?.clinicName?.split(' ')[0] || 'SmileSync'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#6B7280', 
                  fontSize: '0.75rem',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {clinicConfig?.clinicSubtitle || 'SmileSync Professional Suite'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 16, color: '#6B7280' }} />
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                {clinicConfig?.contactPhone || '(555) 123-SMILE'}
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              <LocationIcon sx={{ fontSize: 16, color: '#6B7280' }} />
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                {clinicConfig?.clinicAddress || 'Downtown Dental Center'}
              </Typography>
            </Box>
            <Chip 
              label={clinicConfig?.practiceName || "Dr. Smith's Practice"} 
              size="small" 
              sx={{ 
                backgroundColor: '#2A7FAA', 
                color: 'white',
                fontSize: '0.7rem'
              }} 
            />
            <NotificationCenter 
              onNotificationClick={(url) => navigate(url)}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              <Button
                onClick={handleMenuOpen}
                startIcon={
                  <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </Avatar>
                }
                sx={{
                  color: '#1F2937',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                    {user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username || 'User'
                    }
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', lineHeight: 1 }}>
                    {user?.role || 'Staff'}
                  </Typography>
                </Box>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleMenuClose}>
                  <AccountIcon sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: theme.palette.primary.main,
              color: '#FFFFFF',
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: theme.palette.primary.main,
              color: '#FFFFFF',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Box sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 3 },
          pb: { xs: 10, md: 3 }
        }}>
          {children}
        </Box>
        <MedicalFooter />
      </Box>
      <MobileBottomNav onMenuClick={handleDrawerToggle} />
    </Box>
  );
}

export default Layout;