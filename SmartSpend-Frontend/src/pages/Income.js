import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { incomeAPI } from '../utils/api'; // We'll add this to api.js
import { expenseAPI } from '../utils/api'; // To fetch total expenses
import { useCurrency } from '../utils/currency';

const Income = () => {
  const { format } = useCurrency();
  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'salary',
    description: ''
  });

  const incomeTypes = ['salary', 'freelance', 'investment', 'gift', 'other'];

  // Load incomes and total expenses on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [incomeRes, expenseRes] = await Promise.all([
        incomeAPI.getAll(),
        expenseAPI.getAll() // To calculate total expenses
      ]);

      setIncomes(incomeRes);
      const incomeTotal = incomeRes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
      setTotalIncome(incomeTotal);

      const expensesTotal = expenseRes.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      setTotalExpenses(expensesTotal);
      setRemainingBalance(incomeTotal - expensesTotal);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const incomeData = {
        source: formData.source,
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: formData.type,
        description: formData.description || ''
      };

      let updatedIncomes;
      if (editingIncome) {
        const updated = await incomeAPI.update(editingIncome._id, incomeData);
        updatedIncomes = incomes.map(inc => inc._id === editingIncome._id ? updated : inc);
      } else {
        const newIncome = await incomeAPI.create(incomeData);
        updatedIncomes = [newIncome, ...incomes];
      }

      setIncomes(updatedIncomes);
      const newTotalIncome = updatedIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
      setTotalIncome(newTotalIncome);
      setRemainingBalance(newTotalIncome - totalExpenses);

      // Reset form
      setShowForm(false);
      setEditingIncome(null);
      setFormData({
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'salary',
        description: ''
      });
    } catch (err) {
      setError('Failed to save income. Please try again.');
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      source: income.source,
      amount: income.amount.toString(),
      date: income.date.split('T')[0],
      type: income.type,
      description: income.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income?')) return;

    try {
      await incomeAPI.delete(id);
      const updatedIncomes = incomes.filter(inc => inc._id !== id);
      setIncomes(updatedIncomes);
      const newTotalIncome = updatedIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
      setTotalIncome(newTotalIncome);
      setRemainingBalance(newTotalIncome - totalExpenses);
    } catch (err) {
      setError('Failed to delete income.');
    }
  };

  if (loading) {
    return <div className="loading">Loading income data...</div>;
  }

  return (
    <div className="income-page">
      <div className="page-header">
        <h1>Income Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          <Plus size={20} />
          Add Income
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Income Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{format(totalIncome)}</div>
          <div className="stat-label">Total Income</div>
          <DollarSign size={20} color="var(--primary-color)" style={{ marginTop: '0.5rem' }} />
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{format(totalExpenses)}</div>
          <div className="stat-label">Total Expenses</div>
          <TrendingDown size={20} color="var(--danger-color)" style={{ marginTop: '0.5rem' }} />
        </div>
        
        <div className="stat-card">
          <div 
            className="stat-value"
            style={{ color: remainingBalance >= 0 ? 'var(--primary-color)' : 'var(--danger-color)' }}
          >
            {format(Math.abs(remainingBalance))}
          </div>
          <div className="stat-label">Remaining Balance</div>
          {remainingBalance >= 0 ? (
            <TrendingUp size={20} color="var(--primary-color)" style={{ marginTop: '0.5rem' }} />
          ) : (
            <TrendingDown size={20} color="var(--danger-color)" style={{ marginTop: '0.5rem' }} />
          )}
        </div>
      </div>

      {/* Income Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingIncome ? 'Edit Income' : 'Add New Income'}</h2>
              <button 
                className="btn-icon" 
                onClick={() => {
                  setShowForm(false);
                  setEditingIncome(null);
                  setFormData({
                    source: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    type: 'salary',
                    description: ''
                  });
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="expense-form">
              <div className="form-group">
                <label htmlFor="source">Income Source</label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Company Salary, Freelance Work"
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Income Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  {incomeTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date Received</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Additional notes about this income"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingIncome(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingIncome ? 'Update' : 'Add'} Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income List */}
      <div className="expenses-list">
        {incomes.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} color="var(--light-text)" />
            <h3>No Income Records</h3>
            <p>Add your first income source to get started!</p>
          </div>
        ) : (
          incomes.map(income => (
            <div key={income._id} className="expense-card">
              <div className="expense-info">
                <div className="expense-main">
                  <h3>{income.source}</h3>
                  <span className="expense-category">
                    {income.type.charAt(0).toUpperCase() + income.type.slice(1)}
                  </span>
                </div>
                <div className="expense-details">
                  <span className="expense-amount" style={{ color: 'var(--primary-color)' }}>
                    +{format(income.amount)}
                  </span>
                  <span className="expense-date">
                    {new Date(income.date).toLocaleDateString()}
                  </span>
                </div>
                {income.description && (
                  <p style={{ 
                    marginTop: '0.5rem', 
                    color: 'var(--light-text)', 
                    fontSize: '0.9rem' 
                  }}>
                    {income.description}
                  </p>
                )}
              </div>
              <div className="expense-actions">
                <button 
                  className="btn-icon"
                  onClick={() => handleEdit(income)}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn-icon danger"
                  onClick={() => handleDelete(income._id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Income;