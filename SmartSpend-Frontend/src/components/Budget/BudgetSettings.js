import React, { useState, useEffect } from 'react';
import { Target, Edit2, Save, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { budgetAPI, expenseAPI } from '../../utils/api';
import { useCurrency } from '../../utils/currency';

const BudgetSettings = () => {
  const { format } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [spending, setSpending] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('200');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetsData, spendingData] = await Promise.all([
        budgetAPI.getBudgets(),
        expenseAPI.getSpendingByCategory()
      ]);
      
      // Sort alphabetically
      const sorted = [...budgetsData].sort((a, b) => 
        a.category.localeCompare(b.category)
      );
      
      setBudgets(sorted);
      setSpending(spendingData);
      setError('');
    } catch (err) {
      console.error('Error loading budget data:', err);
      setError('Failed to load budget data');
    }
  };

  const handleEdit = (category, amount) => {
    setEditing(category);
    setEditAmount(amount.toString());
  };

  const handleSave = async (category) => {
    const value = parseFloat(editAmount);
    if (isNaN(value) || value < 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await budgetAPI.setBudget({ category, amount: value });
      setEditing(null);
      setEditAmount('');
      loadData();
    } catch (err) {
      setError('Failed to save budget');
    }
  };

  const handleAddCategory = async () => {
    const cat = newCategory.trim();
    const amt = parseFloat(newAmount);

    if (!cat) {
      setError('Category name is required');
      return;
    }
    if (isNaN(amt) || amt < 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (budgets.some(b => b.category.toLowerCase() === cat.toLowerCase())) {
      setError('This category already exists');
      return;
    }

    try {
      await budgetAPI.setBudget({ category: cat, amount: amt });
      setNewCategory('');
      setNewAmount('200');
      setError('');
      loadData();
    } catch (err) {
      setError('Failed to create category');
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete budget category "${category}"?`)) return;

    try {
      await budgetAPI.deleteBudget(category);
      loadData();
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const getColor = (category) => {
    const colors = {
      food: '#3b82f6',
      transport: '#8b5cf6',
      entertainment: '#ec4899',
      shopping: '#f59e0b',
      medicine: '#ef4444',
      other: '#10b981',
    };
    return colors[category.toLowerCase()] || '#6b7280';
  };

  const budgetData = budgets.map(budget => {
    const spent = spending.find(s => s._id?.toLowerCase() === budget.category.toLowerCase())?.total || 0;
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    let status = 'normal';
    if (percentage > 100) status = 'over';
    else if (percentage > 85) status = 'warning';
    else if (remaining < 0) status = 'over';

    return {
      category: budget.category,
      budget: budget.amount,
      spent,
      remaining,
      percentage: percentage.toFixed(1),
      color: getColor(budget.category),
      status
    };
  });



  // Check for over-budget categories
  const overBudgetCategories = budgetData.filter(item => item.status === 'over');

  return (
    <div className="budget-settings">
      <div className="page-header">
        <h1><Target size={28} /> Budget Settings</h1>
      </div>

      {/* Alerts - only show when categories are over budget */}
      {(overBudgetCategories.length > 0 || error) && (
        <div className="overall-alert">
          <AlertTriangle size={20} color="red" />
          <div>
            {error && <p style={{ color: 'var(--danger-color)', fontWeight: '600' }}>{error}</p>}
            {overBudgetCategories.map(category => (
              <p key={category.category} style={{ color: 'var(--danger-color)' }}>
                {category.category} budget exceeded: {format(category.spent)} spent of {format(category.budget)} budget
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Add new category */}
      <div className="budget-settings" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Category
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Category name (e.g. Bills)"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="form-input"
            style={{ flex: '1', minWidth: '200px' }}
          />
          <input
            type="number"
            placeholder="Budget amount"
            value={newAmount}
            onChange={e => setNewAmount(e.target.value)}
            className="form-input"
            style={{ width: '9rem' }}
            min="0"
            step="10"
          />
          <button
            onClick={handleAddCategory}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.5rem' }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Budget cards grid */}
      <div className="budget-grid-cards">
        {budgetData.map(item => (
          <div
            key={item.category}
            className="budget-card-colorful"
            style={{ '--card-color': item.color }}
          >
            <div className="budget-card-header">
              <h3 className="budget-category-name">{item.category}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {editing === item.category ? (
                  <button
                    onClick={() => handleSave(item.category)}
                    className="btn-icon"
                    style={{ color: 'var(--success-color)' }}
                  >
                    <Save size={18} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(item.category, item.budget)}
                      className="btn-icon"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.category)}
                      className="btn-icon danger"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              {editing === item.category ? (
                <input
                  type="number"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  className="form-input"
                  style={{
                    width: '100%',
                    fontSize: '1.25rem',
                    fontWeight: '800'
                  }}
                  min="0"
                  step="10"
                />
              ) : (
                <div className="budget-amount-main">
                  {format(item.budget)}
                </div>
              )}
            </div>

            <div className="budget-card-details">
              <div style={{ width: '100%', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted)' }}>Spent:</span>
                  <span style={{ fontWeight: '500', color: 'var(--text)' }}>{format(item.spent)}</span>
                </div>
                
                <div style={{
                  width: '100%',
                  background: 'var(--border)',
                  borderRadius: '9999px',
                  height: '10px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      height: '10px',
                      borderRadius: '9999px',
                      transition: 'all 0.5s ease',
                      background: item.status === 'over' ? 'var(--danger-color)' :
                                 item.status === 'warning' ? 'var(--warning-color)' : 'var(--success-color)',
                      width: `${Math.min(item.percentage, 100)}%`
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--muted)' }}>Remaining:</span>
                  <span style={{
                    fontWeight: '500',
                    color: item.remaining < 0 ? 'var(--danger-color)' :
                           item.remaining < item.budget * 0.15 ? 'var(--warning-color)' : 'var(--success-color)'
                  }}>
                    {format(item.remaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetSettings;