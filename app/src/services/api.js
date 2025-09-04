import { getErrorMessage, getNetworkErrorMessage } from '../utils/errorMapping';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  static authToken = null;

  static setAuthToken(token) {
    this.authToken = token;
  }

  static getAuthToken() {
    return this.authToken || localStorage.getItem('authToken');
  }

  static clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If we can't parse the response, create a generic error
          errorData = { 
            error: 'Network error',
            code: 'NETWORK_ERROR',
            statusCode: response.status 
          };
        }
        
        // Use the error mapping system to get user-friendly messages
        const userFriendlyMessage = getErrorMessage(errorData, response.status);
        
        // Create enhanced error object with both user and technical details
        const enhancedError = new Error(userFriendlyMessage);
        enhancedError.statusCode = response.status;
        enhancedError.originalError = errorData;
        enhancedError.endpoint = endpoint;
        
        throw enhancedError;
      }

      return await response.json();
    } catch (error) {
      // Handle network errors (fetch failures)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = getNetworkErrorMessage(error);
        const enhancedError = new Error(networkError.message);
        enhancedError.isNetworkError = true;
        enhancedError.canRetry = networkError.canRetry;
        enhancedError.retryDelay = networkError.retryDelay;
        enhancedError.originalError = error;
        
        console.error('Network request failed:', error);
        throw enhancedError;
      }
      
      // Re-throw API errors (already processed above)
      if (error.statusCode) {
        console.error('API request failed:', {
          endpoint,
          statusCode: error.statusCode,
          message: error.message,
          originalError: error.originalError
        });
        throw error;
      }
      
      // Handle unexpected errors
      console.error('Unexpected error in API request:', error);
      const fallbackError = new Error('An unexpected error occurred. Please try again.');
      fallbackError.originalError = error;
      throw fallbackError;
    }
  }

  // Patient API methods
  static async getPatients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/patients${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  static async getPatient(id) {
    return this.request(`/patients/${id}`);
  }

  static async createPatient(patientData) {
    return this.request('/patients', {
      method: 'POST',
      body: patientData,
    });
  }

  static async updatePatient(id, patientData) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: patientData,
    });
  }

  static async deletePatient(id) {
    return this.request(`/patients/${id}`, {
      method: 'DELETE',
    });
  }

  static async getPatientAppointments(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/patients/${id}/appointments${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  static async getPatientInvoices(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/patients/${id}/invoices${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  static async getPatientTreatmentPlans(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/patients/${id}/treatment-plans${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  // Appointment API methods
  static async getAppointments(params = {}) {
    // Filter out undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== undefined && value !== null && value !== '')
    );
    const queryString = new URLSearchParams(filteredParams).toString();
    const endpoint = `/appointments${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  static async getAppointment(id) {
    return this.request(`/appointments/${id}`);
  }

  static async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: appointmentData,
    });
  }

  static async updateAppointment(id, appointmentData) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: appointmentData,
    });
  }

  static async deleteAppointment(id) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  static async updateAppointmentStatus(id, status) {
    return this.request(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  static async cancelAppointment(id, reason) {
    return this.request(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: { reason },
    });
  }

  static async completeAppointment(id, notes) {
    return this.request(`/appointments/${id}/complete`, {
      method: 'PATCH',
      body: { notes },
    });
  }

  // Service API methods
  static async getServices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/services${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  static async getService(id) {
    return this.request(`/services/${id}`);
  }

  static async createService(serviceData) {
    return this.request('/services', {
      method: 'POST',
      body: serviceData,
    });
  }

  static async updateService(id, serviceData) {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: serviceData,
    });
  }

  static async deleteService(id) {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Product API methods
  static async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  static async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  static async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: productData,
    });
  }

  static async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
  }

  static async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoice API methods
  static async getInvoices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/invoices${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  static async getInvoice(id) {
    return this.request(`/invoices/${id}`);
  }

  static async createInvoice(invoiceData) {
    return this.request('/invoices', {
      method: 'POST',
      body: invoiceData,
    });
  }

  static async updateInvoice(id, invoiceData) {
    return this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: invoiceData,
    });
  }

  static async deleteInvoice(id) {
    return this.request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  static async generatePdf(id) {
    const url = `${API_BASE_URL}/invoices/${id}/pdf`;
    const token = this.getAuthToken();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.blob();
  }

  static async recordPayment(id, paymentData) {
    return this.request(`/invoices/${id}/payment`, {
      method: 'POST',
      body: paymentData,
    });
  }

  // User API methods
  static async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  static async getUser(id) {
    return this.request(`/users/${id}`);
  }

  static async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: userData,
    });
  }

  static async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  }

  static async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  static async deactivateUser(id) {
    return this.request(`/users/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  static async activateUser(id) {
    return this.request(`/users/${id}/activate`, {
      method: 'PATCH',
    });
  }

  static async updateUserPassword(id, passwordData) {
    return this.request(`/users/${id}/password`, {
      method: 'PUT',
      body: passwordData,
    });
  }

  static async getDentists(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/users/dentists${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  static async getUserStats() {
    return this.request('/users/stats');
  }

  // Authentication API methods
  static async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  static async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthToken();
    }
  }

  static async getCurrentUser() {
    return this.request('/auth/me');
  }

  static async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: passwordData,
    });
  }

  // Convenience method for POST requests
  static async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // Convenience method for PUT requests
  static async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  // Convenience method for DELETE requests
  static async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Clinic Configuration API methods
  static async getClinicConfig() {
    return this.request('/clinic/config');
  }

  static async updateClinicConfig(configData) {
    return this.request('/clinic/config', {
      method: 'PUT',
      body: configData,
    });
  }
}

// Initialize auth token from localStorage
const storedToken = localStorage.getItem('authToken');
if (storedToken) {
  ApiService.setAuthToken(storedToken);
}

export default ApiService;