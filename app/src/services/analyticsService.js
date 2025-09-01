import ApiService from './api';

class AnalyticsService {
  async getDashboardOverview(startDate, endDate) {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/analytics/dashboard${queryString ? `?${queryString}` : ''}`;
      return await ApiService.request(endpoint);
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  async getAppointmentAnalytics(startDate, endDate) {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/analytics/appointments${queryString ? `?${queryString}` : ''}`;
      return await ApiService.request(endpoint);
    } catch (error) {
      console.error('Error fetching appointment analytics:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(startDate, endDate) {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/analytics/revenue${queryString ? `?${queryString}` : ''}`;
      return await ApiService.request(endpoint);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }

  async getPatientAnalytics(startDate, endDate) {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/analytics/patients${queryString ? `?${queryString}` : ''}`;
      return await ApiService.request(endpoint);
    } catch (error) {
      console.error('Error fetching patient analytics:', error);
      throw error;
    }
  }

  async getBillingAnalytics(startDate, endDate) {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/analytics/billing${queryString ? `?${queryString}` : ''}`;
      return await ApiService.request(endpoint);
    } catch (error) {
      console.error('Error fetching billing analytics:', error);
      throw error;
    }
  }

  async getPaymentAnalytics(startDate, endDate) {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/analytics/payments${queryString ? `?${queryString}` : ''}`;
      return await ApiService.request(endpoint);
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      throw error;
    }
  }

  async exportData(type, startDate, endDate) {
    try {
      const params = { type };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/analytics/export${queryString ? `?${queryString}` : ''}`;
      
      // For file downloads, we need to use fetch directly with the auth token
      const token = ApiService.getAuthToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the filename from the response headers or create a default one
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Helper method to format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  // Helper method to format percentage
  formatPercentage(value) {
    return `${parseFloat(value).toFixed(1)}%`;
  }

  // Helper method to format date
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Helper method to calculate date ranges
  getDateRange(period) {
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30); // Default to 30 days
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;