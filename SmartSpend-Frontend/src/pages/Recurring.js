import React, { useState, useEffect } from 'react';
import { Repeat, Plus, Edit2, Trash2, Calendar, DollarSign } from 'lucide-react';
import { recurringAPI } from '../utils/api';

const Recurring = () => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const categories = [
    'food', 'transport', 'entertainment', 'shopping',
    'medicine', 'other', 'salary', 'freelance', 'investment', 'other-income'
  ];

  useEffect(() => {
    loadRecurringTransactions();
  }, []);

  const loadRecurringTransactions = async () => {
    try {
      setError('');
      const data = await recurringAPI.getAll();
      setRecurringTransactions(data);
    } catch (error) {
      console.error('Failed to load recurring transactions:', error);
      setError('Failed to load recurring transactions. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTransaction) {
        await recurringAPI.update(editingTransaction._id, formData);
      } else {
        await recurringAPI.create(formData);
      }

      await loadRecurringTransactions();
      resetForm();
    } catch (error) {
      console.error('Failed to save recurring transaction:', error);
      setError('Failed to save recurring transaction. Please try again.');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      frequency: transaction.frequency,
      startDate: transaction.startDate.split('T')[0],
      endDate: transaction.endDate ? transaction.endDate.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        await recurringAPI.delete(id);
        await loadRecurringTransactions();
      } catch (error) {
        console.error('Failed to delete recurring transaction:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    setEditingTransaction(null);
    setShowForm(false);
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    };
    return labels[frequency] || frequency;
  };

  const getNextDueDate = (transaction) => {
    const nextDue = new Date(transaction.nextDueDate);
    return nextDue.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading recurring transactions...</div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={loadRecurringTransactions}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Repeat size={28} /> Recurring Transactions</h1>
      </div>

      <div className="recurring-content">
        <div className="section-header">
          <button
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} />
            Add Recurring Transaction
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingTransaction ? 'Edit' : 'Add'} Recurring Transaction</h2>
                <button className="btn-icon" onClick={resetForm}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="recurring-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">Type</label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      required
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="amount">Amount ($)</label>
                    <input
                      type="number"
                      id="amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="frequency">Frequency</label>
                    <select
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      required
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate">End Date (Optional)</label>
                    <input
                      type="date"
                      id="endDate"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingTransaction ? 'Update' : 'Create'} Transaction
                  </button>
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="recurring-list">
          {recurringTransactions.length === 0 ? (
            <div className="empty-state">
              <Repeat size={48} />
              <h3>No recurring transactions yet</h3>
              <p>Set up automatic expenses or income to save time</p>
            </div>
          ) : (
            recurringTransactions.map(transaction => (
              <div key={transaction._id} className="recurring-item">
                <div className="recurring-info">
                  <div className="recurring-main">
                    <h3>{transaction.description}</h3>
                    <div className="recurring-details">
                      <span className={`transaction-type ${transaction.type}`}>
                        {transaction.type}
                      </span>
                      <span className="category">{transaction.category}</span>
                      <span className="frequency">
                        <Calendar size={14} />
                        {getFrequencyLabel(transaction.frequency)}
                      </span>
                    </div>
                  </div>
                  <div className="recurring-amount">
                    <DollarSign size={16} />
                    {transaction.amount.toFixed(2)}
                  </div>
                </div>
                <div className="recurring-next">
                  <small>Next: {getNextDueDate(transaction)}</small>
                </div>
                <div className="recurring-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(transaction)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDelete(transaction._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Recurring;