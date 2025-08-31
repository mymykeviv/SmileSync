import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import App from '../../app/src/App';
import theme from '../../app/src/styles/theme';

// Mock services
jest.mock('../../app/src/services/patientService');
jest.mock('../../app/src/services/appointmentService');
jest.mock('../../app/src/services/analyticsService');

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {component}
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('SmileSync App', () => {
  test('renders dashboard by default', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('SmileSync')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('navigation works correctly', async () => {
    renderWithProviders(<App />);
    
    // Test navigation to Patients
    const patientsLink = screen.getByText('Patients');
    fireEvent.click(patientsLink);
    await waitFor(() => {
      expect(window.location.pathname).toBe('/patients');
    });

    // Test navigation to Appointments
    const appointmentsLink = screen.getByText('Appointments');
    fireEvent.click(appointmentsLink);
    await waitFor(() => {
      expect(window.location.pathname).toBe('/appointments');
    });

    // Test navigation to Analytics
    const analyticsLink = screen.getByText('Analytics');
    fireEvent.click(analyticsLink);
    await waitFor(() => {
      expect(window.location.pathname).toBe('/analytics');
    });
  });

  test('responsive layout works', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });
    
    renderWithProviders(<App />);
    expect(screen.getByText('SmileSync')).toBeInTheDocument();
  });
});