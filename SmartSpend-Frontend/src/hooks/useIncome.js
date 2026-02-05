import { useState, useEffect } from 'react';
import { incomeAPI } from '../utils/api';

export const useIncome = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadIncomes = async () => {
    try {
      setLoading(true);
      const data = await incomeAPI.getAll();
      setIncomes(data);
    } catch (err) {
      setError('Failed to load incomes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  const addIncome = async (incomeData) => {
    const newIncome = await incomeAPI.create(incomeData);
    setIncomes([newIncome, ...incomes]);
  };

  const updateIncome = async (id, incomeData) => {
    const updated = await incomeAPI.update(id, incomeData);
    setIncomes(incomes.map(inc => inc._id === id ? updated : inc));
  };

  const deleteIncome = async (id) => {
    await incomeAPI.delete(id);
    setIncomes(incomes.filter(inc => inc._id !== id));
  };

  return {
    incomes,
    loading,
    error,
    addIncome,
    updateIncome,
    deleteIncome,
    refetch: loadIncomes,
  };
};