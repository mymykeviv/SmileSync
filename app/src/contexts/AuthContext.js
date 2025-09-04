import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Set token in API service
          ApiService.setAuthToken(token);
          
          // Try to get current user to verify token is still valid
          try {
            const currentUser = await ApiService.getCurrentUser();
            if (currentUser.success) {
              setUser(currentUser.data);
              setIsAuthenticated(true);
              // Update stored user data
              localStorage.setItem('user', JSON.stringify(currentUser.data));
            } else {
              // Token is invalid, clear auth
              logout();
            }
          } catch (error) {
            // Token is invalid or expired, clear auth
            console.error('Token validation failed:', error);
            logout();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await ApiService.login(credentials);
      
      if (response.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set token in API service
        ApiService.setAuthToken(response.data.token);
        
        // Update state
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await ApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      setIsAuthenticated(false);
      ApiService.clearAuthToken();
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    const rolePermissions = {
      'admin': [
        'PATIENTS_VIEW', 'PATIENTS_CREATE', 'PATIENTS_EDIT', 'PATIENTS_DELETE',
        'APPOINTMENTS_VIEW', 'APPOINTMENTS_CREATE', 'APPOINTMENTS_EDIT', 'APPOINTMENTS_DELETE',
        'SERVICES_VIEW', 'SERVICES_CREATE', 'SERVICES_EDIT', 'SERVICES_DELETE',
        'PRODUCTS_VIEW', 'PRODUCTS_CREATE', 'PRODUCTS_EDIT', 'PRODUCTS_DELETE',
        'INVOICES_VIEW', 'INVOICES_CREATE', 'INVOICES_EDIT', 'INVOICES_DELETE',
        'PAYMENTS_VIEW', 'PAYMENTS_CREATE', 'PAYMENTS_EDIT', 'PAYMENTS_DELETE',
        'USERS_VIEW', 'USERS_CREATE', 'USERS_EDIT', 'USERS_DELETE', 'USERS_MANAGE',
        'REPORTS_VIEW', 'REPORTS_GENERATE',
        'ANALYTICS_VIEW', 'ANALYTICS_MANAGE',
        'SYSTEM_SETTINGS', 'CLINIC_CONFIG'
      ],
      'dentist': [
        'PATIENTS_VIEW', 'PATIENTS_CREATE', 'PATIENTS_EDIT', 'PATIENTS_DELETE',
        'APPOINTMENTS_VIEW', 'APPOINTMENTS_CREATE', 'APPOINTMENTS_EDIT', 'APPOINTMENTS_DELETE',
        'SERVICES_VIEW', 'SERVICES_CREATE', 'SERVICES_EDIT',
        'PRODUCTS_VIEW', 'PRODUCTS_CREATE', 'PRODUCTS_EDIT',
        'INVOICES_VIEW', 'INVOICES_CREATE', 'INVOICES_EDIT',
        'PAYMENTS_VIEW', 'PAYMENTS_CREATE',
        'REPORTS_VIEW', 'REPORTS_GENERATE',
        'ANALYTICS_VIEW'
      ],
      'assistant': [
        'PATIENTS_VIEW', 'PATIENTS_CREATE', 'PATIENTS_EDIT',
        'APPOINTMENTS_VIEW', 'APPOINTMENTS_CREATE', 'APPOINTMENTS_EDIT',
        'SERVICES_VIEW',
        'PRODUCTS_VIEW',
        'INVOICES_VIEW'
      ],
      'receptionist': [
        'PATIENTS_VIEW', 'PATIENTS_CREATE', 'PATIENTS_EDIT',
        'APPOINTMENTS_VIEW', 'APPOINTMENTS_CREATE', 'APPOINTMENTS_EDIT',
        'SERVICES_VIEW',
        'PRODUCTS_VIEW',
        'INVOICES_VIEW', 'INVOICES_CREATE', 'INVOICES_EDIT',
        'PAYMENTS_VIEW', 'PAYMENTS_CREATE',
        'ANALYTICS_VIEW'
      ],
      'staff': [
        'PATIENTS_VIEW',
        'APPOINTMENTS_VIEW',
        'SERVICES_VIEW',
        'PRODUCTS_VIEW'
      ]
    };
    
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!user) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    if (!user) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;