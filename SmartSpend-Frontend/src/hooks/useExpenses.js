import { useState, useEffect } from 'react';
import { expenseAPI } from '../utils/api';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all expenses from backend
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseAPI.getAll(); // backend call
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError('Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get recent expenses from backend
  const loadRecentExpenses = async () => {
    try {
      setLoading(true);
      const recent = await expenseAPI.getRecentExpenses(); // backend call
      setExpenses(recent);
      setError(null);
    } catch (err) {
      setError('Failed to load recent expenses');
      console.error('Error loading recent expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new expense
  const addExpense = async (expenseData) => {
    try {
      const newExpense = await expenseAPI.create(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } catch (err) {
      setError('Failed to add expense');
      console.error(err);
      throw err;
    }
  };

  // Update an existing expense
  const updateExpense = async (id, expenseData) => {
    try {
      const updatedExpense = await expenseAPI.update(id, expenseData);
      setExpenses(prev => prev.map(exp => exp._id === id ? updatedExpense : exp));
      return updatedExpense;
    } catch (err) {
      setError('Failed to update expense');
      console.error(err);
      throw err;
    }
  };

  // Delete an expense
  const deleteExpense = async (id) => {
    try {
      await expenseAPI.delete(id);
      setExpenses(prev => prev.filter(exp => exp._id !== id));
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
      throw err;
    }
  };

  // Refetch expenses automatically on first load
  useEffect(() => {
    loadExpenses(); // load all expenses on component mount
  }, []);

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    loadExpenses,
    loadRecentExpenses
  };
};
