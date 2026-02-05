import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      const storedSalary = localStorage.getItem('salary_' + parsedUser._id);
      setUser({ ...parsedUser, salary: storedSalary ? parseFloat(storedSalary) : null });
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Remove user-specific salary
    if (user) {
      localStorage.removeItem('salary_' + user._id);
    }
  };

  // Set or update monthly salary per user
  const setSalary = (amount) => {
    if (user) {
      setUser(prev => ({ ...prev, salary: amount }));
      localStorage.setItem('salary_' + user._id, amount);
    }
  };

  // Update user data
  const updateUser = (updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUserData }));
  };

  const value = {
    user,
    setUser,
    updateUser,
    logout,
    setSalary,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthContext };