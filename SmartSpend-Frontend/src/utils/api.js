import axios from 'axios';

// Base URL for backend API - make sure this matches your backend port
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please check your connection');
    }
    
    if (!error.response) {
      throw new Error('Network error - please check if the backend server is running');
    }
    
    // Let the component handle the error
    throw error;
  }
);

// Authentication API functions
export const authAPI = {
  login: async (email, password) => {
    try {
      console.log('Making login request to:', API_BASE_URL + '/auth/login');
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      return response.data; // { token, user }
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },
  
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify-token');
      return response.data;
    } catch (error) {
      console.error('Verify token API error:', error);
      throw error;
    }
  },
};

// Expenses API functions
export const expenseAPI = {
  getAll: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },
  
  getRecentExpenses: async () => {
    const response = await api.get('/expenses/recent');
    return response.data;
  },
  
  create: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },
  
  update: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
  
  getDashboardStats: async () => {
    const response = await api.get('/expenses/dashboard');
    return response.data;
  },
  
  getAnalytics: async (timeRange = '6months') => {
    const response = await api.get(`/expenses/analytics?timeRange=${timeRange}`);
    return response.data;
  },
  
  getSpendingByCategory: async () => {
    const response = await api.get('/expenses/spending');
    return response.data;
  },
};

// Income API functions
export const incomeAPI = {
  getAll: async () => {
    const response = await api.get('/income');
    return response.data;
  },
  
  create: async (incomeData) => {
    const response = await api.post('/income', incomeData);
    return response.data;
  },
  
  update: async (id, incomeData) => {
    const response = await api.put(`/income/${id}`, incomeData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/income/${id}`);
    return response.data;
  },
  
  getTotal: async () => {
    const response = await api.get('/income/total');
    return response.data;
  },
};

// Budget API functions
export const budgetAPI = {
  getBudgets: async () => {
    const response = await api.get('/budgets');
    return response.data;
  },

  setBudget: async (budgetData) => {
    const response = await api.post('/budgets', budgetData);
    return response.data;
  },

  deleteBudget: async (category) => {
    const response = await api.delete(`/budgets/${category}`);
    return response.data;
  },

  getBudgetAlerts: async () => {
    const response = await api.get('/budgets/alerts');
    return response.data;
  },
};

// Auth API functions (extended)
export const extendedAuthAPI = {
  ...authAPI,

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

// Recurring Transactions API
export const recurringAPI = {
  getAll: async () => {
    const response = await api.get('/recurring');
    return response.data;
  },

  create: async (recurringData) => {
    const response = await api.post('/recurring', recurringData);
    return response.data;
  },

  update: async (id, recurringData) => {
    const response = await api.put(`/recurring/${id}`, recurringData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/recurring/${id}`);
    return response.data;
  },
};

// Goals API
export const goalsAPI = {
  getAll: async () => {
    const response = await api.get('/goals');
    return response.data;
  },

  create: async (goalData) => {
    const response = await api.post('/goals', goalData);
    return response.data;
  },

  update: async (id, goalData) => {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },

  addToGoal: async (id, amount) => {
    const response = await api.post(`/goals/${id}/add`, { amount });
    return response.data;
  },
};

// Export API
export const exportAPI = {
  exportExpenses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/export/expenses?${queryString}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  exportIncome: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/export/income?${queryString}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  exportBudgets: async () => {
    const response = await api.get('/export/budgets', {
      responseType: 'blob'
    });
    return response.data;
  },

  exportFinancialReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/export/report?${queryString}`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Default export
export default api;