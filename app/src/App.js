import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import Layout from './components/Layout/Layout';
import Dashboard from './views/Dashboard/Dashboard';
import Appointments from './views/Appointments/Appointments';
import AppointmentForm from './views/Appointments/AppointmentForm';
import AppointmentDetail from './views/Appointments/AppointmentDetail';
import Patients from './views/Patients/Patients';
import PatientForm from './views/Patients/PatientForm';
import PatientDetail from './views/Patients/PatientDetail';
import Services from './views/Services/Services';
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

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
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
        <Router>
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
              <Route path="/services/new" element={<ServiceForm />} />
            <Route path="/services/:id/edit" element={<ServiceForm />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
              
              {/* Products */}
              <Route path="/products" element={<Products />} />
              <Route path="/products/settings" element={<CategorySupplierManager />} />
              
              {/* Billing */}
              <Route path="/billing" element={<Billing />} />
              <Route path="/billing/:id" element={<InvoiceDetail />} />
              <Route path="/billing/:id/payment" element={<PaymentForm />} />
              <Route path="/billing/invoices/new" element={<InvoiceForm />} />
              <Route path="/billing/invoices/:id/edit" element={<InvoiceForm />} />
              
              {/* Catalog */}
              <Route path="/catalog" element={<Catalog />} />
              
              {/* Staff */}
              <Route path="/staff" element={<Users />} />
              
              {/* Analytics */}
              <Route path="/analytics" element={<Analytics />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;