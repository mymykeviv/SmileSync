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
              setUser(currentUser.user);
              setIsAuthenticated(true);
              // Update stored user data
              localStorage.setItem('user', JSON.stringify(currentUser.user));
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
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Set token in API service
        ApiService.setAuthToken(response.token);
        
        // Update state
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true, user: response.user };
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
    
    // Define role-based permissions
    const rolePermissions = {
      dentist: [
        'view_patients',
        'create_patients',
        'edit_patients',
        'view_appointments',
        'create_appointments',
        'edit_appointments',
        'view_services',
        'view_products',
        'view_invoices',
        'create_invoices',
        'edit_invoices'
      ],
      assistant: [
        'view_patients',
        'create_patients',
        'edit_patients',
        'view_appointments',
        'create_appointments',
        'edit_appointments',
        'view_services',
        'view_products'
      ],
      receptionist: [
        'view_patients',
        'create_patients',
        'edit_patients',
        'view_appointments',
        'create_appointments',
        'edit_appointments',
        'view_services',
        'view_products',
        'view_invoices'
      ]
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;