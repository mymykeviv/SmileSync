const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
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
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
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
    const queryString = new URLSearchParams(params).toString();
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
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
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
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
}

export default ApiService;