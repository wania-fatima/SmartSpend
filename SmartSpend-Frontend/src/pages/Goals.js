import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, DollarSign, Calendar, TrendingUp, CheckCircle, X } from 'lucide-react';
import { goalsAPI } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { useCurrency, useDateFormat } from '../utils/currency';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'general'
  });

  const { addNotification } = useNotifications();
  const { format: formatCurrency } = useCurrency();
  const { formatDate } = useDateFormat();

  const categories = [
    'general', 'emergency', 'vacation', 'car', 'house',
    'education', 'retirement', 'investment', 'debt', 'other'
  ];

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setError('');
      const data = await goalsAPI.getAll();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
      setError('Failed to load goals. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount)
      };

      if (editingGoal) {
        await goalsAPI.update(editingGoal._id, goalData);
      } else {
        await goalsAPI.create(goalData);
      }

      await loadGoals();
      resetForm();
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate.split('T')[0],
      category: goal.category
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalsAPI.delete(id);
        await loadGoals();
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  const handleAddToGoal = (goalId) => {
    const goal = goals.find(g => g._id === goalId);
    setSelectedGoal(goal);
    setAddAmount('');
    setShowAddMoneyModal(true);
  };

  const handleAddMoneySubmit = async (e) => {
    e.preventDefault();
    if (!addAmount || isNaN(parseFloat(addAmount)) || parseFloat(addAmount) <= 0) {
      return;
    }

    try {
      await goalsAPI.addToGoal(selectedGoal._id, parseFloat(addAmount));
      await loadGoals();
      
      // Show success notification
      addNotification(
        `Successfully added ${formatCurrency(parseFloat(addAmount))} to "${selectedGoal.name}"!`,
        'success'
      );
      
      setShowAddMoneyModal(false);
      setSelectedGoal(null);
      setAddAmount('');
    } catch (error) {
      console.error('Failed to add to goal:', error);
      setError('Failed to add money to goal. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      targetDate: '',
      category: 'general'
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div className="loading">Loading goals...</div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1><Target size={28} /> Financial Goals</h1>
          <p>Set and track your savings goals</p>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={loadGoals}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Target size={28} /> Financial Goals</h1>
      </div>

      <div className="goals-content">
        <div className="section-header">
          <button
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} />
            Add New Goal
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingGoal ? 'Edit' : 'Add'} Goal</h2>
                <button className="btn-icon" onClick={resetForm}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="goal-form">
                <div className="form-group">
                  <label htmlFor="name">Goal Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Emergency Fund, Vacation, New Car"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="targetAmount">Target Amount</label>
                    <div className="amount-input-container">
                      <span className="currency-symbol">$</span>
                      <input
                        type="number"
                        id="targetAmount"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                        className="amount-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="targetDate">Target Date</label>
                  <input
                    type="date"
                    id="targetDate"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingGoal ? 'Update' : 'Create'} Goal
                  </button>
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Money Modal */}
        {showAddMoneyModal && selectedGoal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Add Money to Goal</h2>
                <button 
                  className="btn-icon" 
                  onClick={() => {
                    setShowAddMoneyModal(false);
                    setSelectedGoal(null);
                    setAddAmount('');
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="goal-summary">
                <h3>{selectedGoal.name}</h3>
                <div className="goal-progress-summary">
                  <div className="progress-info">
                    <span className="current-amount">
                      {formatCurrency(selectedGoal.currentAmount)}
                    </span>
                    <span className="target-amount">
                      of {formatCurrency(selectedGoal.targetAmount)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage(selectedGoal.currentAmount, selectedGoal.targetAmount)}%` }}
                    ></div>
                  </div>
                  <div className="progress-percentage">
                    {getProgressPercentage(selectedGoal.currentAmount, selectedGoal.targetAmount).toFixed(1)}% complete
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddMoneySubmit} className="add-money-form">
                <div className="form-group">
                  <label htmlFor="addAmount">Amount to Add</label>
                  <div className="amount-input-container">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      id="addAmount"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      required
                      className="amount-input"
                      autoFocus
                    />
                  </div>
                  {addAmount && (
                    <small className="amount-preview">
                      New total: {formatCurrency(selectedGoal.currentAmount + parseFloat(addAmount || 0))}
                    </small>
                  )}
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => {
                      setShowAddMoneyModal(false);
                      setSelectedGoal(null);
                      setAddAmount('');
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={!addAmount || isNaN(parseFloat(addAmount)) || parseFloat(addAmount) <= 0}
                  >
                    <TrendingUp size={16} />
                    Add Money
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="goals-grid">
          {goals.length === 0 ? (
            <div className="empty-state">
              <Target size={48} />
              <h3>No goals set yet</h3>
              <p>Create your first financial goal to start saving</p>
            </div>
          ) : (
            goals.map(goal => {
              const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const isOverdue = daysRemaining < 0;

              return (
                <div key={goal._id} className={`goal-card ${goal.completed ? 'completed' : ''}`}>
                  <div className="goal-header">
                    <h3>{goal.name}</h3>
                    {goal.completed && <CheckCircle size={20} color="#4CAF50" />}
                  </div>

                  <div className="goal-category">
                    <span className="category-badge">{goal.category}</span>
                  </div>

                  <div className="goal-progress">
                    <div className="progress-info">
                      <span className="current-amount">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="target-amount">
                        of {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-percentage">
                      {progress.toFixed(1)}% complete
                    </div>
                  </div>

                  <div className="goal-details">
                    <div className="goal-detail">
                      <Calendar size={14} />
                      <span className={isOverdue ? 'overdue' : ''}>
                        {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                      </span>
                    </div>
                    <div className="goal-detail">
                      <DollarSign size={14} />
                      <span>
                        {formatCurrency(goal.targetAmount - goal.currentAmount)} remaining
                      </span>
                    </div>
                  </div>

                  <div className="goal-actions">
                    <button
                      className="btn-secondary btn-small"
                      onClick={() => handleAddToGoal(goal._id)}
                      disabled={goal.completed}
                    >
                      <TrendingUp size={14} />
                      Add Money
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(goal)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDelete(goal._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;