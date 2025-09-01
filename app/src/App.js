import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './views/Dashboard/Dashboard';
import Appointments from './views/Appointments/Appointments';
import AppointmentForm from './views/Appointments/AppointmentForm';
import AppointmentDetail from './views/Appointments/AppointmentDetail';
import Patients from './views/Patients/Patients';
import PatientForm from './views/Patients/PatientForm';
import PatientDetail from './views/Patients/PatientDetail';
import Services from './views/Services/Services';
import ServiceDetail from './views/Services/ServiceDetail';
import Products from './views/Products/Products';
import Billing from './views/Billing/Billing';
import InvoiceDetail from './views/Billing/InvoiceDetail';
import InvoiceForm from './views/Billing/InvoiceForm';
import PaymentForm from './views/Billing/PaymentForm';
import ServiceForm from './views/Services/ServiceForm';
import ProductForm from './views/Products/ProductForm';
import CategorySupplierManager from './views/Products/CategorySupplierManager';
import Catalog from './views/Catalog/Catalog';
import Analytics from './views/Analytics/Analytics';
import Users from './views/Users/Users';
import Login from './views/Auth/Login';
import Unauthorized from './views/Auth/Unauthorized';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Theme configuration
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: '#2A7FAA',
      light: '#5BA3C7',
      dark: '#1E5A7A',
    },
    secondary: {
      main: '#4AA98B',
      light: '#7BC4A8',
      dark: '#357A62',
    },
    background: {
      default: '#F4F9F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
    },
    error: {
      main: '#EF4444',
    },
    success: {
      main: '#10B981',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '1.75rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
      lineHeight: 1.2,
      color: '#1F2937',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.5rem',
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
      lineHeight: 1.3,
      color: '#1F2937',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.375rem',
      '@media (min-width:600px)': {
        fontSize: '1.75rem',
      },
      lineHeight: 1.3,
      color: '#1F2937',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
      lineHeight: 1.4,
      color: '#1F2937',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      '@media (min-width:600px)': {
        fontSize: '1.25rem',
      },
      lineHeight: 1.4,
      color: '#1F2937',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
      lineHeight: 1.4,
      color: '#1F2937',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#4B5563',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#6B7280',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: '#1F2937',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: '#4B5563',
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      color: '#6B7280',
      lineHeight: 1.4,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          padding: '16px 24px',
          fontWeight: 500,
          minHeight: '48px',
          '@media (min-width:600px)': {
            padding: '12px 24px',
            minHeight: 'auto',
          },
        },
        sizeSmall: {
          padding: '12px 16px',
          minHeight: '44px',
          '@media (min-width:600px)': {
            padding: '8px 16px',
            minHeight: 'auto',
          },
        },
        sizeLarge: {
          padding: '20px 32px',
          minHeight: '56px',
          '@media (min-width:600px)': {
            padding: '16px 32px',
            minHeight: 'auto',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            minHeight: '48px',
            '@media (min-width:600px)': {
              minHeight: 'auto',
            },
            '& fieldset': {
              borderColor: '#CBD5E1',
            },
            '&:hover fieldset': {
              borderColor: '#2A7FAA',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2A7FAA',
              borderWidth: '2px',
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '16px 14px',
            '@media (min-width:600px)': {
              padding: '12px 14px',
            },
            '&::placeholder': {
              color: '#6B7280',
              opacity: 1,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#1F2937',
            fontSize: '14px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: '#2A7FAA',
          color: '#FFFFFF',
        },
        colorSecondary: {
          backgroundColor: '#4AA98B',
          color: '#FFFFFF',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: '#F0FDF4',
          color: '#166534',
          border: '1px solid #BBF7D0',
        },
        standardError: {
          backgroundColor: '#FEF2F2',
          color: '#991B1B',
          border: '1px solid #FECACA',
        },
        standardWarning: {
          backgroundColor: '#FFFBEB',
          color: '#92400E',
          border: '1px solid #FED7AA',
        },
        standardInfo: {
          backgroundColor: '#EFF6FF',
          color: '#1E40AF',
          border: '1px solid #BFDBFE',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1F2937',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F9FAFB',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#374151',
            borderBottom: '2px solid #E5E7EB',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#F9FAFB',
          },
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            '& .MuiTable-root': {
              minWidth: '100%',
            },
            '& .MuiTableCell-root': {
              padding: '8px 4px',
              fontSize: '0.875rem',
            },
            '& .MuiTableCell-head': {
              fontSize: '0.75rem',
              fontWeight: 600,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          '@media (max-width:600px)': {
            margin: '8px 0',
            borderRadius: 6,
          },
        },
       },
     },
     MuiDialog: {
       styleOverrides: {
         paper: {
           '@media (max-width:600px)': {
             margin: 8,
             width: 'calc(100% - 16px)',
             maxHeight: 'calc(100% - 16px)',
           },
         },
       },
     },
     MuiDialogTitle: {
       styleOverrides: {
         root: {
           '@media (max-width:600px)': {
             padding: '16px',
             fontSize: '1.125rem',
           },
         },
       },
     },
     MuiDialogContent: {
       styleOverrides: {
         root: {
           '@media (max-width:600px)': {
             padding: '8px 16px',
           },
         },
       },
     },
     MuiDialogActions: {
       styleOverrides: {
         root: {
           '@media (max-width:600px)': {
             padding: '8px 16px 16px',
             '& .MuiButton-root': {
               minWidth: '100px',
             },
           },
         },
       },
     },
   },
 });

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      {/* Dashboard */}
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Navigate to="/" replace />} />
                      
                      {/* Appointments */}
                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="/appointments/new" element={<AppointmentForm />} />
                      <Route path="/appointments/:id" element={<AppointmentDetail />} />
                      <Route path="/appointments/:id/edit" element={<AppointmentForm />} />
                      
                      {/* Patients */}
                      <Route path="/patients" element={<Patients />} />
                      <Route path="/patients/new" element={<PatientForm />} />
                      <Route path="/patients/:id/edit" element={<PatientForm />} />
                      <Route path="/patients/:id" element={<PatientDetail />} />
                      
                      {/* Services */}
                      <Route path="/services" element={<Services />} />
                      <Route path="/services/new" element={
                        <ProtectedRoute requiredPermission="create_services">
                          <ServiceForm />
                        </ProtectedRoute>
                      } />
                      <Route path="/services/:id" element={<ServiceDetail />} />
                      <Route path="/services/:id/edit" element={
                        <ProtectedRoute requiredPermission="edit_services">
                          <ServiceForm />
                        </ProtectedRoute>
                      } />
                      
                      {/* Products */}
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/new" element={
                        <ProtectedRoute requiredPermission="create_products">
                          <ProductForm />
                        </ProtectedRoute>
                      } />
                      <Route path="/products/:id/edit" element={
                        <ProtectedRoute requiredPermission="edit_products">
                          <ProductForm />
                        </ProtectedRoute>
                      } />
                      <Route path="/products/settings" element={
                        <ProtectedRoute requiredRole="admin">
                          <CategorySupplierManager />
                        </ProtectedRoute>
                      } />
                      
                      {/* Billing */}
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/billing/:id" element={<InvoiceDetail />} />
                      <Route path="/billing/:id/payment" element={<PaymentForm />} />
                      <Route path="/billing/invoices/new" element={
                        <ProtectedRoute requiredPermission="create_invoices">
                          <InvoiceForm />
                        </ProtectedRoute>
                      } />
                      <Route path="/billing/invoices/:id/edit" element={
                        <ProtectedRoute requiredPermission="edit_invoices">
                          <InvoiceForm />
                        </ProtectedRoute>
                      } />
                      
                      {/* Catalog */}
                      <Route path="/catalog" element={<Catalog />} />
                      
                      {/* Staff - Admin only */}
                      <Route path="/staff" element={
                        <ProtectedRoute requiredRole="admin">
                          <Users />
                        </ProtectedRoute>
                      } />
                      
                      {/* Analytics */}
                      <Route path="/analytics" element={<Analytics />} />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;